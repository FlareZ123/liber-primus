"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const T = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;

assert.equal(T.length, 256);
const p55 = GP.pages.find((page) => page.page === 55).indices;
assert.equal(p55.length, 76);

const mod = (x) => ((x % 257) + 257) % 257;

// Printed 32x8 table perimeter, clockwise from top-left.
const perimeterIndices = [];
for (let col = 0; col < 8; col++) perimeterIndices.push(col);
for (let row = 1; row < 32; row++) perimeterIndices.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) perimeterIndices.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) perimeterIndices.push(row * 8);
assert.equal(perimeterIndices.length, 76);
assert.equal(new Set(perimeterIndices).size, 76);

const perimeter = perimeterIndices.map((index) => T[index]);
const interior = [];
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) interior.push(T[row * 8 + col]);
}
assert.equal(interior.length, 180);

// Divide high-first coefficient vectors over GF(257). Every divisor is monic,
// so each quotient step is a single multiply/subtract pass.
function divideHighFirst(dividend, divisor) {
  assert.equal(divisor[0], 1, "divisor must be monic");
  const remainder = dividend.map(mod);
  const quotient = Array(dividend.length - divisor.length + 1).fill(0);
  for (let i = 0; i < quotient.length; i++) {
    const factor = remainder[i];
    quotient[i] = factor;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - factor * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(quotient.length) };
}

const tests = [];
function testFamily(family, coefficients, meta = {}) {
  for (const reverseCoefficients of [false, true]) {
    const ordered = reverseCoefficients ? coefficients.slice().reverse() : coefficients.slice();
    for (const sign of [1, -1]) {
      for (const alternating of [false, true]) {
        const body = ordered.map((value, index) =>
          mod(sign * value * (alternating && index % 2 === 1 ? -1 : 1))
        );
        const divisor = [1, ...body];
        for (const reverseDividend of [false, true]) {
          const dividend = reverseDividend ? T.slice().reverse() : T;
          const { quotient, remainder } = divideHighFirst(dividend, divisor);
          const matchesForward = quotient.reduce(
            (sum, value, index) => sum + (value === interior[index] ? 1 : 0), 0
          );
          const reversedInterior = interior.slice().reverse();
          const matchesReverse = quotient.reduce(
            (sum, value, index) => sum + (value === reversedInterior[index] ? 1 : 0), 0
          );
          tests.push({
            family,
            reverseCoefficients,
            sign,
            alternating,
            reverseDividend,
            exact: remainder.every((value) => value === 0),
            remainderZeroCount: remainder.filter((value) => value === 0).length,
            remainderLength: remainder.length,
            quotientLength: quotient.length,
            interiorMatchesForward: matchesForward,
            interiorMatchesReverse: matchesReverse,
            quotientHead: quotient.slice(0, 8),
            remainderHead: remainder.slice(0, 8),
            ...meta,
          });
        }
      }
    }
  }
}

testFamily("p55-GP0", p55);
testFamily("p55-prime", p55.map((index) => GP.prime[index]));
testFamily("p55-totient", p55.map((index) => GP.prime[index] - 1));
testFamily("p50-perimeter", perimeter);

assert.equal(tests.length, 64);
const exact = tests.filter((test) => test.exact);
const bestInteriorMatches = Math.max(
  ...tests.map((test) => Math.max(test.interiorMatchesForward, test.interiorMatchesReverse))
);
assert.equal(exact.length, 0);
assert.equal(bestInteriorMatches, 3);

tests.sort((a, b) =>
  Number(b.exact) - Number(a.exact) ||
  Math.max(b.interiorMatchesForward, b.interiorMatchesReverse) -
    Math.max(a.interiorMatchesForward, a.interiorMatchesReverse) ||
  b.remainderZeroCount - a.remainderZeroCount
);

console.log(JSON.stringify({
  interpretation:
    "The source-motivated monic GF(257) factorization of the p50 polynomial by a 76-coefficient p55 or p50-perimeter polynomial is rejected: no exact remainder-zero division, and the best quotient/interior agreement is 3/180.",
  dimensions: {
    field: "GF(257)",
    p50Coefficients: T.length,
    p55Runes: p55.length,
    p50PerimeterCells: perimeter.length,
    p50InteriorCells: interior.length,
    quotientLength: 180,
    remainderLength: 76,
  },
  variants: tests.length,
  exactFactorizations: exact.length,
  bestInteriorMatches,
  bestVariants: tests.slice(0, 12),
}, null, 2));
