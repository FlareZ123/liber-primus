"use strict";

/**
 * Original red-triad pair readout, with fixed original-source lexical control.
 *
 * The only two isolated three-rune red spans in LP2 both start at page-local
 * offset 119. Subtract their GP29 values in printed-page order to obtain SET.
 * This is a candidate readout, not evidence that either red span is an
 * authenticated key or that any unknown LP2 plaintext has been decrypted.
 *
 * Run from repository root on Windows 11 / Node.js 22:
 * node sims/lp2_red119_pairwise_set_readout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const dictionary = read("resources/control/english_wordfreq_textblob.txt");
const gpIndex = new Map(corpus.runes.map((r, i) => [r, i]));

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.pages.filter((p) => p.page <= 55)
  .reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(original.split("%").length, 57);

const isolated = ink.pages.flatMap((p) => (p.red_spans || [])
  .filter((s) => s.length === 3)
  .map((s) => ({ page: p.page, start: s.start, length: s.length })));
assert.deepEqual(isolated, [
  { page: 3, start: 119, length: 3 },
  { page: 39, start: 119, length: 3 },
]);

/** @param {number} page */
const source = (page) => corpus.pages.find((p) => p.page === page).indices;
const a = source(3).slice(119, 122);
const b = source(39).slice(119, 122);
assert.deepEqual(a, [13, 23, 2]);
assert.deepEqual(b, [27, 5, 15]);

/** @param {number[]} x @param {number[]} y */
const subtract = (x, y) => x.map((v, i) => (v - y[i] + 29) % 29);
/** @param {number[]} values */
const spell = (values) => values.map((v) => corpus.translit[v]).join("");
const readout = subtract(a, b);
assert.deepEqual(readout, [15, 18, 16]);
assert.equal(spell(readout), "SET");
assert.equal(spell(subtract(b, a)), "XJP");

const sumPrimes = (items) => items.reduce((n, i) => n + corpus.prime[i], 0);
assert.equal(sumPrimes(a), 137);
assert.equal(sumPrimes(b), 173);

/** @param {string} pageText */
function printedWords(pageText) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let word = [];
  for (const ch of pageText) {
    if (gpIndex.has(ch)) {
      word.push(gpIndex.get(ch));
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Page-internal printed wraps are continuations of a single word.
    } else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}
const pages = original.split("%");
const words3 = printedWords(pages[3]).filter((w) => w.length === 3);
const words39 = printedWords(pages[39]).filter((w) => w.length === 3);
assert.equal(words3.length, 11);
assert.equal(words39.length, 14);

/**
 * Source-native GP spelling: historical ordinary C/U/S substitutions, and
 * the standard digraphs, plus ING and IO spellings of NG/IA.
 * @param {string} word
 */
function native(word) {
  return word.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KVQ]/gu, "C").replace(/Z/gu, "S")
    .replace(/ING/gu, "\u014B").replace(/TH/gu, "\u00FE")
    .replace(/IO/gu, "\u026A").replace(/EO/gu, "\u0259")
    .replace(/OE/gu, "\u0153").replace(/AE/gu, "\u00E6")
    .replace(/EA/gu, "\u025B");
}
/** @param {string} value */
function expand(value) {
  return value.replace(/\u014B/gu, "NG").replace(/\u00FE/gu, "TH")
    .replace(/\u026A/gu, "IA").replace(/\u0259/gu, "EO")
    .replace(/\u0153/gu, "OE").replace(/\u00E6/gu, "AE")
    .replace(/\u025B/gu, "EA");
}
const gpThreeWords = new Set(dictionary.split(/\r?\n/u)
  .filter((line) => /^[a-z]+\s+\d+$/u.test(line))
  .map((line) => line.split(/\s+/u)[0])
  .map(native).filter((word) => [...word].length === 3)
  .map(expand));
assert.equal(gpThreeWords.size, 721);
assert.ok(gpThreeWords.has("SET"));

const lexicalMatches = [];
for (let i = 0; i < words3.length; i++) {
  for (let j = 0; j < words39.length; j++) {
    const result = spell(subtract(words3[i], words39[j]));
    if (gpThreeWords.has(result)) lexicalMatches.push({ i, j, word: result });
  }
}
assert.deepEqual(lexicalMatches, [
  { i: 0, j: 2, word: "OAC" },
  { i: 3, j: 3, word: "SET" },
  { i: 3, j: 8, word: "GUY" },
  { i: 4, j: 7, word: "WITH" },
]);

/** @param {number[]} values */
function ioc(values) {
  const histogram = Array(29).fill(0);
  for (const x of values) histogram[x]++;
  return histogram.reduce((n, x) => n + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * Direct simplest use of the *other* triad as a period-3 additive key, with
 * its phase anchored at the two original marked offset-119 starts.
 * @param {number[]} symbols
 * @param {number[]} key
 */
function decrypt(symbols, key) {
  return symbols.map((x, i) => {
    const j = ((i - 119) % key.length + key.length) % key.length;
    return (x - key[j] + 29) % 29;
  });
}
const p3Inverse = decrypt(source(3), b);
const p39Inverse = decrypt(source(39), a);
assert.ok(Math.abs(ioc(p3Inverse) - 0.03255674927464789) < 1e-5);
assert.ok(Math.abs(ioc(p39Inverse) - 0.03702928870292887) < 1e-5);

console.log("Selected red triplets: p3[119:122]=PDTH; p39[119:122]=IACS.");
console.log("Original GP29 subtraction p3 - p39:", spell(readout), readout);
console.log("Opposite direction:", spell(subtract(b, a)));
console.log("Printed-word matched control:", words3.length, "x",
  words39.length, "=", words3.length * words39.length,
  "pairs, native GP3 dictionary matches", lexicalMatches.length,
  lexicalMatches.map((m) => m.word).join(", "));
console.log("Native GP3 dictionary size", gpThreeWords.size,
  "of 29^3 =", 29 ** 3,
  "; descriptive lexical fraction", gpThreeWords.size / 29 ** 3);
console.log("Original p3 IoC:", ioc(source(3)), "other-red-key inverse:", ioc(p3Inverse));
console.log("Original p39 IoC:", ioc(source(39)), "other-red-key inverse:", ioc(p39Inverse));
console.log("Known clear p57 IoC:", ioc(source(57)));
console.log("Result: SET is a reproducible, visually selected candidate readout.");
console.log("No authenticated key, original LP2 plaintext, or general decoder recovered.");
