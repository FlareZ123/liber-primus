'use strict';

/**
 * Conditional permutation test of the externally reported LP2 word-internal
 * c[i] = 24 - 2*c[i-6] (mod 29) relation.
 *
 * A null word retains its complete original rune multiset, length and exact
 * count of adjacent equal-rune pairs. Other order information is randomized.
 * Controls are sampled independently for each manuscript word.
 *
 * @module lag6_conditioned_echo
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const RUNE_INDEX = new Map(ALPHABET.map((rune, i) => [rune, i]));
const MODULUS = 29;
const AFFINE_LAG = 6;
const SEED = 0x38a729bb;
const DEFAULT_REPLICATES = 3000;

/**
 * Select the 55 rune-bearing unsolved pages from the normalized source.
 * The rune-free physical page 50 is absent from this transcription.
 * Later source records are already-solved AN END and PARABLE.
 * @param {string} source UTF-8 corpus from resources/lp2-transcription.txt.
 * @returns {number[][]} Rune-index words, including short words.
 */
function parseUnsolved(source) {
  const pageRecords = source.split('%');
  if (pageRecords.length < 57) throw new Error('Expected 55 unsolved and two solved page records');
  const joined = pageRecords.slice(0, 55).join('%').replace(/[\r\n\t\/% ]/g, '');
  const chunks = joined.split(/[-.&$§0-9]+/).filter(Boolean);
  const words = chunks.map((word) => {
    return [...word].map((rune) => {
      const code = RUNE_INDEX.get(rune);
      if (code === undefined) throw new Error('Unrecognized rune in LP2 transcription');
      return code;
    });
  });
  const totalRunes = words.reduce((sum, word) => sum + word.length, 0);
  if (words.length !== 2896 || totalRunes !== 12956) {
    throw new Error('Canonical LP2 count mismatch: ' + words.length + ' words, ' + totalRunes + ' runes');
  }
  return words;
}

/**
 * Deterministic xorshift32 pseudorandom generator.
 * @param {number} seed Unsigned initial generator state.
 * @returns {() => number} Unsigned 32-bit random value producer.
 */
function random32(seed) {
  let x = seed >>> 0;
  if (!x) throw new RangeError('Nonzero RNG seed required');
  return function next() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x;
  };
}

/**
 * @param {number[]} original Rune indexes.
 * @param {() => number} random Unsigned 32-bit generator.
 * @returns {number[]} Uniform Fisher-Yates permutation up to negligible
 * modulo-reduction bias of at most 2**-32 per draw.
 */
function shuffledCopy(original, random) {
  const word = original.slice();
  for (let i = word.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    const temp = word[i];
    word[i] = word[j];
    word[j] = temp;
  }
  return word;
}

/**
 * @param {number[]} word Rune indexes.
 * @returns {number} Number of adjacent equal-rune pairs.
 */
function adjacentEqualCount(word) {
  let count = 0;
  for (let i = 1; i < word.length; i++) {
    if (word[i] === word[i - 1]) count++;
  }
  return count;
}

/**
 * Affine map T(x) = 24 - 2x (mod 29).
 * x = 8 is a fixed point, while all other elements form one 28-cycle.
 * @param {number} x Rune index.
 * @returns {number} Transformed index.
 */
function transform(x) {
  return (24 - 2 * x + 2 * MODULUS) % MODULUS;
}

/** @returns {number[][]} The orbit exponent taking row index to column index. */
function orbitLookup() {
  const lookup = Array.from({ length: MODULUS }, () => Array(MODULUS).fill(-1));
  for (let x = 0; x < MODULUS; x++) {
    let y = x;
    for (let exponent = 0; exponent < 28; exponent++) {
      lookup[x][y] = exponent;
      y = transform(y);
    }
    if (y !== x) throw new Error('Affine map did not cycle back after 28 powers');
  }
  return lookup;
}

/**
 * Count equalities y = T^k(x) for k in [0, 27] at lag 6 within words.
 * The x = y = 8 fixed point contributes to all 28 candidate powers.
 * @param {number[][]} words Long rune-index words, length >= 7.
 * @param {number[][]} lookup Orbit lookup table.
 * @returns {number[]} Match count per power.
 */
