'use strict';

/**
 * Original-source SFT: test the authentic May 2014 5x5 and 7x7
 * Stage10 OpenPuff matrices against the complete 5-page scroll (1145)
 * and 7-page tree (1729) LP2 chapter ciphertexts.
 *
 * Run: node sims/lp2_primechapter_stage10_magic_original_sft.cjs
 * Node.js 22/CommonJS, read-only, no dependencies beyond built-ins.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const matrices = source.trim().split(/\r?\n\s*\r?\n/).map((section) =>
  section.trim().split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).map(Number)
  )
);
assert.deepEqual(matrices.map((m) => m.length), [5, 7, 5]);
assert.equal(matrices[0][0].reduce((s, x) => s + x, 0), 3301);
assert.equal(matrices[1][0].reduce((s, x) => s + x, 0), 1033);

const mod = (v) => (v % 29 + 29) % 29;

/** @param {number[][]} matrix */
function invert(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => [
    ...row.map(mod),
    ...Array.from({length: n}, (_, j) => Number(i === j))
  ]);
  for (let i = 0; i < n; i++) {
    const pivot = a.findIndex((row, j) => j >= i && row[i] !== 0);
    assert(pivot >= 0, 'Authentic square must be invertible modulo 29');
    [a[i], a[pivot]] = [a[pivot], a[i]];
    const inverse = Array.from({length: 29}, (_, j) => j).find((j) => mod(j * a[i][i]) === 1);
    assert(inverse !== undefined);
    a[i] = a[i].map((x) => mod(x * inverse));
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const factor = a[j][i];
      a[j] = a[j].map((x, k) => mod(x - factor * a[i][k]));
    }
  }
  return a.map((row) => row.slice(n));
}

/** @param {number[][]} a */
const transpose = (a) => a[0].map((_, j) => a.map((row) => row[j]));

/**
 * Matrix acts over contiguous n-rune packets or equally sized
 * uninterrupted strips; both preserve all original rune positions.
 *
 * @param {number[]} input
 * @param {number[][]} matrix
 * @param {'packets'|'strips'} geometry
 */
function apply(input, matrix, geometry) {
  const n = matrix.length;
  assert.equal(input.length % n, 0);
  const width = input.length / n;
  const output = Array(input.length);
  for (let i = 0; i < width; i++) {
    const get = (j) => input[geometry === 'packets' ? i * n + j : i + j * width];
    for (let row = 0; row < n; row++) {
      let v = 0;
      for (let j = 0; j < n; j++) v += matrix[row][j] * get(j);
      output[geometry === 'packets' ? i * n + row : i + row * width] = mod(v);
    }
  }
  return output;
}

/** @param {number[]} x */
function ioc(x) {
  const freq = Array(29).fill(0);
  for (const value of x) freq[value]++;
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) / (x.length * (x.length - 1));
}

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
let completed = 0;
for (const {start, end, size, matrix, name} of [
  {start: 3, end: 7, size: 1145, matrix: matrices[0], name: 'scroll'},
  {start: 8, end: 14, size: 1729, matrix: matrices[1], name: 'tree'}
]) {
  const original = corpus.pages.slice(start, end + 1).flatMap((p) => p.indices);
  assert.equal(original.length, size);
  const aliases = [
    ['matrix', matrix],
    ['inverse', invert(matrix)],
    ['transpose', transpose(matrix)],
    ['inverse-transpose', transpose(invert(matrix))]
  ];
  for (const [label, decoder] of aliases) {
    const encoder = invert(decoder);
    for (const geometry of ['packets', 'strips']) {
      const decoded = apply(original, decoder, geometry);
      assert.deepEqual(apply(decoded, encoder, geometry), original, 'Original ciphertext replay');
      const native = Array.from({length: size}, (_, i) => solved[i % solved.length]);
      assert.deepEqual(apply(apply(native, encoder, geometry), decoder, geometry), native, 'Solved-native planted plaintext');
      const score = ioc(decoded);
      assert(score < 0.04, 'Unexpected original decoded IoC');
      const preview = decoded.slice(0, 32).map((i) => corpus.translit[i]).join(' ');
      console.log(name, label, geometry, 'length=' + size, 'IoC=' + score.toFixed(9), 'prefix=' + preview);
      completed++;
    }
  }
}
assert.equal(completed, 16);
console.log('PASS 16 full original-cipher reversals and 16 solved-native plants; no credible plaintext');
