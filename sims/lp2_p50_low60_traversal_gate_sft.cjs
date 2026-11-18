'use strict';

/**
 * Director #1534: source-natural p50 traversal comparison.
 *
 * Frozen data and outcome:
 * - original p0-p55 within-page adjacent-rune opportunities;
 * - 86 adjacent-equal events;
 * - same 60 physical p50 leading-zero / low-value cells;
 * - phase zero only;
 * - same nine-chapter leave-one-out Bernoulli likelihood as #1508.
 *
 * Only the eight predeclared source-natural 32x8 table traversals vary.
 * Windows Node.js 22, CommonJS, standard library only.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const PAGES = corpus.pages.filter((page) => page.page <= 55);
const ROWS = 32;
const COLS = 8;

assert.equal(TOKENS.length, ROWS * COLS);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);

const physicalLow = Uint8Array.from(TOKENS, (token) => Number(token[0] === '0'));
assert.equal(physicalLow.reduce((a, b) => a + b, 0), 60);

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

    for (let local = 0; local + 1 < page.indices.length; local++) {
      const phase = (globalRune + local) & 255;
      opportunities[chapter][phase]++;
      repeats[chapter][phase] += Number(
        page.indices[local] === page.indices[local + 1]
      );
    }
    globalRune += page.indices.length;
  }

  const totalOpportunities = opportunities
    .flatMap((values) => Array.from(values))
    .reduce((a, b) => a + b, 0);
  const totalRepeats = repeats
    .flatMap((values) => Array.from(values))
    .reduce((a, b) => a + b, 0);
  assert.equal(globalRune, 12956);
  assert.equal(totalOpportunities, 12901);
  assert.equal(totalRepeats, 86);
  return { opportunities, repeats };
}

const inventory = buildInventory();
const allChapters = Array.from({ length: 9 }, (_, i) => i);

/**
 * A traversal is the ordered list of physical row-major cell indices visited
 * by clock phases 0..255.
 * @param {'row-ltr-top'|'row-rtl-top'|'row-ltr-bottom'|'row-rtl-bottom'|'col-ttb-left'|'col-btt-left'|'col-ttb-right'|'col-btt-right'} kind
 * @returns {number[]}
 */
function traversal(kind) {
  const order = [];
  if (kind.startsWith('row-')) {
    const rows = kind.endsWith('top')
      ? Array.from({ length: ROWS }, (_, r) => r)
      : Array.from({ length: ROWS }, (_, r) => ROWS - 1 - r);
    const rtl = kind.includes('rtl');
    for (const r of rows) {
      for (let j = 0; j < COLS; j++) {
        const c = rtl ? COLS - 1 - j : j;
        order.push(r * COLS + c);
      }
    }
  } else {
    const cols = kind.endsWith('left')
      ? Array.from({ length: COLS }, (_, c) => c)
      : Array.from({ length: COLS }, (_, c) => COLS - 1 - c);
    const btt = kind.includes('btt');
    for (const c of cols) {
      for (let j = 0; j < ROWS; j++) {
        const r = btt ? ROWS - 1 - j : j;
        order.push(r * COLS + c);
      }
    }
  }
  assert.equal(order.length, 256);
  assert.equal(new Set(order).size, 256);
  return order;
}

/** @param {number[]} order @returns {Uint8Array} */
function traversalMask(order) {
  return Uint8Array.from(order, (physicalIndex) => physicalLow[physicalIndex]);
}

/**
 * @typedef {{
 *   selectedOpportunities:number,
 *   selectedHits:number,
 *   unselectedOpportunities:number,
 *   unselectedHits:number,
 *   totalOpportunities:number,
 *   totalHits:number
 * }} Counts
 */

/** @param {number[]} chapters @param {Uint8Array} mask @returns {Counts} */
function countEvents(chapters, mask) {
  let selectedOpportunities = 0;
  let selectedHits = 0;
  let unselectedOpportunities = 0;
  let unselectedHits = 0;

  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      const opportunities = inventory.opportunities[chapter][phase];
      const hits = inventory.repeats[chapter][phase];
      if (mask[phase]) {
        selectedOpportunities += opportunities;
        selectedHits += hits;
      } else {
        unselectedOpportunities += opportunities;
        unselectedHits += hits;
      }
    }
  }
  return {
    selectedOpportunities,
    selectedHits,
    unselectedOpportunities,
    unselectedHits,
    totalOpportunities: selectedOpportunities + unselectedOpportunities,
    totalHits: selectedHits + unselectedHits
  };
}

