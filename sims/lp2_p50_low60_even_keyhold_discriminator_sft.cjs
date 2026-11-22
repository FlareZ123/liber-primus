'use strict';

/**
 * Source-constrained p50 low60-even key-hold discriminator.
 *
 * Hypothesis under test:
 *   C_i = P_i + K_i (mod 29), and at the predeclared p50 low60-even
 *   control positions K_i = K_{i-1}. Then the ciphertext difference
 *   C_i-C_{i-1} must equal the plaintext GP29 difference
 *   P_i-P_{i-1} at those positions, independent of the secret key.
 *
 * The selected state is frozen from the prior low60 second-character bit0
 * result: token begins with 0 and the conventional base60 value of the
 * second printed character is even. Global row-major phase zero, no resets.
 *
 * This test does not fit a key or plaintext. It asks whether the complete
 * 29-residue difference law at the selected original positions resembles
 * source-native GP text strongly enough for an exact key-hold reading.
 *
 * SFT: node sims/lp2_p50_low60_even_keyhold_discriminator_sft.cjs
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const A60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const U = 1 / 29;
const CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const PAGES = corpus.pages.filter((page) => page.page <= 55);
const N = PAGES.reduce((sum, page) => sum + page.indices.length, 0);
const TOKENS = grid.pages.flatMap((page) => page.tokens);

assert.equal(N, 12956);
assert.equal(TOKENS.length, 256);

/**
 * Frozen predeclared repeat-permitting state:
 * low60 and even second base60 digit.
 */
const MASK = Uint8Array.from(TOKENS, (token) => {
  const digit = A60.indexOf(token[1]);
  assert.ok(digit >= 0);
  return Number(token[0] === '0' && (digit & 1) === 0);
});

/**
 * @param {number} a
 * @param {number} b
 */
function diff(a, b) {
  return (b - a + 29) % 29;
}

/**
 * @returns {{chapter:number,state:number,d:number}[]}
 */
function originalRows() {
  const rows = [];
  let global = 0;
  for (const page of PAGES) {
    const chapter = CHAPTERS.findIndex(
      ([first, last]) => first <= page.page && page.page <= last
    );
    assert.ok(chapter >= 0);
    for (let i = 0; i + 1 < page.indices.length; i++) {
      rows.push({
        chapter,
        state: MASK[(global + i) & 255],
        d: diff(page.indices[i], page.indices[i + 1])
      });
    }
    global += page.indices.length;
  }
  assert.equal(global, N);
  assert.equal(rows.length, 12901);
  return rows;
}

/**
 * @param {{d:number}[]} rows
 */
function countsFromRows(rows) {
  const counts = new Uint32Array(29);
  for (const row of rows) counts[row.d]++;
  return counts;
}

/**
 * @param {number[]} values
 */
function plainDifferenceCounts(values) {
  const counts = new Uint32Array(29);
  for (let i = 0; i + 1 < values.length; i++) {
    counts[diff(values[i], values[i + 1])]++;
  }
  return counts;
}

/**
 * @param {Uint32Array} counts
 */
function total(counts) {
  return counts.reduce((sum, value) => sum + value, 0);
}

/**
 * @param {Uint32Array} counts
 */
function repeatRate(counts) {
  return counts[0] / total(counts);
}

/**
 * @param {Uint32Array} counts
 * @param {number[]} probabilities
 */
function logLikelihood(counts, probabilities) {
  let score = 0;
  for (let d = 0; d < 29; d++) {
    score += counts[d] * Math.log(probabilities[d]);
  }
  return score;
}

/**
 * Log-likelihood ratio of a fixed source-native difference law versus
 * uniform GP29 differences. Positive values favor the native law.
 *
 * @param {Uint32Array} counts
 * @param {number[]} q
 */
function nativeVsUniform(counts, q) {
  return logLikelihood(counts, q) - total(counts) * Math.log(U);
}

/**
 * @param {Uint32Array} counts
 * @param {number[]} q
 */
function deviance(counts, q) {
  const n = total(counts);
  let value = 0;
  for (let d = 0; d < 29; d++) {
    if (!counts[d]) continue;
    const expected = n * q[d];
    value += 2 * counts[d] * Math.log(counts[d] / expected);
  }
  return value;
}

/**
 * Fit h in r(d)=h*q(d)+(1-h)/29 on a fixed 0..1 grid.
 *
 * @param {Uint32Array} counts
 * @param {number[]} q
 */
function fitHold(counts, q) {
  let best = {h: 0, ll: -Infinity};
  for (let step = 0; step <= 2000; step++) {
    const h = step / 2000;
    const probabilities = q.map((value) => h * value + (1 - h) * U);
    const ll = logLikelihood(counts, probabilities);
    if (ll > best.ll) best = {h, ll};
  }
  return best;
}

