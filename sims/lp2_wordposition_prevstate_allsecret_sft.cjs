'use strict';

/**
 * Original-LP2 necessary-condition test for arbitrary secret GP29 permutations
 * indexed by (visible word-local position, previous ciphertext symbol).
 *
 * Every state owns a full unknown 29! permutation. The sorted ciphertext
 * histogram in each state upper-bounds the frequency concentration of any
 * plaintext decoded by such permutations, independent of all secret keys.
 *
 * SFT: node sims/lp2_wordposition_prevstate_allsecret_sft.cjs
 * Node 20+, CommonJS, no network or third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const ROOT = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const indexed = new Map(gp.runes.map((g, i) => [g, i]));
const rx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const typed = read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '')
  .replace(/[\r\n%]/g, '');
const original = (typed.match(rx) || [])
  .map(word => Array.from(word, c => indexed.get(c)));
assert.equal(original.length, 2896);
const flat = original.flat();
assert.equal(flat.length, 12956);
assert.deepEqual(flat, gp.pages.filter(p => p.page < 56).flatMap(p => p.indices));
const pageStarts = new Set();
let total = 0;
for (const page of gp.pages.filter(p => p.page < 56 && p.indices.length)) {
  pageStarts.add(total);
  total += page.indices.length;
}
assert.equal(total, 12956);
assert.equal(pageStarts.size, 55);

/**
 * Counts the tight majorization envelope over all secret alphabet
 * permutations for the specified public state clock.
 *
 * word: reset predecessor at every printed word;
 * carry: continue predecessor through printed words and physical pages;
 * page: reset predecessor at each original physical page;
 * either: reset at words or physical pages.
 *
 * Each word-local exact position has its own secret permutation, so this
 * family already contains every shorter periodic word-phase clock.
 *
 * @param {number[][]} words - all native-GP rune indices in printed words
 * @param {'word'|'carry'|'page'|'either'} mode
 * @param {'exact'|'five'} phase
 * @returns {{states:number,top1:number,top12:number,top20:number}}
 */
function capacity(words, mode, phase) {
  const rows = new Map();
  let previous = 29;
  let globalIndex = 0;
  for (const word of words) {
    if (mode === 'word') previous = 29;
    for (let j = 0; j < word.length; j++, globalIndex++) {
      if (mode === 'page' && pageStarts.has(globalIndex)) previous = 29;
      if (mode === 'either' && (j === 0 || pageStarts.has(globalIndex))) {
        previous = 29;
      }
      const statePhase = phase === 'five' ? j % 5 : j;
      const state = statePhase * 30 + previous;
      let histogram = rows.get(state);
      if (!histogram) {
        histogram = Array(29).fill(0);
        rows.set(state, histogram);
      }
      histogram[word[j]]++;
      previous = word[j];
    }
  }
  assert.equal(globalIndex, 12956);
  const bound = Array(29).fill(0);
  for (const histogram of rows.values()) {
    histogram.sort((a, b) => b - a);
    let prefix = 0;
    for (let k = 0; k < 29; k++) {
      prefix += histogram[k];
      bound[k] += prefix;
    }
  }
  return {states: rows.size, top1: bound[0],
    top12: bound[11], top20: bound[19]};
}

/** @param {number[][]} words @returns {{top1:number,top12:number}} */
function nativeConcentration(words) {
  const h = Array(29).fill(0);
  for (const word of words) for (const c of word) h[c]++;
  h.sort((a, b) => b - a);
  return {top1: h[0], top12: h.slice(0, 12).reduce((a, b) => a + b, 0)};
}

/** @param {number} x @returns {number} */
function xorshift32(x) {
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}

/**
 * This positive control is fully reversible although its secret state
 * depends recursively on the previously published ciphertext symbol.
 * All secret affine maps below are invertible over GF(29).
 * @param {number[][]} plain
 * @returns {{encrypted:number[][],recovered:number[][]}}
 */
