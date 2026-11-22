#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const rows = grid.byte_rows;
const rowMajor = rows.flat();
const columnMajor = Array.from({length: 8}, (_, c) =>
  rows.map(row => row[c])).flat();

// Preserve the original two-character table tokens so both fixed radix
// interpretations are parsed from the same physical row-major source.
const GRID_TOKENS = grid.rows.flat();
const ALPHABET60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const ALPHABET59 = ALPHABET60.replace('f', '');
const EXPECTED_BASE60_SHA256 =
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
assert.equal(grid.alphabet, ALPHABET60);
assert.equal(GRID_TOKENS.length, 256);
assert.equal(GRID_TOKENS.some(token => token.includes('f')), false);
assert.equal(ALPHABET59.length, 59);

function decodeGridTokens(alphabet) {
  return GRID_TOKENS.map(token => {
    assert.equal(token.length, 2);
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert(high >= 0 && low >= 0, `Invalid token ${token} for radix ${alphabet.length}`);
    const value = high * alphabet.length + low;
    assert(value >= 0 && value <= 255);
    return value;
  });
}
const base60GridBytes = decodeGridTokens(ALPHABET60);
const base59GridBytes = decodeGridTokens(ALPHABET59);
assert.deepEqual(base60GridBytes, rowMajor);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(base60GridBytes)).digest('hex'),
  EXPECTED_BASE60_SHA256
);
const base59ChangedPositions = base60GridBytes.filter(
  (value, i) => value !== base59GridBytes[i]
).length;
assert.equal(base59ChangedPositions, 220);
assert.equal(Math.min(...base59GridBytes), 0);
assert.equal(Math.max(...base59GridBytes), 251);

assert.equal(rowMajor.length, 256);
assert.equal(columnMajor.length, 256);

function bmGF2(sequence) {
  let C = [1], B = [1], L = 0, m = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= L; i++) discrepancy ^= (C[i] || 0) * sequence[n - i];
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    for (let j = 0; j < B.length; j++) {
      if (B[j]) C[j + m] = (C[j + m] || 0) ^ B[j];
    }
    if (2 * L <= n) { L = n + 1 - L; B = previousC; m = 1; }
    else m++;
  }
  return L;
}

function gfMul(a, b, polynomial = 0x11d) {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 0x100) a ^= polynomial; // GF(256), primitive polynomial x^8+x^4+x^3+x^2+1
  }
  return result & 0xff;
}
function gfPow(a, n, polynomial = 0x11d) {
  let result = 1;
  while (n) {
    if (n & 1) result = gfMul(result, a, polynomial);
    a = gfMul(a, a, polynomial);
    n >>>= 1;
  }
  return result;
}
function gfDiv(a, b, polynomial = 0x11d) {
  assert.notEqual(b, 0);
  return gfMul(a, gfPow(b, 254, polynomial), polynomial);
}
function bmGF256(sequence, polynomial = 0x11d) {
  let C = [1], B = [1], L = 0, m = 1, previousDiscrepancy = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= L; i++) {
      discrepancy ^= gfMul(C[i] || 0, sequence[n - i], polynomial);
    }
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    const coefficient = gfDiv(discrepancy, previousDiscrepancy, polynomial);
    for (let j = 0; j < B.length; j++) {
      if (B[j]) C[j + m] = (C[j + m] || 0) ^ gfMul(coefficient, B[j], polynomial);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B = previousC;
      previousDiscrepancy = discrepancy;
      m = 1;
    } else m++;
  }
  return L;
}


function mod29(value) { return ((value % 29) + 29) % 29; }

function inv29(value) {
  const a = mod29(value);
  assert.notEqual(a, 0);
  for (let candidate = 1; candidate < 29; candidate++) {
    if (mod29(a * candidate) === 1) return candidate;
  }
  throw new Error('No inverse in GF(29)');
}

/** Berlekamp–Massey with C[0]=1 and s[n]+sum(C[i]*s[n-i])=0. */
function bmGF29(sequence) {
  let C = [1], B = [1], L = 0, m = 1, previousDiscrepancy = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = mod29(sequence[n]);
    for (let i = 1; i <= L; i++) {
      discrepancy = mod29(discrepancy + (C[i] || 0) * sequence[n - i]);
    }
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    const scale = mod29(discrepancy * inv29(previousDiscrepancy));
    while (C.length < B.length + m) C.push(0);
    for (let j = 0; j < B.length; j++) {
      C[j + m] = mod29(C[j + m] - scale * B[j]);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B = previousC;
      previousDiscrepancy = discrepancy;
      m = 1;
    } else m++;
  }
  C.length = L + 1;
  return {complexity: L, coefficients: C};
}

