"use strict";

/**
 * Test a p57-motivated 5-of-10 route through the two zero cells of the
 * canonical 32x8 LP2 numeric table.
 *
 * Run from repository root:
 *   node sims/p57_zero_endpoint_4x5_path_5of10_gate.cjs
 *
 * The only searched degree of freedom is the 126 monotone shortest paths
 * between the two source-fixed zero cells. No arbitrary row/column route,
 * key, field polynomial, or byte permutation is searched.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
assert.equal(grid.rows.length, 32);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const raw = Buffer.from(grid.byte_rows.flat());
assert.equal(raw.length, 256);
assert.equal(
  crypto.createHash("sha256").update(raw).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

const zeroCells = [];
grid.byte_rows.forEach((row, r) =>
  row.forEach((value, c) => { if (value === 0) zeroCells.push([r, c]); })
);
assert.deepEqual(zeroCells, [[24, 0], [28, 5]]);

const paths = [];
for (let mask = 0; mask < (1 << 9); mask++) {
  let downMoves = 0;
  for (let i = 0; i < 9; i++) downMoves += (mask >> i) & 1;
  if (downMoves !== 4) continue;
  let row = 24, column = 0;
  const coordinates = [[row, column]];
  for (let i = 0; i < 9; i++) {
    if ((mask >> i) & 1) row++;
    else column++;
    coordinates.push([row, column]);
  }
  assert.equal(row, 28);
  assert.equal(column, 5);
  const values = coordinates.map(([r, c]) => grid.byte_rows[r][c]);
  assert.equal(values.length, 10);
  assert.equal(values[0], 0);
  assert.equal(values[9], 0);
  assert.ok(values.slice(1, 9).every(value => value !== 0));
  paths.push({ mask, coordinates, values });
}
assert.equal(paths.length, 126);

function gf256Mul(a, b, polynomial) {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    b >>= 1;
    a <<= 1;
    if (a & 0x100) a ^= polynomial;
  }
  return result & 0xff;
}
function gf256Pow(a, exponent, polynomial) {
  let result = 1;
  while (exponent) {
    if (exponent & 1) result = gf256Mul(result, a, polynomial);
    a = gf256Mul(a, a, polynomial);
    exponent >>= 1;
  }
  return result;
}
function gf256Inv(a, polynomial) {
  assert.notEqual(a, 0);
  return gf256Pow(a, 254, polynomial);
}
function mod257(value) {
  return ((value % 257) + 257) % 257;
}
function pow257(a, exponent) {
  let result = 1;
  while (exponent) {
    if (exponent & 1) result = result * a % 257;
    a = a * a % 257;
    exponent >>= 1;
  }
  return result;
}

const fields = [
  { name: "GF256-AES-0x11b", kind: "gf256", polynomial: 0x11b },
  { name: "GF256-RS-0x11d", kind: "gf256", polynomial: 0x11d },
  { name: "GF257", kind: "prime" }
];

function interpolate(xs, ys, x, field) {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    let numerator = 1, denominator = 1;
    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;
      if (field.kind === "gf256") {
        numerator = gf256Mul(numerator, x ^ xs[j], field.polynomial);
        denominator = gf256Mul(denominator, xs[i] ^ xs[j], field.polynomial);
      } else {
        numerator = mod257(numerator * (x - xs[j]));
        denominator = mod257(denominator * (xs[i] - xs[j]));
      }
    }
    const inverse = field.kind === "gf256"
      ? gf256Inv(denominator, field.polynomial)
      : pow257(denominator, 255);
    const term = field.kind === "gf256"
      ? gf256Mul(ys[i], gf256Mul(numerator, inverse, field.polynomial), field.polynomial)
      : mod257(ys[i] * numerator % 257 * inverse % 257);
    total = field.kind === "gf256" ? total ^ term : mod257(total + term);
  }
  return total;
}

function evaluatePolynomial(coefficients, x, field) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = field.kind === "gf256"
      ? gf256Mul(value, x, field.polynomial) ^ coefficients[i]
      : mod257(value * x + coefficients[i]);
  }
  return value;
}

const reports = [];
for (const field of fields) {
  const histogram = {};
  let maxMatches = -1, best = null;
  for (const pathRecord of paths) {
    const trainX = [1, 2, 3, 4, 5];
    const trainY = pathRecord.values.slice(0, 5);
    const matches = [];
    for (let x = 6; x <= 10; x++) {
      matches.push(interpolate(trainX, trainY, x, field) === pathRecord.values[x - 1]);
    }
    const count = matches.filter(Boolean).length;
    histogram[count] = (histogram[count] || 0) + 1;
    if (count > maxMatches) {
      maxMatches = count;
      best = pathRecord;
    }
  }

  const coefficients = [17, 33, 91, 7, 211];
  const planted = Array.from({ length: 10 }, (_, i) =>
    evaluatePolynomial(coefficients, i + 1, field)
  );
  const plantedMatches = Array.from({ length: 5 }, (_, i) =>
    interpolate([1, 2, 3, 4, 5], planted.slice(0, 5), i + 6, field) === planted[i + 5]
  ).filter(Boolean).length;

  assert.ok(maxMatches <= 1);
  assert.equal(plantedMatches, 5);
  reports.push({
    field: field.name,
    pathsTested: paths.length,
    maximumOriginalHoldoutMatches: maxMatches,
    pathMatchHistogram: histogram,
    bestPath: {
      coordinates1Based: best.coordinates.map(([r, c]) => [r + 1, c + 1]),
      tenShareValues: best.values
    },
    plantedPositiveControlMatches: plantedMatches
  });
}

process.stdout.write(JSON.stringify({
  source: {
    file: "resources/liber-primus/base60-grid.json",
    rowMajorByteSha256: crypto.createHash("sha256").update(raw).digest("hex"),
    zeroCells1Based: [[25, 1], [29, 6]],
    displacement: { rows: 4, columns: 5, manhattanMoves: 9, pathVertices: 10 }
  },
  model: "One-byte 5-of-10 Shamir analogue: x=1..10 along each zero-to-zero path; first five values predict the last five.",
  reports,
  interpretation:
    "No monotone shortest path gives a degree-four 5-of-10 share set in the three fixed byte fields. This does not test the historical 22-byte GF(2^176) SSSS wire format or other path/decoding operations."
}, null, 2) + "\n");
