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

/** @param {number[]} values @returns {boolean} */
function isUnitRun(values) {
  if (values.length < 2) return false;
  const step = values[1] - values[0];
  if (Math.abs(step) !== 1) return false;
  return values.every((value, index) => index === 0 || value - values[index - 1] === step);
}

/** @param {number[]} values @returns {number[]} */
function increasingDirection(values) {
  return values.slice().sort((left, right) => left - right);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
let crossingWordCount = 0;

function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + current.length - 1,
      values: current.slice(),
    });
  } else {
    crossingWordCount += 1;
  }
  current = [];
}

for (let segment = 0; segment < parts.length; segment += 1) {
  for (const char of [...parts[segment]]) {
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

assert.equal(crossingWordCount, 32);
assert.equal(pages.flatMap((page) => page.words).length, 2864);

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const source = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(source.length, 43);
assert.deepEqual(source.slice(25, 30), ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]);

const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));
const diagonal = source.map((sourceWord, sourceIndex) => ({
  sourceIndex,
  sourceWord,
  object: (wordsByPage.get(sourceIndex) || [])[sourceIndex] || null,
}));

assert.equal(diagonal.filter((row) => row.object).length, 42);
assert.deepEqual(
  diagonal.filter((row) => !row.object).map((row) => [row.sourceIndex, row.sourceWord]),
  [[32, "YOU"]]
);

const fullUnitRuns = diagonal
  .filter((row) => row.object)
  .map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    page: row.object.page,
    ordinal: row.object.ordinal,
    start: row.object.start,
    values: row.object.values,
    h: hOutsideIn(row.object.values),
  }))
  .filter((row) => isUnitRun(row.h));

assert.deepEqual(
  fullUnitRuns.map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    page: row.page,
    ordinal: row.ordinal,
    start: row.start,
    values: row.values,
    h: row.h,
    increasing: increasingDirection(row.h),
    words: increasingDirection(row.h).map((index) => source[index]),
  })),
  [
    {
      sourceIndex: 11,
      sourceWord: "IS",
      page: 11,
      ordinal: 12,
      start: 49,
      values: [11, 14],
      h: [26, 25],
      increasing: [25, 26],
      words: ["THEIR", "NUMBERS"],
    },
    {
      sourceIndex: 24,
      sourceWord: "AND",
      page: 24,
      ordinal: 25,
      start: 115,
      values: [27, 15],
      h: [12, 13],
      increasing: [12, 13],
      words: ["THE", "WAY"],
    },
    {
      sourceIndex: 42,
      sourceWord: "OPENPGP",
      page: 42,
      ordinal: 43,
      start: 206,
      values: [16, 0, 14],
      h: [2, 1, 0],
      increasing: [0, 1, 2],
      words: ["HELLO", "THE", "PATH"],
    },
  ]
);

const shedUnitRuns = diagonal
  .filter((row) => row.object && row.object.values.length >= 4)
  .map((row) => {
    const shed = row.object.values.slice(1, -1);
    return {
      sourceIndex: row.sourceIndex,
      sourceWord: row.sourceWord,
      page: row.object.page,
      ordinal: row.object.ordinal,
      start: row.object.start,
      values: row.object.values,
      shed,
      h: hOutsideIn(shed),
    };
  })
  .filter((row) => isUnitRun(row.h));

assert.deepEqual(
  shedUnitRuns.map((row) => ({
    sourceIndex: row.sourceIndex,
    sourceWord: row.sourceWord,
    page: row.page,
    ordinal: row.ordinal,
    start: row.start,
    values: row.values,
    shed: row.shed,
    h: row.h,
    increasing: increasingDirection(row.h),
    words: increasingDirection(row.h).map((index) => source[index]),
  })),
  [
    {
      sourceIndex: 27,
      sourceWord: "ARE",
      page: 27,
      ordinal: 28,
      start: 111,
      values: [0, 20, 15, 1],
      shed: [20, 15],
      h: [5, 6],
      increasing: [5, 6],
      words: ["EPIPHANY", "SEEKS"],
    },
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  directionInstruction: source.slice(25, 30),
  fullUnitRuns: fullUnitRuns.map((row) => ({
    selector: `${row.sourceWord}${row.sourceIndex}`,
    receiver: `p${row.page} word${row.ordinal}`,
    h: row.h,
    increasing: increasingDirection(row.h),
    words: increasingDirection(row.h).map((index) => source[index]),
  })),
  oneShedUnitRuns: shedUnitRuns.map((row) => ({
    selector: `${row.sourceWord}${row.sourceIndex}`,
    receiver: `p${row.page} word${row.ordinal}`,
    shed: row.shed,
    h: row.h,
    words: increasingDirection(row.h).map((index) => source[index]),
  })),
  decision:
    "The corrected numbered diagonal has exactly three full H unit runs; increasing source-number direction reads THEIR NUMBERS, THE WAY, HELLO THE PATH. With one clue-selected circumference shed, ARE27 is the sole additional unit run and reads EPIPHANY SEEKS.",
}, null, 2));
