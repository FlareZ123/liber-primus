"use strict";
/**
 * Historic 2014 Stage10 JPEG filename values versus original LP2 word boundaries.
 * Reproducer: node sims/lp2_stage10_filename_wholeword_boundary_sft.cjs
 * Read-only, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const segments = transcription.split(/\n%\s*\n/g);
assert.equal(segments.length, 57, "One runeless physical page p50 is omitted");
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const words = [];
let current = null;
let runeCount = 0;

/** @param {{start_page:number,end_page:number,start_offset:number,runes:number[],sum:number}|null} word */
function finish(word) {
  if (word) words.push(word);
}

/* A slash marks a printed line break. A page break can also split a word:
 * remove both, while retaining real hyphens, stops and punctuation.
 */
for (let segment = 0; segment < segments.length; segment++) {
  const page = segment >= 50 ? segment + 1 : segment;
  const content = segments[segment].replace(/[/\n&$]/g, "");
  let offset = 0;
  for (const ch of content) {
    const index = runeMap.get(ch);
    if (index !== undefined) {
      if (!current) {
        current = {start_page: page, end_page: page,
          start_offset: offset, runes: [], sum: 0};
      }
      current.runes.push(index);
      current.sum += corpus.prime[index];
      current.end_page = page;
      offset++;
      runeCount++;
    } else {
      finish(current);
      current = null;
    }
  }
  assert.deepEqual(offset, corpus.pages[page].indices.length,
    "Source transcription/corpus page rune count mismatch: " + page);
}
finish(current);

const unknown = words.filter(w => w.start_page <= 55);
assert.equal(runeCount, 13136);
assert.equal(unknown.length, 2896);
assert.equal(unknown.filter(w => w.start_page !== w.end_page).length, 32);

/** @param {number[]} values @param {number[]} target */
function includesOrdered(values, target) {
  let i = 0;
  for (const v of values) {
    if (v === target[i]) {
      i++;
      if (i === target.length) return true;
    }
  }
  return false;
}

const targets = [107, 167, 229]; // Actual 13 Feb 2014 Stage10 filenames.
const hits = [];
for (let first = 0; first < 55; first++) {
  const sourceWords = unknown.filter(w =>
    w.start_page >= first && w.start_page <= first + 1);
  if (includesOrdered(sourceWords.map(w => w.sum), targets)) hits.push(first);
}
assert.deepEqual(hits, [],
  "A whole-word two-page 107->167->229 route would be a new finding");

/** @param {number} page @param {number} offset */
function sourceWord(page, offset) {
  return unknown.find(w => w.start_page === page && w.start_offset === offset);
}
const seam26 = unknown.find(w =>
  w.start_page === 25 && w.end_page === 26);
const seam49 = unknown.find(w =>
  w.start_page === 48 && w.end_page === 49);
assert.equal(seam26?.sum, 452);
assert.deepEqual(seam26?.runes.map(i => corpus.translit[i]),
  ["IA", "E", "T", "EA", "U", "IA"]);
assert.equal(seam49?.sum, 517);
assert.deepEqual(seam49?.runes.map(i => corpus.translit[i]),
  ["EO", "F", "U", "D", "Y", "A", "L", "F", "IA"]);
assert.equal(sourceWord(26, 0), undefined,
  "Physical p26 starts with a carried suffix rather than a word");
assert.equal(sourceWord(49, 0), undefined,
  "Physical p49 starts with a carried suffix rather than a word");
assert.equal(sourceWord(27, 95)?.sum, 167);
assert.equal(sourceWord(27, 163)?.sum, 229);

const physicalFirst = [26, 49].map(page => {
  const first = segments[page].replace(/[/\n&$]/g, "")
    .match(/[\u16A0-\u16FF]+/u)[0];
  const value = [...first].reduce((s, r) =>
    s + corpus.prime[runeMap.get(r)], 0);
  assert.equal(value, 107);
  return {page, physical_fragment: first, fragment_sum: value,
    complete_word_sum: page === 26 ? seam26.sum : seam49.sum};
});

const result = {
  historical_source: "2014 Stage10 JPEG filenames 107.jpg, 167.jpg, 229.jpg",
  original_full_words: unknown.length,
  carried_words: 32,
  false_page_first_107_fragments: physicalFirst,
  p27_complete_word_targets: [
    {offset: 95, sum: sourceWord(27, 95).sum},
    {offset: 163, sum: sourceWord(27, 163).sum}
  ],
  original_complete_word_two_page_107_167_229_hits: hits,
  interpretation: "The tempting p26->p27 filename trail requires treating a cross-page word suffix as a standalone word. Source-valid full-word route has zero hits; no decipherment."
};
console.log(JSON.stringify(result, null, 2));
