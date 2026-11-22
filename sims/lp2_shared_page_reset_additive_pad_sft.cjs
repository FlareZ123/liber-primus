'use strict';
/**
 * Director #1519: one shared additive GP29 pad restarted at every physical page.
 * Read-only, dependency-free Node 22 CommonJS single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const refText = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');

const pages = data.pages.slice(0, 56).filter(p => p.indices.length).map(p => ({ page: p.page, x: p.indices }));
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.x.length, 0), 12956);
const maxLen = Math.max(...pages.map(p => p.x.length));
assert.equal(maxLen, 277);

const alphabet = new Map(data.translit.map((x, i) => [x, i]));
const tokens = [...alphabet.keys()].sort((a, b) => b.length - a.length);

/** @param {string} text */
function encodeReference(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll('ING', 'NG');
    const seq = [];
    for (let at = 0; at < word.length;) {
      const token = tokens.find(t => word.startsWith(t, at));
      if (!token) {
        seq.length = 0;
        break;
      }
      seq.push(alphabet.get(token));
      at += token.length;
    }
    out.push(...seq);
  }
  return out;
}

const ref = encodeReference(refText);
assert.equal(ref.length, 3568);

const unigram = new Float64Array(29).fill(0.5);
const bigram = Array.from({ length: 29 }, () => new Float64Array(29).fill(0.25));
for (const x of ref) unigram[x]++;
for (let i = 1; i < ref.length; i++) bigram[ref[i - 1]][ref[i]]++;

const unigramTotal = unigram.reduce((a, b) => a + b, 0);
const logU = Array.from(unigram, x => Math.log(x / unigramTotal));
const logT = Array.from({ length: 29 }, (_, a) => {
  const total = bigram[a].reduce((x, y) => x + y, 0);
  return Array.from(bigram[a], x => Math.log(x / total));
});

// Predeclared, disjoint split. Both training halves are p0-p39.
// The complete late section p40-p55 is never used for fitting.
const trainA = pages.filter(p => p.page <= 39 && p.page % 2 === 0);
const trainB = pages.filter(p => p.page <= 39 && p.page % 2 === 1);
const heldout = pages.filter(p => p.page >= 40);
assert.equal(trainA.length, 20);
assert.equal(trainB.length, 20);
assert.equal(heldout.length, 15);
assert.equal(heldout.reduce((s, p) => s + p.x.length, 0), 3316);

/**
 * Exact Viterbi maximum-likelihood key under one shared page-reset additive pad
 * and the fixed LP1-trained GP29 bigram objective.
 * @param {{page:number,x:number[]}[]} ps
 * @returns {number[]}
 */
function fitKey(ps) {
  let previous = new Float64Array(29);
  /** @type {Int8Array[]} */
  const back = [];

  for (let key = 0; key < 29; key++) {
    let score = 0;
    for (const p of ps) score += logU[(p.x[0] - key + 29) % 29];
    previous[key] = score;
  }

  for (let j = 1; j < maxLen; j++) {
    const current = new Float64Array(29);
    const bp = new Int8Array(29);

    for (let keyNow = 0; keyNow < 29; keyNow++) {
      let best = -Infinity;
      let bestPrev = 0;

      for (let keyPrev = 0; keyPrev < 29; keyPrev++) {
        let score = previous[keyPrev];
        for (const p of ps) {
          if (p.x.length <= j) continue;
          const a = (p.x[j - 1] - keyPrev + 29) % 29;
          const b = (p.x[j] - keyNow + 29) % 29;
          score += logT[a][b];
        }
        if (score > best) {
          best = score;
          bestPrev = keyPrev;
        }
      }

      current[keyNow] = best;
      bp[keyNow] = bestPrev;
    }

    back.push(bp);
    previous = current;
  }

  let key = 0;
  let best = -Infinity;
  for (let x = 0; x < 29; x++) {
    if (previous[x] > best) {
      best = previous[x];
      key = x;
    }
  }

  const out = new Int8Array(maxLen);
  out[maxLen - 1] = key;
  for (let j = maxLen - 1; j >= 1; j--) {
    key = back[j - 1][key];
    out[j - 1] = key;
  }
  return Array.from(out);
}

/** @param {number[]} seq */
function scoreSequence(seq) {
  let score = logU[seq[0]];
  for (let j = 1; j < seq.length; j++) score += logT[seq[j - 1]][seq[j]];
  return { n: seq.length, score, perRune: score / seq.length, perplexity: Math.exp(-score / seq.length) };
}

/**
 * @param {{page:number,x:number[]}[]} ps
 * @param {number[]} key
 */
function scorePages(ps, key) {
  let score = 0;
  let n = 0;
  for (const p of ps) {
    const plain = p.x.map((c, j) => (c - key[j] + 29) % 29);
    const s = scoreSequence(plain);
    score += s.score;
    n += s.n;
  }
  return { n, score, perRune: score / n, perplexity: Math.exp(-score / n) };
}

/** @param {number} seed */
function prng(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    },
    /** @param {number} n */
    int(n) {
      return Math.floor(this.next() * n);
    }
  };
}

/**
 * @param {number[]} logs
 * @param {{next:()=>number}} rng
 */
