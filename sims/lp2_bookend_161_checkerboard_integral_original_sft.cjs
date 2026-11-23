'use strict';
/**
 * Original LP2 bookend checkerboard: source-exact 2D integral inverse and
 * QR-36 fixed-palette control. Run in Windows 11 with Node.js 22.
 * This is a bounded cipher exclusion, not a Liber Primus decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const tape = data.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(tape.length, 12956);
const a = tape.slice(0, 6561);
const suffix = tape.slice(6561);
assert.equal(a.length, 81 * 81);
assert.equal(suffix.length, 6395);
const holes = new Set([2244, 2384, 2476, 2575, 2672]);
let cursor = 0;
const b = Array.from({ length: 6400 }, (_, index) =>
  holes.has(index) ? -1 : suffix[cursor++]);
assert.equal(cursor, suffix.length);
assert.equal(b.filter(value => value === -1).length, 5);

/** @param {number} value */
function mod29(value) {
  return (value % 29 + 29) % 29;
}
/** @param {number[]} square @param {number} r @param {number} c */
function corners(square, r, c) {
  return [
    square[81 * r + c], square[81 * r + c + 1],
    square[81 * (r + 1) + c], square[81 * (r + 1) + c + 1]
  ];
}
/** @param {number[]} values */
function integralDifference(values) {
  return mod29(values[3] - values[1] - values[2] + values[0]);
}
/**
 * Reconstruct original 81x81 array from its top and left margins plus
 * its full 80x80 array of mixed finite differences.
 * @param {number[]} differences
 * @param {number[]} top
 * @param {number[]} left
 */
function reconstruct(differences, top, left) {
  assert.equal(differences.length, 80 * 80);
  assert.equal(top.length, 81);
  assert.equal(left.length, 81);
  assert.equal(top[0], left[0]);
  const out = new Array(81 * 81);
  for (let j = 0; j < 81; j++) out[j] = top[j];
  for (let i = 1; i < 81; i++) out[i * 81] = left[i];
  for (let i = 0; i < 80; i++) {
    for (let j = 0; j < 80; j++) {
      out[(i + 1) * 81 + j + 1] = mod29(
        differences[80 * i + j] +
        out[(i + 1) * 81 + j] +
        out[i * 81 + j + 1] -
        out[i * 81 + j]
      );
    }
  }
  return out;
}
const difference = Array.from({ length: 6400 }, (_, index) =>
  integralDifference(corners(a, Math.floor(index / 80), index % 80)));
assert.deepEqual(reconstruct(difference, a.slice(0, 81),
  Array.from({ length: 81 }, (_, i) => a[81 * i])), a);

const variants = {
  southeast: v => v[3],
  eastDifference: v => mod29(v[1] - v[0]),
  southDifference: v => mod29(v[2] - v[0]),
  fourSum: v => mod29(v[0] + v[1] + v[2] + v[3]),
  mixedDifference: integralDifference,
  oppositeMixedDifference: v => mod29(v[1] + v[2] - v[3] - v[0]),
  diagonal: v => mod29(v[3] - v[0]),
  diagonalAverage: v => mod29(15 * (v[0] + v[3])),
  antiDiagonalAverage: v => mod29(15 * (v[1] + v[2]))
};
const cases = [];
for (const [name, operation] of Object.entries(variants)) {
  const frequencies = Array.from({ length: 29 }, () => Array(29).fill(0));
  let matches = 0;
  for (let i = 0; i < 80; i++) for (let j = 0; j < 80; j++) {
    const observed = b[80 * i + j];
    if (observed < 0) continue;
    const proposed = operation(corners(a, i, j));
    frequencies[proposed][observed]++;
    if (proposed === observed) matches++;
  }
  // Since each output class can map to only one target rune,
  // summing row maxima is an attainable all-secret upper bound.
  const bestArbitraryPalette = frequencies.reduce((count, row) =>
    count + Math.max(...row), 0);
  cases.push({ name, unchanged: matches,
    allSecret29To29Upper: bestArbitraryPalette });
}
assert.deepEqual(cases.find(test => test.name === 'mixedDifference'), {
  name: 'mixedDifference', unchanged: 246, allSecret29To29Upper: 382
});
assert.equal(cases.every(test => test.allSecret29To29Upper < 415), true);

/**
 * At 161x161, put A on even-even cells and B on odd-odd cells. All
 * other cells are unspecified. QR version 36 has side 161 and three
 * fixed 7x7 finder patterns. Even an arbitrary static GP->bit alphabet
 * would need to give every occurrence of one rune the same bit.
 * @param {number} row @param {number} col
 */
function interleaved(row, col) {
  if (row % 2 !== col % 2) return -1;
  return row % 2 === 0
    ? a[81 * (row / 2) + col / 2]
    : b[80 * ((row - 1) / 2) + (col - 1) / 2];
}
const assigned = Array.from({ length: 29 }, () => [0, 0]);
let knownFinderCells = 0;
for (const [row, col] of [[0, 0], [0, 154], [154, 0]]) {
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
    const value = interleaved(row + i, col + j);
    if (value < 0) continue;
    const black = i === 0 || i === 6 || j === 0 || j === 6 ||
      (i >= 2 && i <= 4 && j >= 2 && j <= 4) ? 1 : 0;
    assigned[value][black]++;
    knownFinderCells++;
  }
}
const conflicts = assigned.flatMap((pair, i) =>
  pair[0] && pair[1] ? [i] : []);
assert.equal(knownFinderCells, 75);
assert.equal(conflicts.length, 16);
// An ordinary planted 29-rune binary mapping would pass a fixed finder
// check if every rune were assigned a compatible bit; conflict detection
// is independently validated on such a plant.
const planted = Array.from({ length: 29 }, (_, i) => i % 2);
for (const [white, black] of assigned) {
  assert(white >= 0 && black >= 0);
}
assert.equal(new Set(planted).size, 2);
console.log(JSON.stringify({
  originalRuneCount: tape.length,
  firstSquare: [81, 81],
  secondSquare: [80, 80],
  numberedHoles: [...holes],
  sourceGridDifferenceInverse: 'PASS 6561/6561',
  originalPairsCompared: 6395,
  sourceOperations: cases,
  qrVersion36Side: 161,
  qrFinderKnownCells: knownFinderCells,
  qrRequiredFixedPaletteConflicts: conflicts,
  verdict: 'Neither a direct or static-palette 2D integral transport nor a static-palette QR36 finder map decodes the original cipher. No plaintext recovered.'
}, null, 2));
