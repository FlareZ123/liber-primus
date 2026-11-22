/**
 * SFT: LP2 original 32x8 source table as a conventional base60 row-major integer.
 * Performs finite radix/order checks and a clearly exploratory small-factor null.
 * No guessed plaintext or free-fitting key is used. Windows 11 / Node.js 22.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = source.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(source.bytes.length, 256);
const alphabet60 = source.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/**
 * @param {readonly string[]} input
 * @param {string} alphabet
 * @param {number} radix
 * @returns {number[]}
 */
function decodeTokens(input, alphabet, radix) {
  return input.map(t => {
    const a = alphabet.indexOf(t[0]);
    const b = alphabet.indexOf(t[1]);
    assert.ok(a >= 0 && b >= 0);
    const v = a * radix + b;
    assert.ok(v >= 0 && v <= 255);
    return v;
  });
}
/** @param {readonly number[]} bytes @returns {bigint} */
function bigEndian(bytes) {
  return bytes.reduce((n, v) => n * 256n + BigInt(v), 0n);
}

/** @returns {number[]} */
function primesThrough(limit) {
  const blocked = new Uint8Array(limit + 1);
  const primes = [];
  for (let p = 2; p <= limit; p += 1) {
    if (blocked[p]) continue;
    primes.push(p);
    if (p * p <= limit) for (let x = p * p; x <= limit; x += p) blocked[x] = 1;
  }
  return primes;
}

/** @param {bigint} n @param {readonly number[]} primes */
function extractSmall(n, primes) {
  const factors = [];
  for (const p of primes) {
    const bp = BigInt(p);
    let e = 0;
    while (n % bp === 0n) { n /= bp; e += 1; }
    if (e) factors.push([p, e]);
  }
  return {factors, cofactor: n};
}

/** @param {readonly number[]} bytes @param {string} name @returns {number[]} */
function orient(bytes, name) {
  const a = [...bytes];
  switch (name) {
    case 'row': return a;
    case 'row-reversed': return a.reverse();
    case 'column': return Array.from({length: 256}, (_, i) =>
      a[(i % 32) * 8 + Math.floor(i / 32)]);
    case 'column-reversed': return orient(a, 'column').reverse();
    case 'reverse-each-row': return Array.from({length: 256}, (_, i) =>
      a[Math.floor(i / 8) * 8 + 7 - i % 8]);
    case 'reverse-row-order': return Array.from({length: 256}, (_, i) =>
      a[(31 - Math.floor(i / 8)) * 8 + i % 8]);
    default: throw new Error(name);
  }
}

const A60 = decodeTokens(tokens, alphabet60, 60);
const A59 = decodeTokens(tokens, alphabet59, 59);
assert.deepEqual(A60, source.bytes);
const mainN = bigEndian(A60);
assert.equal(mainN.toString(2).length, 2048);
const small = extractSmall(mainN, primesThrough(1000000));
const sourceFactors = [[2, 4], [3, 3], [7, 1], [13, 1], [29, 1], [179, 2]];
assert.deepEqual(small.factors, sourceFactors);
const D = sourceFactors.reduce((n, [p, e]) => n * BigInt(p) ** BigInt(e), 1n);
assert.equal(D.toString(), '36528277968');
assert.equal(mainN % D, 0n);
assert.equal(small.cofactor.toString(2).length, 2013);

/** @param {bigint} base @param {bigint} power @param {bigint} modulus */
function powMod(base, power, modulus) {
  let result = 1n;
  while (power > 0n) {
    if (power & 1n) result = result * base % modulus;
    base = base * base % modulus;
    power >>= 1n;
  }
  return result;
}
assert.notEqual(powMod(2n, small.cofactor - 1n, small.cofactor), 1n);

const orders = ['row', 'row-reversed', 'column', 'column-reversed',
  'reverse-each-row', 'reverse-row-order'];
const comparisons = [];
for (const [radix, bytes] of [[60, A60], [59, A59]]) {
  for (const order of orders) {
    const n = bigEndian(orient(bytes, order));
    comparisons.push({radix, order, containsFullFactor: n % D === 0n});
  }
}
assert.deepEqual(comparisons.filter(x => x.containsFullFactor),
  [{radix: 60, order: 'row', containsFullFactor: true}]);

// For uniform random large integers, independent p-adic valuations obey
// P(v_p >= k) = p^-k. This charges all possible factors <=179.
/** @returns {() => number} */
function seededUniform() {
  let state = 3301;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const primesThrough179 = primesThrough(179);
const random = seededUniform();
const threshold = Math.log2(Number(D));
let hits = 0;
const trials = 1000000;
for (let i = 0; i < trials; i += 1) {
  let logSmooth = 0;
  for (const prime of primesThrough179) {
    while (random() < 1 / prime) logSmooth += Math.log2(prime);
  }
  if (logSmooth >= threshold - 1e-10) hits += 1;
}

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-grid-256.json',
  byteCount: A60.length,
  factorizationUnder1000000: small.factors,
  factorProduct: D.toString(),
  remainingCompositeCandidateBits: small.cofactor.toString(2).length,
  comparisons,
  exploratoryCompleteSmoothFactorNull: {
    thresholdBits: threshold, primeLimit: 179,
    trials, hits, probability: hits / trials,
    selectionCaveat: 'Prime factors were investigated after seeing the original table',
  },
}, null, 2));
