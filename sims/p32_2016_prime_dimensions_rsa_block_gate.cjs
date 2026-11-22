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

// A distinct cross-page packet contract has the same modulus: the p49-p51
// table contains 256 interpreted bytes, while solved p56 contains 85 runes,
// and 256 = 1 + 85*3. Three bytes are required to serialize 0..320346.
const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'
));
const knownPage = corpus.pages.find((entry) => entry.page === 56);
assert.equal(knownPage.indices.length, 85);
const rowMajorBytes = table.byte_rows.flat();
const columnMajorBytes = Array.from({ length: 8 }, (_, j) => table.byte_rows.map((row) => row[j])).flat();
assert.equal(rowMajorBytes.length, 256);
assert.equal(columnMajorBytes.length, 256);

/**
 * @param {number[]} bytes
 * @param {number} offset
 * @param {boolean} reversed
 */
function threeBytePackets(bytes, offset, reversed) {
  const values = [];
  for (let i = offset; i + 3 <= bytes.length; i += 3) {
    const three = bytes.slice(i, i + 3);
    if (reversed) three.reverse();
    values.push(three[0] * 65536 + three[1] * 256 + three[2]);
  }
  return values;
}

/** @param {number} value */
function toThreeBytes(value) {
  assert(Number.isInteger(value) && value >= 0 && value < 2 ** 24);
  return [Math.floor(value / 65536), Math.floor(value / 256) % 256, value % 256];
}

const expectedByteInvalid = [
  [[84, 85], [83, 84], [84, 83]],
  [[84, 84], [85, 84], [82, 84]],
];
const byteResults = [];
for (const [orientation, bytes] of [rowMajorBytes, columnMajorBytes].entries()) {
  for (let offset = 0; offset <= 2; offset++) {
    for (const reversed of [false, true]) {
      const packets = threeBytePackets(bytes, offset, reversed);
      const invalid = packets.filter((packet) => packet >= modulus).length;
      assert.equal(invalid, expectedByteInvalid[orientation][offset][Number(reversed)]);
      byteResults.push({ orientation: orientation === 0 ? 'row' : 'column',
        offset, reversed, packets: packets.length, invalid });
    }
  }
}
assert(byteResults.every((result) => result.invalid >= 82));

// Control for the independently motivated 1 + 85*3 byte-packet count.
const planted85 = Array.from({ length: 85 }, (_, i) => (i ** 3 + 3301 * i + 123) % modulus);
const cipher85 = planted85.map((m) => Number(modPow(BigInt(m), e, n)));
const constructedTable = [rowMajorBytes[0], ...cipher85.flatMap(toThreeBytes)];
assert.equal(constructedTable.length, 256);
const extracted85 = threeBytePackets(constructedTable, 1, false);
assert.deepEqual(extracted85, cipher85);
const recovered85 = extracted85.map((c) => Number(modPow(BigInt(c), d, n)));
assert.deepEqual(recovered85, planted85);

console.log(JSON.stringify({
  modulus,
  primeDimensionSums: [topRow, leftColumn],
  originalPage32: { runes: indices.length, tests: results },
  originalPage49To51: { sourceBytes: rowMajorBytes.length, knownPage56Runes: knownPage.indices.length,
    tests: byteResults },
  plantedGPRecovered: recovered.length,
  plantedBytePacketsRecovered: recovered85.length,
  conclusion: 'No complete direct fixed-width RSA packets under the 2016 dimension-pair modulus'
}, null, 2));
