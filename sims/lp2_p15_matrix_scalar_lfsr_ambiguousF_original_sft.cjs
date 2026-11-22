'use strict';

/**
 * Original LP2 source-exact gate for any linear scalar observation of the
 * restored-sign p15 4x4 GF(29) matrix, with *all* authentic plaintext-F
 * bypass histories. Node.js 22 / CommonJS. No dependencies or writes.
 *
 * Observability makes the 29^4 initial scalar keystream quartets an exact
 * cover of every unknown matrix state and every linear readout functional,
 * without separately guessing readout coordinates or starting phases.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const json = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const M = [
  [10, 3, 20, 22],
  [1, 22, 21, 25],
  [11, 17, 19, 7],
  [8, 12, 12, 22],
];
const LITERAL_M = [
  [10, 3, 20, 22], [1, 22, 21, 25],
  [11, 17, 19, 7], [21, 17, 12, 22],
];
const ID = [
  [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
];
const N = 29;
const STATE_COUNT = 29 ** 4;
const original = json.pages
  .filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices)
  .slice(8);
const solved = json.pages.find(p => p.page === 57).indices;
assert.equal(original.length, 3000);
assert.equal(original.filter(x => x === 0).length, 124);
assert.equal(solved.length, 95);

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
  return a.map(row => [0, 1, 2, 3].map(col =>
    row.reduce((s, x, i) => s + x * b[i][col], 0) % N
  ));
}

/** @param {number[][]} matrix @returns {number} */
function det(matrix) {
  const a = matrix.map(row => row.slice());
  let result = 1;
  for (let c = 0; c < 4; c++) {
    let r = c;
    while (r < 4 && a[r][c] === 0) r++;
    if (r === 4) return 0;
    if (r !== c) {
      [a[r], a[c]] = [a[c], a[r]];
      result = (N - result) % N;
    }
    const pivot = a[c][c];
    result = result * pivot % N;
    let inverse = 1;
    while (inverse * pivot % N !== 1) inverse++;
    for (let j = c + 1; j < 4; j++) {
      const factor = a[j][c] * inverse % N;
      for (let k = c; k < 4; k++) {
        a[j][k] = (a[j][k] - factor * a[c][k] % N + N) % N;
      }
    }
  }
  return result;
}

const powers = [ID];
for (let i = 1; i <= 4; i++) powers.push(multiply(M, powers[i - 1]));
const charpoly = [7, 10, 27, 14, 1];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    assert.equal(powers.reduce((s, a, i) =>
      s + charpoly[i] * a[r][c], 0) % N, 0);
  }
}
const observations = [0, 1, 2, 3].map(r =>
  [0, 1, 2, 3].map(t => powers[t][r].slice())
);
assert.deepEqual(observations.map(det), [20, 16, 14, 24]);
console.log('MATRIX', JSON.stringify({
  charpolyAscending: charpoly,
  observabilityDeterminants: observations.map(det),
  row0CoversEveryFourTermInitialKeystream: true
}));

/** @param {number} state @returns {number[]} */
function unpack(state) {
  return [
    Math.floor(state / 24389), Math.floor(state / 841) % N,
    Math.floor(state / 29) % N, state % N,
  ];
}

/**
 * A characteristic polynomial of x^4+14x^3+27x^2+10x+7
 * forces K[n]=15*K[n-1]+2*K[n-2]+19*K[n-3]+22*K[n-4] mod29.
 * The initial four key values are exhaustive due to observability.
 *
 * @param {number[]} firstFour
 * @returns {(i:number)=>number}
 */
function recurrence(firstFour, coeff = [22, 19, 2, 15]) {
  const a = firstFour.slice();
  return k => {
    while (a.length <= k) {
      const n = a.length;
      a.push((coeff[3] * a[n - 1] + coeff[2] * a[n - 2] +
        coeff[1] * a[n - 3] + coeff[0] * a[n - 4]) % N);
    }
    return a[k];
  };
}

/**
 * Exact DP over all consumed-key clocks, with both possible ciphertext-F
 * interpretations and the forbidden consuming plaintext F branch.
 *
 * @param {number[]} cipher
 * @param {(i:number)=>number} key
 * @returns {number}
 */
