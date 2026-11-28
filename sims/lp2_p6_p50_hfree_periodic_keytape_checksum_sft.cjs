"use strict";

const assert = require("node:assert/strict");
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

const packet = [2, 26, 5, 6]; // [K,-e,g,a]
const blocks = [
  { name: "q1", arities: [3, 4, 2, 5], sigmas: [4, 0, 0, 25] },
  { name: "q3", arities: [4, 6, 5, 4], sigmas: [7, 0, 28, 0] },
];

/**
 * @param {number} n
 * @param {number} start
 * @param {boolean} reverse
 * @param {1|-1} sign
 * @returns {number}
 */
function tapeSum(n, start, reverse, sign) {
  const p = reverse ? packet.slice().reverse() : packet.slice();
  return mod(Array.from({ length: n }, (_, j) => sign * p[(start + j) % 4])
    .reduce((a, b) => a + b, 0));
}

const rows = [];
for (const reverse of [false, true]) {
  for (const sign of [1, -1]) {
    for (const reset of ["page", "block"]) {
      for (let phase = 0; phase < 4; phase += 1) {
        const predicted = [];
        const required = [];
        for (const block of blocks) {
          let cursor = phase;
          for (let i = 0; i < block.arities.length; i += 1) {
            const n = block.arities[i];
            predicted.push(tapeSum(n, cursor, reverse, sign));
            required.push(block.sigmas[i]);
            if (reset === "block") cursor = (cursor + n) % 4;
          }
        }
        const matches = predicted.filter((v, i) => v === required[i]).length;
        rows.push({ reverse, sign, reset, phase, predicted, required, matches });
      }
    }
  }
}

assert.equal(rows.length, 32);
const best = Math.max(...rows.map((r) => r.matches));
assert.equal(best, 1);
const bestRows = rows.filter((r) => r.matches === best);
assert.equal(bestRows.length, 4);

console.log(JSON.stringify({
  status: "PASS",
  packet,
  family: "4 phases × 2 traversal directions × 2 global signs × page-reset/block-continuous",
  variants: rows.length,
  bestPageChecksumMatches: best,
  totalPageChecksums: 8,
  bestRows,
  conclusion: "No natural periodic use of the H-free p6/p50 four-state packet survives the target-rune-blind q-page checksum gate. Retire this direct cyclic-key-tape consumer without plaintext grading.",
}, null, 2));
