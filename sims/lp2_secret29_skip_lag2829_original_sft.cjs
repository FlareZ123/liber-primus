'use strict';

/**
 * Original LP2 lag-28/29 challenge for the 29-state cyclic soft-collision
 * skipping key, extending the distinct arithmetic-ramp HMM pilot.
 *
 * Runnable on Windows 11 with Node.js 22. Uses only committed references.
 * No external packages, filesystem writes, downloads, or auto CI triggers.
 *
 * MODEL (a source-motivated hypothesis, NOT an authenticated LP2 cipher):
 *   candidate C=(P+K[state]) % 29, state advances cyclically once.
 *   When candidate equals the previous output, skip that candidate with
 *   probability rejection, consuming one more state and retrying the SAME P.
 *   Each K is a complete permutation, so a retry cannot equal the previous C.
 *
 * For each key, calibrate rejection on the source-native unigram prior to
 * match the original within-page doublet rate to first order. Then challenge
 * original *joint* lag28+lag29 equalities using 28 arithmetic permutations
 * and 250 uniformly shuffled, unrestricted permutations. All samples have
 * exactly the 55 original physical page lengths. No parameters are fitted
 * to the held-out lag28/29 statistics.
 *
 * Evidence: this is a finite Monte Carlo attack (not a 29! theorem).
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const M = 29;
const SLOPE_SAMPLES = 120;
const RANDOM_KEYS = 250;
const RANDOM_KEY_SAMPLES = 12;
const RNG_SEED = 0x20262918;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const lp1 = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'),
  'utf8'
);
const original = corpus.pages
  .filter((page) => page.page < 56 && page.indices.length)
  .map((page) => page.indices);
const pageLengths = original.map((page) => page.length);
assert.equal(original.length, 55);
assert.equal(pageLengths.reduce((sum, n) => sum + n, 0), 12956);

/**
 * Independent native-GP iid source prior. Use only the genuinely solved LP1
 * pages selected by the previous skip-HMM pilot and solved LP2 pp56–57.
 * The add-one Dirichlet smoothing preserves support for all GP runes.
 * @returns {{q: number[], cdf: number[], count: number, ac: number[]}}
 */
function nativeReference() {
  const frequencies = Array(M).fill(1);
  const runeIds = new Map(corpus.runes.map((r, i) => [r, i]));
  const lp1Pages = lp1.split('%');
  for (const p of [3, 8, 9, 10, 11, 14]) {
    for (const rune of lp1Pages[p]) {
      const id = runeIds.get(rune);
      if (id !== undefined) frequencies[id]++;
    }
  }
  for (const page of corpus.pages.filter((p) => p.status === 'solved')) {
    for (const id of page.indices) frequencies[id]++;
  }
  const n = frequencies.reduce((a, b) => a + b, 0);
  const q = frequencies.map((v) => v / n);
  let total = 0;
  const cdf = q.map((v) => (total += v));
  const ac = Array.from({ length: M }, (_, d) =>
    q.reduce((s, v, i) => s + v * q[(i + d) % M], 0)
  );
  assert.equal(n - M, 1181);
  assert.ok(Math.abs(total - 1) < 1e-12);
  return { q, cdf, ac, count: n - M };
}

/**
 * Deterministic Xorshift32 with an explicit fixed source-independent seed.
 * @param {number} seed
 * @returns {()=>number}
 */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {()=>number} random */
function shuffledKey(random) {
  const K = Array.from({ length: M }, (_, i) => i);
  for (let i = M - 1; i > 0; i--) {
    const k = Math.floor(random() * (i + 1));
    [K[i], K[k]] = [K[k], K[i]];
  }
  assert.equal(new Set(K).size, M);
  return K;
}

/** @param {number} slope */
function slopeKey(slope) {
  assert.ok(Number.isInteger(slope) && slope >= 1 && slope < M);
  return Array.from({ length: M }, (_, j) => (slope * j) % M);
}

/**
 * First-order Bernoulli reject rate selected solely from the original number
 * of adjacent repeats, not any lag statistic. A cyclic key with GP-iid
 * plaintext has approximate pre-rejection collision probability equal to
 * the average q-autocorrelation at adjacent secret key differences.
 *
 * @param {number[]} key
 * @param {number[]} ac
 * @returns {{preCollision:number,rejection:number}}
 */
