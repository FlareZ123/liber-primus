"use strict";

// Reproduce the combinatorial capacity bounds for the LP2 adjacent-repeat
// event-position channel. This is not a decoder and does not search codebooks.
// Run from the repository root:
//   node sims/lp2_repeat_gap_channel_identifiability_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const printedPages = transcript.split("%");
const runeSet = new Set(corpus.runes);

const pageStrata = [];
const lineStrata = [];
const eventSites = [];
let globalOffset = 0;

for (let p = 0; p < 56; p++) {
  const original = corpus.pages[p].indices.map(i => corpus.runes[i]);
  const printed = p === 50 ? "" : printedPages[p < 50 ? p : p - 1];
  let prior = null;
  let local = -1;
  let line = 0;
  let previousRuneLine = 0;
  const page = { page: p, n: 0, k: 0 };
  const lines = new Map();

  for (let cursor = 0; cursor < printed.length; cursor++) {
    const symbol = printed[cursor];
    if (symbol === "/") {
      line++;
      continue;
    }
    if (symbol === "\n" && cursor > 0 && printed[cursor - 1] !== "/" && printed[cursor - 1] !== "\r") {
      line++;
      continue;
    }
    if (!runeSet.has(symbol)) continue;

    local++;
    if (prior !== null) {
      page.n++;
      const key = p + ":" + previousRuneLine;
      if (!lines.has(key)) lines.set(key, { page: p, line: previousRuneLine, n: 0, k: 0 });
      const stratum = lines.get(key);
      stratum.n++;
      if (prior === symbol) {
        page.k++;
        stratum.k++;
        eventSites.push(globalOffset + local - 1);
      }
    }
    prior = symbol;
    previousRuneLine = line;
  }

  if (page.n > 0) pageStrata.push(page);
  lineStrata.push(...lines.values());
  globalOffset += original.length;
}

assert.equal(globalOffset, 12956);
assert.equal(pageStrata.length, 55);
assert.equal(pageStrata.reduce((s, x) => s + x.n, 0), 12901);
assert.equal(pageStrata.reduce((s, x) => s + x.k, 0), 86);
assert.equal(lineStrata.length, 594);
assert.equal(lineStrata.reduce((s, x) => s + x.k, 0), 86);
assert.equal(eventSites.length, 86);

const gaps = eventSites.slice(1).map((x, i) => eventSites[i + 1] - x);
assert.equal(gaps.length, 85);
assert.equal(Math.min(...gaps), 6);

function pearsonLagOne(values) {
  const x = values.slice(0, -1);
  const y = values.slice(1);
  const mx = x.reduce((s, v) => s + v, 0) / x.length;
  const my = y.reduce((s, v) => s + v, 0) / y.length;
  let covariance = 0, vx = 0, vy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    covariance += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  return covariance / Math.sqrt(vx * vy);
}
const t7 = pearsonLagOne(gaps);
assert.ok(Math.abs(t7 - 0.38001968924100965) < 1e-12);

// Count placements with exact event quotas in ordered strata and a global
// minimum separation of six event-site coordinates. A page boundary has no
// within-page adjacency opportunity, so its missing coordinate is inserted
// as one forced empty slot. The distance state is 1..6, with 6 meaning
// "at least six positions since the previous event".
function countPlacements(segments) {
  let dp = Array(7).fill(0n);
  dp[6] = 1n;

  for (const segment of segments) {
    let current = Array.from({ length: segment.k + 1 }, () => Array(7).fill(0n));
    current[0] = dp.slice();

    for (let position = 0; position < segment.n; position++) {
      const next = Array.from({ length: segment.k + 1 }, () => Array(7).fill(0n));
      for (let used = 0; used <= segment.k; used++) {
        for (let distance = 1; distance <= 6; distance++) {
          const ways = current[used][distance];
          if (ways === 0n) continue;
          next[used][Math.min(6, distance + 1)] += ways;
          if (distance === 6 && used < segment.k) next[used + 1][1] += ways;
        }
      }
      current = next;
    }
    dp = current[segment.k];
  }

  return dp.reduce((sum, value) => sum + value, 0n);
}

