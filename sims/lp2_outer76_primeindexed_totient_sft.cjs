'use strict';
/**
 * Source-fixed direct p55 outer-ring prime-indexed totient key test.
 * Run: node sims/lp2_outer76_primeindexed_totient_sft.cjs
 *
 * Inputs: 2014 LP2 p55 ciphertext, 2014 pp49-51 32x8 table;
 * operations: source p15 prime-of-index, solved p56 Euler phi of primes,
 * and solved p57's circumference instruction.
 * Tests precisely the clockwise outer 76-cell ring, no fitted phase.
 * The proposed transfer is exploratory and not an authored decoder.
 */
const assert = require('node:assert/strict');
const db = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/base60-grid.json');

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
  }
  return primes;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const frequency = new Array(29).fill(0);
  for (const symbol of symbols) frequency[symbol]++;
  return frequency.reduce((sum, f) => sum + f * (f - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} text @param {number[]} key @param {number} sign @returns {number[]} */
function apply(text, key, sign) {
  return text.map((value, i) => (value + sign * key[i] + 29 * 29) % 29);
}

assert.equal(db.runes.length, 29);
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every((row) => row.length === 8));
const p55 = db.pages.find((page) => page.page === 55).indices;
const p57 = db.pages.find((page) => page.page === 57).indices;
assert.deepEqual([p55.length, p57.length], [76, 95]);
const flat = table.byte_rows.flat();
assert.equal(flat.length, 256);
assert(flat.every((byte) => Number.isInteger(byte) && byte >= 0 && byte < 256));

// Human-visible 32x8 circumference, starting at upper left and going clockwise.
const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(8 * row + 7);
for (let col = 6; col >= 0; col--) ring.push(8 * 31 + col);
for (let row = 30; row >= 1; row--) ring.push(8 * row);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const primes = firstPrimes(256);
assert.deepEqual(primes.slice(0, 6), [2, 3, 5, 7, 11, 13]);
assert.equal(primes.at(-1), 1619);
// p15 uses one-based prime index; p56's key is phi(p)=p-1 for prime p.
const key = ring.map((cell) => (primes[flat[cell]] - 1) % 29);
assert.deepEqual(key.slice(0, 12), [1, 8, 10, 14, 27, 13, 12, 23, 26, 21, 2, 12]);

const decodedSubtract = apply(p55, key, -1);
const decodedAdd = apply(p55, key, +1);
assert.deepEqual(apply(decodedSubtract, key, +1), p55);
assert.deepEqual(apply(decodedAdd, key, -1), p55);
assert(Math.abs(coincidence(p55) - 0.037894736842105266) < 1e-12);
assert(Math.abs(coincidence(decodedSubtract) - 0.029473684210526315) < 1e-12);
assert(Math.abs(coincidence(decodedAdd) - 0.037192982456140354) < 1e-12);

// Independent genuine GP plaintext control, deliberately encrypted by this
// *artificial* key: detects encoder inversion without asserting historical use.
const plainControl = p57.slice(0, 76);
assert.deepEqual(apply(apply(plainControl, key, +1), key, -1), plainControl);
assert.deepEqual(apply(apply(plainControl, key, -1), key, +1), plainControl);
const read = (a) => a.map((i) => db.translit[i]).join(' ');
console.log(JSON.stringify({
  input: 'Original LP2 p55 76 runes and pp49-51 76-cell outer table ring',
  hypothesizedKey: 'phi(prime(tableByte + 1)) mod 29',
  byteIndexOrigin: 1,
  tableTraversal: 'clockwise outer circumference upper-left first',
  originalIoC: coincidence(p55),
  keyHead: key.slice(0, 12),
  inverseReadouts: [
    {sign: 'subtract', IoC: coincidence(decodedSubtract), GP: read(decodedSubtract)},
    {sign: 'add', IoC: coincidence(decodedAdd), GP: read(decodedAdd)}
  ],
  genuineSolvedPagePlant: '76/76 each arithmetic sign',
  conclusion: 'Original outputs remain nonlinguistic; no recovered p55 plaintext/key'
}, null, 2));