function sampleLog(logs, rng) {
  const probs = logs.map(Math.exp);
  const total = probs.reduce((a, b) => a + b, 0);
  let u = rng.next() * total;
  for (let i = 0; i < probs.length; i++) {
    u -= probs[i];
    if (u < 0) return i;
  }
  return probs.length - 1;
}

const rng = prng(151938);
const trueKey = Array.from({ length: maxLen }, () => rng.int(29));
const planted = pages.map(p => {
  const plain = new Array(p.x.length);
  plain[0] = sampleLog(logU, rng);
  for (let j = 1; j < plain.length; j++) plain[j] = sampleLog(logT[plain[j - 1]], rng);
  return {
    page: p.page,
    x: plain.map((v, j) => (v + trueKey[j]) % 29),
    plain
  };
});

const plantA = planted.filter(p => p.page <= 39 && p.page % 2 === 0);
const plantB = planted.filter(p => p.page <= 39 && p.page % 2 === 1);
const plantHeldout = planted.filter(p => p.page >= 40);

const keyPlantA = fitKey(plantA);
const keyPlantB = fitKey(plantB);
const keyPlantAB = fitKey(plantA.concat(plantB));
const keyA = fitKey(trainA);
const keyB = fitKey(trainB);
const keyAB = fitKey(trainA.concat(trainB));

/** @param {number[]} a @param {number[]} b @param {number} n */
function matches(a, b, n) {
  let count = 0;
  for (let i = 0; i < n; i++) if (a[i] === b[i]) count++;
  return count;
}

assert.equal(matches(keyPlantA, trueKey, 200), 200);
assert.equal(matches(keyPlantB, trueKey, 200), 200);
assert.equal(matches(keyPlantAB, trueKey, 200), 200);
assert.equal(matches(keyPlantA, keyPlantB, 200), 200);

let plantPlainScore = 0;
let plantPlainN = 0;
for (const p of plantHeldout) {
  const s = scoreSequence(p.plain);
  plantPlainScore += s.score;
  plantPlainN += s.n;
}
const plantNative = {
  n: plantPlainN,
  score: plantPlainScore,
  perRune: plantPlainScore / plantPlainN,
  perplexity: Math.exp(-plantPlainScore / plantPlainN)
};
const plantDecoded = scorePages(plantHeldout, keyPlantAB);
assert(Math.abs(plantDecoded.perRune - plantNative.perRune) < 0.01);

const p57Native = scoreSequence(data.pages[57].indices);
assert.equal(p57Native.n, 95);

const agreement150 = matches(keyA, keyB, 150);
const agreement200 = matches(keyA, keyB, 200);
const originalA = scorePages(heldout, keyA);
const originalB = scorePages(heldout, keyB);
const originalAB = scorePages(heldout, keyAB);

// Fixed-seed wrong-key calibration on the untouched held-out section.
const wrongPlant = [];
const wrongOriginal = [];
for (let t = 0; t < 100; t++) {
  const wrongKey = Array.from({ length: maxLen }, () => rng.int(29));
  wrongPlant.push(scorePages(plantHeldout, wrongKey).perRune);
  wrongOriginal.push(scorePages(heldout, wrongKey).perRune);
}
wrongPlant.sort((a, b) => a - b);
wrongOriginal.sort((a, b) => a - b);
function quantiles(a) {
  return { min: a[0], q05: a[5], median: a[50], q95: a[95], max: a[99] };
}

console.log('Input/model:', JSON.stringify({
  pages: pages.length,
  runes: 12956,
  maxPageRunes: maxLen,
  lp1TrainingRunes: ref.length,
  p57Native,
  split: {
    trainA: trainA.map(p => p.page),
    trainB: trainB.map(p => p.page),
    heldout: heldout.map(p => p.page)
  }
}));

console.log('Planted page-reset pad:', JSON.stringify({
  recoveryFirst200: {
    trainA: matches(keyPlantA, trueKey, 200),
    trainB: matches(keyPlantB, trueKey, 200),
    union: matches(keyPlantAB, trueKey, 200)
  },
  disjointTrainingAgreementFirst200: matches(keyPlantA, keyPlantB, 200),
  heldoutNative: plantNative,
  heldoutDecoded: plantDecoded,
  wrongKeyHeldout: quantiles(wrongPlant)
}));

console.log('Original LP2:', JSON.stringify({
  disjointTrainingAgreementFirst150: agreement150,
  disjointTrainingAgreementFirst200: agreement200,
  heldoutDecodedByTrainA: originalA,
  heldoutDecodedByTrainB: originalB,
  heldoutDecodedByUnion: originalAB,
  wrongKeyHeldout: quantiles(wrongOriginal)
}));

assert(agreement200 <= 10, 'Original disjoint-fit keys agree unexpectedly often');
assert(originalA.perRune < -4.0);
assert(originalB.perRune < -4.0);
assert(originalAB.perRune < -4.0);
assert(plantDecoded.perRune > -2.8);
assert(p57Native.perRune > -3.0);

const p40 = heldout.find(p => p.page === 40);
const p40Plain = p40.x.map((c, j) => (c - keyAB[j] + 29) % 29);
console.log('Original p40 first150 translit:', p40Plain.slice(0, 150).map(x => data.translit[x]).join('-'));
console.log('PASS: planted shared page-reset pad is recovered exactly on first200; original training keys do not transfer to untouched p40-p55.');
