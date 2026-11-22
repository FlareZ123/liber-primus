'use strict';

/**
 * p50 low60-even additive key-increment mixture discriminator.
 *
 * Model:
 *   C[i+1]-C[i] = P[i+1]-P[i] + D[i] (mod 29)
 * where the p50 parity state selects a stationary distribution for D.
 *
 * q(d) is frozen from source-native Shakespeare. For each training fold,
 * nonnegative 29-way increment mixtures are fitted by EM. Nine visual chapters
 * are held out exactly once. The decisive comparison is two parity-state
 * increment laws versus one common increment law.
 *
 * SFT: node sims/lp2_p50_low60_even_increment_mixture_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const mask = Uint8Array.from(tokens, (token) => {
  const digit = A60.indexOf(token[1]);
  assert.ok(digit >= 0);
  return Number(token[0] === '0' && (digit & 1) === 0);
});
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(mask.reduce((sum, value) => sum + value, 0), 36);

/** @param {number} x */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @returns {Uint32Array[][]} */
function inventoryOriginal() {
  const out = Array.from(
    {length: 9},
    () => [new Uint32Array(29), new Uint32Array(29)]
  );
  let global = 0;
  for (const page of pages) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);
    for (let i = 0; i + 1 < page.indices.length; i++) {
      const state = mask[(global + i) & 255];
      const d = mod29(page.indices[i + 1] - page.indices[i]);
      out[chapter][state][d]++;
    }
    global += page.indices.length;
  }
  return out;
}

const inventory = inventoryOriginal();

/** @param {Uint32Array} a @param {Uint32Array} b */
function addCounts(a, b) {
  const out = new Uint32Array(29);
  for (let i = 0; i < 29; i++) out[i] = a[i] + b[i];
  return out;
}

/** @param {Uint32Array[]} arrays */
function sumCounts(arrays) {
  return arrays.reduce((sum, row) => addCounts(sum, row), new Uint32Array(29));
}

/** @param {Uint32Array} counts */
function nCounts(counts) {
  return counts.reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number[]} values
 * @returns {number[]}
 */
function differenceLaw(values) {
  const counts = new Float64Array(29);
  for (let i = 0; i + 1 < values.length; i++) {
    counts[mod29(values[i + 1] - values[i])]++;
  }
  const denominator = values.length - 1 + 29 * 0.5;
  return Array.from(counts, (count) => (count + 0.5) / denominator);
}

const source = fs.readFileSync(
  path.join(root, 'resources/control/shakespeare_first300k.txt'),
  'utf8'
);
const q = differenceLaw(encodeSourceNativeGP(source));
assert.ok(Math.abs(q.reduce((a, b) => a + b, 0) - 1) < 1e-12);

/**
 * @param {number[]} h
 */
function convolve(h) {
  return Array.from({length: 29}, (_, d) => {
    let p = 0;
    for (let k = 0; k < 29; k++) p += h[k] * q[mod29(d - k)];
    return p;
  });
}

/**
 * Convex mixture fit by EM.
 * @param {Uint32Array} counts
 */
function fitIncrementMixture(counts) {
  const n = nCounts(counts);
  assert.ok(n > 0);
  let h = new Array(29).fill(1 / 29);
  let iterations = 0;
  for (; iterations < 5000; iterations++) {
    const pred = convolve(h);
    const next = new Array(29).fill(0);
    for (let d = 0; d < 29; d++) {
      if (!counts[d]) continue;
      for (let k = 0; k < 29; k++) {
        next[k] += counts[d] * h[k] * q[mod29(d - k)] / pred[d];
      }
    }
    for (let k = 0; k < 29; k++) next[k] /= n;
    const delta = Math.max(...next.map((value, k) => Math.abs(value - h[k])));
    h = next;
    if (delta < 1e-13) break;
  }
  return {h, pred: convolve(h), iterations: iterations + 1};
}

/** @param {Uint32Array} counts @param {number[]} p */
function logLikelihood(counts, p) {
  let ll = 0;
  for (let d = 0; d < 29; d++) {
    if (counts[d]) ll += counts[d] * Math.log(p[d]);
  }
  return ll;
}

/** @param {number[]} h */
function summary(h) {
  const entropy = -h.reduce(
    (sum, p) => sum + (p > 0 ? p * Math.log(p) : 0),
    0
  );
  const top = h
    .map((p, increment) => ({increment, p}))
    .sort((a, b) => b.p - a.p)
    .slice(0, 8);
  return {
    entropy,
    effectiveIncrements: Math.exp(entropy),
    maxMass: top[0].p,
    top
  };
}

