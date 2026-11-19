"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function hOutsideIn(values) {
  const output = [];
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const left = values[index];
    const right = values[values.length - 1 - index];
    output.push(mod29(left - right), mod29(left + right));
  }
  if (values.length % 2 === 1) output.push(values[Math.floor(values.length / 2)]);
  return output;
}

/** @param {number[]} values @param {number} start @param {number} end @returns {boolean} */
function containsRange(values, start, end) {
  const seen = new Set(values);
  for (let value = start; value <= end; value += 1) {
    if (!seen.has(value)) return false;
  }
  return true;
}

/** @param {number[]} values @returns {number} */
function modSum(values) {
  return values.reduce((sum, value) => sum + value, 0) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  text,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

/** Flush one canonical page-local word. */
function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char !== "/" && !/\s/u.test(char)) {
      flushWord();
    }
  }
}
flushWord();

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(5, 14), [
  "EPIPHANY", "SEEKS", "THE", "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY",
]);

const p0 = pages.find((page) => page.page === 0);
assert.ok(p0);
const first = p0.words[0].values;
const second = p0.words[1].values;
const title = first.concat(second);

assert.deepEqual(first, [15, 8, 18, 3, 6, 19, 27, 0]);
assert.deepEqual(second, [15, 26, 18, 21, 5]);

const hFirst = hOutsideIn(first);
const hSecond = hOutsideIn(second);
const hTitle = hOutsideIn(title);

assert.deepEqual(hFirst, [15, 15, 10, 6, 28, 8, 26, 9]);
assert.deepEqual(hSecond, [10, 20, 5, 18, 18]);
assert.deepEqual(hTitle, [10, 20, 16, 0, 0, 7, 6, 0, 20, 21, 19, 19, 27]);
assert.equal(modSum(hFirst), 1);
assert.equal(modSum(hSecond), 13);

const titleUnion = [...hTitle, ...hFirst, ...hSecond];
assert.ok(containsRange(titleUnion, 5, 10));

const matchedPairs = [];
for (const page of pages) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const word1 = page.words[index];
    const word2 = page.words[index + 1];
    if (word1.values.length !== 8 || word2.values.length !== 5) continue;

    const wholeH = hOutsideIn(word1.values.concat(word2.values));
    const word1H = hOutsideIn(word1.values);
    const word2H = hOutsideIn(word2.values);
    const union = [...wholeH, ...word1H, ...word2H];

    const scopePartition =
      word2H.includes(5) &&
      wholeH.includes(6) &&
      wholeH.includes(7) &&
      word1H.includes(8) &&
      word1H.includes(9) &&
      word1H.includes(10);

    matchedPairs.push({
      page: page.page,
      ordinal: word1.ordinal,
      start: word1.start,
      covers5to10: containsRange(union, 5, 10),
      scopePartition,
      hSums: [modSum(word1H), modSum(word2H)],
    });
  }
}

assert.equal(matchedPairs.length, 19);
assert.deepEqual(
  matchedPairs.filter((row) => row.covers5to10).map((row) => [row.page, row.ordinal]),
  [[0, 1], [39, 9]]
);
assert.deepEqual(
  matchedPairs.filter((row) => row.scopePartition).map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);
assert.deepEqual(
  matchedPairs.filter((row) => row.hSums[0] === 1 && row.hSums[1] === 13).map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);

/**
 * @param {string} text
 * @returns {number[][]}
 */
function parseLineWords(text) {
  const words = [];
  let word = [];
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      word.push(value);
    } else if (word.length > 0) {
      words.push(word);
      word = [];
    }
  }
  if (word.length > 0) words.push(word);
  return words;
}

const lineControls = [];
for (const page of pages) {
  const lines = page.text.split("/").map((line) => line.trim()).filter(Boolean);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const words = parseLineWords(lines[lineIndex]);
    if (words.length === 0) continue;
    const lineUnion = [
      ...hOutsideIn(words.flat()),
      ...words.flatMap((word) => hOutsideIn(word)),
    ];

    for (let wordIndex = 0; wordIndex + 1 < words.length; wordIndex += 1) {
      if (words[wordIndex].length !== 8 || words[wordIndex + 1].length !== 5) continue;
      const pairSums = [
        modSum(hOutsideIn(words[wordIndex])),
        modSum(hOutsideIn(words[wordIndex + 1])),
      ];
      lineControls.push({
        page: page.page,
        line: lineIndex + 1,
        wordInLine: wordIndex + 1,
        wordLengths: words.map((word) => word.length),
        covers5to12: containsRange(lineUnion, 5, 12),
        pairSums,
      });
    }
  }
}

assert.equal(lineControls.length, 10);
assert.equal(lineControls.filter((row) => row.covers5to12).length, 3);
assert.deepEqual(
  lineControls
    .filter((row) => row.covers5to12 && row.pairSums[0] === 1 && row.pairSums[1] === 13)
    .map((row) => [row.page, row.line, row.wordInLine]),
  [[0, 1, 1]]
);

const p0Line1 = lineControls.find((row) => row.page === 0 && row.line === 1 && row.wordInLine === 1);
assert.ok(p0Line1);
assert.deepEqual(p0Line1.wordLengths, [8, 5, 4, 3]);
assert.equal(p0Line1.covers5to12, true);
assert.deepEqual(p0Line1.pairSums, [1, 13]);

console.log(JSON.stringify({
  status: "PASS",
  p0Title: {
    wordLengths: [first.length, second.length],
    hFirst,
    hSecond,
    hWhole: hTitle,
    hWordSums: [modSum(hFirst), modSum(hSecond)],
    titleUnionSourceRun: {
      indices: [5, 6, 7, 8, 9, 10],
      words: sourceWords.slice(5, 11),
    },
    scopePartition: {
      secondWord: [5],
      wholeTitle: [6, 7],
      firstWord: [8, 9, 10],
    },
  },
  pairControls: {
    adjacent8plus5: matchedPairs.length,
    cover5to10: matchedPairs.filter((row) => row.covers5to10).map((row) => [row.page, row.ordinal]),
    exactScopePartition: matchedPairs.filter((row) => row.scopePartition).map((row) => [row.page, row.ordinal]),
    hSums1_13: matchedPairs
      .filter((row) => row.hSums[0] === 1 && row.hSums[1] === 13)
      .map((row) => [row.page, row.ordinal]),
  },
  physicalLineControls: {
    linesContainingAdjacent8plus5: lineControls.length,
    cover5to12Count: lineControls.filter((row) => row.covers5to12).length,
    cover5to12AndTheWaySums: [[0, 1, 1]],
  },
  recoveredSourceRegister: {
    indices: [5, 6, 7, 8, 9, 10, 11, 12, 13],
    words: sourceWords.slice(5, 14),
    sentence: "EPIPHANY SEEKS THE DEVOTED. LIBER PRIMUS IS THE WAY.",
  },
  decision:
    "P0's source-selected 8+5 opening is the sole matched pair whose fixed nested-H scopes partition source indices 5..10 as 1|2|3 and whose word-H sums are THE1/WAY13. On its original first physical line, the same fixed line/word H union contains 5..12, while the second title-word H sum supplies 13. This reconstructs authenticated source indices 5..13 without an additive title key. It supports the EPIPHANY SEEKS title interpretation but does not derive the 13-atom residual key or decrypt continuous p0 prose.",
}, null, 2));
