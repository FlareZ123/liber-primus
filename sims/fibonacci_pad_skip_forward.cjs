'use strict';

/**
 * Exact forward dynamic program for 81% repeat-rejecting pad consumption,
 * applied to clue-derived Fibonacci-prime square AES/ChaCha/RC4 keys.
 *
 * Each repeated tentative ciphertext symbol can reject the current key
 * draw and retry the SAME plaintext rune with the next key draw. The
 * unknown number of rejected draws is summed out by a hidden-state model
 * rather than inferred by a brittle fixed-phase IoC screen.
 *
 * @module fibonacci_pad_skip_forward
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {candidates} = require('./fibonacci_spiral_key_derivation.cjs');
const {stream} = require('./base60_seeded_stream.cjs');
const {encode} = require('./affine_echo_literary_control.cjs');

const ROOT = path.join(__dirname, '..');
const PAGES = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'))
  .pages.filter((p) => p.status === 'unsolved' && p.indices.length);
const REPAIR = 0.81;
const MOD = 29;
const MAX_LOCAL_SKIPS = 5;
const mod = (n) => ((n % MOD) + MOD) % MOD;

/** @param {string} reference Corpus of GP-English source words. */
function plaintextPrior(reference) {
  const counts = new Float64Array(MOD).fill(1);
  const words = reference.match(/[A-Za-z]+/g) || [];
  for (const word of words) for (const x of encode(word)) counts[x]++;
  const total = counts.reduce((a, b) => a + b, 0);
  return Float64Array.from(counts, (x) => x / total);
}

/** @param {Buffer} bytes @param {'mod'|'scale'} mapping */
function padMap(bytes, mapping) {
  return Uint8Array.from(bytes, (b) =>
    mapping === 'mod' ? b % MOD : Math.floor(b * MOD / 256));
}

/** @param {number[]} ciphertext @returns {number} */
function antiRepeatBaseline(ciphertext) {
  const same = (1 - REPAIR) / (MOD - REPAIR);
  const different = (1 - same) / (MOD - 1);
  let out = -Math.log(MOD);
  for (let i = 1; i < ciphertext.length; i++) {
    out += Math.log(ciphertext[i] === ciphertext[i - 1] ? same : different);
  }
  return out;
}

/**
 * Forward log-likelihood under one given fixed keystream, marginalizing
 * all zero..maxSkips key-pointer drift paths across the whole page.
 * @param {number[]} c Original ciphertext runes, page-local.
 * @param {Uint8Array} k Decoded 29-symbol key stream, including skip margin.
 * @param {Float64Array} q Trained stationary GP-English unigram model.
 * @param {number} sign +1 or -1, c = p + sign*k.
 * @returns {number} Log p(ciphertext | fixed key and repeat-repair model).
 */
function likelihood(c, k, q, sign) {
  const n = c.length;
  const maxSkips = Math.min(60, Math.ceil(0.15 * n) + 10);
  assert.ok(k.length >= n + maxSkips + MAX_LOCAL_SKIPS);
  let current = new Float64Array(maxSkips + 1);
  current[0] = 1;
  let logTotal = 0;
  for (let i = 0; i < n; i++) {
    const following = new Float64Array(maxSkips + 1);
    const symbol = c[i];
    const previous = i ? c[i - 1] : -1;
    for (let drift = 0; drift <= maxSkips; drift++) {
      const probability = current[drift];
      if (!probability) continue;
      const pointer = i + drift;
      const originalPlain = mod(symbol - sign * k[pointer]);
      const acceptance = symbol === previous ? (1 - REPAIR) : 1;
      following[drift] += probability * q[originalPlain] * acceptance;
      if (i === 0 || drift === maxSkips) continue;

      // If the initial tentative output equals the previous symbol, each
      // retry consumes another pad value while retaining the same plain rune.
      const reusedPlain = mod(previous - sign * k[pointer]);
      let skipped = 1;
      let probabilityOfSkipping = probability * REPAIR * q[reusedPlain];
      while (skipped <= MAX_LOCAL_SKIPS &&
          drift + skipped <= maxSkips) {
        const attempted = mod(reusedPlain + sign * k[pointer + skipped]);
        const termination = attempted === previous ? (1 - REPAIR) : 1;
        if (attempted === symbol) {
          following[drift + skipped] +=
            probabilityOfSkipping * termination;
        }
        if (attempted !== previous) break;
        probabilityOfSkipping *= REPAIR;
        skipped++;
      }
    }
    const mass = following.reduce((sum, x) => sum + x, 0);
    if (!(mass > 0)) return -Infinity;
    logTotal += Math.log(mass);
    for (let d = 0; d <= maxSkips; d++) following[d] /= mass;
    current = following;
  }
  return logTotal;
}

