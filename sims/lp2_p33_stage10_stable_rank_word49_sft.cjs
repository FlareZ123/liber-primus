/**
 * Original LP2 p33: stable Stage10 square ranking of 49 complete printed black words.
 * Source-fixed whole-word transpositions only. Windows 11 / Node.js 22 / CommonJS SFT.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = read('resources/lp2-transcription.txt').split(/\r?\n%\r?\n/);
const squareText = read('resources/cicada2014-openpuff-magic-squares.txt');

const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {string} passage @returns {string[]} */
function sourceWords(passage) {
  return passage.replace(/\/\s*\r?\n/g, '').replace(/[\s/]/g, '')
    .split(/[-.]/g).filter(Boolean);
}

/** @param {string} word @returns {number[]} */
function indices(word) {
  return [...word].map(rune => {
    assert.ok(runeToIndex.has(rune), 'authentic GP rune');
    return runeToIndex.get(rune);
  });
}

/** @param {string} word @returns {string} */
function translit(word) {
  return indices(word).map(i => corpus.translit[i]).join('');
}

/** @template T @param {T[]} items @param {number[]} positions @returns {T[]} */
function permute(items, positions) {
  return positions.map(i => items[i]);
}

assert.equal(pages.length, 57);
const sections = pages[33].split('&').map(sourceWords);
assert.deepEqual(sections.map(part => part.length), [23, 30]);
const blackWords = sections.flatMap(part => part.slice(2));
assert.equal(blackWords.length, 49);
const blackRunes = blackWords.flatMap(indices);
assert.equal(blackRunes.length, 196);
const p33 = corpus.pages.find(page => page.page === 33);
assert.deepEqual(blackRunes,
  p33.indices.slice(10, 91).concat(p33.indices.slice(99)),
  'every black original rune, excluding only two complete red headings');

const squares = squareText.trim().split(/\r?\n\s*\r?\n/);
assert.equal(squares.length, 3);
const square = squares[1].trim().split(/\r?\n/).map(row =>
  row.trim().split(/\s+/).map(Number));
assert.equal(square.length, 7);
for (const row of square) {
  assert.equal(row.length, 7);
  assert.equal(row.reduce((sum, n) => sum + n, 0), 1033);
}
for (let c = 0; c < 7; c++) {
  assert.equal(square.reduce((sum, row) => sum + row[c], 0), 1033);
}
const values = square.flat();
assert.equal(values.length, 49);

/** Stable ascending numerical rank; 2014 printed square cell index breaks ties. */
const ascending = values.map((value, index) => ({ value, index }))
  .sort((a, b) => a.value - b.value || a.index - b.index)
  .map(entry => entry.index);
const inverse = Array(49);
ascending.forEach((original, rank) => { inverse[original] = rank; });
assert.equal(new Set(ascending).size, 49);

const rankRead = permute(blackWords, ascending);
const inverseRead = permute(blackWords, inverse);
assert.deepEqual(permute(rankRead, inverse), blackWords, 'rank inverse replay');
assert.deepEqual(permute(inverseRead, ascending), blackWords, 'inverse rank replay');
assert.deepEqual(rankRead.flatMap(indices).sort((a, b) => a - b),
  blackRunes.slice().sort((a, b) => a - b), 'all 196 symbols preserved');

/** @param {string} name @param {string[]} words @returns {void} */
function printSevenRows(name, words) {
  console.log('\n' + name);
  for (let row = 0; row < 7; row++) {
    console.log(String(row + 1).padStart(2, '0') + '  ' +
      words.slice(row * 7, row * 7 + 7).map(translit).join(' '));
  }
}

console.log('PASS original 49 words, 196 runes, 21|28 body boundary, 1033 square rows/columns');
console.log('Square values row-major:', JSON.stringify(values));
console.log('Stable ascending position indexes (zero based):', JSON.stringify(ascending));
console.log('Exact inverse position indexes (zero based):', JSON.stringify(inverse));
printSevenRows('Original reading, first 3 rows upper body; final 4 lower body:', blackWords);
printSevenRows('Ascending rank read (intact source words):', rankRead);
printSevenRows('Inverse rank read (intact source words):', inverseRead);
console.log('\nPASS 49/49 rank and inverse replay; 196/196 original runes preserved.');
console.log('No individual word is altered by either transform; ranking alone cannot decipher ciphertext words.');
