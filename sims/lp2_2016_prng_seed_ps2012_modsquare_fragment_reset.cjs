'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {N} = require('./ps2012_modsquare_pad.cjs');
const {logLikelihood, encrypt} = require('./keyskip_transducer.cjs');
const {encode, random32} = require('./orbit_phase_vote_recovery.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');

const SEED_TOKENS = 'LCBPNGPARRTHBPC';
const SEED_RUNES = encode(SEED_TOKENS);
assert.ok(SEED_RUNES);
assert.equal(SEED_RUNES.length, 13);
const SEED = SEED_RUNES.reduce((n, x) => n * 29n + BigInt(x), 0n);
assert.equal(SEED, 7144649572585460758n);
assert.equal(N.toString(2).length, 432);

const PAGES = corpus.pages.filter(page => page.page <= 55);
const CIPHERTEXT = PAGES.flatMap(page => page.indices);
assert.equal(PAGES.length, 56);
assert.equal(CIPHERTEXT.length, 12956);

const events = [];
let pageOffset = 0;
for (const page of PAGES) {
  const annotated = annotations.pages.find(item => item.page === page.page);
  for (const [localOffset, dots, ink] of (annotated?.large_punctuation || [])) {
    if (dots === 13) events.push({offset: pageOffset + localOffset, page: page.page, localOffset, ink});
  }
  pageOffset += page.indices.length;
}
events.sort((a, b) => a.offset - b.offset || a.page - b.page);
assert.equal(events.length, 28);

const FRAGMENTS = [];
let previousOffset = 0;
for (const event of events) {
  FRAGMENTS.push(CIPHERTEXT.slice(previousOffset, event.offset));
  previousOffset = event.offset;
}
FRAGMENTS.push(CIPHERTEXT.slice(previousOffset));
assert.equal(FRAGMENTS.length, 29);
assert.equal(FRAGMENTS.filter(fragment => fragment.length === 0).length, 3);
assert.equal(FRAGMENTS.reduce((sum, fragment) => sum + fragment.length, 0), 12956);

const doublets = sequence => {
  let count = 0;
  for (let i = 1; i < sequence.length; i++) if (sequence[i] === sequence[i - 1]) count++;
  return count;
};
const fragmentDoublets = FRAGMENTS.map(doublets);
assert.equal(fragmentDoublets.reduce((a, b) => a + b, 0), 86);
assert.equal(fragmentDoublets.reduce((sum, n) => sum + 3 * n, 0), 258);

const MODES = ['full-residue', 'low-byte', 'five-bit-big', 'five-bit-little'];
const INITIALIZATIONS = ['seed-squared', 'seed-state'];
const SIGNS = [-1, 1];
const REJECT_REPEAT = 0.81;
const MAX_SKIPPED_PER_OUTPUT = 3;
const INVERSE_SIGMA = Array.from({length:29}, (_, i) => i);

function mod(x, modulus) { return (x % modulus + modulus) % modulus; }

