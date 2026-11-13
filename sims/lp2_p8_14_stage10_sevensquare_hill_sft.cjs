"use strict";

/**
 * Original LP2 p8–p14 seven-page dense Hill-7 test under the actual 2014
 * Cicada Stage10 7×7 magic-square key. Unlike an arbitrary-key fit, the
 * matrix is recovered from the independently preserved historical file.
 * Run from repository root: node sims/lp2_p8_14_stage10_sevensquare_hill_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const squareSource = fs.readFileSync(
  path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8");
const MOD = 29;
const WIDTH = 7;
const ROWS = 247;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} x Nonzero element of GF(29). */
function scalarInverse(x) {
  for (let i = 1; i < MOD; i++) if (mod(i * x) === 1) return i;
  throw new Error("GF29 pivot is not invertible");
}

/** @param {number[][]} matrix 7×7 GF29 matrix. */
function inverse(matrix) {
  const n = WIDTH;
  const a = matrix.map((row, i) => row.map(mod).concat(
    Array.from({length: n}, (_, j) => Number(i === j))));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    assert.ok(pivot < n, "Source-selected key must be invertible");
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const factor = scalarInverse(a[col][col]);
    a[col] = a[col].map(x => mod(x * factor));
    for (let row = 0; row < n; row++) if (row !== col) {
      const multiple = a[row][col];
      if (multiple) a[row] = a[row].map((x, j) =>
        mod(x - multiple * a[col][j]));
    }
  }
  return a.map(row => row.slice(n));
}

/** @param {number} integer Positive integer. */
function phi(integer) {
  let remainder = integer, result = integer;
  for (let divisor = 2; divisor * divisor <= remainder; divisor++) {
    if (remainder % divisor !== 0) continue;
    while (remainder % divisor === 0) remainder /= divisor;
    result -= result / divisor;
  }
  if (remainder > 1) result -= result / remainder;
  return result;
}

/** Read the only 7×7 printed block with complete 1033 row/column sums. */
function historicSquare() {
  const lines = squareSource.trim().split(/\r?\n/).map(line => line.trim())
    .filter(Boolean).map(line => line.split(/\s+/).map(Number));
  const blocks = [];
  for (let start = 0; start + WIDTH <= lines.length; start++) {
    const matrix = lines.slice(start, start + WIDTH);
    if (!matrix.every(row => row.length === WIDTH)) continue;
    const sums = matrix.map(row => row.reduce((a, b) => a + b, 0));
    const cols = Array.from({length: WIDTH}, (_, col) =>
      matrix.reduce((sum, row) => sum + row[col], 0));
    if (sums.concat(cols).every(n => n === 1033)) blocks.push(matrix);
  }
  assert.equal(blocks.length, 1, "Unique source 7×7 square");
  return blocks[0];
}

/** @param {number[]} sequence @param {"row"|"column"} layout */
function pack(sequence, layout) {
  if (layout === "row") return sequence.slice();
  return Array.from({length: ROWS}, (_, r) =>
    Array.from({length: WIDTH}, (_, c) => sequence[r + c * ROWS])).flat();
}

/** Inverse of pack; every original column has 247 elements. */
function unpack(rows, layout) {
  if (layout === "row") return rows.slice();
  return Array.from({length: WIDTH * ROWS}, (_, i) =>
    rows[(i % ROWS) * WIDTH + Math.floor(i / ROWS)]);
}

/** @param {number[]} sequence @param {number[][]} matrix
 * @param {"left"|"right"} orientation
 */
function blockTransform(sequence, matrix, orientation) {
  assert.equal(sequence.length, ROWS * WIDTH);
  const result = [];
  for (let offset = 0; offset < sequence.length; offset += WIDTH) {
    const vector = sequence.slice(offset, offset + WIDTH);
    for (let row = 0; row < WIDTH; row++) {
      let value = 0;
      for (let col = 0; col < WIDTH; col++) {
        value += (orientation === "left" ?
          matrix[row][col] : matrix[col][row]) * vector[col];
      }
      result.push(mod(value));
    }
  }
  return result;
}

/** @param {number[]} runes GP29 symbols. */
function coincidence(runes) {
  const frequencies = Array(MOD).fill(0);
  for (const rune of runes) frequencies[rune]++;
  return frequencies.reduce((s, count) => s + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}

const pages = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
assert.deepEqual(pages.map(p => p.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, WIDTH * ROWS);
const authenticPlain = corpus.pages.find(p => p.page === 57).indices;
assert.equal(authenticPlain.length, 95);
const squares = [
  {name: "raw", matrix: historicSquare()},
  {name: "phi", matrix: historicSquare().map(row => row.map(phi))}
];
const results = [];
for (const {name, matrix} of squares) {
  const inv = inverse(matrix);
  const identity = blockTransform(
    blockTransform([1, 0, 0, 0, 0, 0, 0, ...Array(1722).fill(0)],
      matrix, "left"), inv, "left");
  assert.equal(identity[0], 1);
  assert.ok(identity.slice(1).every(x => x === 0));
  for (const [key, transform] of [["K", matrix], ["inverseK", inv]]) {
    for (const orientation of ["left", "right"]) {
      for (const layout of ["row", "column"]) {
        const originalPacked = pack(original, layout);
        const output = unpack(
          blockTransform(originalPacked, transform, orientation), layout);
        const sourcePlain = Array.from({length: original.length},
          (_, i) => authenticPlain[i % authenticPlain.length]);
        const sourcePacked = pack(sourcePlain, layout);
        const forward = (key === "K" ? inv : matrix);
        const encrypted = blockTransform(sourcePacked, forward, orientation);
        const recovered = unpack(
          blockTransform(encrypted, transform, orientation), layout);
        assert.deepEqual(recovered, sourcePlain,
          "Synthetic GP29 plant must recover every rune");

        const value = coincidence(output);
        assert.ok(value < 0.04, "Ciphertext is not GP-native English-like");
        results.push({
          key: name, operation: key, orientation, layout,
          decodedRunes: output.length,
          originalIoC: coincidence(original),
          decodedIoC: value,
          nativePlantIoC: coincidence(sourcePlain),
          plantExact: true,
          first60: output.slice(0, 60)
            .map(x => corpus.translit[x]).join("")
        });
      }
    }
  }
}
assert.equal(results.length, 16);
const byScore = results.sort((a, b) => b.decodedIoC - a.decodedIoC);
console.log(JSON.stringify({
  originalPages: pages.map(p => p.page),
  originalRunes: original.length,
  2014KeySquare: historicSquare(),
  sourceNote: "Untransformed historic 7×7 1033-sum source key; phi variant is an explicitly speculative control",
  variants: byScore,
  decision: "All 16 source-fixed dense Hill7 inverses remain ciphertext-like. No recovered plaintext or key selected by the manuscript."
}, null, 2));
