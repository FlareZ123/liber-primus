'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Source-selected 28-page bookend alignment and key-free two-message inverse.
 *
 * A six-GP-rune phrase occurs at first-half offset 6555 and the very end of
 * the second half. The 2016 Cicada JPEG dimension mean 566 equals the 28-page
 * first/last rune-count imbalance. Both observations are source arithmetic.
 *
 * Three prespecified screens test a natural shared-key handoff: direct
 * additive GP29, multiplicative cipher-step ratios, and adjacent-ratio
 * dependence. Each original candidate uses the exact bookend alignment.
 * Circular rotations of the second stream give conditional, not familywide,
 * reference ranks. Positive control encrypts genuinely held-out GP English.
 *
 * Node 22, dependency-free, read-only, no acquired secret keys.
 */

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const pages = corpus.pages.filter((p) => p.page <= 55);
const first = pages.filter((p) => p.page < 28).flatMap((p) => p.indices);
const second = pages.filter((p) => p.page >= 28).flatMap((p) => p.indices);
const all = first.concat(second);

assert.equal(pages.length, 56);
assert.equal(all.length, 12956);
assert.equal(first.length, 6761);
assert.equal(second.length, 6195);
assert.equal(first.length - second.length, (563 + 569) / 2);

const phrase = [23, 11, 1, 17, 18, 10]; // DJU BEI, ᛞᛄᚢ-ᛒᛖᛁ.
const allOccurrences = [];
for (let i = 0; i + phrase.length <= all.length; i++) {
  if (phrase.every((v, j) => all[i + j] === v)) allOccurrences.push(i);
}
assert.deepEqual(allOccurrences, [6555, 12950]);
assert.deepEqual(second.slice(-6), phrase);

/**
 * Exact canonical word parser. Printed line and physical page transitions are
 * transparent; punctuation separates words. Compare the parsed runes to the
 * unchanged source corpus before any word-level inference.
 */
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const allWords = [];
let currentWord = [];
for (const glyph of transcript.split('%').slice(0, 55).join('%')) {
  if (runeIndex.has(glyph)) {
    currentWord.push(runeIndex.get(glyph));
  } else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
    // Neither a physical page nor a line break ends the manuscript word.
  } else if (currentWord.length) {
    allWords.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) allWords.push(currentWord);
assert.equal(allWords.length, 2896);
assert.deepEqual(allWords.flat(), all);

const wordIDs = allWords.map((word) => word.join(','));
const wordType = new Map();
const pairOccurrences = new Map();
for (let i = 0; i < wordIDs.length; i++) {
  const k = wordIDs[i];
  const item = wordType.get(k) || { count: 0, length: allWords[i].length };
  item.count++;
  wordType.set(k, item);
  if (i + 1 < wordIDs.length) {
    const pair = k + '|' + wordIDs[i + 1];
    const found = pairOccurrences.get(pair) || [];
    found.push(i);
    pairOccurrences.set(pair, found);
  }
}
const repeatedPairs = [...pairOccurrences.values()].filter((a) => a.length >= 2);
assert.equal(wordType.size, 2731);
assert.equal(repeatedPairs.length, 1);
assert.deepEqual(repeatedPairs[0], [1462, 2894]);
const repeatedTypes = [...wordType.values()].filter((w) => w.count >= 2);
assert.equal(repeatedTypes.length, 120);
const N = allWords.length;
/** @param {number} n @param {number} k @returns {number} */
function falling(n, k) {
  let out = 1;
  for (let i = 0; i < k; i++) out *= Math.max(0, n - i);
  return out;
}
/*
 * Fix the EXACT observed word inventory. Shuffle the 2,896 whole-word tokens
 * uniformly. For ordered DISTINCT types (a,b) to form a repeated nonoverlap
 * bigram, the expected pair count is (n_a)_2 (n_b)_2/[2N(N-1)].
 * For identical types, add nonoverlapping (n_a)_4/[2N(N-1)] and
 * overlapping (n_a)_3/[N(N-1)]. Sum ONLY pairs totaling >=6 runes.
 * The expectation upper bounds P(at least one such repeat) by Markov.
 */
