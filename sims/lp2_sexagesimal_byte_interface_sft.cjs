'use strict';
// Source-aligned finite gate for Director issue #833.
// Run from any directory: node sims/lp2_sexagesimal_byte_interface_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(grid.alphabet, alphabet);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const asDigit = (symbol) => alphabet.indexOf(symbol);
const decode = (token) => {
  assert.equal(token.length, 2);
  const first = asDigit(token[0]);
  const second = asDigit(token[1]);
  assert.ok(first >= 0 && first < 60);
  assert.ok(second >= 0 && second < 60);
  return first * 60 + second;
};
const bytes = tokens.map(decode);
assert.ok(bytes.every((v) => v >= 0 && v <= 255));
assert.deepEqual(bytes, grid.byte_rows.flat());
assert.equal(Math.min(...bytes), 0);
assert.equal(Math.max(...bytes), 255);
assert.equal(new Set(bytes).size, 161);
assert.deepEqual([0, 1, 2, 3, 4].map((digit) => tokens.filter((x) => x[0] === String(digit)).length), [60, 58, 65, 56, 17]);
assert.deepEqual(alphabet.split('').filter((digit) => !tokens.some((token) => token[1] === digit)), ['f']);
assert.equal(tokens[65], '4F');
assert.equal(decode('4F'), 255);

const wedgeDigits = [[17, 13], [55, 1]];
const wedgeIntegers = wedgeDigits.map(([high, low]) => high * 60 + low);
assert.deepEqual(wedgeIntegers, [1033, 3301]);
const latinEncoding = wedgeDigits.map(([high, low]) => alphabet[high] + alphabet[low]);
assert.deepEqual(latinEncoding, ['HD', 't1']);
assert.ok(latinEncoding.every((token) => !tokens.includes(token)));
assert.ok(tokens.every((token) => /^[0-4]/.test(token)));

console.log(JSON.stringify({
  sourceImages: ['50.jpg', '51.jpg', '56.jpg', '66.jpg', '67.jpg', '68.jpg'],
  originalStamp: { glyphSystem: 'separate cuneiform tens/unit wedges', digits: wedgeDigits, integers: wedgeIntegers },
  candidateTable: {
    glyphSystem: 'Latin-alphanumeric two-character tokens',
    pageRowCounts: grid.page_row_counts,
    cells: tokens.length,
    permittedDigits: 60,
    range: [Math.min(...bytes), Math.max(...bytes)],
    distinctBytes: new Set(bytes).size,
    firstDigitCounts: [60, 58, 65, 56, 17],
    unusedSecondDigits: ['f'],
    firstEightBytes: bytes.slice(0, 8)
  },
  hypotheticalLatinSpellingsOfStamp: latinEncoding,
  sharedLiteralGlyphAlphabet: false,
  signedPeriodSourceSelectingTableToGP29Consumer: 'not identified'
}, null, 2));
