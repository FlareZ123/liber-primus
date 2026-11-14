"use strict";
/**
 * Cross-round, source-dimension prime-rank relation.
 *
 * Reconstructs the independently published 2012 first-image dimensions,
 * the signed 2016 tree JPEG dimensions, and the original LP2 p32 GP-prime
 * row/column checksums. Checks the retrospective 7-prime-rank mapping.
 *
 * Source for 2012 original image dimensions (509x503):
 * https://commons.wikimedia.org/wiki/File:Cicada3301%27s_First_Message.jpg
 * Source for 2014 Stage10 image filenames:
 * im-results/2014-stage10-three-images-lp1-source-handoff.md
 *
 * Run from repository root: node sims/lp2_crossround_prime_image_dimensions_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const jpeg = require("./vendor/jpeg-js-decoder.cjs");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);

const gpPrimes = p32.map(index => corpus.prime[index]);
const row = gpPrimes.slice(0, 11);
const column = Array.from({length: 11}, (_, i) => gpPrimes[11 * i]);
const sums = [row.reduce((a, b) => a + b, 0),
  column.reduce((a, b) => a + b, 0)];
assert.deepEqual(sums, [563, 569]);

const jpegBytes = fs.readFileSync(path.join(
  root, "resources/historical/cicada2016-4gq25.jpg"
));
const tree = jpeg(jpegBytes, {useTArray: true, formatAsRGBA: false,
  maxResolutionInMP: 2});
assert.deepEqual([tree.width, tree.height], sums);

const firstImage = {width: 509, height: 503};
const sourceFiles = [107, 167, 229];
assert.equal(sourceFiles.reduce((a, b) => a + b, 0), firstImage.height);

/** @param {number} max Inclusive upper bound. @returns {number[]} */
function primesThrough(max) {
  /** @type {number[]} */
  const numbers = [];
  for (let candidate = 2; candidate <= max; candidate++) {
    if (numbers.every(p => p * p > candidate || candidate % p !== 0))
      numbers.push(candidate);
  }
  return numbers;
}
const primeNumbers = primesThrough(569);
/** @param {number} p A prime. @returns {number} One-based rank. */
function rank(p) {
  const index = primeNumbers.indexOf(p);
  assert.notEqual(index, -1);
  return index + 1;
}
assert.deepEqual(
  [rank(firstImage.height), rank(firstImage.width),
    rank(tree.width), rank(tree.height)],
  [96, 97, 103, 104]
);
const sevenRankSuccessors = [
  primeNumbers[rank(firstImage.height) + 7 - 1],
  primeNumbers[rank(firstImage.width) + 7 - 1]
];
assert.deepEqual(sevenRankSuccessors, [tree.width, tree.height]);
assert.equal(rank(tree.width) - rank(firstImage.height), 7);
assert.equal(rank(tree.height) - rank(firstImage.width), 7);
assert.equal(tree.width - firstImage.height, 60);
assert.equal(tree.height - firstImage.width, 60);

/* Positive independent sanity check: the neighboring +5 and +6 ranks
 * are different dimensions; the exact +7 reading is distinguishable. */
for (let offset of [5, 6, 8]) {
  assert.notDeepEqual([
    primeNumbers[rank(firstImage.height) + offset - 1],
    primeNumbers[rank(firstImage.width) + offset - 1]
  ], [tree.width, tree.height]);
}
console.log(JSON.stringify({
  original_2012_dimensions: firstImage,
  original_2016_dimensions: [tree.width, tree.height],
  p32_prime_row: row,
  p32_prime_column: column,
  p32_prime_sums: sums,
  stage10_source_filenames: sourceFiles,
  stage10_sum: 503,
  source_prime_ranks: [96, 97, 103, 104],
  exact_rank_shift: 7,
  historical_2014_square_side: 7,
  inference: "retrospective original-artifact correspondence; no LP2 decoder"
}, null, 2));
