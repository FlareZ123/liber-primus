'use strict';
/**
 * Exhaustive keyless four-quarter/79-column F29 linear-output search.
 *
 * Candidate model: split all 12,956 original unsolved LP2 rune indices into
 * four equal streams (4 x 41 x 79). At time t, let
 * C(t) = M P(t) + K(t mod 79) (mod 29), where M is one unknown invertible
 * constant 4x4 matrix and K is an arbitrary 79-column four-vector pad.
 * Any normalized row w of M^-1 projects ciphertext to one source lane plus
 * a fixed additive pad at each phase. Same-column equality survives every
 * arbitrary K, even unknown affine scale and glyph permutation per phase.
 *
 * Exhaust all 25,260 projective directions in F29^4. Freeze the maximal
 * 20-row training direction, report independent 21-row holdout. A planted
 * full-matrix 79-column English-GP cipher must produce high phase collisions
 * on all four inverse rows and exactly invert on all symbols.
 *
 * The hypothesis and 4x41x79 reshape are post-selected. This is a bounded
 * architectural falsification, never a claimed real-cipher decryption.
 * Run: node sims/quarter79_linear_phase_invariant.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./word_partition_invariant.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const MOD = 29, QUARTERS = 4, COLS = 79, FIRST_ROWS = 20, LAST_ROWS = 21;
const LANE_LENGTH = 3239, TRAIN = FIRST_ROWS * COLS;
const PAIRS_TRAIN = COLS * FIRST_ROWS * (FIRST_ROWS - 1) / 2;
const PAIRS_HOLD = COLS * LAST_ROWS * (LAST_ROWS - 1) / 2;
const mod = n => ((n % MOD) + MOD) % MOD;

/** @returns {number[][]} */
function originalQuarters() {
  const data = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const pages = data.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length, 55);
  const flat = pages.flatMap(p => p.indices);
  assert.equal(flat.length, QUARTERS * LANE_LENGTH);
  return Array.from({length: QUARTERS}, (_, j) =>
    flat.slice(j * LANE_LENGTH, (j + 1) * LANE_LENGTH));
}

/** @param {number[]} vector @returns {number[]} */
function canonical(vector) {
  const first = vector.findIndex(v => v !== 0);
  assert.ok(first >= 0);
  const a = vector[first];
  let inv = 1;
  while (mod(inv * a) !== 1) inv++;
  return vector.map(v => mod(v * inv));
}

/** @param {number[][]} mat @returns {number[][]} */
function inverse(mat) {
  const n = mat.length;
  assert.equal(n, QUARTERS);
  const a = mat.map((row, i) => row.map(mod).concat(
    Array.from({length: n}, (_, j) => Number(i === j))));
  for (let k = 0; k < n; k++) {
    const pivot = a.findIndex((row, i) => i >= k && row[k] !== 0);
    assert.ok(pivot >= k, 'M must be invertible');
    [a[k], a[pivot]] = [a[pivot], a[k]];
    let reciprocal = 1;
    while (mod(a[k][k] * reciprocal) !== 1) reciprocal++;
    a[k] = a[k].map(x => mod(x * reciprocal));
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const scale = a[i][k];
      a[i] = a[i].map((x, j) => mod(x - scale * a[k][j]));
    }
  }
  return a.map(row => row.slice(n));
}

/**
 * One chosen linear projection's exact same-column collision rates.
 * @param {number[][]} quarters
 * @param {number[]} vector
 * @returns {{train:number,hold:number,trainHits:number,holdHits:number}}
 */
function score(quarters, vector) {
  const h0 = new Uint8Array(COLS * MOD);
  const h1 = new Uint8Array(COLS * MOD);
  let x0 = 0, x1 = 0;
  for (let t = 0; t < LANE_LENGTH; t++) {
    let value = 0;
    for (let j = 0; j < QUARTERS; j++)
      value += vector[j] * quarters[j][t];
    const bin = (t % COLS) * MOD + mod(value);
    if (t < TRAIN) x0 += h0[bin]++;
    else x1 += h1[bin]++;
  }
  return {train: x0 / PAIRS_TRAIN, hold: x1 / PAIRS_HOLD,
    trainHits: x0, holdHits: x1};
}

/**
 * All nonzero F29^4 vectors up to scalar. Count is 29^3+29^2+29+1.
 * Train selection never uses test score.
 * @param {number[][]} quarters
 * @returns {object}
 */
