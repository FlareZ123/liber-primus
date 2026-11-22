#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const grid = read('resources/liber-primus/base60-grid.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const mod = (x) => ((x % 29) + 29) % 29;
const sha256 = (a) => crypto.createHash('sha256').update(Buffer.from(a)).digest('hex');

/** Multiply polynomials over GF(29), with coefficients in ascending order. */
function multiplyLow(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) result[i + j] = mod(result[i + j] + a[i] * b[j]);
  }
  return result;
}

/** Divide by a monic polynomial in GF(29)[X]. */
function divideLow(dividend, divisor) {
  assert.equal(divisor[divisor.length - 1], 1);
  const remainder = dividend.slice();
  const quotient = Array(dividend.length - divisor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const coefficient = mod(remainder[i + divisor.length - 1]);
    quotient[i] = coefficient;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(0, divisor.length - 1) };
}

/** Multiplication in GF(29^238) modulo the source-grid irreducible Q238. */
function multiplyField(a, b, modulus) {
  const n = modulus.length - 1;
  const product = new Int32Array(2 * n - 1);
  for (let i = 0; i < n; i++) {
    if (a[i] === 0) continue;
    for (let j = 0; j < n; j++) product[i + j] += a[i] * b[j];
  }
  for (let k = 2 * n - 2; k >= n; k--) {
    const coefficient = mod(product[k]);
    if (coefficient !== 0) {
      for (let j = 0; j < n; j++) product[k - n + j] -= coefficient * modulus[j];
    }
  }
  return Array.from(product.slice(0, n), mod);
}

/** Exponentiation of a field element using nonnegative BigInt exponent. */
function fieldPower(input, exponent, modulus) {
  const n = modulus.length - 1;
  let base = input.slice();
  let result = [1, ...Array(n - 1).fill(0)];
  for (let k = exponent; k > 0n; k >>= 1n) {
    if (k & 1n) result = multiplyField(result, base, modulus);
    if (k > 1n) base = multiplyField(base, base, modulus);
  }
  return result;
}

/** Invert an integer modulo a positive BigInt modulus. */
function inverse(value, modulus) {
  let a = value, b = modulus, x = 1n, y = 0n;
  while (b !== 0n) {
    const quotient = a / b;
    [a, b] = [b, a - quotient * b];
    [x, y] = [y, x - quotient * y];
  }
  assert.equal(a, 1n, 'exponent must be invertible');
  return (x % modulus + modulus) % modulus;
}

function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (indices.length * (indices.length - 1));
}

const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(bytes[0] % 29, 0, 'the nominal degree-255 leading coefficient must vanish');
const P = bytes.slice().reverse().map(mod).slice(0, 255);
const smallFactors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const divisor = smallFactors.reduce(multiplyLow, [1]);
const division = divideLow(P, divisor);
assert.ok(division.remainder.every((coefficient) => coefficient === 0));
const Q = division.quotient.map((coefficient) => mod(28 * coefficient));
assert.equal(Q.length, 239);
assert.equal(Q[238], 1);
assert.equal(sha256(Q), '8d90ba2976c648c2071387a9c4a2f502bada036fcf36fea9ddbb794497ac7d25');

const original = corpus.pages.find((page) => page.page === 36).indices;
assert.equal(original.length, 238);
assert.equal(sha256(original), 'a53ded5a907795ae4c57a2a75bd3fba5a5c7093ac092d40fb7f7f8a7eda91491');
const order = 29n ** 238n - 1n;
const historicalExponent = 1661n;
const inverseExponent = inverse(historicalExponent, order);
const cipherAsField = original.slice().reverse();
const decodedAsField = fieldPower(cipherAsField, inverseExponent, Q);
const decoded = decodedAsField.slice().reverse();
assert.deepEqual(fieldPower(decodedAsField, historicalExponent, Q), cipherAsField);
assert.equal(sha256(decoded), 'afcd34871143c81ee4a2504712f42525ca01b231645b5605fe3d49bd726f00f3');

// Source-native positive plant: the solved p57 GP plaintext, repeated to reach 238 symbols.
const solved = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(solved.length, 95);
const plant = Array.from({ length: 238 }, (_, i) => solved[i % solved.length]);
const plantCipher = fieldPower(plant.slice().reverse(), historicalExponent, Q);
assert.deepEqual(fieldPower(plantCipher, inverseExponent, Q).slice().reverse(), plant);

const transliteration = decoded.map((i) => corpus.translit[i]).join('');
console.log(JSON.stringify({
  source: 'Original pp49-51 base60 byte grid, physical p36 238 runes, historical candidate exponent 1661',
  modulus: 'monic irreducible Q238 over GF29 (source-grid factorization)',
  target: 'physical LP2 p36, original order as descending GF29 coefficients',
  operation: 'raise original field element to inverse(1661) modulo 29^238-1',
  source_hashes: { p36: sha256(original), Q238: sha256(Q) },
  decoded_hash: sha256(decoded),
  decoded_ioc: ioc(decoded), original_ioc: ioc(original),
  decoded_prefix: transliteration.slice(0, 200),
  checks: { exact_reencryption: true, source_native_plant_recovered: true },
  conclusion: 'No GP29-language plaintext recovered by this exact GF(29^238) DH1661 inverse.'
}, null, 2));
