'use strict';

/**
 * Original-source, read-only, Node.js 22 SFT for Director #2323.
 * Run from the repository root: node sims/lp2_p7_projector_prime_sum_rival_sft.cjs
 * All numbers are recomputed from the unchanged LP2 corpus and genuine 2014
 * Stage10 square. This is an operator-selection and negative-key test.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const sourceText = fs.readFileSync(
  path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8'
);
const mod = n => ((n % 29) + 29) % 29;
const group = sourceText.trim().split(/\r?\n\s*\r?\n/)[0];
const A = group.split(/\r?\n/).map(line => line.trim().split(/\s+/).map(n => mod(Number(n))));
assert.equal(A.length, 5);
assert.ok(A.every(row => row.length === 5));

/** Matrix product over the actual 29-rune field. */
function mul(a, b) {
  return a.map(row => b[0].map((_, col) =>
    mod(row.reduce((sum, value, k) => sum + value * b[k][col], 0))
  ));
}

/** Scalar and identity-affine matrix over GF(29). */
function shiftScale(matrix, diagonal, factor = 1) {
  return matrix.map((row, i) => row.map((value, j) =>
    mod(factor * (value + (i === j ? diagonal : 0)))
  ));
}
const I = Array.from({length: 5}, (_, i) =>
  Array.from({length: 5}, (_, j) => Number(i === j)));
const A2 = mul(A, A);
const Pi = shiftScale(mul(shiftScale(A2, -25), shiftScale(A2, -9)), 0, 20);
const expectedPi = [
  [9, 23, 23, 23, 9],
  [23, 9, 23, 9, 23],
  [23, 23, 24, 23, 23],
  [23, 9, 23, 9, 23],
  [9, 23, 23, 23, 9]
];
assert.deepEqual(Pi, expectedPi);
assert.deepEqual(mul(Pi, Pi), Pi);
const project = input => mul(Pi, input.map(n => [mod(n)])).map(row => row[0]);

const primeWeights = [];
for (let n = 2; primeWeights.length < 29; n++) {
  if (primeWeights.every(p => n % p !== 0)) primeWeights.push(n);
}
assert.deepEqual(primeWeights.slice(0, 5), [2, 3, 5, 7, 11]);
assert.equal(primeWeights.at(-1), 109);
const page = n => corpus.pages.find(p => p.page === n).indices;
assert.equal(corpus.pages.filter(p => p.page <= 55).reduce((sum, p) =>
  sum + p.indices.length, 0), 12956);
assert.equal(page(7).length, 208);

const red = page(7).slice(194, 208);
const lengths = [2, 4, 3, 2, 3];
let cursor = 0;
const words = lengths.map(len => {
  const w = red.slice(cursor, cursor + len);
  cursor += len;
  return w;
});
assert.equal(cursor, 14);
assert.deepEqual(words, [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]]);
const zeroProduct = words.map(w => w.reduce((v, x) => mod(v * x), 1));
const zeroSum = words.map(w => mod(w.reduce((v, x) => v + x, 0)));
const primeSum = words.map(w => mod(w.reduce((v, x) => v + primeWeights[x], 0)));
const primeProduct = words.map(w => w.reduce((v, x) => mod(v * primeWeights[x]), 1));
assert.deepEqual(zeroProduct, [11, 26, 8, 15, 2]);
assert.deepEqual(zeroSum, [26, 7, 23, 13, 24]);
assert.deepEqual(primeSum, [9, 16, 11, 11, 23]);
assert.deepEqual(primeProduct, [14, 10, 4, 19, 19]);

const rivals = [
  ['zero-based GP index products, investigator-selected', zeroProduct, [26, 11, 13, 11, 26]],
  ['zero-based GP index sums', zeroSum, [18, 3, 16, 3, 18]],
  ['historical LP1 prime-weight sums', primeSum, [2, 14, 26, 14, 2]],
  ['GP prime-weight products', primeProduct, [12, 10, 14, 10, 12]]
];
for (const [name, input, expected] of rivals) {
  const output = project(input);
  assert.deepEqual(output, expected, name);
  assert.equal(output[0], output[4]);
  assert.equal(output[1], output[3]);
  assert.equal(output[2], mod(-2 * (output[0] + output[1])));
  assert.equal(output[2], mod(input[2] - 6 * input.reduce((s, v) => s + v, 0)));
  console.log(name + ': [' + input.join(',') + '] => [' + output.join(',') + ']');
}
const productProjection = project(zeroProduct);
assert.deepEqual(productProjection, [zeroProduct[1], zeroProduct[0],
  mod(-2 * (zeroProduct[0] + zeroProduct[1])), zeroProduct[0], zeroProduct[1]]);
assert.equal(mod(zeroProduct[0] + zeroProduct[1]), 8);

// Conditional, unselected extra factor 1/2 of the authentic LP1 prime-sum
// representation yields a one-based palindrome of square-diagonal cell IDs.
const halfPrimeProjection = project(primeSum).map(n => mod(15 * n));
assert.deepEqual(halfPrimeProjection, [1, 7, 13, 7, 1]);
const rowMajor = A.flat();
const addressed = halfPrimeProjection.map(n => rowMajor[n - 1]);
assert.deepEqual(addressed, [mod(434), mod(812), mod(809), mod(812), mod(434)]);
assert.deepEqual(addressed, [28, 0, 26, 0, 28]);

const native = page(57);
assert.equal(native.length, 95);
const p8 = page(8);
assert.equal(p8.length, 255);
const dotHoldout = page(23).slice(16).concat(...[24, 25, 26].map(page));
assert.equal(dotHoldout.length, 1005);
const controls = [
  {name: 'p8 complete immediate recipient', input: p8,
    expected: [0.03427512737378416, 0.03356492203180485, 0.03421337038752509]},
  {name: 'p23-p26 black five-dot holdout', input: dotHoldout,
    expected: [0.03430457275376107, 0.03438187548314206, 0.034562248518364355]}
];
const ioc = xs => {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (xs.length * (xs.length - 1));
};
const transform = (xs, key, sign) => xs.map((x, i) => mod(x + sign * key[i % key.length]));
for (const {name, input, expected} of controls) {
  const scores = [ioc(input), ioc(transform(input, addressed, -1)), ioc(transform(input, addressed, 1))];
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(scores[i] - expected[i]) < 1e-12, name);
  for (const sign of [-1, +1]) {
    const decoded = transform(input, addressed, sign);
    assert.deepEqual(transform(decoded, addressed, -sign), input);
    const nativePlant = Array.from({length: input.length}, (_, i) => native[i % native.length]);
    const encryptedPlant = transform(nativePlant, addressed, -sign);
    assert.deepEqual(transform(encryptedPlant, addressed, sign), nativePlant);
  }
  console.log(name + ': ' + input.length + ' original runes; IoC raw, subtract, add = ' +
    scores.map(v => v.toFixed(12)).join(' / '));
}
console.log('PASS: original red operands, primary historical prime-sum rival, both source-complete receivers, native plaintext plants.');
