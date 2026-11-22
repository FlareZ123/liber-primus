'use strict';

/**
 * Exact GP-prime-sum self-key inverse of a word-reset fifth-back cipher.
 * Test the original LP2 ciphertext and clear page57 without guessed keys.
 * Run from the repository root: node sims/lp2_wordprime_selfseed_fiveback_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const originalPages = transcription.split(/\s*%\s*/);
assert.equal(originalPages.length, 57, 'p50 is the rune-free page');

/** @param {string} text @returns {number[][]} */
function printedWords(text) {
  const matches = text.replace(/[\s/]/g, '').match(/\p{Script=Runic}+/gu) || [];
  return matches.map(word => [...word].map(rune => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined, 'unknown original glyph');
    return index;
  }));
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} word @returns {number} */
function primeSum(word) {
  return word.reduce((total, rune) => total + corpus.prime[rune], 0) % 29;
}

/**
 * The word has an arbitrary 29-valued key. A fifth-back residual
 * uses the PREVIOUS PUBLISHED ciphertext, not the previous plaintext.
 * sign is the encryption sign, +1 or -1.
 * @param {number[]} cipher @param {number} key @param {number} sign
 * @returns {number[]}
 */
function decipher(cipher, key, sign) {
  return cipher.map((value, i) =>
    mod29(value - (i >= 5 ? cipher[i - 5] : 0) - sign * key));
}

/**
 * The plaintext itself selects its key via its GP-prime sum.
 * @param {number[]} plain @param {number} sign @returns {number[]}
 */
function encipher(plain, sign) {
  const key = primeSum(plain);
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    cipher.push(mod29(plain[i] + sign * key +
      (i >= 5 ? cipher[i - 5] : 0)));
  }
  return cipher;
}

/**
 * Exhaust all 29 candidate word keys, without fitting dictionary words.
 * @param {number[]} cipher @param {number} sign
 * @returns {{key: number, plain: number[]}[]}
 */
function keysWithValidPlaintext(cipher, sign) {
  const found = [];
  for (let key = 0; key < 29; key++) {
    const plain = decipher(cipher, key, sign);
    if (primeSum(plain) === key) found.push({key, plain});
  }
  return found;
}

/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

const unknown = printedWords(originalPages.slice(0, 55).join(''));
const known = printedWords(originalPages[56]);
assert.equal(unknown.length, 2896);
assert.equal(unknown.flat().length, 12956);
assert.deepEqual(unknown.flat(), corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));
assert.equal(known.length, 20);
assert.equal(known.flat().length, 95);
assert.deepEqual(known.flat(), corpus.pages.find(p => p.page === 57).indices);

const outcomes = [];
for (const sign of [1, -1]) {
  for (const plain of known) {
    const cipher = encipher(plain, sign);
    const found = keysWithValidPlaintext(cipher, sign);
    assert.ok(found.some(entry =>
      entry.key === primeSum(plain) &&
      entry.plain.length === plain.length &&
      entry.plain.every((value, i) => value === plain[i])));
    assert.deepEqual(decipher(cipher, primeSum(plain), sign), plain);
  }
  const validKeys = unknown.map(word => keysWithValidPlaintext(word, sign));
  const noKey = validKeys.filter(keys => keys.length === 0).length;
  const oneKey = validKeys.filter(keys => keys.length === 1).length;
  const multiKey = validKeys.filter(keys => keys.length >= 2).length;
  const uniqueR = validKeys.flatMap(keys =>
    keys.length === 1 ? keys[0].plain : []);
  const fullDirect = unknown.flatMap(word => decipher(word, primeSum(word), sign));
  assert.equal(noKey + oneKey + multiKey, 2896);
  assert.ok(noKey > 1000, 'original words without any valid key');
  assert.ok(coincidence(fullDirect) < 0.04);
  outcomes.push({
    encryption_sign: sign,
    original_words_with_no_valid_key: noKey,
    original_words_with_one_valid_key: oneKey,
    original_words_with_multiple_valid_keys: multiKey,
    unique_words_runes: uniqueR.length,
    unique_word_gp29_ioc: coincidence(uniqueR),
    ciphertext_selfkey_direct_ioc: coincidence(fullDirect),
    solved_p57_planted_words_recovered: known.length
  });
}

assert.deepEqual(outcomes.map(o =>
  [o.original_words_with_no_valid_key,
    o.original_words_with_one_valid_key,
    o.original_words_with_multiple_valid_keys]),
[[1083, 1065, 748], [1039, 1131, 726]]);
console.log(JSON.stringify({
  source_original_unknown_runes: 12956,
  source_original_words: 2896,
  source_known_p57_runes: 95,
  outcomes,
  any_unknown_plaintext_recovered: false
}, null, 2));
