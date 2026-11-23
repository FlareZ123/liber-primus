/**
 * Source-first p8 reversed-Roman-number / 256-table stride gate.
 * Run: node sims/lp2_p8_reverse_roman_1019_stride256_sft.cjs
 * No filesystem writes. Node.js 22 / Windows 11 / CommonJS.
 *
 * Reconstructs the physical p8/p9 frame and authentic p49-51 table
 * from repository inputs, without English-tuned parameters.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (name) => fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8");
const corpus = JSON.parse(load("lp2-corpus.json"));
const table = JSON.parse(load("lp2-grid-256.json"));
const transcription = load("lp2-transcription.txt");
const mod = (x, p) => ((x % p) + p) % p;

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    bins[value] += 1;
  }
  return bins.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const romanPattern = /^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/;
const romanUnits = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** @param {string} roman @returns {number} */
function romanValue(roman) {
  let n = 0;
  for (let i = 0; i < roman.length; i += 1) {
    const value = romanUnits[roman[i]];
    const next = romanUnits[roman[i + 1]] || 0;
    n += value < next ? -value : value;
  }
  return n;
}

const runeToTranslit = new Map(corpus.runes.map((rune, i) => [rune, corpus.translit[i]]));
/** @param {string} runes @returns {string} */
function transliterate(runes) {
  return Array.from(runes, (rune) => {
    assert(runeToTranslit.has(rune));
    return runeToTranslit.get(rune);
  }).join("");
}

const unknownSource = transcription.split(/\s*%\s*/g).slice(0, 55).join("").replace(/[\s/%]/g, "");
const printedWords = unknownSource.match(/[ᚠ-ᛪ]+/gu) || [];
assert.equal(printedWords.length, 2896);
assert.equal(printedWords.join("").length, 12956);
const reverseRomanWords = printedWords.flatMap((word, i) => {
  if (Array.from(word).length < 4) return [];
  const backward = transliterate(Array.from(word).reverse().join(""));
  return romanPattern.test(backward) && backward.length > 0
    ? [{ wordIndex: i, forward: transliterate(word), backward, value: romanValue(backward) }]
    : [];
});
assert.deepEqual(reverseRomanWords, [
  { wordIndex: 413, forward: "XIXM", backward: "MXIX", value: 1019 }
]);

const firstWord = corpus.pages[8].indices.slice(0, 4);
assert.deepEqual(firstWord, [14, 10, 14, 19]);
assert.equal(corpus.pages[8].indices.length, 255);
const frame = corpus.pages[8].indices.slice(4).concat(corpus.pages[9].indices.slice(0, 5));
assert.equal(frame.length, 256);
assert.deepEqual(frame.slice(0, 8), [1, 14, 19, 5, 2, 13, 3, 17]);
assert.equal(table.bytes.length, 256);
assert.equal(new Set(Array.from({ length: 256 }, (_, i) => (i * 1019) % 256)).size, 256);
assert.equal(1019 % 256, 251);
assert.equal(256 - (255 - 4), 5);

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const positivePlain = Array.from({ length: 256 }, (_, i) => solved[i % solved.length]);
const exact = [
  [5, -1, 0.0356863001175395],
  [5, 1, 0.035457751077445476],
  [251, -1, 0.034478255191328196],
  [251, 1, 0.03444560532845762]
];
const result = [];
for (const [stride, sign, expected] of exact) {
  const keyAt = (i) => table.bytes[(stride * i) % 256];
  const decode = (cipher) => cipher.map((symbol, i) => mod(symbol + sign * keyAt(i), 29));
  const encode = (plain) => plain.map((symbol, i) => mod(symbol - sign * keyAt(i), 29));
  const plaintext = decode(frame);
  const bodyIoc = ioc(plaintext.slice(8));
  assert(Math.abs(bodyIoc - expected) < 1e-12);
  assert.deepEqual(encode(plaintext), frame);
  assert.deepEqual(decode(encode(positivePlain)), positivePlain);
  result.push({
    stride,
    sign,
    body248_ioc: bodyIoc,
    body_first64_gp: plaintext.slice(8, 72).map((x) => corpus.translit[x]).join(" ")
  });
}
console.log(JSON.stringify({
  claim: "Conditional reversed-Roman-word table stride; no LP2 unknown plaintext recovered",
  unique_reversed_roman_word_len_at_least4: reverseRomanWords,
  original_printed_words: printedWords.length,
  original_p8_p9_frame: frame.length,
  table_cells: table.bytes.length,
  frame_p9_carry: 5,
  numeral: 1019,
  period: 256,
  solved_p57_ioc: ioc(solved),
  results: result
}, null, 2));
