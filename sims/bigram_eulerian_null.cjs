'use strict';

/**
 * Exact per-page bigram-preserving Euler-trail randomization of LP2.
 * Screens longer-range rune recurrences and local symbol balancing
 * while conditioning on every page's observed first-order transitions.
 * Node.js >=20, CommonJS, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WIDTHS = [7, 11, 19, 29, 58, 87, 113];
const MAX_LAG = 96;

/** @param {number} seed @returns {() => number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} page @param {() => number} random @returns {number[]} */
function reshuffleBigrams(page, random) {
  const outgoing = Array.from({ length: 29 }, () => []);
  for (let i = 1; i < page.length; i++) outgoing[page[i - 1]].push(page[i]);
  for (const edges of outgoing) {
    for (let i = edges.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [edges[i], edges[j]] = [edges[j], edges[i]];
    }
  }
  const stack = [page[0]];
  const trail = [];
  while (stack.length) {
    const edges = outgoing[stack[stack.length - 1]];
    if (edges.length) stack.push(edges.pop());
    else trail.push(stack.pop());
  }
  trail.reverse();
  assert.equal(trail.length, page.length);
  assert.equal(trail[0], page[0]);
  assert.equal(trail[trail.length - 1], page[page.length - 1]);
  return trail;
}

/** @param {number[][]} pages @param {number} maxLag */
function equalLagCounts(pages, maxLag) {
  const hits = new Float64Array(maxLag + 1);
  for (const a of pages) {
    for (let lag = 2; lag <= Math.min(maxLag, a.length - 1); lag++) {
      for (let i = lag; i < a.length; i++) hits[lag] += Number(a[i] === a[i - lag]);
    }
  }
  return hits;
}

/** @param {number[][]} pages @param {number[]} widths */
function blockDispersion(pages, widths) {
  const means = [];
  for (const w of widths) {
    let total = 0;
    let blocks = 0;
    for (const a of pages) {
      for (let offset = 0; offset + w <= a.length; offset += w) {
        const counts = new Uint16Array(29);
        for (let i = offset; i < offset + w; i++) counts[a[i]]++;
        const expected = w / 29;
        for (const n of counts) total += (n - expected) ** 2 / expected;
        blocks++;
      }
    }
    means.push(total / blocks);
  }
  return means;
}

/** @param {number[][]} pages */
function loadCheck(pages) {
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((n, p) => n + p.length, 0), 12956);
  let adjacencies = 0;
  let doublets = 0;
  for (const p of pages) {
    for (const x of p) assert.ok(Number.isInteger(x) && x >= 0 && x <= 28);
    for (let i = 1; i < p.length; i++) {
      adjacencies++;
      doublets += Number(p[i] === p[i - 1]);
    }
  }
  assert.equal(adjacencies, 12901);
  assert.equal(doublets, 86);
}

/** @param {number[][]} pages @param {number} lag */
function lagsAndWindows(pages, lag) {
  return Array.from(equalLagCounts(pages, lag)).slice(2).concat(blockDispersion(pages, WIDTHS));
}

/**
 * Null-calibrated simultaneous two-sided max-|z| test across all lags and widths.
 * Training nulls learn moments, independent testing nulls calibrate selection.
 * @param {number[][]} pages
 * @param {number} training
 * @param {number} testing
 * @param {number} seed
 */
function evaluate(pages, training, testing, seed) {
  const labels = Array.from({ length: MAX_LAG - 1 }, (_, i) => 'lag' + (i + 2))
    .concat(WIDTHS.map(w => 'window' + w));
  const observed = lagsAndWindows(pages, MAX_LAG);
  const random = prng(seed);
  const moments = observed.map(() => ({ sum: 0, sum2: 0 }));
  const nullSample = () => lagsAndWindows(pages.map(p => reshuffleBigrams(p, random)), MAX_LAG);
  for (let i = 0; i < training; i++) {
    const values = nullSample();
    for (let j = 0; j < values.length; j++) {
      moments[j].sum += values[j];
      moments[j].sum2 += values[j] ** 2;
    }
  }
  const reference = moments.map(m => {
    const mean = m.sum / training;
    const sd = Math.sqrt(Math.max(0, (m.sum2 - training * mean ** 2) / (training - 1)));
    assert.ok(sd > 0);
    return { mean, sd };
  });
  const z = observed.map((value, i) => (value - reference[i].mean) / reference[i].sd);
  const maximalZ = Math.max(...z.map(Math.abs));
  const maxima = [];
  for (let i = 0; i < testing; i++) {
    const values = nullSample();
    let maximal = 0;
    for (let j = 0; j < values.length; j++) {
      const trialZ = Math.abs((values[j] - reference[j].mean) / reference[j].sd);
      if (trialZ > maximal) maximal = trialZ;
    }
    maxima.push(maximal);
  }
  const exceed = maxima.filter(x => x >= maximalZ).length;
  const ranked = labels.map((label, i) => ({
    label, observed: observed[i], nullMean: reference[i].mean,
    nullSd: reference[i].sd, z: z[i]
  })).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  return {
    seed, training, testing, maxLag: MAX_LAG, widths: WIDTHS,
    observedMaxZ: maximalZ, familywiseUpperP: (exceed + 1) / (testing + 1),
    exceed, nullMaxMean: maxima.reduce((a, b) => a + b, 0) / maxima.length,
    top: ranked.slice(0, 12), windows: ranked.filter(x => x.label.startsWith('window'))
  };
}

/**
 * Generate a known, easy-to-detect higher-order signal with anti-doublets.
 * The actual manuscript is never edited by the positive-control generator.
 * @param {number[][]} templates @param {number} seed
 */
function plantLagEleven(templates, seed) {
  const random = prng(seed);
  return templates.map(page => {
    const out = [];
    for (let i = 0; i < page.length; i++) {
      let v = random() % 29;
      if (i > 0 && v === out[i - 1] && random() / 4294967296 < 0.81)
        v = (v + 1 + random() % 28) % 29;
      if (i >= 11 && v === out[i - 11] && random() / 4294967296 < 0.60)
        v = (v + 1 + random() % 28) % 29;
      out.push(v);
    }
    return out;
  });
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length).map(p => p.indices);
  loadCheck(pages);
  const real = evaluate(pages, 160, 320, 0x47bd911e);
  const planted = plantLagEleven(pages, 0x4711cb51);
  const synthetic = evaluate(planted, 60, 120, 0x47b12950);
  assert.ok(synthetic.top[0].label === 'lag11');
  assert.ok(synthetic.familywiseUpperP < 0.02);
  console.log(JSON.stringify({
    corpus: { runePages: pages.length, runeCount: 12956, withinPagePairs: 12901, immediateRepeats: 86 },
    model: 'exact per-page bigram-preserving randomized Euler trails',
    observed: real,
    plantedControl: { label: 'synthetic 60 percent avoidance of lag-11 collisions', ...synthetic }
  }, null, 2));
}

if (require.main === module) main();
module.exports = { prng, reshuffleBigrams, equalLagCounts, blockDispersion, evaluate, plantLagEleven };
