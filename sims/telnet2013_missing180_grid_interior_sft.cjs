'use strict';
/**
 * Original-source 180-cell bridge: 2013 omitted primes vs LP2 grid interior.
 *
 * The archived 2013 telnet prime output jumps from 71 (p20) to 1229 (p201),
 * omitting exactly p21..p200. LP2's original 32x8 table has a 30x6
 * interior. This test exhausts the eight source-natural rectangle readings
 * and proves a key-independent lower bound on errors under ANY stationary
 * residue-to-residue map. It does not test nonlinear position-dependent
 * registers, nor authenticate the secondary historical telnet transcript.
 *
 * Run on Windows 11 or other platforms: node sims/telnet2013_missing180_grid_interior_sft.cjs
 * @module telnet2013_missing180_grid_interior_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const gridPath = path.join(__dirname, '..', 'resources', 'liber-primus',
  'base60-grid.json');
const source = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const table = source.byte_rows;
assert.equal(table.length, 32);
assert.ok(table.every((row) => row.length === 8 &&
  row.every((value) => Number.isInteger(value) && value >= 0 && value < 256)));

/** @returns {number[]} p21..p200 inclusive, in historical ascending order. */
function omittedPrimes() {
  const primes = [];
  for (let number = 2; number <= 1229; number++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= number; divisor++) {
      if (number % divisor === 0) { prime = false; break; }
    }
    if (prime) primes.push(number);
  }
  assert.equal(primes[19], 71);
  assert.equal(primes[200], 1229);
  const missing = primes.slice(20, 200);
  assert.equal(missing.length, 180);
  assert.equal(missing[0], 73);
  assert.equal(missing[179], 1223);
  return missing;
}

const missing = omittedPrimes();
const interior = table.slice(1, 31).map((row) => row.slice(1, 7));
assert.equal(interior.length, 30);
assert.ok(interior.every((row) => row.length === 6));

/**
 * Read the 30x6 source interior with optional vertical/horizontal reversal
 * and horizontal or column-major traversal. No fitted start, skip, or phase.
 * @param {boolean} flipRows
 * @param {boolean} flipCols
 * @param {boolean} columnMajor
 * @returns {number[]}
 */
function readInterior(flipRows, flipCols, columnMajor) {
  const rows = (flipRows ? [...interior].reverse() : interior).map(
    (row) => flipCols ? [...row].reverse() : [...row]);
  return columnMajor
    ? Array.from({length: 6}, (_, col) => rows.map((row) => row[col])).flat()
    : rows.flat();
}

/**
 * For input residues x_i and output residues y_i, a secret stationary
 * lookup f(x) must map every repeated input to one output. At most the
 * modal count for each input can be matched, even granting a many-to-one f.
 * Hence sum_i 1[f(x_i) != y_i] >= N - sum_x max_y count(x,y).
 *
 * This is a necessary-condition theorem for every fixed lookup, including
 * all secret alphabet permutations and all affine maps.
 * @param {number[]} inputs
 * @param {number[]} outputs
 * @param {number} modulus
 * @returns {{exact: number, maxMatches: number, minimumChanges: number,
 *            distinctInputs: number, inconsistentInputs: number}}
 */
function evaluate(inputs, outputs, modulus) {
  assert.equal(inputs.length, outputs.length);
  const histograms = new Map();
  let exact = 0;
  inputs.forEach((input, i) => {
    const x = input % modulus;
    const y = outputs[i] % modulus;
    if (x === y) exact++;
    if (!histograms.has(x)) histograms.set(x, new Map());
    const counts = histograms.get(x);
    counts.set(y, (counts.get(y) || 0) + 1);
  });
  let maxMatches = 0;
  let inconsistentInputs = 0;
  for (const counts of histograms.values()) {
    maxMatches += Math.max(...counts.values());
    if (counts.size > 1) inconsistentInputs++;
  }
  return {
    exact, maxMatches, minimumChanges: inputs.length - maxMatches,
    distinctInputs: histograms.size, inconsistentInputs
  };
}

const transforms = {
  raw: missing,
  reversed_decimal: missing.map((prime) =>
    Number([...String(prime)].reverse().join('')))
};
const rows = [];
for (const [operation, primes] of Object.entries(transforms)) {
for (const modulus of [29, 60, 256]) {
  const readings = [];
  for (const flipRows of [false, true]) {
    for (const flipCols of [false, true]) {
      for (const columnMajor of [false, true]) {
        readings.push({
          flipRows, flipCols, columnMajor,
          ...evaluate(primes, readInterior(flipRows, flipCols, columnMajor), modulus)
        });
      }
    }
  }
  assert.equal(readings.length, 8);
  const minimumErrors = Math.min(...readings.map((r) => r.minimumChanges));
  const expected = {
    raw: {29: 132, 60: 148, 256: 69},
    reversed_decimal: {29: 135, 60: 135, 256: 38}
  }[operation][modulus];
  assert.equal(minimumErrors, expected);
  const planted = primes.map((prime) => (7 * (prime % modulus) + 11) % modulus);
  assert.equal(evaluate(primes, planted, modulus).minimumChanges, 0);
  rows.push({
    operation, modulus, sourcePrimes: primes.length,
    naturalOrientations: readings.length,
    bestPossibleExactCellsUnderAnyFixedLookup: 180 - minimumErrors,
    minimumChangedCells: minimumErrors,
    plantedStationaryLookupMinimumChanges: 0,
    readings
  });
}
}
console.log(JSON.stringify({
  hypothesis: '2013 missing p21..p200 primes (direct or historical decimal reversal) encode the 30x6 LP2 table interior via one stationary lookup',
  source: 'secondary 2013 telnet transcript + source-printed LP2 32x8 table',
  sourceOmittedPrimeEndpoints: [missing[0], missing[179]],
  note: 'A fixed residue map is mathematically inconsistent in every natural rectangle reading. Position-dependent maps, transpositions outside the eight readings, and unrelated uses of these source numbers remain open.',
  results: rows
}, null, 2));
