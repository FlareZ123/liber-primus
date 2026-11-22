'use strict';

/**
 * Standalone full-original LP2 GP29 two-back affine rank28 inverse test.
 *
 * Model, at each physical page start u=v=0:
 *   step(P,u,v) = 0 if P=28 else 1+((P+a*v+b) mod 28)
 *   C=(u+step) mod 29; (u,v)<-(C,u)
 *
 * Every a,b in 0..27 is completely invertible for all 29 runes.
 * An equal adjacent ciphertext pair maps to sentinel plaintext rune 28.
 * The 784-key search is blind to three different planted keys and then
 * trained only on authentic unsolved p0..39; pp40..53 stay untouched.
 *
 * Source: canonical original pages and period-solved native GP29 witnesses.
 * The model is exploratory and not authenticated as a Cicada mechanism.
 *
 * @returns {void}
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const native = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0);
const runeMap = new Map(native.runes.map((r, i) => [r, i]));

/**
 * @param {string} input Source rune text, including punctuation.
 * @returns {number[]} Exact GP29 indices.
 */
function indices(input) {
  const result = [];
  for (const glyph of input) {
    const rune = runeMap.get(glyph);
    if (rune !== undefined) result.push(rune);
  }
  return result;
}

/**
 * @param {number[]} plaintext GP29 indices.
 * @param {number} a Feedback coefficient in 0..27.
 * @param {number} b Constant in 0..27.
 * @returns {number[]} Encrypted indices.
 */
function encrypt(plaintext, a, b) {
  let u = 0;
  let v = 0;
  const cipher = [];
  for (const p of plaintext) {
    const step = p === 28 ? 0 : 1 + ((p + a * v + b) % 28);
    const c = (u + step) % 29;
    cipher.push(c);
    v = u;
    u = c;
  }
  return cipher;
}

/**
 * @param {number[]} cipher GP29 ciphertext, reset at each physical page.
 * @param {number} a Feedback coefficient.
 * @param {number} b Constant.
 * @returns {number[]} Exact inverse (never requires an F/EA skip).
 */
function decrypt(cipher, a, b) {
  let u = 0;
  let v = 0;
  const plain = [];
  for (const c of cipher) {
    const step = (c - u + 29) % 29;
    plain.push(step === 0 ? 28 : ((step - 1 - a * v - b + 2800) % 28));
    v = u;
    u = c;
  }
  return plain;
}

/**
 * @param {number[]} runes Source-native register.
 * @returns {number} Normalized index of coincidence, English > 1.
 */
function normalizedIoC(runes) {
  const counts = new Array(29).fill(0);
  for (const rune of runes) counts[rune] += 1;
  return 29 * counts.reduce((acc, count) => acc + count * (count - 1), 0)
    / (runes.length * (runes.length - 1));
}

/**
 * @param {number[]} training Strictly independent source GP runes.
 * @returns {number[]} Laplace-smoothed log unigram probabilities.
 */
function trainUnigrams(training) {
  const counts = new Array(29).fill(1);
  for (const rune of training) counts[rune] += 1;
  const total = training.length + 29;
  return counts.map(count => Math.log(count / total));
}

/**
 * @param {number[]} runes
 * @param {number[]} model
 * @returns {number} Mean log likelihood per decoded rune.
 */
function meanLogLikelihood(runes, model) {
  return runes.reduce((sum, rune) => sum + model[rune], 0) / runes.length;
}

/**
 * @param {number[]} cipher A single independent reset section.
 * @param {number[]} model Trained solely on different sections.
 * @returns {{ a: number, b: number, score: number }} Best of all 784 keys.
 */
function keySearch(cipher, model) {
  let best = { a: -1, b: -1, score: -Infinity };
  for (let a = 0; a < 28; a += 1) {
    for (let b = 0; b < 28; b += 1) {
      const score = meanLogLikelihood(decrypt(cipher, a, b), model);
      if (score > best.score) best = { a, b, score };
    }
  }
  return best;
}

const solved = native.sections.map(section => ({
  name: section.name,
  runes: indices(section.source_text),
}));
assert.equal(solved.length, 9);
assert.equal(solved.reduce((sum, s) => sum + s.runes.length, 0), 2979);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(pages.reduce((sum, p) =>
  sum + p.indices.reduce((n, rune, i) =>
    n + (i > 0 && rune === p.indices[i - 1] ? 1 : 0), 0), 0), 86);

