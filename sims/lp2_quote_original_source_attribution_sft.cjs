#!/usr/bin/env node
"use strict";

/**
 * Source-selected pre-2014 quotation attribution: an offline single-file test.
 *
 * Run with Node.js 22 from any working directory. Only committed inputs are read.
 * No source words are fitted to LP2, and no cipher parameters are tuned.
 * Three source corpora were selected before examining this issue's match scores:
 * Cicada/butterfly imagery (Giles 1889); the Caterpillar scene (Carroll 1865);
 * the original solved LP1 invocation of PILGRIM (Bunyan 1678).
 *
 * The fingerprint JSON stores both raw-letter and ING-aware GP token lengths
 * from immutable, Git-blob-identified editions. The algorithm searches every
 * source-word start for each original source-printed quotation shape.
 * A full match in an original 14/34-word quotation is the attribution gate.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = filename => fs.readFileSync(path.join(root, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const quotations = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const library = JSON.parse(read("im-results/quote-pre2014-source-length-fingerprints.json"));
const runes = new Set(corpus.runes);

/** Parse visible words while preserving page/line carry and source punctuation. */
function parseOriginal(raw) {
  const text = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let start = 0;
  let offset = 0;
  let current = "";

  function finish() {
    if (!current) return;
    words.push({start, end: offset, glyphs: current, length: [...current].length});
    current = "";
  }

  for (const char of text) {
    if (runes.has(char)) {
      if (!current) start = offset;
      current += char;
      offset++;
    } else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // A physical page turn or printed wrap is not a word boundary.
    } else {
      finish();
    }
  }
  finish();
  return {words, offset};
}

/**
 * @param {readonly number[]} target Original quoted GP word-length sequence.
 * @param {string} encoded Whole original-source word-length fingerprint.
 * @param {string} alphabet A one-to-one map for lengths 0..63.
 */
function scan(target, encoded, alphabet) {
  const symbols = target.map(length => alphabet[length]);
  let bestRun = 0;
  let bestStart = -1;
  let bestMatchCount = 0;
  let completeMatches = 0;
  for (let i = 0; i + symbols.length <= encoded.length; i++) {
    let currentRun = 0;
    let localBest = 0;
    let matches = 0;
    for (let j = 0; j < symbols.length; j++) {
      if (encoded[i + j] === symbols[j]) {
        currentRun++;
        matches++;
        localBest = Math.max(localBest, currentRun);
      } else {
        currentRun = 0;
      }
    }
    if (matches === symbols.length) completeMatches++;
    if (localBest > bestRun ||
      (localBest === bestRun && matches > bestMatchCount)) {
      bestRun = localBest;
      bestMatchCount = matches;
      bestStart = i;
    }
  }
  return {completeMatches, bestRun, bestMatchCount, bestStart};
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

assert.equal(library.schema, 1);
assert.equal(quotations.quotes.length, 7);
assert.equal(quotations.quote_rune_total, 405);
assert.equal(library.alphabet.length, 64);
assert.equal(new Set(library.alphabet).size, 64);
const parsed = parseOriginal(read("resources/lp2-transcription.txt"));
assert.equal(parsed.offset, 12956);
assert.equal(parsed.words.length, 2896);
const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(original.length, 12956);

const actualQuotes = quotations.quotes.map((quote, number) => {
  const selected = parsed.words.filter(word =>
    word.start >= quote.start && word.end <= quote.end);
  assert.equal(selected[0]?.start, quote.start, "quotation starts at complete word");
  assert.equal(selected.at(-1)?.end, quote.end, "quotation ends at complete word");
  assert.equal(selected.reduce((n, word) => n + word.length, 0),
    quote.end - quote.start);
  const indices = selected.flatMap(word => [...word.glyphs].map(glyph =>
    corpus.runes.indexOf(glyph)));
  assert.deepEqual(indices, original.slice(quote.start, quote.end));
  return {
    quote: number, start: quote.start, end: quote.end,
    lengths: selected.map(word => word.length),
    sha256: sha256(selected.map(word => word.glyphs).join(""))
  };
});
assert.deepEqual(actualQuotes.map(q => q.lengths), [
  [6,3,3,6],
  [3,3,4,5,4],
  [3,9],
  [5,7,2,3,4,6,4,3,3,4,4,4,5,4],
  [9,8,3,4,6,3,10,2,4,7,6,2,4],
  [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
  [5,7,2,3,4,10,3,9,7,3,7,4,3,3]
]);
console.log("ORIGINAL QUOTATIONS");
for (const quote of actualQuotes) {
  console.log(JSON.stringify({
    quote: quote.quote, start: quote.start, end: quote.end,
    shape: quote.lengths.join(","), rune_sha256: quote.sha256
  }));
}
let strongMatches = 0;
for (const source of library.sources) {
  assert.equal(source.raw.length, source.source_words);
  assert.equal(source.gp.length, source.source_words);
  assert(source.published <= 2014);
  for (const convention of ["gp", "raw"]) {
    const encoded = source[convention];
    assert([...encoded].every(char => library.alphabet.includes(char)));
    console.log("SOURCE", source.id, convention,
      "words", source.source_words, "original_git_blob", source.blob);
    for (const quote of actualQuotes) {
      const match = scan(quote.lengths, encoded, library.alphabet);
      if (quote.lengths.length >= 13) strongMatches += match.completeMatches;
      console.log(JSON.stringify({quote: quote.quote,
        length: quote.lengths.length, ...match}));
    }
    // Plant a source-native 34-word passage; detector must identify it.
    const originalPlant = encoded.slice(201, 235);
    const plant = [...originalPlant].map(c => library.alphabet.indexOf(c));
    assert.equal(plant.length, 34);
    assert(scan(plant, encoded, library.alphabet).completeMatches >= 1);
  }
}
assert.equal(strongMatches, 0, "Unexpected full-length quotation attribution");
console.log("RESULT: no complete 13-, 14- or 34-word quotation match in these");
console.log("three pinned source editions under either orthography.");
console.log("No original LP2 plaintext or authentic key recovered.");
