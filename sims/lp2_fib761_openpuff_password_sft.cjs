'use strict';

/**
 * Reconstruct one source-fixed 2013 OpenPuff password candidate from the
 * physical p27 Fibonacci pickup, with p15=708 and p27=761 internal evidence.
 * Original cipher is not edited; no password search, register fit, or key menu.
 * Usage: node sims/lp2_fib761_openpuff_password_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const F = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

/**
 * @param {number} first
 * @param {number} last
 * @param {number} redHeadingLength
 * @returns {number[]}
 */
function pickup(first, last, redHeadingLength) {
  const text = corpus.pages.slice(first, last + 1).flatMap((p) => p.indices);
  return F.map((offset) => text[redHeadingLength + offset]);
}

/** @param {number[]} a */
function primeSum(a) {
  return a.reduce((sum, digit) => sum + corpus.prime[digit], 0);
}

/** @param {number[]} a */
function transliterate(a) {
  return a.map((digit) => corpus.translit[digit]).join('');
}
const sourceP15 = pickup(15, 22, 20);
const sourceP27 = pickup(27, 32, 19);
assert.deepEqual(
  sourceP15,
  [10, 1, 10, 1, 25, 25, 13, 14, 9, 17, 24, 3, 9, 27, 4, 3]
);
assert.deepEqual(sourceP27, [9, 8, 6, 1, 8, 0, 18, 4, 19, 4, 21, 26, 22, 17, 27, 19]);
assert.equal(primeSum(sourceP15), 708);
assert.equal(primeSum(sourceP27), 761);
const password = transliterate(sourceP27);
assert.equal(password, 'NHGUHFERMRNGYOEBIAM');
assert(password.length >= 8 && password.length <= 32);
process.stdout.write(password);
