"use strict";

/**
 * 2013 BASE29 word-number gate against the original 2,896 LP2 words.
 *
 * The 2013 signed challenge proves only an ASCII base29 numeral convention.
 * Mapping Gematria Primus rune indices to its 29 digit values is an
 * explicit additional hypothesis, tested here without an address modulus.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRS";
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const gpOrder = [...corpus.runes];
const gpIndex = new Map(gpOrder.map((rune, index) => [rune, index]));
assert.equal(gpOrder.length, 29);
assert.equal(DIGITS.length, 29);

/**
 * @param {bigint} value
 * @returns {string} Canonical ASCII base29 numeral (no leading zero).
 */
function asciiBase29(value) {
  if (value === 0n) return "0";
  let n = value;
  let result = "";
  while (n > 0n) {
    result = DIGITS[Number(n % 29n)] + result;
    n /= 29n;
  }
  return result;
}

/**
 * @param {string} runicWord
 * @returns {{digits:number[], value:bigint, numeral:string}}
 */
function runicNumber(runicWord) {
  const digits = [...runicWord].map((rune) => {
    const index = gpIndex.get(rune);
    assert.notEqual(index, undefined, "Non-GP symbol in parsed word");
    return index;
  });
  let value = 0n;
  for (const digit of digits) value = value * 29n + BigInt(digit);
  return {digits, value, numeral: digits.map((digit) => DIGITS[digit]).join("")};
}

assert.equal(asciiBase29(3301n), "3QO");
assert.equal(asciiBase29(1033n), "16I");
assert.equal(asciiBase29(89n), "32");

const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);

// Compare the reassembled canonical word stream with every unsolved page rune.
const sourceIndices = corpus.pages.slice(0, 56).flatMap((page) => page.indices);
const reconstructedIndices = [...parsed.words.map((word) => word.runes).join("")].map((rune) => gpIndex.get(rune));
assert.deepEqual(reconstructedIndices, sourceIndices);

const records = parsed.words.map((word, ordinal) => ({
  ordinal: ordinal + 1,
  runes: word.runes,
  startPhysicalPage: physicalLP2Page(word.startPage),
  endPhysicalPage: physicalLP2Page(word.endPage),
  ...runicNumber(word.runes)
}));
const firstZero = records.filter((word) => word.digits[0] === 0);
const fit121 = records.filter((word) => word.value < 121n);
const p32 = records.filter((word) => word.startPhysicalPage === 32);
const p32Direct = p32.filter((word) => word.value < 121n);
const fibonacci = new Set([0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987].map(String));
const fibonacciMatches = records.filter((word) => fibonacci.has(word.value.toString()));

assert.equal(new Set(records.map((word) => word.value.toString())).size, 2699);
assert.equal(firstZero.length, 117);
assert.equal(fit121.length, 148);
assert.equal(fit121.filter((word) => word.digits[0] !== 0).length, 127);
assert.equal(p32.length, 21);
assert.equal(p32Direct.length, 1);
assert.equal(p32Direct[0].runes, "ᚠᚩᚦ");
assert.deepEqual(p32Direct[0].digits, [0, 3, 2]);
assert.equal(p32Direct[0].value, 89n);
assert.equal(p32Direct[0].numeral, "032");
assert.equal(asciiBase29(p32Direct[0].value), "32");
assert.equal(fibonacciMatches.length, 31);

const result = {
  words: records.length,
  runes: reconstructedIndices.length,
  crossPageWords: parsed.crossPageWords,
  numericDistinct: new Set(records.map((word) => word.value.toString())).size,
  leadingZeroWords: firstZero.length,
  direct0to120: fit121.length,
  canonicalDirect0to120: fit121.filter((word) => word.digits[0] !== 0).length,
  p32CompleteWords: p32.length,
  p32Direct: p32Direct.map((word) => ({
    ordinalOnP32: p32.indexOf(word) + 1,
    runes: word.runes,
    explicitDigits: word.numeral,
    minimalDigits: asciiBase29(word.value),
    decimalValue: word.value.toString()
  })),
  matchesAmong16P15FibonacciInputs: fibonacciMatches.length
};
console.log(JSON.stringify(result, null, 2));
