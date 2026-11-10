#!/usr/bin/env node
'use strict';

// Test the source-locked hypothesis that LP1's hidden 5x5 magic-square
// values, reduced modulo 29, are an additive GP29 key for LP2's five-dot
// pages. The five-dot stencil is original on p7 and vertically reflected
// on p23. No key phase, alphabet permutation, or free key material is fit.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');

const matrix = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const sum = xs => xs.reduce((a, b) => a + b, 0);
assert.deepEqual(matrix.map(sum), [1033, 1033, 1033, 1033, 1033]);
assert.deepEqual(matrix[0].map((_, c) => sum(matrix.map(row => row[c]))), [1033, 1033, 1033, 1033, 1033]);
assert.equal(sum(matrix.map((row, i) => row[i])), 1033);
assert.equal(sum(matrix.map((row, i) => row[4 - i])), 1033);

const rowMajor = matrix.flat().map(x => x % 29);
const vertical = matrix.slice().reverse().flat().map(x => x % 29);
assert.equal(rowMajor.length, 25);
assert.equal(vertical.length, 25);

const tokenPairs = [
  ['TH', 2], ['NG', 21], ['EO', 12], ['OE', 22], ['AE', 25], ['IA', 27], ['EA', 28],
  ['F', 0], ['U', 1], ['O', 3], ['R', 4], ['C', 5], ['G', 6], ['W', 7],
  ['H', 8], ['N', 9], ['I', 10], ['J', 11], ['P', 13], ['X', 14], ['S', 15],
  ['T', 16], ['B', 17], ['E', 18], ['M', 19], ['L', 20], ['D', 23],
  ['A', 24], ['Y', 26]
];

function encodeEnglishToGP(text) {
  const source = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < source.length;) {
    let found = false;
    for (const [token, value] of tokenPairs) {
      if (source.startsWith(token, i)) {
        out.push(value);
        i += token.length;
        found = true;
        break;
      }
    }
    if (found) continue;
    const ch = source[i++];
    // Conventional GP scoring approximations for letters without a distinct rune.
    if (ch === 'K' || ch === 'Q') out.push(5);
    else if (ch === 'V') out.push(1);
    else if (ch === 'Z') out.push(15);
  }
  return out;
}

const englishGP = encodeEnglishToGP(shakespeare);
const split = Math.floor(englishGP.length * 0.78);
const training = englishGP.slice(0, split);
const holdout = englishGP.slice(split);

const bigramCounts = Array.from({ length: 29 }, () => Array(29).fill(0));
const rowTotals = Array(29).fill(0);
for (let i = 1; i < training.length; i++) {
  bigramCounts[training[i - 1]][training[i]]++;
  rowTotals[training[i - 1]]++;
}
const logP = bigramCounts.map((row, a) =>
  row.map(count => Math.log((count + 0.1) / (rowTotals[a] + 2.9)))
);

function decode(cipher, key, sign, period, maxSkip = 2, skipPenalty = 3.5) {
  const n = cipher.length;
  const stateCount = period * 29;
  let dp = new Float64Array(stateCount);
  dp.fill(-Infinity);

  // Each page starts at the square's top-left cell.
  const firstPlain = (cipher[0] - sign * key[0] + 29) % 29;
  dp[1 * 29 + firstPlain] = 0;

  const back = new Array(n);
  const skipBack = new Array(n);
  back[0] = new Int32Array(stateCount);
  back[0].fill(-1);
  skipBack[0] = new Int8Array(stateCount);

  for (let i = 1; i < n; i++) {
    const next = new Float64Array(stateCount);
    next.fill(-Infinity);
    const previousState = new Int32Array(stateCount);
    previousState.fill(-1);
    const rejectedAtPosition = new Int8Array(stateCount);

    for (let phase = 0; phase < period; phase++) {
      for (let previousPlain = 0; previousPlain < 29; previousPlain++) {
        const state = phase * 29 + previousPlain;
        const base = dp[state];
        if (!Number.isFinite(base)) continue;

        for (let rejected = 0; rejected <= maxSkip; rejected++) {
          const acceptedKey = key[(phase + rejected) % period];
          const plain = (cipher[i] - sign * acceptedKey + 29) % 29;

          // Every rejected draw must have emitted the previous published
          // ciphertext rune under this same candidate plaintext rune.
          let valid = true;
          for (let q = 0; q < rejected; q++) {
            const trial = (plain + sign * key[(phase + q) % period] + 29) % 29;
            if (trial !== cipher[i - 1]) {
              valid = false;
              break;
            }
          }
          if (!valid) continue;

          const nextPhase = (phase + rejected + 1) % period;
          const nextState = nextPhase * 29 + plain;
          const candidate = base + logP[previousPlain][plain] - skipPenalty * rejected;
          if (candidate > next[nextState]) {
            next[nextState] = candidate;
            previousState[nextState] = state;
            rejectedAtPosition[nextState] = rejected;
          }
        }
      }
    }
    dp = next;
    back[i] = previousState;
    skipBack[i] = rejectedAtPosition;
  }

  let bestScore = -Infinity;
  let bestState = -1;
  for (let state = 0; state < stateCount; state++) {
    if (dp[state] > bestScore) {
      bestScore = dp[state];
      bestState = state;
    }
  }
  assert.notEqual(bestState, -1, 'no valid Viterbi path');

  const plain = new Array(n);
  const skipHistogram = [0, 0, 0];
  let state = bestState;
  for (let i = n - 1; i >= 1; i--) {
    plain[i] = state % 29;
    const rejected = skipBack[i][state];
    skipHistogram[rejected]++;
    state = back[i][state];
    assert.notEqual(state, -1, 'broken Viterbi backpointer');
  }
  plain[0] = state % 29;

  return {
    plain,
    scorePerRune: bestScore / Math.max(1, n - 1),
    rejectedDraws: skipHistogram[1] + 2 * skipHistogram[2],
    skipHistogram,
    preview: plain.map(index => corpus.translit[index]).join('').slice(0, 100)
  };
}

