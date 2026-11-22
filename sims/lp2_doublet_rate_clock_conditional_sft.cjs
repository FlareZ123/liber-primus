/**
 * Original LP2 doublet-site clock/scale conditional test.
 *
 * A doublet site is the zero-based position i of C[i] === C[i + 1].
 * Each null holds source-observed site counts fixed inside the named
 * intervals, while randomizing the exact site positions. Every draw is
 * uniform over the eligible sites conditional on its per-interval count,
 * no physical-page-crossing pair, and no adjacent sites (no triplets).
 *
 * Run: node sims/lp2_doublet_rate_clock_conditional_sft.cjs
 * Source: resources/liber-primus/lp2-corpus.json
 *
 * This is a diagnostic test of an observed rate anomaly, NOT a decoder.
 * The interval widths were inspected after seeing the original anomaly;
 * therefore the p-values are descriptive, not a registered discovery test.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const pages = corpus.pages.slice(0, 56);
const starts = [];
let length = 0;
for (const page of pages) {
  starts.push(length);
  length += page.indices.length;
}
const ciphertext = pages.flatMap((page) => page.indices);
const sites = [];
for (let i = 0; i < ciphertext.length - 1; i++) {
  if (ciphertext[i] === ciphertext[i + 1]) sites.push(i);
}
if (length !== 12956 || sites.length !== 86 ||
    sites[0] !== 121 || sites[sites.length - 1] !== 12938 ||
    sites.some((s, i) => i > 0 && s === sites[i - 1] + 1)) {
  throw Error('Original corpus/site census disagrees with pinned evidence');
}

const forbidden = new Set(starts.slice(1).map((s) => s - 1));
forbidden.add(length - 1);
if (sites.some((s) => forbidden.has(s))) {
  throw Error('An original doublet crosses a page boundary');
}

const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

/**
 * @param {number[]} points Ascending original or null site positions.
 * @returns {number} Pearson correlation between successive site gaps.
 */
function gapAutocorrelation(points) {
  const gaps = points.slice(1).map((p, i) => p - points[i]);
  const n = gaps.length - 1;
  const x = gaps.slice(0, n);
  const y = gaps.slice(1);
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx, b = y[i] - my;
    cov += a * b;
    vx += a * a;
    vy += b * b;
  }
  return cov / Math.sqrt(vx * vy);
}

/** @param {number} seed @returns {() => number} Deterministic [0,1) RNG. */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function groupIntervals(name, intervals) {
  return {
    name,
    groups: intervals.map(([lo, hi]) => ({
      count: sites.filter((s) => s >= lo && s < hi).length,
      allowed: Array.from({ length: hi - lo }, (_, i) => lo + i)
        .filter((p) => !forbidden.has(p))
    }))
  };
}
const models = [
  groupIntervals('global', [[0, length]]),
  groupIntervals('chapters9', chapterPages.map(([a, b]) => [
    starts[a], starts[b] + pages[b].indices.length
  ])),
  groupIntervals('pages56', pages.map((page, i) => [
    starts[i], starts[i] + page.indices.length
  ])),
  ...[2000, 1000, 500, 250, 125].map((size) =>
    groupIntervals('blocks' + size, Array.from(
      { length: Math.ceil(length / size) }, (_, i) =>
        [i * size, Math.min(length, (i + 1) * size)]
    ))
  )
];

/**
 * Draw independent uniform site subsets within each group, then reject
 * the entire sample when sites touch. Rejection makes the accepted sample
 * uniform over the exact conditional no-triplet event. It avoids bias from
 * sequentially forbidding neighbors during site selection.
 * @param {{count: number, allowed: number[]}[]} groups
 * @param {() => number} rand
 * @returns {number[]}
 */
function draw(groups, rand) {
  for (;;) {
    const positions = [];
    for (const group of groups) {
      if (group.count > group.allowed.length) throw Error('Impossible group');
      const chosen = new Set();
      while (chosen.size < group.count) {
        chosen.add(group.allowed[Math.floor(rand() * group.allowed.length)]);
      }
      positions.push(...chosen);
    }
    positions.sort((a, b) => a - b);
    if (!positions.some((p, i) => i && p === positions[i - 1] + 1)) {
      return positions;
    }
  }
}

const trials = 30000;
const observed = gapAutocorrelation(sites);
const results = [];
for (let i = 0; i < models.length; i++) {
  const model = models[i];
  const random = mulberry32(3301 + 7771 * i);
  const nullScores = [];
  for (let t = 0; t < trials; t++) {
    nullScores.push(gapAutocorrelation(draw(model.groups, random)));
  }
  const greaterOrEqual = nullScores.filter((score) => score >= observed).length;
  const nullMean = nullScores.reduce((a, b) => a + b, 0) / trials;
  const nullStdDev = Math.sqrt(nullScores.reduce(
    (a, b) => a + (b - nullMean) ** 2, 0
  ) / trials);
  nullScores.sort((a, b) => a - b);
  results.push({
    name: model.name,
    groupCount: model.groups.length,
    greaterOrEqual,
    pHighAddOne: (greaterOrEqual + 1) / (trials + 1),
    nullMean,
    nullStdDev,
    q95: nullScores[Math.floor(trials * 0.95)],
    q99: nullScores[Math.floor(trials * 0.99)]
  });
}
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  runeCount: length,
  doubletCount: sites.length,
  doubletSiteFirst: sites[0],
  doubletSiteLast: sites[sites.length - 1],
  trials,
  observedGapAc1: observed,
  results
}, null, 2));
