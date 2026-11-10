'use strict';
/**
 * Held-out predictive test of four published LP2 word-local echo candidates.
 *
 * Fully disclosed fixed model, split, and conditional randomization. The
 * original motifs were found in earlier exploratory work, so the resulting
 * permutation tail is not a discovery-wide p-value.
 *
 * Reproduce in the repository with Node.js 22.
 * @module lp2_heldout_echo_predictor
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'resources', 'lp2-transcription.txt');
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const INDEX = new Map(ALPHABET.map((r, i) => [r, i]));
const SPLIT_WORD = 1448;
const ITERATIONS = 14;
const SHUFFLES = 1500;
const SEED = 0x12a53301;

/**
 * @param {string} source Original line- and page-preserving transcription.
 * @returns {number[][]}
 */
function parseWords(source) {
  const records = source.split('%');
  assert.ok(records.length >= 57);
  const input = records.slice(0, 55).join('%')
    .replace(/[\r\n\t\/% ]/g, '');
  const words = input.split(/[-.&$§0-9]+/).filter(Boolean)
    .map(word => [...word].map(rune => {
      const value = INDEX.get(rune);
      assert.notEqual(value, undefined, 'unknown source rune');
      return value;
    }));
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
  return words;
}

/**
 * Candidate event codes. -1 indicates inapplicable feature.
 * The four features are fixed before fitting: T6, S5, general lag5,
 * and a second contiguous lag5 copy.
 *
 * @param {number[]} word
 * @param {number} i
 * @returns {number[]}
 */
function candidates(word, i) {
  return [
    i >= 6 ? (24 - 2 * word[i - 6] + 58) % 29 : -1,
    i >= 5 && word[i - 5] === 15 ? 15 : -1,
    i >= 5 ? word[i - 5] : -1,
    i >= 6 && word[i - 1] === word[i - 6] ? word[i - 5] : -1,
  ];
}

/**
 * @param {number[][]} words
 * @returns {{rows:Array<[number,number,number[]]>,doubles:number}}
 */
function events(words) {
  const rows = [];
  let previous = 0;
  let first = true;
  let doubles = 0;
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const current = word[i];
      if (!first) {
        rows.push([current, previous, candidates(word, i)]);
        if (current === previous) doubles++;
      }
      previous = current;
      first = false;
    }
  }
  return { rows, doubles };
}

/**
 * Exact conditional log-likelihood lift against a flat 29-rune
 * generator with observed adjacent-repeat probability q.
 * The model multiplies each candidate output probability by
 * exp(weight) and normalizes the entire 29-rune distribution.
 *
 * @param {Array<[number,number,number[]]>} rows
 * @param {number[]} weight
 * @param {number} q
 * @param {number} [feature]
 * @returns {{lift:number,gradient:number,curvature:number,opportunities:number,hits:number}}
 */
function metric(rows, weight, q, feature = -1) {
  let lift = 0;
  let gradient = 0;
  let curvature = 0;
  let opportunities = 0;
  let hits = 0;
  for (const [current, previous, four] of rows) {
    if (feature >= 0 && four[feature] < 0) continue;
    const targets = [];
    const energies = [];
    for (let j = 0; j < four.length; j++) {
      if (four[j] < 0) continue;
      let k = targets.indexOf(four[j]);
      if (k < 0) {
        k = targets.length;
        targets.push(four[j]);
        energies.push(0);
      }
      energies[k] += weight[j];
    }
    let normalizer = 1;
    let observedEnergy = 0;
    let targetMass = 0;
    for (let k = 0; k < targets.length; k++) {
      const rune = targets[k];
      const base = rune === previous ? q : (1 - q) / 28;
      const multiplier = Math.exp(energies[k]);
      normalizer += base * (multiplier - 1);
      if (rune === current) observedEnergy = energies[k];
      if (feature >= 0 && rune === four[feature]) {
        targetMass = base * multiplier;
      }
    }
    lift += observedEnergy - Math.log(normalizer);
    if (feature >= 0) {
      const p = targetMass / normalizer;
      gradient += Number(current === four[feature]) - p;
      curvature += p * (1 - p);
      opportunities++;
      hits += Number(current === four[feature]);
    }
  }
  return { lift, gradient, curvature, opportunities, hits };
}

