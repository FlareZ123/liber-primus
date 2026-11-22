"use strict";

/**
 * Original LP2 literal-word and historically linked 2012 Agrippa crib gate.
 * No network dependency, plaintext fitting, or file writes.
 * Run on Windows with: node sims/lp2_historical_agrippa_literal_crib_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const archive = JSON.parse(read("resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json"));
const transcript = read("resources/lp2-transcription.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const glyphs = new Map(corpus.runes.map((r, i) => [r, i]));
const digraphs = ["ING", "TH", "NG", "EO", "OE", "AE", "EA", "IA"];

/** @param {string} input @returns {number[] | null} */
function encodeWord(input) {
  const spelling = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const values = [];
  for (let i = 0; i < spelling.length;) {
    const token = digraphs.find((part) => spelling.startsWith(part, i)) || spelling[i];
    const value = corpus.translit.indexOf(token);
    if (value === -1) return null;
    values.push(value);
    i += token.length;
  }
  return values;
}

const words = [];
let page = 0;
let startPage = 0;
let buffer = [];
const perPageCount = new Map();
/** Flush at printed punctuation; a slash and page marker never terminate a word. */
function flush() {
  if (buffer.length === 0) return;
  const physicalPage = startPage >= 50 ? startPage + 1 : startPage;
  const wordIndex = perPageCount.get(physicalPage) || 0;
  perPageCount.set(physicalPage, wordIndex + 1);
  words.push({ page: physicalPage, wordIndex, indices: buffer });
  buffer = [];
}
for (const mark of transcript) {
  const index = glyphs.get(mark);
  if (index !== undefined) {
    if (buffer.length === 0) startPage = page;
    buffer.push(index);
  } else if (mark === "%") {
    page++;
  } else if ("-.$&§".includes(mark)) {
    flush();
  }
}
flush();
const unknown = words.filter((w) => w.page <= 55);
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((sum, w) => sum + w.indices.length, 0), 12956);
assert.equal(words.length, 2941);
assert.deepEqual(
  unknown.flatMap((w) => w.indices),
  corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices)
);

const lexicon = new Map();
for (const spelling of shakespeare.match(/[A-Za-z]+/g) || []) {
  const indices = encodeWord(spelling);
  if (indices) lexicon.set(indices.join(","), spelling.toUpperCase());
}
assert.equal(lexicon.size, 5306);
const byLength = new Map();
const lexLength = new Map();
for (const key of lexicon.keys()) {
  const n = key.split(",").length;
  lexLength.set(n, (lexLength.get(n) || 0) + 1);
}
const literal = [];
for (const word of unknown) {
  const n = word.indices.length;
  byLength.set(n, (byLength.get(n) || 0) + 1);
  if (n < 4) continue;
  const spelling = lexicon.get(word.indices.join(","));
  if (spelling) {
    literal.push({
      page: word.page,
      wordIndex: word.wordIndex,
      runes: word.indices.map((i) => corpus.translit[i]).join(""),
      english: spelling
    });
  }
}
assert.equal(byLength.get(4), 513);
assert.equal(lexLength.get(4), 811);
assert.deepEqual(literal, [
  { page: 14, wordIndex: 1, runes: "FOLD", english: "FOLD" },
  { page: 40, wordIndex: 6, runes: "MACE", english: "MAKE" }
]);
const expected = [...byLength.entries()].reduce((total, [n, slots]) =>
  total + (n >= 4 ? slots * (lexLength.get(n) || 0) / 29 ** n : 0), 0);
assert.ok(Math.abs(expected - 0.6034087374756465) < 1e-12);

const targets = {
  p40: [5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4],
  p53: [5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3],
  p42to43: [4, 2, 4, 6, 6, 8, 8, 3, 5, 5, 9, 2, 2, 4, 3, 3, 2, 8,
    4, 7, 4, 4, 3, 2, 5, 3, 3, 6, 3, 11, 4, 4, 8, 5]
};
const sourceLengths = archive.word_lengths;
assert.equal(sourceLengths.length, 1682);
const distances = {};
for (const [name, pattern] of Object.entries(targets)) {
  let best = Infinity;
  let offset = -1;
  for (let i = 0; i <= sourceLengths.length - pattern.length; i++) {
    let error = 0;
    for (let k = 0; k < pattern.length; k++) error += Math.abs(sourceLengths[i + k] - pattern[k]);
    if (error < best) { best = error; offset = i; }
  }
  distances[name] = { minimumL1: best, firstBestSourceWord: offset };
}
assert.equal(distances.p40.minimumL1, 12);
assert.equal(distances.p53.minimumL1, 18);
assert.equal(distances.p42to43.minimumL1, 57);
const commonPrefix = [5, 7, 2, 3, 4];
const prefixMatches = sourceLengths.filter((_, i) =>
  i + commonPrefix.length <= sourceLengths.length &&
  commonPrefix.every((x, j) => sourceLengths[i + j] === x)).length;
assert.equal(prefixMatches, 0);

console.log(JSON.stringify({
  originalUnknownRunes: 12956,
  originalUnknownWords: 2896,
  originalLiteralWordsAtLengthFourOrMore: literal,
  languageDictionaryDistinctGPWords: lexicon.size,
  independentUniformExpectedLiteralHitsLengthFourPlus: expected,
  historical2012AgrippaWordCount: sourceLengths.length,
  historicalSourceQuoteMinima: distances,
  historicalSourceFiveWordPrefixMatches: prefixMatches,
  status: "No decrypted unknown plaintext or author-selected operation"
}, null, 2));
