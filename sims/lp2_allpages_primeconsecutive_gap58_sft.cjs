'use strict';

/**
 * Source-exact all-page census for the p27 pair 103/104 -> p32 pointer.
 * Read-only Node.js 22 CommonJS standalone test. No fitted keys, clocks,
 * word segmentation, image offsets or other input transformations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function source(name) {
  return fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
}
const corpus = JSON.parse(source('lp2-corpus.json'));
const grid = JSON.parse(source('base60-grid.json'));
const transcription = source('lp2-transcription.txt');
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime.length, 29);
assert.equal(new Set(bytes).size, 161);

/** @typedef {{page:number, start:number, sum:number, runes:string}} RuneWord */
/** @type {RuneWord[]} */
const words = [];
const pageChunks = transcription.split('%')
  .filter((chunk) => [...chunk].some((rune) => runeToIndex.has(rune)));
assert.equal(pageChunks.length, 57, '55 unknown rune pages and two solved pages');
for (let chapter = 0; chapter < pageChunks.length; chapter++) {
  const physicalPage = chapter < 50 ? chapter : chapter + 1;
  const page = corpus.pages.find((record) => record.page === physicalPage);
  assert.ok(page, 'physical page must be represented');
  const chunk = pageChunks[chapter];
  const sourceIndices = [...chunk].filter((c) => runeToIndex.has(c))
    .map((c) => runeToIndex.get(c));
  assert.deepEqual(sourceIndices, page.indices, 'physical-page original rune tape');
  let start = 0;
  let position = 0;
  let token = '';
  /** Finish a complete printed word or, at a page turn, one page fragment. */
  function flush() {
    if (!token) return;
    const sum = [...token].reduce((s, c) => s + corpus.prime[runeToIndex.get(c)], 0);
    words.push({page:physicalPage, start, sum, runes:token});
    token = '';
  }
  for (const c of chunk) {
    if (runeToIndex.has(c)) {
      if (!token) start = position;
      token += c;
      position++;
    } else if ('/\r\n \t'.includes(c)) {
      // Line wrapping does not break the source's printed runic words.
    } else {
      assert.ok('-.$&§1234567'.includes(c), 'unexpected physical punctuation ' + c);
      flush();
    }
  }
  flush();
}
const unsolved = words.filter((word) => word.page < 56);
assert.equal(unsolved.length, 2928, '2896 complete words plus 32 page split fragments');

/**
 * An ordered pair of original physical-page words is a self-consistent
 * page pointer precisely when:
 * 1. their complete GP-prime sums are consecutive 1-based grid cell numbers;
 * 2. the two original grid bytes select the same page modulo 58;
 * 3. their absolute source rune-start separation equals that page index.
 * The arithmetic predicate is invariant to word-sum order.
 * @param {RuneWord[]} pageWords
 * @returns {{pairs:number,consecutive:number,matches:Array<object>,candidates:Array<object>}}
 */
function scan(pageWords) {
  let pairs = 0;
  let consecutive = 0;
  /** @type {Array<object>} */
  const candidates = [];
  /** @type {Array<object>} */
  const matches = [];
  for (let i = 0; i < pageWords.length; i++) {
    for (let j = i + 1; j < pageWords.length; j++) {
      pairs++;
      const left = pageWords[i], right = pageWords[j];
      const low = Math.min(left.sum, right.sum);
      const high = Math.max(left.sum, right.sum);
      if (high !== low + 1 || low < 1 || high > 256) continue;
      consecutive++;
      const pageLow = bytes[low - 1] % 58;
      const pageHigh = bytes[high - 1] % 58;
      const gap = right.start - left.start;
      const candidate = {
        page: left.page, leftStart: left.start, rightStart: right.start,
        low, high, gap, pageLow, pageHigh
      };
      candidates.push(candidate);
      if (pageLow === pageHigh && gap === pageLow) matches.push(candidate);
    }
  }
  return {pairs, consecutive, matches, candidates};
}
let totalPairs = 0, consecutive = 0;
const matches = [];
let p27 = null;
for (let p = 0; p < 56; p++) {
  const found = scan(unsolved.filter((word) => word.page === p));
  totalPairs += found.pairs;
  consecutive += found.consecutive;
  matches.push(...found.matches);
  if (p === 27) p27 = found;
}
assert.equal(totalPairs, 81159);
assert.equal(consecutive, 289);
assert.equal(matches.length, 1, 'single full-original pointer among 289 candidate pairs');
assert.deepEqual(matches[0], {
  page:27, leftStart:34, rightStart:66,
  low:103, high:104, gap:32, pageLow:32, pageHigh:32
});
assert.ok(p27);
assert.equal(p27.consecutive, 7, 'original p27 seven consecutive-sum whole-word pairs');
assert.equal(p27.matches.length, 1);
const p27Words = unsolved.filter((w) => w.page === 27);
assert.equal(p27Words.length, 52);
assert.deepEqual(p27Words.filter((w) => [34,66].includes(w.start))
  .map((w) => [w.start, w.sum]), [[34,103],[66,104]]);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(bytes[102], 32);
