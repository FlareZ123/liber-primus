'use strict';
/**
 * Forward-model calibration of the frozen LP2 four-feature echo predictor.
 * M1/M3 are preexisting lossy forward hypotheses, never a decryption.
 *
 * Node.js 22, CommonJS, original canonical 55 rune-bearing LP2 pages.
 * @module lp2_echo_forward_model_gate
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {
  parseWords, events, fitWeights, metric,
} = require('./lp2_heldout_echo_predictor.cjs');
const { random32 } = require('./lag6_conditioned_echo.cjs');
const { generate } = require('./lag5_block_echo_forward_challenge.cjs');

const SEED_M1 = 0x12a53310;
const SEED_M3 = 0x12a53330;
const REPLICATES = 5000;
const SPLIT_WORD = 1448;

/** @param {number[]} numbers @returns {object} */
function summary(numbers) {
  const ordered = numbers.slice().sort((a, b) => a - b);
  const n = numbers.length;
  const mean = numbers.reduce((a, b) => a + b, 0) / n;
  const variance = numbers.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return {
    mean, sd: Math.sqrt(variance),
    median: ordered[n >> 1],
    percentile95: ordered[Math.floor(n * 0.95)],
    minimum: ordered[0], maximum: ordered[n - 1],
  };
}

/** @returns {object} Full original/forward synthetic comparison. */
function run() {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'),
    'utf8');
  const original = parseWords(source);
  assert.equal(original.length, 2896);
  const train = events(original.slice(0, SPLIT_WORD));
  const q = train.doubles / train.rows.length;
  const fitted = fitWeights(train.rows, q);
  const baseline = metric(events(original.slice(SPLIT_WORD)).rows, fitted, q).lift;
  assert.ok(Math.abs(baseline - 12.424233274088047) < 1e-8);
  const models = {};
  for (const [name, seed] of [['M1', SEED_M1], ['M3', SEED_M3]]) {
    const next = random32(seed);
    const lifts = [];
    let upper = 0;
    const diagnosticHits = [0, 0, 0, 0];
    for (let trial = 0; trial < REPLICATES; trial++) {
      const book = generate(original, next, name);
      const tests = events(book.slice(SPLIT_WORD)).rows;
      const measurement = metric(tests, fitted, q).lift;
      lifts.push(measurement);
      if (measurement >= baseline) upper++;
      for (let k = 0; k < 4; k++) {
        diagnosticHits[k] += metric(tests, fitted, q, k).hits;
      }
    }
    models[name] = {
      seed: '0x' + seed.toString(16),
      distribution: summary(lifts),
      exceed_original: upper,
      plus_one_tail: (upper + 1) / (REPLICATES + 1),
      average_feature_hits: diagnosticHits.map(v => v / REPLICATES),
    };
  }
  return {
    original_frozen_log_lift: baseline,
    original_heldout_feature_hits: [40, 7, 48, 6],
    fitted_weights: fitted,
    original_training_doublet_probability: q,
    replicates_per_model: REPLICATES,
    model_advance: 'The earlier published M1/M3 uniform tentative-rune collision-repair and lag5 independent-copy generators; unchanged parameters q=.818, epsilon=.015',
    models,
    caveat: 'The four predictor features were historically selected on real LP2. Synthetic forward mechanisms are lossy and are not candidate complete decryptors. Model tail is a conditional adequacy check, not a global solution p-value.',
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = { summary, run };
