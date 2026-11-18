"use strict";

/**
 * Source-exact gate for the red13 constant-weight rank convention.
 *
 * Tests two independent source facts:
 * 1. The original 2014 LP2 delivery wrapper has <title>133</title>.
 *    The complete 31-of-256 thirteen-dot event state space C(256,31)
 *    requires exactly 133 bits under enumerative/fixed-weight coding.
 * 2. After the independently selected red-only reduction (30 marks among
 *    255 red events), the four canonical order/rank symmetries plus
 *    zero/one-based rank are tested against the frozen route labels.
 *    Only zero-based forward lexicographic rank has all three route-selected
 *    factors 19,31,103 and the exact q35*q79 residual.
 *
 * This is a convention discriminator and source-motivation check. It is not
 * a discovery-adjusted probability claim and does not authenticate Tor-v2.
 *
 * Run from repository root:
 *   node sims/lp2_red13_rank_convention_selector_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const html = read("resources/historical/stage11-2014-index.html");

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let kk = Math.min(k, n - k);
  let out = 1n;
  for (let i = 1; i <= kk; i += 1) {
    out = out * BigInt(n - kk + i) / BigInt(i);
  }
  return out;
}

function bitLength(value) {
  return value.toString(2).length;
}

function lexRank(n, k, positions) {
  let rank = 0n;
  let previous = -1;
  for (let i = 0; i < k; i += 1) {
    for (let candidate = previous + 1; candidate < positions[i]; candidate += 1) {
      rank += choose(n - candidate - 1, k - i - 1);
    }
    previous = positions[i];
  }
  return rank;
}

function colexRank(positions) {
  return positions.reduce((rank, position, i) => rank + choose(position, i + 1), 0n);
}

function reversePositions(n, positions) {
  return positions.map((position) => n - 1 - position).sort((a, b) => a - b);
}

function orderedEvents(includeBlack13) {
  const events = [];
  let serial = 0;
  for (const page of [...ink.pages].sort((a, b) => a.page - b.page)) {
    for (const span of page.red_spans || []) {
      const runes = Array.from(span.runes);
      for (let i = 0; i < runes.length; i += 1) {
        events.push({page: page.page, offset: span.start + i + 0.5, kind: "red", bit: 0, serial: serial++});
      }
    }
    for (const [offset, dots, color] of page.large_punctuation || []) {
      if (dots === 13 && (color === "red" || includeBlack13)) {
        events.push({page: page.page, offset, kind: "dot13", bit: 1, color, serial: serial++});
      }
    }
  }
  events.sort((a, b) => a.page - b.page || a.offset - b.offset ||
    (a.kind === "dot13" ? 0 : 1) - (b.kind === "dot13" ? 0 : 1) || a.serial - b.serial);
  return events;
}

assert.ok(html.includes("<title>133</title>"));
assert.ok(html.includes('<div id="331">'));

const fullEvents = orderedEvents(true);
const fullPositions = fullEvents.map((event, index) => event.bit === 1 ? index : null)
  .filter((index) => index !== null);
assert.equal(fullEvents.length, 256);
assert.equal(fullPositions.length, 31);
assert.equal(bitLength(choose(256, 31) - 1n), 133);

const redEvents = orderedEvents(false);
const redPositions = redEvents.map((event, index) => event.bit === 1 ? index : null)
  .filter((index) => index !== null);
assert.equal(redEvents.length, 255);
assert.equal(redPositions.length, 30);
assert.deepEqual(redPositions, [
  13,14,31,32,36,37,49,50,65,78,79,89,101,102,119,120,140,141,152,153,
  162,163,167,168,228,238,239,245,246,254,
]);

const reversed = reversePositions(255, redPositions);
const ranks = {
  lex_forward: lexRank(255, 30, redPositions),
  lex_reverse: lexRank(255, 30, reversed),
  colex_forward: colexRank(redPositions),
  colex_reverse: colexRank(reversed),
};

const expected = 816613232064430740393939040116034006349n;
const q35 = 25795396177n;
const q79 = 521821166063052627702311n;
const divisor = 19n * 31n * 103n;
assert.equal(ranks.lex_forward, expected);
assert.equal(expected, divisor * q35 * q79);
assert.equal(bitLength(q35), 35);
assert.equal(bitLength(q79), 79);

const variants = [];
for (const [convention, rank] of Object.entries(ranks)) {
  for (const base of [0, 1]) {
    const value = rank + BigInt(base);
    const allSmallFactors = value % 19n === 0n && value % 31n === 0n && value % 103n === 0n;
    const exactResidual = allSmallFactors && value / divisor === q35 * q79;
    variants.push({convention, base, rank: value.toString(), bitLength: bitLength(value), allSmallFactors, exactResidual});
  }
}

const survivors = variants.filter((row) => row.allSmallFactors && row.exactResidual);
assert.deepEqual(survivors.map(({convention, base}) => ({convention, base})), [
  {convention: "lex_forward", base: 0},
]);

console.log(JSON.stringify({
  sourceWrapper: {
    title: 133,
    divId: 331,
    fullEvents: fullEvents.length,
    thirteenDotMarks: fullPositions.length,
    constantWeightStateBits: bitLength(choose(256, 31) - 1n),
  },
  redOnly: {
    events: redEvents.length,
    marks: redPositions.length,
    stateBits: bitLength(choose(255, 30) - 1n),
    variants,
    uniqueConvention: survivors[0],
  },
  factorLabels: {small: [19,31,103], residualBitLengths: [35,79]},
  status: "PASS: 2014 title133 matches the full fixed-weight state width; route labels uniquely select zero-based forward lex rank among canonical rank symmetries",
}, null, 2));
