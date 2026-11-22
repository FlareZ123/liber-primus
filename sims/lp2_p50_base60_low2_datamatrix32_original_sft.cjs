"use strict";

/**
 * SFT: source-shaped ECC200 32x32 finder test for original LP2 p49-p51 tokens.
 * Each of the 32x8 printed base60 two-character cells contributes four bits:
 * the low two bits of each digit, read left to right. Both digit orders,
 * bit orders, dihedral orientations, foreground polarity and timing phases
 * are allowed. A true ECC200 32x32 symbol must have an exact outer finder.
 *
 * Run with Node.js 22 on Windows 11:
 *   node sims/lp2_p50_base60_low2_datamatrix32_original_sft.cjs
 *
 * This tests only the fully specified four-bit source representation.
 * It does not claim to exclude other payload or stego interpretations.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "resources", "liber-primus", "base60-grid.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const alphabet = source.alphabet;
assert.equal(alphabet.length, 60);
assert.equal(source.rows.length, 32);
const digits = source.rows.map((row, r) => {
  assert.equal(row.length, 8, `source row ${r}`);
  return row.map((token, c) => {
    assert.equal(token.length, 2, `token ${r},${c}`);
    const pair = [...token].map(char => alphabet.indexOf(char));
    assert.ok(pair.every(x => x >= 0), `base60 token ${r},${c}`);
    return pair;
  });
});

/** @param {number} x @param {boolean} reversed @returns {number[]} */
function lowBits(x, reversed) {
  const bits = [(x >> 1) & 1, x & 1];
  return reversed ? bits.reverse() : bits;
}

/** @returns {number[][]} */
function expanded(swapDigits, reverseFirst, reverseSecond) {
  return digits.map(row => row.flatMap(pair => {
    const [first, second] = swapDigits ? [pair[1], pair[0]] : pair;
    return [...lowBits(first, reverseFirst), ...lowBits(second, reverseSecond)];
  }));
}

/** @param {number[][]} matrix @returns {number[][]} */
function rotateClockwise(matrix) {
  return matrix[0].map((_, x) => matrix.map(row => row[x]).reverse());
}

/**
 * Mandatory outer ECC200 L-border: solid left/bottom, alternating top/right.
 * Corner priority gives 63 solid + 61 alternating independent sites.
 * @param {number[][]} matrix
 * @param {boolean} inverted
 * @param {number} phase
 * @returns {number}
 */
function borderErrors(matrix, inverted, phase) {
  let errors = 0;
  for (let y = 0; y < 32; y++) {
    assert.equal(matrix[y].length, 32);
    for (let x = 0; x < 32; x++) {
      let expected;
      if (x === 0 || y === 31) expected = 1;
      else if (y === 0) expected = (x + phase) % 2;
      else if (x === 31) expected = (y + phase) % 2;
      else continue;
      if ((matrix[y][x] ^ Number(inverted)) !== expected) errors++;
    }
  }
  return errors;
}

function main() {
  const fixture = Array.from({length: 32}, () => Array(32).fill(0));
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (x === 0 || y === 31) fixture[y][x] = 1;
      else if (y === 0) fixture[y][x] = x % 2;
      else if (x === 31) fixture[y][x] = y % 2;
    }
  }
  assert.equal(borderErrors(fixture, false, 0), 0);
  let tests = 0, best = null, perfect = 0;
  for (const swapDigits of [false, true])
    for (const reverseFirst of [false, true])
      for (const reverseSecond of [false, true]) {
        const base = expanded(swapDigits, reverseFirst, reverseSecond);
        for (const reflected of [false, true]) {
          const m = reflected ? base.map(row => row.slice().reverse()) : base;
          let oriented = m;
          for (let rotations = 0; rotations < 4; rotations++) {
            if (rotations > 0) oriented = rotateClockwise(oriented);
            for (const inverted of [false, true])
              for (const phase of [0, 1]) {
                const errors = borderErrors(oriented, inverted, phase);
                tests++;
                if (errors === 0) perfect++;
                if (!best || errors < best.errors) {
                  best = {errors, swapDigits, reverseFirst, reverseSecond,
                    reflected, rotations, inverted, phase};
                }
              }
          }
        }
      }
  assert.equal(tests, 256);
  assert.equal(perfect, 0);
  assert.equal(best.errors, 46);
  console.log(JSON.stringify({
    source: "physical p49-p51, 32x8, base60 token digit low-two-bit pairs",
    proposedSymbol: "32x32 Data Matrix ECC200",
    borderChecks: 124, totalOriginalOrientations: tests,
    sourceNegativePerfect: perfect, bestSourceBorder: best,
    positiveOuterFinder: "0/124 errors",
    decision: "This exact natural four-bit token projection cannot be ECC200.",
    caveat: "No byte/GP plaintext or creator-approved transformation recovered."
  }, null, 2));
}
if (require.main === module) main();
module.exports = {lowBits, expanded, borderErrors, rotateClockwise};
