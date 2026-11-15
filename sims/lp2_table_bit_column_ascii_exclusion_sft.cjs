'use strict';

/**
 * Original LP2 32x8 numeric-grid one-bit-per-cell ASCII exclusion.
 * Exact, key-independent for any fixed bit-column permutation and
 * fixed per-column XOR mask. Read-only; Node 22 CommonJS on Windows.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
  'utf8'));
const bytes = source.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
assert(bytes.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
const grid = Array.from({ length: 32 }, (_, row) =>
  bytes.slice(row * 8, row * 8 + 8));

/** @param {number} n @returns {boolean} */
const isPrime = (n) =>
  n > 1 && Array.from(
    { length: Math.floor(Math.sqrt(n)) - 1 },
    (_, i) => i + 2).every((p) => n % p !== 0);

/** @param {number} n @returns {number} */
const popcountParity = (n) => {
  let value = n;
  let bit = 0;
  while (value) {
    bit ^= value & 1;
    value >>>= 1;
  }
  return bit;
};

/** @type {Array<[string, (n:number)=>number]>} */
const features = [
  ...Array.from(
    { length: 8 },
    (_, shift) => [
      'byte-bit-' + shift,
      (v) => (v >>> shift) & 1,
    ]),
  ['quotient29-parity', (v) => Math.floor(v / 29) & 1],
  ['remainder29-parity', (v) => (v % 29) & 1],
  ['base60-second-lowercase', (v) => Number(v % 60 >= 36)],
  ['base60-second-digit', (v) => Number(v % 60 < 10)],
  ['base60-first-digit-parity', (v) => Math.floor(v / 60) & 1],
  ['popcount-parity', popcountParity],
  ['integer-prime', (v) => Number(isPrime(v))],
];

const columnCounts = [];
for (const [name, fn] of features) {
  const columnOnes = Array.from({ length: 8 }, (_, col) =>
    grid.reduce((sum, row) => sum + fn(row[col]), 0));
  assert(columnOnes.every((v) => v > 0 && v < 32),
    'Source contains a constant column under ' + name);
  columnCounts.push({ name, columnOnes });
}


/**
 * Count equal or complementary binary column pairs across the exact 32 rows.
 * The printable uppercase 7-bit ASCII interval 32..95 always satisfies
 * (bit6 XOR bit5) == 1, irrespective of letter/digit/punctuation choice.
 * A fixed arbitrary source-column permutation, one ignored eighth column,
 * and fixed per-column inversion require one such source pair.
 *
 * @param {number[][]} rows
 * @returns {number}
 */
function pairCount(rows) {
  let pairs = 0;
  for (let a = 0; a < 8; a++) {
    for (let b = a + 1; b < 8; b++) {
      const same = rows.every((row) => row[a] === row[b]);
      const opposite = rows.every((row) => row[a] !== row[b]);
      if (same || opposite) pairs++;
    }
  }
  return pairs;
}
const pairDetails = features.map(([name, fn]) => ({
  name,
  matchingOrComplementaryPairs: pairCount(grid.map((row) => row.map(fn))),
}));
assert(pairDetails.every((item) => item.matchingOrComplementaryPairs === 0));

// Each 8-bit printable-ASCII row has bit 7 = 0. Any fixed bit-column
// permutation with optional fixed XOR masks must map the constant MSB
// to one source column constant across all 32 rows. The source has none.
const positive = 'WELCOME PILGRIM TO LIBER PRIMUS'.padEnd(32, ' ');
assert.equal(positive.length, 32);
const positiveBits = Array.from(positive, (letter) =>
  Array.from({ length: 8 },
    (_, position) => (letter.charCodeAt(0) >>> position) & 1));
const permutedPositive = positiveBits.map((bits) =>
  Array.from({ length: 8 },
    (_, col) => bits[(col + 3) % 8] ^ (col % 2)));
const positiveOnes = Array.from({ length: 8 }, (_, col) =>
  permutedPositive.reduce((sum, row) => sum + row[col], 0));
assert(positiveOnes.some((v) => v === 0 || v === 32));
assert(pairCount(permutedPositive) > 0);

console.log(JSON.stringify({
  sourceCells: bytes.length,
  shape: [32, 8],
  sourceBitSelectors: columnCounts.length,
  sourceConstantColumns: 0,
  sourceEqualOrComplementaryColumnPairs: 0,
  positivePairCount: pairCount(permutedPositive),
  pairDetails,
  positiveConstantColumns: positiveOnes.filter(
    (v) => v === 0 || v === 32).length,
  columnCounts,
}, null, 2));