/** Exact Gaussian rank over GF(29), verifying uniqueness of the fitted recurrence. */
function rankGF29(matrix) {
  if (matrix.length === 0) return 0;
  const a = matrix.map(row => row.map(mod29));
  let rank = 0;
  for (let col = 0; col < a[0].length && rank < a.length; col++) {
    let pivot = rank;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const scale = inv29(a[rank][col]);
    for (let j = col; j < a[rank].length; j++) {
      a[rank][j] = mod29(a[rank][j] * scale);
    }
    for (let i = 0; i < a.length; i++) {
      if (i === rank || a[i][col] === 0) continue;
      const factor = a[i][col];
      for (let j = col; j < a[i].length; j++) {
        a[i][j] = mod29(a[i][j] - factor * a[rank][j]);
      }
    }
    rank++;
  }
  return rank;
}

function evaluateGF29Sequence(sequence) {
  assert.equal(sequence.length, 256);
  const training = sequence.slice(0, 128).map(mod29);
  const model = bmGF29(training);
  const L = model.complexity;
  const coefficients = model.coefficients;
  const trainingMatrix = Array.from({length: 128 - L}, (_, row) => {
    const n = L + row;
    return Array.from({length: L}, (_, i) => training[n - i - 1]);
  });
  let trainingEquationsSatisfied = 0;
  for (let n = L; n < 128; n++) {
    let discrepancy = training[n];
    for (let i = 1; i <= L; i++) {
      discrepancy = mod29(discrepancy + coefficients[i] * training[n - i]);
    }
    if (discrepancy === 0) trainingEquationsSatisfied++;
  }
  const predicted = training.slice();
  for (let n = 128; n < 256; n++) {
    let next = 0;
    for (let i = 1; i <= L; i++) {
      next = mod29(next - coefficients[i] * predicted[n - i]);
    }
    predicted.push(next);
  }
  const firstMismatchOffsets = [];
  let heldoutMatches = 0;
  for (let n = 128; n < 256; n++) {
    if (predicted[n] === mod29(sequence[n])) heldoutMatches++;
    else if (firstMismatchOffsets.length < 12) firstMismatchOffsets.push(n);
  }
  return {
    linearComplexity: L,
    recurrenceCoefficientsC0ToCL: coefficients,
    trainingEquationsSatisfied,
    trainingEquationCount: 128 - L,
    trainingSystemRank: rankGF29(trainingMatrix),
    heldoutExactPredictions: heldoutMatches,
    heldoutCount: 128,
    firstMismatchOffsets
  };
}

function makeGF29Plant(degree, seed) {
  const coefficients = [1];
  for (let i = 1; i <= degree; i++) {
    coefficients[i] = mod29(7 * i * i + 11 * i + 3);
  }
  const sequence = seed.map(mod29);
  for (let n = sequence.length; n < 256; n++) {
    let next = 0;
    for (let i = 1; i <= degree; i++) {
      next = mod29(next - coefficients[i] * sequence[n - i]);
    }
    sequence.push(next);
  }
  const recovered = evaluateGF29Sequence(sequence);
  return {
    plantedDegree: degree,
    plantedCoefficients: coefficients,
    recoveredDegree: recovered.linearComplexity,
    recoveredCoefficients: recovered.recurrenceCoefficientsC0ToCL,
    trainingSystemRank: recovered.trainingSystemRank,
    heldoutExactPredictions: recovered.heldoutExactPredictions
  };
}