// Blind fixed-key native plants: each key and source section is different.
// The language model excludes the very section being encrypted.
const plants = [
  { name: '0_koan_1', a: 5, b: 17 },
  { name: '0_loss_of_divinity', a: 11, b: 3 },
  { name: '0_welcome', a: 19, b: 9 },
];
for (const plant of plants) {
  const section = solved.find(s => s.name === plant.name);
  assert.ok(section);
  const model = trainUnigrams(solved.filter(s => s !== section).flatMap(s => s.runes));
  const cipher = encrypt(section.runes, plant.a, plant.b);
  const winner = keySearch(cipher, model);
  assert.deepEqual([winner.a, winner.b], [plant.a, plant.b]);
  assert.deepEqual(decrypt(cipher, winner.a, winner.b), section.runes);
  assert.deepEqual(encrypt(decrypt(cipher, winner.a, winner.b), winner.a, winner.b), cipher);
  console.log('PLANT PASS ' + plant.name + ': ' + section.runes.length
    + ' runes, 784-key blind recovery (' + winner.a + ',' + winner.b + ')');
}

const sourceModel = trainUnigrams(solved.flatMap(s => s.runes));
const trainPages = pages.filter(p => p.page < 40);
const holdPages = pages.filter(p => p.page >= 40 && p.page < 54);
const tailPages = pages.filter(p => p.page >= 54);
assert.equal(trainPages.reduce((n, p) => n + p.indices.length, 0), 9640);
assert.equal(holdPages.reduce((n, p) => n + p.indices.length, 0), 3008);
assert.equal(tailPages.reduce((n, p) => n + p.indices.length, 0), 308);

/**
 * @param {Array<{indices: number[]}>} requestedPages
 * @param {number} a
 * @param {number} b
 * @returns {number[]} All original output with a reset at each page.
 */
function decodePages(requestedPages, a, b) {
  return requestedPages.flatMap(p => decrypt(p.indices, a, b));
}

// All 784 genuine original keys are evaluated; one train-selected key
// must predict the untouched p40..53 and p54..55 with no refitting.
let best = { a: -1, b: -1, score: -Infinity };
let minIoC = Infinity;
let maxIoC = -Infinity;
let minHoldIoC = Infinity;
let maxHoldIoC = -Infinity;
for (let a = 0; a < 28; a += 1) {
  for (let b = 0; b < 28; b += 1) {
    const train = decodePages(trainPages, a, b);
    const ioc = normalizedIoC(train);
    minIoC = Math.min(minIoC, ioc);
    maxIoC = Math.max(maxIoC, ioc);
    const holdIoC = normalizedIoC(decodePages(holdPages, a, b));
    minHoldIoC = Math.min(minHoldIoC, holdIoC);
    maxHoldIoC = Math.max(maxHoldIoC, holdIoC);
    const score = meanLogLikelihood(train, sourceModel);
    if (score > best.score) best = { a, b, score };
  }
}
assert.deepEqual([best.a, best.b], [25, 6]);
const chosenTrain = decodePages(trainPages, best.a, best.b);
const chosenHold = decodePages(holdPages, best.a, best.b);
const chosenTail = decodePages(tailPages, best.a, best.b);
for (const p of pages) {
  assert.deepEqual(encrypt(decrypt(p.indices, best.a, best.b), best.a, best.b), p.indices);
}
const originalNativeControl = solved.flatMap(s => s.runes);
const nativeIoC = normalizedIoC(originalNativeControl);
assert.ok(nativeIoC > 1.7);
assert.ok(maxIoC < 1.04);
assert.ok(maxHoldIoC < 1.04);
assert.ok(meanLogLikelihood(chosenHold, sourceModel) < -4.0);
console.log(JSON.stringify({
  originalRuneCount: 12956,
  originalTraining: { runes: chosenTrain.length, key: [best.a, best.b],
    nativeLogScore: best.score, ioc: normalizedIoC(chosenTrain) },
  untouchedP40To53: { runes: chosenHold.length,
    nativeLogScore: meanLogLikelihood(chosenHold, sourceModel),
    ioc: normalizedIoC(chosenHold) },
  untouchedP54To55: { runes: chosenTail.length,
    nativeLogScore: meanLogLikelihood(chosenTail, sourceModel),
    ioc: normalizedIoC(chosenTail) },
  all784OriginalTrainingIoCRange: [minIoC, maxIoC],
  all784P40To53IoCRange: [minHoldIoC, maxHoldIoC],
  authenticNativeSolved: { runes: originalNativeControl.length,
    logScore: meanLogLikelihood(originalNativeControl, sourceModel),
    ioc: nativeIoC }
}, null, 2));
console.log('ORIGINAL NEGATIVE: every affine two-back key remains nonnative GP29.');
