"use strict";
/**
 * SFT: source-exact word-local constrained-code capacity for Liber Primus LP2.
 *
 * This is a mathematical necessary-condition test, not a proposed decryption.
 * Run on Windows 11 with Node.js 22:
 *   node sims/lp2_wordlocal_gp27_anti_repeat_capacity_sft.cjs
 *
 * Reads only authenticated/canonical repository resources, writes no files.
 * Every integer capacity comparison uses BigInt. The all-window summary uses
 * safe, widely separated log2 bounds and checks its extremal witnesses with
 * exact BigInt products.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const marks = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .slice(0, 2896)
  .map(s => Array.from(s, rune => {
    const index = runeMap.get(rune);
    assert.notEqual(index, undefined, "unmapped GP rune");
    return index;
  }));

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && Number.isInteger(k) && k >= 0 && k <= n);
  let v = 1n;
  for (let i = 1; i <= k; i++) v = v * BigInt(n - i + 1) / BigInt(i);
  return v;
}

/** @param {number[]} word */
function repeatCount(word) {
  return word.slice(1).reduce((n, rune, i) => n + Number(rune === word[i]), 0);
}

/** Number of all GP29 words with this printed length and exact repeat count. */
function codebook(word) {
  const e = repeatCount(word);
  return 29n * choose(word.length - 1, e)
    * 28n ** BigInt(word.length - 1 - e);
}

/** Exact number of bits needed to label enough alternatives for one word. */
function wordSideBits(word, q) {
  const required = BigInt(q) ** BigInt(word.length);
  const available = codebook(word);
  const alternatives = (required + available - 1n) / available;
  return (alternatives - 1n).toString(2) === "0"
    ? 0 : (alternatives - 1n).toString(2).length;
}

const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = sourcePages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, word) => n + word.length, 0), original.length);
assert.deepEqual(words.flat(), original);
const counts = words.map(repeatCount);
assert.equal(counts.reduce((n, k) => n + k, 0), 63);
assert.equal(counts.filter(Boolean).length, 62);
const codebooks = words.map(codebook);
const endings = [];
let cumulativeRunes = 0;
for (const word of words) {
  cumulativeRunes += word.length;
  endings.push(cumulativeRunes);
}
const physicalMarks = marks.events.filter(e =>
  e.original_ink_event !== false && e.index !== 125);
assert.equal(marks.events.length, 180);
assert.equal(physicalMarks.length, 175);
const markedEnds = new Set(physicalMarks.map(e => e.rune_offset));
assert.ok(physicalMarks.every(e => endings.includes(e.rune_offset)));
const repeatedWordIndices = counts.flatMap((k, i) => k ? [i] : []);
const repeatedMarked = repeatedWordIndices.filter(i => markedEnds.has(endings[i]));
assert.deepEqual(repeatedMarked, [1030, 1053, 1225]);
console.log("ORIGINAL RUNES", original.length,
  "COMPLETE WORDS", words.length,
  "WITH DOUBLETS", repeatedWordIndices.length,
  "DOUBLETS IN WORDS", counts.reduce((a, b) => a + b, 0));
console.log("PHYSICAL PUNCTUATION", physicalMarks.length,
  "REPEAT WORDS WITH AN END MARK", repeatedMarked.length,
  "REPEAT WORDS WITHOUT AN END MARK",
  repeatedWordIndices.length - repeatedMarked.length);
console.log("MARKED REPEAT WORDS (0-based):", repeatedMarked.join(","));

for (const q of [26, 27, 28, 29]) {
  let impossible = 0;
  let bits = 0;
  let maxBits = 0;
  for (const word of words) {
    const b = wordSideBits(word, q);
    impossible += Number(b > 0);
    bits += b;
    maxBits = Math.max(maxBits, b);
  }
  const expected = {
    26: [62, 159, 5],
    27: [62, 173, 5],
    28: [62, 194, 5],
    29: [2813, 2967, 5]
  };
  assert.deepEqual([impossible, bits, maxBits], expected[q]);
  console.log("GP" + q + " INDEPENDENT-WORD CAPACITY:",
    "deficitWords=" + impossible,
    "sumMinimumFixedSideBits=" + bits,
    "maxPerWordBits=" + maxBits);
}

/** Verify a window's cardinality inequality without numerical approximation. */
function exactWindow(q, start, endExclusive) {
  let available = 1n;
  let runeCount = 0;
  for (let i = start; i < endExclusive; i++) {
    available *= codebooks[i];
    runeCount += words[i].length;
  }
  return {
    fits: available >= BigInt(q) ** BigInt(runeCount),
    runeCount
  };
}

/**
 * Minimum log2-capacity margin across ANY contiguous word window of length
 * >= minWords. The floating-point scan finds the least-margin witness;
 * exactWindow validates its cardinality. Gap >=0.05 bit is far above
 * floating-point accumulation roundoff over 2,896 bounded terms.
 */
