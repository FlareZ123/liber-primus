'use strict';

/**
 * Original LP2 GP29 nonzero-difference tape: an all-28!-permutation
 * capacity gate for conventional five base-28 digits to three bytes.
 *
 * Windows Node.js 22 / CommonJS, no CLI arguments, no file writes.
 * Run this SFT from any current directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter(p => p.page <= 55).map(p => p.indices);
const full = pages.flat();
assert.equal(full.length, 12956);
assert.equal(pages.length, 56);

/** @param {number[]} x */
function steps(x) {
  return x.slice(1).map((v, i) => (v - x[i] + 29) % 29);
}

/** @param {number[]} x */
function splitOnZero(x) {
  /** @type {number[][]} */
  const chunks = [[]];
  for (const v of x) {
    if (v === 0) chunks.push([]);
    else chunks[chunks.length - 1].push(v);
  }
  return chunks;
}

/**
 * Count distinct successor values for every possible input step selected
 * as the secret digit 27. A valid packed byte triple requires the second
 * most significant base-28 digit to be in 0..8, hence <=9 successors.
 *
 * @param {number[][]} sequences source steps, with zero removed
 * @param {number} phase common group start modulo five
 * @param {boolean} littleEndian whether the fifth step is most significant
 */
function successorCapacity(sequences, phase, littleEndian) {
  const successors = Array.from({length: 28}, () => new Set());
  let groups = 0;
  for (const seq of sequences) {
    for (let i = phase; i + 5 <= seq.length; i += 5) {
      const w = seq.slice(i, i + 5);
      assert.ok(w.every(v => v >= 1 && v <= 28));
      const high = w[littleEndian ? 4 : 0] - 1;
      const next = w[littleEndian ? 3 : 1] - 1;
      successors[high].add(next);
      groups++;
    }
  }
  const degrees = successors.map(s => s.size);
  return {groups, minDegree: Math.min(...degrees), maxDegree: Math.max(...degrees)};
}

const allSteps = steps(full);
assert.equal(allSteps.length, 12955);
assert.equal(allSteps.filter(v => v === 0).length, 86);
const pageSteps = pages.map(steps);
const modes = {
  dropZeroWholeBook: [allSteps.filter(v => v !== 0)],
  resetAtZero: splitOnZero(allSteps),
  resetAtPage: pageSteps.map(seq => seq.filter(v => v !== 0)),
  resetAtPageAndZero: pageSteps.flatMap(splitOnZero)
};

/** @type {Record<string, {min: number, max: number, minGroups: number, maxGroups: number}>} */
const results = {};
for (const [mode, sequences] of Object.entries(modes)) {
  let minimum = Infinity;
  let maximum = -Infinity;
  let minGroups = Infinity;
  let maxGroups = 0;
  for (let phase = 0; phase < 5; phase++) {
    for (const littleEndian of [false, true]) {
      const r = successorCapacity(sequences, phase, littleEndian);
      assert.ok(r.groups >= 2398, 'Original stream group count');
      assert.ok(r.minDegree >= 22,
        'A shared secret alphabet must have more than nine successors');
      minimum = Math.min(minimum, r.minDegree);
      maximum = Math.max(maximum, r.minDegree);
      minGroups = Math.min(minGroups, r.groups);
      maxGroups = Math.max(maxGroups, r.groups);
    }
  }
  results[mode] = {min: minimum, max: maximum, minGroups, maxGroups};
}
assert.deepEqual(Object.fromEntries(
  Object.entries(results).map(([mode, r]) => [mode, r.min])
), {
  dropZeroWholeBook: 23,
  resetAtZero: 24,
  resetAtPage: 23,
  resetAtPageAndZero: 22
});

// Byte-packing arithmetic behind the exact secret-key obstruction.
assert.equal(28 ** 5, 17210368);
assert.equal(2 ** 24, 16777216);
assert.equal(2 ** 24 - 27 * 28 ** 4, 181504);
assert.ok(8 * 28 ** 3 <= 181504 && 9 * 28 ** 3 > 181504);

/** @param {number} value */
function fiveDigits(value) {
  assert.ok(Number.isInteger(value) && value >= 0 && value < 2 ** 24);
  const digits = Array(5).fill(0);
  for (let i = 4; i >= 0; i--) {
    digits[i] = value % 28;
    value = Math.floor(value / 28);
  }
  return digits;
}

/** @param {number[]} digits */
function threeBytes(digits) {
  assert.equal(digits.length, 5);
  let value = 0;
  for (const digit of digits) value = value * 28 + digit;
  assert.ok(value < 2 ** 24, 'A three-byte group must fit 24 bits');
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Calibrated positive: an arbitrary unknown *bijective* secret GP28
// digit relabeling, then predecessor-cumulative GP29 emission.
// The full three-byte test file is recovered exactly by the true inverse.
const plain = Buffer.alloc(3000);
for (let i = 0; i < plain.length; i++)
  plain[i] = (73 * i + (i * i) % 251 + 17) % 256;
for (let i = 0; i < plain.length; i += 150)
  plain.set([255, 255, 255], i);

const digits = [];
for (let i = 0; i < plain.length; i += 3)
  digits.push(...fiveDigits((plain[i] << 16) | (plain[i + 1] << 8) | plain[i + 2]));

const secretAlphabet = Array.from({length: 28}, (_, d) => (11 * d + 7) % 28 + 1);
assert.equal(new Set(secretAlphabet).size, 28);
const inverseAlphabet = Array(29).fill(-1);
secretAlphabet.forEach((symbol, digit) => {inverseAlphabet[symbol] = digit;});

let predecessor = 9;
const ciphertext = [predecessor];
for (const digit of digits) {
  predecessor = (predecessor + secretAlphabet[digit]) % 29;
  ciphertext.push(predecessor);
}
const recoveredSteps = steps(ciphertext);
assert.deepEqual(recoveredSteps, digits.map(d => secretAlphabet[d]));
const sourceLikePositive = successorCapacity([recoveredSteps], 0, false);
assert.ok(sourceLikePositive.groups === 1000);
assert.ok(sourceLikePositive.minDegree <= 9);

const output = [];
for (let i = 0; i < recoveredSteps.length; i += 5)
  output.push(...threeBytes(recoveredSteps.slice(i, i + 5).map(s => inverseAlphabet[s])));
assert.deepEqual(Buffer.from(output), plain);

console.log(JSON.stringify({
  sourceRunes: full.length,
  sourceZeroSteps: 86,
  originalCapacity: results,
  necessaryMaximumSuccessors: 9,
  plantedByteTriplesRecovered: 1000,
  plantedByteCountRecovered: output.length,
  verdict: 'PASS: original violates every fixed-alphabet packed3byte model; planted inverse recovers all bytes'
}, null, 2));
