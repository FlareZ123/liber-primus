'use strict';

/**
 * Original-source SFT: universal anti-repeat capacity of combined
 * LP2 red-run coordinates and word-boundary large-mark coordinates.
 * Windows 11 / Node.js 22, CommonJS. Read-only.
 *
 * Source: resources/liber-primus/{lp2-corpus.json,
 * lp2-transcription.txt,lp2-ink-annotations.json}
 * All indices are zero-based physical LP2 pages and GP29 rune offsets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const printed = read('lp2-transcription.txt').split('%');
const alphabet = new Set(corpus.runes);
const wordBreaks = new Set(['-', '.', '⁘', '⁚', '⁜', '⁕']);

function logChoose(n, k) {
  assert(Number.isInteger(n) && Number.isInteger(k) && n >= k && k >= 0);
  let total = 0;
  for (let i = 1; i <= k; i += 1) {
    total += Math.log2(n - k + i) - Math.log2(i);
  }
  return total;
}

/** The inverse fraction of GP29 tapes with at most k repeats. */
function lostBits(transitions, maxRepeats) {
  let reverseTail = 1;
  let term = 1;
  for (let k = maxRepeats; k > 0; k -= 1) {
    term *= k * 28 / (transitions - k + 1);
    reverseTail += term;
  }
  return transitions * Math.log2(29 / 28)
    - logChoose(transitions, maxRepeats)
    + maxRepeats * Math.log2(28)
    - Math.log2(reverseTail);
}

/** Exact GP29 random-source bit loss for each original page's repeat budget. */
function perPageRepeatLoss(transitions, repeats, atMost) {
  const terms = [];
  for (let j = atMost ? 0 : repeats; j <= repeats; j += 1) {
    terms.push(logChoose(transitions, j)
      + j * Math.log2(1 / 29)
      + (transitions - j) * Math.log2(28 / 29));
  }
  const peak = Math.max(...terms);
  return -peak - Math.log2(terms.reduce((sum, value) => sum + 2 ** (value - peak), 0));
}

function checkSmallPositiveControls() {
  let valid = 0;
  for (let a = 0; a < 3; a += 1)
    for (let b = 0; b < 3; b += 1)
      for (let c = 0; c < 3; c += 1)
        for (let d = 0; d < 3; d += 1) {
          const repeats = Number(a === b) + Number(b === c) + Number(c === d);
          if (repeats <= 1) valid += 1;
        }
  assert.equal(valid, 60);
  assert.equal(3 * (2 ** 3 + 3 * 2 ** 2), 60);

  let placements = 0;
  for (let first = 0; first + 2 <= 8; first += 1)
    for (let second = first + 2; second + 1 <= 8; second += 1)
      placements += 1;
  assert.equal(placements, 21);
  assert(Math.abs(logChoose(7, 2) - Math.log2(placements)) < 1e-12);
  console.log('Small exact controls PASS: GP3 60/81 tapes; 21 nonoverlap red-run placements');
}

checkSmallPositiveControls();
assert.equal(printed.length, 57, 'Source transcript omits runeless physical p50');
assert.equal(corpus.pages.length, 58);

let runeTotal = 0;
let transitions = 0;
let repetitions = 0;
let pageCount = 0;
let redTotal = 0;
let redRunCount = 0;
let markCount = 0;
let pageSeamTotal = 0;
let pagewiseAtMostRepeatLoss = 0;
let pagewiseExactRepeatLoss = 0;
let redPositionBits = 0;
let markWordBoundaryBits = 0;
let redWordBoundaryBits = 0;

for (let segment = 0; segment < printed.length; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  if (page > 55) continue; // p56–57 are clear source controls.
  const source = corpus.pages[page];
  const annotation = ink.pages.find((x) => x.page === page);
  const redRuns = annotation ? (annotation.red_spans || []) : [];
  const marks = annotation ? (annotation.large_punctuation || []) : [];
  const boundary = new Set([0]);
  let offset = 0;
  for (const character of printed[segment]) {
    if (alphabet.has(character)) offset += 1;
    else if (wordBreaks.has(character)) boundary.add(offset);
  }
  boundary.add(offset);
  assert.equal(offset, source.runic_count, 'Physical p' + page + ' rune count');

  for (const red of redRuns) {
    assert(boundary.has(red.start) && boundary.has(red.start + red.length),
      'Original red run must span whole printed words: p' + page);
  }
  for (const mark of marks) {
    assert(boundary.has(mark[0]), 'Original large mark at word gap: p' + page);
  }

  const lengthRed = redRuns.reduce((sum, x) => sum + x.length, 0);
  const r = redRuns.length;
  const m = marks.length;
  const n = source.indices.length;
  const slots = boundary.size;

  // Generous: ordered, fixed-length red intervals can start at ANY rune
  // seam, so they need not even be at source word boundaries in a code.
  redPositionBits += logChoose(n - lengthRed + r, r);
  // Large mark sites remain source-like: 31 labelled marks are at the
  // observed printed word gaps. Multisets allow repeated marks at one gap.
  markWordBoundaryBits += logChoose(slots + m - 1, m);
  // Alternative strictly word-anchored red interval upper bound.
  redWordBoundaryBits += logChoose(slots, r);

  runeTotal += n;
  transitions += n - 1;
  pageCount += 1;
  redTotal += lengthRed;
  redRunCount += r;
  markCount += m;
  pageSeamTotal += slots;
  let pageRepeats = 0;
  for (let i = 1; i < n; i += 1) {
    if (source.indices[i] === source.indices[i - 1]) {
      repetitions += 1;
      pageRepeats += 1;
    }
  }
  pagewiseAtMostRepeatLoss += perPageRepeatLoss(n - 1, pageRepeats, true);
  pagewiseExactRepeatLoss += perPageRepeatLoss(n - 1, pageRepeats, false);
  if (r || m) console.log('p' + page + ' runes=' + n +
    ' word-gaps=' + slots + ' red-runs=' + r +
    ' red-runes=' + lengthRed + ' large-marks=' + m);
}

