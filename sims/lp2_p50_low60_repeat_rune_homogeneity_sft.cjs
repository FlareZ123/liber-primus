'use strict';

/**
 * Director #1535: decide whether the frozen p50 low60 adjacent-repeat
 * enrichment is rune-generic or concentrated in a few ciphertext identities.
 *
 * Exact conditional design:
 *   - keep the original 86 within-page adjacent-equal events;
 *   - keep the exact global phase-zero p50 leading-zero/low60 mask;
 *   - stratify every opportunity by its first/current ciphertext rune;
 *   - condition on each rune's total repeat count.
 *
 * Under a common mask odds ratio theta, selected-hit counts in each rune
 * stratum follow Fisher noncentral hypergeometric laws. Conditioning further
 * on the observed total selected-hit count removes theta entirely, giving a
 * key-free heterogeneity test across rune identities.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const MASK = Uint8Array.from(TOKENS, (token) => Number(token[0] === '0'));
const PAGES = corpus.pages.filter((page) => page.page <= 55);
assert.equal(TOKENS.length, 256);
assert.equal(MASK.reduce((a, b) => a + b, 0), 60);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);

/**
 * @typedef {{sN:number,uN:number,sH:number,uH:number}} Counts
 */

/** @returns {Counts[][]} */
function inventory() {
  const out = Array.from(
    { length: CHAPTERS.length },
    () => Array.from({ length: 29 }, () => ({ sN: 0, uN: 0, sH: 0, uH: 0 }))
  );
  let globalRune = 0;

  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let i = 0; i + 1 < page.indices.length; i++) {
      const rune = page.indices[i];
      const selected = MASK[(globalRune + i) & 255] === 1;
      const hit = page.indices[i] === page.indices[i + 1];
      const counts = out[chapter][rune];
      if (selected) {
        counts.sN++;
        counts.sH += Number(hit);
      } else {
        counts.uN++;
        counts.uH += Number(hit);
      }
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  return out;
}

const byChapter = inventory();

/** @param {number[]} chapters @returns {Counts[]} */
function aggregate(chapters) {
  return Array.from({ length: 29 }, (_, rune) => {
    const total = { sN: 0, uN: 0, sH: 0, uH: 0 };
    for (const chapter of chapters) {
      const source = byChapter[chapter][rune];
      total.sN += source.sN;
      total.uN += source.uN;
      total.sH += source.sH;
      total.uH += source.uH;
    }
    return total;
  });
}

const all = aggregate(Array.from({ length: 9 }, (_, i) => i));
assert.equal(all.reduce((sum, x) => sum + x.sN + x.uN, 0), 12901);
assert.equal(all.reduce((sum, x) => sum + x.sH + x.uH, 0), 86);
assert.equal(all.reduce((sum, x) => sum + x.sH, 0), 33);

const LOG_FACTORIAL = new Float64Array(13001);
for (let i = 2; i < LOG_FACTORIAL.length; i++) {
  LOG_FACTORIAL[i] = LOG_FACTORIAL[i - 1] + Math.log(i);
}

/** @param {number} n @param {number} k */
function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return LOG_FACTORIAL[n] - LOG_FACTORIAL[k] - LOG_FACTORIAL[n - k];
}

/**
 * @param {Counts} counts
 * @param {number} logTheta
 */
function conditionalDistribution(counts, logTheta) {
  const hits = counts.sH + counts.uH;
  const lo = Math.max(0, hits - counts.uN);
  const hi = Math.min(hits, counts.sN);
  const logs = [];
  let maximum = -Infinity;

  for (let k = lo; k <= hi; k++) {
    const value =
      logChoose(counts.sN, k) +
      logChoose(counts.uN, hits - k) +
      k * logTheta;
    logs.push([k, value]);
    if (value > maximum) maximum = value;
  }

  let scaled = 0;
  for (const [, value] of logs) scaled += Math.exp(value - maximum);
  const logZ = maximum + Math.log(scaled);
  let mean = 0;
  let variance = 0;

  for (const [k, value] of logs) mean += Math.exp(value - logZ) * k;
  for (const [k, value] of logs) {
    variance += Math.exp(value - logZ) * (k - mean) ** 2;
  }

  return { lo, hi, logs, logZ, mean, variance };
}