function encrypt(plain, key, sign, period) {
  const cipher = [];
  let pointer = 0;
  let previousCipher = null;
  let rejectedDraws = 0;
  for (const symbol of plain) {
    let localRejects = 0;
    let value;
    while (true) {
      value = (symbol + sign * key[pointer % period] + 29) % 29;
      if (previousCipher !== null && value === previousCipher) {
        pointer++;
        rejectedDraws++;
        localRejects++;
        assert.ok(localRejects <= 2, 'plant exceeded the decoder skip bound');
      } else {
        break;
      }
    }
    cipher.push(value);
    pointer++;
    previousCipher = value;
  }
  return { cipher, rejectedDraws };
}

const original = [];
for (const item of [
  { page: 7, key: rowMajor, orientation: 'LP1 square row-major; LP2 five-dot baseline' },
  { page: 23, key: vertical, orientation: 'LP1 square vertically reflected; LP2 five-dot vertical mirror' }
]) {
  const cipher = corpus.pages[item.page].indices;
  assert.equal(cipher.length, item.page === 7 ? 208 : 213);
  for (const period of [24, 25]) {
    for (const sign of [-1, 1]) {
      const result = decode(cipher, item.key, sign, period);
      original.push({
        page: item.page,
        orientation: item.orientation,
        period,
        sign,
        scorePerRune: result.scorePerRune,
        rejectedDraws: result.rejectedDraws,
        skipHistogram: result.skipHistogram,
        preview: result.preview
      });
    }
  }
}

let rng = 0x9e3779b9;
function randomInt(limit) {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return rng % limit;
}
const controls = [];
for (let t = 0; t < 12; t++) {
  const n = t % 2 === 0 ? 208 : 213;
  const start = (t * 7919 + split + 300) % Math.max(1, holdout.length - n);
  const plain = holdout.slice(start, start + n);
  const sign = t % 2 === 0 ? 1 : -1;

  for (const period of [24, 25]) {
    const encrypted = encrypt(plain, rowMajor, sign, period);
    const recovered = decode(encrypted.cipher, rowMajor, sign, period);
    let matches = 0;
    for (let i = 0; i < n; i++) if (recovered.plain[i] === plain[i]) matches++;
    controls.push({
      plant: t,
      length: n,
      period,
      sign,
      actualRejectedDraws: encrypted.rejectedDraws,
      recovered: matches,
      exact: matches === n,
      scorePerRune: recovered.scorePerRune
    });
  }
}

assert.equal(controls.length, 24);
assert.ok(controls.every(x => x.recovered >= x.length - 4), 'a planted control fell outside the four-rune tolerance');

const controlScores = controls.map(x => x.scorePerRune);
const summary = {
  keyRowMajor: rowMajor,
  keyVerticalReflection: vertical,
  original: original.sort((a, b) => b.scorePerRune - a.scorePerRune),
  positiveControls: {
    count: controls.length,
    exact: controls.filter(x => x.exact).length,
    minimumRecovered: Math.min(...controls.map(x => x.recovered)),
    meanScorePerRune: controlScores.reduce((a, b) => a + b, 0) / controlScores.length,
    minimumScorePerRune: Math.min(...controlScores),
    maximumScorePerRune: Math.max(...controlScores),
    trials: controls
  }
};

console.log(JSON.stringify(summary, null, 2));
