#!/usr/bin/env node
"use strict";

// Read-only extraction of the single frozen LP2 page:word hypothesis:
// (17,13) -> physical LP2 page 17, printed word 13;
// (55,1)  -> physical LP2 page 55, printed word 1.
//
// The canonical transcription uses '-' as a word delimiter and '/' as a
// line break; words may continue across line breaks. Page 50 is runeless and
// therefore absent from lp2-transcription.txt. The original image archive
// numbering is LP2 page + 17 (documented in resources/liber-primus/README.md).

const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const transcription = fs.readFileSync("resources/liber-primus/lp2-transcription.txt", "utf8");
const segments = transcription.split("%");
const runeSet = new Set(corpus.runes);

assert.equal(corpus.pages.length, 58);
assert.equal(segments.length, 57); // physical p50 has no rune text.

function extractPage(pageNumber) {
  assert(Number.isInteger(pageNumber) && pageNumber >= 0 && pageNumber <= 57);
  assert.notEqual(pageNumber, 50, "p50 is a numeric table, not a rune-text page");
  const segmentIndex = pageNumber < 50 ? pageNumber : pageNumber - 1;
  const segment = segments[segmentIndex];
  assert(segment !== undefined, `missing transcription segment for p${pageNumber}`);

  // Preserve continuity across visual line wraps; only '-' splits words.
  const joined = segment
    .split(/\r?\n/u)
    .map(line => line.trim())
    .filter(line => line && line !== "&" && line !== "$")
    .join("");

  const words = joined
    .split("-")
    .map(token => [...token].filter(rune => runeSet.has(rune)).join(""))
    .filter(Boolean);
  const runeCount = [...joined].filter(rune => runeSet.has(rune)).length;
  const page = corpus.pages.find(item => item.page === pageNumber);
  assert(page, `missing corpus page ${pageNumber}`);
  assert.equal(runeCount, page.runic_count, `transcription/corpus rune count mismatch on p${pageNumber}`);

  return {
    page: pageNumber,
    archive_image: `${String(pageNumber + 17).padStart(2, "0")}.jpg`,
    runic_count: runeCount,
    word_count: words.length,
    words
  };
}

function transliterate(word) {
  return [...word].map(rune => {
    const index = corpus.runes.indexOf(rune);
    assert(index >= 0);
    return corpus.translit[index];
  }).join("");
}

const p17 = extractPage(17);
const p55 = extractPage(55);
const word17_13 = p17.words[12];
const word55_1 = p55.words[0];

assert.equal(p17.word_count, 64);
assert.equal(p55.word_count, 17);
assert.equal(word17_13, "ᚠᚱᛠᛗᛠᚪ");
assert.equal(word55_1, "ᛝ");
assert.equal(transliterate(word17_13), "FREAMEAA");
assert.equal(transliterate(word55_1), "NG");

console.log(JSON.stringify({
  frozen_grammar: "zero-based LP2 page, one-based printed word",
  coordinates: [
    { address: [17, 13], page: 17, word: 13, runes: word17_13, gp: transliterate(word17_13) },
    { address: [55, 1], page: 55, word: 1, runes: word55_1, gp: transliterate(word55_1) }
  ],
  page_controls: [
    { page: p17.page, archive_image: p17.archive_image, runic_count: p17.runic_count, word_count: p17.word_count },
    { page: p55.page, archive_image: p55.archive_image, runic_count: p55.runic_count, word_count: p55.word_count }
  ],
  decision: "extraction only; no source-selected receiver or plaintext"
}, null, 2));
