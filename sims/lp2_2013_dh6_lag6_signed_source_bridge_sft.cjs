'use strict';

/**
 * Signed 2013 BASE29/DH -> LP2 word-local affine six-back bridge.
 *
 * The published signed 2013 example supplies BASE29(3301) = [3,26,24],
 * DH modulus 23, generator 5, server public 8, client public 19 and
 * shared secret 2. Its server exponent is 6, since 5^6 mod 23 = 8.
 * The post-hoc candidate C[i] = 24 - 2*C[i-6] (mod 29) matches the
 * independently observed strongest 5,684-affine/lag LP2 echo.
 *
 * This code tests source-derived candidate relations against actual
 * original ciphertext under exact word-multiset + adjacent-repeat
 * constrained nulls. It does NOT decrypt the manuscript.
 *
 * Windows Node22, CommonJS. No command-line arguments or dependencies.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  parseUnsolved, random32, shuffledCopy, adjacentEqualCount
} = require('./lag6_conditioned_echo.cjs');

/** @param {number} b @param {number} e @param {number} n @returns {number} */
function powMod(b, e, n) {
  let v = 1;
  for (let i = 0; i < e; i++) v = (v * b) % n;
  return v;
}
assert.equal(powMod(5, 6, 23), 8);
assert.equal(powMod(5, 15, 23), 19);
assert.equal(powMod(19, 6, 23), 2);
assert.equal(powMod(8, 15, 23), 2);
assert.equal(3301 % 29, 24);
assert.equal(3 * 29 ** 2 + 26 * 29 + 24, 3301);
assert.equal((27 + 2) % 29, 0);

const input = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
const allWords = parseUnsolved(input);
const runeCount = allWords.reduce((n, w) => n + w.length, 0);
assert.equal(allWords.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(Math.max(...allWords.map(w => w.length)), 14);
const words = allWords.filter(w => w.length > 2);
assert.equal(words.length, 2365);

// Explicitly comparable source-defined numbers. A client private exponent 15,
// public 19 and modulus23 have no word-local sites because max length is14.
// Lag6, coefficient -2 and offset24 is a post-discovery conjunction, not an
// instruction actually printed by Cicada.
const lags = [2, 5, 6, 8];
const intercepts = [3, 26, 24];
const signs = [-1, 1];
const candidates = [];
for (const lag of lags) for (const intercept of intercepts)
  for (const sign of signs)
    candidates.push({lag, intercept, sign, id: candidates.length});
assert.equal(candidates.length, 24);

const target = candidates.map(({intercept, sign}) =>
  Array.from({length: 29}, (_, x) => ((intercept + sign * 2 * x) % 29 + 29) % 29));
const atLag = lags.map(lag => candidates.filter(c => c.lag === lag).map(c => c.id));

/**
 * @param {number[][]} pageWords
 * @returns {Int32Array}
 */
function matches(pageWords) {
  const out = new Int32Array(candidates.length);
  for (const word of pageWords) for (let g = 0; g < lags.length; g++) {
    const lag = lags[g];
    for (let i = lag; i < word.length; i++) {
      const x = word[i - lag], y = word[i];
      for (const id of atLag[g]) if (target[id][x] === y) out[id]++;
    }
  }
  return out;
}

const observed = Array.from(matches(words));
const selected = candidates.find(c => c.lag === 6 && c.intercept === 24 && c.sign === -1);
assert.ok(selected);
assert.equal(selected.id, 16);
assert.equal(observed[selected.id], 80);
const firstHalf = matches(allWords.slice(0, 1448))[selected.id];
const secondHalf = matches(allWords.slice(1448))[selected.id];
assert.deepEqual([firstHalf, secondHalf], [40, 40]);

// Positive pattern test with exact source triple, planting 20 independent
// six-apart affine values into a word and checking the deterministic detector.
const plant = Array.from({length: 26}, (_, j) => (j * 13 + 7) % 29);
for (let i = 6; i < plant.length; i++) plant[i] = (24 - 2 * plant[i - 6] + 58) % 29;
assert.equal(matches([plant])[selected.id], plant.length - 6);

const TRAIN = 350;
const TEST = 1200;
const SEED = 0x62012429;
const rnd = random32(SEED);
const exactAdj = words.map(adjacentEqualCount);

/** @returns {Int32Array} */
function simulatedBook() {
  const shuffled = words.map((w, i) => {
    let candidate;
    do {
      candidate = shuffledCopy(w, rnd);
    } while (adjacentEqualCount(candidate) !== exactAdj[i]);
    return candidate;
  });
  return matches(shuffled);
}

const train = Array.from({length: TRAIN}, simulatedBook);
const means = candidates.map((_, i) => train.reduce((s, x) => s + x[i], 0) / TRAIN);
const sds = candidates.map((_, i) => Math.sqrt(train.reduce(
  (s, x) => s + (x[i] - means[i]) ** 2, 0) / TRAIN));
assert.ok(sds.every(n => n > 0));
const scores = observed.map((x, i) => (x - means[i]) / sds[i]);
const bestScore = Math.max(...scores);
assert.equal(scores.indexOf(bestScore), selected.id);

let exceedBest = 0;
let exceedSelected = 0;
for (let j = 0; j < TEST; j++) {
  const sample = simulatedBook();
  const maxZ = Math.max(...Array.from(sample, (n, i) => (n - means[i]) / sds[i]));
  if (maxZ >= bestScore) exceedBest++;
  if (sample[selected.id] >= observed[selected.id]) exceedSelected++;
}
const runnerUp = candidates.map((c, i) => ({...c, observed: observed[i], z: scores[i]}))
  .sort((a,b) => b.z - a.z);
assert.equal(runnerUp[0].id, selected.id);
assert.equal(exceedBest, 0);
assert.equal(exceedSelected, 0);
console.log(JSON.stringify({
  status: 'PASS: exact source-led lag6 bridge is the strongest of 24 signed-example choices',
  historicalSource: '2013 signed BASE29 3301 -> 3QO, DH 23: g5, A8, B19, K2',
  sourceDerived: { serverPrivateExponent: 6, clientPrivateExponent: 15, lastBase29Digit: 24,
    sharedSecret: 2, proposedMap: 'C[i] = (24 - 2*C[i-6]) mod29' },
  originality: 'The source-to-lag6 coupling was identified retrospectively; no authored reuse instruction',
  input: { originalWords: 2896, originalRunes: 12956,
    wordsEligibleForLag2: words.length, sourceFamily: candidates.length },
  originalSelectedHits: observed[selected.id],
  originalEligibleLag6Sites: words.reduce((sum,w) => sum + Math.max(0, w.length-6), 0),
  independentOriginalHalves: [firstHalf,secondHalf],
  null: { trainingBooks: TRAIN, independentTestBooks: TEST, seed: '0x' + SEED.toString(16),
    conditioning: 'each word original rune multiset, length and original adjacent doublet count',
    chosenNullMean: means[selected.id], chosenNullSD: sds[selected.id],
    chosenZ: bestScore, fixedExceed: exceedSelected, familyExceed: exceedBest,
    familyCorrectedFiniteP: (exceedBest+1)/(TEST+1) },
  topThree: runnerUp.slice(0,3).map(x => ({
    lag:x.lag, intercept:x.intercept, coefficient:x.sign*2, hits:x.observed,z:x.z
  })),
  interpretation: 'source-specific signal; NOT plaintext, key selection, encryption proof, or decryption'
}, null, 2));