let expectedLongPairCollisions = 0;
for (let i = 0; i < repeatedTypes.length; i++) {
  const a = repeatedTypes[i];
  if (2 * a.length >= 6) {
    expectedLongPairCollisions += falling(a.count, 4) / (2 * N * (N - 1));
    expectedLongPairCollisions += falling(a.count, 3) / (N * (N - 1));
  }
  for (let j = 0; j < repeatedTypes.length; j++) {
    if (i === j) continue;
    const b = repeatedTypes[j];
    if (a.length + b.length < 6) continue;
    expectedLongPairCollisions += falling(a.count, 2) * falling(b.count, 2) /
      (2 * N * (N - 1));
  }
}
assert.ok(Math.abs(expectedLongPairCollisions - 0.00006417045964179009) < 1e-14);
const conditionalSpecificAB = 2 / (N * (N - 1));
assert.ok(Math.abs(conditionalSpecificAB - 2.385518945791467e-7) < 1e-17);
assert.equal(wordType.get('23,11,1').count, 2);
assert.equal(wordType.get('17,18,10').count, 2);
const firstPage27Start = pages.filter((p) => p.page < 27).reduce((s, p) => s + p.indices.length, 0);
const secondPage55Start = pages.filter((p) => p.page < 55).reduce((s, p) => s + p.indices.length, 0);
assert.equal(6555 - firstPage27Start, 28);
assert.equal(12950 - secondPage55Start, 70);

const start = 6555 - (second.length - phrase.length); // Exactly 366.
const A = first.slice(start, start + second.length);
const B = second;
assert.equal(start, 366);
assert.equal(first.length - start - A.length, 200);
assert.equal(A.length, B.length);
assert.deepEqual(A.slice(-6), B.slice(-6));

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }

const inv = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) inv[a] = b;
  assert.equal(a * inv[a] % 29, 1);
}

/**
 * @param {string} text
 * @returns {number[]} Native GP symbols, including digraph runes.
 */
function encode(text) {
  const plain = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/K/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/Q/g, 'C').replace(/[^A-Z]/g, '');
  const tokens = corpus.translit.map((label, index) => ({ label, index }))
    .sort((a, b) => b.label.length - a.label.length);
  const result = [];
  for (let i = 0; i < plain.length;) {
    const token = tokens.find((x) => plain.startsWith(x.label, i));
    assert.ok(token, 'Unmapped native English letter');
    result.push(token.index);
    i += token.label.length;
  }
  return result;
}

const reference = encode(shakespeare);
assert.equal(reference.length, 216874);

/** GP source training material is frozen to its first 160,000 rune symbols. */
const trainSize = 160000;
const symbolCount = Array(29).fill(0.1);
const stepCount = Array(29).fill(0.1);
const stepPairCount = Array(29 * 29).fill(0.01);
for (let i = 0; i < trainSize; i++) {
  symbolCount[reference[i]]++;
  if (i > 0) stepCount[mod(reference[i] - reference[i - 1])]++;
  if (i > 1) {
    const a = mod(reference[i - 1] - reference[i - 2]);
    const b = mod(reference[i] - reference[i - 1]);
    stepPairCount[a * 29 + b]++;
  }
}

/** @param {number[]} values @returns {number[]} */
function frequencies(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  return values.map((v) => v / sum);
}
const ps = frequencies(symbolCount);
const pt = frequencies(stepCount);
const F = frequencies(stepPairCount);

/** Plaintext rune differences under shared GP29 additive key. */
const additionQ = Array(29).fill(0);
for (let d = 0; d < 29; d++) {
  for (let a = 0; a < 29; a++) additionQ[d] += ps[a] * ps[mod(a - d)];
}
const addLog = additionQ.map((v) => Math.log(29 * v));

/*
 * Original bookend word-start displacement is 1,432 = 8 * 179. The 179
 * happens to be p53's full rune count and a factor of the 256-byte table.
 * For one candidate 179-word additive key clock, two ciphertext words of
 * equal GP length, 179 words apart, must cancel the unknown same-position
 * pad. This is a necessary English-difference test with no fitted key.
 *
 * The 1432-word source-selected shift is tested as a separate constrained
 * comparison. Its two already-matching terminal word pairs are excluded
 * from the score to prevent rewarding the selection observation twice.
 */
/**
 * @param {number[][]} sourceWords
 * @param {number} lag
 * @returns {{matchedWords:number,runes:number,score:number,exactRuneMatches:number}}
 */
function wordClockDifference(sourceWords, lag) {
  let matchedWords = 0;
  let runes = 0;
  let exactRuneMatches = 0;
  let score = 0;
  for (let i = 0; i + lag < sourceWords.length; i++) {
    if (lag === 1432 && (i === 1462 || i === 1463)) continue;
    const left = sourceWords[i];
    const right = sourceWords[i + lag];
    if (left.length !== right.length) continue;
    matchedWords++;
    for (let j = 0; j < left.length; j++) {
      const diff = mod(left[j] - right[j]);
      exactRuneMatches += diff === 0 ? 1 : 0;
      score += addLog[diff];
      runes++;
    }
  }
  return { matchedWords, runes, score, exactRuneMatches };
}

