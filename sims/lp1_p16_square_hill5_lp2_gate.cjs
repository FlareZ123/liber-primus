#!/usr/bin/env node
"use strict";

// Test the two minimal source-motivated readings of LP1 p16's 5x5 / 3301
// magic square as a direct stationary GP29 Hill-5 key:
// (1) reduce each cell mod29; (2) apply Euler phi to each cell, then mod29.
// Four natural matrix/inverse orientations and two natural clocks are tested.
// No phase, padding, fitted key, or language-score parameter selection.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const Q = 29;
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
));
const pages = source.pages.slice(0, 56).map(p => p.indices || []);
const unknown = pages.flat();
const p57 = source.pages[57].indices;

const mod = n => ((n % Q) + Q) % Q;
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
function inverseScalar(a) {
  for (let x = 1; x < Q; x++) if (mod(a * x) === 1) return x;
  throw new Error("noninvertible scalar " + a);
}
function determinantMod(A) {
  const B = A.map(row => row.map(mod));
  let det = 1;
  for (let c = 0; c < B.length; c++) {
    let pivot = c;
    while (pivot < B.length && B[pivot][c] === 0) pivot++;
    if (pivot === B.length) return 0;
    if (pivot !== c) {
      [B[c], B[pivot]] = [B[pivot], B[c]];
      det = mod(-det);
    }
    const v = B[c][c];
    det = mod(det * v);
    const vi = inverseScalar(v);
    for (let r = c + 1; r < B.length; r++) {
      const factor = mod(B[r][c] * vi);
      for (let k = c; k < B.length; k++) B[r][k] = mod(B[r][k] - factor * B[c][k]);
    }
  }
  return det;
}
function inverseMatrix(A) {
  const n = A.length;
  const B = A.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  for (let c = 0; c < n; c++) {
    let pivot = c;
    while (pivot < n && B[pivot][c] === 0) pivot++;
    if (pivot === n) throw new Error("singular matrix");
    [B[c], B[pivot]] = [B[pivot], B[c]];
    const scale = inverseScalar(B[c][c]);
    B[c] = B[c].map(v => mod(v * scale));
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = B[r][c];
      B[r] = B[r].map((v, k) => mod(v - factor * B[c][k]));
    }
  }
  return B.map(row => row.slice(n));
}
const transpose = A => A[0].map((_, c) => A.map(row => row[c]));
function applyBlocks(input, A) {
  const usable = input.length - (input.length % 5);
  const out = [];
  for (let i = 0; i < usable; i += 5) {
    const block = input.slice(i, i + 5);
    for (const row of A) {
      out.push(mod(row.reduce((sum, value, k) => sum + value * block[k], 0)));
    }
  }
  return out;
}
function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const value of values) counts[value]++;
  return values.length < 2 ? 0 :
    counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const raw = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
];
assert.deepStrictEqual(raw.map(row => row.reduce((a,b)=>a+b,0)), Array(5).fill(3301));
assert.deepStrictEqual(raw[0].map((_,c)=>raw.reduce((s,row)=>s+row[c],0)), Array(5).fill(3301));
assert.strictEqual(raw.reduce((s,row,i)=>s+row[i],0), 3301);
assert.strictEqual(raw.reduce((s,row,i)=>s+row[4-i],0), 3301);

const direct = raw.map(row => row.map(mod));
const totientValues = raw.map(row => row.map(phi));
const totient = totientValues.map(row => row.map(mod));
assert.deepStrictEqual(totient, [
  [6,9,9,22,3],
  [6,17,2,9,25],
  [22,8,25,8,22],
  [25,9,2,17,6],
  [3,22,9,9,6]
]);
assert.strictEqual(determinantMod(direct), 10);
assert.strictEqual(determinantMod(totient), 23);

assert.strictEqual(source.pages.length, 58);
assert.strictEqual(pages.length, 56);
assert.strictEqual(unknown.length, 12956);
assert.strictEqual(pages[50].length, 0);
assert.strictEqual(p57.length, 95);

const variants = [
  { label: "direct", matrix: direct, determinant: 10 },
  { label: "totient", matrix: totient, determinant: 23 }
];
const expectedIocs = [
  0.03449662782662304, 0.03451733534822225,
  0.03447443726151027, 0.034471536903598096,
  0.034465451393575236, 0.03449263451822099,
  0.03448329203588126, 0.034465580072787376,
  0.03448639061103127, 0.0344691226279742,
  0.03447138635674718, 0.03450160009453284,
  0.03448192151225722, 0.03446223163021353,
  0.03446580892147716, 0.034509862012622655
];
const results = [];
for (const variant of variants) {
  const M = variant.matrix;
  const mt = transpose(M);
  const decoders = [
    ["M^-1", inverseMatrix(M)],
    ["M", M],
    ["(M^T)^-1", inverseMatrix(mt)],
    ["M^T", mt]
  ];
  for (const [orientation, decoder] of decoders) {
    const encoder = inverseMatrix(decoder);
    const plantedCipher = applyBlocks(p57, encoder);
    const plantedPlain = applyBlocks(plantedCipher, decoder);
    assert.deepStrictEqual(plantedPlain, p57);
    assert.strictEqual(plantedPlain.length, 95);

    for (const clock of ["global", "page"]) {
      const streams = clock === "global" ? [unknown] : pages;
      const transformed = streams.flatMap(stream => applyBlocks(stream, decoder));
      const result = {
        matrix: variant.label,
        determinantMod29: variant.determinant,
        orientation,
        clock,
        outputRunes: transformed.length,
        droppedIncompleteBlockRunes: unknown.length - transformed.length,
        ioc: ioc(transformed),
        syntheticP57Recovered: plantedPlain.length + "/" + p57.length
      };
      const expected = expectedIocs[results.length];
      assert.strictEqual(result.outputRunes, clock === "global" ? 12955 : 12840);
      assert.strictEqual(result.droppedIncompleteBlockRunes, clock === "global" ? 1 : 116);
      assert(Math.abs(result.ioc - expected) < 1e-12);
      results.push(result);
    }
  }
}
console.log(JSON.stringify({
  test: "LP1 p16 5x5 magic square as direct or totient-derived stationary GP29 Hill-5 key",
  alphabetModulus: Q,
  rawMatrix: raw,
  directMatrixMod29: direct,
  directDeterminantMod29: determinantMod(direct),
  entrywiseTotientValues: totientValues,
  totientMatrixMod29: totient,
  totientDeterminantMod29: determinantMod(totient),
  unknownPageCount: pages.length,
  unknownRuneCount: unknown.length,
  sourceCiphertextIoc: ioc(unknown),
  clearP57Ioc: ioc(p57),
  results
}, null, 2));
