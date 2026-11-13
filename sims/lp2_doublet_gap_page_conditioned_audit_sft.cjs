#!/usr/bin/env node
"use strict";

// Page-conditioned audit of the Round-44 T7 doublet-gap autocorrelation.
// Reads only the repository's canonical LP2 page corpus and transcription.
// No network, dependencies, or nondeterministic RNG are used.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const corpusPath = path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json");
const transcriptionPath = path.join(ROOT, "resources", "lp2-transcription.txt");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const pages = corpus.pages.filter(p => p.status === "unsolved");
assert.equal(pages.length, 55, "unsolved page count changed");

const pageRows = [];
let offset = 0;
const allRunes = [];
const allPageIds = [];
for (const p of pages) {
  const local = [];
  for (let i = 0; i < p.indices.length - 1; i++) {
    if (p.indices[i] === p.indices[i + 1]) local.push(i);
  }
  pageRows.push({ page: p.page, len: p.indices.length, local, offset });
  for (const v of p.indices) {
    allRunes.push(v);
    allPageIds.push(p.page);
  }
  offset += p.indices.length;
}
assert.equal(offset, 12956, "unsolved rune count changed");

const sites = [];
for (let i = 0; i < allRunes.length - 1; i++) {
  if (allRunes[i] === allRunes[i + 1]) {
    sites.push({ pos: i, page: allPageIds[i] });
  }
}
assert.equal(sites.length, 86, "doublet-site census changed");
assert.equal(sites.filter(s => allPageIds[s.pos] !== allPageIds[s.pos + 1]).length, 0,
  "a cross-page doublet appeared");

const positions = sites.map(s => s.pos);
const sitePages = sites.map(s => s.page);
const gaps = positions.slice(1).map((p, i) => p - positions[i]);
assert.equal(gaps.length, 85);
assert.equal(Math.min(...gaps), 6);

function ac1(values) {
  if (values.length < 3) return null;
  const a = values.slice(0, -1);
  const b = values.slice(1);
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    xy += x * y;
    xx += x * x;
    yy += y * y;
  }
  return xx && yy ? xy / Math.sqrt(xx * yy) : null;
}

function pairAc1(pairs) {
  if (pairs.length < 2) return null;
  const a = pairs.map(p => p[0]);
  const b = pairs.map(p => p[1]);
  const ma = a.reduce((s, v) => s + v, 0) / a.length;
  const mb = b.reduce((s, v) => s + v, 0) / b.length;
  let xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    xy += x * y;
    xx += x * x;
    yy += y * y;
  }
  return xx && yy ? xy / Math.sqrt(xx * yy) : null;
}

const categoryPairs = { WW: [], WX: [], XW: [], XX: [] };
for (let i = 0; i < gaps.length - 1; i++) {
  const firstWithin = sitePages[i] === sitePages[i + 1];
  const secondWithin = sitePages[i + 1] === sitePages[i + 2];
  const key = (firstWithin ? "W" : "X") + (secondWithin ? "W" : "X");
  categoryPairs[key].push([gaps[i], gaps[i + 1]]);
}
const categorySummary = Object.fromEntries(
  Object.entries(categoryPairs).map(([k, v]) => [k, { n: v.length, ac1: pairAc1(v) }])
);

const crossPageGaps = sitePages.slice(1).filter((p, i) => p !== sitePages[i]).length;
const pageCounts = pageRows.map(p => p.local.length);
const pageCountDistribution = {};
for (const n of pageCounts) pageCountDistribution[n] = (pageCountDistribution[n] || 0) + 1;

const nBlocks = Math.ceil(allRunes.length / 1000);
function blockCounts(pos) {
  const out = Array(nBlocks).fill(0);
  for (const p of pos) out[Math.floor(p / 1000)]++;
  return out;
}
const observedBlockCounts = blockCounts(positions);
const observed = {
  gapAc1: ac1(gaps),
  blockCounts: observedBlockCounts,
  blockCountAc1: ac1(observedBlockCounts),
  pageCountAc1: ac1(pageCounts)
};

function makeRng(seed) {
  let x = seed >>> 0;
  return function rand() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function chooseSorted(n, k, rand) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rand() * (n - i));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k).sort((u, v) => u - v);
}

// Uniform positions from 0..M-1, conditional on minimum separation d.
function sampleMinGap(M, k, d, rand) {
  if (!k) return [];
  const n = M - (d - 1) * (k - 1);
  assert.ok(n >= k, "infeasible per-page min-gap sample");
  return chooseSorted(n, k, rand).map((v, i) => v + (d - 1) * i);
}

// Keep each page's observed first/last site and randomize only its interior.
function sampleInterior(first, last, k, d, rand) {
  if (k === 0) return [];
  if (k === 1) return [first];
  if (k === 2) return [first, last];
  const m = k - 2;
  const slots = last - first - 2 * d + 1;
  const n = slots - (d - 1) * (m - 1);
  assert.ok(n >= m, "infeasible endpoint-conditioned sample");
  const interior = chooseSorted(n, m, rand).map((v, i) => first + d + v + (d - 1) * i);
  return [first, ...interior, last];
}

