'use strict';

/**
 * GP29 previous-cipher-state all-secret capacity gate.
 *
 * Test the strongest possible ordinary GP29 symbol-frequency recovery of
 * any chapter-stationary bijective decoder P_i = D_(chapter,C_(i-1))(C_i).
 * For every hidden decoder permutation, the maximal plaintext copies of
 * a chosen m-symbol set are the m most frequent next cipher runes for
 * each observed (chapter,previous cipher rune) state.
 *
 * Original word-boundary flag can optionally be an additional public input.
 * Requires Node.js 22; run:
 *   node sims/lp2_chapter_predecessor_allsecret_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(ROOT, filename), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = db.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const transcripts = read('resources/lp2-transcription.txt').split('%').slice(0, 55);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const runeIndex = new Map(db.runes.map((r, i) => [r, i]));
assert.equal(pages.length, 55);
assert.equal(transcripts.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * @typedef {{page:number,chapter:number,q:number,c:number,boundary:boolean}} Transition
 */
/** @type {Transition[]} */
const original = [];
for (let slot = 0; slot < 55; slot++) {
  const physical = slot < 50 ? slot : slot + 1;
  const chars = [...transcripts[slot]];
  /** @type {Array<{r:number,pos:number}>} */
  const positions = [];
  chars.forEach((rune, i) => {
    if (runeIndex.has(rune)) positions.push({r: runeIndex.get(rune), pos: i});
  });
  const source = pages[slot];
  assert.equal(source.page, physical);
  assert.deepEqual(positions.map((p) => p.r), source.indices);
  const chapter = chapters.findIndex(([lo, hi]) => physical >= lo && physical <= hi);
  assert(chapter >= 0);
  for (let i = 1; i < positions.length; i++) {
    const previous = positions[i - 1];
    const current = positions[i];
    const between = chars.slice(previous.pos + 1, current.pos);
    const boundary = between.some((c) => '.-&$§'.includes(c));
    original.push({page: physical, chapter, q: previous.r, c: current.r, boundary});
  }
}
assert.equal(original.length, 12901);
assert.equal(original.filter((r) => r.boundary).length, 2873);

/**
 * Compute an exact all-secret upper bound by granting each observable state
 * an entirely arbitrary secret GP29 permutation, independently per state.
 *
 * @param {Transition[]} stream
 * @param {Array<keyof Transition>} stateFields
 * @param {number} alphabetSubsetSize
 * @returns {{transitions:number,states:number,capacityTransitions:number,
 *    capacityIncludingPageStarts:number}}
 */
function capacity(stream, stateFields, alphabetSubsetSize) {
  /** @type {Map<string,number[]>} */
  const histograms = new Map();
  for (const record of stream) {
    const key = stateFields.map((field) => String(record[field])).join(':');
    if (!histograms.has(key)) histograms.set(key, Array(29).fill(0));
    histograms.get(key)[record.c]++;
  }
  let maximum = 0;
  for (const histogram of histograms.values()) {
    maximum += histogram.slice().sort((a, b) => b - a)
      .slice(0, alphabetSubsetSize).reduce((a, b) => a + b, 0);
  }
  // An optimistic allowance: every original physical page's initial rune
  // is wholly unconstrained, even if the real cipher carries chapter state.
  return {transitions: stream.length, states: histograms.size,
    capacityTransitions: maximum, capacityIncludingPageStarts: maximum + 55};
}

const observed = {
  globalOne: capacity(original, ['q'], 1),
  globalTwo: capacity(original, ['q'], 2),
  globalBoundaryOne: capacity(original, ['q', 'boundary'], 1),
  globalBoundaryTwo: capacity(original, ['q', 'boundary'], 2),
  chapterOne: capacity(original, ['chapter', 'q'], 1),
  chapterTwo: capacity(original, ['chapter', 'q'], 2),
  chapterBoundaryOne: capacity(original, ['chapter', 'q', 'boundary'], 1),
  chapterBoundaryTwo: capacity(original, ['chapter', 'q', 'boundary'], 2),
  pageOne: capacity(original, ['page', 'q'], 1),
  pageTwo: capacity(original, ['page', 'q'], 2)
};
assert.deepEqual(Object.fromEntries(Object.entries(observed)
  .map(([name, value]) => [name, value.capacityIncludingPageStarts])), {
  globalOne: 769, globalTwo: 1414,
  globalBoundaryOne: 854, globalBoundaryTwo: 1562,
  chapterOne: 1310, chapterTwo: 2344,
  chapterBoundaryOne: 1635, chapterBoundaryTwo: 2885,
  pageOne: 2790, pageTwo: 4787
});
assert.deepEqual([
  observed.chapterOne.states, observed.chapterBoundaryOne.states,
  observed.pageOne.states
], [261, 521, 1590]);

const tokens = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * Match the pinned existing source-native control normalization without
 * introducing unknown plaintext symbols.
 *
 * @param {string} source
 * @returns {number[]}
 */
