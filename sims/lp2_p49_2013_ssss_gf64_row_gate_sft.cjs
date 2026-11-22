"use strict";

/**
 * One-row/one-share 5-of-10 test for the ten printed p49 rows.
 *
 * Run from repository root:
 *   node sims/lp2_p49_2013_ssss_gf64_row_gate_sft.cjs
 *
 * Each printed eight-byte row is packed left-to-right as one big-endian
 * GF(2^64) element. Decimal row IDs are x=1..10. The polynomial is monic
 * degree five, matching the historical ssss threshold convention.
 *
 * This is one fixed LP2-shaped GF64 candidate, not the historical GF(2^176)
 * wire format and not a search over fields, byte orders or row permutations.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));

assert.equal(grid.page_row_counts[0], 10, "p49 must contain ten printed rows");
assert.equal(grid.page_row_counts.reduce((a, b) => a + b, 0), 32);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const raw = Buffer.from(grid.byte_rows.flat());
assert.equal(raw.length, 256);
const tableSha256 = crypto.createHash("sha256").update(raw).digest("hex");
assert.equal(
  tableSha256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

const p49Rows = grid.byte_rows.slice(0, 10);
assert.equal(p49Rows.length, 10);

// GF(2^64), f(X)=X^64+X^4+X^3+X+1; reduction lower terms are 0x1b.
const MASK = (1n << 64n) - 1n;
const REDUCTION = 0x1bn;
const MODULUS = (1n << 64n) | REDUCTION;

function gfMul(a, b) {
  let result = 0n;
  for (let i = 0; i < 64; i++) {
    if (b & 1n) result ^= a;
    b >>= 1n;
    const high = (a >> 63n) & 1n;
    a = (a << 1n) & MASK;
    if (high) a ^= REDUCTION;
  }
  return result & MASK;
}

function gfPow(a, exponent) {
  let result = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) result = gfMul(result, a);
    a = gfMul(a, a);
    exponent >>= 1n;
  }
  return result;
}

function gfInv(a) {
  assert.notEqual(a, 0n);
  return gfPow(a, (1n << 64n) - 2n);
}

function polyDegree(a) {
  return a === 0n ? -1 : a.toString(2).length - 1;
}

function polyMod(a, b) {
  while (a !== 0n && polyDegree(a) >= polyDegree(b)) {
    a ^= b << BigInt(polyDegree(a) - polyDegree(b));
  }
  return a;
}

function polyGcd(a, b) {
  while (b !== 0n) [a, b] = [b, polyMod(a, b)];
  return a;
}

// Rabin irreducibility criterion for degree 64.
let x32 = 2n;
for (let i = 0; i < 32; i++) x32 = gfMul(x32, x32);
assert.equal(polyGcd(x32 ^ 2n, MODULUS), 1n);
let x64 = x32;
for (let i = 0; i < 32; i++) x64 = gfMul(x64, x64);
assert.equal(x64, 2n);
for (const a of [1n, 2n, 3n, 0x123456789abcdef0n, MASK]) {
  assert.equal(gfMul(a, gfInv(a)), 1n);
}

function packRows(rows) {
  return rows.map(row =>
    row.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n)
  );
}

function fitMonicDegreeFive(values, trainingRows) {
  assert.equal(trainingRows.length, 5);
  // y(x) = x^5 + a4*x^4 + a3*x^3 + a2*x^2 + a1*x + a0.
  // In characteristic two, y XOR x^5 is the degree-at-most-four part.
  const matrix = trainingRows.map(rowIndex => {
    const x = BigInt(rowIndex + 1);
    const powers = [1n];
    for (let k = 1; k <= 4; k++) powers.push(gfMul(powers[k - 1], x));
    return [...powers, values[rowIndex] ^ gfPow(x, 5n)];
  });

  // Solve the 5x5 Vandermonde system over GF(2^64).
  for (let column = 0; column < 5; column++) {
    let pivot = column;
    while (pivot < 5 && matrix[pivot][column] === 0n) pivot++;
    assert.ok(pivot < 5, "distinct x coordinates must give nonsingular Vandermonde");
    [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]];

    const scale = gfInv(matrix[column][column]);
    for (let j = column; j < 6; j++) {
      matrix[column][j] = gfMul(matrix[column][j], scale);
    }

    for (let row = 0; row < 5; row++) {
      if (row === column) continue;
      const factor = matrix[row][column];
      if (factor === 0n) continue;
      for (let j = column; j < 6; j++) {
        matrix[row][j] ^= gfMul(factor, matrix[column][j]);
      }
    }
  }
  return matrix.map(row => row[5]); // a0..a4
}

function evaluateMonicDegreeFive(coefficients, x) {
  let value = 1n; // leading coefficient of x^5
  for (let k = 4; k >= 0; k--) {
    value = gfMul(value, x) ^ coefficients[k];
  }
  return value;
}

function combinations(n, k, start = 0, prefix = [], output = []) {
  if (prefix.length === k) {
    output.push([...prefix]);
    return output;
  }
  for (let i = start; i <= n - (k - prefix.length); i++) {
    prefix.push(i);
    combinations(n, k, i + 1, prefix, output);
    prefix.pop();
  }
  return output;
}

const allFiveRowSubsets = combinations(10, 5);
assert.equal(allFiveRowSubsets.length, 252);

function evaluateAllSubsets(values) {
  let exactFiveOfFive = 0;
  let maxHoldoutMatches = 0;
  let totalExactHoldoutPredictions = 0;
  const histogram = {};

  for (const trainingRows of allFiveRowSubsets) {
    const coefficients = fitMonicDegreeFive(values, trainingRows);
    const trainingSet = new Set(trainingRows);
    const heldRows = Array.from({ length: 10 }, (_, i) => i)
      .filter(i => !trainingSet.has(i));
    assert.equal(heldRows.length, 5);

    const matches = heldRows.filter(rowIndex =>
      evaluateMonicDegreeFive(coefficients, BigInt(rowIndex + 1)) === values[rowIndex]
    ).length;

    histogram[matches] = (histogram[matches] || 0) + 1;
    totalExactHoldoutPredictions += matches;
    maxHoldoutMatches = Math.max(maxHoldoutMatches, matches);
    if (matches === 5) exactFiveOfFive++;
  }

  return {
    subsets: allFiveRowSubsets.length,
    exactFiveOfFiveSubsets: exactFiveOfFive,
    maxHoldoutMatchesPerSubset: maxHoldoutMatches,
    totalExactHoldoutPredictions,
    totalHoldoutPredictions: allFiveRowSubsets.length * 5,
    histogram
  };
}

function firstFivePrediction(values) {
  const coefficients = fitMonicDegreeFive(values, [0, 1, 2, 3, 4]);
  return Array.from({ length: 5 }, (_, j) => {
    const rowIndex = j + 5;
    const predicted = evaluateMonicDegreeFive(coefficients, BigInt(rowIndex + 1));
    return {
      decimalShareId: rowIndex + 1,
      predictedHex: predicted.toString(16).padStart(16, "0"),
      actualHex: values[rowIndex].toString(16).padStart(16, "0"),
      exact: predicted === values[rowIndex]
    };
  });
}

const forwardValues = packRows(p49Rows);
const reverseValues = packRows(p49Rows.slice().reverse());
const forward = evaluateAllSubsets(forwardValues);
const reverse = evaluateAllSubsets(reverseValues);
const forwardFirstFive = firstFivePrediction(forwardValues);
const reverseFirstFive = firstFivePrediction(reverseValues);

assert.equal(forward.totalExactHoldoutPredictions, 0);
assert.equal(forward.maxHoldoutMatchesPerSubset, 0);
assert.deepEqual(forward.histogram, { 0: 252 });
assert.equal(reverse.totalExactHoldoutPredictions, 0);
assert.equal(reverse.maxHoldoutMatchesPerSubset, 0);
assert.deepEqual(reverse.histogram, { 0: 252 });
assert.equal(forwardFirstFive.filter(x => x.exact).length, 0);
assert.equal(reverseFirstFive.filter(x => x.exact).length, 0);

// Independent positive control: a planted monic degree-five polynomial.
const plantedCoefficients = [
  0x0123456789abcdefn,
  0xfedcba9876543210n,
  0x0f1e2d3c4b5a6978n,
  0x8877665544332211n,
  0x13579bdf2468ace0n
];
const plantedForward = Array.from({ length: 10 }, (_, i) =>
  evaluateMonicDegreeFive(plantedCoefficients, BigInt(i + 1))
);
const plantedReverse = plantedForward.slice().reverse();
const plantedForwardStats = evaluateAllSubsets(plantedForward);
const plantedReverseStats = evaluateAllSubsets(plantedReverse);
for (const control of [plantedForwardStats, plantedReverseStats]) {
  assert.equal(control.exactFiveOfFiveSubsets, 252);
  assert.equal(control.totalExactHoldoutPredictions, 1260);
  assert.deepEqual(control.histogram, { 5: 252 });
}

process.stdout.write(JSON.stringify({
  source: {
    file: "resources/liber-primus/base60-grid.json",
    physicalPage: 49,
    printedRows: 10,
    bytesPerRow: 8,
    packing: "printed left-to-right, big-endian 64-bit",
    completeTableByteSha256: tableSha256
  },
  model: {
    shareIds: "decimal 1..10",
    threshold: 5,
    polynomial: "monic degree five",
    field: "GF(2^64), X^64 + X^4 + X^3 + X + 1",
    irreducibility: "Rabin criterion passed",
    searched: "no other field polynomial, byte order, row permutation or x-label assignment"
  },
  original: {
    topToBottom: forward,
    bottomToTop: reverse,
    topToBottomFirstFivePredictions: forwardFirstFive,
    bottomToTopFirstFivePredictions: reverseFirstFive
  },
  plantedPositiveControls: {
    topToBottom: plantedForwardStats,
    bottomToTop: plantedReverseStats
  },
  interpretation:
    "The fixed p49 row-packed GF64 5-of-10 model predicts 0/1260 held-out rows in each orientation; both planted controls predict 1260/1260. This excludes only this exact representation, not all possible LP2 sharing or field choices."
}, null, 2) + "\n");
