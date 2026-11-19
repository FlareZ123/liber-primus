#!/usr/bin/env node
"use strict";

/**
 * Agent8: page-indexed center/word transform route.
 * Uses the source-selected GP29 power pair (3,27) from the p33 H-rectangle
 * bridge. It evaluates the fixed page-number/word-number family, then follows
 * only the exact p50 low-digit pointers emitted by the candidate words.
 *
 * Run from repository root:
 *   node sims/lp2_page_index_centerword_cube_route_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const sections = read("resources/liber-primus/lp2-transcription.txt").split("%");
const dictionary = new Set(read("resources/control/english_wordfreq_textblob.txt").toUpperCase().split(/\s+/u).filter(Boolean));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const low = grid.bytes.map((value) => value % 60);

assert.equal(corpus.pages.length, 58);
assert.equal(sections.length, 57);
assert.equal(corpus.pages.find((page) => page.page === 50).indices.length, 0);
assert.ok(fs.existsSync(path.join(ROOT, "resources/liber-primus/26.jpg")));

function sectionIndex(page) {
  if (page === 50) return null;
  return page <= 49 ? page : page - 1;
}

function pageWordsWithOffsets(section) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (values.length) {
      words.push({ start, length: values.length, values: values.slice() });
      values = [];
    }
  };
  for (const character of section) {
    if (runeIndex.has(character)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Slash and newline are line wraps, not word boundaries.
    } else flush();
  }
  flush();
  return { words, runeCount: offset };
}

function powmod(value, exponent) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = (result * value) % 29;
    value = (value * value) % 29;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const rows = [];
for (const page of corpus.pages.filter((item) => item.page >= 1 && item.page <= 55 && item.indices.length > 0)) {
  const si = sectionIndex(page.page);
  assert.notEqual(si, null);
  const parsed = pageWordsWithOffsets(sections[si]);
  assert.equal(parsed.runeCount, page.indices.length, "source alignment mismatch at page " + page.page);
  const word = parsed.words[page.page - 1];
  if (!word || page.indices.length % 2 === 0) continue;
  const center = Math.floor(page.indices.length / 2);
  const values = [powmod(page.indices[center], 3), ...word.values.map((value) => powmod(value, 27))];
  const gp0 = values.reduce((sum, value) => sum + value, 0);
  rows.push({
    page: page.page,
    runeCount: page.indices.length,
    wordCount: parsed.words.length,
    center,
    centerValue: page.indices[center],
    wordStart: word.start,
    wordLength: word.length,
    wordInput: spell(word.values),
    output: spell(values),
    outputValues: values,
    gp0,
    pointer: gp0 < 256 ? low[gp0] : null,
    centerAdjacent: word.start === center + 1,
  });
}
assert.equal(rows.length, 30);

const p3 = rows.find((row) => row.page === 3);
const p28 = rows.find((row) => row.page === 28);
assert.ok(p3 && p28);
assert.equal(p3.output, "BLUR");
assert.equal(p3.gp0, 42);
assert.equal(p3.pointer, 28);
assert.equal(p3.centerAdjacent, false);
assert.equal(p3.wordStart, 13);
assert.equal(p3.center, 108);

assert.equal(p28.output, "READOUT");
assert.equal(p28.gp0, 75);
assert.equal(p28.pointer, 57);
assert.equal(p28.centerAdjacent, true);
assert.equal(p28.wordStart, 135);
assert.equal(p28.center, 134);
assert.equal(rows.filter((row) => row.centerAdjacent).length, 1);

const dictionaryMatches = rows.filter((row) => dictionary.has(row.output));
assert.deepEqual(dictionaryMatches.map((row) => ({ page: row.page, output: row.output })), [
  { page: 3, output: "BLUR" },
]);

function orbit(start) {
  const seen = new Map();
  const values = [];
  let value = start;
  while (!seen.has(value)) {
    seen.set(value, values.length);
    values.push(value);
    value = low[value];
  }
  return { values, repeated: value, cycleStart: seen.get(value) };
}
const from42 = orbit(42);
const from55 = orbit(55);
const from75 = orbit(75);
assert.deepEqual(from42.values, [42, 28, 30, 21, 17, 22, 59, 9]);
assert.deepEqual(from55.values, [55, 20, 42, 28, 30, 21, 17, 22, 59, 9]);
assert.deepEqual(from75.values, [75, 57, 58, 26, 53, 51, 59, 9]);
assert.equal(low[9], 9);

// p9 is the visual endpoint of the p50 orbit. The same p-th-word extension
// does not yield plaintext there: p9 has an even-length center pair.
const p9 = corpus.pages.find((page) => page.page === 9);
const p9Parsed = pageWordsWithOffsets(sections[9]);
assert.equal(p9.indices.length, 268);
assert.equal(p9Parsed.runeCount, 268);
assert.equal(p9Parsed.words.length, 57);
const p9Center = [p9.indices[133], p9.indices[134]];
assert.deepEqual(p9Center, [0, 19]); // F, M
const p9Word9 = p9Parsed.words[8];
assert.equal(spell(p9Word9.values), "OD");
const p9Readout = [
  ...p9Center.map((value) => powmod(value, 3)),
  ...p9Word9.values.map((value) => powmod(value, 27)),
];
assert.equal(spell(p9Readout), "FSIA");

console.log(JSON.stringify({
  source: {
    corpusPages: corpus.pages.length,
    transcriptionSections: sections.length,
    dictionaryEntries: dictionary.size,
    eligiblePages: rows.length,
  },
  outputs: rows.map(({ page, output, gp0, pointer, centerAdjacent }) => ({
    page, output, gp0, pointer, centerAdjacent,
  })),
  dictionaryMatches: dictionaryMatches.map(({ page, output, gp0, pointer }) => ({
    page, output, gp0, pointer,
  })),
  p3Route: { output: p3.output, gp0: p3.gp0, pointer: p3.pointer },
  p28Route: { output: p28.output, gp0: p28.gp0, pointer: p28.pointer },
  lowDigitOrbitFrom42: from42,
  lowDigitOrbitFrom55: from55,
  lowDigitOrbitFrom75: from75,
  p9VisualReceiver: {
    runes: p9.indices.length,
    words: p9Parsed.words.length,
    centerRunes: spell(p9Center),
    word9: spell(p9Word9.values),
    readoutCandidate: spell(p9Readout),
  },
}, null, 2));
