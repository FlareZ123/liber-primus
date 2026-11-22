#!/usr/bin/env node
'use strict';

/*
 * Original LP2 p50-table periodic-key / soft collision-rejection likelihood gate.
 *
 * Model:
 *   C = P + sign*K[j] (mod 29), where K is the 256-cell p50 table projected
 *   either by byte mod 29 or floor(29*byte/256).
 *   If a proposed C equals the previous emitted ciphertext rune, the encoder
 *   skips the current key entry and retries the SAME plaintext rune with
 *   probability r; otherwise it emits the repeated rune. Consecutive equal
 *   projected key entries can therefore cause multiple retries.
 *
 * The exact HMM marginalizes every retry history and every initial phase.
 * A second score independently maximizes the initial phase on every page,
 * a deliberately generous upper bound for a page-reset clock.
 *
 * This is a bounded model test, not a claim that Cicada used this mechanism.
 * Run: node sims/lp2_p50_soft_rejection_fullbook_hmm_sft.cjs
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const M = 29;
const DEFAULT_R = 0.80;
const RNG_SEED = 0x2560a11;
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r/g, '');
const mod = x => ((x % M) + M) % M;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const bytes = grid.pages.flatMap(page => page.bytes);

assert.equal(bytes.length, 256);
assert.deepEqual(bytes.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);
const byteSha256 = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(byteSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = lp1.split('%');
const frequency = Array(M).fill(1);
for (const page of [3, 8, 9, 10, 11, 14]) {
  for (const character of segments[page] || '') {
    const id = runeId.get(character);
    if (id !== undefined) frequency[id]++;
  }
}
for (const page of corpus.pages.filter(page => page.status === 'solved')) {
  for (const id of page.indices) frequency[id]++;
}
const referenceCount = frequency.reduce((sum, value) => sum + value, 0) - M;
assert.equal(referenceCount, 1181);
const q = frequency.map(value => value / frequency.reduce((sum, item) => sum + item, 0));

const pages = corpus.pages
  .filter(page => page.status === 'unsolved' && page.indices.length)
  .map(page => ({ page: page.page, c: page.indices.slice() }));
const training = pages.filter(page => page.page <= 27);
const heldout = pages.filter(page => page.page >= 28);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.c.length, 0), 12956);
assert.equal(training.length, 28);
assert.equal(training.reduce((sum, page) => sum + page.c.length, 0), 6761);
assert.equal(heldout.length, 27);
assert.equal(heldout.reduce((sum, page) => sum + page.c.length, 0), 6195);

const withinPageTransitions = pages.reduce((sum, page) => sum + page.c.length - 1, 0);
const withinPageRepeats = pages.reduce((sum, page) => {
  let count = 0;
  for (let i = 1; i < page.c.length; i++) if (page.c[i] === page.c[i - 1]) count++;
  return sum + count;
}, 0);
assert.equal(withinPageTransitions, 12901);
assert.equal(withinPageRepeats, 86);

const repeatRate = withinPageRepeats / withinPageTransitions;
function nullScore(sourcePages) {
  return sourcePages.reduce((total, page) => {
    let score = -Math.log(M);
    for (let i = 1; i < page.c.length; i++) {
      score += Math.log(page.c[i] === page.c[i - 1]
        ? repeatRate
        : (1 - repeatRate) / (M - 1));
    }
    return total + score;
  }, 0);
}

function makeKey(projection, sign) {
  const key = bytes.map(byte => mod(sign * (
    projection === 'byte-mod29'
      ? byte % M
      : Math.floor(M * byte / 256)
  )));
  const run = key.map((value, start) => {
    let length = 1;
    while (length < key.length && key[(start + length) % key.length] === value) length++;
    return length;
  });
  assert.ok(Math.max(...run) <= 3);
  return { key, run, projection, sign };
}

/*
 * Backward HMM. At phase j, a run of n equal key values can:
 * - emit an equal output after s=0..n-1 skips, weight r^s(1-r);
 * - emit the first distinct output after n skips, weight r^n;
 * - emit a nonrepeat immediately with the current key.
 */
