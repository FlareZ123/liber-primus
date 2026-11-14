"use strict";

/**
 * LP2 p55 75-body candidate: the historical three 2014 magic-square matrices,
 * converted to three 5x5 blocks by taking the centre of the 7x7.
 *
 * SFT: node sims/lp2_p55_three_square_75_hill5_sft.cjs
 * Only original corpus/square data are read; no source file is modified.
 * The two conventional column/row Hill orientations are both fully invertible
 * and independently planted against genuine solved p57 GP-rune plaintext.
 *
 * This is a clue-conditioned negative, not an authenticated cipher.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const squareText = fs.readFileSync(
  path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8");

/** @param {number} value */
const mod = value => ((value % 29) + 29) % 29;
/** @param {number} a */
const reciprocal = a => {
  assert.notEqual(a, 0);
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw new Error("Nonzero residue lacks inverse");
};
const blocks = squareText.trim().split(/\r?\n\s*\r?\n/);
const originalSquares = blocks.map(block =>
  block.trim().split(/\r?\n/).map(row =>
    row.trim().split(/\s+/).map(Number)));
assert.deepEqual(originalSquares.map(x => [x.length, x[0].length]),
  [[5, 5], [7, 7], [5, 5]]);
for (const sq of originalSquares) {
  const n = sq.length;
  assert.ok(sq.every(row => row.length === n));
}
assert.equal(originalSquares[0][0][0], 434);
assert.equal(originalSquares[1][0][0], 7);
assert.equal(originalSquares[2][0][0], 272);
const matrices = [
  originalSquares[0],
  originalSquares[1].slice(1, -1).map(row => row.slice(1, -1)),
  originalSquares[2]
].map(sq => sq.map(row => row.map(mod)));
assert.deepEqual(matrices.map(sq => [sq.length, sq[0].length]),
  [[5, 5], [5, 5], [5, 5]]);

/**
 * Invert a square GP29 matrix by Gauss-Jordan elimination.
 * @param {number[][]} source
 * @returns {number[][]}
 */
function invert(source) {
  const n = source.length;
  const a = source.map((row, i) => row.slice().concat(
    Array.from({length: n}, (_, j) => Number(i === j))));
  for (let c = 0; c < n; c++) {
    let pivot = c;
    while (pivot < n && a[pivot][c] === 0) pivot++;
    assert.ok(pivot < n, "Historical 5x5 square must be invertible");
    [a[c], a[pivot]] = [a[pivot], a[c]];
    const unit = reciprocal(a[c][c]);
    for (let j = 0; j < 2 * n; j++) a[c][j] = mod(a[c][j] * unit);
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const factor = a[i][c];
      if (!factor) continue;
      for (let j = 0; j < 2 * n; j++)
        a[i][j] = mod(a[i][j] - factor * a[c][j]);
    }
  }
  return a.map(row => row.slice(n));
}
const inverses = matrices.map(invert);

/**
 * Apply Hill5 to 75 GP29 runes, with one selected source matrix per 25.
 * @param {number[]} input
 * @param {number[][][]} keys
 * @param {"column"|"row"} direction
 * @returns {number[]}
 */
function transform(input, keys, direction) {
  assert.equal(input.length, 75);
  const out = [];
  for (let section = 0; section < 3; section++) {
    const matrix = keys[section];
    for (let block = 0; block < 5; block++) {
      const v = input.slice(section * 25 + block * 5,
        section * 25 + block * 5 + 5);
      for (let i = 0; i < 5; i++) {
        let sum = 0;
        for (let j = 0; j < 5; j++) {
          sum += (direction === "column"
            ? matrix[i][j] : matrix[j][i]) * v[j];
        }
        out.push(mod(sum));
      }
    }
  }
  return out;
}
/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number[]} values */
const gloss = values => values.map(x => corpus.translit[x]).join(".");
const page55 = corpus.pages[55].indices;
const page57 = corpus.pages[57].indices;
assert.deepEqual([page55.length, page57.length], [76, 95]);
assert.equal(page55[0], 21); // NG, the source-original p54-to-p55 word carry
const original75 = page55.slice(1);
const positive = page57.slice(0, 75); // genuine published, clear GP plaintext

const sourceSquareHash = crypto.createHash("sha256")
  .update(Buffer.from(squareText, "utf8")).digest("hex");
const results = [];
for (const direction of ["column", "row"]) {
  const decoded = transform(original75, inverses, direction);
  assert.deepEqual(transform(decoded, matrices, direction), original75,
    "Full unchanged original ciphertext must re-encrypt");
  const synthetic = transform(positive, matrices, direction);
  assert.deepEqual(transform(synthetic, inverses, direction), positive,
    "Genuine 75-rune p57 native-positive plant must decode exactly");
  results.push({
    direction, decodedIoC: ioc(decoded), originalIoC: ioc(original75),
    clearPositiveIoC: ioc(positive),
    decodedIndices: decoded.join(","),
    decodedTranslit: gloss(decoded),
    originalReencryptMatches: 75, plantedRecoveryMatches: 75
  });
}
assert.ok(results.every(x => x.decodedIoC < 0.045));
console.log(JSON.stringify({
  sourceSquareSHA256: sourceSquareHash,
  sourceShape: "5x5 + centre(7x7)=5x5 + 5x5",
  physicalPage55: 55, carriedInitialIndex: page55[0],
  bodyLength: original75.length, sourceMatrixCount: matrices.length,
  results
}, null, 2));
