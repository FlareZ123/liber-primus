'use strict';

/**
 * Exact original-source test of the p54 nine-rune polynomial and a conditional
 * five-state GP29 stream inverse. Read-only; Node.js 22, CommonJS.
 *
 * This tests a proposed operation. The polynomial relationship does not
 * authenticate the LFSR key, or claim recovered Liber Primus plaintext.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8',
));
const corpus = source('lp2-corpus.json');
const grid = source('lp2-grid-256.json');
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} coefficients Descending GF(29) coefficients. @param {number} x */
function evaluate(coefficients, x) {
  return coefficients.reduce((a, b) => mod29(a * x + b), 0);
}

/** @param {number[]} coefficients Descending coefficients, divisible by X-root. @param {number} root */
function divideByLinear(coefficients, root) {
  const quotient = [coefficients[0]];
  for (let i = 1; i < coefficients.length - 1; i++) {
    quotient.push(mod29(quotient.at(-1) * root + coefficients[i]));
  }
  assert.equal(mod29(quotient.at(-1) * root + coefficients.at(-1)), 0);
  return quotient;
}

/** @param {number} x Nonzero GF(29) element. */
function inverse29(x) {
  assert.notEqual(mod29(x), 0);
  for (let k = 1; k < 29; k++) if (mod29(x * k) === 1) return k;
  throw new Error('No inverse in GF29');
}

/** @param {number[]} seed @param {number[]} monic Descending monic polynomial. @param {number} length */
function recurrence(seed, monic, length) {
  const degree = monic.length - 1;
  assert.equal(seed.length, degree);
  assert.equal(monic[0], 1);
  const key = seed.slice();
  const asc = monic.slice().reverse();
  while (key.length < length) {
    const j = key.length - degree;
    let next = 0;
    for (let i = 0; i < degree; i++) next += asc[i] * key[j + i];
    key.push(mod29(-next));
  }
  return key;
}

/** @param {number[]} values */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    count[value]++;
  }
  return count.reduce((a, c) => a + c * (c - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} a @param {number[]} key @param {number} sign */
function transform(a, key, sign) {
  return a.map((c, i) => mod29(c + sign * key[i]));
}

assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(grid.bytes)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const page54 = corpus.pages[54].indices;
const page55 = corpus.pages[55].indices;
const page57 = corpus.pages[57].indices;
assert.deepEqual([page54.length, page55.length, page57.length], [232, 76, 95]);

const red = page54.slice(0, 9);
assert.deepEqual(red, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const after24 = divideByLinear(red, 24);
const after19 = divideByLinear(after24, 19);
const quintic = divideByLinear(after19, 19);
assert.deepEqual(quintic, [24, 28, 2, 5, 2, 11]);
assert.notEqual(evaluate(quintic, 19), 0);
assert.notEqual(evaluate(quintic, 24), 0);
assert.equal(evaluate(red, 24), 0);
assert.equal(evaluate(red, 19), 0);

const tablePolynomial = grid.bytes.map((x) => mod29(x)).slice(1);
assert.equal(mod29(grid.bytes[0]), 0);
const reducedTable = divideByLinear(
  divideByLinear(tablePolynomial, 24), 24);
assert.notEqual(evaluate(reducedTable, 24), 0);

const invLeading = inverse29(quintic[0]);
const monicQuintic = quintic.map((x) => mod29(x * invLeading));

assert.deepEqual(monicQuintic, [1, 6, 17, 28, 17, 21]);

// The quotient is a primitive degree-five polynomial over GF(29).
// Its root generates every nonzero element of GF(29^5).
const quotientAscending = monicQuintic.slice().reverse();
/** @param {number[]} left @param {number[]} right */
function fieldMultiply(left, right) {
  const product = Array(9).fill(0);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      product[i + j] = mod29(product[i + j] + left[i] * right[j]);
    }
  }
  for (let i = 8; i >= 5; i--) {
    for (let j = 0; j < 5; j++) {
      product[i - 5 + j] = mod29(
        product[i - 5 + j] - product[i] * quotientAscending[j]);
    }
  }
  return product.slice(0, 5);
}
/** @param {number[]} base @param {number} exponent */
function fieldPower(base, exponent) {
  let result = [1, 0, 0, 0, 0];
  let current = base.slice();
  while (exponent > 0) {
    if (exponent % 2 === 1) result = fieldMultiply(result, current);
    current = fieldMultiply(current, current);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}
/** @param {number[]} values */
function stripZeros(values) {
  const result = values.slice();
  while (result.length > 0 && result.at(-1) === 0) result.pop();
  return result;
}
/** @param {number[]} a @param {number[]} b */
function remainder(a, b) {
  let result = stripZeros(a);
  const divisor = stripZeros(b);
  assert(divisor.length > 0);
  while (result.length >= divisor.length) {
    const factor = mod29(result.at(-1) * inverse29(divisor.at(-1)));
    const offset = result.length - divisor.length;
    for (let i = 0; i < divisor.length; i++) {
      result[offset + i] = mod29(result[offset + i] - factor * divisor[i]);
    }
    result = stripZeros(result);
  }
  return result;
}
/** @param {number[]} a @param {number[]} b */
function polynomialGcd(a, b) {
  let left = stripZeros(a);
  let right = stripZeros(b);
  while (right.length > 0) {
    const next = remainder(left, right);
    left = right;
    right = next;
  }
  return left.map((v) => mod29(v * inverse29(left.at(-1))));
}
const fieldX = [0, 1, 0, 0, 0];
const x29 = fieldPower(fieldX, 29);
const x29minusX = x29.map((v, i) => mod29(v - fieldX[i]));
const groupOrder = 29 ** 5 - 1;
assert.equal(groupOrder, 20511148);
assert.deepEqual(fieldPower(fieldX, 29 ** 5), fieldX);
assert.deepEqual(polynomialGcd(quotientAscending, x29minusX), [1]);
assert.deepEqual(fieldPower(fieldX, groupOrder), [1, 0, 0, 0, 0]);
const properPowers = [
  [2, [28, 0, 0, 0, 0]],
  [7, [7, 0, 0, 0, 0]],
  [732541, [16, 1, 28, 14, 28]],
];
for (const [primeFactor, witness] of properPowers) {
  assert.deepEqual(fieldPower(fieldX, groupOrder / primeFactor), witness);
  assert.notEqual(witness.join(','), '1,0,0,0,0');
}

const body = [...page54.slice(9), ...page55];
assert.equal(body.length, 299);
const seed = red.slice(0, 5);
const key = recurrence(seed, monicQuintic, body.length);
const nativePlant = Array.from({length: body.length},
  (_, i) => page57[i % page57.length]);
for (const sign of [-1, 1]) {
  const proposed = transform(body, key, sign);
  assert.deepEqual(transform(proposed, key, -sign), body);
  const plantedCiphertext = transform(nativePlant, key, -sign);
  assert.deepEqual(transform(plantedCiphertext, key, sign), nativePlant);
  console.log(JSON.stringify({
    sign,
    bodyIoC: ioc(proposed),
    p55IoC: ioc(proposed.slice(-76)),
    first90: proposed.slice(0, 90)
      .map((i) => corpus.translit[i]).join(' '),
    originalReencrypted: body.length,
    nativePlantRecovered: nativePlant.length,
  }));
}
console.log('p54 red9 factorization: (X-24)(X-19)^2 times quintic, exact');
console.log('p50 polynomial: double root X=24, exact; no unknown plaintext');
