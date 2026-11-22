"use strict";
/**
 * Original LP2 p7 five-product ciphertext-driven LFSR: all-hidden-key,
 * arbitrary word-reset, projective innovation certificate.
 *
 * SFT, Windows 11 / Node.js 22:
 *   node sims/lp2_p7_cipherdriven_projective_word_sft.cjs
 *
 * Source print order and all 2,896 original word boundaries are retained.
 * Every possible mod29 preceding-ciphertext coefficient q, every unknown
 * additive constant, every nonzero plaintext multiplier, and all five
 * unknown state-initial runes are eliminated algebraically. No plaintext
 * candidate is produced or inferred from the ciphertext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = value => ((value % 29) + 29) % 29;
const w = [11, 26, 8, 15, 2];
const glyphToIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
/** @type {number[]} */
const inverse = Array(29).fill(0);
for (let x = 1; x < 29; x++) {
  for (let y = 1; y < 29; y++) {
    if (x * y % 29 === 1) inverse[x] = y;
  }
  assert(inverse[x] > 0);
}
const original = parseSharedCorpus();
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
const unknownPages = gp.pages.filter(p => p.page <= 55);
assert.equal(unknownPages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(gp.pages[7].indices.slice(-14), redWords.flat());
assert.deepEqual(redWords.map(word =>
  word.reduce((product, value) => mod(product * value), 1)), w);

/** @param {number[]} input @param {number} q @returns {number[]} */
function innovation(input, q) {
  const result = [];
  for (let i = 5; i < input.length; i++) {
    let value = input[i] - q * input[i - 1];
    for (let j = 0; j < 5; j++) value -= w[j] * input[i - 1 - j];
    result.push(mod(value));
  }
  return result;
}
/**
 * Delete an arbitrary constant and a nonzero multiplicative scalar from
 * all innovation symbols. The special all-constant case is represented by
 * a distinct signature and never divided by zero.
 * @param {number[]} values
 * @returns {string}
 */
function projective(values) {
  assert(values.length >= 2);
  const delta = values.slice(1).map(value => mod(value - values[0]));
  const pivot = delta.find(value => value !== 0);
  if (pivot === undefined) return "constant:" + delta.length;
  return "projective:" + delta.map(value =>
    mod(value * inverse[pivot])).join(",");
}
/** @param {number[]} input @returns {string} */
const plaintextSignature = input => projective(innovation(input, 0));
/**
 * Positive: encrypt source-native GP plaintext under all hidden freedoms.
 * Recurrence is reset at the start of this word, which is intentionally
 * the hardest reset scenario for any cross-page/cross-word hypothesis.
 *
 * @param {number[]} plain
 * @param {number} q
 * @param {number} a
 * @param {number} b
 * @param {number} r
 * @param {number[]} initialState
 * @returns {number[]}
 */
function encryptWord(plain, q, a, b, r, initialState) {
  assert.equal(initialState.length, 5);
  assert(a > 0 && a < 29);
  const key = initialState.slice();
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    if (i >= 5) {
      const next = mod(w.reduce((sum, coefficient, j) =>
        sum + coefficient * key[i - j - 1], r) + q * cipher[i - 1]);
      key.push(next);
    }
    cipher.push(mod(a * plain[i] + b + key[i]));
  }
  return cipher;
}
const positiveWord = encodeSourceNativeGP("CIRCUMFERENCES");
assert(positiveWord.length >= 11 && positiveWord.length <= 14);
let positiveChecks = 0;
for (const q of [0, 1, 3, 8, 17, 28]) {
  for (const a of [1, 2, 7, 19, 28]) {
    const b = mod(q + 2 * a);
    const r = mod(5 * q + a);
    const cipher = encryptWord(positiveWord, q, a, b, r,
      [23, 2, 5, 2, 19]);
    assert.equal(projective(innovation(cipher, q)),
      plaintextSignature(positiveWord));
    positiveChecks++;
  }
}
assert.equal(positiveChecks, 30);

/** @type {Map<string, {word:string,frequency:number}[]>} */
const dictionary = new Map();
const wordPattern = /^([a-z]+)\s+(\d+)$/;
let wordRows = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = wordPattern.exec(line.trim());
  if (!match) continue;
  const indices = encodeSourceNativeGP(match[1]);
  if (indices.length < 9 || indices.length > 14) continue;
  wordRows++;
  const signature = indices.length + ":" + plaintextSignature(indices);
  const candidates = dictionary.get(signature) || [];
  candidates.push({word: match[1], frequency: Number(match[2])});
  dictionary.set(signature, candidates);
}
assert.equal(wordRows, 8563);
const originalCounts = new Map();
let matches = 0;
let originalLongWords = 0;
/** @type {Array<{startPage:number,wordLength:number,q:number,candidate:string}>} */
const longMatches = [];
for (const word of original.words) {
  const indices = [...word.runes].map(rune => {
    const index = glyphToIndex.get(rune);
    assert.notEqual(index, undefined);
    return index;
  });
  if (indices.length < 9) continue;
  originalLongWords++;
  for (let q = 0; q < 29; q++) {
    const signature = indices.length + ":" + projective(innovation(indices, q));
    for (const candidate of dictionary.get(signature) || []) {
      matches++;
      originalCounts.set(indices.length, (originalCounts.get(indices.length) || 0) + 1);
      if (indices.length >= 11) longMatches.push({
        startPage: word.startPage,
        wordLength: indices.length, q, candidate: candidate.word
      });
    }
  }
}
assert.equal(originalLongWords, 187);
assert.equal(matches, 9130);
assert.deepEqual(Object.fromEntries(originalCounts), {"9": 8965, "10": 165});
assert.equal(longMatches.length, 0);
const longest = original.words.filter(word =>
  [...word.runes].length >= 11).length;
assert.equal(longest, 57);
console.log(JSON.stringify({
  result: "NO original native-dictionary GP29 long-word plaintext under the declared whole family",
  source: "p7 original red five-word products, all 2,896 original LP2 complete printed words",
  sourceProducts: w,
  model: "K[i]=SUM(w[j]K[i-j-1])+q*C[i-1]+r, C[i]=a*P[i]+b+K[i] (mod29)",
  searchedQ: 29,
  unrestricted: "per-word initial five-state, nonzero output scalar, constant output offset, recurrence constant",
  originalWords: original.words.length,
  originalAtLeastNine: originalLongWords,
  originalAtLeastEleven: longest,
  nativeDictionaryWords9to14: wordRows,
  distinctNativeProjectiveSignatures: dictionary.size,
  originalMatchesByRuneLength: Object.fromEntries(originalCounts),
  originalMatchesAtLeastEleven: longMatches.length,
  independentNativeEncryptedPositives: positiveChecks,
  recoveredUnknownPlaintext: false,
  caveat: "Lexicon-relative; applies to direct GP29 word-internal affine feedback, not nonlinear state, multistage cipher, or nonlisted words"
}, null, 2));