function orbitCounts(words, lookup) {
  const counts = Array(28).fill(0);
  let fixedPointMatches = 0;
  for (const word of words) {
    for (let i = AFFINE_LAG; i < word.length; i++) {
      const x = word[i - AFFINE_LAG];
      const y = word[i];
      if (x === 8 && y === 8) {
        fixedPointMatches++;
      } else {
        const exponent = lookup[x][y];
        if (exponent >= 0) counts[exponent]++;
      }
    }
  }
  for (let exponent = 0; exponent < 28; exponent++) {
    counts[exponent] += fixedPointMatches;
  }
  return counts;
}

/** @param {number[]} values Nonempty observations. */
function summary(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance), minimum: Math.min(...values),
    maximum: Math.max(...values) };
}

/**
 * Full reproducible conditional null including orbit familywise correction.
 * @param {string} source UTF-8 transcription.
 * @param {number} [replicates=3000] Number of full-corpus shuffles.
 * @param {number} [seed=SEED] xorshift32 seed.
 */
function run(source, replicates = DEFAULT_REPLICATES, seed = SEED) {
  if (!Number.isInteger(replicates) || replicates < 1) {
    throw new RangeError('replicates must be a positive integer');
  }
  const words = parseUnsolved(source);
  const longWords = words.filter((word) => word.length >= AFFINE_LAG + 1);
  const totalPairs = longWords.reduce((sum, word) => sum + word.length - AFFINE_LAG, 0);
  const originalAdjacentCounts = longWords.map(adjacentEqualCount);
  const originalAdjacentTotal = originalAdjacentCounts.reduce((sum, value) => sum + value, 0);
  const lookup = orbitLookup();
  const observedOrbit = orbitCounts(longWords, lookup);
  const observed = observedOrbit[1];
  const random = random32(seed);
  const fixedNull = [];
  const orbitMaximumNull = [];
  let fixedExceed = 0;
  let familywiseExceed = 0;
  let shufflesDrawn = 0;

  for (let sample = 0; sample < replicates; sample++) {
    const shuffledWords = longWords.map((word, index) => {
      let permuted;
      do {
        permuted = shuffledCopy(word, random);
        shufflesDrawn++;
      } while (adjacentEqualCount(permuted) !== originalAdjacentCounts[index]);
      return permuted;
    });
    const orbit = orbitCounts(shuffledWords, lookup);
    const fixed = orbit[1];
    const maximum = Math.max(...orbit);
    fixedNull.push(fixed);
    orbitMaximumNull.push(maximum);
    if (fixed >= observed) fixedExceed++;
    if (maximum >= observed) familywiseExceed++;
  }

  const perWordHitCounts = { one: 0, twoOrMore: 0 };
  for (const word of longWords) {
    const own = orbitCounts([word], lookup)[1];
    if (own === 1) perWordHitCounts.one++;
    if (own >= 2) perWordHitCounts.twoOrMore++;
  }
  return {
    sourceSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
    model: 'within-word T(x)=24-2x modulo 29, gap 6',
    words: words.length,
    runes: words.reduce((sum, word) => sum + word.length, 0),
    longWords: longWords.length,
    eligibleLag6Pairs: totalPairs,
    adjacentEqualPairsAmongLongWords: originalAdjacentTotal,
    observed: {
      fixedTransformMatches: observed,
      orbitCounts: observedOrbit,
      wordsWithOneMatch: perWordHitCounts.one,
      wordsWithMultipleMatches: perWordHitCounts.twoOrMore
    },
    null: {
      replicates,
      seed: '0x' + (seed >>> 0).toString(16),
      conditioning: 'exact per-word multiset, length, adjacent-equal count',
      drawsPerWord: shufflesDrawn / (replicates * longWords.length),
      fixed: summary(fixedNull),
      orbitMaximum: summary(orbitMaximumNull),
      fixedExceed,
      familywiseExceed,
      fixedEmpiricalP: (fixedExceed + 1) / (replicates + 1),
      orbitFamilywiseEmpiricalP: (familywiseExceed + 1) / (replicates + 1)
    }
  };
}

if (require.main === module) {
  const source = fs.readFileSync(path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  console.log(JSON.stringify(run(source), null, 2));
}

module.exports = {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount,
  transform, orbitLookup, orbitCounts, run
};
