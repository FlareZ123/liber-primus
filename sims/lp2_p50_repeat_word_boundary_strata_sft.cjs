'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const leadingZero = tokens.map((token) => token[0] === '0');
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * Reproduce the canonical complete-word parser already used by repository
 * source-exact word tests.
 * @returns {number[][]}
 */
function canonicalWords() {
  const source = transcript.split('%').slice(0, 55).join('')
    .replace(/\/\s*/gu, '');
  const words = (source.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      assert.ok(runeToIndex.has(rune));
      return runeToIndex.get(rune);
    })
  );
  const original = pages.flatMap((page) => page.indices);
  assert.equal(words.length, 2896);
  assert.equal(words.flat().length, 12956);
  assert.deepEqual(words.flat(), original);
  return words;
}

/**
 * @typedef {{o:number,h:number}} PhaseCell
 * @typedef {{selO:number,selH:number,unsO:number,unsH:number}} Counts
 */

/**
 * Build fixed chapter × stratum × p50-phase inventories.
 * @param {number[][]} words
 * @returns {{within:PhaseCell[][],cross:PhaseCell[][]}}
 */
function buildInventory(words) {
  const wordEnds = new Set();
  let cursor = 0;
  for (const word of words) {
    cursor += word.length;
    wordEnds.add(cursor);
  }

  const inventory = {
    within: Array.from({ length: 9 }, () =>
      Array.from({ length: 256 }, () => ({ o: 0, h: 0 }))),
    cross: Array.from({ length: 9 }, () =>
      Array.from({ length: 256 }, () => ({ o: 0, h: 0 })))
  };

  let globalRune = 0;
  let opportunities = 0;
  for (const page of pages) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let i = 0; i + 1 < page.indices.length; i++) {
      const global = globalRune + i;
      const stratum = wordEnds.has(global + 1) ? 'cross' : 'within';
      const cell = inventory[stratum][chapter][global & 255];
      cell.o++;
      cell.h += Number(page.indices[i] === page.indices[i + 1]);
      opportunities++;
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(opportunities, 12901);
  return inventory;
}

const inventory = buildInventory(canonicalWords());

/**
 * @param {'within'|'cross'} stratum
 * @param {boolean[]} mask
 * @param {number[]|null} chapters
 * @returns {Counts}
 */
function counts(stratum, mask, chapters = null) {
  const selected = chapters || Array.from({ length: 9 }, (_, i) => i);
  const out = { selO: 0, selH: 0, unsO: 0, unsH: 0 };
  for (const chapter of selected) {
    for (let phase = 0; phase < 256; phase++) {
      const cell = inventory[stratum][chapter][phase];
      if (mask[phase]) {
        out.selO += cell.o;
        out.selH += cell.h;
      } else {
        out.unsO += cell.o;
        out.unsH += cell.h;
      }
    }
  }
  return out;
}

