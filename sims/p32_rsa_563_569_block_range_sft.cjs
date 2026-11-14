'use strict';

/**
 * SFT: source-anchored RSA serialization feasibility on physical LP2 p32.
 *
 * The signed 2016 tree image has dimensions 563x569. These values also equal
 * the GP-prime sums of the first row and first column of the 11x11 p32 tape.
 * RSA with primes 563,569 would use modulus 320347, requiring each ciphertext
 * block to be an integer less than that modulus. Four base-29 runes are the
 * minimum fixed-width block capable of representing every residue modulo N.
 *
 * This tests a necessary mathematical condition, independent of RSA exponent
 * and linguistic scoring. The source does not independently prescribe RSA.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const values = corpus.pages.find((page) => page.page === 32).indices;
const prime = corpus.prime;
const P = 563;
const Q = 569;
const N = P * Q;

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  for (let factor = 2; factor * factor <= value; factor++) {
    if (value % factor === 0) return false;
  }
  return value >= 2;
}

/** @param {number[]} runes @returns {number} */
function base29(runes) {
  return runes.reduce((value, digit) => value * 29 + digit, 0);
}

/** @param {number} value @returns {number[]} */
function fourRunes(value) {
  assert.ok(Number.isInteger(value) && value >= 0 && value < 29 ** 4);
  const result = [];
  let remainder = value;
  for (let i = 0; i < 4; i++) {
    result.unshift(remainder % 29);
    remainder = Math.floor(remainder / 29);
  }
  return result;
}

assert.ok(isPrime(P) && isPrime(Q));
assert.ok(29 ** 3 < N && N < 29 ** 4);
assert.equal(values.length, 121);
const square = Array.from({ length: 11 }, (_, r) => values.slice(11 * r, 11 * r + 11));
assert.equal(square[0].reduce((sum, digit) => sum + prime[digit], 0), P);
assert.equal(square.reduce((sum, row) => sum + prime[row[0]], 0), Q);

const tapes = {
  row_major: values,
  column_major: Array.from({ length: 11 }, (_, c) => square.map((row) => row[c])).flat()
};
const cases = [];
for (const [order, source] of Object.entries(tapes)) {
  for (const direction of ['forward', 'reverse']) {
    const tape = direction === 'forward' ? source : source.slice().reverse();
    for (const omit of ['first', 'last']) {
      const remaining = omit === 'first' ? tape.slice(1) : tape.slice(0, -1);
      assert.equal(remaining.length, 120);
      for (const endian of ['big', 'little']) {
        const blocks = [];
        for (let i = 0; i < 120; i += 4) {
          const chunk = remaining.slice(i, i + 4);
          blocks.push(base29(endian === 'big' ? chunk : chunk.reverse()));
        }
        const invalid = blocks.filter((value) => value >= N).length;
        cases.push({ order, direction, omit, endian, invalid, valid: 30 - invalid });
        assert.ok(invalid > 0, 'new source variant unexpectedly admits valid RSA blocks');
      }
    }
  }
}

assert.equal(cases.length, 16);
assert.equal(Math.min(...cases.map((item) => item.invalid)), 15);
// Artificial positive control: all residues of the modulus can be represented
// as exactly four GP29 symbols and parsed without loss.
for (const sample of [0, 1, 29, 3301, 24388, 320346]) {
  assert.ok(sample < N);
  assert.equal(base29(fourRunes(sample)), sample);
}
console.log(JSON.stringify({
  status: 'bounded negative: direct four-GP-rune RSA ciphertext serialization',
  source: 'physical LP2 p32; signed tree dimensions 563x569',
  primes: [P, Q],
  modulus: N,
  base29Power3: 29 ** 3,
  base29Power4: 29 ** 4,
  corpusRunes: values.length,
  cases,
  minInvalid: Math.min(...cases.map((item) => item.invalid)),
  positiveControl: '6/6 exact base29 residue round trips',
  limitation: 'No statement about RSA with a separately specified byte stream, nontrivial packing, or another cipher'
}, null, 2));
