'use strict';

/**
 * Director #1512 specificity controls for the p50 literal-leading-zero mask.
 *
 * Windows Node.js 22, CommonJS, standard library only.
 *
 * Frozen rule:
 * - the original 32x8 p50 mask is 1 iff a printed token begins with literal 0;
 * - every control stream starts that mask at phase 0 and repeats it every 256 runes;
 * - cross-page adjacent pairs are excluded;
 * - encrypted LP1 controls concatenate the nine original encrypted rune pages in
 *   physical order; clear LP1 controls concatenate the six original printed-clear
 *   GP pages in physical order;
 * - p56 uses its original ciphertext; p57 uses its original clear runes.
 * No phase, mask, source window, or page subset is optimized.
 */

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const fs = require('node:fs');
const path = require('node:path');

const MASK = Uint8Array.from(
  grid.pages.flatMap((page) => page.tokens),
  (token) => Number(token[0] === '0')
);
assert.equal(MASK.length, 256);
assert.equal(Array.from(MASK).reduce((sum, value) => sum + value, 0), 60);

const RUNES = new Set([
  'ᚠ','ᚢ','ᚦ','ᚩ','ᚱ','ᚳ','ᚷ','ᚹ','ᚻ','ᚾ',
  'ᛁ','ᛄ','ᛇ','ᛈ','ᛉ','ᛋ','ᛏ','ᛒ','ᛖ','ᛗ',
  'ᛚ','ᛝ','ᛟ','ᛞ','ᚪ','ᚫ','ᚣ','ᛡ','ᛠ'
]);

const lp1Text = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'),
  'utf8'
);
const lp1Pages = lp1Text
  .split('%')
  .map((part) => [...part].filter((character) => RUNES.has(character)))
  .filter((page) => page.length > 0);

assert.equal(lp1Pages.length, 15);
assert.deepEqual(
  lp1Pages.map((page) => page.length),
  [184,251,264,157,209,210,218,141,187,207,192,169,226,93,89]
);

const CLEAR_LP1 = new Set([3,8,9,10,11,14]);
const lp1ClearPages = lp1Pages.filter((_, index) => CLEAR_LP1.has(index));
const lp1CipherPages = lp1Pages.filter((_, index) => !CLEAR_LP1.has(index));
assert.deepEqual(lp1ClearPages.map((page) => page.length), [157,187,207,192,169,89]);
assert.equal(lp1ClearPages.reduce((sum, page) => sum + page.length, 0), 1001);
assert.equal(lp1CipherPages.reduce((sum, page) => sum + page.length, 0), 1796);

const pageMap = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const unknownPages = Array.from({length: 56}, (_, page) => pageMap.get(page))
  .filter((page) => page !== undefined);
assert.equal(unknownPages.length, 56);
assert.equal(unknownPages.reduce((sum, page) => sum + page.length, 0), 12956);
assert.equal(pageMap.get(56).length, 85);
assert.equal(pageMap.get(57).length, 95);

const UNKNOWN_CHAPTERS = [
  [0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]
];

/**
 * @typedef {{
 *   runes:number,
 *   totalOpportunities:number,
 *   selectedOpportunities:number,
 *   totalRepeats:number,
 *   selectedRepeats:number,
 *   outsideRepeats:number,
 *   rateRatio:number,
 *   excess:number
 * }} StreamStat
 */

/**
 * Assess a page-preserving stream under one circular mask shift.
 * @param {Array<Array<number|string>>} pages
 * @param {number} shift
 * @returns {StreamStat}
 */
function assess(pages, shift = 0) {
  let globalRune = 0;
  let totalOpportunities = 0;
  let selectedOpportunities = 0;
  let totalRepeats = 0;
  let selectedRepeats = 0;

  for (const page of pages) {
    for (let index = 0; index + 1 < page.length; index++) {
      const phase = (globalRune + index) & 255;
      const selected = MASK[(phase + shift) & 255] === 1;
      const repeated = page[index] === page[index + 1];
      totalOpportunities++;
      selectedOpportunities += Number(selected);
      totalRepeats += Number(repeated);
      selectedRepeats += Number(selected && repeated);
    }
    globalRune += page.length;
  }

  const outsideOpportunities = totalOpportunities - selectedOpportunities;
  const outsideRepeats = totalRepeats - selectedRepeats;
  const insideRate = selectedRepeats / selectedOpportunities;
  const outsideRate = outsideRepeats / outsideOpportunities;
  let rateRatio = 0;
  if (insideRate > 0 && outsideRate === 0) rateRatio = Infinity;
  else if (insideRate > 0) rateRatio = insideRate / outsideRate;

  return {
    runes: pages.reduce((sum, page) => sum + page.length, 0),
    totalOpportunities,
    selectedOpportunities,
    totalRepeats,
    selectedRepeats,
    outsideRepeats,
    rateRatio,
    excess: selectedRepeats -
      totalRepeats * selectedOpportunities / totalOpportunities
  };
}

/**
 * Count physical blocks whose selected-repeat rate exceeds local exposure.
 * @param {Array<Array<number|string>>} pages
 * @returns {{positive:number, informative:number, total:number}}
 */
function pageConsistency(pages) {
  let globalRune = 0;
  let positive = 0;
  let informative = 0;

  for (const page of pages) {
    let opportunities = 0;
    let selectedOpportunities = 0;
    let repeats = 0;
    let selectedRepeats = 0;
    for (let index = 0; index + 1 < page.length; index++) {
      const selected = MASK[(globalRune + index) & 255] === 1;
      const repeated = page[index] === page[index + 1];
      opportunities++;
      selectedOpportunities += Number(selected);
      repeats += Number(repeated);
      selectedRepeats += Number(selected && repeated);
    }
    if (repeats > 0) informative++;
    if (selectedRepeats * opportunities > repeats * selectedOpportunities) positive++;
    globalRune += page.length;
  }
  return {positive, informative, total: pages.length};
}

