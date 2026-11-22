"use strict";

/**
 * Original LP2 red-rune tape as a 15x15 two-dimensional barcode candidate.
 * Reproduces source-order constraints for smallest compact Aztec and a
 * 16x16 Data Matrix with the 31 physical thirteen-dot groups as a border.
 * No hidden ciphertext plaintext or independently selected barcode rule.
 * Run: node sims/lp2_red225_barcode_finder_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const red = ink.pages.flatMap((page) =>
  (page.red_spans || []).flatMap((span) =>
    Array.from(span.runes, (rune) => runeToIndex.get(rune))));
const n13 = ink.pages.flatMap((page) =>
  (page.large_punctuation || []).filter((mark) => mark[1] === 13));
assert.equal(red.length, 225);
assert.equal(n13.length, 31);
assert.ok(red.every((x) => Number.isInteger(x) && x >= 0 && x < 29));

/** 
 * Optimally assign one fixed arbitrary bit to each of the 29 rune identities,
 * without searching 2^29 keys: choose each identity's majority target bit.
 * @param {[number, 0|1][]} observations
 */
function allSecret(observations) {
  const counts = Array.from({length: 29}, () => [0, 0]);
  let parity = 0;
  for (const [rune, bit] of observations) {
    counts[rune][bit]++;
    parity += (rune % 2 === bit) ? 1 : 0;
  }
  return {
    required: observations.length,
    maxMatchingModules: counts.reduce((a, b) => a + Math.max(...b), 0),
    contradictions: counts.filter((c) => c[0] > 0 && c[1] > 0).length,
    gpIndexParityMatches: parity
  };
}

/** Data Matrix ECC200 16x16 with left+bottom 31-module solid L.
 * Remaining 15x15 cells are filled in source row order.
 * Alternating top row (excluding L) and right column (excluding corner)
 * impose 29 independently located bit constraints.
 * @param {number[]} tape
 */
function dataMatrix(tape) {
  const observations = [];
  for (let c = 0; c < 15; c++)
    observations.push([tape[c], Number(c % 2 === 1)]);
  for (let r = 1; r < 15; r++)
    observations.push([tape[r * 15 + 14], Number(r % 2 === 1)]);
  return allSecret(observations);
}

/** Compact Aztec 15x15 central 9x9 finder rings. The 81 cells
 * alternate dark/light by Chebyshev radius from the central module.
 * @param {number[]} tape
 */
function aztec(tape) {
  const observations = [];
  for (let r = 3; r <= 11; r++)
    for (let c = 3; c <= 11; c++)
      observations.push([
        tape[r * 15 + c],
        Number(Math.max(Math.abs(r - 7), Math.abs(c - 7)) % 2 === 0)
      ]);
  return allSecret(observations);
}
const original = {dataMatrix: dataMatrix(red), aztec: aztec(red)};
const reversed = {
  dataMatrix: dataMatrix(red.slice().reverse()),
  aztec: aztec(red.slice().reverse())
};
assert.deepEqual(original.dataMatrix, {
  required: 29, maxMatchingModules: 24, contradictions: 5, gpIndexParityMatches: 13
});
assert.deepEqual(original.aztec, {
  required: 81, maxMatchingModules: 59, contradictions: 16, gpIndexParityMatches: 38
});
assert.equal(reversed.dataMatrix.maxMatchingModules, 23);
assert.equal(reversed.aztec.maxMatchingModules, 59);

// Known-positive plant: a stationary 29-symbol codebook maps 0 to black,
// 1 to white and recovers both exact fixed patterns when planted.
const planted = new Array(225).fill(0);
for (let c = 0; c < 15; c++) planted[c] = c % 2 === 1 ? 0 : 1;
for (let r = 1; r < 15; r++) planted[r * 15 + 14] = r % 2 === 1 ? 0 : 1;
assert.equal(dataMatrix(planted).maxMatchingModules, 29);
const azPlant = new Array(225).fill(0);
for (let r = 3; r <= 11; r++)
  for (let c = 3; c <= 11; c++)
    azPlant[r * 15 + c] =
      Math.max(Math.abs(r - 7), Math.abs(c - 7)) % 2 === 0 ? 0 : 1;
assert.equal(aztec(azPlant).maxMatchingModules, 81);
console.log(JSON.stringify({
  originalSource: {redRunes: 225, thirteenDotMarks: 31},
  inputHypothesis: "source-order 15x15, one stationary secret GP29 identity-to-bit codebook",
  original, reversed,
  positives: {dataMatrix: 29, aztec: 81},
  conclusion: "Neither frozen matrix format has a legal complete finder; no LP2 plaintext/key"
}, null, 2));
