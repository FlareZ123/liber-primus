'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const PAGES = corpus.pages.filter((page) => page.page <= 55);
const RAW = TOKENS.map((token) =>
  BASE60.indexOf(token[0]) * 60 + BASE60.indexOf(token[1])
);
const FIRST_DIGIT = RAW.map((value) => Math.floor(value / 60));
const ALL_CHAPTERS = Array.from({ length: 9 }, (_, index) => index);

assert.equal(TOKENS.length, 256);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(Math.min(...RAW), 0);
assert.equal(Math.max(...RAW), 255);

/** @returns {{opportunities:Int32Array[], repeats:Int32Array[]}} */
function buildInventory() {
  const opportunities = Array.from({ length: 9 }, () => new Int32Array(256));
  const repeats = Array.from({ length: 9 }, () => new Int32Array(256));
  let globalRune = 0;

  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let i = 0; i + 1 < page.indices.length; i++) {
      const phase = (globalRune + i) & 255;
      opportunities[chapter][phase]++;
      repeats[chapter][phase] += Number(
        page.indices[i] === page.indices[i + 1]
      );
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(
    opportunities.flatMap((row) => Array.from(row)).reduce((a, b) => a + b, 0),
    12901
  );
  assert.equal(
    repeats.flatMap((row) => Array.from(row)).reduce((a, b) => a + b, 0),
    86
  );
  return { opportunities, repeats };
}

const inventory = buildInventory();

/** @param {number} hits @param {number} n @param {number} p */
function logBernoulli(hits, n, p) {
  return hits * Math.log(p) + (n - hits) * Math.log1p(-p);
}

/** @param {number[]} chapters */
function totalCounts(chapters) {
  let hits = 0;
  let opportunities = 0;
  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      hits += inventory.repeats[chapter][phase];
      opportunities += inventory.opportunities[chapter][phase];
    }
  }
  return { hits, opportunities };
}

/** @param {number[]} chapters */
function nullProbability(chapters) {
  const { hits, opportunities } = totalCounts(chapters);
  return (hits + 0.5) / (opportunities + 1);
}

/** @param {number[]} chapters @returns {number[]} */
function fitBinary(chapters) {
  const hits = [0, 0];
  const opportunities = [0, 0];
  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      const group = Number(RAW[phase] < 60);
      hits[group] += inventory.repeats[chapter][phase];
      opportunities[group] += inventory.opportunities[chapter][phase];
    }
  }
  return hits.map(
    (value, group) => (value + 0.5) / (opportunities[group] + 1)
  );
}

/** @param {number[]} chapters @returns {number[]} */
function fitCategorical(chapters) {
  const hits = new Array(5).fill(0);
  const opportunities = new Array(5).fill(0);
  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      const group = FIRST_DIGIT[phase];
      hits[group] += inventory.repeats[chapter][phase];
      opportunities[group] += inventory.opportunities[chapter][phase];
    }
  }
  return hits.map(
    (value, group) => (value + 0.5) / (opportunities[group] + 1)
  );
}

/**
 * Fixed scaling is only for conditioning. This is exactly one logistic term in B.
 * @param {number[]} chapters
 */
function fitLinearRaw(chapters) {
  const { hits, opportunities } = totalCounts(chapters);
  let alpha = Math.log((hits + 0.5) / (opportunities - hits + 0.5));
  let beta = 0;
  let iterations = 0;

  for (; iterations < 100; iterations++) {
    let g0 = 0;
    let g1 = 0;
    let h00 = 0;
    let h01 = 0;
    let h11 = 0;

    for (const chapter of chapters) {
      for (let phase = 0; phase < 256; phase++) {
        const n = inventory.opportunities[chapter][phase];
        if (n === 0) continue;
        const y = inventory.repeats[chapter][phase];
        const x = (RAW[phase] - 127.5) / 127.5;
        const z = alpha + beta * x;
        const ez = Math.exp(-Math.abs(z));
        const p = z >= 0 ? 1 / (1 + ez) : ez / (1 + ez);
        const w = n * p * (1 - p);
        g0 += y - n * p;
        g1 += (y - n * p) * x;
        h00 -= w;
        h01 -= w * x;
        h11 -= w * x * x;
      }
    }

    const determinant = h00 * h11 - h01 * h01;
    assert.ok(Number.isFinite(determinant) && determinant > 0);
    const stepAlpha = (h11 * g0 - h01 * g1) / determinant;
    const stepBeta = (-h01 * g0 + h00 * g1) / determinant;
    alpha -= stepAlpha;
    beta -= stepBeta;
    if (Math.max(Math.abs(stepAlpha), Math.abs(stepBeta)) < 1e-13) break;
  }

  let g0 = 0;
  let g1 = 0;
  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      const n = inventory.opportunities[chapter][phase];
      if (n === 0) continue;
      const y = inventory.repeats[chapter][phase];
      const x = (RAW[phase] - 127.5) / 127.5;
      const z = alpha + beta * x;
      const ez = Math.exp(-Math.abs(z));
      const p = z >= 0 ? 1 / (1 + ez) : ez / (1 + ez);
      g0 += y - n * p;
      g1 += (y - n * p) * x;
    }
  }
  return {
    alpha,
    beta,
    iterations: iterations + 1,
    maxGradient: Math.max(Math.abs(g0), Math.abs(g1))
  };
}

