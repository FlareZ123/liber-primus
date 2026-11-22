"use strict";

/**
 * Original LP2 Fibonacci-indexed lag-eight differential collision gate.
 * Source motivations are the p15 Fibonacci spiral and the p49-51 eight-column
 * numeric grid, but neither source authenticates an eight-lag cipher.
 * Full exact chapter-quota randomization and selection across lags 1..64.
 *
 * SFT: node sims/lp2_fibonacci_page_step_lag8_sft.cjs
 * Node.js >=20, CommonJS, no third-party dependencies or network.
 */
const assert = require("node:assert/strict");
const gp = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/base60-grid.json");

const FIB = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const LAST_LAG = 64;
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));

/** @param {number[]} a */
function sourceDeltas(a) {
  return a.slice(1).map((value, i) => (value - a[i] + 29) % 29);
}
/**
 * Conditional equal-value rate among pairs of nonzero GP29 ciphertext steps.
 * Both tested difference values must be nonzero; zero steps are the separate
 * original 86-event special channel.
 * @param {number[]} step
 * @param {number} lag
 */
function sameNonzeroStepRate(step, lag) {
  let hits = 0, eligible = 0;
  for (let i = lag; i < step.length; i++) {
    if (step[i] === 0 || step[i - lag] === 0) continue;
    eligible++;
    hits += Number(step[i] === step[i - lag]);
  }
  return {hits, eligible, rate: hits / eligible};
}
/** @param {number[]} a @param {number} lag */
function sameGlyphRate(a, lag) {
  let matches = 0;
  for (let i = lag; i < a.length; i++) matches += Number(a[i] === a[i-lag]);
  return {matches, eligible: a.length - lag, rate: matches / (a.length - lag)};
}
const perPage = pages.map(p => {
  const delta = sourceDeltas(p.indices);
  return {
    page: p.page, runes: p.indices.length,
    lagRates: Array.from({length: LAST_LAG}, (_, l) =>
      sameNonzeroStepRate(delta, l + 1)),
    glyph8: sameGlyphRate(p.indices, 8)
  };
});
const id = new Map(perPage.map((p, i) => [p.page, i]));
const selectedIds = FIB.map(p => id.get(p));
assert.ok(selectedIds.every(i => Number.isInteger(i)));

const chapterConstraints = [
  {pages: [3, 4, 5, 6, 7], select: 2},
  {pages: [8, 9, 10, 11, 12, 13, 14], select: 2},
  {pages: [15, 16, 17, 18, 19, 20, 21, 22], select: 1},
  {pages: [33, 34, 35, 36, 37, 38, 39], select: 1},
  {pages: [54, 55], select: 1}
];
/** @param {number[]} a @param {number} k */
function combinations(a, k) {
  const result = [];
  function visit(start, chosen) {
    if (chosen.length === k) {
      result.push(chosen.slice());
      return;
    }
    for (let i = start; i <= a.length - (k - chosen.length); i++) {
      chosen.push(a[i]);
      visit(i + 1, chosen);
      chosen.pop();
    }
  }
  visit(0, []);
  return result;
}
const chapterChoices = chapterConstraints.map(g =>
  combinations(g.pages, g.select).map(group => group.map(page => id.get(page))));
const alternatives = [];
function enumerate(chapter, chosen) {
  if (chapter === chapterChoices.length) {
    alternatives.push([0, 1, 2, ...chosen]);
    return;
  }
  for (const next of chapterChoices[chapter])
    enumerate(chapter + 1, chosen.concat(next));
}
enumerate(0, []);
assert.equal(alternatives.length, 23520);

/** @param {number[]} members @param {number} lagIndex */
function selectedRateSum(members, lagIndex) {
  let sum = 0;
  for (const idx of members) sum += perPage[idx].lagRates[lagIndex].rate;
  return sum;
}
const count = alternatives.length;
const moments = Array.from({length: LAST_LAG},
  (_, l) => ({lag: l + 1, mean: 0, squares: 0, original: selectedRateSum(selectedIds, l)}));
