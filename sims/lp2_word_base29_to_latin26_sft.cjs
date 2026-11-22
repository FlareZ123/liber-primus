"use strict";
/**
 * Original-input GP29 word-integer -> Latin base26 decoder.
 *
 * The signed 2013 BASE29 numeral operation and signed 2016 "words" wording
 * motivate testing wordwise arithmetic conversion, but neither authorizes
 * a GP29-to-Latin26 cipher. This is a strictly bounded candidate inverse.
 *
 * Read-only Node.js 22 / Windows 11 SFT. No external packages or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(book.runes.map((rune, index) => [rune, index]));
const parsed = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
const words = parsed.words.map(word => [...word.runes].map(rune => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined);
  return index;
}));
assert.deepEqual(words.flat(),
  book.pages.filter(page => page.page <= 55).flatMap(page => page.indices));

/** @param {number[]} runes @returns {bigint} */
function base29Integer(runes) {
  return runes.reduce((n, rune) => n * 29n + BigInt(rune), 0n);
}

/**
 * @param {bigint} n
 * @param {boolean} bijective
 * @returns {string} Latin A..Z; empty for bijective base26 at N=0.
 */
function toLatin(n, bijective) {
  if (n === 0n) return bijective ? "" : "A";
  let out = "";
  while (n > 0n) {
    if (bijective) n--;
    out = String.fromCharCode(65 + Number(n % 26n)) + out;
    n /= 26n;
  }
  return out;
}

/**
 * @param {string} latin
 * @param {boolean} bijective
 * @returns {bigint}
 */
function latinInteger(latin, bijective) {
  let n = 0n;
  for (const letter of latin) {
    const a = letter.charCodeAt(0) - 65;
    assert(a >= 0 && a < 26);
    n = n * 26n + BigInt(a + Number(bijective));
  }
  return n;
}

/**
 * @param {bigint} n
 * @param {number} width
 * @returns {number[]}
 */
function gpFromInteger(n, width) {
  const runes = [];
  while (n > 0n) {
    runes.unshift(Number(n % 29n));
    n /= 29n;
  }
  assert(runes.length <= width);
  while (runes.length < width) runes.unshift(0);
  return runes;
}

/**
 * @param {string[]} latinWords
 * @returns {{top1:number, top4:number, topSymbol:string, initialCounts:number[]}}
 */
function initialProfile(latinWords) {
  const counts = Array(26).fill(0);
  for (const word of latinWords) if (word)
    counts[word.charCodeAt(0) - 65]++;
  const ranked = counts.map((count, index) => ({count, index}))
    .sort((a, b) => b.count - a.count || a.index - b.index);
  return {
    top1: ranked[0].count,
    top4: ranked.slice(0, 4).reduce((sum, item) => sum + item.count, 0),
    topSymbol: String.fromCharCode(65 + ranked[0].index),
    initialCounts: counts
  };
}

const decodedZero = words.map(word => toLatin(base29Integer(word), false));
const decodedBijective = words.map(word => toLatin(base29Integer(word), true));
for (let i = 0; i < words.length; i++) {
  assert.deepEqual(
    gpFromInteger(latinInteger(decodedZero[i], false), words[i].length), words[i]);
  assert.deepEqual(
    gpFromInteger(latinInteger(decodedBijective[i], true), words[i].length), words[i]);
}
const zeroFields = words.flatMap((word, index) =>
  base29Integer(word) === 0n ? [index] : []);
assert.deepEqual(zeroFields, [143]);
assert.equal(decodedBijective[143], "");
const zeroProfile = initialProfile(decodedZero);
const bijectiveProfile = initialProfile(decodedBijective);
assert.equal(zeroProfile.top1, 1096);
assert.equal(zeroProfile.top4, 1434);
assert.equal(bijectiveProfile.top1, 1031);

/** @param {string} p @returns {string[]} */
function referenceWords(p) {
  return read(p).toUpperCase().match(/[A-Z]+/g) || [];
}
const gibran = referenceWords("resources/control/gibran_prophet_58585.txt");
const shakespeare = referenceWords("resources/control/shakespeare_first300k.txt");

/**
 * @param {string[]} reference
 * @param {number} length
 * @returns {{windows:number, maxTop1:number, maxTop4:number}}
 */
function nativeCeiling(reference, length) {
  let windows = 0;
  let maxTop1 = 0;
  let maxTop4 = 0;
  for (let start = 0; start + length <= reference.length; start += 128) {
    const profile = initialProfile(reference.slice(start, start + length));
    maxTop1 = Math.max(maxTop1, profile.top1);
    maxTop4 = Math.max(maxTop4, profile.top4);
    windows++;
  }
  return {windows, maxTop1, maxTop4};
}
const gibranNative = nativeCeiling(gibran, words.length);
const shakespeareNative = nativeCeiling(shakespeare, words.length);
assert.deepEqual(gibranNative, {windows: 101, maxTop1: 490, maxTop4: 1313});
assert.deepEqual(shakespeareNative, {windows: 411, maxTop1: 483, maxTop4: 1272});
for (const native of [gibranNative, shakespeareNative]) {
  assert(zeroProfile.top1 > native.maxTop1);
  assert(zeroProfile.top4 > native.maxTop4);
  assert(bijectiveProfile.top1 > native.maxTop1);
}

// Exact source-shaped positive: choose, deterministically, actual Gibran words
// fitting each of the original 2,896 GP29 word widths. No source words altered.
const sample = gibran.filter(word => word[0] !== "A");
let cursor = 0;
/** @param {number} width @returns {string} */
function nextFittingWord(width) {
  for (let attempts = 0; attempts < sample.length; attempts++) {
    const word = sample[cursor++ % sample.length];
    if (word.length <= width) return word;
  }
  throw new Error("source-shaped positive word unavailable");
}
const native = words.map(word => nextFittingWord(word.length));
for (const bijective of [false, true]) {
  const encrypted = native.map((word, i) =>
    gpFromInteger(latinInteger(word, bijective), words[i].length));
  assert.deepEqual(encrypted.map((word, i) =>
    toLatin(base29Integer(word), bijective)), native);
  assert.deepEqual(encrypted.map(word => word.length), words.map(word => word.length));
}

console.log(JSON.stringify({
  original: {words: words.length, runes: parsed.runeCount,
    crossPageWords: parsed.crossPageWords, zeroFields},
  directZero: {top1: zeroProfile.top1, topSymbol: zeroProfile.topSymbol,
    top4: zeroProfile.top4, firstWords: decodedZero.slice(0, 30)},
  directBijective: {top1: bijectiveProfile.top1,
    topSymbol: bijectiveProfile.topSymbol,
    emptyWords: decodedBijective.filter(word => !word).length},
  controls: {gibran: gibranNative, shakespeare: shakespeareNative,
    nativeShapedWords: native.length, roundtrip: "PASS"},
  decision: "No source-native long plaintext. Both direct wordwise Latin26 readouts fail."
}, null, 2));