function plant(plain) {
  const encrypted = [];
  const recovered = [];
  for (const word of plain) {
    let previous = 29;
    const cipherWord = [];
    const decodedWord = [];
    for (let j = 0; j < word.length; j++) {
      const state = previous * 15 + j;
      const a = 1 + (13 * state + 3) % 28;
      const b = (17 * state + 7) % 29;
      const c = (a * word[j] + b) % 29;
      const possible = [];
      for (let p = 0; p < 29; p++) if ((a * p + b) % 29 === c) possible.push(p);
      assert.equal(possible.length, 1);
      cipherWord.push(c);
      decodedWord.push(possible[0]);
      previous = c;
    }
    encrypted.push(cipherWord);
    recovered.push(decodedWord);
  }
  assert.deepEqual(recovered, plain);
  return {encrypted, recovered};
}

const clocks = {};
for (const mode of ['word', 'carry', 'page', 'either']) {
  clocks[mode] = {
    five: capacity(original, mode, 'five'),
    exact: capacity(original, mode, 'exact')
  };
}
assert.deepEqual(clocks.word.exact,
  {states: 309, top1: 1175, top12: 8459, top20: 11341});
assert.deepEqual(clocks.carry.exact,
  {states: 338, top1: 1283, top12: 8978, top20: 11785});
assert.deepEqual(clocks.page.exact,
  {states: 346, top1: 1291, top12: 9001, top20: 11799});
assert.deepEqual(clocks.either.exact,
  {states: 317, top1: 1183, top12: 8475, top20: 11348});
assert.equal(clocks.word.five.top12, 7942);
assert.equal(clocks.carry.five.top12, 8248);

/**
 * One author-visible chapter-boundary rekey, with the published previous
 * ciphertext carried across the cut. This upper bound is independent of
 * either epoch's completely secret alphabet tables.
 * @param {number} cut - global source rune ordinal, 0-based
 * @returns {number} maximal count among plaintext's twelve most common runes
 */
function oneRekeyTop12(cut) {
  const rows = new Map();
  let previous = 29;
  let index = 0;
  for (const word of original) {
    for (let j = 0; j < word.length; j++, index++) {
      const epoch = index >= cut ? 1 : 0;
      const state = epoch * 450 + j * 30 + previous;
      let h = rows.get(state);
      if (!h) {
        h = Array(29).fill(0);
        rows.set(state, h);
      }
      h[word[j]]++;
      previous = word[j];
    }
  }
  let top12 = 0;
  for (const h of rows.values()) {
    h.sort((a, b) => b - a);
    top12 += h.slice(0, 12).reduce((a, b) => a + b, 0);
  }
  return top12;
}

const visualChapterCuts = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648];
const oneRekeyTop12ByChapter = visualChapterCuts.map(oneRekeyTop12);
assert.deepEqual(oneRekeyTop12ByChapter,
  [9275, 9714, 10000, 10140, 10163, 10142, 9969, 9110]);

/**
 * A stronger lexicon-limited invariant: source-native English permits at
 * most the one-rune words A, I, O (generously including archaic O).
 * At every predecessor+epoch state, distinct published singleton C values
 * require distinct plaintext runes under a bijective substitution.
 *
 * @param {number[]} cuts - source-visible rune indices at which keys rekey
 * @param {number} vocabularySize - default 3 (A/I/O)
 * @returns {{badGroups:number,excess:number,maxDistinct:number,groups:number}}
 */
function singletonGate(cuts, vocabularySize = 3) {
  const groups = new Map();
  let index = 0;
  let previous = 29;
  for (const word of original) {
    for (let j = 0; j < word.length; j++, index++) {
      if (word.length === 1) {
        let epoch = 0;
        for (const cut of cuts) if (index >= cut) epoch++;
        const key = epoch * 30 + previous;
        let letters = groups.get(key);
        if (!letters) {
          letters = new Set();
          groups.set(key, letters);
        }
        letters.add(word[0]);
      }
      previous = word[j];
    }
  }
  let badGroups = 0;
  let excess = 0;
  let maxDistinct = 0;
  for (const set of groups.values()) {
    maxDistinct = Math.max(maxDistinct, set.size);
    if (set.size > vocabularySize) {
      badGroups++;
      excess += set.size - vocabularySize;
    }
  }
  return {badGroups, excess, maxDistinct, groups: groups.size};
}