function addPageBoundarySlots(segments) {
  const result = [];
  for (let i = 0; i < segments.length; i++) {
    result.push(segments[i]);
    if (i + 1 < segments.length && segments[i].page !== segments[i + 1].page) {
      result.push({ page: segments[i].page, n: 1, k: 0, boundary: true });
    }
  }
  return result;
}

function log2BigInt(value) {
  const bits = value.toString(2).length;
  const shift = Math.max(0, bits - 53);
  return Math.log2(Number(value >> BigInt(shift))) + shift;
}

const pageSegments = addPageBoundarySlots(pageStrata);
const lineSegments = addPageBoundarySlots(lineStrata);
assert.equal(pageSegments.filter(x => x.boundary).length, 54);
assert.equal(lineSegments.filter(x => x.boundary).length, 54);

const pageCount = countPlacements(pageSegments);
const lineCount = countPlacements(lineSegments);
const pageBits = log2BigInt(pageCount);
const lineBits = log2BigInt(lineCount);

const eventPages = pageStrata.filter(x => x.k > 0).length;
const eventLines = lineStrata.filter(x => x.k > 0);
const lineDistribution = lineStrata.reduce((counts, x) => {
  counts[x.k] = (counts[x.k] || 0) + 1;
  return counts;
}, {});
const pageInternalGaps = pageStrata.reduce((s, x) => s + Math.max(0, x.k - 1), 0);
const lineInternalGaps = lineStrata.reduce((s, x) => s + Math.max(0, x.k - 1), 0);
const pageFramedIntervals = pageStrata.reduce((s, x) => s + x.k + 1, 0);

assert.equal(eventPages, 42);
assert.equal(pageStrata.length - eventPages, 13);
assert.equal(pageInternalGaps, 44);
assert.equal(pageFramedIntervals, 141);
assert.equal(eventLines.length, 83);
assert.deepEqual(lineDistribution, { 0: 511, 1: 80, 2: 3 });
assert.equal(lineInternalGaps, 3);
assert.equal(gaps.length - lineInternalGaps, 82);
assert.ok(Math.abs(pageBits - 616.330477586409) < 1e-9);
assert.ok(Math.abs(lineBits - 379.44171775405516) < 1e-9);

console.log(JSON.stringify({
  source: "resources/liber-primus/lp2-corpus.json + lp2-transcription.txt",
  runes: globalOffset,
  withinPageAdjacencySlots: 12901,
  repeatEvents: eventSites.length,
  consecutiveEventGaps: gaps.length,
  minimumEventSiteSeparation: Math.min(...gaps),
  t7PearsonLagOne: t7,
  runeBearingPages: pageStrata.length,
  eventBearingPages: eventPages,
  zeroEventPages: pageStrata.length - eventPages,
  withinPageInterEventGaps: pageInternalGaps,
  leadingAndTrailingCensoredIntervals: 2 * eventPages,
  zeroEventPageSpans: pageStrata.length - eventPages,
  pageFramedIntervals: pageFramedIntervals,
  printedLineStrata: lineStrata.length,
  eventBearingLines: eventLines.length,
  lineEventCountDistribution: lineDistribution,
  sameLineInterEventGaps: lineInternalGaps,
  crossLineInterEventGaps: gaps.length - lineInternalGaps,
  exactPageOccupancyAndGlobalMinGapBits: pageBits,
  exactLineOccupancyAndGlobalMinGapBits: lineBits,
  exactPlacementCountDigits: {
    page: pageCount.toString().length,
    line: lineCount.toString().length
  },
  status: "PASS",
  interpretation: "Capacity/identifiability only; no integer codec, framing, plaintext, or key is selected."
}, null, 2));
