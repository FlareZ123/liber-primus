"use strict";

/**
 * SFT: strict page-balanced audit of the frozen p50 low60 repeat association.
 *
 * Run:
 *   node sims/lp2_p50_low60_page_balance_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const pages = corpus.pages.filter(page => page.page <= 55);
const leadingZero = table.pages.flatMap(page => page.tokens)
  .map(token => token[0] === "0");
assert.equal(leadingZero.length, 256);

function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  k = Math.min(k, n - k);
  let value = 0;
  for (let i = 1; i <= k; i++) {
    value += Math.log(n - k + i) - Math.log(i);
  }
  return value;
}

function correctedLogOdds(selectedHits, selectedOpps, totalHits, otherOpps) {
  const otherHits = totalHits - selectedHits;
  return Math.log(
    ((selectedHits + 0.5) * (otherOpps - otherHits + 0.5)) /
    ((selectedOpps - selectedHits + 0.5) * (otherHits + 0.5))
  );
}

function logBernoulli(hits, opportunities, probability) {
  return hits * Math.log(probability) +
    (opportunities - hits) * Math.log1p(-probability);
}

let globalRune = 0;
const rows = [];
for (const page of pages) {
  let selO = 0, selH = 0, unsO = 0, unsH = 0;
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const selected = leadingZero[(globalRune + i) & 255];
    const hit = page.indices[i] === page.indices[i + 1];
    if (selected) {
      selO++;
      selH += Number(hit);
    } else {
      unsO++;
      unsH += Number(hit);
    }
  }
  globalRune += page.indices.length;
  if (selO + unsO === 0) continue;

  const totalHits = selH + unsH;
  const observed = correctedLogOdds(selH, selO, totalHits, unsO);
  const lo = Math.max(0, totalHits - unsO);
  const hi = Math.min(totalHits, selO);
  const denominator = logChoose(selO + unsO, totalHits);
  let nullMean = 0;
  const nullValues = [];
  for (let k = lo; k <= hi; k++) {
    const probability = Math.exp(
      logChoose(selO, k) +
      logChoose(unsO, totalHits - k) -
      denominator
    );
    const value = correctedLogOdds(k, selO, totalHits, unsO);
    nullValues.push({probability, value});
    nullMean += probability * value;
  }
  const nullVariance = nullValues.reduce((sum, item) =>
    sum + item.probability * (item.value - nullMean) ** 2, 0);

  rows.push({
    page: page.page,
    runes: page.indices.length,
    selO, selH, unsO, unsH, totalHits,
    correctedLogOdds: observed,
    nullMean,
    nullVariance,
    centeredLogOdds: observed - nullMean,
    rateDifference: selH / selO - unsH / unsO,
  });
}

assert.equal(globalRune, 12956);
assert.equal(rows.length, 55);
const totals = rows.reduce((sum, row) => ({
  selO: sum.selO + row.selO,
  selH: sum.selH + row.selH,
  unsO: sum.unsO + row.unsO,
  unsH: sum.unsH + row.unsH,
}), {selO: 0, selH: 0, unsO: 0, unsH: 0});
assert.deepEqual(totals, {selO: 3025, selH: 33, unsO: 9876, unsH: 53});

const mean = field => rows.reduce((sum, row) => sum + row[field], 0) /
  rows.length;
const observedMean = mean("correctedLogOdds");
const nullMean = mean("nullMean");
const centeredMean = observedMean - nullMean;
const nullSdMean = Math.sqrt(rows.reduce((sum, row) =>
  sum + row.nullVariance, 0)) / rows.length;
const z = centeredMean / nullSdMean;
const meanRateDifference = mean("rateDifference");
const informative = rows.filter(row => row.totalHits > 0);
const positiveCentered = informative.filter(row => row.centeredLogOdds > 0).length;
const negativeCentered = informative.filter(row => row.centeredLogOdds < 0).length;

assert.ok(Math.abs(observedMean - 0.946725174151274) < 1e-12);
assert.ok(Math.abs(nullMean - 0.5767779607256872) < 1e-12);
assert.ok(Math.abs(centeredMean - 0.3699472134255868) < 1e-12);
assert.ok(Math.abs(Math.exp(centeredMean) - 1.4476581957293215) < 1e-12);
assert.ok(Math.abs(nullSdMean - 0.11241479707308456) < 1e-12);
assert.ok(Math.abs(z - 3.290912077927534) < 1e-12);
assert.ok(Math.abs(meanRateDifference - 0.0052595500834252485) < 1e-12);
assert.equal(informative.length, 42);
assert.equal(positiveCentered, 27);
assert.equal(negativeCentered, 15);

/*
 * Leave-page-out predictive transfer. Train the low/other rates on the other
 * 54 rune-bearing pages with Jeffreys smoothing, then score the held page
 * against a class-blind rate trained on those same pages.
 */
