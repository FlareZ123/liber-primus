"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** Return second-rune offsets of within-page adjacent equal ciphertext runes. @param {number[]} glyphs */
function repeatOffsets(glyphs) {
  const hits = [];
  for (let i = 1; i < glyphs.length; i++) {
    if (glyphs[i] === glyphs[i - 1]) hits.push(i);
  }
  return hits;
}

/** Euclidean GCD of nonnegative integers. @param {number} a @param {number} b */
function gcd(a, b) {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/**
 * Does there exist a page-local starting phase so that every equality event
 * falls *between* fixed-width k-blocks? The block boundary second offset
 * has the same residue mod k for all such events.
 * @param {number[]} repeats Second-rune offsets
 * @param {number} k Block width
 */
function canPlaceAtBlockBoundaries(repeats, k) {
  assert.ok(Number.isInteger(k) && k >= 2);
  return repeats.length < 2 || repeats.every(i => i % k === repeats[0] % k);
}

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length !== 0);
assert.equal(pages.length, 55);
const runeCount = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(runeCount, 12956);

const counts = pages.map(p => ({page: p.page, n: p.indices.length, hits: repeatOffsets(p.indices)}));
const allRepeatCount = counts.reduce((n, p) => n + p.hits.length, 0);
assert.equal(allRepeatCount, 86);
const p3 = counts.find(p => p.page === 3);
assert.deepEqual(p3.hits, [53, 180, 203]);
const gaps = [p3.hits[1] - p3.hits[0], p3.hits[2] - p3.hits[1]];
assert.deepEqual(gaps, [127, 23]);
assert.equal(gcd(...gaps), 1);

// If all equal-adjacent events occur at block boundaries, k must divide
// every difference between their second-rune positions. Here gcd=1,
// so no k>=2 is possible, even if p3's initial phase is unknown.
for (let k = 2; k <= 1024; k++) {
  assert.equal(canPlaceAtBlockBoundaries(p3.hits, k), false);
}

// Synthetic positive control: repeat events only at i=5,10,15 are
// legal k=5 block-boundary transitions, including a free starting phase.
const positive = repeatOffsets([1, 2, 3, 4, 5, 5, 7, 8, 9, 10, 10, 12, 13, 14, 15, 15, 17]);
assert.deepEqual(positive, [5, 10, 15]);
assert.equal(canPlaceAtBlockBoundaries(positive, 5), true);

// Even granting a fresh, optimally chosen phase for every original page,
// strict 5-wide blocks need at least 34 out-of-boundary exceptions.
let maxFittable = 0;
let failingPages = 0;
for (const p of counts) {
  const byPhase = Array(5).fill(0);
  for (const i of p.hits) byPhase[i % 5]++;
  const best = Math.max(...byPhase);
  maxFittable += best;
  if (best < p.hits.length) failingPages++;
}
assert.equal(maxFittable, 52);
assert.equal(failingPages, 19);
assert.equal(allRepeatCount - maxFittable, 34);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json",
  runeCount, withinPageDoublets: allRepeatCount,
  p3SecondRuneOffsets: p3.hits, p3ConsecutiveGaps: gaps,
  p3Gcd: gcd(...gaps),
  conclusion: "No fixed width >=2 can constrain every p3 doublet to a block boundary, under any page-local phase",
  fixedWidth5: {maximumBoundaryDoubletsAcrossPages: maxFittable,
    minimumExceptionsAcrossPages: 34, failingPages},
  positiveControl: "passed",
}, null, 2));
