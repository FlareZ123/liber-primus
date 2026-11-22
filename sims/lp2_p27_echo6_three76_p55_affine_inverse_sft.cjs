'use strict';

/**
 * P27 original 234 runes = six-rune copied DJU-BEI marker + 3*76;
 * P55 original 76 runes. Test all-secret GF29 3-lane affine transfer.
 *
 * The exact marker is removed once at its printed p27 coordinates.
 * Both contiguous and interleaved 3x76 tape forms, both original tape
 * directions and both target directions are allowed. All four GF29
 * coefficients are secret, inferred from only four original pairings.
 *
 * Run: node sims/lp2_p27_echo6_three76_p55_affine_inverse_sft.cjs
 * Source-native positive plants demonstrate exact coefficient recovery.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = number => corpus.pages.find(p => p.page === number).indices;
const p27 = page(27);
const p55 = page(55);
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
const echo = p27.slice(28, 34);
assert.deepEqual(echo, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(p55.slice(70), echo);
const trimmed = p27.slice(0, 28).concat(p27.slice(34));
assert.equal(trimmed.length, 228);
assert.equal(trimmed.length, 3 * p55.length);
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let y = 1; y < 29; y++) if (mod(x * y) === 1) return y;
  throw new Error('Source row has zero pivot');
}

/**
 * GF29 elimination; any inconsistent right-hand side is explicitly rejected.
 * Four unknown affine coefficients a,b,c,d satisfy
 * Y_i=a*A_i+b*B_i+c*C_i+d mod29.
 *
 * @param {number[][]} rows
 * @returns {{rank:number, inconsistent:boolean, params:number[] | null}}
 */
function eliminate(rows) {
  const A = rows.map(row => row.map(mod));
  const pivotColumns = [];
  let pivotRow = 0;
  for (let col = 0; col < 4; col++) {
    let candidate = pivotRow;
    while (candidate < A.length && A[candidate][col] === 0) candidate++;
    if (candidate === A.length) continue;
    [A[pivotRow], A[candidate]] = [A[candidate], A[pivotRow]];
    const inv = inverse(A[pivotRow][col]);
    A[pivotRow] = A[pivotRow].map(x => mod(inv * x));
    for (let row = 0; row < A.length; row++) {
      if (row === pivotRow) continue;
      const factor = A[row][col];
      if (factor !== 0) {
        A[row] = A[row].map((x, j) => mod(x - factor * A[pivotRow][j]));
      }
    }
    pivotColumns.push(col);
    pivotRow++;
  }
  const inconsistent = A.some(row =>
    row.slice(0, 4).every(x => x === 0) && row[4] !== 0);
  let params = null;
  if (pivotRow === 4 && !inconsistent) {
    params = Array(4).fill(0);
    for (let i = 0; i < 4; i++) params[pivotColumns[i]] = A[i][4];
  }
  return { rank: pivotRow, inconsistent, params };
}

/** @param {number[]} tape @param {'chunk'|'interleave'} layout */
function threeLanes(tape, layout) {
  return Array.from({ length: 76 }, (_, i) =>
    Array.from({ length: 3 }, (_, k) =>
      layout === 'chunk' ? tape[k * 76 + i] : tape[3 * i + k]));
}

/** @param {number[]} vector @param {number[]} coefficients */
function dot(vector, coefficients) {
  return mod(vector.reduce((s, x, i) => s + x * coefficients[i], 0));
}

const cases = [];
for (const layout of ['chunk', 'interleave']) {
  for (const reverse27 of [false, true]) {
    for (const reverse55 of [false, true]) {
      const tape = reverse27 ? trimmed.slice().reverse() : trimmed;
      const lanes = threeLanes(tape, layout);
      const target = reverse55 ? p55.slice().reverse() : p55;
      const sourceEquations = lanes.map((v, i) => [...v, 1, target[i]]);
      const inferred = eliminate(sourceEquations.slice(0, 4));
      assert.equal(inferred.rank, 4);
      assert.equal(inferred.inconsistent, false);
      const coefficients = inferred.params;
      assert.ok(coefficients);
      let originalHits = 0;
      for (let i = 0; i < 76; i++) {
        if (dot([...lanes[i], 1], coefficients) === target[i]) originalHits++;
      }
      const exact = eliminate(sourceEquations);
      assert.equal(exact.rank, 4);
      assert.equal(exact.inconsistent, true);
      let identityPairCount = 0, originalTargetAnyLane = 0;
      for (let i = 0; i < 76; i++) {
        const v = lanes[i];
        identityPairCount += Number(v[0] === v[1]);
        identityPairCount += Number(v[0] === v[2]);
        identityPairCount += Number(v[1] === v[2]);
        originalTargetAnyLane += Number(v.includes(target[i]));
      }

      // Positive source-shaped 76-rune target: keep every exact original
      // p27 rune, plant a secret *fixed* affine mapping, recover all four
      // unknown coefficients from the first four source pairs, and make
      // 72 untouched forward predictions before full target recovery.
      const secret = [4, 7, 11, 15];
      const plantedTarget = lanes.map(v => dot([...v, 1], secret));
      const plantedRows = lanes.map((v, i) => [...v, 1, plantedTarget[i]]);
      const found = eliminate(plantedRows.slice(0, 4));
      assert.deepEqual(found.params, secret);
      assert.equal(found.rank, 4);
      assert.equal(found.inconsistent, false);
      assert.equal(eliminate(plantedRows).inconsistent, false);
      const predicted = lanes.map(v => dot([...v, 1], found.params));
      assert.deepEqual(predicted, plantedTarget);

      cases.push({
        layout, reverse27, reverse55,
        rank: exact.rank, inconsistent: exact.inconsistent,
        trainedFourCoefficients: coefficients,
        originalMatchesOutOf76: originalHits,
        originalContradictionsAfterFour: 76 - originalHits,
        sourceLaneEqualityPairs: identityPairCount,
        originalP55MatchesAnyOfThreeLanes: originalTargetAnyLane,
        plantedCompleteMatches: predicted.length
      });
    }
  }
}
assert.equal(cases.length, 8);
assert.deepEqual(cases.map(c => c.originalMatchesOutOf76), [5, 9, 5, 8, 4, 7, 7, 6]);
assert.deepEqual(cases.map(c => c.sourceLaneEqualityPairs), [11, 11, 11, 11, 9, 9, 9, 9]);
assert.ok(cases.every(c => c.originalMatchesOutOf76 <= 9));
assert.ok(cases.every(c => c.plantedCompleteMatches === 76));

