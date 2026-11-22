'use strict';

/**
 * Original-artifact 16-stage GF(29) recurrence gate on physical LP2 p39.
 * Run with Node.js 22: this standalone test reads repository resources.
 * The tested recurrence is a conditional hypothesis, not Cicada-authenticated.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const bytes = load('resources/liber-primus/base60-grid.json').byte_rows.flat();
const p39 = corpus.pages.find((page) => page.page === 39).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const mod = (x) => (x % 29 + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  let n = 0;
  for (let candidate = 2; ; candidate++) {
    let prime = true;
    for (let k = 2; k * k <= candidate; k++) {
      if (candidate % k === 0) { prime = false; break; }
    }
    if (prime && ++n === ordinal) return candidate;
  }
}

/**
 * State sequence obeys x^(16)+a1*x^15+...+a16 = 0 in GF(29).
 * @param {number[]} seed
 * @param {number[]} polynomial monic, descending coefficients
 * @param {number} length
 * @returns {number[]}
 */
function extend(seed, polynomial, length) {
  assert.equal(seed.length, 16);
  assert.equal(polynomial.length, 17);
  assert.equal(polynomial[0], 1);
  const stream = seed.slice();
  for (let i = 16; i < length; i++) {
    let next = 0;
    for (let j = 1; j <= 16; j++) {
      next = mod(next - polynomial[j] * stream[i - j]);
    }
    stream.push(next);
  }
  return stream;
}

assert.equal(bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(p39.length, 240);
assert.deepEqual(p39.slice(119, 122), [27, 5, 15]);
assert.equal(p57.length, 95);

// Printed p15 array, preserving original four-by-four layout and red 3299.
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const spiralPositions = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const fib = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const signedSpiral = fib.map((v) => 3301 - nthPrime(v + 1));
const spiral = signedSpiral.map(Math.abs);
assert.deepEqual(spiralPositions.map((i) => printed.flat()[i]), spiral);
assert.deepEqual(spiral.slice(0, 4), [3299, 3298, 3296, 3294]);
assert.deepEqual(signedSpiral.slice(-2), [-1206, -4516]);

// Four mathematically fixed factors of the original grid polynomial.
const factors = [
  [25, 10, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const f16Ascending = factors.reduce(multiply, [1]);
const f16 = f16Ascending.slice().reverse();
const remainder = bytes.map(mod);
const quotient = [];
for (let i = 0; i < 240; i++) {
  const q = remainder[i];
  quotient.push(q);
  for (let j = 0; j < f16.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - q * f16[j]);
  }
}
assert.ok(remainder.every((v) => v === 0));
assert.deepEqual(quotient.slice(0, 12),
  [0, 28, 18, 14, 3, 2, 14, 21, 7, 27, 23, 2]);
assert.equal(f16.length, 17);

const signedRows = printed.flat();
signedRows[12] = -signedRows[12];
signedRows[13] = -signedRows[13];

const seeds = [
  ['printed-rows', false, printed.flat()],
  ['printed-rows', true, signedRows],
  ['original-spiral', false, spiral],
  ['original-spiral', true, signedSpiral]
];

const plant = Array.from({ length: 240 }, (_, i) => p57[i % p57.length]);
const tested = [];
for (const [order, restoredSigns, source] of seeds) {
  const stream = extend(source.map(mod), f16, p39.length);
  assert.deepEqual(stream.slice(0, 16), source.map(mod));
  for (const sign of [-1, 1]) {
    const decoded = p39.map((v, i) => mod(v + sign * stream[i]));
    const plantedCipher = plant.map((v, i) => mod(v - sign * stream[i]));
    assert.deepEqual(plantedCipher.map((v, i) => mod(v + sign * stream[i])), plant);
    tested.push({
      order, restoredSigns, sign,
      ioc: ioc(decoded),
      prefix: decoded.slice(0, 24).map((v) => corpus.translit[v]).join(' ')
    });
  }
}

assert.equal(tested.length, 8);
assert.deepEqual(tested.map((x) => Number(x.ioc.toFixed(9))), [
  0.033437936, 0.034065551, 0.034309623, 0.034449093,
  0.032845188, 0.032391911, 0.034832636, 0.035146444
]);
assert.ok(tested.every((x) => x.ioc < 0.04));
assert.ok(ioc(plant) > 0.05);

console.log(JSON.stringify({
  source: 'original p15 printed spiral + p39 original 240 runes + full original p50 byte grid',
  proposedMechanism: 'p15-seeded GF29 degree-16 LFSR with p50 factor16 taps',
  exactGridFactorization: true,
  sourceFullLength: 240,
  originalCipherIoc: ioc(p39),
  nativeRepeatedP57ControlIoc: ioc(plant),
  tested,
  syntheticRecoveries: '8/8 original-length 240/240',
  recoveredUnknownPlaintext: false,
  status: 'PASS: bounded source-seeded 16-stage decoder rejected'
}, null, 2));
