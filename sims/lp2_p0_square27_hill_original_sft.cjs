'use strict';

/**
 * Original-source finite receiver: the uniquely square-sized p0–p2 rune block
 * as a 27×27 Hill cipher matrix over GF(29), tested on untouched p3–p19.
 * Windows 11 / Node.js 22, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const N = 27;
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
function reciprocal(x) {
  for (let k = 1; k < Q; k += 1) if (x * k % Q === 1) return k;
  throw Error('The 27×27 matrix is singular modulo 29');
}
const matrix = source.pages.slice(0, 3).flatMap((p) => p.indices);
assert.equal(matrix.length, N * N);
assert.equal(source.pages[0].indices.length, 262);
assert.equal(source.pages[1].indices.length, 266);
assert.equal(source.pages[2].indices.length, 201);

/**
 * Perform Gaussian elimination over GF29, return the exact inverse and det.
 * @param {number[][]} square
 * @returns {{inverse: number[][], determinant: number}}
 */
function invert(square) {
  const rows = square.map((a, i) => [
    ...a, ...Array.from({length: N}, (_, j) => Number(i === j))
  ]);
  let determinant = 1;
  for (let i = 0; i < N; i += 1) {
    let pivot = i;
    while (pivot < N && rows[pivot][i] === 0) pivot += 1;
    assert(pivot < N, 'source-derived matrix must be invertible');
    if (pivot !== i) {
      [rows[i], rows[pivot]] = [rows[pivot], rows[i]];
      determinant = mod(-determinant);
    }
    const factor = rows[i][i];
    determinant = mod(determinant * factor);
    const factorInverse = reciprocal(factor);
    for (let j = 0; j < 2 * N; j += 1) {
      rows[i][j] = mod(rows[i][j] * factorInverse);
    }
    for (let r = 0; r < N; r += 1) if (r !== i) {
      const multiple = rows[r][i];
      for (let j = 0; j < 2 * N; j += 1) {
        rows[r][j] = mod(rows[r][j] - multiple * rows[i][j]);
      }
    }
  }
  return {inverse: rows.map((r) => r.slice(N)), determinant};
}
const key = Array.from({length: N}, (_, i) => matrix.slice(i * N, (i + 1) * N));
const {inverse, determinant} = invert(key);
assert.equal(determinant, 17);

/**
 * Multiply a 27-rune vector by the proposed source square or its inverse,
 * using one of the standard row- or column-vector Hill conventions.
 * @param {number[]} symbols
 * @param {number[][]} table
 * @param {boolean} columnVector
 * @returns {number[]}
 */
function run(symbols, table, columnVector) {
  assert.equal(symbols.length % N, 0);
  const result = [];
  for (let start = 0; start < symbols.length; start += N) {
    const block = symbols.slice(start, start + N);
    for (let i = 0; i < N; i += 1) {
      let sum = 0;
      for (let j = 0; j < N; j += 1) {
        sum += columnVector ? table[i][j] * block[j] : block[j] * table[j][i];
      }
      result.push(mod(sum));
    }
  }
  return result;
}
const clearP57 = source.pages[57].indices;
assert.equal(clearP57.length, 95);
const positive = [...clearP57, ...Array.from({length: 13}, () => 0)];
assert.equal(positive.length, 108);
for (const asColumn of [true, false]) {
  const encrypted = run(positive, key, asColumn);
  const decrypted = run(encrypted, inverse, asColumn);
  assert.deepEqual(decrypted, positive);
}
const cipher = source.pages.slice(3, 20).flatMap((p) => p.indices);
const input = cipher.slice(0, Math.floor(cipher.length / N) * N);
assert.equal(input.length, 4104);
function ioc(inputSymbols) {
  const counts = Array.from({length: Q}, () => 0);
  for (const i of inputSymbols) counts[i] += 1;
  return counts.reduce((sum, k) => sum + k * (k - 1), 0)
    / (inputSymbols.length * (inputSymbols.length - 1));
}
const observed = [];
for (const [operation, table] of [['inverse', inverse], ['forward', key]]) {
  for (const [vector, asColumn] of [['column', true], ['row', false]]) {
    const recovered = run(input, table, asColumn);
    const reverse = run(recovered, operation === 'inverse' ? key : inverse, asColumn);
    assert.deepEqual(reverse, input);
    observed.push({
      operation, vector,
      ioc: ioc(recovered),
      runePrefix: recovered.slice(0, 45).map((i) => source.translit[i]).join(' ')
    });
  }
}
assert(Math.abs(observed[0].ioc - 0.03446522513123332) < 1e-12);
assert(Math.abs(observed[1].ioc - 0.03448351631644986) < 1e-12);
assert(Math.abs(observed[2].ioc - 0.03454717914291782) < 1e-12);
assert(Math.abs(observed[3].ioc - 0.034420209811771824) < 1e-12);
console.log(JSON.stringify({
  sourceMatrix: 'original p0–p2 729=27² GP29 runes',
  matrixDeterminantGF29: determinant,
  testedSource: 'original p3–p19 first 4,104 runes',
  positive: 'original solved p57 padded to 108, both Hill orientations roundtrip',
  expectedEnglishOrLatinIoc: 'substantially greater than 1/29=0.0344827586',
  results: observed,
  conclusion: 'No raw Latin or GP-native plaintext from four unfitted direct Hill conventions'
}, null, 2));