/** @param {Counts} c @returns {number} */
function rateRatio(c) {
  return (c.selH / c.selO) / (c.unsH / c.unsO);
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
 * Nine-chapter LOCO predictive score using #1508's Beta(1/2,1/2) smoothing.
 * @param {'within'|'cross'} stratum
 * @returns {{gain:number,positiveFolds:number,folds:number[]}}
 */
function loco(stratum) {
  const folds = [];
  let positiveFolds = 0;
  for (let holdout = 0; holdout < 9; holdout++) {
    const trainChapters = Array.from({ length: 9 }, (_, i) => i)
      .filter((i) => i !== holdout);
    const train = counts(stratum, leadingZero, trainChapters);
    const held = counts(stratum, leadingZero, [holdout]);

    const selectedP = (train.selH + 0.5) / (train.selO + 1);
    const unselectedP = (train.unsH + 0.5) / (train.unsO + 1);
    const nullP = (train.selH + train.unsH + 0.5) /
      (train.selO + train.unsO + 1);

    const model = logBernoulli(held.selH, held.selO, selectedP) +
      logBernoulli(held.unsH, held.unsO, unselectedP);
    const baseline = logBernoulli(
      held.selH + held.unsH,
      held.selO + held.unsO,
      nullP
    );
    folds.push(model - baseline);
    positiveFolds += Number(
      held.selH * held.unsO > held.unsH * held.selO
    );
  }
  return {
    gain: folds.reduce((a, b) => a + b, 0),
    positiveFolds,
    folds
  };
}

/**
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  k = Math.min(k, n - k);
  let value = 0;
  for (let i = 1; i <= k; i++) {
    value += Math.log(n - k + i) - Math.log(i);
  }
  return value;
}

/**
 * Hypergeometric PMF indexed by selected-hit count.
 * @param {number} population
 * @param {number} selected
 * @param {number} draws
 * @returns {number[]}
 */
function hypergeometric(population, selected, draws) {
  const lo = Math.max(0, draws - (population - selected));
  const hi = Math.min(draws, selected);
  const pmf = new Array(hi + 1).fill(0);
  const denominator = logChoose(population, draws);
  for (let k = lo; k <= hi; k++) {
    pmf[k] = Math.exp(
      logChoose(selected, k) +
      logChoose(population - selected, draws - k) -
      denominator
    );
  }
  const total = pmf.reduce((a, b) => a + b, 0);
  return pmf.map((p) => p / total);
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function convolve(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  }
  return out;
}

/**
 * Exact chapter-conditioned null: keep each chapter/stratum's opportunity
 * count, selected exposure, and repeat count fixed.
 * @param {'within'|'cross'} stratum
 * @returns {{observed:number,mean:number,sd:number,pGE:number,pdf:number[],totals:{selO:number,unsO:number,hits:number}}}
 */
function exactConditional(stratum) {
  let pdf = [1];
  let observed = 0;
  const totals = { selO: 0, unsO: 0, hits: 0 };

  for (let chapter = 0; chapter < 9; chapter++) {
    const c = counts(stratum, leadingZero, [chapter]);
    observed += c.selH;
    totals.selO += c.selO;
    totals.unsO += c.unsO;
    totals.hits += c.selH + c.unsH;
    pdf = convolve(
      pdf,
      hypergeometric(c.selO + c.unsO, c.selO, c.selH + c.unsH)
    );
  }

  const mean = pdf.reduce((sum, p, k) => sum + p * k, 0);
  const sd = Math.sqrt(
    pdf.reduce((sum, p, k) => sum + p * (k - mean) ** 2, 0)
  );
  const pGE = pdf.slice(observed).reduce((a, b) => a + b, 0);
  return { observed, mean, sd, pGE, pdf, totals };
}

/**
 * @param {number[]} permutation
 * @returns {boolean[]}
 */
function permutedColumns(permutation) {
  const mask = new Array(256).fill(false);
  for (let row = 0; row < 32; row++) {
    for (let column = 0; column < 8; column++) {
      mask[row * 8 + column] =
        leadingZero[row * 8 + permutation[column]];
    }
  }
  return mask;
}

/** @returns {number[][]} */
function allPermutations() {
  const out = [];
  const values = [0, 1, 2, 3, 4, 5, 6, 7];
  const visit = (left) => {
    if (left === values.length) {
      out.push(values.slice());
      return;
    }
    for (let i = left; i < values.length; i++) {
      [values[left], values[i]] = [values[i], values[left]];
      visit(left + 1);
      [values[left], values[i]] = [values[i], values[left]];
    }
  };
  visit(0);
  return out;
}

/** @param {Counts} c @returns {number} */
function smoothLogRateRatio(c) {
  return Math.log((c.selH + 0.5) / c.selO) -
    Math.log((c.unsH + 0.5) / c.unsO);
}

const within = counts('within', leadingZero);
const cross = counts('cross', leadingZero);
assert.deepEqual(within, { selO: 2349, selH: 23, unsO: 7679, unsH: 40 });
assert.deepEqual(cross, { selO: 676, selH: 10, unsO: 2197, unsH: 13 });
assert.equal(within.selO + within.unsO, 10028);
assert.equal(cross.selO + cross.unsO, 2873);
assert.equal(within.selH + within.unsH + cross.selH + cross.unsH, 86);

const withinLoco = loco('within');
const crossLoco = loco('cross');
assert.ok(Math.abs(rateRatio(within) - 1.879704129416773) < 1e-12);
assert.ok(Math.abs(rateRatio(cross) - 2.5) < 1e-12);
assert.ok(Math.abs(withinLoco.gain - 2.3619161178610737) < 1e-12);
assert.equal(withinLoco.positiveFolds, 8);
assert.ok(Math.abs(crossLoco.gain - 0.9627525127385939) < 1e-12);
assert.equal(crossLoco.positiveFolds, 6);

const withinNull = exactConditional('within');
const crossNull = exactConditional('cross');
assert.ok(Math.abs(withinNull.pGE - 0.013531153026382083) < 1e-12);
assert.ok(Math.abs(crossNull.pGE - 0.026983697136351802) < 1e-12);

const sourceInteraction =
  smoothLogRateRatio(within) - smoothLogRateRatio(cross);
let conditionalAbsInteraction = 0;
for (let kw = 0; kw < withinNull.pdf.length; kw++) {
  for (let kc = 0; kc < crossNull.pdf.length; kc++) {
    const probability = withinNull.pdf[kw] * crossNull.pdf[kc];
    if (!probability) continue;
    const w = {
      selO: withinNull.totals.selO,
      selH: kw,
      unsO: withinNull.totals.unsO,
      unsH: withinNull.totals.hits - kw
    };
    const c = {
      selO: crossNull.totals.selO,
      selH: kc,
      unsO: crossNull.totals.unsO,
      unsH: crossNull.totals.hits - kc
    };
    const interaction = smoothLogRateRatio(w) - smoothLogRateRatio(c);
    if (Math.abs(interaction) >= Math.abs(sourceInteraction) - 1e-12) {
      conditionalAbsInteraction += probability;
    }
  }
}
assert.ok(
  Math.abs(conditionalAbsInteraction - 0.6365149896079026) < 1e-12
);

const permutations = allPermutations();
assert.equal(permutations.length, 40320);
let pooledGE = 0;
let withinGE = 0;
let crossGE = 0;
let interactionAbsGE = 0;

for (const permutation of permutations) {
  const mask = permutedColumns(permutation);
  const w = counts('within', mask);
  const c = counts('cross', mask);
  pooledGE += Number(w.selH + c.selH >= within.selH + cross.selH);
  withinGE += Number(w.selH >= within.selH);
  crossGE += Number(c.selH >= cross.selH);
  const interaction = smoothLogRateRatio(w) - smoothLogRateRatio(c);
  interactionAbsGE += Number(
    Math.abs(interaction) >= Math.abs(sourceInteraction) - 1e-12
  );
}

assert.equal(pooledGE, 26); // reproduces #1500
assert.equal(withinGE, 155);
assert.equal(crossGE, 737);
assert.equal(interactionAbsGE, 22119);

console.log(JSON.stringify({
  source: {
    within: { ...within, rateRatio: rateRatio(within), loco: withinLoco },
    cross: { ...cross, rateRatio: rateRatio(cross), loco: crossLoco },
    smoothLogRateRatioInteraction: sourceInteraction
  },
  exactChapterStratumConditionalNull: {
    within: {
      observedSelectedHits: withinNull.observed,
      expectedSelectedHits: withinNull.mean,
      sd: withinNull.sd,
      upperTail: withinNull.pGE
    },
    cross: {
      observedSelectedHits: crossNull.observed,
      expectedSelectedHits: crossNull.mean,
      sd: crossNull.sd,
      upperTail: crossNull.pGE
    },
    interactionAbsTail: conditionalAbsInteraction
  },
  exactSharedColumnPermutations: {
    permutations: permutations.length,
    pooledHitTail: pooledGE,
    withinHitTail: withinGE,
    crossHitTail: crossGE,
    interactionAbsTail: interactionAbsGE
  },
  decision:
    'Low60 repeat enrichment crosses canonical word boundaries; prefer a continuous-state architecture over word-local/reset state.'
}, null, 2));