function backward(cipher, keyObject, rejection) {
  const { key, run } = keyObject;
  const beta = new Float64Array(256).fill(1);
  const current = new Float64Array(256);
  const retryPower = run.map(length => Math.pow(rejection, length));
  let logScale = 0;

  for (let i = cipher.length - 1; i >= 0; i--) {
    const previous = i > 0 ? cipher[i - 1] : -1;
    const value = cipher[i];
    const difference = previous < 0 ? -1 : mod(value - previous);
    let maximum = 0;

    for (let phase = 0; phase < 256; phase++) {
      let probability = 0;
      if (previous < 0 || difference !== 0) {
        probability = q[mod(value - key[phase])] * beta[(phase + 1) % 256];
        if (previous >= 0) {
          const length = run[phase];
          const targetStep = mod(key[(phase + length) % 256] - key[phase]);
          if (difference === targetStep) {
            probability += retryPower[phase]
              * q[mod(previous - key[phase])]
              * beta[(phase + length + 1) % 256];
          }
        }
      } else {
        const length = run[phase];
        const plainProbability = q[mod(previous - key[phase])];
        let skippedProbability = 1;
        for (let skipped = 0; skipped < length; skipped++) {
          probability += skippedProbability * (1 - rejection) * plainProbability
            * beta[(phase + skipped + 1) % 256];
          skippedProbability *= rejection;
        }
      }
      current[phase] = probability;
      if (probability > maximum) maximum = probability;
    }

    assert.ok(maximum > 0);
    logScale += Math.log(maximum);
    for (let phase = 0; phase < 256; phase++) beta[phase] = current[phase] / maximum;
  }

  let sum = 0;
  let best = 0;
  for (const value of beta) {
    sum += value;
    if (value > best) best = value;
  }
  return {
    marginal: logScale + Math.log(sum / 256),
    best: logScale + Math.log(best)
  };
}

/* Forward form independently checks the backward recursion. */
function forward(cipher, keyObject, rejection) {
  const { key, run } = keyObject;
  let alpha = new Float64Array(256).fill(1 / 256);
  let next = new Float64Array(256);
  let logLikelihood = 0;

  for (let phase = 0; phase < 256; phase++) {
    next[(phase + 1) % 256] += alpha[phase] * q[mod(cipher[0] - key[phase])];
  }
  let normalizer = next.reduce((sum, value) => sum + value, 0);
  logLikelihood += Math.log(normalizer);
  for (let phase = 0; phase < 256; phase++) next[phase] /= normalizer;
  [alpha, next] = [next, alpha];
  next.fill(0);

  for (let i = 1; i < cipher.length; i++) {
    const previous = cipher[i - 1];
    const value = cipher[i];
    const difference = mod(value - previous);
    for (let phase = 0; phase < 256; phase++) {
      if (difference !== 0) {
        next[(phase + 1) % 256] += alpha[phase] * q[mod(value - key[phase])];
        const length = run[phase];
        const targetStep = mod(key[(phase + length) % 256] - key[phase]);
        if (difference === targetStep) {
          next[(phase + length + 1) % 256] += alpha[phase]
            * Math.pow(rejection, length) * q[mod(previous - key[phase])];
        }
      } else {
        const length = run[phase];
        const plainProbability = q[mod(previous - key[phase])];
        let skippedProbability = 1;
        for (let skipped = 0; skipped < length; skipped++) {
          next[(phase + skipped + 1) % 256] += alpha[phase]
            * skippedProbability * (1 - rejection) * plainProbability;
          skippedProbability *= rejection;
        }
      }
    }
    normalizer = next.reduce((sum, value) => sum + value, 0);
    assert.ok(normalizer > 0);
    logLikelihood += Math.log(normalizer);
    for (let phase = 0; phase < 256; phase++) next[phase] /= normalizer;
    [alpha, next] = [next, alpha];
    next.fill(0);
  }
  return logLikelihood;
}

function scorePages(sourcePages, keyObject, rejection) {
  let marginal = 0;
  let best = 0;
  for (const page of sourcePages) {
    const result = backward(page.c, keyObject, rejection);
    marginal += result.marginal;
    best += result.best;
  }
  const baseline = nullScore(sourcePages);
  return { marginalLLR: marginal - baseline, bestPagePhaseLLR: best - baseline };
}

function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function samplePlain(random) {
  const value = random();
  let cumulative = 0;
  for (let symbol = 0; symbol < M; symbol++) {
    cumulative += q[symbol];
    if (value < cumulative) return symbol;
  }
  return M - 1;
}

