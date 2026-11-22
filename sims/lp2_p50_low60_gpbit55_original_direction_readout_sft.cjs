'use strict';

/**
 * Source-typed readout of the 55 low60 GP29+direction records.
 *
 * Scope: exactly one GP29 rune from each rune-bearing unknown LP2 physical
 * page, with the printed p50 cell's quotient as a zero-based rune ordinal
 * counted from the end selected by its parity. Read-only SFT.
 *
 * @see im-results/lp2-p50-low60-gpbit55-original-direction-readout.md
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(src, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(src, 'base60-grid.json'), 'utf8'));

/** @typedef {{ page: number, indices: number[] }} RunicPage */
/** @typedef {{ physicalCell: number, token: string, quotient: number, bit: number }} DirectionKey */

/** @type {RunicPage[]} */
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.ok(pages.every((page) => page.page !== 50));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');

/** @type {DirectionKey[]} */
const leadingZero = grid.rows.flat().flatMap((token, physicalCell) => {
  if (!token.startsWith('0')) return [];
  assert.equal(token.length, 2);
  const digit = grid.alphabet.indexOf(token[1]);
  assert.ok(digit >= 0);
  return [{
    physicalCell,
    token,
    quotient: Math.floor(digit / 2),
    bit: digit % 2
  }];
});

assert.equal(leadingZero.length, 60);
const sentinel = leadingZero.filter((key) => key.quotient === 29);
assert.deepEqual(sentinel.map((key) => key.physicalCell), [22, 51, 81, 219, 220]);
const keys = leadingZero.filter((key) => key.quotient < 29);
assert.equal(keys.length, pages.length);
assert.ok(pages.every((page, i) => page.indices.length > keys[i].quotient));

/**
 * An untouched-source, fully specified, reversible extraction of one symbol
 * per page. A parity bit selects the left (start) or right (end) direction.
 * The GP29 quotient selects an offset in that direction. Nothing is fitted.
 * @param {RunicPage[]} book
 * @param {0|1} forwardBit
 * @returns {number[]}
 */
function read(book, forwardBit) {
  return book.map((page, i) => {
    const key = keys[i];
    const offset = key.bit === forwardBit
      ? key.quotient
      : page.indices.length - 1 - key.quotient;
    return page.indices[offset];
  });
}

/** @param {number[]} xs @returns {number} */
function coincidenceNumerator(xs) {
  const counts = Array(29).fill(0);
  for (const value of xs) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
}

/** @param {number[]} xs @returns {string} */
function romanize(xs) {
  return xs.map((value) => corpus.translit[value]).join('');
}

const actualZero = read(pages, 0);
const actualOne = read(pages, 1);
assert.equal(actualZero.length, 55);
assert.equal(actualOne.length, 55);
assert.equal(coincidenceNumerator(actualZero), 88);
assert.equal(coincidenceNumerator(actualOne), 108);

assert.equal(
  romanize(actualZero),
  'ETXBGEGXTHUNTUAEAAEIAWDPPTHATHAJFEIEOLIARIMOJIAOFEAEOILOEYYFIAAEWNAEB'
);
assert.equal(
  romanize(actualOne),
  'MRHHREOTAPFWEAEDATNYDPIAIAEOGIAEYNATBITDXWXHELEJYCFXBSTDSOEOEOEO'
);

// Matched native-GP positive control: plant the first 55 established PARABLE
// runes at precisely the source-selected slots, then recover all 55/55.
const known = corpus.pages.find((page) => page.page === 57).indices.slice(0, 55);
assert.equal(known.length, 55);
for (const forwardBit of [0, 1]) {
  const planted = pages.map((page) => ({
    page: page.page,
    indices: page.indices.slice()
  }));
  planted.forEach((page, i) => {
    const key = keys[i];
    const offset = key.bit === forwardBit
      ? key.quotient
      : page.indices.length - 1 - key.quotient;
    page.indices[offset] = known[i];
  });
  assert.deepEqual(read(planted, forwardBit), known);
}

console.log(JSON.stringify({
  source: 'unchanged LP2 GP29 corpus and p49-p51 original table',
  pageCount: pages.length,
  leadingZeroCount: leadingZero.length,
  sentinelCells: sentinel.map((key) => key.physicalCell),
  keyCount: keys.length,
  directionReadouts: [
    { bit0Forward: true, native: romanize(actualZero), ioc: 88 / (55 * 54) },
    { bit0Forward: false, native: romanize(actualOne), ioc: 108 / (55 * 54) }
  ],
  plantedRecovered: '55/55 both directions',
  status: 'NO SOURCE-GENUINE PLAINTEXT'
}, null, 2));