const singletonGlobal = singletonGate([]);
assert.deepEqual(singletonGlobal,
  {badGroups: 9, excess: 15, maxDistinct: 6, groups: 28});
const singletonByOneRekey = visualChapterCuts.map(cut => singletonGate([cut]));
assert.deepEqual(singletonByOneRekey.map(x => x.excess),
  [13, 10, 4, 3, 3, 6, 9, 15]);
const singletonCutCounts = Array.from({length: 9},
  (_, cuts) => ({cuts, combinations: 0, viable: 0}));
const minimumViableTwoCuts = [];
for (let mask = 0; mask < 256; mask++) {
  const cuts = visualChapterCuts.filter((_, i) => (mask & (1 << i)) !== 0);
  const count = cuts.length;
  const score = singletonGate(cuts);
  singletonCutCounts[count].combinations++;
  if (score.badGroups === 0) {
    singletonCutCounts[count].viable++;
    if (count === 2) minimumViableTwoCuts.push(
      visualChapterCuts.flatMap((_, i) => (mask & (1 << i)) ? [i + 1] : []));
  }
}
assert.deepEqual(singletonCutCounts.map(x => x.viable),
  [0, 0, 2, 11, 25, 30, 20, 7, 1]);
assert.deepEqual(minimumViableTwoCuts, [[3, 4], [3, 5]]);
assert.deepEqual(singletonGate(visualChapterCuts, 2),
  {badGroups: 2, excess: 2, maxDistinct: 3, groups: 68});

const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const controls = [];
for (const source of sources) {
  const pools = new Map();
  const sourceWords = (read(source).match(/[A-Za-z]+/g) || [])
    .map(encodeSourceNativeGP);
  for (const word of sourceWords) {
    let pool = pools.get(word.length);
    if (!pool) {
      pool = [];
      pools.set(word.length, pool);
    }
    pool.push(word);
  }
  let minimumTop12 = Infinity;
  let maximumTop12 = -Infinity;
  let minimumTop1 = Infinity;
  let first = null;
  for (let trial = 0; trial < 64; trial++) {
    let seed = (0x33014343 + trial * 0x1f123bb5) >>> 0;
    const native = [];
    for (const word of original) {
      seed = xorshift32(seed);
      const pool = pools.get(word.length);
      assert(pool && pool.length > 0, source + ': missing GP word length ' + word.length);
      native.push(pool[seed % pool.length]);
    }
    assert.equal(native.flat().length, 12956);
    const score = nativeConcentration(native);
    minimumTop12 = Math.min(minimumTop12, score.top12);
    maximumTop12 = Math.max(maximumTop12, score.top12);
    minimumTop1 = Math.min(minimumTop1, score.top1);
    if (trial === 0) first = native;
  }
  assert(first);
  assert(minimumTop12 > clocks.page.exact.top12);
  controls.push({source, sourceWords: sourceWords.length, matchedBooks: 64,
    minimumTop12, maximumTop12, minimumTop1});
  if (source === sources[0]) {
    const planted = plant(first);
    const bound = capacity(planted.encrypted, 'word', 'exact');
    const actual = nativeConcentration(first);
    assert(bound.top12 >= actual.top12);
    assert(bound.top1 >= actual.top1);
    assert.equal(planted.recovered.flat().length, 12956);
  }
}
console.log(JSON.stringify({
  classification: 'key-independent necessary-condition exclusion, GP-native-reference conditional',
  source: 'original LP2 pp0-55, exact printed words and page starts',
  runes: 12956,
  words: 2896,
  clocks,
  oneRekeyTop12ByChapter,
  visualChapterCuts,
  singletonGlobal,
  singletonByOneRekey,
  singletonCutCounts,
  minimumViableTwoCuts,
  nativeMatchedControls: controls,
  sourceNativePositivePlant: '12956/12956 exact inverse',
  caveat: 'no unknown plaintext/key, altered word segmentation, extra state or chapter-specific keys remain open'
}, null, 2));
