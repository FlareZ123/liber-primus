"use strict";

/**
 * Source-bounded 13-of-31 Shamir test with each printed 8-byte row packed
 * into one GF(2^64) field element.
 *
 * Run from repository root:
 *   node sims/grid_31share13_gf64_packed_row_gate.cjs
 *
 * This tests one sparse irreducible polynomial and three frozen x-coordinate
 * schedules. It is not a search over field polynomials or row permutations.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));

assert.equal(grid.page_row_counts.reduce((a, b) => a + b, 0), 32);
assert.equal(grid.rows.length, 32);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const raw = Buffer.from(grid.byte_rows.flat());
assert.equal(raw.length, 256);
assert.equal(
  crypto.createHash("sha256").update(raw).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

// One plausible sparse irreducible binary polynomial:
// f(x) = x^64 + x^4 + x^3 + x + 1.
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

// Rabin irreducibility criterion for degree 64: gcd(x^(2^32)-x,f)=1
// and x^(2^64)=x (subtraction is XOR in characteristic two).
let x32 = 2n;
for (let i = 0; i < 32; i++) x32 = gfMul(x32, x32);
assert.equal(polyGcd(x32 ^ 2n, MODULUS), 1n);
let x64 = x32;
for (let i = 0; i < 32; i++) x64 = gfMul(x64, x64);
assert.equal(x64, 2n);
for (const a of [1n, 2n, 3n, 0x123456789abcdef0n, MASK]) {
  assert.equal(gfMul(a, gfInv(a)), 1n);
}

// Printed left-to-right byte order is packed as one big-endian 64-bit share.
const values = grid.byte_rows.map(row =>
  row.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n)
);
assert.equal(values.length, 32);

const deBruijn = [
  31,30,28,25,19,6,13,26,20,9,18,4,8,16,
  0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15
].map(BigInt);

const layouts = [
  {
    name: "monotonic-x0-first",
    xs: Array.from({ length: 32 }, (_, i) => BigInt(i)),
    trainRows: Array.from({ length: 13 }, (_, i) => i + 1)
  },
  {
    name: "monotonic-x0-last",
    xs: Array.from({ length: 32 }, (_, i) => BigInt(i === 31 ? 0 : i + 1)),
    trainRows: Array.from({ length: 13 }, (_, i) => i)
  },
  {
    name: "documented-5bit-debruijn",
    xs: deBruijn,
    trainRows: Array.from({ length: 13 }, (_, i) => i)
  }
];

function interpolationPlan(xs) {
  return xs.map((xi, i) => {
    let denominator = 1n;
    for (let j = 0; j < xs.length; j++) {
      if (i !== j) denominator = gfMul(denominator, xi ^ xs[j]);
    }
    return gfInv(denominator);
  });
}

function interpolate(xs, ys, x, inverseDenominators) {
  let result = 0n;
  for (let i = 0; i < xs.length; i++) {
    let numerator = 1n;
    for (let j = 0; j < xs.length; j++) {
      if (i !== j) numerator = gfMul(numerator, x ^ xs[j]);
    }
    const basis = gfMul(numerator, inverseDenominators[i]);
    result ^= gfMul(ys[i], basis);
  }
  return result;
}

function evaluatePolynomial(coefficients, x) {
  let value = 0n;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = gfMul(value, x) ^ coefficients[i];
  }
  return value;
}

const reports = [];
for (const layout of layouts) {
  assert.equal(new Set(layout.xs.map(String)).size, 32);
  const trainSet = new Set(layout.trainRows);
  const heldRows = Array.from({ length: 32 }, (_, i) => i)
    .filter(i => !trainSet.has(i));
  assert.equal(layout.trainRows.length, 13);
  assert.equal(heldRows.length, 19);

  const trainX = layout.trainRows.map(i => layout.xs[i]);
  const trainY = layout.trainRows.map(i => values[i]);
  const invDenominators = interpolationPlan(trainX);
  const matches = heldRows.map(i =>
    interpolate(trainX, trainY, layout.xs[i], invDenominators) === values[i]
  );

  // Independent planted degree-12 positive control on the same x schedule.
  const coefficients = Array.from({ length: 13 }, (_, i) =>
    (BigInt(i + 1) * 0x9e3779b97f4a7c15n ^ (BigInt(i + 3) << 37n)) & MASK
  );
  const planted = layout.xs.map(x => evaluatePolynomial(coefficients, x));
  const plantedTrainY = layout.trainRows.map(i => planted[i]);
  const plantedMatches = heldRows.map(i =>
    interpolate(trainX, plantedTrainY, layout.xs[i], invDenominators) === planted[i]
  );

  const firstHeld = heldRows[0];
  const firstPrediction = interpolate(
    trainX, trainY, layout.xs[firstHeld], invDenominators
  );
  const secretRow = layout.xs.findIndex(x => x === 0n);
  assert.equal(matches.filter(Boolean).length, 0);
  assert.equal(plantedMatches.filter(Boolean).length, 19);

  reports.push({
    layout: layout.name,
    zeroCoordinatePrintedRow: secretRow + 1,
    trainingPrintedRows: layout.trainRows.map(i => i + 1),
    heldOutPredictions: 19,
    exactOriginalMatches: matches.filter(Boolean).length,
    plantedPositiveControlMatches: plantedMatches.filter(Boolean).length,
    firstHeldOutPrintedRow: firstHeld + 1,
    firstPredictionHex: firstPrediction.toString(16).padStart(16, "0"),
    firstActualHex: values[firstHeld].toString(16).padStart(16, "0")
  });
}

process.stdout.write(JSON.stringify({
  source: {
    file: "resources/liber-primus/base60-grid.json",
    dimensions: "32 rows × 8 bytes",
    packing: "printed left-to-right, big-endian 64-bit row",
    rowMajorByteSha256: crypto.createHash("sha256").update(raw).digest("hex")
  },
  field: "GF(2^64), x^64 + x^4 + x^3 + x + 1 (irreducible; reduction 0x1b)",
  threshold: 13,
  reports,
  interpretation:
    "The three frozen packed-row 13-of-31 models fail every original holdout; all planted degree-12 controls pass. No key or plaintext is recovered."
}, null, 2) + "\n");
