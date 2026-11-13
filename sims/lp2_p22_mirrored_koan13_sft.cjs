'use strict';

/**
 * Original LP2 p22 mirror-selected LP1 second-koan 13-rune inverse gate.
 *
 * Source: LP1 physical pp14–16 verified FIRFUMFERENFE key and mirrored
 * p22 corpse illustration; no 2014 instruction authenticates this transfer.
 * Run with: node sims/lp2_p22_mirrored_koan13_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const key = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
assert.equal(key.length, 13);
assert.equal(corpus.pages[22].indices.length, 131);
assert.equal(corpus.pages[57].indices.length, 95);

/**
 * Mirror may act on read direction, on key orientation, or both.
 *
 * @param {number[]} source Original GP29 cipher runes.
 * @param {boolean} reverseInput Reverse reading direction before decrypting.
 * @param {boolean} reverseKey Read the original 13-rune key backwards.
 * @param {number} sign Either -1 for original koan subtraction or +1.
 * @returns {number[]} Plaintext GP29 indices in source page order.
 */
function decode(source, reverseInput, reverseKey, sign) {
  const input = reverseInput ? source.slice().reverse() : source;
  const selectedKey = reverseKey ? key.slice().reverse() : key;
  const out = input.map((c, i) => (c + sign * selectedKey[i % 13] + 29) % 29);
  return reverseInput ? out.reverse() : out;
}

/** @param {number[]} plaintext
 * @param {boolean} reverseInput
 * @param {boolean} reverseKey
 * @param {number} sign
 * @returns {number[]}
 */
function encode(plaintext, reverseInput, reverseKey, sign) {
  const input = reverseInput ? plaintext.slice().reverse() : plaintext;
  const selectedKey = reverseKey ? key.slice().reverse() : key;
  const out = input.map((p, i) => (p - sign * selectedKey[i % 13] + 29) % 29);
  return reverseInput ? out.reverse() : out;
}

/**
 * @param {number[]} letters
 * @returns {number}
 */
function ioc(letters) {
  const freq = new Array(29).fill(0);
  for (const letter of letters) freq[letter]++;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (letters.length * (letters.length - 1));
}

const original = corpus.pages[22].indices;
const solvedControl = corpus.pages[57].indices;
const plant = solvedControl.concat(solvedControl.slice(0, 36));
assert.equal(plant.length, 131);
assert(Math.abs(ioc(original) - 0.03581914) < 0.00000001);

for (const reverseInput of [false, true]) {
  for (const reverseKey of [false, true]) {
    for (const sign of [-1, +1]) {
      const cipherPlant = encode(plant, reverseInput, reverseKey, sign);
      assert.deepEqual(decode(cipherPlant, reverseInput, reverseKey, sign), plant);
      assert.deepEqual(encode(decode(original, reverseInput, reverseKey, sign),
        reverseInput, reverseKey, sign), original);

      const plain = decode(original, reverseInput, reverseKey, sign);
      const preview = plain.map(i => corpus.translit[i]).join('').slice(0, 120);
      console.log(JSON.stringify({
        reverseInput,
        reverseKey,
        sign,
        originalRunes: plain.length,
        ioc: Number(ioc(plain).toFixed(8)),
        preview,
        completeOriginalRoundtrip: true,
        nativePlantRoundtrip: true,
      }));
    }
  }
}
console.log('PASS: eight exact source-fixed mirror variants, zero unknown plaintext.');
