'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap(page => page.tokens);
const PAGES = corpus.pages.filter(page => page.page <= 55);
const mask = Uint8Array.from(TOKENS, token => Number(token[0] === '0'));

assert.equal(mask.reduce((a, b) => a + b, 0), 60);
assert.equal(PAGES.reduce((s, p) => s + p.indices.length, 0), 12956);

const MAX_N = 12901;
const logFact = new Float64Array(MAX_N + 1);
for (let i = 2; i <= MAX_N; i++) logFact[i] = logFact[i - 1] + Math.log(i);
const logChoose = (n, k) => {
  if (k < 0 || k > n) return -Infinity;
  return logFact[n] - logFact[k] - logFact[n - k];
};
const logSumExp = values => {
  const m = Math.max(...values);
  return m + Math.log(values.reduce((s, v) => s + Math.exp(v - m), 0));
};

/**
 * Count adjacent-pair opportunities and equal-pair hits by chapter, rune identity,
 * and the frozen global phase-zero p50 low-60 class.
 * @returns {Array<Array<{selectedOpp:number,selectedHits:number,outsideOpp:number,outsideHits:number}>>}
 */
function buildCounts() {
  const counts = Array.from({ length: 9 }, () =>
    Array.from({ length: 29 }, () => ({
      selectedOpp: 0, selectedHits: 0, outsideOpp: 0, outsideHits: 0
    })));
  let globalRune = 0;
  let opportunities = 0;
  let hits = 0;

  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(([a, b]) => a <= page.page && page.page <= b);
    assert.ok(chapter >= 0);
    for (let i = 0; i + 1 < page.indices.length; i++) {
      const rune = page.indices[i];
      const selected = mask[(globalRune + i) & 255] === 1;
      const repeat = page.indices[i] === page.indices[i + 1];
      const cell = counts[chapter][rune];
      if (selected) {
        cell.selectedOpp++;
        cell.selectedHits += Number(repeat);
      } else {
        cell.outsideOpp++;
        cell.outsideHits += Number(repeat);
      }
      opportunities++;
      hits += Number(repeat);
    }
    globalRune += page.indices.length;
  }
  assert.equal(globalRune, 12956);
  assert.equal(opportunities, 12901);
  assert.equal(hits, 86);
  return counts;
}

const chapterCounts = buildCounts();

/** @param {number[]} chapters */
function aggregate(chapters) {
  return Array.from({ length: 29 }, (_, rune) => {
    const out = { rune, selectedOpp: 0, selectedHits: 0, outsideOpp: 0, outsideHits: 0 };
    for (const chapter of chapters) {
      const c = chapterCounts[chapter][rune];
      out.selectedOpp += c.selectedOpp;
      out.selectedHits += c.selectedHits;
      out.outsideOpp += c.outsideOpp;
      out.outsideHits += c.outsideHits;
    }
    return out;
  });
}

const all = aggregate(Array.from({ length: 9 }, (_, i) => i));
assert.equal(all.reduce((s, c) => s + c.selectedOpp, 0), 3025);
assert.equal(all.reduce((s, c) => s + c.selectedHits, 0), 33);
assert.equal(all.reduce((s, c) => s + c.outsideOpp, 0), 9876);
assert.equal(all.reduce((s, c) => s + c.outsideHits, 0), 53);

/**
 * Conditional distribution of selected hits X given total hits h in a rune
 * stratum, selected/outside opportunities, and common odds theta=exp(logOdds).
 */
function conditionalDist(stratum, logOdds) {
  const n1 = stratum.selectedOpp;
  const n0 = stratum.outsideOpp;
  const h = stratum.selectedHits + stratum.outsideHits;
  const lo = Math.max(0, h - n0);
  const hi = Math.min(h, n1);
  const xs = [];
  const logs = [];
  for (let x = lo; x <= hi; x++) {
    xs.push(x);
    logs.push(logChoose(n1, x) + logChoose(n0, h - x) + x * logOdds);
  }
  const z = logSumExp(logs);
  return { xs, probs: logs.map(v => Math.exp(v - z)), logZ: z };
}

