"use strict";

/**
 * Original-input 11x11 GP29 Hill-matrix test motivated by the shared tree
 * imagery on physical LP2 p32/p55 and the 121/77 source rune lengths.
 *
 * SFT: node sims/lp2_p32_treehill11_p55_seam_original_sft.cjs
 * This program reads only the canonical corpus and writes nothing.
 *
 * The p32 121-rune reflow is an UNPRINTED matrix hypothesis. The 77-symbol
 * p55 + first-p56-rune interval crosses two different cryptographic pages.
 * Round-trip correctness alone must not be interpreted as decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const db = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const q = 29;
const n = 11;
/** @param {number} x */
const mod = x => ((x % q) + q) % q;

/** @param {number} x */
function inverseScalar(x) {
  assert.notEqual(x, 0);
  for (let i = 1; i < q; i++) if (mod(x * i) === 1) return i;
  throw new Error("GF29 inverse unavailable");
}

/**
 * Complete Gaussian elimination over GF29, returning determinant and inverse.
 * @param {number[]} flat
 * @returns {{det: number, inverse: number[]}}
 */
function invert(flat) {
  assert.equal(flat.length, n * n);
  const a = Array.from({length: n}, (_, r) =>
    flat.slice(r * n, (r + 1) * n).concat(
      Array.from({length: n}, (_, c) => Number(r === c))));
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, "p32 matrix is singular under this reading");
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      det = mod(-det);
    }
    const v = a[col][col];
    det = mod(det * v);
    const reciprocal = inverseScalar(v);
    for (let j = col; j < 2 * n; j++) a[col][j] = mod(a[col][j] * reciprocal);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j < 2 * n; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return {det, inverse: a.flatMap(row => row.slice(n))};
}

/** @param {number[]} matrix */
function transpose(matrix) {
  return Array.from({length: n*n}, (_, i) =>
    matrix[(i % n) * n + Math.floor(i / n)]);
}

/**
 * Apply a fixed 11x11 matrix independently to each 11-rune column vector.
 * @param {number[]} matrix
 * @param {number[]} input
 */
function apply(matrix, input) {
  assert.equal(matrix.length, n*n);
  assert.equal(input.length % n, 0);
  const result = [];
  for (let block = 0; block < input.length; block += n) {
    for (let row = 0; row < n; row++) {
      let value = 0;
      for (let col = 0; col < n; col++) {
        value += matrix[row*n + col] * input[block + col];
      }
      result.push(mod(value));
    }
  }
  return result;
}

/** @param {number[]} seq */
function indexOfCoincidence(seq) {
  const freq = Array(q).fill(0);
  for (const x of seq) freq[x]++;
  return freq.reduce((s, x) => s + x*(x-1), 0)
    / (seq.length*(seq.length-1));
}

/** @param {number[]} seq */
const render = seq => seq.map(x => db.translit[x]).join("");

const matrix = db.pages[32].indices;
const cipher = db.pages[55].indices.concat(db.pages[56].indices.slice(0, 1));
const native = db.pages[57].indices.slice(0, 77);
assert.deepEqual([matrix.length, cipher.length, native.length], [121, 77, 77]);
const {det, inverse} = invert(matrix);
assert.equal(det, 8);
assert.deepEqual(apply(inverse, apply(matrix, native)), native);
assert.deepEqual(apply(matrix, apply(inverse, cipher)), cipher);

const matrices = [
  ["p32 direct", matrix],
  ["p32 inverse", inverse],
  ["p32 transpose", transpose(matrix)],
  ["p32 inverse transpose", transpose(inverse)]
];
const expectedIoCs = [
  0.032809295967190705,
  0.03827751196172249,
  0.034518113465481885,
  0.039986329460013674
];
const results = matrices.map(([mode, m], i) => {
  const decoded = apply(m, cipher);
  const ioc = indexOfCoincidence(decoded);
  assert.ok(Math.abs(ioc - expectedIoCs[i]) < 1e-12);
  return {mode, scaledIoC: ioc * 29, text: render(decoded)};
});
assert.ok(Math.abs(indexOfCoincidence(native) - 0.05980861244019139) < 1e-12);
console.log(JSON.stringify({
  source: "LP2 p32 original 121 runes and p55 plus first p56 rune (77)",
  conditionalMatrix: "11x11 row-major GP29",
  determinantMod29: det,
  solvedSourcePositive77: true,
  nativeP57First77ScaledIoC: indexOfCoincidence(native) * 29,
  candidates: results,
  decision: "No grammatical unknown-page plaintext; no inferred source-selected Hill11 receiver."
}, null, 2));
