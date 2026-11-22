'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const transcription = fs.readFileSync(
  path.join(__dirname, '../resources/lp2-transcription.txt'),
  'utf8'
);

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const tokens = grid.pages.flatMap((page) => page.tokens);
const low60 = Uint8Array.from(tokens, (token) => Number(token[0] === '0'));
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

assert.equal(tokens.length, 256);
assert.equal(low60.reduce((sum, value) => sum + value, 0), 60);

/**
 * Parse the canonical word stream with page carry. Physical line breaks and
 * page breaks do not terminate a word; hyphens and other punctuation do.
 * startRune is the zero-based global rune offset of the first rune in a word.
 */
function parseWords() {
  const pageSegments = transcription.split('%').slice(0, 55);
  const words = [];
  let current = [];
  let startPage = 0;
  let endPage = 0;
  let runeBearingPage = 0;
  let globalRune = 0;

  function finish() {
    if (current.length === 0) return;
    words.push({
      indices: current,
      startPage,
      endPage,
      startRune: globalRune
    });
    globalRune += current.length;
    current = [];
  }

  for (const ch of pageSegments.join('%')) {
    if (runeSet.has(ch)) {
      if (current.length === 0) startPage = runeBearingPage;
      current.push(runeIndex.get(ch));
      endPage = runeBearingPage;
    } else if (ch === '%') {
      runeBearingPage++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Layout only: retain a word across line/page wrapping.
    } else {
      finish();
    }
  }
  finish();

  assert.equal(words.length, 2896);
  assert.equal(globalRune, 12956);
  assert.equal(words.filter((word) => word.startPage !== word.endPage).length, 32);
  return words;
}

function physicalPage(runeBearingPage) {
  return runeBearingPage >= 50 ? runeBearingPage + 1 : runeBearingPage;
}

function chapterOf(page) {
  return CHAPTERS.findIndex(([first, last]) => first <= page && page <= last);
}

/**
 * Canonical event: within a complete printed word, compare C[j] with C[j-5].
 * The p50 clock is sampled at the event's first rune, global position j-5.
 */
function buildInventory(words) {
  const opportunities = Array.from({ length: 9 }, () => [0, 0]);
  const hits = Array.from({ length: 9 }, () => [0, 0]);
  let totalOpportunities = 0;
  let totalHits = 0;

  for (const word of words) {
    const chapter = chapterOf(physicalPage(word.startPage));
    assert.ok(chapter >= 0);

    for (let j = 5; j < word.indices.length; j++) {
      const firstRune = word.startRune + j - 5;
      const phase = firstRune & 255;
      const selected = low60[phase];
      const hit = Number(word.indices[j] === word.indices[j - 5]);
      opportunities[chapter][selected]++;
      hits[chapter][selected] += hit;
      totalOpportunities++;
      totalHits += hit;
    }
  }

  assert.equal(totalOpportunities, 2105);
  assert.equal(totalHits, 104);
  return { opportunities, hits, totalOpportunities, totalHits };
}

function logBernoulli(hits, opportunities, probability) {
  return hits * Math.log(probability) +
    (opportunities - hits) * Math.log1p(-probability);
}

function count(chapters, inventory) {
  let selectedOpportunities = 0;
  let selectedHits = 0;
  let otherOpportunities = 0;
  let otherHits = 0;

  for (const chapter of chapters) {
    selectedOpportunities += inventory.opportunities[chapter][1];
    selectedHits += inventory.hits[chapter][1];
    otherOpportunities += inventory.opportunities[chapter][0];
    otherHits += inventory.hits[chapter][0];
  }

  return {
    selectedOpportunities,
    selectedHits,
    otherOpportunities,
    otherHits,
    totalOpportunities: selectedOpportunities + otherOpportunities,
    totalHits: selectedHits + otherHits
  };
}

function scoreFold(train, holdout) {
  const selectedP =
    (train.selectedHits + 0.5) / (train.selectedOpportunities + 1);
  const otherP =
    (train.otherHits + 0.5) / (train.otherOpportunities + 1);
  const nullP = (train.totalHits + 0.5) / (train.totalOpportunities + 1);

  const model =
    logBernoulli(
      holdout.selectedHits,
      holdout.selectedOpportunities,
      selectedP
    ) +
    logBernoulli(
      holdout.otherHits,
      holdout.otherOpportunities,
      otherP
    );
  const baseline =
    logBernoulli(holdout.totalHits, holdout.totalOpportunities, nullP);

  return {
    gain: model - baseline,
    positive:
      holdout.selectedOpportunities > 0 &&
      holdout.otherOpportunities > 0 &&
      holdout.selectedHits * holdout.otherOpportunities >
        holdout.otherHits * holdout.selectedOpportunities
  };
}

function evaluateLoco(inventory) {
  const folds = [];
  let positiveFolds = 0;

  for (let holdout = 0; holdout < 9; holdout++) {
    const trainChapters = Array.from(
      { length: 9 },
      (_, index) => index
    ).filter((chapter) => chapter !== holdout);
    const train = count(trainChapters, inventory);
    const held = count([holdout], inventory);
    const score = scoreFold(train, held);
    folds.push({
      chapter: holdout + 1,
      pages: CHAPTERS[holdout],
      ...held,
      lowRate: held.selectedHits / held.selectedOpportunities,
      otherRate: held.otherHits / held.otherOpportunities,
      ...score
    });
    positiveFolds += Number(score.positive);
  }

  return {
    totalGain: folds.reduce((sum, fold) => sum + fold.gain, 0),
    positiveFolds,
    folds
  };
}

const words = parseWords();
const inventory = buildInventory(words);
const all = count(Array.from({ length: 9 }, (_, index) => index), inventory);
const lowRate = all.selectedHits / all.selectedOpportunities;
const otherRate = all.otherHits / all.otherOpportunities;
const loco = evaluateLoco(inventory);

const result = {
  definition: 'within-word C[j] === C[j-5], phase sampled at first rune (global startRune+j-5)',
  mask: 'p50 phase-zero literal leading digit 0; 60 of 256 cells',
  words: words.length,
  runes: words.reduce((sum, word) => sum + word.indices.length, 0),
  crossPageWords: words.filter((word) => word.startPage !== word.endPage).length,
  total: all,
  selectedRate: lowRate,
  otherRate,
  relativeRisk: lowRate / otherRate,
  oddsRatio:
    (all.selectedHits / (all.selectedOpportunities - all.selectedHits)) /
    (all.otherHits / (all.otherOpportunities - all.otherHits)),
  loco
};

assert.equal(all.selectedOpportunities, 482);
assert.equal(all.selectedHits, 27);
assert.equal(all.otherOpportunities, 1623);
assert.equal(all.otherHits, 77);
assert.ok(Math.abs(result.relativeRisk - 1.1807134773939754) < 1e-12);
assert.ok(Math.abs(loco.totalGain - (-1.4691176913640422)) < 1e-12);
assert.equal(loco.positiveFolds, 6);

console.log(JSON.stringify(result, null, 2));
