"use strict";

/**
 * SFT: the two authenticated 2014 magic squares with sum1033 contain a unique
 * center-out lexical chain under one integer radix.
 *
 * Frozen family:
 * - use only the two source squares whose authenticated magic sum is1033;
 * - measure each cell by Chebyshev radius from its square center;
 * - charge every integer radix2..max cell and every valid signed-source start;
 * - require radius r=0,1,2,3 to contain a two-digit forward source pair
 *   [start+r, start+r+1].
 *
 * No target words or target integer values are supplied to the search.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @param {number} radix @returns {number[]} */
function digits(value, radix) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  assert.ok(Number.isSafeInteger(radix) && radix >= 2);
  if (value === 0) return [0];
  const out = [];
  let current = value;
  while (current > 0) {
    out.unshift(current % radix);
    current = Math.floor(current / radix);
  }
  return out;
}

/** @param {number[][]} square @returns {number} */
function magicSum(square) {
  return square[0].reduce((sum, value) => sum + value, 0);
}

/**
 * Chebyshev radius from the unique center of an odd square.
 *
 * @param {number} size
 * @param {number} row
 * @param {number} column
 * @returns {number}
 */
function radius(size, row, column) {
  const middle = (size - 1) / 2;
  return Math.max(Math.abs(row - middle), Math.abs(column - middle));
}

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

assert.deepEqual(
  squares.map((square) => ({size: square.length, sum: magicSum(square)})),
  [
    {size: 5, sum: 3301},
    {size: 7, sum: 1033},
    {size: 5, sum: 1033},
  ]
);

const sourceSquares = squares.filter((square) => magicSum(square) === 1033);
assert.deepEqual(sourceSquares.map((square) => square.length), [7, 5]);

const cells = [];
for (let squareIndex = 0; squareIndex < sourceSquares.length; squareIndex += 1) {
  const square = sourceSquares[squareIndex];
  for (let row = 0; row < square.length; row += 1) {
    for (let column = 0; column < square[row].length; column += 1) {
      cells.push({
        squareIndex,
        size: square.length,
        row,
        column,
        radius: radius(square.length, row, column),
        value: square[row][column],
      });
    }
  }
}
assert.equal(cells.length, 74);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clearStart = signed.indexOf("Hello.");
const clearEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(clearStart >= 0 && clearEnd > clearStart);

const source = signed
  .slice(clearStart, clearEnd)
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());

assert.equal(source.length, 43);

const maxCell = Math.max(...cells.map((cell) => cell.value));
assert.equal(maxCell, 456);

const hits = [];

for (let radix = 2; radix <= maxCell; radix += 1) {
  for (let start = 0; start + 4 < source.length; start += 1) {
    const evidence = [];
    let valid = true;

    for (let currentRadius = 0; currentRadius <= 3; currentRadius += 1) {
      const expected = [start + currentRadius, start + currentRadius + 1];
      const occurrences = cells.filter((cell) =>
        cell.radius === currentRadius
        && JSON.stringify(digits(cell.value, radix)) === JSON.stringify(expected)
      );

      if (!occurrences.length) {
        valid = false;
        break;
      }

      evidence.push({
        radius: currentRadius,
        pair: expected,
        values: [...new Set(occurrences.map((cell) => cell.value))],
        occurrences: occurrences.map((cell) => ({
          squareIndex: cell.squareIndex,
          size: cell.size,
          row: cell.row,
          column: cell.column,
        })),
      });
    }

    if (valid) hits.push({radix, start, evidence});
  }
}

assert.equal(hits.length, 1);
assert.equal(hits[0].radix, 29);
assert.equal(hits[0].start, 3);
assert.deepEqual(
  hits[0].evidence.map((row) => ({
    radius: row.radius,
    pair: row.pair,
    values: row.values,
  })),
  [
    {radius: 0, pair: [3, 4], values: [91]},
    {radius: 1, pair: [4, 5], values: [121]},
    {radius: 2, pair: [5, 6], values: [151]},
    {radius: 3, pair: [6, 7], values: [181]},
  ]
);

const chainValues = hits[0].evidence.map((row) => row.values[0]);
assert.deepEqual(chainValues, [91, 121, 151, 181]);
assert.deepEqual(
  chainValues.map((value, index) => value - (30 * index)),
  [91, 91, 91, 91]
);

const chainIndices = [3, 4, 5, 6, 7];
const chainWords = chainIndices.map((index) => source[index]);
assert.deepEqual(chainWords, [
  "LIES",
  "EMPTY",
  "EPIPHANY",
  "SEEKS",
  "THE",
]);

// The source geometry itself orders the chain center-out.
// 91 is the 5x5 center; successive links occupy radii1,2,3.
assert.deepEqual(
  hits[0].evidence.map((row) => row.occurrences),
  [
    [{squareIndex: 1, size: 5, row: 2, column: 2}],
    [
      {squareIndex: 0, size: 7, row: 2, column: 2},
      {squareIndex: 0, size: 7, row: 4, column: 4},
    ],
    [
      {squareIndex: 1, size: 5, row: 0, column: 4},
      {squareIndex: 1, size: 5, row: 4, column: 0},
    ],
    [
      {squareIndex: 0, size: 7, row: 0, column: 6},
      {squareIndex: 0, size: 7, row: 6, column: 0},
    ],
  ]
);

// BASE29 explains the +30 arithmetic progression directly:
// [n,n+1]_29 = 29*n + (n+1) = 30*n + 1.
for (let index = 0; index < chainValues.length; index += 1) {
  const n = 3 + index;
  assert.equal(chainValues[index], (30 * n) + 1);
  assert.deepEqual(digits(chainValues[index], 29), [n, n + 1]);
}

console.log(JSON.stringify({
  status: "PASS",
  sourceSquareFamily: {
    magicSum: 1033,
    sizes: sourceSquares.map((square) => square.length),
    cells: cells.length,
    maxCell,
  },
  chargedFamily: {
    radices: [2, maxCell],
    sourceStarts: [0, source.length - 5],
    hits: hits.length,
  },
  uniqueHit: hits[0],
  centerOutRead: {
    values: chainValues,
    sourceIndices: chainIndices,
    words: chainWords,
    collapsedText: chainWords.join(" "),
  },
  decision:
    "Across every radix2..456 and every valid signed-source start, the two "
    + "authenticated 1033-sum squares have one center-out radius0..3 chain "
    + "of forward adjacent source pairs: BASE29 start3, yielding "
    + "LIES EMPTY EPIPHANY SEEKS THE.",
}, null, 2));
