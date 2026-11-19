"use strict";

/**
 * SFT: after the three authenticated square centers independently select
 * BASE29, charge every square cell under that fixed radix and test whether
 * non-center cells extend the signed-source adjacency structure.
 *
 * Secondary family control:
 * scan every radix 2..max(square cell) and measure the longest run of
 * forward-adjacent source-index bigrams carried by distinct square values.
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

/**
 * @param {number} value
 * @param {number} radix
 * @returns {number[]}
 */
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

/**
 * Longest consecutive run in a sorted unique integer list.
 *
 * @param {number[]} values
 * @returns {number[]}
 */
function longestConsecutiveRun(values) {
  if (!values.length) return [];

  let best = [values[0]];
  let current = [values[0]];

  for (let index = 1; index < values.length; index += 1) {
    if (values[index] === current.at(-1) + 1) {
      current.push(values[index]);
    } else {
      if (current.length > best.length) best = current;
      current = [values[index]];
    }
  }

  if (current.length > best.length) best = current;
  return best;
}

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);

const occurrences = [];
for (let squareIndex = 0; squareIndex < squares.length; squareIndex += 1) {
  const square = squares[squareIndex];
  for (let row = 0; row < square.length; row += 1) {
    for (let column = 0; column < square[row].length; column += 1) {
      occurrences.push({
        squareIndex,
        row,
        column,
        value: square[row][column],
      });
    }
  }
}

assert.equal(occurrences.length, 99);

const distinctValues = [...new Set(occurrences.map((row) => row.value))]
  .sort((left, right) => left - right);
assert.equal(distinctValues.length, 50);

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

/**
 * Return distinct square values whose two radix digits are the forward source
 * pair [n,n+1].
 *
 * @param {number} radix
 * @returns {{value:number,pair:number[]}[]}
 */
function forwardAdjacentValues(radix) {
  return distinctValues
    .map((value) => ({value, pair: digits(value, radix)}))
    .filter((row) =>
      row.pair.length === 2
      && row.pair.every((index) => index >= 0 && index < source.length)
      && row.pair[1] === row.pair[0] + 1
    );
}

const radixRows = [];
const maxCell = Math.max(...distinctValues);

for (let radix = 2; radix <= maxCell; radix += 1) {
  const hits = forwardAdjacentValues(radix);
  const starts = [...new Set(hits.map((row) => row.pair[0]))]
    .sort((left, right) => left - right);
  const run = longestConsecutiveRun(starts);
  if (hits.length) radixRows.push({radix, hits, starts, run});
}

const maxRunLength = Math.max(...radixRows.map((row) => row.run.length));
assert.equal(maxRunLength, 4);

const maxRunRows = radixRows.filter((row) => row.run.length === maxRunLength);
assert.equal(maxRunRows.length, 1);
assert.equal(maxRunRows[0].radix, 29);
assert.deepEqual(maxRunRows[0].run, [3, 4, 5, 6]);

const base29Forward = forwardAdjacentValues(29);
assert.deepEqual(base29Forward, [
  {value: 91, pair: [3, 4]},
  {value: 121, pair: [4, 5]},
  {value: 151, pair: [5, 6]},
  {value: 181, pair: [6, 7]},
  {value: 331, pair: [11, 12]},
]);

const base29Reverse = distinctValues
  .map((value) => ({value, pair: digits(value, 29)}))
  .filter((row) =>
    row.pair.length === 2
    && row.pair.every((index) => index >= 0 && index < source.length)
    && row.pair[0] === row.pair[1] + 1
  );

assert.deepEqual(base29Reverse, [
  {value: 809, pair: [27, 26]},
]);

const chainValues = [91, 121, 151, 181];
const chainOccurrences = chainValues.map((value) => ({
  value,
  occurrences: occurrences
    .filter((row) => row.value === value)
    .map(({squareIndex, row, column}) => ({squareIndex, row, column})),
}));

assert.deepEqual(chainOccurrences, [
  {
    value: 91,
    occurrences: [{squareIndex: 2, row: 2, column: 2}],
  },
  {
    value: 121,
    occurrences: [
      {squareIndex: 1, row: 2, column: 2},
      {squareIndex: 1, row: 4, column: 4},
    ],
  },
  {
    value: 151,
    occurrences: [
      {squareIndex: 2, row: 0, column: 4},
      {squareIndex: 2, row: 4, column: 0},
    ],
  },
  {
    value: 181,
    occurrences: [
      {squareIndex: 1, row: 0, column: 6},
      {squareIndex: 1, row: 6, column: 0},
    ],
  },
]);

const chainIndices = [3, 4, 5, 6, 7];
const chainWords = chainIndices.map((index) => source[index]);
assert.deepEqual(chainWords, [
  "LIES",
  "EMPTY",
  "EPIPHANY",
  "SEEKS",
  "THE",
]);

// The p0 phrase appears as one held-out square-cell bigram after BASE29 was
// selected from the centers.
assert.deepEqual(digits(151, 29), [5, 6]);
assert.deepEqual([source[5], source[6]], ["EPIPHANY", "SEEKS"]);

// Honest next-chain prediction: [7,8] would be 7*29+8 = 211.
// It is absent from all three source squares.
const nextValue = (7 * 29) + 8;
assert.equal(nextValue, 211);
assert.ok(!distinctValues.includes(nextValue));
assert.deepEqual([source[7], source[8]], ["THE", "DEVOTED"]);

// Also record the already established center controls under the same radix.
assert.deepEqual(digits(331, 29), [11, 12]);
assert.deepEqual([source[11], source[12]], ["IS", "THE"]);
assert.deepEqual(digits(809, 29), [27, 26]);
assert.deepEqual([source[26], source[27]], ["NUMBERS", "ARE"]);

// The fixed pp49-51 byte table is a natural 0..255 receiver for predicted211.
// It supplies no source-register continuation under the existing base59 read.
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(grid.bytes.length, 256);
assert.equal(grid.bytes[211], 61);

const alphabet = grid.alphabet;
const byte211 = grid.bytes[211];
const token211 = alphabet[Math.floor(byte211 / 60)] + alphabet[byte211 % 60];
const base59Value211 = (Math.floor(byte211 / 60) * 59) + (byte211 % 60);
assert.equal(token211, "11");
assert.equal(base59Value211, 60);

console.log(JSON.stringify({
  status: "PASS",
  squareCells: {
    occurrences: occurrences.length,
    distinctValues: distinctValues.length,
    maxCell,
  },
  radixFamily: {
    chargedRadices: [2, maxCell],
    uniqueLongestRun: {
      radix: maxRunRows[0].radix,
      starts: maxRunRows[0].run,
      length: maxRunLength,
    },
    base29Forward,
    base29Reverse,
  },
  heldOutChain: {
    values: chainValues,
    occurrences: chainOccurrences,
    sourceIndices: chainIndices,
    words: chainWords,
    embeddedP0Pair: {
      value: 151,
      indices: [5, 6],
      words: ["EPIPHANY", "SEEKS"],
    },
  },
  nextPrediction: {
    indices: [7, 8],
    words: ["THE", "DEVOTED"],
    value: nextValue,
    presentInSquares: false,
    p50Cell211: {
      byte: byte211,
      token: token211,
      base59Value: base59Value211,
    },
  },
  decision:
    "After BASE29 was selected by the three centers, non-center cells 121, "
    + "151 and 181 extend center91 into the exact overlapping signed-source "
    + "chain 3->4->5->6->7. Across all radices through the largest square "
    + "cell, BASE29 alone has a forward-adjacent start run of length4. "
    + "The chain stops at THE7 under the tested square and p50 continuation.",
}, null, 2));