function plant(sourcePages, keyObject, rejection, seed) {
  const random = xorshift(seed);
  return sourcePages.map(page => {
    let phase = Math.floor(random() * 256);
    let previous = -1;
    const cipher = [];
    for (let i = 0; i < page.c.length; i++) {
      const plain = samplePlain(random);
      let output = mod(plain + keyObject.key[phase]);
      let retries = 0;
      while (previous >= 0 && output === previous && random() < rejection) {
        phase = (phase + 1) % 256;
        output = mod(plain + keyObject.key[phase]);
        retries++;
        assert.ok(retries <= 256);
      }
      cipher.push(output);
      previous = output;
      phase = (phase + 1) % 256;
    }
    return { page: page.page, c: cipher };
  });
}

const variants = [];
for (const projection of ['byte-mod29', 'scaled-byte']) {
  for (const sign of [1, -1]) {
    const keyObject = makeKey(projection, sign);
    const observed = {
      training: scorePages(training, keyObject, DEFAULT_R),
      heldout: scorePages(heldout, keyObject, DEFAULT_R),
      full: scorePages(pages, keyObject, DEFAULT_R)
    };
    const plantedPages = plant(pages, keyObject, DEFAULT_R, RNG_SEED + variants.length * 7919);
    const planted = scorePages(plantedPages, keyObject, DEFAULT_R);
    const crosscheck = Math.abs(
      forward(pages[0].c, keyObject, DEFAULT_R)
      - backward(pages[0].c, keyObject, DEFAULT_R).marginal
    );
    assert.ok(crosscheck < 1e-8);
    assert.ok(planted.marginalLLR > 1000);
    variants.push({
      projection,
      sign,
      keyPrefix: keyObject.key.slice(0, 8),
      maximumEqualKeyRun: Math.max(...keyObject.run),
      observed,
      plantedPositive: planted,
      forwardBackwardAbsoluteDifferenceOnP0: crosscheck
    });
  }
}

/* Profile one nuisance parameter over a frozen, coarse range. */
const rejectionGrid = Array.from({ length: 25 }, (_, index) => 0.50 + index * 0.02);
const rejectionProfiles = [];
for (const projection of ['byte-mod29', 'scaled-byte']) {
  for (const sign of [1, -1]) {
    const keyObject = makeKey(projection, sign);
    const profile = rejectionGrid.map(rejection => ({
      rejection,
      fullBestPagePhaseLLR: scorePages(pages, keyObject, rejection).bestPagePhaseLLR
    }));
    profile.sort((a, b) => b.fullBestPagePhaseLLR - a.fullBestPagePhaseLLR);
    rejectionProfiles.push({
      projection,
      sign,
      bestGridValue: profile[0],
      topFive: profile.slice(0, 5)
    });
  }
}

const output = {
  status: 'bounded negative for the p50 periodic additive-key / soft collision-rejection family',
  source: {
    byteCount: bytes.length,
    byteSha256,
    firstEightBytes: bytes.slice(0, 8),
    referenceRunes: referenceCount,
    unknownPages: pages.length,
    unknownRunes: pages.reduce((sum, page) => sum + page.c.length, 0),
    withinPageTransitions,
    withinPageRepeats,
    trainingPages: training.length,
    trainingRunes: training.reduce((sum, page) => sum + page.c.length, 0),
    heldoutPages: heldout.length,
    heldoutRunes: heldout.reduce((sum, page) => sum + page.c.length, 0)
  },
  model: {
    alphabet: 'GP29',
    key: '256 p50 base60 byte values, repeated periodically',
    projections: ['byte mod 29', 'floor(29*byte/256)'],
    signs: ['C=P+K', 'C=P-K'],
    rejection: 'on a proposed ciphertext collision, skip the key entry and retry the same plaintext with probability r',
    defaultRejectionProbability: DEFAULT_R,
    phase: 'unknown independent phase per physical page; exact marginal and per-page maximum'
  },
  variants,
  rejectionProfiles,
  conclusion: 'All four source-derived key variants remain far below the uniform anti-repeat Markov null, even after independently maximizing every page phase. The planted controls are strongly detected. This does not exclude other uses of p50, other table radices/projections, nonadditive transforms, or a different source-selected filter.'
};

console.log(JSON.stringify(output, null, 2));
