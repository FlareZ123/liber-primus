'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/**
 * Locate second-rune offsets of adjacent-equal pairs.
 * @param {number[]} runes
 * @returns {number[]}
 */
function repeatedDestinations(runes) {
  const positions = [];
  for (let i = 1; i < runes.length; i += 1) {
    if (runes[i] === runes[i - 1]) positions.push(i);
  }
  return positions;
}

/**
 * Find printed F offsets within an inclusive interval.
 * Under solved LP2 page 56, a plaintext F is printed literally.
 * @param {number[]} runes
 * @param {number} start
 * @param {number} end
 * @param {number} fRune
 * @returns {number[]}
 */
function literalFs(runes, start, end, fRune) {
  const positions = [];
  for (let i = start; i <= end; i += 1) {
    if (runes[i] === fRune) positions.push(i);
  }
  return positions;
}

const page = corpus.pages.find((item) => item.page === 35);
assert.ok(page, 'Original LP2 page 35 must exist');
const { indices } = page;
const fRune = corpus.translit.indexOf('F');
assert.equal(fRune, 0, 'Canonical GP29 literal F index changed');
assert.deepEqual(repeatedDestinations(indices), [196, 203, 265]);
assert.notEqual(indices[196], fRune);
assert.notEqual(indices[203], fRune);
assert.notEqual(indices[265], fRune);
assert.deepEqual(literalFs(indices, 196, 203, fRune), []);
assert.deepEqual(literalFs(indices, 203, 265, fRune), [259]);

const firstGap = 203 - 196;
const secondGap = 265 - 203;
assert.equal(firstGap, 7);
assert.equal(secondGap, 62);

// All-secret F-bypass assignments leave gap7 unchanged.
// Only divisors of 7 are 1 and 7: a nontrivial block length must be 7.
const possibleFixedLength = 7;
for (const skippedFCount of [0, 1]) {
  const activeClockGap = secondGap - skippedFCount;
  assert.notEqual(activeClockGap % possibleFixedLength, 0);
  console.log(
    'ORIGINAL page35 gap:',
    '196→203 =', firstGap,
    '203→265 =', activeClockGap,
    'after', skippedFCount, 'literal-F skips:',
    'no fixed length 7 can join both events'
  );
}

// Constructive positive: blocks of seven active glyphs can repeat only
// at boundaries while a literal-F bypass increases visible gap 7 to 8.
const block1 = [1, 2, 3, 4, 5, 6, 7];
const block2 = [7, 8, 9, 10, 11, 12, 13];
const block3 = [13, 14, 15, 16, 17, 18, 19];
const planted = [
  ...block1,
  block2[0],
  block2[1],
  fRune,
  ...block2.slice(2),
  ...block3
];
assert.deepEqual(repeatedDestinations(planted), [7, 15]);
assert.deepEqual(literalFs(planted, 7, 15, fRune), [9]);
assert.equal((15 - 7) - 1, 7);
console.log('PLANTED 7-block positive: repeat gap8, one F bypass, active gap7');
console.log('PASS: original p35 forbids every fixed L>=2 with F-only transparent skips');
