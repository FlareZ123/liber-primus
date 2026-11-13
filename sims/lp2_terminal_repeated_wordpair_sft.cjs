"use strict";

/**
 * Original-source repeated two-word anchor and matched finite null.
 * SFT: node sims/lp2_terminal_repeated_wordpair_sft.cjs
 *
 * Reads the exact source corpus and physical-page-preserving transcription.
 * Null shuffles the 720 observed three-rune word labels across the same
 * 720 three-rune word positions, preserving every word type's frequency
 * and all printed word lengths and adjacency slots.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const seq = [];
const coords = [];
for (const page of corpus.pages) {
  for (let i = 0; i < page.indices.length; i++) {
    seq.push(page.indices[i]);
    coords.push([page.page, i]);
  }
}
assert.equal(seq.length, 13136);

const sevenHits = [];
const encountered = new Map();
for (let i = 0; i <= seq.length - 7; i++) {
  const signature = seq.slice(i, i + 7).join(",");
  const previous = encountered.get(signature);
  if (previous) for (const prior of previous) {
    let length = 7;
    while (prior + length < seq.length && i + length < seq.length &&
      seq[prior + length] === seq[i + length]) length++;
    sevenHits.push({
      start1: coords[prior],
      start2: coords[i],
      length,
      rune: seq.slice(i, i + length).map(id => corpus.runes[id]).join("")
    });
  }
  if (previous) previous.push(i);
  else encountered.set(signature, [i]);
}
assert.deepEqual(sevenHits, [{
  start1: [27, 28],
  start2: [55, 70],
  length: 7,
  rune: "ᛞᛄᚢᛒᛖᛁᚫ"
}]);

// The runeless physical page 50 is absent from this source transcription.
// First 55 '%' records therefore cover the 55 rune-bearing unknown pages.
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const unknown = transcription.split("%").slice(0, 55).join("%")
  .replace(/\\\r?\n/g, "").replace(/[\r\n/%]/g, "");
const words = unknown.match(/[\u16A0-\u16FF]+/gu) || [];
assert.equal(words.length, 2896);

const triples = [];
const tripleAtWord = new Map();
for (let i = 0; i < words.length; i++) {
  if (words[i].length === 3) {
    tripleAtWord.set(i, triples.length);
    triples.push(words[i]);
  }
}
assert.equal(triples.length, 720);

const edges = [];
for (let i = 0; i < words.length - 1; i++) {
  if (tripleAtWord.has(i) && tripleAtWord.has(i + 1))
    edges.push([tripleAtWord.get(i), tripleAtWord.get(i + 1), i]);
}
assert.equal(edges.length, 184);

const labelMap = new Map();
const labels = new Uint16Array(triples.length);
for (let i = 0; i < triples.length; i++) {
  if (!labelMap.has(triples[i])) labelMap.set(triples[i], labelMap.size);
  labels[i] = labelMap.get(triples[i]);
}
assert.equal(labelMap.size, 704);

const frequencies = new Array(labelMap.size).fill(0);
for (const label of labels) frequencies[label]++;
const falling = (n, k) => {
  let product = 1;
  for (let i = 0; i < k; i++) product *= n - i;
  return product;
};

/** @param {Uint16Array} permutation @returns {{duplicatePairs:number,positions:number[]}} */
function collisionCount(permutation) {
  const seen = new Map();
  let duplicatePairs = 0;
  const positions = [];
  for (const [left, right, wordIndex] of edges) {
    const key = permutation[left] * permutation.length + permutation[right];
    const earlier = seen.get(key);
    if (earlier) {
      duplicatePairs += earlier.length;
      positions.push(...earlier, wordIndex);
      earlier.push(wordIndex);
    } else {
      seen.set(key, [wordIndex]);
    }
  }
  return {duplicatePairs, positions};
}

const observed = collisionCount(labels);
assert.equal(observed.duplicatePairs, 1);
assert.deepEqual(observed.positions, [1462, 2894]);
assert.equal(words[1462], "ᛞᛄᚢ");
assert.equal(words[1463], "ᛒᛖᛁ");
assert.equal(words[2894], "ᛞᛄᚢ");
assert.equal(words[2895], "ᛒᛖᛁ");

// An exact first-moment bound under random relabeling of the 720 positions.
// For disjoint adjacent-word edges, the pair-collision probability is
// (sum_{a != b}(m_a)_2(m_b)_2 + sum_a(m_a)_4) / (720)_4.
// Edges sharing a position require a three-fold identical word.
const twoCounts = frequencies.map(m => falling(m, 2));
const sum2 = twoCounts.reduce((a, b) => a + b, 0);
const sumSquared = twoCounts.reduce((a, b) => a + b * b, 0);
const numerator = sum2 * sum2 - sumSquared +
  frequencies.reduce((sum, m) => sum + falling(m, 4), 0);
const pDisjoint = numerator / falling(triples.length, 4);
const pOverlapping = frequencies.reduce((sum, m) => sum + falling(m, 3), 0) /
  falling(triples.length, 3);
let overlappingPairs = 0;
for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
  if (edges[i].slice(0, 2).some(position =>
    edges[j][0] === position || edges[j][1] === position))
    overlappingPairs++;
}
assert.equal(overlappingPairs, 36);
const edgePairs = edges.length * (edges.length - 1) / 2;
const expectation = (edgePairs - overlappingPairs) * pDisjoint +
  overlappingPairs * pOverlapping;
assert(Math.abs(expectation - 0.0000676538434737498) < 1e-15);

// Deterministic independent simulation. Use rejection sampling for an
// unbiased integer in [0, bound) from each uniform 32-bit PRNG output.
let state = 0xc1cada29;
/** @returns {number} */
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number} n @returns {number} */
function randomBelow(n) {
  const limit = Math.floor(4294967296 / n) * n;
  let x;
  do { x = next32(); } while (x >= limit);
  return x % n;
}
const simulations = 300000;
const perm = labels.slice();
let positive = 0;
for (let trial = 0; trial < simulations; trial++) {
  perm.set(labels);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = randomBelow(i + 1);
    const previous = perm[i];
    perm[i] = perm[j];
    perm[j] = previous;
  }
  if (collisionCount(perm).duplicatePairs > 0) positive++;
}
// Monte-Carlo calibration is intentionally approximate; the exact
// first-moment union bound above is the primary finite-null statistic.
assert(positive >= 5 && positive <= 55);

console.log(JSON.stringify({
  original: {
    runes: seq.length,
    unknownPrintedWords: words.length,
    threeRuneWords: triples.length,
    distinctThreeRuneWords: labelMap.size,
    threePlusThreeSlots: edges.length,
    duplicateWordPairs: observed.duplicatePairs,
    wordPairIndices: observed.positions,
    repeatedSevenRuneHits: sevenHits
  },
  frequencyPreservingNull: {
    overlappingEdgePairs: overlappingPairs,
    expectedDuplicateWordPairs: expectation,
    probabilityAtLeastOneUpperBound: expectation,
    seed: "0xc1cada29",
    simulatedPermutations: simulations,
    simulationsWithDuplicateWordPair: positive,
    empiricalProbability: positive / simulations
  },
  conclusion: "Unusually placed literal ciphertext phrase repetition; no decryption or key selected."
}, null, 2));
