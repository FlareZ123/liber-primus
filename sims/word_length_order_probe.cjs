"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

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


/**
 * Assign each canonical rune word a physical-line ordinal on its starting page.
 * Printed line wraps are slash markers; punctuation ends words but not lines.
 * These groups let the null shuffle preserve the place within a printed line.
 * @param {string} raw @returns {number[][]}
 */
function printedLineSlots(raw) {
  const pages = raw.split("%").slice(0, 55).join("%");
  const slots = Array.from({length: 55}, () => []);
  const perLine = new Map();
  let page = 0, line = 0, word = "", startPage = 0, startSlot = 0;
  function finish() {
    if (!word) return;
    slots[startPage].push(startSlot);
    word = "";
  }
  for (const ch of pages) {
    if (RUNE_WORD.test(ch)) {
      if (!word) {
        startPage = page;
        const key = page + ":" + line;
        startSlot = perLine.get(key) || 0;
        perLine.set(key, startSlot + 1);
      }
      word += ch;
    } else if (ch === "%") {
      page++;
      line = 0;
    } else if (ch === "/") {
      line++;
    } else if (/\s/u.test(ch)) {
      // Print formatting whitespace.
    } else {
      finish();
    }
  }
  finish();
  return slots;
}

/** @param {number[][]} pages @param {number[][]} slots @param {() => number} random */
function shuffleWithinLineSlot(pages, slots, random) {
  return pages.map((page, pi) => {
    const out = page.slice();
    const groups = new Map();
    for (let i = 0; i < page.length; i++) {
      const slot = slots[pi][i];
      if (!groups.has(slot)) groups.set(slot, []);
      groups.get(slot).push(i);
    }
    for (const indices of groups.values()) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [out[indices[i]], out[indices[j]]] =
          [out[indices[j]], out[indices[i]]];
      }
    }
    return out;
  });
}

/**
 * A post-discovery control for whether printed line position accounts for
 * the lag-23/46 observation. It is not an independent discovery p-value.
 */
function lineSlotConditionedTest(pages, model, raw) {
  const slots = printedLineSlots(raw);
  for (let i = 0; i < 55; i++)
    if (slots[i].length !== pages[i].length)
      throw new Error("Printed line slot parsing differs on page " + i);
  const observed = scoreLag(pages, model, 23) + scoreLag(pages, model, 46);
  const random = rng(123456);
  const trials = 1800;
  let sum = 0, sumsq = 0, exceed = 0;
  for (let b = 0; b < trials; b++) {
    const shuffledPages = shuffleWithinLineSlot(pages, slots, random);
    const value = scoreLag(shuffledPages, model, 23)
      + scoreLag(shuffledPages, model, 46);
    sum += value;
    sumsq += value * value;
    if (value >= observed) exceed++;
  }
  const mean = sum / trials;
  const sd = Math.sqrt(sumsq / trials - mean * mean);
  return {observed, nullMean: mean, z: (observed - mean) / sd,
    pUpper: (exceed + 1) / (trials + 1), trials,
    note: "Post-selection fixed 23/46 control, preserving word-in-line slot."};
}


const canonical = parseSharedCorpus();
const lp2Pages = canonical.byStartPage.map((words) =>
  words.map((word) => Math.min(BINS, word.length)));
const containedPages = canonical.byContainedPage.map((words) =>
  words.map((word) => Math.min(BINS, word.length)));
const lp2Clauses = clauses(LP2.split("%").slice(0, 55).join("%")
  .replace(/%\s*/g, ""));
const lp1Clauses = clauses(LP1);
const model = englishLengthModel(englishClauses(ENGLISH.slice(0, 180000)));
const runeCount = canonical.runeCount;
const wordCount = lp2Pages.reduce((sum, part) => sum + part.length, 0);
if (lp2Pages.length !== 55 || runeCount !== 12956 || wordCount !== 2896) {
  throw new Error("LP2 transcription or boundary parser changed");
}

const report = {
  corpus: {lp2RuneCount: runeCount, lp2Pages: lp2Pages.length,
    lp2WordCount: wordCount,
    extraPageFragments: canonical.originalPageFragments - wordCount,
    crossPageWords: canonical.crossPageWords,
    lp2ClauseCount: lp2Clauses.length},
  adjacency: {lp2: testMI(lp2Clauses, 123, 1000),
    lp1: testMI(lp1Clauses, 456, 1000)},
  harmonic: harmonicScan(lp2Pages, model),
  harmonicContainedOnly: harmonicScan(containedPages, model),
  lineSlotConditioned: lineSlotConditionedTest(lp2Pages, model, LP2),
  transposition: columnarCandidates(lp2Pages, model),
  transpositionContainedOnly: columnarCandidates(containedPages, model),
  method: "9 capped rune-length bins, Shakespeare digraph-collapsed bigram model; page/section-aware permutation nulls"
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