const gf29Base60 = evaluateGF29Sequence(base60GridBytes.map(value => value % 29));
const gf29Base59 = evaluateGF29Sequence(base59GridBytes.map(value => value % 29));
const gf29Plant3 = makeGF29Plant(3, [2, 5, 8]);
const gf29Plant11 = makeGF29Plant(11, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
assert.equal(gf29Base60.linearComplexity, 64);
assert.equal(gf29Base59.linearComplexity, 64);
assert.equal(gf29Base60.trainingEquationsSatisfied, 64);
assert.equal(gf29Base59.trainingEquationsSatisfied, 64);
assert.equal(gf29Base60.trainingSystemRank, 64);
assert.equal(gf29Base59.trainingSystemRank, 64);
assert.equal(gf29Base60.heldoutExactPredictions, 4);
assert.equal(gf29Base59.heldoutExactPredictions, 7);
assert.equal(gf29Plant3.recoveredDegree, 3);
assert.deepEqual(gf29Plant3.recoveredCoefficients, gf29Plant3.plantedCoefficients);
assert.equal(gf29Plant3.heldoutExactPredictions, 128);
assert.equal(gf29Plant11.recoveredDegree, 11);
assert.deepEqual(gf29Plant11.recoveredCoefficients, gf29Plant11.plantedCoefficients);
assert.equal(gf29Plant11.heldoutExactPredictions, 128);

const gf29RowMajor = {
  field: 'GF(29)',
  serialization: 'Original 32x8 printed tokens, row-major; residues are byteValue mod 29',
  trainingSymbols: 128,
  heldoutSymbols: 128,
  recurrenceConvention: 's[n] + sum(C[i] * s[n-i], i=1..L) = 0 mod 29; C[0]=1',
  base60: gf29Base60,
  base59Control: gf29Base59,
  positiveControls: [gf29Plant3, gf29Plant11],
  conclusion: 'No recurrence of order <=64 predicts the complete 256-symbol stream under either fixed radix interpretation; higher-order and nonlinear uses are not excluded.'
};

const bitPlanes = [];
for (let bit = 0; bit < 8; bit++) {
  const msb = rowMajor.map(v => (v >>> (7 - bit)) & 1);
  const lsb = rowMajor.map(v => (v >>> bit) & 1);
  bitPlanes.push({bit, msbComplexity: bmGF2(msb), lsbComplexity: bmGF2(lsb)});
}
const binaryMSB = rowMajor.flatMap(v =>
  Array.from({length: 8}, (_, i) => (v >>> (7 - i)) & 1));
const binaryLSB = rowMajor.flatMap(v =>
  Array.from({length: 8}, (_, i) => (v >>> i) & 1));

// Positive controls validate both implementations on known low-degree recurrences.
const binaryPlant = [1, 0, 1];
for (let i = 3; i < 256; i++) binaryPlant.push(binaryPlant[i - 1] ^ binaryPlant[i - 3]);
const gfPlant = [1, 7];
for (let i = 2; i < 256; i++) {
  gfPlant.push(gfMul(2, gfPlant[i - 1], 0x11d) ^ gfMul(3, gfPlant[i - 2], 0x11d));
}
const gfPlantAes = [1, 7];
for (let i = 2; i < 256; i++) {
  gfPlantAes.push(gfMul(2, gfPlantAes[i - 1], 0x11b) ^ gfMul(3, gfPlantAes[i - 2], 0x11b));
}
assert.equal(bmGF2(binaryPlant), 3);
assert.equal(bmGF256(gfPlant, 0x11d), 2);
assert.equal(bmGF256(gfPlantAes, 0x11b), 2);

const result = {
  gf29RowMajor,
  source: {
    dimensions: '32x8',
    byteCount: rowMajor.length,
    uniqueByteValues: new Set(rowMajor).size,
    min: Math.min(...rowMajor),
    max: Math.max(...rowMajor),
    mean: rowMajor.reduce((a, b) => a + b, 0) / rowMajor.length,
    base60TokenStreamSha256: crypto.createHash('sha256').update(Buffer.from(base60GridBytes)).digest('hex'),
    base59TokenStreamSha256: crypto.createHash('sha256').update(Buffer.from(base59GridBytes)).digest('hex'),
    base59Alphabet: ALPHABET59,
    base59ChangedPositions: base59ChangedPositions
  },
  linearComplexity: {
    gf256Polynomials: {
      '0x11d': {rowMajor: bmGF256(rowMajor, 0x11d), columnMajor: bmGF256(columnMajor, 0x11d)},
      '0x11b': {rowMajor: bmGF256(rowMajor, 0x11b), columnMajor: bmGF256(columnMajor, 0x11b)}
    },
    binary2048BitRowMajorMSB: bmGF2(binaryMSB),
    binary2048BitRowMajorLSB: bmGF2(binaryLSB),
    bitPlanes
  },
  positiveControls: {
    binaryKnownDegree3: bmGF2(binaryPlant),
    gf256KnownDegree2_0x11d: bmGF256(gfPlant, 0x11d),
    gf256KnownDegree2_0x11b: bmGF256(gfPlantAes, 0x11b),
    gf29Degree3: gf29Plant3,
    gf29Degree11: gf29Plant11
  }
};
console.log(JSON.stringify(result, null, 2));