/**
 * @param {Array<[number,number,number[]]>} train
 * @param {number} q
 * @returns {number[]}
 */
function fitWeights(train, q) {
  const weights = [0, 0, 0, 0];
  for (let pass = 0; pass < ITERATIONS; pass++) {
    for (let j = 0; j < weights.length; j++) {
      const { gradient, curvature } = metric(train, weights, q, j);
      assert.ok(curvature > 0, 'nonidentifiable feature');
      weights[j] = Math.max(-6, Math.min(6,
        weights[j] + gradient / curvature));
    }
  }
  return weights;
}

/**
 * @param {number} seed
 * @returns {() => number}
 */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x;
  };
}

/**
 * Randomize each word's interior while retaining its complete rune multiset,
 * endpoint symbols, and exact adjacent identical-rune count. Fixed endpoints
 * also retain every global cross-word doublet.
 *
 * @param {number[][]} words
 * @param {() => number} random
 * @returns {number[][]}
 */
function conditionedShuffle(words, random) {
  return words.map(original => {
    if (original.length <= 3) return original;
    let required = 0;
    for (let i = 1; i < original.length; i++) {
      required += Number(original[i] === original[i - 1]);
    }
    for (;;) {
      const sample = original.slice();
      for (let i = sample.length - 2; i > 1; i--) {
        const j = 1 + random() % i;
        [sample[i], sample[j]] = [sample[j], sample[i]];
      }
      let found = 0;
      for (let i = 1; i < sample.length; i++) {
        found += Number(sample[i] === sample[i - 1]);
      }
      if (found === required) return sample;
    }
  });
}

/** @returns {object} Full original-source and conditional-control test. */
function run() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const words = parseWords(source);
  const train = events(words.slice(0, SPLIT_WORD));
  const heldoutWords = words.slice(SPLIT_WORD);
  const heldout = events(heldoutWords);
  const q = train.doubles / train.rows.length;
  const weights = fitWeights(train.rows, q);
  const measured = metric(heldout.rows, weights, q).lift;
  assert.ok(Math.abs(measured - 12.424233274088047) < 1e-8,
    'source ciphertext has changed or predictor differs from tested version');
  assert.equal(metric(heldout.rows, [0, 0, 0, 0], q).lift, 0);
  const random = xorshift32(SEED);
  const controls = [];
  let exceedances = 0;
  for (let trial = 0; trial < SHUFFLES; trial++) {
    const sample = events(conditionedShuffle(heldoutWords, random));
    assert.equal(sample.doubles, heldout.doubles);
    const control = metric(sample.rows, weights, q).lift;
    controls.push(control);
    if (control >= measured) exceedances++;
  }
  controls.sort((a, b) => a - b);
  return {
    source_sha256: crypto.createHash('sha256').update(source).digest('hex'),
    words: words.length,
    runes: 12956,
    split_word: SPLIT_WORD,
    train_runes: train.rows.length + 1,
    heldout_runes: heldout.rows.length + 1,
    baseline_adjacent_repeat_probability: q,
    weights: weights.map((value, j) => ({
      name: ['T6', 'S5', 'lag5', 'lag5_contiguous'][j],
      value,
      heldout: metric(heldout.rows, weights, q, j),
    })),
    train_log_likelihood_lift: metric(train.rows, weights, q).lift,
    heldout_log_likelihood_lift: measured,
    shuffles: SHUFFLES,
    conditional_null_median: controls[SHUFFLES >> 1],
    conditional_null_maximum: controls[SHUFFLES - 1],
    conditional_null_95th: controls[Math.floor(SHUFFLES * 0.95)],
    null_exceedances: exceedances,
    empirical_tail_add_one: (exceedances + 1) / (SHUFFLES + 1),
    random_seed: SEED,
    caveat: 'Features were historically selected using the whole ciphertext. The reported tail only conditions on the fixed four-feature model and the explicitly constrained holdout randomizations.',
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = { parseWords, candidates, events, metric,
  fitWeights, conditionedShuffle, run };
