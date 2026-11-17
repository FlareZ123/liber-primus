'use strict';

/**
 * Source-frozen one-step, 29-to-29, plaintext-context reserve decoder.
 * Candidate: the manuscript's repeated 13-dot marks motivate an ordinal
 * +13 reserve relative to the previous recovered plaintext symbol.
 * A 28-way rank-skip successor emits every other GP symbol uniquely.
 * This candidate is exploratory; no original clue specifies its full rule.
 *
 * Run with Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const SHIFT = 13;
const M = 29;

/** @param {number} cprev @param {number} pprev @param {number} p @returns {number} */
function encodeStep(cprev, pprev, p) {
  const reserved = (pprev + SHIFT) % M;
  if (p === reserved) return cprev;
  const rank = p - Number(p > reserved);
  return (cprev + 1 + rank) % M;
}

/** @param {number} cprev @param {number} pprev @param {number} c @returns {number} */
function decodeStep(cprev, pprev, c) {
  const reserved = (pprev + SHIFT) % M;
  const delta = (c - cprev + M) % M;
  if (delta === 0) return reserved;
  const rank = delta - 1;
  return rank + Number(rank >= reserved);
}

/** @param {number[]} plain @returns {number[]} */
function encode(plain) {
  assert(plain.length > 0);
  const cipher = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    cipher.push(encodeStep(cipher[i - 1], plain[i - 1], plain[i]));
  }
  return cipher;
}

/** @param {number[]} cipher @returns {number[]} */
function decode(cipher) {
  assert(cipher.length > 0);
  const plain = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    plain.push(decodeStep(cipher[i - 1], plain[i - 1], cipher[i]));
  }
  return plain;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(M).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {number} */
function repeatCount(values) {
  let n = 0;
  for (let i = 1; i < values.length; i++) n += Number(values[i] === values[i - 1]);
  return n;
}

assert.equal(corpus.runes.length, M);
const encrypted = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
assert.equal(encrypted.length, 55);
assert.equal(encrypted.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(encrypted.reduce((sum, p) => sum + repeatCount(p.indices), 0), 86);

// Exhaustive one-step state bijection for all 29^3 predecessor/plain inputs.
// This proves recoverability and prevents an unacknowledged side channel.
let localChecks = 0;
for (let prevC = 0; prevC < M; prevC++) {
  for (let prevP = 0; prevP < M; prevP++) {
    const seen = new Set();
    for (let p = 0; p < M; p++) {
      const c = encodeStep(prevC, prevP, p);
      assert.equal(decodeStep(prevC, prevP, c), p);
      seen.add(c);
      localChecks++;
    }
    assert.equal(seen.size, M);
  }
}
assert.equal(localChecks, 24389);

// Native genuine clear GP p57 is a positive transport control, not a
// positive decryption of any unknown manuscript page.
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
assert.deepEqual(decode(encode(clear)), clear);
assert(Math.abs(ioc(clear) - 0.06270996640537514) < 1e-12);

const decoded = [];
for (const source of encrypted) {
  const p = decode(source.indices);
  assert.deepEqual(encode(p), source.indices);
  decoded.push(...p);
}
assert.equal(decoded.length, 12956);
const nativeIoc = ioc(decoded);
assert(Math.abs(nativeIoc - 0.0345068765238019) < 1e-12);

// Original p27 JPEG44 word at local offsets 79..90 contains two disjoint
// doublets: O,O at positions 4,5 and E,E at positions 10,11.
const p27 = corpus.pages.find((p) => p.page === 27).indices;
const word = [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18];
assert.deepEqual(p27.slice(79, 91), word);
const plaintext27 = decode(p27);
assert.deepEqual(plaintext27.slice(79, 91), [21, 21, 4, 5, 16, 0, 1, 19, 23, 8, 20, 4]);
assert.equal(encode(plaintext27).every((v, i) => v === p27[i]), true);

for (const pageNumber of [0, 27, 55]) {
  const source = corpus.pages.find((p) => p.page === pageNumber).indices;
  const plain = decode(source);
  console.log('page=' + pageNumber + ' runes=' + plain.length +
    ' cipher_ioc=' + ioc(source).toFixed(9) +
    ' decoded_ioc=' + ioc(plain).toFixed(9) +
    ' decoded_head=' + plain.slice(0, 40).map((v) => corpus.translit[v]).join(' '));
}
console.log('exhaustive_states=' + localChecks +
  ' native_positive=' + clear.length + '/' + clear.length +
  ' unknown_forward=' + decoded.length + '/' + decoded.length +
  ' unknown_decoded_ioc=' + nativeIoc.toFixed(12));
console.log('NO ORIGINAL LP2 PLAINTEXT OR AUTHOR-SELECTED CIPHER RECOVERED');