// Stronger key-independent original gate: grant *every* stationary polynomial
// over GF29 in the three source lane values of total degree <= 5. This includes
// all possible secret affine/quadratic/cubic/quartic/quintic coefficients.
// Degree 5 has 56 independent monomials; 76 original observations can
// distinguish a real secret polynomial from generic unrelated data.
function monomials(degree) {
  const out = [];
  for (let a = 0; a <= degree; a++) {
    for (let b = 0; b <= degree - a; b++) {
      for (let c = 0; c <= degree - a - b; c++) out.push([a, b, c]);
    }
  }
  return out;
}

/** @param {number[]} v @param {number[][]} terms */
function feature(v, terms) {
  return terms.map(([a, b, c]) => mod(v[0] ** a * v[1] ** b * v[2] ** c));
}

/**
 * Exact rectangular GF29 row rank, optionally including the 77th
 * independent right-hand-side column. No inverse/solve used on original
 * after training data.
 * @param {number[][]} rows
 * @param {number} width
 */
function rank(rows, width) {
  const A = rows.map(v => v.map(mod));
  let pivotRow = 0;
  for (let col = 0; col < width; col++) {
    let pivot = pivotRow;
    while (pivot < A.length && A[pivot][col] === 0) pivot++;
    if (pivot === A.length) continue;
    [A[pivot], A[pivotRow]] = [A[pivotRow], A[pivot]];
    const scale = inverse(A[pivotRow][col]);
    for (let j = col; j < A[pivotRow].length; j++) {
      A[pivotRow][j] = mod(A[pivotRow][j] * scale);
    }
    for (let row = pivotRow + 1; row < A.length; row++) {
      const factor = A[row][col];
      if (factor) {
        for (let j = col; j < A[row].length; j++) {
          A[row][j] = mod(A[row][j] - factor * A[pivotRow][j]);
        }
      }
    }
    pivotRow++;
    if (pivotRow === A.length) break;
  }
  return pivotRow;
}

const allSecret = [];
for (const layout of ['chunk', 'interleave']) {
  for (const reverse27 of [false, true]) {
    for (const reverse55 of [false, true]) {
      const tape = reverse27 ? trimmed.slice().reverse() : trimmed;
      const x = threeLanes(tape, layout);
      const target = reverse55 ? p55.slice().reverse() : p55;
      const gates = [];
      for (const degree of [1, 2, 3, 4, 5]) {
        const terms = monomials(degree);
        const matrix = x.map((v, i) => [...feature(v, terms), target[i]]);
        const sourceRank = rank(matrix.map(v => v.slice(0, -1)), terms.length);
        const augmentedRank = rank(matrix, terms.length + 1);
        assert.equal(sourceRank, terms.length);
        assert.equal(augmentedRank, sourceRank + 1);
        gates.push({degree, terms: terms.length, sourceRank, augmentedRank});
      }

      // A distinct hidden, non-affine source-shaped polynomial positive:
      // one arbitrary algebraic key assigns every source monomial its own
      // unknown field coefficient. The augmented rank must remain exact
      // and uncontradictory on its original 76 positions.
      const terms = monomials(5);
      const plantedKey = terms.map((_, i) => (13 * i + 7) % 29);
      const planted = x.map(v => dot(feature(v, terms), plantedKey));
      const fullPlant = x.map((v, i) => [...feature(v, terms), planted[i]]);
      assert.equal(rank(fullPlant, terms.length), 56);
      assert.equal(rank(fullPlant, terms.length + 1), 56);
      allSecret.push({ layout, reverse27, reverse55, gates,
        plantedPolynomialDegree5Exact: true });
    }
  }
}
assert.equal(allSecret.length, 8);

console.log(JSON.stringify({
  actualSourceSizes: { p27: 234, echoedRuneCount: 6,
    p27AfterRemovingExactEcho: 228, p55: 76, originalThreeBy76: true },
  sharedSixRuneGP: echo,
  originalSourceLayouts: cases,
  allSecretDegreeOneThroughFive: allSecret
}, null, 2));
console.log('PASS: 3x76 source bridge exact, all 8 secret degree<=5 stationary polynomial inverses impossible.');