const folds = [];
for (const held of rows) {
  const train = rows.filter(row => row.page !== held.page)
    .reduce((sum, row) => ({
      selO: sum.selO + row.selO,
      selH: sum.selH + row.selH,
      unsO: sum.unsO + row.unsO,
      unsH: sum.unsH + row.unsH,
    }), {selO: 0, selH: 0, unsO: 0, unsH: 0});

  const selectedP = (train.selH + 0.5) / (train.selO + 1);
  const otherP = (train.unsH + 0.5) / (train.unsO + 1);
  const blindP = (train.selH + train.unsH + 0.5) /
    (train.selO + train.unsO + 1);

  const model = logBernoulli(held.selH, held.selO, selectedP) +
    logBernoulli(held.unsH, held.unsO, otherP);
  const baseline = logBernoulli(
    held.selH + held.unsH,
    held.selO + held.unsO,
    blindP
  );
  folds.push({
    page: held.page,
    gain: model - baseline,
    perOpportunityGain: (model - baseline) / (held.selO + held.unsO),
  });
}
const predictiveGain = folds.reduce((sum, fold) => sum + fold.gain, 0);
const positivePredictivePages = folds.filter(fold => fold.gain > 0).length;
const equalPagePerOpportunityGain = folds.reduce((sum, fold) =>
  sum + fold.perOpportunityGain, 0) / folds.length;

assert.ok(Math.abs(predictiveGain - 4.130712933743942) < 1e-12);
assert.equal(positivePredictivePages, 28);
assert.ok(Math.abs(equalPagePerOpportunityGain -
  0.00028022519285765166) < 1e-15);

/*
 * Robustness to single-page dominance. Recompute the unweighted centered
 * page mean after removing each page. The range must stay positive.
 */
const centeredTotal = rows.reduce((sum, row) => sum + row.centeredLogOdds, 0);
const leaveOnePageCenteredMeans = rows.map(row => ({
  page: row.page,
  mean: (centeredTotal - row.centeredLogOdds) / (rows.length - 1),
}));
const minLeaveOnePageMean = Math.min(...leaveOnePageCenteredMeans.map(x => x.mean));
const maxLeaveOnePageMean = Math.max(...leaveOnePageCenteredMeans.map(x => x.mean));
assert.ok(Math.abs(minLeaveOnePageMean - 0.33056218514761615) < 1e-12);
assert.ok(Math.abs(maxLeaveOnePageMean - 0.39496175116304794) < 1e-12);

const summary = {
  status: "frozen p50 low60 page-balance audit",
  runeBearingPages: rows.length,
  informativePages: informative.length,
  totals,
  equalPageEffect: {
    rawMeanCorrectedLogOdds: observedMean,
    exactConditionalNullMean: nullMean,
    nullCenteredMeanLogOdds: centeredMean,
    nullCenteredMultiplicativeOddsFactor: Math.exp(centeredMean),
    analyticConditionalNullSd: nullSdMean,
    analyticZ: z,
    meanUncorrectedRateDifference,
    informativePageSigns: {
      positive: positiveCentered,
      negative: negativeCentered,
    },
    leaveOnePageCenteredMeanRange: [
      minLeaveOnePageMean,
      maxLeaveOnePageMean,
    ],
  },
  leavePageOutPrediction: {
    totalGainNats: predictiveGain,
    positivePages: positivePredictivePages,
    pages: folds.length,
    equalPageMeanPerOpportunityGain,
  },
  decision:
    "The frozen low60 repeat association remains positive under strict " +
    "equal-page weighting and is not carried by one large page. Predictive " +
    "transfer is positive in aggregate but heterogeneous page by page.",
};
console.log(JSON.stringify(summary, null, 2));
