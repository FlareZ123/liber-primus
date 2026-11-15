'use strict';

// Reproduce one source-constrained historical SSSS hypothesis against the
// original LP2 p49-p51 32-by-8 numerical table. Node.js 22, no dependencies.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');

const path = 'resources/liber-primus/lp2-grid-256.json';
const original = JSON.parse(readFileSync(path, 'utf8'));
assert.equal(original.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(original.byte_count, 256);
assert.equal(original.bytes.length, 256);
assert(original.bytes.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
const bytes = original.bytes;

/**
 * Historical SSSS 0.5 field polynomials: x^64+x^4+x^3+x+1,
 * x^256+x^10+x^5+x^2+1. See osresearch/ssss, ssss.c, field_init.
 * @param {number} byteWidth - Field element size.
 * @returns {{ bits: bigint, polynomial: bigint }}
 */
function field(byteWidth) {
  const taps = byteWidth === 8 ? [4, 3, 1] : [10, 5, 2];
  assert([8, 32].includes(byteWidth));
  const bits = BigInt(byteWidth * 8);
  return {
    bits,
    polynomial: (1n << bits) | taps.reduce((p, k) => p | (1n << BigInt(k)), 1n)
  };
}

/**
 * Multiply two field elements with carryless polynomial reduction.
 * @param {bigint} a
 * @param {bigint} b
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function multiply(a, b, f) {
  let out = 0n;
  while (b > 0n) {
    if (b & 1n) out ^= a;
    b >>= 1n;
    a <<= 1n;
    if (a & (1n << f.bits)) a ^= f.polynomial;
  }
  return out;
}

/**
 * Exponentiate in GF(2^n).
 * @param {bigint} a
 * @param {bigint} exponent
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function power(a, exponent, f) {
  let out = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) out = multiply(out, a, f);
    a = multiply(a, a, f);
    exponent >>= 1n;
  }
  return out;
}

/**
 * Invert the small nonzero source share-ID difference.
 * @param {number} v
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function inverse(v, f) {
  assert(v !== 0);
  return power(BigInt(v), (1n << f.bits) - 2n, f);
}

/**
 * Recover a polynomial value from exactly five fixed-ID shares, x=1,...,5.
 * No secret plaintext, key, or threshold is fitted to the LP2 original.
 * @param {bigint[]} shares
 * @param {number} x
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function interpolate(shares, x, f) {
  assert.equal(shares.length, 5);
  let out = 0n;
  for (let i = 0; i < 5; i += 1) {
    let weight = 1n;
    for (let j = 0; j < 5; j += 1) {
      if (j === i) continue;
      weight = multiply(weight, multiply(
        BigInt(x ^ (j + 1)),
        inverse((i + 1) ^ (j + 1), f),
        f
      ), f);
    }
    out ^= multiply(shares[i], weight, f);
  }
  return out;
}

/**
 * Source's polynomial evaluation (Horner) with constant first coefficient.
 * @param {bigint[]} coefficients
 * @param {number} x
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function evaluate(coefficients, x, f) {
  return coefficients.slice().reverse().reduce(
    (y, coefficient) => multiply(y, BigInt(x), f) ^ coefficient, 0n
  );
}

/**
 * Decode a fixed-width original byte string as a single field element.
 * @param {number[]} values
 * @returns {bigint}
 */
function element(values) {
  return BigInt('0x' + Buffer.from(values).toString('hex'));
}

/**
 * Independently planted five-of-eight positives, both field widths.
 * Diffusion in historical SSSS applies to the constant coefficient only;
 * the polynomial redundancy invariant below does not need that coefficient.
 * @param {number} width
 */
function positive(width) {
  const f = field(width);
  const coefficients = Array.from({ length: 5 }, (_, i) =>
    element([...createHash('sha256')
      .update('lp2-source-ssss-positive-v1:' + width + ':' + i).digest()
      .subarray(0, width)])
  );
  const planted = Array.from({ length: 8 }, (_, i) => evaluate(coefficients, i + 1, f));
  assert.equal(interpolate(planted.slice(0, 5), 0, f), coefficients[0]);
  for (let i = 6; i <= 8; i += 1) {
    assert.equal(interpolate(planted.slice(0, 5), i, f), planted[i - 1]);
  }
  console.log('POSITIVE', JSON.stringify({ width, threshold: 5, checkedShares: 3, match: true }));
}

positive(8);
positive(32);

const layouts = [
  {
    label: '8 contiguous 32-byte fields',
    shares: Array.from({ length: 8 }, (_, i) => bytes.slice(i * 32, (i + 1) * 32))
  },
  {
    label: '8 vertical 32-byte fields',
    shares: Array.from({ length: 8 }, (_, c) => Array.from({ length: 32 }, (_, r) => bytes[8 * r + c]))
  },
  {
    label: '32 rowwise 8-byte fields',
    shares: Array.from({ length: 32 }, (_, r) => bytes.slice(8 * r, 8 * r + 8))
  }
];

const outcomes = [];
for (const layout of layouts) {
  for (const reverse of [false, true]) {
    const shareElements = layout.shares.map((s) => element(reverse ? s.slice().reverse() : s));
    const f = field(layout.shares[0].length);
    const reference = shareElements.slice(0, 5);
    const heldout = [];
    for (let x = 6; x <= shareElements.length; x += 1) {
      heldout.push(interpolate(reference, x, f) === shareElements[x - 1]);
    }
    const result = {
      layout: layout.label,
      byteOrder: reverse ? 'reversed' : 'printed',
      historicalThreshold: 5,
      fixedShareIds: '1..' + shareElements.length,
      match: heldout.filter(Boolean).length,
      heldout: heldout.length,
      firstFailedShareId: heldout.findIndex((match) => !match) + 6
    };
    assert.equal(result.match, 0, 'Original source unexpectedly matches historical SSSS candidate');
    outcomes.push(result);
    console.log('ORIGINAL', JSON.stringify(result));
  }
}
assert.equal(outcomes.length, 6);
console.log('SUMMARY', JSON.stringify({
  originalByteSHA256: createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  completeLayouts: 6,
  sourceNativeFiveShareCandidatesPassing: 0,
  originalRecoveredPlaintext: false
}));
