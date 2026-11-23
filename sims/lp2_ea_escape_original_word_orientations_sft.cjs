'use strict';

/**
 * A source-native, all-key EA-escape obstruction for four literal reversible
 * printed-word orientations. Node 22 / CommonJS / Windows compatible.
 *
 * The model reserves the previous ciphertext symbol as the plaintext EA (28)
 * successor; the remaining 28 ciphertext successors can be keyed by ANY
 * independent secret permutations. Thus C[i] === C[i-1] iff P[i] === EA,
 * regardless of those 28! secret permutations.
 *
 * This is a conditional source-native control, not an LP2 decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const transcription = load('resources/liber-primus/lp2-transcription.txt');
const controls = JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/**
 * A printed word continues across physical page/line wraps (% and /).
 * Every hyphen, ordinary punctuation mark and $/& section marker closes it.
 * @param {string} input
 * @param {boolean} original
 * @returns {number[][]}
 */
function words(input, original = false) {
  const result = [];
  let word = [];
  for (const ch of input) {
    if (runeIndex.has(ch)) {
      word.push(runeIndex.get(ch));
    } else if (original && (ch === '%' || ch === '/' || /\s/u.test(ch))) {
      continue;
    } else if (word.length) {
      result.push(word);
      word = [];
    }
  }
  if (word.length) result.push(word);
  return result;
}

const unknown = words(transcription.split('%').slice(0, 55).join('%'), true);
const solved = controls.sections.flatMap(section => words(section.source_text));
assert.equal(unknown.length, 2896);
assert.equal(unknown.flat().length, 12956);
assert.deepEqual(unknown.flat(), corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices));
assert.equal(solved.length, 740);
assert.equal(solved.flat().length, 2979);
assert.equal(solved.flat().filter(rune => rune === 28).length, 20);

const byLength = new Map();
for (const word of solved) {
  const pool = byLength.get(word.length) ?? [];
  pool.push(word);
  byLength.set(word.length, pool);
}

/** @param {number[]} word @param {number} mode @returns {number[]} */
function orient(word, mode) {
  if (mode === 0) return word.slice();
  if (mode === 1) return word.slice().reverse();
  if (mode === 2) return word.slice(1).concat(word.slice(0, 1));
  return word.slice(-1).concat(word.slice(0, -1));
}

/**
 * Poisson-binomial tail with absorbing success state (upper), or an explicitly
 * retained low-count state space (lower). Independent donor selections have
 * their original physical word lengths exactly fixed.
 * @param {number[]} probs
 * @param {number} count
 * @param {'lower' | 'upper'} side
 * @returns {number}
 */
function tail(probs, count, side) {
  const dp = Array(count + 1).fill(0);
  dp[0] = 1;
  if (side === 'upper') {
    for (const p of probs) {
      for (let k = count; k >= 1; k--) {
        dp[k] = (k === count ? dp[k] : dp[k] * (1 - p)) +
          dp[k - 1] * p;
      }
      dp[0] *= 1 - p;
    }
    return dp[count];
  }
  for (const p of probs) {
    for (let k = count; k >= 1; k--) {
      dp[k] = dp[k] * (1 - p) + dp[k - 1] * p;
    }
    dp[0] *= 1 - p;
  }
  return dp.reduce((total, value) => total + value, 0);
}

/** @param {number[][]} ws @returns {number[]} */
function equalPredecessorsByPosition(ws) {
  const hits = Array(5).fill(0);
  let previous = null;
  for (const word of ws) {
    for (let j = 0; j < word.length; j++) {
      if (word[j] === previous) hits[Math.min(j, 4)]++;
      previous = word[j];
    }
  }
  return hits;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const rune of values) bins[rune]++;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * One explicit witness out of the permitted all-key 28! successor mappings.
 * The statistical escape result does not depend on this witness being correct.
 * @param {number[]} plaintext
 * @returns {number[]}
 */
function encode(plaintext) {
  let prev = 0;
  return plaintext.map(rune => {
    const cipher = rune === 28 ? prev : (prev + 1 + rune) % 29;
    prev = cipher;
    return cipher;
  });
}

/** @param {number[]} ciphertext @returns {number[]} */
function decode(ciphertext) {
  let prev = 0;
  return ciphertext.map(rune => {
    const plain = rune === prev ? 28 : (rune - prev - 1 + 29) % 29;
    prev = rune;
    return plain;
  });
}

const donorProbs = [0, 1, 2].map(position => unknown.map(word => {
  if (position >= word.length) return 0;
  const donor = byLength.get(word.length);
  assert.ok(donor, 'missing genuine native-GP word length ' + word.length);
  return donor.filter(w => w[position] === 28).length / donor.length;
}));
const means = donorProbs.map(pp => pp.reduce((sum, p) => sum + p, 0));

const nativeTape = solved.flat();
assert.deepEqual(decode(encode(nativeTape)), nativeTape);
const report = {
  inputs: { unknownWords: unknown.length, unknownRunes: unknown.flat().length,
    nativeWords: solved.length, nativeRunes: nativeTape.length,
    nativeEA: nativeTape.filter(rune => rune === 28).length },
  predictor: { expectedEAInWordPositions0to2: means, nativeIoC: ioc(nativeTape) },
  modes: []
};

for (let mode = 0; mode < 4; mode++) {
  const transformed = unknown.map(word => orient(word, mode));
  const inverse = mode === 2 ? 3 : mode === 3 ? 2 : mode;
  assert.deepEqual(transformed.map(word => orient(word, inverse)), unknown);
  const marker = equalPredecessorsByPosition(transformed);
  const ciphertext = transformed.flat();
  const candidate = decode(ciphertext);
  assert.deepEqual(encode(candidate), ciphertext);
  const tested = {
    name: ['original', 'reverseEachWord', 'rotateEachWordLeft1',
      'rotateEachWordRight1'][mode],
    markerCount: marker.reduce((sum, n) => sum + n, 0),
    markerPositions0to3Plus: marker,
    wordFirstUpperTail: tail(donorProbs[0], marker[0], 'upper'),
    wordSecondLowerOrUpperTail: marker[1] <= means[1]
      ? tail(donorProbs[1], marker[1], 'lower')
      : tail(donorProbs[1], marker[1], 'upper'),
    arbitraryRankWitnessIoC: ioc(candidate)
  };
  report.modes.push(tested);
}

assert.deepEqual(report.modes.map(m => m.markerCount), [86, 150, 227, 228]);
assert.deepEqual(report.modes.map(m => m.markerPositions0to3Plus[0]),
  [23, 87, 83, 91]);
assert.deepEqual(report.modes.map(m => m.markerPositions0to3Plus[1]),
  [12, 19, 22, 93]);
assert.ok(report.modes[0].wordSecondLowerOrUpperTail < 1.5e-11);
assert.ok(report.modes[1].wordFirstUpperTail < 4e-45);
assert.ok(report.modes[2].wordFirstUpperTail < 1.4e-41);
assert.ok(report.modes[3].wordFirstUpperTail < 9e-49);
console.log('SOURCE_FIXED_EA_ORIENTATION', JSON.stringify(report, null, 2));
console.log('PASS: all four literal printed-word orientations fail the creator-native fixed-EA escape-position control; no unknown plaintext or key');
