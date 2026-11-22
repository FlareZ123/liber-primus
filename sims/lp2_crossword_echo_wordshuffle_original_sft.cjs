'use strict';

/**
 * Original LP2 printed-boundary echo test, Node 22 / CommonJS.
 * Run from any working directory: node sims/lp2_crossword_echo_wordshuffle_original_sft.cjs
 * No new dependencies, downloads or file writes.
 *
 * Scope: 55 rune-bearing unknown physical pages p0..p55; numeric p50 excluded.
 * Raw '%' splits are transcription records, not all physical pages, because p50
 * has no rune transcript. Physical p51 maps to raw record 50, etc.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pathModule = require('node:path');

const BASE = pathModule.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(pathModule.join(BASE, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(pathModule.join(BASE, 'lp2-transcription.txt'), 'utf8');
const rawPages = transcription.split('%');
const alphabet = corpus.runes;
const runeSet = new Set(alphabet);
const N_SAMPLES = 20000;
assert.equal(rawPages.length, 57);
assert.equal(alphabet.length, 29);

/** @typedef {{first:number,last:number,len:number}} Word */
/** @typedef {{page:number,words:Word[]}} Page */

/**
 * Keep only actual printed '-' and '.' word/sentence delimiters. '/' and
 * newlines are typography, and red Arabic list labels are not GP runes.
 * @param {string} raw
 * @returns {string[]}
 */
function getWordUnits(raw) {
  return raw.replace(/[\s/0-9&$]/g, '')
    .split(/[-.]/)
    .map(piece => [...piece].filter(ch => runeSet.has(ch)).join(''))
    .filter(Boolean);
}

/** @type {Page[]} */
const pages = [];
let runeTotal = 0;
let completeWords = 0;
let withinDoublets = 0;
let boundaryDoublets = 0;
let boundaryN = 0;

for (let physical = 0; physical <= 55; physical++) {
  if (physical === 50) continue;
  const record = physical < 50 ? physical : physical - 1;
  const units = getWordUnits(rawPages[record]);
  const canonical = corpus.pages[physical].indices.map(index => alphabet[index]).join('');
  assert.equal(units.join(''), canonical, 'page ' + physical + ' original-runic equality');
  const words = units.map(unit => ({
    first: alphabet.indexOf(unit[0]),
    last: alphabet.indexOf(unit.at(-1)),
    len: unit.length
  }));
  assert(words.length > 0);
  pages.push({ page: physical, words });
  completeWords += words.length;
  runeTotal += canonical.length;
  boundaryN += words.length - 1;
  for (let i = 0; i < units.length; i++) {
    for (let j = 1; j < units[i].length; j++)
      if (units[i][j] === units[i][j - 1]) withinDoublets++;
    if (i && words[i - 1].last === words[i].first) boundaryDoublets++;
  }
}

assert.equal(runeTotal, 12956);
assert.equal(completeWords, 2928); // Physical-page fragments; 32 carry splits.
assert.equal(boundaryN, 2873);
assert.equal(withinDoublets, 63);
assert.equal(boundaryDoublets, 23);
assert.equal(withinDoublets + boundaryDoublets, 86);

/** Exact expected adjacent word-edge equalities under page-local permutation. */
function exactAllWordsExpectation() {
  let result = 0;
  for (const { words } of pages) {
    const starts = Array(29).fill(0);
    const ends = Array(29).fill(0);
    let self = 0;
    for (const w of words) {
      starts[w.first]++;
      ends[w.last]++;
      if (w.first === w.last) self++;
    }
    let pairs = -self;
    for (let x = 0; x < 29; x++) pairs += starts[x] * ends[x];
    // Any ordered pair of distinct words is adjacent in 1/n permutations.
    result += pairs / words.length;
  }
  return result;
}

const exactMean = exactAllWordsExpectation();
assert(Math.abs(exactMean - 99.08374289405094) < 1e-9);

/**
 * Deterministic xorshift32; only randomizes the placement of authentic source
 * word units. The test itself is independent of the PRNG algorithm.
 * @param {number} seed
 * @returns {(n:number)=>number}
 */
function makeRandom(seed) {
  let state = seed >>> 0;
  return n => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % n;
  };
}

/**
 * Strongest null fixes, slot by slot, the original word length AND first rune.
 * Thus any effect from the true word-initial rune histogram is conditioned out.
 *
 * @param {'page'|'length'|'length-first'} kind
 * @param {number} seed
 */
function randomized(kind, seed) {
  const random = makeRandom(seed);
  const structures = pages.map(({ words }) => {
    /** @type {Map<string, number[]>} */
    const byType = new Map();
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const type = kind === 'page' ? 'all'
        : kind === 'length' ? String(w.len)
        : w.len + ':' + w.first;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push(i);
    }
    return { words, groups: [...byType.values()] };
  });

  let sum = 0;
  let squares = 0;
  let minimum = Infinity;
  let maximum = -Infinity;
  let atMostActual = 0;
  for (let trial = 0; trial < N_SAMPLES; trial++) {
    let equal = 0;
    for (const { words, groups } of structures) {
      const order = words.map((_, i) => i);
      for (const group of groups) {
        const moved = group.slice();
        for (let i = moved.length - 1; i > 0; i--) {
          const j = random(i + 1);
          [moved[i], moved[j]] = [moved[j], moved[i]];
        }
        for (let k = 0; k < group.length; k++) order[group[k]] = moved[k];
      }
      for (let i = 1; i < order.length; i++)
        if (words[order[i - 1]].last === words[order[i]].first) equal++;
    }
    if (equal <= boundaryDoublets) atMostActual++;
    minimum = Math.min(minimum, equal);
    maximum = Math.max(maximum, equal);
    sum += equal;
    squares += equal * equal;
  }
  const mean = sum / N_SAMPLES;
  return {
    null: kind,
    trials: N_SAMPLES,
    mean,
    sd: Math.sqrt(squares / N_SAMPLES - mean * mean),
    minimum,
    maximum,
    atMostActual,
    upperBoundTail: (atMostActual + 1) / (N_SAMPLES + 1)
  };
}

const results = [
  randomized('page', 0xc7a72517),
  randomized('length', 0xb6dce5c1),
  randomized('length-first', 0x26feb811)
];
for (const result of results) assert.equal(result.atMostActual, 0);
assert(Math.abs(results[0].mean - exactMean) < 1);
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-transcription.txt',
  completeRunicPages: pages.length,
  originalRunes: runeTotal,
  pageLocalWordUnits: completeWords,
  withinWord: {
    pairs: runeTotal - completeWords,
    identical: withinDoublets
  },
  betweenWords: {
    pairs: boundaryN,
    identical: boundaryDoublets,
    observedRate: boundaryDoublets / boundaryN,
    exactRandomOrderExpectation: exactMean
  },
  nulls: results,
  status: 'PASS - original rune equality and frozen randomization checks'
}, null, 2));
