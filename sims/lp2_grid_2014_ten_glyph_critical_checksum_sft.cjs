"use strict";

/**
 * Source-locked original LP2 256-byte table ambiguity SFT.
 *
 * Two historical witnesses disagree on exactly ten cells. Exhaustively test
 * every 2014/LP2 token choice for the already-known source-marked GF29
 * polynomial jets at x=24 (oversized AC and p39 red factor) and x=13 (dot
 * separators). This tests a proposed checksum, not a proven LP2 cipher.
 *
 * Node 22: node sims/lp2_grid_2014_ten_glyph_critical_checksum_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} name */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", name), "utf8"));
}

const historical = readJson("resources/cicada2014-sexagesimal-source.json");
const printed = readJson("resources/liber-primus/base60-grid.json");
assert.equal(printed.kind, "base60-byte-table");
assert.equal(printed.alphabet.length, 60);
assert.equal(printed.rows.length, 32);
assert(printed.rows.every((row) => row.length === 8));

const alphabet = printed.alphabet;
const official = printed.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
});
const archive = historical.decimal_values;
assert.equal(official.length, 256);
assert.equal(archive.length, 256);
assert(official.every((v) => Number.isInteger(v) && v >= 0 && v < 256));
assert(archive.every((v) => Number.isInteger(v) && v >= 0 && v < 256));

const disagreements = official.flatMap((v, i) => v !== archive[i] ? [i] : []);
assert.deepEqual(disagreements, [25, 45, 50, 165, 170, 172, 175, 182, 199, 246]);

/**
 * Horner's rule with descending original page order. Return P(x) and the
 * formal derivative P'(x), computed over F_29 from the complete byte list.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {[number,number]}
 */
function polynomialJet(coefficients, x) {
  let value = 0;
  let derivative = 0;
  for (const byte of coefficients) {
    derivative = (derivative * x + value) % 29;
    value = (value * x + byte) % 29;
  }
  return [value, derivative];
}

/**
 * @param {number} mask Which disagreement cells to read from the LP2 scan.
 * @returns {number[]}
 */
function mixture(mask) {
  const bytes = [...archive];
  for (let j = 0; j < disagreements.length; j++) {
    if (mask & (1 << j)) bytes[disagreements[j]] = official[disagreements[j]];
  }
  return bytes;
}

function main() {
  assert.deepEqual(polynomialJet(official, 24), [0, 0]);
  assert.deepEqual(polynomialJet(official, 13), [8, 0]);
  assert.deepEqual(polynomialJet(archive, 24), [23, 26]);
  assert.deepEqual(polynomialJet(archive, 13), [4, 24]);

  /** @type {number[]} */
  const root24 = [];
  /** @type {number[]} */
  const double24 = [];
  /** @type {number[]} */
  const stationary13 = [];
  /** @type {number[]} */
  const fullJet = [];
  for (let mask = 0; mask < (1 << disagreements.length); mask++) {
    const bytes = mixture(mask);
    const [v24, d24] = polynomialJet(bytes, 24);
    const [v13, d13] = polynomialJet(bytes, 13);
    if (v24 === 0) root24.push(mask);
    if (v24 === 0 && d24 === 0) {
      double24.push(mask);
      if (d13 === 0) {
        stationary13.push(mask);
        if (v13 === 8) fullJet.push(mask);
      }
    }
  }
  assert.equal(root24.length, 34);
  assert.deepEqual(double24, [131, 139, 1015, 1023]);
  assert.deepEqual(stationary13, [1015, 1023]);
  assert.deepEqual(fullJet, [1015, 1023]);

  // Glyph 0l = 47 versus 0I = 18: 47−18=29. No GF29 polynomial,
  // derivative, factorization or other F29 constraint can distinguish it.
  assert.equal(disagreements[3], 165);
  assert.equal(archive[165], 47);
  assert.equal(official[165], 18);
  assert.equal((archive[165] - official[165]) % 29, 0);
  assert.deepEqual(
    [...mixture(1015)].map((v) => v % 29),
    official.map((v) => v % 29)
  );
  assert.deepEqual(
    [...mixture(1023)].map((v) => v % 29),
    official.map((v) => v % 29)
  );

  const changed = (mask) => disagreements.filter((_, j) => mask & (1 << j));
  console.log(JSON.stringify({
    manuscriptGlyphDisagreements: disagreements,
    testedTwoWitnessReadings: 1 << disagreements.length,
    witnessJet: {
      historicalArchiveAt24: polynomialJet(archive, 24),
      historicalArchiveAt13: polynomialJet(archive, 13),
      printedLP2At24: polynomialJet(official, 24),
      printedLP2At13: polynomialJet(official, 13)
    },
    p24RootSurvivors: root24.length,
    p24DoubleRootSurvivors: double24.map((mask) => ({
      mask, manuscriptReadings: changed(mask)
    })),
    p13StationaryAndP24DoubleSurvivors: stationary13,
    additionallyP13Value8Survivors: fullJet,
    unavoidableFieldBlindSpot: {
      byteIndex: 165, historical: archive[165], printed: official[165],
      difference: archive[165] - official[165], modulus: 29
    }
  }, null, 2));
  console.log("PASS: source-marked GF29 jets select nine ten-cell readings; byte165 is intrinsically invisible.");
}

main();
