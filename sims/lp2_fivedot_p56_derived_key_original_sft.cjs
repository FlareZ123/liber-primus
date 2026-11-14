#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const lines = fs.readFileSync(path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8').trim().split(/\r?\n/);

/** @param {number} n @returns {number[]} */
function page(n) { return corpus.pages.find(p => p.page === n).indices; }
/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }

const quadgrams = new Map();
let total = 0;
for (const line of lines) {
  const [gram, countString] = line.trim().split(/\s+/);
  if (!countString) continue;
  const count = Number(countString);
  quadgrams.set(gram, count);
  total += count;
}
const gpTokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} s @returns {number[]} */
function toIndices(s) {
  const result = [];
  for (const word of s.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = gpTokens.find(t => word.startsWith(t.token, i));
      assert.ok(match, 'invalid GP token ' + word.slice(i));
      result.push(match.index);
      i += match.token.length;
    }
  }
  return result;
}
/** @param {number[]} values @returns {string} */
function latin(values) {
  return values.map(value => corpus.translit[value]).join('').replace(/[^A-Z]/g, '');
}
/** @param {number[]} values @returns {{quadgram:number,ioc:number,prefix:string}} */
function stats(values) {
  const s = latin(values);
  let logScore = 0;
  for (let i = 0; i + 3 < s.length; i++)
    logScore += Math.log10((quadgrams.get(s.slice(i, i + 4)) || 0.01) / total);
  const counts = Array(29).fill(0);
  for (const rune of values) counts[rune]++;
  return {
    quadgram: Number((logScore / (s.length - 3)).toFixed(6)),
    ioc: Number((counts.reduce((sum, count) => sum + count * (count - 1), 0)
      / (values.length * (values.length - 1))).toFixed(6)),
    prefix: s.slice(0, 100)
  };
}
const expected = toIndices('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const p56 = page(56);
assert.equal(p56.length, 85);
assert.deepEqual(p56.map((rune, i) => rune === 0 ? i : -1).filter(i => i !== -1), [35, 47, 51, 56, 74]);
assert.equal(expected.length, p56.length);
const knownKey = p56.map((rune, i) => mod(rune - expected[i]));

const primes = [];
for (let n = 2; primes.length < 100; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { isPrime = false; break; }
  if (isPrime) primes.push(n);
}
let clock = 0;
const expectedKey = p56.map((_, i) => i === 56 ? 0 : mod(primes[clock++] - 1));
assert.deepEqual(knownKey, expectedKey, 'must reproduce every solved p56 rune and the documented interrupter');

/** @param {number[]} cipher @returns {number[]} */
function decrypt(cipher) {
  assert.equal(cipher.length, 85);
  return cipher.map((rune, i) => mod(rune - knownKey[i]));
}
assert.deepEqual(decrypt(p56), expected);
const solvedStats = stats(expected);
assert.ok(solvedStats.quadgram > -5.0);
assert.ok(solvedStats.ioc > 0.06);

const outcomes = [];
for (const n of [7, 23]) {
  const cipher = page(n);
  for (const anchor of ['head', 'tail']) {
    const block = anchor === 'head' ? cipher.slice(0, 85) : cipher.slice(-85);
    for (const mirrored of [false, true]) {
      const input = mirrored ? [...block].reverse() : block;
      const output = decrypt(input);
      assert.deepEqual(output.map((rune, i) => mod(rune + knownKey[i])), input);
      const result = {page:n, anchor, mirrored, ...stats(output)};
      outcomes.push(result);
      assert.ok(result.quadgram < -6.5, 'requires independent plaintext review if a candidate enters English range');
      assert.ok(result.ioc < 0.05);
    }
  }
}
console.log(JSON.stringify({
  hypothesis:'The one duplicated five-dot artwork links p7/p23 to p56 and selects its original known totient pad',
  source_images:['resources/liber-primus/24.jpg','resources/liber-primus/40.jpg','resources/liber-primus/73.jpg'],
  frozen_alignment:'85-rune p56 known keystream; p7 closing and p23 opening; allow both reversal orientations, plus complementary first/last-page anchors as adversarial controls',
  solved_p56:{n:85,...solvedStats},
  key_sha256:crypto.createHash('sha256').update(Buffer.from(knownKey)).digest('hex'),
  outcomes,
  verdict:'NEGATIVE: even the source-marked blocks do not inherit the known p56 keystream; no unknown plaintext recovered'
},null,2));
