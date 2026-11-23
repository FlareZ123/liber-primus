'use strict';

/**
 * Single-file test of a complete range of fixed-delay GP29 ciphertext-feedback
 * inverses on the unchanged unsolved LP2 tape.
 *
 * Model for a given delay d:
 *   C[i] = (C[i-d] + f(P[i])) mod 29, i >= d,
 * where f is one fixed but otherwise unknown GP29 permutation.
 *
 * Decryption is D[i] = (C[i] - C[i-d]) mod 29. The GP29 index of coincidence
 * of D is invariant under every possible bijective secret f and under sign
 * reversal, so the scan needs no key guesses or language fitting.
 *
 * Usage: node sims/lp2_global_cfb_1to3301_sft.cjs
 * Compatible with Node.js 22 on Windows 11.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @type {number} */
const ALPHABET = 29;
/** @type {number} */
const MAX_DELAY = 3301;
/** @type {number} */
const ENGLISH_IOC_GATE = 0.05;

/**
 * @param {number[]} symbols
 * @returns {number}
 */
function indexOfCoincidence(symbols) {
  const frequency = Array(ALPHABET).fill(0);
  for (const symbol of symbols) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < ALPHABET);
    frequency[symbol] += 1;
  }
  const count = symbols.length;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) / (count * (count - 1));
}

/**
 * @param {number[]} ciphertext
 * @param {number} delay
 * @returns {{ delay: number, count: number, zero: number, ioc: number }}
 */
function scoreDelay(ciphertext, delay) {
  const frequency = Array(ALPHABET).fill(0);
  for (let i = delay; i < ciphertext.length; i += 1) {
    const symbol = (ciphertext[i] - ciphertext[i - delay] + ALPHABET) % ALPHABET;
    frequency[symbol] += 1;
  }
  const count = ciphertext.length - delay;
  return {
    delay,
    count,
    zero: frequency[0],
    ioc: frequency.reduce((sum, n) => sum + n * (n - 1), 0) / (count * (count - 1)),
  };
}

/**
 * Encrypt known GP29 plaintext under one planted ciphertext-feedback law.
 * @param {number[]} plaintext
 * @param {number} delay
 * @returns {number[]}
 */
function makePositive(plaintext, delay) {
  const ciphertext = plaintext.slice();
  for (let i = delay; i < ciphertext.length; i += 1) {
    ciphertext[i] = (plaintext[i] + ciphertext[i - delay]) % ALPHABET;
  }
  return ciphertext;
}

/** @returns {void} */
function main() {
  const corpusPath = path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
  const source = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const pages = source.pages.filter((page) => page.page >= 0 && page.page <= 55);
  const ciphertext = pages.flatMap((page) => page.indices);
  const clearP57 = source.pages.find((page) => page.page === 57).indices;

  assert.equal(ciphertext.length, 12956, 'Canonical unsolved rune count changed');
  assert.equal(clearP57.length, 95, 'Native solved GP29 positive changed');
  assert.equal(source.runes.length, ALPHABET, 'Canonical GP29 alphabet changed');
  assert(MAX_DELAY < ciphertext.length);

  const plantedDelay = 13;
  const planted = makePositive(clearP57, plantedDelay);
  const recovered = Array.from(
    { length: planted.length - plantedDelay },
    (_, index) => (planted[index + plantedDelay] - planted[index] + ALPHABET) % ALPHABET,
  );
  assert.deepEqual(recovered, clearP57.slice(plantedDelay));

  const originalScores = [];
  for (let delay = 1; delay <= MAX_DELAY; delay += 1) {
    originalScores.push(scoreDelay(ciphertext, delay));
  }
  originalScores.sort((a, b) => b.ioc - a.ioc);
  assert.equal(originalScores.length, 3301);
  assert.equal(originalScores[0].delay, 1);
  assert(Math.abs(originalScores[0].ioc - 0.03532461477709297) < 1e-12);
  assert(originalScores[0].ioc < ENGLISH_IOC_GATE);

  const testedDelays = [1, 13, 28, 29, 76, 85, 95, 121, 243, 256, 330, 331, 840, 1033, 3301];
  console.log('LP2 continuous entire-book ciphertext-feedback fixed-lag sweep');
  console.log('Original unknown runes:', ciphertext.length);
  console.log('Tests:', MAX_DELAY, 'full original-input inverses, every global delay 1..3301');
  console.log('All-secret alphabet invariance: YES, IoC unchanged by any GP29 bijection');
  console.log('Genuine clear p57 native GP29 IoC:', indexOfCoincidence(clearP57).toFixed(12));
  console.log('Native 95-rune ciphertext-feedback plant: 82/82 recovered at delay13');
  console.log('MAXIMUM IoC:', JSON.stringify(originalScores[0]));
  console.log('Top 10:', JSON.stringify(originalScores.slice(0, 10)));
  console.log('Source-motivated delays:', JSON.stringify(testedDelays.map(
    (delay) => originalScores.find((score) => score.delay === delay),
  )));
  console.log('PASS: no fixed-delay continuous ciphertext-feedback inverse has native GP29 IoC >= 0.05');
}

main();
