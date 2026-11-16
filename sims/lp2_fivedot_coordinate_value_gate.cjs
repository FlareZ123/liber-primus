'use strict';

// Source-constrained five-dot coordinate/value gate.
// Inputs: canonical p56 ciphertext, independently established p56 plaintext,
// and the original p56 five-dot centroids. No unknown LP2 ciphertext is fitted.
// Run: node sims/lp2_fivedot_coordinate_value_gate.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const MOD = 29;
const expectedWords =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

function toGpRunes(words) {
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP token for ' + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}

function mod(n) { return ((n % MOD) + MOD) % MOD; }

function inverseScalar(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  throw new Error('Noninvertible scalar ' + a);
}

function determinant(matrix) {
  const a = matrix.map((row) => row.slice());
  let det = 1;
  let sign = 1;
  for (let col = 0; col < a.length; col++) {
    let pivot = col;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) return 0;
    if (pivot !== col) {
      [a[pivot], a[col]] = [a[col], a[pivot]];
      sign = -sign;
    }
    const value = a[col][col];
    det = mod(det * value);
    const inv = inverseScalar(value);
    for (let row = col + 1; row < a.length; row++) {
      const factor = mod(a[row][col] * inv);
      for (let j = col; j < a.length; j++) {
        a[row][j] = mod(a[row][j] - factor * a[col][j]);
      }
    }
  }
  return mod(det * sign);
}

function matrixInverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((row, i) => row.concat(
    Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && a[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const scale = inverseScalar(a[col][col]);
    a[col] = a[col].map((v) => mod(v * scale));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = a[row][col];
      a[row] = a[row].map((v, j) => mod(v - factor * a[col][j]));
    }
  }
  return a.map((row) => row.slice(n));
}

function multiply(a, b) {
  return a.map((row) => b[0].map((_, col) =>
    row.reduce((sum, value, k) => mod(sum + value * b[k][col]), 0)
  ));
}

function blocks(values) {
  assert.equal(values.length % 5, 0);
  return Array.from({ length: values.length / 5 }, (_, i) =>
    values.slice(i * 5, i * 5 + 5)
  );
}

function blockMatrix(blocksOfFive, from, count, augmented = false) {
  const rows = Array.from({ length: augmented ? 6 : 5 }, (_, position) =>
    blocksOfFive.slice(from, from + count).map((block) =>
      position === 5 ? 1 : block[position]
    )
  );
  return rows;
}

// Solve an overdetermined linear system over GF(29), preserving exact rank
// and inconsistency information rather than selecting a least-squares fit.
function solveRectangular(equations, variableCount) {
  const a = equations.map((row) => row.map(mod));
  let rank = 0;
  const pivotColumns = [];
  for (let col = 0; col < variableCount; col++) {
    let pivot = rank;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const scale = inverseScalar(a[rank][col]);
    a[rank] = a[rank].map((v) => mod(v * scale));
    for (let row = 0; row < a.length; row++) {
      if (row === rank) continue;
      const factor = a[row][col];
      a[row] = a[row].map((v, j) => mod(v - factor * a[rank][j]));
    }
    pivotColumns.push(col);
    rank++;
  }
  const inconsistent = a.some((row) =>
    row.slice(0, variableCount).every((v) => v === 0) &&
    row[variableCount] !== 0
  );
  let solution = null;
  if (!inconsistent && rank === variableCount) {
    solution = Array(variableCount).fill(0);
    pivotColumns.forEach((col, row) => { solution[col] = a[row][variableCount]; });
  }
  return { rank, inconsistent, solution };
}

const cipher = corpus.pages.find((page) => page.page === 56).indices;
const plaintext = toGpRunes(expectedWords);
assert.equal(cipher.length, 85);
assert.equal(plaintext.length, 85);
assert.deepEqual(plaintext.length, cipher.length);

// Original p56 73.jpg five-dot centroids, sorted left-to-right. These are
// rounded native-pixel coordinates from the original-image source audit.
// Their top-to-bottom x-rank order is [2,0,4,1,3]; the y-rank *at each
// left-to-right x-rank* is its inverse permutation [1,3,0,4,2].
const dots = [
  { x: 873, y: 2517 },
  { x: 921, y: 2708 },
  { x: 1104, y: 2447 },
  { x: 1408, y: 2747 },
  { x: 1604, y: 2686 }
].sort((a, b) => a.x - b.x);
const sortedY = dots.map((dot) => dot.y).slice().sort((a, b) => a - b);
const yRankByX = dots.map((dot) => sortedY.indexOf(dot.y));
assert.deepEqual(yRankByX, [1, 3, 0, 4, 2]);
const topToBottomXRank = dots.map((dot, xRank) => ({ y: dot.y, xRank }))
  .sort((a, b) => a.y - b.y).map(({ xRank }) => xRank);
