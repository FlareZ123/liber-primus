"use strict";

/**
 * Exact LP2 terminal-table GF(29) parity capacity proof.
 *
 * Inputs: original table and original physical pages 55, 56 and 57.
 * The candidate map assigns p55 to the 32x8 perimeter in source row order,
 * and solved p56+p57 to its 30x6 interior in source row order. This is a
 * hypothesis for testing coding capacity, not an established Cicada cipher.
 * No guessed key, language score, image modification or network access.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.ok(bytes.every(value => Number.isInteger(value) && value >= 0 && value < 256));
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} n @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }
/** @param {number} n @returns {number} */
function inv(n) {
  for (let k = 1; k < 29; k++) if (mod(n * k) === 1) return k;
  throw new Error("Nonzero field inverse required");
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) result[i + j] = mod(result[i + j] + a[i] * b[j]);
  }
  return result;
}

// Established exact small factors of the original table polynomial. Coefficients
// ascend in degree, and the leading coefficient is normalized to one.
const factors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
const generator = factors.reduce(multiply, [1]);
assert.deepEqual(generator,
  [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]);
/**
 * Polynomial remainder modulo the exact degree-16 monic table factor.
 * @param {number[]} ascending Coefficients of an original coefficient vector.
 * @returns {number[]} Sixteen GP29 syndrome residues, ascending.
 */
function syndrome(ascending) {
  const reduced = ascending.map(mod);
  for (let degree = reduced.length - 1; degree >= 16; degree--) {
    const factor = reduced[degree];
    for (let j = 0; j <= 16; j++) {
      reduced[degree - 16 + j] = mod(reduced[degree - 16 + j] - factor * generator[j]);
    }
  }
  return Array.from({length: 16}, (_, j) => reduced[j] ?? 0);
}
/** @param {number[]} rowMajor @returns {number[]} */
function checkGrid(rowMajor) { return syndrome(rowMajor.slice().reverse()); }
assert.deepEqual(checkGrid(bytes), Array(16).fill(0), "original table is a codeword");

/** @type {number[]} */
const perimeter = [];
/** @type {number[]} */
const interior = [];
for (let position = 0; position < 256; position++) {
  const row = Math.floor(position / 8);
  const column = position % 8;
  (row === 0 || row === 31 || column === 0 || column === 7 ? perimeter : interior)
    .push(position);
}
assert.equal(perimeter.length, 76);
assert.equal(interior.length, 180);

// Each perimeter position contributes a fixed column to the 16-dimensional
// parity-check matrix. No unknown GP symbol needs to be guessed.
const basis = perimeter.map(position => {
  const unit = Array(256).fill(0);
  unit[position] = 1;
  return checkGrid(unit);
});
const matrix = Array.from({length: 16}, (_, row) => basis.map(col => col[row]));
/**
 * Row-reduce a rectangular 16x76 GF29 matrix and select independent columns.
 * @param {number[][]} input
 * @returns {number[]} Column indices of the deterministic independent pivots.
 */
