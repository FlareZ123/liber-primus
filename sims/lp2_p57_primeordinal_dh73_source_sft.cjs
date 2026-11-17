#!/usr/bin/env node
'use strict';

/**
 * Original 2013 Parable / solved p57 / p49-51 table prime-rank DH73 gate.
 *
 * Single-file runnable test, Windows Node22:
 *   node sims/lp2_p57_primeordinal_dh73_source_sft.cjs
 *
 * Reads original-source transcriptions only. Mathematical alignment is a
 * hypothesis; no unknown-page plaintext is claimed by passing this test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();

/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const C = read('resources/liber-primus/lp2-corpus.json');
const G = read('resources/liber-primus/base60-grid.json');
const id3 = fs.readFileSync(
  path.join(root, 'im-results/audio761-original-id3-frame-inventory.md'), 'utf8'
);
assert(id3.includes('Parable 1,595,277,641'));
const originalN = 1595277641;
const map = new Map(C.translit.map((r, i) => [r, i]));

/** @param {string} phrase @returns {number[]} */
function encodeNative(phrase) {
  const letters = phrase.toUpperCase()
    .replace(/K/g, 'C').replace(/V/g, 'U').replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < letters.length;) {
    // Source-authenticated p57 orthography: one ᛝ denotes ING or NG.
    // The same solved corpus uses ᛡ for the English IO digraph.
    if (letters.slice(i, i + 3) === 'ING') {
      out.push(map.get('NG'));
      i += 3;
      continue;
    }
    if (letters.slice(i, i + 2) === 'IO') {
      out.push(map.get('IA'));
      i += 2;
      continue;
    }
    const pair = letters.slice(i, i + 2);
    if (map.has(pair)) {
      out.push(map.get(pair));
      i += 2;
    } else {
      assert(map.has(letters[i]), 'Unencodable letter at ' + i);
      out.push(map.get(letters[i]));
      i++;
    }
  }
  return out;
}
/** @param {string} phrase @returns {number} */
const primeSum = (phrase) =>
  encodeNative(phrase).reduce((s, i) => s + C.prime[i], 0);
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n @returns {number} */
function primePi(n) {
  let count = 0;
  for (let i = 2; i <= n; i++) if (isPrime(i)) count++;
  return count;
}
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let output = 1;
  while (exponent > 0) {
    if (exponent % 2) output = output * base % modulus;
    base = base * base % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return output;
}

const clauses = [
  'PARABLE',
  // The authentic p57 ING phoneme is one ᛝ rune, not I + NG.
  'LIKE THE INSTAR TUNNELING TO THE SURFACE',
  'WE MUST SHED OUR OWN CIRCUMFERENCES',
  'FIND THE DIVINITY WITHIN AND EMERGE'
];
const encoded = clauses.map(encodeNative);
const p57 = C.pages.find((page) => page.page === 57).indices;
assert.equal(p57.length, 95);
assert.deepEqual(encoded.flat(), p57, 'Every original clear rune must agree');
const clauseSums = clauses.slice(1).map(primeSum);
const ranks = clauseSums.map(primePi);
assert.deepEqual(clauseSums, [1259, 1031, 1229]);
assert.deepEqual(ranks, [205, 173, 201]);
assert.equal(clauseSums.reduce((a, b) => a * b, 1), originalN);

const printed = G.rows.flat();
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = BASE60.replace('f', '');
assert.equal(G.alphabet, BASE60);
assert.equal(printed.length, 256);
assert.equal(BASE59.length, 59);
assert(printed.every((token) => token.length === 2));
assert(printed.every((token) => !token.includes('f')));
/** @param {string} alphabet @returns {number[]} */
function convert(alphabet) {
  return printed.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    return hi * alphabet.length + lo;
  });
}
const bytes59 = convert(BASE59);
const bytes60 = convert(BASE60);
const at59 = ranks.map((address) => bytes59[address]);
const at60 = ranks.map((address) => bytes60[address]);
const oneBased59 = ranks.map((address) => bytes59[address - 1]);
assert.deepEqual(ranks.map((index) => printed[index]), ['1G', '1v', '1E']);
assert.deepEqual(at59, [75, 115, 73]);
assert.deepEqual(at60, [76, 117, 74]);
assert.deepEqual(oneBased59, [191, 146, 108]);

const p = primeSum('FIND'); // 151
const a = primeSum('OUR');  // 21
const must = primeSum('MUST'); // 186
const g = must % p; // 35
const b = 13; // candidate use of book-wide 13-dot punctuation (not authenticated)
const A = powMod(g, a, p);
const B = powMod(g, b, p);
const K = powMod(B, a, p);
assert.deepEqual({p, g, a, b, A, B, K}, {
  p: 151, g: 35, a: 21, b: 13, A: 107, B: 115, K: 73
});
assert.equal(powMod(A, b, p), K);
assert.equal(at59[0], (p - 1) / 2);
assert.equal(at59[1], B);
assert.equal(at59[2], K);
assert.equal(powMod(at59[1], a, p), at59[2]);
assert.notEqual(powMod(at60[1], a, p), at60[2]);
assert.notEqual(powMod(oneBased59[1], a, p), oneBased59[2]);
assert.equal(originalN % printed.length, K);
assert.equal(powMod(g, (p - 1) / 2, p), p - 1);

const outer = [];
for (let c = 0; c < 8; c++) outer.push(c);
for (let r = 1; r < 32; r++) outer.push(r * 8 + 7);
for (let c = 6; c >= 0; c--) outer.push(31 * 8 + c);
for (let r = 30; r > 0; r--) outer.push(r * 8);
assert.equal(outer.length, 76);
assert.equal(new Set(outer).size, 76);
assert.equal(outer[K], 24);
assert.equal(printed[outer[K]], '1n');
assert.equal(bytes59[outer[K]], A);

// Conditional permutation probability for the exact three values at
// three fixed distinct rank-address slots. Values were discovered retrospectively.
const freq = (value) => bytes59.filter((x) => x === value).length;
const count = [75, 115, 73].map(freq);
const conditionalProbability =
  (count[0] / 256) * (count[1] / 255) * (count[2] / 254);
assert.deepEqual(count, [2, 2, 1]);
assert.equal(1 / conditionalProbability, 4145280);

console.log(JSON.stringify({
  p57Source: {
    titleSum: primeSum(clauses[0]),
    clearRuneMatch: '95/95',
    actualEnglish: 'TUNNELING (one ING rune)',
    clauseSums, primeOrdinals: ranks,
    actualTableTokens: ranks.map((index) => printed[index])
  },
  table: {
    base59ValuesAtZeroBasedRanks: at59,
    base60ValuesAtZeroBasedRanks: at60,
    base59ValuesAtRankMinusOne: oneBased59
  },
  sourceSelectedArithmeticCandidate: {
    original2013ParableNumber: originalN,
    literalModulo256: originalN % 256,
    modulus: p, generator: g, privateA: a, optional13MarkerExponent: b,
    publicA: A, publicB: B, sharedK: K,
    firstClauseHalfGroupOrder: at59[0],
    secondClausePublicShare: at59[1],
    thirdClauseSharedValue: at59[2],
    outerRingAtKIndex: { ringIndex: K, flatCell: outer[K], value: bytes59[outer[K]] }
  },
  conditionalExactSlotProbability: conditionalProbability,
  note: 'Fixed-address multiset probability is not a search-adjusted p-value. Zero recovered unknown ciphertext runes.'
}, null, 2));
