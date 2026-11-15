"use strict";
/**
 * One fixed source-semantic LP1 p14–16 -> LP2 p15–22 handoff.
 *
 * Original LP1 second-koan text: "I ... VOICE OF THE CIRCUMFERENCE".
 * Immediately following original LP1 p15: "DISCOVER TRUTH INSIDE YOURSELF".
 * Final paired LP1 p16 page: a 5x5 original 3301-sum numeric square.
 * Hypothesis only: read that square outside-in, starting at the conventional
 * top-left and proceeding clockwise; use its 25 numbers modulo GP29 as one
 * repeating subtractive key. Start at the source-visible LP2 p15 chapter
 * red heading and continue without page reset through p22, which carries
 * the mirrored LP1 p14–16 figure. Do not tune orientation, clocks or keys.
 *
 * No original instruction actually commands this cipher transfer.
 * This is a single bounded original-cipher decision, not a proposed solution.
 * Run: node sims/lp2_p22_lp1_circumference_spiral_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const source16 = reference.split("### 16\n")[1].split("\n### ")[0];
const square = source16.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^\d+\s+\d+/.test(line))
  .map(line => line.split(/\s+/).map(Number));
assert.equal(square.length, 5, "LP1 p16 numeric square must have 5 rows");
assert(square.every(row => row.length === 5), "LP1 p16 has 5 columns");
assert.deepEqual(square, [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434]
], "Source p16 square must match original printed cells");
assert(source16.includes("KNOW THIS"), "LP1 printed square heading");
assert(reference.includes("VOICE OF THE CIRCUMFERENCE"), "LP1 koan semantic cue");
assert(reference.includes("DISCOVER TRUTH INSIDE YOURSELF"), "LP1 inward semantic cue");
assert(square.every(row => row.reduce((a, b) => a + b, 0) === 3301));
for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    assert.equal(square[r][c], square[4-r][4-c],
      "Source square must be 180-degree symmetric");
  }
}

/**
 * Top-left, clockwise perimeter, then next perimeter, then the center.
 * @param {number[][]} source
 * @returns {number[]}
 */
function inwardClockwise(source) {
  const out = [];
  for (let layer = 0; layer < 3; layer++) {
    const lo = layer;
    const hi = 4 - layer;
    if (lo === hi) {
      out.push(source[lo][lo]);
      break;
    }
    for (let col = lo; col <= hi; col++) out.push(source[lo][col]);
    for (let row = lo + 1; row <= hi; row++) out.push(source[row][hi]);
    for (let col = hi - 1; col >= lo; col--) out.push(source[hi][col]);
    for (let row = hi - 1; row > lo; row--) out.push(source[row][lo]);
  }
  return out;
}
const numbers = inwardClockwise(square);
assert.equal(numbers.length, 25);
assert.deepEqual(numbers.slice(0, 8), numbers.slice(8, 16),
  "The outer ring is two identical half-rings");
assert.deepEqual(numbers.slice(16, 20), numbers.slice(20, 24),
  "The inner ring is two identical half-rings");
const key = numbers.map(n => n % 29);
assert.deepEqual(key, [
  28, 6, 22, 17, 9, 27, 17, 1,
  28, 6, 22, 17, 9, 27, 17, 1,
  0, 6, 19, 11, 0, 6, 19, 11, 26
]);

/**
 * Direct GP29 Vigenere subtraction, no post-selected F skips.
 * @param {number[]} cipher
 * @param {number} offset
 * @returns {number[]}
 */
function decode(cipher, offset) {
  return cipher.map((value, i) => (value - key[(offset + i) % 25] + 29) % 29);
}
/**
 * @param {number[]} plain
 * @param {number} offset
 * @returns {number[]}
 */
