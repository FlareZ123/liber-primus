"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/**
 * Test whether the historical 2014 56-symbol columnar order is compatible
 * with printed LP2 page-edge rune-word continuations.
 *
 * The 56 physical unknown pages contain 55 rune-bearing pages: physical p50
 * has a numerical grid and is represented here as a blank page boundary.
 * Slash/whitespace are print wrapping; punctuation terminates words.
 */
const source = fs.readFileSync(
  path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8"
);
const sections = source.split("%").slice(0, 55);
const physical = Array.from({ length: 56 }, (_, p) =>
  p === 50 ? "" : sections[p < 50 ? p : p - 1]
);

const runeWords = sections.join("%")
  .replace(/[\/\s%]/gu, "")
  .split(/[^\u16A0-\u16FF]+/u)
  .filter(Boolean);
assert.equal(runeWords.length, 2896);
assert.equal(runeWords.reduce((n, w) => n + w.length, 0), 12956);

/** @param {string} s */
const compact = (s) => s.replace(/[\/\s]/gu, "");
const suffix = physical.map((s) =>
  compact(s).match(/([\u16A0-\u16FF]+)$/u)?.[1].length ?? 0
);
const prefix = physical.map((s) =>
  compact(s).match(/^([\u16A0-\u16FF]+)/u)?.[1].length ?? 0
);

/**
 * @param {number[]} order Physical page sequence.
 * @returns {{joins:number,long12:number,long14:number,max:number,joinedLengths:number[]}}
 */
function evaluate(order) {
  const joinedLengths = [];
  for (let i = 0; i < order.length - 1; i++) {
    const last = suffix[order[i]];
    const first = prefix[order[i + 1]];
    if (last && first) joinedLengths.push(last + first);
  }
  return {
    joins: joinedLengths.length,
    long12: joinedLengths.filter((x) => x >= 12).length,
    long14: joinedLengths.filter((x) => x >= 14).length,
    max: Math.max(...joinedLengths),
    joinedLengths
  };
}

const original = Array.from({ length: 56 }, (_, i) => i);
const oldColumnarSeven = [0, 6, 2, 5, 1, 4, 3];
const historical = original.map((i) =>
  7 * Math.floor(i / 7) + oldColumnarSeven[i % 7]
);
const inverse = Array(56);
historical.forEach((p, i) => { inverse[p] = i; });

const baseline = evaluate(original);
const historicalResult = evaluate(historical);
const inverseResult = evaluate(inverse);
assert.deepEqual(
  [baseline.joins, baseline.long12, baseline.max],
  [32, 0, 11]
);
assert.deepEqual(
  [historicalResult.joins, historicalResult.long12, historicalResult.max],
  [31, 2, 13]
);
assert.deepEqual(
  [inverseResult.joins, inverseResult.long12, inverseResult.max],
  [32, 3, 16]
);

/** Deterministic unsigned xorshift32 PRNG, used only for null permutations. */
let rngState = 0x357a0ef9;
function random() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}

const draws = 100000;
const histogram = {};
for (let k = 0; k < draws; k++) {
  const order = original.slice();
  // Constrained null: preserve each consecutive seven-page group.
  for (let base = 0; base < 56; base += 7) {
    for (let i = base + 6; i > base; i--) {
      const j = base + Math.floor(random() * (i - base + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  const n = evaluate(order).long12;
  histogram[n] = (histogram[n] ?? 0) + 1;
}
assert.equal(histogram[0], 2053);
const output = {
  corpus: { runePages: 55, physicalPages: 56, runes: 12956, words: 2896 },
  baseline, historicalResult, inverseResult,
  groupedNull: {
    draws, seed: "0x357a0ef9",
    zeroLong12: histogram[0],
    fractionZeroLong12: histogram[0] / draws,
    fractionAtMostHistorical: (histogram[0] + histogram[1] + histogram[2]) / draws,
    histogram
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
