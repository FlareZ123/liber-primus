"use strict";

/**
 * Source-shape original LP2 test: use the preceding published word's GP-prime
 * sum to address a 32x8 table row and the current word length for the column.
 * The previous *ciphertext* word is a public state, making this reversible.
 * Run from repository root: node sims/lp2_grid_prevwordprime_length_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, parseLP2Words} = require("./lp2_word_pages.cjs");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {byte_rows: table} = require("../resources/liber-primus/base60-grid.json");
const lookup = new Map(corpus.runes.map((rune, index) => [rune, index]));

const original = parseSharedCorpus().words.map((word) =>
  [...word.runes].map((rune) => lookup.get(rune)));
const printed = fs.readFileSync(
  path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8");
const known = parseLP2Words(printed.split("%").at(-1)).words.map((word) =>
  [...word.runes].map((rune) => lookup.get(rune)));
const source = corpus.pages.filter((page) => page.page < 56)
  .flatMap((page) => page.indices);

assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), source);
assert.equal(known.flat().length, 95);
assert.equal(table.length, 32);
assert.equal(table[0].length, 8);

/** @param {readonly number[]} ciphertextWord */
function primeSum(ciphertextWord) {
  return ciphertextWord.reduce((sum, rune) => sum + corpus.prime[rune], 0);
}

/**
 * The key is computed exclusively from already-observed ciphertext and
 * current printed word length, so inverse encryption is exact for all words.
 *
 * @param {readonly number[][]} words
 * @param {"length"|"lengthMinus1"} columnRule
 * @param {"mod"|"scaled"} byteRule
 * @param {-1|1} sign
 * @param {boolean} decrypt
 * @returns {number[][]}
 */
function transform(words, columnRule, byteRule, sign, decrypt) {
  let priorCipherPrimeSum = 0;
  const output = [];
  for (const word of words) {
    const row = priorCipherPrimeSum % 32;
    const col = (word.length - (columnRule === "lengthMinus1" ? 1 : 0)) % 8;
    const byte = table[row][col];
    const key = byteRule === "mod" ? byte % 29 : Math.floor(29 * byte / 256);
    const result = word.map((rune) => (rune + (decrypt ? sign : -sign) * key + 29) % 29);
    output.push(result);
    priorCipherPrimeSum = primeSum(decrypt ? word : result);
  }
  return output;
}

/** @param {readonly number[]} runes */
function ioc(runes) {
  const histogram = Array(29).fill(0);
  for (const rune of runes) histogram[rune]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

const cases = [
  ["length", "mod", -1, 0.03445938031628947, 439],
  ["length", "mod", 1, 0.03450715058621354, 491],
  ["length", "scaled", -1, 0.03447794506573863, 438],
  ["length", "scaled", 1, 0.03446832904981728, 476],
  ["lengthMinus1", "mod", -1, 0.03451130918541621, 473],
  ["lengthMinus1", "mod", 1, 0.03445226660934393, 449],
  ["lengthMinus1", "scaled", -1, 0.03449492501950312, 460],
  ["lengthMinus1", "scaled", 1, 0.03448496344662796, 471],
];

assert.ok(Math.abs(ioc(source) - 0.03447839786450569) < 1e-12);
assert.ok(ioc(known.flat()) > 0.062 && ioc(known.flat()) < 0.063);
for (const [columnRule, byteRule, sign, expectedIoC, expectedE] of cases) {
  const decoded = transform(original, columnRule, byteRule, sign, true);
  const encoded = transform(decoded, columnRule, byteRule, sign, false);
  assert.deepEqual(encoded, original);

  const plantedCipher = transform(known, columnRule, byteRule, sign, false);
  const recoveredPlant = transform(plantedCipher, columnRule, byteRule, sign, true);
  assert.deepEqual(recoveredPlant, known);

  const symbols = decoded.flat();
  assert.ok(Math.abs(ioc(symbols) - expectedIoC) < 1e-12);
  assert.equal(symbols.filter((rune) => rune === 18).length, expectedE);
  console.log(JSON.stringify({
    columnRule, byteRule, sign, symbols: symbols.length,
    ioc: ioc(symbols), e: expectedE,
    prefix: symbols.slice(0, 24).map((rune) => corpus.translit[rune]).join(" "),
    originalRoundTrip: true, solvedP57PlantRecovery: true,
  }));
}
console.log("PASS: eight prior-cipherword prime-sum/length table inverses remain nonlinguistic.");
