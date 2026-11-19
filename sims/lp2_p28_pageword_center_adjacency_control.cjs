"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split("%").slice(0, 55);

function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

// Match the canonical p28 SFT parser: only printed hyphen and period
// terminate a word. Spaces and line breaks are not word boundaries.
function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ word: words.length + 1, start, length: current.length });
    current = [];
  };
  for (const char of [...source]) {
    if (runeSet.has(char)) {
      runes.push(runeIndex.get(char));
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

// Source-constrained familywise test: physical page p selects its own
// one-based word p. No rune values are emitted or transformed.
const rows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue; // p50 is the numeric table, not a rune page.
  const parsed = parsePage(physicalPart(page));
  const selected = parsed.words.find((word) => word.word === page);
  if (!selected) continue;
  const center = (parsed.runes.length + 1) / 2;
  rows.push({
    page,
    runeCount: parsed.runes.length,
    wordCount: parsed.words.length,
    centerRunePosition: center,
    selectedWord: selected.word,
    selectedWordStartRune: selected.start + 1,
    selectedWordLength: selected.length,
    startMinusCenter: selected.start + 1 - center,
  });
}

const centerAdjacent = rows.filter((row) => row.startMinusCenter === 1);
const fiveRuneCenterAdjacent = centerAdjacent.filter((row) => row.selectedWordLength === 5);

assert.equal(rows.length, 48);
assert.deepEqual(centerAdjacent.map((row) => row.page), [28]);
assert.deepEqual(fiveRuneCenterAdjacent.map((row) => row.page), [28]);
assert.deepEqual(
  rows.find((row) => row.page === 28),
  {
    page: 28,
    runeCount: 269,
    wordCount: 59,
    centerRunePosition: 135,
    selectedWord: 28,
    selectedWordStartRune: 136,
    selectedWordLength: 5,
    startMinusCenter: 1,
  },
);

console.log(JSON.stringify({
  parser: "hyphen/period only; one-based word numbers",
  rule: "physical page p selects one-based word p",
  testedPagesWithWord: rows.length,
  centerAdjacentPages: centerAdjacent,
  fiveRuneCenterAdjacentPages: fiveRuneCenterAdjacent,
}, null, 2));
