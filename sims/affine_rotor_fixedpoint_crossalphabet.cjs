'use strict';

/**
 * Fixed-point correspondence sieve for the complete affine-rotor family
 * under an arbitrary, unknown global output alphabet permutation.
 *
 * Every non-translation affine transformation T(x)=a*x+b (mod29), a!=1,
 * has exactly one fixed GP symbol p=b/(1-a). Every power T^k fixes p.
 * A subsequent unknown global permutation sigma preserves its positions:
 * ciphertext[i]===sigma[p] exactly when plaintext[i]===p.
 *
 * For ALL 29*29 potential p->sigma[p] correspondences, estimate the
 * English GP source symbol's location within a same-length word and
 * check original ciphertext. Nulls shuffle positions within each
 * authentic ciphertext word, conditioning on exact word symbol counts.
 * An optional stricter null also conditions on exact adjacent doublets.
 *
 * This is a necessary condition for the stated model; it cannot
 * independently identify a key or recover plaintext.
 *
 * @module affine_rotor_fixedpoint_crossalphabet
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const rotor = require('./orbit_phase_vote_recovery.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const CORPUS = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const RAW = read('resources/lp2-transcription.txt');
const ENGLISH = read('resources/control/shakespeare_first300k.txt');
const WORDS = rotor.parseLP2(RAW);
const A = 29;
const MAXLEN = 10;
const REP = Number(process.env.FIXPOINT_REPLICATES || 1200);
const KEY = [0, 7, 11, 16, 23, 5];
const mod = x => (x % A + A) % A;
assert.equal(WORDS.length, 2896);
assert.equal(WORDS.flat().length, 12956);
assert.ok(Number.isInteger(REP) && REP >= 100 && REP <= 20000);

/** @param {string} text Latin-letter reference corpus */
function encodeTokens(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(rotor.encode).filter(x => x && x.length > 0);
}

/** @param {number[][]} train GP English rune words. */
function buildModel(train) {
  const n = Array(MAXLEN + 1).fill(0);
  const f = Array.from({length:A}, () =>
    Array.from({length:MAXLEN + 1}, (_, L) => new Int32Array(L)));
  for (const word of train) {
    if (word.length > MAXLEN) continue;
    n[word.length]++;
    word.forEach((x, i) => { f[x][word.length][i]++; });
  }
  const weights = f.map(symbol => symbol.map((row, L) =>
    Array.from(row, count => {
      const p = (count + 0.5) / (n[L] + 1);
      return Math.log(p / (1 - p));
    })));
  const means = weights.map(symbol => symbol.map(row =>
    row.length ? row.reduce((x, y) => x + y, 0) / row.length : 0));
  const vpop = weights.map((symbol, p) => symbol.map((row, L) =>
    row.length ? row.reduce((s, x) =>
      s + (x - means[p][L]) ** 2, 0) / row.length : 0));
  return {weights, means, vpop, counts:n};
}

/** @param {number[][]} words */
function histogram(words) {
  const hist = Array.from({length:MAXLEN + 1},
    (_, L) => new Int32Array(L * A));
  for (const word of words) {
    const L = word.length;
    if (L <= MAXLEN) word.forEach((x, i) => { hist[L][i * A + x]++; });
  }
  return hist;
}

/**
 * Analytic exact conditional null mean and variance for each p,c.
 * Within a length-L word with k occurrences of ciphertext symbol c,
 * Var(sum selected weights) = k*(L-k)/(L-1) * populationVariance.
 * @param {number[][]} words
 * @param {ReturnType<typeof buildModel>} model
 */
function calibration(words, model) {
  const mu = Array.from({length:A}, () => new Float64Array(A));
  const variance = Array.from({length:A}, () => new Float64Array(A));
  const freq = new Int32Array(A);
  for (const word of words) {
    const L = word.length;
    if (L > MAXLEN) continue;
    const counts = new Int32Array(A);
    for (const symbol of word) counts[symbol]++;
    for (let c = 0; c < A; c++) {
      const k = counts[c];
      freq[c] += k;
      if (!k) continue;
      for (let p = 0; p < A; p++) {
        mu[p][c] += k * model.means[p][L];
        if (L > 1) variance[p][c] += k * (L-k)/(L-1) * model.vpop[p][L];
      }
    }
  }
  return {mu, variance, freq};
}

