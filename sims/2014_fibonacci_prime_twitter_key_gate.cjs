#!/usr/bin/env node
'use strict';

// One-shot, source-bounded test of the 2014 @991948530947554 Fibonacci-prime
// tweet as a period-12 additive GP29 key. Run from the repository root:
//   node sims/2014_fibonacci_prime_twitter_key_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const controlPath = path.join(root, 'resources/control/shakespeare_first300k.txt');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const controlText = fs.readFileSync(controlPath, 'utf8').toUpperCase().replace(/[^A-Z]/g, '');

const alphabet = corpus.translit;
const modulus = alphabet.length;
assert.equal(modulus, 29);

const unknown = corpus.pages
  .filter(page => page.page <= 55 && page.page !== 50)
  .flatMap(page => page.indices);
assert.equal(unknown.length, 12956);

const tokens = [...alphabet].sort((a, b) => b.length - a.length);
function tokenizeGp(text) {
  const result = [];
  for (let i = 0; i < text.length;) {
    const token = tokens.find(candidate => text.startsWith(candidate, i));
    if (token) {
      result.push(alphabet.indexOf(token));
      i += token.length;
    } else {
      i += 1;
    }
  }
  return result;
}

const reference = tokenizeGp(controlText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const holdout = reference.slice(split);
const trigramCounts = new Map();
const contextCounts = new Map();

for (let i = 2; i < train.length; i += 1) {
  const context = train[i - 2] * modulus + train[i - 1];
  const trigram = context * modulus + train[i];
  trigramCounts.set(trigram, (trigramCounts.get(trigram) || 0) + 1);
  contextCounts.set(context, (contextCounts.get(context) || 0) + 1);
}

function trigramLogScore(values) {
  let total = 0;
  for (let i = 2; i < values.length; i += 1) {
    const context = values[i - 2] * modulus + values[i - 1];
    const trigram = context * modulus + values[i];
    const numerator = (trigramCounts.get(trigram) || 0) + 1;
    const denominator = (contextCounts.get(context) || 0) + modulus;
    total += Math.log(numerator / denominator);
  }
  return total / (values.length - 2);
}

function ioc(values) {
  const frequencies = Array(modulus).fill(0);
  for (const value of values) frequencies[value] += 1;
  const numerator = frequencies.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

function makePrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

const fibonacciPrimeValues = [
  2n, 3n, 5n, 13n, 89n, 233n, 1597n, 28657n,
  514229n, 433494437n, 2971215073n, 99194853094755497n
];
const fibonacci = [0n, 1n];
while (fibonacci.length <= 83) {
  fibonacci.push(fibonacci[fibonacci.length - 1] + fibonacci[fibonacci.length - 2]);
}
const fibonacciIndexByValue = new Map(fibonacci.map((value, index) => [value.toString(), index]));
const fibonacciPrimeIndices = fibonacciPrimeValues.map(value => fibonacciIndexByValue.get(value.toString()));
const expectedIndices = [3, 4, 5, 7, 11, 13, 17, 23, 29, 43, 47, 83];
assert.deepEqual(fibonacciPrimeIndices, expectedIndices);

const primes = makePrimes(84);
// The p15 construction uses 3301 - p_(F_n+1). Its one-based prime index
// is represented here by primes[index], since JS arrays are zero-based.
const keyDefinitions = [
  {
    label: 'tweeted Fibonacci-prime values mod 29',
    key: fibonacciPrimeValues.map(value => Number(value % 29n))
  },
  {
    label: 'Fibonacci indices mod 29',
    key: fibonacciPrimeIndices.map(value => value % 29)
  },
  {
    label: 'p15 dual: (3301 - p_(index+1)) mod 29',
    key: fibonacciPrimeIndices.map(index => ((3301 - primes[index]) % 29 + 29) % 29)
  }
];

function decrypt(ciphertext, key, sign) {
  return ciphertext.map((value, index) =>
    ((value + sign * key[index % key.length]) % modulus + modulus) % modulus
  );
}

const results = keyDefinitions.map(definition => {
  const directions = [-1, 1].map(sign => {
    const plaintext = decrypt(unknown, definition.key, sign);
    const reencrypted = decrypt(plaintext, definition.key, -sign);
    assert.deepEqual(reencrypted, unknown, 'exact round-trip failed');
    return {
      operation: sign === -1 ? 'P = C - K' : 'P = C + K',
      trigram_log_nats_per_rune: trigramLogScore(plaintext),
      ioc: ioc(plaintext),
      first_120_translit: plaintext.slice(0, 120).map(index => alphabet[index]).join('')
    };
  });
  return { label: definition.label, key: definition.key, directions };
});

console.log(JSON.stringify({
  corpus_git_blob_sha: '054f2a0f780b7d46901acbe3d9bf4f0ac1801165',
  control_git_blob_sha: '94c677ad9dd50771c6670e0c4e4dad9052b46d85',
  unknown_runes: unknown.length,
  fibonacci_prime_values: fibonacciPrimeValues.map(String),
  fibonacci_prime_indices: fibonacciPrimeIndices,
  native_shakespeare_holdout_score: trigramLogScore(holdout),
  raw_lp2_score: trigramLogScore(unknown),
  raw_lp2_ioc: ioc(unknown),
  key_tests: results
}, null, 2));
