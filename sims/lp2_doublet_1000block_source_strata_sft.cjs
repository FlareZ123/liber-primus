#!/usr/bin/env node
"use strict";

/**
 * Original LP2 1,000-rune doublet dispersion and source-conditioned site null.
 * Source: original GP29 transcription and canonical 58-page corpus.
 * Fixed partitions, statistics, seeds, and one independent smooth-rate plant.
 * A site null is a distribution of event indicators, not a ciphertext decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = text.split("%");
const pages = corpus.pages.filter(p => p.page <= 55);
const groups = new Map();
const observedSites = [], book = [], eligibleSites = [];
const groupFor = (name) => {
  if (!groups.has(name)) groups.set(name, { sites: [], count: 0 });
  return groups.get(name);
};

for (const page of pages) {
  // The rune-free physical p50 numerical grid has no transcript page segment.
  const fragment = page.page < 50 ? parts[page.page] :
    page.page === 50 ? "" : parts[page.page - 1];
  const words = (fragment.replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map(w => [...w].map(r => runeIndex.get(r)));
  const pageStart = book.length;
  for (const word of words) {
    for (let j = 0; j < word.length; j++) {
      const position = book.length;
      const current = word[j];
      if (position > pageStart) {
        const role = j === 0 ? "initial" :
          j === word.length - 1 ? "final" : "interior";
        const key = `${page.page}:${word.length}:${role}`;
        const g = groupFor(key);
        const repeat = current === book[position - 1];
        g.sites.push(position);
        g.count += Number(repeat);
        eligibleSites.push(position);
        if (repeat) observedSites.push(position);
      }
      book.push(current);
    }
  }
  assert.deepEqual(book.slice(pageStart), page.indices,
    "canonical original rune identities, page " + page.page);
}
assert.equal(book.length, 12956);
assert.equal(eligibleSites.length, 12901);
assert.equal(observedSites.length, 86);
assert.equal(groups.size, 1433);
const slots = Array(13).fill(1000);
slots[12] = 956;
const eligiblePerBlock = slots.map((_, i) =>
  eligibleSites.filter(p => Math.floor(p / 1000) === i).length);
assert.deepEqual(eligiblePerBlock,
  [995, 996, 996, 996, 996, 995, 997, 995, 996, 996, 996, 997, 950]);

/** @param {number[]} sites Sorted absolute rune sites. */
function statistic(sites) {
  const counts = Array(13).fill(0);
  for (const site of sites) counts[Math.floor(site / 1000)]++;
  const n = sites.length;
  const chi = (weights) => counts.reduce((sum, count, i) => {
    const expected = n * weights[i] / weights.reduce((a, b) => a + b, 0);
    return sum + (count - expected) ** 2 / expected;
  }, 0);
  const gaps = sites.slice(1).map((site, i) => site - sites[i]);
  const m = gaps.length - 1;
  let mx = 0, my = 0;
  for (let i = 0; i < m; i++) { mx += gaps[i]; my += gaps[i + 1]; }
  mx /= m; my /= m;
  let cov = 0, vx = 0, vy = 0;
  for (let i = 0; i < m; i++) {
    const x = gaps[i] - mx, y = gaps[i + 1] - my;
    cov += x * y; vx += x * x; vy += y * y;
  }
  return { counts, chiRuneSlots: chi(slots),
    chiEligibleSites: chi(eligiblePerBlock),
    gapRho: cov / Math.sqrt(vx * vy) };
}

/** @param {number} seed Fixed xorshift32 state. */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

/** Uniformly select k distinct zero-based indices among n. */
function sample(n, k, random) {
  const selected = new Set();
  for (let j = n - k; j < n; j++) {
    const draw = Math.floor(random() * (j + 1));
    selected.add(selected.has(draw) ? j : draw);
  }
  return [...selected];
}
const observed = statistic(observedSites);
assert.deepEqual(observed.counts, [8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]);
assert(Math.abs(observed.gapRho - 0.38001968924100954) < 1e-12);
assert(Math.abs(observed.chiRuneSlots - 15.712227109078524) < 1e-12);

