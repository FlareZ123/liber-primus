'use strict';
/**
 * Leave-one-section-out challenge to the source-original lag5/lag6 predictor.
 * Eight nonempty $-delimited LP2 sections serve as independent withheld regions.
 * Shared source-selected features are fixed; only four weights and adjacent
 * repeat baseline are re-estimated on the other seven sections per fold.
 *
 * Node.js 22; no dependencies, I/O writes, or dynamic trial selection.
 * @module lp2_echo_section_crossfit
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {
  events, fitWeights, metric, conditionedShuffle,
} = require('./lp2_heldout_echo_predictor.cjs');

const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const LOOKUP = new Map(ALPHABET.map((glyph, i) => [glyph, i]));
const SOURCE = path.resolve(__dirname, '../resources/lp2-transcription.txt');
const REPLICATES = 1500;
const SEED = 0x12083301;
const RUNE_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
const WORD_LENGTHS = [158, 255, 385, 435, 224, 326, 378, 735];

/** @param {string} source @returns {number[][][]} */
function sectionsFromSource(source) {
  const text = source.split('%').slice(0, 55).join('%')
    .replace(/[\r\n\t\/% ]/g, '');
  const groups = text.split('$')
    .map(part => part.split(/[-.&§0-9]+/).filter(Boolean)
      .map(word => [...word].map(glyph => {
        const value = LOOKUP.get(glyph);
        assert.notEqual(value, undefined);
        return value;
      })).filter(word => word.length > 0))
    .filter(section => section.length > 0);
  assert.deepEqual(groups.map(group => group.length), WORD_LENGTHS);
  assert.deepEqual(groups.map(group => group.reduce((n, word) => n + word.length, 0)), RUNE_LENGTHS);
  return groups;
}

/** @param {number} seed @returns {() => number} */
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

/** @returns {object} The eight heldout-fold scores and selection-matched null. */
function run() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const sections = sectionsFromSource(source);
  const originals = sections.map(events);
  const fits = sections.map((unused, omit) => {
    const training = originals.filter((row, i) => i !== omit);
    const trainRows = training.flatMap(entry => entry.rows);
    const trainDoubles = training.reduce((sum, entry) => sum + entry.doubles, 0);
    const q = trainDoubles / trainRows.length;
    return { q, weights: fitWeights(trainRows, q) };
  });
  const scores = originals.map((section, i) =>
    metric(section.rows, fits[i].weights, fits[i].q).lift);
  const observed = scores.reduce((a, b) => a + b, 0);
  const rng = xorshift32(SEED);
  const nullSums = [];
  const exceedingBySection = Array(8).fill(0);
  let exceedingAll = 0;
  for (let sample = 0; sample < REPLICATES; sample++) {
    let sum = 0;
    for (let i = 0; i < sections.length; i++) {
      const shuffled = events(conditionedShuffle(sections[i], rng));
      assert.equal(shuffled.doubles, originals[i].doubles);
      const lift = metric(shuffled.rows, fits[i].weights, fits[i].q).lift;
      sum += lift;
      if (lift >= scores[i]) exceedingBySection[i]++;
    }
    if (sum >= observed) exceedingAll++;
    nullSums.push(sum);
  }
  nullSums.sort((a, b) => a - b);
  return {
    folds: sections.map((section, i) => ({
      section: i,
      words: section.length,
      runes: RUNE_LENGTHS[i],
      heldout_nats: scores[i],
      heldout_per_observation: scores[i] / (RUNE_LENGTHS[i] - 1),
      training_q: fits[i].q,
      trained_weights: fits[i].weights,
      section_null_at_least_original: exceedingBySection[i],
      section_null_upper_tail_add_one: (exceedingBySection[i] + 1) / (REPLICATES + 1),
    })),
    total_original_heldout_gain_nats: observed,
    null_replicates: REPLICATES,
    null_aggregate_median: nullSums[REPLICATES >> 1],
    null_aggregate_percentile95: nullSums[Math.floor(REPLICATES * 0.95)],
    null_aggregate_maximum: nullSums[REPLICATES - 1],
    null_aggregate_exceedances: exceedingAll,
    null_aggregate_add_one_tail: (exceedingAll + 1) / (REPLICATES + 1),
    seed: SEED,
    methodological_limit: 'Feature family was historically selected using the original full corpus. Section crossfit tests generalization of this fixed family, not the discovery-wide probability of the motifs or an actual cipher inverse.',
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = { sectionsFromSource, xorshift32, run };