/**
 * Count unknown-LP2 visual chapters with positive exposure-adjusted direction.
 * @returns {number}
 */
function unknownChapterConsistency() {
  let globalRune = 0;
  let positive = 0;
  for (const [first, last] of UNKNOWN_CHAPTERS) {
    let opportunities = 0;
    let selectedOpportunities = 0;
    let repeats = 0;
    let selectedRepeats = 0;
    for (let pageNumber = first; pageNumber <= last; pageNumber++) {
      const page = pageMap.get(pageNumber);
      for (let index = 0; index + 1 < page.length; index++) {
        const selected = MASK[(globalRune + index) & 255] === 1;
        const repeated = page[index] === page[index + 1];
        opportunities++;
        selectedOpportunities += Number(selected);
        repeats += Number(repeated);
        selectedRepeats += Number(selected && repeated);
      }
      globalRune += page.length;
    }
    if (selectedRepeats * opportunities > repeats * selectedOpportunities) positive++;
  }
  return positive;
}

/**
 * Complete 256-shift matched null for the observed phase-zero rate ratio.
 * @param {Array<Array<number|string>>} pages
 * @returns {{observed:StreamStat, tail:number, tailFraction:number, medianFinite:number}}
 */
function circularNull(pages) {
  const observed = assess(pages, 0);
  const values = Array.from({length: 256}, (_, shift) => assess(pages, shift).rateRatio);
  const tail = values.filter((value) => {
    if (observed.rateRatio === Infinity) return value === Infinity;
    return value >= observed.rateRatio - 1e-15;
  }).length;
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  return {
    observed,
    tail,
    tailFraction: tail / 256,
    medianFinite: finite[Math.floor(finite.length / 2)]
  };
}

const controls = {
  unknownLP2: circularNull(unknownPages),
  encryptedLP1: circularNull(lp1CipherPages),
  clearLP1: circularNull(lp1ClearPages),
  p56Ciphertext: circularNull([pageMap.get(56)]),
  p57Cleartext: circularNull([pageMap.get(57)])
};

assert.deepEqual(
  {
    runes: controls.unknownLP2.observed.runes,
    opportunities: controls.unknownLP2.observed.totalOpportunities,
    selectedOpportunities: controls.unknownLP2.observed.selectedOpportunities,
    repeats: controls.unknownLP2.observed.totalRepeats,
    selectedRepeats: controls.unknownLP2.observed.selectedRepeats,
    tail: controls.unknownLP2.tail
  },
  {runes:12956, opportunities:12901, selectedOpportunities:3025, repeats:86, selectedRepeats:33, tail:1}
);
assert.ok(Math.abs(controls.unknownLP2.observed.rateRatio - 2.032795883361921) < 1e-15);
assert.equal(unknownChapterConsistency(), 9);

assert.deepEqual(
  {
    runes: controls.encryptedLP1.observed.runes,
    repeats: controls.encryptedLP1.observed.totalRepeats,
    selectedRepeats: controls.encryptedLP1.observed.selectedRepeats,
    tail: controls.encryptedLP1.tail
  },
  {runes:1796, repeats:44, selectedRepeats:9, tail:170}
);
assert.ok(Math.abs(controls.encryptedLP1.observed.rateRatio - 0.8421736158578265) < 1e-15);
assert.deepEqual(pageConsistency(lp1CipherPages), {positive:4, informative:9, total:9});

assert.deepEqual(
  {
    runes: controls.clearLP1.observed.runes,
    repeats: controls.clearLP1.observed.totalRepeats,
    selectedRepeats: controls.clearLP1.observed.selectedRepeats,
    tail: controls.clearLP1.tail
  },
  {runes:1001, repeats:28, selectedRepeats:3, tail:247}
);
assert.ok(Math.abs(controls.clearLP1.observed.rateRatio - 0.3902564102564102) < 1e-15);
assert.deepEqual(pageConsistency(lp1ClearPages), {positive:1, informative:6, total:6});

assert.deepEqual(
  {
    runes: controls.p56Ciphertext.observed.runes,
    repeats: controls.p56Ciphertext.observed.totalRepeats,
    selectedRepeats: controls.p56Ciphertext.observed.selectedRepeats,
    tail: controls.p56Ciphertext.tail
  },
  {runes:85, repeats:2, selectedRepeats:0, tail:256}
);
assert.deepEqual(
  {
    runes: controls.p57Cleartext.observed.runes,
    repeats: controls.p57Cleartext.observed.totalRepeats,
    selectedRepeats: controls.p57Cleartext.observed.selectedRepeats,
    tail: controls.p57Cleartext.tail
  },
  {runes:95, repeats:1, selectedRepeats:0, tail:256}
);

console.log(JSON.stringify({
  maskLeadingZeroCells: 60,
  unknownLP2: {
    ...controls.unknownLP2.observed,
    circularTail: controls.unknownLP2.tail,
    chapterPositive: unknownChapterConsistency(),
    chapterTotal: 9
  },
  encryptedLP1: {
    ...controls.encryptedLP1.observed,
    circularTail: controls.encryptedLP1.tail,
    pageConsistency: pageConsistency(lp1CipherPages)
  },
  clearLP1: {
    ...controls.clearLP1.observed,
    circularTail: controls.clearLP1.tail,
    pageConsistency: pageConsistency(lp1ClearPages)
  },
  p56Ciphertext: {
    ...controls.p56Ciphertext.observed,
    circularTail: controls.p56Ciphertext.tail
  },
  p57Cleartext: {
    ...controls.p57Cleartext.observed,
    circularTail: controls.p57Cleartext.tail
  }
}, null, 2));
