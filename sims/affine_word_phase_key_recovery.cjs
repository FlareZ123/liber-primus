'use strict';
/**
 * Infer a globally shared within-word positional key from a 29-rune ciphertext,
 * while marginalizing a different affine map for every word.
 *
 * Model: C[w,i] = A[w]*P[w,i] + B[w] + K[i] (mod 29).
 * The first five runes of each candidate plaintext dictionary word eliminate
 * B[w], and enumeration of A[w]=1..28 leaves a four-component key signature.
 * A fixed shared key must win independently on both manuscript halves.
 *
 * This test also uses a source-disjoint genuine-English planted ciphertext
 * with 81% random replacement of would-be identical adjacent ciphertext runes.
 *
 * Run from repository root: node sims/affine_word_phase_key_recovery.cjs
 * No external modules, network access, or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const input = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const original = input('resources/lp2-transcription.txt');
const gp = JSON.parse(input('resources/liber-primus/lp2-corpus.json'));
const english = input('resources/control/shakespeare_first300k.txt');
const runeIds = new Map(gp.runes.map((r, i) => [r, i]));
const romanIds = new Map(gp.translit.map((r, i) => [r, i]));
const MOD = 29;
const SPACE = MOD ** 4;
const SPLIT = 1448;

/** The first 55 rune-bearing transcription records are the unsolved text. */
function parseWords() {
  const out = [];
  let current = [];
  for (const symbol of original.split('%').slice(0, 55).join('%')) {
    if (runeIds.has(symbol)) current.push(runeIds.get(symbol));
    else if ('-.$&§0123456789'.includes(symbol) && current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  assert.equal(out.length, 2896);
  assert.equal(out.reduce((n, w) => n + w.length, 0), 12956);
  assert.ok(out.every(w => w.length <= 14));
  return out;
}
/** @param {string} word */
function encode(word) {
  const src = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < src.length;) {
    const pair = romanIds.get(src.slice(i, i + 2));
    if (pair !== undefined) {
      output.push(pair);
      i += 2;
    } else {
      const single = romanIds.get(src[i]);
      if (single === undefined) return null;
      output.push(single);
      i++;
    }
  }
  return output;
}
/** @param {string} text */
function tokenize(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode).filter(w => w !== null && w.length > 0);
}
/** @param {number[][]} words @param {boolean} unique */
function group(words, unique = false) {
  const out = new Map();
  for (const word of words) {
    if (!out.has(word.length)) out.set(word.length, unique ? new Map() : []);
    if (unique) out.get(word.length).set(word.join(','), word);
    else out.get(word.length).push(word);
  }
  return unique ? new Map([...out].map(([n, m]) => [n, [...m.values()]])) : out;
}
/** @param {number} seed */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {number[][]} layout @param {Map<number,number[][]>} hold @param {Map<number,number[][]>} dictionary */
function plant(layout, hold, dictionary) {
  const draw = seededRandom(0x48ace511);
  const key = Array.from({ length: 14 }, (_, i) => (i * i * 7 + 13 * i + 3) % MOD);
  let previous = -1;
  let replacements = 0;
  let fallbacks = 0;
  const words = layout.map(layoutWord => {
    const candidates = hold.get(layoutWord.length) || dictionary.get(layoutWord.length);
    assert.ok(candidates && candidates.length);
    if (!hold.has(layoutWord.length)) fallbacks++;
    const plain = candidates[draw() % candidates.length];
    const coefficient = 1 + draw() % 28;
    const intercept = draw() % MOD;
    return plain.map((symbol, i) => {
      let cipher = (coefficient * symbol + intercept + key[i]) % MOD;
      if (cipher === previous && draw() % 10000 < 8100) {
        const other = draw() % 28;
        cipher = other >= previous ? other + 1 : other;
        replacements++;
      }
      previous = cipher;
      return cipher;
    });
  });
  return { words, key, replacements, fallbacks };
}
/**
 * @param {number[][]} words
 * @param {Map<number,number[][]>} dictionary
 * @param {boolean} affine Whether to enumerate all 28 nonzero word coefficients
 */
function vote(words, dictionary, affine) {
  const counts = new Uint32Array(SPACE);
  let pairs = 0;
  let eligible = 0;
  for (const word of words) {
    if (word.length < 5) continue;
    const candidates = dictionary.get(word.length);
    if (!candidates) continue;
    eligible++;
    const cd = [1,2,3,4].map(i => (word[i] - word[0] + 29) % MOD);
    for (const candidate of candidates) {
      const pd = [1,2,3,4].map(i => (candidate[i] - candidate[0] + 29) % MOD);
      for (let a = 1; a < (affine ? MOD : 2); a++) {
        let signature = 0;
        let base = 1;
        for (let i = 0; i < 4; i++) {
          signature += base * ((cd[i] - a * pd[i] + 841) % MOD);
          base *= MOD;
        }
        counts[signature]++;
        pairs++;
      }
    }
  }
  let best = 0, signature = 0, second = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > best) {
      second = best;
      best = counts[i];
      signature = i;
    } else if (counts[i] > second) {
      second = counts[i];
    }
  }
  return { counts, best, signature, second, pairs, eligible };
}
/**
 * @param {number[][]} words
 * @param {Map<number,number[][]>} dictionary
 * @param {boolean} affine
 * @param {number|null} trueSignature
 */
