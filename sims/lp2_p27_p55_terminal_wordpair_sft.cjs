"use strict";

/**
 * LP2 original p27/p55 repeated printed-word-pair SFT.
 *
 * Uses the canonical 55 rune-bearing unknown physical pages and the
 * published continuous-word parser. Computes exact random-token-order
 * expectation and a terminal-pair recurrence upper bound from the observed
 * word-frequency multiset. These are conditional baselines, not discovery-
 * adjusted p-values or evidence of recovered plaintext.
 *
 * Windows 11 / Node.js 22 CommonJS. Read-only, deterministic.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus, physicalLP2Page } = require("./lp2_word_pages.cjs");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const original = corpus.pages.filter((page) =>
  page.page <= 55 && page.indices.length);
const source = original.flatMap((page) => page.indices);
const parsed = parseSharedCorpus();
const words = parsed.words.map((word) => word.runes);
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

assert.equal(source.length, 12956);
assert.equal(words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(original.length, 55);
const flattened = words.flatMap((word) =>
  Array.from(word, (rune) => runeToIndex.get(rune)));
assert.deepEqual(flattened, source, "The original words must cover every source rune");

const counts = new Map();
for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);

const bigrams = new Map();
for (let index = 0; index + 1 < words.length; index++) {
  const key = words[index] + "|" + words[index + 1];
  const positions = bigrams.get(key) || [];
  positions.push(index);
  bigrams.set(key, positions);
}
const duplicates = Array.from(bigrams.entries()).filter(([, positions]) =>
  positions.length >= 2);
assert.equal(duplicates.length, 1, "Exactly one repeated complete word bigram");

const left = "\u16de\u16c4\u16a2"; // ᛞᛄᚢ
const right = "\u16d2\u16d6\u16c1"; // ᛒᛖᛁ
const pairKey = left + "|" + right;
assert.equal(duplicates[0][0], pairKey);
assert.deepEqual(duplicates[0][1], [1462, 2894]);
assert.equal(counts.get(left), 2);
assert.equal(counts.get(right), 2);

const six = [23, 11, 1, 17, 18, 10];
assert.deepEqual(corpus.pages[27].indices.slice(28, 34), six);
assert.deepEqual(corpus.pages[55].indices.slice(70, 76), six);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(words[words.length - 2], left);
assert.equal(words[words.length - 1], right);
assert.equal(physicalLP2Page(parsed.words[1462].startPage), 27);
assert.equal(physicalLP2Page(parsed.words[2894].startPage), 55);

// For a uniformly shuffled word sequence with the exact observed word
// counts, E[sum_{u,v} choose(count(uv),2)] is computed exactly, including
// overlapping same-token bigrams (uuu). Markov's inequality gives
// P(any repeated complete printed-word bigram) <= that expectation.
/** @param {number} x */
const fall2 = (x) => x * (x - 1);
/** @param {number} x */
const fall3 = (x) => fall2(x) * (x - 2);
/** @param {number} x */
const fall4 = (x) => fall3(x) * (x - 3);
const N = words.length;
let f2sum = 0;
let f2squared = 0;
let f3sum = 0;
let f4sum = 0;
let terminalSame = 0;
for (const frequency of counts.values()) {
  f2sum += fall2(frequency);
  f2squared += fall2(frequency) ** 2;
  f3sum += fall3(frequency);
  f4sum += fall4(frequency);
  terminalSame += fall2(frequency) * (frequency - 2) ** 2;
}
const expectedRepeatedBigrams = (
  (f2sum ** 2 - f2squared + f4sum) / 2 + f3sum
) / (N * (N - 1));
// For the final ordered pair: expectation of its number of repetitions among
// all earlier pairs. It allows earlier terminal-overlapping pairs (uuu).
// P(final pair repeats elsewhere) is at most this expectation.
const expectedTerminalRecurrences = (
  f2sum ** 2 - f2squared + terminalSame
) / (N * (N - 1) * (N - 2));
const pairProbabilityIfTwoCopiesEach = 2 / (N * (N - 1));

