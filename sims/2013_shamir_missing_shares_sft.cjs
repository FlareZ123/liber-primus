'use strict';

/**
 * Independent historical SSSS 5-of-10 reconstruction, including three
 * unattested share values. Node.js 22 SFT, no dependencies:
 *   node sims/2013_shamir_missing_shares_sft.cjs
 *
 * The source ssss 0.5 uses atoi() for decimal share IDs; share values
 * themselves are hexadecimal. A degree-five monic polynomial P(x)=x^5+Q(x),
 * deg Q<=4, over GF(2^176) is recoverable from five shares.
 *
 * Historical source links and source-class limitations:
 * im-results/pklmx-2013-onion-continuation-gate.md
 */
const assert = require('node:assert/strict');

const TOP = 1n << 176n;
const POLY = TOP | (1n << 11n) | (1n << 3n) | (1n << 2n) | 1n;
const THRESHOLD = 5n;
const SHARES = [
  [2n, '41cc481a51fe77f91600f593c1db2ce9babd2626ea6e'],
  [3n, '7678a5f6b72042d839151b34b02ffe161cf997fed484'],
  [5n, 'fcd82965b6632ea25d80edc3e58baafb4b2938895cbd'],
  [7n, 'f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa'],
  [8n, 'b970e507dbc4ac115a273126f62671654c480fce32e5'],
].map(([id, hex]) => [id, BigInt('0x' + hex)]);

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function mul(a, b) {
  let value = 0n;
  while (b > 0n) {
    if ((b & 1n) !== 0n) value ^= a;
    b >>= 1n;
    a <<= 1n;
    if ((a & TOP) !== 0n) a ^= POLY;
  }
  return value;
}

/** @param {bigint} x @param {bigint} e @returns {bigint} */
function pow(x, e) {
  let result = 1n;
  while (e > 0n) {
    if ((e & 1n) !== 0n) result = mul(result, x);
    x = mul(x, x);
    e >>= 1n;
  }
  return result;
}

/** @param {bigint} x @returns {bigint} */
function inv(x) {
  assert.notEqual(x, 0n);
  return pow(x, TOP - 2n);
}

/**
 * Evaluate the unique monic quintic through these five archived shares.
 * Characteristic-two addition and subtraction are both XOR.
 * @param {bigint} x
 * @returns {bigint}
 */
function evaluate(x) {
  let value = pow(x, THRESHOLD);
  for (const [xi, yi] of SHARES) {
    let basis = 1n;
    for (const [xj] of SHARES) {
      if (xi === xj) continue;
      basis = mul(basis, mul(x ^ xj, inv(xi ^ xj)));
    }
    value ^= mul(yi ^ pow(xi, THRESHOLD), basis);
  }
  return value;
}

/**
 * Compute full historical monic degree-five sharing polynomial,
 * including its five originally random coefficients.
 * @returns {bigint[]}
 */
function reconstructCoefficients() {
  const out = Array(6).fill(0n);
  out[5] = 1n;
  for (const [xi, yi] of SHARES) {
    let basis = [1n];
    for (const [xj] of SHARES) {
      if (xi === xj) continue;
      const next = Array(basis.length + 1).fill(0n);
      for (let k = 0; k < basis.length; k++) {
        next[k] ^= mul(basis[k], xj);
        next[k + 1] ^= basis[k];
      }
      basis = next;
    }
    const denominator = basis.reduce((sum, coeff, k) =>
      sum ^ mul(coeff, pow(xi, BigInt(k))), 0n);
    const scale = mul(yi ^ pow(xi, THRESHOLD), inv(denominator));
    for (let k = 0; k < basis.length; k++) out[k] ^= mul(basis[k], scale);
  }
  return out;
}

/** @param {bigint[]} coefficients @param {bigint} x @returns {bigint} */
function evaluatePolynomial(coefficients, x) {
  return coefficients.reduceRight((value, coefficient) =>
    mul(value, x) ^ coefficient, 0n);
}

/** @param {bigint} value @returns {string} */
function hex(value) {
  return value.toString(16).padStart(44, '0');
}

const expected = new Map([
  [1n, 'c59f624527a7bd26326fb88ee142d5f1c37d733cd4d7'],
  [2n, '41cc481a51fe77f91600f593c1db2ce9babd2626ea6e'],
  [3n, '7678a5f6b72042d839151b34b02ffe161cf997fed484'],
  [4n, '2d9336c7808cc461da52f2df7d1e78c32d0127e20684'],
  [5n, 'fcd82965b6632ea25d80edc3e58baafb4b2938895cbd'],
  [6n, 'b574e7a760595bb8286043a917d0526cb23030f5a2c7'],
  [7n, 'f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa'],
  [8n, 'b970e507dbc4ac115a273126f62671654c480fce32e5'],
  [9n, '82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750'],
  [10n, '1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d'],
  [16n, '7a41506204fd054000ad4849923eeb318eee07ca6d5f'],
]);

const coefficients = reconstructCoefficients();
const actual = [...expected].map(([index, reference]) => {
  const result = hex(evaluate(index));
  assert.equal(result, reference, 'decimally indexed share ' + index);
  assert.equal(hex(evaluatePolynomial(coefficients, index)), reference);
  return {decimalIndex: Number(index), shareHex: result};
});
assert.notEqual(evaluate(10n), evaluate(16n), 'decimal versus hexadecimal index control');
assert.equal(mul(0x7afn, inv(0x7afn)), 1n);
console.log(JSON.stringify({
  field: 'GF(2^176), polynomial x^176+x^11+x^3+x^2+1',
  model: 'monic degree-five SSSS polynomial from indices 02,03,05,07,08',
  signedSourceControls: [3, 9, 10],
  originalMissingShareIndices: [1, 4, 6],
  allPredictionsMatch: true,
  coefficientsAscendingDegree: coefficients.map(hex),
  shares: actual,
  limitation: 'Missing shares are inferred mathematical values, not recovered signed originals or LP2 plaintext.',
}, null, 2));
