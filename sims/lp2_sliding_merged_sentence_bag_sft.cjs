#!/usr/bin/env node
'use strict';

/**
 * LP2 original two-span merged wordlength bag against ALL contiguous source
 * word windows of the same size. Source punctuation positions are unrestricted.
 *
 * This detects an unchanged native-GP source word multiset under every possible
 * permutation, even if the copied passage's sentence boundaries are shifted.
 *
 * Windows: node sims/lp2_sliding_merged_sentence_bag_sft.cjs
 * Read-only, dependency-free, deterministic; tests one fixed family.
 */
const assert = require('node:assert/strict');
const {
  originalSpans, sources, key
} = require('./lp2_two_sentence_sourcebag_crib_sft.cjs');

/**
 * Stable 32-bit non-linear value salt, used twice for rapid commutative
 * lookup of a multiset. Full sorted bags confirm all hash candidates.
 * @param {number} v
 * @param {number} seed
 * @returns {number}
 */
function mix(v, seed) {
  let x = (v ^ seed) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}
/** @param {number[]} values @returns {[number,number]} */
function hash(values) {
  let a = 0, b = 0;
  for (const v of values) {
    a = (a + mix(v, 0x9e3779b9)) >>> 0;
    b = (b + mix(v, 0x6a09e667)) >>> 0;
  }
  return [a, b];
}
/** @param {number} a @param {number} b @returns {string} */
function hashKey(a, b) { return a + ':' + b; }

/**
 * @param {number[][]} original
 * @param {number[]} referenceWords
 * @param {number} [minEach=13]
 * @returns {{targetPairs:number, sourceWords:number, windowsExamined:number, exactMatches:{originalSpan:number,sourceWordStart:number,wordCount:number}[]}}
 */
function slidingBagMatches(original, referenceWords, minEach = 13) {
  /** @type {Map<number,Map<string,Array<{i:number,bag:string}>>>} */
  const requests = new Map();
  let targetPairs = 0;
  for (let i = 0; i + 1 < original.length; i++) {
    if (original[i].length < minEach || original[i + 1].length < minEach) continue;
    const combined = original[i].concat(original[i + 1]);
    const length = combined.length;
    const [a, b] = hash(combined);
    const h = hashKey(a, b);
    if (!requests.has(length)) requests.set(length, new Map());
    const bucket = requests.get(length);
    if (!bucket.has(h)) bucket.set(h, []);
    bucket.get(h).push({i, bag: key(combined)});
    targetPairs++;
  }

  /** @type {{originalSpan:number,sourceWordStart:number,wordCount:number}[]} */
  const exactMatches = [];
  let windowsExamined = 0;
  for (const [length, hashBuckets] of requests) {
    if (length > referenceWords.length) continue;
    let [h1, h2] = hash(referenceWords.slice(0, length));
    for (let start = 0; start + length <= referenceWords.length; start++) {
      const candidates = hashBuckets.get(hashKey(h1, h2));
      if (candidates) {
        const actualBag = key(referenceWords.slice(start, start + length));
        for (const {i, bag} of candidates) {
          if (actualBag === bag) {
            exactMatches.push({originalSpan: i, sourceWordStart: start, wordCount: length});
          }
        }
      }
      windowsExamined++;
      const next = start + length;
      if (next < referenceWords.length) {
        const prev = referenceWords[start];
        const add = referenceWords[next];
        h1 = (h1 - mix(prev, 0x9e3779b9) + mix(add, 0x9e3779b9)) >>> 0;
        h2 = (h2 - mix(prev, 0x6a09e667) + mix(add, 0x6a09e667)) >>> 0;
      }
    }
  }
  return {targetPairs, sourceWords: referenceWords.length,
    windowsExamined, exactMatches};
}

const originals = originalSpans();
const results = [];
for (const {name, spans} of sources) {
  const flattened = spans.flat();
  const found = slidingBagMatches(originals, flattened);
  assert.equal(found.exactMatches.length, 0,
    'A copied 26+-word source multiset is present: ' + name +
    ' ' + JSON.stringify(found.exactMatches.slice(0, 5)));
  // A source passage planted across an arbitrary two-part new punctuation
  // break must be recovered even when every word changes position.
  const start = 97, total = 44, split = 18;
  assert(flattened.length >= start + total);
  const plant = flattened.slice(start, start + total).reverse();
  const positive = slidingBagMatches([plant.slice(0, split),
    plant.slice(split)], flattened);
  assert(positive.exactMatches.some((match) =>
    match.sourceWordStart === start && match.wordCount === total),
    'Failed original-source planted whole-word-permutation recovery: ' + name);
  results.push({
    source: name,
    sourceWords: found.sourceWords,
    windowsExamined: found.windowsExamined,
    candidateOriginalSpanPairs: found.targetPairs,
    exactMatches: found.exactMatches.length,
    plantedSourceWordOffset: start,
    plantedRecovered: true
  });
}
console.log(JSON.stringify({
  status: 'PASS',
  originalSpans: originals.length,
  originalWords: originals.flat().length,
  model: 'two consecutive ciphertext punctuation spans merged and freely permuted',
  minWordsInEachOriginalSpan: 13,
  sources: results,
  totalSourceWindows: results.reduce((s, r) => s + r.windowsExamined, 0)
}, null, 2));

module.exports = {slidingBagMatches};
