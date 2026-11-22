'use strict';

/**
 * Key-independent original-rune passthrough scanner for unsolved LP2.
 *
 * A plaintext rune passed through a later cryptographic layer should
 * preserve word-position fingerprints from ordinary GP-English, even if
 * every other ciphertext rune is uniformly randomized. Enumerate all
 * 29 * 29 cipher/plain rune associations, correct their maximum
 * against whole-word order shuffles preserving exact word multisets,
 * lengths and each word's adjacent doublet count.
 *
 * Reference training uses Shakespeare's first 240k characters; a genuine
 * 60k heldout GP-English sample supplies planted passthrough positives.
 * All results are conditional on literal GP-English word boundaries.
 *
 * @module rune_passthrough_word_position
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {parseLP2, encode, random32} = require('./orbit_phase_vote_recovery.cjs');

const ROOT = path.resolve(__dirname, '..');
const TEXT = fs.readFileSync(path.join(ROOT,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const SOURCE = fs.readFileSync(path.join(ROOT,
  'resources/lp2-transcription.txt'), 'utf8');
const META = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const MAX_LENGTH = 10;
const N = 29;
const REPLICATES = 500;
const SEED = 0x270a8219;

/** @param {string} text */
function tokens(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode).filter(x => x !== null && x.length > 0);
}

/**
 * GP rune word-length-conditional positional log probabilities.
 * Shape [length][word_position * 29 + plain_rune].
 * @param {number[][]} train
 */
function model(train) {
  const count = new Float64Array(MAX_LENGTH + 1);
  const weights = Array.from({length: MAX_LENGTH + 1}, (_, L) =>
    new Float64Array(L * N).fill(0.5));
  for (const w of train) {
    if (w.length > MAX_LENGTH) continue;
    count[w.length]++;
    const row = weights[w.length];
    for (let i = 0; i < w.length; i++) row[i * N + w[i]]++;
  }
  for (let L = 1; L <= MAX_LENGTH; L++) {
    const row = weights[L];
    for (let i = 0; i < row.length; i++) {
      const rate = row[i] / (count[L] + 1);
      row[i] = Math.log(rate / (1 - rate));
    }
  }
  return weights;
}

/** @param {number[]} word */
function doublets(word) {
  let k = 0;
  for (let i = 1; i < word.length; i++) k += +(word[i] === word[i-1]);
  return k;
}

/**
 * Predeclare a fixed standardization from unrestricted permutations,
 * then calibrate the actual maximum using *more constrained* shuffles.
 * @param {number[][]} words
 * @param {Float64Array[]} weights
 */
function standardize(words, weights) {
  const mean = new Float64Array(N * N);
  const variance = new Float64Array(N * N);
  const eligible = words.filter(w => w.length <= MAX_LENGTH);
  for (const word of eligible) {
    const L = word.length;
    const n = new Uint16Array(N);
    for (const x of word) n[x]++;
    for (let p = 0; p < N; p++) {
      let avg = 0, square = 0;
      for (let i = 0; i < L; i++) {
        const x = weights[L][i * N + p];
        avg += x;
        square += x*x;
      }
      avg /= L;
      const varianceWithin = square / L - avg*avg;
      for (let c = 0; c < N; c++) {
        if (!n[c]) continue;
        const k = c*N+p;
        mean[k] += n[c]*avg;
        if (L > 1) {
          variance[k] += n[c]*(L-n[c])/(L-1)*varianceWithin;
        }
      }
    }
  }
  return {mean, variance, eligible, totalRunes:
    eligible.reduce((n,w) => n+w.length, 0)};
}

/**
 * @param {number[][]} words
 * @param {Float64Array[]} weights
 * @param {ReturnType<typeof standardize>} fit
 */
function scan(words, weights, fit) {
  const score = new Float64Array(N*N);
  for (const word of words) {
    const L = word.length;
    if (L > MAX_LENGTH) continue;
    for (let i = 0; i < L; i++) {
      const base = word[i] * N;
      const row = weights[L];
      for (let p = 0; p < N; p++) score[base+p] += row[i*N+p];
    }
  }
  let best = -Infinity, winning = -1;
  const z = new Float64Array(N*N);
  for (let k=0;k<N*N;k++) {
    z[k] = fit.variance[k] > 0 ?
      (score[k]-fit.mean[k])/Math.sqrt(fit.variance[k]) : -Infinity;
    if (z[k] > best) {best = z[k];winning = k;}
  }
  const ordered = Array.from(z.keys()).sort((a,b)=>z[b]-z[a]);
  return {maxZ:best, winner: winning, z,
    leaders:ordered.slice(0,10).map(k=>({cipherRune: k/N|0,
      potentialPlainRune:k%N, GP: META.translit[k%N], z:z[k]}))};
}

/**
 * Per-word shuffles retaining each EXACT adjacent-equal count,
 * as well as each word's exact symbol multiset and length.
 * @param {number[][]} words
 * @param {() => number} draw
 */
function shuffle(words, draw) {
  return words.map(word => {
    if (word.length < 3) return word;
    const d = doublets(word);
    let out;
    do {
      out = word.slice();
      for (let i=out.length-1;i>0;i--) {
        const j=draw()%(i+1);
        [out[i],out[j]]=[out[j],out[i]];
      }
    } while(doublets(out)!==d);
    return out;
  });
}

