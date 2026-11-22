"use strict";

/**
 * Universal source-control rank bound on p28 and untouched p29:
 * ANY permutation of rune positions, composed with ANY one fixed bijection
 * of 29 rune symbols, preserves each sorted unigram occupancy exactly.
 *
 * Thus no DH23-generated column shuffle, multiplication permutation,
 * page reversal, transposition or monoalphabetic power map alone can change
 * the five most common GP29 rune counts. Compare against every contiguous
 * solved-LP1-native GP29 window at the *exact original page lengths*.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number[]} indices @param {number} count */
function occupancy(indices, count) {
  const counts = new Array(29).fill(0);
  for (const value of indices) counts[value]++;
  return counts.sort((a, b) => b - a).slice(0, count).reduce((total, n) => total + n, 0);
}

/** @param {number[]} indices */
function histogram(indices) {
  const counts = new Array(29).fill(0);
  for (const value of indices) counts[value]++;
  return counts.sort((a, b) => b - a);
}

/** @param {number} length */
function nativeWindows(length) {
  const sourceSegments = solved.sections.filter(section => !section.name.startsWith("p5"));
  const ranks = [];
  for (const segment of sourceSegments) {
    const indices = [...segment.source_text]
      .filter(rune => runeToIndex.has(rune))
      .map(rune => runeToIndex.get(rune));
    for (let offset = 0; offset + length <= indices.length; offset++) {
      ranks.push({ segment: segment.name, offset,
        topFive: occupancy(indices.slice(offset, offset + length), 5) });
    }
  }
  ranks.sort((a, b) => a.topFive - b.topFive);
  return {
    windows: ranks.length,
    minimum: ranks[0],
    onePercentile: ranks[Math.floor(ranks.length / 100)].topFive,
    median: ranks[Math.floor(ranks.length / 2)].topFive,
    maximum: ranks.at(-1).topFive,
  };
}

/** @param {number} physicalPage */
function analyze(physicalPage) {
  const row = corpus.pages.find(page => page.page === physicalPage);
  assert.ok(row);
  const indices = row.indices;
  const ciphertextTopOne = occupancy(indices, 1);
  const ciphertextTopFive = occupancy(indices, 5);
  const native = nativeWindows(indices.length);
  assert.ok(native.minimum.topFive > ciphertextTopFive,
    "source-native exact-length gap should be strict");
  const modulo23OutOfRange = indices.filter(index => index >= 23).length;
  assert.equal(new Set(indices).size, 29,
    "source uses all original GP29 rune classes");
  return {
    page: physicalPage, length: indices.length,
    ciphertextTopOne, ciphertextTopFive,
    all29ClassesSeen: true,
    ciphertextIndicesOutsideDH23Field: modulo23OutOfRange,
    native, minimumFiveCountDeficit: native.minimum.topFive - ciphertextTopFive,
  };
}

const p28 = analyze(28);
const p29 = analyze(29);

/* Implementation-positive invariant: transposition + fixed alphabet key. */
const native = solved.sections.find(section => section.name === "0_koan_1");
assert.ok(native);
const control = [...native.source_text].filter(rune => runeToIndex.has(rune))
  .map(rune => runeToIndex.get(rune)).slice(0, p28.length);
assert.equal(control.length, p28.length);
const shuffledCaesar = control.slice().reverse().map(index => (index + 6) % 29);
assert.deepEqual(histogram(control), histogram(shuffledCaesar));
assert.ok(occupancy(shuffledCaesar, 5) >= p28.native.minimum.topFive);

console.log(JSON.stringify({
  rule: "For every permutation of rune positions and every single fixed GP29 symbol bijection, sorted rune occupancies cannot change.",
  significance: "This excludes that entire class as the sole direct inverse into solved-LP1-like native GP29 English, regardless of DH-derived permutation or monoalphabetic key.",
  scopeLimit: "Does not rule out changing-state alphabets, polygraphic maps, binary intermediates, side information, different language, or non-native GP29 prose.",
  p28, p29,
  nativePositive: {
    source: native.name, length: control.length,
    transformedTopFive: occupancy(shuffledCaesar, 5),
    histogramInvariance: "29/29 sorted counts preserved",
  },
}, null, 2));
