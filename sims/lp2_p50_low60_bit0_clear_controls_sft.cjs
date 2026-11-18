'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const solved = require('../resources/external/relikd-solved-gp29-native-v1.json');

const root = path.resolve(__dirname, '..');
const lp1 = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'),
  'utf8'
);

const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const SELECTED = TOKENS.map(
  (token) => token[0] === '0' && (A60.indexOf(token[1]) & 1) === 0
);
const RUNE_INDEX = new Map(corpus.runes.map((rune, index) => [rune, index]));
const CLEAR_LP1_PAGES = [3, 8, 9, 10, 11, 14];
const SOLVED_LP1_NAMES = [
  '0_warning',
  '0_welcome',
  '0_wisdom',
  '0_koan_1',
  '0_loss_of_divinity',
  'jpg107-167',
  'jpg229'
];
const TERMINAL_NAMES = ['p56_an_end', 'p57_parable'];

assert.equal(SELECTED.filter(Boolean).length, 36);

/**
 * @param {string} text
 * @returns {number[]}
 */
function runesFromText(text) {
  return Array.from(text)
    .map((glyph) => RUNE_INDEX.get(glyph))
    .filter((value) => value !== undefined);
}

/**
 * @param {number[]} runes
 * @returns {{length:number,selectedN:number,selectedH:number,otherN:number,otherH:number}}
 */
function blockStats(runes) {
  let selectedN = 0;
  let selectedH = 0;
  let otherN = 0;
  let otherH = 0;

  for (let i = 0; i + 1 < runes.length; i++) {
    const repeat = runes[i] === runes[i + 1];
    if (SELECTED[i & 255]) {
      selectedN++;
      if (repeat) selectedH++;
    } else {
      otherN++;
      if (repeat) otherH++;
    }
  }

  return { length: runes.length, selectedN, selectedH, otherN, otherH };
}

/**
 * @param {number} h
 * @param {number} n
 * @param {number} p
 * @returns {number}
 */
function logBernoulli(h, n, p) {
  return h * Math.log(p) + (n - h) * Math.log1p(-p);
}

/**
 * @param {Array<{selectedN:number,selectedH:number,otherN:number,otherH:number}>} blocks
 * @returns {{
 *   selectedN:number,selectedH:number,otherN:number,otherH:number,
 *   selectedRate:number,otherRate:number,ratio:number,gain:number,
 *   gains:number[],positive:number
 * }}
 */
function panel(blocks) {
  const total = blocks.reduce(
    (acc, block) => ({
      selectedN: acc.selectedN + block.selectedN,
      selectedH: acc.selectedH + block.selectedH,
      otherN: acc.otherN + block.otherN,
      otherH: acc.otherH + block.otherH
    }),
    { selectedN: 0, selectedH: 0, otherN: 0, otherH: 0 }
  );

  const gains = blocks.map((held) => {
    const trainSelectedN = total.selectedN - held.selectedN;
    const trainSelectedH = total.selectedH - held.selectedH;
    const trainOtherN = total.otherN - held.otherN;
    const trainOtherH = total.otherH - held.otherH;
    const trainN = trainSelectedN + trainOtherN;
    const trainH = trainSelectedH + trainOtherH;

    const pSelected = (trainSelectedH + 0.5) / (trainSelectedN + 1);
    const pOther = (trainOtherH + 0.5) / (trainOtherN + 1);
    const pAll = (trainH + 0.5) / (trainN + 1);

    return (
      logBernoulli(held.selectedH, held.selectedN, pSelected) +
      logBernoulli(held.otherH, held.otherN, pOther) -
      logBernoulli(
        held.selectedH + held.otherH,
        held.selectedN + held.otherN,
        pAll
      )
    );
  });

  const selectedRate = total.selectedH / total.selectedN;
  const otherRate = total.otherH / total.otherN;

  return {
    ...total,
    selectedRate,
    otherRate,
    ratio: selectedRate / otherRate,
    gain: gains.reduce((sum, gain) => sum + gain, 0),
    gains,
    positive: gains.filter((gain) => gain > 0).length
  };
}

/**
 * @param {number} seed
 * @returns {() => number}
 */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {number} length
 * @param {() => number} random
 * @returns {number[]}
 */
function syntheticBlock(length, random) {
  const runes = new Array(length);
  runes[0] = random() % 29;

  for (let i = 0; i + 1 < length; i++) {
    const repeatProbability = SELECTED[i & 255] ? 0.08 : 0.02;
    if (random() / 0x100000000 < repeatProbability) {
      runes[i + 1] = runes[i];
      continue;
    }

    let next = random() % 28;
    if (next >= runes[i]) next++;
    runes[i + 1] = next;
  }

  return runes;
}

