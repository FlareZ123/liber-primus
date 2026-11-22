"use strict";

/**
 * Single-file original-corpus GF(29) polynomial GCD test.
 *
 * Scope: 55 rune-bearing unknown physical pages, their nine visually marked
 * chapters, and the printed 256-cell base-60 numeric grid. Every polynomial
 * uses original book order as descending coefficients, with no phase search,
 * byte lifting, plaintext fitting, or unknown secret parameter.
 *
 * All tests are self-contained after reading the repository's canonical JSONs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
}

const inverse = Array(MOD).fill(0);
for (let value = 1; value < MOD; value++) {
  for (let candidate = 1; candidate < MOD; candidate++) {
    if ((value * candidate) % MOD === 1) inverse[value] = candidate;
  }
  assert.notEqual(inverse[value], 0);
}

/** A polynomial is an ascending coefficient array over GF(29). */
function trim(coefficients) {
  while (coefficients.length > 1 && coefficients.at(-1) === 0) {
    coefficients.pop();
  }
  return coefficients;
}

function residue(dividend, divisor) {
  const a = trim(dividend.slice());
  const b = trim(divisor.slice());
  assert(b.length > 1 || b[0] !== 0, "Division by zero polynomial");
  const degree = b.length - 1;
  if (degree === 0) return [0];
  const leadingInverse = inverse[b[degree]];
  for (let top = a.length - 1; top >= degree; top--) {
    const factor = (a[top] * leadingInverse) % MOD;
    if (factor === 0) continue;
    const base = top - degree;
    for (let offset = 0; offset <= degree; offset++) {
      a[base + offset] = (a[base + offset] -
        factor * b[offset] % MOD + MOD) % MOD;
    }
  }
  a.length = Math.min(a.length, degree);
  return trim(a.length ? a : [0]);
}

function gcd(left, right) {
  let a = trim(left.slice());
  let b = trim(right.slice());
  while (b.length !== 1 || b[0] !== 0) {
    const next = residue(a, b);
    a = b;
    b = next;
  }
  assert.notEqual(a.at(-1), 0);
  const factor = inverse[a.at(-1)];
  return a.map(value => (value * factor) % MOD);
}

function product(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = (out[i + j] + a[i] * b[j]) % MOD;
    }
  }
  return trim(out);
}

function bookPolynomial(values) {
  return trim(values.slice().reverse().map(value => value % MOD));
}

function scan(items) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const common = gcd(items[i].poly, items[j].poly);
      const degree = common.length - 1;
      if (degree > 0) {
        results.push({
          first: items[i].name,
          second: items[j].name,
          degree,
          polynomial: common
        });
      }
    }
  }
  return results;
}

const source = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/lp2-grid-256.json");
const pages = source.pages.filter(page => page.status === "unsolved");
const pageItems = pages.map(page => ({
  name: "p" + page.page,
  poly: bookPolynomial(page.indices)
}));
const grid = {name: "grid", poly: bookPolynomial(table.bytes)};
const items = pageItems.concat(grid);
assert.equal(pageItems.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(table.bytes.length, 256);

const pageMatches = scan(items);
const degreeCounts = {};
for (const hit of pageMatches) {
  degreeCounts[hit.degree] = (degreeCounts[hit.degree] || 0) + 1;
}
assert.equal(items.length * (items.length - 1) / 2, 1540);
assert.equal(pageMatches.length, 90);
assert.deepEqual(degreeCounts, {1: 88, 2: 2});
assert.deepEqual(pageMatches.filter(hit => hit.degree === 2), [
  {first: "p27", second: "p48", degree: 2, polynomial: [0, 6, 1]},
  {first: "p29", second: "grid", degree: 2, polynomial: [25, 10, 1]}
]);

const chapters = CHAPTERS.map(([first, last]) => ({
  name: "ch" + first + "-" + last,
  poly: bookPolynomial(pages.filter(page =>
    page.page >= first && page.page <= last
  ).flatMap(page => page.indices))
}));
assert.deepEqual(CHAPTERS.map(([first, last]) => pages.filter(page =>
  page.page >= first && page.page <= last
).reduce((sum, page) => sum + page.indices.length, 0)), [
  729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308
]);
// The polynomial representation legitimately drops a leading zero
// coefficient (GP-F) in two chapters; source rune counts do not change.
const chapterMatches = scan(chapters.concat(grid));
assert.equal(chapterMatches.length, 0);

// Source-motivated planted control: the known p29/grid quadratic must be
// recovered when multiplied into an otherwise unrelated page polynomial.
const factorG = [25, 10, 1];
assert.deepEqual(residue(grid.poly, factorG), [0]);
const synthetic = product(pageItems[0].poly, factorG);
assert.deepEqual(residue(synthetic, factorG), [0]);
const detected = gcd(synthetic, grid.poly);
assert.deepEqual(residue(detected, factorG), [0]);
assert(detected.length >= 3);

console.log(JSON.stringify({
  scope: "GF29 GCD of complete original page/chapter coefficient streams",
  originalRunes: 12956,
  pageAndGridPairs: 1540,
  nonconstantPageAndGridGCDs: pageMatches.length,
  degreeCounts,
  degreeTwoPairs: pageMatches.filter(hit => hit.degree === 2),
  chapterAndGridPairs: 45,
  chapterAndGridNonconstantGCDs: chapterMatches.length,
  syntheticQuadraticPlant: "PASS",
  interpretation: "No universal polynomial generator factor across " +
    "the nine physical chapters or multiple complete pages; this does " +
    "not exclude other coefficient clocks, keys or encryption layers."
}, null, 2));
