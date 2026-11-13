"use strict";

/**
 * Source-fixed four-dimensional OFB / ciphertext-feedback inverses.
 *
 * Physical LP2 p15 prints a 4x4 Fibonacci-prime array. Its next chapter,
 * pp16-22, contains exactly 1744 = 436*4 original GP29 runes. This test
 * treats that array as a matrix stream generator or a feedback map.
 *
 * Both schemes are hypothetical, and neither is an authored LP2 cipher.
 * All seed variants use printed p15 red spans and are fixed before scoring.
 *
 * Single-file test (Node.js 22, Windows 11):
 *   node sims/lp2_p15_fourstate_ofb_cfb_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const mod = value => (value % 29 + 29) % 29;
const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
].map(row => row.map(mod));
const Minv = [
  [19, 1, 6, 3],
  [11, 7, 8, 22],
  [2, 10, 15, 28],
  [25, 4, 1, 15]
];
/** @param {number[][]} matrix */
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));
/** @param {number[][]} matrix @param {number[]} vector */
const multiply = (matrix, vector) => matrix.map(row =>
  mod(row.reduce((sum, coefficient, j) =>
    sum + coefficient * vector[j], 0))
);
const identity = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => +(i === j)));
for (const [A, B] of [[M, Minv], [Minv, M]]) {
  const product = [0, 1, 2, 3].map(j =>
    multiply(A, B.map(row => row[j])));
  assert.deepEqual(transpose(product), identity);
}

const red20 = gp.pages[15].indices.slice(0, 20);
const seeds = [
  ["first-red-first4", red20.slice(0, 4)],
  ["first-red-last4", red20.slice(5, 9)],
  ["second-red-first4", red20.slice(9, 13)],
  ["second-red-last4", red20.slice(16, 20)],
  ["zero-control", [0, 0, 0, 0]]
];
const matrices = [
  ["printed-M", M],
  ["inverse-M", Minv],
  ["transpose-M", transpose(M)],
  ["inverse-transpose-M", transpose(Minv)]
];
const ciphertext = gp.pages.slice(16, 23).flatMap(page => page.indices);
const control = gp.pages[57].indices.slice(0, 92);
assert.equal(ciphertext.length, 1744);
assert.equal(control.length, 92);
assert.equal(red20.length, 20);
for (const [, seed] of seeds) assert.equal(seed.length, 4);

/** @param {number[]} values */
function ioc(values) {
  const count = new Uint32Array(29);
  for (const value of values) count[value]++;
  return count.reduce((sum, countOfRune) =>
    sum + countOfRune * (countOfRune - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * OFB: state = A*state, C = P - sign*state.
 * CFB: pad = A*previous-C, C = P - sign*pad.
 * Decryption reverses the signs without estimating hidden state.
 *
 * @param {number[]} values
 * @param {number[][]} matrix
 * @param {number[]} initial
 * @param {"ofb"|"cfb"} mode
 * @param {-1|1} sign
 * @param {boolean} encrypt
 */
function transform(values, matrix, initial, mode, sign, encrypt) {
  assert.equal(values.length % 4, 0);
  const output = [];
  let state = initial.slice();
  for (let i = 0; i < values.length; i += 4) {
    const block = values.slice(i, i + 4);
    if (mode === "ofb") state = multiply(matrix, state);
    const pad = mode === "ofb" ? state : multiply(matrix, state);
    const result = block.map((value, j) =>
      mod(value + (encrypt ? -sign : sign) * pad[j]));
    if (mode === "cfb") state = encrypt ? result : block;
    output.push(...result);
  }
  return output;
}

const output = [];
for (const mode of ["ofb", "cfb"]) {
  for (const [seedName, seed] of seeds) {
    for (const [matrixName, matrix] of matrices) {
      for (const sign of [-1, 1]) {
        const original = transform(ciphertext, matrix, seed, mode, sign, false);
        assert.deepEqual(transform(original, matrix, seed, mode, sign, true),
          ciphertext, "Original 1744-rune forward check");
        const planted = transform(control, matrix, seed, mode, sign, true);
        assert.deepEqual(transform(planted, matrix, seed, mode, sign, false),
          control, "Authenticated 92-rune solved-page positive plant");
        output.push({
          mode, seed: seedName, matrix: matrixName, sign,
          originalIoC: ioc(original)
        });
      }
    }
  }
}
const maxima = Object.fromEntries(["ofb", "cfb"].map(mode =>
  [mode, Math.max(...output.filter(candidate =>
    candidate.mode === mode).map(candidate => candidate.originalIoC))]
));
assert.equal(output.length, 80);
assert(Math.abs(maxima.ofb - 0.034735271360672046) < 1e-12);
assert(Math.abs(maxima.cfb - 0.03475435161353145) < 1e-12);
assert(ioc(control) > 0.06);
assert(maxima.ofb < 0.04 && maxima.cfb < 0.04);

console.log(JSON.stringify({
  originalPages: "16-22",
  sourceRunes: ciphertext.length,
  p15RedSeedCells: red20.length,
  candidateCount: output.length,
  originalIoC: ioc(ciphertext),
  solvedP57PlantIoC: ioc(control),
  maxOriginalIoC: maxima,
  originalExactForward: "80/80",
  authenticSolvedGpPlants: "80/80 92-rune exact"
}, null, 2));