function calibratedReject(key, ac) {
  let preCollision = 0;
  for (let j = 0; j < M; j++) {
    const d = (key[(j + 1) % M] - key[j] + M) % M;
    preCollision += ac[d];
  }
  preCollision /= M;
  const observedRate = 86 / 12901;
  const rejection = 1 - observedRate / preCollision;
  assert.ok(rejection > 0 && rejection < 1);
  return { preCollision, rejection };
}

/** @param {number[]} cdf @param {()=>number} random */
function samplePlain(cdf, random) {
  const u = random();
  let lo = 0;
  let hi = M - 1;
  while (lo < hi) {
    const middle = (lo + hi) >> 1;
    if (cdf[middle] >= u) hi = middle;
    else lo = middle + 1;
  }
  return lo;
}

/**
 * Exact causal encryption on the original 55-page geometry. The ring buffer
 * compares emitted runes at physical-page-local lags 28 and 29; no page cut
 * contributes a pair. Optional traced page exposes all hidden skip decisions
 * for the exact positive inverse, without changing the generator.
 *
 * @param {number[]} key
 * @param {number} rejection
 * @param {number[]} cdf
 * @param {()=>number} random
 * @param {boolean} trace
 * @returns {{r1:number,r28:number,r29:number,tracePage:object|null}}
 */
function plant(key, rejection, cdf, random, trace = false) {
  let r1 = 0;
  let r28 = 0;
  let r29 = 0;
  let tracePage = null;
  for (let p = 0; p < pageLengths.length; p++) {
    const n = pageLengths[p];
    let phase = Math.floor(random() * M);
    let previous = -1;
    const ring = new Int8Array(M);
    const record = trace && p === 0 ? {
      ciphertext: [], plaintext: [], phaseBefore: [], skipped: []
    } : null;
    for (let i = 0; i < n; i++) {
      const plain = samplePlain(cdf, random);
      const before = phase;
      let output = (plain + key[phase]) % M;
      phase = (phase + 1) % M;
      let skipped = false;
      if (i > 0 && output === previous && random() < rejection) {
        output = (plain + key[phase]) % M;
        phase = (phase + 1) % M;
        skipped = true;
      }
      if (record) {
        record.ciphertext.push(output);
        record.plaintext.push(plain);
        record.phaseBefore.push(before);
        record.skipped.push(skipped);
      }
      if (i > 0) r1 += output === previous;
      if (i >= 28) r28 += output === ring[(i + 1) % M];
      if (i >= 29) r29 += output === ring[i % M];
      ring[i % M] = output;
      previous = output;
    }
    if (record) tracePage = record;
  }
  return { r1, r28, r29, tracePage };
}

/**
 * Exact known-key inverse and replay on every rune of a positive page,
 * including all latent skip decisions, for implementation verification.
 * @param {number[]} key
 * @param {{ciphertext:number[],plaintext:number[],phaseBefore:number[],skipped:boolean[]}} trace
 */
function assertPlantInverse(key, trace) {
  let previous = -1;
  let foundSkips = 0;
  for (let i = 0; i < trace.ciphertext.length; i++) {
    const phase = trace.phaseBefore[i];
    const actual = trace.ciphertext[i];
    const skipped = trace.skipped[i];
    const plain = skipped
      ? (previous - key[phase] + M) % M
      : (actual - key[phase] + M) % M;
    assert.equal(plain, trace.plaintext[i]);
    let candidate = (plain + key[phase]) % M;
    if (skipped) {
      assert.equal(candidate, previous);
      candidate = (plain + key[(phase + 1) % M]) % M;
      assert.notEqual(candidate, previous);
      foundSkips++;
    }
    assert.equal(candidate, actual);
    previous = actual;
  }
  assert.ok(foundSkips >= 1);
}

/** @param {number[][]} pages @param {number} lag */
function originalLag(pages, lag) {
  let n = 0;
  for (const page of pages) {
    for (let i = lag; i < page.length; i++) n += page[i] === page[i - lag];
  }
  return n;
}

