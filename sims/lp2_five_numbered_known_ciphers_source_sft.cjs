'use strict';

/**
 * Original-source single-file test: the five explicitly numbered LP2 Wisdom
 * passages under the five distinct cipher operations already solved by 2014.
 * Run with Node.js 22 from the repository root.
 *
 * Reuses the original corpus rune indices. A ciphertext F is ambiguous:
 * it may be a literal plaintext F bypass or an encrypted non-F.
 * The dynamic program enumerates every valid clock state, without guessing
 * English words or treating every ciphertext F as a bypass.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const alphabet = new Map(corpus.translit.map((x, i) => [x, i]));

/** @param {number} n Number of prime-derived shift values. @returns {number[]} */
function totientPrimeKeys(n) {
  const out = [];
  for (let v = 2; out.length < n; v++) {
    let prime = true;
    for (let d = 2; d * d <= v; d++) {
      if (v % d === 0) { prime = false; break; }
    }
    if (prime) out.push((v - 1) % 29);
  }
  return out;
}

/** @param {string} text A literal single-GP-letter key. @returns {number[]} */
function gpKey(text) {
  return [...text].map(x => {
    assert(alphabet.has(x), 'unrecognized key rune ' + x);
    return alphabet.get(x);
  });
}

/**
 * Count reachable consumed-key positions under the authentic plaintext-F rule.
 * A key-consuming position decrypting to F is forbidden by the true encoder.
 * @param {number[]} cipher Original, unmodified GP29 ciphertext.
 * @param {number[]} key Repeated fixed or sequential prime-totient key.
 * @returns {{reachable: number, firstImpossible: number|null}}
 */
function allFBypassStates(cipher, key) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const k of states) {
      if (cipher[i] === 0) next.add(k);
      const decoded = (cipher[i] - key[k % key.length] + 29) % 29;
      if (decoded !== 0) next.add(k + 1);
    }
    if (next.size === 0) return {reachable: 0, firstImpossible: i};
    states = next;
  }
  return {reachable: states.size, firstImpossible: null};
}

/** @param {number[]} plain GP29 runes. @param {number[]} key Source key. @returns {number[]} */
function encryptWithLiteralF(plain, key) {
  const out = [];
  let clock = 0;
  for (const v of plain) {
    if (v === 0) out.push(0);
    else { out.push((v + key[clock % key.length]) % 29); clock++; }
  }
  return out;
}

/** @param {number[]} v GP29 indices. @returns {number} */
function coincidence(v) {
  const counts = Array(29).fill(0);
  for (const c of v) counts[c]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (v.length * (v.length - 1));
}

/** @param {number[]} v GP29 indices. @returns {string} */
function spell(v) { return v.map(x => corpus.translit[x]).join(''); }

const numbered = [
  pages[36].indices.slice(99, 238),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189, 228).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186),
];

assert.deepEqual(numbered.map(x => x.length), [139, 91, 98, 96, 129]);
assert.equal(numbered.flat().length, 553);
const keys = [
  null,
  gpKey('DIUINITY'),
  null,
  gpKey('FIRFUMFERENFE'),
  totientPrimeKeys(160),
];

// Authentic positive: p56 decrypts with consecutive prime totients and one
// latent plaintext-F bypass at original rune offset 56.
const p56 = pages[56].indices;
assert.equal(p56.length, 85);
const phi = keys[4];
let consumed = 0;
const truePlain56 = p56.map((v, i) => {
  if (i === 56) { assert.equal(v, 0); return 0; }
  const x = (v - phi[consumed++ % phi.length] + 29) % 29;
  assert.notEqual(x, 0, 'genuine p56 non-bypass decoded F');
  return x;
});
assert.equal(consumed, 84);
assert(spell(truePlain56).startsWith('ANENDWITHINTHEDEEPWEB'));
assert(allFBypassStates(p56, phi).reachable > 0);

// Positive controls preserve every F and all source words/GP rune identities.
for (const key of [keys[1], keys[3], keys[4]]) {
  const planted = pages[57].indices;
  assert.equal(planted.length, 95);
  assert(allFBypassStates(encryptWithLiteralF(planted, key), key).reachable > 0);
}

const atbash = numbered[0].map(c => 28 - c);
const atbash3 = numbered[2].map(c => (31 - c) % 29);
const result = [
  {item: 1, n: 139, method: 'LP1 A WARNING Atbash', ioc: coincidence(atbash), prefix: spell(atbash.slice(0, 12))},
  {item: 2, n: 91, method: 'LP1 WELCOME DIVINITY', ...allFBypassStates(numbered[1], keys[1])},
  {item: 3, n: 98, method: 'LP1 A KOAN Atbash plus 3', ioc: coincidence(atbash3), prefix: spell(atbash3.slice(0, 12))},
  {item: 4, n: 96, method: 'LP1 A KOAN FIRFUMFERENFE', ...allFBypassStates(numbered[3], keys[3])},
  {item: 5, n: 129, method: 'LP2 AN END prime totients', ...allFBypassStates(numbered[4], keys[4])},
];

assert.equal(result[1].firstImpossible, 4);
assert.equal(result[3].firstImpossible, 31);
assert.equal(result[4].firstImpossible, 6);
assert(Math.abs(result[0].ioc - 0.034198727974142425) < 1e-12);
assert(Math.abs(result[2].ioc - 0.031559015358720806) < 1e-12);
console.log(JSON.stringify({solvedP56Runes: 85, solvedP56KeyUse: consumed, originalItems: result}, null, 2));
