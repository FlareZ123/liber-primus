"use strict";

/**
 * Issue #1418: exact original 32x94 floral-to-grid row alignment gate.
 *
 * A 32x8 numerical table has a natural row count 32, and the visible
 * p40..p53 chapter has exactly 3008 = 32*94 GP29 runes. This SFT asks
 * whether 94-rune cuts, when anchored at the actual p40 first rune,
 * have independently printed support as words, lines, page or full
 * stops. It NEVER chooses a decoding opcode from the plaintext.
 *
 * Reproduce on Windows 11 with Node 22:
 *   node sims/lp2_floral_32x94_source_layout_sft.cjs
 *
 * Sources are the canonical original-rune corpus, physically transcribed
 * original line layout, red-ink span records and the original grid.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = read("resources/lp2-transcription.txt").split("%");
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
const rows = 32, cells = 8, block = 94;
const chapter = gp.pages.slice(40, 54).flatMap(p => p.indices);
assert.equal(chapter.length, rows * block);
const mapping = new Map(gp.runes.map((r, i) => [r, i]));
const isRune = ch => mapping.has(ch);
/** @param {string} s @returns {number} */
const runeCount = s => [...s].filter(isRune).length;

let position = 0;
const sourceRunes = [], printedLineEdges = new Set(),
  physicalPageEdges = new Set(), sourcePageStarts = [];
let concatenated = "";
for (let page = 40; page <= 53; page++) {
  if (page === 50) continue; // physical p50 is numeric-only
  const pageText = pages[page > 50 ? page - 1 : page];
  assert.equal(runeCount(pageText), gp.pages[page].indices.length,
    "original physical p" + page);
  sourcePageStarts.push({page, at: position});
  concatenated += pageText;
  for (const line of pageText.split(/\r?\n/)) {
    position += runeCount(line);
    if (position > 0 && position < 3008) printedLineEdges.add(position);
  }
  if (position > 0 && position < 3008) physicalPageEdges.add(position);
}
assert.equal(position, 3008);

const printedWordEdges = new Set(), printedPeriodEdges = new Set();
let between = "";
for (const ch of concatenated) {
  if (isRune(ch)) {
    const at = sourceRunes.length;
    if (at > 0 && /[-.]/.test(between)) printedWordEdges.add(at);
    if (at > 0 && between.includes(".")) printedPeriodEdges.add(at);
    sourceRunes.push(mapping.get(ch));
    between = "";
  } else between += ch;
}
assert.deepEqual(sourceRunes, chapter);
const boundaryPositions = Array.from({length: rows - 1},
  (_, i) => block * (i + 1));
const matches = (positions, set) => positions.filter(p => set.has(p)).length;
const layout = {
  total: chapter.length,
  rowCount: rows,
  blockLength: block,
  tableColumns: cells,
  eachColumnEqualIntegerRemainder: block % cells,
  printedWordEdges: matches(boundaryPositions, printedWordEdges),
  printedLineEdges: matches(boundaryPositions, printedLineEdges),
  physicalPageEdges: matches(boundaryPositions, physicalPageEdges),
  printedPeriodEdges: matches(boundaryPositions, printedPeriodEdges)
};
assert.deepEqual(layout, {
  total: 3008, rowCount: 32, blockLength: 94,
  tableColumns: 8, eachColumnEqualIntegerRemainder: 6,
  printedWordEdges: 8, printedLineEdges: 2,
  physicalPageEdges: 0, printedPeriodEdges: 0
});

const afterTable = sourcePageStarts.find(p => p.page === 51).at;
assert.equal(afterTable, 2474);
assert.equal(afterTable % block, 30);
assert(!boundaryPositions.includes(afterTable));
// Last printed red 51-runic tail starts after 43 symbols in the
// hypothetical last 94-rune row; it does not mark that row's start.
const lastRed = ink.pages.find(p => p.page === 53).red_spans
  .find(span => span.length === 51);
assert.equal(lastRed.start, 128);
const finalPageStart = sourcePageStarts.find(p => p.page === 53).at;
assert.equal(finalPageStart, 2829);
const redAt = finalPageStart + lastRed.start;
assert.equal(redAt, 2957);
assert.equal(redAt - block * 31, 43);
const phaseStats = Array.from({length: block}, (_, phase) => {
  const positions = Array.from({length: rows},
    (_, i) => phase + block * i).filter(p => p > 0 && p < chapter.length);
  return {phase, word: matches(positions, printedWordEdges),
    line: matches(positions, printedLineEdges),
    page: matches(positions, physicalPageEdges)};
});
const wordRank = 1 + phaseStats.filter(x => x.word > layout.printedWordEdges).length;
assert.equal(wordRank, 28);
console.log(JSON.stringify({
  chapterPages: "p40..p53, p50 zero-rune numeric table",
  sourcePageStarts,
  printed: {
    totalWordEdges: printedWordEdges.size,
    totalLineEdges: printedLineEdges.size,
    totalPageEdges: physicalPageEdges.size,
    totalPeriodEdges: printedPeriodEdges.size
  },
  originalStartRowLayout: layout,
  originalStartRankAmong94WordEdgePhases: wordRank,
  tableSeamAfterP49: {globalRuneOffset: afterTable,
    hypotheticalRow: Math.floor(afterTable / block),
    withinHypotheticalRow: afterTable % block},
  finalRed51: {startGlobal: redAt,
    withinHypotheticalLastRow: redAt - block * 31},
  inference: "32x94 is arithmetically valid, but its source-started interior cuts have no printed row grammar and the p50 table seam splits hypothetical row 26. No source-selected row-to-GP29 opcode, block origin or native plaintext identified."
}, null, 2));
