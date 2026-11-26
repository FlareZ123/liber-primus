#!/usr/bin/env node
"use strict";

// Reproduces arithmetic conditional on the manual Cistercian reading.
// It does NOT perform image recognition and does NOT prove that the
// original p0 staves are Cistercian numerals.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpusPath = path.join(root, "resources", "liber-primus", "lp2-corpus.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));

const verticalPlaceValues = {
  units: "upper-right",
  tens: "upper-left",
  hundreds: "lower-right",
  thousands: "lower-left",
};

// Manual candidate stroke assignments from the two p0 marginal staves.
const lowerLeftGlyph = { thousands: 1, hundreds: 1, tens: 3, units: 3 };
const upperRightGlyph = { thousands: 3, hundreds: 3, tens: 1, units: 1 };

function decodeCistercian(digits) {
  return 1000 * digits.thousands
    + 100 * digits.hundreds
    + 10 * digits.tens
    + digits.units;
}

function primeFactors(n) {
  const out = [];
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p === 0) {
      out.push(p);
      while (x % p === 0) x /= p;
    }
  }
  if (x > 1) out.push(x);
  return out;
}

function phi(n) {
  let result = n;
  for (const p of primeFactors(n)) result = (result / p) * (p - 1);
  return result;
}

const left = decodeCistercian(lowerLeftGlyph);
const right = decodeCistercian(upperRightGlyph);

assert.equal(left, 1133);
assert.equal(right, 3311);
assert.deepEqual(primeFactors(left), [11, 103]);
assert.deepEqual(primeFactors(right), [7, 11, 43]);
assert.equal(phi(left), 1020);
assert.equal(phi(right), 2520);

const primeFactorTotients = primeFactors(right).map((p) => p - 1);
assert.deepEqual(primeFactorTotients, [6, 10, 42]);
assert.equal(primeFactorTotients.reduce((a, b) => a + b, 0), 58);
assert.equal(primeFactorTotients.reduce((a, b) => a * b, 1), phi(right));

const pageCount = corpus.pages.length;
assert.equal(pageCount, 58);
const ranges = [[0, 5], [6, 15], [16, 57]];
const sectionCounts = ranges.map(([start, end]) => end - start + 1);
assert.deepEqual(sectionCounts, [6, 10, 42]);
assert.equal(sectionCounts.reduce((a, b) => a + b, 0), pageCount);
assert.equal(corpus.pages[32].indices.length, 121);

// Secondary numerical alignment only; no subtraction rule is established.
assert.equal(1133 - 1033, 100);
assert.equal(3311 - 3301, 10);

console.log(JSON.stringify({
  caveat: "Arithmetic is conditional on the manual Cistercian glyph reading.",
  verticalPlaceValues,
  candidateGlyphs: {
    lowerLeft: { digits: lowerLeftGlyph, value: left, factors: primeFactors(left), phi: phi(left) },
    upperRight: { digits: upperRightGlyph, value: right, factors: primeFactors(right), phi: phi(right) },
  },
  factorTotients: primeFactorTotients,
  pageCount,
  pageRanges: ranges.map(([start, end], i) => ({
    start,
    end,
    pages: sectionCounts[i],
  })),
  p32RuneCount: corpus.pages[32].indices.length,
  magicConstantOffsets: { "1133-1033": 100, "3311-3301": 10 },
}, null, 2));