// A more realistic, stricter conditional control keeps both original pages
// and every word-length slot fixed. The two specified three-rune tokens each
// occur exactly once on p27 and p55. Randomize only which length-three token
// occupies each of that page's length-three slots.
//
// For m length-three slots and E forward-adjacent length-three slot pairs,
// P(this specified ordered pair meets adjacently)=E/[m(m-1)].
// This differs sharply from uniformly permuting all book words and makes
// the global-token null inappropriate as a calibrated significance claim.
/** @param {number} physicalPage */
function lengthThreeSlotCount(physicalPage) {
  const units = parsed.words.filter((word) =>
    physicalLP2Page(word.startPage) === physicalPage);
  const slots = units.filter((word) => word.length === 3).length;
  let adjacent = 0;
  for (let i = 0; i + 1 < units.length; i++)
    if (units[i].length === 3 && units[i + 1].length === 3)
      adjacent++;
  return {wordSlots: units.length, threeRuneSlots: slots, adjacentSlots: adjacent,
    orderedPairProbability: adjacent / (slots * (slots - 1))};
}
const page27 = lengthThreeSlotCount(27);
const page55 = lengthThreeSlotCount(55);
assert.deepEqual(page27, {
  wordSlots: 52, threeRuneSlots: 13, adjacentSlots: 4,
  orderedPairProbability: 1 / 39
});
assert.deepEqual(page55, {
  wordSlots: 16, threeRuneSlots: 2, adjacentSlots: 1,
  orderedPairProbability: 1 / 2
});
const pageLengthConditionedProbability =
  page27.orderedPairProbability * page55.orderedPairProbability;
assert.equal(pageLengthConditionedProbability, 1 / 78);
const sameOrderInBothPagesEitherWay =
  2 * pageLengthConditionedProbability;
assert.equal(sameOrderInBothPagesEitherWay, 1 / 39);

// Exact second null: keep all 2,896 original printed word-length slots in
// their actual book order; permute identities only within equal-length word
// classes globally (no page-local conditioning). Analyze every ordered pair
// of slot lengths, including overlapping occurrences, without Monte Carlo.
/** @param {number} n @param {number} k @returns {number} */
function fallingFactorial(n, k) {
  let value = 1;
  for (let i = 0; i < k; i++) value *= n - i;
  return value;
}
const lengths = parsed.words.map((word) => word.length);
const lengthFrequency = new Map();
for (let index = 0; index < words.length; index++) {
  const length = lengths[index];
  if (!lengthFrequency.has(length)) lengthFrequency.set(length, new Map());
  const population = lengthFrequency.get(length);
  population.set(words[index], (population.get(words[index]) || 0) + 1);
}
const lengthStats = new Map();
for (const [length, frequencies] of lengthFrequency) {
  let population = 0, f2 = 0, f2Squared = 0, f3 = 0, f4 = 0;
  for (const freq of frequencies.values()) {
    population += freq;
    const ff2 = fall2(freq);
    f2 += ff2;
    f2Squared += ff2 ** 2;
    f3 += fall3(freq);
    f4 += fall4(freq);
  }
  lengthStats.set(length, {
    population, distinct: frequencies.size, f2, f2Squared, f3, f4
  });
}
const shapeCounts = new Map();
for (let index = 0; index + 1 < lengths.length; index++) {
  const shape = lengths[index] + "," + lengths[index + 1];
  shapeCounts.set(shape, (shapeCounts.get(shape) || 0) + 1);
}
const overlapCounts = new Map();
for (let index = 0; index + 2 < lengths.length; index++) {
  if (lengths[index] === lengths[index + 1] &&
      lengths[index + 1] === lengths[index + 2]) {
    const length = lengths[index];
    overlapCounts.set(length, (overlapCounts.get(length) || 0) + 1);
  }
}
const allShapes = [];
let exactLengthPreservingExpectation = 0;
for (const [shape, slots] of shapeCounts) {
  const [leftLength, rightLength] = shape.split(",").map(Number);
  const left = lengthStats.get(leftLength);
  const right = lengthStats.get(rightLength);
  const overlappingPairs = leftLength === rightLength
    ? overlapCounts.get(leftLength) || 0 : 0;
  const disjointPairs = slots * (slots - 1) / 2 - overlappingPairs;
  let disjointProbability = 0;
  let overlapProbability = 0;
  if (leftLength !== rightLength) {
    if (left.population >= 2 && right.population >= 2) {
      disjointProbability = (
        left.f2 / fallingFactorial(left.population, 2)
      ) * (right.f2 / fallingFactorial(right.population, 2));
    }
  } else {
    if (left.population >= 4) {
      disjointProbability = (
        left.f2 * left.f2 - left.f2Squared + left.f4
      ) / fallingFactorial(left.population, 4);
    }
    if (left.population >= 3) {
      overlapProbability =
        left.f3 / fallingFactorial(left.population, 3);
    }
  }
  const expectedDuplicatedPairs = (
    disjointPairs * disjointProbability +
    overlappingPairs * overlapProbability
  );
  exactLengthPreservingExpectation += expectedDuplicatedPairs;
  allShapes.push({shape, slots, overlappingPairs, expectedDuplicatedPairs});
}
const threeByThree = allShapes.find((value) => value.shape === "3,3");
assert.equal(lengthStats.get(3).population, 720);
assert.equal(lengthStats.get(3).distinct, 704);
assert.equal(lengthStats.get(3).f2, 34);
assert.equal(threeByThree.slots, 184);
assert.equal(threeByThree.overlappingPairs, 36);
assert.ok(Math.abs(exactLengthPreservingExpectation -
  0.012119600863420057) < 1e-14);