/**
 * @param {{chapter:number,state:number,d:number}[]} rows
 * @param {number} state
 * @param {number[]} chapters
 */
function subsetCounts(rows, state, chapters) {
  const keep = new Set(chapters);
  return countsFromRows(rows.filter(
    (row) => row.state === state && keep.has(row.chapter)
  ));
}

/**
 * Nine-chapter LOCO comparison between one common hold rate and two
 * state-specific hold rates. q is fixed from Shakespeare only.
 *
 * @param {{chapter:number,state:number,d:number}[]} rows
 * @param {number[]} q
 */
function locoMixture(rows, q) {
  const folds = [];
  for (let hold = 0; hold < 9; hold++) {
    const trainChapters = Array.from({length: 9}, (_, i) => i)
      .filter((i) => i !== hold);
    const heldChapters = [hold];
    const train0 = subsetCounts(rows, 0, trainChapters);
    const train1 = subsetCounts(rows, 1, trainChapters);
    const trainAll = new Uint32Array(29);
    for (let d = 0; d < 29; d++) trainAll[d] = train0[d] + train1[d];

    const common = fitHold(trainAll, q);
    const state0 = fitHold(train0, q);
    const state1 = fitHold(train1, q);

    const held0 = subsetCounts(rows, 0, heldChapters);
    const held1 = subsetCounts(rows, 1, heldChapters);
    const pCommon = q.map((value) => common.h * value + (1 - common.h) * U);
    const p0 = q.map((value) => state0.h * value + (1 - state0.h) * U);
    const p1 = q.map((value) => state1.h * value + (1 - state1.h) * U);

    const llCommon =
      logLikelihood(held0, pCommon) + logLikelihood(held1, pCommon);
    const llTwo =
      logLikelihood(held0, p0) + logLikelihood(held1, p1);

    folds.push({
      hold,
      commonH: common.h,
      complementH: state0.h,
      selectedH: state1.h,
      gainTwoState: llTwo - llCommon
    });
  }
  return {
    totalGain: folds.reduce((sum, row) => sum + row.gainTwoState, 0),
    positiveFolds: folds.filter((row) => row.gainTwoState > 0).length,
    folds
  };
}

/**
 * Apply the exact original page geometry and p50 selected-state mask to a
 * source-native stream. This is the positive-control geometry for exact hold:
 * selected ciphertext differences would equal these plaintext differences.
 *
 * @param {number[]} stream
 */
function selectedWindowCounts(stream) {
  assert.equal(stream.length, N);
  const counts = new Uint32Array(29);
  let global = 0;
  for (const page of PAGES) {
    for (let i = 0; i + 1 < page.indices.length; i++) {
      if (MASK[(global + i) & 255]) {
        counts[diff(stream[global + i], stream[global + i + 1])]++;
      }
    }
    global += page.indices.length;
  }
  return counts;
}

const rows = originalRows();
const selectedRows = rows.filter((row) => row.state === 1);
const complementRows = rows.filter((row) => row.state === 0);
const selectedCounts = countsFromRows(selectedRows);
const complementCounts = countsFromRows(complementRows);

assert.equal(selectedRows.length, 1809);
assert.equal(selectedCounts[0], 29);
assert.equal(complementRows.length, 11092);
assert.equal(complementCounts[0], 57);

const shakespeare = encodeSourceNativeGP(
  read('resources/control/shakespeare_first300k.txt')
);
const shakespeareCounts = plainDifferenceCounts(shakespeare);
const q = Array.from(shakespeareCounts, (count) =>
  (count + 0.5) / (total(shakespeareCounts) + 29 * 0.5)
);

const reference = [
  ['Shakespeare', shakespeare],
  ['Gibran', encodeSourceNativeGP(
    read('resources/control/gibran_prophet_58585.txt')
  )],
  ['Emerson', encodeSourceNativeGP(
    read('resources/control/emerson_essays_2944.txt')
  )],
  ['SolvedLP1', encodeSourceNativeGP(
    read('resources/liber-primus/lp1-plaintext-reference.txt')
  )],
  ['SolvedLP2p57', corpus.pages[57].indices]
].map(([name, values]) => {
  const counts = plainDifferenceCounts(values);
  return {
    name,
    runes: values.length,
    transitions: total(counts),
    repeatRate: repeatRate(counts),
    nativeVsUniform: nativeVsUniform(counts, q) / total(counts)
  };
});

/*
 * Matched positive controls: independent Gibran/Emerson native GP windows,
 * exact original page geometry and exact predeclared selected-state mask.
 * Shakespeare is reserved for q calibration and is not counted here.
 */
