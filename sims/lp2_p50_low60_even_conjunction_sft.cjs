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
const TRIALS = 10000;
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const LOW_CELLS = Array.from({ length: 256 }, (_, i) => i)
  .filter((i) => TOKENS[i][0] === '0');
const LOW_SLOT = new Map(LOW_CELLS.map((cell, i) => [cell, i]));

assert.equal(LOW_CELLS.length, 60);

const cellN = Array.from({ length: 9 }, () => new Int16Array(60));
const cellH = Array.from({ length: 9 }, () => new Int8Array(60));
const allN = new Array(9).fill(0);
const allH = new Array(9).fill(0);

let globalRune = 0;
for (const page of corpus.pages.filter((page) => page.page <= 55)) {
  const chapter = CHAPTERS.findIndex(
    ([first, last]) => first <= page.page && page.page <= last
  );
  assert.ok(chapter >= 0);

  for (let i = 0; i + 1 < page.indices.length; i++) {
    const phase = (globalRune + i) & 255;
    const repeat = Number(page.indices[i] === page.indices[i + 1]);
    allN[chapter]++;
    allH[chapter] += repeat;

    const lowSlot = LOW_SLOT.get(phase);
    if (lowSlot !== undefined) {
      cellN[chapter][lowSlot]++;
      cellH[chapter][lowSlot] += repeat;
    }
  }
  globalRune += page.indices.length;
}

assert.equal(globalRune, 12956);
assert.equal(allN.reduce((a, b) => a + b, 0), 12901);
assert.equal(allH.reduce((a, b) => a + b, 0), 86);

/** @param {number} h @param {number} n @param {number} p */
function logBernoulli(h, n, p) {
  return h * Math.log(p) + (n - h) * Math.log1p(-p);
}

/**
 * Score one binary selector against one common book-wide repeat rate.
 * @param {boolean[]} selected one value per low60 physical cell
 */
function scoreSelector(selected) {
  const selectedN = new Array(9).fill(0);
  const selectedH = new Array(9).fill(0);

  for (let cell = 0; cell < 60; cell++) {
    if (!selected[cell]) continue;
    for (let chapter = 0; chapter < 9; chapter++) {
      selectedN[chapter] += cellN[chapter][cell];
      selectedH[chapter] += cellH[chapter][cell];
    }
  }

  const totalN = allN.reduce((a, b) => a + b, 0);
  const totalH = allH.reduce((a, b) => a + b, 0);
  const allSelectedN = selectedN.reduce((a, b) => a + b, 0);
  const allSelectedH = selectedH.reduce((a, b) => a + b, 0);
  const gains = [];

  for (let hold = 0; hold < 9; hold++) {
    const trainN = totalN - allN[hold];
    const trainH = totalH - allH[hold];
    const trainSelectedN = allSelectedN - selectedN[hold];
    const trainSelectedH = allSelectedH - selectedH[hold];
    const trainOtherN = trainN - trainSelectedN;
    const trainOtherH = trainH - trainSelectedH;

    const pSelected = (trainSelectedH + 0.5) / (trainSelectedN + 1);
    const pOther = (trainOtherH + 0.5) / (trainOtherN + 1);
    const pAll = (trainH + 0.5) / (trainN + 1);

    const heldSelectedH = selectedH[hold];
    const heldSelectedN = selectedN[hold];
    const heldOtherH = allH[hold] - heldSelectedH;
    const heldOtherN = allN[hold] - heldSelectedN;

    gains.push(
      logBernoulli(heldSelectedH, heldSelectedN, pSelected) +
      logBernoulli(heldOtherH, heldOtherN, pOther) -
      logBernoulli(allH[hold], allN[hold], pAll)
    );
  }

  return {
    gain: gains.reduce((a, b) => a + b, 0),
    gains,
    positive: gains.filter((value) => value > 0).length,
    selectedN: allSelectedN,
    selectedH: allSelectedH,
    otherN: totalN - allSelectedN,
    otherH: totalH - allSelectedH
  };
}

/** @param {string} alphabet @param {number} bit */
function bitMask(alphabet, bit) {
  return LOW_CELLS.map((cell) =>
    (alphabet.indexOf(TOKENS[cell][1]) >> bit) & 1
  );
}

const masks = [];
for (const [name, alphabet] of [['base60', A60], ['dropF59', A59]]) {
  for (let bit = 0; bit < 6; bit++) {
    masks.push({ name: `${name}_bit${bit}`, values: bitMask(alphabet, bit) });
  }
}

const actual = [];
for (const mask of masks) {
  for (const state of [0, 1]) {
    actual.push({
      feature: `${mask.name}_state${state}`,
      ...scoreSelector(mask.values.map((value) => value === state))
    });
  }
}
actual.sort((a, b) => b.gain - a.gain);

assert.equal(actual[0].feature, 'base60_bit0_state0');
assert.ok(Math.abs(actual[0].gain - 10.374652185494462) < 1e-12);
assert.deepEqual(
  [actual[0].selectedN, actual[0].selectedH, actual[0].otherN, actual[0].otherH],
  [1809, 29, 11092, 57]
);
const dropF = actual.find((row) => row.feature === 'dropF59_bit0_state0');
assert.ok(dropF);
assert.ok(Math.abs(dropF.gain - 6.8332983348756215) < 1e-12);
assert.deepEqual(
  [dropF.selectedN, dropF.selectedH, dropF.otherN, dropF.otherH],
  [1510, 23, 11391, 63]
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

const random = xorshift32(0x33011314);
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
  for (const mask of masks) {
    for (const bitState of [0, 1]) {
      const selected = new Array(60);
      for (let cell = 0; cell < 60; cell++) {
        selected[cell] = mask.values[permutation[cell]] === bitState;
      }
      maximum = Math.max(maximum, scoreSelector(selected).gain);
    }
  }

  maxima[trial] = maximum;
  sum += maximum;
  sum2 += maximum * maximum;
  if (maximum >= actual[0].gain - 1e-12) exceedances++;
}

const sorted = Array.from(maxima).sort((a, b) => a - b);
const mean = sum / TRIALS;
const sd = Math.sqrt(sum2 / TRIALS - mean * mean);
const pFamilywise = (exceedances + 1) / (TRIALS + 1);

assert.equal(exceedances, 213);
assert.ok(Math.abs(pFamilywise - 0.021397860213978603) < 1e-15);

console.log(JSON.stringify({
  classification:
    'finite-family low60 bit-state conjunction calibration; no plaintext/key/opcode',
  actual,
  null: {
    trials: TRIALS,
    seed: '0x33011314',
    operation:
      'permute observed low60 token labels over fixed low60 cells; take max over 6 bits x 2 alphabets x 2 bit states',
    observedMaximum: actual[0].gain,
    exceedances,
    pFamilywise,
    meanMaximum: mean,
    sdMaximum: sd,
    q95: sorted[Math.floor(0.95 * TRIALS)],
    q99: sorted[Math.floor(0.99 * TRIALS)]
  }
}, null, 2));
