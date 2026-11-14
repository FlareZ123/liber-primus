'use strict';
/**
 * 2014 three magic-square outer perimeter 56-cell page-key hypothesis.
 * Node.js 22+ standalone original-input reproducer.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const mod29 = (x) => ((x % 29) + 29) % 29;
/**
 * @param {number[][]} square
 * @param {'printed'|'clockwise'} mode
 * @returns {number[]}
 */
function perimeter(square, mode) {
  const n = square.length;
  const out = [];
  if (mode === 'printed') {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (r === 0 || c === 0 || r === n - 1 || c === n - 1)
          out.push(square[r][c]);
      }
    }
  } else {
    for (let c = 0; c < n; c++) out.push(square[0][c]);
    for (let r = 1; r < n; r++) out.push(square[r][n - 1]);
    for (let c = n - 2; c >= 0; c--) out.push(square[n - 1][c]);
    for (let r = n - 2; r >= 1; r--) out.push(square[r][0]);
  }
  assert.equal(out.length, 4 * n - 4);
  return out;
}
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let value = 2; primes.length < count; value++) {
    let prime = true;
    for (const q of primes) {
      if (q * q > value) break;
      if (value % q === 0) { prime = false; break; }
    }
    if (prime) primes.push(value);
  }
  return primes;
}
/** @param {number} input @returns {number} */
function totient(input) {
  let n = input, result = input;
  for (let f = 2; f * f <= n; f++) {
    if (n % f === 0) {
      while (n % f === 0) n /= f;
      result -= result / f;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}
/**
 * @param {number[]} cipher
 * @param {number} start Zero-based prime sequence starting ordinal
 * @param {-1|1} sign
 * @param {'all'|'fourth'} rule
 * @param {number[]} primes
 * @returns {{plaintext:number[],skip:boolean[]}}
 */
function decode(cipher, start, sign, rule, primes) {
  let k = start, f = 0;
  const plaintext = [], skip = [];
  for (const c of cipher) {
    if (c === 0) f++;
    const literal = rule === 'fourth' && c === 0 && f === 4;
    skip.push(literal);
    plaintext.push(literal ? 0 : mod29(c + sign * (primes[k++] - 1)));
  }
  return {plaintext, skip};
}
/**
 * @param {number[]} plaintext
 * @param {number} start
 * @param {-1|1} sign
 * @param {boolean[]} skip
 * @param {number[]} primes
 * @returns {number[]}
 */
function reencode(plaintext, start, sign, skip, primes) {
  let k = start;
  return plaintext.map((p, i) => {
    if (skip[i]) { assert.equal(p, 0); return 0; }
    return mod29(p - sign * (primes[k++] - 1));
  });
}
/** @param {number[]} digits @returns {number} */
function ioc(digits) {
  const freq = Array(29).fill(0);
  digits.forEach((v) => freq[v]++);
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (digits.length * (digits.length - 1));
}
/**
 * @param {string} sentence
 * @param {string[]} alphabet
 * @returns {number[]}
 */
function gpEncode(sentence, alphabet) {
  const sorted = alphabet.map((value, index) => ({value, index}))
    .sort((a, b) => b.value.length - a.value.length);
  const out = [];
  for (const word of sentence.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find((a) => word.startsWith(a.value, i));
      assert(match, 'unmapped GP substring: ' + word.slice(i));
      out.push(match.index);
      i += match.value.length;
    }
  }
  return out;
}
const squares = fs.readFileSync(
  path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n\s*\r?\n/u)
  .map((block) => block.trim().split(/\r?\n/u)
    .map((line) => line.trim().split(/\s+/u).map(Number)));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const primes = firstPrimes(5000);
assert.deepStrictEqual(squares.map((s) => s.length), [5, 7, 5]);
assert.deepStrictEqual(squares.map((s) => s[0].reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);
assert.deepStrictEqual(squares.map((s) => (s.length - 2) ** 2), [9, 25, 9]);
assert.equal(squares.reduce((total, s) => total + (s.length - 2) ** 2, 0), 43);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((total, p) => total + p.indices.length, 0), 12956);
assert.equal(corpus.pages.find((p) => p.page === 50).indices.length, 0);

// Authentic, source-independent p56 solved-page regression.
// The fourth original ciphertext F (position 56) alone is literal/non-consuming.
const solvedCipher = corpus.pages.find((p) => p.page === 56).indices;
const solvedNative = gpEncode('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE', corpus.translit);
const known = decode(solvedCipher, 0, -1, 'fourth', primes);
assert.deepStrictEqual(known.plaintext, solvedNative);
assert.deepStrictEqual(known.skip.flatMap((x, i) => x ? [i] : []), [56]);
assert.deepStrictEqual(reencode(known.plaintext, 0, -1, known.skip, primes), solvedCipher);

// One per physical LP2 page: numeric-only page50 reserves a cell, consumes no key.
const outputRows = [];
for (const order of /** @type {const} */ (['printed', 'clockwise'])) {
  const ring = squares.flatMap((square) => perimeter(square, order));
  assert.equal(ring.length, 56);
  for (const mode of /** @type {const} */ (['literal', 'mod29', 'phi'])) {
    for (const sign of /** @type {const} */ ([-1, 1])) {
      for (const fRule of /** @type {const} */ (['all', 'fourth'])) {
        const recovered = [];
        for (const page of pages) {
          const number = ring[page.page];
          const start = mode === 'literal' ? number :
            mode === 'mod29' ? number % 29 : totient(number);
          const decoded = decode(page.indices, start, sign, fRule, primes);
          assert.deepStrictEqual(
            reencode(decoded.plaintext, start, sign, decoded.skip, primes),
            page.indices);
          recovered.push(...decoded.plaintext);
        }
        outputRows.push({
          order, mode, sign, fRule, ioc: ioc(recovered),
          start: recovered.slice(0, 35).map((n) => corpus.translit[n]).join('')
        });
      }
    }
  }
}
assert.equal(outputRows.length, 24);
const raw = ioc(pages.flatMap((page) => page.indices));
const min = Math.min(...outputRows.map((x) => x.ioc));
const max = Math.max(...outputRows.map((x) => x.ioc));
assert(Math.abs(raw - 0.03447839786450569) < 1e-12);
assert(Math.abs(min - 0.034452218946315824) < 1e-12);
assert(Math.abs(max - 0.03452396371937963) < 1e-12);
console.log(JSON.stringify({
  input: '2014 signed three-square records + original LP2 GP29 runes',
  squareShapes: [5, 7, 5], innerCoreCells: 43, outerRingCells: 56,
  pageSlots: 56, runeBearingPages: 55, unknownRunes: 12956,
  authenticP56Positive: '85/85 exact (fourth F only)',
  rawIoC: raw, tested: outputRows.length, minIoC: min, maxIoC: max,
  candidates: outputRows, verdict: 'Original candidates nonlinguistic; no newly deciphered LP2 text.'
}, null, 2));
