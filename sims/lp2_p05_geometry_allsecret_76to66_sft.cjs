'use strict';

// Single-file test: source-fixed LP1 p05 duplicate-word routing versus LP2 p49/p55.
// Run with Node.js 22 from any working directory. No file writes or dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'), 'utf8');
const lines = lp1.split(/\r?\n/u);
const start = lines.findIndex((line) => line.startsWith('272-138-'));
assert.ok(start >= 0, 'Source 5x5 square not found');
const square = lines.slice(start, start + 5).map((line) => line.replace(/\/$/u, '').split('-'));
assert.equal(square.length, 5);
for (const row of square) assert.equal(row.length, 5);
const valueOfRune = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));

/** @param {string} cell @returns {boolean} */
function isWord(cell) {
  return [...cell].every((rune) => valueOfRune.has(rune));
}
/** @param {string} cell @returns {number} */
function cellValue(cell) {
  if (/^\d+$/u.test(cell)) return Number(cell);
  assert.ok(isWord(cell), 'Unexpected grid cell');
  return [...cell].reduce((sum, rune) => sum + valueOfRune.get(rune), 0);
}
/** @param {string[]} cells @returns {string[]} */
function uniqueWords(cells) {
  const seen = new Set();
  return cells.filter((cell) => {
    if (!isWord(cell) || seen.has(cell)) return false;
    seen.add(cell);
    return true;
  });
}
/** @param {number[]} input @param {number[]} output @returns {{index:number,kind:string}|null} */
function symbolMappingContradiction(input, output) {
  assert.equal(input.length, output.length);
  const forward = new Map();
  const reverse = new Map();
  for (let i = 0; i < input.length; i += 1) {
    const a = input[i];
    const b = output[i];
    if (forward.has(a) && forward.get(a) !== b) return { index: i, kind: 'not a function' };
    if (reverse.has(b) && reverse.get(b) !== a) return { index: i, kind: 'not injective' };
    forward.set(a, b);
    reverse.set(b, a);
  }
  return null;
}

const values = square.map((row) => row.map(cellValue));
const rowSum = (row) => row.reduce((sum, v) => sum + v, 0);
for (const row of values) assert.equal(rowSum(row), 1033);
for (let col = 0; col < 5; col += 1) {
  assert.equal(rowSum(values.map((row) => row[col])), 1033);
}
assert.equal(rowSum(values.map((row, i) => row[i])), 1033);
assert.equal(rowSum(values.map((row, i) => row[4 - i])), 1033);
for (let y = 0; y < 5; y += 1) {
  for (let x = 0; x < 5; x += 1) {
    assert.equal(values[y][x], values[4 - y][4 - x]);
  }
}

const rowCells = square.flat();
const columnCells = Array.from({ length: 25 }, (_, i) => square[i % 5][Math.floor(i / 5)]);
const printedWords = rowCells.filter(isWord);
assert.equal(printedWords.length, 13);
assert.equal(rowCells.length - printedWords.length, 12);
const totalLength = printedWords.reduce((sum, word) => sum + [...word].length, 0);
assert.equal(totalLength, 76);
const rowUnique = uniqueWords(rowCells);
const columnUnique = uniqueWords(columnCells);
assert.equal(rowUnique.length, 11);
assert.equal(columnUnique.length, 11);
const rowKey = rowUnique.join('');
const columnKey = columnUnique.join('');
assert.equal([...rowKey].length, 66);
assert.equal([...columnKey].length, 66);
assert.notEqual(rowKey, columnKey, 'Two equally source-legible traversals must differ');

const droppedOffsets = [];
const encountered = new Set();
let cursor = 0;
for (const word of printedWords) {
  if (encountered.has(word)) {
    for (let i = 0; i < [...word].length; i += 1) droppedOffsets.push(cursor + i);
  }
  encountered.add(word);
  cursor += [...word].length;
}
assert.deepEqual(droppedOffsets, [53, 54, 55, 56, 65, 66, 67, 68, 69, 70]);
const droppedSet = new Set(droppedOffsets);
const p49 = corpus.pages.find((page) => page.page === 49).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p49.length, 66);
assert.equal(p55.length, 76);
assert.equal(new Set(p49).size, 28);
assert.equal(new Set(p55).size, 25);

// The cardinality obstruction holds for any ten positions, any source routing,
// and any globally fixed deterministic output-rune mapping, even non-bijective.
assert.ok(new Set(p49).size > new Set(p55).size);

const rowReduced = p55.filter((_, i) => !droppedSet.has(i));
assert.equal(rowReduced.length, 66);
const conflict = symbolMappingContradiction(rowReduced, p49);
assert.deepEqual(conflict, { index: 8, kind: 'not a function' });

// Positive: the same erasure and a planted bijection must be accepted.
const planted76 = Array.from({ length: 76 }, (_, i) => i % 29);
const planted66 = planted76.filter((_, i) => !droppedSet.has(i));
const encryptedPlant = planted66.map((v) => (v + 7) % 29);
assert.equal(symbolMappingContradiction(planted66, encryptedPlant), null);
assert.deepEqual(encryptedPlant.map((v) => (v + 22) % 29), planted66);

console.log('LP1 p05: 25/25 magic cells; row/column/diagonal sum=1033; rotation symmetry exact');
console.log('LP1 p05 rune-word cells=13/76 runes; first-occurrence unique=11/66; dropped=10');
console.log('Dropped word-tape offsets:', droppedOffsets.join(','));
console.log('Row-first and column-first 66-rune keys differ; source layout does not fix one route');
console.log('Original p55 unique GP29 values:', new Set(p55).size);
console.log('Original p49 unique GP29 values:', new Set(p49).size);
console.log('Any erasure/permutation + global single-valued substitution p55->p49: IMPOSSIBLE');
console.log('Literal p05 first-occurrence erasure+bijective map: first conflict at index', conflict.index);
console.log('Planted erasure+29-rune bijection positive: 66/66 source symbols recovered');
console.log('No unknown LP2 plaintext or author-selected decryption was recovered.');
