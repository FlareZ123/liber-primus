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

const rows = [26, 27, 28, 29].map((page) => {
  const parsed = parsePage(physicalPart(page));
  const center = (parsed.runes.length + 1) / 2;
  const selected = parsed.words.find((word) => word.word === page);
  assert.ok(selected, `p${page} has no page-numbered word`);
  return {
    page,
    runeCount: parsed.runes.length,
    wordCount: parsed.words.length,
    centerRunePosition: center,
    selectedWord: selected.word,
    selectedWordStartRune: selected.start + 1,
    selectedWordLength: selected.length,
    startMinusCenter: selected.start + 1 - center,
  };
});

assert.deepEqual(rows, [
  { page: 26, runeCount: 265, wordCount: 59, centerRunePosition: 133, selectedWord: 26, selectedWordStartRune: 117, selectedWordLength: 4, startMinusCenter: -16 },
  { page: 27, runeCount: 234, wordCount: 52, centerRunePosition: 117.5, selectedWord: 27, selectedWordStartRune: 109, selectedWordLength: 3, startMinusCenter: -8.5 },
  { page: 28, runeCount: 269, wordCount: 59, centerRunePosition: 135, selectedWord: 28, selectedWordStartRune: 136, selectedWordLength: 5, startMinusCenter: 1 },
  { page: 29, runeCount: 277, wordCount: 71, centerRunePosition: 139, selectedWord: 29, selectedWordStartRune: 107, selectedWordLength: 2, startMinusCenter: -32 },
]);

assert.equal(rows.filter((row) => row.startMinusCenter === 1 && row.selectedWordLength === 5).map((row) => row.page).join(","), "28");
console.log(JSON.stringify({ parser: "hyphen/period only; one-based word numbers", rows }, null, 2));
