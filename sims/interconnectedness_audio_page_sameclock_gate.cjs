'use strict';

/**
 * SFT: 2014 Interconnectedness whole-second timing -> LP2 p0/p29 shared-clock gate.
 *
 * This is a conditional, all-secret additive GP29 KEY-INVARIANT exclusion:
 * if C0[i] = (P0[i] + K[i]) mod 29 and C29[i] = (P29[i] + K[i]) mod 29
 * for the first 262 rune positions, then D[i] = (C0[i] - C29[i]) mod 29
 * equals the plaintext difference for EVERY possible secret K.
 *
 * Two native GP-language sources define independent language-register controls.
 * Each source is split once, with the first fraction used to build the source
 * GP29 difference Markov model. Fixed-seed, nonoverlapping windows in the
 * heldout fraction evaluate it without fitting any key or ciphertext parameter.
 * Tested language sources are finite controls, not a universal statement about
 * the set of possible messages. An alternative key clock is outside this gate.
 *
 * No command-line arguments, dependencies, or network access.
 *
 * @module interconnectedness_audio_page_sameclock_gate
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRS';
const MOD = 29;

/** @param {number} x @returns {number} */
function mod29(x) {
  return (x % MOD + MOD) % MOD;
}

/**
 * Public-domain prose -> conventional GP29 runes, with longest-match digraphs.
 * Words are kept in source order; no plaintext is inferred from ciphertext.
 * @param {string} raw
 * @param {Map<string, number>} dictionary
 * @returns {number[]}
 */
function englishGP(raw, dictionary) {
  const s = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const a = [];
  for (let i = 0; i < s.length;) {
    if (!/[A-Z]/.test(s[i])) {
      i++;
    } else if (s.slice(i, i + 3) === 'ING') {
      a.push(dictionary.get('NG'));
      i += 3;
    } else if (dictionary.has(s.slice(i, i + 2))) {
      a.push(dictionary.get(s.slice(i, i + 2)));
      i += 2;
    } else {
      const value = dictionary.get(s[i]);
      if (value !== undefined) a.push(value);
      i++;
    }
  }
  return a;
}

/** @param {string} raw @returns {number[]} */
function latinGP(raw) {
  return raw.split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line))
    .join('').split('').map(char => ALPHABET.indexOf(char));
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function difference(a, b) {
  return a.map((value, i) => mod29(value - b[i]));
}

/**
 * Learn a coherent first-order Markov distribution on the *difference*
 * between two independent GP29 source text streams. The joint distribution
 * for successive differences d,e is
 *
 * J[d,e] = sum_{x,y} B[x,y] B[x-d,y-e],
 *
 * where B is the source bigram joint probability. The difference marginal
 * R[d] = sum_e J[d,e] and the transition M[d,e] = J[d,e]/R[d].
 * A small prior gives strictly positive probabilities for all states.
 * @param {number[]} train
 * @returns {{R:number[],M:number[][]}}
 */
function buildDifferenceModel(train) {
  const smooth = 0.05;
  const normalizer = train.length - 1 + MOD * MOD * smooth;
  const B = Array.from({length: MOD}, () => Array(MOD).fill(smooth));
  for (let i = 1; i < train.length; i++) B[train[i - 1]][train[i]]++;
  for (let x = 0; x < MOD; x++) {
    for (let y = 0; y < MOD; y++) B[x][y] /= normalizer;
  }

  const R = Array(MOD).fill(0);
  const M = Array.from({length: MOD}, () => Array(MOD).fill(0));
  for (let d = 0; d < MOD; d++) {
    for (let e = 0; e < MOD; e++) {
      let joint = 0;
      for (let x = 0; x < MOD; x++) {
        for (let y = 0; y < MOD; y++) {
          joint += B[x][y] * B[mod29(x - d)][mod29(y - e)];
        }
      }
      M[d][e] = joint;
      R[d] += joint;
    }
    for (let e = 0; e < MOD; e++) M[d][e] /= R[d];
  }
  assert.ok(Math.abs(R.reduce((a, b) => a + b, 0) - 1) < 1e-9);
  return {R, M};
}

/**
 * Two logarithmic scores relative to independent uniform rune differences.
 * Marginal score uses R alone; Markov score uses R for first difference and
 * M for the remaining conditioned differences.
 * @param {{R:number[],M:number[][]}} model
 * @param {number[]} d
 * @returns {{unigram:number,bigram:number}}
 */
