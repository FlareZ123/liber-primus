'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const MASK = Uint8Array.from(TOKENS, (token) => Number(token[0] === '0'));
const ALL_CHAPTERS = Array.from({length: 9}, (_, i) => i);

assert.equal(TOKENS.length, 256);
assert.equal(MASK.reduce((a, b) => a + b, 0), 60);

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @returns {{opportunities:Int32Array[],repeats:Int32Array[]}}
 */
function buildInventory(pages) {
  const opportunities = Array.from({length: 9}, () => new Int32Array(256));
  const repeats = Array.from({length: 9}, () => new Int32Array(256));
  let globalRune = 0;

  for (const page of pages) {
    const chapter = CHAPTERS.findIndex(([first, last]) =>
      first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);

    for (let i = 0; i + 1 < page.indices.length; i += 1) {
      const phase = (globalRune + i) & 255;
      opportunities[chapter][phase] += 1;
      repeats[chapter][phase] += Number(page.indices[i] === page.indices[i + 1]);
    }
    globalRune += page.indices.length;
  }

  assert.equal(globalRune, 12956);
  return {opportunities, repeats};
}

/**
 * @param {ReturnType<typeof buildInventory>} inventory
 * @param {number[]} chapters
 * @returns {{selectedOpportunities:number,selectedHits:number,unselectedOpportunities:number,unselectedHits:number,totalOpportunities:number,totalHits:number}}
 */
function countEvents(inventory, chapters) {
  let selectedOpportunities = 0;
  let selectedHits = 0;
  let unselectedOpportunities = 0;
  let unselectedHits = 0;
  let totalOpportunities = 0;
  let totalHits = 0;

  for (const chapter of chapters) {
    for (let phase = 0; phase < 256; phase += 1) {
      const opportunities = inventory.opportunities[chapter][phase];
      const hits = inventory.repeats[chapter][phase];
      totalOpportunities += opportunities;
      totalHits += hits;
      if (MASK[phase]) {
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
 * @param {ReturnType<typeof countEvents>} train
 * @param {ReturnType<typeof countEvents>} held
 * @returns {{gain:number,positive:boolean}}
 */
function scoreFold(train, held) {
  const selectedP =
    (train.selectedHits + 0.5) / (train.selectedOpportunities + 1);
  const unselectedP =
    (train.unselectedHits + 0.5) / (train.unselectedOpportunities + 1);
  const nullP =
    (train.totalHits + 0.5) / (train.totalOpportunities + 1);

  const model =
    logBernoulli(held.selectedHits, held.selectedOpportunities, selectedP) +
    logBernoulli(held.unselectedHits, held.unselectedOpportunities, unselectedP);
  const baseline =
    logBernoulli(held.totalHits, held.totalOpportunities, nullP);

  return {
    gain: model - baseline,
    positive:
      held.selectedOpportunities > 0 &&
      held.unselectedOpportunities > 0 &&
      held.selectedHits * held.unselectedOpportunities >
        held.unselectedHits * held.selectedOpportunities
  };
}

/**
 * @param {ReturnType<typeof buildInventory>} inventory
 * @returns {{gain:number,positiveFolds:number,folds:number[]}}
 */
function evaluate(inventory) {
  const folds = [];
  let positiveFolds = 0;

  for (let holdout = 0; holdout < 9; holdout += 1) {
    const train = countEvents(
      inventory,
      ALL_CHAPTERS.filter((chapter) => chapter !== holdout)
    );
    const held = countEvents(inventory, [holdout]);
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
 * @returns {Array<{page:number,indices:number[]}>}
 */
function canonicalPages() {
  return corpus.pages
    .filter((page) => page.page <= 55)
    .map((page) => ({page: page.page, indices: page.indices.slice()}));
}

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number} pageNumber
 * @param {number} offset
 * @param {number} replacement
 */
function replaceRune(pages, pageNumber, offset, replacement) {
  const page = pages.find((item) => item.page === pageNumber);
  assert.ok(page);
  assert.ok(offset >= 0 && offset < page.indices.length);
  page.indices[offset] = replacement;
}

/**
 * @param {string} name
 * @param {Array<{page:number,indices:number[]}>} pages
 * @returns {{name:string,counts:ReturnType<typeof countEvents>,loco:ReturnType<typeof evaluate>}}
 */
function summarize(name, pages) {
  const inventory = buildInventory(pages);
  return {
    name,
    counts: countEvents(inventory, ALL_CHAPTERS),
    loco: evaluate(inventory)
  };
}

const canonical = canonicalPages();
const canonicalResult = summarize('canonical original-image-adjudicated stream', canonical);

assert.deepEqual(canonicalResult.counts, {
  selectedOpportunities: 3025,
  selectedHits: 33,
  unselectedOpportunities: 9876,
  unselectedHits: 53,
  totalOpportunities: 12901,
  totalHits: 86
});
assert.ok(Math.abs(canonicalResult.loco.gain - 4.5848931753101105) < 1e-12);
assert.equal(canonicalResult.loco.positiveFolds, 9);

/*
 * The repository's source-image audits leave no unresolved alternate rune
 * identity among p0-p55. The following two variants are deliberately
 * source-rejected historical transcription controls, kept separate from the
 * formal admissible set:
 *
 * p24:172  AE -> A  (2016 idkfa historical error; original 41.jpg resolves AE)
 * p27:93   U  -> B  (external OCR error; original 44.jpg resolves U)
 */
const p24Old = canonicalPages();
replaceRune(p24Old, 24, 172, 24); // A
const p27Old = canonicalPages();
replaceRune(p27Old, 27, 93, 17); // B
const bothOld = canonicalPages();
replaceRune(bothOld, 24, 172, 24);
replaceRune(bothOld, 27, 93, 17);

const rejectedHistoricalControls = [
  summarize('source-rejected historical p24:172 A', p24Old),
  summarize('source-rejected historical p27:93 B', p27Old),
  summarize('both source-rejected historical alternatives', bothOld)
];

console.log(JSON.stringify({
  status: 'PASS',
  formalOriginalImageAdmissibleStreams: 1,
  sourceAuditBasis: {
    ordinaryBlack: 'full-source image audit: 12,956/12,956 positions assigned; no ordinary black correction indicated',
    red: 'red-rune image adjudication accounts for all 79 machine flags; no source-supported rune change',
    historicalAlternatives: [
      'p24:172 A is rejected by original 41.jpg; canonical AE',
      'p27:93 B is rejected by original 44.jpg; canonical U',
      'p57:80 E is rejected by original 74.jpg and lies outside p0-p55'
    ]
  },
  formalResult: canonicalResult,
  rejectedHistoricalControls,
  decision: 'the formal source-admissible family is singleton; the p50 low60 effect is therefore transcription-robust under the repository current original-image ambiguity catalog'
}, null, 2));
