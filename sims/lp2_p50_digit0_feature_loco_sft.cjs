'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const PAGES = corpus.pages.filter((page) => page.page <= 55);
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = BASE60.replace('f', '');

assert.equal(TOKENS.length, 256);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);

/**
 * @returns {{opportunities:Int32Array[], repeats:Int32Array[]}}
 */
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
      repeats[chapter][phase] += Number(page.indices[i] === page.indices[i + 1]);
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(
    opportunities.flatMap((x) => Array.from(x)).reduce((a, b) => a + b, 0),
    12901
  );
  assert.equal(
    repeats.flatMap((x) => Array.from(x)).reduce((a, b) => a + b, 0),
    86
  );
  return { opportunities, repeats };
}

const inventory = buildInventory();
const allChapters = Array.from({ length: 9 }, (_, index) => index);
const leadingZero = Uint8Array.from(TOKENS, (token) => Number(token[0] === '0'));
const exact00 = Uint8Array.from(TOKENS, (token) => Number(token === '00'));
const outsideLeadingZero = Uint8Array.from(leadingZero, (value) => 1 - value);

/**
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function tokenValue(token, alphabet) {
  const first = alphabet.indexOf(token[0]);
  const second = alphabet.indexOf(token[1]);
  assert.ok(first >= 0 && second >= 0);
  return first * alphabet.length + second;
}

/**
 * @param {string} alphabet
 * @param {number} count
 * @returns {Uint8Array}
 */
function lowValueMask(alphabet, count) {
  const ranked = TOKENS.map((token, index) => ({
    index,
    value: tokenValue(token, alphabet)
  })).sort((a, b) => a.value - b.value || a.index - b.index);

  const mask = new Uint8Array(256);
  for (const item of ranked.slice(0, count)) mask[item.index] = 1;
  return mask;
}

/**
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
function sameMask(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const low60Base60 = lowValueMask(BASE60, 60);
const low60Base59 = lowValueMask(BASE59, 60);
assert.equal(leadingZero.reduce((a, b) => a + b, 0), 60);
assert.equal(exact00.reduce((a, b) => a + b, 0), 2);
assert.equal(sameMask(leadingZero, low60Base60), true);
assert.equal(sameMask(leadingZero, low60Base59), true);

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

/**
 * @param {number[]} chapters
 * @param {Uint8Array} mask
 * @param {Uint8Array|null} universe
 * @returns {Counts}
 */
function countEvents(chapters, mask, universe = null) {
  let selectedOpportunities = 0;
  let selectedHits = 0;
  let unselectedOpportunities = 0;
  let unselectedHits = 0;
  let totalOpportunities = 0;
  let totalHits = 0;

  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase++) {
      if (universe && !universe[phase]) continue;
      const opportunities = inventory.opportunities[chapter][phase];
      const hits = inventory.repeats[chapter][phase];
      totalOpportunities += opportunities;
      totalHits += hits;
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
    totalOpportunities,
    totalHits
  };
}

/**
 * @param {number} hits
 * @param {number} opportunities
 * @param {number} probability
 * @returns {number}
 */
function logBernoulli(hits, opportunities, probability) {
  return hits * Math.log(probability) +
    (opportunities - hits) * Math.log1p(-probability);
}

/**
 * @param {Counts} train
 * @param {Counts} holdout
 * @returns {{gain:number, positive:boolean}}
 */
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

/**
 * @param {Uint8Array} mask
 * @param {Uint8Array|null} universe
 * @returns {{gain:number, positiveFolds:number, folds:number[]}}
 */
function evaluateFixed(mask, universe = null) {
  const folds = [];
  let positiveFolds = 0;

  for (let holdout = 0; holdout < 9; holdout++) {
    const trainChapters = allChapters.filter((chapter) => chapter !== holdout);
    const train = countEvents(trainChapters, mask, universe);
    const held = countEvents([holdout], mask, universe);
    const score = scoreFold(train, held);
    folds.push(score.gain);
    positiveFolds += Number(score.positive);
  }

  return {
    gain: folds.reduce((a, b) => a + b, 0),
    positiveFolds,
    folds
  };
}