const eligibleGroups = [...groups.values()].filter(g => g.count);
assert.equal(eligibleGroups.length, 82);
const randomSource = random32(0x33016666);
const sourceTrials = 20000;
let exceedRho = 0, exceedChi = 0, totalRho = 0, totalChi = 0;
for (let t = 0; t < sourceTrials; t++) {
  const sites = eligibleGroups.flatMap(g =>
    sample(g.sites.length, g.count, randomSource).map(i => g.sites[i]))
    .sort((a, b) => a - b);
  const current = statistic(sites);
  exceedRho += Number(current.gapRho >= observed.gapRho);
  exceedChi += Number(current.chiRuneSlots >= observed.chiRuneSlots);
  totalRho += current.gapRho;
  totalChi += current.chiRuneSlots;
}
assert.equal(exceedRho, 213);
assert.equal(exceedChi, 8059);
const sourceNull = {
  strata: groups.size, occupied: eligibleGroups.length,
  seed: "0x33016666", trials: sourceTrials,
  meanGapRho: totalRho / sourceTrials,
  meanBlockChi: totalChi / sourceTrials,
  rhoTail: (exceedRho + 1) / (sourceTrials + 1),
  chiTail: (exceedChi + 1) / (sourceTrials + 1)
};

// Exact flat fixed-total site null, keeping all original page exclusions.
const randomFlat = random32(0x33016665);
const flatTrials = 50000;
const flatChis = [];
let flatExceeds = 0;
for (let t = 0; t < flatTrials; t++) {
  const sites = sample(eligibleSites.length, 86, randomFlat)
    .map(i => eligibleSites[i]).sort((a, b) => a - b);
  const chi = statistic(sites).chiEligibleSites;
  flatChis.push(chi);
  flatExceeds += Number(chi >= observed.chiEligibleSites);
}
flatChis.sort((a, b) => a - b);
const flatP95 = flatChis[Math.floor(0.95 * flatTrials)];
const flatTail = (flatExceeds + 1) / (flatTrials + 1);
assert(flatTail > 0.17 && flatTail < 0.23);

// Independent positive plant: 86 events sampled at original eligible sites
// with smooth rate w(t) = 1 + 0.95 sin(2*pi*t/2600). No fitted phase.
const weights = eligibleSites.map(p => 1 + 0.95 * Math.sin(2 * Math.PI * p / 2600));
const prefix = [];
let mass = 0;
for (const value of weights) { mass += value; prefix.push(mass); }
const randomPlant = random32(0x33016667);
const plantTrials = 1000;
let plantDetected = 0, plantChiSum = 0;
for (let t = 0; t < plantTrials; t++) {
  const used = new Set();
  while (used.size < 86) {
    const target = randomPlant() * mass;
    let lo = 0, hi = prefix.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (prefix[mid] <= target) lo = mid + 1;
      else hi = mid;
    }
    used.add(eligibleSites[lo]);
  }
  const sites = [...used].sort((a, b) => a - b);
  const value = statistic(sites).chiEligibleSites;
  plantChiSum += value;
  plantDetected += Number(value > flatP95);
}
assert(plantDetected > 800, "smooth-rate positive plant must be detected");
console.log(JSON.stringify({
  objective: "source-conditioned block-dispersion discriminator, not a cipher inverse",
  source: { pages: pages.length, runes: book.length,
    eligibleSites: eligibleSites.length, observedDoublets: observedSites.length },
  observed,
  sourceNull,
  flatSiteNull: {seed:"0x33016665", trials:flatTrials,
    chiTail:flatTail, chi95:flatP95},
  smoothRatePlant: {seed:"0x33016667", trials:plantTrials,
    rate:"1 + 0.95 sin(2π t / 2600)", meanChi:plantChiSum/plantTrials,
    detectionFraction:plantDetected/plantTrials}
}, null, 2));
