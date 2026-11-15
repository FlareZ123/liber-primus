'use strict';

/**
 * Exact all-secret GF(29) p15-matrix feasibility gate under the historically
 * observed plaintext-F passthrough. Node.js 22, CommonJS, no dependencies.
 *
 * Original source: resources/liber-primus/lp2-corpus.json.
 * Source hypothesis: p15's independently reconstructed signed 4x4 matrix.
 *
 * Cipher model: each non-F plaintext rune consumes one coordinate of
 * M^(floor((clock+phase)/4)) * v0. A plaintext F emits literal ciphertext F
 * without consuming a key coordinate. Ciphertext F can also be an encrypted
 * non-F, and both interpretations are searched exactly.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const MOD = 29;
const BASE = 29 ** 4;
const MATRIX = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22],
];
const UNSIGNED_MATRIX = [
  [10, 3, 20, 22], [1, 22, 21, 25],
  [11, 17, 19, 7], [21, 17, 12, 22],
];
const original = corpus.pages
  .filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices)
  .slice(8);
const p57 = corpus.pages.find(p => p.page === 57).indices;

assert.equal(original.length, 3000);
assert.equal(original.filter(x => x === 0).length, 124);
assert.equal(p57.length, 95);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  return a.map(row => [0, 1, 2, 3].map(col =>
    row.reduce((sum, x, i) => sum + x * b[i][col], 0) % MOD
  ));
}

/** @param {number} length @returns {number[][]} */
function makeRows(length, source = MATRIX) {
  const rows = [];
  let matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  for (let i = 0; i <= Math.ceil((length + 3) / 4); i++) {
    for (const row of matrix) rows.push(row);
    matrix = multiply(source, matrix);
  }
  return rows;
}
const rows = makeRows(original.length);
const unsignedRows = makeRows(original.length, UNSIGNED_MATRIX);

/** @param {number} seed @returns {number[]} */
function unpack(seed) {
  return [
    Math.floor(seed / 24389),
    Math.floor(seed / 841) % MOD,
    Math.floor(seed / MOD) % MOD,
    seed % MOD,
  ];
}

/** @param {number[]} v @param {number} k @param {number} phase @returns {number} */
function key(v, k, phase, emissions = rows) {
  const r = emissions[k + phase];
  return (r[0] * v[0] + r[1] * v[1] + r[2] * v[2] + r[3] * v[3]) % MOD;
}

/**
 * Dynamic-programming existential inverse. States are exact numbers of
 * consumed key symbols; the entire set of F bypass histories is retained.
 *
 * @param {number[]} cipher Source-original or planted GP29 ciphertext.
 * @param {number[]} v Secret 4-vector.
 * @param {number} phase 0,1,2,3: every possible within-block clock origin.
 * @returns {number} Maximal feasible complete ciphertext prefix.
 */
function reachablePrefix(cipher, v, phase, emissions = rows) {
  let states = [0];
  for (let pos = 0; pos < cipher.length; pos++) {
    const c = cipher[pos];
    const next = [];
    let last = -1;
    for (const k of states) {
      const a = key(v, k, phase, emissions);
      if (c === 0) {
        // Literal plaintext F. Does not consume any key.
        if (last !== k) {
          next.push(k);
          last = k;
        }
        // An encrypted non-F may also happen to emit ciphertext F.
        if (a !== 0 && last !== k + 1) {
          next.push(k + 1);
          last = k + 1;
        }
      } else if (a !== c) {
        // Ordinary consuming plaintext is non-F. An inverse F is illegal.
        next.push(k + 1);
      }
    }
    if (next.length === 0) return pos;
    states = next;
  }
  return cipher.length;
}

/**
 * Independent direct recursive oracle for small prefixes, avoiding DP
 * state merging. It checks that the exact F-branching implementation
 * never silently discards a reachable path.
 */
function bruteReach(cipher, v, phase, i = 0, clock = 0, emissions = rows) {
  if (i === cipher.length) return true;
  const c = cipher[i];
  if (c === 0 && bruteReach(cipher, v, phase, i + 1, clock, emissions)) return true;
  return key(v, clock, phase, emissions) !== c &&
    bruteReach(cipher, v, phase, i + 1, clock + 1, emissions);
}

/** @param {number[]} plain @param {number[]} v @param {number} phase */
function encryptFTransparent(plain, v, phase, emissions = rows) {
  let consumed = 0, transparent = 0, encryptedToF = 0;
  const cipher = plain.map(p => {
    if (p === 0) {
      transparent++;
      return 0;
    }
    const c = (p + key(v, consumed++, phase, emissions)) % MOD;
    if (c === 0) encryptedToF++;
    return c;
  });
  return {cipher, consumed, transparent, encryptedToF};
}

// Positive: genuine solved p57 GP source orthography, tiled to 3000 runes.
// The key is nontrivial and the forward cipher encrypts actual source
// plaintext Fs by bypassing the key. Both F meanings occur in the stream.
const plant = Array.from({length: original.length}, (_, i) => p57[i % p57.length]);
const plantedSeed = [3, 5, 7, 11];
for (let phase = 0; phase < 4; phase++) {
  const positive = encryptFTransparent(plant, plantedSeed, phase);
  assert.equal(positive.consumed + positive.transparent, plant.length);
  assert.ok(positive.transparent > 0);
  assert.ok(positive.encryptedToF > 0);
  assert.equal(reachablePrefix(positive.cipher, plantedSeed, phase), plant.length);
  console.log('PLANTED', JSON.stringify({
    phase, runes: plant.length,
    skippedPlainF: positive.transparent,
    encryptedNonFToCipherF: positive.encryptedToF,
    consumed: positive.consumed, inverseFeasible: true
  }));
}
for (let phase = 0; phase < 4; phase++) {
  for (const seed of [0, 1, 3301, 123456, 345678, 707280]) {
    const v = unpack(seed);
    for (const input of [original.slice(0, 16), encryptFTransparent(plant.slice(0, 20), v, phase).cipher]) {
      assert.equal(reachablePrefix(input, v, phase) === input.length,
        bruteReach(input, v, phase));
    }
  }
}
console.log('INDEPENDENT_RECURSION', 'PASS');