/**
 * @param {number[]} trainChapters
 * @param {'row'|'column'} kind
 * @param {number} count
 * @param {Uint8Array|null} universe
 * @returns {Uint8Array}
 */
function learnedSpatialMask(trainChapters, kind, count, universe = null) {
  const unitCount = kind === 'row' ? 32 : 8;
  const ranked = [];

  for (let unit = 0; unit < unitCount; unit++) {
    let opportunities = 0;
    let hits = 0;
    for (const chapter of trainChapters) {
      for (let phase = 0; phase < 256; phase++) {
        if (universe && !universe[phase]) continue;
        const member = kind === 'row'
          ? Math.floor(phase / 8) === unit
          : phase % 8 === unit;
        if (!member) continue;
        opportunities += inventory.opportunities[chapter][phase];
        hits += inventory.repeats[chapter][phase];
      }
    }
    ranked.push({
      unit,
      rate: (hits + 0.5) / (opportunities + 1)
    });
  }

  ranked.sort((a, b) => b.rate - a.rate || a.unit - b.unit);
  const selected = new Set(ranked.slice(0, count).map((item) => item.unit));
  const mask = new Uint8Array(256);
  for (let phase = 0; phase < 256; phase++) {
    const unit = kind === 'row' ? Math.floor(phase / 8) : phase % 8;
    mask[phase] = Number(selected.has(unit));
  }
  return mask;
}

/**
 * @param {'row'|'column'} kind
 * @param {number} count
 * @param {Uint8Array|null} universe
 * @returns {{gain:number, positiveFolds:number}}
 */
function evaluateSpatial(kind, count, universe = null) {
  let gain = 0;
  let positiveFolds = 0;

  for (let holdout = 0; holdout < 9; holdout++) {
    const trainChapters = allChapters.filter((chapter) => chapter !== holdout);
    const mask = learnedSpatialMask(trainChapters, kind, count, universe);
    const train = countEvents(trainChapters, mask, universe);
    const held = countEvents([holdout], mask, universe);
    const score = scoreFold(train, held);
    gain += score.gain;
    positiveFolds += Number(score.positive);
  }
  return { gain, positiveFolds };
}

const source = countEvents(allChapters, leadingZero);
assert.deepEqual(source, {
  selectedOpportunities: 3025,
  selectedHits: 33,
  unselectedOpportunities: 9876,
  unselectedHits: 53,
  totalOpportunities: 12901,
  totalHits: 86
});

const leadingZeroLoco = evaluateFixed(leadingZero);
const exact00Loco = evaluateFixed(exact00);
const row64 = evaluateSpatial('row', 8);
const column64 = evaluateSpatial('column', 2);
const residualRows = evaluateSpatial('row', 8, outsideLeadingZero);
const residualColumns = evaluateSpatial('column', 2, outsideLeadingZero);

assert.ok(Math.abs(leadingZeroLoco.gain - 4.5848931753101105) < 1e-12);
assert.equal(leadingZeroLoco.positiveFolds, 9);
assert.ok(Math.abs(exact00Loco.gain - 4.225480438881011) < 1e-12);
assert.equal(exact00Loco.positiveFolds, 3);
assert.ok(Math.abs(row64.gain - (-5.299222632937447)) < 1e-12);
assert.equal(row64.positiveFolds, 7);
assert.ok(Math.abs(column64.gain - (-0.4185092589015085)) < 1e-12);
assert.equal(column64.positiveFolds, 6);
assert.ok(Math.abs(residualRows.gain - (-2.0530263511695086)) < 1e-12);
assert.equal(residualRows.positiveFolds, 8);
assert.ok(Math.abs(residualColumns.gain - (-0.9472047030132167)) < 1e-12);
assert.equal(residualColumns.positiveFolds, 8);

console.log(JSON.stringify({
  source,
  lowValueEquivalence: {
    base60: sameMask(leadingZero, low60Base60),
    base59: sameMask(leadingZero, low60Base59)
  },
  leadingZeroLoco,
  exact00Loco,
  row64,
  column64,
  outsideLeadingZero: {
    totalOpportunities: source.unselectedOpportunities,
    totalHits: source.unselectedHits,
    row64: residualRows,
    column64: residualColumns
  }
}, null, 2));