assert.ok(Math.abs(threeByThree.expectedDuplicatedPairs -
  0.0000676538434737498) < 1e-16);



assert.ok(Math.abs(expectedRepeatedBigrams - 0.01250011927594729) < 1e-12);
assert.ok(Math.abs(expectedTerminalRecurrences - 0.00000861638892203117) < 1e-13);

console.log("PASS: source-native LP2 all 12,956 runes and 2,896 printed words");
console.log("Unique duplicated adjacent word bigram:", left + "-" + right);
console.log("Occurrences: physical p27 runes28..33; p55 runes70..75 (book end)");
console.log("Source word positions:", duplicates[0][1].join(", "));
console.log("Each component word occurs exactly twice, always as this pair");
console.log("Uniform word-shuffle expected duplicated bigram pairs:",
  expectedRepeatedBigrams.toPrecision(14));
console.log("Uniform word-shuffle upper bound, any pair duplicated:",
  expectedRepeatedBigrams.toPrecision(14));
console.log("Uniform word-shuffle upper bound, terminal pair repeated:",
  expectedTerminalRecurrences.toPrecision(14));
console.log("Conditioned on exactly two of each specific word, probability",
  "of both consecutive copies:", pairProbabilityIfTwoCopiesEach.toPrecision(14));
console.log("Page/word-length conditional p27 3-rune slots:", page27);
console.log("Page/word-length conditional p55 3-rune slots:", page55);
console.log("Exactly conditioned ordered pair on both pages:",
  pageLengthConditionedProbability.toPrecision(14), "=1/78");
console.log("Either order, with the same ordered pair on both pages:",
  sameOrderInBothPagesEitherWay.toPrecision(14), "=1/39");
console.log("The earlier global word-shuffle baseline is not a calibrated",
  "discovery-corrected significance or plausible prose-generating null.");
console.log("Exact whole-book printed-length-slot-preserving expectation:",
  exactLengthPreservingExpectation.toPrecision(16));
console.log("Exact 3+3 word-pair expectation under the same null:",
  threeByThree.expectedDuplicatedPairs.toPrecision(16));
console.log("Only one duplicated complete original word pair, and it is 3+3");
console.log("These null expectations do not establish a source-selected cipher.");
console.log("No cipher, plaintext, or creator-origin explanation is inferred.");
