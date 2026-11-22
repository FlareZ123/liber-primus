'use strict';

/**
 * Source-pinned GF(29) syndrome check for the original p29 rune stream.
 * Run: node sims/lp2_p29_red39_factor_syndrome_sft.cjs
 * A source-selected decoder or plaintext is not assumed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'
));
const corpus = source('lp2-corpus.json');
const grid = source('base60-grid.json');
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number} value A nonzero GF(29) element. */
function inverse(value) {
  for (let candidate = 1; candidate < 29; candidate += 1) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error('No inverse for nonzero GF(29) element');
}

/**
 * Evaluate descending-order coefficients modulo an ascending-order quadratic.
 * @param {number[]} digits Source-order GP29 symbols or canonical base60 bytes.
 * @param {[number, number, number]} f Constant, X and X^2 coefficients.
 * @returns {[number, number]} Remainder coefficients in descending [X,1] order.
 */
function remainder(digits, f) {
  const scale = inverse(f[2]);
  let constant = 0;
  let linear = 0;
  for (const n of digits) {
    const nextConstant = mod(n - linear * f[0] * scale);
    const nextLinear = mod(constant - linear * f[1] * scale);
    constant = nextConstant;
    linear = nextLinear;
  }
  return [linear, constant];
}

const H = /** @type {[number,number,number]} */ ([3, 26, 24]);
const G = /** @type {[number,number,number]} */ ([27, 5, 15]);
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(remainder(bytes, H), [0, 0]);
assert.deepEqual(remainder(bytes, G), [0, 0]);

const originalPages = corpus.pages.filter((p) => p.page <= 55 && p.runic_count !== 0);
assert.equal(originalPages.length, 55);
const matches = originalPages
  .filter((p) => remainder(p.indices, G).every((x) => x === 0))
  .map((p) => p.page);
assert.deepEqual(matches, [29]);

const page29 = originalPages.find((p) => p.page === 29).indices;
assert.equal(page29.length, 277);
assert.deepEqual(page29.slice(-2), [8, 19]);
assert.deepEqual(remainder(page29, G), [0, 0]);
assert.deepEqual(remainder(page29, H), [16, 20]);
assert.deepEqual(remainder(page29.slice().reverse(), G), [10, 5]);

const zeroTail = remainder(page29.slice(0, -2).concat([0, 0]), G);
const predictedTail = zeroTail.map((n) => mod(-n));
assert.deepEqual(predictedTail, [8, 19]);
assert.deepEqual(remainder(page29.slice(0, -2).concat(predictedTail), G), [0, 0]);
const corrupted = page29.slice();
corrupted[corrupted.length - 1] = mod(corrupted[corrupted.length - 1] + 1);
assert.notDeepEqual(remainder(corrupted, G), [0, 0]);

/**
 * Exact quotient under the same source G factor, to test the most literal
 * decoding consequence before inventing any secondary transform.
 * @returns {{quotient:number[],rem:number[]}}
 */
function quotientAndRemainder(digits, f) {
  const work = digits.slice();
  const quotient = [];
  const highInv = inverse(f[2]);
  for (let i = 0; i < digits.length - 2; i += 1) {
    const k = mod(work[i] * highInv);
    quotient.push(k);
    for (let j = 0; j < 3; j += 1) {
      work[i + j] = mod(work[i + j] - k * f[2 - j]);
    }
  }
  return {quotient, rem:work.slice(-2)};
}

const division = quotientAndRemainder(page29, G);
assert.deepEqual(division.rem, [0, 0]);
assert.equal(division.quotient.length, 275);
assert.deepEqual(division.quotient.slice(0, 30), [
  4,6,26,27,11,9,15,25,15,21,7,0,18,26,8,28,7,5,23,12,6,1,18,0,22,2,28,6,14,13
]);
const counts = Array(29).fill(0);
for (const value of division.quotient) counts[value] += 1;
const iocNumerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
assert.equal(iocNumerator, 2566);
const reconstructed = Array(page29.length).fill(0);
division.quotient.forEach((coefficient, i) => {
  for (let j = 0; j < 3; j += 1) {
    reconstructed[i + j] = mod(reconstructed[i + j] + coefficient * G[2 - j]);
  }
});
assert.deepEqual(reconstructed, page29);

console.log('Original p29: 277 GP29 symbols; p39 G(X) syndrome [0,0].');
console.log('Literal G-quotient: 275 GP29 values, IoC 2566/75350 = 0.0340544; exact reconstruction.');
console.log('Only G-divisible nonempty p0-55 physical page: p29.');
console.log('Original last two symbols [8,19] equal G-predicted parity tail.');
console.log('H remainder [16,20]; reversed-G remainder [10,5].');
console.log('Source table: H and G syndromes [0,0]; mutation control failed as expected.');
