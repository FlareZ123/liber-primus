"use strict";

/**
 * Original LP2 first-four-section 3/5/7/11 prime-width boundary readout.
 *
 * Source-visible chapter lengths: 729, 1145, 1729, 1903 GP29 runes.
 * They equal 3*243, 5*229, 7*247, 11*173 respectively.
 * Test whether their printed word-boundary flags have a canonical row/column
 * transposition rather than inventing a cipher key or plaintext.
 *
 * Node.js 22 / Windows 11, read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const donors = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
].map(filename => (read(filename).toUpperCase().match(/[A-Z]+/g) || [])
  .map(word => Math.min(15, word.length)));

const ends = [729, 1874, 3603, 5506];
const primes = [3, 5, 7, 11];
const lengths = [729, 1145, 1729, 1903];
const quotients = [243, 229, 247, 173];
const printWordCounts = [158, 255, 383, 437];
const runeLimit = gp.pages.slice(0, 56)
  .reduce((acc, page) => acc + page.indices.length, 0);
assert.equal(runeLimit, 12956);

/** Delimiter attached to the preceding original rune, never a page wrap. */
function sourceBreakFlags() {
  const alphabet = new Set(gp.runes);
  const marks = new Uint8Array(runeLimit);
  let total = 0;
  for (const char of source) {
    if (alphabet.has(char)) {
      if (total === runeLimit) break;
      total++;
    } else if ((char === "-" || char === ".") && total) {
      marks[total - 1] = 1;
    }
  }
  assert.equal(total, runeLimit);
  return Array.from(marks);
}
const originalFlags = sourceBreakFlags();
const sections = ends.map((end, i) => originalFlags.slice(
  i === 0 ? 0 : ends[i - 1], end
));
assert.deepEqual(sections.map(section => section.length), lengths);
assert.deepEqual(sections.map(section => section.reduce((a, b) => a + b, 0)),
  printWordCounts);
assert.deepEqual(sections.map((section, i) => section.length / primes[i]),
  quotients);

/**
 * @template T
 * @param {T[]} array
 * @param {number} width
 * @returns {T[]}
 */
function rowToColumn(array, width) {
  const height = array.length / width;
  assert.equal(Number.isInteger(height), true);
  const out = [];
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      out.push(array[row * width + col]);
    }
  }
  return out;
}

/**
 * @template T
 * @param {T[]} array
 * @param {number} width
 * @returns {T[]}
 */
function columnToRow(array, width) {
  const height = array.length / width;
  assert.equal(Number.isInteger(height), true);
  const out = [];
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      out.push(array[col * height + row]);
    }
  }
  return out;
}

/** @template T @param {T[]} marks @returns {T[]} */
const attachBefore = marks => [marks[marks.length - 1], ...marks.slice(0, -1)];
/** @template T @param {T[]} marks @returns {T[]} */
const attachAfter = marks => [...marks.slice(1), marks[0]];

/** @param {number[]} marks @returns {number[]} */
function wordLengths(marks) {
  const out = [];
  let current = 0;
  for (const marked of marks) {
    current++;
    if (marked) {
      out.push(current);
      current = 0;
    }
  }
  if (current) out.push(current);
  return out;
}

/**
 * Fit a source-independent two-word English length model.
 * Smoothing 0.5 on 16*16 pairs, all controls separately sourced.
 * @param {number[][]} data
 * @returns {Float64Array}
 */
function fit(data) {
  const k = 16;
  const pairs = new Float64Array(k * k);
  const rows = new Float64Array(k);
  const singles = new Float64Array(k);
  for (const words of data) {
    for (let i = 1; i < words.length; i++) {
      const prev = words[i - 1], next = words[i];
      pairs[prev * k + next]++;
      rows[prev]++;
      singles[next]++;
    }
  }
  const sum = singles.reduce((a, b) => a + b, 0);
  return Float64Array.from({ length: k * k }, (_, index) => {
    const a = Math.floor(index / k), b = index % k;
    return Math.log((pairs[index] + .5) / (rows[a] + 8))
      - Math.log((singles[b] + .5) / (sum + 8));
  });
}
const model = fit(donors);

/** @param {number[]} words @returns {number} */
function score(words) {
  let gain = 0;
  for (let i = 1; i < words.length; i++) {
    gain += model[Math.min(words[i - 1], 15) * 16
      + Math.min(words[i], 15)];
  }
  return gain / (words.length - 1);
}

