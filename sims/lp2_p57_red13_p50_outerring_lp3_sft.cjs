"use strict";

/**
 * Agent32: original LP2 p57 red13 -> p50 32x8 outer-ring ASCII locator.
 *
 * This read-only SFT preserves the physically printed 256 base60 cells and
 * tests a fixed, clockwise top-left perimeter read. It records one short
 * ASCII-like candidate and rejects the simplest p3-as-running-key consumer.
 * The candidate remains exploratory; this does not recover LP2 plaintext.
 *
 * Node.js 22: node sims/lp2_p57_red13_p50_outerring_lp3_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relativePath */
const load = relativePath => JSON.parse(fs.readFileSync(
  path.join(root, relativePath), "utf8"
));

const grid = load("resources/liber-primus/base60-grid.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.alphabet.length, 60);
const digits = new Map([...grid.alphabet].map((symbol, i) => [symbol, i]));
const matrix = grid.rows.map(row => row.map(cell =>
  60 * digits.get(cell[0]) + digits.get(cell[1])
));
assert.deepEqual(matrix, grid.byte_rows);

/** @type {Array<[number, number]>} */
const outer = [];
for (let col = 0; col < 8; col++) outer.push([0, col]);
for (let row = 1; row < 32; row++) outer.push([row, 7]);
for (let col = 6; col >= 0; col--) outer.push([31, col]);
for (let row = 30; row >= 1; row--) outer.push([row, 0]);
assert.equal(outer.length, 76);

const page57Ink = ink.pages.find(item => item.page === 57);
assert.deepEqual(page57Ink.large_punctuation, [
  [7, 13, "red"],
  [95, 23, "red"]
]);
const start = page57Ink.large_punctuation[0][1] - 1;
const tripletCells = outer.slice(start, start + 3);
const tripletTokens = tripletCells.map(([r, c]) => grid.rows[r][c]);
const tripletBytes = tripletCells.map(([r, c]) => matrix[r][c]);
const tripletAscii = String.fromCharCode(...tripletBytes);
assert.deepEqual(tripletCells, [[5, 7], [6, 7], [7, 7]]);
assert.deepEqual(tripletTokens, ["1G", "1K", "0p"]);
assert.deepEqual(tripletBytes, [76, 80, 51]);
assert.equal(tripletAscii, "LP3");

const directions = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];
const sourceFamily = new Set(["LP1", "LP2", "LP3", "LP4"]);
let eligibleOrderedTriples = 0;
const allDirectionsFamilyHits = [];
for (let r = 0; r < 32; r++) {
  for (let c = 0; c < 8; c++) {
    for (const [dr, dc] of directions) {
      if (r + 2 * dr < 0 || r + 2 * dr >= 32 ||
          c + 2 * dc < 0 || c + 2 * dc >= 8) continue;
      eligibleOrderedTriples++;
      const word = String.fromCharCode(
        matrix[r][c], matrix[r + dr][c + dc],
        matrix[r + 2 * dr][c + 2 * dc]
      );
      if (sourceFamily.has(word)) {
        allDirectionsFamilyHits.push({
          word, row: r + 1, col: c + 1, dr, dc
        });
      }
    }
  }
}
assert.equal(eligibleOrderedTriples, 1584);
assert.deepEqual(allDirectionsFamilyHits, [
  {word: "LP3", row: 6, col: 8, dr: 1, dc: 0}
]);

const flattened = matrix.flat();
/** @param {number} code */
const count = code => flattened.filter(x => x === code).length;
const expectedFamilyHitsUnderPermutation =
  eligibleOrderedTriples * count(76) * count(80) *
  [49, 50, 51, 52].reduce((sum, x) => sum + count(x), 0) /
  (256 * 255 * 254);

/** @param {number[]} seq */
function ioc(seq) {
  const frequency = Array(29).fill(0);
  for (const index of seq) frequency[index]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
/** @param {number} n */
const page = n => corpus.pages.find(row => row.page === n).indices;
const key = page(3);
const target = page(49).concat(page(51));
const positivePlain = page(57);
assert.equal(key.length, 217);
assert.equal(target.length, 158);
assert.equal(positivePlain.length, 95);
const encryptedPositive = positivePlain.map((v, i) => (v + key[i]) % 29);
assert.deepEqual(
  encryptedPositive.map((v, i) => (v - key[i] + 29) % 29),
  positivePlain
);
const negativeTrialIoC = {
  CminusP3: ioc(target.map((v, i) => (v - key[i] + 29) % 29)),
  CplusP3: ioc(target.map((v, i) => (v + key[i]) % 29))
};
assert.ok(negativeTrialIoC.CminusP3 < 0.04);
assert.ok(negativeTrialIoC.CplusP3 < 0.04);

console.log(JSON.stringify({
  status: "exploratory candidate, no recovered unknown plaintext",
  outerPerimeterCells: outer.length,
  originalP57OpeningMarker: page57Ink.large_punctuation[0],
  selectedOuterPosition1: start + 1,
  selectedOriginalCells1: tripletCells.map(([r, c]) => [r + 1, c + 1]),
  tripletTokens,
  tripletBytes,
  tripletAscii,
  allDirectionFamilyHits: allDirectionsFamilyHits,
  expectedFamilyHitsUnderBytePermutation: expectedFamilyHitsUnderPermutation,
  caveat: "Post-hoc source family; expectation is not a calibrated p-value",
  p3KeyLength: key.length,
  originalFlankRunes: target.length,
  originalFlankIoC: ioc(target),
  negativeTrialIoC,
  solvedP57KnownKeyPlantRecovered: true
}, null, 2));