function* stream(seed, mode, initialization) {
  let x = initialization === 'seed-squared' ? (seed * seed) % N : seed % N;
  const nextBit = () => { x = x * x % N; return Number(x & 1n); };
  while (true) {
    if (mode === 'full-residue') { x = x * x % N; yield Number(x % 29n); }
    else if (mode === 'low-byte') { x = x * x % N; yield Number(x & 255n) % 29; }
    else {
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
  for (let i = 0; i < length; i++) key[i] = mod(sign * generator.next().value, 29);
  return key;
}

function textGP(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map(encode).filter(word => word && word.length).flat();
}

const training = textGP(shakespeare);
const q = new Array(29).fill(0.5);
for (const symbol of training) q[symbol]++;
const qTotal = q.reduce((a, b) => a + b, 0);
for (let i = 0; i < q.length; i++) q[i] /= qTotal;

function scoreFragment(fragment, seed, mode, initialization, sign) {
  const maximumSkips = 3 * doublets(fragment);
  const key = makeKey(seed, mode, initialization, sign, fragment.length + maximumSkips + MAX_SKIPPED_PER_OUTPUT + 2);
  return logLikelihood(fragment, {
    key, q, inverseSigma: INVERSE_SIGMA, rejectRepeat: REJECT_REPEAT,
    maxTotalSkips: maximumSkips, maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT
  });
}

function scoreModel(data, seed, mode, initialization, sign) {
  return data.reduce((sum, fragment) => sum + scoreFragment(fragment, seed, mode, initialization, sign), 0);
}

function screen(data, seed) {
  const candidates = [];
  for (const initialization of INITIALIZATIONS) for (const mode of MODES) for (const sign of SIGNS) {
    candidates.push({initialization, mode, sign, logLikelihood: scoreModel(data, seed, mode, initialization, sign)});
  }
  return candidates.sort((a, b) => b.logLikelihood - a.logLikelihood);
}

function plant(initialization) {
  const source = textGP(gibran).slice(0, CIPHERTEXT.length);
  assert.equal(source.length, CIPHERTEXT.length);
  const draw = random32(0x473301);
  let offset = 0, skips = 0;
  const data = [];
  for (const fragment of FRAGMENTS) {
    const plain = source.slice(offset, offset + fragment.length);
    offset += fragment.length;
    const key = makeKey(SEED, 'five-bit-big', initialization, 1, fragment.length + 100);
    const result = encrypt(plain, key, INVERSE_SIGMA, draw, {rejectRepeat: REJECT_REPEAT});
    data.push(result.cipher);
    skips += result.skips;
  }
  return {data, skips};
}

function splitmix64(state) {
  state = (state + 0x9e3779b97f4a7c15n) & ((1n << 64n) - 1n);
  let z = state;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & ((1n << 64n) - 1n);
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & ((1n << 64n) - 1n);
  return {state, value: (z ^ (z >> 31n)) & ((1n << 64n) - 1n)};
}

function randomSeedNull(observedBest, replicates = 25) {
  const samples = [];
  let state = 0xA4F0913301n;
  for (let i = 0; i < replicates; i++) {
    const next = splitmix64(state); state = next.state;
    const seed = (next.value & ((1n << 63n) - 1n)) || 1n;
    samples.push({seed: String(seed), best: screen(FRAGMENTS, seed)[0]});
  }
  const scores = samples.map(x => x.best.logLikelihood).sort((a, b) => a - b);
  const exceedances = samples.filter(x => x.best.logLikelihood >= observedBest).length;
  return {
    replicates, exceedances, addOneEmpiricalP: (exceedances + 1) / (replicates + 1),
    minimumBestNull: scores[0], medianBestNull: scores[Math.floor(scores.length / 2)],
    maximumBestNull: scores[scores.length - 1]
  };
}

function run() {
  const original = screen(FRAGMENTS, SEED), best = original[0];
  const directRank = original.findIndex(x => x.initialization === 'seed-squared' && x.mode === 'five-bit-big' && x.sign === 1) + 1;
  const direct = original[directRank - 1];
  const nullResult = randomSeedNull(best.logLikelihood, 25);
  const positiveControls = INITIALIZATIONS.map(initialization => {
    const planted = plant(initialization), ranked = screen(planted.data, SEED), winner = ranked[0];
    const exactWinner = winner.initialization === initialization && winner.mode === 'five-bit-big' && winner.sign === 1;
    assert.ok(exactWinner, 'Positive control failed: ' + initialization);
    return {initialization, skips: planted.skips, winner, runnerUp: ranked[1], exactWinner};
  });
  assert.equal(directRank, 13);
  assert.equal(nullResult.exceedances, 12);
  assert.equal(nullResult.addOneEmpiricalP, 0.5);
  assert.ok(positiveControls.every(x => x.exactWinner));
  return {
    hypothesis: '2016-derived 13-token PRNG seed resets at each image-confirmed 13-dot LP2 mark',
    sourceSeed: {tokens: SEED_TOKENS, runeCount: SEED_RUNES.length, base29: String(SEED), hex: '0x' + SEED.toString(16)},
    modulusBits: N.toString(2).length,
    unknownPages: PAGES.length, unknownRunes: CIPHERTEXT.length,
    printed13DotEvents: events,
    fragmentCount: FRAGMENTS.length,
    nonemptyFragments: FRAGMENTS.filter(fragment => fragment.length > 0).length,
    emptyFragments: FRAGMENTS.filter(fragment => fragment.length === 0).length,
    fragmentLengths: FRAGMENTS.map(fragment => fragment.length),
    adjacentDoublets: fragmentDoublets.reduce((a, b) => a + b, 0),
    maximumHiddenSkipsAcrossFragments: fragmentDoublets.reduce((sum, count) => sum + 3 * count, 0),
    model: {
      initializations: INITIALIZATIONS, reductions: MODES, signs: SIGNS,
      reset: 'same seed and soft-repeat state restart at each 13-dot event',
      rejectRepeat: REJECT_REPEAT, maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT,
      maxTotalSkipsPerFragment: 'three times the observed adjacent-doublet count in that fragment'
    },
    original: {best, topEight: original.slice(0, 8), directFiveBitBigPositive: {rank: directRank, ...direct}, allModels: original},
    randomSeedNull: {...nullResult, observedBest: best.logLikelihood, comparison: 'Each random 63-bit seed is scored by the maximum over the same 16 models.'},
    positiveControls: {
      source: 'Independent Gibran GP plaintext; Shakespeare GP unigram prior',
      results: positiveControls, allRecovered: positiveControls.every(x => x.exactWinner)
    },
    verdict: 'The 2016-derived seed does not outperform random 63-bit seeds when reset at every 13-dot LP2 event under this modular-squaring additive keyskip model.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {SEED, SEED_TOKENS, screen, run};
