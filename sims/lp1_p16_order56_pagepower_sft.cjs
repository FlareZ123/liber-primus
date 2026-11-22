#!/usr/bin/env node
"use strict";
// Source-constrained Stage 10 matrix-order and key-schedule tests over GP29.
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
  {name: "1033_7x7", raw: numericRows.slice(5, 12), expectedSum: 1033, expectedOrder: 280},
  {name: "1033_5x5", raw: numericRows.slice(12, 17), expectedSum: 1033, expectedOrder: 28}
];
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
function matrixOrder(A, limit = 50000) {
  const I = identity(A.length); let P = I;
  for (let k = 1; k <= limit; k++) { P = mul(P, A); if (equal(P, I)) return k; }
  return null;
}
const matrices = defs.map(d => {
  const n = d.raw.length;
  if (d.raw.some(r => r.length !== n)) throw new Error("Bad square shape: " + d.name);
  const rowSums = d.raw.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({length: n}, (_, j) => d.raw.reduce((a, row) => a + row[j], 0));
  if (rowSums.some(x => x !== d.expectedSum) || colSums.some(x => x !== d.expectedSum)) throw new Error(d.name + " magic sums mismatch: row=" + rowSums.join(",") + " col=" + colSums.join(",") + " expected=" + d.expectedSum + " raw=" + JSON.stringify(d.raw));
  const M = d.raw.map(row => row.map(mod)), det = detMod(M), order = matrixOrder(M);
  if (!det || order !== d.expectedOrder) throw new Error(d.name + " determinant/order mismatch: det=" + det + " order=" + order);
  return {...d, matrix: M, rowSums, colSums, determinant_mod29: det, order};
});
const A = matrices.find(x => x.name === "3301_5x5").matrix;
const B = matrices.find(x => x.name === "1033_5x5").matrix;
const matricesCommute = equal(mul(A, B), mul(B, A));
let BIsPowerOfA = false, AP = identity(5);
for (let k = 0; k < 56; k++) { if (equal(AP, B)) BIsPowerOfA = true; AP = mul(AP, A); }

