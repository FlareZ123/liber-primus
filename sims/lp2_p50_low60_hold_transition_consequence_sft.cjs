'use strict';

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const lp1 = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'),
  'utf8'
);
const CLEAR_SECTIONS = [3, 8, 9, 10, 11, 14];
const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59 = A60.replace('f', '');
const TOKENS = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

const reference = new Array(29).fill(0);
let referenceN = 0;
const sections = lp1.split('%');
for (const sectionIndex of CLEAR_SECTIONS) {
  for (const physicalPage of (sections[sectionIndex] || '').split('&')) {
    const runes = Array.from(physicalPage)
      .map((glyph) => runeIndex.get(glyph))
      .filter((value) => value !== undefined);
    for (let i = 0; i + 1 < runes.length; i++) {
      reference[(runes[i + 1] - runes[i] + 29) % 29]++;
      referenceN++;
    }
  }
}
assert.equal(referenceN, 991);
assert.equal(reference[0], 28);

const alpha = 0.5;
const referenceNonzeroN = referenceN - reference[0];
const logQ = new Array(29).fill(0);
for (let delta = 1; delta < 29; delta++) {
  logQ[delta] = Math.log(
    (reference[delta] + alpha) / (referenceNonzeroN + 28 * alpha)
  );
}

const lowCells = Array.from({ length: 256 }, (_, i) => i)
  .filter((i) => TOKENS[i][0] === '0');
const lowSlot = new Map(lowCells.map((cell, i) => [cell, i]));
const cellHistogram = Array.from({ length: 60 }, () => new Int16Array(29));

let globalRune = 0;
for (const page of corpus.pages.filter((page) => page.page <= 55)) {
  for (let i = 0; i + 1 < page.indices.length; i++) {
    const lowIndex = lowSlot.get((globalRune + i) & 255);
    if (lowIndex === undefined) continue;
    const delta = (page.indices[i + 1] - page.indices[i] + 29) % 29;
    cellHistogram[lowIndex][delta]++;
  }
  globalRune += page.indices.length;
}
assert.equal(globalRune, 12956);

/** @param {string} alphabet */
function evenMask(alphabet) {
  return lowCells.map((cell) =>
    (alphabet.indexOf(TOKENS[cell][1]) & 1) === 0
  );
}

/**
 * Compare nonzero ciphertext-difference cross entropy against frozen clear GP.
 * A simple additive key-hold state predicts the selected positions should retain
 * the native plaintext difference law, not merely its delta=0 mass.
 * @param {boolean[]} mask
 */
function nonzeroAdvantage(mask) {
  let selectedLL = 0;
  let selectedN = 0;
  let otherLL = 0;
  let otherN = 0;

  for (let cell = 0; cell < 60; cell++) {
    for (let delta = 1; delta < 29; delta++) {
      const n = cellHistogram[cell][delta];
      if (!n) continue;
      if (mask[cell]) {
        selectedLL += n * logQ[delta];
        selectedN += n;
      } else {
        otherLL += n * logQ[delta];
        otherN += n;
      }
    }
  }

  return {
    selectedN,
    otherN,
    selectedPerRune: selectedLL / selectedN,
    otherPerRune: otherLL / otherN,
    advantage: selectedLL / selectedN - otherLL / otherN
  };
}

const mask60 = evenMask(A60);
const mask59 = evenMask(A59);
const actual60 = nonzeroAdvantage(mask60);
const actual59 = nonzeroAdvantage(mask59);

assert.equal(mask60.filter(Boolean).length, 36);
assert.equal(mask59.filter(Boolean).length, 30);
assert.deepEqual(
  [actual60.selectedN, actual60.otherN],
  [1780, 1212]
);
assert.deepEqual(
  [actual59.selectedN, actual59.otherN],
  [1487, 1505]
);
assert.ok(Math.abs(actual60.advantage - 0.02164291805346652) < 1e-15);
assert.ok(Math.abs(actual59.advantage - (-0.03229686466759096)) < 1e-15);

/** @param {number} seed */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * @param {boolean[]} actualMask
 * @param {{advantage:number}} actual
 * @param {number} seed
 * @param {number} trials
 */
function calibrate(actualMask, actual, seed, trials) {
  const random = xorshift32(seed);
  const selectedCount = actualMask.filter(Boolean).length;
  let exceedances = 0;
  let sum = 0;
  let sum2 = 0;
  const values = new Float64Array(trials);

  for (let trial = 0; trial < trials; trial++) {
    const permutation = Array.from({ length: 60 }, (_, i) => i);
    for (let i = 59; i > 0; i--) {
      const j = random() % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }

    const mask = new Array(60).fill(false);
    for (let i = 0; i < selectedCount; i++) mask[permutation[i]] = true;
    const value = nonzeroAdvantage(mask).advantage;
    values[trial] = value;
    sum += value;
    sum2 += value * value;
    if (value >= actual.advantage - 1e-15) exceedances++;
  }

  const sorted = Array.from(values).sort((a, b) => a - b);
  const mean = sum / trials;
  return {
    trials,
    selectedCount,
    exceedances,
    pUpper: (exceedances + 1) / (trials + 1),
    mean,
    sd: Math.sqrt(sum2 / trials - mean * mean),
    q95: sorted[Math.floor(0.95 * trials)],
    q99: sorted[Math.floor(0.99 * trials)]
  };
}

const cal60 = calibrate(mask60, actual60, 0x33011315, 20000);
const cal59 = calibrate(mask59, actual59, 0x33011316, 20000);

assert.equal(cal60.exceedances, 2489);
assert.ok(Math.abs(cal60.pUpper - 0.12449377531123444) < 1e-15);
assert.equal(cal59.exceedances, 19252);
assert.ok(Math.abs(cal59.pUpper - 0.9626018699065046) < 1e-15);

console.log(JSON.stringify({
  classification:
    'held-out transition-law consequence for simple additive key-hold interpretation',
  frozenClearGP: {
    sections: CLEAR_SECTIONS,
    eligiblePairs: referenceN,
    repeatsExcludedFromTest: reference[0],
    nonzeroPairs: referenceNonzeroN
  },
  conventionalBase60: { actual: actual60, calibration: cal60 },
  dropF59: { actual: actual59, calibration: cal59 },
  decision:
    'selected parity state predicts repeats, but its nonzero ciphertext-difference law is not selectively plaintext-like; simple additive key-hold interpretation is unsupported'
}, null, 2));
