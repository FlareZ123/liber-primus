#!/usr/bin/env node
'use strict';
/**
 * Original LP2 p53/p55 moth two-time-pad gate.
 * SFT: node sims/lp2_p53_p55_moth_sharedpad_original_sft.cjs
 * Uses only original physical-page order and the p55 complete 75-rune body.
 * An unknown common additive GP29 key cancels between aligned plaintexts.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/lp2-transcription.txt').split('%');
const mod = value => (value % 29 + 29) % 29;
const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const sourcePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/english_wordfreq_textblob.txt'
];

/** Remove line wraps, preserve actual word separators and rune positions. */
function pageWords(transcriptionIndex) {
  return (source[transcriptionIndex].replace(/\/\s*/g, '')
    .match(/[\u16A0-\u16FF]+/gu) || [])
    .map(word => [...word].map(rune => runeIndex.get(rune)));
}
const p53Words = pageWords(52);
const p55Words = pageWords(54);
const p53 = p53Words.flat();
const p55Page = p55Words.flat();
assert.deepEqual(p53, gp.pages.find(page => page.page === 53).indices);
assert.deepEqual(p55Page, gp.pages.find(page => page.page === 55).indices);
assert.equal(p53.length, 179);
assert.equal(p55Page.length, 76);
assert.equal(p55Words[0].length, 1); // NG: carry from p54, not a p55 word.
const p55BodyWords = p55Words.slice(1);
const p55Body = p55BodyWords.flat();
assert.equal(p55Body.length, 75);
assert.deepEqual(p55BodyWords.map(word => word.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const lenA = p53Words.map(word => word.length);
const lenB = p55BodyWords.map(word => word.length);
const latinTokens = gp.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** Historical GP spelling folds plus greedy multi-letter rune tokens. */
function spell(word) {
  const text = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const result = [];
  for (let i = 0; i < text.length;) {
    const matched = latinTokens.find(({token}) => text.startsWith(token, i));
    if (!matched) return null;
    result.push(matched.index);
    i += matched.token.length;
  }
  return result;
}
const dictionary = new Map();
const sourceWordsByLength = [];
for (const file of sourcePaths) {
  const text = read(file);
  const words = file.endsWith('english_wordfreq_textblob.txt')
    ? (text.match(/^[a-z]+\s+\d+$/gm) || []).map(row => row.split(/\s+/)[0])
    : (text.match(/[A-Za-z]+/g) || []);
  const tokenBuckets = new Map();
  for (const word of words) {
    const runes = spell(word);
    if (!runes || runes.length > 20) continue;
    if (!dictionary.has(runes.length)) dictionary.set(runes.length, new Map());
    dictionary.get(runes.length).set(runes.join(','), runes);
    if (!tokenBuckets.has(runes.length)) tokenBuckets.set(runes.length, []);
    tokenBuckets.get(runes.length).push(runes);
  }
  sourceWordsByLength.push(tokenBuckets);
}
const dictionarySize = [...dictionary.values()]
  .reduce((sum, words) => sum + words.size, 0);
assert.equal(dictionarySize, 32081);

/** Trie for exact GP-native dictionary compatibility, without guessed keys. */
function makeTrie(words) {
  const nodes = [{next: new Int32Array(29).fill(-1), terminal: false}];
  for (const word of words.values()) {
    let state = 0;
    for (const symbol of word) {
      let child = nodes[state].next[symbol];
      if (child < 0) {
        child = nodes.length;
        nodes[state].next[symbol] = child;
        nodes.push({next: new Int32Array(29).fill(-1), terminal: false});
      }
      state = child;
    }
    nodes[state].terminal = true;
  }
  return nodes;
}
const tries = new Map([...dictionary.entries()]
  .map(([length, words]) => [length, makeTrie(words)]));
/** @param {number[]} lengths */
function ends(lengths) {
  let length = 0;
  return lengths.map(n => (length += n));
}
const endA = ends(lenA);
const endB = ends(lenB);
assert.equal(endA.at(-1), 179);
assert.equal(endB.at(-1), 75);

/**
 * Exact product-trie 75-rune original-input decision, full original p53
 * word lengths (which extend beyond the aligned 75-rune prefix).
 * @param {number[]} cipherA
 * @param {number[]} cipherB
 */
function sharedPadWordGrammar(cipherA, cipherB) {
  let statePairs = new Map([['0,0', [0, 0]]]);
  let wordA = 0, wordB = 0;
  const statesByPosition = [];
  for (let offset = 0; offset < 75; offset++) {
    while (endA[wordA] <= offset) wordA++;
    while (endB[wordB] <= offset) wordB++;
    const trieA = tries.get(lenA[wordA]), trieB = tries.get(lenB[wordB]);
    assert.ok(trieA && trieB);
    const finishA = endA[wordA] === offset + 1;
    const finishB = endB[wordB] === offset + 1;
    const delta = mod(cipherA[offset] - cipherB[offset]);
    const nextPairs = new Map();
    for (const [left, right] of statePairs.values()) {
      for (let letterA = 0; letterA < 29; letterA++) {
        const letterB = mod(letterA - delta);
        const childA = trieA[left].next[letterA];
        const childB = trieB[right].next[letterB];
        if (childA < 0 || childB < 0) continue;
        if (finishA && !trieA[childA].terminal) continue;
        if (finishB && !trieB[childB].terminal) continue;
        const a = finishA ? 0 : childA, b = finishB ? 0 : childB;
        nextPairs.set(a + ',' + b, [a, b]);
      }
    }
    statePairs = nextPairs;
    statesByPosition.push(statePairs.size);
    if (statePairs.size === 0) {
      return {possible: false, firstImpossibleRune: offset + 1,
        previousStates: statesByPosition.at(-2) || 1, statesByPosition};
    }
  }
  return {possible: true, finalStates: statePairs.size, statesByPosition};
}

/** Key-independent same-symbol collisions under any common 25-phase key. */
function samePhasePairs(a, b) {
  const bins = Array.from({length: 25}, () => new Int32Array(29));
  for (let i = 0; i < a.length; i++) bins[i % 25][a[i]]++;
  for (let i = 0; i < b.length; i++) bins[i % 25][b[i]]++;
  let collisions = 0, eligiblePairs = 0;
  for (const bin of bins) {
    let count = 0;
    for (const frequency of bin) {
      collisions += frequency * (frequency - 1) / 2;
      count += frequency;
    }
    eligiblePairs += count * (count - 1) / 2;
  }
  return {collisions, eligiblePairs, ratio: collisions / eligiblePairs};
}

/** Key-independent aligned difference diagnostics for arbitrary 75-long pad. */
function alignedDifference(a, b) {
  const histogram = Array(29).fill(0);
  for (let i = 0; i < 75; i++) histogram[mod(a[i] - b[i])]++;
  const expected = 75 / 29;
  return {
    histogram, equal: histogram[0], maximum: Math.max(...histogram),
    chiSquare: histogram.reduce((sum, n) =>
      sum + (n - expected) ** 2 / expected, 0)
  };
}
const actualWord = sharedPadWordGrammar(p53, p55Body);
assert.equal(actualWord.possible, false);
assert.equal(actualWord.firstImpossibleRune, 14);
assert.equal(actualWord.previousStates, 4);
const actualPeriod25 = samePhasePairs(p53, p55Body);
assert.deepEqual(
  [actualPeriod25.collisions, actualPeriod25.eligiblePairs],
  [43, 1165]
);
const actualDifference = alignedDifference(p53, p55Body);
assert.deepEqual([actualDifference.equal, actualDifference.maximum],
  [5, 6]);

/** Reproducible 32-bit pseudo-random source-token sampler. */
function sampler(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/** Draw a full GP-text with the exact printed word lengths. */
function chooseWords(lengths, buckets, random) {
  return lengths.flatMap(length => {
    const options = buckets.get(length);
    assert.ok(options && options.length, 'missing native word length ' + length);
    return options[Math.floor(random() * options.length)];
  });
}

// Positive control: two different native-GP words streams under the same
// completely secret 179-position pad (only first 75 positions overlap).
const randomPlant = sampler(0x5eed1234);
const plantA = chooseWords(lenA, sourceWordsByLength[0], randomPlant);
const plantB = chooseWords(lenB, sourceWordsByLength[0], randomPlant);
const secretPad = Array.from({length: 179},
  (_, i) => mod(i * 17 + 7 * Math.floor(i / 5) + 11));
const encryptedA = plantA.map((x, i) => mod(x + secretPad[i]));
const encryptedB = plantB.map((x, i) => mod(x + secretPad[i]));
assert.deepEqual(encryptedA.map((x, i) => mod(x - secretPad[i])), plantA);
assert.deepEqual(encryptedB.map((x, i) => mod(x - secretPad[i])), plantB);
const positive = sharedPadWordGrammar(encryptedA, encryptedB);
assert.equal(positive.possible, true);

// Separate positive control for literal 25-phase key reuse.
const period25Key = Array.from({length: 25}, (_, i) => mod(i * 7 + 17));
const periodA = plantA.map((x, i) => mod(x + period25Key[i % 25]));
const periodB = plantB.map((x, i) => mod(x + period25Key[i % 25]));
assert.deepEqual(periodA.map((x, i) => mod(x - period25Key[i % 25])), plantA);
assert.deepEqual(periodB.map((x, i) => mod(x - period25Key[i % 25])), plantB);
assert.deepEqual(samePhasePairs(periodA, periodB), samePhasePairs(plantA, plantB));

// Native word-grammar-matched controls: independently sample tokens with
// exactly the original page word lengths. No ciphertext-based sampling.
const matched = [];
for (let sourceIndex = 0; sourceIndex < 3; sourceIndex++) {
  const rand = sampler(3301);
  const buckets = sourceWordsByLength[sourceIndex];
  let countAtMostPeriod = 0, countAtMostChi = 0, countAtMostMax = 0;
  let totalPhaseMatches = 0, minimumMatches = Infinity;
  const samples = 12000;
  for (let trial = 0; trial < samples; trial++) {
    const a = chooseWords(lenA, buckets, rand);
    const b = chooseWords(lenB, buckets, rand);
    const phase = samePhasePairs(a, b);
    const diff = alignedDifference(a, b);
    totalPhaseMatches += phase.collisions;
    minimumMatches = Math.min(minimumMatches, phase.collisions);
    countAtMostPeriod += +(phase.collisions <= actualPeriod25.collisions);
    countAtMostChi += +(diff.chiSquare <= actualDifference.chiSquare);
    countAtMostMax += +(diff.maximum <= actualDifference.maximum);
  }
  matched.push({
    source: ['Shakespeare', 'Gibran', 'Emerson'][sourceIndex],
    sourceWordTokens: [...buckets.values()].reduce((sum, words) =>
      sum + words.length, 0),
    samples, meanPhase25Matches: totalPhaseMatches / samples,
    minimumPhase25Matches: minimumMatches,
    controlsAtMostOriginalPhase25: countAtMostPeriod,
    controlsAtMostOriginalDifferenceChi: countAtMostChi,
    controlsAtMostOriginalDifferenceMax: countAtMostMax
  });
}
assert.deepEqual(matched.map(item => item.controlsAtMostOriginalPhase25),
  [3, 7, 1]);
assert.deepEqual(matched.map(item => item.minimumPhase25Matches),
  [40, 40, 42]);

console.log(JSON.stringify({
  scope: 'Original LP2 physical p53 [0,179) and p55 complete 75-rune body',
  sourceInput: {p53Runes: 179, p55PageRunes: 76, p55Carry: p55Page[0],
    p55BodyRunes: 75, p53Words: lenA, p55BodyWords: lenB},
  sharedPad: {
    alphabet: 'GP29 additive, secret arbitrary 75-position key, original phase zero',
    sourceDictionaryUniqueWords: dictionarySize,
    originalWordGrammar: actualWord,
    positivePlant: {recovered: positive.possible, finalStates: positive.finalStates},
    originalDifference: actualDifference
  },
  phase25: {
    source: 'literal unskipped 25-step LP1 p5 Wisdom-square clock, shared phase zero',
    original: actualPeriod25,
    positivePlantExactCipherReplay: true,
    matchedControls: matched
  },
  conclusion: 'Arbitrary same-position pad incompatible with this pinned English dictionary under unchanged printed word boundaries. Literal repeated 25-phase pad strongly disfavoured against matched English controls. No plaintext recovered.'
}, null, 2));