const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page < 56);
if (pages.length !== 56) throw new Error("Expected 56 LP2 pages");
const C = pages.flatMap(p => p.indices), runeTotal = C.length;
if (runeTotal !== 12956) throw new Error("Unexpected LP2 rune count " + runeTotal);
const anchor = pages.find(p => p.page === 50);
if (!anchor || anchor.indices.length !== 0) throw new Error("Page 50 is not the empty-rune numeric-table page");
const mv = (M, v) => M.map(row => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
function ioc(a) {
  const n = a.length; if (n < 2) return 0;
  const counts = Array(29).fill(0); for (const x of a) counts[x]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
function matrixPower(M, exponent, order) {
  let e = ((exponent % order) + order) % order;
  let R = identity(M.length), X = M.map(row => row.slice());
  while (e) { if (e & 1) R = mul(R, X); X = mul(X, X); e >>= 1; }
  return R;
}
function pagePowerTest(def) {
  const M = def.matrix, n = M.length, order = def.order, results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const sign of [-1, +1]) {
      const out = [], pageStats = [];
      for (const page of pages) {
        const originalLength = page.indices.length;
        if (!originalLength) { pageStats.push({page: page.page, n: 0, ioc: null}); continue; }
        const K = matrixPower(base, sign * (page.page - 50), order);
        const padded = page.indices.slice();
        while (padded.length % n) padded.push(0);
        const transformed = [];
        for (let i = 0; i < padded.length; i += n) transformed.push(...mv(K, padded.slice(i, i + n)));
        transformed.length = originalLength; out.push(...transformed);
        pageStats.push({page: page.page, n: originalLength, ioc: ioc(transformed)});
      }
      results.push({matrix: def.name, order, orientation, exponent_sign: sign,
        pooled_ioc: ioc(out), runes: out.length,
        min_page_ioc: Math.min(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
        max_page_ioc: Math.max(...pageStats.filter(x => x.ioc !== null).map(x => x.ioc)),
        prefix: out.slice(0, 80).map(x => corpus.translit[x]).join(""), page_stats: pageStats});
    }
  }
  return results;
}
function blockPowerTest(def) {
  const M = def.matrix, n = M.length, order = def.order, results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const sign of [-1, +1]) {
      const out = [];
      for (let start = 0; start < C.length; start += n) {
        const K = matrixPower(base, sign * (start / n), order);
        const block = C.slice(start, start + n);
        while (block.length < n) block.push(0);
        out.push(...mv(K, block).slice(0, Math.min(n, C.length - start)));
      }
      results.push({matrix: def.name, order, orientation, exponent_sign: sign,
        period_blocks: order, blocks: Math.ceil(C.length / n), pooled_ioc: ioc(out),
        runes: out.length, prefix: out.slice(0, 80).map(x => corpus.translit[x]).join("")});
    }
  }
  return results;
}
function orbitKeystreamTest(def) {
  const M = def.matrix, n = M.length, order = def.order, results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const [seedName, seed] of [["first_row", M[0]], ["first_column", M.map(row => row[0])]]) {
      let state = seed.slice(); const states = [], seen = new Set();
      for (let k = 0; k < order; k++) {
        const key = state.join(","); if (seen.has(key)) break;
        seen.add(key); states.push(state); state = mv(base, state);
      }
      if (states.length !== order || state.some((x, i) => x !== seed[i])) throw new Error(def.name + " seed orbit shorter than matrix order");
      const keyStream = states.flat();
      for (const sign of [-1, +1]) {
        const out = C.map((x, i) => mod(x + sign * keyStream[i % keyStream.length]));
        results.push({matrix: def.name, order, orientation, seed: seedName,
          orbit_states: states.length, key_period_symbols: keyStream.length, sign,
          pooled_ioc: ioc(out), runes: out.length,
          prefix: out.slice(0, 80).map(x => corpus.translit[x]).join("")});
      }
    }
  }
  return results;
}
function fixedHill7(def) {
  const M = def.matrix, n = M.length, order = def.order, results = [];
  for (const [orientation, base] of [["M", M], ["M^T", transpose(M)]]) {
    for (const sign of [-1, +1]) {
      const K = sign === 1 ? base : matrixPower(base, -1, order);
      const out = [];
      for (let start = 0; start < C.length; start += n) {
        const block = C.slice(start, start + n); while (block.length < n) block.push(0);
        out.push(...mv(K, block).slice(0, Math.min(n, C.length - start)));
      }
      results.push({matrix: def.name, orientation, inverse: sign === -1,
        pooled_ioc: ioc(out), runes: out.length, prefix: out.slice(0, 80).map(x => corpus.translit[x]).join("")});
    }
  }
  return results;
}
const pagePowerResults = matrices.flatMap(pagePowerTest);
const blockPowerResults = matrices.flatMap(blockPowerTest);
const orbitKeystreamResults = matrices.flatMap(orbitKeystreamTest);
const matrix7 = matrices.find(x => x.name === "1033_7x7");
const fixedHill7Results = fixedHill7(matrix7);
const clear = corpus.pages.find(p => p.page === 57);
const output = {
  source_square: squarePath,
  matrices: matrices.map(({raw, matrix, ...rest}) => ({...rest, raw_matrix: raw, matrix_mod29: matrix})),
  five_by_five_matrices_commute: matricesCommute,
  1033_5x5_is_power_of_3301_5x5: BIsPowerOfA,
  lp2_page_count: pages.length, lp2_rune_count: runeTotal,
  identity_anchor_page: 50, anchor_rune_count: anchor.indices.length,
  padding: "append rune index 0 (F) to incomplete page/block Hill groups, then truncate to original rune count",
  clear_page_57_ioc: ioc(clear.indices),
  fixed_hill_7x7_results: fixedHill7Results,
  page_power_results: pagePowerResults,
  block_power_results: blockPowerResults,
  orbit_keystream_results: orbitKeystreamResults
};
console.log(JSON.stringify(output, null, 2));
if (process.argv[2] === "--write" && process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2) + "\n");
