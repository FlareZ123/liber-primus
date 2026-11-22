"use strict";
/**
 * Source-count exactness gate for the p49-51 polynomial's 16+238 factorization:
 * does p3's original 16-rune title and p36's 238-rune page directly encode
 * the two factor coefficient vectors, even after any secret alphabet
 * bijection and arbitrary permutation of the vector positions?
 * Single runnable test from the repository root or any working directory.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} name */
function read(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}
const grid = read("resources/liber-primus/base60-grid.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const coefficients = grid.byte_rows.flat().slice().reverse().map((v) => v % 29);
assert.equal(coefficients.length, 256);
assert.equal(coefficients[255], 0);
assert.equal(coefficients[254], 28);
/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      output[i + j] = (output[i + j] + a[i] * b[j]) % 29;
    }
  }
  return output;
}
/** @param {number} x */
function inverse(x) {
  for (let k = 1; k < 29; k += 1) if ((x * k) % 29 === 1) return k;
  throw Error("No GF29 inverse for given coefficient");
}
let small = [28];
for (const factor of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]]) {
  small = multiply(small, factor);
}
assert.equal(small.length, 17);
const numerator = coefficients.slice();
const large = Array(numerator.length - small.length + 1).fill(0);
const scale = inverse(small.at(-1));
for (let i = numerator.length - 1; i >= small.length - 1; i -= 1) {
  const q = (numerator[i] * scale) % 29;
  large[i - (small.length - 1)] = q;
  for (let j = 0; j < small.length; j += 1) {
    const idx = i - (small.length - 1) + j;
    numerator[idx] = (numerator[idx] - q * small[j] + 29 * 29) % 29;
  }
}
while (large.at(-1) === 0) large.pop();
assert.deepEqual(numerator.slice(0, small.length - 1), Array(16).fill(0));
assert.equal(large.length, 239);
assert.equal(large.at(-1), 1);
const product = multiply(small, large);
assert.deepEqual(product, coefficients.slice(0, -1));
/** @param {number[]} values */
function alphabetCountSpectrum(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v] += 1;
  return counts.sort((a, b) => a - b);
}
/** @param {string} label @param {number[]} source @param {number[]} factor */
function compare(label, source, factor) {
  assert.equal(source.length, factor.length);
  const sourceCounts = alphabetCountSpectrum(source);
  const factorCounts = alphabetCountSpectrum(factor);
  const exact = sourceCounts.every((v, i) => v === factorCounts[i]);
  assert.equal(exact, false,
    "Source-coefficient multiplicity spectra unexpectedly identical");
  const maxAgreementWithFreeRelabelAndPositionOrder = sourceCounts.reduce(
    (sum, count, i) => sum + Math.min(count, factorCounts[i]), 0);
  const direct = source.filter((v, i) => v === factor[i]).length;
  const reverse = source.filter((v, i) => v === factor.at(-1 - i)).length;
  return {label, positions: source.length, directEqual: direct,
    reversedEqual: reverse, exactBijectionEvenAfterReordering: exact,
    maximumMatchingSymbolsWithSecretAlphabetAndFreeReordering:
      maxAgreementWithFreeRelabelAndPositionOrder,
    minimumUnmatchedSymbols: source.length -
      maxAgreementWithFreeRelabelAndPositionOrder,
    sourceCounts, factorCounts};
}
const tests = [
  compare("p3 red16 vs small product's 16 nonleading coefficients",
    corpus.pages[3].indices.slice(0, 16), small.slice(0, -1)),
  compare("p36 238 runes vs Q238's 238 nonleading coefficients",
    corpus.pages[36].indices, large.slice(0, -1))
];
/** @param {number[]} v */
function coincidence(v) {
  const count = Array(29).fill(0);
  for (const n of v) count[n] += 1;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) /
    (v.length * (v.length - 1));
}
const derivative = large.slice(1).map((v, i) => (v * (i + 1)) % 29);
assert.equal(derivative.length, 238);
const p36 = corpus.pages[36].indices;
const derivativeDirectAdditive = [];
for (const reversed of [false, true]) {
  const pad = reversed ? derivative.slice().reverse() : derivative;
  for (const sign of [1, -1]) {
    const decoded = p36.map((r, i) => (r + sign * pad[i] + 29) % 29);
    const ioc = coincidence(decoded);
    assert.ok(ioc > 0.03 && ioc < 0.04);
    derivativeDirectAdditive.push({reversed, sign, ioc});
  }
}
// Calibrate the otherwise potentially appealing "222/238" count match
// against every original 238-rune book window and all physical-page
// 238-rune prefixes. This exact upper bound already permits arbitrary
// alphabet relabeling and *arbitrary position permutation*.
/** @param {number[]} bins @returns {number[]} */
function sortedCounts(bins) { return bins.slice().sort((a, b) => a - b); }
/** @param {number[]} spectrum @returns {number} */
function optimalAgreement(spectrum) {
  const target = alphabetCountSpectrum(large.slice(0, -1));
  const sorted = sortedCounts(spectrum);
  return sorted.reduce((sum, count, i) => sum + Math.min(count, target[i]), 0);
}
/** @param {number[]} values @returns {number[]} */
function bins(values) {
  const counts = Array(29).fill(0);
  for (const digit of values) counts[digit]++;
  return counts;
}
const p36Agreement = optimalAgreement(bins(p36));
assert.equal(p36Agreement, 222);
const allRunes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(allRunes.length, 12956);
const windowSize = 238;
const rolling = bins(allRunes.slice(0, windowSize));
const scores = [];
for (let offset = 0; offset + windowSize <= allRunes.length; offset++) {
  if (offset > 0) {
    rolling[allRunes[offset - 1]]--;
    rolling[allRunes[offset + windowSize - 1]]++;
  }
  scores.push(optimalAgreement(rolling));
}
assert.equal(scores.length, 12719);
const pageControls = corpus.pages.filter(p => p.page <= 55 &&
  p.indices.length >= windowSize).map(p => ({
    page: p.page,
    agreement: optimalAgreement(bins(p.indices.slice(0, windowSize))),
  }));
assert.equal(pageControls.length, 36);
assert.equal(pageControls.filter(p => p.agreement <= p36Agreement).length, 1);
assert.equal(scores.filter(s => s < p36Agreement).length, 104);
assert.equal(scores.filter(s => s === p36Agreement).length, 144);
assert.equal(scores.filter(s => s >= p36Agreement).length, 12615);
const calibration = {
  p36Agreement, pagePrefixComparisons: pageControls.length,
  p36RanksLastAmongPagePrefixComparisons: true,
  windowSize, bookWindowComparisons: scores.length,
  strictlyBelowP36: 104, tiedWithP36: 144, atLeastP36: 12615,
  minimumBookAgreement: Math.min(...scores),
  maximumBookAgreement: Math.max(...scores),
  originalSourceMedian: scores.slice().sort((a, b) => a - b)[
    Math.floor(scores.length / 2)],
};
console.log(JSON.stringify({
  source: "original base60 pp49-51, physical p3 first16 and physical p36 entire page",
  factor16CoefficientsAscending: small,
  Q238Degree: large.length - 1,
  allSourceFactorCoefficientsMultiplyExactly: true,
  tests,
  derivativeIoC: coincidence(derivative),
  p36OriginalIoC: coincidence(p36),
  derivativeDirectAdditive,
  calibration,
  decision: "Neither 16+238 source-rune vector can equal its exact polynomial-factor coefficients under any global alphabet permutation, even allowing arbitrary position permutation. No original plaintext/key recovered."
}, null, 2));
