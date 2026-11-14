'use strict';
/**
 * LP2 physical p53 red 51-rune critical polynomial -> 7x7 GF(29) Hill-key
 * candidate on the immediately following p54-p55 308-rune visual chapter.
 *
 * This is a bounded original-cipher inverse, not a claimed decryption.
 * Original source image p53 = 70.jpg; p54 = 71.jpg; p55 = 72.jpg.
 * Reproduce on Windows 11 using Node.js 22 (built-ins only).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const page = number => corpus.pages.find(p => p.page === number).indices;
const mod = n => ((n % 29) + 29) % 29;
const red = ink.pages.find(p => p.page === 53).red_spans.find(s =>
  s.start === 128 && s.length === 51);
assert(red, 'Expected original p53 51-rune red passage');
const coefficients = [...red.runes].map(r => corpus.runes.indexOf(r));
assert(coefficients.every(r => r >= 0));
assert.deepEqual(coefficients, page(53).slice(128, 179));
assert.equal(coefficients.length, 51);
assert.equal(coefficients.reduce((sum, r) => sum + corpus.prime[r], 0), 2262);

/**
 * Value and first derivative of a high-first polynomial at a field point.
 * @param {number[]} values
 * @param {number} x
 * @returns {{value:number, derivative:number}}
 */
function evaluate(values, x) {
  let value = 0, derivative = 0;
  for (const term of values) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + term);
  }
  return {value, derivative};
}

/**
 * Synthetic division by (X - x) in GF29.
 * @param {number[]} values
 * @param {number} x
 * @returns {{quotient:number[],remainder:number}}
 */
function divide(values, x) {
  const work = [values[0]];
  for (let i = 1; i < values.length; i++)
    work.push(mod(values[i] + x * work[i - 1]));
  const remainder = work.pop();
  return {quotient:work, remainder};
}

/** @param {number[][]} values @returns {number[][]} */
const transpose = values => values[0].map((_, j) => values.map(row => row[j]));

/**
 * Exact GF29 Gauss-Jordan matrix inversion with determinant.
 * @param {number[][]} matrix
 * @returns {{determinant:number,inverse:number[][]}}
 */
function inverse(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) =>
    [...row, ...Array.from({length:n}, (_, j) => Number(i === j))]);
  let determinant = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && augmented[pivot][i] === 0) pivot++;
    assert(pivot < n, '7x7 matrix must be invertible for this hypothesis');
    if (pivot !== i) {
      [augmented[pivot], augmented[i]] = [augmented[i], augmented[pivot]];
      determinant = mod(-determinant);
    }
    const scalar = augmented[i][i];
    determinant = mod(determinant * scalar);
    const reciprocal = Array.from({length:28}, (_, j) => j + 1)
      .find(v => mod(v * scalar) === 1);
    assert(reciprocal);
    augmented[i] = augmented[i].map(v => mod(v * reciprocal));
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = augmented[k][i];
      augmented[k] = augmented[k].map((v, j) =>
        mod(v - factor * augmented[i][j]));
    }
  }
  return {determinant,
    inverse: augmented.map(row => row.slice(n))};
}

/**
 * 7-rune row-vector block input, 7x7 matrix multiplication modulo 29.
 * @param {number[][]} matrix
 * @param {number[]} stream
 * @returns {number[]}
 */
function apply(matrix, stream) {
  assert.equal(matrix.length, 7);
  assert.equal(stream.length % 7, 0);
  const out = [];
  for (let start = 0; start < stream.length; start += 7)
    for (const row of matrix)
      out.push(mod(row.reduce((sum, value, j) =>
        sum + value * stream[start + j], 0)));
  return out;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const point = evaluate(coefficients, 24);
assert.deepEqual(point, {value:28, derivative:0});
const normalized = coefficients.slice();
normalized[normalized.length - 1] = mod(normalized.at(-1) - point.value);
const first = divide(normalized, 24);
const second = divide(first.quotient, 24);
assert.equal(first.remainder, 0);
assert.equal(second.remainder, 0);
assert.equal(second.quotient.length, 49);
const matrix = Array.from({length:7}, (_, i) =>
  second.quotient.slice(i * 7, i * 7 + 7));
const matrixInverse = inverse(matrix);
assert.equal(matrixInverse.determinant, 17);
const matrixTranspose = transpose(matrix);
const transposeInverse = inverse(matrixTranspose);
assert.equal(transposeInverse.determinant, 17);

const original = [...page(54), ...page(55)];
assert.equal(page(54).length, 232);
assert.equal(page(55).length, 76);
assert.equal(original.length, 308);
assert.equal(original.length % 7, 0);
const knownPlant = Array.from({length:308},
  (_, i) => page(57)[i % page(57).length]);
assert.equal(page(57).length, 95);
const candidates = [
  ['M', matrix, matrixInverse.inverse],
  ['inverse(M)', matrixInverse.inverse, matrix],
  ['transpose(M)', matrixTranspose, transposeInverse.inverse],
  ['inverse(transpose(M))', transposeInverse.inverse, matrixTranspose]
];
const results = [];
for (const [name, decoder, encoder] of candidates) {
  const decoded = apply(decoder, original);
  assert.deepEqual(apply(encoder, decoded), original);
  assert.deepEqual(apply(decoder, apply(encoder, knownPlant)), knownPlant);
  results.push({
    name, decodedLength:decoded.length, ioc:ioc(decoded),
    prefix: decoded.slice(0, 80).map(value => corpus.translit[value]).join('')
  });
}
assert(results.every(row => row.ioc > 0.030 && row.ioc < 0.040));
console.log(JSON.stringify({
  originalSource:'LP2 p53 original red51; p54 and p55 source 308 runes',
  redAt24:point,
  normalizedConstantAdjustment:mod(-point.value),
  rootMultiplicityAtLeast:2,
  quotientLength:49,
  keyShape:[7,7],
  key:matrix,
  determinant:matrixInverse.determinant,
  originalChapterLength:original.length,
  blocks:original.length / 7,
  unchangedIoc:ioc(original),
  solvedP57Ioc:ioc(page(57)),
  sourceFixedModels:results,
  verdict:'No native-GP plaintext recovered by these four fixed Hill7 readings'
}, null, 2));
