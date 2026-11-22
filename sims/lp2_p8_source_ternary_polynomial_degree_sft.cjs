'use strict';

/**
 * LP2 p8 243-symbol / p7 five-red-word polynomial degree certificate.
 * Execute on Windows Node.js 22:
 *   node sims/lp2_p8_source_ternary_polynomial_degree_sft.cjs
 *
 * Pure read-only original-source test. Any genuinely low-total-degree
 * GF(29) polynomial evaluated on the five fixed three-point axes must
 * have zero coefficient on x1^2*x2^2*x3^2*x4^2*x5^2.
 * This SFT certifies that the original coefficient is nonzero, and
 * demonstrates an independently encoded low-degree positive control.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const json = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const red7 = ink.pages.find(p => p.page === 7).red_spans[0];
const red8 = ink.pages.find(p => p.page === 8).red_spans[0];

assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.deepEqual([red7.start, red7.length], [194, 14]);
assert.deepEqual([red8.start, red8.length], [0, 12]);

const FIELD = 29;
/** @param {number} n */
const mod = n => ((n % FIELD) + FIELD) % FIELD;
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let v = 1; v < FIELD; v++) if (mod(a * v) === 1) return v;
  throw new Error('Non-invertible field element ' + a);
}
/** @param {number} b @param {number} exponent */
function power(b, exponent) {
  let v = 1;
  for (let k = 0; k < exponent; k++) v = mod(v * b);
  return v;
}
const lengths = [2, 4, 3, 2, 3];
let offset = red7.start;
const operands = lengths.map(len => {
  const word = p7.slice(offset, offset + len);
  offset += len;
  return word.reduce((v, x) => mod(v * x), 1);
});
assert.equal(offset, red7.start + red7.length);
assert.deepEqual(operands, [11, 26, 8, 15, 2]);
assert.deepEqual(p8.slice(0, 4), [14, 10, 14, 19]);
const body = p8.slice(red8.length);
assert.equal(body.length, 243);

/**
 * Construct the 3x3 evaluation matrix for a degree<=2 polynomial.
 * Sample order is the original printed ternary order.
 * @param {number[]} points
 * @returns {number[][]}
 */
function vandermonde(points) {
  assert.equal(points.length, 3);
  assert.equal(new Set(points).size, 3);
  return points.map(x => [1, x, mod(x * x)]);
}
/**
 * Exact Gauss-Jordan inverse over GF29.
 * @param {number[][]} input
 * @returns {number[][]}
 */
function inverse3(input) {
  const a = input.map((row, i) => [
    ...row, ...Array.from({length: 3}, (_, j) => Number(i === j))
  ]);
  for (let i = 0; i < 3; i++) {
    let pivot = i;
    while (pivot < 3 && mod(a[pivot][i]) === 0) pivot++;
    assert.ok(pivot < 3);
    [a[i], a[pivot]] = [a[pivot], a[i]];
    const q = inverse(mod(a[i][i]));
    a[i] = a[i].map(x => mod(x * q));
    for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      const f = a[j][i];
      a[j] = a[j].map((x, k) => mod(x - f * a[i][k]));
    }
  }
  return a.map(row => row.slice(3));
}
/**
 * Apply exactly one separable 3-point linear operation to each of five axes.
 * Digit0 is the fastest-changing axis, matching source reading order.
 * @param {number[]} input
 * @param {number[][][]} matrices
 * @returns {number[]}
 */
function tensor(input, matrices) {
  assert.equal(input.length, 243);
  assert.equal(matrices.length, 5);
  const values = input.slice();
  for (let axis = 0; axis < 5; axis++) {
    const stride = 3 ** axis;
    const block = 3 * stride;
    const T = matrices[axis];
    for (let start = 0; start < 243; start += block) {
      for (let k = 0; k < stride; k++) {
        const indexes = [start + k, start + k + stride, start + k + 2 * stride];
        const original = indexes.map(i => values[i]);
        for (let row = 0; row < 3; row++) {
          values[indexes[row]] = mod(T[row][0] * original[0]
            + T[row][1] * original[1] + T[row][2] * original[2]);
        }
      }
    }
  }
  return values;
}
/** @param {number} i */
function degree(i) {
  let total = 0;
  for (let k = 0; k < 5; k++) {
    total += i % 3;
    i = Math.floor(i / 3);
  }
  return total;
}
const natural = Array.from({length: 5}, () => [0, 1, 2]);
const orbit = operands.map(r => [r, power(r, 3), power(r, 9)]);
const cases = [
  {name: 'canonical-0-1-2', knots: natural, expected: [16, 16, 8]},
  {name: 'p7-word-cubing-orbit', knots: orbit, expected: [10, 8, 3]}
];
const results = [];
for (const item of cases) {
  const forward = item.knots.map(vandermonde);
  const backward = forward.map(inverse3);
  const coefficients = tensor(body, backward);
  assert.deepEqual(tensor(coefficients, forward), body);

  const highest = coefficients[242];
  const zeroTotal = coefficients.filter(x => x === 0).length;
  const zeroDegree6to10 = coefficients.filter((x, i) => degree(i) >= 6 && x === 0).length;
  const highPositions = coefficients.filter((_, i) => degree(i) >= 6).length;
  assert.equal(highPositions, 96);
  assert.deepEqual([highest, zeroTotal, zeroDegree6to10], item.expected);
  assert.notEqual(highest, 0, 'Top-degree certificate must be nonzero');

  const lowDegreePlant = Array.from({length: 243}, (_, i) =>
    degree(i) <= 4 ? mod(17 * (i + 1) + 3) : 0);
  const encryptedPlant = tensor(lowDegreePlant, forward);
  const recoveredPlant = tensor(encryptedPlant, backward);
  assert.deepEqual(recoveredPlant, lowDegreePlant);
  assert.equal(recoveredPlant[242], 0);
  assert.equal(recoveredPlant.filter((x, i) => degree(i) >= 6 && x !== 0).length, 0);

  results.push({
    basis: item.name,
    evaluationPoints: item.knots,
    originalHighestDegreeCoefficient: highest,
    originalTotalZeroCoefficients: zeroTotal,
    originalZeroCoefficientsAmong96Degree6to10: zeroDegree6to10,
    originalNonzeroCoefficientsAmong96Degree6to10: 96 - zeroDegree6to10,
    originalRoundtrip: '243/243',
    lowDegreePositiveControl: '243/243'
  });
}
console.log(JSON.stringify({
  scope: 'Exact LP2 p8 black 243 GP29 indices under two fixed GF29 tensor bases',
  sourceP7RedWordProducts: operands,
  originalBodyLength: body.length,
  maximumTotalDegree: 10,
  result: 'Both source-fixed representations have nonzero maximum-degree coefficient; neither is a lower-total-degree polynomial table',
  noPlaintextRecovered: true,
  models: results
}, null, 2));
