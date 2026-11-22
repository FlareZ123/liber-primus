"use strict";

/**
 * SFT for the conditionally preselected p0 EA109 raw XY word observation.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeSet = new Set(corpus.runes);

/**
 * @param {number} block
 * @returns {number}
 */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,
 *   values:number[]
 * }>}
 */
function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map((rune) => corpus.runes.indexOf(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const words = parseWords();
const unknownWords = words.filter(
  (word) => word.startPage < 56 && word.endPage < 56
);
assert.equal(unknownWords.length, 2896);

const twoRuneWords = unknownWords.filter((word) => word.values.length === 2);
assert.equal(twoRuneWords.length, 448);

const xyWords = twoRuneWords.filter(
  (word) => word.values[0] === 14 && word.values[1] === 26
);
const yxWords = twoRuneWords.filter(
  (word) => word.values[0] === 26 && word.values[1] === 14
);

assert.equal(xyWords.length, 1);
assert.equal(yxWords.length, 0);
assert.deepEqual(
  {
    startPage: xyWords[0].startPage,
    startOffset: xyWords[0].startOffset,
    endPage: xyWords[0].endPage,
    endOffset: xyWords[0].endOffset,
  },
  { startPage: 0, startOffset: 109, endPage: 0, endOffset: 110 }
);

const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
assert.deepEqual(p0.indices.slice(109, 111), [14, 26]);
assert.deepEqual(
  p0.indices.slice(109, 111).map((value) => corpus.translit[value]),
  ["X", "Y"]
);

const xyAdjacent = [];
for (const page of corpus.pages.filter(
  (candidate) => candidate.page < 56 && candidate.indices.length > 0
)) {
  for (let offset = 0; offset + 1 < page.indices.length; offset += 1) {
    if (page.indices[offset] === 14 && page.indices[offset + 1] === 26) {
      xyAdjacent.push([page.page, offset]);
    }
  }
}
assert.equal(xyAdjacent.length, 19);
assert.deepEqual(xyAdjacent[0], [0, 109]);

const road = [4, 3, 24, 23];
let roadBase29 = 0;
for (const value of road) roadBase29 = roadBase29 * 29 + value;
assert.equal(roadBase29, 100798);
assert.equal(roadBase29 % 256, 190);

const roadCell = (roadBase29 % 256) - 1;
assert.equal(roadCell, 189);
assert.equal(grid.bytes[roadCell], 192);

const row = Math.floor(roadCell / 8);
const column = roadCell % 8;
assert.equal(row, 23);
assert.equal(column, 5);

const state = Object.freeze({ p: 23, g: 5 });
assert.deepEqual([column, row], [state.g, state.p]);

const tokenValue = grid.bytes[roadCell];
const token =
  grid.alphabet[Math.floor(tokenValue / 60)] +
  grid.alphabet[tokenValue % 60];
assert.equal(token, "3C");
assert.equal(3 * 59 + 12, roadCell);

console.log(JSON.stringify({
  status: "PASS",
  canonicalUnknownWords: unknownWords.length,
  canonicalUnknownTwoRuneWords: twoRuneWords.length,
  rawXY: {
    completeWordOccurrences: xyWords.map((word) => ({
      page: word.startPage,
      start: word.startOffset,
      end: word.endOffset,
    })),
    reverseYXCompleteWords: yxWords.length,
    allAdjacentXYBigrams: xyAdjacent.length,
  },
  upstreamRoadConsumer: {
    roadBase29,
    residue256: roadBase29 % 256,
    oneBasedCell: roadCell,
    token,
    row,
    column,
    xyCoordinates: [column, row],
    dhReading: ["g", "p"],
  },
  classification:
    "Conditionally preselected receiver: EA prime109 lands on the sole complete XY two-rune word in unknown LP2. The ROAD-cell Cartesian XY=(g,p) reading is post-observation and is not independent opcode evidence.",
}, null, 2));
