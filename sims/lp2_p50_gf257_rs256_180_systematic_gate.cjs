"use strict";

/**
 * Source-fixed systematic GF(257) evaluation-code test for the original p50
 * 32x8 table. Physical row-major cell j is evaluated at x_j=38^(48+j).
 * The 180 original interior bytes define a degree<180 polynomial; predict
 * the 76 untouched perimeter bytes. No fitted phase, point ordering or degree.
 *
 * Node 22: node sims/lp2_p50_gf257_rs256_180_systematic_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
const P = 257;
const mod = (x) => ((x % P) + P) % P;
function pow(base, exponent) {
  let result = 1;
  let b = mod(base);
  let n = exponent;
  while (n > 0) {
    if (n & 1) result = mod(result * b);
    b = mod(b * b);
    n = Math.floor(n / 2);
  }
  return result;
}
function inv(value) {
  const a = mod(value);
  for (let x = 1; x < P; x++) if (mod(a * x) === 1) return x;
  throw new Error("Non-invertible GF(257) denominator");
}
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.ok(bytes.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));

const interior = [];
const border = [];
for (let j = 0; j < 256; j++) {
  const row = Math.floor(j / 8);
  const col = j % 8;
  if (row > 0 && row < 31 && col > 0 && col < 7) interior.push(j);
  else border.push(j);
}
assert.equal(interior.length, 180);
assert.equal(border.length, 76);

// FFF source terms fix g=38 and phase=48; row-major physical position fixes j.
const points = Array.from({ length: 256 }, (_, j) => pow(38, 48 + j));
assert.equal(new Set(points).size, 256);

function newtonCoefficients(xs, ys) {
  assert.equal(xs.length, ys.length);
  const divided = ys.slice();
  for (let order = 1; order < xs.length; order++) {
    for (let i = xs.length - 1; i >= order; i--) {
      divided[i] = mod((divided[i] - divided[i - 1]) * inv(xs[i] - xs[i - order]));
    }
  }
  return divided;
}
function evaluateNewton(coefficients, nodes, x) {
  let value = coefficients[coefficients.length - 1];
  for (let k = coefficients.length - 2; k >= 0; k--) {
    value = mod(coefficients[k] + mod(x - nodes[k]) * value);
  }
  return value;
}
function evaluatePowerPolynomial(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = mod(value * x + coefficients[i]);
  }
  return value;
}
function dftZeroBins(values) {
  const zeros = [];
  for (let k = 0; k < 256; k++) {
    let sum = 0;
    for (let j = 0; j < 256; j++) {
      sum = mod(sum + values[j] * pow(38, k * j));
    }
    if (sum === 0) zeros.push(k);
  }
  return zeros;
}
function fitAndPredict(values) {
  const xs = interior.map((j) => points[j]);
  const ys = interior.map((j) => values[j]);
  const coefficients = newtonCoefficients(xs, ys);
  const predictions = border.map((j) => evaluateNewton(coefficients, xs, points[j]));
  const actual = border.map((j) => values[j]);
  const mismatches = border.flatMap((j, i) => predictions[i] === actual[i] ? [] : [{
    index: j, row: Math.floor(j / 8), col: j % 8,
    actual: actual[i], predicted: predictions[i],
  }]);
  return { coefficients, predictions, actual, mismatches };
}

const expectedZeroBins = Array.from({ length: 76 }, (_, i) => i + 1);
const original = fitAndPredict(bytes);
const originalZeroBins = dftZeroBins(bytes);
assert.deepEqual(originalZeroBins, [76]);
assert.equal(original.mismatches.length, 76);

// Positive control: a genuine degree-179 polynomial on the same 256 points.
const plantedCoefficients = Array.from({ length: 180 }, (_, i) => i + 1);
const plantedValues = points.map((x) => evaluatePowerPolynomial(plantedCoefficients, x));
const planted = fitAndPredict(plantedValues);
const plantedZeroBins = dftZeroBins(plantedValues);
assert.equal(planted.mismatches.length, 0);
assert.deepEqual(plantedZeroBins, expectedZeroBins);

// A one-symbol corruption of the planted border must be detected.
const corrupted = plantedValues.slice();
corrupted[border[0]] = mod(corrupted[border[0]] + 1);
const corruptedResult = fitAndPredict(corrupted);
assert.equal(corruptedResult.mismatches.length, 1);
assert.equal(corruptedResult.mismatches[0].index, border[0]);

console.log(JSON.stringify({
  status: "source-fixed systematic RS(256,180) model rejected on original p50",
  field: 257,
  generator: 38,
  phase: 48,
  evaluationPointRule: "x_j = 38^(48+j) mod 257; j is physical row-major p50 cell index",
  physicalShape: [32, 8],
  informationPositions: interior,
  parityPositions: border,
  informationCount: interior.length,
  parityCount: border.length,
  interpolationDegreeBound: 179,
  original: {
    exactBorderMatches: border.length - original.mismatches.length,
    mismatchCount: original.mismatches.length,
    predictedBorderValues: original.predictions,
    actualBorderValues: original.actual,
    mismatchDetails: original.mismatches,
    dftZeroBins: originalZeroBins,
    dftZeroBinsRequiredByThisCode: expectedZeroBins,
  },
  plantedPositive: {
    polynomialCoefficientsAscending: plantedCoefficients,
    exactBorderMatches: border.length - planted.mismatches.length,
    mismatchCount: planted.mismatches.length,
    dftZeroBins: plantedZeroBins,
  },
  corruptedPositiveControl: {
    singleChangedBorderIndex: border[0],
    detectedMismatches: corruptedResult.mismatches.length,
    mismatchDetails: corruptedResult.mismatches,
  },
  decision: "The predeclared systematic evaluation code predicts 0/76 original perimeter bytes. The original DFT has only bin 76 zero, while this code requires bins 1..76. Do not vary phase, orientation, evaluation points or degree to rescue this model."
}, null, 2));
