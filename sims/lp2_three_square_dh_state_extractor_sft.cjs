'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;

/**
 * Return canonical most-significant-first digits.
 * @param {number} n
 * @param {number} base
 * @returns {number[]}
 */
function digits(n, base) {
  assert(Number.isInteger(n) && n >= 0);
  assert(Number.isInteger(base) && base >= 2);
  if (n === 0) return [0];
  const out = [];
  let x = n;
  while (x > 0) {
    out.push(x % base);
    x = Math.floor(x / base);
  }
  return out.reverse();
}

/**
 * Positive modular reduction.
 * @param {number} n
 * @param {number} m
 * @returns {number}
 */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 * Integer modular exponentiation.
 * @param {number} base
 * @param {number} exp
 * @param {number} modulus
 * @returns {number}
 */
function powMod(base, exp, modulus) {
  let result = 1;
  let b = mod(base, modulus);
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/**
 * @param {number} n
 * @returns {boolean}
 */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/**
 * Parse the three blank-line-separated square matrices.
 * @param {string} text
 * @returns {number[][][]}
 */
function parseSquares(text) {
  return text.trim().split(/\r?\n\s*\r?\n/).map((block) =>
    block.split(/\r?\n/).map((line) =>
      line.trim().split(/\s+/).map(Number)
    )
  );
}

/**
 * Validate square geometry and return its common magic sum.
 * @param {number[][]} square
 * @returns {number}
 */
function magicSum(square) {
  const n = square.length;
  assert(n > 0);
  assert(square.every((row) => row.length === n));

  const target = square[0].reduce((a, b) => a + b, 0);
  for (const row of square) {
    assert.equal(row.reduce((a, b) => a + b, 0), target);
  }
  for (let c = 0; c < n; c += 1) {
    let total = 0;
    for (let r = 0; r < n; r += 1) total += square[r][c];
    assert.equal(total, target);
  }

  let d1 = 0;
  let d2 = 0;
  for (let i = 0; i < n; i += 1) {
    d1 += square[i][i];
    d2 += square[i][n - 1 - i];
  }
  assert.equal(d1, target);
  assert.equal(d2, target);
  return target;
}

/**
 * @param {number[][]} square
 * @returns {number}
 */
function center(square) {
  assert.equal(square.length % 2, 1);
  const m = Math.floor(square.length / 2);
  return square[m][m];
}

const sourcePath = path.join(
  __dirname,
  '..',
  'resources',
  'cicada2014-openpuff-magic-squares.txt'
);
const squares = parseSquares(fs.readFileSync(sourcePath, 'utf8'));
assert.equal(squares.length, 3);

const meta = squares.map((square, sourceIndex) => ({
  sourceIndex,
  square,
  order: square.length,
  sum: magicSum(square),
  center: center(square),
}));

assert.deepEqual(
  meta.map(({ order, sum, center: c }) => [order, sum, c]),
  [
    [5, 3301, 809],
    [7, 1033, 331],
    [5, 1033, 91],
  ]
);

const same1033 = meta.filter((x) => x.sum === 1033).sort((a, b) => a.order - b.order);
assert.equal(same1033.length, 2);
const small = same1033[0];
const large = same1033[1];

const g = small.order;
const K = large.order - small.order;

const smallCenterDigits = digits(small.center, MOD);
const largeCenterDigits = digits(large.center, MOD);
assert.equal(smallCenterDigits.length, 2);
assert.equal(largeCenterDigits.length, 2);

const [e, q] = smallCenterDigits;
const centerDelta = [
  largeCenterDigits[0] - smallCenterDigits[0],
  largeCenterDigits[1] - smallCenterDigits[1],
];
assert.equal(centerDelta[0], centerDelta[1]);
const A = centerDelta[0];

const sum1033Digits = digits(1033, MOD);
assert.equal(sum1033Digits.length, 3);
const unit = sum1033Digits[0];
const a = sum1033Digits[1];
const aMinusB = sum1033Digits[2];
const B = mod(A - aMinusB, MOD);

assert.equal(unit, q - e);
assert.equal(unit, e - K);

const p = large.square[e - 1][a - 1];
const b = large.square[e - 1][g + K - 1];

assert.equal(large.square[g - 1][unit - 1], b);
assert.equal(large.square[g - 1][K - 1], p);

const state = { p, g, a, b, A, B, K, e, q };
assert.deepEqual(state, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

assert(isPrime(p));
assert.equal(q, e + 1);
assert.equal(powMod(g, a, p), A);
assert.equal(powMod(g, b, p), B);
assert.equal(powMod(A, b, p), K);
assert.equal(powMod(B, a, p), K);
assert.equal((b * e) % (p - 1), 1);

const first = meta[0];
assert.equal(first.order, g);
assert.deepEqual(digits(first.center, MOD), [mod(-K, MOD), mod(-e, MOD)]);
assert.deepEqual(digits(first.sum, MOD), [e, mod(-e, MOD), mod(-g, MOD)]);
assert.deepEqual(sum1033Digits, [q - e, a, mod(A - B, MOD)]);

const axis = [q - e, K, e, q, g, a, g + K];
assert.deepEqual(axis, [1, 2, 3, 4, 5, 6, 7]);

console.log('Authenticated square metadata:');
for (const item of meta) {
  console.log(
    `  source#${item.sourceIndex + 1}: ${item.order}x${item.order}, sum=${item.sum}, center=${item.center}, center29=[${digits(item.center, MOD)}]`
  );
}
console.log('Derived 7x7 axis:', axis.join(','));
console.log('State-addressed p,b pair:', p, b, 'with rotated reverse', b, p);
console.log('Recovered DH state:', JSON.stringify(state));
console.log('sum1033 BASE29:', JSON.stringify(sum1033Digits));
console.log('sum3301 BASE29:', JSON.stringify(digits(3301, MOD)));
console.log('PASS');
