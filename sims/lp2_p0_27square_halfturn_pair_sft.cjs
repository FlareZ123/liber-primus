"use strict";
/**
 * Original LP2 first chapter, 27x27 half-turn paired-sum/difference gate.
 * A literal 180-degree rotation of a row-major 27x27 matrix maps rune i to 728-i.
 * This SFT checks the two keyless field-GP29 combinations selected by that
 * geometric operation. Its positive uses source-native solved p57 rune text.
 * No modified source files or output files; run under Node.js 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const source = fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"));
assert.equal(crypto.createHash("sha1").update("blob " + source.length + "\0").update(source).digest("hex"), "054f2a0f780b7d46901acbe3d9bf4f0ac1801165");
const data = JSON.parse(source.toString("utf8"));
const sections = data.pages.slice(0, 3);
assert.deepEqual(sections.map((p) => [p.page, p.indices.length]), [[0, 262], [1, 266], [2, 201]]);
const cipher = sections.flatMap((p) => p.indices);
const solved = data.pages.find((p) => p.page === 57).indices;
assert.equal(cipher.length, 729);
assert.equal(solved.length, 95);
assert.equal(cipher[364], 21); // exact source square center (14,14), GP "NG"
const n = 364;
const modulus = 29;
const inv2 = 15;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % modulus) + modulus) % modulus;
}

/** @param {readonly number[]} input @returns {{sum:number[],difference:number[]}} */
function fold(input) {
  assert.equal(input.length, 729);
  const sum = [];
  const difference = [];
  for (let i = 0; i < n; i += 1) {
    const a = input[i];
    const b = input[728 - i];
    sum.push(mod(a + b));
    difference.push(mod(a - b));
  }
  return { sum, difference };
}

/** @param {readonly number[]} input @returns {number} */
function coincidence(input) {
  const bins = Array(29).fill(0);
  for (const rune of input) bins[rune] += 1;
  return bins.reduce((acc, count) => acc + count * (count - 1), 0) / (input.length * (input.length - 1));
}

/** @param {readonly number[]} input @param {number} cap @returns {string} */
function glyphs(input, cap) {
  return input.slice(0, cap).map((i) => data.translit[i]).join(" ");
}

const original = fold(cipher);
assert.ok(Math.abs(coincidence(original.sum) - 0.03481367117730754) < 1e-14);
assert.ok(Math.abs(coincidence(original.difference) - 0.034677443768352856) < 1e-14);
const originalSumDoublets = original.sum.slice(1).filter((a, i) => a === original.sum[i]).length;
const originalDiffDoublets = original.difference.slice(1).filter((a, i) => a === original.difference[i]).length;
assert.equal(originalSumDoublets, 11);
assert.equal(originalDiffDoublets, 11);

// Every pair transforms reversibly if both output channels are retained:
// original A=(sum+difference)/2; original B=(sum-difference)/2 in GF(29).
const originalReconstructed = Array(729).fill(0);
originalReconstructed[364] = cipher[364];
for (let i = 0; i < n; i += 1) {
  originalReconstructed[i] = mod(inv2 * (original.sum[i] + original.difference[i]));
  originalReconstructed[728 - i] = mod(inv2 * (original.sum[i] - original.difference[i]));
}
assert.deepEqual(originalReconstructed, cipher);

// Independent source-native plaintext plant: the first output channel is a
// 364-rune continuation drawn from already-solved LP2 p57 symbols (repeated).
const knownPlain = Array.from({ length: n }, (_, i) => solved[i % solved.length]);
const independentOtherChannel = Array.from({ length: n }, (_, i) => mod(7 * i + 3));
const plant = Array(729).fill(0);
plant[364] = 21;
for (let i = 0; i < n; i += 1) {
  plant[i] = mod(inv2 * (knownPlain[i] + independentOtherChannel[i]));
  plant[728 - i] = mod(inv2 * (knownPlain[i] - independentOtherChannel[i]));
}
const plantedResult = fold(plant);
assert.deepEqual(plantedResult.sum, knownPlain);
assert.deepEqual(plantedResult.difference, independentOtherChannel);
assert.notDeepEqual(original.sum, knownPlain);
assert.notDeepEqual(original.difference, knownPlain);
console.log("SFT PASS: p0–p2 729 GP symbols; center NG; 364 source-rotated pairs; full two-channel inverse and p57 source-text plant");
console.log("original native p57 GP29 IoC", coincidence(solved));
console.log("original half-turn SUM GP29 IoC", coincidence(original.sum), "doublets", originalSumDoublets, "first60", glyphs(original.sum, 60));
console.log("original half-turn DIFFERENCE GP29 IoC", coincidence(original.difference), "doublets", originalDiffDoublets, "first60", glyphs(original.difference, 60));
console.log("Decision: neither single direct fold output is native-runic plaintext; the complete two-channel fold retains every source symbol but does not decode the manuscript.");