function independentColumns(input) {
  const work = input.map(row => row.slice());
  const pivots = [];
  let rank = 0;
  for (let col = 0; col < work[0].length && rank < 16; col++) {
    let chosen = rank;
    while (chosen < 16 && work[chosen][col] === 0) chosen++;
    if (chosen === 16) continue;
    [work[rank], work[chosen]] = [work[chosen], work[rank]];
    const multiplier = inv(work[rank][col]);
    for (let j = col; j < work[rank].length; j++) {
      work[rank][j] = mod(work[rank][j] * multiplier);
    }
    for (let row = 0; row < 16; row++) {
      if (row === rank) continue;
      const factor = work[row][col];
      if (factor === 0) continue;
      for (let j = col; j < work[row].length; j++) {
        work[row][j] = mod(work[row][j] - factor * work[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }
  return pivots;
}
const pivots = independentColumns(matrix);
assert.equal(pivots.length, 16);
assert.deepEqual(pivots.map(col => perimeter[col]),
  [0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39]);

/**
 * Solve the full-rank 16x16 parity submatrix for a specified syndrome.
 * @param {number[]} target The negated partial-grid syndrome.
 * @returns {number[]} Sixteen pivot values.
 */
function solvePivots(target) {
  const rows = Array.from({length: 16}, (_, r) =>
    [...pivots.map(col => matrix[r][col]), target[r]]);
  for (let col = 0; col < 16; col++) {
    let chosen = col;
    while (chosen < 16 && rows[chosen][col] === 0) chosen++;
    assert.ok(chosen < 16, "pivot system must be full rank");
    [rows[col], rows[chosen]] = [rows[chosen], rows[col]];
    const factor = inv(rows[col][col]);
    for (let j = col; j <= 16; j++) rows[col][j] = mod(rows[col][j] * factor);
    for (let row = 0; row < 16; row++) {
      if (row === col) continue;
      const multiplier = rows[row][col];
      for (let j = col; j <= 16; j++) {
        rows[row][j] = mod(rows[row][j] - multiplier * rows[col][j]);
      }
    }
  }
  return rows.map(row => row[16]);
}

/**
 * Convert the independently established English reading of p56 to GP symbols.
 * Space boundaries must interrupt greedy GP digraph parsing.
 * @param {string} words Space-separated authentic GP spelling.
 * @returns {number[]}
 */
function toGP(words) {
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const values = [];
  for (const word of words.split(" ")) {
    for (let cursor = 0; cursor < word.length;) {
      const token = tokens.find(candidate => word.startsWith(candidate, cursor));
      assert.ok(token, "unencodable source text at " + word.slice(cursor));
      values.push(corpus.translit.indexOf(token));
      cursor += token.length;
    }
  }
  return values;
}
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p56 = corpus.pages.find(page => page.page === 56).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const p56Plaintext = toGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56Plaintext.length, 85);

const assembled = Array(256).fill(0);
perimeter.forEach((pos, i) => { assembled[pos] = p55[i]; });
interior.forEach((pos, i) => { assembled[pos] = [...p56Plaintext, ...p57][i]; });
const originalSyndrome = checkGrid(assembled);
assert.deepEqual(originalSyndrome,[5,7,27,12,4,24,25,13,17,28,19,22,26,8,14,13]);
/**
 * Exactly repair a freely specified 60-position perimeter assignment.
 * @param {number[]} grid A 256-position row-major GP29 array.
 * @returns {number[]} Completed codeword.
 */
function complete(grid) {
  const result = grid.slice();
  for (const col of pivots) result[perimeter[col]] = 0;
  const target = checkGrid(result).map(value => mod(-value));
  const values = solvePivots(target);
  pivots.forEach((col, index) => { result[perimeter[col]] = values[index]; });
  assert.deepEqual(checkGrid(result), Array(16).fill(0));
  return result;
}
const completed = complete(assembled);
assert.deepEqual(pivots.map(col => completed[perimeter[col]]),
  [10,20,2,18,10,9,15,19,20,28,1,6,18,13,26,8]);
assert.equal(perimeter.filter(position => assembled[position] !== completed[position]).length,15);
for(const position of interior) assert.equal(completed[position], assembled[position]);

// Another independent assignment of a free GP rune creates another fully
// valid codeword with identical solved p56+p57 and different p55 perimeter.
const freePosition = perimeter.find(pos => !pivots.some(j => perimeter[j] === pos));
const variant = assembled.slice();
variant[freePosition] = mod(variant[freePosition] + 1);
const other = complete(variant);
assert.notDeepEqual(other, completed);
for(const position of interior) assert.equal(other[position], completed[position]);
assert.deepEqual(checkGrid(other), Array(16).fill(0));

const output = {
  sourceByteHash: crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  sourceFactorAscending: generator,
  originalSourceGridSyndrome: checkGrid(bytes),
  terminalKnownInteriorRunes: interior.length,
  terminalUnknownBorderRunes: perimeter.length,
  exactPerimeterSyndromeRank: pivots.length,
  independentPerimeterPositions: pivots.map(col => perimeter[col]),
  fixedKnownInteriorCompletions: "29^60",
  observedP55PlusSolvedP56P57Syndrome: originalSyndrome,
  completedSyndrome: checkGrid(completed),
  changedP55CellsToConstructOneCodeword: 15,
  secondDistinctCodewordWithSameKnownInterior: true,
  interpretation: "Capacity bound; no recovered LP2 plaintext or authentic coder instruction",
};
console.log(JSON.stringify(output, null, 2));
