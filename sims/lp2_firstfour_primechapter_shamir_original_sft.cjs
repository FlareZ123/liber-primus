'use strict';

/**
 * Original-source 3/5/7/11-prime chapter Shamir zero-share gate.
 * Node.js 22, CommonJS, read-only, no installed packages.
 * SFT: node sims/lp2_firstfour_primechapter_shamir_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const mod = (x) => (x % 29 + 29) % 29;

/** @param {number} n @param {number} k */
function binomial(n, k) {
  let x = 1;
  for (let j = 1; j <= k; j++) x = x * (n - j + 1) / j;
  assert(Number.isSafeInteger(x));
  return x;
}

/** Lagrange coefficients for f(0) on x=1,2,...,n over GF29. */
function zeroWeights(n) {
  return Array.from({length: n}, (_, j) =>
    mod((j % 2 ? -1 : 1) * binomial(n, j + 1))
  );
}

function inverse(x) {
  const result = Array.from({length: 29}, (_, i) => i)
    .find((j) => mod(j * x) === 1);
  assert(result !== undefined);
  return result;
}

/** @param {number[]} shares */
function interpolateAt(shares, at) {
  let acc = 0;
  for (let j = 0; j < shares.length; j++) {
    let coeff = 1;
    for (let k = 0; k < shares.length; k++) {
      if (j === k) continue;
      coeff = mod(coeff * mod(at - k - 1) * inverse(mod(j - k)));
    }
    acc = mod(acc + shares[j] * coeff);
  }
  return acc;
}

/** @param {number[]} x */
function ioc(x) {
  const freq = Array(29).fill(0);
  for (const value of x) freq[value]++;
  return freq.reduce((sum, v) => sum + v * (v - 1), 0) / (x.length * (x.length - 1));
}

/** @param {number[]} polynomial @param {number} x */
function evalPoly(polynomial, x) {
  return polynomial.reduceRight((acc, v) => mod(acc * x + v), 0);
}

const groups = [
  {start: 0, end: 2, n: 3, expected: 729},
  {start: 3, end: 7, n: 5, expected: 1145},
  {start: 8, end: 14, n: 7, expected: 1729},
  {start: 15, end: 22, n: 11, expected: 1903}
];

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
let tests = 0;
let state = 0x33012014;
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

for (const group of groups) {
  const original = corpus.pages.slice(group.start, group.end + 1)
    .flatMap((page) => page.indices);
  const {n} = group;
  assert.equal(original.length, group.expected);
  const m = original.length / n;
  assert.equal(Number.isSafeInteger(m), true);
  const weights = zeroWeights(n);

  for (const layout of ['packets', 'strips']) {
    const recovered = [];
    let quadraticFits = 0;
    for (let t = 0; t < m; t++) {
      const shares = Array.from({length: n}, (_, j) =>
        original[layout === 'packets' ? n * t + j : j * m + t]
      );
      const zero = shares.reduce((acc, v, j) => mod(acc + weights[j] * v), 0);
      assert.equal(interpolateAt(shares, 0), zero);
      for (let j = 0; j < n; j++) {
        assert.equal(interpolateAt(shares, j + 1), shares[j]);
      }
      recovered.push(zero);
      if (shares.every((v, j) => interpolateAt(shares.slice(0, 3), j + 1) === v)) {
        quadraticFits++;
      }

      const plaintext = solved[t % solved.length];
      const polynomial = [plaintext, ...Array.from({length: n - 1}, () => next() % 29)];
      const plantedShares = Array.from({length: n}, (_, j) => evalPoly(polynomial, j + 1));
      const plantedZero = plantedShares.reduce((acc, v, j) => mod(acc + weights[j] * v), 0);
      assert.equal(plantedZero, plaintext, 'Independent native GP29 planted recovery');
    }
    const score = ioc(recovered);
    const expectedQuadratic = m / Math.pow(29, n - 3);
    assert(score < 0.04, 'Unexpectedly native-looking original zero-share stream');
    console.log('p' + group.start + '-' + group.end,
      'shares=' + n, 'secretLength=' + m, 'layout=' + layout,
      'zeroSecretIoC=' + score.toFixed(9),
      'quadraticFits=' + quadraticFits + '/' + m,
      'iidQuadraticExpected=' + expectedQuadratic.toPrecision(4),
      'prefix=' + recovered.slice(0, 20).map((v) => corpus.translit[v]).join(' '));
    tests++;
  }
}
assert.equal(tests, 8);
console.log('PASS eight full original Shamir reconstructions and native-GP planted recovery');
