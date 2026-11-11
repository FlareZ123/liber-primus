'use strict';
/**
 * Reproduce the exact 2014 trailing-9133 / LP2 p33:91 coordinate match.
 * This is a bounded source association and word-crib rejection, not a decoder.
 * Node.js 22, CommonJS, zero external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relativePath */
function readJSON(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
const annotation = readJSON('resources/liber-primus/lp2-ink-annotations.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const raw = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');

const historicalPairs =
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ' +
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M';
const original = historicalPairs.replace(/\s+/gu, '');
const historicalPlain =
  'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
const columnInverse = [0, 6, 2, 5, 1, 4, 3];
assert.equal(original.length, 56);
const decoded = [];
for (let i = 0; i < original.length; i += 7) {
  for (const j of columnInverse) decoded.push(original[i + j]);
}
assert.equal(decoded.join(''), historicalPlain);
assert.equal(historicalPlain.slice(-4), '9133');
assert.equal('TOBELIEVETRUTHISTODESTROYPOSSIBILITY'.length, 36);
assert.equal('Q4UTGDI2N4M4UIM5'.length, 16);
assert.equal(36 + 16 + 4, 56);

const internalRed = annotation.pages
  .filter(p => p.page <= 55)
  .flatMap(p => (p.red_spans || [])
    .filter(span => span.start > 0)
    .map(span => ({
      page: p.page,
      offset: span.start,
      length: span.length,
      locator: `${String(span.start).padStart(2, '0')}${String(p.page).padStart(2, '0')}`,
      preceding13: (p.large_punctuation || []).some(mark =>
        mark[0] === span.start && mark[1] === 13)
    })));
assert.equal(internalRed.length, 7);
const matches = internalRed.filter(span => span.locator === historicalPlain.slice(-4));
assert.equal(matches.length, 1);
assert.deepEqual(matches[0], {
  page: 33, offset: 91, length: 8, locator: '9133', preceding13: true
});

// A different natural split, page 9 / local rune 133, is unmarked.
const otherPage = annotation.pages.find(p => p.page === 9);
assert(otherPage && otherPage.rune_count > 133);
assert(!(otherPage.red_spans || []).some(span => span.start === 133));
assert(!(otherPage.large_punctuation || []).some(mark => mark[0] === 133));

// Inspect the source-visible GP word lengths at this boundary (not a crib fit).
const sourcePage33 = raw.split('%')[33];
const Rune = /[\u16a0-\u16ff]/u;
let pos = 0;
let start = -1;
let pending = '';
/** @type {{start:number,length:number}[]} */
const words = [];
function flush() {
  if (pending) words.push({start, length: [...pending].length});
  pending = '';
  start = -1;
}
for (const character of sourcePage33) {
  if (Rune.test(character)) {
    if (start < 0) start = pos;
    pending += character;
    pos++;
  } else if (character === '/' || /\s/u.test(character)) {
    // Printed line breaks do not delimit GP words.
  } else {
    flush();
  }
}
flush();
assert.equal(pos, 214);
assert.deepEqual(words.filter(w => w.start >= 91 && w.start < 99),
  [{start:91, length:3}, {start:94, length:5}]);
const next = words.find(w => w.start === 99);
assert.deepEqual(next, {start:99, length:6});
// The four-digit historical suffix is itself prime. Test the two unfitted
// direct applications of the *known solved-p56 running phi(prime)* cipher,
// starting at that literal prime at the proposed p33:91 entry. This is only
// the narrow direct transfer; unknown interrupters or additional layers
// are not inferred or tuned from the ciphertext.
const segments = [
  corpus.pages.find(page => page.page === 33).indices.slice(91),
  ...corpus.pages.filter(page => page.page >= 34 && page.page <= 38).map(page => page.indices),
  corpus.pages.find(page => page.page === 39).indices.slice(0, 119)
];
const illustratedCipher = segments.flat();
assert.equal(illustratedCipher.length, 1468);
const endOfPage39 = corpus.pages.find(page => page.page === 39).indices;
const fullToEnd = [
  ...illustratedCipher,
  ...endOfPage39.slice(119)
];
assert.equal(fullToEnd.length, 1589);
/** @param {number} candidate */
function prime(candidate) {
  for (let factor = 2; factor * factor <= candidate; factor++) {
    if (candidate % factor === 0) return false;
  }
  return candidate >= 2;
}
assert(prime(9133));
/** @type {number[]} */
const runningPrimes = [];
for (let p = 9133; runningPrimes.length < fullToEnd.length; p++) {
  if (prime(p)) runningPrimes.push(p);
}
/** @param {number[]} data */
function coincidence(data) {
  const counts = Array(29).fill(0);
  for (const value of data) counts[value]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}
/** @param {number[]} data @param {-1|1} sign */
function directPhi(data, sign) {
  return data.map((value, i) => (
    (value + sign * ((runningPrimes[i] - 1) % 29) + 29) % 29
  ));
}
const originalIllustratedIoC = coincidence(illustratedCipher);
const directPhiMinusIoC = coincidence(directPhi(illustratedCipher, -1));
const directPhiPlusIoC = coincidence(directPhi(illustratedCipher, 1));
assert(Math.abs(originalIllustratedIoC - 0.03431255096222248) < 1e-12);
assert(Math.abs(directPhiMinusIoC - 0.0344174936709331) < 1e-12);
assert(Math.abs(directPhiPlusIoC - 0.03433762576872856) < 1e-12);
assert(directPhiMinusIoC < 0.04 && directPhiPlusIoC < 0.04);
const directPhiFullMinusIoC = coincidence(directPhi(fullToEnd, -1));
const directPhiFullPlusIoC = coincidence(directPhi(fullToEnd, 1));
assert(Math.abs(directPhiFullMinusIoC - 0.03445285836346545) < 1e-12);
assert(Math.abs(directPhiFullPlusIoC - 0.034407680004058125) < 1e-12);

// Both source-visible three-dot dividers are kept as distinct sentinels.
// The actual illustrated passage has 1468 runes; the two dividers make
// 1470=210*7 positions for the *unaltered* historical inverse column order.
// No guessed column permutations, start rotations or key offsets are used.
const sevenPositionOrder = [0, 6, 2, 5, 1, 4, 3];
/** @param {number[]} input */
function periodSevenInverse(input) {
  assert.equal(input.length % 7, 0);
  const out = [];
  for (let base = 0; base < input.length; base += 7) {
    for (const index of sevenPositionOrder) out.push(input[base + index]);
  }
  return out;
}
const withDividers = [-1, ...illustratedCipher, -2];
assert.equal(withDividers.length, 1470);
const reorderedWithDividers = periodSevenInverse(withDividers);
assert.equal(reorderedWithDividers.indexOf(-1), 0);
assert.equal(reorderedWithDividers.indexOf(-2), 1464);
const withoutDividers = reorderedWithDividers.filter(value => value >= 0);
assert.equal(withoutDividers.length, illustratedCipher.length);
/** @param {number[]} arr */
const countAdjacentDoublets = arr =>
  arr.slice(1).filter((value, i) => value === arr[i]).length;
assert.equal(countAdjacentDoublets(illustratedCipher), 11);
assert.equal(countAdjacentDoublets(withoutDividers), 45);

// Freeze the two plausible orders of the same pair of source-motivated
// operators, retaining the natural two phi signs without plaintext fitting.
const twoLayerOriginalIoC = coincidence(illustratedCipher);
/** @type {Record<string,{ioc:number,doublets:number}>} */
const twoLayerResults = {};
for (const sign of /** @type {const} */ ([-1, 1])) {
  const historicalFirst = directPhi(withoutDividers, sign);
  const phiFirst = periodSevenInverse([
    -1, ...directPhi(illustratedCipher, sign), -2
  ]).filter(value => value >= 0);
  twoLayerResults[`historicalFirstPhi${sign}`] = {
    ioc: coincidence(historicalFirst),
    doublets: countAdjacentDoublets(historicalFirst)
  };
  twoLayerResults[`phiFirstHistorical${sign}`] = {
    ioc: coincidence(phiFirst),
    doublets: countAdjacentDoublets(phiFirst)
  };
}
assert.deepEqual(twoLayerResults, {
  historicalFirstPhi1: {ioc:0.03446485719433347, doublets:51},
  phiFirstHistorical1: {ioc:0.03433762576872856, doublets:47},
  'historicalFirstPhi-1': {ioc:0.03441656497439584, doublets:58},
  'phiFirstHistorical-1': {ioc:0.0344174936709331, doublets:51}
});
const out = {
  historical: {originalLength:56, phraseLength:36, onionLength:16,
    unexplainedSuffix:'9133'},
  internalRedHeadings:internalRed,
  uniqueCoordinateMatch:matches[0],
  markedRedTitleWordLengths:[3, 5],
  nextBodyWordLength:next.length,
  literal2014PhraseFirstWordLengths:[2, 7],
  source9133IsPrime:true,
  historicalTwoBoundaryMarkerLayer: {
    originalLength:illustratedCipher.length,
    sevenColumnLength:withDividers.length,
    startMarkerAfterInverse:0,
    endMarkerAfterInverse:1464,
    originalGP29IoC:twoLayerOriginalIoC,
    afterColumnInverseAdjacentDoublets:countAdjacentDoublets(withoutDividers),
    twoSourceOperatorOrdersAndSigns:twoLayerResults,
    note:'all direct outputs remain nonlinguistic; both source markers are symbolic delimiters'
  },
  directPrimeTotientOnOriginal: {
    illustratedRuneCount:illustratedCipher.length,
    illustratedOriginalIoC:originalIllustratedIoC,
    seed9133MinusIoC:directPhiMinusIoC,
    seed9133PlusIoC:directPhiPlusIoC,
    fullThroughPage39RuneCount:fullToEnd.length,
    fullSeed9133MinusIoC:directPhiFullMinusIoC,
    fullSeed9133PlusIoC:directPhiFullPlusIoC,
    note:'no cipher-F passthrough; no original plaintext recovered'
  },
  directWordAlignedHistoricalCrib:false,
  interpretation:'unselected coordinate hypothesis; 4-character transposition padding is a competing explanation'
};
console.log(JSON.stringify(out, null, 2));
console.log('SFT PASS: historic 9133 ↔ p33:91 exact source association only.');