assert.equal(bytes[103], 206);
assert.equal(206 - 32, 3 * 58);
// Deterministic planted pair: original whole words at starts34 and66
// also satisfy the source-selected rule in a standalone synthetic page.
const fake = [
  {page:27,start:34,sum:103,runes:p27Words.find((w)=>w.start===34).runes},
  {page:27,start:66,sum:104,runes:p27Words.find((w)=>w.start===66).runes},
];
assert.equal(scan(fake).matches.length, 1);
fake[1] = {...fake[1],start:67};
assert.equal(scan(fake).matches.length, 0, 'one-rune offset counterexample');
/**
 * Whole-book null for the ALREADY CHOSEN 103/104-to-p32 pointer predicate.
 * A single hit anywhere is the statistic: selecting p27 or those exact
 * ordinals after discovery would invalidate the calibration.
 * @param {RuneWord[]} array
 * @returns {number}
 */
function countHits(array) {
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    const a = array[i];
    for (let j = i + 1; j < array.length; j++) {
      const b = array[j];
      const low = Math.min(a.sum, b.sum);
      const high = Math.max(a.sum, b.sum);
      if (high !== low + 1 || low < 1 || high > 256) continue;
      const mapped = bytes[low - 1] % 58;
      if (bytes[high - 1] % 58 === mapped && b.start - a.start === mapped) count++;
    }
  }
  return count;
}
const pageWords = Array.from({length:56}, (_, page) =>
  unsolved.filter((word) => word.page === page)).filter((w) => w.length);
assert.equal(pageWords.length, 55);
assert.equal(pageWords.reduce((sum, w) => sum + countHits(w), 0), 1);

/** @type {number} */ let randomState = 0x7fab0283;
/** @returns {number} Deterministic uniform-integer pseudorandom fraction. */
function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}
/** @param {Array<number|RuneWord>} a */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
const nullTrials = 1600;
let sameLengthAtLeastOne = 0;
let wholeWordAtLeastOne = 0;
let sameLengthTotal = 0;
let wholeWordTotal = 0;
for (let trial = 0; trial < nullTrials; trial++) {
  let sameLengthHits = 0;
  let wholeWordHits = 0;
  for (const original of pageWords) {
    // Preserve the page, every original word slot and its length. Relabel
    // only words of the same printed GP-rune length on the same page.
    const groups = new Map();
    const fixed = original.map((word) => ({...word}));
    for (let i = 0; i < fixed.length; i++) {
      const len = fixed[i].runes.length;
      if (!groups.has(len)) groups.set(len, []);
      groups.get(len).push(i);
    }
    for (const group of groups.values()) {
      const sums = group.map((i) => fixed[i].sum);
      shuffle(sums);
      group.forEach((i, k) => { fixed[i].sum = sums[k]; });
    }
    sameLengthHits += countHits(fixed);
    // Independent relaxation: reorder entire original words on the same
    // page and recompute contiguous rune starts in the moved word order.
    const moved = original.map((word) => ({...word}));
    shuffle(moved);
    let offset = 0;
    for (const word of moved) {
      word.start = offset;
      offset += word.runes.length;
    }
    wholeWordHits += countHits(moved);
  }
  sameLengthTotal += sameLengthHits;
  wholeWordTotal += wholeWordHits;
  if (sameLengthHits >= 1) sameLengthAtLeastOne++;
  if (wholeWordHits >= 1) wholeWordAtLeastOne++;
}
assert.equal(sameLengthAtLeastOne, 115);
assert.equal(wholeWordAtLeastOne, 128);
assert.equal(sameLengthTotal, 118);
assert.equal(wholeWordTotal, 135);
const nullResults = {
  trials: nullTrials,
  seed: '0x7fab0283',
  sameLength: {atLeastOne: sameLengthAtLeastOne, meanHits: sameLengthTotal / nullTrials,
    addOneP: (sameLengthAtLeastOne + 1) / (nullTrials + 1)},
  wholeWordOrder: {atLeastOne: wholeWordAtLeastOne, meanHits: wholeWordTotal / nullTrials,
    addOneP: (wholeWordAtLeastOne + 1) / (nullTrials + 1)}
};
console.log(JSON.stringify({
  status:'PASS', unknownPages:55, originalRunes:12956,
  fragmentWords:unsolved.length, pagePairs:totalPairs,
  consecutivePrimeSumPairs:consecutive, matchingPointerPairs:matches,
  p27ConsecutivePairs:p27.consecutive,
  conditionalNull:nullResults,
  scope:'postselected original-source location invariant; no deciphered plaintext'
},null,2));
