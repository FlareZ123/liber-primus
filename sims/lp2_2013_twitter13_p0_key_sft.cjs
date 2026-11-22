'use strict';

/**
 * Original-source fixed-operand test, not a claim of a Cicada-selected LP2 key.
 * The genuine 2013 Cicada OS message names @1231507051321 as a Twitter account.
 * Test its 13 printed decimal digits as an ordinary GP29 additive key and as
 * a ciphertext-feedback key on the original p0–p2 black text.
 *
 * Run from the repository with Node.js 22:
 *   node sims/lp2_2013_twitter13_p0_key_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'historical', 'cicada2013-os-original-message.txt'),
  'utf8'
);
assert.match(source, /@1231507051321/);

const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
/** @type {number[]} */
const key = Array.from('1231507051321', Number);
assert.equal(key.length, 13);
assert.equal(key.join(''), [...key].reverse().join(''));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const frequencies = Array(29).fill(0);
  for (const rune of input) frequencies[rune] += 1;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0)
    / (input.length * (input.length - 1));
}

/**
 * @param {number[]} ciphertext
 * @param {'direct'|'chain'} mode
 * @param {-1|1} sign
 * @param {number} iv
 * @returns {number[]}
 */
function decrypt(ciphertext, mode, sign, iv) {
  let previous = iv;
  return ciphertext.map((cipher, i) => {
    const plain = mod29(cipher + (mode === 'chain' ? -previous : 0)
      + sign * key[i % key.length]);
    previous = cipher;
    return plain;
  });
}

/**
 * @param {number[]} plaintext
 * @param {'direct'|'chain'} mode
 * @param {-1|1} sign
 * @param {number} iv
 * @returns {number[]}
 */
function encrypt(plaintext, mode, sign, iv) {
  let previous = iv;
  return plaintext.map((plain, i) => {
    const cipher = mod29(plain + (mode === 'chain' ? previous : 0)
      - sign * key[i % key.length]);
    previous = cipher;
    return cipher;
  });
}

const page = (index) => corpus.pages.find((entry) => entry.page === index).indices;
const original = [0, 1, 2].flatMap(page);
const heading = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
assert.equal(original.length, 729);
assert.deepEqual(original.slice(0, 13), heading);
const body = original.slice(13);
assert.equal(body.length, 716);
const iv = heading[12];
const positive = page(57);
assert.equal(positive.length, 95);
assert.ok(ioc(positive) > 0.060);

for (const mode of ['direct', 'chain']) {
  for (const sign of [-1, 1]) {
    const planted = encrypt(positive, mode, sign, iv);
    assert.deepEqual(decrypt(planted, mode, sign, iv), positive);
    const output = decrypt(body, mode, sign, iv);
    assert.deepEqual(encrypt(output, mode, sign, iv), body);
    const preview = output.slice(0, 30).map((rune) => corpus.translit[rune]).join(' ');
    const score = ioc(output);
    assert.ok(score > 0.033 && score < 0.036);
    console.log(JSON.stringify({ mode, sign, originalRunes: output.length,
      ioc: Number(score.toFixed(12)), preview, nativePositive: true,
      originalRoundtrip: true }));
  }
}
console.log('PASS: 4 source-keyed inverses, 95-rune native-GP plants and exact 716-rune original roundtrips');
