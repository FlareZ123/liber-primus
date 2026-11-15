#!/usr/bin/env node
"use strict";
// Source-constrained test: use the LP1 p16 3301 square as a page-indexed
// GF(29) Hill key, with its exact order 56 aligned to the 56 LP2 pages.
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const mod = x => ((x % 29) + 29) % 29;
const squarePath = path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt");
const corpusPath = path.join(root, "resources", "liber-primus", "lp2-corpus.json");
const squareLines = fs.readFileSync(squarePath, "utf8").split(/\r?\n/).filter(x => /^\s*\d/.test(x));
const rawM = squareLines.slice(0, 5).map(line => line.trim().split(/\s+/).map(Number));
if (rawM.length !== 5 || rawM.some(row => row.length !== 5)) throw new Error("Could not parse the first 5x5 source square");
const rowSums = rawM.map(row => row.reduce((a, b) => a + b, 0));
const colSums = Array.from({length: 5}, (_, j) => rawM.reduce((a, row) => a + row[j], 0));
if (rowSums.some(x => x !== 3301) || colSums.some(x => x !== 3301)) throw new Error("Source square is not the 3301 magic square");
const M = rawM.map(row => row.map(mod));
const transpose = A => A[0].map((_, j) => A.map(row => row[j]));
const identity = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j)));
const mul = (A, B) => A.map(row => B[0].map((_, j) => mod(row.reduce((s, x, k) => s + x * B[k][j], 0))));
const equal = (A, B) => A.every((row, i) => row.every((x, j) => x === B[i][j]));
function powMod(a, e) { let r = 1; a = mod(a); while (e) { if (e & 1) r = mod(r * a); a = mod(a * a); e >>= 1; } return r; }
function detMod(A) {
  const B = A.map(row => row.slice()); let det = 1;
  for (let k = 0; k < B.length; k++) {
    let pivot = k; while (pivot < B.length && B[pivot][k] === 0) pivot++;
    if (pivot === B.length) return 0;
    if (pivot !== k) { [B[pivot], B[k]] = [B[k], B[pivot]]; det = mod(-det); }
    const p = B[k][k]; det = mod(det * p); const inv = powMod(p, 27);
    for (let i = k + 1; i < B.length; i++) {
      const f = mod(B[i][k] * inv);
      for (let j = k; j < B.length; j++) B[i][j] = mod(B[i][j] - f * B[k][j]);
    }
  }
  return det;
}
const I = identity(5);
let P = I, order = null;
for (let k = 1; k <= 1000; k++) { P = mul(P, M); if (equal(P, I)) { order = k; break; } }
if (order !== 56) throw new Error("Expected exact matrix order 56; got " + order);
function matPow(A, exponent) {
  let e = ((exponent % order) + order) % order, B = A.map(row => row.slice()), R = I;
  while (e) { if (e & 1) R = mul(R, B); B = mul(B, B); e >>= 1; }
  return R;
}
const mv = (A, v) => A.map(row => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
function ioc(a) {
  const n = a.length; if (n < 2) return 0;
  const counts = Array(29).fill(0); for (const x of a) counts[x]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page < 56);
if (pages.length !== 56) throw new Error("Expected 56 LP2 pages");
const runeTotal = pages.reduce((s, p) => s + p.indices.length, 0);
if (runeTotal !== 12956) throw new Error("Unexpected LP2 rune count " + runeTotal);
const anchor = pages.find(p => p.page === 50);
if (!anchor || anchor.indices.length !== 0) throw new Error("Page 50 is not the expected empty numeric-table page");
const results = [];
for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
  for (const sign of [-1, +1]) {
    const out = [], pageStats = [];
    for (const page of pages) {
      const originalLength = page.indices.length;
      if (originalLength === 0) { pageStats.push({page: page.page, n: 0, ioc: null}); continue; }
      const K = matPow(base, sign * (page.page - 50));
      const padded = page.indices.slice();
      while (padded.length % 5) padded.push(0); // F=0 page-local zero padding
      const transformed = [];
      for (let i = 0; i < padded.length; i += 5) transformed.push(...mv(K, padded.slice(i, i + 5)));
      transformed.length = originalLength;
      out.push(...transformed);
      pageStats.push({page: page.page, n: originalLength, ioc: ioc(transformed)});
    }
    results.push({
      orientation, exponent_sign: sign, pooled_ioc: ioc(out), runes: out.length,
      min_page_ioc: Math.min(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
      max_page_ioc: Math.max(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
      prefix: out.slice(0, 50).map(x => corpus.translit[x]).join(""),
      page_stats: pageStats
    });
  }
}
const clear = corpus.pages.find(p => p.page === 57);
const output = {
  source_square: squarePath, raw_matrix: rawM, matrix_mod29: M,
  row_sums: rowSums, column_sums: colSums, determinant_mod29: detMod(M),
  matrix_order: order, lp2_page_count: pages.length, lp2_rune_count: runeTotal,
  identity_anchor_page: 50, anchor_rune_count: anchor.indices.length,
  page_blocking: "page-local 5-rune blocks; append rune index 0 (F) to a multiple of 5, then truncate to original page length",
  clear_page_57_ioc: ioc(clear.indices), results
};
console.log(JSON.stringify(output, null, 2));
if (process.argv[2] === "--write" && process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2) + "\n");
