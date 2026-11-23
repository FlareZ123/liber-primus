"use strict";

/**
 * LP2 original: page-start common-reset necessary condition and higher-order
 * checks. Read-only, single-file SFT. Node.js 22, Windows 11 or other OS.
 *
 * Hypothesis: a deterministic reversible 29-symbol first-step map with the
 * identical full state (including the previous-cipher register) at the start
 * of every original physical page. An arbitrary unknown common permutation
 * of the 29 GP plaintext symbols cannot alter the page-first histogram
 * collision count, number of distinct symbols, or normalized IoC.
 *
 * Rival: changing page IVs, carried state, non-GP input, or a different
 * starting rule. This program does not assume those rivals are impossible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources");
const get = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const corpus = get("liber-primus/lp2-corpus.json");
const solved = get("external/relikd-solved-gp29-native-v1.json");
const annotation = get("liber-primus/lp2-ink-annotations.json");
const transcript = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const blocks = transcript.split("%");
assert.equal(pages.length, 55);
assert.equal(blocks.length >= 55, true);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.deepEqual(corpus.runes, solved.runes);

/** @param {number[]} symbols */
function shape(symbols) {
  const frequency = new Uint16Array(29);
  for (const v of symbols) {
    assert.ok(Number.isInteger(v) && v >= 0 && v < 29);
    frequency[v]++;
  }
  const pairs = frequency.reduce((n, count) => n + count * (count - 1) / 2, 0);
  return {
    sampleSize: symbols.length,
    distinct: frequency.filter((n) => n > 0).length,
    maximum: Math.max(...frequency),
    collisions: pairs,
    normalizedIoC: 29 * 2 * pairs / (symbols.length * (symbols.length - 1)),
  };
}

