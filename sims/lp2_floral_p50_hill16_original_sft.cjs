'use strict';
/**
 * Frozen original source-prompted floral GP29 Hill-16 gate.
 * SFT: node sims/lp2_floral_p50_hill16_original_sft.cjs
 * Node 22 / CommonJS / no external packages. No original plaintext claimed.
 *
 * Candidate: 256 authentic radix60-byte values on pp49-51 form one 16x16
 * GF29 key after adjacent pairs of original printed 8-cell rows are joined.
 * Original flower section pp40-55 after removing only its source-red spans
 * is exactly 3248=203*16 black GP29 runes.
 *
 * Test predeclared placement: 203 consecutive 16-symbol blocks or the
 * orthogonal 16x203 matrix, and both key and inverse directions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {any} */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const annotations = json('resources/liber-primus/lp2-ink-annotations.json');
const sourceGrid = json('resources/liber-primus/lp2-grid-256.json');
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function reciprocal(x) {
  const i = Array.from({ length: 28 }, (_, j) => j + 1)
    .find(j => mod(x * j) === 1);
  assert.notEqual(i, undefined);
  return i;
}
const N = 16;
const bytes = sourceGrid.bytes;
assert.equal(sourceGrid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(bytes.length, 256);
const M = Array.from({ length: N }, (_, i) =>
  bytes.slice(i * N, (i + 1) * N).map(mod));
const tagged = M.map((a, i) =>
  a.concat(Array.from({ length: N }, (_, j) => i === j ? 1 : 0)));
let rank = 0;
let determinant = 1;
for (let col = 0; col < N; col++) {
  const pivot = Array.from({ length: N - rank }, (_, k) => rank + k)
    .find(row => tagged[row][col] !== 0);
  if (pivot === undefined) continue;
  if (rank !== pivot) {
    [tagged[rank], tagged[pivot]] = [tagged[pivot], tagged[rank]];
    determinant = mod(-determinant);
  }
  const scale = tagged[rank][col];
  determinant = mod(determinant * scale);
  const unit = reciprocal(scale);
  tagged[rank] = tagged[rank].map(x => mod(x * unit));
  for (let row = 0; row < N; row++) if (row !== rank) {
    const k = tagged[row][col];
    tagged[row] = tagged[row].map((v, j) => mod(v - k * tagged[rank][j]));
  }
  rank++;
}
assert.equal(rank, 16);
const inverse = tagged.map(r => r.slice(N));
/**
 * @param {number[][]} A @param {number[]} x @returns {number[]}
 */
function product(A, x) {
  assert.equal(x.length, N);
  return A.map(row =>
    mod(row.reduce((s, v, j) => s + v * x[j], 0)));
}
for (let j = 0; j < N; j++) {
  const e = Array.from({ length: N }, (_, k) => k === j ? 1 : 0);
  assert.deepEqual(product(inverse, product(M, e)), e);
  assert.deepEqual(product(M, product(inverse, e)), e);
}
const redByPage = new Map(annotations.pages.map(p =>
  [p.page, p.red_spans || []]));
const tape = [];
const sourceCounts = [];
let redTotal = 0;
for (let p = 40; p <= 55; p++) {
  const red = new Set();
  for (const span of redByPage.get(p) || []) for (let j = 0; j < span.length; j++)
    red.add(span.start + j);
  const original = corpus.pages[p].indices;
  original.forEach((v, j) => { if (!red.has(j)) tape.push(v); });
  sourceCounts.push({ page: p, runes: original.length, removedRed: red.size });
  redTotal += red.size;
}
assert.deepEqual(sourceCounts.map(v => v.runes),
  [231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, 232, 76]);
assert.equal(redTotal, 68);
assert.equal(tape.length, N * 203);
assert.deepEqual(sourceCounts.filter(p => p.removedRed > 0)
  .map(p => [p.page, p.removedRed]), [[40, 8], [53, 51], [54, 9]]);
/**
 * Apply matrix to a 3248-source-tape register without changing its length.
 * @param {number[]} data @param {number[][]} matrix
 * @param {'blocks16'|'row16x203'} layout @returns {number[]}
 */
function transform(data, matrix, layout) {
  assert.equal(data.length, 3248);
  const out = Array(3248).fill(0);
  if (layout === 'blocks16') {
    for (let k = 0; k < 203; k++) {
      const next = product(matrix, data.slice(k * N, (k + 1) * N));
      for (let i = 0; i < N; i++) out[k * N + i] = next[i];
    }
  } else {
    assert.equal(layout, 'row16x203');
    for (let k = 0; k < 203; k++) {
      const input = Array.from({ length: N }, (_, i) => data[i * 203 + k]);
      const next = product(matrix, input);
      for (let i = 0; i < N; i++) out[i * 203 + k] = next[i];
    }
  }
  return out;
}
/** @param {number[]} values @returns {{ioc:number,adjacentEquals:number}} */
function stats(values) {
  const histogram = Array(29).fill(0);
  values.forEach(i => histogram[i]++);
  return {
    ioc: histogram.reduce((s, n) => s + n * (n - 1), 0) /
      (values.length * (values.length - 1)),
    adjacentEquals: values.slice(1).filter((v, i) => v === values[i]).length
  };
}
const solved = corpus.pages[57].indices;
assert(solved.length >= 90);
const planted = Array.from({ length: 3248 },
  (_, i) => solved[i % solved.length]);
const results = [];
let controlPasses = 0;
for (const layout of ['blocks16', 'row16x203']) {
  const encoded = transform(planted, M, layout);
  const decoded = transform(encoded, inverse, layout);
  assert.deepEqual(decoded, planted);
  controlPasses += decoded.length;
  for (const [direction, matrix] of [['matrix', M], ['inverse', inverse]]) {
    const raw = transform(tape, matrix, layout);
    assert.deepEqual(transform(raw,
      direction === 'matrix' ? inverse : M, layout), tape);
    results.push({
      layout, direction, ...stats(raw),
      openingGP29: raw.slice(0, 25),
      openingTranslit: raw.slice(0, 25).map(i => corpus.translit[i]).join(' ')
    });
  }
}
assert.equal(controlPasses, 6496);
const sourceIoC = stats(tape);
assert(results.every(r => r.ioc < 0.04));
console.log(JSON.stringify({
  passed: true,
  classification: 'source-shaped Hill16 direct GP29 inverse excluded; no unknown LP2 plaintext',
  matrix: { rows: 16, cols: 16, GF29rank: rank, determinantMod29: determinant },
  originalRegister: { length: tape.length, redTotal, ...sourceIoC },
  sourceCounts,
  plantedNativeGPRuneControls: controlPasses,
  results
}, null, 2));
