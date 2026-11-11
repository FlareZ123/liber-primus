'use strict';

// Source-gated digit reversal from the 2013 Cicada "number" operation.
// This test performs one literal 2016-image -> LP2 tree-page reading and
// reports the resulting runes without using language scores or fitted keys.
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

/** @param {number} n @returns {number} */
function reverseDigits(n) {
  return Number(String(n).split('').reverse().join(''));
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {string} token @returns {number} */
function base60(token) {
  assert.equal(token.length, 2);
  return 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]);
}

const page32 = corpus.pages.find((page) => page.page === 32);
const page50 = grid.pages.find((page) => page.page === 50);
assert.ok(page32);
assert.ok(page50);
assert.equal(page32.indices.length, 121);

const rowSum = page32.indices.slice(0, 11)
  .reduce((sum, index) => sum + corpus.prime[index], 0);
const colSum = page32.indices.filter((_, offset) => offset % 11 === 0)
  .reduce((sum, index) => sum + corpus.prime[index], 0);
assert.equal(rowSum, 563);
assert.equal(colSum, 569);

const image2012 = [503, 509];
const image2016 = [563, 569];
const original = image2012.map((size) => reverseDigits(size) / 5);
const reversed = image2016.map((size) => reverseDigits(size) / 5);
assert.deepEqual(original, [61, 181]);
assert.deepEqual(reversed, [73, 193]);
assert.deepEqual(reversed.map((n, i) => n - original[i]), [12, 12]);
assert.equal(reversed[1] - reversed[0], page32.indices.length - 1);
assert.equal(corpus.prime[page32.indices[0]], reversed[0]);

// The frozen 2016 signed-message word-address candidate sends "lies" to
// physical p50 token 3 (zero-based). Confirm that actual printed token.
assert.equal(page50.tokens[3], '3D');
assert.equal(base60(page50.tokens[3]), reversed[1]);
// The same archived NUMBER operation can be applied again to the
// selected prime byte. Its reversal is semiprime, both factors in GP29.
const nextNumberValue = reverseDigits(reversed[1]);
assert.equal(nextNumberValue, 391);
assert.equal(nextNumberValue, 17 * 23);
assert.ok(corpus.prime.includes(17) && corpus.prime.includes(23));

// Test the single source-defined direct reading: omitted 2013 primes
// from the two dimension-reversal endpoints, as p32 row-major offsets.
const primes = [];
for (let n = reversed[0]; n <= reversed[1]; n += 1) {
  if (isPrime(n)) primes.push(n);
}
const offsets = primes.map((n) => n - reversed[0]);
assert.equal(primes.length, 24);
assert.equal(offsets[0], 0);
assert.equal(offsets[offsets.length - 1], 120);
const gpIndices = offsets.map((offset) => page32.indices[offset]);
const transliteration = gpIndices.map((index) => corpus.translit[index]).join('');
const runes = gpIndices.map((index) => corpus.runes[index]).join('');
assert.equal(transliteration, 'LPNGOEBTHFOESXGWSWUJNGURGLGEO');

// Apply the *already demonstrated* solved-p56 prime-totient inverse to the
// 24 selected p32 symbols. The first clock pairs each extracted rune with
// its selecting prime; the second reproduces solved p56's transparent F clock.
/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

const directPhi = gpIndices.map((cipher, i) => mod29(cipher - (primes[i] - 1)));
assert.ok(directPhi.every((plain, i) => mod29(plain + primes[i] - 1) === gpIndices[i]));
const skipPhi = [];
let clock = 0;
for (const cipher of gpIndices) {
  if (cipher === 0) {
    skipPhi.push(0);
  } else {
    skipPhi.push(mod29(cipher - (primes[clock] - 1)));
    clock += 1;
  }
}
const directPhiText = directPhi.map((index) => corpus.translit[index]).join('');
const skipPhiText = skipPhi.map((index) => corpus.translit[index]).join('');
assert.equal(directPhiText, 'GOEYNGHEXPYMRNGTOERAEFRNGTHXMD');
assert.equal(skipPhiText, 'GOEYNGHEFBEADEAEOEAXIAGIPEOHTFAE');

console.log(JSON.stringify({
  evidence: 'conditional source correspondence, no original plaintext recovered',
  dimensions: { image2012, image2016 },
  reversedFactorFive: { image2012: original, image2016: reversed },
  treePage: 32,
  rowPrimeSum: rowSum,
  columnPrimeSum: colSum,
  selectedTableToken: page50.tokens[3],
  selectedTableByte: base60(page50.tokens[3]),
  number193Reversal: nextNumberValue,
  number193Factors: [17, 23],
  primeWalk: primes,
  offsets,
  gpIndices,
  directPhiText,
  skipPhiText,
  transliteration,
  runes
}, null, 2));