const allChapters = Array.from({length: 9}, (_, i) => i);
const loco = [];
for (let hold = 0; hold < 9; hold++) {
  const train = allChapters.filter((chapter) => chapter !== hold);
  const train0 = sumCounts(train.map((chapter) => inventory[chapter][0]));
  const train1 = sumCounts(train.map((chapter) => inventory[chapter][1]));
  const trainAll = addCounts(train0, train1);
  const common = fitIncrementMixture(trainAll);
  const state0 = fitIncrementMixture(train0);
  const state1 = fitIncrementMixture(train1);
  const held0 = inventory[hold][0];
  const held1 = inventory[hold][1];
  const commonLL =
    logLikelihood(held0, common.pred) + logLikelihood(held1, common.pred);
  const separateLL =
    logLikelihood(held0, state0.pred) + logLikelihood(held1, state1.pred);
  loco.push({
    hold,
    pages: CHAPTERS[hold],
    heldTransitions: [nCounts(held0), nCounts(held1)],
    gainSeparateVsCommon: separateLL - commonLL
  });
}

const full0 = sumCounts(allChapters.map((chapter) => inventory[chapter][0]));
const full1 = sumCounts(allChapters.map((chapter) => inventory[chapter][1]));
const fit0 = fitIncrementMixture(full0);
const fit1 = fitIncrementMixture(full1);
const gain = loco.reduce((sum, row) => sum + row.gainSeparateVsCommon, 0);

/*
 * Positive control on the same geometry. Source-native Gibran plaintext is
 * encrypted with deterministic increments drawn from two sparse, distinct
 * state laws. Full-book EM should recover the planted support among its
 * highest masses.
 */
const gibran = encodeSourceNativeGP(fs.readFileSync(
  path.join(root, 'resources/control/gibran_prophet_58585.txt'),
  'utf8'
)).slice(0, 12956);
assert.equal(gibran.length, 12956);
const plantSupport = [[3, 11, 17], [0, 7]];
const plantCipher = new Array(gibran.length);
plantCipher[0] = mod29(gibran[0] + 5);
let key = 5;
let global = 0;
let ordinal = 0;
for (const page of pages) {
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const state = mask[(global + i) & 255];
    const support = plantSupport[state];
    key = mod29(key + support[ordinal % support.length]);
    plantCipher[global + i + 1] = mod29(gibran[global + i + 1] + key);
    ordinal++;
  }
  global += page.indices.length;
  if (global < gibran.length) {
    // page seam has no scored transition; preserve the current key.
    plantCipher[global] = mod29(gibran[global] + key);
  }
}
assert.equal(global, gibran.length);

/** @returns {Uint32Array[]} */
function plantCounts() {
  const out = [new Uint32Array(29), new Uint32Array(29)];
  let offset = 0;
  for (const page of pages) {
    for (let i = 0; i + 1 < page.indices.length; i++) {
      const state = mask[(offset + i) & 255];
      out[state][mod29(
        plantCipher[offset + i + 1] - plantCipher[offset + i]
      )]++;
    }
    offset += page.indices.length;
  }
  return out;
}
const pc = plantCounts();
const pcFit = pc.map((counts) => fitIncrementMixture(counts));
const pcTop = pcFit.map((fit) =>
  new Set(summary(fit.h).top.slice(0, 6).map((row) => row.increment))
);
for (let state = 0; state < 2; state++) {
  for (const increment of plantSupport[state]) assert.ok(pcTop[state].has(increment));
}

console.log(JSON.stringify({
  classification:
    'source-constrained additive key-increment architecture test; no plaintext/key recovered',
  model:
    'ciphertext difference = native plaintext difference + parity-state key increment mod29',
  original: {
    complementTransitions: nCounts(full0),
    selectedTransitions: nCounts(full1),
    selectedRepeats: full1[0],
    complementRepeats: full0[0],
    fullFit: {
      complement: summary(fit0.h),
      selected: summary(fit1.h)
    },
    loco: {
      totalGainSeparateVsCommon: gain,
      positiveFolds: loco.filter((row) => row.gainSeparateVsCommon > 0).length,
      folds: loco
    }
  },
  positive: {
    plantedSupport: plantSupport,
    recoveredTop: pcFit.map((fit) => summary(fit.h).top.slice(0, 8))
  }
}, null, 2));
