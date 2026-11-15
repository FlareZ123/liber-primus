'use strict';

/**
 * Source-exact LP2 p50 first-digit / repeated-rune chapter stress test.
 * Retrospective stratification of a previously observed signal.
 *
 * Reads original-print-derived runes and numeral tokens directly from the
 * repository. No radix-60 assumption enters the primary first-character test.
 * Windows Node.js 22, CommonJS, standard library only.
 */

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const TOKENS = grid.pages.flatMap((p) => p.tokens);
const PAGES = corpus.pages.filter((p) => p.page <= 55);

assert.equal(TOKENS.length, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(PAGES.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.equal(PAGES.find((p) => p.page === 50).indices.length, 0);
assert.ok(TOKENS.every((s) => typeof s === 'string' && s.length === 2));
for (let j = 0; j < 256; j++) {
  // The diagnostic is invariant to the disputed 59/60 numeral radix.
  assert.equal(TOKENS[j][0] === '0', grid.bytes[j] < 60);
}

/**
 * @typedef {{opportunities:number,repeats:number}} PhaseBin
 * @typedef {PhaseBin[][]} Inventory
 */

/**
 * Count same-rune observations at the original global ordinal, retaining
 * original physical-page boundaries and nine independent visual chapters.
 * @param {number} lag
 * @returns {Inventory}
 */
function inventory(lag) {
  /** @type {Inventory} */
  const bins = CHAPTERS.map(() =>
    Array.from({ length: 256 }, () => ({ opportunities: 0, repeats: 0 }))
  );
  let globalRune = 0;
  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(([a, b]) => a <= page.page && page.page <= b);
    assert.ok(chapter >= 0, 'Page has an assigned chapter');
    const runes = page.indices;
    for (let i = 0; i + lag < runes.length; i++) {
      const pos = (globalRune + i) % 256;
      bins[chapter][pos].opportunities++;
      bins[chapter][pos].repeats += Number(runes[i] === runes[i + lag]);
    }
    globalRune += runes.length;
  }
  assert.equal(globalRune, 12956);
  return bins;
}

/**
 * @typedef {{opportunities:number,selected:number,repeats:number,
 * selectedRepeats:number,positive:boolean}} ChapterStat
 */

/**
 * Apply one physically printed leading numeral and one cyclic table phase.
 * @param {Inventory} data
 * @param {number} digit
 * @param {number} shift
 * @returns {{chapters:ChapterStat[], opportunities:number, selected:number,
 * repeats:number, selectedRepeats:number, positiveChapters:number, excess:number,
 * ratio:number}}
 */
function assess(data, digit, shift) {
  let opportunities = 0;
  let selected = 0;
  let repeats = 0;
  let selectedRepeats = 0;
  let positiveChapters = 0;
  let excess = 0;
  /** @type {ChapterStat[]} */
  const chapters = [];
  for (const part of data) {
    let n = 0, m = 0, e = 0, k = 0;
    for (let j = 0; j < 256; j++) {
      const bin = part[j];
      n += bin.opportunities;
      e += bin.repeats;
      if (TOKENS[(j + shift) % 256][0] === String(digit)) {
        m += bin.opportunities;
        k += bin.repeats;
      }
    }
    const positive = k * n > e * m;
    positiveChapters += Number(positive);
    excess += k - e * m / n;
    chapters.push({
      opportunities: n, selected: m, repeats: e,
      selectedRepeats: k, positive
    });
    opportunities += n;
    selected += m;
    repeats += e;
    selectedRepeats += k;
  }
  const other = repeats - selectedRepeats;
  const ratio = other > 0 ?
    (selectedRepeats / selected) / (other / (opportunities - selected)) : Infinity;
  return {
    chapters, opportunities, selected, repeats, selectedRepeats,
    positiveChapters, excess, ratio
  };
}

/**
 * Exact hypergeometric upper tail when the repeated positions are uniformly
 * sampled without replacement from fixed available positions.
 * This is an unadjusted diagnostic for a frozen mask, not a causal or
 * post-hypothesis-search p value.
 * @param {number} population
 * @param {number} eligible
 * @param {number} draws
 * @param {number} minimum
 * @returns {number}
 */
function hypergeomTail(population, eligible, draws, minimum) {
  let probability = 1;
  for (let i = 0; i < draws; i++) {
    probability *= (population - eligible - i) / (population - i);
  }
  let upperTail = 0;
  for (let k = 0; k <= draws; k++) {
    if (k >= minimum) upperTail += probability;
    if (k < draws) {
      probability *= ((eligible - k) * (draws - k)) /
        ((k + 1) * (population - eligible - draws + k + 1));
    }
  }
  return upperTail;
}

/**
 * @param {ChapterStat[]} chapters
 * @returns {ChapterStat}
 */
function pool(chapters) {
  return chapters.reduce((sum, c) => ({
    opportunities: sum.opportunities + c.opportunities,
    selected: sum.selected + c.selected,
    repeats: sum.repeats + c.repeats,
    selectedRepeats: sum.selectedRepeats + c.selectedRepeats,
    positive: sum.positive && c.positive
  }), { opportunities: 0, selected: 0, repeats: 0, selectedRepeats: 0, positive: true });
}

const primary = inventory(1);
const original = assess(primary, 0, 0);
assert.equal(original.opportunities, 12901);
assert.equal(original.selected, 3025);
assert.equal(original.repeats, 86);
assert.equal(original.selectedRepeats, 33);
assert.equal(original.positiveChapters, 9);
assert.deepEqual(
  original.chapters.map((c) => c.selectedRepeats),
  [1, 3, 3, 5, 4, 5, 5, 6, 1]
);
assert.deepEqual(
  original.chapters.map((c) => c.repeats),
  [4, 6, 9, 10, 11, 13, 12, 18, 3]
);
const early = pool(original.chapters.slice(0, 4));
const later = pool(original.chapters.slice(4));
assert.deepEqual(
  [early.opportunities, early.selected, early.repeats, early.selectedRepeats],
  [5483, 1285, 29, 12]
);
assert.deepEqual(
  [later.opportunities, later.selected, later.repeats, later.selectedRepeats],
  [7418, 1740, 57, 21]
);
const fixedP = hypergeomTail(12901, 3025, 86, 33);
const earlyP = hypergeomTail(5483, 1285, 29, 12);
const laterP = hypergeomTail(7418, 1740, 57, 21);
assert.ok(Math.abs(fixedP - 0.0013489911418068095) < 1e-11);
assert.ok(Math.abs(earlyP - 0.023992574857462125) < 1e-11);
assert.ok(Math.abs(laterP - 0.01565351982851507) < 1e-11);

/** @type {{digit:number,shift:number,positiveChapters:number,selectedRepeats:number,excess:number}[]} */
const rivalClocks = [];
for (let digit = 0; digit < 5; digit++) {
  for (let shift = 0; shift < 256; shift++) {
    const s = assess(primary, digit, shift);
    rivalClocks.push({
      digit, shift, positiveChapters: s.positiveChapters,
      selectedRepeats: s.selectedRepeats, excess: s.excess
    });
  }
}
assert.equal(rivalClocks.length, 1280);
const allNine = rivalClocks.filter((s) => s.positiveChapters === 9);
assert.equal(allNine.length, 4);
assert.equal(
  allNine.filter((s) => s.excess >= original.excess - 1e-9).length,
  1
);
assert.equal(
  rivalClocks.filter((s) => s.digit === 0 && s.selectedRepeats >= 33).length,
  1
);
assert.equal(
  rivalClocks.filter((s) => s.selectedRepeats >= 33).length,
  7
);

// Orthogonal diagnostic: does the entire 29-step alphabet, rather than just
// the exceptional zero step selected post hoc, depend on the five printed
// table-leading digits? This is a fixed-clock Pearson 5 x 29 contingency.
const stepCells = Array.from({ length: 5 }, () => new Uint32Array(29));
let stepGlobal = 0;
for (const page of PAGES) {
  for (let i = 1; i < page.indices.length; i++) {
    const digit = Number(TOKENS[(stepGlobal + i - 1) % 256][0]);
    const step = (page.indices[i] - page.indices[i - 1] + 29) % 29;
    stepCells[digit][step]++;
  }
  stepGlobal += page.indices.length;
}
assert.equal(stepGlobal, 12956);
const stepRowCounts = stepCells.map((row) => row.reduce((a, b) => a + b, 0));
const stepColumnCounts = Array.from({ length: 29 }, (_, j) =>
  stepCells.reduce((sum, row) => sum + row[j], 0));
assert.deepEqual(stepRowCounts, [3025, 2926, 3270, 2825, 855]);
assert.deepEqual(stepCells.map((row) => row[0]), [33, 12, 17, 19, 5]);
const stepPearson = stepCells.reduce((sum, row, digit) =>
  sum + row.reduce((inner, count, step) => {
    const expected = stepRowCounts[digit] * stepColumnCounts[step] / 12901;
    return inner + ((count - expected) ** 2) / expected;
  }, 0), 0);
assert.ok(Math.abs(stepPearson - 113.20170622464354) < 1e-9);
const fullStepContingency = {
  shape: '5 printed first digits by 29 observed GP rune differences',
  observations: 12901,
  pearsonChiSquare: stepPearson,
  degreesOfFreedom: (5 - 1) * (29 - 1),
  zeroStepByDigit: stepCells.map((row) => row[0])
};
// A standard chi-square(112) reference gives upper-tail p ≈ 0.45044786;
// the diagnostic was added after inspecting the zero-step anomaly.

const lagControls = [];
for (let lag = 2; lag <= 12; lag++) {
  const x = assess(inventory(lag), 0, 0);
  lagControls.push({
    lag, repeats: x.repeats, selectedRepeats: x.selectedRepeats,
    positiveChapters: x.positiveChapters, ratio: x.ratio
  });
}
assert.deepEqual(lagControls.map((x) => x.positiveChapters),
  [6, 5, 6, 4, 2, 4, 6, 7, 4, 5, 4]);
assert.ok(lagControls.every((x) => x.ratio < 1.2));


/**
 * Director #1135: strict zero-only escape capacity and word-local lag five.
 * All original word seams remain; "/" and "%" are line/page carries.
 */
const fs = require('node:fs');
const transcription = fs.readFileSync(
  require('node:path').join(__dirname, '../resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const parsedWords=[];
let current=[];
for(const ch of transcription){
  if(runeIndex.has(ch))current.push(runeIndex.get(ch));
  else if("-.'".includes(ch)&&current.length){parsedWords.push(current);current=[];}
}
if(current.length)parsedWords.push(current);
const words=parsedWords.slice(0,2896);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),PAGES.flatMap(x=>x.indices));
let wordPos=0,events=0,eligible=0,zeroEvents=0,zeroEligible=0;
for(const w of words){
  for(let j=5;j<w.length;j++){
    const z=TOKENS[(wordPos+j-5)%256][0]==='0';
    const hit=w[j]===w[j-5];
    eligible++;events+=Number(hit);
    zeroEligible+=Number(z);zeroEvents+=Number(z&&hit);
  }
  wordPos+=w.length;
}
assert.equal(wordPos,12956);
assert.deepEqual([events,eligible,zeroEvents,zeroEligible],[104,2105,27,482]);
const maxZeroRepeats=Math.max(...rivalClocks
  .filter(x=>x.digit===0).map(x=>x.selectedRepeats));
assert.equal(maxZeroRepeats,33);
const wordLocalZeroLag5={
  lag5Events:events,lag5Eligible:eligible,
  leadingZeroLag5Events:zeroEvents,leadingZeroLag5Eligible:zeroEligible,
  leadingZeroLag5RateRatio:(zeroEvents/zeroEligible)/((events-zeroEvents)/(eligible-zeroEligible)),
  maxAdjacentRepeatsSelectedByAnyGlobalLeadingZeroPhase:maxZeroRepeats,
  minimumAdjacentRepeatsOutsideLeadingZeroGate:original.repeats-maxZeroRepeats
};
assert.equal(wordLocalZeroLag5.minimumAdjacentRepeatsOutsideLeadingZeroGate,53);
assert.ok(Math.abs(wordLocalZeroLag5.leadingZeroLag5RateRatio-1.1807134773939754)<1e-12);

console.log(JSON.stringify({
  original: {
    opportunities: original.opportunities,
    repeats: original.repeats,
    leadingZeroOpportunities: original.selected,
    leadingZeroRepeats: original.selectedRepeats,
    repeatRateRatio: original.ratio,
    positiveChapters: original.positiveChapters,
    chapterCounts: original.chapters
  },
  retrospectiveChapterSplit: {
    firstFour: early, lastFive: later,
    unadjustedHypergeomTail: { all: fixedP, early: earlyP, later: laterP }
  },
  entireFiveDigitAndPhaseFamily: {
    candidates: rivalClocks.length,
    allNinePositive: allNine.map((s) => ({
      digit: s.digit, shift: s.shift,
      repeats: s.selectedRepeats, excess: s.excess
    })),
    sourceLeadingZeroShiftZeroIsUniqueNineChapterMaxExcess: true
  },
  lagControls,
  fullStepContingency,
  wordLocalZeroLag5
}, null, 2));
