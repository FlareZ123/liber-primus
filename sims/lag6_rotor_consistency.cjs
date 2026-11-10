'use strict';

/**
 * Test the algebraic consequences of the previously observed LP2
 * lag-six T(x)=24-2*x mod29 echo.
 *
 * T fixes GP index 8 (ᚻ/H) and cycles the other 28 symbols. Any encoder
 * applying ONLY variable powers of T to ordinary GP plaintext preserves
 * every H position, irrespective of offsets and key schedule.
 *
 * This module tests that necessary consequence against a
 * length/position-conditioned authentic English reference, with
 * within-word permutation nulls preserving every word's H count.
 *
 * @module lag6_rotor_consistency
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const rotor = require('./orbit_phase_vote_recovery.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SOURCE = read('resources/lp2-transcription.txt');
const ENGLISH = read('resources/control/shakespeare_first300k.txt');
const PAGE_WORDS = rotor.parseLP2(SOURCE);
const PLAIN_TRAIN = rotor.groupByLength([]); // Populated only for 5+ dictionary fallback.
const MAX_WORD_LENGTH = 10;
const NULL_REPLICATES = 2500;
const SEED = 0x27a88126;
const T = x => (24 - 2 * x + 58) % 29;

/** @param {string} sample Latin text. */
function encodeTokens(sample) {
  return (sample.toUpperCase().match(/[A-Z]+/g) || [])
    .map(rotor.encode).filter(x => x !== null && x.length);
}

/** @param {number[][]} words */
function rotorEchoCounts(words) {
  let echoT = 0, directEqual = 0, eligible = 0;
  const byLength = new Map();
  for (const word of words) {
    if (word.length < 7) continue;
    let r = byLength.get(word.length);
    if (!r) {
      r = {words: 0, eligible: 0, TMatches: 0, equalMatches: 0};
      byLength.set(word.length, r);
    }
    r.words++;
    for (let i = 6; i < word.length; i++) {
      eligible++;
      r.eligible++;
      if (word[i] === T(word[i - 6])) { echoT++; r.TMatches++; }
      if (word[i] === word[i - 6]) { directEqual++; r.equalMatches++; }
    }
  }
  return {echoT, directEqual, eligible,
    byLength: [...byLength].sort((a, b) => a[0] - b[0])
      .map(([length, values]) => ({length, ...values}))};
}

/**
 * Expected count of plaintext rune equalities lag6, sampled independently
 * from Shakespeare words with exact observed word lengths. This is a
 * descriptive expected value; no inference from a binomial p-value.
 * @param {number[][]} real
 * @param {number[][]} reference
 */
function lengthMatchedExpectation(real, reference) {
  const groups = new Map();
  for (const w of reference) {
    if (w.length < 7) continue;
    let data = groups.get(w.length);
    if (!data) { data = {words: 0, matches: 0}; groups.set(w.length, data); }
    data.words++;
    for (let i = 6; i < w.length; i++) data.matches += +(w[i] === w[i - 6]);
  }
  let sum = 0;
  const perLength = [];
  for (const row of rotorEchoCounts(real).byLength) {
    const ref = groups.get(row.length);
    assert.ok(ref && ref.words);
    const expected = row.words * ref.matches / ref.words;
    sum += expected;
    perLength.push({length: row.length, observed: row.TMatches,
      expected, referenceWords: ref.words, manuscriptWords: row.words});
  }
  return {expectedMatches: sum, perLength};
}

/**
 * Train conditional Pr(P=H | word length, word position) for
 * word lengths 1 through 10. 0.5 pseudocount per indicator bin.
 * @param {number[][]} reference GP words.
 */
function hPositionRates(reference) {
  const n = Array(MAX_WORD_LENGTH + 1).fill(0);
  const counts = Array.from({length: MAX_WORD_LENGTH + 1},
    (_, length) => Array(length).fill(0));
  for (const w of reference) {
    if (w.length > MAX_WORD_LENGTH) continue;
    n[w.length]++;
    for (let i = 0; i < w.length; i++) {
      if (w[i] === 8) counts[w.length][i]++;
    }
  }
  return counts.map((r, length) =>
    r.map(hits => (hits + 0.5) / (n[length] + 1)));
}

/**
 * Score only H positions: when shuffling H positions within the same
 * individual word, the contribution of each non-H term is fixed.
 * @param {number[][]} words
 * @param {number[][]} rates
 */
