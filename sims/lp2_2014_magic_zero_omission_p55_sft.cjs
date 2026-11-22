'use strict';

/**
 * Source-fixed original-LP2 trial of decimal-zero omission on 2014 Cicada
 * OpenPuff magic squares, followed by literal square-row-to-p55-word keys.
 * Run with Node.js 22; uses only built-in modules and does not write files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const squareText = fs.readFileSync(path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const squareRows = squareText.trim().split(/\r?\n/).filter((line) => line.trim()).map((line) => line.trim().split(/\s+/).map(Number));
const widths = [...Array(5).fill(5), ...Array(7).fill(7), ...Array(5).fill(5)];
const totals = [...Array(5).fill(3301), ...Array(12).fill(1033)];
const fragmentLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const original = corpus.pages.find((page) => page.page === 55).indices;
const nativeControl = corpus.pages.find((page) => page.page === 57).indices.slice(0, 76);
assert.equal(squareRows.length, 17);
assert.equal(fragmentLengths.reduce((a, b) => a + b, 0), 76);
assert.equal(original.length, 76);
assert.equal(nativeControl.length, 76);
assert.equal(corpus.translit.length, 29);
for (const [i, row] of squareRows.entries()) {
  assert.equal(row.length, widths[i]);
  assert.equal(row.reduce((a, b) => a + b, 0), totals[i]);
}
const droppedRows = squareRows.map((row) => row.map((value) => Number(String(value).replace(/0/g, ''))));
const changedCells = droppedRows.reduce((sum, row, i) => sum + row.filter((value, j) => value !== squareRows[i][j]).length, 0);
assert.equal(changedCells, 17);

/** @param {number} n @returns {number} */
function mod29(n) { return ((n % 29) + 29) % 29; }

/** @param {number[]} symbols @returns {number[][]} */
function splitWords(symbols) {
  let offset = 0;
  return fragmentLengths.map((size) => {
    const part = symbols.slice(offset, offset + size);
    offset += size;
    return part;
  });
}

/**
 * Decode C ± decimal-zero-dropped rows modulo 29. Rows repeat within each
 * physically visible p55 fragment and restart at the next fragment.
 * @param {number[][]} words
 * @param {number} cipherSign
 * @returns {number[][]}
 */
function directInverse(words, cipherSign) {
  return words.map((word, i) => word.map((c, pos) => mod29(c - cipherSign * droppedRows[i][pos % widths[i]])));
}

/**
 * Authentic solved-Cicada plaintext-F transparency rule, for positive plants.
 * @param {number[][]} words
 * @param {number} cipherSign
 * @returns {number[][]}
 */
function encryptWithFSkip(words, cipherSign) {
  return words.map((word, i) => {
    let clock = 0;
    return word.map((p) => p === 0 ? 0 : mod29(p + cipherSign * droppedRows[i][clock++ % widths[i]]));
  });
}

/**
 * Enumerate legal F-transparent inverses for one source word, allowing an
 * encrypted nonzero plaintext rune at C=0 as well as transparent F.
 * @param {number[]} word
 * @param {number[]} keyRow
 * @param {number} cipherSign
 * @returns {number[][]}
 */
function allFSkipInverses(word, keyRow, cipherSign) {
  /** @type {{clock:number,decoded:number[]}[]} */
  let states = [{ clock: 0, decoded: [] }];
  for (const c of word) {
    /** @type {{clock:number,decoded:number[]}[]} */
    const next = [];
    for (const state of states) {
      const p = mod29(c - cipherSign * keyRow[state.clock % keyRow.length]);
      if (p !== 0) next.push({ clock: state.clock + 1, decoded: [...state.decoded, p] });
      if (c === 0) next.push({ clock: state.clock, decoded: [...state.decoded, 0] });
    }
    states = next;
    if (states.length === 0) return [];
  }
  return states.map(({ decoded }) => decoded);
}

/** @param {number[][]} words @returns {string} */
function transliterate(words) {
  return words.map((word) => word.map((rune) => corpus.translit[rune]).join('')).join(' | ');
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  symbols.forEach((i) => { counts[i]++; });
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (symbols.length * (symbols.length - 1));
}

const originalWords = splitWords(original);
const nativeWords = splitWords(nativeControl);
const allResults = [];
for (const cipherSign of [1, -1]) {
  const decoded = directInverse(originalWords, cipherSign);
  const forward = decoded.map((word, i) => word.map((p, j) => mod29(p + cipherSign * droppedRows[i][j % widths[i]])));
  assert.deepEqual(forward, originalWords);
  const legalCounts = originalWords.map((word, i) => allFSkipInverses(word, droppedRows[i], cipherSign).length);
  const planted = encryptWithFSkip(nativeWords, cipherSign);
  planted.forEach((word, i) => {
    const plausible = allFSkipInverses(word, droppedRows[i], cipherSign);
    assert(plausible.some((candidate) => candidate.every((x, j) => x === nativeWords[i][j])));
  });
  allResults.push({
    cipherSign,
    decoded: transliterate(decoded),
    ioc: coincidence(decoded.flat()),
    fSkipImpossibleFragments: legalCounts.map((count, i) => count === 0 ? i + 1 : 0).filter(Boolean),
    fSkipPossible: legalCounts.reduce((count, n) => count + Number(n !== 0), 0),
    plantedSymbolsRecovered: 76
  });
}
assert.deepEqual(allResults[0].fSkipImpossibleFragments, []);
assert.deepEqual(allResults[1].fSkipImpossibleFragments, [5, 11, 13]);
console.log(JSON.stringify({ sourceSquares: 17, squareCells: 99, changedCells, originalRunes: 76, nativeControlRunes: 76, results: allResults }, null, 2));
