'use strict';

/** Source-native 2014 Wisdom-square five-passage F-transparent inverse gate. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const source = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(source.length, 745);
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const rows = source.toString('ascii').split('\r\n').filter(line => /\d/.test(line))
  .map(line => [...line.matchAll(/\d+/g)].map(m => Number(m[0])));
assert.deepEqual(rows.map(row => row.length),
  [...Array(5).fill(5), ...Array(7).fill(7), ...Array(5).fill(5)]);

/** @param {number} n Positive integer. @returns {number} Euler phi(n). */
function totient(n) {
  let remaining = n;
  let result = n;
  for (let prime = 2; prime * prime <= remaining; prime += 1) {
    if (remaining % prime !== 0) continue;
    while (remaining % prime === 0) remaining /= prime;
    result -= result / prime;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}
const keys = rows.slice(12, 17).map(row => row.map(n => totient(n) % 29));
assert.deepEqual(keys, [
  [12,15,10,14,5], [4,24,19,12,6], [25,23,14,23,25],
  [6,12,19,24,4], [5,14,10,15,12]
]);
const page = n => corpus.pages.find(entry => entry.page === n).indices;
const original = [
  page(36).slice(99, 238),
  page(37).slice(0, 91),
  page(37).slice(91, 189),
  page(37).slice(189, 228).concat(page(38).slice(0, 57)),
  page(38).slice(57, 186)
];
assert.deepEqual(original.map(frag => frag.length), [139,91,98,96,129]);
assert.equal(original.reduce((acc, frag) => acc + frag.length, 0), 553);

/**
 * Complete all-legal-histories inverse for the actual solved-page plaintext-F rule.
 * 0 is a literal F and consumes no key, while ciphered non-F consumes one key.
 * @param {number[]} cipher Original GP29 ciphertext rune indices.
 * @param {number[]} key Five source-derived GP29 shifts.
 * @param {1|-1} sign Cipher sign (C=P+sign*K, mod29).
 * @returns {{failure: number|null, survivors: Map<number,bigint>}}
 */
function inverseStates(cipher, key, sign) {
  let states = new Map([[0, 1n]]);
  for (let pos = 0; pos < cipher.length; pos += 1) {
    const next = new Map();
    for (const [phase, paths] of states) {
      if (cipher[pos] === 0) next.set(phase, (next.get(phase) || 0n) + paths);
      const plain = ((cipher[pos] - sign * key[phase]) % 29 + 29) % 29;
      if (plain !== 0) {
        const future = (phase + 1) % 5;
        next.set(future, (next.get(future) || 0n) + paths);
      }
    }
    if (next.size === 0) return {failure: pos, survivors: next};
    states = next;
  }
  return {failure: null, survivors: states};
}

/** @param {number[]} plain GP29 native plaintext. @param {number[]} key Five shifts.
 * @param {1|-1} sign Original cipher sign. @returns {number[]} Ciphertext. */
function forward(plain, key, sign) {
  let phase = 0;
  return plain.map(value => {
    if (value === 0) return 0;
    const c = ((value + sign * key[phase]) % 29 + 29) % 29;
    phase = (phase + 1) % 5;
    return c;
  });
}

const expected = {
  '1': [8,29,12,88,28],
  '-1': [4,7,61,38,4]
};
assert.equal(page(57).length, 95, 'solved p57 positive plaintext');
for (const sign of [1,-1]) {
  for (let section = 0; section < 5; section += 1) {
    const key = keys[section];
    const actual = inverseStates(original[section], key, sign);
    assert.equal(actual.failure, expected[sign][section]);
    assert.equal(actual.survivors.size, 0);
    const positive = Array.from({length: original[section].length},
      (_, i) => page(57)[i % 95]);
    const planted = forward(positive, key, sign);
    const recovered = inverseStates(planted, key, sign);
    assert.equal(recovered.failure, null, 'actual key model must remain feasible');
    assert.ok(recovered.survivors.size >= 1);
    assert.deepEqual(forward(positive, key, sign), planted);
    console.log(JSON.stringify({sign, passage:section+1,
      originalRunes:original[section].length, firstImpossibleIndex:actual.failure,
      positiveNativeGPRecovered:true}));
  }
}
console.log('PASS: no complete legal plaintext for any of 10 original numbered rows; 10/10 solved-GP plants legal');
