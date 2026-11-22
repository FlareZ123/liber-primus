'use strict';

/**
 * Original-source test for GP29 Dirichlet divisor inversion motivated by
 * the historical Cicada "MOBIUS" text and the book's prime/totient clues.
 * Scope: no secret key, exact one-based rune positions, book/page reset,
 * optionally invert the adjacent-difference chain before divisor inversion.
 * Run from the repo: node sims/lp2_mobius_dirichlet_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

/** @param {number} x */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} input */
function zeta(input) {
  const n = input.length;
  const output = [0, ...input];
  for (let d = 1; d <= n; d++) {
    for (let multiple = 2 * d; multiple <= n; multiple += d) {
      output[multiple] = mod(output[multiple] + input[d - 1]);
    }
  }
  return output.slice(1);
}

/** @param {number[]} input */
function mobius(input) {
  const n = input.length;
  const output = [0, ...input];
  for (let d = 1; d <= n; d++) {
    for (let multiple = 2 * d; multiple <= n; multiple += d) {
      output[multiple] = mod(output[multiple] - output[d]);
    }
  }
  return output.slice(1);
}

/** @param {number[]} sequence */
function differences(sequence) {
  return sequence.map((x, i) => mod(x - (i ? sequence[i - 1] : 0)));
}

/** @param {number[]} steps */
function accumulate(steps) {
  let previous = 0;
  return steps.map((step) => {
    previous = mod(previous + step);
    return previous;
  });
}

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

/** @param {number} count */
function primes(count) {
  const output = [];
  for (let candidate = 2; output.length < count; candidate++) {
    if (output.every((p) => candidate % p !== 0)) output.push(candidate);
  }
  return output;
}

/** @param {number[]} input @param {boolean} useChain @param {boolean} useMobius */
function solve(input, useChain, useMobius) {
  const staged = useChain ? differences(input) : input;
  return (useMobius ? mobius : zeta)(staged);
}

/** @param {number[]} plain @param {boolean} useChain @param {boolean} useMobius */
function plant(plain, useChain, useMobius) {
  const encoded = (useMobius ? zeta : mobius)(plain);
  return useChain ? accumulate(encoded) : encoded;
}

function main() {
  const pages = corpus.pages.filter((p) => p.page < 56);
  assert.equal(pages.length, 56);
  const unknown = pages.flatMap((p) => p.indices);
  assert.equal(unknown.length, 12956);
  assert.deepEqual(corpus.pages.find((p) => p.page === 50).indices, []);

  // Authenticate an independent, textlike original GP register, not a
  // generated English-looking random sequence. Solved p56's totient cipher
  // uses phi(prime[j]) = prime[j] - 1 and a literal F skip at index 56.
  const p56 = corpus.pages.find((p) => p.page === 56).indices;
  assert.equal(p56.length, 85);
  const prime = primes(p56.length);
  let primeIndex = 0;
  const authenticNative = p56.map((v, i) =>
    i === 56 ? v : mod(v - (prime[primeIndex++] - 1)));
  assert.equal(primeIndex, 84);
  assert.equal(authenticNative[56], 0);
  assert.ok(Math.abs(ioc(authenticNative) - 0.0700280112044818) < 1e-13);

  const results = [];
  const expected = [
    0.034479208135983576, 0.03451727897968709,
    0.03448913396158765, 0.03448086442621042,
    0.03450113312891455, 0.034528384465236914,
    0.03447012832912846, 0.03450095439255913
  ];
  for (const useChain of [false, true]) {
    for (const pageClock of [false, true]) {
      const parts = pageClock ? pages.map((p) => p.indices) : [unknown];
      for (const useMobius of [true, false]) {
        // A real true-key native plant must invert 100%, including repeats.
        const nativeEncrypted = plant(authenticNative, useChain, useMobius);
        assert.deepEqual(solve(nativeEncrypted, useChain, useMobius),
          authenticNative);

        const decoded = parts.flatMap((part) => solve(part, useChain, useMobius));
        assert.equal(decoded.length, unknown.length);
        const measure = ioc(decoded);
        assert.ok(Math.abs(measure - expected[results.length]) < 1e-13,
          'Unexpected original source data or arithmetic regression');
        results.push({
          input: useChain ? 'ciphertext-differences' : 'ciphertext-runes',
          clock: pageClock ? 'physical-page' : 'book-global',
          inverse: useMobius ? 'mobius' : 'zeta',
          ioc: measure,
          normalized29: measure * 29
        });
      }
    }
  }

  console.log(JSON.stringify({
    status: 'All 8 original inversions remain GP29-uniform; no plaintext.',
    source: 'Original LP2 pp0-55 (12956 GP runes)',
    originalIoC: ioc(unknown),
    authenticSolvedP56GPControlIoC: ioc(authenticNative),
    nativeGPPlantExact: '8/8 models × 85/85 rune positions',
    results
  }, null, 2));
}

main();
