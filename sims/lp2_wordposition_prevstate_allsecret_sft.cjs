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

/**
 * Two disjoint four-distinct singleton groups prove a one-time key rekey
 * impossible EVEN AT AN ARBITRARY RUNE OFFSET, without assuming any chapter
 * boundaries. Original zero-based absolute source positions:
 *
 * predecessor L: (EA,Y,W,I) appear by position 4006;
 * predecessor EA: (AE,N,M,J) appear after position 5319.
 *
 * A single rekey at e would require e <= 4006 to split the former
 * and e > 5319 to split the latter. This is a contradiction.
 */
const singletonEvents = [];
let singletonPosition = 0;
let singletonPrevious = 29;
for (const word of original) {
  if (word.length === 1) {
    singletonEvents.push({position: singletonPosition,
      previous: singletonPrevious, cipher: word[0]});
  }
  for (const c of word) {
    singletonPrevious = c;
    singletonPosition++;
  }
}
assert.equal(singletonPosition, 12956);
assert.equal(singletonEvents.length, 83);
const originalSingletonLookup = new Map(singletonEvents.map(x => [x.position, x]));
const proofLeft = [[176, 20, 28], [3275, 20, 7],
  [3738, 20, 26], [4006, 20, 10]];
const proofRight = [[5319, 28, 25], [5336, 28, 9],
  [6994, 28, 19], [7683, 28, 11]];
for (const [position, previous, cipher] of [...proofLeft, ...proofRight]) {
  assert.deepEqual(originalSingletonLookup.get(position),
    {position, previous, cipher});
}
assert.equal(new Set(proofLeft.map(x => x[2])).size, 4);
assert.equal(new Set(proofRight.map(x => x[2])).size, 4);
assert.equal(proofLeft.at(-1)[0], 4006);
assert.equal(proofRight[0][0], 5319);

/**
 * A second disjoint certificate covers word-reset and word-or-page-reset
 * predecessor policies. At every original singleton the predecessor becomes
 * the same sentinal 29. Four distinct C symbols occur by offset530 and
 * another four occur from offset12233 onward, again ruling out any one cut.
 * The carried-predecessor witnesses above are never at a physical-page
 * first rune, so the first certificate also covers page-only resets.
 */
const wordResetLeft = [[176, 28], [244, 15], [350, 9], [530, 1]];
const wordResetRight = [[12233, 28], [12254, 19],
  [12648, 24], [12770, 21]];
for (const [position, cipher] of [...wordResetLeft, ...wordResetRight]) {
  assert.equal(originalSingletonLookup.get(position).cipher, cipher);
}
assert.equal(new Set(wordResetLeft.map(x => x[1])).size, 4);
assert.equal(new Set(wordResetRight.map(x => x[1])).size, 4);
assert.equal(wordResetLeft.at(-1)[0], 530);
assert.equal(wordResetRight[0][0], 12233);
for (const [position] of [...proofLeft, ...proofRight]) {
  assert.equal(pageStarts.has(position), false);
}

/** @param {number} start @param {number} end */
function feasibleSingletonInterval(start, end) {
  const h = new Map();
  for (let i = start; i < end; i++) {
    const event = singletonEvents[i];
    let seen = h.get(event.previous);
    if (!seen) {
      seen = new Set();
      h.set(event.previous, seen);
    }
    seen.add(event.cipher);
    if (seen.size > 3) return false;
  }
  return true;
}

const E = singletonEvents.length;
const ok = Array.from({length: E + 1}, (_, a) =>
  Array.from({length: E + 1}, (_, b) =>
    b >= a && feasibleSingletonInterval(a, b)));
const singletonGapOneRekeys = [];
const singletonGapTwoRekeys = [];
for (let i = 0; i <= E; i++) {
  if (ok[0][i] && ok[i][E]) singletonGapOneRekeys.push(i);
  for (let j = i; j <= E; j++) {
    if (ok[0][i] && ok[i][j] && ok[j][E]) {
      singletonGapTwoRekeys.push([i, j]);
    }
  }
}
assert.equal(singletonGapOneRekeys.length, 0);
assert.equal(singletonGapTwoRekeys.length, 172);
assert.deepEqual([
  Math.min(...singletonGapTwoRekeys.map(x => x[0])),
  Math.max(...singletonGapTwoRekeys.map(x => x[0]))
], [16, 27]);
assert.deepEqual([
  Math.min(...singletonGapTwoRekeys.map(x => x[1])),
  Math.max(...singletonGapTwoRekeys.map(x => x[1]))
], [41, 57]);

