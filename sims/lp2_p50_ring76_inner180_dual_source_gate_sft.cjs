"use strict";

/**
 * Original 32x8 table partition and two independently visible potential
 * consumers. The links are candidate mechanisms, not authored instructions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} rel */
function json(rel) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", rel), "utf8"));
}

/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const n of arr) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}

const grid = json("resources/liber-primus/base60-grid.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const lines = fs.readFileSync(path.join(__dirname, "..",
  "resources/external/2013-01-14-missing-primes-pastebin.md"), "utf8")
  .split(/\r?\n/).filter((line) => /^\d+\.\s+\d/.test(line));
assert.equal(lines.length, 18);
const missing = lines.flatMap((line) =>
  line.replace(/^\d+\.\s+/, "").trim().split(/\s+/).map(Number));
assert.equal(missing.length, 180);
assert.equal(missing[0], 73);
assert.equal(missing.at(-1), 1223);
assert.ok(missing.every((p, i) =>
  Number.isInteger(p) && (i === 0 || p > missing[i - 1])));

const A = grid.byte_rows;
assert.equal(A.length, 32);
assert.ok(A.every((row) => row.length === 8));
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(corpus.pages[55].indices.length, 76);

const inner = A.slice(1, -1).flatMap((row) => row.slice(1, -1));
const xy = [];
for (let c = 0; c < 8; c++) xy.push([0, c]);
for (let r = 1; r < 32; r++) xy.push([r, 7]);
for (let c = 6; c >= 0; c--) xy.push([31, c]);
for (let r = 30; r >= 1; r--) xy.push([r, 0]);
const outer = xy.map(([r, c]) => A[r][c]);
assert.equal(outer.length, 76);
assert.equal(inner.length, 180);
assert.equal(inner.length + outer.length, 256);
assert.equal(new Set(xy.map(([r, c]) => r + ":" + c)).size, 76);

// Only 8x32 and 32x8 rectangles fit area 256, perimeter 76.
const dimensions = [];
for (let h = 2; h <= 256; h++) {
  if (256 % h !== 0) continue;
  const w = 256 / h;
  if (2 * (h + w) - 4 === 76) dimensions.push([h, w]);
}
assert.deepEqual(dimensions, [[8, 32], [32, 8]]);

const ciphertext = corpus.pages[55].indices;
const xor = [];
for (const keyRule of ["low5", "mod29"]) {
  const key = outer.map((v) => keyRule === "low5" ? v & 31 : v % 29);
  for (const orientation of ["clockwise", "reverse"]) {
    const schedule = orientation === "clockwise" ? key : key.slice().reverse();
    const decoded = ciphertext.map((c, i) => c ^ schedule[i]);
    const invalidPositions = decoded.flatMap((v, i) => v > 28 ? [i] : []);
    const valid = decoded.filter((v) => v <= 28).length;
    assert.deepEqual(decoded.map((v, i) => v ^ schedule[i]), ciphertext);
    xor.push({keyRule, orientation, valid, invalidPositions});
  }
}
assert.deepEqual(xor.map((x) => x.valid), [68, 68, 66, 72]);
assert.deepEqual(xor.at(-1).invalidPositions, [29, 30, 43, 44]);

const innerOriginal = inner.map((v) => v % 29);
const innerMinusPrime = inner.map((v, i) => (v - missing[i] % 29 + 29) % 29);
const innerPlusPrime = inner.map((v, i) => (v + missing[i]) % 29);
assert.equal(inner.filter((v, i) => v % 29 === missing[i] % 29).length, 3);
assert.equal(inner.filter((v, i) => v % 29 === (missing[i] - 1) % 29).length, 5);
assert.ok(Math.abs(ioc(innerOriginal) - 0.03823711980136561) < 1e-12);
assert.ok(Math.abs(ioc(innerMinusPrime) - 0.03767846058348852) < 1e-12);
assert.ok(Math.abs(ioc(innerPlusPrime) - 0.03333333333333333) < 1e-12);

console.log(JSON.stringify({
  grid: [32, 8], dimensions,
  perimeterCells: outer.length, interiorCells: inner.length,
  originalP55Runes: ciphertext.length,
  anonymous2013PrimeCount: missing.length,
  outerXor: xor,
  innerPrime: {
    directResidueMatches: 3,
    directTotientMatches: 5,
    rawIoC: ioc(innerOriginal),
    subtractIoC: ioc(innerMinusPrime),
    addIoC: ioc(innerPlusPrime),
    minusPrefix: innerMinusPrime.slice(0, 35)
      .map((v) => corpus.translit[v]).join("-")
  },
  decision: "Exact source-sized partition; neither direct consumer recovers GP29."
}, null, 2));