/**
 * Evaluate the maximum of all 841 fixed-point hypotheses.
 * @param {Int32Array[]} h position histogram
 * @param {ReturnType<typeof buildModel>} model
 * @param {ReturnType<typeof calibration>} cal
 */
function scan(h, model, cal) {
  const ranked = [];
  let bestH = -Infinity;
  for (let p = 0; p < A; p++) for (let c = 0; c < A; c++) {
    let observed = 0;
    for (let L = 1; L <= MAXLEN; L++)
      for (let i = 0; i < L; i++)
        observed += model.weights[p][L][i] * h[L][i*A+c];
    const sd = Math.sqrt(cal.variance[p][c]);
    const z = (observed - cal.mu[p][c]) / sd;
    if (p === 8 && z > bestH) bestH = z;
    if (ranked.length < 10 || z > ranked[ranked.length-1].z) {
      ranked.push({p, c, z, n:cal.freq[c], observed,
        expected:cal.mu[p][c], sd});
      ranked.sort((x,y) => y.z - x.z);
      if (ranked.length > 10) ranked.pop();
    }
  }
  return {ranked, bestH, best:ranked[0].z};
}

/** @param {number[]} word */
function adjacentDoublets(word) {
  let n = 0;
  for (let i = 1; i < word.length; i++) n += +(word[i] === word[i-1]);
  return n;
}

/** @param {number[]} word @param {()=>number} draw @param {boolean} exact */
function permutation(word, draw, exact) {
  if (word.length <= 1) return word.slice();
  const target = exact ? adjacentDoublets(word) : 0;
  // Rejection from uniform permutations is exact conditioning.
  // The original word is a guaranteed feasible configuration.
  for (let attempt = 0; attempt < 2000; attempt++) {
    const a = word.slice();
    for (let i = a.length-1; i > 0; i--) {
      const j = draw() % (i+1);
      [a[i],a[j]] = [a[j],a[i]];
    }
    if (!exact || adjacentDoublets(a) === target) return a;
  }
  // A conservative fallback on exceptionally rare conditional classes.
  return word.slice();
}

/**
 * @param {number[][]} words
 * @param {()=>number} draw
 * @param {boolean} exactDoublets
 */
function shuffledHistogram(words, draw, exactDoublets) {
  const h = Array.from({length:MAXLEN + 1},
    (_, L) => new Int32Array(L * A));
  for (const word of words) {
    const L = word.length;
    if (L > MAXLEN) continue;
    const a = permutation(word, draw, exactDoublets);
    a.forEach((x, i) => { h[L][i*A+x]++; });
  }
  return h;
}

/**
 * Plant original 29-symbol GP-English using a general affine T_p with
 * fixed point p, a random independent rotor phase per word, a shared
 * six-lane phase key, a hidden global output permutation, and an
 * 81%-probability repeat-rewrite channel.
 * @param {number[][]} layout
 * @param {number[][]} heldout
 * @param {number[][]} train
 * @param {number} fixedPoint
 * @param {number} seed
 */
function plant(layout, heldout, train, fixedPoint, seed) {
  const draw = rotor.random32(seed);
  const pool = new Map();
  const fallback = new Map();
  for (const w of heldout) {
    if (!pool.has(w.length)) pool.set(w.length,[]);
    pool.get(w.length).push(w);
  }
  for (const w of train) {
    if (!fallback.has(w.length)) fallback.set(w.length,[]);
    fallback.get(w.length).push(w);
  }
  const sigma = Array.from({length:A},(_,i)=>i);
  for (let i=A-1;i>0;i--) {
    const j=draw()%(i+1);
    [sigma[i],sigma[j]]=[sigma[j],sigma[i]];
  }
  const transform = x => mod(3*fixedPoint-2*x);
  let repaired=0, missing=0, prev=-1;
  const words=layout.map(template => {
    const candidates=pool.get(template.length) || fallback.get(template.length);
    assert.ok(candidates && candidates.length);
    if (!pool.has(template.length)) missing++;
    const ref=candidates[draw()%candidates.length];
    const wordOffset=draw()%28;
    return ref.map((plain,i)=>{
      let c=plain;
      const steps=(wordOffset+Math.floor(i/6)+KEY[i%6])%28;
      for(let k=0;k<steps;k++) c=transform(c);
      c=sigma[c];
      if(c===prev && draw()%10000 < 8100){
        const r=draw()%28;
        c=r>=prev?r+1:r;
        repaired++;
      }
      prev=c;
      return c;
    });
  });
  return {words, fixedPoint, outputSymbol:sigma[fixedPoint],
    repaired, fallbackWords:missing};
}

