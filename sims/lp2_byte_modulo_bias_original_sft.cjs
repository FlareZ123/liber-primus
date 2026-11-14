'use strict';

/**
 * Original LP2 8-bit modulo-sampling fingerprint, read-only SFT.
 * Run in the repository root with Node.js 22 or later.
 *
 * Two narrow hypotheses:
 *   C_i = B_i % 29, B_i iid uniform bytes (all source rune positions).
 *   R_i = B_i % 28, with R_i the ascending rank of a nonrepeat
 *         successor among the 28 symbols other than its predecessor.
 *
 * The second hypothesis conditions on the original 86 repeat exceptions.
 * It assumes exception filtering is rank-independent. No hidden alphabet,
 * reset key or decoding operation is inferred.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * @param {readonly number[]} counts
 * @param {(i: number) => number} probability
 * @returns {number}
 */
function pearson(counts, probability) {
  const total = counts.reduce((sum, x) => sum + x, 0);
  return counts.reduce((sum, observed, i) => {
    const expected = total * probability(i);
    return sum + (observed - expected) ** 2 / expected;
  }, 0);
}

/**
 * @param {number} actual
 * @param {number} total
 * @param {number} probability
 * @returns {number}
 */
function binomialZ(actual, total, probability) {
  return (actual - total * probability) /
    Math.sqrt(total * probability * (1 - probability));
}

/** @param {readonly number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const corpusPath = path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
);
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const glyphCounts = Array(29).fill(0);
const rankCounts = Array(28).fill(0);
let pageTransitions = 0;
let repeatedTransitions = 0;
let ordinaryTransitions = 0;

for (const page of pages) {
  const digits = page.indices;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    glyphCounts[digit]++;
  }
  for (let i = 1; i < digits.length; i++) {
    const before = digits[i - 1];
    const after = digits[i];
    pageTransitions++;
    if (before === after) {
      repeatedTransitions++;
      continue;
    }
    const rank = after < before ? after : after - 1;
    rankCounts[rank]++;
    ordinaryTransitions++;
    assert.equal(rank + (rank >= before ? 1 : 0), after);
  }
}

const runeCount = sum(glyphCounts);
assert.equal(pages.length, 55);
assert.equal(runeCount, 12956);
assert.equal(pageTransitions, 12901);
assert.equal(repeatedTransitions, 86);
assert.equal(ordinaryTransitions, 12815);
assert.equal(sum(rankCounts), ordinaryTransitions);
assert.equal(sum(glyphCounts.slice(24)), 2305);
assert.equal(sum(rankCounts.slice(0, 4)), 1864);

/* No postselected alphabet: printed GP index order is retained. */
const gpLowFive = sum(glyphCounts.slice(24)); // B % 29: last five residues get 8/256.
const rankHighFour = sum(rankCounts.slice(0, 4)); // B % 28: first four get 10/256.
const direct = {
  sample: 'all original unknown GP29 rune positions',
  count: runeCount,
  observedLastFive: gpLowFive,
  expectedLastFiveByteModulo: runeCount * 40 / 256,
  observedLastFiveZUnderByteModulo: binomialZ(gpLowFive, runeCount, 40 / 256),
  pearsonUniform: pearson(glyphCounts, () => 1 / 29),
  pearsonByteModulo: pearson(glyphCounts, (i) => (i < 24 ? 9 : 8) / 256),
};
const predecessor = {
  sample: 'within-page strictly nonrepeating original transitions',
  count: ordinaryTransitions,
  observedFirstFour: rankHighFour,
  expectedFirstFourByteModulo: ordinaryTransitions * 40 / 256,
  observedFirstFourZUnderByteModulo: binomialZ(rankHighFour, ordinaryTransitions, 40 / 256),
  pearsonUniform: pearson(rankCounts, () => 1 / 28),
  pearsonByteModulo: pearson(rankCounts, (i) => (i < 4 ? 10 : 9) / 256),
};

/* Exhaustive-byte implementation positive: each byte 0..255 appears exactly 50 times. */
const positiveBytes = [];
for (let repetition = 0; repetition < 50; repetition++) {
  for (let byte = 0; byte < 256; byte++) positiveBytes.push(byte);
}
const positive29 = Array(29).fill(0);
const positive28 = Array(28).fill(0);
for (const byte of positiveBytes) {
  positive29[byte % 29]++;
  positive28[byte % 28]++;
}
assert.deepStrictEqual(positive29, Array.from({ length: 29 }, (_, i) => i < 24 ? 450 : 400));
assert.deepStrictEqual(positive28, Array.from({ length: 28 }, (_, i) => i < 4 ? 500 : 450));
assert(Math.abs(binomialZ(sum(positive29.slice(24)), positiveBytes.length, 40 / 256)) < 1e-10);
assert(Math.abs(binomialZ(sum(positive28.slice(0, 4)), positiveBytes.length, 40 / 256)) < 1e-10);

/* Preserve the empirical numbers rather than a floating-point significance label. */
assert(Math.abs(direct.observedLastFiveZUnderByteModulo - 6.790065797868742) < 1e-10);
assert(Math.abs(predecessor.observedFirstFourZUnderByteModulo + 3.3657614544631898) < 1e-10);
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  pageCount: pages.length,
  pageTransitions,
  repeatedTransitions,
  direct,
  predecessor,
  verdict: 'Neither canonical direct byte%29 nor canonical ascending skip-predecessor byte%28 sampling explains the original observed residue bias under iid uniform-byte and rank-independent-exception assumptions. This does not identify a cipher or key.'
}, null, 2));
