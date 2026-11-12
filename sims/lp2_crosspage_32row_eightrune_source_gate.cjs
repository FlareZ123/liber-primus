"use strict";

/**
 * Original 32 page-spanning words versus 32 printed 8-cell rows.
 * Source-only, exact selector gate for Director #629; no invented padding.
 * Run from repo root: node sims/lp2_crosspage_32row_eightrune_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");

const parsed = parseSharedCorpus();
const table = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const carries = parsed.words.filter(w => w.startPage !== w.endPage);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
assert.equal(carries.length, 32);
assert.equal(table.rows.length, 32);
assert(table.rows.every(row => row.length === 8));
const lengths = carries.map(w => w.length);
assert.deepEqual(lengths, [
  6,5,5,3,7,3,6,11,4,6,3,10,7,10,6,5,
  7,4,3,5,5,6,11,4,5,9,11,8,9,4,10,11
]);
assert.equal(lengths.filter(v => v < 8).length, 22);
assert.equal(lengths.filter(v => v >= 8).length, 10);
assert.equal(Math.min(...lengths), 3);
assert.equal(Math.max(...lengths), 11);

const events = carries.map((w, i) => ({
  row: i + 1, from: physicalLP2Page(w.startPage),
  to: physicalLP2Page(w.endPage), runes: w.runes, length: w.length
}));
assert(events.every(w => w.to === w.from + 1));
assert(!events.some(w => w.from === 49 && w.to === 50));
assert(!events.some(w => w.from === 50 && w.to === 51));
assert(!events.some(w => w.from === 55 || w.to > 55));

// A literal 8-rune-per-word row assignment would require source runes
// that do not exist in 22 rows. Synthetic positive control demonstrates
// that full eight-symbol words would pass this exact length gate.
const originalEightLiteral = carries.every(w => [...w.runes].length >= 8);
const plant = carries.map((w, i) => w.runes.padEnd(8, [...w.runes][0]).slice(0, 8));
assert.equal(plant.every(w => [...w].length === 8), true);
assert.equal(originalEightLiteral, false);

console.log(JSON.stringify({
  result: "Missing original 8-rune selector; direct 32x8 carry-window hypothesis rejected.",
  originalPrintedWords: parsed.words.length,
  originalRunes: parsed.runeCount,
  originalCrossPageCarries: carries.length,
  originalGridShape: [32, 8],
  lengths,
  rowsWithLessThan8OriginalRunes: 22,
  rowsWithAtLeast8OriginalRunes: 10,
  shortestOriginalWord: 3,
  longestOriginalWord: 11,
  allTransitionsAdjacentRuneBearingPages: true,
  noCarryFromTheRunelessPhysicalPage50: true,
  literalEightOriginalRunesPerRow: originalEightLiteral,
  deliberatelyPaddedSyntheticPositiveControlPasses: true,
  originalPhysicalCrossPageEvents: events
}, null, 2));
