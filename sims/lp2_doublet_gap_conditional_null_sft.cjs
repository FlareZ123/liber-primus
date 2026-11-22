"use strict";

/**
 * Original-source conditional nulls for the lag-1 correlation of distances
 * between equal adjacent GP29 runes in unsolved physical LP2 pp0..55.
 *
 * Inputs: pinned repo corpus and physical-page transcription.
 * Run as a single portable Node.js 22 CommonJS test file:
 *   node sims/lp2_doublet_gap_conditional_null_sft.cjs
 *
 * Source distinction: the '%' delimiter omits runeless physical page 50;
 * transcript chunk 50 is physical page 51. Only within-page adjacent pairs
 * are eligible. This is a position-process investigation, not a decoder.
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.join(__dirname, "..");
const RUNES = /[\u16A0-\u16FF]/g;
const CHAPTERS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];

/**
 * @typedef {{pos:number, page:number, chapter:number, boundary:number,
 * line:number, half:number, quarter:number, block:number, equal:boolean}} Pair
 */

/** @returns {{pairs:Pair[], positions:number[], chapterCounts:object[]}} */
function loadOriginal() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const text = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
  const chunks = text.split("%");
  const pairs = [];
  const chapterCounts = CHAPTERS.slice(0, -1).map((start, i) => ({
    pages: String(start) + "-" + String(CHAPTERS[i + 1] - 1),
    eligible: 0, equal: 0
  }));
  let globalOffset = 0;
  let pageCount = 0;
  for (let section = 0; section < chunks.length; section += 1) {
    const page = section < 50 ? section : section + 1;
    if (page >= 56) break;
    const body = chunks[section];
    const glyphs = [...body.matchAll(RUNES)];
    const values = glyphs.map((m) => corpus.runes.indexOf(m[0]));
    const original = corpus.pages.find((p) => p.page === page);
    assert.ok(original, "missing physical page " + page);
    assert.deepEqual(values, original.indices, "exact rune transcript for page " + page);
    const lineStarts = [0];
    for (let i = 0; i < body.length; i += 1) {
      if (body[i] === "/") lineStarts.push(i + 1);
    }
    let line = 0;
    let chapter = CHAPTERS.findIndex((first, j) => page >= first && page < CHAPTERS[j + 1]);
    assert.ok(chapter >= 0);
    for (let j = 1; j < glyphs.length; j += 1) {
      while (line + 1 < lineStarts.length && lineStarts[line + 1] <= glyphs[j].index) line += 1;
      const boundary = /[-.]/.test(body.slice(glyphs[j - 1].index + 1, glyphs[j].index)) ? 1 : 0;
      const equal = values[j] === values[j - 1];
      pairs.push({
        pos: globalOffset + j,
        page, chapter, boundary, line,
        half: Math.floor(j * 2 / glyphs.length),
        quarter: Math.floor(j * 4 / glyphs.length),
        block: Math.floor((globalOffset + j) / 1000),
        equal
      });
      chapterCounts[chapter].eligible += 1;
      chapterCounts[chapter].equal += Number(equal);
    }
    globalOffset += glyphs.length;
    pageCount += 1;
  }
  const positions = pairs.filter((p) => p.equal).map((p) => p.pos);
  assert.equal(globalOffset, 12956);
  assert.equal(pageCount, 55);
  assert.equal(pairs.length, 12901);
  assert.equal(positions.length, 86);
  assert.equal(new Set(positions).size, 86);
  assert.equal(chapterCounts.reduce((a, c) => a + c.eligible, 0), 12901);
  return {pairs, positions, chapterCounts};
}

