'use strict';

/**
 * Original-source p32/p55 equal-position common-hidden-pad word gate.
 * Two pages with a repeated Commons tree motif give a concrete two-time-pad
 * hypothesis: C32_i=P32_i+K_i and C55_i=P55_i+K_i mod29 for i=0..75.
 * Every overlapping printed word pair must then satisfy
 * P32_i-P55_i=C32_i-C55_i mod29 at every shared rune position.
 *
 * This read-only SFT uses complete original printed words and a pinned
 * source-native 29-rune English lexicon; it never fits pad values.
 * Run on Node.js 22 from anywhere: node sims/lp2_tree32_55_samepad_word_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} pathFromRoot @returns {string} */
function read(pathFromRoot) {
  return fs.readFileSync(path.join(ROOT, pathFromRoot), 'utf8');
}

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} rawWord @returns {number[] | null} */
function encodeNativeGp(rawWord) {
  const w = rawWord.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < w.length;) {
    const token = tokens.find((t) => w.startsWith(t.s, i));
    if (!token) return null;
    result.push(token.i);
    i += token.s.length;
  }
  return result;
}

const lexicon = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const symbols = encodeNativeGp(match[1]);
  if (!symbols) continue;
  if (!lexicon.has(symbols.length)) lexicon.set(symbols.length, []);
  lexicon.get(symbols.length).push({ word: match[1], symbols });
}

/** @typedef {{start:number,end:number,symbols:number[]}} Word */
/** @param {string} segment @returns {Word[]} */
function parseWords(segment) {
  let start = 0;
  const result = [];
  for (const cell of segment.split(/[.-]+/)) {
    const symbols = [...cell]
      .filter((rune) => runeToIndex.has(rune))
      .map((rune) => runeToIndex.get(rune));
    if (!symbols.length) continue;
    result.push({ start, end: start + symbols.length, symbols });
    start += symbols.length;
  }
  return result;
}

const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const source32 = gp.pages.find((page) => page.page === 32).indices;
const source55 = gp.pages.find((page) => page.page === 55).indices;
assert.equal(source32.length, 121);
assert.equal(source55.length, 76);

// Runeless p50 is omitted from transcription: physical p55 is text index 54.
const words32 = parseWords(segments[32]).filter((word) => word.start < 76);
const words55 = parseWords(segments[54]);
assert.equal(words32.at(-1).end, 76);
assert.equal(words55.at(-1).end, 76);
assert.deepEqual(words32.flatMap((word) => word.symbols), source32.slice(0, 76));
assert.deepEqual(words55.flatMap((word) => word.symbols), source55);
assert.equal(words32.length, 13);
assert.equal(words55.length, 17);

/** @param {number} value @returns {number} */
const mod29 = (value) => (value % 29 + 29) % 29;
/** @param {number[]} c32 @param {number[]} c55 @returns {number[]} */
const differential = (c32, c55) =>
  c32.map((value, i) => mod29(value - c55[i]));

/**
 * Find a necessary matching pair of independently valid native-GP words.
 * A shared unknown key cancels, and neither candidate plaintext is fitted.
 * @param {Word} a @param {Word} b @param {number[]} delta
 * @returns {{lo:number,len:number,compatiblePairs:number,source32Choices:number,source55Choices:number}}
 */
function overlapSupport(a, b, delta) {
  const lo = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  const listA = lexicon.get(a.symbols.length) || [];
  const listB = lexicon.get(b.symbols.length) || [];
  if (lo >= end) return {
    lo, len: 0, compatiblePairs: 0,
    source32Choices: listA.length, source55Choices: listB.length
  };
  const countsB = new Map();
  for (const word of listB) {
    const key = word.symbols.slice(lo - b.start, end - b.start).join(',');
    countsB.set(key, (countsB.get(key) || 0) + 1);
  }
  let compatiblePairs = 0;
  for (const word of listA) {
    const key = Array.from({length: end - lo}, (_, i) =>
      mod29(word.symbols[lo - a.start + i] - delta[lo + i])).join(',');
    compatiblePairs += countsB.get(key) || 0;
  }
  return {
    lo, len: end - lo, compatiblePairs,
    source32Choices: listA.length, source55Choices: listB.length
  };
}

const originalDelta = differential(source32.slice(0, 76), source55);
const lockedPairs = [
  [9, 9, 6], [9, 15, 5], [25, 23, 5],
  [33, 36, 6], [50, 48, 5], [64, 64, 6]
];
const originalChecks = lockedPairs.map(([start32, start55, expectedOverlap]) => {
  const a = words32.find((word) => word.start === start32);
  const b = words55.find((word) => word.start === start55);
  assert.ok(a && b, 'all locked original words must exist');
  const support = overlapSupport(a, b, originalDelta);
  assert.equal(support.len, expectedOverlap);
  assert.equal(support.compatiblePairs, 0,
    'source pair is incompatible with shared-pad native-GP words');
  return {
    p32WordAt: start32, p55WordAt: start55,
    ...support, delta: originalDelta.slice(support.lo, support.lo + support.len)
  };
});

// Deterministic full-layout native-GP English plant under one unknown
// nonperiodic pad reused at the exact 76 positions. No dictionary fitting.
const plantWords32 = words32.map((w) => lexicon.get(w.symbols.length)[0].symbols);
const plantWords55 = words55.map((w) => lexicon.get(w.symbols.length)[0].symbols);
const plain32 = plantWords32.flat();
const plain55 = plantWords55.flat();
const key = Array.from({length:76}, (_, i) => mod29(7 + 17*i + i*i));
const encrypted32 = plain32.map((v, i) => mod29(v + key[i]));
const encrypted55 = plain55.map((v, i) => mod29(v + key[i]));
assert.deepEqual(encrypted32.map((v, i) => mod29(v - key[i])), plain32);
assert.deepEqual(encrypted55.map((v, i) => mod29(v - key[i])), plain55);
assert.deepEqual(differential(encrypted32, encrypted55),
  differential(plain32, plain55));

/** @param {Word[]} originalWords @param {number[][]} encodedWords @returns {Word[]} */
function reconstruct(originalWords, encodedWords) {
  return originalWords.map((w, i) => ({...w, symbols: encodedWords[i]}));
}
const synthetic32 = reconstruct(words32, plantWords32);
const synthetic55 = reconstruct(words55, plantWords55);
const plantedDelta = differential(encrypted32, encrypted55);
const positiveChecks = lockedPairs.map(([start32, start55]) => {
  const a = synthetic32.find((word) => word.start === start32);
  const b = synthetic55.find((word) => word.start === start55);
  const support = overlapSupport(a, b, plantedDelta);
  assert(support.compatiblePairs > 0,
    'the real shared-pad positive control must remain compatible');
  return support.compatiblePairs;
});

console.log(JSON.stringify({
  hypothesis: 'Equal 76-position hidden additive GP29 pad, p32/p55 page reset',
  originalSource: {p32Runes:121,p55Runes:76,p32PrefixWords:13,p55Words:17},
  wordLexiconSize: [...lexicon.values()].reduce((n, a) => n + a.length, 0),
  originalZeroCompatibleOverlapPairs: originalChecks,
  syntheticCommonPad: {
    plaintextRunesRecoveredPerPage: 76,
    exactDifferentialPositions: 76,
    compatiblePairsForSameSixOverlaps: positiveChecks
  },
  scope: 'Necessary-condition failure under complete original printed words and the pinned finite native-GP29 English lexicon; other registers, operations, transpositions and independently keyed pages are not tested.'
}, null, 2));