/** @param {number} seed @returns {() => number} */
function seeded(seed) {
  let state = seed >>> 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Realistically planted pad-skip ciphertext from English-frequency symbols.
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {Buffer} known 32-byte candidate key.
 * @param {Float64Array} q GP symbol prior.
 */
function plant(pages, known, q) {
  const next = seeded(0x43ff1280);
  const cdf = [];
  let sum = 0;
  for (const p of q) cdf.push(sum += p);
  return pages.map((page) => {
    const k = padMap(stream('aes-256-ctr', known, 'zero',
      page.page, page.indices.length + 120, 0), 'mod');
    const indices = [];
    let pointer = 0, skipped = 0;
    for (let i = 0; i < page.indices.length; i++) {
      const r = next();
      const plain = cdf.findIndex((cutoff) => r < cutoff);
      assert.ok(plain >= 0);
      let produced;
      do {
        produced = mod(plain + k[pointer++]);
        if (i && produced === indices[i - 1] && next() < REPAIR) {
          skipped++;
        } else break;
      } while (pointer < k.length);
      indices.push(produced);
    }
    return {page: page.page, indices, skipped};
  });
}

/**
 * Evaluate a named candidate cipher setup against fixed page records.
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {Float64Array} q GP rune distribution.
 * @param {object} candidate Key metadata and parameters.
 * @returns {object}
 */
function score(pages, q, candidate) {
  let logLikelihood = 0, baseline = 0;
  let observed = 0;
  for (const page of pages) {
    const margin = Math.min(60, Math.ceil(page.indices.length * 0.15) + 10);
    const bytes = stream(candidate.cipher, candidate.key,
      candidate.iv, page.page, page.indices.length + margin + 8,
      candidate.drop);
    const symbols = padMap(bytes, candidate.mapping);
    logLikelihood += likelihood(page.indices, symbols, q, candidate.sign);
    baseline += antiRepeatBaseline(page.indices);
    observed += page.indices.length;
  }
  return {perRuneLLR: (logLikelihood - baseline) / observed,
    logLikelihood, baseline, runes: observed};
}

/**
 * Bounded best-key search. Unkeyed training data is independent of LP2.
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {Float64Array} q
 */
function search(pages, q) {
  const ranked = [];
  for (const key of candidates()) {
    for (const cipher of ['aes-256-ctr', 'chacha20', 'rc4']) {
      for (const iv of cipher === 'rc4'
        ? ['zero'] : ['zero', 'last-le', 'last-be', 'first-le']) {
        for (const drop of cipher === 'rc4' ? [0, 256, 3072] : [0, 256]) {
          for (const mapping of ['mod', 'scale']) {
            for (const sign of [-1, 1]) {
              const settings = {key: key.key, name: key.name,
                cipher, iv, drop, mapping, sign};
              ranked.push({...score(pages, q, settings),
                key: key.name, cipher, iv, drop, mapping, sign});
            }
          }
        }
      }
    }
  }
  ranked.sort((a, b) => b.perRuneLLR - a.perRuneLLR);
  return {configurations: ranked.length,
    top: ranked.slice(0, 10), worst: ranked.at(-1)};
}

/** @returns {object} */
function run() {
  const source = fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const q = plaintextPrior(source);
  const afterSquare = PAGES.filter((p) => p.page >= 16 && p.page <= 22);
  const heldout = PAGES.filter((p) => p.page >= 23 && p.page <= 29);
  const known = candidates().find((item) => item.name === 'absolute-spiral:BE');
  const controlPages = plant(afterSquare, known.key, q);
  const real = search(afterSquare, q);
  const positive = search(controlPages, q);
  const trueConfig = positive.top[0];
  const trueRecovered = trueConfig.key === known.name &&
    trueConfig.cipher === 'aes-256-ctr' &&
    trueConfig.iv === 'zero' && trueConfig.drop === 0 &&
    trueConfig.mapping === 'mod' && trueConfig.sign === 1;
  if (!trueRecovered) throw new Error('Planted keyskip model did not rank first');
  const topKey = candidates().find((item) => item.name === real.top[0].key);
  const validation = score(heldout, q, {key: topKey.key,
    cipher: real.top[0].cipher, iv: real.top[0].iv,
    drop: real.top[0].drop, mapping: real.top[0].mapping,
    sign: real.top[0].sign});
  return {
    hypothesis: 'AES/ChaCha/RC4 Fibonacci 256-bit key with key-skip on collision',
    corpus: 'GP-transliterated Shakespeare unigram, 29 symbols',
    repairedWhenTentativeEqualsPrevious: REPAIR,
    latentSkipsMarginalized: true,
    trainingWindow: afterSquare.map((p) => p.page),
    validationWindow: heldout.map((p) => p.page),
    actual: real,
    heldoutBestRealKey: {key: real.top[0].key, validation},
    planted: {
      key: known.name, trueSettingsRankOne: trueRecovered,
      forcedExtraPadDraws: controlPages.reduce((sum, p) => sum + p.skipped, 0),
      best: trueConfig, second: positive.top[1]
    }
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {plaintextPrior, padMap, antiRepeatBaseline,
  likelihood, planted: plant, score, search, run};
