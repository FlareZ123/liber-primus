'use strict';

/**
 * Original LP2 source-selected RSA capacity gate (Node.js 22, CommonJS).
 * The independently identified 2016 image dimensions 563 and 569 are primes,
 * and their product is a candidate RSA modulus. Every ordinary ciphertext
 * block interpreted as one base-29 integer must lie in [0, n).
 *
 * No ciphertext is altered, fitted, or deciphered in the original-input gate.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const radix = 29;
const row = corpus.pages[32].indices;
assert.equal(row.length, 121);
const width = row.slice(0, 11).reduce((sum, rune) => sum + corpus.prime[rune], 0);
const height = Array.from({length: 11}, (_, i) => corpus.prime[row[11 * i]])
  .reduce((sum, weight) => sum + weight, 0);
assert.equal(width, 563);
assert.equal(height, 569);

const modulus = width * height; // 320347
const phi = (width - 1) * (height - 1);
const exponent = 3301;
assert.equal(modulus, 320347);
assert(radix ** 3 < modulus && modulus < radix ** 4);

/**
 * @param {number[]} digits Four ordinary left-to-right base-29 digits.
 * @returns {number} Numeric value.
 */
function pack(digits) {
  return digits.reduce((sum, digit) => radix * sum + digit, 0);
}

/**
 * @param {number[]} digits An original GP29 rune sequence.
 * @param {number} phase Zero-based offset to first full four-rune block.
 * @param {boolean} reverse Reverse the digits inside every block.
 * @returns {{total:number, invalid:number}}
 */
function capacity(digits, phase, reverse) {
  let total = 0;
  let invalid = 0;
  for (let start = phase; start + 3 < digits.length; start += 4) {
    const block = digits.slice(start, start + 4);
    if (reverse) block.reverse();
    if (pack(block) >= modulus) invalid++;
    total++;
  }
  return {total, invalid};
}

/**
 * @param {bigint} value
 * @param {bigint} power
 * @param {bigint} mod
 * @returns {bigint}
 */
function modPow(value, power, mod) {
  let result = 1n;
  let base = value % mod;
  for (let exp = power; exp > 0n; exp >>= 1n) {
    if (exp & 1n) result = result * base % mod;
    base = base * base % mod;
  }
  return result;
}

/**
 * @param {number} a
 * @param {number} m
 * @returns {number}
 */
function modularInverse(a, m) {
  let b = m;
  let x0 = 1;
  let x1 = 0;
  while (b !== 0) {
    const q = Math.floor(a / b);
    [a, b] = [b, a - q * b];
    [x0, x1] = [x1, x0 - q * x1];
  }
  assert.equal(a, 1);
  return ((x0 % m) + m) % m;
}

/**
 * @param {number} integer A valid nonnegative value less than 29^4.
 * @returns {number[]} Four padded base-29 digits.
 */
function digits4(integer) {
  const result = new Array(4);
  for (let i = 3; i >= 0; i--) {
    result[i] = integer % radix;
    integer = Math.floor(integer / radix);
  }
  assert.equal(integer, 0);
  return result;
}

const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
assert.equal(pages.length, 55);
const original = pages.flatMap((page) => page.indices);
assert.equal(original.length, 12956);
assert.equal(original.length % 4, 0);

const book = [];
for (const reverse of [false, true]) {
  for (let phase = 0; phase < 4; phase++) {
    book.push({reverse, phase, ...capacity(original, phase, reverse)});
  }
}
const expected = [
  1815, 1815, 1778, 1783, 1777, 1816, 1812, 1769,
];
assert.deepEqual(book.map((value) => value.invalid), expected);
assert.deepEqual(book.map((value) => value.total), [
  3239, 3238, 3238, 3238, 3239, 3238, 3238, 3238,
]);

const pageReset = [];
for (const reverse of [false, true]) {
  let total = 0;
  let invalid = 0;
  for (const page of pages) {
    const count = capacity(page.indices, 0, reverse);
    total += count.total;
    invalid += count.invalid;
  }
  pageReset.push({reverse, total, invalid});
}
assert.deepEqual(pageReset, [
  {reverse: false, total: 3219, invalid: 1783},
  {reverse: true, total: 3219, invalid: 1823},
]);

// Source-native positive control: 84 original solved-page rune indices,
// regarded as a known 3-symbol message. This checks actual RSA arithmetic
// and the four-symbol encoding independently of the LP2 negative.
const native = corpus.pages[56].indices.slice(0, 84);
assert.equal(native.length, 84);
const privateExponent = modularInverse(exponent, phi);
assert.equal(privateExponent, 250557);
const restored = [];
let legal = 0;
for (let i = 0; i < native.length; i += 3) {
  const message = pack(native.slice(i, i + 3));
  assert(message < modulus);
  const cipher = Number(modPow(BigInt(message), BigInt(exponent), BigInt(modulus)));
  const encoded = digits4(cipher);
  legal += Number(pack(encoded) < modulus);
  const decoded = Number(modPow(
    BigInt(pack(encoded)), BigInt(privateExponent), BigInt(modulus),
  ));
  const plaintext = new Array(3);
  let remainder = decoded;
  for (let j = 2; j >= 0; j--) {
    plaintext[j] = remainder % radix;
    remainder = Math.floor(remainder / radix);
  }
  assert.equal(remainder, 0);
  restored.push(...plaintext);
}
assert.deepEqual(restored, native);
assert.equal(legal, 28);

process.stdout.write(JSON.stringify({
  source: {width, height, modulus, phi, exponent, privateExponent},
  original: {runes: original.length, book, pageReset},
  nativePlant: {blocks: legal, recoveredRunes: restored.length},
}, null, 2) + '\n');
