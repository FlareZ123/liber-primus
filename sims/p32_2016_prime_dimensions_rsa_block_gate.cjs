'use strict';

/**
 * Source-fixed GP29/RSA packet-format gate for original LP2 physical page 32.
 *
 * The authenticated 2016 tree JPEG is 563 by 569 pixels. Those two primes
 * match the GP-prime sums of the top row and left column of the original
 * 11x11 p32 rune grid. A candidate RSA modulus is n = 563*569 = 320347.
 *
 * Since 29^3 < n < 29^4, one literal fixed-width RSA packet would use
 * exactly four GP29 runes. Every valid four-rune ciphertext packet must
 * encode an integer smaller than n, regardless of RSA exponent.
 *
 * Repro: node sims/p32_2016_prime_dimensions_rsa_block_gate.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const page = corpus.pages.find((entry) => entry.page === 32);
const indices = page.indices;
const gpPrimes = corpus.prime;

const p = 563;
const q = 569;
const modulus = p * q;
const radix = 29;
const width = 4;

/** @param {number} value */
function isPrime(value) {
  for (let d = 2; d * d <= value; d++) {
    if (value % d === 0) return false;
  }
  return value >= 2;
}

/** @param {number[]} digits */
function fromBase29(digits) {
  return digits.reduce((acc, digit) => acc * radix + digit, 0);
}

/** @param {number} number */
function toBase29Four(number) {
  assert(Number.isInteger(number) && number >= 0 && number < radix ** width);
  const digits = Array(width).fill(0);
  let rest = number;
  for (let i = width - 1; i >= 0; i--) {
    digits[i] = rest % radix;
    rest = Math.floor(rest / radix);
  }
  assert.equal(rest, 0);
  return digits;
}

/**
 * @param {number[]} sequence
 * @param {number} offset
 * @param {boolean} reverseEachPacket
 */
function getPackets(sequence, offset, reverseEachPacket) {
  const packets = [];
  for (let i = offset; i + width <= sequence.length; i += width) {
    const digits = sequence.slice(i, i + width);
    if (reverseEachPacket) digits.reverse();
    packets.push(fromBase29(digits));
  }
  return packets;
}

/**
 * @param {bigint} base
 * @param {bigint} exp
 * @param {bigint} n
 */
function modPow(base, exp, n) {
  let result = 1n;
  let b = base % n;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = result * b % n;
    b = b * b % n;
    e >>= 1n;
  }
  return result;
}

/** @param {bigint} a @param {bigint} m */
function modInverse(a, m) {
  let oldR = a;
  let r = m;
  let oldS = 1n;
  let s = 0n;
  while (r !== 0n) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  assert.equal(oldR, 1n, 'RSA exponent must be invertible modulo phi');
  return (oldS % m + m) % m;
}

assert.equal(indices.length, 121);
assert(isPrime(p) && isPrime(q));
assert.equal(modulus, 320347);
assert(29 ** 3 < modulus && modulus < 29 ** 4);
const topRow = indices.slice(0, 11).reduce((sum, rune) => sum + gpPrimes[rune], 0);
const leftColumn = Array.from({ length: 11 }, (_, i) => indices[i * 11])
  .reduce((sum, rune) => sum + gpPrimes[rune], 0);
assert.equal(topRow, p);
assert.equal(leftColumn, q);

const expectedInvalid = [
  [16, 17],
  [23, 15],
  [11, 23],
  [16, 10],
  [15, 17],
];
const results = [];
for (let offset = 0; offset <= 4; offset++) {
  for (const reversed of [false, true]) {
    const packets = getPackets(indices, offset, reversed);
    const invalid = packets.filter((packet) => packet >= modulus).length;
    assert.equal(invalid, expectedInvalid[offset][Number(reversed)]);
    results.push({ offset, reversed, packets: packets.length, invalid });
  }
}
assert(results.every((result) => result.invalid >= 10));

// Positive control: the same decoder sees 30/30 format-valid packets when
// a 30-packet RSA payload is constructed with the authentic source modulus.
// The exponent is a conventional demonstration, not a Cicada-selected key.
const e = 65537n;
const n = BigInt(modulus);
const phi = BigInt((p - 1) * (q - 1));
const d = modInverse(e, phi);
const plantedPlain = Array.from({ length: 30 }, (_, i) => (i ** 3 + i * 3301 + 123) % modulus);
const plantedCipher = plantedPlain.map((m) => Number(modPow(BigInt(m), e, n)));
const plantedRunes = [indices[0], ...plantedCipher.flatMap(toBase29Four)];
assert.equal(plantedRunes.length, 121);
const reconstructed = getPackets(plantedRunes, 1, false);
assert.deepEqual(reconstructed, plantedCipher);
assert(reconstructed.every((value) => value < modulus));
const recovered = reconstructed.map((c) => Number(modPow(BigInt(c), d, n)));
assert.deepEqual(recovered, plantedPlain);
assert.deepEqual(recovered.flatMap((m) => toBase29Four(Number(modPow(BigInt(m), e, n)))), plantedRunes.slice(1));

console.log(JSON.stringify({
  sourcePage: 32,
  runes: indices.length,
  rowSum: topRow,
  columnSum: leftColumn,
  modulus,
  results,
  originalFormatSurvivors: 0,
  plantedRecovered: recovered.length,
  conclusion: 'No complete direct four-GP-rune fixed-width RSA packetization'
}, null, 2));
