'use strict';

/**
 * Fixed original-cipher test of the source-paired 2x2 Hill matrix.
 * Historical HTML gives title 133, id 331. Original p0 first red words have
 * GP-prime sums 347 and 315. Row-major source pairing gives matrix:
 *   [[347,315],[133,331]] mod 29 = [[28,25],[17,12]],
 * with determinant 27 and inverse [[23,27],[23,15]] mod 29.
 *
 * No free parameters, file writes, external packages or network operations.
 * This deliberately tests the literal 2x2 receiver, not arbitrary Hill keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number[]} input even-length authentic GP29 index tape
 * @param {number[][]} matrix invertible 2x2 GP29 matrix
 * @returns {number[]}
 */
function hill(input, matrix) {
  assert.equal(input.length % 2, 0);
  const output = [];
  for (let i = 0; i < input.length; i += 2) {
    const a = input[i];
    const b = input[i + 1];
    output.push(
      mod29(matrix[0][0] * a + matrix[0][1] * b),
      mod29(matrix[1][0] * a + matrix[1][1] * b)
    );
  }
  return output;
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const symbol of input) counts[symbol] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (input.length * (input.length - 1));
}

const red = source.pages[0].indices.slice(0, 13);
const sum = (xs) => xs.reduce((total, index) => total + source.prime[index], 0);
assert.equal(sum(red.slice(0, 8)), 347);
assert.equal(sum(red.slice(8)), 315);
const m = [[347, 315], [133, 331]].map((row) => row.map(mod29));
const mi = [[23, 27], [23, 15]];
assert.deepEqual(m, [[28, 25], [17, 12]]);
for (let r = 0; r < 2; r += 1) {
  for (let c = 0; c < 2; c += 1) {
    assert.equal(mod29(m[r][0] * mi[0][c] + m[r][1] * mi[1][c]),
      Number(r === c));
  }
}

const cases = [
  ['p0-p2', source.pages.slice(0, 3).flatMap((p) => p.indices).slice(13),
    0.03430870805172481, 0.03466812517091847],
  ['p40-p53', source.pages.slice(40, 54).flatMap((p) => p.indices).slice(8),
    0.034472379682116264, 0.0347404690452373],
  ['p55', source.pages[55].indices,
    0.04035087719298246, 0.039649122807017545]
];

for (const [label, original, expectedInverseIoC, expectedForwardIoC] of cases) {
  const decoded = hill(original, mi);
  const forwardDirection = hill(original, m);
  assert.deepEqual(hill(decoded, m), original);
  assert.deepEqual(hill(forwardDirection, mi), original);
  assert(Math.abs(ioc(decoded) - expectedInverseIoC) < 1e-12);
  assert(Math.abs(ioc(forwardDirection) - expectedForwardIoC) < 1e-12);
  console.log(JSON.stringify({
    region: label,
    originalRunes: original.length,
    originalIoC: ioc(original),
    inverseIoC: ioc(decoded),
    forwardIoC: ioc(forwardDirection),
    exactOriginalReencryption: true,
    first40Decoded: decoded.slice(0, 40).map((n) => source.translit[n]).join('')
  }));
}

const clearControl = source.pages[57].indices.slice(0, 94);
assert.deepEqual(hill(hill(clearControl, m), mi), clearControl);
assert.deepEqual(hill(hill(clearControl, mi), m), clearControl);
console.log(JSON.stringify({
  solvedGP29Positive: 'Original clear p57, 94 symbols',
  count: clearControl.length,
  fullRoundtrip: true,
  sourceNativeIoC: ioc(clearControl)
}));
console.log('PASS: fixed source-paired Hill2 inverse remains nonprose on original LP2.');