/** @param {number} hits @param {number} opportunities @param {number} p */
function logBernoulli(hits, opportunities, p) {
  return hits * Math.log(p) + (opportunities - hits) * Math.log1p(-p);
}

/** @param {Counts} train @param {Counts} holdout */
function scoreFold(train, holdout) {
  const selectedP =
    (train.selectedHits + 0.5) / (train.selectedOpportunities + 1);
  const unselectedP =
    (train.unselectedHits + 0.5) / (train.unselectedOpportunities + 1);
  const nullP = (train.totalHits + 0.5) / (train.totalOpportunities + 1);

  const model =
    logBernoulli(holdout.selectedHits, holdout.selectedOpportunities, selectedP) +
    logBernoulli(holdout.unselectedHits, holdout.unselectedOpportunities, unselectedP);
  const baseline =
    logBernoulli(holdout.totalHits, holdout.totalOpportunities, nullP);

  return {
    gain: model - baseline,
    positive:
      holdout.selectedOpportunities > 0 &&
      holdout.unselectedOpportunities > 0 &&
      holdout.selectedHits * holdout.unselectedOpportunities >
        holdout.unselectedHits * holdout.selectedOpportunities
  };
}

/** @param {Uint8Array} mask */
function evaluate(mask) {
  const counts = countEvents(allChapters, mask);
  const selectedRate = counts.selectedHits / counts.selectedOpportunities;
  const unselectedRate = counts.unselectedHits / counts.unselectedOpportunities;
  const folds = [];
  let positiveFolds = 0;

  for (let holdout = 0; holdout < 9; holdout++) {
    const trainChapters = allChapters.filter((chapter) => chapter !== holdout);
    const score = scoreFold(
      countEvents(trainChapters, mask),
      countEvents([holdout], mask)
    );
    folds.push(score.gain);
    positiveFolds += Number(score.positive);
  }

  return {
    counts,
    selectedRate,
    unselectedRate,
    relativeRisk: selectedRate / unselectedRate,
    gain: folds.reduce((a, b) => a + b, 0),
    positiveFolds,
    folds
  };
}

const specs = [
  ['row-major LTR / top-bottom', 'row-ltr-top'],
  ['row-major RTL / top-bottom', 'row-rtl-top'],
  ['row-major LTR / bottom-top', 'row-ltr-bottom'],
  ['full row-major reversal', 'row-rtl-bottom'],
  ['column-major top-bottom / left-right', 'col-ttb-left'],
  ['column-major bottom-top / left-right', 'col-btt-left'],
  ['column-major top-bottom / right-left', 'col-ttb-right'],
  ['full column-major reversal', 'col-btt-right']
];

const results = specs.map(([name, kind]) => {
  const order = traversal(kind);
  const mask = traversalMask(order);
  assert.equal(mask.reduce((a, b) => a + b, 0), 60);
  return { name, kind, ...evaluate(mask) };
});

/* Exact #1508 reproduction for the canonical traversal. */
assert.deepEqual(results[0].counts, {
  selectedOpportunities: 3025,
  selectedHits: 33,
  unselectedOpportunities: 9876,
  unselectedHits: 53,
  totalOpportunities: 12901,
  totalHits: 86
});
assert.ok(Math.abs(results[0].gain - 4.5848931753101105) < 1e-12);
assert.equal(results[0].positiveFolds, 9);

const ranking = results
  .map((result, index) => ({ index, name: result.name, gain: result.gain }))
  .sort((a, b) => b.gain - a.gain || a.index - b.index);

console.log(JSON.stringify({
  source: {
    runes: 12956,
    withinPageAdjacentOpportunities: 12901,
    adjacentEqualEvents: 86,
    markedPhysicalCells: 60,
    phase: 0
  },
  results,
  ranking,
  decision: ranking[0].index === 0 && results[0].positiveFolds === 9
    ? 'canonical row-major is the strongest frozen traversal; compare its margin and rival fold transfer before treating order as uniquely selected'
    : 'canonical row-major is not uniquely strongest; downstream decoders must preserve traversal ambiguity'
}, null, 2));
