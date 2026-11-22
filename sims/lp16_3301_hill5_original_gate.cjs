#!/usr/bin/env node
'use strict';

// Source-locked test of the LP1 image-16 (3301) 5x5 numerical square as a
// Hill-cipher key over Gematria Primus GF(29). No fitted key, alphabet
// permutation, phase, padding, or ciphertext-selected reset is used.
//
// Run from any directory: node sims/lp16_3301_hill5_original_gate.cjs

const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const mod = (x, p = 29) => ((x % p) + p) % p;
const powMod = (a, n, p = 29) => {
  let x = mod(a, p), y = 1;
  while (n > 0) {
    if (n & 1) y = mod(y * x, p);
    x = mod(x * x, p);
    n = Math.floor(n / 2);
  }
  return y;
};
const transpose = a => a[0].map((_, j) => a.map(row => row[j]));
const multiply = (a, b) => a.map(row =>
  b[0].map((_, j) => mod(row.reduce((s, v, k) => s + v * b[k][j], 0)))
);
const determinant = input => {
  const a = input.map(row => row.slice());
  let det = 1;
  for (let c = 0; c < a.length; c++) {
    let pivot = c;
    while (pivot < a.length && mod(a[pivot][c]) === 0) pivot++;
    if (pivot === a.length) return 0;
    if (pivot !== c) { [a[pivot], a[c]] = [a[c], a[pivot]]; det = mod(-det); }
    const pv = mod(a[c][c]);
    det = mod(det * pv);
    const invPv = powMod(pv, 27);
    for (let r = c + 1; r < a.length; r++) {
      const f = mod(a[r][c] * invPv);
      for (let j = c; j < a.length; j++) a[r][j] = mod(a[r][j] - f * a[c][j]);
    }
  }
  return det;
};
const inverse = input => {
  const n = input.length;
  const a = input.map((row, i) => row.map(x => mod(x))
    .concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  for (let c = 0; c < n; c++) {
    let pivot = c;
    while (pivot < n && a[pivot][c] === 0) pivot++;
    if (pivot === n) throw new Error('singular matrix over GF(29)');
    [a[pivot], a[c]] = [a[c], a[pivot]];
    const invPivot = powMod(a[c][c], 27);
    for (let j = 0; j < 2 * n; j++) a[c][j] = mod(a[c][j] * invPivot);
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = a[r][c];
      for (let j = 0; j < 2 * n; j++) a[r][j] = mod(a[r][j] - f * a[c][j]);
    }
  }
  return a.map(row => row.slice(n));
};
const applyBlock = (a, v) => a.map(row =>
  mod(row.reduce((s, x, j) => s + x * v[j], 0))
);
const applyStream = (input, a) => {
  const out = input.slice();
  for (let i = 0; i + 5 <= input.length; i += 5) {
    const block = applyBlock(a, input.slice(i, i + 5));
    for (let j = 0; j < 5; j++) out[i + j] = block[j];
  }
  // The source gives no padding rule. Any final incomplete block is left
  // unchanged; this is reported rather than silently padded.
  return out;
};
const applyPages = (pages, a) => pages.flatMap(p => applyStream(p.indices, a));
const counts = a => {
  const c = Array(29).fill(0);
  for (const x of a) c[x]++;
  return c;
};
const ioc = a => {
  const c = counts(a);
  return c.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const top12 = a => counts(a).sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0) / a.length;
const render = a => a.map(x => corpus.translit[x]).join(' ');
const unknownPages = corpus.pages.filter(p => p.page <= 55);
const unknown = unknownPages.flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;

// Exact row-major values printed in the 5x5 square on LP1 image 16.
// The printed row/column/diagonal sum is 3301.
const printed = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];
const M = printed.map(row => row.map(x => mod(x)));
const Minv = inverse(M);
const variants = [
  ['M', M],
  ['M^T', transpose(M)],
  ['M^-1', Minv],
  ['(M^-1)^T', transpose(Minv)]
];
const results = [];
for (const clock of ['page-reset', 'book-continuous']) {
  for (const [name, key] of variants) {
    const out = clock === 'page-reset'
      ? applyPages(unknownPages, key)
      : applyStream(unknown, key);
    const p55 = clock === 'page-reset'
      ? applyStream(unknownPages.find(p => p.page === 55).indices, key)
      : out.slice(unknown.length - 76);
    // A synthetic source-native control checks implementation and convention:
    // encode the known 95-rune p57 text with key^-1, then decode with key.
    const recovered = applyStream(p57, inverse(key));
    const roundTrip = applyStream(recovered, key);
    results.push({
      clock, operation: name,
      ioc: ioc(out), top12: top12(out),
      prefix120: render(out.slice(0, 120)),
      p55: render(p55),
      p57PlantRecoveredExactly: recovered.every((v, i) => v === p57[i]),
      p57PlantForwardExactly: roundTrip.every((v, i) => v === p57[i])
    });
  }
}
const baseline = {
  ioc: ioc(unknown), top12: top12(unknown),
  prefix120: render(unknown.slice(0, 120))
};
const p57Control = { length: p57.length, ioc: ioc(p57), top12: top12(p57), text: render(p57) };
const output = {
  hypothesis: 'LP1 image-16 3301 square is a 5x5 Hill key over GP29 for unknown LP2',
  scope: 'original LP2 physical pages 0-55, including the runeless page 50',
  unknownPageCount: unknownPages.length,
  runeBearingPageCount: unknownPages.filter(p => p.indices.length).length,
  unknownRuneCount: unknown.length,
  printedSquare: printed,
  printedRowSums: printed.map(row => row.reduce((s, x) => s + x, 0)),
  matrixMod29: M,
  determinantMod29: determinant(M),
  inverseMod29: Minv,
  baseline,
  solvedP57PositiveControl: p57Control,
  results
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
