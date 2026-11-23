'use strict';

/**
 * Original-cipher SFT: a source-motivated but UNAUTHENTICATED
 * P7 quartic / P15 distinct-Fibonacci-mod-7 two-round Feistel.
 * Windows 11, Node.js 22, CommonJS. Read-only.
 *
 * Cipher states are consecutive GP29 rune pairs across physical
 * LP2 pages 16..55. Printed separators do not advance the clock.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const mod = (n) => ((n % 29) + 29) % 29;
const quartic = (x) => mod(11 + 26 * x + 8 * x ** 2 + 15 * x ** 3 + 2 * x ** 4);

/** @param {number} value @param {number} roundKey */
function feistelPair(value, roundKey) {
  let [left, right] = value;
  for (let round = 0; round < 2; round += 1) {
    [left, right] = [right, mod(left + quartic(mod(right + roundKey)))];
  }
  return [left, right];
}

/** @param {number[]} value @param {number} roundKey */
function inversePair(value, roundKey) {
  let [left, right] = value;
  for (let round = 0; round < 2; round += 1) {
    [left, right] = [mod(right - quartic(mod(left + roundKey))), left];
  }
  return [left, right];
}

const orbit = [];
let state = 10; // Physical p8 red I, following the p7 red polynomial.
for (let i = 0; i < 7; i += 1) {
  orbit.push(state);
  state = quartic(state);
}
assert.equal(state, 10);
assert.deepEqual(orbit, [10, 24, 7, 5, 15, 28, 9]);

const fib = [0, 1];
while (fib.length < 17) fib.push(fib.at(-1) + fib.at(-2));
const distinctFib = [0, ...fib.slice(2, 17)];
assert.deepEqual(distinctFib, [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]);

// A separately true mathematical coincidence: ordinary Fibonacci mod7
// has period16. The manuscript uses DISTINCT Fibonacci values, however,
// so its actual 16-element schedule is not an ordinary repeated period.
const ordinaryMod7 = fib.slice(0, 16).map((f) => f % 7);
assert.deepEqual(ordinaryMod7, [0, 1, 1, 2, 3, 5, 1, 6, 0, 6, 6, 5, 4, 2, 6, 1]);
const key16 = distinctFib.map((n) => orbit[n % 7]);
assert.deepEqual(key16, [10, 24, 7, 5, 28, 24, 9, 10, 9, 9, 28, 15, 7, 9, 24, 10]);

/**
 * @param {number[]} digits
 * @param {(pair: number[], key: number) => number[]} step
 */
function transform(digits, step) {
  assert.equal(digits.length % 2, 0);
  const out = [];
  for (let i = 0; i < digits.length; i += 2) {
    out.push(...step([digits[i], digits[i + 1]], key16[(i / 2) % key16.length]));
  }
  return out;
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const histogram = Array(29).fill(0);
  for (const x of symbols) histogram[x] += 1;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

const unknown = corpus.pages.filter((page) => page.page >= 16 && page.page <= 55);
const original = unknown.flatMap((page) => page.indices);
assert.equal(original.length, 9194);
const decoded = transform(original, inversePair);
assert.deepEqual(transform(decoded, feistelPair), original, 'original ciphertext must re-encrypt exactly');

const clearP57 = corpus.pages.find((page) => page.page === 57).indices.slice(0, 94);
assert.equal(clearP57.length, 94);
assert.deepEqual(transform(transform(clearP57, feistelPair), inversePair), clearP57,
  'genuine solved-p57 source GP29 must survive an independent planted cipher');

let cursor = 0;
const pagePlain = new Map();
for (const page of unknown) {
  pagePlain.set(page.page, decoded.slice(cursor, cursor + page.indices.length));
  cursor += page.indices.length;
}
assert.equal(cursor, original.length);

const training = [16, 17, 18, 19, 20, 21].flatMap((page) => pagePlain.get(page));
const holdout = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]
  .flatMap((page) => pagePlain.get(page));
assert.equal(training.length, 1613);
assert.equal(holdout.length, 3008);
assert.ok(Math.abs(ioc(training) - 0.03454100446280915) < 1e-12);
assert.ok(Math.abs(ioc(holdout) - 0.03445771922252333) < 1e-12);

const preview = training.slice(0, 80).map((n) => corpus.translit[n]).join('');
console.log(JSON.stringify({
  source: 'original 12956-runic LP2 corpus; untouched p16-55 register',
  hypothesis: 'p7 quartic / p15 distinct Fibonacci mod7, two-round GP29 pair Feistel',
  orbit,
  key16,
  plaintextPreviewTranslit: preview,
  training: { pages: 'p16-21', runes: training.length, ioc: ioc(training) },
  holdout: { pages: 'p40-53', runes: holdout.length, ioc: ioc(holdout) },
  genuineSolvedP57Plant: '94/94 exact',
  originalReencryption: '9194/9194 exact',
  verdict: 'no original unknown plaintext or author-selected Feistel opcode',
}, null, 2));
console.log('PASS');
