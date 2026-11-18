"use strict";

/**
 * Three physically anchored p0 crib islands versus fixed-period affine GP29.
 *
 * Candidate plaintext placements, all from source-internal pointer work:
 *   p0 0..12   EPIPHANY SEEKS
 *   p0 103..108 THE ROAD
 *   p0 235..243 THE DEVOTED
 *
 * Family:
 *   C_i = a * P_i + K[i mod d] (mod 29), a in 1..28.
 *
 * The title and THE ROAD fit the periodic key. THE DEVOTED is then checked
 * only through key residues already fixed by those two islands. A family is
 * rejected when every training-compatible slope mismatches at least one
 * forced held-out rune.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const p0 = corpus.pages.find((page) => page.page === 0).indices;
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} text @returns {number[]} */
function gp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {number} period
 * @returns {{
 *   period:number,
 *   trainingSurvivors:number,
 *   survivingSlopes:number[],
 *   comparable:number,
 *   bestMatches:number,
 *   compatibleSlopes:number[]
 * }}
 */
function testPeriod(period) {
  const survivors = [];

  for (let slope = 1; slope <= 28; slope += 1) {
    const key = new Map();
    let valid = true;

    for (const island of trainingIslands) {
      for (let i = 0; i < island.plain.length; i += 1) {
        const residue = (island.start + i) % period;
        const value = mod29(island.cipher[i] - slope * island.plain[i]);
        if (key.has(residue) && key.get(residue) !== value) {
          valid = false;
          break;
        }
        key.set(residue, value);
      }
      if (!valid) break;
    }
    if (!valid) continue;

    let comparable = 0;
    let matches = 0;
    for (let i = 0; i < holdout.plain.length; i += 1) {
      const residue = (holdout.start + i) % period;
      if (!key.has(residue)) continue;
      comparable += 1;
      const predicted = mod29(slope * holdout.plain[i] + key.get(residue));
      if (predicted === holdout.cipher[i]) matches += 1;
    }

    survivors.push({ slope, comparable, matches });
  }

  const comparableValues = [...new Set(survivors.map((row) => row.comparable))];
  const comparable = comparableValues.length === 1 ? comparableValues[0] : 0;
  const bestMatches = survivors.reduce(
    (best, row) => Math.max(best, row.matches),
    0
  );
  const compatibleSlopes = survivors
    .filter((row) => row.matches === row.comparable)
    .map((row) => row.slope);

  return {
    period,
    trainingSurvivors: survivors.length,
    survivingSlopes: survivors.map((row) => row.slope),
    comparable,
    bestMatches,
    compatibleSlopes,
  };
}

assert.equal(p0.length, 262);

const trainingIslands = [
  {
    name: "EPIPHANY SEEKS",
    start: 0,
    plain: gp("EPIPHANY SEEKS"),
    cipher: p0.slice(0, 13),
  },
  {
    name: "THE ROAD",
    start: 103,
    plain: gp("THE ROAD"),
    cipher: p0.slice(103, 109),
  },
];
const holdout = {
  name: "THE DEVOTED",
  start: 235,
  plain: gp("THE DEVOTED"),
  cipher: p0.slice(235, 244),
};

assert.equal(trainingIslands[0].plain.length, 13);
assert.equal(trainingIslands[1].plain.length, 6);
assert.equal(holdout.plain.length, 9);
assert.deepEqual(trainingIslands[0].cipher,
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(trainingIslands[1].cipher, [8, 12, 16, 8, 25, 27]);
assert.deepEqual(holdout.cipher, [8, 5, 15, 22, 16, 22, 21, 1, 4]);

const periods = [13, 27, 29, 32, 43, 58, 60, 76, 229];
const rows = periods.map(testPeriod);
const byPeriod = new Map(rows.map((row) => [row.period, row]));

assert.deepEqual(byPeriod.get(13), {
  period: 13,
  trainingSurvivors: 0,
  survivingSlopes: [],
  comparable: 0,
  bestMatches: 0,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(27), {
  period: 27,
  trainingSurvivors: 1,
  survivingSlopes: [14],
  comparable: 6,
  bestMatches: 0,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(29), {
  period: 29,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 9,
  bestMatches: 2,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(32), {
  period: 32,
  trainingSurvivors: 0,
  survivingSlopes: [],
  comparable: 0,
  bestMatches: 0,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(43), {
  period: 43,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 3,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(58), {
  period: 58,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 9,
  bestMatches: 2,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(60), {
  period: 60,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 4,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(76), {
  period: 76,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 6,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(229), {
  period: 229,
  trainingSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  comparable: 7,
  bestMatches: 1,
  compatibleSlopes: [],
});

for (const row of rows) assert.equal(row.compatibleSlopes.length, 0);

console.log(JSON.stringify({
  status:
    "PASS: all declared source-period stationary affine GP29 schedules are incompatible with the three physically anchored p0 candidate plaintext islands",
  model: "C_i = a*P_i + K[i mod d] (mod 29), a=1..28",
  training: trainingIslands.map((island) => ({
    name: island.name,
    offsets: [island.start, island.start + island.plain.length - 1],
  })),
  holdout: {
    name: holdout.name,
    offsets: [holdout.start, holdout.start + holdout.plain.length - 1],
  },
  rows,
}, null, 2));
