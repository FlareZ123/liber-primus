"use strict";

/**
 * LP2 pp33-39 all-secret full GF(29²) state-enumeration obstruction.
 *
 * Original chapter contains exactly 1,680 GP29 symbols = 840 symbol pairs.
 * The externally attested 2013 BASE29 quadratic yields a primitive GF841
 * element and exactly 840 nonzero field states. Could these 1,680 runes be a
 * complete once-each enumeration of the nonzero field states?
 *
 * This test only checks all 840 pairs for uniqueness, independent of any
 * unknown reversible 29-rune alphabet, field basis, or state enumeration.
 * Both contiguous-half and adjacent-pair readings are source-simple.
 * Positive control visits all 840 nonzero coordinate pairs exactly once.
 * Cross-group wrong-order control creates two duplicate coordinates.
 *
 * Node.js 22: node sims/lp2_p33_39_gf841_completepair_sft.cjs
 * Read-only source-exact CJS SFT, no flags or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const N = 840;
const F = 29;
const chapter = corpus.pages.filter(p =>
  p.page >= 33 && p.page <= 39).flatMap(p => p.indices);
assert.equal(chapter.length, 2 * N);
assert.deepEqual(corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);

/**
 * Check exact source pair collisions without estimating distributions.
 * No field generator or alphabet secret can resolve a duplicate pair while
 * using a single stationary bijection of all 841 field values.
 *
 * @param {number[]} stream
 * @param {"half" | "adjacent"} convention
 * @returns {{distinct:number,duplicates:number,repeatedPairTypes:number,
 *             maxMultiplicity:number,zeroPairOccurrences:number}}
 */
function audit(stream, convention) {
  assert.equal(stream.length, 2 * N);
  const counts = new Uint16Array(F * F);
  for (let i = 0; i < N; i++) {
    const a = stream[convention === "half" ? i : 2 * i];
    const b = stream[convention === "half" ? i + N : 2 * i + 1];
    assert.ok(Number.isInteger(a) && a >= 0 && a < F);
    assert.ok(Number.isInteger(b) && b >= 0 && b < F);
    counts[a * F + b]++;
  }
  let distinct = 0;
  let repeatedPairTypes = 0;
  let maxMultiplicity = 0;
  for (const count of counts) {
    if (count > 0) distinct++;
    if (count > 1) repeatedPairTypes++;
    maxMultiplicity = Math.max(maxMultiplicity, count);
  }
  return {
    distinct,
    duplicates: N - distinct,
    repeatedPairTypes,
    maxMultiplicity,
    zeroPairOccurrences: counts[0]
  };
}

const originalHalf = audit(chapter, "half");
const originalAdjacent = audit(chapter, "adjacent");
assert.deepEqual(originalHalf, {
  distinct: 532, duplicates: 308, repeatedPairTypes: 210,
  maxMultiplicity: 5, zeroPairOccurrences: 0
});
assert.deepEqual(originalAdjacent, {
  distinct: 518, duplicates: 322, repeatedPairTypes: 218,
  maxMultiplicity: 6, zeroPairOccurrences: 0
});

// Enumerate all the 29²-1 nonzero field elements as canonical (a,b) pairs.
const coordinates = Array.from({length: F * F}, (_, i) =>
  [Math.floor(i / F), i % F]).filter(([a,b]) => a !== 0 || b !== 0);
assert.equal(coordinates.length, N);
const planted = [
  ...coordinates.map(pair => pair[0]),
  ...coordinates.map(pair => pair[1])
];
const positive = audit(planted, "half");
assert.deepEqual(positive, {
  distinct: 840, duplicates: 0, repeatedPairTypes: 0,
  maxMultiplicity: 1, zeroPairOccurrences: 0
});

// Change only the alignment of two second-component coordinates.
const wrongAlignment = planted.slice();
[wrongAlignment[N], wrongAlignment[N + 30]] =
  [wrongAlignment[N + 30], wrongAlignment[N]];
const wrong = audit(wrongAlignment, "half");
assert.deepEqual(wrong, {
  distinct: 838, duplicates: 2, repeatedPairTypes: 2,
  maxMultiplicity: 2, zeroPairOccurrences: 0
});

console.log(JSON.stringify({
  original: {
    interval: "LP2 physical pp33–39 in source rune order",
    runeCount: chapter.length,
    impliedPairs: N,
    expectedUniqueNonzeroGF841: N,
    coordinateChoices: ["contiguous 840-symbol halves", "adjacent pairs"],
    half: originalHalf,
    adjacent: originalAdjacent
  },
  positive,
  wrongAlignment: wrong,
  conclusion: "The source is not one exhaustive 840-state GF(29²) listing under either literal pairwise packing; no field basis or fixed secret bijection repairs duplicate coordinate pairs. Other state-clock meanings remain possible."
}, null, 2));
