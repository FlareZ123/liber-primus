#!/usr/bin/env node
"use strict";

// Exact word counts between the 31 original 13-dot annotation records.
// Physical page breaks and print wraps do not terminate a word.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const raw = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const RUNIC = /[\u16A0-\u16FF]/u;

const pageBase = new Map();
let totalRunes = 0;
for (const page of corpus.pages) {
  pageBase.set(page.page, totalRunes);
  totalRunes += page.indices.length;
}

const events = [];
for (const page of ink.pages) {
  let sequence = 0;
  for (const mark of page.large_punctuation || []) {
    if (mark[1] !== 13) continue;
    events.push({
      page: page.page,
      offset: mark[0],
      ink: mark[2],
      global: pageBase.get(page.page) + mark[0],
      sequence: sequence++,
    });
  }
}
events.sort((a, b) =>
  a.global - b.global || a.page - b.page || a.sequence - b.sequence);

const words = [];
let current = "";
let wordStart = -1;
let runeOffset = 0;
function finishWord() {
  if (!current) return;
  words.push({ start: wordStart, end: runeOffset - 1, length: runeOffset - wordStart });
  current = "";
  wordStart = -1;
}

for (const character of raw) {
  if (RUNIC.test(character)) {
    if (!current) wordStart = runeOffset;
    current += character;
    runeOffset++;
  } else if (character === "%" || character === "/" || /\s/u.test(character)) {
    // Page separators and print wraps preserve a word.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(corpus.pages.length, 58);
assert.equal(totalRunes, 13136);
assert.equal(runeOffset, totalRunes, "transcription and corpus rune totals must agree");
assert.equal(events.length, 31, "expected all 31 original 13-dot annotation records");

const bounds = [0, ...events.map((event) => event.global), totalRunes];
const fragments = [];
for (let index = 0; index < bounds.length - 1; index++) {
  const start = bounds[index];
  const end = bounds[index + 1];
  const contained = words.filter((word) => word.start >= start && word.end < end);
  const crossing = words.filter((word) =>
    word.start < end && word.end >= start &&
    !(word.start >= start && word.end < end));
  assert.equal(crossing.length, 0, "word crosses stencil boundary at fragment " + (index + 1));
  fragments.push({
    fragment: index + 1,
    start,
    end,
    runes: end - start,
    words: contained.length,
  });
}

const counts = fragments.map((fragment) => fragment.words);
const expected = [2,156,3,19,1,153,4,70,0,5,383,0,2,3,432,4,220,3,323,2,21,2,324,1,28,669,2,64,2,23,1,19];
assert.equal(fragments.length, 32);
assert.deepEqual(counts, expected);
assert.equal(fragments.filter((fragment) => fragment.runes === 0).length, 2);
assert(!counts.includes(8), "no 13-dot interval should contain exactly eight words");

console.log("LP2 13-dot full-text interval word counts");
console.log("runes=" + totalRunes + " words=" + words.length + " stencil_records=" + events.length + " intervals=" + fragments.length);
console.log("fragment | start | end | runes | words");
for (const fragment of fragments) {
  console.log(fragment.fragment + " | " + fragment.start + " | " + fragment.end + " | " + fragment.runes + " | " + fragment.words);
}
console.log("PASS: all stencil boundaries coincide with word boundaries; no interval has eight words; two intervals are empty.");
console.log("Scope: this rejects one-word-per-column (8 words per fragment), not a distinct row-per-fragment cipher.");
