/** Exact original 16x16 GF29 Hill decoder from printed 32x8 LP2 table.
 * Applies to p40..p53 original 3008 runes = 188 full 16-rune blocks.
 * The 16x16 matrix is formed by row-major regrouping of unchanged 256 bytes.
 * This is a bounded hypothesis, not an original author instruction.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'));
const corpus = read('lp2-corpus.json'), grid = read('base60-grid.json');
/** @param {number} x */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} n */
function reciprocal(n) {
  for (let j = 1; j < 29; j++) if (mod(n * j) === 1) return j;
  throw Error('No reciprocal');
}
/** @param {number[][]} M */
function invert(M) {
  const n = M.length, a = M.map((row, i) => [
    ...row, ...Array.from({ length: n }, (_, j) => Number(i === j))
  ]);
  for (let k = 0; k < n; k++) {
    let pivot = k; while (pivot < n && a[pivot][k] === 0) pivot++;
    assert.ok(pivot < n, 'Original matrix must be full rank');
    [a[k], a[pivot]] = [a[pivot], a[k]];
    const inv = reciprocal(a[k][k]);
    for (let j = 0; j < 2 * n; j++) a[k][j] = mod(a[k][j] * inv);
    for (let i = 0; i < n; i++) if (i !== k) {
      const coeff = a[i][k];
      for (let j = 0; j < 2 * n; j++) a[i][j] = mod(a[i][j] - coeff * a[k][j]);
    }
  }
  return a.map(row => row.slice(n));
}
/** @param {number[][]} M @param {number[]} x */
function multiply(M, x) {
  return M.map(row => mod(row.reduce((sum, a, i) => sum + a * x[i], 0)));
}
/** @param {number[]} stream @param {number[][]} M */
function transform(stream, M) {
  assert.equal(stream.length % M.length, 0);
  /** @type {number[]} */
  const out = [];
  for (let i = 0; i < stream.length; i += M.length) out.push(...multiply(M, stream.slice(i, i + M.length)));
  return out;
}
/** @param {number[]} s */
function coincidence(s) {
  const counts = Array(29).fill(0);
  s.forEach(r => counts[r]++);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (s.length * (s.length - 1));
}
const cells = grid.byte_rows.flat();
assert.equal(cells.length, 256);
const M = Array.from({ length: 16 }, (_, row) => cells.slice(row * 16, (row + 1) * 16).map(mod));
const inverse = invert(M);
const ciphertext = corpus.pages.filter(p => p.page >= 40 && p.page <= 53).flatMap(p => p.indices);
assert.equal(ciphertext.length, 3008);
assert.equal(ciphertext.length / 16, 188);
const decoded = transform(ciphertext, inverse);
assert.deepEqual(transform(decoded, M), ciphertext);
const solved = corpus.pages.find(p => p.page === 57).indices;
const plant = Array.from({ length: 3008 }, (_, i) => solved[i % solved.length]);
assert.deepEqual(transform(transform(plant, M), inverse), plant);
const originalIoC = coincidence(ciphertext), decodedIoC = coincidence(decoded);
assert.ok(Math.abs(originalIoC - 0.0345426274862201) < 1e-12);
assert.ok(Math.abs(decodedIoC - 0.03442831089160753) < 1e-12);
console.log(JSON.stringify({
  matrix: 'original 256 base60 bytes regrouped 16x16 and reduced mod29',
  rank: 16,
  originalRuneCount: 3008,
  sourceBlockCount: 188,
  originalIoC, decodedIoC,
  positivePlantRecovered: '3008/3008',
  originalReencryption: '3008/3008',
  decodedFirst90: decoded.slice(0, 90).map(i => corpus.translit[i]).join('-'),
  status: 'PASS: direct original GP-English gate negative; no unknown plaintext'
}, null, 2));
