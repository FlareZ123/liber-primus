'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

/** @typedef {{rows:string[][], alphabet:string, original_scans:string[], lp2_pages:number[], page_row_counts:number[]}} Grid */

const gridPath = 'resources/liber-primus/base60-grid.json';
const indexPath = 'resources/historical/stage11-2014-index.html';

/** @type {Grid} */
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const rows = grid.rows;
const tokens = rows.flat();

assert.equal(tokens.length, 256);
assert.deepEqual(grid.original_scans, ['66.jpg', '67.jpg', '68.jpg']);
assert.deepEqual(grid.lp2_pages, [49, 50, 51]);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.ok(tokens.every((token) => token.length === 2));

const selected = tokens
  .map((token, index) => ({ token, index }))
  .filter(({ token }) => token[0] === '0');

assert.equal(selected.length, 60);

const secondChars = selected.map(({ token }) => token[1]).join('');
const secondValues = selected.map(({ token }) => grid.alphabet.indexOf(token[1]));
const distinctSecondValues = new Set(secondValues);
const missingSecondValues = Array.from({ length: 60 }, (_, i) => i)
  .filter((i) => !distinctSecondValues.has(i));

assert.equal(grid.alphabet.length, 60);
assert.ok(secondValues.every((v) => v >= 0 && v < 60));
assert.equal(distinctSecondValues.size, 36);
assert.equal(missingSecondValues.length, 24);

const firstDigitCounts = Object.fromEntries(
  [...new Set(tokens.map((token) => token[0]))]
    .sort()
    .map((digit) => [digit, tokens.filter((token) => token[0] === digit).length]),
);
assert.deepEqual(firstDigitCounts, { 0: 60, 1: 58, 2: 65, 3: 56, 4: 17 });

const pageCuts = [0, 80, 184, 256];
const lowCountsByPage = pageCuts.slice(0, -1).map((start, i) =>
  selected.filter(({ index }) => index >= start && index < pageCuts[i + 1]).length,
);
assert.deepEqual(lowCountsByPage, [15, 26, 19]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  let x = 1;
  for (let i = 1; i <= k; i += 1) x *= (n - k + i) / i;
  return x;
}

const pLow = 60 / 256;
const exact60BinomialProbability =
  choose(256, 60) * (pLow ** 60) * ((1 - pLow) ** 196);
assert.ok(Math.abs((256 * pLow) - 60) < 1e-12);
assert.ok(Math.abs(exact60BinomialProbability - 0.0587732801395719) < 1e-12);

const html = fs.readFileSync(indexPath, 'utf8');
const imageRefs = [...html.matchAll(/<img src="([0-9]+)\.jpg" \/>/g)]
  .map((match) => Number(match[1]));
assert.deepEqual(imageRefs, Array.from({ length: 58 }, (_, i) => i));
assert.equal((html.match(/<a\b/gi) || []).length, 0);
assert.equal((html.match(/<script\b/gi) || []).length, 0);
assert.equal((html.match(/<form\b/gi) || []).length, 0);
assert.equal((html.match(/<!--/g) || []).length, 0);

console.log(JSON.stringify({
  source: 'original pp49-51 table transcription plus preserved 2014 Stage11 index',
  tokenCount: tokens.length,
  tokenWidth: 2,
  leadingZeroCount: selected.length,
  firstDigitCounts,
  lowCountsByPage,
  selectedSecondChars: secondChars,
  selectedSecondDistinct: distinctSecondValues.size,
  selectedSecondMissing: missingSecondValues,
  uniformByteExpectedLowCount: 256 * pLow,
  exact60BinomialProbability,
  stage11ImageRefs: imageRefs.length,
  stage11NonImageActionTags: 0,
  decision: 'The class is source-visible through fixed-width leading zeros, but this source supplies no selector opcode or finite receiver. The natural strip-leading-zero read is not a base60 permutation.',
}, null, 2));