function scan(quarters) {
  const h0 = new Uint8Array(COLS * MOD);
  const h1 = new Uint8Array(COLS * MOD);
  const best = [];
  let overallHold = {hold: -1};
  let count = 0, aboveTrain = 0, aboveHold = 0;
  for (let lead = 0; lead < QUARTERS; lead++) {
    for (let code = 0; code < MOD ** (QUARTERS - lead - 1); code++) {
      const v = [0, 0, 0, 0];
      v[lead] = 1;
      let remaining = code;
      for (let j = lead + 1; j < QUARTERS; j++) {
        v[j] = remaining % MOD;
        remaining = Math.floor(remaining / MOD);
      }
      h0.fill(0);
      h1.fill(0);
      let a = 0, b = 0;
      for (let t = 0; t < LANE_LENGTH; t++) {
        let n = 0;
        for (let j = lead; j < QUARTERS; j++)
          n += v[j] * quarters[j][t];
        const index = (t % COLS) * MOD + n % MOD;
        if (t < TRAIN) a += h0[index]++;
        else b += h1[index]++;
      }
      const candidate = {vector: v, train: a / PAIRS_TRAIN,
        hold: b / PAIRS_HOLD, trainHits: a, holdHits: b};
      aboveTrain += Number(candidate.train >= .05);
      aboveHold += Number(candidate.hold >= .05);
      if (candidate.hold > overallHold.hold) overallHold = candidate;
      if (best.length < 10 || candidate.train > best[best.length - 1].train) {
        best.push(candidate);
        best.sort((x, y) => y.train - x.train);
        if (best.length > 10) best.pop();
      }
      count++;
    }
  }
  assert.equal(count, (MOD ** QUARTERS - 1) / (MOD - 1));
  return {projectiveDirections: count, bestTraining: best[0],
    trainingTopTen: best, strongestHoldoutPostSelected: overallHold,
    directionsAbove050Train: aboveTrain, directionsAbove050Hold: aboveHold};
}

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let v = seed >>> 0;
  return () => {
    v ^= v << 13; v ^= v >>> 17; v ^= v << 5;
    return v >>> 0;
  };
}

/**
 * A complete independently generated F29 4-channel Hill cipher with an
 * arbitrary secret additive 79-column pad and authentic English-GP source.
 * @returns {object}
 */
function positiveControl() {
  const words = read('resources/control/shakespeare_first300k.txt')
    .toUpperCase().match(/[A-Z]+/g);
  const english = words.flatMap(encode);
  assert.ok(english.length > QUARTERS * LANE_LENGTH + 3000);
  const plain = Array.from({length: QUARTERS}, (_, j) =>
    english.slice(3000 + j * LANE_LENGTH, 3000 + (j + 1) * LANE_LENGTH));
  const M = [[1, 2, 3, 4], [0, 1, 5, 6],
    [0, 0, 1, 7], [0, 0, 0, 1]];
  const inv = inverse(M);
  const rand = random32(0x7941e170);
  const pad = Array.from({length: QUARTERS},
    () => Array.from({length: COLS}, () => rand() % MOD));
  const cipher = Array.from({length: QUARTERS},
    () => new Array(LANE_LENGTH));
  for (let t = 0; t < LANE_LENGTH; t++)
    for (let j = 0; j < QUARTERS; j++) {
      let value = pad[j][t % COLS];
      for (let k = 0; k < QUARTERS; k++) value += M[j][k] * plain[k][t];
      cipher[j][t] = mod(value);
    }
  let recovered = 0;
  for (let t = 0; t < LANE_LENGTH; t++)
    for (let j = 0; j < QUARTERS; j++) {
      let value = 0;
      for (let k = 0; k < QUARTERS; k++)
        value += inv[j][k] * mod(cipher[k][t] - pad[k][t % COLS]);
      recovered += Number(mod(value) === plain[j][t]);
    }
  assert.equal(recovered, QUARTERS * LANE_LENGTH);
  const trueRows = inv.map(row => {
    const vector = canonical(row);
    return {vector, ...score(cipher, vector)};
  });
  assert.ok(trueRows.every(r => r.train > .045 && r.hold > .045),
    'All four independently planted English-GP inverse rows must be detectable');
  const exhaustive = scan(cipher);
  assert.ok(exhaustive.trainingTopTen.some(p =>
    trueRows.some(r => r.vector.every((x, i) => x === p.vector[i]))),
    'The 25,260-direction scan must locate a genuine planted inverse row');
  return {source: 'original Shakespeare GP encoding',
    matrix: M, inverse: inv, padLength: COLS, recovered, total: recovered,
    trueRows, exhaustive: {
      projectiveDirections: exhaustive.projectiveDirections,
      bestTraining: exhaustive.bestTraining,
      directionsAbove050Train: exhaustive.directionsAbove050Train,
      directionsAbove050Hold: exhaustive.directionsAbove050Hold
    }};
}

function main() {
  const original = scan(originalQuarters());
  const positive = positiveControl();
  assert.equal(original.directionsAbove050Train, 0);
  assert.equal(original.directionsAbove050Hold, 0);
  const result = {source: 'original LP2 12,956 ciphertext GP indices',
    shape: [QUARTERS, FIRST_ROWS + LAST_ROWS, COLS],
    trainRows: FIRST_ROWS, holdRows: LAST_ROWS,
    trainPhasePairs: PAIRS_TRAIN, holdPhasePairs: PAIRS_HOLD,
    uniformReference: 1 / MOD, original, positive,
    limitation: 'No unknown LP2 plaintext or key. Conditional exclusion of ' +
      'static F29 four-lane mixing plus arbitrary phase-79 additive pad ' +
      'with ordinary GP-English source; other clocks, nonlinear/stateful ' +
      'transforms and unknown intermediate codes remain open.'};
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = {originalQuarters, canonical, inverse, score, scan,
  positiveControl, main};