assert.deepEqual(topToBottomXRank, [2, 0, 4, 1, 3]);

const pBlocks = blocks(plaintext);
const cBlocks = blocks(cipher);
assert.equal(pBlocks.length, 17);

// Candidate 1: the most general fixed linear five-symbol Hill map,
// C_t = K * P_t over GF(29). Derive K from the first five blocks only;
// keep the remaining twelve blocks blind.
const pTrain = blockMatrix(pBlocks, 0, 5);
const cTrain = blockMatrix(cBlocks, 0, 5);
const pTrainInverse = matrixInverse(pTrain);
assert.ok(pTrainInverse, 'The first five plaintext blocks must span GF(29)^5');
const hillKey = multiply(cTrain, pTrainInverse);
const hillKeyDeterminant = determinant(hillKey);
assert.notEqual(hillKeyDeterminant, 0, 'The fitted Hill key must be reversible');
const pHoldout = blockMatrix(pBlocks, 5, 12);
const cHoldout = blockMatrix(cBlocks, 5, 12);
const hillPrediction = multiply(hillKey, pHoldout);
let hillErrors = 0;
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 12; col++) {
    if (hillPrediction[row][col] !== cHoldout[row][col]) hillErrors++;
  }
}
assert.equal(hillErrors, 58);

// Candidate 2: a full affine five-symbol Hill map, C_t = A*[P_t;1].
// Six training blocks determine its 5x6 matrix; eleven blocks remain blind.
const affineX = blockMatrix(pBlocks, 0, 6, true);
const affineY = blockMatrix(cBlocks, 0, 6);
const affineXInverse = matrixInverse(affineX);
assert.ok(affineXInverse, 'The six-block augmented plaintext matrix must invert');
const affineKey = multiply(affineY, affineXInverse);
const affineLinearPart = affineKey.map((row) => row.slice(0, 5));
const affineKeyDeterminant = determinant(affineLinearPart);
const affinePHoldout = blockMatrix(pBlocks, 6, 11, true);
const affineCHoldout = blockMatrix(cBlocks, 6, 11);
const affinePrediction = multiply(affineKey, affinePHoldout);
let affineErrors = 0;
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 11; col++) {
    if (affinePrediction[row][col] !== affineCHoldout[row][col]) affineErrors++;
  }
}
assert.equal(affineErrors, 53);

// Candidate 3: the smallest direct coordinate-plus-value map suggested by
// the five dots. For block t and lane j:
// C[t,j] = a*P[t,j] + b*x[j] + c*y[j] + d*t + e (mod 29).
// x[j]=j and y[j] is the original p56 dot-height rank at that x.
// The first five blocks overdetermine five coefficients (25 equations).
const coordinateEquations = [];
for (let t = 0; t < 5; t++) {
  for (let j = 0; j < 5; j++) {
    const i = t * 5 + j;
    coordinateEquations.push([
      plaintext[i], j, yRankByX[j], t, 1, cipher[i]
    ]);
  }
}
const coordinateFit = solveRectangular(coordinateEquations, 5);
assert.equal(coordinateFit.rank, 5);
assert.equal(coordinateFit.inconsistent, true);
assert.equal(coordinateFit.solution, null);

// The five-dot stamp is physically below the last p56 ciphertext rune;
// it supplies no forward observation after the 85-rune solved stream.
const result = {
  source: 'resources/liber-primus/lp2-corpus.json; original p56 image 73.jpg',
  knownPlaintext: expectedWords,
  p56Runes: 85,
  fiveDotYRankByLeftToRightX: yRankByX,
  fiveDotTopToBottomXRank: topToBottomXRank,
  fixedHill: {
    trainingBlocks: 5,
    holdoutBlocks: 12,
    keyDeterminantMod29: hillKeyDeterminant,
    holdoutErrors: hillErrors,
    holdoutSymbols: 60,
    holdoutMatches: 2,
    key: hillKey
  },
  affineHill: {
    trainingBlocks: 6,
    holdoutBlocks: 11,
    linearPartDeterminantMod29: affineKeyDeterminant,
    holdoutErrors: affineErrors,
    holdoutSymbols: 55,
    holdoutMatches: 2,
    key: affineKey
  },
  dotCoordinateAffine: {
    formula: 'C[t,j] = a*P[t,j] + b*j + c*yRank[j] + d*t + e (mod 29)',
    trainingBlocks: 5,
    equations: 25,
    unknownCoefficients: 5,
    rank: coordinateFit.rank,
    inconsistent: coordinateFit.inconsistent,
    solution: coordinateFit.solution
  },
  markerAfterCiphertextRunes: 85,
  conclusion: 'The original five-dot geometry does not select a reversible fixed affine coordinate/value operation on the authenticated p56 control.'
};
console.log(JSON.stringify(result, null, 2));
