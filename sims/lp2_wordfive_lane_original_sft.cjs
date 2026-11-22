'use strict';
/**
 * Five-lane printed-word transposition gate on the original LP2 ciphertext.
 *
 * SFT (Windows Node.js 22): node sims/lp2_wordfive_lane_original_sft.cjs
 * Every input is pinned in the repository. No fitted key or plaintext crib.
 * This tests a fixed, lossless, period-five lane-major readout and its inverse.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphs = corpus.runes;
const valid = new Set(glyphs);
const pages = read('resources/lp2-transcription.txt').split('%');
assert.equal(pages.length, 57);

/** Source punctuation, line-break, and page-carry aware word reader.
 * @param {string} s @returns {number[][]}
 */
function parseWords(s) {
  return s.replace(/[\/\s]/g, '').split(/[-.&$§]+/)
    .filter(w => w.length > 0 && Array.from(w).every(g => valid.has(g)))
    .map(w => Array.from(w, g => glyphs.indexOf(g)));
}

/** Round-robin distribute symbols into lanes 0..4, then concatenate lanes.
 * @param {number[]} word @returns {number[]}
 */
function encode(word) {
  const lanes = Array.from({length: 5}, () => []);
  word.forEach((symbol, i) => lanes[i % 5].push(symbol));
  return lanes.flat();
}

/** Reverse lane-major readout, preserving all symbol identities and length.
 * @param {number[]} word @returns {number[]}
 */
function decode(word) {
  const out = Array(word.length);
  let k = 0;
  for (let lane = 0; lane < 5; lane++) {
    for (let i = lane; i < word.length; i += 5) out[i] = word[k++];
  }
  assert.equal(k, word.length);
  return out;
}

/** @param {number[][]} words @returns {object} */
function stats(words) {
  const histogram = Array(29).fill(0);
  let n = 0, lagFive = 0, eligibleLagFive = 0;
  let adjacentEqual = 0, eligibleAdjacent = 0;
  const singletons = new Set();
  let singletonWords = 0;
  for (const w of words) {
    if (w.length === 1) {
      singletons.add(w[0]);
      singletonWords++;
    }
    for (let i = 0; i < w.length; i++) {
      n++;
      histogram[w[i]]++;
      if (i >= 1) {
        eligibleAdjacent++;
        if (w[i] === w[i - 1]) adjacentEqual++;
      }
      if (i >= 5) {
        eligibleLagFive++;
        if (w[i] === w[i - 5]) lagFive++;
      }
    }
  }
  return {
    wordCount: words.length, runeCount: n,
    singletonWords, distinctSingletonGlyphs: singletons.size,
    lagFive, eligibleLagFive, adjacentEqual, eligibleAdjacent,
    histogram,
    globalIoc: histogram.reduce((sum, value) =>
      sum + value * (value - 1), 0) / (n * (n - 1)),
  };
}

const words = parseWords(pages.slice(0, 55).join(''));
const original = words.flat();
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(original, corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

const inverse = words.map(decode);
const forward = words.map(encode);
for (let i = 0; i < words.length; i++) {
  assert.deepEqual(encode(inverse[i]), words[i]);
  assert.deepEqual(decode(forward[i]), words[i]);
}
const source = stats(words);
const decoded = stats(inverse);
const encoded = stats(forward);
assert.equal(source.lagFive, 104);
assert.equal(source.adjacentEqual, 63);
assert.equal(source.singletonWords, 83);
assert.equal(source.distinctSingletonGlyphs, 28);
assert.equal(source.globalIoc, 0.03447839786450569);
assert.equal(decoded.lagFive, 14);
assert.equal(decoded.adjacentEqual, 164);
assert.equal(encoded.lagFive, 69);
assert.equal(encoded.adjacentEqual, 218);
for (const altered of [decoded, encoded]) {
  assert.deepEqual(altered.histogram, source.histogram);
  assert.equal(altered.globalIoc, source.globalIoc);
  assert.equal(altered.distinctSingletonGlyphs, 28);
  assert.equal(altered.singletonWords, 83);
}

// Independent genuine clear GP29 source control: physical p57.
const p57Words = parseWords(pages[56]);
const p57 = p57Words.flat();
assert.deepEqual(p57, corpus.pages.find(p => p.page === 57).indices);
assert.equal(p57.length, 95);
assert.equal(stats(p57Words).globalIoc, 0.06270996640537514);
for (const w of p57Words) {
  assert.deepEqual(decode(encode(w)), w);
  assert.deepEqual(encode(decode(w)), w);
}
console.log(JSON.stringify({
  decision: 'The specified five-lane permutation cannot alone yield ordinary GP29 prose with the original word boundaries',
  provenance: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    originalTranscription: 'resources/lp2-transcription.txt',
    positiveControl: 'source-original clear GP29 p57',
  },
  exactSource: source,
  laneInverse: decoded,
  laneForward: encoded,
  trueClearP57Ioc: stats(p57Words).globalIoc,
  wordsRoundTrip: words.length,
  p57WordsRoundTrip: p57Words.length,
  authenticUnknownPlaintextRecovered: 0,
}, null, 2));
