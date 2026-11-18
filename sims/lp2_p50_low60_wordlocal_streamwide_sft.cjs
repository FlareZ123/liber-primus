'use strict';

/**
 * Director #1530: word-local versus stream-wide p50 low-60 repeat signal.
 *
 * Frozen definitions:
 * - canonical unknown LP2 p0-p55 complete-word parser;
 * - layout markers %, / and whitespace do not terminate a carried word;
 * - punctuation/hyphen terminates a word;
 * - adjacent pairs never cross a physical page boundary;
 * - phase-zero 256-cell mask is 1 iff the p50 printed token begins with 0,
 *   equivalently raw base60 byte < 60;
 * - pair strata are within the same complete word versus across complete-word
 *   boundaries while still inside the same physical page.
 *
 * The matched source-preserving null is the exact 8! shared-column
 * permutation family from Director #1500. Source event sites, chapter
 * membership, word stratum, row order and every p50 row sum stay fixed.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const sourceMask = Uint8Array.from(
  tokens, (token) => Number(token[0] === '0')
);

assert.equal(tokens.length, 256);
assert.equal(Array.from(sourceMask).reduce((sum, value) => sum + value, 0), 60);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);

/**
 * Canonical complete-word membership for each unknown rune.
 * @returns {number[]}
 */
function buildWordIds() {
  const runeSet = new Set(corpus.runes);
  const prefix = source.split('%').slice(0, 55).join('%');
  const ids = [];
  let word = 0;
  let inWord = false;

  for (const character of prefix) {
    if (runeSet.has(character)) {
      ids.push(word);
      inWord = true;
    } else if (
      character === '%' || character === '/' || /\s/u.test(character)
    ) {
      // Physical layout only. A word may carry across these markers.
    } else if (inWord) {
      word++;
      inWord = false;
    }
  }

  assert.equal(ids.length, 12956);
  assert.equal(new Set(ids).size, 2896);
  return ids;
}

const wordIds = buildWordIds();

/**
 * @typedef {'within'|'cross'} Stratum
 */

/**
 * @typedef {{
 *   opportunities:Int32Array[],
 *   repeats:Int32Array[],
 *   totalOpportunities:Int32Array,
 *   totalRepeats:Int32Array
 * }} Inventory
 */

/**
 * @returns {{within:Inventory,cross:Inventory}}
 */
