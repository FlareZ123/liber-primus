"use strict";

/**
 * Strict physical-page-balanced opportunity test for the established p50
 * phase-0 row-major low60 predecessor-cell association.
 *
 * Each rune-bearing physical page keeps its exact low60/other opportunity
 * counts and exact total same-page adjacent-equality event count. The common
 * conditional effect normalizes each informative page by its event count so
 * pages with more repeats cannot dominate merely by supplying more events.
 *
 * Read-only SFT. Node.js 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));

const low60 = grid.pages.flatMap(page => page.bytes).map(value => value < 60);
assert.equal(low60.length, 256);
assert.equal(low60.filter(Boolean).length, 60);

const pages = corpus.pages.filter(page =>
  page.page <= 55 && page.indices.length > 0);
assert.equal(pages.length, 55);

/**
 * @typedef {{
 *   page:number,
 *   lowN:number,
 *   lowEvents:number,
 *   otherN:number,
 *   otherEvents:number
 * }} PageRow
 */

/** @type {PageRow[]} */
const rows = [];
let offset = 0;
for (const page of pages) {
  let lowN = 0;
  let lowEvents = 0;
  let otherN = 0;
  let otherEvents = 0;
  for (let local = 1; local < page.indices.length; local++) {
    const position = offset + local;
    const masked = low60[(position - 1) & 255];
    const event = page.indices[local] === page.indices[local - 1];
    if (masked) {
      lowN++;
      if (event) lowEvents++;
    } else {
      otherN++;
      if (event) otherEvents++;
    }
  }
  rows.push({page: page.page, lowN, lowEvents, otherN, otherEvents});
  offset += page.indices.length;
}
assert.equal(offset, 12956);

const totals = rows.reduce((out, row) => ({
  lowN: out.lowN + row.lowN,
  lowEvents: out.lowEvents + row.lowEvents,
  otherN: out.otherN + row.otherN,
  otherEvents: out.otherEvents + row.otherEvents
}), {lowN: 0, lowEvents: 0, otherN: 0, otherEvents: 0});
assert.deepEqual(totals, {
  lowN: 3025, lowEvents: 33, otherN: 9876, otherEvents: 53
});

const informative = rows.filter(row =>
  row.lowEvents + row.otherEvents > 0);
assert.equal(informative.length, 42);

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i++) value = value * (n - k + i) / i;
  return value;
}

/**
 * Conditional Fisher-noncentral-hypergeometric moments for the number of
 * low60 events on one page, given the page's total event count.
 * @param {PageRow} row
 * @param {number} beta log odds ratio
 */
function pageMoments(row, beta) {
  const events = row.lowEvents + row.otherEvents;
  const theta = Math.exp(beta);
  const lo = Math.max(0, events - row.otherN);
  const hi = Math.min(events, row.lowN);
  let z = 0;
  let first = 0;
  for (let x = lo; x <= hi; x++) {
    const weight =
      choose(row.lowN, x) *
      choose(row.otherN, events - x) *
      theta ** x;
    z += weight;
    first += x * weight;
  }
  const observedWeight =
    choose(row.lowN, row.lowEvents) *
    choose(row.otherN, row.otherEvents) *
    theta ** row.lowEvents;
  return {
    expected: first / z,
    logProbability: Math.log(observedWeight / z)
  };
}

/**
 * Page-equal score. Dividing each page contribution by its event count gives
 * every informative physical page equal total event weight.
 * @param {number} beta
 * @param {number|null} excludedPage
 */
function equalPageScore(beta, excludedPage = null) {
  let score = 0;
  for (const row of informative) {
    if (row.page === excludedPage) continue;
    const events = row.lowEvents + row.otherEvents;
    score += (row.lowEvents - pageMoments(row, beta).expected) / events;
  }
  return score;
}