/** @param {Counts[]} strata */
function fitCommonLogTheta(strata) {
  const observed = strata.reduce((sum, x) => sum + x.sH, 0);
  let low = -10;
  let high = 10;

  for (let iteration = 0; iteration < 100; iteration++) {
    const middle = (low + high) / 2;
    const expected = strata.reduce(
      (sum, x) => sum + conditionalDistribution(x, middle).mean,
      0
    );
    if (expected < observed) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/**
 * @param {Counts} counts
 * @param {number} selectedHits
 * @param {number} logTheta
 */
function conditionalLogProbability(counts, selectedHits, logTheta) {
  const hits = counts.sH + counts.uH;
  const distribution = conditionalDistribution(counts, logTheta);
  return (
    logChoose(counts.sN, selectedHits) +
    logChoose(counts.uN, hits - selectedHits) +
    selectedHits * logTheta -
    distribution.logZ
  );
}

/**
 * Exact identity-conditioned null tail for total selected repeat hits.
 * @param {Counts[]} strata
 * @param {number} threshold
 */
function exactNullTail(strata, threshold) {
  let dp = [1];

  for (const counts of strata) {
    const distribution = conditionalDistribution(counts, 0);
    const probabilities = [];
    for (const [k, value] of distribution.logs) {
      probabilities[k] = Math.exp(value - distribution.logZ);
    }

    const next = new Array(dp.length + distribution.hi).fill(0);
    for (let total = 0; total < dp.length; total++) {
      if (!dp[total]) continue;
      for (let k = distribution.lo; k <= distribution.hi; k++) {
        next[total + k] += dp[total] * (probabilities[k] || 0);
      }
    }
    dp = next;
  }

  return dp.slice(threshold).reduce((a, b) => a + b, 0);
}

const observedSelected = all.reduce((sum, x) => sum + x.sH, 0);
const commonLogTheta = fitCommonLogTheta(all);
const commonTheta = Math.exp(commonLogTheta);
const identityConditionedNullTail = exactNullTail(all, observedSelected);

/*
 * Heterogeneity under any common odds ratio.
 *
 * Given each rune's total repeat count and the grand selected-hit total 33,
 * the common theta contributes theta^33 to every admissible allocation and
 * therefore cancels. Allocation weights are purely combinatorial.
 */
const weights = all.map((counts) => {
  const hits = counts.sH + counts.uH;
  const lo = Math.max(0, hits - counts.uN);
  const hi = Math.min(hits, counts.sN);
  const values = [];
  for (let k = lo; k <= hi; k++) {
    values[k] = Math.exp(
      logChoose(counts.sN, k) + logChoose(counts.uN, hits - k)
    );
  }
  return { lo, hi, values };
});

/**
 * @param {number[]} left
 * @param {{lo:number,hi:number,values:number[]}} weight
 * @param {number} cap
 */
function convolve(left, weight, cap) {
  const out = new Array(Math.min(cap, left.length - 1 + weight.hi) + 1).fill(0);
  for (let total = 0; total < left.length; total++) {
    if (!left[total]) continue;
    for (let k = weight.lo; k <= weight.hi && total + k <= cap; k++) {
      out[total + k] += left[total] * (weight.values[k] || 0);
    }
  }

  const maximum = Math.max(...out);
  if (maximum > 1e200 || (maximum > 0 && maximum < 1e-200)) {
    for (let i = 0; i < out.length; i++) out[i] /= maximum;
  }
  return out;
}

const forward = [[1]];
for (let rune = 0; rune < 29; rune++) {
  forward.push(convolve(forward[rune], weights[rune], observedSelected));
}
const reverseWeights = weights.slice().reverse();
const reverseTmp = [[1]];
for (let i = 0; i < 29; i++) {
  reverseTmp.push(convolve(reverseTmp[i], reverseWeights[i], observedSelected));
}
const backward = Array.from({ length: 30 }, (_, i) => reverseTmp[29 - i]);

const runeRows = [];
let heterogeneityQ = 0;
for (let rune = 0; rune < 29; rune++) {
  const weight = weights[rune];
  const probabilities = [];
  let normalization = 0;

  for (let k = weight.lo; k <= weight.hi; k++) {
    let remainderWeight = 0;
    const left = forward[rune];
    const right = backward[rune + 1];

    for (let before = 0; before < left.length; before++) {
      const after = observedSelected - k - before;
      if (after >= 0 && after < right.length) {
        remainderWeight += left[before] * right[after];
      }
    }

    const value = (weight.values[k] || 0) * remainderWeight;
    probabilities[k] = value;
    normalization += value;
  }

  let mean = 0;
  let variance = 0;
  for (let k = weight.lo; k <= weight.hi; k++) {
    mean += ((probabilities[k] || 0) / normalization) * k;
  }
  for (let k = weight.lo; k <= weight.hi; k++) {
    variance += ((probabilities[k] || 0) / normalization) * (k - mean) ** 2;
  }

  const counts = all[rune];
  const residual = variance > 0 ? (counts.sH - mean) / Math.sqrt(variance) : 0;
  if (variance > 0) heterogeneityQ += residual ** 2;

  runeRows.push({
    rune,
    token: corpus.translit[rune],
    selectedOpportunities: counts.sN,
    otherOpportunities: counts.uN,
    selectedRepeats: counts.sH,
    otherRepeats: counts.uH,
    totalRepeats: counts.sH + counts.uH,
    expectedSelectedRepeatsGivenGrandTotal: mean,
    standardizedResidual: residual
  });
}

/** @param {number} seed */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const random = prng(153538);
const BOOTSTRAPS = 100000;
let atLeastObserved = 0;

for (let replicate = 0; replicate < BOOTSTRAPS; replicate++) {
  let remaining = observedSelected;
  let q = 0;
  const sampled = new Int8Array(29);

  for (let rune = 0; rune < 29; rune++) {
    const weight = weights[rune];
    const suffix = backward[rune + 1];
    const options = [];
    let normalization = 0;

    for (let k = weight.lo; k <= weight.hi && k <= remaining; k++) {
      const rest = remaining - k;
      const value = (weight.values[k] || 0) *
        (rest < suffix.length ? suffix[rest] : 0);
      if (value > 0) {
        options.push([k, value]);
        normalization += value;
      }
    }

    let target = random() * normalization;
    let chosen = options[options.length - 1][0];
    for (const [k, value] of options) {
      target -= value;
      if (target <= 0) {
        chosen = k;
        break;
      }
    }
    sampled[rune] = chosen;
    remaining -= chosen;
  }
  assert.equal(remaining, 0);

  for (let rune = 0; rune < 29; rune++) {
    const row = runeRows[rune];
    const variance = (() => {
      const weight = weights[rune];
      let z = 0;
      let mean = 0;
      let second = 0;
      for (let k = weight.lo; k <= weight.hi; k++) {
        let remainderWeight = 0;
        const left = forward[rune];
        const right = backward[rune + 1];
        for (let before = 0; before < left.length; before++) {
          const after = observedSelected - k - before;
          if (after >= 0 && after < right.length) {
            remainderWeight += left[before] * right[after];
          }
        }
        const value = (weight.values[k] || 0) * remainderWeight;
        z += value;
        mean += value * k;
        second += value * k * k;
      }
      mean /= z;
      return second / z - mean * mean;
    })();
    if (variance > 0) {
      q += (
        (sampled[rune] - row.expectedSelectedRepeatsGivenGrandTotal) ** 2 /
        variance
      );
    }
  }

  if (q >= heterogeneityQ - 1e-12) atLeastObserved++;
}

const heterogeneityP = (atLeastObserved + 1) / (BOOTSTRAPS + 1);

/*
 * Nine-chapter leave-one-out conditional prediction. Fit only one common
 * rune-adjusted odds ratio on the other eight chapters, then score the held
 * chapter against theta=1 while conditioning on held-out per-rune repeat totals.
 */
const loco = [];
for (let holdout = 0; holdout < 9; holdout++) {
  const trainingChapters = Array.from({ length: 9 }, (_, i) => i)
    .filter((chapter) => chapter !== holdout);
  const training = aggregate(trainingChapters);
  const held = byChapter[holdout];
  const logTheta = fitCommonLogTheta(training);

  let gain = 0;
  let observed = 0;
  let nullExpected = 0;

  for (let rune = 0; rune < 29; rune++) {
    gain +=
      conditionalLogProbability(held[rune], held[rune].sH, logTheta) -
      conditionalLogProbability(held[rune], held[rune].sH, 0);
    observed += held[rune].sH;
    nullExpected += conditionalDistribution(held[rune], 0).mean;
  }

  loco.push({
    holdout,
    pages: CHAPTERS[holdout],
    trainingCommonOddsRatio: Math.exp(logTheta),
    predictiveLogLikelihoodGain: gain,
    observedSelectedRepeats: observed,
    identityConditionedNullExpected: nullExpected,
    positiveDirection: observed > nullExpected
  });
}

const fRune = corpus.translit.indexOf('F');
assert.ok(fRune >= 0);
const fControl = runeRows[fRune];
const selectedContributorCount = runeRows.filter((row) => row.selectedRepeats > 0).length;
const locoGain = loco.reduce((sum, row) => sum + row.predictiveLogLikelihoodGain, 0);
const positiveFolds = loco.filter((row) => row.positiveDirection).length;

console.log('Identity-conditioned common-effect fit:', JSON.stringify({
  opportunities: 12901,
  totalRepeats: 86,
  selectedRepeats: observedSelected,
  commonOddsRatio: commonTheta,
  exactIdentityConditionedNullTail: identityConditionedNullTail,
  selectedContributorRunes: selectedContributorCount,
  literalF: fControl
}));
console.log('Common-effect heterogeneity gate:', JSON.stringify({
  statistic: heterogeneityQ,
  conditionalBootstrapReplicates: BOOTSTRAPS,
  conditionalP: heterogeneityP,
  interpretation: 'conditioned on all per-rune repeat totals and grand selected-repeat total; common odds ratio cancels'
}));
console.log('Nine-chapter held-out prediction:', JSON.stringify({
  summedPredictiveLogLikelihoodGain: locoGain,
  positiveDirectionFolds: positiveFolds,
  folds: loco
}));
console.log('All rune strata:', JSON.stringify(runeRows));

assert.ok(commonTheta > 1.5);
assert.ok(identityConditionedNullTail < 0.01);
assert.ok(heterogeneityP > 0.01);
assert.ok(selectedContributorCount >= 15);
assert.ok(fControl.selectedRepeats <= 2);
assert.ok(locoGain > 0);
assert.ok(positiveFolds >= 7);
console.log('PASS: p50 repeat enrichment survives rune-identity conditioning and is not concentrated in literal F or a tiny rune subset; heterogeneity is not decisive at current event count.');