/** @param {number} x */
function rankLabel(x) {
  return {index:x, rune:CORPUS.runes[x], transliteration:CORPUS.translit[x]};
}

/** @param {number[]} values */
function summary(values) {
  const sorted=values.slice().sort((a,b)=>a-b);
  return {minimum:sorted[0], median:sorted[Math.floor(.5*sorted.length)],
    p95:sorted[Math.floor(.95*sorted.length)],maximum:sorted.at(-1)};
}

function run() {
  const training=encodeTokens(ENGLISH.slice(0,240000));
  const heldout=encodeTokens(ENGLISH.slice(240000));
  const model=buildModel(training);
  const cal=calibration(WORDS,model);
  const actual=scan(histogram(WORDS),model,cal);
  const draw=rotor.random32(0x44dd2026);
  const nulls={unrestricted:[],exactWithinWordDoublets:[]};
  const hNulls={unrestricted:[],exactWithinWordDoublets:[]};
  for(const [key,exact] of [['unrestricted',false],
                              ['exactWithinWordDoublets',true]]){
    for(let n=0;n<REP;n++){
      const result=scan(shuffledHistogram(WORDS,draw,exact),model,cal);
      nulls[key].push(result.best);
      hNulls[key].push(result.bestH);
    }
  }
  const positives=[8,24].map(fixedPoint=>{
    const data=plant(WORDS,heldout,training,fixedPoint,
      0x31004400+fixedPoint);
    const scored=scan(histogram(data.words),model,
      calibration(data.words,model));
    return {fixedPoint:rankLabel(fixedPoint),
      outputSymbol:rankLabel(data.outputSymbol),
      repaired:data.repaired,fallbackWords:data.fallbackWords,
      exactCorrespondenceRank:scored.ranked.findIndex(x=>
        x.p===fixedPoint && x.c===data.outputSymbol)+1,
      best:scored.ranked[0]};
  });
  const result={
    hypothesis:'All affine T(x)=a*x+b (mod29), a!=1, raised to variable powers, then one unknown global permutation',
    necessaryCondition:'A single unknown ciphertext symbol retains word-position fingerprint of one unknown GP-English symbol',
    input:{words:WORDS.length,runes:12956,trainingTokens:training.length,
      heldoutTokens:heldout.length,plainSymbols:29,cipherSymbols:29,
      testedPairs:841,maxWordLength:MAXLEN},
    actualTop:actual.ranked.map(x=>({...x,
      plain:rankLabel(x.p),cipher:rankLabel(x.c)})),
    actualHOnlyBest:actual.bestH,
    controls:Object.fromEntries(Object.keys(nulls).map(key=>[key,{
      permutations:REP, seed:'0x44dd2026',
      familywiseP:(1+nulls[key].filter(x=>x>=actual.best).length)/(REP+1),
      HOnlyFamilywiseP:(1+hNulls[key].filter(x=>x>=actual.bestH).length)/(REP+1),
      max841:summary(nulls[key]),maxH29:summary(hNulls[key])
    }])),
    positives,
    interpretation:'No real LP2 plaintext or affine fixed-point map is recovered; bounds conditional on GP-English source and faithful word boundaries'
  };
  assert.ok(positives.every(p=>p.exactCorrespondenceRank===1));
  return result;
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encodeTokens,buildModel,histogram,calibration,scan,
  permutation,shuffledHistogram,plant,run};
