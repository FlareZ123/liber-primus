'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

/** @param {number[]} indices @returns {number[]} */
function repeatDestinations(indices) {
  const positions = [];
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1]) positions.push(i);
  }
  return positions;
}

/** @param {number[]} positions @returns {number} */
function gapGcd(positions) {
  let divisor = 0;
  for (let i = 1; i < positions.length; i++) {
    divisor = gcd(divisor, positions[i] - positions[i - 1]);
  }
  return divisor;
}

/**
 * Is there an arbitrary hidden block phase such that every repeated
 * neighboring symbol occurs at a boundary of length period?
 * @param {number[]} positions
 * @param {number} period
 * @returns {boolean}
 */
function permitsBoundaryOnlyRepeats(positions, period) {
  return positions.length < 2 ||
    positions.every((n) => n % period === positions[0] % period);
}

/** @param {number} period @param {number} phase @param {number} length @returns {number[]} */
function makePlant(period, phase, length) {
  const result = [0];
  for (let i = 1; i < length; i++) {
    result.push(i % period === phase ? result[i - 1] : (result[i - 1] + 1) % 29);
  }
  return result;
}

assert.equal(corpus.runes.length, 29);
const pages = corpus.pages.filter((page) => page.page < 56 && page.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);

const records = pages.map((page) => ({
  page: page.page,
  repeats: repeatDestinations(page.indices),
})); 
assert.equal(records.reduce((sum, record) => sum + record.repeats.length, 0), 86);

const p3 = records.find((record) => record.page === 3);
assert.deepEqual(p3.repeats, [53, 180, 203]);
assert.equal(gapGcd(p3.repeats), 1);
const p9 = records.find((record) => record.page === 9);
assert.deepEqual(p9.repeats, [63, 112, 216]);
assert.equal(gapGcd(p9.repeats), 1);
const decisive = records.filter((record) => record.repeats.length >= 3 &&
  gapGcd(record.repeats) === 1);
assert.deepEqual(decisive.map((record) => record.page),
  [3, 9, 19, 24, 25, 27, 34, 35, 43, 44]);

// The exact gcd=1 proof rules out every period >=2, including periods
// greater than the source page length, without fitting its unknown phase.
for (let period = 2; period <= 1024; period++) {
  assert.equal(permitsBoundaryOnlyRepeats(p3.repeats, period), false);
  assert.equal(permitsBoundaryOnlyRepeats(p9.repeats, period), false);
}

/**
 * Minimal source collisions that must occur inside some fixed-length block:
 * choose the most favourable phase, either globally or independently per page.
 * @param {number} period
 * @returns {{ globalExceptions: number, pageExceptions: number }}
 */
function minimumInternalExceptions(period) {
  const globalPhaseCounts = Array(period).fill(0);
  let maximumSavedWithPagePhases = 0;
  let totalEvents = 0;
  for (const { repeats } of records) {
    const pagePhaseCounts = Array(period).fill(0);
    for (const i of repeats) {
      globalPhaseCounts[i % period]++;
      pagePhaseCounts[i % period]++;
      totalEvents++;
    }
    maximumSavedWithPagePhases += Math.max(...pagePhaseCounts);
  }
  return {
    globalExceptions: totalEvents - Math.max(...globalPhaseCounts),
    pageExceptions: totalEvents - maximumSavedWithPagePhases,
  };
}
assert.deepEqual(minimumInternalExceptions(2),
  { globalExceptions: 35, pageExceptions: 17 });
assert.deepEqual(minimumInternalExceptions(5),
  { globalExceptions: 64, pageExceptions: 34 });
assert.deepEqual(minimumInternalExceptions(8),
  { globalExceptions: 67, pageExceptions: 37 });
assert.deepEqual(minimumInternalExceptions(16),
  { globalExceptions: 75, pageExceptions: 41 });
assert.deepEqual(minimumInternalExceptions(32),
  { globalExceptions: 80, pageExceptions: 43 });

/**
 * Classifies all original neighboring equalities by explicitly printed
 * word/clause and line separators in the archival transcription.
 * @returns {{ insideWords: number, acrossWords: number, insideLines: number,
 *   acrossLines: number }}
 */
function originalVisibleBoundaryCounts() {
  const original = fs.readFileSync(path.join(__dirname, '..',
    'resources/transcriptions/liber_primus_master.txt'), 'utf8');
  const allPhysicalPages = original.split(/^\s*%\s*$/m);
  assert.equal(allPhysicalPages.length, 74);
  const same = { insideWords: 0, acrossWords: 0,
    insideLines: 0, acrossLines: 0 };
  for (const page of pages) {
    const glyphs = [...allPhysicalPages[15 + page.page]];
    let lastPosition = -1;
    let position = 0;
    for (let t = 0; t < glyphs.length; t++) {
      const index = corpus.runes.indexOf(glyphs[t]);
      if (index < 0) continue;
      assert.equal(index, page.indices[position]);
      if (position > 0 && index === page.indices[position - 1]) {
        const separator = glyphs.slice(lastPosition + 1, t).join('');
        const hasWordBreak = separator.includes('-') || separator.includes('.');
        const hasLineBreak = separator.includes('/');
        same[hasWordBreak ? 'acrossWords' : 'insideWords']++;
        same[hasLineBreak ? 'acrossLines' : 'insideLines']++;
      }
      lastPosition = t;
      position++;
    }
    assert.equal(position, page.indices.length);
  }
  return same;
}
assert.deepEqual(originalVisibleBoundaryCounts(),
  { insideWords: 63, acrossWords: 23,
    insideLines: 82, acrossLines: 4 });

// Frozen constructive positive control: every repeat lies at position 2 mod 5,
// while the intervening stream runs over the original 29-symbol alphabet.
const planted = makePlant(5, 2, 217);
const plantedRepeats = repeatDestinations(planted);
assert(plantedRepeats.length >= 30);
assert.equal(gapGcd(plantedRepeats), 5);
assert.equal(permitsBoundaryOnlyRepeats(plantedRepeats, 5), true);
assert.equal(permitsBoundaryOnlyRepeats(plantedRepeats, 4), false);

// A blockwise injective map can permute symbols or use secret independent
// block keys: the equality invariant remains and the proof is key-blind.
console.log(JSON.stringify({
  status: 'PASS',
  originalPages: pages.length,
  originalRunes: 12956,
  originalAdjacentRepeats: 86,
  p3RepeatDestinations: p3.repeats,
  p3GapGcd: gapGcd(p3.repeats),
  p9RepeatDestinations: p9.repeats,
  p9GapGcd: gapGcd(p9.repeats),
  independentlyDecisivePages: decisive.map((record) => record.page),
  testedPeriods: [2, 1024],
  plantedPeriod: 5,
  plantedPhase: 2,
  plantedRepeats: plantedRepeats.length,
  fiveBlockMinimumInternalExceptions: minimumInternalExceptions(5),
  originalVisibleBoundaryCounts: originalVisibleBoundaryCounts(),
}));