function scoreH(words, rates) {
  let sum = 0, h = 0, testedWords = 0;
  for (const w of words) {
    if (w.length > MAX_WORD_LENGTH) continue;
    testedWords++;
    for (let i = 0; i < w.length; i++) {
      if (w[i] !== 8) continue;
      const p = rates[w.length][i];
      sum += Math.log(p / (1 - p));
      h++;
    }
  }
  return {score: sum, occurrences: h, eligibleWords: testedWords};
}

/**
 * Permute H locations inside every real word, preserving exact H
 * count and word length; sample the full conditional log-odds score.
 * @param {number[][]} words
 * @param {number[][]} rates
 * @param {number} seed
 * @param {number} replicates
 */
function sampleNull(words, rates, seed, replicates) {
  const draw = rotor.random32(seed);
  const observed = scoreH(words, rates);
  const terms = words.filter(w => w.length <= MAX_WORD_LENGTH)
    .map(w => ({length: w.length, count: w.filter(x => x === 8).length}))
    .filter(x => x.count > 0);
  let sum = 0, squareSum = 0, exceed = 0;
  let minimum = Infinity, maximum = -Infinity;
  for (let sample = 0; sample < replicates; sample++) {
    let value = 0;
    for (const word of terms) {
      const order = Array.from({length: word.length}, (_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = draw() % (i + 1);
        [order[j], order[i]] = [order[i], order[j]];
      }
      for (let i = 0; i < word.count; i++) {
        const p = rates[word.length][order[i]];
        value += Math.log(p / (1 - p));
      }
    }
    sum += value;
    squareSum += value * value;
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
    if (value >= observed.score) exceed++;
  }
  const mean = sum / replicates;
  const sd = Math.sqrt(Math.max(0, squareSum / replicates - mean * mean));
  return {observed, mean, sd,
    observedZ: (observed.score - mean) / sd,
    minimum, maximum,
    upperTailP: (exceed + 1) / (replicates + 1),
    replicates, seed: '0x' + (seed >>> 0).toString(16),
    conditioning: 'exact number of H runes in each word, word length'};
}

function run() {
  assert.equal(T(8), 8);
  const reference = encodeTokens(ENGLISH.slice(0, 240000));
  const heldout = encodeTokens(ENGLISH.slice(240000));
  const rates = hPositionRates(reference);
  const real = sampleNull(PAGE_WORDS, rates, SEED, NULL_REPLICATES);
  const genuineEnglish = sampleNull(heldout, rates,
    SEED ^ 0x31be42, NULL_REPLICATES);

  // Independent plaintext positive with every manuscript word length,
  // six-lane rotor shifts and actual 81% anti-doublet repair.
  const positive = rotor.plant(PAGE_WORDS, heldout,
    rotor.random32(0x201183), rotor.groupByLength(reference));
  const positiveNull = sampleNull(positive.words, rates,
    SEED ^ 0x41c2f7, NULL_REPLICATES);
  const actualH = PAGE_WORDS.flat().filter(r => r === 8).length;
  const trainFlat = reference.flat();
  const trainH = trainFlat.filter(r => r === 8).length;

  return {
    sourceSha256: createHash('sha256').update(SOURCE).digest('hex'),
    transformation: 'T(x) = 24 - 2x mod29 = 8 - 2(x-8) mod29',
    fixedPoint: {index: 8, GP: 'H', ciphertextOccurrences: actualH,
      ciphertextRate: actualH / 12956,
      EnglishTrainingRate: trainH / trainFlat.length},
    lag6: {
      actual: rotorEchoCounts(PAGE_WORDS),
      lengthMatchedEnglishExpected: lengthMatchedExpectation(PAGE_WORDS, reference)
    },
    positionalH: {
      actual: real,
      authenticHeldoutEnglish: genuineEnglish,
      knownRotorWithDoubletRepair: positiveNull,
      positiveCiphertextReplacements: positive.replaced,
      positiveRareLengthReferenceFallback: positive.fallbackWords,
      conditionalInterpretation:
        'Index8 should preserve literal English H locations under T powers only; actual positional likelihood is not elevated'
    },
    limitations: 'The H criterion requires no outer relabeling, no arbitrary homophones and GP-English word boundaries; sparse repair or a different plaintext register may alter it. Lag-six T and English repeat-count agreement alone do not identify a key.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {encodeTokens, rotorEchoCounts, lengthMatchedExpectation,
  hPositionRates, scoreH, sampleNull, run};
