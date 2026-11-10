"use strict";

const fs = require("node:fs");
const path = require("node:path");

/**
 * Investigate preserved LP2 word boundaries without presuming rune plaintext.
 * The sole source corpus for LP2 excludes AN END/PARABLE and the grid-only page.
 *
 * Statistics are experimental, not cryptographic decodings. A family-wise
 * Monte Carlo test corrects for scanning 29 possible harmonic lags.
 */
const ROOT = path.resolve(__dirname, "..");
const source = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const LP2 = source("resources/transcriptions/lp2_krisyotam_2017.txt");
const LP1 = source("resources/transcriptions/lp1_wulfic_canonical.txt");
const ENGLISH = source("resources/control/shakespeare_first300k.txt");
const RUNE_WORD = /^[\u16A0-\u16FF]+$/u;
const BINS = 9;
const MAX_LAG = 60;
const HARMONIC_MIN = 2;
const HARMONIC_MAX = 30;
const CALIBRATION_RUNS = 700;
const FAMILY_RUNS = 2200;

/** @param {string} text @returns {number[]} */
function runeLengths(text) {
  return text.replace(/\/\s*/g, "").split(/[\s.%$&§-]+/)
    .filter((word) => RUNE_WORD.test(word))
    .map((word) => Math.min(BINS, [...word].length));
}

/** @param {string} text @returns {number[][]} */
function clauses(text) {
  return text.replace(/\/\s*/g, "").split(/[.%$&§]+/)
    .map((part) => runeLengths(part)).filter((part) => part.length >= 3);
}