function minLongWindow(q, minWords) {
  const deltas = words.map((word, i) =>
    Math.log2(Number(codebooks[i])) - word.length * Math.log2(q));
  const prefix = [0];
  for (const d of deltas) prefix.push(prefix[prefix.length - 1] + d);
  let best = { margin: Infinity, start: -1, end: -1 };
  let highestPrefix = -Infinity;
  let highestAt = 0;
  for (let end = minWords; end <= words.length; end++) {
    const newStart = end - minWords;
    if (prefix[newStart] > highestPrefix) {
      highestPrefix = prefix[newStart];
      highestAt = newStart;
    }
    const margin = prefix[end] - highestPrefix;
    if (margin < best.margin) best = { margin, start: highestAt, end };
  }
  return { ...best, exact: exactWindow(q, best.start, best.end) };
}

const q26ShortFail = exactWindow(26, 1589, 1609);
const q27ShortFail = exactWindow(27, 1024, 1077);
assert.equal(q26ShortFail.fits, false);
assert.equal(q27ShortFail.fits, false);
const q26Long = minLongWindow(26, 21);
const q27Long = minLongWindow(27, 54);
assert.ok(q26Long.margin > 0.05 && q26Long.exact.fits);
assert.ok(q27Long.margin > 0.05 && q27Long.exact.fits);
assert.deepEqual([q26Long.start, q26Long.end], [1588, 1609]);
assert.deepEqual([q27Long.start, q27Long.end], [1024, 1078]);
console.log("GP26 FAILING 20-WORD WINDOW", 1589, 1608, q26ShortFail);
console.log("GP27 FAILING 53-WORD WINDOW", 1024, 1076, q27ShortFail);
console.log("GP26 ALL WINDOWS OF >=21 WORDS CAPACITY-SUFFICIENT",
  q26Long);
console.log("GP27 ALL WINDOWS OF >=54 WORDS CAPACITY-SUFFICIENT",
  q27Long);

// The completed-book GP28 deficit is different from word-local GP27 debt.
const wholeAvailable = codebooks.reduce((a, b) => a * b, 1n);
const totalGP27 = 27n ** BigInt(original.length);
const totalGP28 = 28n ** BigInt(original.length);
assert.ok(wholeAvailable > totalGP27);
assert.ok(wholeAvailable < totalGP28);
const gp28Quotient = (totalGP28 + wholeAvailable - 1n) / wholeAvailable;
assert.equal((gp28Quotient - 1n).toString(2).length, 23);
console.log("GP27 GLOBAL CARDINALITY", "sufficient",
  "GP28 GLOBAL FIXED-SHAPE SIDE BITS", 23);

/*
 * Distinct punctuation-reset necessary condition. Treat each of the 172
 * physically distinct punctuation-mark word-ending sites as an independent
 * segment boundary; grant any secret bijection of ALL complete words within
 * a segment, preserving each printed word's exact repeat count. A single
 * variable morphological punctuation mark at its end is an overgenerous
 * local side channel of up to five symbols (13/10/4/3 dots, detached square).
 * Determine exactly how many mark symbols would be needed for a lossless
 * unrestricted GP27 source in each such independently framed segment.
 * No assumption that the author actually uses punctuation resets is made.
 */
const siteToWord = new Map(endings.map((end, i) => [end, i]));
const punctuationCuts = [
  -1, ...new Set(physicalMarks.map(mark => siteToWord.get(mark.rune_offset)))
].sort((a, b) => a - b);
assert.equal(punctuationCuts.length - 1, 172);
assert.equal(punctuationCuts[punctuationCuts.length - 1], words.length - 1);
const framed = [];
for (let k = 1; k < punctuationCuts.length; k++) {
  const start = punctuationCuts[k - 1] + 1;
  const endExclusive = punctuationCuts[k] + 1;
  let available = 1n, runeCount = 0;
  for (let j = start; j < endExclusive; j++) {
    available *= codebooks[j];
    runeCount += words[j].length;
  }
  const required = 27n ** BigInt(runeCount);
  const minMarkChoices = (required + available - 1n) / available;
  framed.push({
    start, last: endExclusive - 1, runeCount,
    markIndex: physicalMarks.filter(mark =>
      siteToWord.get(mark.rune_offset) === endExclusive - 1)
      .map(mark => mark.index),
    minMarkChoices: Number(minMarkChoices)
  });
}
const needy = framed.filter(frame => frame.minMarkChoices > 1);
assert.deepEqual(needy.map(frame => [
  frame.start, frame.last, frame.runeCount, frame.minMarkChoices,
  frame.markIndex
]), [
  [853, 863, 35, 2, [63]],
  [1586, 1596, 36, 2, [98]],
  [1597, 1599, 11, 6, [99]],
  [2361, 2369, 31, 3, [151]],
  [2767, 2775, 29, 4, [174]]
]);
assert.equal(framed.length - needy.length, 167);
assert.ok(needy.some(frame => frame.minMarkChoices > 5));
console.log("GP27 PHYSICAL PUNCTUATION RESET FRAMES", framed.length,
  "WITHOUT SIDE DEFICIT", framed.length - needy.length);
console.log("GP27 INSUFFICIENT FRAMES AND REQUIRED MARK ALTERNATIVES",
  JSON.stringify(needy));
console.log("GP27 MAXIMUM FIVE-TYPE END-MARK CODE INSUFFICIENT:",
  "p29 original words1597..1599 need >=6 distinct local endings");

console.log("PASS: exact original-cipher local-capacity gate");
