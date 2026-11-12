"use strict";

/**
 * A p57 "shed circumferences" source hypothesis: use the 9×9 interior of
 * LP2 p32's original 11×11 tree-key square to invert the first 81×81 bookend
 * square by 9×9 Hill tiles. No fitted keys, clocks or phase choices.
 * Run: node sims/p32_peeled9_81square_tensor_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const book = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod = value => ((value % 29) + 29) % 29;
const original = book.pages.filter(page => page.page <= 55).flatMap(page => page.indices);
const p32 = book.pages.find(page => page.page === 32).indices;
const p57 = book.pages.find(page => page.page === 57).indices;
assert.equal(original.length, 12956);
assert.equal(p32.length, 121);
assert.equal(p57.length, 95);
const C = original.slice(0, 6561);
assert.deepEqual(C.slice(-6), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(original.slice(-6), [23, 11, 1, 17, 18, 10]);
const printed = Array.from({ length: 11 }, (_, r) => p32.slice(r * 11, (r + 1) * 11));
assert.equal(printed[0].reduce((s, x) => s + book.prime[x], 0), 563);
assert.equal(printed.reduce((s, row) => s + book.prime[row[0]], 0), 569);

/** @param {number[][]} A */
function invert(A) {
  const n = A.length;
  const w = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  let determinant = 1;
  for (let k = 0; k < n; k++) {
    let p = k;
    while (p < n && w[p][k] === 0) p++;
    assert.ok(p < n, "p32 inner matrix is invertible");
    if (p !== k) {
      [w[p], w[k]] = [w[k], w[p]];
      determinant = mod(-determinant);
    }
    const v = w[k][k];
    determinant = mod(determinant * v);
    let iv = 1;
    while (mod(iv * v) !== 1) iv++;
    w[k] = w[k].map(x => mod(x * iv));
    for (let row = 0; row < n; row++) {
      if (row === k) continue;
      const f = w[row][k];
      w[row] = w[row].map((x, j) => mod(x - f * w[k][j]));
    }
  }
  return { determinant, inverse: w.map(r => r.slice(n)) };
}

/** @param {number[][]} A */
function transpose(A) {
  return A[0].map((_, j) => A.map(r => r[j]));
}

/** @param {number[][]} A @param {number[][]} B */
function multiply(A, B) {
  const n = A.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      for (let j = 0; j < n; j++) out[i][j] += A[i][k] * B[k][j];
    }
  }
  return out.map(r => r.map(mod));
}

/**
 * Apply P = L C R to each contiguous 9×9 tile in the original 81×81 square.
 * @param {number[]} input
 * @param {number[][]} L
 * @param {number[][]} R
 */
function transform(input, L, R) {
  assert.equal(input.length, 6561);
  const out = Array(6561);
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 9; tx++) {
      const tile = Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 9 }, (_, j) => input[(ty * 9 + i) * 81 + tx * 9 + j]));
      const q = multiply(multiply(L, tile), R);
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) out[(ty * 9 + i) * 81 + tx * 9 + j] = q[i][j];
      }
    }
  }
  return out;
}

/** @param {number[]} input */
function ioc(input) {
  const h = Array(29).fill(0);
  for (const x of input) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (input.length * (input.length - 1));
}

const I = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => Number(r === c)));
const nativePlant = Array.from({ length: 6561 }, (_, i) => p57[i % p57.length]);
const rows = [];
for (const representation of ["index", "prime"]) {
  const M = Array.from({ length: 9 }, (_, r) =>
    printed[r + 1].slice(1, 10).map(x => representation === "index" ? x : book.prime[x] % 29));
  const { determinant, inverse: V } = invert(M);
  assert.equal(determinant, representation === "index" ? 28 : 6);
  const cases = [
    ["left inverse", V, I, M, I],
    ["right inverse", I, transpose(V), I, transpose(M)],
    ["both inverse", V, transpose(V), M, transpose(M)],
    ["left forward", M, I, V, I],
    ["right forward", I, transpose(M), I, transpose(V)],
    ["both forward", M, transpose(M), V, transpose(V)]
  ];
  for (const [variant, L, R, EL, ER] of cases) {
    const P = transform(C, L, R);
    assert.deepEqual(transform(P, EL, ER), C);
    assert.deepEqual(transform(transform(nativePlant, EL, ER), L, R), nativePlant);
    rows.push({ representation, variant, determinant, ioc: ioc(P),
      first32: P.slice(0, 32).map(x => book.translit[x]).join(" ") });
  }
}
rows.sort((a, b) => b.ioc - a.ioc);
assert.equal(rows.length, 12);
assert.ok(rows[0].ioc < 0.034551);
assert.ok(ioc(p57) > 0.06);
console.log(JSON.stringify({
  originalRunes: original.length, firstSquareRunes: C.length,
  p32InnerMatrixSize: 9, p57PlaintextIoc: ioc(p57),
  originalUnmodifiedIoc: ioc(C), positiveControls: "12 × 6561 exact",
  originalForwardReencryptions: "12 × 6561 exact", variants: rows
}, null, 2));