/** @param {number|null} excludedPage */
function fitBeta(excludedPage = null) {
  let low = -8;
  let high = 8;
  for (let i = 0; i < 100; i++) {
    const middle = (low + high) / 2;
    if (equalPageScore(middle, excludedPage) > 0) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

const beta = fitBeta();
const commonOddsRatio = Math.exp(beta);
const observedNullScore = equalPageScore(0);
assert(Math.abs(observedNullScore - 6.823782719793316) < 1e-12);
assert(Math.abs(commonOddsRatio - 2.1537500331902244) < 1e-12);

let looWeightedLogGain = 0;
let looImprovedPages = 0;
const looOddsRatios = [];
for (const held of informative) {
  const heldBeta = fitBeta(held.page);
  const heldTheta = Math.exp(heldBeta);
  looOddsRatios.push(heldTheta);
  const events = held.lowEvents + held.otherEvents;
  const gain =
    (pageMoments(held, heldBeta).logProbability -
      pageMoments(held, 0).logProbability) / events;
  looWeightedLogGain += gain;
  if (gain > 0) looImprovedPages++;
}
assert(Math.abs(Math.min(...looOddsRatios) - 2.022467464645934) < 1e-12);
assert(Math.abs(Math.max(...looOddsRatios) - 2.256284900335403) < 1e-12);
assert(Math.abs(looWeightedLogGain - 2.1208897302888934) < 1e-12);
assert.equal(looImprovedPages, 25);

/** @param {number} seed */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state;
  };
}

/**
 * Exact sequential draw for the tiny per-page Hypergeom(lowN, otherN, e).
 * @param {number} good
 * @param {number} bad
 * @param {number} draws
 * @param {() => number} random
 */
function hypergeomSmall(good, bad, draws, random) {
  let selected = 0;
  for (let i = 0; i < draws; i++) {
    const u = random() / 4294967296;
    if (u < good / (good + bad)) {
      selected++;
      good--;
    } else {
      bad--;
    }
  }
  return selected;
}

const seed = 0x33011581;
const trials = 200000;
const random = makeRng(seed);
let atLeastObserved = 0;
let nullSum = 0;
let nullSquared = 0;
for (let trial = 0; trial < trials; trial++) {
  let score = 0;
  for (const row of informative) {
    const events = row.lowEvents + row.otherEvents;
    const simulatedLow = hypergeomSmall(
      row.lowN, row.otherN, events, random);
    score +=
      (simulatedLow - events * row.lowN / (row.lowN + row.otherN)) /
      events;
  }
  nullSum += score;
  nullSquared += score * score;
  if (score >= observedNullScore - 1e-15) atLeastObserved++;
}
const nullMean = nullSum / trials;
const nullSd = Math.sqrt(nullSquared / trials - nullMean * nullMean);
const plusOneTail = (atLeastObserved + 1) / (trials + 1);
assert.equal(atLeastObserved, 460);
assert(Math.abs(plusOneTail - 0.0023049884750576248) < 1e-15);

const correctedPageLogOdds = rows.map(row => {
  const value = Math.log(
    (row.lowEvents + 0.5) *
    (row.otherN - row.otherEvents + 0.5) /
    ((row.lowN - row.lowEvents + 0.5) *
      (row.otherEvents + 0.5)));
  return {page: row.page, logOdds: value};
});

console.log(JSON.stringify({
  status: "PASS",
  clock: "phase0 row-major predecessor cell (globalPosition-1) mod 256",
  class: "p50 derived byte < 60",
  totals,
  runeBearingPhysicalPages: rows.length,
  informativePages: informative.length,
  equalPageConditionalEffect: {
    beta,
    commonOddsRatio,
    observedNullScore,
    weighting: "each informative page contribution divided by its event count"
  },
  leaveOnePageOut: {
    minimumTrainingOddsRatio: Math.min(...looOddsRatios),
    maximumTrainingOddsRatio: Math.max(...looOddsRatios),
    weightedConditionalLogScoreGain: looWeightedLogGain,
    improvedPages: looImprovedPages,
    worsenedPages: informative.length - looImprovedPages
  },
  fixedWithinPageNull: {
    seed: "0x33011581",
    trials,
    nullMean,
    nullSd,
    atLeastObserved,
    plusOneUpperTail: plusOneTail
  },
  pageRows: rows,
  continuityCorrectedPageLogOdds,
  unknownPlaintextOrKeyRecovered: false
}, null, 2));
