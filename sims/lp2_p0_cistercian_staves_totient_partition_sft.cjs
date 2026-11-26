#!/usr/bin/env node
"use strict";

// Reproduces arithmetic conditional on the manual Cistercian reading,
// plus a cheap test for rune-distribution discontinuities at the proposed
// 6/10/42 page boundaries. It does NOT recognize the image and does NOT
// prove that the original p0 staves are Cistercian numerals.

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

function counts(values) {
  const out = Array(29).fill(0);
  for (const x of values) out[x] += 1;
  return out;
}

function distribution(values) {
  const c = counts(values);
  return c.map((n) => n / values.length);
}

function entropyBits(p) {
  return -p.reduce((sum, x) => x ? sum + x * Math.log2(x) : sum, 0);
}

function indexOfCoincidence(values) {
  const c = counts(values);
  const n = values.length;
  return c.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
}

function klBits(p, q) {
  return p.reduce((sum, x, i) => x ? sum + x * Math.log2(x / q[i]) : sum, 0);
}

function jsDivergence(p, q) {
  const m = p.map((x, i) => (x + q[i]) / 2);
  return (klBits(p, m) + klBits(q, m)) / 2;
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

const sectionStreams = ranges.map(([start, end]) =>
  corpus.pages.slice(start, end + 1).flatMap((p) => p.indices));
const sectionStats = sectionStreams.map((values, i) => ({
  pages: ranges[i],
  n: values.length,
  entropyBits: entropyBits(distribution(values)),
  ioc: indexOfCoincidence(values),
}));
const sectionJsd = {
  firstSecond: jsDivergence(distribution(sectionStreams[0]), distribution(sectionStreams[1])),
  secondThird: jsDivergence(distribution(sectionStreams[1]), distribution(sectionStreams[2])),
  firstThird: jsDivergence(distribution(sectionStreams[0]), distribution(sectionStreams[2])),
};

const pageDistributions = corpus.pages.map((p) => distribution(p.indices));
const adjacent = [];
for (let i = 0; i < pageDistributions.length - 1; i += 1) {
  adjacent.push({
    boundary: `${i}|${i + 1}`,
    jsd: jsDivergence(pageDistributions[i], pageDistributions[i + 1]),
  });
}
const sortedBoundaryJsd = adjacent.map((x) => x.jsd).sort((a, b) => a - b);
const boundaryChecks = ["5|6", "15|16"].map((boundary) => {
  const hit = adjacent.find((x) => x.boundary === boundary);
  const rank = adjacent.filter((x) => x.jsd <= hit.jsd).length;
  return { ...hit, rankAmong57: rank, percentile: rank / adjacent.length };
});

assert.equal(adjacent.length, 57);
assert.ok(Math.abs(sectionStats[0].ioc - 0.034458167201530034) < 1e-12);
assert.ok(Math.abs(sectionStats[1].ioc - 0.03460540258070315) < 1e-12);
assert.ok(Math.abs(sectionStats[2].ioc - 0.03450079306869727) < 1e-12);
assert.ok(Math.abs(boundaryChecks[0].jsd - 0.04079271820132574) < 1e-12);
assert.ok(Math.abs(boundaryChecks[1].jsd - 0.052063505604731414) < 1e-12);

// Secondary numerical alignment only; no subtraction rule is established.
assert.equal(1133 - 1033, 100);
assert.equal(3311 - 3301, 10);

console.log(JSON.stringify({
  caveat: "Arithmetic is conditional on the manual Cistercian glyph reading; distribution tests only assess simple rune-level shifts.",
  verticalPlaceValues,
  candidateGlyphs: {
    lowerLeft: { digits: lowerLeftGlyph, value: left, factors: primeFactors(left), phi: phi(left) },
    upperRight: { digits: upperRightGlyph, value: right, factors: primeFactors(right), phi: phi(right) },
  },
  factorTotients: primeFactorTotients,
  pageCount,
  pageRanges: ranges.map(([start, end], i) => ({ start, end, pages: sectionCounts[i] })),
  p32RuneCount: corpus.pages[32].indices.length,
  sectionStats,
  sectionJsd,
  boundaryChecks,
  medianAdjacentBoundaryJsd: sortedBoundaryJsd[28],
  topAdjacentBoundaries: adjacent.slice().sort((a, b) => b.jsd - a.jsd).slice(0, 8),
  magicConstantOffsets: { "1133-1033": 100, "3311-3301": 10 },
}, null, 2));