function encodeNativeGp(source) {
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const symbols = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find((item) => word.startsWith(item.token, i));
      assert(t, 'Unmapped source word: ' + word.slice(i));
      symbols.push(t.index);
      i += t.token.length;
    }
  }
  return symbols;
}
const E = db.translit.indexOf('E');
const O = db.translit.indexOf('O');
const N = 12956;
const controlSources = [
  {name: 'Shakespeare', filename: 'resources/control/shakespeare_first300k.txt',
    length: 218800, windows: 32},
  {name: 'Gibran', filename: 'resources/control/gibran_prophet_58585.txt',
    length: 63114, windows: 8},
  {name: 'Emerson', filename: 'resources/control/emerson_essays_2944.txt',
    length: 324630, windows: 49}
];
let samplePlaintext = null;
const controls = [];
for (const control of controlSources) {
  const all = encodeNativeGp(read(control.filename));
  assert.equal(all.length, control.length);
  /** @type {Array<{e:number,eo:number}>} */
  const windows = [];
  for (let start = 0; start + N <= all.length; start += Math.floor(N / 2)) {
    const native = all.slice(start, start + N);
    if (samplePlaintext === null) samplePlaintext = native;
    const e = native.filter((i) => i === E).length;
    const eo = native.filter((i) => i === E || i === O).length;
    windows.push({e, eo});
  }
  assert.equal(windows.length, control.windows);
  controls.push({author: control.name, windows: windows.length,
    minimumE: Math.min(...windows.map((v) => v.e)),
    minimumEplusO: Math.min(...windows.map((v) => v.eo)),
    allExceedChapterOne: windows.every((v) =>
      v.e > observed.chapterOne.capacityIncludingPageStarts),
    allExceedChapterTwo: windows.every((v) =>
      v.eo > observed.chapterTwo.capacityIncludingPageStarts)});
}
assert.deepEqual(controls.map((c) => [c.minimumE, c.minimumEplusO]),
  [[1430, 2471], [1437, 2608], [1491, 2464]]);
assert(controls.every((c) => c.allExceedChapterOne && c.allExceedChapterTwo));
assert.equal(controls.reduce((sum, c) => sum + c.windows, 0), 89);

// Full secret-key positive plant: all 9*29 inverse tables are independent
// secret permutations. Recover complete native GP English, including all 55
// physical page start positions, and verify the all-secret bound holds.
/** @type {number} */
let seed = 0x3301c7a9;
/** @returns {number} */
function randomUint32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @returns {number[]} */
function randomPermutation() {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const secretForward = Array.from({length: chapters.length},
  () => Array.from({length: 29}, () => randomPermutation()));
const secretInverse = secretForward.map((byPrevious) => byPrevious.map((perm) => {
  const inverse = Array(29);
  perm.forEach((cipher, plaintext) => { inverse[cipher] = plaintext; });
  return inverse;
}));
const planted = [];
const recovered = [];
let offset = 0;
for (const p of pages) {
  const chapter = chapters.findIndex(([lo, hi]) => p.page >= lo && p.page <= hi);
  const plain = samplePlaintext.slice(offset, offset + p.indices.length);
  assert(plain.length > 0);
  const enc = [plain[0]];
  const dec = [enc[0]];
  for (let i = 1; i < plain.length; i++) {
    const previous = enc[i - 1];
    const cipher = secretForward[chapter][previous][plain[i]];
    enc.push(cipher);
    dec.push(secretInverse[chapter][previous][cipher]);
  }
  assert.deepEqual(dec, plain);
  planted.push(...enc);
  recovered.push(...dec);
  offset += plain.length;
}
assert.equal(offset, N);
assert.deepEqual(recovered, samplePlaintext);

const plantedRecords = [];
let k = 0;
let start = 0;
for (const p of pages) {
  const cipherPage = planted.slice(start, start + p.indices.length);
  for (let i = 1; i < cipherPage.length; i++) {
    const evidence = original[k++];
    plantedRecords.push({...evidence, q: cipherPage[i - 1], c: cipherPage[i]});
  }
  start += p.indices.length;
}
assert.equal(k, original.length);
assert.equal(start, N);
const plantedE = samplePlaintext.filter((i) => i === E).length;
const plantedEO = samplePlaintext.filter((i) => i === E || i === O).length;
const plantedCapE = capacity(plantedRecords, ['chapter', 'q'], 1)
  .capacityIncludingPageStarts;
const plantedCapEO = capacity(plantedRecords, ['chapter', 'q'], 2)
  .capacityIncludingPageStarts;
assert(plantedCapE >= plantedE && plantedCapEO >= plantedEO);

console.log('PASS: original 12,956 GP29 runes, 12,901 page-internal transitions,');
console.log('all-secret 9-chapter previous-cipher-state capacity, 89 native-GP');
console.log('controls, original word-boundary contrast, and complete 12,956-rune plant.');
console.log(JSON.stringify({observed, controls, positivePlant: {
  recoveredSymbols: recovered.length, plantedE, plantedEO,
  plantedCapE, plantedCapEO, exactRoundtrip: true
}, decision: 'Chapter-static previous-cipher-only GP29 bijections fail native-English E and E+O capacity. Original word-boundary state removes this specific frequency obstruction without recovering plaintext or selecting a secret key.'}, null, 2));
