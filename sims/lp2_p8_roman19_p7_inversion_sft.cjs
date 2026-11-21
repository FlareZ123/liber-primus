'use strict';

/**
 * Original LP2 p8 first red word XIXM: Roman-number-to-GP29-index
 * and its adjacent p7 red field inverse. Read-only CommonJS, Node22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const p7 = source.pages[7].indices;
const p8 = source.pages[8].indices;

/** @param {number} n @returns {string} */
function roman(n) {
  assert.ok(Number.isInteger(n) && n >= 1 && n <= 28);
  const parts = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let output = '';
  for (const [value, digits] of parts) {
    while (n >= value) {
      n -= value;
      output += digits;
    }
  }
  return output;
}

/** @param {string} number @returns {number[]} */
function encodeRoman(number) {
  const runes = { I: 10, V: 1, X: 14 }; // solved native GP: V is written U
  return Array.from(number, letter => runes[letter]);
}

/** @param {number[]} a @param {number[]} b @returns {boolean} */
function matches(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const p8FirstWord = p8.slice(0, 4);
const p7SecondRedWord = p7.slice(196, 200);
assert.deepStrictEqual(p8FirstWord, [14, 10, 14, 19]);
assert.deepStrictEqual(p7SecondRedWord, [22, 16, 2, 25]);
assert.equal(p8FirstWord.map(index => source.translit[index]).join(''), 'XIXM');

const romanNumber = 19;
assert.equal(roman(romanNumber), 'XIX');
assert.ok(matches(p8FirstWord.slice(0, 3), encodeRoman(roman(romanNumber))));
assert.equal(p8FirstWord[3], romanNumber);
const redInverseProduct = p7SecondRedWord.reduce(
  (product, value) => (product * value) % 29, 1
);
assert.equal(redInverseProduct, 26);
assert.equal((romanNumber * redInverseProduct) % 29, 1);
assert.equal(p7[p7.length - 1], romanNumber);

// Two fully frozen field readings of the *same* p8 source operand.
// 23 is p7's first red rune, 29 is the solved Gematria Primus alphabet size.
// The second original p8 red word is [1,14,19,5,2,13,3,17] and
// its complete GP29 product is exponent 3.
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  for (let i = 0; i < exponent; i++) result = (result * base) % modulus;
  return result;
}
const originalRedP7Modulus = p7[194]; // first p7 red word starts 23,3
const firstRedP7Exponent = p7[195]; // same original field, 3
const thirdRedP7Generator = p7[200]; // third red word starts 5
const fourthRedP7Private = (p7[203] * p7[204]) % 29;
const secondRedP8Exponent = p8.slice(4, 12).reduce(
  (product, symbol) => (product * symbol) % 29, 1
);
assert.deepStrictEqual([
  originalRedP7Modulus, firstRedP7Exponent,
  thirdRedP7Generator, fourthRedP7Private, secondRedP8Exponent
], [23, 3, 5, 15, 3]);
assert.equal((fourthRedP7Private * secondRedP8Exponent) % 22, 1);
assert.equal(modPow(romanNumber, secondRedP8Exponent, 23), thirdRedP7Generator);
assert.equal(modPow(romanNumber, secondRedP8Exponent, 29), fourthRedP7Private);
assert.equal(modPow(thirdRedP7Generator, fourthRedP7Private, 23), romanNumber);

/**
 * Complete finite original-cipher scan for canonical Roman 1..28 followed
 * by the identical zero-based GP symbol. Freeze minimum Roman length 3.
 * No plaintext or secret key fitted.
 */
const templates = Array.from({ length: 28 }, (_, i) => i + 1)
  .filter(number => roman(number).length >= 3)
  .map(number => ({
    number, text: roman(number),
    symbols: encodeRoman(roman(number)).concat(number)
  }));
const hits = [];
for (const page of source.pages.filter(item => item.page < 56)) {
  for (let offset = 0; offset < page.indices.length; offset++) {
    for (const template of templates) {
      const original = page.indices.slice(
        offset, offset + template.symbols.length
      );
      if (matches(original, template.symbols)) {
        hits.push({
          page: page.page,
          offset,
          numeral: template.text,
          gpSymbolIndex: template.number
        });
      }
    }
  }
}
assert.equal(templates.length, 18);
assert.deepStrictEqual(hits, [
  { page: 8, offset: 0, numeral: 'XIX', gpSymbolIndex: 19 }
]);

console.log(JSON.stringify({
  source: 'Original LP2 p8 opening red XIXM and p7 second red product',
  p8RomanNumber: romanNumber,
  selfCheckingGpSymbol: 'M',
  p7RedSecondWordProductMod29: redInverseProduct,
  multiplicativeInverseIdentity: '19 * 26 mod 29 = 1',
  p8SecondRedWordProductExponent: secondRedP8Exponent,
  doubleFieldPower23: modPow(romanNumber, secondRedP8Exponent, 23),
  doubleFieldPower29: modPow(romanNumber, secondRedP8Exponent, 29),
  dhGroupInverseExponent: '15 * 3 mod 22 = 1',
  originalUnknownRunes: source.pages
    .filter(page => page.page < 56)
    .reduce((sum, page) => sum + page.indices.length, 0),
  canonicalRomanTemplatesLengthAtLeast3: templates.length,
  matchingOriginalOccurrences: hits,
  interpretation: 'Original numeric/index clue, not decrypted unknown plaintext'
}, null, 2));