function validPrefix(cipher, key) {
  let clocks = [0];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = [];
    let last = -1;
    for (const k of clocks) {
      const pad = key(k);
      if (c === 0) {
        if (last !== k) {
          next.push(k);
          last = k;
        }
        if (pad !== 0 && last !== k + 1) {
          next.push(k + 1);
          last = k + 1;
        }
      } else if (pad !== c) {
        next.push(k + 1);
      }
    }
    if (next.length === 0) return i;
    clocks = next;
  }
  return cipher.length;
}

/** Independent small-prefix recursive existence checker. */
function brute(cipher, key, position = 0, clock = 0) {
  if (position === cipher.length) return true;
  const c = cipher[position];
  if (c === 0 && brute(cipher, key, position + 1, clock)) return true;
  return key(clock) !== c && brute(cipher, key, position + 1, clock + 1);
}

/** @param {number[]} plain @param {(i:number)=>number} key */
function encrypt(plain, key) {
  let k = 0, skipped = 0, encryptedAsF = 0;
  const cipher = plain.map(p => {
    if (p === 0) {
      skipped++;
      return 0;
    }
    const c = (p + key(k++)) % N;
    if (c === 0) encryptedAsF++;
    return c;
  });
  return {cipher, skipped, consumed: k, encryptedAsF};
}

// Independent matrix-power versus scalar recurrence sample. Every linear
// scalar readout of M has the same characteristic recurrence. O0 is
// invertible, so all such outputs appear among the exhaustively seeded
// scalar recurrences below.
for (const state of [1, 3301, 77586, 123456, 345678, 707280]) {
  const v = unpack(state);
  const initial = observations[0].map(row =>
    row.reduce((s, a, i) => s + a * v[i], 0) % N
  );
  const k = recurrence(initial);
  let vector = v.slice();
  for (let t = 0; t < 80; t++) {
    assert.equal(k(t), vector[0]);
    vector = M.map(row => row.reduce((s, a, i) => s + a * vector[i], 0) % N);
  }
}

// Authentic source-positive 3000-rune plaintext, nonidentity scalar pad,
// including BOTH legal interpretations of observed ciphertext F.
const plain = Array.from({length: 3000}, (_, i) => solved[i % solved.length]);
const positiveInitial = [3, 5, 7, 11];
const planted = encrypt(plain, recurrence(positiveInitial));
assert.ok(planted.skipped > 0 && planted.encryptedAsF > 0);
assert.equal(planted.consumed + planted.skipped, 3000);
assert.equal(validPrefix(planted.cipher, recurrence(positiveInitial)), 3000);
console.log('PLANTED', JSON.stringify({
  length: 3000, skippedPlainF: planted.skipped,
  cipherFfromEncryptedNonF: planted.encryptedAsF,
  consumed: planted.consumed, exactInverseFeasible: true
}));

for (const state of [0, 1, 3301, 123456, 345678, 707280]) {
  const a = unpack(state);
  for (const source of [original.slice(0, 24), planted.cipher.slice(0, 24)]) {
    assert.equal(validPrefix(source, recurrence(a)) === source.length,
      brute(source, recurrence(a)));
  }
}
console.log('RECURSIVE_ORACLE', 'PASS');

const thresholds = [50, 100, 200, 500, 1000, 1500, 2000, 3000];
const expectedCounts = [274542, 71555, 8791, 459, 11, 1, 1, 1];
const counts = thresholds.map(() => 0);
let longest = 0;
const bestStates = [];
let nonzeroFull = 0;
const t0 = Date.now();
for (let state = 0; state < STATE_COUNT; state++) {
  const prefix = validPrefix(original, recurrence(unpack(state)));
  for (let i = 0; i < thresholds.length; i++) {
    if (prefix >= thresholds[i]) counts[i]++;
  }
  if (state !== 0) {
    if (prefix > longest) {
      longest = prefix;
      bestStates.length = 0;
      bestStates.push(state);
    } else if (prefix === longest) {
      bestStates.push(state);
    }
    if (prefix === original.length) nonzeroFull++;
  }
}
assert.deepEqual(counts, expectedCounts);
assert.equal(longest, 1066);
assert.deepEqual(bestStates, [128995, 204460]);
assert.equal(nonzeroFull, 0);
assert.equal(validPrefix(original, recurrence([0, 0, 0, 0])), 3000);
console.log('ORIGINAL', JSON.stringify({
  statesTried: STATE_COUNT, thresholds, survivors: counts,
  longestNonzeroPrefix: longest, bestNonzeroStates: bestStates,
  nonzeroFull, elapsedMs: Date.now() - t0
}));
console.log('DECISION: all GF29 fourth-order scalar M-observation pads except zero exactly excluded.');