// All (29^4) secret vectors, all four intra-block phases. A complete
// key block phase shift is absorbed in v since M is invertible.
// The second cipher sign is absorbed by v -> -v modulo 29.
const thresholds = [50, 100, 200, 500, 1000, 1500, 2000, 3000];
const expected = [
  {counts: [274216, 71828, 8768, 419, 11, 1, 1, 1], longest: 1269, seed: 665553},
  {counts: [273838, 71389, 8711, 399, 6, 1, 1, 1], longest: 1221, seed: 507277},
  {counts: [274102, 71636, 8721, 411, 7, 1, 1, 1], longest: 1440, seed: 102029},
  {counts: [274172, 71501, 8703, 414, 7, 1, 1, 1], longest: 1269, seed: 695576},
];

for (let phase = 0; phase < 4; phase++) {
  const t0 = Date.now();
  const counts = thresholds.map(() => 0);
  let longest = 0, bestSeed = -1, fullNonzero = 0;
  for (let seed = 0; seed < BASE; seed++) {
    const prefix = reachablePrefix(original, unpack(seed), phase);
    for (let i = 0; i < thresholds.length; i++) {
      if (prefix >= thresholds[i]) counts[i]++;
    }
    if (seed !== 0) {
      if (prefix > longest) {
        longest = prefix;
        bestSeed = seed;
      }
      if (prefix === original.length) fullNonzero++;
    }
  }
  assert.deepEqual(counts, expected[phase].counts);
  assert.equal(longest, expected[phase].longest);
  assert.equal(bestSeed, expected[phase].seed);
  assert.equal(fullNonzero, 0);
  assert.equal(reachablePrefix(original, [0, 0, 0, 0], phase), original.length);
  console.log('ORIGINAL', JSON.stringify({
    phase, statesTried: BASE, thresholdPrefixes: thresholds,
    survivorCounts: counts, longestNonzeroPrefix: longest,
    bestNonzeroSeed: bestSeed, nonzeroComplete: fullNonzero,
    elapsedMs: Date.now() - t0
  }));
}
console.log('DECISION: 4 x 707281 original source states exhausted; only identity-zero survives.');


// Literal original p15 numbers are magnitudes, not the restored-sign source
// matrix. A human may directly reduce those original magnitudes modulo29,
// with the final two source cells becoming 21 and17 instead of 8 and12.
// Test the entirely separate literal-positive model without fitting states.
const unsignedExpected = [
  {counts: [274124, 72464, 8629, 379, 3, 1, 1, 1], longest: 1153, seed: 86740},
  {counts: [274231, 70647, 8547, 379, 3, 1, 1, 1], longest: 1067, seed: 112711},
  {counts: [274157, 71412, 8588, 372, 4, 1, 1, 1], longest: 1053, seed: 555604},
  {counts: [274022, 71533, 8576, 374, 7, 1, 1, 1], longest: 1276, seed: 396812},
];
for (let phase = 0; phase < 4; phase++) {
  const planted = encryptFTransparent(plant, plantedSeed, phase, unsignedRows);
  assert.ok(planted.transparent > 0 && planted.encryptedToF > 0);
  assert.equal(reachablePrefix(planted.cipher, plantedSeed, phase, unsignedRows),
    plant.length);
  for (const seed of [0, 1, 3301, 123456, 345678, 707280]) {
    const v = unpack(seed);
    for (const input of [
      original.slice(0, 16),
      encryptFTransparent(plant.slice(0, 20), v, phase, unsignedRows).cipher,
    ]) {
      assert.equal(
        reachablePrefix(input, v, phase, unsignedRows) === input.length,
        bruteReach(input, v, phase, 0, 0, unsignedRows)
      );
    }
  }
  const t0 = Date.now();
  const counts = thresholds.map(() => 0);
  let longest = 0, bestSeed = -1, fullNonzero = 0;
  for (let seed = 0; seed < BASE; seed++) {
    const prefix = reachablePrefix(original, unpack(seed), phase, unsignedRows);
    for (let i = 0; i < thresholds.length; i++) {
      if (prefix >= thresholds[i]) counts[i]++;
    }
    if (seed !== 0) {
      if (prefix > longest) {
        longest = prefix;
        bestSeed = seed;
      }
      if (prefix === original.length) fullNonzero++;
    }
  }
  assert.deepEqual(counts, unsignedExpected[phase].counts);
  assert.equal(longest, unsignedExpected[phase].longest);
  assert.equal(bestSeed, unsignedExpected[phase].seed);
  assert.equal(fullNonzero, 0);
  console.log('LITERAL_UNSIGNED_ORIGINAL', JSON.stringify({
    phase, statesTried: BASE, thresholdPrefixes: thresholds,
    survivorCounts: counts, longestNonzeroPrefix: longest,
    bestNonzeroSeed: bestSeed, nonzeroComplete: fullNonzero,
    sourceNativePlantPassed: true, recursiveOraclePassed: true,
    elapsedMs: Date.now() - t0
  }));
}
console.log('DECISION: source-p15 original positive magnitudes also have no nonzero feasible matrix vector key.');