function conditionalLogLike(strata, logOdds) {
  let ll = 0;
  for (const s of strata) {
    const h = s.selectedHits + s.outsideHits;
    if (h === 0) continue;
    const d = conditionalDist(s, logOdds);
    const x = s.selectedHits;
    const idx = d.xs.indexOf(x);
    assert.ok(idx >= 0);
    ll += Math.log(d.probs[idx]);
  }
  return ll;
}

function mleLogOdds(strata) {
  let lo = -12;
  let hi = 12;
  for (let iter = 0; iter < 100; iter++) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    if (conditionalLogLike(strata, a) < conditionalLogLike(strata, b)) lo = a;
    else hi = b;
  }
  return (lo + hi) / 2;
}

function expectedSelected(stratum, logOdds) {
  const d = conditionalDist(stratum, logOdds);
  return d.xs.reduce((s, x, i) => s + x * d.probs[i], 0);
}

function pooledExactNull(strata) {
  let pmf = [1];
  let expected = 0;
  for (const s of strata) {
    const h = s.selectedHits + s.outsideHits;
    if (h === 0) continue;
    const d = conditionalDist(s, 0);
    expected += expectedSelected(s, 0);
    const next = new Array(pmf.length + d.xs.at(-1) + 1).fill(0);
    for (let total = 0; total < pmf.length; total++) {
      for (let i = 0; i < d.xs.length; i++) {
        next[total + d.xs[i]] += pmf[total] * d.probs[i];
      }
    }
    pmf = next;
  }
  const observed = strata.reduce((s, c) => s + c.selectedHits, 0);
  return {
    observed,
    expected,
    upperTail: pmf.slice(observed).reduce((a, b) => a + b, 0)
  };
}

// Frozen before results: "sufficiently exposed" means at least 50 selected
// opportunities, at least 150 outside opportunities, and at least two repeats.
const eligible = all.filter(c =>
  c.selectedOpp >= 50 &&
  c.outsideOpp >= 150 &&
  c.selectedHits + c.outsideHits >= 2
);

