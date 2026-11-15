#!/usr/bin/env node
"use strict";
// Test the two source 5x5 Stage 10 matrices as page-indexed GF(29) Hill keys.
// The 3301 matrix has order 56; the 1033 matrix has order 28.
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const mod = x => ((x % 29) + 29) % 29;
const squarePath = path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt");
const corpusPath = path.join(root, "resources", "liber-primus", "lp2-corpus.json");
const numericRows = fs.readFileSync(squarePath, "utf8").split(/\r?\n/)
  .filter(x => /^\s*\d/.test(x)).map(x => x.trim().split(/\s+/).map(Number));
const defs = [
  {name: "3301_5x5", raw: numericRows.slice(0, 5), expectedSum: 3301, expectedOrder: 56},
  {name: "1033_5x5", raw: numericRows.slice(12, 17), expectedSum: 1033, expectedOrder: 28}
];
if (defs.some(x => x.raw.length !== 5 || x.raw.some(r => r.length !== 5))) throw new Error("Could not parse both source 5x5 squares");
const identity = n => Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => +(i === j)));
const transpose = A => A[0].map((_, j) => A.map(row => row[j]));
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
function matrixOrder(A, limit = 1000) {
  const I = identity(A.length); let P = I;
  for (let k = 1; k <= limit; k++) { P = mul(P, A); if (equal(P, I)) return k; }
  return null;
}
const matrices = defs.map(d => {
  const rowSums = d.raw.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({length: 5}, (_, j) => d.raw.reduce((a, row) => a + row[j], 0));
  if (rowSums.some(x => x !== d.expectedSum) || colSums.some(x => x !== d.expectedSum)) throw new Error(d.name + " is not the expected magic square");
  const M = d.raw.map(row => row.map(mod));
  const det = detMod(M), order = matrixOrder(M);
  if (!det || order !== d.expectedOrder) throw new Error(d.name + " determinant/order mismatch: det=" + det + " order=" + order);
  return {...d, matrix: M, rowSums, colSums, determinant_mod29: det, order};
});
const [A, B] = matrices;
let AcommB = equal(mul(A.matrix, B.matrix), mul(B.matrix, A.matrix));
let BIsPowerOfA = false;
let P = identity(5);
for (let k = 0; k < A.order; k++) { if (equal(P, B.matrix)) BIsPowerOfA = true; P = mul(P, A.matrix); }
const sevenRaw = numericRows.slice(5, 12);
const seven = sevenRaw.map(row => row.map(mod));
const sevenOrder56 = seven.length === 7 && seven.every(row => row.length === 7)
  ? equal((() => { let P = identity(7), X = seven; for (let i = 0; i < 56; i++) P = mul(P, X); return P; })(), identity(7))
  : null;

const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page < 56);
if (pages.length !== 56) throw new Error("Expected 56 LP2 pages");
const runeTotal = pages.reduce((s, p) => s + p.indices.length, 0);
if (runeTotal !== 12956) throw new Error("Unexpected LP2 rune count " + runeTotal);
const anchor = pages.find(p => p.page === 50);
if (!anchor || anchor.indices.length !== 0) throw new Error("Page 50 is not the expected empty-rune numeric-table page");
function ioc(a) {
  const n = a.length; if (n < 2) return 0;
  const counts = Array(29).fill(0); for (const x of a) counts[x]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
const mv = (M, v) => M.map(row => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
function pagePowerTest(def) {
  const M = def.matrix, order = def.order, results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const sign of [-1, +1]) {
      const out = [], pageStats = [];
      for (const page of pages) {
        const originalLength = page.indices.length;
        if (originalLength === 0) { pageStats.push({page: page.page, n: 0, ioc: null}); continue; }
        let e = ((sign * (page.page - 50)) % order + order) % order;
        let R = identity(5), X = base.map(row => row.slice());
        while (e) { if (e & 1) R = mul(R, X); X = mul(X, X); e >>= 1; }
        const padded = page.indices.slice();
        while (padded.length % 5) padded.push(0); // F=0 page-local zero padding
        const transformed = [];
        for (let i = 0; i < padded.length; i += 5) transformed.push(...mv(R, padded.slice(i, i + 5)));
        transformed.length = originalLength;
        out.push(...transformed);
        pageStats.push({page: page.page, n: originalLength, ioc: ioc(transformed)});
      }
      results.push({
        matrix: def.name, matrix_order: order, orientation, exponent_sign: sign,
        pooled_ioc: ioc(out), runes: out.length,
        min_page_ioc: Math.min(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
        max_page_ioc: Math.max(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
        prefix: out.slice(0, 50).map(x => corpus.translit[x]).join(""),
        page_stats: pageStats
      });
    }
  }
  return results;
}

function blockPowerTest(def) {
  const M = def.matrix, order = def.order, C = pages.flatMap(p => p.indices), results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const sign of [-1, +1]) {
      const out = [];
      for (let start = 0; start < C.length; start += 5) {
        let e = ((sign * (start / 5)) % order + order) % order;
        let R = identity(5), X = base.map(row => row.slice());
        while (e) { if (e & 1) R = mul(R, X); X = mul(X, X); e >>= 1; }
        const block = C.slice(start, start + 5);
        while (block.length < 5) block.push(0); // F=0 final-block padding
        const transformed = mv(R, block);
        out.push(...transformed.slice(0, Math.min(5, C.length - start)));
      }
      results.push({
        matrix: def.name, matrix_order: order, orientation, exponent_sign: sign,
        period_blocks: order, blocks: Math.ceil(C.length / 5),
        pooled_ioc: ioc(out), runes: out.length,
        prefix: out.slice(0, 80).map(x => corpus.translit[x]).join("")
      });
    }
  }
  return results;
}

const pagePowerResults = matrices.flatMap(pagePowerTest);
const blockPowerResults = matrices.flatMap(blockPowerTest);
const clear = corpus.pages.find(p => p.page === 57);
const output = {
  source_square: squarePath,
  matrices: matrices.map(({raw, matrix, ...rest}) => ({...rest, raw_matrix: raw, matrix_mod29: matrix})),
  five_by_five_matrices_commute: AcommB,
  1033_matrix_is_power_of_3301_matrix: BIsPowerOfA,
  seven_by_seven_1033_matrix_has_order_dividing_56: sevenOrder56,
  lp2_page_count: pages.length, lp2_rune_count: runeTotal,
  identity_anchor_page: 50, anchor_rune_count: anchor.indices.length,
  page_blocking: "page-local 5-rune blocks; append rune index 0 (F) to a multiple of 5, then truncate to original page length",
  clear_page_57_ioc: ioc(clear.indices), page_power_results: pagePowerResults, block_power_results: blockPowerResults
};
console.log(JSON.stringify(output, null, 2));
if (process.argv[2] === "--write" && process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2) + "\n");