/** @param {number} seed */
function random(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

// Each physical page is independent of source-word boundaries. A leading
// rune immediately follows a carried word when the PREVIOUS physical-page
// transcript ends with a rune, after stripping layout-only /, $, &, spaces.
const carried = pages.map((p, i) => i > 0 &&
  /[\u16a0-\u16ff]$/u.test(blocks[i - 1].replace(/[\s\/&$]+$/gu, "")));
assert.equal(carried.filter(Boolean).length, 34);
const physicalStarts = pages.map((p) => p.indices[0]);
const sourceShape = shape(physicalStarts);
assert.equal(sourceShape.collisions, 52);
assert.equal(sourceShape.distinct, 24);
assert.equal(sourceShape.normalizedIoC, 104 * 29 / (55 * 54));

// Genuine solved GP text, read in its own native one-rune-ING/IO spelling,
// with source words delineated by the original nonrune separators.
const runeNumber = new Map(solved.runes.map((rune, i) => [rune, i]));
const nativeWords = [];
for (const section of solved.sections) {
  let word = [];
  for (const rune of section.source_text) {
    const index = runeNumber.get(rune);
    if (index === undefined) {
      if (word.length) nativeWords.push(word);
      word = [];
    } else word.push(index);
  }
  if (word.length) nativeWords.push(word);
}
const bagFirst = nativeWords.map((word) => word[0]);
const bagInterior = nativeWords.flatMap((word) => word.slice(1));
assert.equal(nativeWords.length, 740);
assert.equal(bagFirst.length + bagInterior.length, 2979);
assert.equal(carried.filter((x) => !x).length, 21);

/**
 * Draw one source-native plaintext rune from a real solved word-initial
 * or within-word position, matching the original page's 21/34 type split.
 * @param {number[]} selectedIndices
 * @param {() => number} next
 */
function nativePageStarts(selectedIndices, next) {
  return selectedIndices.map((index) => {
    const bag = carried[index] ? bagInterior : bagFirst;
    return bag[Math.floor(next() * bag.length)];
  });
}

/** @param {number[]} selectedIndices @param {number} seed @param {number} trials */
function calibrate(selectedIndices, seed, trials) {
  const observed = shape(selectedIndices.map((i) => physicalStarts[i]));
  const next = random(seed);
  let belowOrEqual = 0;
  let distinctAtLeast = 0;
  let sum = 0;
  let sumSquare = 0;
  for (let j = 0; j < trials; j++) {
    const s = shape(nativePageStarts(selectedIndices, next));
    belowOrEqual += +(s.collisions <= observed.collisions);
    distinctAtLeast += +(s.distinct >= observed.distinct);
    sum += s.normalizedIoC;
    sumSquare += s.normalizedIoC ** 2;
  }
  const mean = sum / trials;
  return {
    observed,
    pageCarryCount: selectedIndices.filter((i) => carried[i]).length,
    trials,
    seed: "0x" + (seed >>> 0).toString(16),
    nativeMeanIoC: mean,
    nativeSdIoC: Math.sqrt(sumSquare / trials - mean ** 2),
    collisionsAtMostObserved: belowOrEqual,
    collisionLowerPlusOne: (belowOrEqual + 1) / (trials + 1),
    distinctAtLeastObserved: distinctAtLeast,
    distinctUpperPlusOne: (distinctAtLeast + 1) / (trials + 1),
  };
}

const allIndices = pages.map((p, i) => i);
const all = calibrate(allIndices, 0x2194e39f, 90000);
const first26 = calibrate(allIndices.slice(0, 26), 0x91e10da5, 80000);
const last29 = calibrate(allIndices.slice(26), 0x91e10da5, 80000);
const redPageStarts = new Set(annotation.pages.filter((p) =>
  p.page <= 55 && (p.red_spans || []).some((s) => s.start === 0))
  .map((p) => p.page));
const withoutRed = calibrate(allIndices.filter((i) =>
  !redPageStarts.has(pages[i].page)), 0x7bdec991, 80000);

// Full all-secret fixed output-permutation positive regression: the first-step
// alphabet may be unknown, yet its exact equality and collision profile is
// invariant. The planted inverse is 7^-1=25 mod 29.
const plant = nativePageStarts(allIndices, random(0x5117cffe));
const secret = plant.map((x) => (7 * x + 3) % 29);
const decoded = secret.map((x) => (25 * ((x - 3 + 29) % 29)) % 29);
assert.deepEqual(decoded, plant);
assert.deepEqual(shape(secret), shape(plant));

// The original second-order counts are descriptive and are intentionally
// not used to fit the page-reset hypothesis.
function secondOrder(pageSet) {
  const counts = { lag2: 0, lag3: 0, abab: 0, abcab: 0 };
  for (const page of pageSet) {
    const c = page.indices;
    for (let j = 2; j < c.length; j++) {
      if (c[j] === c[j - 2]) counts.lag2++;
      if (j >= 3) {
        if (c[j] === c[j - 3]) counts.lag3++;
        if (c[j] === c[j - 2] && c[j - 1] === c[j - 3])
          counts.abab++;
      }
      if (j >= 4 && c[j] === c[j - 3] &&
          c[j - 1] === c[j - 4]) counts.abcab++;
    }
  }
  return counts;
}
const higherOrder = secondOrder(pages);
assert.deepEqual(higherOrder, {
  lag2: 435, lag3: 434, abab: 12, abcab: 18,
});

console.log(JSON.stringify({
  claim: "key-independent necessary-condition failure for a shared fixed " +
    "complete physical-page start state and one fixed bijective output alphabet",
  original: {
    pages: 55,
    runes: 12956,
    carries: 34,
    sourceShape,
    higherOrder,
  },
  solvedNative: {
    sections: solved.sections.length,
    totalRunes: 2979,
    sourceWords: nativeWords.length,
    firstAndInterior: [bagFirst.length, bagInterior.length],
  },
  test: { all, first26, last29, withoutRed },
  positive: { plantShape: shape(plant), recovered: decoded.length },
  caveat: "Reference null samples real solved GP word-initial/interior runes " +
    "with replacement; it is not a universal language-model probability. " +
    "Changing page IV/carry, nonbijective starts, or a nonnative plaintext " +
    "register are not tested."
}, null, 2));
console.log("PASS: original 55-page all-secret fixed-reset source gate");
