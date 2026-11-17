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

console.log('Original p29: 277 GP29 symbols; p39 G(X) syndrome [0,0].');
console.log('Only G-divisible nonempty p0-55 physical page: p29.');
console.log('Original last two symbols [8,19] equal G-predicted parity tail.');
console.log('H remainder [16,20]; reversed-G remainder [10,5].');
console.log('Source table: H and G syndromes [0,0]; mutation control failed as expected.');
