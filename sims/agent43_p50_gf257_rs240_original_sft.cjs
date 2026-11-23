'use strict';

/**
 * Bounded original LP2 p49-51 GF(257) 256-symbol, 16-check codeword test.
 * Source: resources/liber-primus/lp2-grid-256.json.
 * Run read-only under Node.js 22 from the repository root.
 * This is a conditional test of two concrete RS-style arrangements,
 * not an authenticated manuscript code or an exhaustive ECC search.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 257;
const CHECKS = 16;
const LENGTH = 256;
const DEGREES = LENGTH - CHECKS;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number} a @param {number} exponent @returns {number} */
function power(a, exponent) {
  let result = 1;
  let base = mod(a);
  let n = exponent;
  while (n > 0) {
    if (n % 2 === 1) result = mod(result * base);
    base = mod(base * base);
    n = Math.floor(n / 2);
  }
  return result;
}

/**
 * High sixteen coefficients in unique degree <256 interpolation
 * through points x=0,1,...,255.
 * @param {number[]} values
 * @returns {number[]}
 */
function highNewton(values) {
  const coefficients = values.slice();
  for (let k = 1; k < LENGTH; k++) {
    const inverse = power(k, MOD - 2);
    for (let i = LENGTH - 1; i >= k; i--) {
      coefficients[i] = mod((coefficients[i] - coefficients[i - 1]) * inverse);
    }
  }
  return coefficients.slice(DEGREES);
}

/**
 * High sixteen coefficients in unique degree <256 interpolation
 * through x_j=3^j modulo257 (3 is primitive, order256).
 * 256-point Fourier interpolation: coefficient a_k = sum_j(y_j*x_j^-k).
 * Division by 256 = multiplication by 256 in GF257, i.e. -1.
 * We only require zero tests, so the nonzero overall factor can be dropped.
 * @param {number[]} values
 * @param {number[]} roots
 * @returns {number[]}
 */
function highRootDft(values, roots) {
  return Array.from({ length: CHECKS }, (_, h) => {
    const k = DEGREES + h;
    let sum = 0;
    for (let j = 0; j < LENGTH; j++) {
      sum = mod(sum + values[j] * roots[(LENGTH - ((k * j) % LENGTH)) % LENGTH]);
    }
    return sum;
  });
}

/**
 * Horner evaluation of polynomial coefficients.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {number}
 */
function evaluate(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = mod(value * x + coefficients[i]);
  }
  return value;
}

const sourcePath = path.resolve('resources/liber-primus/lp2-grid-256.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const original = source.bytes;
assert.equal(original.length, LENGTH);
assert.equal(source.pages.length, 3);
assert.deepEqual(source.pages.map((part) => part.rows), [10, 13, 9]);
assert(original.every((n) => Number.isInteger(n) && n >= 0 && n < 256));
assert.equal(power(3, 128), 256);
assert.equal(power(3, 256), 1);

const roots = Array.from({ length: LENGTH }, (_, index) => power(3, index));
assert.equal(new Set(roots).size, LENGTH);
const coefficients = Array.from({ length: DEGREES }, (_, index) => mod(17 * index * index + 35 * index + 4));
const controlLinear = Array.from({ length: LENGTH }, (_, index) => evaluate(coefficients, index));
const controlRoot = roots.map((root) => evaluate(coefficients, root));
const zero16 = Array(CHECKS).fill(0);
assert.deepEqual(highNewton(controlLinear), zero16);
assert.deepEqual(highRootDft(controlRoot, roots), zero16);

const column = Array.from({ length: LENGTH }, (_, index) =>
  original[(index % 32) * 8 + Math.floor(index / 32)]);
const variants = [
  ['printed row-major', original],
  ['printed column-major', column],
  ['reversed row-major', original.slice().reverse()],
  ['reversed column-major', column.slice().reverse()]
];
const expectedNewton = [
  [43,199,163,177,215,187,211,220,117,28,140,241,207,91,35,23],
  [147,82,222,158,81,80,20,239,187,138,195,220,156,7,147,105],
  [157,173,33,96,31,11,101,175,36,125,217,161,80,238,246,234],
  [12,59,144,15,18,252,214,92,106,133,232,68,17,245,194,152]
];
const expectedFourier = [
  [100,147,100,212,79,67,231,121,91,197,208,156,130,37,250,26],
  [180,243,34,100,209,106,184,240,83,17,221,154,155,68,101,226],
  [252,188,206,205,165,176,210,35,131,208,129,202,188,28,120,155],
  [19,230,132,89,78,5,221,136,89,55,50,170,129,147,111,208]
];

for (let i = 0; i < variants.length; i++) {
  const [label, values] = variants[i];
  assert.equal(values.length, LENGTH);
  const n = highNewton(values);
  const f = highRootDft(values, roots);
  assert.deepEqual(n, expectedNewton[i], label + ' Newton coefficients');
  assert.deepEqual(f, expectedFourier[i], label + ' Fourier coefficients');
  assert(n.every((value) => value !== 0));
  assert(f.every((value) => value !== 0));
  console.log(JSON.stringify({ label, gf257NewtHigh16: n, gf257RootHigh16: f }));
}

console.log('PASS: both positive controls have 16/16 zero checks; 8 original source contracts have 0/16; no RS(256,240) codeword or plaintext under these contracts.');
