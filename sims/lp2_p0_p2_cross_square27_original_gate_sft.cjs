'use strict';

/**
 * Physical LP2 p0-p2 / scan17-19, 729-rune (27x27) layout gate.
 * Source: resources/liber-primus/lp2-corpus.json.
 * Tests row/column uniqueness against page-internal, count-preserving shuffles.
 * This is a structural screen, not a plaintext decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = corpus.pages.slice(0, 3);
const lengths = pages.map((page) => page.runic_count);
const source = pages.flatMap((page) => page.indices);
const side = 27;
const trials = 10000;
assert.deepEqual(lengths, [262, 266, 201]);
assert.equal(source.length, side * side);
assert.ok(source.every((v) => Number.isInteger(v) && v >= 0 && v < 29));

/** @param {number[]} stream @param {'row'|'column'} orientation */
function distinctSum(stream, orientation) {
  let count = 0;
  for (let i = 0; i < side; i += 1) {
    const symbols = new Set();
    for (let j = 0; j < side; j += 1) {
      symbols.add(stream[orientation === 'row'
        ? i * side + j
        : j * side + i]);
    }
    count += symbols.size;
  }
  return count;
}

/** @param {number[]} stream */
function indexOfCoincidence(stream) {
  const counts = Array(29).fill(0);
  for (const value of stream) counts[value] += 1;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0)
    / (stream.length * (stream.length - 1));
}

let seed = 0x5cf28e;
/** @returns {number} */
function uniform() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

/** @param {number[]} stream */
function permuteWithinPages(stream) {
  const copy = stream.slice();
  let start = 0;
  for (const length of lengths) {
    for (let i = start + length - 1; i > start; i -= 1) {
      const j = start + Math.floor(uniform() * (i - start + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    start += length;
  }
  return copy;
}

const observed = {
  row: distinctSum(source, 'row'),
  column: distinctSum(source, 'column'),
  ioc: indexOfCoincidence(source),
};
const nulls = { row: [], column: [] };
for (let trial = 0; trial < trials; trial += 1) {
  const sample = permuteWithinPages(source);
  nulls.row.push(distinctSum(sample, 'row'));
  nulls.column.push(distinctSum(sample, 'column'));
}
const summary = Object.fromEntries(['row', 'column'].map((orientation) => {
  const values = nulls[orientation];
  const mean = values.reduce((sum, n) => sum + n, 0) / trials;
  const ge = values.filter((n) => n >= observed[orientation]).length;
  const le = values.filter((n) => n <= observed[orientation]).length;
  return [orientation, {
    observed: observed[orientation],
    nullMean: mean,
    greaterOrEqual: ge,
    lessOrEqual: le,
    lowerTailAddOne: (le + 1) / (trials + 1),
    upperTailAddOne: (ge + 1) / (trials + 1),
  }];
}));

assert.equal(observed.row, 471);
assert.equal(observed.column, 476);
assert.ok(Math.abs(observed.ioc - 0.034082515563997044) < 1e-14);
assert.equal(new Set(Array.from({ length: side }, (_, i) => i)).size, 27);
assert.equal(distinctSum(
  Array.from({ length: side * side }, (_, i) => (Math.floor(i / side) + i % side) % side),
  'row',
), 729);
assert.equal(distinctSum(
  Array.from({ length: side * side }, (_, i) => (Math.floor(i / side) + i % side) % side),
  'column',
), 729);
console.log(JSON.stringify({
  originalPages: [0, 1, 2],
  lengths,
  side,
  totalRunes: source.length,
  originalIoC: observed.ioc,
  shuffleSeed: '0x5cf28e',
  trials,
  summary,
  conclusion: 'No row/column distinctness anomaly; no recovered original plaintext.',
}, null, 2));
