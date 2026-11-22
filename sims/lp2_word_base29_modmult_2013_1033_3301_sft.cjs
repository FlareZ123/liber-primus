'use strict';

/**
 * Source-literal per-word BASE29 modulo-29^length arithmetic with historical
 * 1033/3301 multiplicative operands, on all original LP2 joined words.
 * SFT: node sims/lp2_word_base29_modmult_2013_1033_3301_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const gp = new Map([...corpus.runes].map((rune, index) => [rune, index]));
const original = corpus.pages.filter(page => page.status === 'unsolved').flatMap(page => page.indices);
const words = [];
let current = [];
for (const rune of source.split('%').slice(0, 55).join('%')) {
  if (gp.has(rune)) {
    current.push(gp.get(rune));
  } else if (rune !== '/' && rune !== '%' && !/\s/.test(rune)) {
    if (current.length) words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

/** @param {bigint} a @param {bigint} mod @returns {bigint} */
function remainder(a, mod) { return (a % mod + mod) % mod; }

/** @param {bigint} a @param {bigint} modulus @returns {bigint} */
function inverse(a, modulus) {
  let x = remainder(a, modulus);
  let y = modulus;
  let u = 1n, v = 0n;
  while (y) {
    const factor = x / y;
    [x, y] = [y, x - factor * y];
    [u, v] = [v, u - factor * v];
  }
  assert.equal(x, 1n);
  return remainder(u, modulus);
}

/**
 * @param {number[]} word Exact-width GP29 word
 * @param {number} key Historical integer 1033 or 3301
 * @param {boolean} inverseKey True to multiply by inverse modulo 29^L
 * @returns {number[]} Same-width reversible GP29 word
 */
function transform(word, key, inverseKey) {
  const modulus = 29n ** BigInt(word.length);
  let value = 0n;
  for (const letter of word) value = 29n * value + BigInt(letter);
  const factor = inverseKey ? inverse(BigInt(key), modulus) : BigInt(key);
  let output = remainder(value * factor, modulus);
  const decoded = new Array(word.length);
  for (let i = word.length - 1; i >= 0; i--) {
    decoded[i] = Number(output % 29n);
    output /= 29n;
  }
  return decoded;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const count = new Array(29).fill(0);
  for (const x of symbols) count[x]++;
  return count.reduce((total, v) => total + v * (v - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

const control = corpus.pages.find(page => page.page === 57).indices;
assert.equal(control.length, 95);
const results = [];
for (const key of [1033, 3301]) {
  for (const inverseKey of [false, true]) {
    const decoded = words.flatMap(word => transform(word, key, inverseKey));
    assert.equal(decoded.length, 12956);
    const recovered = [];
    let index = 0;
    for (const word of words) {
      // Original solved-page positive plant, retaining source word lengths.
      const planted = Array.from({length: word.length}, (_, i) => control[(index + i) % control.length]);
      index += word.length;
      const encoded = transform(planted, key, inverseKey);
      assert.deepEqual(transform(encoded, key, !inverseKey), planted);
      const target = transform(word, key, inverseKey);
      assert.deepEqual(transform(target, key, !inverseKey), word);
      recovered.push(...target);
    }
    assert.deepEqual(recovered, decoded);
    const score = ioc(decoded);
    assert.ok(score > 0.033 && score < 0.036);
    results.push({key, inverseKey, sourceIoC: score,
      prefix: decoded.slice(0, 50).map(i => corpus.translit[i]).join('')});
  }
}
console.log(JSON.stringify({originalWords: words.length, originalRunes: original.length,
  sourceIoC: ioc(original), nativeControlRunes: control.length,
  results}, null, 2));