function buildInventories() {
  function empty() {
    return {
      opportunities: Array.from({length: 9}, () => new Int32Array(256)),
      repeats: Array.from({length: 9}, () => new Int32Array(256)),
      totalOpportunities: new Int32Array(9),
      totalRepeats: new Int32Array(9)
    };
  }

  const inventories = {within: empty(), cross: empty()};
  let globalRune = 0;

  for (const page of pages) {
    const chapter = chapters.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let local = 0; local + 1 < page.indices.length; local++) {
      const global = globalRune + local;
      const stratum = wordIds[global] === wordIds[global + 1]
        ? 'within'
        : 'cross';
      const phase = global & 255;
      const hit = Number(page.indices[local] === page.indices[local + 1]);
      inventories[stratum].opportunities[chapter][phase]++;
      inventories[stratum].repeats[chapter][phase] += hit;
      inventories[stratum].totalOpportunities[chapter]++;
      inventories[stratum].totalRepeats[chapter] += hit;
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  assert.equal(
    Array.from(inventories.within.totalOpportunities)
      .reduce((sum, value) => sum + value, 0),
    10028
  );
  assert.equal(
    Array.from(inventories.cross.totalOpportunities)
      .reduce((sum, value) => sum + value, 0),
    2873
  );
  assert.equal(
    Array.from(inventories.within.totalRepeats)
      .reduce((sum, value) => sum + value, 0),
    63
  );
  assert.equal(
    Array.from(inventories.cross.totalRepeats)
      .reduce((sum, value) => sum + value, 0),
    23
  );
  return inventories;
}

const inventory = buildInventories();

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
 * @param {Stratum} stratum
 * @param {Uint8Array} mask
 * @param {number[]} chapterList
 * @returns {Counts}
 */
function countEvents(stratum, mask, chapterList) {
  let selectedOpportunities = 0;
  let selectedHits = 0;
  let unselectedOpportunities = 0;
  let unselectedHits = 0;

  for (const chapter of chapterList) {
    for (let phase = 0; phase < 256; phase++) {
      const opportunities = inventory[stratum].opportunities[chapter][phase];
      const hits = inventory[stratum].repeats[chapter][phase];
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

/**
 * @param {number} hits
 * @param {number} opportunities
 * @param {number} probability
 */
function logBernoulli(hits, opportunities, probability) {
  return hits * Math.log(probability) +
    (opportunities - hits) * Math.log1p(-probability);
}

/**
 * @param {Counts} train
 * @param {Counts} held
 */
function scoreFold(train, held) {
  const selectedP =
    (train.selectedHits + 0.5) / (train.selectedOpportunities + 1);
  const unselectedP =
    (train.unselectedHits + 0.5) / (train.unselectedOpportunities + 1);
  const nullP = (train.totalHits + 0.5) / (train.totalOpportunities + 1);

  const model =
    logBernoulli(held.selectedHits, held.selectedOpportunities, selectedP) +
    logBernoulli(
      held.unselectedHits, held.unselectedOpportunities, unselectedP
    );
  const baseline =
    logBernoulli(held.totalHits, held.totalOpportunities, nullP);

  return {
    gain: model - baseline,
    positive:
      held.selectedHits * held.unselectedOpportunities >
      held.unselectedHits * held.selectedOpportunities
  };
}

/**
 * @param {Stratum} stratum
 * @param {Uint8Array} mask
 */
function leaveOneChapterOut(stratum, mask) {
  const folds = [];
  let positiveFolds = 0;
  for (let holdout = 0; holdout < 9; holdout++) {
    const train = Array.from({length: 9}, (_, index) => index)
      .filter((chapter) => chapter !== holdout);
    const score = scoreFold(
      countEvents(stratum, mask, train),
      countEvents(stratum, mask, [holdout])
    );
    folds.push(score.gain);
    positiveFolds += Number(score.positive);
  }
  return {
    gain: folds.reduce((sum, value) => sum + value, 0),
    positiveFolds,
    folds
  };
}

/**
 * @param {Counts} counts
 */
function rateRatio(counts) {
  return (
    (counts.selectedHits / counts.selectedOpportunities) /
    (counts.unselectedHits / counts.unselectedOpportunities)
  );
}

/**
 * Haldane-smoothed log odds for the interaction diagnostic.
 * @param {Counts} counts
 */
function smoothedLogOdds(counts) {
  return Math.log(
    ((counts.selectedHits + 0.5) /
      (counts.selectedOpportunities - counts.selectedHits + 0.5)) /
    ((counts.unselectedHits + 0.5) /
      (counts.unselectedOpportunities - counts.unselectedHits + 0.5))
  );
}

const allChapters = Array.from({length: 9}, (_, index) => index);
const sourceWithin = countEvents('within', sourceMask, allChapters);
const sourceCross = countEvents('cross', sourceMask, allChapters);
const sourceWithinLoco = leaveOneChapterOut('within', sourceMask);
const sourceCrossLoco = leaveOneChapterOut('cross', sourceMask);

assert.deepEqual(sourceWithin, {
  selectedOpportunities: 2349,
  selectedHits: 23,
  unselectedOpportunities: 7679,
  unselectedHits: 40,
  totalOpportunities: 10028,
  totalHits: 63
});
assert.deepEqual(sourceCross, {
  selectedOpportunities: 676,
  selectedHits: 10,
  unselectedOpportunities: 2197,
  unselectedHits: 13,
  totalOpportunities: 2873,
  totalHits: 23
});
assert.ok(Math.abs(rateRatio(sourceWithin) - 1.879704129416773) < 1e-15);
assert.ok(Math.abs(rateRatio(sourceCross) - 2.5) < 1e-15);
assert.ok(
  Math.abs(sourceWithinLoco.gain - 2.3619161178610737) < 1e-12
);
assert.equal(sourceWithinLoco.positiveFolds, 8);
assert.ok(
  Math.abs(sourceCrossLoco.gain - 0.9627525127385939) < 1e-12
);
assert.equal(sourceCrossLoco.positiveFolds, 6);

/**
 * Heap-style exact permutation generator.
 * @param {number[]} values
 * @param {number} index
 * @returns {Generator<number[]>}
 */
function* permutations(values, index = 0) {
  if (index === values.length) {
    yield values.slice();
    return;
  }
  for (let i = index; i < values.length; i++) {
    [values[index], values[i]] = [values[i], values[index]];
    yield* permutations(values, index + 1);
    [values[index], values[i]] = [values[i], values[index]];
  }
}

/**
 * Create the #1500 shared-column permutation mask.
 * @param {number[]} permutation
 */
function permutedMask(permutation) {
  const mask = new Uint8Array(256);
  for (let row = 0; row < 32; row++) {
    for (let column = 0; column < 8; column++) {
      mask[row * 8 + column] =
        sourceMask[row * 8 + permutation[column]];
    }
  }
  return mask;
}

const sourceInteraction = Math.abs(
  smoothedLogOdds(sourceWithin) - smoothedLogOdds(sourceCross)
);
let candidates = 0;
const tails = {
  withinRateRatio: 0,
  withinLocoGain: 0,
  withinBoth: 0,
  crossRateRatio: 0,
  crossLocoGain: 0,
  crossBoth: 0,
  bothSourceRateRatios: 0,
  interactionAtLeastSource: 0
};

for (const permutation of permutations([0,1,2,3,4,5,6,7])) {
  const mask = permutedMask(permutation);
  const within = countEvents('within', mask, allChapters);
  const cross = countEvents('cross', mask, allChapters);
  const withinRR = rateRatio(within);
  const crossRR = rateRatio(cross);
  const withinLoco = leaveOneChapterOut('within', mask);
  const crossLoco = leaveOneChapterOut('cross', mask);
  const interaction = Math.abs(
    smoothedLogOdds(within) - smoothedLogOdds(cross)
  );

  candidates++;
  tails.withinRateRatio += Number(
    withinRR >= rateRatio(sourceWithin) - 1e-15
  );
  tails.withinLocoGain += Number(
    withinLoco.gain >= sourceWithinLoco.gain - 1e-12
  );
  tails.withinBoth += Number(
    withinRR >= rateRatio(sourceWithin) - 1e-15 &&
    withinLoco.gain >= sourceWithinLoco.gain - 1e-12
  );
  tails.crossRateRatio += Number(
    crossRR >= rateRatio(sourceCross) - 1e-15
  );
  tails.crossLocoGain += Number(
    crossLoco.gain >= sourceCrossLoco.gain - 1e-12
  );
  tails.crossBoth += Number(
    crossRR >= rateRatio(sourceCross) - 1e-15 &&
    crossLoco.gain >= sourceCrossLoco.gain - 1e-12
  );
  tails.bothSourceRateRatios += Number(
    withinRR >= rateRatio(sourceWithin) - 1e-15 &&
    crossRR >= rateRatio(sourceCross) - 1e-15
  );
  tails.interactionAtLeastSource += Number(
    interaction >= sourceInteraction - 1e-12
  );
}

assert.equal(candidates, 40320);
assert.deepEqual(tails, {
  withinRateRatio: 143,
  withinLocoGain: 372,
  withinBoth: 60,
  crossRateRatio: 341,
  crossLocoGain: 988,
  crossBoth: 282,
  bothSourceRateRatios: 1,
  interactionAtLeastSource: 22010
});
assert.ok(
  Math.abs(sourceInteraction - 0.2911220697461354) < 1e-12
);

console.log(JSON.stringify({
  source: {
    within: {
      counts: sourceWithin,
      rateRatio: rateRatio(sourceWithin),
      leaveOneChapterOut: sourceWithinLoco
    },
    cross: {
      counts: sourceCross,
      rateRatio: rateRatio(sourceCross),
      leaveOneChapterOut: sourceCrossLoco
    },
    crossToWithinRateRatio:
      rateRatio(sourceCross) / rateRatio(sourceWithin),
    smoothedLogOddsInteraction: sourceInteraction
  },
  exactSharedColumnNull: {
    candidates,
    tails,
    interactionTailFraction:
      tails.interactionAtLeastSource / candidates
  },
  decision:
    'STREAM-WIDE: low60 enrichment transfers both within and across complete-word boundaries; the within/cross interaction is ordinary under the exact source-preserving null, so visible word resets are not supported.'
}, null, 2));
