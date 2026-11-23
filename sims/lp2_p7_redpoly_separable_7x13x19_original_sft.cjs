'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Source-fixed GP29 7 x 13 x 19 separable red-polynomial receiver.
 * Run from any current working directory with Node.js 22 or newer.
 * This test is read-only; it never guesses keys from target ciphertext.
 */

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function product(values) {
  return values.reduce((acc, value) => mod(acc * value), 1);
}

/**
 * @param {number} size
 * @param {number[]} coefficients
 * @returns {number[][]}
 */
function circulant(size, coefficients) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => coefficients[(col - row + size) % size] || 0));
}

/**
 * @param {number[][]} matrix
 * @returns {{ inverse: number[][], determinant: number }}
 */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [
    ...row.map(mod),
    ...Array.from({ length: n }, (_, j) => Number(i === j))
  ]);
  let determinant = 1;
  for (let p = 0; p < n; p++) {
    let swap = p;
    while (swap < n && a[swap][p] === 0) swap++;
    assert.ok(swap < n, 'source polynomial must be invertible on this axis');
    if (swap !== p) {
      [a[p], a[swap]] = [a[swap], a[p]];
      determinant = mod(-determinant);
    }
    determinant = mod(determinant * a[p][p]);
    let invPivot = 1;
    while (mod(invPivot * a[p][p]) !== 1) invPivot++;
    a[p] = a[p].map(value => mod(value * invPivot));
    for (let row = 0; row < n; row++) {
      if (row === p) continue;
      const multiplier = a[row][p];
      a[row] = a[row].map((value, col) => mod(value - multiplier * a[p][col]));
    }
  }
  const inverse = a.map(row => row.slice(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dot = matrix[i].reduce((sum, value, k) => sum + value * inverse[k][j], 0);
      assert.equal(mod(dot), Number(i === j));
    }
  }
  return { inverse, determinant };
}

/**
 * @param {number[]} source
 * @param {number[]} shape
 * @param {number} axis
 * @param {number[][]} matrix
 * @returns {number[]}
 */
function mix(source, shape, axis, matrix) {
  const axisSize = shape[axis];
  const stride = shape.slice(axis + 1).reduce((acc, n) => acc * n, 1);
  const period = axisSize * stride;
  assert.equal(source.length % period, 0);
  const result = source.slice();
  for (let block = 0; block < source.length; block += period) {
    for (let inner = 0; inner < stride; inner++) {
      const vector = Array.from(
        { length: axisSize }, (_, j) => source[block + j * stride + inner]);
      for (let row = 0; row < axisSize; row++) {
        result[block + row * stride + inner] = mod(
          matrix[row].reduce((sum, weight, col) => sum + weight * vector[col], 0));
      }
    }
  }
  return result;
}

/** @param {number[]} source @returns {number} */
function coincidence(source) {
  const count = Array(29).fill(0);
  for (const rune of source) {
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    count[rune]++;
  }
  return count.reduce((sum, frequency) => sum + frequency * (frequency - 1), 0)
    / (source.length * (source.length - 1));
}

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p7 = corpus.pages.find(page => page.page === 7);
const p57 = corpus.pages.find(page => page.page === 57);
const sourceWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.indices.slice(194, 208), sourceWords.flat());
const coefficients = sourceWords.map(product);
assert.deepEqual(coefficients, [11, 26, 8, 15, 2]);

const section = corpus.pages.filter(page => page.page >= 8 && page.page <= 14);
assert.deepEqual(section.map(page => page.runic_count), [255, 268, 263, 273, 261, 272, 137]);
const source = section.flatMap(page => page.indices);
const shape = [7, 13, 19];
assert.equal(source.length, shape.reduce((acc, v) => acc * v, 1));
assert.equal(source.length, 1729);

const matrices = shape.map(size => circulant(size, coefficients));
const inverses = matrices.map(invert);
assert.deepEqual(inverses.map(result => result.determinant), [20, 12, 26]);

/** @param {number[]} runes @returns {number[]} */
function decrypt(runes) {
  return shape.reduce(
    (working, _, axis) => mix(working, shape, axis, inverses[axis].inverse),
    runes.slice());
}

/** @param {number[]} runes @returns {number[]} */
function encrypt(runes) {
  return shape.reduce(
    (working, _, axis) => mix(working, shape, axis, matrices[axis]),
    runes.slice());
}

const decoded = decrypt(source);
assert.deepEqual(encrypt(decoded), source);
const known = Array.from({ length: source.length },
  (_, index) => p57.indices[index % p57.indices.length]);
assert.deepEqual(decrypt(encrypt(known)), known);

const report = {
  p7_products: coefficients,
  pages: section.map(page => ({ page: page.page, runes: page.runic_count })),
  shape,
  determinants: inverses.map(result => result.determinant),
  source_ioc: coincidence(source),
  decoded_ioc: coincidence(decoded),
  native_positive_ioc: coincidence(known),
  native_encrypted_ioc: coincidence(encrypt(known)),
  decoded_first_50: decoded.slice(0, 50).map(index => corpus.translit[index]).join(' '),
  original_runes_reproduced: source.length,
  native_positive_runes_recovered: known.length
};
console.log(JSON.stringify(report, null, 2));
console.log('PASS: source-native 7x13x19 inverse, exact original replay, solved positive.');
