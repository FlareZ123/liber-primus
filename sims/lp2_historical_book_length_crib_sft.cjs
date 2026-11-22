"use strict";

/**
 * Original-word-length known-plaintext screen against the historically selected
 * Cicada reference books. This test identifies only intact copied passages;
 * it cannot decrypt text or exclude rephrased/edited source material.
 *
 * Run with Node.js from the repository root:
 * node sims/lp2_historical_book_length_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const digraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
const books = [
  ["Blake, Marriage of Heaven and Hell", "resources/external/blake-marriage-1906-gutenberg45315.txt", 4609, [7, 8]],
];

/** @param {string} w @returns {number} */
function gpLength(w) {
  let n = 0;
  for (let i = 0; i < w.length; i++) {
    if (w.slice(i, i + 3) === "ING") {
      i += 2;
    } else if (digraphs.has(w.slice(i, i + 2))) {
      i++;
    }
    n++;
  }
  return n;
}

/** @param {number[]} lengths @param {number} width */
function indexLengths(lengths, width) {
  const index = new Map();
  for (let i = 0; i + width <= lengths.length; i++) {
    const key = lengths.slice(i, i + width).join(",");
    const matches = index.get(key) || [];
    matches.push(i);
    index.set(key, matches);
  }
  return index;
}

/**
 * Exact aligned word-length matches, with maximal left/right extension.
 * @param {number[]} sourceLengths
 * @param {string[]} sourceWords
 * @param {number[]} targetLengths
 * @param {Array<{startPage:number}>} originalWords
 * @param {number} width
 */
function match(sourceLengths, sourceWords, targetLengths, originalWords, width = 7) {
  const index = indexLengths(targetLengths, width);
  const matches = new Map();
  for (let j = 0; j + width <= sourceLengths.length; j++) {
    const key = sourceLengths.slice(j, j + width).join(",");
    for (const originalStart of index.get(key) || []) {
      let i = originalStart;
      let b = j;
      let length = width;
      while (i > 0 && b > 0 && targetLengths[i - 1] === sourceLengths[b - 1]) {
        i--;
        b--;
        length++;
      }
      while (i + length < targetLengths.length &&
             b + length < sourceLengths.length &&
             targetLengths[i + length] === sourceLengths[b + length]) length++;
      matches.set(i + ":" + b, {
        originalWord: i,
        physicalPage: physicalLP2Page(originalWords[i].startPage),
        bookWord: b,
        matchingWords: length,
        candidatePhrase: sourceWords.slice(b, b + length).join(" "),
      });
    }
  }
  return [...matches.values()].sort((a, b) =>
    b.matchingWords - a.matchingWords ||
    a.originalWord - b.originalWord || a.bookWord - b.bookWord);
}

const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
const target = original.words.map(w => w.length);
const results = [];
for (const [name, sourcePath, expectedWords, expectedMaxima] of books) {
  const words = read(sourcePath).toUpperCase().match(/[A-Z]+/gu) || [];
  assert.equal(words.length, expectedWords);
  for (const [k, [mode, measure]] of [
    ["literalLatin", w => w.length], ["greedyGP29", gpLength]
  ].entries()) {
    const lengths = words.map(measure);
    const matches = match(lengths, words, target, original.words);
    assert.equal(matches[0]?.matchingWords, expectedMaxima[k]);
    assert.equal(matches.filter(x => x.matchingWords >= 9).length, 0);
    results.push({
      book: name, mode, sourceWords: words.length,
      bestMatchingWords: matches[0]?.matchingWords || 0,
      top: matches.slice(0, 3), passagesAtLeast9: 0,
    });
  }
  if (name.startsWith("Blake,")) {
    const planted = target.slice();
    for (let k = 0; k < 16; k++) planted[1000 + k] = gpLength(words[500 + k]);
    const recovered = match(words.map(gpLength), words, planted, original.words);
    assert(recovered.some(x => x.originalWord === 1000 &&
      x.bookWord === 500 && x.matchingWords >= 16),
      "known 16-word Blake plant must be recovered");
  }
}

console.log(JSON.stringify({
  classification: "finite exact original-word-length crib exclusion",
  objective: "find copied historical-source plaintext before selecting a cipher key",
  originalWords: original.words.length,
  originalRunes: original.runeCount,
  seedWidth: 7,
  fullLeftRightExtension: true,
  sourceSelectedBeforeScan: books.map(x => x[0]),
  planted16WordPass: true,
  results,
  limits: "word boundaries and exact GP spelling must be preserved",
}, null, 2));
