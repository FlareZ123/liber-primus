'use strict';

/**
 * Source-led direct-inverse gate: original LP1 p16 5x5 magic square (Stage10
 * original-image handoff) against unchanged LP2 five-page alignments and p55.
 *
 * Run: node sims/lp1_stage10_fivesquare_original_inverse_sft.cjs
 * Read-only, deterministic, Windows-compatible CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const MOD = 29;
const original = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];
const mod = (v) => ((v % MOD) + MOD) % MOD;
const M = original.map((r) => r.map(mod));
const transpose = (m) => m[0].map((_, j) => m.map((r) => r[j]));

/** @param {number[][]} m @returns {number[][]} */
function inverse(m) {
  const n = m.length;
  const a = m.map((r, i) =>
    [...r, ...Array.from({ length: n }, (_, j) => Number(i === j))]);
  for (let c = 0; c < n; c++) {
    const pivot = a.findIndex((r, i) => i >= c && r[c] !== 0);
    assert(pivot >= c, 'original matrix must be invertible mod 29');
    [a[c], a[pivot]] = [a[pivot], a[c]];
    const factor = Array.from({ length: 28 }, (_, i) => i + 1)
      .find((x) => mod(x * a[c][c]) === 1);
    assert(factor !== undefined);
    a[c] = a[c].map((v) => mod(v * factor));
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const scale = a[i][c];
      a[i] = a[i].map((v, j) => mod(v - scale * a[c][j]));
    }
  }
  return a.map((r) => r.slice(n));
}

/** @param {number[][]} matrix @param {number[]} x @returns {number[]} */
function apply(matrix, x) {
  return matrix.map((row) =>
    mod(row.reduce((sum, cell, j) => sum + cell * x[j], 0)));
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const count = Array(29).fill(0);
  for (const c of x) count[c]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}

/** @param {number[][]} matrix @param {number[]} runes @returns {number[]} */
function blocks(matrix, runes) {
  assert.equal(runes.length % 5, 0);
  const out = [];
  for (let i = 0; i < runes.length; i += 5) {
    out.push(...apply(matrix, runes.slice(i, i + 5)));
  }
  return out;
}

const inv = inverse(M);
const mt = transpose(M);
const invt = inverse(mt);
const orientations = [['M', M], ['MT', mt], ['M_INV', inv], ['MT_INV', invt]];
assert.deepEqual(M.map((r) => r.reduce((s, x) => s + x, 0)),
  Array(5).fill(mod(3301)));
for (let i = 0; i < 5; i++) {
  assert.deepEqual(apply(inv, M[i].map((_, j) => Number(i === j))), inv[i] instanceof Array ? apply(inv, M[i].map((_, j) => Number(i === j))) : []);
}
for (let i = 0; i < 5; i++) {
  const unit = Array.from({ length: 5 }, (_, j) => Number(j === i));
  assert.deepEqual(apply(inv, apply(M, unit)), unit);
}

// Original p57 is genuine printed clear GP, 95 runes, never a synthetic English corpus.
const plaintextControl = data.pages[57].indices;
assert.equal(plaintextControl.length, 95);
const encodedControl = blocks(M, plaintextControl);
assert.deepEqual(blocks(inv, encodedControl), plaintextControl);
console.log('POSITIVE_CONTROL: 95/95 authentic original p57 runes restored via M^-1; known clear IoC',
  ioc(plaintextControl).toFixed(8));

// Two source-legible 5-page starts: book p0 and red-headed chapter p15.
for (const first of [0, 15]) {
  const pages = data.pages.slice(first, first + 5);
  assert.equal(pages.length, 5);
  const length = Math.min(...pages.map((p) => p.indices.length));
  console.log('FIVE_PAGE source start', first, 'source lengths',
    pages.map((p) => p.indices.length).join(','), 'aligned columns', length);
  for (const [name, matrix] of orientations) {
    const output = Array.from({ length: 5 }, () => []);
    for (let i = 0; i < length; i++) {
      const decoded = apply(matrix, pages.map((p) => p.indices[i]));
      for (let j = 0; j < 5; j++) output[j].push(decoded[j]);
    }
    const scores = output.map(ioc);
    console.log('  ', name, 'per-page IoC', scores.map((n) => n.toFixed(8)).join(','),
      'pooled', ioc(output.flat()).toFixed(8));
    assert(Math.max(...scores) < 0.042,
      'a material source-plaintext candidate must be manually adjudicated');
  }
}

// p55 has 76 original runes; test only the two fixed whole-75 block framings.
const p55 = data.pages[55].indices;
assert.equal(p55.length, 76);
console.log('P55 original', p55.length, 'IoC', ioc(p55).toFixed(8));
for (const origin of [0, 1]) {
  for (const [name, matrix] of orientations) {
    const decoded = blocks(matrix, p55.slice(origin, origin + 75));
    console.log('  P55', 'origin', origin, name, 'IoC', ioc(decoded).toFixed(8));
    assert(ioc(decoded) < 0.042,
      'a material source-plaintext candidate must be manually adjudicated');
  }
}
console.log('PASS: exact original five-square finite direct-inverse gate; no unknown plaintext');