assert.equal(2894 - 1462, 1432);
assert.equal(1432, 8 * 179);
const observedWord179 = wordClockDifference(allWords, 179);
const observedWord1432 = wordClockDifference(allWords, 1432);
assert.equal(observedWord179.matchedWords, 427);
assert.equal(observedWord179.runes, 1547);
assert.ok(Math.abs(observedWord179.score - (-34.96294560118788)) < 1e-8);
assert.equal(observedWord1432.matchedWords, 197);
assert.equal(observedWord1432.runes, 758);
assert.ok(Math.abs(observedWord1432.score - (-11.131326807185237)) < 1e-8);

const plantPlainWords = [];
let plantSourcePos = 160000;
for (const actualWord of allWords) {
  const sourceWord = reference.slice(plantSourcePos, plantSourcePos + actualWord.length);
  assert.equal(sourceWord.length, actualWord.length);
  plantPlainWords.push(sourceWord);
  plantSourcePos += actualWord.length;
}
assert.equal(plantSourcePos, 172956);
let wordSeed = 0x49abf179;
/** @returns {number} */
function wordRandom32() {
  wordSeed ^= wordSeed << 13;
  wordSeed ^= wordSeed >>> 17;
  wordSeed ^= wordSeed << 5;
  return wordSeed >>> 0;
}
const wordKey = Array.from({ length: 179 * 15 }, () => wordRandom32() % 29);
const plantWordCipher = plantPlainWords.map((word, i) =>
  word.map((plain, j) => mod(plain + wordKey[(i % 179) * 15 + j])));
const plantedWord179 = wordClockDifference(plantWordCipher, 179);
assert.equal(plantedWord179.runes, 1547);
assert.ok(Math.abs(plantedWord179.score - 33.26528781930028) < 1e-8);

/** Ratio of two independent native-English GP rune *steps*. */
const ratioQ = Array(29).fill(0);
for (let b = 1; b < 29; b++) {
  for (let a = 0; a < 29; a++) ratioQ[mod(a * inv[b])] += pt[a] * pt[b];
}
for (let a = 0; a < 29; a++) ratioQ[a] /= 1 - pt[0];
const ratioLog = ratioQ.map((v) => Math.log(29 * v));

/** Joint distribution of consecutive source-step ratios. */
let denominator = 0;
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) denominator += F[a * 29 + b];
}
const H = Array(29 * 29).fill(0);
for (let r = 0; r < 29; r++) {
  for (let s = 0; s < 29; s++) {
    let h = 0;
    for (let a = 1; a < 29; a++) {
      for (let b = 1; b < 29; b++) {
        h += F[mod(r * a) * 29 + mod(s * b)] * F[a * 29 + b];
      }
    }
    H[r * 29 + s] = h / denominator;
  }
}
const qSerial = Array(29).fill(0);
for (let r = 0; r < 29; r++) {
  for (let s = 0; s < 29; s++) qSerial[r] += H[r * 29 + s];
}
const serialLog = H.map((v, i) => {
  const r = Math.floor(i / 29);
  const s = i % 29;
  return Math.log(v / (qSerial[r] * qSerial[s]));
});

const Astep = A.slice(1).map((c, i) => mod(c - A[i]));
const Bstep = B.slice(1).map((c, i) => mod(c - B[i]));

/** @param {number} shift @returns {number} */
function directAdditiveScore(shift) {
  let sum = 0;
  for (let i = 0; i < A.length - 6; i++) {
    sum += addLog[mod(A[i] - B[(i + shift) % B.length])];
  }
  return sum;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} shift
 * @returns {{ratio: number, serial: number, valid: number}}
 */
function stepRatioScore(a, b, shift) {
  let ratio = 0;
  let serial = 0;
  let valid = 0;
  let previous = -1;
  for (let i = 0; i < a.length - 6; i++) {
    const denom = b[(i + shift) % b.length];
    const value = denom ? mod(a[i] * inv[denom]) : -1;
    if (value >= 0) {
      ratio += ratioLog[value];
      valid++;
      if (previous >= 0) serial += serialLog[previous * 29 + value];
    }
    previous = value;
  }
  return { ratio, serial, valid };
}

/** @param {number[]} values @param {number} observed */
function rank(values, observed) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    rank: values.filter((v) => v >= observed).length + 1,
    total: values.length + 1,
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]
  };
}

