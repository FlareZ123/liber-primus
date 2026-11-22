'use strict';

/**
 * Exact all-key necessary-condition test for a GP29 substitution pad
 * repeated after 2576 runes on original LP2 pp0-54.
 *
 * One same-phase permutation of all 29 letters may be secret and arbitrary.
 * Ciphertext equality between cycles at the same phase must still equal
 * plaintext equality. The test never guesses the permutations.
 *
 * Run: node sims/lp2_artifex_icc_2576period_allkey_equality_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ciphertext = corpus.pages
  .filter(page => page.page <= 54).flatMap(page => page.indices);
const PERIOD = 2576;
const CYCLES = 5;
assert.equal(ciphertext.length, PERIOD * CYCLES);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);

const gp = new Map(corpus.translit.map((token, index) => [token, index]));
const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];

/**
 * A declared English-to-GP spelling convention used unchanged for all
 * source-disjoint controls. No tuning to LP2 cipher indices.
 * @param {string} text
 * @returns {number[]}
 */
function encodeEnglish(text) {
  const letters = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const output = [];
  for (let i = 0; i < letters.length;) {
    if (letters.startsWith('ING', i)) {
      output.push(gp.get('I'), gp.get('NG'));
      i += 3;
      continue;
    }
    const token = digraphs.find(value => letters.startsWith(value, i));
    if (token) {
      output.push(gp.get(token));
      i += token.length;
    } else {
      const index = gp.get(letters[i]);
      assert.notEqual(index, undefined);
      output.push(index);
      i++;
    }
  }
  return output;
}

/**
 * Number of equal-GP-symbol pairs over the five equal-length cycles,
 * at precisely the same phase. No corpus normalization or key search.
 * @param {number[]} source
 * @returns {{total:number, perPair:Array<{a:number,b:number,count:number}>}}
 */
function collisions(source) {
  assert.equal(source.length, PERIOD * CYCLES);
  let total = 0;
  const perPair = [];
  for (let a = 0; a < CYCLES; a++) {
    for (let b = a + 1; b < CYCLES; b++) {
      let count = 0;
      for (let j = 0; j < PERIOD; j++) {
        if (source[a * PERIOD + j] === source[b * PERIOD + j]) count++;
      }
      total += count;
      perPair.push({a: a + 1, b: b + 1, count});
    }
  }
  assert.equal(perPair.length, 10);
  return {total, perPair};
}

/** @param {number[]} source */
function ioc(source) {
  const counts = Array(29).fill(0);
  for (const value of source) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (source.length * (source.length - 1));
}

/**
 * Deterministic genuine non-affine secret substitution for each of
 * 2576 phases. Provides a true positive for all-secret equality.
 * @param {number[]} plain
 * @returns {number[]}
 */
function encryptPhasePermutations(plain) {
  let state = 0x33012576;
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  const transforms = Array.from({length: PERIOD}, () => {
    const sigma = Array.from({length:29}, (_,i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rand() % (i + 1);
      [sigma[i], sigma[j]] = [sigma[j], sigma[i]];
    }
    return sigma;
  });
  return plain.map((p, i) => transforms[i % PERIOD][p]);
}

const original = collisions(ciphertext);
assert.equal(original.total, 899);
assert.deepEqual(original.perPair.map(pair => pair.count),
  [94, 77, 100, 79, 100, 104, 100, 79, 103, 63]);

const controls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 216874, 100],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62550, 25],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 320945, 151]
];
const observations = [];
for (const [name, relativePath, expectedGpCount, expectedWindowCount] of controls) {
  const english = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const encoded = encodeEnglish(english);
  assert.equal(encoded.length, expectedGpCount);
  const values = [];
  for (let start = 0; start + PERIOD * CYCLES <= encoded.length; start += 2048) {
    values.push(collisions(encoded.slice(start, start + PERIOD * CYCLES)).total);
  }
  assert.equal(values.length, expectedWindowCount);
  const sum = values.reduce((a,b) => a+b, 0);
  observations.push({
    source: name,
    sourceGpRunes: encoded.length,
    originalLengthWindows: values.length,
    minCollisions: Math.min(...values),
    maxCollisions: Math.max(...values),
    meanCollisions: sum / values.length,
    wholeSourceIoC: ioc(encoded)
  });
  // True ciphertext plant with a separate arbitrary secret GP permutation
  // for every phase: all 2576 secret permutations remain unknown to scorer.
  const plant = encoded.slice(0, PERIOD * CYCLES);
  const encodedPlant = encryptPhasePermutations(plant);
  assert.notDeepEqual(encodedPlant, plant);
  assert.deepEqual(collisions(encodedPlant), collisions(plant));
  assert.ok(values.every(value => value > original.total));
}
assert.deepEqual(observations.map(item => item.minCollisions), [1364, 1432, 1429]);

console.log(JSON.stringify({
  periodFromOriginalICCBodyBytes: PERIOD,
  sourceCiphertextRunes: ciphertext.length,
  sourceOriginalEqualPairCount: original.total,
  totalSamePhasePairs: PERIOD * 10,
  sourceOriginalRate: original.total / (PERIOD * 10),
  originalCiphertextIoC: ioc(ciphertext),
  perCyclePairCounts: original.perPair,
  sourceDisjointGpEnglishControls: observations,
  totalGpEnglishWindows: observations.reduce((sum,x) => sum + x.originalLengthWindows, 0),
  true2576PhaseUnknownSubstitutionPlants: '3 of 3 exact equality invariants',
  interpretation: 'Fixed 2576-phase bijective substitution cannot turn the original five cycles into plaintext resembling three direct GP29 English corpora. This does not exclude nonperiodic/stateful cipher clocks or non-English/intermediate plaintext.'
}, null, 2));
