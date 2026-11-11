"use strict";

/**
 * Original LP2 printed-word-length source fingerprint, eight historically
 * relevant English-language texts. Standalone CommonJS single-file test.
 *
 * This is an exact copied-text detector: it assumes ciphering preserves
 * manuscript word boundaries and greedy GP29 digraph tokenization. It makes
 * no assumption about ciphertext letters or unknown encryption keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const sourceFiles = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const sectionText = read("resources/lp2-transcription.txt").split("$").slice(0, 8);
/** @param {string} text */
const lp2Words = text => text.split(/[-.&§]/)
  .map(x => (x.match(/\p{Script=Runic}/gu) || []).length)
  .filter(Boolean);
const sections = sectionText.map(lp2Words);
assert.deepEqual(sections.map(x => x.length),
  [158, 255, 385, 435, 224, 326, 378, 735]);
assert.deepEqual(sections.map(x => x.reduce((a, b) => a + b, 0)),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);

// Only seven runes represent two English letters in standard GP29.
const digraphs = new Set(["TH", "EO", "NG", "OE", "AE", "IA", "EA"]);
/** @param {string} word */
function gpWordLength(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++, n++) {
    if (i + 1 < word.length && digraphs.has(word.slice(i, i + 2)))
      i++;
  }
  return n;
}
/** @param {string} text */
const englishWords = text => text.toUpperCase().match(/[A-Z]+/g) || [];

/**
 * Largest literal source/target match by GP29-transliterated word-length
 * sequence, found through 9-word shingle anchors and full left/right extension.
 *
 * @param {number[][]} targets
 * @param {string[]} sourceWords
 * @param {number} anchorLength
 */
function scan(targets, sourceWords, anchorLength = 9) {
  const index = new Map();
  for (let section = 0; section < targets.length; section++) {
    const target = targets[section];
    for (let i = 0; i + anchorLength <= target.length; i++) {
      const fingerprint = target.slice(i, i + anchorLength).join(",");
      if (!index.has(fingerprint)) index.set(fingerprint, []);
      index.get(fingerprint).push({section, i});
    }
  }
  const encoded = sourceWords.map(gpWordLength);
  let hits = 0;
  let best = {n: 0};
  for (let i = 0; i + anchorLength <= encoded.length; i++) {
    const group = index.get(encoded.slice(i, i + anchorLength).join(","));
    if (!group) continue;
    for (const {section, i: targetStart} of group) {
      hits++;
      const target = targets[section];
      let left = 0, right = anchorLength;
      while (targetStart + right < target.length &&
        i + right < encoded.length &&
        target[targetStart + right] === encoded[i + right]) right++;
      while (targetStart - left - 1 >= 0 && i - left - 1 >= 0 &&
        target[targetStart - left - 1] === encoded[i - left - 1]) left++;
      if (left + right > best.n) {
        best = {n: left + right, section,
          lp2Word: targetStart - left, sourceWord: i - left,
          sourceExcerpt: sourceWords.slice(i - left, i - left + Math.min(12,
            left + right)).join(" ")};
      }
    }
  }
  return {totalSourceWords: sourceWords.length, anchorHits: hits, best};
}
const result = sourceFiles.map(file => ({
  file, ...scan(sections, englishWords(read(file)),
    file.endsWith("lp1-plaintext-reference.txt") ? 7 : 9)
}));
assert.deepEqual(result.map(x => x.best.n), [9, 9, 9, 0, 0, 0, 0, 7]);

const controlSource = englishWords(read(sourceFiles[1]));
const expectedControl = controlSource.slice(300, 360).map(gpWordLength);
const positive = scan([expectedControl], controlSource);
assert.equal(positive.best.n, 60);
assert.equal(positive.best.sourceWord, 300);

console.log(JSON.stringify({
  source: "original 8 LP2 sections, 2896 printed words, 12956 runes",
  model: "exact copied English GP29 phrase with intact word boundaries",
  sources: result,
  positivePlantedWordsRecovered: positive.best.n,
  conclusion: "No verbatim GP-tokenized source phrase of length >=10 words occurs in the seven literary sources, and no eight-word exact match from the authorial LP1 plaintext source under this precise model. Paraphrase, word changes, other plaintext languages, and plaintext-independent spacing are untested."
}, null, 2));
