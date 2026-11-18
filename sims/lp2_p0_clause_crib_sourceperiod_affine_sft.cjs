"use strict";

/**
 * Source-crib fixed-period affine gate for LP2 p0.
 *
 * Training plaintext:
 *   - p0 runes 0..12:  EPIPHANY SEEKS
 *   - p0 runes 13..29: AS I GO THE WEATHER TURNS
 *
 * Held-out plaintext:
 *   - p0 runes 235..243: THE DEVOTED
 *
 * Family:
 *   C_i = a * P_i + K[i mod d] (mod 29), a in 1..28.
 *
 * The key residues are learned only from the training positions. The later
 * nine-rune phrase is never used to choose a, d, or any learned key residue.
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
 * @param {number} slope
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {number} start
 * @returns {Map<number, number> | null}
 */
function fit(period, slope, plain, cipher, start) {
  const key = new Map();
  for (let i = 0; i < plain.length; i += 1) {
    const residue = (start + i) % period;
    const value = mod29(cipher[i] - slope * plain[i]);
    if (key.has(residue) && key.get(residue) !== value) return null;
    key.set(residue, value);
  }
  return key;
}

/**
 * @param {number} period
 * @returns {{
 *   period:number,
 *   trainSurvivors:number,
 *   survivingSlopes:number[],
 *   maxComparable:number,
 *   bestMatches:number,
 *   fullyPredictive:number,
 *   exactFullMatches:number
 * }}
 */
function testPeriod(period) {
  const survivors = [];
  for (let slope = 1; slope <= 28; slope += 1) {
    const key = fit(period, slope, trainPlain, trainCipher, 0);
    if (!key) continue;

    let comparable = 0;
    let matches = 0;
    for (let i = 0; i < holdoutPlain.length; i += 1) {
      const residue = (holdoutStart + i) % period;
      if (!key.has(residue)) continue;
      comparable += 1;
      const predicted = mod29(slope * holdoutPlain[i] + key.get(residue));
      if (predicted === holdoutCipher[i]) matches += 1;
    }
    survivors.push({ slope, comparable, matches });
  }

  const maxComparable = survivors.reduce(
    (best, item) => Math.max(best, item.comparable),
    0
  );
  const bestMatches = survivors
    .filter((item) => item.comparable === maxComparable)
    .reduce((best, item) => Math.max(best, item.matches), 0);
  const fullyPredictive = survivors.filter(
    (item) => item.comparable === holdoutPlain.length
  ).length;
  const exactFullMatches = survivors.filter(
    (item) =>
      item.comparable === holdoutPlain.length &&
      item.matches === holdoutPlain.length
  ).length;

  return {
    period,
    trainSurvivors: survivors.length,
    survivingSlopes: survivors.map((item) => item.slope),
    maxComparable,
    bestMatches,
    fullyPredictive,
    exactFullMatches,
  };
}

assert.equal(p0.length, 262);

const titlePlain = gp("EPIPHANY SEEKS");
const openingPlain = gp("AS I GO THE WEATHER TURNS");
const holdoutPlain = gp("THE DEVOTED");

assert.equal(titlePlain.length, 13);
assert.equal(openingPlain.length, 17);
assert.equal(holdoutPlain.length, 9);

const trainPlain = titlePlain.concat(openingPlain);
const trainCipher = p0.slice(0, trainPlain.length);
const holdoutStart = 235;
const holdoutCipher = p0.slice(holdoutStart, holdoutStart + holdoutPlain.length);

assert.equal(trainPlain.length, 30);
assert.deepEqual(holdoutCipher, [8, 5, 15, 22, 16, 22, 21, 1, 4]);

const sourcePeriods = [13, 27, 29, 32, 43, 58, 60, 76, 229];
const rows = sourcePeriods.map(testPeriod);
const byPeriod = new Map(rows.map((row) => [row.period, row]));

assert.equal(byPeriod.get(13).trainSurvivors, 0);
assert.equal(byPeriod.get(27).trainSurvivors, 0);

assert.deepEqual(byPeriod.get(29), {
  period: 29,
  trainSurvivors: 1,
  survivingSlopes: [17],
  maxComparable: 9,
  bestMatches: 1,
  fullyPredictive: 1,
  exactFullMatches: 0,
});

for (const [period, best] of [
  [32, 2],
  [43, 1],
  [58, 2],
  [76, 2],
  [229, 1],
]) {
  const row = byPeriod.get(period);
  assert.equal(row.trainSurvivors, 28);
  assert.equal(row.maxComparable, 9);
  assert.equal(row.fullyPredictive, 28);
  assert.equal(row.bestMatches, best);
  assert.equal(row.exactFullMatches, 0);
}

assert.deepEqual(byPeriod.get(60), {
  period: 60,
  trainSurvivors: 28,
  survivingSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
  maxComparable: 4,
  bestMatches: 1,
  fullyPredictive: 0,
  exactFullMatches: 0,
});

console.log(JSON.stringify({
  status:
    "PASS: fixed-period affine GP29 schedules selected by the current p0 route fail the independent THE DEVOTED holdout",
  model: "C_i = a*P_i + K[i mod d] (mod 29), a=1..28",
  training: {
    offsets: [0, 29],
    plaintext: "EPIPHANY SEEKS AS I GO THE WEATHER TURNS",
    runes: trainPlain.length,
  },
  holdout: {
    offsets: [235, 243],
    plaintext: "THE DEVOTED",
    runes: holdoutPlain.length,
  },
  rows,
}, null, 2));
