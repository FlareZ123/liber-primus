"use strict";

/**
 * Agent 44 SFT: source-conditioned analysis of the original 86 repeated-rune
 * sites and their serial inter-site gap correlation. Windows 11 / Node.js 22.
 * External first-order gap anomaly: Dukotah/cicada3301, 2026 Round 44 B3/T7.
 * This test introduces physical-page, word-class, chapter and page-order nulls.
 * All tests below are exploratory, not a recovered cipher or plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const runePattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const unwrapped = transcript.split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (unwrapped.match(runePattern) || []).map((word) => Array.from(word, (rune) => corpus.runes.indexOf(rune)));
const flattened = words.flat();
const pages = corpus.pages.filter((page) => page.page < 56 && page.indices.length > 0);
const raw = pages.flatMap((page) => page.indices);

assert.equal(pages.length, 55);
assert.equal(words.length, 2896);
assert.equal(raw.length, 12956);
assert.deepEqual(flattened, raw, "canonical transcription must match canonical index corpus");
const wordBreaks = new Set();
let wordOffset = 0;
for (const word of words) {
  wordOffset += word.length;
  wordBreaks.add(wordOffset);
}
assert.equal(wordOffset, raw.length);

const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapters = chapterEnds.map(() => ({ eligible: [], count: 0 }));
const blocks = [];
const sourceEvents = [];
const sourceEligible = [];
let offset = 0;
for (const page of pages) {
  const b = {
    page: page.page,
    start: offset,
    length: page.indices.length,
    eligible: [],
    events: [],
    byClass: [[], []],
    eventClassCounts: [0, 0],
  };
  for (let i = 0; i < page.indices.length - 1; i++) {
    const site = offset + i;
    const kind = wordBreaks.has(site + 1) ? 1 : 0;
    const chapter = chapterEnds.findIndex((end) => site < end);
    assert(chapter >= 0);
    b.eligible.push(i);
    b.byClass[kind].push(i);
    sourceEligible.push(site);
    chapters[chapter].eligible.push(site);
    if (page.indices[i] === page.indices[i + 1]) {
      b.events.push(i);
      b.eventClassCounts[kind]++;
      sourceEvents.push(site);
      chapters[chapter].count++;
    }
  }
  blocks.push(b);
  offset += page.indices.length;
}

assert.equal(sourceEligible.length, 12901);
assert.equal(sourceEvents.length, 86);
assert.deepEqual(blocks.map((b) => b.events.length).reduce((a, b) => a + b, 0), 86);
assert.deepEqual(blocks.reduce((a, b) => a.map((v, i) => v + b.eventClassCounts[i]), [0, 0]), [63, 23]);
assert.deepEqual(chapters.map((c) => c.count), [4, 6, 9, 10, 11, 13, 12, 18, 3]);

/** @param {number[]} values @returns {number[]} */
function rank(values) {
  const sorted = values.map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const result = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].value === sorted[i].value) j++;
    for (let k = i; k < j; k++) result[sorted[k].index] = (i + j - 1) / 2;
    i = j;
  }
  return result;
}

/** @param {number[]} xs @param {number[]} ys @returns {number} */
function correlation(xs, ys) {
  assert.equal(xs.length, ys.length);
  const n = xs.length;
  if (n < 3) throw new Error("At least three paired observations required");
  let xMean = 0, yMean = 0;
  for (let i = 0; i < n; i++) { xMean += xs[i]; yMean += ys[i]; }
  xMean /= n;
  yMean /= n;
  let cross = 0, xx = 0, yy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - xMean;
    const b = ys[i] - yMean;
    cross += a * b;
    xx += a * a;
    yy += b * b;
  }
  return cross / Math.sqrt(xx * yy);
}

/** @param {number[]} sites @returns {{pearson: number, spearman: number, trimmed2: number, withinChapter: number}} */
function measurements(sites) {
  assert.equal(sites.length, 86);
  const gaps = sites.slice(1).map((value, i) => value - sites[i]);
  assert(gaps.every((value) => value > 0), "sites must be strictly increasing");
  const pearson = correlation(gaps.slice(0, -1), gaps.slice(1));
  const ranks = rank(gaps);
  const spearman = correlation(ranks.slice(0, -1), ranks.slice(1));

  const largest = gaps.map((value, i) => ({ value, i }))
    .sort((a, b) => b.value - a.value || a.i - b.i).slice(0, 2);
  const omitted = new Set(largest.map((x) => x.i));
  const trimmedX = [], trimmedY = [];
  const chapterX = [], chapterY = [];
  const chapterAt = (pos) => chapterEnds.findIndex((end) => pos < end);
  for (let i = 0; i < gaps.length - 1; i++) {
    if (!omitted.has(i) && !omitted.has(i + 1)) {
      trimmedX.push(gaps[i]);
      trimmedY.push(gaps[i + 1]);
    }
    if (chapterAt(sites[i]) === chapterAt(sites[i + 1]) &&
        chapterAt(sites[i + 1]) === chapterAt(sites[i + 2])) {
      chapterX.push(gaps[i]);
      chapterY.push(gaps[i + 1]);
    }
  }
  return {
    pearson,
    spearman,
    trimmed2: correlation(trimmedX, trimmedY),
    withinChapter: correlation(chapterX, chapterY),
  };
}