/**
 * Source-physical-page control: visible chapter cuts alone make p15 appear
 * more specific than the singleton data actually warrant. Count all two-key
 * replacements at any printed physical page start.
 */
let runningPageOffset = 0;
const physicalCuts = [];
for (const page of gp.pages.filter(p => p.page < 56)) {
  if (page.page > 0 && page.indices.length) {
    physicalCuts.push({page: page.page, offset: runningPageOffset});
  }
  runningPageOffset += page.indices.length;
}
assert.equal(runningPageOffset, 12956);
assert.equal(physicalCuts.length, 54);
const validPhysicalTwoCuts = [];
for (let i = 0; i < physicalCuts.length; i++) {
  for (let j = i + 1; j < physicalCuts.length; j++) {
    const x = physicalCuts[i], y = physicalCuts[j];
    if (singletonGate([x.offset, y.offset]).badGroups === 0) {
      validPhysicalTwoCuts.push([x.page, y.page]);
    }
  }
}
assert.equal(validPhysicalTwoCuts.length, 54);
assert.deepEqual([...new Set(validPhysicalTwoCuts.map(p => p[0]))],
  [11, 12, 13, 14, 15, 16]);
assert.deepEqual([...new Set(validPhysicalTwoCuts.map(p => p[1]))],
  [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
assert.equal(validPhysicalTwoCuts.filter(p => p[0] === 15).length, 10);

/**
 * Exact minimum number of arbitrary consecutive key epochs when the cipher
 * predecessor resets at EVERY printed word. Every single-rune word uses the
 * same j=0, sentinel29 state, and each epoch's bijection may encode at most
 * three distinct ciphertext singleton values from A/I/O.
 *
 * Greedy longest feasible intervals minimize the number of contiguous
 * intervals: any earlier cut can only increase the remaining suffix length.
 * Verify that proof algorithm by an independent exhaustive 83-site DP.
 */
const uniqueSingletonCipherValues = new Set(
  singletonEvents.map(event => event.cipher)).size;
assert.equal(uniqueSingletonCipherValues, 28);
let greedyEpochs = 0;
let symbols = new Set();
for (const event of singletonEvents) {
  if (!symbols.has(event.cipher) && symbols.size === 3) {
    greedyEpochs++;
    symbols = new Set();
  }
  symbols.add(event.cipher);
}
if (symbols.size) greedyEpochs++;
assert.equal(greedyEpochs, 26);
const minimumWordResetEpochs = Array(E + 1).fill(Infinity);
minimumWordResetEpochs[0] = 0;
for (let stop = 1; stop <= E; stop++) {
  for (let start = 0; start < stop; start++) {
    const distinct = new Set(singletonEvents.slice(start, stop)
      .map(event => event.cipher)).size;
    if (distinct <= 3) {
      minimumWordResetEpochs[stop] = Math.min(
        minimumWordResetEpochs[stop], minimumWordResetEpochs[start] + 1);
    }
  }
}
assert.equal(minimumWordResetEpochs[E], greedyEpochs);
assert.ok(uniqueSingletonCipherValues > 9 * 3,
  'even all nine independently keyed chapters cannot cover singleton alphabet');

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
  arbitraryRekeyCertificate: {carryOrPage: {left: proofLeft, right: proofRight,
    oneRekeyContradiction: 'e <= 4006 and e > 5319'},
    wordOrEither: {left: wordResetLeft, right: wordResetRight,
    oneRekeyContradiction: 'e <= 530 and e > 12233'}},
  singletonGapTwoRekeyChoices: singletonGapTwoRekeys.length,
  physicalPageTwoRekeyChoices: validPhysicalTwoCuts,
  wordResetMinimum: {distinctCipherSingletonTypes: uniqueSingletonCipherValues,
    minimumEpochs: greedyEpochs, minimumRekeys: greedyEpochs - 1,
    nineChapterAbsoluteCapacity: 9 * 3},
  nativeMatchedControls: controls,
  sourceNativePositivePlant: '12956/12956 exact inverse',
  caveat: 'no unknown plaintext/key, altered word segmentation, extra state or chapter-specific keys remain open'
}, null, 2));
