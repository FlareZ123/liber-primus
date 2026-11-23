'use strict';

/**
 * Source-fixed 8-of-16 GF(29) share reconstruction for the floral black tape.
 * Read-only Windows/Node.js 22 SFT. No external packages or fitted keys.
 * Run with Node.js from the repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
const redByPage = new Map(ink.pages.map((page) => [page.page, page.red_spans || []]));

const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let result = 1;
  let value = mod(base);
  let n = exponent;
  while (n > 0) {
    if (n % 2 === 1) result = mod(result * value);
    value = mod(value * value);
    n = Math.floor(n / 2);
  }
  return result;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  assert.notEqual(mod(value), 0);
  return power(value, 27);
}

/** @param {number[]} xCoords @param {number} target @returns {number[]} */
function lagrangeWeights(xCoords, target) {
  return xCoords.map((x, i) => xCoords.reduce(
    (weight, other, j) => i === j ? weight : mod(weight * (target - other) * inverse(x - other)),
    1
  ));
}

/** @param {number[]} weights @param {number[]} shares @param {number} column @returns {number} */
function evaluate(weights, shares, column) {
  return mod(weights.reduce((sum, weight, r) => sum + weight * shares[r * 203 + column], 0));
}

/** @param {number[]} input @returns {number} */
function coincidence(input) {
  const counts = Array(29).fill(0);
  for (const c of input) counts[c] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (input.length * (input.length - 1));
}

const selectedPages = corpus.pages.filter((page) => page.page >= 40 && page.page <= 55);
assert.equal(selectedPages.length, 16);
let redCount = 0;
const source = selectedPages.flatMap((page) => {
  const removed = new Set((redByPage.get(page.page) || []).flatMap(
    (span) => Array.from({ length: span.length }, (_, k) => span.start + k)
  ));
  redCount += removed.size;
  return page.indices.filter((_, offset) => !removed.has(offset));
});
assert.equal(redCount, 68);
assert.equal(source.length, 16 * 203);

const firstEight = Array.from({ length: 8 }, (_, i) => i + 1);
const hiddenEight = Array.from({ length: 8 }, (_, i) => i + 9);
const heldWeights = hiddenEight.map((target) => lagrangeWeights(firstEight, target));
const secretWeights = lagrangeWeights(firstEight, 0);
const byRow = heldWeights.map((weights, hiddenRow) => Array.from(
  { length: 203 },
  (_, column) => Number(evaluate(weights, source, column) === source[(hiddenRow + 8) * 203 + column])
).reduce((sum, match) => sum + match, 0));
const matches = byRow.reduce((sum, n) => sum + n, 0);
const secret = Array.from({ length: 203 }, (_, column) => evaluate(secretWeights, source, column));

assert.deepEqual(byRow, [6, 8, 9, 4, 7, 9, 8, 6]);
assert.equal(matches, 57);
assert.equal(secret.length, 203);
assert.ok(Math.abs(coincidence(source) - 0.03449186137715603) < 1e-12);
assert.ok(Math.abs(coincidence(secret) - 0.0328244647124811) < 1e-12);

// Genuine solved-source native GP symbols embedded in a degree-7 polynomial
// in the same GF(29) field, with deterministic other coefficients.
const clearP57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(clearP57.length, 95);
const expected = Array.from({ length: 203 }, (_, i) => clearP57[i % clearP57.length]);
const planted = Array(16 * 203).fill(0);
for (let column = 0; column < 203; column += 1) {
  const coefficients = [expected[column], ...Array.from(
    { length: 7 }, (_, index) => (17 + column * 13 + index * 7) % 29
  )];
  for (let row = 0; row < 16; row += 1) {
    planted[row * 203 + column] = mod(coefficients.reduce(
      (sum, coefficient, exponent) => sum + coefficient * power(row + 1, exponent), 0
    ));
  }
}
const restored = Array.from({ length: 203 }, (_, i) => evaluate(secretWeights, planted, i));
assert.deepEqual(restored, expected);
const positivePredictions = heldWeights.reduce((sum, weights, hiddenRow) => sum +
  Array.from({ length: 203 }, (_, column) => Number(
    evaluate(weights, planted, column) === planted[(hiddenRow + 8) * 203 + column]
  )).reduce((subtotal, matched) => subtotal + matched, 0), 0);
assert.equal(positivePredictions, 1624);
assert.notEqual(planted[0], 0);

console.log(JSON.stringify({
  sourceRunes: source.length,
  sourceRedRemoved: redCount,
  interpolation: 'GF29, rows x=1..16, polynomial degree <=7, first eight shares determine last eight',
  originalPredictionsCorrect: matches,
  originalPredictionsTotal: 1624,
  originalPredictionsByRow: byRow,
  originalSecretIoC: coincidence(secret),
  originalSecretFirst80: secret.slice(0, 80).map((x) => corpus.translit[x]).join(' '),
  nativePlantPredictionsCorrect: positivePredictions,
  nativePlantSecretRestored: restored.every((x, i) => x === expected[i])
}, null, 2));
console.log('PASS: original 57/1624, genuine native 1624/1624; source-fixed scheme rejected.');
