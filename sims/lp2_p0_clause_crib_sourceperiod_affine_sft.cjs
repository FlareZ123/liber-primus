"use strict";

/**
 * Dual physically anchored p0 crib gate for fixed-period affine GP29 schedules.
 *
 * Training plaintext:
 *   p0 runes 0..12: EPIPHANY SEEKS
 *
 * Held-out plaintext:
 *   p0 runes 235..243: THE DEVOTED
 *
 * Family:
 *   C_i = a * P_i + K[i mod d] (mod 29), a in 1..28.
 *
 * Only key residues touched by the opening title are learned. A period remains
 * compatible with the later phrase exactly when every held-out position whose
 * residue was already learned is predicted correctly; untouched residues are
 * allowed to remain free.
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
 * @returns {{key: Map<number, number>} | null}
 */
function fitTitle(period, slope) {
  const key = new Map();
  for (let i = 0; i < titlePlain.length; i += 1) {
    const residue = i % period;
    const value = mod29(titleCipher[i] - slope * titlePlain[i]);
    if (key.has(residue) && key.get(residue) !== value) return null;
    key.set(residue, value);
  }
  return { key };
}

/**
 * @param {number} period
 * @returns {{
 *   period:number,
 *   trainingSurvivors:number,
 *   comparable:number,
 *   bestMatches:number,
 *   compatibleSlopes:number[]
 * }}
 */
function testPeriod(period) {
  const rows = [];
  for (let slope = 1; slope <= 28; slope += 1) {
    const fitted = fitTitle(period, slope);
    if (!fitted) continue;

    let comparable = 0;
    let matches = 0;
    for (let i = 0; i < holdoutPlain.length; i += 1) {
      const residue = (holdoutStart + i) % period;
      if (!fitted.key.has(residue)) continue;
      comparable += 1;
      const predicted = mod29(slope * holdoutPlain[i] + fitted.key.get(residue));
      if (predicted === holdoutCipher[i]) matches += 1;
    }
    rows.push({ slope, comparable, matches });
  }

  const comparable = rows.length ? rows[0].comparable : 0;
  assert.ok(rows.every((row) => row.comparable === comparable));
  const bestMatches = rows.reduce((best, row) => Math.max(best, row.matches), 0);
  const compatibleSlopes = rows
    .filter((row) => row.matches === row.comparable)
    .map((row) => row.slope);

  return {
    period,
    trainingSurvivors: rows.length,
    comparable,
    bestMatches,
    compatibleSlopes,
  };
}

assert.equal(p0.length, 262);

const titlePlain = gp("EPIPHANY SEEKS");
const titleCipher = p0.slice(0, 13);
const holdoutStart = 235;
const holdoutPlain = gp("THE DEVOTED");
const holdoutCipher = p0.slice(holdoutStart, holdoutStart + holdoutPlain.length);

assert.equal(titlePlain.length, 13);
assert.equal(holdoutPlain.length, 9);
assert.deepEqual(titleCipher, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(holdoutCipher, [8, 5, 15, 22, 16, 22, 21, 1, 4]);

const periods = [13, 27, 29, 32, 43, 58, 60, 76, 229];
const rows = periods.map(testPeriod);
const byPeriod = new Map(rows.map((row) => [row.period, row]));

assert.deepEqual(byPeriod.get(13), {
  period: 13,
  trainingSurvivors: 28,
  comparable: 9,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(27), {
  period: 27,
  trainingSurvivors: 28,
  comparable: 1,
  bestMatches: 1,
  compatibleSlopes: [21],
});

assert.deepEqual(byPeriod.get(29), {
  period: 29,
  trainingSurvivors: 28,
  comparable: 9,
  bestMatches: 2,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(32), {
  period: 32,
  trainingSurvivors: 28,
  comparable: 2,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(43), {
  period: 43,
  trainingSurvivors: 28,
  comparable: 0,
  bestMatches: 0,
  compatibleSlopes: Array.from({ length: 28 }, (_, index) => index + 1),
});

assert.deepEqual(byPeriod.get(58), {
  period: 58,
  trainingSurvivors: 28,
  comparable: 9,
  bestMatches: 2,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(60), {
  period: 60,
  trainingSurvivors: 28,
  comparable: 4,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(76), {
  period: 76,
  trainingSurvivors: 28,
  comparable: 6,
  bestMatches: 1,
  compatibleSlopes: [],
});

assert.deepEqual(byPeriod.get(229), {
  period: 229,
  trainingSurvivors: 28,
  comparable: 7,
  bestMatches: 1,
  compatibleSlopes: [],
});

console.log(JSON.stringify({
  status:
    "PASS: physically anchored p0 crib islands reject most source-period affine schedules; d=27 remains underdetermined at slope21 and d=43 has no residue overlap",
  model: "C_i = a*P_i + K[i mod d] (mod 29), a=1..28",
  training: {
    offsets: [0, 12],
    plaintext: "EPIPHANY SEEKS",
  },
  holdout: {
    offsets: [235, 243],
    plaintext: "THE DEVOTED",
  },
  rows,
}, null, 2));
