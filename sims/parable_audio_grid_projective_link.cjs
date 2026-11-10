'use strict';

/**
 * Reproduce the proposed 2013 AUDIO/761 -> 32x8 base-60 grid -> GF(29)
 * matrix bridge to the p3/p39 projective generator.
 *
 * The extraction path (prime ordinals as zero-based grid offsets and
 * completion of the fourth corner of the 4x4 square) is a hypothesis about
 * intended construction. All arithmetic after that extraction is exact.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

function primeIndex(n) {
  const sieve = new Uint8Array(n + 1);
  sieve.fill(1);
  sieve[0] = 0;
  sieve[1] = 0;
  for (let p = 2; p * p <= n; p++) {
    if (!sieve[p]) continue;
    for (let q = p * p; q <= n; q += p) sieve[q] = 0;
  }
  let count = 0;
  for (let p = 2; p <= n; p++) if (sieve[p]) count++;
  assert.equal(sieve[n], 1, n + ' is not prime');
  return count;
}
function mm(A, B) {
  return A.map((row, i) => row.map((_, j) =>
    mod(row[0] * B[0][j] + row[1] * B[1][j])
  ));
}
function mv(A, v) {
  return A.map(row => mod(row[0] * v[0] + row[1] * v[1]));
}
function mpow(A, n) {
  let result = [[1, 0], [0, 1]];
  let base = A.map(row => row.slice());
  while (n > 0) {
    if (n & 1) result = mm(result, base);
    base = mm(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}
function inverse(x) {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error('non-invertible element ' + x);
}
function minv(A) {
  const d = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const di = inverse(d);
  return [
    [mod(A[1][1] * di), mod(-A[0][1] * di)],
    [mod(-A[1][0] * di), mod(A[0][0] * di)]
  ];
}
function equalMatrix(A, B) {
  return A.every((row, i) => row.every((x, j) => x === B[i][j]));
}
function scalarMatrix(A, scalar) {
  return equalMatrix(A, [[scalar, 0], [0, scalar]]);
}
function projectiveCoordinate(v) {
  if (v[1] === 0) return null;
  return mod(v[0] * inverse(v[1]));
}
function projectiveStep(A, x) {
  const v = x === null ? [1, 0] : [x, 1];
  return projectiveCoordinate(mv(A, v));
}
function projectiveOrbit(A, start, length) {
  const out = [];
  let x = start;
  for (let i = 0; i < length; i++) {
    out.push(x);
    x = projectiveStep(A, x);
  }
  return out;
}
function projectiveOrder(A, max = 1000) {
  for (let n = 1; n <= max; n++) {
    const P = mpow(A, n);
    if (P[0][1] === 0 && P[1][0] === 0 && P[0][0] === P[1][1]) {
      return { order: n, scalar: P[0][0] };
    }
  }
  throw new Error('projective order not found');
}
function matrixOrder(A, max = 10000) {
  for (let n = 1; n <= max; n++) {
    if (equalMatrix(mpow(A, n), [[1, 0], [0, 1]])) return n;
  }
  throw new Error('matrix order not found');
}

// Historical 2013 source number and its three prime factors.
const audioInteger = 1595277641;
const factors = [1259, 1031, 1229];
assert.equal(factors.reduce((a, b) => a * b, 1), audioInteger);
const factorPrimeIndices = factors.map(primeIndex);
assert.deepEqual(factorPrimeIndices, [205, 173, 201]);
const factorResidues = factors.map(mod);
assert.deepEqual(factorResidues, [12, 16, 11]);
assert.equal(mod(audioInteger), 24);
assert.equal(mod(761), 7);
const primeIndexResidues = factorPrimeIndices.map(mod);
assert.deepEqual(primeIndexResidues, [2, 28, 27]);

// Hypothesis: prime indices are zero-based row-major offsets in the 32x8 grid.
// They form three corners of a 4x4 square; the fourth corner is 169.
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows[0].length, 8);
const flat = grid.rows.flat();
const primeOffsets = factorPrimeIndices;
const coordinates = primeOffsets.map(i => ({ index: i, row: Math.floor(i / 8), col: i % 8 }));
assert.deepEqual(coordinates, [
  { index: 205, row: 25, col: 5 },
  { index: 173, row: 21, col: 5 },
  { index: 201, row: 25, col: 1 }
]);
const fourthCorner = 21 * 8 + 1;
assert.equal(fourthCorner, 169);
const squareIndices = [169, 173, 201, 205];
const base60Value = pair => {
  const a = grid.alphabet.indexOf(pair[0]);
  const b = grid.alphabet.indexOf(pair[1]);
  assert.ok(a >= 0 && b >= 0);
  return a * 60 + b;
};
const squareValues = squareIndices.map(i => base60Value(flat[i]));
assert.deepEqual(squareValues, [228, 117, 74, 76]);
const squareResidues = squareValues.map(mod);
assert.deepEqual(squareResidues, [25, 1, 16, 18]);
const gridMatrix = [
  [squareResidues[0], squareResidues[1]],
  [squareResidues[2], squareResidues[3]]
];
assert.deepEqual(gridMatrix, [[25, 1], [16, 18]]);

// The file identifier supplies the scale 761 mod 29 = 7.
const B = gridMatrix.map(row => row.map(x => mod(7 * x)));
assert.deepEqual(B, [[1, 7], [25, 10]]);
assert.equal(mod(B[0][0] + B[1][1]), 11);
assert.equal(mod(B[0][0] * B[1][1] - B[0][1] * B[1][0]), 9);

// Existing p3/p39 field multiplication matrix: z=23+27u, u^2=3u+8.
const M0 = [[23, 13], [27, 17]];
const M0six = mpow(M0, 6);
assert.deepEqual(M0six, [[25, 12], [16, 15]]);
assert.equal(mod(M0six[0][0] + M0six[1][1]), 11);
assert.equal(mod(M0six[0][0] * M0six[1][1] - M0six[0][1] * M0six[1][0]), 9);

// One simple (non-unique) conjugacy witness, with source-visible 27 and 3.
const S = [[1, 0], [27, 3]];
assert.equal(mod(S[0][0] * S[1][1] - S[0][1] * S[1][0]), 3);
assert.ok(equalMatrix(mm(M0six, S), mm(S, B)));
assert.ok(scalarMatrix(mpow(B, 5), 11));
assert.ok(scalarMatrix(mpow(M0, 30), 11));
assert.equal(projectiveOrder(B).order, 5);
assert.equal(projectiveOrder(M0).order, 30);
assert.equal(matrixOrder(B), 140);
assert.equal(matrixOrder(M0), 840);

// Transform Ac=24 from the p3/p39 basis through S^-1 into the audio-grid basis.
const SInv = minv(S);
const transformedAcVector = mv(SInv, [24, 1]);
assert.deepEqual(transformedAcVector, [24, 26]);
const transformedAcCoordinate = projectiveCoordinate(transformedAcVector);
assert.equal(transformedAcCoordinate, 21);
const audioProjectiveOrbit = projectiveOrbit(B, transformedAcCoordinate, 5);
assert.deepEqual(audioProjectiveOrbit, [21, 20, 5, 22, 0]);
const p3p39SixthPowerOrbit = projectiveOrbit(M0six, 24, 5);
assert.deepEqual(p3p39SixthPowerOrbit, [24, 12, 20, 3, 0]);
const mappedOrbit = p3p39SixthPowerOrbit.map(x =>
  projectiveCoordinate(mv(SInv, x === null ? [1, 0] : [x, 1]))
);
assert.deepEqual(mappedOrbit, audioProjectiveOrbit);

console.log(JSON.stringify({
  audio: {
    integer: audioInteger,
    factors,
    factorPrimeIndices,
    factorResiduesMod29: factorResidues,
    productResidue: mod(audioInteger),
    fileId: 761,
    fileIdResidueMod29: mod(761),
    primeIndexResiduesMod29: primeIndexResidues
  },
  gridExtractionHypothesis: {
    shape: '32x8 row-major',
    primeOffsets,
    coordinates,
    completedFourthCorner: fourthCorner,
    squareIndices,
    base60Values: squareValues,
    residuesMod29: squareResidues,
    matrix: gridMatrix
  },
  scaledAudioMatrix: B,
  p3p39Matrix: M0,
  p3p39SixthPower: M0six,
  conjugatorWitness: S,
  equation: 'M0^6 * S = S * B (mod 29)',
  commonCharacteristicPolynomial: 'X^2 - 11X + 9',
  commonPower: 'B^5 = M0^30 = 11I',
  projectiveOrders: { B: 5, M0: 30 },
  fullMatrixOrders: { B: 140, M0: 840 },
  transformedAc24Vector: transformedAcVector,
  transformedAc24Coordinate: transformedAcCoordinate,
  audioProjectiveOrbit,
  p3p39SixthPowerOrbit,
  interpretation: 'The matrix relation is exact. The prime-ordinal-to-grid indexing and fourth-corner completion remain a hypothesis about intended construction; this script does not establish a decryption.'
}, null, 2));