/** Run the prespecified full original-input Monte Carlo challenge. */
function study() {
  const { cdf, ac, count } = nativeReference();
  const obs = {
    r1: originalLag(original, 1),
    r28: originalLag(original, 28),
    r29: originalLag(original, 29)
  };
  assert.deepEqual(obs, { r1: 86, r28: 381, r29: 395 });
  const targetJoint = obs.r28 + obs.r29;
  const random = rng(RNG_SEED);
  let trials = 0;
  let atOrBelow = 0;
  let atOrBelowMatchedRepeats = 0;
  let matchedRepeatTrials = 0;
  let smallestJoint = Infinity;
  let smallestR29 = Infinity;
  let totalRepeats = 0;
  const means = [];
  const schedules = [];

  function batch(kind, label, key, reps) {
    const { preCollision, rejection } = calibratedReject(key, ac);
    let sumR1 = 0;
    let sumR28 = 0;
    let sumR29 = 0;
    let minJoint = Infinity;
    for (let rep = 0; rep < reps; rep++) {
      const x = plant(key, rejection, cdf, random, trials === 0);
      if (x.tracePage) assertPlantInverse(key, x.tracePage);
      const joint = x.r28 + x.r29;
      trials++;
      totalRepeats += x.r1;
      sumR1 += x.r1;
      sumR28 += x.r28;
      sumR29 += x.r29;
      if (joint <= targetJoint) atOrBelow++;
      if (Math.abs(x.r1 - obs.r1) <= 10) {
        matchedRepeatTrials++;
        if (joint <= targetJoint) atOrBelowMatchedRepeats++;
      }
      minJoint = Math.min(minJoint, joint);
      smallestJoint = Math.min(smallestJoint, joint);
      smallestR29 = Math.min(smallestR29, x.r29);
    }
    schedules.push({
      kind, label, rejection, preCollision,
      meanR1: sumR1 / reps,
      meanR28: sumR28 / reps,
      meanR29: sumR29 / reps,
      meanJoint: (sumR28 + sumR29) / reps,
      minJoint
    });
  }

  for (let slope = 1; slope < M; slope++) {
    batch('arithmetic', String(slope), slopeKey(slope), SLOPE_SAMPLES);
  }
  for (let k = 0; k < RANDOM_KEYS; k++) {
    batch('secret-permutation', String(k), shuffledKey(random),
      RANDOM_KEY_SAMPLES);
  }
  assert.equal(trials, 28 * SLOPE_SAMPLES + RANDOM_KEYS * RANDOM_KEY_SAMPLES);
  assert.equal(atOrBelow, 0);
  assert.equal(atOrBelowMatchedRepeats, 0);
  assert.ok(Math.abs(totalRepeats / trials - obs.r1) < 5);
  const top = [...schedules].sort((a, b) => a.meanJoint - b.meanJoint);
  return {
    hypothesis: 'period29 secret permutation additive key with one collision-triggered probabilistic extra key consumption',
    status: 'finite sampled negative only; no plaintext/key; no all-29! exclusion',
    original: { ...obs, joint: targetJoint, runes: 12956, pages: 55,
      eligibleAdjacent: 12901, eligibleLag28: 11416, eligibleLag29: 11361 },
    reference: { solvedRuneCount: count, qCollision: ac[0] },
    selection: {
      calibrator: 'For each key, rejection = 1 - (86/12901)/mean_j autocorrelation_q(key[j+1]-key[j]). No lag28/29 tuning.',
      rejectionRateRange: [
        Math.min(...schedules.map((s) => s.rejection)),
        Math.max(...schedules.map((s) => s.rejection))
      ],
      freshUnrestrictedPermutationKeys: RANDOM_KEYS,
      completeArithmeticPermutationKeys: M - 1
    },
    monteCarlo: {
      seed: RNG_SEED, trials, targetJoint, atOrBelow, smallestJoint,
      smallestSingleLag29: smallestR29,
      meanAdjacentRepeats: totalRepeats / trials,
      repeatedCountMatchedSubset: {
        condition: 'within 10 of the 86 original adjacent repeats',
        trials: matchedRepeatTrials,
        atOrBelow: atOrBelowMatchedRepeats
      },
      bestScheduleMeanJoint: top.slice(0, 6),
      slope4: schedules.find((s) => s.kind === 'arithmetic' && s.label === '4'),
      slope25: schedules.find((s) => s.kind === 'arithmetic' && s.label === '25')
    }
  };
}
if (require.main === module) console.log(JSON.stringify(study(), null, 2));
module.exports = { nativeReference, rng, shuffledKey, slopeKey,
  calibratedReject, plant, assertPlantInverse, originalLag, study };
