'use strict';

/**
 * Test the exact 13-token seed extracted from the authenticated 2016
 * instruction message against the historical 2012 P.S. modulus using
 * the existing soft no-repeat keyskip transducer.
 *
 * This is a bounded source-derived test, not a generic seed search.
 * Run: node sims/lp2_2016_prng_seed_ps2012_modsquare_keyskip.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {N} = require('./ps2012_modsquare_pad.cjs');
const {logLikelihood, encrypt} = require('./keyskip_transducer.cjs');
const {encode, random32} = require('./orbit_phase_vote_recovery.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');

const SEED_TOKENS = 'LCBPNGPARRTHBPC';
const SEED_RUNES = encode(SEED_TOKENS);
assert.ok(SEED_RUNES);
assert.equal(SEED_RUNES.length, 13);
const SEED = SEED_RUNES.reduce((n, x) => n * 29n + BigInt(x), 0n);
assert.equal(SEED, 7144649572585460758n);
assert.equal(N.toString(2).length, 432);

const PAGES = [0, 7, 23, 28, 42, 53].map(page => {
  const found = corpus.pages.find(item => item.page === page);
  assert.ok(found, 'Missing selected physical page ' + page);
  return found;
});
const OBSERVED = PAGES.map(page => page.indices);
const PAGE_LENGTHS = OBSERVED.map(page => page.length);
const TOTAL_RUNES = PAGE_LENGTHS.reduce((a, b) => a + b, 0);
assert.equal(TOTAL_RUNES, 1403);

const MODES = [
  'full-residue',
  'low-byte',
  'five-bit-big',
  'five-bit-little'
];
const INITIALIZATIONS = ['seed-squared', 'seed-state'];
const SIGNS = [-1, 1];
const RESETS = ['continuous', 'page'];
const REJECT_REPEAT = 0.81;
const MAX_TOTAL_SKIPS = 32;
const MAX_SKIPPED_PER_OUTPUT = 3;
const INVERSE_SIGMA = Array.from({length:29}, (_, i) => i);

function mod(x, m) {
  return ((x % m) + m) % m;
}

/**
 * The same modular-squaring recurrence used by ps2012_modsquare_pad.cjs.
 * The additional seed-state case tests whether the 2016 number is already
 * x0, rather than a seed that must first be squared.
 */
function* stream(seed, mode, initialization) {
  let x = initialization === 'seed-squared'
    ? (seed * seed) % N
    : seed % N;
  const nextBit = () => {
    x = x * x % N;
    return Number(x & 1n);
  };
  while (true) {
    if (mode === 'full-residue') {
      x = x * x % N;
      yield Number(x % 29n);
    } else if (mode === 'low-byte') {
      x = x * x % N;
      yield Number(x & 255n) % 29;
    } else {
      let value = 0;
      for (let bit = 0; bit < 5; bit++) {
        const b = nextBit();
        if (mode === 'five-bit-big') value = (value << 1) | b;
        else value |= b << bit;
      }
      if (value < 29) yield value;
    }
  }
}

function makeKey(seed, mode, initialization, sign, length) {
  const generator = stream(seed, mode, initialization);
  const key = new Array(length);
  for (let i = 0; i < length; i++) {
    key[i] = mod(sign * generator.next().value, 29);
  }
  return key;
}

function textGP(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode)
    .filter(word => word && word.length)
    .flat();
}

const training = textGP(shakespeare);
const q = new Array(29).fill(0.5);
for (const symbol of training) q[symbol]++;
const qTotal = q.reduce((a, b) => a + b, 0);
for (let i = 0; i < q.length; i++) q[i] /= qTotal;

function scoreOne(cipher, key) {
  return logLikelihood(cipher, {
    key,
    q,
    inverseSigma: INVERSE_SIGMA,
    rejectRepeat: REJECT_REPEAT,
    maxTotalSkips: MAX_TOTAL_SKIPS,
    maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT
  });
}

function scoreModel(data, seed, mode, initialization, sign, reset) {
  const key = makeKey(
    seed, mode, initialization, sign,
    TOTAL_RUNES + MAX_TOTAL_SKIPS + MAX_SKIPPED_PER_OUTPUT + 2
  );
  if (reset === 'continuous') return scoreOne(data.flat(), key);
  return data.reduce((sum, page) => sum + scoreOne(page, key), 0);
}

function screen(data, seed) {
  const candidates = [];
  for (const initialization of INITIALIZATIONS) {
    for (const mode of MODES) {
      for (const sign of SIGNS) {
        for (const reset of RESETS) {
          candidates.push({
            initialization, mode, sign, reset,
            logLikelihood: scoreModel(
              data, seed, mode, initialization, sign, reset
            )
          });
        }
      }
    }
  }
  return candidates.sort((a, b) => b.logLikelihood - a.logLikelihood);
}