/** @param {number[]} flags */
function evidence(flags) {
  const words = wordLengths(flags);
  return {
    words: words.length,
    singletons: words.filter(w => w === 1).length,
    twoRuneWords: words.filter(w => w === 2).length,
    longestWord: Math.max(...words),
    wordsLongerThan20: words.filter(w => w > 20).length,
    englishAdjacentLengthGain: score(words)
  };
}

const permutations = {
  printed: sections.flat(),
  rowToColumn: sections.flatMap((part, i) => rowToColumn(part, primes[i])),
  columnToRow: sections.flatMap((part, i) => columnToRow(part, primes[i])),
  beforeRowToColumn: sections.flatMap((part, i) =>
    attachAfter(rowToColumn(attachBefore(part), primes[i]))),
  beforeColumnToRow: sections.flatMap((part, i) =>
    attachAfter(columnToRow(attachBefore(part), primes[i])))
};
const results = Object.fromEntries(Object.entries(permutations)
  .map(([key, flags]) => [key, evidence(flags)]));
assert.equal(results.printed.words, 1233);
assert.equal(results.printed.singletons, 42);
assert.equal(results.printed.twoRuneWords, 190);
assert.equal(results.printed.longestWord, 14);
assert.ok(Math.abs(results.printed.englishAdjacentLengthGain
  - (-0.030235695122886066)) < 1e-12);
assert.equal(results.rowToColumn.singletons, 268);
assert.equal(results.columnToRow.singletons, 286);
assert.ok(results.rowToColumn.englishAdjacentLengthGain
  < results.printed.englishAdjacentLengthGain);
assert.ok(results.columnToRow.englishAdjacentLengthGain
  < results.printed.englishAdjacentLengthGain);
assert.equal(results.beforeRowToColumn.singletons, 267);
assert.equal(results.beforeColumnToRow.singletons, 285);
assert.ok(results.beforeRowToColumn.englishAdjacentLengthGain
  < results.printed.englishAdjacentLengthGain);
assert.ok(results.beforeColumnToRow.englishAdjacentLengthGain
  < results.printed.englishAdjacentLengthGain);

/* True native-word-boundary plants at source-exact rune lengths, encrypted
 * by each inverse map. The planted source words never come from the LP2
 * ciphertext, so recovery is not circular. */
let wordOffset = 0;
const positive = [];
for (let chapter = 0; chapter < sections.length; chapter++) {
  const n = lengths[chapter], width = primes[chapter];
  const plain = Array(n).fill(0);
  let total = 0;
  while (total < n) {
    const wordLength = donors[0][wordOffset++];
    assert.ok(wordLength >= 1);
    total += Math.min(wordLength, n - total);
    plain[total - 1] = 1;
  }
  const scrambled = columnToRow(plain, width);
  const restored = rowToColumn(scrambled, width);
  assert.deepEqual(restored, plain);
  const beforeScrambled = columnToRow(attachBefore(plain), width);
  const beforeRestored = attachAfter(rowToColumn(beforeScrambled, width));
  assert.deepEqual(beforeRestored, plain);
  const plainScore = evidence(plain).englishAdjacentLengthGain;
  const scrambledScore = evidence(scrambled).englishAdjacentLengthGain;
  assert.ok(plainScore > scrambledScore);
  assert.deepEqual(rowToColumn(columnToRow(sections[chapter], width), width),
    sections[chapter]);
  assert.deepEqual(columnToRow(rowToColumn(sections[chapter], width), width),
    sections[chapter]);
  positive.push({ chapter, plainScore, scrambledScore, exactReplay: true });
}

console.log(JSON.stringify({
  originalRunei: runeLimit,
  test: "First four original visual chapters, source-visible prime width",
  chapters: lengths.map((runes, i) => ({
    chapter: i, runes, width: primes[i], quotient: quotients[i],
    printedBreaks: printWordCounts[i]
  })),
  original: results,
  sourceNativePlants: positive,
  verdict: "Neither canonical prime-width boundary transpose restores native adjacent word-length structure; no cipher or plaintext recovered."
}, null, 2));
console.log("PASS: exact original geometry, both inverse maps, four native control plants");
