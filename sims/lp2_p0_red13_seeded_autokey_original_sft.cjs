'use strict';
/**
 * First-chapter 13-rune red-title seeded autokey, source-fixed original test.
 * 24 combinations: raw/dot-routed initial key, rune/prime/totient register,
 * two additive signs, and ciphertext/plaintext feedback at lag 13.
 *
 * The original red title is exactly 8+5 runes followed by a 13-dot mark.
 * This is a finite test of a historical cipher form, not an author-attested key.
 * Node.js 22, CommonJS, no dependencies outside the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const chapter = corpus.pages.slice(0, 3).flatMap(page => page.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(chapter.length, 729);
const header = chapter.slice(0, 13);
assert.deepEqual(header, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const body = chapter.slice(13);
assert.equal(body.length, 716);
const dotOrder = [8, 0, 1, 9, 2, 3, 10, 4, 5, 11, 6, 7, 12];
assert.deepEqual(dotOrder.map(i => header[i]),
  [15, 15, 8, 26, 18, 3, 18, 6, 19, 21, 27, 0, 5]);
const mod = x => ((x % 29) + 29) % 29;

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const c of runes) counts[c]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}
/** @param {number[]} red @param {string} kind @returns {number[]} */
function initialKey(red, kind) {
  return red.map(index => kind === 'index' ? index :
    kind === 'prime' ? corpus.prime[index] % 29 :
    (corpus.prime[index] - 1) % 29);
}
/**
 * @param {number[]} cipher
 * @param {number[]} seed
 * @param {'cipher'|'plain'} feedback
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(cipher, seed, feedback, sign) {
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const key = i < 13 ? seed[i] :
      feedback === 'cipher' ? cipher[i - 13] : plain[i - 13];
    plain.push(mod(cipher[i] + sign * key));
  }
  return plain;
}
/**
 * @param {number[]} plain
 * @param {number[]} seed
 * @param {'cipher'|'plain'} feedback
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encode(plain, seed, feedback, sign) {
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    const key = i < 13 ? seed[i] :
      feedback === 'cipher' ? cipher[i - 13] : plain[i - 13];
    cipher.push(mod(plain[i] - sign * key));
  }
  return cipher;
}

const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const plant = Array.from({length: 716}, (_, i) => solved[i % solved.length]);
const results = [];
for (const [order, selected] of [
  ['raw', header], ['dot', dotOrder.map(i => header[i])]
]) for (const kind of ['index', 'prime', 'phiPrime'])
  for (const feedback of ['cipher', 'plain'])
    for (const sign of [-1, 1]) {
      const seed = initialKey(selected, kind);
      const recovered = decode(body, seed, feedback, sign);
      assert.deepEqual(encode(recovered, seed, feedback, sign), body);
      assert.deepEqual(decode(encode(plant, seed, feedback, sign),
        seed, feedback, sign), plant);
      results.push({
        order, kind, feedback, sign,
        ioc: +ioc(recovered).toFixed(9),
        first28: recovered.slice(0, 28).map(x => corpus.translit[x]).join(' ')
      });
    }
assert.equal(results.length, 24);
results.sort((a, b) => b.ioc - a.ioc);
assert.equal(results[0].order, 'raw');
assert.equal(results[0].kind, 'prime');
assert.equal(results[0].feedback, 'cipher');
assert.equal(results[0].sign, 1);
assert.ok(Math.abs(results[0].ioc - 0.035520) < 0.000001);
assert.ok(results.every(r => r.ioc < 0.036));
console.log(JSON.stringify({
  originalRunes: chapter.length, titleRunes: header.length, bodyRunes: body.length,
  originalBodyIoC: ioc(body), solvedClearP57IoC: ioc(solved),
  syntheticRecoveredEach: plant.length, tests: results.length,
  originalPlaintextRecovered: 0, results
}, null, 2));