function trial(words, dictionary, affine, trueSignature = null) {
  const a = vote(words.slice(0,SPLIT),dictionary,affine);
  const b = vote(words.slice(SPLIT),dictionary,affine);
  return {
    first: {winner:a.signature,votes:a.best,runnerUp:a.second,pairs:a.pairs,eligible:a.eligible},
    second: {winner:b.signature,votes:b.best,runnerUp:b.second,pairs:b.pairs,eligible:b.eligible},
    sameWinner: a.signature === b.signature,
    firstWinnerOnSecond:b.counts[a.signature],
    secondWinnerOnFirst:a.counts[b.signature],
    ...(trueSignature === null ? {} : {
      plantedSignature:trueSignature,
      firstTruthVotes:a.counts[trueSignature],
      secondTruthVotes:b.counts[trueSignature]
    })
  };
}

/** @param {number} signature A base-29 four-component relative phase key. */
function unpackSignature(signature) {
  const values = [0];
  for (let i=0;i<4;i++) {
    values.push(signature % MOD);
    signature = Math.floor(signature / MOD);
  }
  return values;
}
/**
 * Extend a frozen four-component key by independent votes from positions
 * 5 through 13. Only source words matching all four frozen prefix phases
 * can vote; the unknown per-word affine coefficient is still marginalized.
 * No true key parameter, original English plant, or source holdout text
 * is used by this reconstruction routine.
 * @param {number[][]} words
 * @param {Map<number,number[][]>} dictionary
 * @param {number} signature
 */
function extendKey(words, dictionary, signature) {
  const prefix = unpackSignature(signature);
  const tally = Array.from({length:14},()=>new Uint32Array(MOD));
  let prefixMatches = 0;
  for (const word of words) {
    if (word.length < 6) continue;
    for (const plain of dictionary.get(word.length) || []) {
      for (let a=1;a<MOD;a++) {
        let compatible=true;
        for (let i=1;i<5;i++) {
          if ((word[i]-word[0]-a*(plain[i]-plain[0])-prefix[i]+841) % MOD !== 0) {
            compatible=false;
            break;
          }
        }
        if (!compatible) continue;
        prefixMatches++;
        for (let i=5;i<word.length;i++) {
          const phase=(word[i]-word[0]-a*(plain[i]-plain[0])+841) % MOD;
          tally[i][phase]++;
        }
      }
    }
  }
  const phases = tally.map((counts,i) => {
    let winner=0,leader=0,second=0,total=0;
    for(let j=0;j<MOD;j++){
      const v=counts[j];total+=v;
      if(v>leader){second=leader;leader=v;winner=j;}
      else if(v>second)second=v;
    }
    return {position:i,phase:i<5?prefix[i]:total?winner:null,
      topVotes:leader,runnerUpVotes:second,totalVotes:total};
  });
  return {prefixMatches,phases};
}

function main() {
  const words = parseWords();
  const train = tokenize(english.slice(0, 240000));
  const heldout = tokenize(english.slice(240000));
  const dictionary = group(train, true);
  const hold = group(heldout);
  const implanted = plant(words,hold,dictionary);
  const trueSignature = implanted.key.slice(1,5).reduce(
    (s,v,i) => s + ((v - implanted.key[0] + MOD) % MOD) * MOD ** i,0);
  const result = {
    method:'Eliminate independent word intercepts, exhaust all word slopes, vote for 4-vector of shared position pad differences modulo29',
    source: {originalTranscriptionSha256:createHash('sha256').update(original).digest('hex'),
      shakespeareSha256:createHash('sha256').update(english).digest('hex'),
      words:words.length,runes:words.reduce((s,w)=>s+w.length,0),
      dictionaryTypes:[...dictionary.values()].reduce((s,v)=>s+v.length,0),
      trainTokens:train.length,heldoutTokens:heldout.length},
    genuine: {
      caesar:trial(words,dictionary,false),
      affine:trial(words,dictionary,true),
      recoveredSuffix:extendKey(words,dictionary,trial(words,dictionary,true).first.winner)
    },
    planted: {
      ciphertextReplacements:implanted.replacements,
      lengthFallbackWords:implanted.fallbacks,
      trueKey:implanted.key,
      trueSignature,
      affine:trial(implanted.words,dictionary,true,trueSignature),
      recoveredSuffix:extendKey(implanted.words,dictionary,trueSignature)
    },
    wordLengthStrata:[5,6,7,8,9,10,11,12].map(length => ({
      length,
      caesar:trial(words.map(w=>w.length===length?w:[]),dictionary,false),
      affine:trial(words.map(w=>w.length===length?w:[]),dictionary,true)
    }))
  };
  assert.equal(result.genuine.caesar.first.votes,9);
  assert.equal(result.genuine.affine.first.votes,40);
  assert.equal(result.planted.affine.first.winner,trueSignature);
  assert.equal(result.planted.affine.second.winner,trueSignature);
  assert.ok(result.planted.affine.firstTruthVotes>300);
  assert.ok(result.planted.affine.secondTruthVotes>300);
  for (let i=5;i<=10;i++) {
    assert.equal(result.planted.recoveredSuffix.phases[i].phase,
      (implanted.key[i]-implanted.key[0]+MOD)%MOD);
  }
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
module.exports={parseWords,encode,tokenize,group,seededRandom,plant,vote,trial,unpackSignature,extendKey,main};
if(require.main===module)main();