function plant(reset, initialization) {
  const source = textGP(gibran).slice(0, TOTAL_RUNES);
  assert.equal(source.length, TOTAL_RUNES);
  const draw = random32(0x473301);
  if (reset === 'continuous') {
    const key = makeKey(
      SEED, 'five-bit-big', initialization, 1, TOTAL_RUNES + 100
    );
    const result = encrypt(
      source, key, INVERSE_SIGMA, draw, {rejectRepeat: REJECT_REPEAT}
    );
    let offset = 0;
    const data = PAGE_LENGTHS.map(length => {
      const page = result.cipher.slice(offset, offset + length);
      offset += length;
      return page;
    });
    return {data, skips: result.skips};
  }

  let offset = 0;
  let skips = 0;
  const data = [];
  const skipsByPage = [];
  for (const length of PAGE_LENGTHS) {
    const key = makeKey(
      SEED, 'five-bit-big', initialization, 1, length + 100
    );
    const result = encrypt(
      source.slice(offset, offset + length),
      key, INVERSE_SIGMA, draw, {rejectRepeat: REJECT_REPEAT}
    );
    offset += length;
    skips += result.skips;
    skipsByPage.push(result.skips);
    data.push(result.cipher);
  }
  return {data, skips, skipsByPage};
}

function splitmix64(state) {
  state = (state + 0x9e3779b97f4a7c15n) & ((1n << 64n) - 1n);
  let z = state;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & ((1n << 64n) - 1n);
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & ((1n << 64n) - 1n);
  return {
    state,
    value: (z ^ (z >> 31n)) & ((1n << 64n) - 1n)
  };
}

function randomSeedNull(observedBest, replicates = 50) {
  const samples = [];
  let state = 0xA4F0913301n;
  for (let i = 0; i < replicates; i++) {
    const next = splitmix64(state);
    state = next.state;
    const seed = (next.value & ((1n << 63n) - 1n)) || 1n;
    samples.push({seed: String(seed), best: screen(OBSERVED, seed)[0]});
  }
  const scores = samples.map(x => x.best.logLikelihood).sort((a, b) => a - b);
  const exceedances = samples.filter(
    x => x.best.logLikelihood >= observedBest
  ).length;
  return {
    replicates,
    exceedances,
    addOneEmpiricalP: (exceedances + 1) / (replicates + 1),
    minimumBestNull: scores[0],
    medianBestNull: scores[Math.floor(scores.length / 2)],
    maximumBestNull: scores[scores.length - 1]
  };
}

function run() {
  const original = screen(OBSERVED, SEED);
  const best = original[0];
  const conventional = original.find(x =>
    x.initialization === 'seed-squared' &&
    x.mode === 'five-bit-big' &&
    x.sign === 1 &&
    x.reset === 'page'
  );
  const nullResult = randomSeedNull(best.logLikelihood, 50);

  const positiveControls = [];
  for (const initialization of INITIALIZATIONS) {
    for (const reset of RESETS) {
      const planted = plant(reset, initialization);
      const ranked = screen(planted.data, SEED);
      const winner = ranked[0];
      const recovered = winner.initialization === initialization &&
        winner.mode === 'five-bit-big' &&
        winner.sign === 1 &&
        winner.reset === reset;
      assert.ok(recovered, 'Positive control failed: ' +
        initialization + '/' + reset);
      positiveControls.push({
        initialization,
        reset,
        skips: planted.skips,
        skipsByPage: planted.skipsByPage || null,
        winner,
        runnerUp: ranked[1],
        exactWinner: recovered
      });
    }
  }

  const conventionalRank = original.findIndex(x =>
    x.initialization === 'seed-squared' &&
    x.mode === 'five-bit-big' &&
    x.sign === 1 &&
    x.reset === 'page'
  ) + 1;
  assert.equal(conventionalRank, 11);
  assert.equal(nullResult.exceedances, 31);
  assert.ok(nullResult.addOneEmpiricalP > 0.05);

  return {
    hypothesis: '2016-derived 13-token PRNG seed drives the 2012 P.S. modular-squaring key stream',
    sourceSeed: {
      tokens: SEED_TOKENS,
      runeCount: SEED_RUNES.length,
      base29: String(SEED),
      hex: '0x' + SEED.toString(16)
    },
    modulusBits: N.toString(2).length,
    inputPages: PAGES.map(page => page.page),
    pageLengths: PAGE_LENGTHS,
    inputRunes: TOTAL_RUNES,
    modelCount: original.length,
    model: {
      initializations: INITIALIZATIONS,
      reductions: MODES,
      signs: SIGNS,
      keyResets: RESETS,
      rejectRepeat: REJECT_REPEAT,
      maxTotalSkips: MAX_TOTAL_SKIPS,
      maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT
    },
    original: {
      best: original[0],
      topEight: original.slice(0, 8),
      conventionalFiveBitBigPageReset: {
        rank: conventionalRank,
        ...conventional
      },
      allModels: original
    },
    randomSeedNull: {
      ...nullResult,
      observedBest: best.logLikelihood,
      comparison: 'Each random 63-bit seed is scored by the maximum over the same 32 models.'
    },
    positiveControls: {
      source: 'Independent Gibran GP plaintext; Shakespeare GP unigram prior',
      results: positiveControls,
      allFourRecovered: positiveControls.every(x => x.exactWinner)
    },
    verdict: 'The 2016-derived seed does not outperform random 63-bit seeds in this source-motivated 2012 modular-squaring plus soft-keyskip model.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {SEED, SEED_TOKENS, stream, makeKey, scoreModel, screen, plant, run};