/** Pearson r of consecutive *inter-event distances*, with stable sums. */
function gapAc1(positions) {
  assert.ok(positions.length >= 4);
  const n = positions.length - 2;
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (let i = 1; i < positions.length - 1; i += 1) {
    const x = positions[i] - positions[i - 1];
    const y = positions[i + 1] - positions[i];
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
}

/** Seeded, uniform uint32 stream for replayability (not cryptographic). */
function makeRand(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Uniformly sample k distinct indices in [0, total) by Floyd's algorithm.
 * Each site has exactly the same conditional inclusion probability.
 */
function sampleIndices(total, k, random) {
  assert.ok(k <= total);
  const indices = new Set();
  for (let i = total - k; i < total; i += 1) {
    const candidate = Math.floor(random() * (i + 1));
    indices.add(indices.has(candidate) ? i : candidate);
  }
  return [...indices];
}

/** Build exact source-stratified position buckets, retaining observed counts. */
function buckets(pairs, mode) {
  const byStratum = new Map();
  for (const p of pairs) {
    let key;
    switch (mode) {
      case "global": key = "all"; break;
      case "boundary": key = String(p.boundary); break;
      case "chapterBoundary": key = p.chapter + ":" + p.boundary; break;
      case "page": key = String(p.page); break;
      case "pageBoundary": key = p.page + ":" + p.boundary; break;
      case "pageHalf": key = p.page + ":" + p.half; break;
      case "pageQuarter": key = p.page + ":" + p.quarter; break;
      case "printedLine": key = p.page + ":" + p.line; break;
      default: throw new Error("Unknown model: " + mode);
    }
    if (!byStratum.has(key)) byStratum.set(key, {sites: [], observed: 0});
    const b = byStratum.get(key);
    b.sites.push(p.pos);
    if (p.equal) b.observed += 1;
  }
  return [...byStratum.values()];
}

/**
 * One-sided exact-conditioned Monte Carlo survival count. Uses distinct seed
 * per model, allowing different runs without relying on order of requests.
 */
function simulate(pairs, original, mode, trials, seed) {
  const groups = buckets(pairs, mode);
  const random = makeRand(seed);
  let atLeast = 0, sum = 0, squares = 0;
  for (let i = 0; i < trials; i += 1) {
    const chosen = [];
    for (const b of groups) {
      for (const j of sampleIndices(b.sites.length, b.observed, random)) chosen.push(b.sites[j]);
    }
    chosen.sort((a, b) => a - b);
    assert.equal(chosen.length, 86);
    const value = gapAc1(chosen);
    atLeast += Number(value >= original);
    sum += value;
    squares += value * value;
  }
  const mean = sum / trials;
  return {
    mode, strata: groups.length, trials, observed: original,
    nullMean: mean, nullSD: Math.sqrt(squares / trials - mean * mean),
    exceedances: atLeast,
    addOneOneSidedP: (atLeast + 1) / (trials + 1)
  };
}

/** Entry point: all assertions, original tests and positive serial-gap plant. */
function main() {
  const {pairs, positions, chapterCounts} = loadOriginal();
  const observed = gapAc1(positions);
  assert.ok(Math.abs(observed - 0.38001968924100965) < 1e-12);
  // Positive-control serial-rate drift: ten consecutive short gaps followed
  // by ten consecutive long gaps, repeated, in the original book capacity.
  const plant = [20];
  for (let i = 0; i < 85; i += 1) {
    plant.push(plant[plant.length - 1] + (Math.floor(i / 10) % 2 === 0 ? 25 : 275));
  }
  assert.equal(plant.length, 86);
  assert.ok(plant[plant.length - 1] < 12956);
  assert.ok(gapAc1(plant) > 0.65, "serial-gap positive control");
  const plans = [
    ["global", 100000],
    ["boundary", 100000],
    ["chapterBoundary", 100000],
    ["page", 100000],
    ["pageBoundary", 100000],
    ["pageHalf", 50000],
    ["pageQuarter", 50000],
    ["printedLine", 50000]
  ];
  const results = plans.map(([mode, n], i) => simulate(
    pairs, observed, mode, n, (0x33013301 ^ Math.imul(i + 1, 0x9e3779b1)) >>> 0
  ));
  assert.ok(results.find((r) => r.mode === "global").addOneOneSidedP < 0.005);
  assert.ok(results.find((r) => r.mode === "page").addOneOneSidedP < 0.02);
  console.log(JSON.stringify({
    analysis: "original LP2 physical pages 0..55 only",
    observations: {runeCount: 12956, eligiblePairs: 12901, doubletSites: 86, gapPearsonR: observed},
    positiveControl: {correlatedGapsR: gapAc1(plant), length: plant.length},
    chapterCounts, results
  }, null, 2));
  return results;
}

module.exports = {loadOriginal, gapAc1, makeRand, sampleIndices, buckets, simulate, main};
if (require.main === module) main();