function heterogeneityLrt(strata) {
  const commonLogOdds = mleLogOdds(strata);
  const commonLL = conditionalLogLike(strata, commonLogOdds);
  let separateLL = 0;
  for (const s of strata) {
    const own = mleLogOdds([s]);
    separateLL += conditionalLogLike([s], own);
  }
  return {
    commonLogOdds,
    commonOdds: Math.exp(commonLogOdds),
    commonLL,
    separateLL,
    statistic: 2 * (separateLL - commonLL)
  };
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function sampleDist(dist, random) {
  const u = random() / 0x100000000;
  let acc = 0;
  for (let i = 0; i < dist.xs.length; i++) {
    acc += dist.probs[i];
    if (u <= acc || i === dist.xs.length - 1) return dist.xs[i];
  }
  throw new Error('unreachable');
}

const heterogeneity = heterogeneityLrt(eligible);
const random = xorshift32(0x33011535);
const BOOTSTRAPS = 2000;
let ge = 0;
for (let b = 0; b < BOOTSTRAPS; b++) {
  const simulated = eligible.map(s => {
    const h = s.selectedHits + s.outsideHits;
    const d = conditionalDist(s, heterogeneity.commonLogOdds);
    const x = sampleDist(d, random);
    return {
      ...s,
      selectedHits: x,
      outsideHits: h - x
    };
  });
  if (heterogeneityLrt(simulated).statistic >= heterogeneity.statistic - 1e-12) ge++;
}
heterogeneity.bootstrapTrials = BOOTSTRAPS;
heterogeneity.bootstrapP = (ge + 1) / (BOOTSTRAPS + 1);
heterogeneity.eligibleRunes = eligible.map(s => s.rune);

const perRune = all.map(c => {
  const selectedRate = c.selectedHits / c.selectedOpp;
  const outsideRate = c.outsideHits / c.outsideOpp;
  const oddsRatio =
    ((c.selectedHits + 0.5) * (c.outsideOpp - c.outsideHits + 0.5)) /
    ((c.outsideHits + 0.5) * (c.selectedOpp - c.selectedHits + 0.5));
  return {
    rune: c.rune,
    token: corpus.translit[c.rune],
    selectedOpp: c.selectedOpp,
    selectedHits: c.selectedHits,
    selectedRate,
    outsideOpp: c.outsideOpp,
    outsideHits: c.outsideHits,
    outsideRate,
    oddsRatio,
    positive: selectedRate > outsideRate,
    eligible: eligible.some(s => s.rune === c.rune)
  };
});

const eligibleRows = perRune.filter(r => r.eligible);
const positiveEligible = eligibleRows.filter(r => r.positive).length;
const rankedSelectedHits = [...perRune].sort((a, b) =>
  b.selectedHits - a.selectedHits || a.rune - b.rune);
const concentration = {
  top1SelectedHitShare: rankedSelectedHits[0].selectedHits / 33,
  top3SelectedHitShare:
    rankedSelectedHits.slice(0, 3).reduce((s, r) => s + r.selectedHits, 0) / 33,
  top3: rankedSelectedHits.slice(0, 3).map(r => ({
    rune: r.token, selectedHits: r.selectedHits, selectedOpp: r.selectedOpp,
    outsideHits: r.outsideHits, outsideOpp: r.outsideOpp
  }))
};

// F is predeclared because solved p56 has a literal-F exception.
const literalF = perRune[corpus.translit.indexOf('F')];
assert.equal(literalF.rune, 0);

/**
 * Rune-conditioned leave-one-chapter-out prediction: learn a common mask odds
 * from eight chapters, then score the ninth against theta=1 while conditioning
 * on each held-out rune's total repeats.
 */
const loco = [];
for (let holdout = 0; holdout < 9; holdout++) {
  const train = aggregate(Array.from({ length: 9 }, (_, i) => i).filter(i => i !== holdout));
  const held = aggregate([holdout]);
  const trainInformative = train.filter(s => s.selectedHits + s.outsideHits > 0);
  const heldInformative = held.filter(s => s.selectedHits + s.outsideHits > 0);
  const logOdds = mleLogOdds(trainInformative);
  const gain =
    conditionalLogLike(heldInformative, logOdds) -
    conditionalLogLike(heldInformative, 0);
  const observed = heldInformative.reduce((s, c) => s + c.selectedHits, 0);
  const nullExpected = heldInformative.reduce(
    (s, c) => s + expectedSelected(c, 0), 0);
  loco.push({
    holdout,
    pages: CHAPTERS[holdout],
    trainOdds: Math.exp(logOdds),
    heldSelectedHits: observed,
    heldNullExpected: nullExpected,
    positiveDirection: observed > nullExpected,
    logLikelihoodGain: gain
  });
}

const exactPooled = pooledExactNull(all);

assert.equal(exactPooled.observed, 33);
assert.equal(perRune.reduce((s, r) => s + r.selectedHits + r.outsideHits, 0), 86);

console.log(JSON.stringify({
  source: {
    runes: 12956,
    opportunities: 12901,
    repeats: 86,
    selectedCells: 60,
    selectedOpportunities: 3025,
    selectedRepeats: 33,
    outsideOpportunities: 9876,
    outsideRepeats: 53
  },
  exactRuneConditionedPooledNull: exactPooled,
  homogeneity: {
    eligibilityRule: 'selectedOpp>=50 && outsideOpp>=150 && totalRepeats>=2',
    eligibleCount: eligible.length,
    positiveEligible,
    ...heterogeneity
  },
  literalF,
  concentration,
  chapterHoldout: {
    positiveDirections: loco.filter(x => x.positiveDirection).length,
    totalLogLikelihoodGain: loco.reduce((s, x) => s + x.logLikelihoodGain, 0),
    folds: loco
  },
  perRune
}, null, 2));