assert.equal(pageCount, 55);
assert.equal(runeTotal, 12956);
assert.equal(transitions, 12901);
assert.equal(repetitions, 86);
assert.equal(redTotal, 213);
assert.equal(redRunCount, 16);
assert.equal(markCount, 31);
assert.equal(pageSeamTotal, 2983);

const markerLabels = logChoose(31, 3) + Math.log2(31);
const lost = lostBits(transitions, repetitions);
const combined = redPositionBits + markWordBoundaryBits + markerLabels;
const strictCombined = redWordBoundaryBits + markWordBoundaryBits + markerLabels;
const oneExtraBitPerRedRun = combined + redRunCount;
// Global mark movement is more permissive than the observed per-page
// totals: allow 31 marks to occupy ANY 3,008 candidate printed word gaps.
// This grants 25 nonexistent gaps beyond the original 2,983.
const globalMarkSlots = 3008;
const globallyMovableMarksBits = logChoose(globalMarkSlots + markCount - 1, markCount)
  + markerLabels;
const redFixedPagesMarksGlobalBits = redPositionBits + globallyMovableMarksBits;
// Even more generous: preserve the historical 16 red-run lengths and their
// original relative order, but allow the entire set to roam across pages.
const globallyMovableOrderedRedBits = logChoose(runeTotal - redTotal + redRunCount, redRunCount);
const allSidecarsGlobalBits = globallyMovableOrderedRedBits + globallyMovableMarksBits;

const near = (actual, target) => assert(Math.abs(actual - target) < 1e-8,
  'Expected ' + target + ', obtained ' + actual);
near(lost, 325.450254183982);
near(redPositionBits, 118.74873335137019);
near(markWordBoundaryBits, 154.98966699083067);
near(redWordBoundaryBits, 86.62198765948989);
near(markerLabels, 17.088301710788684);
near(combined, 290.82670205298956);
near(strictCombined, 258.69995636110923);
near(pagewiseAtMostRepeatLoss, 430.5612013481064);
near(pagewiseExactRepeatLoss, 445.73155790087196);
near(globallyMovableMarksBits, 262.8395654711621);
near(globallyMovableOrderedRedBits, 173.96392754942994);
assert(pagewiseAtMostRepeatLoss > redFixedPagesMarksGlobalBits);
assert(pagewiseExactRepeatLoss > allSidecarsGlobalBits);
assert(lost > combined);
assert(lost > oneExtraBitPerRedRun);

console.log(JSON.stringify({
  source: 'original LP2 p0–p55; runeless p50 omitted in transcript',
  runeTotal, pageCount, transitions, repetitions, redTotal,
  redRunCount, markCount,
  universalAntiRepeatLossBits: lost,
  redRunsArbitraryRuneSeamsBits: redPositionBits,
  largeMarksWordGapsBits: markWordBoundaryBits,
  generouslyAssignedThreeTenOneBlackBits: markerLabels,
  combinedSidecarUpperBits: combined,
  deficitBits: lost - combined,
  strictWordAnchoredRedUpperBits: strictCombined,
  withExtraBinaryPerRedRunBits: oneExtraBitPerRedRun,
  withExtraBinaryPerRedRunDeficit: lost - oneExtraBitPerRedRun,
  printedWordSeamsOriginal: pageSeamTotal,
  globalWordSeamsGenerouslyGranted: globalMarkSlots,
  pagewiseAtMostRepeatLossBits: pagewiseAtMostRepeatLoss,
  pagewiseExactRepeatLossBits: pagewiseExactRepeatLoss,
  globallyMovableLargeMarksBits: globallyMovableMarksBits,
  globalMarksLocalRedCapacityBits: redFixedPagesMarksGlobalBits,
  globalMarksLocalRedDeficitBits: pagewiseAtMostRepeatLoss - redFixedPagesMarksGlobalBits,
  globallyMovableOrderedRedBits: globallyMovableOrderedRedBits,
  allSidecarsGlobalCapacityBits: allSidecarsGlobalBits,
  globallyMovableExactRepeatDeficitBits: pagewiseExactRepeatLoss - allSidecarsGlobalBits
}, null, 2));
console.log('PASS: original-source all-key cardinality exclusion for three explicit channel contracts');