function summarize(values, obs) {
  const sorted = values.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const upper = values.filter(v => v >= obs).length;
  const mirroredCutoff = 2 * median - obs;
  const lower = values.filter(v => v <= mirroredCutoff).length;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + v * v, 0) / values.length - mean * mean;
  return {
    n: values.length,
    mean,
    sd: Math.sqrt(Math.max(0, variance)),
    q05: sorted[Math.floor(0.05 * (sorted.length - 1))],
    median,
    q95: sorted[Math.floor(0.95 * (sorted.length - 1))],
    q99: sorted[Math.floor(0.99 * (sorted.length - 1))],
    pUpper: (upper + 1) / (values.length + 1),
    pTwoSidedCentered: Math.min(1, (2 * Math.min(upper, lower) + 1) / (values.length + 1))
  };
}

const D = Number(process.env.LP2_T7_D || 100000);
const MIN_GAP = 6;
const rand = makeRng(0x6f6c6453);
const countOnlyGap = [], countOnlyBlock = [], endpointsGap = [];
let rejectedCountOnlyDraws = 0;

for (let t = 0; t < D; t++) {
  let pos = [], off = 0, accepted = false;
  while (!accepted) {
    pos = [];
    off = 0;
    for (const p of pageRows) {
      for (const v of sampleMinGap(p.len - 1, p.local.length, MIN_GAP, rand)) pos.push(off + v);
      off += p.len;
    }
    const candidateGaps = pos.slice(1).map((v, i) => v - pos[i]);
    accepted = candidateGaps.every(g => g >= MIN_GAP);
    if (!accepted) rejectedCountOnlyDraws++;
  }

  const g = pos.slice(1).map((v, i) => v - pos[i]);
  countOnlyGap.push(ac1(g));
  countOnlyBlock.push(ac1(blockCounts(pos)));

  pos = [];
  off = 0;
  for (const p of pageRows) {
    const local = sampleInterior(
      p.local[0], p.local[p.local.length - 1], p.local.length, MIN_GAP, rand
    );
    for (const v of local) pos.push(off + v);
    off += p.len;
  }
  const endpointGaps = pos.slice(1).map((v, i) => v - pos[i]);
  assert.ok(endpointGaps.every(gap => gap >= MIN_GAP));
  endpointsGap.push(ac1(endpointGaps));
}

function separatorCrosscheck() {
  const text = fs.readFileSync(transcriptionPath, "utf8");
  const runeSet = new Set(corpus.runes);
  const segments = text.split("%").map(s => s.trim()).filter(s => [...s].some(c => runeSet.has(c)));
  assert.equal(segments.length, 57, "transcription page-segment count changed");
  let runeCount = 0, siteCount = 0;
  const counts = {};
  for (const segment of segments.slice(0, 55)) {
    let previous = null, between = "";
    for (const c of segment) {
      if (runeSet.has(c)) {
        if (previous !== null && previous === c) {
          siteCount++;
          const key = between.replace(/\s/g, "") || "NONE";
          counts[key] = (counts[key] || 0) + 1;
        }
        previous = c;
        between = "";
        runeCount++;
      } else if (previous !== null) {
        between += c;
      }
    }
  }
  assert.equal(runeCount, 12956);
  assert.equal(siteCount, 86);
  return counts;
}

const report = {
  input: "resources/liber-primus/lp2-corpus.json; cross-check resources/lp2-transcription.txt",
  unsolvedPages: pages.length,
  unsolvedRunes: allRunes.length,
  doubletSites: sites.length,
  gaps: gaps.length,
  minGap: Math.min(...gaps),
  observed,
  crossPageGaps,
  gapPairCategories: categorySummary,
  pageCountDistribution,
  withinPageGapPairCount: categoryPairs.WW.length,
  withinPageGapPairAc1: categorySummary.WW.ac1,
  countOnlyPageConditionedNull: summarize(countOnlyGap, observed.gapAc1),
  endpointConditionedPageNull: summarize(endpointsGap, observed.gapAc1),
  blockCountNull: summarize(countOnlyBlock, observed.blockCountAc1),
  rejectedCountOnlyDraws,
  nullDesign: {
    draws: D,
    seed: "0x6f6c6453",
    minimumSiteSeparation: MIN_GAP,
    countOnly: "preserve each page length and exact site count; uniformly resample non-overlapping site positions; reject global gaps below 6",
    endpoints: "also preserve each page's observed first and last site positions; randomize only interior sites",
    familywiseAlphaFromExternalPreregistration: 0.01 / 7
  },
  transcriptionSeparatorCounts: separatorCrosscheck()
};

console.log(JSON.stringify(report, null, 2));