/**
 * Calibrate the maximum over all 841 ordered rune pairs.
 * The anchored same-rune F -> F value is reported separately.
 * @param {number[][]} words
 * @param {Float64Array[]} weights
 * @param {number} seed
 * @param {number} replicates
 */
function test(words, weights, seed, replicates) {
  const fit = standardize(words, weights);
  const observed = scan(fit.eligible, weights, fit);
  const draw = random32(seed);
  let maxNull=-Infinity, exceed=0, anchorExceed=0;
  const maxima = [];
  for (let i=0;i<replicates;i++) {
    const sample = scan(shuffle(fit.eligible,draw),weights,fit);
    maxima.push(sample.maxZ);
    maxNull=Math.max(maxNull,sample.maxZ);
    exceed += +(sample.maxZ>=observed.maxZ);
    anchorExceed += +(sample.z[0]>=observed.z[0]);
  }
  maxima.sort((a,b)=>a-b);
  return {
    eligibleWords:fit.eligible.length, runes:fit.totalRunes,
    strongestCandidates:observed.leaders,
    anchoredFtoFz: observed.z[0],
    observedMaxZ:observed.maxZ,
    null: {
      conditioning:'exact multiset, word length, per-word adjacent-doublet count',
      seed:'0x'+(seed>>>0).toString(16),
      replicates, maximum:maxNull,
      percentile95:maxima[Math.floor(.95*replicates)],
      exceedances:exceed,
      familywiseUpperP:(exceed+1)/(replicates+1),
      fixedFExceedances:anchorExceed,
      anchoredFtoFUpperP:(anchorExceed+1)/(replicates+1)
    }
  };
}

/**
 * Encrypt heldout English words with the LP2 rune-word length sequence.
 * Each plaintext F survives literally with 60% probability; the other
 * non-F ciphertext has 2.35% F output probability, otherwise the other
 * 28 ciphertext runes are uniform. A 0.81 local doublet-repair step
 * then rewrites repeated adjacent ciphertext runes to a different rune.
 * This keeps the F marginal near observed LP2 while introducing an
 * authentic, testable passthrough mechanism.
 *
 * @param {number[][]} layout
 * @param {number[][]} heldout
 * @param {number[][]} training
 * @param {() => number} draw
 */
function plant(layout, heldout, training, draw) {
  const pools = new Map();
  for (const w of heldout) {
    if (!pools.has(w.length)) pools.set(w.length,[]);
    pools.get(w.length).push(w);
  }
  const fallback = new Map();
  for (const w of training) {
    if (!fallback.has(w.length)) fallback.set(w.length,[]);
    fallback.get(w.length).push(w);
  }
  let last=-1, edits=0, fallbacks=0, Fs=0, keptF=0;
  const output=layout.map(reference=>{
    const candidates=pools.get(reference.length) || fallback.get(reference.length);
    assert.ok(candidates && candidates.length);
    if (!pools.has(reference.length)) fallbacks++;
    const plain=candidates[draw()%candidates.length];
    return plain.map(p=>{
      if(p===0) Fs++;
      const keep = p===0 && draw()%10000<6000;
      let c;
      if (keep) {c=0;keptF++;}
      else if(p!==0 && draw()%10000<235) c=0;
      else c=1+draw()%28;
      if(c===last && draw()%10000<8100){
        const alt=draw()%28;
        c=alt>=last?alt+1:alt;
        edits++;
      }
      last=c;
      return c;
    });
  });
  return {words:output, edits, fallbacks, sourceFs:Fs,
    plantedPreservedFs:keptF,
    ciphertextFs:output.flat().filter(x=>x===0).length};
}

function run(replicates=REPLICATES) {
  const real=parseLP2(SOURCE);
  const train=tokens(TEXT.slice(0,240000));
  const heldout=tokens(TEXT.slice(240000));
  const weights=model(train);
  const synthetic=plant(real,heldout,train,random32(0xa11ce279));
  const positive=test(synthetic.words,weights,SEED^0x4c10,replicates);
  const actual=test(real,weights,SEED,replicates);
  // Verify 60% fixed-F channel is detectable after realistic corrections.
  assert.ok(positive.anchoredFtoFz>4,
    'Detector lacked power on known surviving-F mechanism');
  assert.ok(positive.null.anchoredFtoFUpperP<0.02,
    'Known-F planted channel did not exceed fixed-F threshold');
  return {
    sourceSha256:createHash('sha256').update(SOURCE).digest('hex'),
    hypothesis:'direct source-to-cipher rune passthrough at preserved word slots',
    candidates:'29 ciphertext runes x29 plaintext GP runes, all evaluated',
    reference:'Shakespeare GP first240k training, last60k heldout plant',
    sourceLength: real.reduce((n,w)=>n+w.length,0),
    genuine: actual,
    syntheticKnownF: {parameters: {
      sourceRune:'F',survivalProbability:0.6,
      nonFToCipherF:0.0235,adjacentDoubletOverwriteProbability:0.81
    }, sourceFs:synthetic.sourceFs,
      plantedPreservedFs:synthetic.plantedPreservedFs,
      ciphertextFs:synthetic.ciphertextFs,
      overwrittenAdjacentDoublets:synthetic.edits,
      rareLengthTrainingFallbackWords:synthetic.fallbacks,
      test:positive},
    interpretation:'A literal GP F passthrough like known LP1 mechanisms is independently testable under word-boundary fidelity; no plaintext is claimed.'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={tokens,model,doublets,standardize,scan,shuffle,test,plant,run};