// Direct literal source has two large *positive* last-row magnitudes;
// restoring their implied Fibonacci subtraction signs is an additional
// author-unspecified operation. Test the visibly printed alternative too.
const literalPowers = [ID];
for (let i = 1; i <= 4; i++) {
  literalPowers.push(multiply(LITERAL_M, literalPowers[i - 1]));
}
const literalCharpoly = [17, 5, 22, 14, 1];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    assert.equal(literalPowers.reduce((sum, a, i) =>
      sum + literalCharpoly[i] * a[r][c], 0) % N, 0);
  }
}
const literalObservations = [0, 1, 2, 3].map(r =>
  [0, 1, 2, 3].map(t => literalPowers[t][r].slice())
);
assert.equal(det(literalObservations[0]), 27);
const literalCoeff = [12, 24, 7, 15];
for (const state of [1, 3301, 77586, 123456, 345678, 707280]) {
  const v = unpack(state);
  const initial = literalObservations[0].map(row =>
    row.reduce((sum, a, i) => sum + a * v[i], 0) % N
  );
  const k = recurrence(initial, literalCoeff);
  let vec = v.slice();
  for (let t = 0; t < 80; t++) {
    assert.equal(k(t), vec[0]);
    vec = LITERAL_M.map(row =>
      row.reduce((sum, a, i) => sum + a * vec[i], 0) % N
    );
  }
}
const literalPlant = encrypt(plain, recurrence(positiveInitial, literalCoeff));
assert.ok(literalPlant.skipped > 0 && literalPlant.encryptedAsF > 0);
assert.equal(validPrefix(literalPlant.cipher,
  recurrence(positiveInitial, literalCoeff)), 3000);
for (const state of [0, 1, 3301, 123456, 345678, 707280]) {
  const v = unpack(state);
  for (const input of [
    original.slice(0, 24),
    literalPlant.cipher.slice(0, 24),
  ]) {
    assert.equal(
      validPrefix(input, recurrence(v, literalCoeff)) === input.length,
      brute(input, recurrence(v, literalCoeff))
    );
  }
}
const literalCounts = thresholds.map(() => 0);
let longestLiteral = 0;
const bestLiteral = [];
let literalFull = 0;
const startLiteral = Date.now();
for (let state = 0; state < STATE_COUNT; state++) {
  const prefix = validPrefix(original, recurrence(unpack(state), literalCoeff));
  for (let i = 0; i < thresholds.length; i++) {
    if (prefix >= thresholds[i]) literalCounts[i]++;
  }
  if (state !== 0) {
    if (prefix > longestLiteral) {
      longestLiteral = prefix;
      bestLiteral.length = 0;
      bestLiteral.push(state);
    } else if (prefix === longestLiteral) bestLiteral.push(state);
    if (prefix === original.length) literalFull++;
  }
}
assert.deepEqual(literalCounts, [274832, 71945, 8813, 463, 5, 1, 1, 1]);
assert.equal(longestLiteral, 1312);
assert.deepEqual(bestLiteral, [271675, 507446, 570315]);
assert.equal(literalFull, 0);
console.log('LITERAL_UNSIGNED_MATRIX', JSON.stringify({
  charpolyAscending: literalCharpoly, observabilityDeterminant: 27,
  linearScalarRecurrence: literalCoeff,
  statesTried: STATE_COUNT, thresholds, survivorCounts: literalCounts,
  longestNonzeroPrefix: longestLiteral, bestNonzeroStates: bestLiteral,
  nonzeroFull: literalFull,
  sourceNativePlantPassed: true, recursiveOraclePassed: true,
  elapsedMs: Date.now() - startLiteral
}));
console.log('DECISION: original printed positive magnitudes likewise admit no nonzero continuous linear matrix scalar pad.');