for (const members of alternatives) {
  for (let l = 0; l < LAST_LAG; l++) {
    const value = selectedRateSum(members, l);
    moments[l].mean += value;
    moments[l].squares += value * value;
  }
}
for (const moment of moments) {
  moment.mean /= count;
  moment.standardDeviation = Math.sqrt(Math.max(0,
    (moment.squares / count - moment.mean ** 2) * count / (count - 1)));
  assert(moment.standardDeviation > 0);
  moment.deficitZ = (moment.mean - moment.original) / moment.standardDeviation;
  delete moment.squares;
}
const largest = moments.slice().sort((a, b) => b.deficitZ - a.deficitZ)[0];
assert.equal(largest.lag, 8);
const lagEight = moments[7];
assert.ok(Math.abs(lagEight.deficitZ - 3.108891964626202) < 1e-9);

// Exact one-sided 8-lag tail within the 23,520 fixed-chapter assignments.
// Also perform a complete selection-corrected MAX over 64 original lag slots.
let unadjustedLower = 0, familywiseUpper = 0;
for (const members of alternatives) {
  const v8 = selectedRateSum(members, 7);
  if (v8 <= lagEight.original + 1e-12) unadjustedLower++;
  let maximum = -Infinity;
  for (let l = 0; l < LAST_LAG; l++) {
    const value = selectedRateSum(members, l);
    const z = (moments[l].mean - value) / moments[l].standardDeviation;
    if (z > maximum) maximum = z;
  }
  familywiseUpper += Number(maximum >= lagEight.deficitZ - 1e-12);
}
assert.equal(unadjustedLower, 5);
assert.equal(familywiseUpper, 249);

const fibSet = new Set(FIB);
const sumCounts = group => perPage.filter(p => fibSet.has(p.page) === group)
  .reduce((acc, p) => {
    const v = p.lagRates[7];
    acc.hits += v.hits;
    acc.eligible += v.eligible;
    return acc;
  }, {hits: 0, eligible: 0});
const fibCounts = sumCounts(true);
const otherCounts = sumCounts(false);
assert.deepEqual(fibCounts, {hits: 45, eligible: 2226});
assert.deepEqual(otherCounts, {hits: 372, eligible: 10068});
assert.ok(Math.abs(selectedRateSum(selectedIds, 7) / 10 -
  0.020132162634387545) < 1e-12);

// Literal adjacent lag controls, under the same 64-lag family.
assert.ok(moments[6].deficitZ < 0);
assert.ok(moments[8].deficitZ < 0);
const ranked = moments.slice().sort((a, b) => b.deficitZ - a.deficitZ);

const data = {
  classification: "conditional original LP2 page-index lag-eight step collision deficit",
  source: "Original p15 Fibonacci spiral, physical pages 0..55, original 8-column numeric table",
  pages: 55, ciphertextRunes: 12956, fibonacciPages: FIB,
  operator: "For every within-page nonzero delta[i]=(C[i]-C[i-1]) mod29, test delta[i]==delta[i-8] with both deltas nonzero",
  lagEight: {
    fibonacci: {...fibCounts, weightedRate: fibCounts.hits / fibCounts.eligible,
      meanOfTenPageRates: lagEight.original / 10},
    otherPages: {...otherCounts,
      weightedRate: otherCounts.hits / otherCounts.eligible},
    chapterQuotaExactNull: {
      assignments: count, countAtOrBelow: unadjustedLower,
      oneSidedFraction: unadjustedLower / count,
      z: lagEight.deficitZ
    },
    familywiseAcrossAllLags1Through64: {
      assignments: count, countAtOrBeyondObservedMax: familywiseUpper,
      fraction: familywiseUpper / count,
      observedWinningLag: largest.lag
    },
    adjacentLag7Z: moments[6].deficitZ,
    adjacentLag9Z: moments[8].deficitZ
  },
  rankedLagDeficits: ranked.slice(0, 10),
  eachFibonacciPageLagEight: perPage.filter(p => fibSet.has(p.page))
    .map(p => ({page: p.page, ...p.lagRates[7]})),
  caveat: "This is a source-conditional exploratory statistic. The eight-column hint does not select a reversible key, and the broader history of tested manuscript hypotheses is not controlled by this exact null. No unknown LP2 plaintext is recovered."
};
console.log(JSON.stringify(data, null, 2));
