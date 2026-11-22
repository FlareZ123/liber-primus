'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59 = A60.replace('f', '');
const TRIALS = 10000;
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const BOUNDS = [];
let offset = 0;
for (const page of grid.pages) {
  BOUNDS.push({ page: page.page, first: offset, last: offset + page.tokens.length - 1 });
  offset += page.tokens.length;
}
assert.equal(offset, 256);
assert.deepEqual(
  BOUNDS.map(({ page, first, last }) => [page, first, last]),
  [[49, 0, 79], [50, 80, 183], [51, 184, 255]]
);

function tablePage(phase) {
  return BOUNDS.find(({ first, last }) => first <= phase && phase <= last).page;
}

const lowCells = Array.from({ length: 256 }, (_, i) => i)
  .filter((i) => TOKENS[i][0] === '0');
const lowSlot = new Map(lowCells.map((cell, i) => [cell, i]));
const pageIndex = new Map(BOUNDS.map(({ page }, i) => [page, i]));
const opportunities = Array.from({ length: 3 }, () => new Int16Array(60));
const repeats = Array.from({ length: 3 }, () => new Int8Array(60));

let globalRune = 0;
for (const page of corpus.pages.filter((item) => item.page <= 55)) {
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const phase = (globalRune + i) & 255;
    const slot = lowSlot.get(phase);
    if (slot === undefined) continue;
    const sourcePage = pageIndex.get(tablePage(phase));
    opportunities[sourcePage][slot]++;
    repeats[sourcePage][slot] += Number(
      page.indices[i] === page.indices[i + 1]
    );
  }
  globalRune += page.indices.length;
}
assert.equal(globalRune, 12956);

/** @param {number} h @param {number} n @param {number} p */
function logBernoulli(h, n, p) {
  return h * Math.log(p) + (n - h) * Math.log1p(-p);
}

/** @param {number[]} values */
function score(values) {
  let total = 0;
  const gains = [];

  for (let hold = 0; hold < 3; hold++) {
    const trainH = [0, 0];
    const trainN = [0, 0];
    let allH = 0;
    let allN = 0;

    for (let sourcePage = 0; sourcePage < 3; sourcePage++) {
      if (sourcePage === hold) continue;
      for (let cell = 0; cell < 60; cell++) {
        const group = values[cell];
        trainH[group] += repeats[sourcePage][cell];
        trainN[group] += opportunities[sourcePage][cell];
        allH += repeats[sourcePage][cell];
        allN += opportunities[sourcePage][cell];
      }
    }

    const groupP = trainH.map(
      (h, group) => (h + 0.5) / (trainN[group] + 1)
    );
    const commonP = (allH + 0.5) / (allN + 1);
    let model = 0;
    let baseline = 0;

    for (let cell = 0; cell < 60; cell++) {
      const group = values[cell];
      const h = repeats[hold][cell];
      const n = opportunities[hold][cell];
      model += logBernoulli(h, n, groupP[group]);
      baseline += logBernoulli(h, n, commonP);
    }

    gains.push(model - baseline);
    total += model - baseline;
  }

  return { total, gains, positive: gains.filter((gain) => gain > 0).length };
}

/** @param {string} alphabet @param {number} bit */
function labels(alphabet, bit) {
  return lowCells.map((cell) =>
    (alphabet.indexOf(TOKENS[cell][1]) >> bit) & 1
  );
}

const features = [];
for (const [name, alphabet] of [['base60', A60], ['dropF59', A59]]) {
  for (let bit = 0; bit < 6; bit++) {
    features.push({ name: `${name}_bit${bit}`, values: labels(alphabet, bit) });
  }
}

const actual = features
  .map((feature) => ({ name: feature.name, ...score(feature.values) }))
  .sort((a, b) => b.total - a.total);

assert.equal(actual[0].name, 'base60_bit0');
assert.ok(Math.abs(actual[0].total - 4.14235468194066) < 1e-12);
assert.deepEqual(
  actual[0].gains.map((value) => Number(value.toFixed(12))),
  [-0.087661052828, 0.852979985707, 3.377035749062]
);
const dropFBit0 = actual.find((row) => row.name === 'dropF59_bit0');
assert.ok(dropFBit0);
assert.ok(Math.abs(dropFBit0.total - (-0.1087792163878234)) < 1e-12);

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const random = xorshift32(0x33011317);
const maxima = new Float64Array(TRIALS);
let exceedances = 0;
let sum = 0;
let sum2 = 0;

for (let trial = 0; trial < TRIALS; trial++) {
  const permutation = Array.from({ length: 60 }, (_, i) => i);
  for (let i = 59; i > 0; i--) {
    const j = random() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }

  let maximum = -Infinity;
  for (const feature of features) {
    const permuted = permutation.map((source) => feature.values[source]);
    maximum = Math.max(maximum, score(permuted).total);
  }

  maxima[trial] = maximum;
  sum += maximum;
  sum2 += maximum * maximum;
  if (maximum >= actual[0].total - 1e-12) exceedances++;
}

const sorted = Array.from(maxima).sort((a, b) => a - b);
const mean = sum / TRIALS;
const pFamilywise = (exceedances + 1) / (TRIALS + 1);

assert.equal(exceedances, 581);
assert.ok(Math.abs(pFamilywise - 0.058194180581941805) < 1e-15);

console.log(JSON.stringify({
  classification:
    'unseen printed-table-page transfer for low60 second-character bit semantics',
  actual,
  null: {
    trials: TRIALS,
    seed: '0x33011317',
    operation:
      'permute observed low60 token labels over fixed low60 cells; take max over 6 bits x 2 documented alphabets',
    observedMaximum: actual[0].total,
    exceedances,
    pFamilywise,
    meanMaximum: mean,
    sdMaximum: Math.sqrt(sum2 / TRIALS - mean * mean),
    q95: sorted[Math.floor(0.95 * TRIALS)],
    q99: sorted[Math.floor(0.99 * TRIALS)]
  }
}, null, 2));
