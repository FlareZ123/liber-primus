'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59 = A60.replace('f', '');
const TRIALS = 20000;
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const CELLS = Array.from({ length: 256 }, (_, i) => i)
  .filter((i) => TOKENS[i][0] === '0');
const SLOT = new Map(CELLS.map((cell, i) => [cell, i]));

assert.equal(CELLS.length, 60);

const opp = Array.from({ length: 9 }, () => new Int16Array(60));
const hit = Array.from({ length: 9 }, () => new Int8Array(60));

let globalRune = 0;
for (const page of corpus.pages.filter((page) => page.page <= 55)) {
  const chapter = CHAPTERS.findIndex(
    ([first, last]) => first <= page.page && page.page <= last
  );
  assert.ok(chapter >= 0);

  for (let i = 0; i + 1 < page.indices.length; i++) {
    const slot = SLOT.get((globalRune + i) & 255);
    if (slot === undefined) continue;
    opp[chapter][slot]++;
    hit[chapter][slot] += Number(page.indices[i] === page.indices[i + 1]);
  }
  globalRune += page.indices.length;
}
assert.equal(globalRune, 12956);

const totalChapter = Array.from({ length: 9 }, (_, chapter) => ({
  n: Array.from(opp[chapter]).reduce((a, b) => a + b, 0),
  h: Array.from(hit[chapter]).reduce((a, b) => a + b, 0)
}));
const totalAll = {
  n: totalChapter.reduce((sum, row) => sum + row.n, 0),
  h: totalChapter.reduce((sum, row) => sum + row.h, 0)
};
assert.deepEqual(totalAll, { n: 3025, h: 33 });

/** @param {number} h @param {number} n @param {number} p */
function logBernoulli(h, n, p) {
  return h * Math.log(p) + (n - h) * Math.log1p(-p);
}

/**
 * Nine-chapter leave-one-out gain over one common low60 rate.
 * @param {number[]} assignment binary group label per selected physical cell
 * @returns {{total:number,gains:number[],positive:number,counts:{n:number,h:number,rate:number}[]}}
 */
function score(assignment) {
  const n0 = new Array(9).fill(0);
  const h0 = new Array(9).fill(0);

  for (let cell = 0; cell < 60; cell++) {
    if (assignment[cell] !== 0) continue;
    for (let chapter = 0; chapter < 9; chapter++) {
      n0[chapter] += opp[chapter][cell];
      h0[chapter] += hit[chapter][cell];
    }
  }

  const allN0 = n0.reduce((a, b) => a + b, 0);
  const allH0 = h0.reduce((a, b) => a + b, 0);
  const gains = [];

  for (let hold = 0; hold < 9; hold++) {
    const trainN = totalAll.n - totalChapter[hold].n;
    const trainH = totalAll.h - totalChapter[hold].h;
    const trainN0 = allN0 - n0[hold];
    const trainH0 = allH0 - h0[hold];
    const trainN1 = trainN - trainN0;
    const trainH1 = trainH - trainH0;

    const p0 = (trainH0 + 0.5) / (trainN0 + 1);
    const p1 = (trainH1 + 0.5) / (trainN1 + 1);
    const pAll = (trainH + 0.5) / (trainN + 1);

    const heldH0 = h0[hold];
    const heldN0 = n0[hold];
    const heldH1 = totalChapter[hold].h - heldH0;
    const heldN1 = totalChapter[hold].n - heldN0;

    gains.push(
      logBernoulli(heldH0, heldN0, p0) +
      logBernoulli(heldH1, heldN1, p1) -
      logBernoulli(totalChapter[hold].h, totalChapter[hold].n, pAll)
    );
  }

  const counts = [
    { n: allN0, h: allH0 },
    { n: totalAll.n - allN0, h: totalAll.h - allH0 }
  ];
  counts.forEach((row) => { row.rate = row.h / row.n; });

  return {
    total: gains.reduce((a, b) => a + b, 0),
    gains,
    positive: gains.filter((gain) => gain > 0).length,
    counts
  };
}

/**
 * @param {string} alphabet
 * @param {number} bit
 * @returns {number[]}
 */
function bitAssignment(alphabet, bit) {
  return CELLS.map((cell) =>
    (alphabet.indexOf(TOKENS[cell][1]) >> bit) & 1
  );
}

const FEATURES = [];
for (let bit = 0; bit < 6; bit++) {
  FEATURES.push({
    name: `base60_bit${bit}`,
    assignment: bitAssignment(A60, bit)
  });
}
for (let bit = 0; bit < 6; bit++) {
  FEATURES.push({
    name: `dropF59_bit${bit}`,
    assignment: bitAssignment(A59, bit)
  });
}

const actual = FEATURES.map((feature) => ({
  name: feature.name,
  ...score(feature.assignment)
}));
const actualMax = Math.max(...actual.map((row) => row.total));

assert.ok(Math.abs(
  actual.find((row) => row.name === 'base60_bit0').total -
  5.498022656107402
) < 1e-12);
assert.ok(Math.abs(
  actual.find((row) => row.name === 'dropF59_bit0').total -
  2.1935964834408503
) < 1e-12);
assert.deepEqual(
  actual.find((row) => row.name === 'base60_bit0').counts
    .map(({ n, h }) => [n, h]),
  [[1809, 29], [1216, 4]]
);
assert.deepEqual(
  actual.find((row) => row.name === 'dropF59_bit0').counts
    .map(({ n, h }) => [n, h]),
  [[1510, 23], [1515, 10]]
);

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const random = xorshift32(0x33011313);
let ge = 0;
let sum = 0;
let sum2 = 0;
const maxima = new Array(TRIALS);

for (let trial = 0; trial < TRIALS; trial++) {
  const permutation = Array.from({ length: 60 }, (_, i) => i);
  for (let i = 59; i > 0; i--) {
    const j = random() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }

  let maxGain = -Infinity;
  for (const feature of FEATURES) {
    const permuted = permutation.map((source) => feature.assignment[source]);
    maxGain = Math.max(maxGain, score(permuted).total);
  }

  maxima[trial] = maxGain;
  sum += maxGain;
  sum2 += maxGain * maxGain;
  if (maxGain >= actualMax - 1e-12) ge++;
}

maxima.sort((a, b) => a - b);
const mean = sum / TRIALS;
const sd = Math.sqrt(sum2 / TRIALS - mean * mean);
const pFamilywise = (ge + 1) / (TRIALS + 1);

assert.equal(ge, 364);
assert.ok(Math.abs(pFamilywise - 0.018249087545622718) < 1e-15);

console.log(JSON.stringify({
  classification:
    'exploratory finite-family low60 second-character bit gate; no plaintext/key/opcode',
  actual,
  finiteFamilyNull: {
    trials: TRIALS,
    seed: '0x33011313',
    operation:
      'permute observed low60 token labels across the 60 fixed physical cells; take max over six bits under each of two documented alphabets',
    actualMax,
    exceedances: ge,
    pFamilywise,
    meanMax: mean,
    sdMax: sd,
    q95: maxima[Math.floor(0.95 * TRIALS)],
    q99: maxima[Math.floor(0.99 * TRIALS)]
  }
}, null, 2));