const observed = measurements(sourceEvents);
assert(Math.abs(observed.pearson - 0.38001968924100965) < 1e-12,
  "independent 2026 B3 original-site regression");

// Deterministic simulation only. There is no fitted cipher, key or hidden state.
let state = 0x3301a444;
/** @returns {number} */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @param {number[]} pool @param {number} howMany @returns {number[]} */
function select(pool, howMany) {
  assert(howMany <= pool.length);
  const indices = new Set();
  while (indices.size < howMany) indices.add(Math.floor(random() * pool.length));
  return [...indices].map((i) => pool[i]);
}
/** @param {number[]} values @returns {number[]} */
function shuffled(values) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
/** @param {number[]} positions @returns {number[]} */
function ordered(positions) { return positions.sort((a, b) => a - b); }

const trials = 40000;
const samplers = {
  // 86 sites chosen uniformly among valid within-page pairs; baseline model.
  unrestricted: () => ordered(select(sourceEligible, 86)),
  // Retain the exact 55 page-level event counts. Tests within-page placement.
  pageCountsFixed: () => ordered(blocks.flatMap((b) =>
    select(b.eligible, b.events.length).map((local) => b.start + local))),
  // Retain 55×2 observed counts of within-word and word-boundary events.
  pageWordClassesFixed: () => ordered(blocks.flatMap((b) =>
    b.byClass.flatMap((pool, k) => select(pool, b.eventClassCounts[k]))
      .map((local) => b.start + local))),
  // Retain nine source-illustrated chapter-level event counts, but no page counts.
  chapterCountsFixed: () => ordered(chapters.flatMap((c) => select(c.eligible, c.count))),
  // Move whole physical pages, preserving their exact internal event sites.
  pageBlockPermutation: () => {
    let base = 0;
    const sites = [];
    for (const b of shuffled(blocks)) {
      for (const local of b.events) sites.push(base + local);
      base += b.length;
    }
    return sites;
  },
};

const keys = Object.keys(observed);
const reports = {};
for (const [name, sample] of Object.entries(samplers)) {
  const full = name === "pageCountsFixed";
  const types = full ? keys : ["pearson"];
  const stats = Object.fromEntries(types.map((key) => [key, {
    hits: 0, sum: 0, squared: 0, values: [],
  }]));
  for (let trial = 0; trial < trials; trial++) {
    const positions = sample();
    assert.equal(positions.length, sourceEvents.length);
    const measured = measurements(positions);
    for (const key of types) {
      const value = measured[key];
      assert(Number.isFinite(value));
      const s = stats[key];
      s.hits += Number(value >= observed[key]);
      s.sum += value;
      s.squared += value * value;
      s.values.push(value);
    }
  }
  reports[name] = Object.fromEntries(types.map((key) => {
    const s = stats[key], average = s.sum / trials;
    s.values.sort((a, b) => a - b);
    return [key, {
      original: observed[key],
      nullMean: average,
      nullSD: Math.sqrt(s.squared / trials - average * average),
      upperTailP: (s.hits + 1) / (trials + 1),
      null95: [s.values[Math.floor(trials * 0.025)], s.values[Math.floor(trials * 0.975)]],
      nullHitsAtLeastObserved: s.hits,
    }];
  }));
}

// Controls for degenerate correlation and known serial dependence.
const plantGaps = Array.from({ length: 85 }, (_, i) => (Math.floor(i / 8) % 2 === 0 ? 55 : 215));
const synthetic = [100];
for (const gap of plantGaps) synthetic.push(synthetic[synthetic.length - 1] + gap);
assert(synthetic[synthetic.length - 1] < raw.length);
assert(measurements(synthetic).pearson > 0.70);
assert(reports.unrestricted.pearson.upperTailP < 0.01);
assert(reports.pageCountsFixed.pearson.upperTailP < 0.03);

console.log(JSON.stringify({
  source: ["resources/liber-primus/lp2-corpus.json", "resources/lp2-transcription.txt"],
  externalFirstReported: "Dukotah/cicada3301, Round 44, B3/T7, 9-11 Nov 2026",
  status: "INTERMEDIATE EVIDENCE ONLY; no unknown plaintext or decoder",
  counts: {
    pages: pages.length, runes: raw.length, words: words.length,
    eligibleWithinPagePairs: sourceEligible.length, equalPairs: sourceEvents.length,
    wordInteriorEqualPairs: 63, wordBoundaryEqualPairs: 23,
    visuallyDefinedChapterEqualPairs: chapters.map((c) => c.count),
    longestInterEventGaps: sourceEvents.slice(1).map((x, i) => x - sourceEvents[i])
      .sort((a, b) => b - a).slice(0, 4),
  },
  observed,
  trials, seed: "0x3301a444", reports,
  interpretation: "Source-page conditioning weakens the original flat-null signal. Pearson retains a conditional tail but trimmed, chapter-local and rank variants are weaker. These statistics select no key.",
}, null, 2));
