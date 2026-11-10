'use strict';

/**
 * Apply the exact ciphertext-doublet key-rejection transducer to the
 * historically sourced 2012 P.S. modular-squaring key family.
 *
 * A known key is necessary but may not have an aligned key pointer after
 * the soft no-repeat filter. This test marginalizes those hidden positions
 * using the existing exact held-plaintext keyskip transducer.
 *
 * Run: node sims/ps2012_modsquare_keyskip.cjs
 * @module ps2012_modsquare_keyskip
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {N, pad} = require('./ps2012_modsquare_pad.cjs');
const {logLikelihood, encrypt} = require('./keyskip_transducer.cjs');
const {encode, random32} = require('./orbit_phase_vote_recovery.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const observedPages = [0,7,23,28,42,53].map(page =>
  corpus.pages.find(x => x.page === page));
const modes = ['full-residue', 'low-byte', 'five-bit-big', 'five-bit-little'];
const seeds = [3301n, 1033n, 2012n, 2014n, 167n, 761n];
const inverseSigma = Array.from({length:29}, (_, i) => i);
const rejectRepeat = 0.81;
const maxTotalSkips = 32;
const maxSkippedPerOutput = 3;
const maxKeyLength = Math.max(...observedPages.map(x => x.indices.length)) +
  maxTotalSkips + maxSkippedPerOutput + 2;

function textGP(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode).filter(Boolean).flat();
}

const shakespeare = fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const gibran = fs.readFileSync(path.join(root,
  'resources/control/gibran_prophet_58585.txt'), 'utf8');
const training = textGP(shakespeare);
const q = new Array(29).fill(0.5);
for (const symbol of training) q[symbol]++;
const count = q.reduce((a, b) => a + b);
for (let i = 0; i < 29; i++) q[i] /= count;

/**
 * @param {bigint} seed
 * @param {string} mode
 * @param {number} sign
 * @returns {number[]}
 */
function key(seed, mode, sign) {
  const stream = pad(seed, mode), result = [];
  for (let i = 0; i < maxKeyLength; i++) {
    const digit = stream.next().value;
    result.push(((sign * digit) % 29 + 29) % 29);
  }
  return result;
}

/**
 * @param {number[][]} pageRunes
 * @param {number[]} candidateKey
 * @returns {number}
 */
function score(pageRunes, candidateKey) {
  return pageRunes.reduce((total, ciphertext) =>
    total + logLikelihood(ciphertext, {
      key:candidateKey, q, inverseSigma, rejectRepeat,
      maxTotalSkips, maxSkippedPerOutput
    }), 0);
}

/** @param {number[][]} pageRunes */
function screen(pageRunes) {
  const candidates = [];
  for (const seed of seeds)
    for (const mode of modes)
      for (const sign of [-1,1])
        candidates.push({seed:String(seed), mode, sign,
          logLikelihood:score(pageRunes, key(seed, mode, sign))});
  candidates.sort((a,b) => b.logLikelihood - a.logLikelihood);
  return candidates;
}

/**
 * Plant the independent Gibran GP plaintext under a real no-repeat
 * rejection cipher with the historically given source stream.
 * @returns {{pages:number[][],rejections:number,plaintextRunes:number}}
 */
function plant() {
  const source = textGP(gibran);
  const random32draw = random32(0x473301);
  const random = () => random32draw() / 4294967296;
  const publicKey = key(3301n, 'five-bit-big', 1);
  let index = 0, rejections = 0;
  const pages = observedPages.map(page => {
    const plaintext = source.slice(index, index + page.indices.length);
    index += page.indices.length;
    assert.equal(plaintext.length, page.indices.length);
    const cipher = encrypt(plaintext, publicKey, inverseSigma, random,
      {rejectRepeat});
    assert.ok(cipher.skips <= maxTotalSkips,
      'Positive control exceeds hidden-key-pointer search allowance');
    rejections += cipher.skips;
    return cipher.cipher;
  });
  return {pages, rejections, plaintextRunes:index};
}

/**
 * Fixed-mode wrong-key benchmark using 150 random seed values, keeping
 * every actual ciphertext and output family setting unchanged.
 * @param {number[][]} observed
 * @param {number} anchor
 */
function randomSeedControl(observed, anchor) {
  const draw = random32(0x478a3921);
  const nullScores = [];
  for (let sample = 0; sample < 150; sample++) {
    const seed = BigInt(draw()) + 50000n;
    nullScores.push(score(observed, key(seed, 'full-residue', -1)));
  }
  const mean = nullScores.reduce((sum, v) => sum + v, 0) /
    nullScores.length;
  const sd = Math.sqrt(nullScores.reduce((sum, v) =>
    sum + (v - mean) ** 2, 0) / nullScores.length);
  return {
    replicates:nullScores.length, mean, sd,
    exceedances:nullScores.filter(x => x >= anchor).length,
    fixedRuleEmpiricalUpperP:(nullScores.filter(x => x >= anchor).length+1) /
      (nullScores.length+1),
    conservativeBoundAfter48WaySearch:Math.min(1, 48 *
      (nullScores.filter(x => x >= anchor).length+1) /
      (nullScores.length+1))
  };
}

function run() {
  assert.equal(N.toString(2).length, 432);
  const observed = observedPages.map(page => page.indices);
  assert.equal(observed.reduce((n,p) => n+p.length, 0), 1403);
  const actualCandidates = screen(observed);
  const planted = plant();
  const positiveCandidates = screen(planted.pages);
  assert.equal(positiveCandidates[0].seed, '3301');
  assert.equal(positiveCandidates[0].mode, 'five-bit-big');
  assert.equal(positiveCandidates[0].sign, -1);
  assert.equal(actualCandidates.length, 48);
  const anchor = actualCandidates.find(c => c.seed === '2012' &&
    c.mode === 'full-residue' && c.sign === -1);
  const control = randomSeedControl(observed, anchor.logLikelihood);
  return {
    hypothesis:'2012 P.S. modular-squaring keystream, 81% exact no-repeat key rejection',
    originalPages:observedPages.map(x=>x.page),
    originalRunes:1403, keyModels:actualCandidates.length,
    bestActual:actualCandidates.slice(0, 8),
    fixedModelControl:control,
    positiveControl:{source:'independent Gibran GP plaintext',
      ...planted, pages:undefined,
      winningCorrectModel:positiveCandidates[0],
      nextIncorrectModel:positiveCandidates[1]},
    scope:'Original output does not identify a key; source-motivated six seeds, four byte/bit extraction methods and two signs, page reset, fixed identity outer alphabet.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {textGP,key,score,screen,plant,randomSeedControl,run};