const matched = [];
for (const [name, file] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const native = encodeSourceNativeGP(read(file));
  for (let start = 0; start + N <= native.length; start += Math.floor(N / 2)) {
    const counts = selectedWindowCounts(native.slice(start, start + N));
    matched.push({
      name,
      start,
      repeats: counts[0],
      repeatRate: repeatRate(counts),
      nativeVsUniform: nativeVsUniform(counts, q),
      perTransitionLLR: nativeVsUniform(counts, q) / total(counts),
      deviance: deviance(counts, q)
    });
  }
}
assert.ok(matched.length >= 5);

const selectedLLR = nativeVsUniform(selectedCounts, q);
const complementLLR = nativeVsUniform(complementCounts, q);
const selectedDeviance = deviance(selectedCounts, q);
const matchedLLRs = matched.map((row) => row.perTransitionLLR);
const matchedDeviances = matched.map((row) => row.deviance);

const mixture = locoMixture(rows, q);

const observedRates = {
  selected: repeatRate(selectedCounts),
  complement: repeatRate(complementCounts)
};
const holdFeasibility = reference.map((row) => {
  const denominator = row.repeatRate - U;
  const hSelected = (observedRates.selected - U) / denominator;
  const hComplement = (observedRates.complement - U) / denominator;
  return {
    source: row.name,
    sourceRepeatRate: row.repeatRate,
    selectedImpliedH: hSelected,
    selectedFeasible: 0 <= hSelected && hSelected <= 1,
    complementImpliedH: hComplement,
    complementFeasible: 0 <= hComplement && hComplement <= 1
  };
});

/* Exact positive: arbitrary additive key held on selected positions preserves
 * every selected plaintext difference. */
const plantPlain = encodeSourceNativeGP(
  read('resources/control/gibran_prophet_58585.txt')
).slice(0, N);
assert.equal(plantPlain.length, N);
const plantCipher = new Array(N);
const key = new Array(N);
key[0] = 7;
plantCipher[0] = (plantPlain[0] + key[0]) % 29;
for (let i = 1; i < N; i++) {
  key[i] = MASK[(i - 1) & 255]
    ? key[i - 1]
    : (key[i - 1] * 11 + 7 + i) % 29;
  plantCipher[i] = (plantPlain[i] + key[i]) % 29;
}
const plantPlainSelected = selectedWindowCounts(plantPlain);
const plantCipherSelected = selectedWindowCounts(plantCipher);
assert.deepEqual(Array.from(plantCipherSelected), Array.from(plantPlainSelected));

console.log(JSON.stringify({
  classification:
    'key-independent architecture discriminator; no plaintext/key recovered',
  hypothesis:
    'at low60-even phase positions an additive GP29 keystream holds exactly, so selected ciphertext differences equal plaintext differences',
  source: {
    selectedCells: MASK.reduce((sum, value) => sum + value, 0),
    selectedTransitions: selectedRows.length,
    selectedRepeats: selectedCounts[0],
    selectedRepeatRate: observedRates.selected,
    complementTransitions: complementRows.length,
    complementRepeats: complementCounts[0],
    complementRepeatRate: observedRates.complement
  },
  nativeReference: {
    calibration: 'source-native Shakespeare difference law, Jeffreys 0.5 smoothing',
    q,
    controls: reference
  },
  exactHoldOriginalGate: {
    selectedNativeVsUniform: selectedLLR,
    selectedPerTransitionLLR: selectedLLR / selectedRows.length,
    complementNativeVsUniform: complementLLR,
    complementPerTransitionLLR: complementLLR / complementRows.length,
    selectedDeviance,
    matchedNativeControls: {
      windows: matched.length,
      perTransitionLLRMin: Math.min(...matchedLLRs),
      perTransitionLLRMedian:
        [...matchedLLRs].sort((a, b) => a - b)[Math.floor(matchedLLRs.length / 2)],
      perTransitionLLRMax: Math.max(...matchedLLRs),
      devianceMin: Math.min(...matchedDeviances),
      devianceMedian:
        [...matchedDeviances].sort((a, b) => a - b)[Math.floor(matchedDeviances.length / 2)],
      devianceMax: Math.max(...matchedDeviances),
      atOrBelowOriginalLLR: matched.filter(
        (row) => row.perTransitionLLR <= selectedLLR / selectedRows.length
      ).length,
      atOrAboveOriginalDeviance: matched.filter(
        (row) => row.deviance >= selectedDeviance
      ).length
    }
  },
  holdFreshUniformMixture: {
    interpretation:
      'r(d)=h*q_native(d)+(1-h)/29; feasibility from repeat rate and nine-chapter likelihood fit',
    repeatRateFeasibility: holdFeasibility,
    loco: mixture
  },
  positive: {
    source: 'Gibran source-native GP with arbitrary deterministic additive key held exactly on selected positions',
    selectedDifferencesPreservedExactly: true
  }
}, null, 2));
