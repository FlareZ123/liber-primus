"use strict";
/**
 * Original LP2 source-native numeral endpoint obstruction.
 *
 * A canonical unpadded base-29 integer with at least two digits cannot
 * begin with zero. This invariant survives every secret stationary
 * bijective rune-to-digit alphabet, independent of ciphertext language.
 *
 * JSDoc/CJS, Windows Node.js 22, no file writes or external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const text = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(original.length, 12956);

/** @type {number[][]} */
const words = [];
let current = [];
let runeCount = 0;
/**
 * End a source-visible word at hyphen, ordinary full stop or ampersand.
 * Page '%' and line '/' are transparent, including 32 page carries.
 */
for (const ch of text) {
  if (runeMap.has(ch)) {
    current.push(runeMap.get(ch));
    runeCount++;
    if (runeCount === original.length) {
      words.push(current);
      current = [];
      break;
    }
  } else if ((ch === "-" || ch === "." || ch === "&") && current.length) {
    words.push(current);
    current = [];
  }
}
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const longWords = words.filter(word => word.length >= 2);
assert.equal(longWords.length, 2813);
assert.equal(words.length - longWords.length, 83);
const initial = new Array(29).fill(0);
const terminal = new Array(29).fill(0);
for (const word of longWords) {
  initial[word[0]]++;
  terminal[word[word.length - 1]]++;
}
assert.equal(Math.min(...initial), 78);
assert.equal(Math.max(...initial), 116);
assert.equal(Math.min(...terminal), 75);
assert.equal(Math.max(...terminal), 117);
const freq = array => Object.fromEntries(
  array.map((n, i) => [corpus.translit[i], n])
);
console.log(JSON.stringify({
  classification: "conditional exact impossible, no plaintext",
  source: {runes: original.length, printedWords: words.length,
    wordsWithAtLeastTwoRunes: longWords.length},
  leadingDigitCounts: freq(initial),
  trailingDigitCounts: freq(terminal),
  leadingRange: [Math.min(...initial), Math.max(...initial)],
  trailingRange: [Math.min(...terminal), Math.max(...terminal)],
  zeroEligibleSymbolCountForAnyStationaryUnknownBijection: 0,
  statement: "Under any one fixed secret bijection between 29 printed runes and digits 0..28, neither end of every length>=2 token can avoid digit zero. Hence neither orientation is a canonical minimal-length base29 numeral without a separate word-escape/padding/mode operation."
}, null, 2));
