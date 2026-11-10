'use strict';

/**
 * Test the plausible explanation "an affine lag-five echo has fixed point S":
 * U_a(x) = S + a*(x-S) (mod 29) for all 28 invertible slopes a.
 *
 * All x=y=S matches are tautological for this family and are EXCLUDED from
 * its evidence. The test therefore asks if any slope predicts extra matches
 * of other rune values under exact word-multiset and doublet-constrained nulls.
 *
 * @module lag5_affine_fixedpoint_sieve
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');
const MOD = 29;
const FIXED = 15;
const LAG = 5;
const SEED = 0x64c99a85;
const INVERSES = Array(MOD).fill(0);
for (let a = 1; a < MOD; a++) {
  for (let b = 1; b < MOD; b++) {
    if ((a * b) % MOD === 1) INVERSES[a] = b;
  }
}

/**
 * @param {number[][]} words Rune-index words of length >=6.
 * @returns {number[]} Counts indexed by nonzero affine multiplier.
 */
function countNonfixedPairs(words) {
  const scores = Array(MOD).fill(0);
  for (const word of words) {
    for (let i = LAG; i < word.length; i++) {
      const x = word[i - LAG];
      const y = word[i];
      if (x === FIXED || y === FIXED) continue;
      const multiplier = ((y - FIXED + MOD) *
        INVERSES[(x - FIXED + MOD) % MOD]) % MOD;
      if (multiplier > 0) scores[multiplier]++;
    }
  }
  return scores;
}

/**
 * @param {string} source Canonical UTF-8 rune transcription.
 * @param {number} [training=2000] Number of calibration randomizations.
 * @param {number} [testing=2000] Number of independent test randomizations.
 * @param {number} [seed=SEED] PRNG seed.
 */
function run(source, training = 2000, testing = 2000, seed = SEED) {
  const words = parseUnsolved(source).filter(word => word.length > LAG);
  const adjacent = words.map(adjacentEqualCount);
  const observed = countNonfixedPairs(words);
  const rand = random32(seed);
  const draw = () => {
    const scores = Array(MOD).fill(0);
    for (let j = 0; j < words.length; j++) {
      let shuffled;
      do {
        shuffled = shuffledCopy(words[j], rand);
      } while (adjacentEqualCount(shuffled) !== adjacent[j]);
      for (let i = LAG; i < shuffled.length; i++) {
        const x = shuffled[i - LAG];
        const y = shuffled[i];
        if (x === FIXED || y === FIXED) continue;
        const a = ((y - FIXED + MOD) * INVERSES[(x - FIXED + MOD) % MOD]) % MOD;
        if (a > 0) scores[a]++;
      }
    }
    return scores;
  };
  const sums = Array(MOD).fill(0);
  const squares = Array(MOD).fill(0);
  for (let j = 0; j < training; j++) {
    const sample = draw();
    for (let a = 1; a < MOD; a++) {
      sums[a] += sample[a];
      squares[a] += sample[a] ** 2;
    }
  }
  const means = sums.map(sum => sum / training);
  const sds = means.map((mean, a) => Math.sqrt(squares[a] / training - mean ** 2));
  const candidates = Array.from({length:28}, (_, k) => {
    const a = k + 1;
    return {
      slope: a,
      intercept: ((FIXED * (1 - a)) % MOD + MOD) % MOD,
      observed: observed[a],
      mean: means[a], sd: sds[a],
      z: (observed[a] - means[a]) / sds[a]
    };
  }).sort((a, b) => b.z - a.z);
  let exceed = 0;
  let nullLargest = -Infinity;
  for (let i = 0; i < testing; i++) {
    const sample = draw();
    let largest = -Infinity;
    for (let a = 1; a < MOD; a++) {
      largest = Math.max(largest, (sample[a] - means[a]) / sds[a]);
    }
    exceed += largest >= candidates[0].z;
    nullLargest = Math.max(nullLargest, largest);
  }
  return {
    sourceSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
    hypothesis: 'Any invertible affine lag-five map fixing rune index 15',
    tautologicalFixedPointMatchesExcluded: true,
    leading: candidates.slice(0, 8),
    null: {
      conditioning: 'each word: complete multiset, length and exact adjacent-equal count',
      seed: '0x' + (seed >>> 0).toString(16),
      training, testing, exceed, nullLargest,
      familywiseEmpiricalP: (exceed + 1) / (testing + 1)
    }
  };
}

if (require.main === module) {
  const source = fs.readFileSync(path.resolve(__dirname, '../resources/lp2-transcription.txt'), 'utf8');
  console.log(JSON.stringify(run(source), null, 2));
}
module.exports = { countNonfixedPairs, run };
