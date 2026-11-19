"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  for (let e = exponent; e > 0; e >>= 1) {
    if (e & 1) result = mod29(result * value);
    value = mod29(value * value);
  }
  return result;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let out = 1;
  for (let i = 1; i <= k; i += 1) out = out * (n - k + i) / i;
  return out;
}

/**
 * Evaluate a polynomial whose coefficients are high-degree first.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {number}
 */
function evalHigh(coefficients, x) {
  let value = 0;
  for (const coefficient of coefficients) value = mod29(value * x + coefficient);
  return value;
}

/**
 * Evaluate its ordinary first derivative.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {number}
 */
function derivativeHigh(coefficients, x) {
  let value = 0;
  const degree = coefficients.length - 1;
  for (let i = 0; i < degree; i += 1) {
    value = mod29(value * x + coefficients[i] * (degree - i));
  }
  return value;
}

/**
 * Coefficient of X^order in P(root + X), for high-first P.
 * @param {number[]} coefficients
 * @param {number} at
 * @param {number} order
 * @returns {number}
 */
function taylorCoefficientHigh(coefficients, at, order) {
  const degree = coefficients.length - 1;
  let total = 0;
  for (let i = 0; i < coefficients.length; i += 1) {
    const exponent = degree - i;
    if (exponent < order) continue;
    total = mod29(
      total +
      coefficients[i] *
      choose(exponent, order) *
      pow29(at, exponent - order)
    );
  }
  return total;
}

/** @param {number[]} coefficients @returns {number[]} */
function doubleRootsHigh(coefficients) {
  const roots = [];
  for (let candidate = 0; candidate < 29; candidate += 1) {
    if (evalHigh(coefficients, candidate) === 0 && derivativeHigh(coefficients, candidate) === 0) {
      roots.push(candidate);
    }
  }
  return roots;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

// Literal p39 red triad in printed order.
const p39Ink = ink.pages.find((page) => page.page === 39);
assert.ok(p39Ink);
assert.equal(p39Ink.red_spans.length, 1);
assert.equal(p39Ink.red_spans[0].length, 3);
const printedTriad = [...p39Ink.red_spans[0].runes].map((rune) => {
  const value = runeIndex.get(rune);
  assert.notEqual(value, undefined);
  return value;
});
assert.deepEqual(printedTriad, [27, 5, 15]);

// "Rising powers" reads the printed triad as c0,c1,c2, so high-first storage is reversed.
const risingPowerHigh = [...printedTriad].reverse(); // 15 X^2 + 5 X + 27
const fallingPowerHigh = [...printedTriad];          // 27 X^2 + 5 X + 15
assert.deepEqual(doubleRootsHigh(risingPowerHigh), [24]);
assert.deepEqual(doubleRootsHigh(fallingPowerHigh), [23]);

// Recompute the selected p29/p50 common-double-root orientation pair.
const p29 = corpus.pages.find((page) => page.page === 29).indices;
const p50 = grid.byte_rows.flat().map(mod29);
assert.equal(p29.length, 277);
assert.equal(p50.length, 256);

const p29High = [...p29];
const p29Low = [...p29].reverse();
const p50High = [...p50];
const p50Low = [...p50].reverse();

const commonEvents = [];
for (const [pageOrientation, pageCoefficients] of [["high", p29High], ["low", p29Low]]) {
  for (const [tableOrientation, tableCoefficients] of [["high", p50High], ["low", p50Low]]) {
    for (let candidate = 0; candidate < 29; candidate += 1) {
      if (
        evalHigh(pageCoefficients, candidate) !== 0 ||
        derivativeHigh(pageCoefficients, candidate) !== 0 ||
        evalHigh(tableCoefficients, candidate) !== 0 ||
        derivativeHigh(tableCoefficients, candidate) !== 0
      ) continue;
      const qP = taylorCoefficientHigh(pageCoefficients, candidate, 2);
      const qT = taylorCoefficientHigh(tableCoefficients, candidate, 2);
      const dP = taylorCoefficientHigh(pageCoefficients, candidate, 3);
      const dT = taylorCoefficientHigh(tableCoefficients, candidate, 3);
      const delta = mod29(qP - qT);
      const packet = [candidate, candidate + delta, qT, qP];
      commonEvents.push({
        pageOrientation,
        tableOrientation,
        root: candidate,
        qP,
        qT,
        dP,
        dT,
        packet,
        consecutive:
          packet[1] === packet[0] + 1 &&
          packet[2] === packet[1] + 1 &&
          packet[3] === packet[2] + 1,
      });
    }
  }
}
assert.deepEqual(commonEvents, [
  {
    pageOrientation: "high",
    tableOrientation: "high",
    root: 24,
    qP: 27,
    qT: 26,
    dP: 6,
    dT: 6,
    packet: [24, 25, 26, 27],
    consecutive: true,
  },
  {
    pageOrientation: "low",
    tableOrientation: "low",
    root: 23,
    qP: 10,
    qT: 15,
    dP: 13,
    dT: 16,
    packet: [23, 47, 15, 10],
    consecutive: false,
  },
]);

const selected = commonEvents.find((event) => event.consecutive);
assert.ok(selected);
assert.equal(selected.root, doubleRootsHigh(risingPowerHigh)[0]);

console.log(JSON.stringify({
  status: "PASS",
  p39: {
    printedTriad,
    risingPowers: {
      polynomialHighFirst: risingPowerHigh,
      expression: "27 + 5X + 15X^2",
      doubleRoot: 24,
    },
    oppositePowers: {
      polynomialHighFirst: fallingPowerHigh,
      expression: "27X^2 + 5X + 15",
      doubleRoot: 23,
    },
  },
  p29p50: {
    commonDoubleRootEvents: commonEvents,
    uniqueConsecutivePacketEvent: selected,
  },
  interpretation: "If p33 THEIR RISE is consumed as an authored coefficient-direction selector, the p39 printed numbers take rising powers left-to-right and select root24. That is exactly the p29/p50 high-first event whose Taylor packet is the consecutive signed-index run 24..27. The root23/reverse branch loses the independently required consecutivity.",
}, null, 2));
