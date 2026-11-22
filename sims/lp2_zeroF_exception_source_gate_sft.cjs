'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

/** @typedef {{translit:string[]}} Corpus */
/** @typedef {{shape:string,pages:{rows:number,cols:number,tokens:string[],bytes:number[]}[]}} Grid */

/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
/** @type {Grid} */
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));

const digraphIndices = corpus.translit
  .map((value, index) => value.length === 2 ? index : -1)
  .filter((index) => index >= 0);
const specialIndices = [corpus.translit.indexOf('F'), ...digraphIndices];
const specialNames = specialIndices.map((index) => corpus.translit[index]);

assert.deepEqual(digraphIndices, [2, 12, 21, 22, 25, 27, 28]);
assert.deepEqual(specialIndices, [0, 2, 12, 21, 22, 25, 27, 28]);
assert.deepEqual(specialNames, ['F', 'TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

assert.equal(grid.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.ok(grid.pages.every((page) => page.cols === 8));
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);

const base60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const base59 = base60.replace('f', '');

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const first = alphabet.indexOf(token[0]);
  const second = alphabet.indexOf(token[1]);
  assert.ok(first >= 0 && second >= 0);
  return first * alphabet.length + second;
}

const allValueMod8 = new Array(8).fill(0);
const nonzeroValueMod8 = new Array(8).fill(0);
const nonzeroPhysicalColumn = new Array(8).fill(0);
let nonzeroCells = 0;
let agreement = 0;
let radixAgreement = 0;

for (let i = 0; i < 256; i += 1) {
  const valueSelector = bytes[i] & 7;
  const physicalColumn = i & 7;
  allValueMod8[valueSelector] += 1;

  if (tokens[i][0] === '0') continue;
  nonzeroCells += 1;
  nonzeroValueMod8[valueSelector] += 1;
  nonzeroPhysicalColumn[physicalColumn] += 1;
  agreement += Number(valueSelector === physicalColumn);
  radixAgreement += Number(
    (tokenValue(tokens[i], base60) & 7) ===
    (tokenValue(tokens[i], base59) & 7)
  );
}

assert.equal(nonzeroCells, 196);
assert.deepEqual(allValueMod8, [34, 40, 27, 26, 33, 29, 40, 27]);
assert.deepEqual(nonzeroValueMod8, [25, 33, 19, 18, 25, 25, 29, 22]);
assert.deepEqual(nonzeroPhysicalColumn, [28, 28, 23, 22, 24, 21, 25, 25]);
assert.equal(agreement, 21);
assert.equal(radixAgreement, 0);

console.log(JSON.stringify({
  canonicalGPTranslit: corpus.translit,
  canonicalTwoLetterRunes: digraphIndices.map((index) => corpus.translit[index]),
  zeroFSpecialIndices: specialIndices,
  zeroFSpecialNames: specialNames,
  sourceTableShape: grid.shape,
  allValueMod8,
  nonzeroCells,
  nonzeroValueMod8,
  nonzeroPhysicalColumn,
  valueMod8EqualsPhysicalColumn: agreement,
  valueMod8DiffersFromPhysicalColumn: nonzeroCells - agreement,
  base60Mod8EqualsBase59Mod8: radixAgreement,
  base60Mod8DiffersFromBase59Mod8: nonzeroCells - radixAgreement,
  decision: 'The exact eight-symbol set and order are source-derived as F plus every canonical two-letter GP transliteration in GP order. The table supplies width 8, but raw-value mod8 is underselected: it differs from physical-column indexing on 175/196 non-leading-zero cells and differs between documented base60 and drop-f base59 readings on 196/196 such cells.',
}, null, 2));