const originalAdd = directAdditiveScore(0);
const originalStep = stepRatioScore(Astep, Bstep, 0);
const addNull = [];
const ratioNull = [];
const serialNull = [];
for (let shift = 1; shift < B.length; shift++) addNull.push(directAdditiveScore(shift));
for (let shift = 1; shift < Bstep.length; shift++) {
  const q = stepRatioScore(Astep, Bstep, shift);
  ratioNull.push(q.ratio);
  serialNull.push(q.serial);
}

assert.ok(Math.abs(originalAdd - (-144.93729356157664)) < 1e-8);
assert.ok(Math.abs(originalStep.ratio - 21.45745278153081) < 1e-8);
assert.ok(Math.abs(originalStep.serial - (-7.823304171536302)) < 1e-8);
assert.equal(rank(addNull, originalAdd).rank, 6125);
assert.equal(rank(ratioNull, originalStep.ratio).rank, 32);
assert.equal(rank(serialNull, originalStep.serial).rank, 6113);

/**
 * A source-disjoint full-length true-key plant.
 * Output anti-repeat overwrites match the original ~80% soft-repair setting.
 */
let seed = 0x49fc3301;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plantA = reference.slice(161000, 167195);
const plantB = reference.slice(178000, 184195);
assert.equal(plantA.length, 6195);
assert.equal(plantB.length, 6195);
const encryptedA = [plantA[0]];
const encryptedB = [plantB[0]];
let overwritten = 0;
for (let i = 1; i < 6195; i++) {
  const k = 1 + random32() % 28;
  let ca = mod(encryptedA[i - 1] + k * mod(plantA[i] - plantA[i - 1]));
  let cb = mod(encryptedB[i - 1] + k * mod(plantB[i] - plantB[i - 1]));
  if (ca === encryptedA[i - 1] && random32() / 4294967296 < 0.81) {
    ca = mod(ca + 1);
    overwritten++;
  }
  if (cb === encryptedB[i - 1] && random32() / 4294967296 < 0.81) {
    cb = mod(cb + 1);
    overwritten++;
  }
  encryptedA.push(ca);
  encryptedB.push(cb);
}
const plantStepsA = encryptedA.slice(1).map((c, i) => mod(c - encryptedA[i]));
const plantStepsB = encryptedB.slice(1).map((c, i) => mod(c - encryptedB[i]));
const plantScore = stepRatioScore(plantStepsA, plantStepsB, 0).ratio;
const plantNull = [];
for (let shift = 1; shift < plantStepsB.length; shift++) {
  plantNull.push(stepRatioScore(plantStepsA, plantStepsB, shift).ratio);
}
assert.equal(overwritten, 304);
assert.ok(Math.abs(plantScore - 19.812789916310837) < 1e-8);
assert.equal(rank(plantNull, plantScore).rank, 210);

console.log(JSON.stringify({
  original: {
    first28Runes: first.length,
    second28Runes: second.length,
    excess: first.length - second.length,
    sourceImageDimensions: [563, 569],
    phraseGP: phrase,
    sourcePhraseOffsets: allOccurrences,
    wordClockSource: {
      repeatedPairWordSeparation: 1432,
      sourceP53RuneCount: 179,
      gridColumnCount: 8,
      additivePeriod179: observedWord179,
      additiveDisplacement1432: observedWord1432,
      trueKeyPeriod179Plant: plantedWord179
    },
    wordInventory: {
      totalWords: N, distinctWordTypes: wordType.size,
      typesUsedAtLeastTwice: repeatedTypes.length,
      onlyRepeatedBigramAtWordIndexes: repeatedPairs[0],
      conditionalExactThisABTwoCopies: conditionalSpecificAB,
      allInventoryLongBigramShuffleProbabilityUpperBound: expectedLongPairCollisions
    },
    alignedStart: start,
    alignedLength: A.length,
    excludedFromFirstHalf: { prefix: start, suffix: 200 },
    directAdditiveGP29: { score: originalAdd, ...rank(addNull, originalAdd) },
    multiplicativeStepRatio: { ...originalStep, ...rank(ratioNull, originalStep.ratio) },
    ratioSerialConditional: { score: originalStep.serial, ...rank(serialNull, originalStep.serial) }
  },
  syntheticSharedMultiplicativeKey: {
    runeCountPerStream: plantA.length,
    antiRepeatOverwrites: overwritten,
    ratioScore: plantScore,
    ...rank(plantNull, plantScore)
  }
}, null, 2));
