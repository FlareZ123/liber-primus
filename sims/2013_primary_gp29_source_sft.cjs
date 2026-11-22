"use strict";

/**
 * Source-native GP29 and BASE29 controls, grounded in the original 2013
 * Gematria Primus JPEG and the separate signed 2013 TCP protocol.
 *
 * Original JPEG (64,167 bytes, Git blob 65ded13617196f0fd5d210855a75452ff2e7a340):
 * https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/gematria.jpg
 *
 * Run with Node.js 22:
 *   node sims/2013_primary_gp29_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

// Source-visible consecutive rows, first printed column top to bottom,
// then second printed column top to bottom. First value is 2, last 109.
const sourceRunes = [
  "ᚠ", "ᚢ", "ᚦ", "ᚩ", "ᚱ", "ᚳ", "ᚷ", "ᚹ", "ᚻ", "ᚾ",
  "ᛁ", "ᛄ", "ᛇ", "ᛈ", "ᛉ", "ᛋ", "ᛏ", "ᛒ", "ᛖ", "ᛗ",
  "ᛚ", "ᛝ", "ᛟ", "ᛞ", "ᚪ", "ᚫ", "ᚣ", "ᛡ", "ᛠ"
];
const sourceNames = [
  "F", "U", "TH", "O", "R", "C/K", "G", "W", "H", "N",
  "I", "J", "EO", "P", "X", "S/Z", "T", "B", "E", "M",
  "L", "NG/ING", "OE", "D", "A", "AE", "Y", "IA/IO", "EA"
];
const sourcePrimes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109
];
assert.equal(sourceRunes.length, 29);
assert.deepEqual(corpus.runes, sourceRunes);
assert.deepEqual(corpus.translit, sourceNames.map(name => name.split("/")[0]));
assert.deepEqual(corpus.prime, sourcePrimes);

/** @param {string} word @returns {number[]} */
function tokenize(word) {
  const candidates = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const indices = [];
  for (let offset = 0; offset < word.length;) {
    const chosen = candidates.find(({token}) => word.startsWith(token, offset));
    assert.ok(chosen, "Cannot tokenize source word: " + word.slice(offset));
    indices.push(chosen.index);
    offset += chosen.token.length;
  }
  return indices;
}

/** @param {number[]} indices */
function sumPrimes(indices) {
  return indices.reduce((sum, index) => sum + sourcePrimes[index], 0);
}

// Source-native checksum: the historical 2013 761.mp3 title
// "The Instar Emergence" under the independently printed Gematria table.
const originalTitle = ["THE", "INSTAR", "EMERGENCE"];
const titleSums = originalTitle.map(word => sumPrimes(tokenize(word)));
assert.deepEqual(titleSums, [72, 280, 409]);
assert.equal(titleSums.reduce((sum, value) => sum + value, 0), 761);

// Original LP2 p57 (archive 74.jpg) starts with the visible unencrypted
// seven-rune title PARABLE. C denotes the historical C/K shared rune.
const p57 = corpus.pages.find(page => page.page === 57);
assert.ok(p57);
const title = tokenize("PARABLE");
assert.deepEqual(p57.indices.slice(0, 7), title);
assert.deepEqual(title, [13, 24, 4, 24, 17, 20, 18]);
assert.equal(sumPrimes(title), 449);
assert.equal(p57.indices.slice(7, 25).map(index => corpus.translit[index]).join(""),
  "LICETHEINSTARTUNNEL");

// Historical BASE29 is integer-to-text notation, not the GP29 rune mapping.
// The source-signed example fixes 3301 -> 3QO; the conventional remaining
// digit alphabet is an implementation choice, not signed by this one vector.
const base29Chars = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {number} value */
function encodeBase29(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  if (value === 0) return "0";
  let result = "";
  while (value > 0) {
    result = base29Chars[value % 29] + result;
    value = Math.floor(value / 29);
  }
  return result;
}
assert.equal(encodeBase29(3301), "3QO");

// Existing independently specified solved p56 test checks the original
// 85-rune ciphertext against the prime-totient inverse and known plaintext.
require("./authentic_lp2_p56_totient_regression.cjs");
console.log(JSON.stringify({
  status: "PASS", sourceTableEntries: sourceRunes.length,
  original2013TitlePrimeSums: titleSums, original2013TitleTotal: 761,
  originalLP2P57Title: "PARABLE", p57TitlePrimeSum: 449,
  signed2013Base29Example: "3301 -> 3QO",
  solvedP56: "85-rune original-cipher regression passed",
  limitation: "No source instruction defines an LP2 unknown-page inverse or punctuation encoding"
}, null, 2));