/**
 * @param {number} holdout
 * @param {number[]} train
 * @param {'binary'|'linear'|'categorical'} kind
 * @param {any} parameters
 */
function scoreFold(holdout, train, kind, parameters) {
  const baselineP = nullProbability(train);
  let modelLogLikelihood = 0;
  let baselineLogLikelihood = 0;

  for (let phase = 0; phase < 256; phase++) {
    const n = inventory.opportunities[holdout][phase];
    if (n === 0) continue;
    const y = inventory.repeats[holdout][phase];
    let p;

    if (kind === 'binary') {
      p = parameters[Number(RAW[phase] < 60)];
    } else if (kind === 'categorical') {
      p = parameters[FIRST_DIGIT[phase]];
    } else {
      const x = (RAW[phase] - 127.5) / 127.5;
      const z = parameters.alpha + parameters.beta * x;
      const ez = Math.exp(-Math.abs(z));
      p = z >= 0 ? 1 / (1 + ez) : ez / (1 + ez);
    }

    modelLogLikelihood += logBernoulli(y, n, p);
    baselineLogLikelihood += logBernoulli(y, n, baselineP);
  }
  return modelLogLikelihood - baselineLogLikelihood;
}

const models = {
  binary: { gains: [], fits: [] },
  linear: { gains: [], fits: [] },
  categorical: { gains: [], fits: [] }
};

for (let holdout = 0; holdout < 9; holdout++) {
  const train = ALL_CHAPTERS.filter((chapter) => chapter !== holdout);
  const binary = fitBinary(train);
  const linear = fitLinearRaw(train);
  const categorical = fitCategorical(train);

  models.binary.fits.push(binary);
  models.linear.fits.push(linear);
  models.categorical.fits.push(categorical);
  models.binary.gains.push(scoreFold(holdout, train, 'binary', binary));
  models.linear.gains.push(scoreFold(holdout, train, 'linear', linear));
  models.categorical.gains.push(
    scoreFold(holdout, train, 'categorical', categorical)
  );
  assert.ok(linear.maxGradient < 1e-9);
}

for (const model of Object.values(models)) {
  model.total = model.gains.reduce((sum, value) => sum + value, 0);
}

const fullLinear = fitLinearRaw(ALL_CHAPTERS);
const fullCategorical = fitCategorical(ALL_CHAPTERS);
const classCounts = Array.from({ length: 5 }, (_, group) => {
  let opportunities = 0;
  let hits = 0;
  for (let chapter = 0; chapter < 9; chapter++) {
    for (let phase = 0; phase < 256; phase++) {
      if (FIRST_DIGIT[phase] !== group) continue;
      opportunities += inventory.opportunities[chapter][phase];
      hits += inventory.repeats[chapter][phase];
    }
  }
  return { group, opportunities, hits, rate: hits / opportunities };
});

assert.ok(Math.abs(models.binary.total - 4.5848931753101105) < 1e-9);
assert.ok(Math.abs(models.linear.total - 1.2338102321627602) < 1e-9);
assert.ok(Math.abs(models.categorical.total - 2.504149347346189) < 1e-9);
assert.equal(
  models.binary.gains.filter((value, i) => value > models.linear.gains[i]).length,
  9
);
assert.equal(
  models.binary.gains.filter(
    (value, i) => value > models.categorical.gains[i]
  ).length,
  7
);
assert.equal(models.linear.fits.filter((fit) => fit.beta < 0).length, 9);
assert.ok(fullLinear.maxGradient < 1e-9);
assert.ok(Math.abs(fullLinear.beta - (-0.3639737851089303)) < 1e-9);
assert.deepEqual(
  classCounts.map(({ opportunities, hits }) => [opportunities, hits]),
  [[3025, 33], [2926, 12], [3270, 17], [2825, 19], [855, 5]]
);

console.log(JSON.stringify({
  classification: 'frozen source-feature semantic comparison; no plaintext/key',
  models,
  fullFit: {
    linear: fullLinear,
    categoricalProbabilities: fullCategorical,
    categoricalCounts: classCounts
  },
  headToHead: {
    binaryWinsVsLinearFolds: 9,
    binaryWinsVsCategoricalFolds: 7,
    jointHeldoutLikelihoodRatioBinaryVsLinear:
      Math.exp(models.binary.total - models.linear.total),
    jointHeldoutLikelihoodRatioBinaryVsCategorical:
      Math.exp(models.binary.total - models.categorical.total)
  }
}, null, 2));
