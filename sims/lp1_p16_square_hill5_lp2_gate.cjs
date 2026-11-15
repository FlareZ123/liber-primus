#!/usr/bin/env node
"use strict";

// Source-constrained test: LP1 p16's printed 5x5 / 3301 magic square as a
// direct stationary GP29 Hill-5 key on the original unsolved LP2 stream.
// No phase, padding, key fitting, or language-scored parameter selection.

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
const matrix = raw.map(row => row.map(mod));
assert.deepStrictEqual(raw.map(row => row.reduce((a,b)=>a+b,0)), Array(5).fill(3301));
assert.deepStrictEqual(raw[0].map((_,c)=>raw.reduce((s,row)=>s+row[c],0)), Array(5).fill(3301));
assert.strictEqual(raw.reduce((s,row,i)=>s+row[i],0), 3301);
assert.strictEqual(raw.reduce((s,row,i)=>s+row[4-i],0), 3301);
assert.strictEqual(determinantMod(matrix), 10);

const mt = transpose(matrix);
const decoders = [
  ["M^-1 (C=M·P)", inverseMatrix(matrix)],
  ["M (C=M^-1·P)", matrix],
  ["(M^T)^-1 (C=M^T·P)", inverseMatrix(mt)],
  ["M^T (C=(M^T)^-1·P)", mt]
];
assert.strictEqual(source.pages.length, 58);
assert.strictEqual(pages.length, 56);
assert.strictEqual(unknown.length, 12956);
assert.strictEqual(pages[50].length, 0);
assert.strictEqual(p57.length, 95);

const expected = [
  ["M^-1 (C=M·P)", "global", 12955, 1, 0.03449662782662304],
  ["M^-1 (C=M·P)", "page",   12840, 116, 0.03451733534822225],
  ["M (C=M^-1·P)", "global", 12955, 1, 0.03447443726151027],
  ["M (C=M^-1·P)", "page",   12840, 116, 0.034471536903598096],
  ["(M^T)^-1 (C=M^T·P)", "global", 12955, 1, 0.034465451393575236],
  ["(M^T)^-1 (C=M^T·P)", "page",   12840, 116, 0.03449263451822099],
  ["M^T (C=(M^T)^-1·P)", "global", 12955, 1, 0.03448329203588126],
  ["M^T (C=(M^T)^-1·P)", "page",   12840, 116, 0.034465580072787376]
];
const results = [];
for (const [name, decoder] of decoders) {
  const encoder = inverseMatrix(decoder);
  const plantedCipher = applyBlocks(p57, encoder);
  const plantedPlain = applyBlocks(plantedCipher, decoder);
  assert.deepStrictEqual(plantedPlain, p57);
  assert.strictEqual(plantedPlain.length, 95);

  for (const clock of ["global", "page"]) {
    const streams = clock === "global" ? [unknown] : pages;
    const transformed = streams.flatMap(stream => applyBlocks(stream, decoder));
    const result = {
      decoder: name,
      clock,
      outputRunes: transformed.length,
      droppedIncompleteBlockRunes: unknown.length - transformed.length,
      ioc: ioc(transformed),
      syntheticP57Recovered: plantedPlain.length + "/" + p57.length
    };
    const expectedRow = expected[results.length];
    assert.strictEqual(result.decoder, expectedRow[0]);
    assert.strictEqual(result.clock, expectedRow[1]);
    assert.strictEqual(result.outputRunes, expectedRow[2]);
    assert.strictEqual(result.droppedIncompleteBlockRunes, expectedRow[3]);
    assert(Math.abs(result.ioc - expectedRow[4]) < 1e-12);
    results.push(result);
  }
}
console.log(JSON.stringify({
  test: "LP1 p16 5x5 magic square as direct stationary GP29 Hill-5 key",
  alphabetModulus: Q,
  rawMatrix: raw,
  matrixMod29: matrix,
  determinantMod29: determinantMod(matrix),
  unknownPageCount: pages.length,
  unknownRuneCount: unknown.length,
  sourceCiphertextIoc: ioc(unknown),
  clearP57Ioc: ioc(p57),
  results
}, null, 2));
