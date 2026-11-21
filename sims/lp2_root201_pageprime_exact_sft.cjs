'use strict';

/**
 * Source-constrained, falsifiable p50 graph-to-page prime clock candidate.
 *
 * The clear p57 PARABLE clause-ordinal 201 gives the 56-node reverse tree,
 * whose two immediate incoming branches are exactly 50 and 5 nodes.
 * Tentative, NOT authored: sort each branch's nodes in original printed
 * row-major order to map to physical p0..49 and p51..55; p56 and p57 are
 * the two known nodes 74 and 205. Set page-start prime to the first prime
 * >= (table[assigned node] % 29), apply the authentic p56 GP29
 * phi(prime)-additive operation with plaintext-F transparency.
 *
 * Windows: node sims/lp2_root201_pageprime_exact_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const bytes = grid.byte_rows.flat();
const mod29 = n => ((n % 29) + 29) % 29;
assert.equal(bytes.length, 256);

const reverse = Array.from({length: 256}, () => []);
bytes.forEach((value, index) => reverse[value].push(index));

/** @param {number} root @returns {number[]} */
function ancestors(root) {
  const found = new Set([root]);
  const queue = [root];
  for (let i = 0; i < queue.length; i += 1) {
    for (const child of reverse[queue[i]]) {
      if (!found.has(child)) {
        found.add(child);
        queue.push(child);
      }
    }
  }
  return queue;
}

assert.deepEqual(reverse[201], [82, 128]);
assert.deepEqual([205, 173, 201].map(n => ancestors(n).length), [58, 8, 56]);
const left = ancestors(82).sort((a, b) => a - b);
const right = ancestors(128).sort((a, b) => a - b);
assert.equal(left.length, 50);
assert.deepEqual(right, [24, 109, 119, 128, 184]);
const pageNodes = [...left, 201, ...right, 74, 205];
assert.equal(pageNodes.length, 58);
assert.equal(new Set(pageNodes).size, 58);
assert.deepEqual(pageNodes.slice(50), [201, 24, 109, 119, 128, 184, 74, 205]);

/** @param {number} count @returns {number[]} */
function primesThroughCount(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    if (primes.every(p => p * p > candidate || candidate % p !== 0)) {
      primes.push(candidate);
    }
  }
  return primes;
}
const primes = primesThroughCount(1200);

/** @param {number} page @returns {number} */
function firstPrimePosition(page) {
  const residue = bytes[pageNodes[page]] % 29;
  const index = primes.findIndex(p => p >= residue);
  assert.ok(index >= 0);
  return index;
}

/**
 * Encrypt with the authentic solved-p56 plaintext-F transparency. Every
 * plaintext F passes verbatim and does not consume a prime.
 *
 * @param {number[]} plain
 * @param {number} firstPrimeIndex
 * @returns {number[]}
 */
function encrypt(plain, firstPrimeIndex) {
  let current = firstPrimeIndex;
  return plain.map(v => {
    if (v === 0) return 0;
    const result = mod29(v + primes[current] - 1);
    current += 1;
    return result;
  });
}

/**
 * A C=F could be transparent plaintext F or the encryption of non-F.
 * Enumerate both possibilities, merging exactly by consumed-prime index;
 * a C!=F is impossible when its decryption would be plaintext F.
 * Hence empty states prove algebraic impossibility, independent of language.
 *
 * @param {number[]} ciphertext
 * @param {number} firstPrimeIndex
 * @returns {{matched: number, firstImpossible: number|null, finalStates: number}}
 */
function invertFeasibility(ciphertext, firstPrimeIndex) {
  let states = new Set([firstPrimeIndex]);
  for (let i = 0; i < ciphertext.length; i += 1) {
    const C = ciphertext[i];
    const next = new Set();
    for (const j of states) {
      const decoded = mod29(C - (primes[j] - 1));
      if (C === 0) next.add(j);
      if (decoded !== 0) next.add(j + 1);
    }
    if (!next.size) {
      return {matched: i, firstImpossible: i, finalStates: 0};
    }
    states = next;
  }
  return {
    matched: ciphertext.length,
    firstImpossible: null,
    finalStates: states.size
  };
}

/** @param {string} text @returns {number[]} */
function nativeGp(text) {
  const tokens = corpus.translit.map((str, i) => ({str, i}))
    .sort((a, b) => b.str.length - a.str.length);
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA').replace(/[^A-Z]/g, '');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(v => normalized.startsWith(v.str, i));
    assert.ok(token, 'Unrecognized native GP29 token');
    result.push(token.i);
    i += token.str.length;
  }
  return result;
}

const p56 = corpus.pages[56].indices;
const originalP56Plaintext = nativeGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE');
assert.equal(p56.length, 85);
assert.equal(originalP56Plaintext.length, 85);
assert.equal(pageNodes[56], 74);
assert.equal(bytes[74] % 29, 2);
assert.equal(firstPrimePosition(56), 0);
assert.deepEqual(encrypt(originalP56Plaintext, 0), p56,
  'Original solved-p56 ciphertext must be recovered without fitting');

const predicted = {};
for (let page = 51; page <= 56; page += 1) {
  const ciphertext = corpus.pages[page].indices;
  const start = firstPrimePosition(page);
  const result = invertFeasibility(ciphertext, start);
  predicted[page] = {
    node: pageNodes[page],
    tableByte: bytes[pageNodes[page]],
    residue: bytes[pageNodes[page]] % 29,
    initialPrime: primes[start],
    totalRunes: ciphertext.length,
    ...result
  };
}
assert.deepEqual([51, 52, 53, 54, 55].map(p => predicted[p].firstImpossible),
  [21, 223, 32, 19, 58]);
assert.equal(predicted[56].firstImpossible, null);
assert.equal(predicted[56].matched, 85);

const nativePlant = corpus.pages[57].indices.slice(0, 76);
const plant = encrypt(nativePlant, firstPrimePosition(55));
const nativeInverse = invertFeasibility(plant, firstPrimePosition(55));
assert.equal(nativeInverse.matched, 76);
assert.ok(nativeInverse.finalStates > 0);

console.log(JSON.stringify({
  source: 'Unchanged p50 base60 table and original GP29 ciphertext',
  model: 'row-major ascending 50|1|5 graph-to-page map, prime ceiling of byte modulo29, per-page reset, authentic plaintext-F-transparent phi-prime shift',
  historicalStatus: 'investigator-specified clock/address extension, not a creator-authenticated instruction',
  knownOriginalP56Positive: '85/85 exact forward encryption',
  p57NativePlantPositive: '76/76 exact original-alphabet inverse',
  originalCipherGate: predicted,
  recoveredUnknownPlaintext: false,
  conclusion: 'This complete specific graph-to-page prime schedule is impossible for all five original terminal unknown pages'
}, null, 2));