function score(model, d) {
  let unigram = Math.log(MOD * model.R[d[0]]);
  let bigram = unigram;
  for (let i = 1; i < d.length; i++) {
    unigram += Math.log(MOD * model.R[d[i]]);
    bigram += Math.log(MOD * model.M[d[i - 1]][d[i]]);
  }
  return {unigram, bigram};
}

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Unbiased fixed-seed offset draws with source-window nonoverlap.
 * @param {string} name
 * @param {number[]} source
 * @param {number} fraction
 * @param {number} seed
 * @param {number} samples
 * @param {number[]} original
 */
function evaluate(name, source, fraction, seed, samples, original) {
  const cut = Math.floor(source.length * fraction);
  const model = buildDifferenceModel(source.slice(0, cut));
  const heldout = source.slice(cut);
  assert.ok(heldout.length > 6000);
  const random = random32(seed);
  const actual = score(model, original);
  const counts = {unigram: 0, bigram: 0};
  const totals = {unigram: 0, bigram: 0};
  const squares = {unigram: 0, bigram: 0};
  const minima = {unigram: Infinity, bigram: Infinity};
  const length = original.length;
  for (let sample = 0; sample < samples; sample++) {
    const limit = heldout.length - length;
    const first = Math.floor(random() * limit);
    let second = Math.floor(random() * limit);
    while (Math.abs(first - second) < length + 100) {
      second = Math.floor(random() * limit);
    }
    const pair = heldout.slice(first, first + length).map(
      (value, i) => mod29(value - heldout[second + i]));
    const result = score(model, pair);
    for (const register of ['unigram', 'bigram']) {
      const value = result[register];
      counts[register] += Number(value <= actual[register]);
      totals[register] += value;
      squares[register] += value * value;
      minima[register] = Math.min(minima[register], value);
    }
  }

  // A positive plant checks the actual key-cancellation relation with every
  // one of 262 arbitrary per-position keys, not just a fitted fixed shift.
  const pad = Array.from({length}, () => Math.floor(random() * MOD));
  const plainA = heldout.slice(1000, 1000 + length);
  const plainB = heldout.slice(3000, 3000 + length);
  const encryptedA = plainA.map((value, i) => mod29(value + pad[i]));
  const encryptedB = plainB.map((value, i) => mod29(value + pad[i]));
  assert.deepEqual(difference(encryptedA, encryptedB),
    difference(plainA, plainB));

  const mean = {};
  const sd = {};
  for (const register of ['unigram', 'bigram']) {
    mean[register] = totals[register] / samples;
    sd[register] = Math.sqrt(squares[register] / samples -
      mean[register] * mean[register]);
  }
  return {
    name, sourceRunes: source.length, training: cut,
    heldout: heldout.length, seed: '0x' + (seed >>> 0).toString(16),
    samples, original: actual, nativeMean: mean, nativeSd: sd,
    nativeMin: minima, nativeAtOrBelowOriginal: counts,
    plusOneLowerTail: {
      unigram: (counts.unigram + 1) / (samples + 1),
      bigram: (counts.bigram + 1) / (samples + 1)
    },
    syntheticSharedPadRecovered: length
  };
}

/** @returns {object} */
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const p0 = corpus.pages.find(p => p.page === 0);
  const p29 = corpus.pages.find(p => p.page === 29);
  assert.equal(p0.indices.length, 262);
  assert.equal(p29.indices.length, 277);
  const eligible = corpus.pages.filter(p => p.status === 'unsolved');
  assert.equal(eligible.length, 55);
  assert.equal(eligible.filter(p => p.indices.length === 262).length, 1);
  assert.equal(eligible.filter(p => p.indices.length === 277).length, 1);
  const original = difference(p0.indices, p29.indices.slice(0, 262));
  const histogram = Array(MOD).fill(0);
  for (const v of original) histogram[v]++;
  assert.equal(histogram[0], 12);
  const dictionary = new Map(corpus.translit.map((s, i) => [s, i]));
  const english = englishGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8'),
    dictionary);
  const latin = latinGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/latin-vulgate-gp-wholewords.txt'), 'utf8'));
  assert.equal(english.length, 217644);
  assert.equal(latin.length, 204802);
  return {
    status: 'conditional negative, no unknown original plaintext recovered',
    premise: 'same arbitrary GP29 additive key at p0/p29 offsets 0..261',
    clue: '2014 music 277.159s long, duplicated noise delayed 262.122608s',
    original: {p0Runes: 262, p29Runes: 277,
      differences: 262, equalAtSameOffset: histogram[0], histogram},
    controls: [
      evaluate('Shakespeare GP', english, 0.52, 0xa213c14a, 12000, original),
      evaluate('Latin Vulgate GP', latin, 0.54, 0x1a71a277, 10000, original)
    ]
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, englishGP, latinGP, buildDifferenceModel, score};
