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
 * x^176+x^11+x^3+x^2+1, x^256+x^10+x^5+x^2+1.
 * See osresearch/ssss, ssss.c, field_init and horner.
 * @param {number} byteWidth - Field element size.
 * @returns {{ bits: bigint, polynomial: bigint }}
 */
function field(byteWidth) {
  const byWidth = { 8: [4, 3, 1], 22: [11, 3, 2], 32: [10, 5, 2] };
  assert([8, 22, 32].includes(byteWidth));
  const taps = byWidth[byteWidth];
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
 * Reconstruct SSSS's historical MONIC degree-five polynomial from five
 * original source values. The source's horner() starts with y=x, hence
 * emits y(x)=x^5+a4*x^4+...+a0, not a plain degree-four polynomial.
 * combine() removes x^5 before its five-point interpolation.
 * @param {bigint[]} shares - Raw source values.
 * @param {number} x - Requested SSSS share identifier, or zero for secret.
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @param {number[]} ids - Exact five source identifiers.
 * @returns {bigint}
 */
function interpolate(shares, x, f, ids = [1, 2, 3, 4, 5]) {
  assert.equal(shares.length, 5);
  assert.equal(ids.length, 5);
  let out = 0n;
  for (let i = 0; i < 5; i += 1) {
    let weight = 1n;
    for (let j = 0; j < 5; j += 1) {
      if (j === i) continue;
      weight = multiply(weight, multiply(
        BigInt(x ^ ids[j]),
        inverse(ids[i] ^ ids[j], f),
        f
      ), f);
    }
    const normalized = shares[i] ^ power(BigInt(ids[i]), 5n, f);
    out ^= multiply(normalized, weight, f);
  }
  return out ^ power(BigInt(x), 5n, f);
}

/**
 * Source's monic degree-five polynomial evaluation (Horner).
 * @param {bigint[]} coefficients
 * @param {number} x
 * @param {{ bits: bigint, polynomial: bigint }} f
 * @returns {bigint}
 */
function evaluate(coefficients, x, f) {
  return coefficients.slice().reverse().reduce(
    (y, coefficient) => multiply(y, BigInt(x), f) ^ coefficient, BigInt(x)
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

/**
 * First-party historical 2013 SSSS sample: threshold 5, six surviving
 * independently published source fields. Exact 22-byte f(0) is the native
 * diffusion-encoded version of p7amjopgric7dfdi.onion, and the sixth share
 * is a locked, independently withheld field value.
 * Source: neuroretransmit/cicada/2013/006-third-onion/shares.txt
 * SSSS source: osresearch/ssss ssss.c (monic Horner + combine normalization).
 */
function historical2013() {
  const entries = [
    [2, '41cc481a51fe77f91600f593c1db2ce9babd2626ea6e'],
    [3, '7678a5f6b72042d839151b34b02ffe161cf997fed484'],
    [5, 'fcd82965b6632ea25d80edc3e58baafb4b2938895cbd'],
    [8, 'b970e507dbc4ac115a273126f62671654c480fce32e5'],
    [9, '82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750'],
    [10, '1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d']
  ];
  const ids = entries.slice(0, 5).map((s) => s[0]);
  const values = entries.slice(0, 5).map((s) => BigInt('0x' + s[1]));
  const f = field(22);
  const expectedSecret = 0x65b9c4065cc47a4a48e01d17de166a94252dfbb44e69n;
  assert.equal(interpolate(values, 0, f, ids), expectedSecret);
  assert.equal(interpolate(values, 10, f, ids), BigInt('0x' + entries[5][1]));
  console.log('NATIVE_2013_POSITIVE', JSON.stringify({
    originalShares: entries.length,
    threshold: 5,
    encodedSecret: expectedSecret.toString(16),
    heldoutShareId: 10,
    exactMatches: 1
  }));
}

positive(8);
positive(32);
historical2013();

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
  historicalNativePositive: true,
  sourceMonicTerm: 'x^5',
  originalRecoveredPlaintext: false
}));
