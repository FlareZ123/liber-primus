'use strict';

/**
 * Original pp49–51 256-cell GF29 table polynomial: effective degree and
 * the missing 251-significant-coefficient repeating-key interpretation.
 *
 * Run from the repository root on Node.js 18+:
 *   node sims/p50_dualfactor_quotient_significant251_sft.cjs
 *
 * This finite source-geometry test produces no claimed LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const bytes = grid.byte_rows.flat();
const modulus = 29;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % modulus) + modulus) % modulus;
}

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let x = 1; x < modulus; x++) {
    if (mod(x * a) === 1) return x;
  }
  throw new Error('Noninvertible GF29 coefficient: ' + a);
}

/**
 * @param {number[]} a Ascending polynomial coefficients.
 * @param {number[]} b Ascending polynomial coefficients.
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/**
 * @param {number[]} dividend Ascending polynomial coefficients.
 * @param {number[]} divisor Ascending polynomial coefficients, monic.
 * @returns {{ quotient: number[], remainder: number[] }}
 */
function divideMonic(dividend, divisor) {
  assert.equal(divisor[divisor.length - 1], 1);
  const remainder = dividend.map(mod);
  const quotient = Array(dividend.length - divisor.length + 1).fill(0);
  for (let k = quotient.length - 1; k >= 0; k--) {
    const x = remainder[k + divisor.length - 1];
    quotient[k] = x;
    for (let j = 0; j < divisor.length; j++) {
      remainder[k + j] = mod(remainder[k + j] - x * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(0, divisor.length - 1) };
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const n of runes) counts[n]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) / (runes.length * (runes.length - 1));
}

assert.equal(bytes.length, 256);
assert.equal(bytes[0], 203);
assert.equal(bytes[1], 231);
assert.equal(mod(bytes[0]), 0);
assert.equal(mod(bytes[1]), 28);

// The source factors are the historical 2013 BASE29 '3QO' and original p39 red triple.
const factor2013 = [3, 26, 24];
const factorP39 = [27, 5, 15];
const product = multiply(factor2013, factorP39);
const normalization = inverse(product[4]);
const monicFactor = product.map(x => mod(x * normalization));
assert.deepEqual(monicFactor, [14, 9, 13, 28, 1]);

const polynomial = bytes.slice().reverse().map(mod);
assert.equal(polynomial.length, 256);
assert.equal(polynomial[255], 0);
assert.equal(polynomial[254], 28);

const { quotient, remainder } = divideMonic(polynomial, monicFactor);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.equal(quotient.length, 252);
assert.equal(quotient[251], 0);
assert.equal(quotient[250], 28);

const significant = quotient.slice(0, 251);
assert.equal(significant.length, 251);
assert.equal(significant[250], 28);
const raw = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(raw.length, 12956);

const readings = [];
for (const [name, asc] of [['padded252', quotient], ['significant251', significant]]) {
  const key = asc.slice().reverse(); // Original table's descending-coefficient reading.
  for (const sign of [-1, 1]) {
    const plaintext = raw.map((symbol, i) => mod(symbol + sign * key[i % key.length]));
    const recovered = plaintext.map((symbol, i) => mod(symbol - sign * key[i % key.length]));
    assert.deepEqual(recovered, raw);
    readings.push({ name, period: key.length, sign, ioc: ioc(plaintext) });
  }
}

const expected = [
  0.03449674813032835, 0.034484284248477375,
  0.03448845476343707, 0.03447277362718861
];
for (let i = 0; i < readings.length; i++) {
  assert.ok(Math.abs(readings[i].ioc - expected[i]) < 1e-12);
}

// Exact, fully secret per-original-page 29-symbol substitution bound.
// For k designated plaintext symbols, a bijection can assign them to at most
// the k most frequent decoded symbols on that page. Summing over pages is
// tight for k separately and requires no enumeration of (29!)^55 keys.
const pagePermutationBounds = [];
for (const sign of [-1, 1]) {
  let bookPosition = 0;
  let maxOne = 0;
  let maxTwo = 0;
  let maxTwelve = 0;
  const significantKey = significant.slice().reverse();
  for (const page of corpus.pages.slice(0, 56)) {
    const counts = Array(29).fill(0);
    for (const cipherRune of page.indices) {
      counts[mod(cipherRune + sign * significantKey[bookPosition % significantKey.length])]++;
      bookPosition++;
    }
    if (page.indices.length === 0) continue; // Original p50 numeric-only.
    counts.sort((a, b) => b - a);
    maxOne += counts[0];
    maxTwo += counts[0] + counts[1];
    maxTwelve += counts.slice(0, 12).reduce((sum, n) => sum + n, 0);
  }
  assert.equal(bookPosition, raw.length);
  pagePermutationBounds.push({ sign, maxOne, maxTwo, maxTwelve });
}
assert.deepEqual(pagePermutationBounds, [
  { sign: -1, maxOne: 802, maxTwo: 1525, maxTwelve: 7151 },
  { sign: 1, maxOne: 781, maxTwo: 1481, maxTwelve: 7043 }
]);

console.log(JSON.stringify({
  sourceCells: bytes.length,
  highestTwoMod29: polynomial.slice(-2),
  effectivePolynomialDegree: 254,
  paddedQuotientSlots: quotient.length,
  significantQuotientCoefficients: significant.length,
  significantQuotientDegree: 250,
  originalIoC: ioc(raw),
  readings,
  pagePermutationBounds
}, null, 2));
