'use strict';

// Source-locked 3x3 Hill test for the p0 red-heading crib "EPIPHANY SEEKS".
// The 2016 signed payload supplies the exact phrase; p0 supplies 13 red runes,
// a 3|3 stave motif, a 13-dot boundary, and a 249-rune black body (83 blocks).
// Use GF(29), phase zero, and the first 12 title symbols as four 3-rune blocks.
// Recover from three blocks and require the fourth as an untouched holdout.
// Test both row/column conventions and every predeclared 3-of-4 training subset.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const p0 = corpus.pages.find((p) => p.page === 0).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const mod = (n) => ((n % 29) + 29) % 29;

const cipherTitle = p0.slice(0, 13);
const body = p0.slice(13);
const plainCrib = [19, 13, 10, 13, 8, 25, 9, 27, 15, 19, 19, 5, 15];
// GP29 has no K glyph; map English /k/ in SEEKS to the Futhorc C rune (index 5).
const cipherBlocks = Array.from({ length: 4 }, (_, i) => cipherTitle.slice(i * 3, i * 3 + 3));
const plainBlocks = Array.from({ length: 4 }, (_, i) => plainCrib.slice(i * 3, i * 3 + 3));

assert.deepEqual(cipherTitle, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(cipherTitle.length, 13);
assert.equal(body.length, 249);
assert.equal(body.length % 3, 0);
assert.equal(plainCrib.length, 13);
assert.equal(p57.length, 95);

function invMod(a) {
  a = mod(a);
  for (let x = 1; x < 29; x += 1) if ((a * x) % 29 === 1) return x;
  return null;
}

function matrixInverse(A) {
  const n = A.length;
  const M = A.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    while (pivot < n && mod(M[pivot][col]) === 0) pivot += 1;
    if (pivot === n) return null;

    [M[col], M[pivot]] = [M[pivot], M[col]];
    const scale = invMod(M[col][col]);
    if (scale === null) return null;
    M[col] = M[col].map((x) => mod(x * scale));

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = M[row][col];
      M[row] = M[row].map((x, j) => mod(x - factor * M[col][j]));
    }
  }

  return M.map((row) => row.slice(n));
}

function multiply(A, B) {
  return A.map((row) =>
    B[0].map((_, col) =>
      mod(row.reduce((sum, x, k) => sum + x * B[k][col], 0)),
    ),
  );
}

function determinant3(A) {
  return mod(
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]),
  );
}

function matrixForBlocks(blocks, orientation, indices) {
  if (orientation === 'column') {
    return [0, 1, 2].map((r) => indices.map((i) => blocks[i][r]));
  }
  return indices.map((i) => blocks[i]);
}

function deriveAndValidate(orientation, train, hold) {
  const P = matrixForBlocks(plainBlocks, orientation, train);
  const C = matrixForBlocks(cipherBlocks, orientation, train);
  const PInv = matrixInverse(P);
  assert(PInv, 'Every 3-of-4 plaintext training matrix should be invertible');

  const K = orientation === 'column' ? multiply(C, PInv) : multiply(PInv, C);
  const det = determinant3(K);
  const KInv = matrixInverse(K);

  const holdP = orientation === 'column'
    ? [0, 1, 2].map((r) => [plainBlocks[hold][r]])
    : [plainBlocks[hold]];
  const predicted = orientation === 'column'
    ? multiply(K, holdP).map((row) => row[0])
    : multiply(holdP, K)[0];

  return {
    orientation,
    train,
    hold,
    K,
    determinant: det,
    keyInvertible: !!KInv,
    predictedHoldout: predicted,
    actualHoldout: cipherBlocks[hold],
    holdoutMatches: predicted.every((x, i) => x === cipherBlocks[hold][i]),
  };
}

const subsets = [
  { train: [0, 1, 2], hold: 3 },
  { train: [0, 1, 3], hold: 2 },
  { train: [0, 2, 3], hold: 1 },
  { train: [1, 2, 3], hold: 0 },
];
const results = [];
for (const orientation of ['column', 'row']) {
  for (const subset of subsets) {
    results.push(deriveAndValidate(orientation, subset.train, subset.hold));
  }
}

// Positive control: recover a planted invertible Hill key from three blocks,
// then predict a fourth held-out block in both matrix conventions.
const plantedKey = [[2, 3, 5], [1, 1, 1], [4, 2, 7]];
assert.notEqual(determinant3(plantedKey), 0);
const controlPlain = Array.from({ length: 4 }, (_, i) => p57.slice(i * 3, i * 3 + 3));
assert(controlPlain.every((b) => b.length === 3));
const controls = [];

for (const orientation of ['column', 'row']) {
  const P = orientation === 'column'
    ? [0, 1, 2].map((r) => controlPlain.slice(0, 3).map((b) => b[r]))
    : controlPlain.slice(0, 3);
  const C = orientation === 'column'
    ? multiply(plantedKey, P)
    : multiply(P, plantedKey);
  const PInv = matrixInverse(P);
  const recovered = orientation === 'column'
    ? multiply(C, PInv)
    : multiply(PInv, C);
  assert.deepEqual(recovered, plantedKey);

  const heldP = orientation === 'column'
    ? [0, 1, 2].map((r) => [controlPlain[3][r]])
    : [controlPlain[3]];
  const predicted = orientation === 'column'
    ? multiply(recovered, heldP).map((row) => row[0])
    : multiply(heldP, recovered)[0];
  const actual = orientation === 'column'
    ? multiply(plantedKey, heldP).map((row) => row[0])
    : multiply(heldP, plantedKey)[0];
  assert.deepEqual(predicted, actual);
  controls.push({ orientation, recoveredKey: recovered, heldoutPredicted: predicted, heldoutActual: actual });
}

assert(results.every((x) => x.keyInvertible));
assert(results.every((x) => !x.holdoutMatches));

const output = {
  schema: 1,
  source: 'resources/liber-primus/lp2-corpus.json',
  authenticatedCribSource: 'resources/historical/cicada2016-4gq25-outguess.asc',
  operation: 'fixed 3x3 Hill cipher over GF(29), title blocks at phase zero',
  cipherTitle,
  plaintextCrib,
  blocks: { cipher: cipherBlocks, plain: plainBlocks },
  p0BlackBody: { length: body.length, completeThreeRuneBlocks: body.length / 3 },
  heldoutTests: results,
  plantedPositiveControls: controls,
  decision: 'All eight row/column and 3-of-4 training-set tests derive invertible keys but fail the held-out title block. The exact EPIPHANY SEEKS / 3x3 Hill hypothesis is rejected before body decryption.',
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