/** @param {string} text @returns {number[][]} */
function englishClauses(text) {
  return text.replace(/\r?\n/g, " ").split(/[.!?;:]+/)
    .map((part) => (part.match(/[A-Za-z]+/g) || [])
      .map((word) => Math.min(BINS,
        word.toUpperCase().replace(/TH|NG|EA|EO|OE|AE|IA/g, "#").length)))
    .filter((part) => part.length >= 3);
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {number[][]} groups @param {() => number} random @returns {number[][]} */
function shuffled(groups, random) {
  return groups.map((part) => {
    const output = part.slice();
    for (let i = output.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  });
}

/** @param {number[][]} train @returns {number[][]} */
function englishLengthModel(train) {
  const pairs = Array.from({length: BINS}, () => Array(BINS).fill(1));
  const left = Array(BINS).fill(BINS);
  const right = Array(BINS).fill(BINS);
  let total = BINS * BINS;
  for (const clause of train) {
    for (let i = 1; i < clause.length; i++) {
      const x = clause[i - 1] - 1;
      const y = clause[i] - 1;
      pairs[x][y]++;
      left[x]++;
      right[y]++;
      total++;
    }
  }
  return pairs.map((row, x) => row.map((count, y) =>
    Math.log((count * total) / (left[x] * right[y]))));
}

/** @param {number[][]} groups @returns {{mi:number, pairs:number}} */
function adjacentMI(groups) {
  const counts = Array.from({length: BINS}, () => Array(BINS).fill(0));
  const row = Array(BINS).fill(0);
  const col = Array(BINS).fill(0);
  let n = 0;
  for (const group of groups) {
    for (let i = 1; i < group.length; i++) {
      const x = group[i - 1] - 1;
      const y = group[i] - 1;
      counts[x][y]++;
      row[x]++;
      col[y]++;
      n++;
    }
  }
  let mi = 0;
  for (let x = 0; x < BINS; x++)
    for (let y = 0; y < BINS; y++)
      if (counts[x][y] > 0)
        mi += (counts[x][y] / n) * Math.log((counts[x][y] * n) / (row[x] * col[y]));
  return {mi, pairs: n};
}

/** @param {number[][]} groups @param {number[][]} model @param {number} lag @returns {number} */
function scoreLag(groups, model, lag) {
  let score = 0, pairs = 0;
  for (const group of groups) {
    for (let i = lag; i < group.length; i++) {
      score += model[group[i - lag] - 1][group[i] - 1];
      pairs++;
    }
  }
  return score / pairs;
}

/** @param {number[][]} groups @param {number[][]} model @returns {number[]} */
function scoreAllLags(groups, model) {
  const scores = Array(MAX_LAG + 1).fill(0);
  const counts = Array(MAX_LAG + 1).fill(0);
  for (const part of groups) {
    for (let lag = 1; lag <= Math.min(MAX_LAG, part.length - 1); lag++) {
      for (let j = lag; j < part.length; j++) {
        scores[lag] += model[part[j - lag] - 1][part[j] - 1];
        counts[lag]++;
      }
    }
  }
  for (let i = 1; i <= MAX_LAG; i++) scores[i] /= counts[i];
  return scores;
}

/** @param {number[][]} groups @param {number} seed @param {number} B */
function testMI(groups, seed, B) {
  const observed = adjacentMI(groups);
  const random = rng(seed);
  let sum = 0, sumsq = 0, greater = 0;
  for (let i = 0; i < B; i++) {
    const value = adjacentMI(shuffled(groups, random)).mi;
    sum += value;
    sumsq += value * value;
    if (value >= observed.mi) greater++;
  }
  const mean = sum / B;
  const sd = Math.sqrt(sumsq / B - mean * mean);
  return {...observed, nullMean: mean, z: (observed.mi - mean) / sd,
    pUpper: (greater + 1) / (B + 1)};
}

/** @param {number[][]} pages @param {number[][]} model */
function harmonicScan(pages, model) {
  const observed = scoreAllLags(pages, model);
  const sums = Array(MAX_LAG + 1).fill(0);
  const squares = Array(MAX_LAG + 1).fill(0);
  const calibrationRandom = rng(31519);
  for (let b = 0; b < CALIBRATION_RUNS; b++) {
    const one = scoreAllLags(shuffled(pages, calibrationRandom), model);
    for (let lag = 1; lag <= MAX_LAG; lag++) {
      sums[lag] += one[lag];
      squares[lag] += one[lag] * one[lag];
    }
  }
  const mean = sums.map((x) => x / CALIBRATION_RUNS);
  const sd = squares.map((x, i) =>
    Math.sqrt(x / CALIBRATION_RUNS - mean[i] * mean[i]));
  const standardize = (scores) => scores.map((x, i) =>
    i === 0 ? 0 : (x - mean[i]) / sd[i]);
  const z = standardize(observed);
  const harmonics = Array.from(
    {length: HARMONIC_MAX - HARMONIC_MIN + 1},
    (_, i) => {
      const k = i + HARMONIC_MIN;
      return {k, zFirst: z[k], zSecond: z[2 * k], sum: z[k] + z[2 * k]};
    }).sort((a, b) => b.sum - a.sum);
  const winning = harmonics[0];
  const random = rng(99027);
  let fwerExceed = 0, fixedExceed = 0;
  for (let b = 0; b < FAMILY_RUNS; b++) {
    const scores = standardize(scoreAllLags(shuffled(pages, random), model));
    let maxSum = -Infinity;
    for (let k = HARMONIC_MIN; k <= HARMONIC_MAX; k++)
      maxSum = Math.max(maxSum, scores[k] + scores[2 * k]);
    if (maxSum >= winning.sum) fwerExceed++;
    if (scores[23] + scores[46] >= z[23] + z[46]) fixedExceed++;
  }
  return {
    candidate: winning, otherCandidates: harmonics.slice(1, 5),
    familywiseP: (fwerExceed + 1) / (FAMILY_RUNS + 1),
    fixed23P: (fixedExceed + 1) / (FAMILY_RUNS + 1),
    note: "Exploratory discovery: tests and family chosen after inspecting lags.",
    originalLag1: z[1], adjacentScore: observed[1],
    lag23Score: observed[23], lag46Score: observed[46],
    calibrationRuns: CALIBRATION_RUNS, familyRuns: FAMILY_RUNS
  };
}

/** @param {number[]} page @param {number} step @param {boolean} reverse */
function interleave(page, step, reverse) {
  const output = [];
  if (reverse) {
    for (let i = step - 1; i >= 0; i--)
      for (let j = i; j < page.length; j += step) output.push(page[j]);
  } else {
    for (let i = 0; i < step; i++)
      for (let j = i; j < page.length; j += step) output.push(page[j]);
  }
  return output;
}

/** @param {number[][]} pages @param {number[][]} model */
function columnarCandidates(pages, model) {
  const total = [];
  for (let step = 2; step <= 33; step++) {
    for (const reverse of [false, true]) {
      const rearranged = pages.map((p) => interleave(p, step, reverse));
      total.push({step, reverse, score: scoreLag(rearranged, model, 1)});
    }
  }
  total.sort((a, b) => b.score - a.score);
  return {
    best: total.slice(0, 5),
    original: scoreLag(pages, model, 1),
    note: "Search ranking only; winner has not achieved familywise validation."
  };
}

const lp2Pages = LP2.split("%").slice(0, 55).map(runeLengths);
const lp2Clauses = clauses(LP2.split("%").slice(0, 55).join("%"));
const lp1Clauses = clauses(LP1);
const model = englishLengthModel(englishClauses(ENGLISH.slice(0, 180000)));
const runeCount = LP2.split("%").slice(0, 55).join("%")
  .split("").filter((rune) => RUNE_WORD.test(rune)).length;
const wordCount = lp2Pages.reduce((sum, part) => sum + part.length, 0);
if (lp2Pages.length !== 55 || runeCount !== 12956 || wordCount !== 2928) {
  throw new Error("LP2 transcription or boundary parser changed");
}

const report = {
  corpus: {lp2RuneCount: runeCount, lp2Pages: lp2Pages.length,
    lp2WordCount: wordCount, lp2ClauseCount: lp2Clauses.length},
  adjacency: {lp2: testMI(lp2Clauses, 123, 1000),
    lp1: testMI(lp1Clauses, 456, 1000)},
  harmonic: harmonicScan(lp2Pages, model),
  transposition: columnarCandidates(lp2Pages, model),
  method: "9 capped rune-length bins, Shakespeare digraph-collapsed bigram model; page/section-aware permutation nulls"
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
