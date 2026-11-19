"use strict";

/**
 * SFT for the p33 dual numeric locator bridge:
 *   source-visible 3301 -> p33 line01 -> first red rubric
 *   solved-2014 suffix 9133 -> rune offset91 / p33 -> second red rubric
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
parts.splice(50, 0, ""); // physical p50 is the non-rune numerical table

/** @param {number} page */
function lineStarts(page) {
  let runeOffset = 0;
  const lines = [];
  for (const physicalLine of parts[page].split("/")) {
    const length = [...physicalLine].filter((char) => runeIndex.has(char)).length;
    if (!length) continue;
    lines.push({
      line: lines.length + 1,
      start: runeOffset,
      length,
      end: runeOffset + length - 1,
    });
    runeOffset += length;
  }
  return lines;
}

// Reproduce the exact solved-2014 Stage05 plaintext and its trailing 9133.
const historicalPairs =
  "TL BE IE OV UT HT RE ID TS EO ST PO SO YR " +
  "SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M";
const historicalCipher = historicalPairs.replace(/\s+/gu, "");
const columnInverse = [0, 6, 2, 5, 1, 4, 3];
const decoded = [];
for (let offset = 0; offset < historicalCipher.length; offset += 7) {
  for (const index of columnInverse) {
    decoded.push(historicalCipher[offset + index]);
  }
}
const historicalPlain = decoded.join("");
assert.equal(
  historicalPlain,
  "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133"
);
assert.equal(historicalPlain.slice(-4), "9133");

// The p33 cuneiform motif is canonically source-transcribed as 1033 / 3301.
const cuneiform = [1033, 3301];
assert.equal(
  Number([...String(cuneiform[0])].reverse().join("")),
  cuneiform[1]
);

// Locator A: source-visible 3301 is frozen as PP LL = p33 line01.
const pageLineCode = String(cuneiform[1]);
assert.equal(pageLineCode, "3301");
const pageFrom3301 = Number(pageLineCode.slice(0, 2));
const lineFrom3301 = Number(pageLineCode.slice(2));
assert.equal(pageFrom3301, 33);
assert.equal(lineFrom3301, 1);

// Locator B: solved suffix 9133 is frozen as RR PP = offset91 on p33.
const offsetPageCode = historicalPlain.slice(-4);
const offsetFrom9133 = Number(offsetPageCode.slice(0, 2));
const pageFrom9133 = Number(offsetPageCode.slice(2));
assert.equal(offsetFrom9133, 91);
assert.equal(pageFrom9133, 33);

// Family A: every unknown-page red span starting at rune offset0.
const startRows = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || [])
    .filter((span) => span.start === 0)
    .map((span) => ({
      page: page.page,
      start: span.start,
      length: span.length,
      locator: String(page.page).padStart(2, "0") + "01",
    })));

assert.deepEqual(startRows, [
  {page: 0, start: 0, length: 13, locator: "0001"},
  {page: 3, start: 0, length: 16, locator: "0301"},
  {page: 8, start: 0, length: 12, locator: "0801"},
  {page: 15, start: 0, length: 9, locator: "1501"},
  {page: 23, start: 0, length: 16, locator: "2301"},
  {page: 27, start: 0, length: 19, locator: "2701"},
  {page: 33, start: 0, length: 10, locator: "3301"},
  {page: 40, start: 0, length: 8, locator: "4001"},
  {page: 54, start: 0, length: 9, locator: "5401"},
]);

const start3301 = startRows.filter((row) => row.locator === "3301");
assert.deepEqual(start3301, [
  {page: 33, start: 0, length: 10, locator: "3301"},
]);

// Secondary full-red-span control: source-visible 1033 also describes the
// first p33 rubric as two-digit red-span length 10 followed by page 33.
const allRedRows = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || []).map((span) => ({
    page: page.page,
    start: span.start,
    length: span.length,
    lengthPage:
      String(span.length).padStart(2, "0") +
      String(page.page).padStart(2, "0"),
  })));

const lengthPage1033 = allRedRows.filter((row) => row.lengthPage === "1033");
assert.deepEqual(lengthPage1033, [
  {page: 33, start: 0, length: 10, lengthPage: "1033"},
]);

// Family B: every internal unknown-page red span.
const internalRows = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || [])
    .filter((span) => span.start > 0)
    .map((span) => ({
      page: page.page,
      start: span.start,
      length: span.length,
      locator:
        String(span.start).padStart(2, "0") +
        String(page.page).padStart(2, "0"),
    })));

assert.deepEqual(internalRows, [
  {page: 3, start: 119, length: 3, locator: "11903"},
  {page: 6, start: 71, length: 11, locator: "7106"},
  {page: 7, start: 194, length: 14, locator: "19407"},
  {page: 15, start: 9, length: 11, locator: "0915"},
  {page: 33, start: 91, length: 8, locator: "9133"},
  {page: 39, start: 119, length: 3, locator: "11939"},
  {page: 53, start: 128, length: 51, locator: "12853"},
]);

const internal9133 = internalRows.filter((row) => row.locator === "9133");
assert.deepEqual(internal9133, [
  {page: 33, start: 91, length: 8, locator: "9133"},
]);

// P33 source geometry: the two selected objects are exactly its two red spans.
const p33 = ink.pages.find((page) => page.page === 33);
assert.ok(p33);
assert.deepEqual(
  (p33.red_spans || []).map((span) => ({
    start: span.start,
    length: span.length,
  })),
  [
    {start: 0, length: 10},
    {start: 91, length: 8},
  ]
);

const p33Lines = lineStarts(33);
assert.equal(p33Lines.length, 11);
assert.deepEqual(p33Lines[0], {
  line: 1,
  start: 0,
  length: 18,
  end: 17,
});
assert.deepEqual(p33Lines[5], {
  line: 6,
  start: 91,
  length: 19,
  end: 109,
});

console.log(JSON.stringify({
  status: "PASS",
  sourceNumbers: {
    cuneiform,
    cuneiformExactReversal: true,
    solved2014Suffix: offsetPageCode,
  },
  firstRubricLocator: {
    code: pageLineCode,
    interpretation: "PP LL",
    page: pageFrom3301,
    line: lineFrom3301,
    uniqueRedStartHit: start3301[0],
    sourceVisibleReverseCode: "1033",
    uniqueLengthPage1033: lengthPage1033[0],
  },
  secondRubricLocator: {
    code: offsetPageCode,
    interpretation: "RR PP",
    runeOffset: offsetFrom9133,
    page: pageFrom9133,
    uniqueInternalRedHit: internal9133[0],
  },
  p33: {
    redSpans: p33.red_spans.map((span) => ({
      start: span.start,
      length: span.length,
    })),
    line1: p33Lines[0],
    line6: p33Lines[5],
  },
  controls: {
    unknownPageRedStarts: startRows,
    internalRedSpans: internalRows,
  },
  decision:
    "The independently selected p33 is doubly source-addressed: 3301 uniquely selects its first red rubric as p33 line01, and solved-2014 suffix 9133 uniquely selects its second red rubric at rune offset91. These are source objects, not a decoder.",
}, null, 2));
