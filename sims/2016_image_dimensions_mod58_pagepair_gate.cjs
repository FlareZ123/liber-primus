"use strict";

/**
 * 2016 signed-tree dimensions modulo the historic 58-image LP2 archive
 * select physical pages 41 and 47. Test a source-frozen shared-GP29-pad
 * hypothesis with an optional unknown common invertible scalar.
 *
 * Exact source: resources/liber-primus/lp2-corpus.json
 * Native-GP positive: heldout Shakespeare (not trained on original LP2).
 * Node.js 22 CommonJS. Console-only, no dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/control/shakespeare_first300k.txt");
const mod = x => ((x % 29) + 29) % 29;

const tree = corpus.pages.find(p => p.page === 32).indices;
const width = tree.slice(0, 11).reduce((n, c) => n + corpus.prime[c], 0);
const height = Array.from({length: 11}, (_, i) => tree[i * 11])
  .reduce((n, c) => n + corpus.prime[c], 0);
assert.deepEqual([width, height], [563, 569]);
assert.equal(corpus.pages.length, 58);
const pageA = width % corpus.pages.length;
const pageB = height % corpus.pages.length;
assert.deepEqual([pageA, pageB], [41, 47]);
const originalA = corpus.pages.find(p => p.page === pageA).indices;
const originalB = corpus.pages.find(p => p.page === pageB).indices;
assert.deepEqual([originalA.length, originalB.length], [273, 274]);
const N = Math.min(originalA.length, originalB.length);

const byTranslit = new Map(corpus.translit.map((t, i) => [t, i]));
/** @param {string} word @returns {number[]} */
function encode(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const two = normalized.slice(i, i + 2);
    if (byTranslit.has(two)) {
      output.push(byTranslit.get(two));
      i += 2;
    } else {
      const rune = byTranslit.get(normalized[i]);
      assert.notEqual(rune, undefined);
      output.push(rune);
      i++;
    }
  }
  return output;
}

const words = text.match(/[A-Za-z]+/g);
const split = Math.floor(words.length / 2);
const train = words.slice(0, split).flatMap(encode);
const holdout = words.slice(split).flatMap(encode);
const counts = Array(29).fill(1);
for (const c of train) counts[c]++;
const denominator = counts.reduce((n, c) => n + c);
const logLR = Array.from({length: 29}, (_, difference) => {
  let value = 0;
  for (let x = 0; x < 29; x++)
    value += (counts[x] / denominator) * (counts[mod(x - difference)] / denominator);
  return Math.log(29 * value);
});

/** @param {number[]} differences @returns {{score:number,multiplier:number,direct:number}} */
function evaluate(differences) {
  const hist = Array(29).fill(0);
  for (const d of differences) hist[d]++;
  let best = -Infinity;
  let multiplier = -1;
  for (let a = 1; a < 29; a++) {
    let score = 0;
    for (let i = 0; i < 29; i++) score += hist[i] * logLR[mod(a * i)];
    if (score > best) {
      best = score;
      multiplier = a;
    }
  }
  const direct = hist.reduce((n, count, i) => n + count * logLR[i], 0) / differences.length;
  return {score: best / differences.length, multiplier, direct};
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function cancel(a, b) {
  return a.slice(0, N).map((c, i) => mod(c - b[i]));
}

let state = 0x20165635;
/** @returns {number} */
function rand() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

/** @param {number[]} a */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
}

/** Positive encryption/re-encryption control with a real secret common pad. */
const nativeA = holdout.slice(1000, 1000 + N);
const nativeB = holdout.slice(2500, 2500 + N);
const positiveKey = Array.from({length: N}, (_, i) => (i * 13 + 31) % 29);
const ciphertextA = nativeA.map((x, i) => mod(x + positiveKey[i]));
const ciphertextB = nativeB.map((x, i) => mod(x + positiveKey[i]));
assert.deepEqual(cancel(ciphertextA, ciphertextB), cancel(nativeA, nativeB));
assert.deepEqual(ciphertextA.map((x, i) => mod(x - positiveKey[i])), nativeA);
assert.deepEqual(ciphertextB.map((x, i) => mod(x - positiveKey[i])), nativeB);

/** Shared but secret invertible alphabet scalar plus pad, canceled without knowing pad. */
const scalar = 7;
const affineA = nativeA.map((x, i) => mod(scalar * x + positiveKey[i]));
const affineB = nativeB.map((x, i) => mod(scalar * x + positiveKey[i]));
const inverseScalar = Array.from({length: 28}, (_, i) => i + 1)
  .find(x => mod(x * scalar) === 1);
assert.notEqual(inverseScalar, undefined);
assert.deepEqual(cancel(affineA, affineB).map(x => mod(inverseScalar * x)),
  cancel(nativeA, nativeB));

const observed = evaluate(cancel(originalA, originalB));
assert.equal(observed.multiplier, 6);
const repeats = 3000;
let positiveAtOrBelow = 0, shuffledAtOrAbove = 0;
let positiveSum = 0, shuffleSum = 0, minPositive = Infinity;
for (let t = 0; t < repeats; t++) {
  const i = rand() % (holdout.length - 2 * N);
  let j = rand() % (holdout.length - 2 * N);
  if (Math.abs(i - j) < N)
    j = (i + N + rand() % (holdout.length - 3 * N)) % (holdout.length - N);
  const trueDifference = Array.from({length: N},
    (_, k) => mod(holdout[i + k] - holdout[j + k]));
  const positive = evaluate(trueDifference).score;
  positiveSum += positive;
  minPositive = Math.min(minPositive, positive);
  if (positive <= observed.score) positiveAtOrBelow++;

  const randomizedB = originalB.slice(0, N);
  shuffle(randomizedB);
  const wrong = evaluate(cancel(originalA, randomizedB)).score;
  shuffleSum += wrong;
  if (wrong >= observed.score) shuffledAtOrAbove++;
}
assert.equal(positiveAtOrBelow, 10);
assert.equal(shuffledAtOrAbove, 1963);
console.log(JSON.stringify({
  source: "2016 image 563x569 dimensions modulo 58 original LP2 image count",
  pages: [pageA, pageB], lengths: [originalA.length, originalB.length],
  comparedRunes: N, original: observed,
  finiteSecret: "28 common invertible GP29 scalar maps, one shared arbitrary additive pad",
  nativeControls: {twoRealPadRoundTrips: true, scalarPadRoundTrip: true},
  nativeEnglish: {trials: repeats, meanLogLR: positiveSum / repeats,
    minimumLogLR: minPositive, atOrBelowOriginal: positiveAtOrBelow},
  originalPageShuffle: {trials: repeats, meanLogLR: shuffleSum / repeats,
    atOrAboveOriginal: shuffledAtOrAbove, addOneTail: (shuffledAtOrAbove + 1) / (repeats + 1)},
  conclusion: "No shared-pad evidence on source-selected original pages; no plaintext or key recovered."
}, null, 2));