const lp1Sections = lp1.split('%');
const primaryBlocks = CLEAR_LP1_PAGES.map((page) => ({
  name: `lp1_p${page}`,
  ...blockStats(runesFromText(lp1Sections[page] || ''))
}));
for (const name of TERMINAL_NAMES) {
  const record = solved.sections.find((section) => section.name === name);
  assert.ok(record);
  primaryBlocks.push({
    name,
    ...blockStats(runesFromText(record.source_text))
  });
}

const secondaryBlocks = SOLVED_LP1_NAMES.map((name) => {
  const record = solved.sections.find((section) => section.name === name);
  assert.ok(record);
  return { name, ...blockStats(runesFromText(record.source_text)) };
});

const primary = panel(primaryBlocks);
const secondary = panel(secondaryBlocks);

const random = xorshift32(0x33015016);
const syntheticBlocks = primaryBlocks.map((block) => ({
  name: block.name,
  ...blockStats(syntheticBlock(block.length, random))
}));
const synthetic = panel(syntheticBlocks);

const benchmark = {
  selectedN: 1809,
  selectedH: 29,
  otherN: 11092,
  otherH: 57,
  ratio: (29 / 1809) / (57 / 11092),
  gain: 10.374652185494462,
  positive: 7
};

assert.deepEqual(
  primaryBlocks.map((block) => [
    block.length,
    block.selectedN,
    block.selectedH,
    block.otherN,
    block.otherH
  ]),
  [
    [157, 19, 0, 137, 7],
    [187, 24, 1, 162, 6],
    [207, 26, 0, 180, 5],
    [192, 25, 1, 166, 2],
    [169, 21, 0, 147, 3],
    [89, 7, 0, 81, 3],
    [85, 6, 1, 78, 2],
    [95, 7, 0, 87, 1]
  ]
);
assert.deepEqual(
  [primary.selectedN, primary.selectedH, primary.otherN, primary.otherH],
  [135, 3, 1038, 29]
);
assert.ok(Math.abs(primary.ratio - 0.7954022988505747) < 1e-15);
assert.ok(Math.abs(primary.gain - (-0.8221778953872958)) < 1e-12);
assert.equal(primary.positive, 2);

assert.deepEqual(
  [secondary.selectedN, secondary.selectedH, secondary.otherN, secondary.otherH],
  [374, 10, 2418, 63]
);
assert.ok(Math.abs(secondary.ratio - 1.0262286732874968) < 1e-15);
assert.ok(Math.abs(secondary.gain - (-0.3707800031173285)) < 1e-12);
assert.equal(secondary.positive, 1);

assert.deepEqual(
  [synthetic.selectedN, synthetic.selectedH, synthetic.otherN, synthetic.otherH],
  [135, 9, 1038, 26]
);
assert.ok(Math.abs(synthetic.ratio - 2.6615384615384614) < 1e-15);
assert.ok(Math.abs(synthetic.gain - 2.4417465247044525) < 1e-12);
assert.equal(synthetic.positive, 6);

assert.ok(synthetic.ratio > 1);
assert.ok(synthetic.gain > 0);
assert.ok(primary.ratio < 2 || primary.gain < 5);
assert.ok(secondary.ratio < 2 || secondary.gain < 5);
assert.ok(benchmark.ratio > primary.ratio);
assert.ok(benchmark.ratio > secondary.ratio);
assert.ok(benchmark.gain > primary.gain);
assert.ok(benchmark.gain > secondary.gain);

console.log(JSON.stringify({
  classification:
    'predeclared fixed-state clear-GP specificity gate for p50 low60/base60-bit0 repeat selector',
  selector: {
    phase0: true,
    selectedCells: SELECTED
      .map((value, index) => (value ? index : -1))
      .filter((index) => index >= 0),
    count: SELECTED.filter(Boolean).length
  },
  primarySourceOriginalClearGP: {
    blocks: primaryBlocks,
    summary: primary
  },
  secondarySolvedLP1PlaintextRegisters: {
    blocks: secondaryBlocks,
    summary: secondary
  },
  syntheticPositive: {
    seed: '0x33015016',
    selectedRepeatProbability: 0.08,
    complementRepeatProbability: 0.02,
    blocks: syntheticBlocks,
    summary: synthetic
  },
  frozenUnknownLP2Benchmark: benchmark,
  decision:
    'clear GP controls do not reproduce the fixed repeat enrichment; unknown LP2 remains a strong outlier, strengthening the state as a cipher-surface clue while leaving its operation unresolved'
}, null, 2));