function encode(plain, offset) {
  return plain.map((value, i) => (value + key[(offset + i) % 25]) % 29);
}
/** @param {number[]} signs @returns {number} */
function ioc(signs) {
  const freq = Array(29).fill(0);
  for (const sign of signs) freq[sign]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (signs.length * (signs.length - 1));
}
/** @param {number[]} signs @returns {string} */
function latin(signs) {
  return signs.map(n => corpus.translit[n]).join("");
}
const chapterPages = corpus.pages.slice(15, 23);
const chapter = chapterPages.flatMap(page => page.indices);
const page22Start = chapterPages.slice(0, 7)
  .reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(chapter.length, 1903, "Original p15–22 runes");
assert.equal(page22Start, 1772, "Untouched original p22 start within chapter");
assert.equal(corpus.pages[22].indices.length, 131);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p22Printed = transcription.trim().split(/\n%\n/)[22]
  .replace(/\/\n/g, "").replace(/\n/g, "");
const runeWordRegExp = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const words = p22Printed.match(runeWordRegExp) || [];
assert.equal(words.length, 28, "Original p22 printed words");
assert.equal(words.join("").length, 131);
assert.deepEqual(Array.from(words.join(""), r => runeIndex.get(r)),
  corpus.pages[22].indices, "Original p22 source rune/word alignment");

const plain = decode(chapter, 0);
assert.deepEqual(encode(plain, 0), chapter,
  "All 1903 original runes must forward reconstruct");
const withheldOriginal = corpus.pages[22].indices;
const withheld = plain.slice(page22Start);
assert.deepEqual(withheld, decode(withheldOriginal, page22Start));
assert.deepEqual(encode(withheld, page22Start), withheldOriginal);
const page21Start = chapterPages.slice(0, 6)
  .reduce((sum, page) => sum + page.indices.length, 0);
const page21Plain = decode(corpus.pages[21].indices, page21Start);
assert.deepEqual(encode(page21Plain, page21Start), corpus.pages[21].indices);
const plantedSourceNative = corpus.pages[57].indices;
assert.equal(plantedSourceNative.length, 95);
for (const [label, source, offset] of [
  ["p57 authentic plaintext", plantedSourceNative, 0],
  ["p21-length source-native plant", Array.from({length: 273},
    (_, i) => plantedSourceNative[i % 95]), page21Start],
  ["p22-length source-native plant", Array.from({length: 131},
    (_, i) => plantedSourceNative[i % 95]), page22Start],
  ["chapter-length source-native plant", Array.from({length: 1903},
    (_, i) => plantedSourceNative[i % 95]), 0]
]) {
  const encrypted = encode(source, offset);
  assert.deepEqual(decode(encrypted, offset), source, label);
}
assert(Math.abs(ioc(chapter) - 0.03450194584564855) < 1e-12);
assert(Math.abs(ioc(plain) - 0.03464947979088859) < 1e-12);
assert(Math.abs(ioc(withheldOriginal) - 0.0358191426893717) < 1e-12);
assert(Math.abs(ioc(withheld) - 0.035349383440986495) < 1e-12);
const wordPlain = [];
let cursor = 0;
for (const word of words) {
  wordPlain.push(latin(withheld.slice(cursor, cursor + word.length)));
  cursor += word.length;
}
assert.equal(cursor, withheld.length);
console.log(JSON.stringify({
  source: "LP1 p14 circumference / p15 inside / p16 original square",
  hypothesis: "clockwise outer-in mod29 subtractive period25, p15 chapter clock0",
  sourceNumbers: numbers,
  key, chapterRunes: chapter.length, p22Offset: page22Start,
  sourceSquareRot180: true,
  outerRingHalfRepeated: true,
  innerRingHalfRepeated: true,
  chapterRawIoc: ioc(chapter),
  chapterDecodedIoc: ioc(plain),
  heldoutPage: 22,
  heldoutOriginalIoc: ioc(withheldOriginal),
  heldoutDecodedIoc: ioc(withheld),
  heldoutPrintedWords: wordPlain,
  priorPage21DecodedIoc: ioc(page21Plain),
  authenticSourceNativePlants: 4,
  originalForwardReencryption: "1903/1903",
  recoveredUnknownPlaintext: false
}, null, 2));
console.log("PASS: one frozen p16-square inward key and untouched p22 native GP29 source; no decipherment.");
