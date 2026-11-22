'use strict';

/**
 * SFT: secret-key-independent original GP29 Hill-5 test, p40–p53 floral corridor.
 * Run on Windows 11 with Node 22 from repo root:
 *   node sims/lp2_flower_allsecret_hill5_projection_sft.cjs
 *
 * If C_block = H * P_block (mod 29) for ANY single invertible unknown H,
 * each component of P is a nonzero linear projection of a ciphertext block.
 * Multiplying a projection by any nonzero scalar permutes GP letters and
 * therefore preserves its unigram collision statistic.
 *
 * Search all (29^5-1)/28 = 732541 projective directions with a canonical
 * first nonzero coefficient 1; freeze a 400-block training region, then
 * apply the twelve highest training directions to the untouched 201-block
 * original suffix. This is an exhaustive test over all unknown key matrices.
 *
 * A 601-block Shakespeare-GP source-native plant is encrypted under a fixed
 * full-rank dense 5x5 Hill matrix, then recovered by the identical scanner.
 * Only the five coefficients of the projected ciphertext are fitted, no
 * original plaintext words are selected or guessed.
 *
 * Scope: one uninterrupted *zero-offset* five-rune block clock across
 * physical LP2 pages 40..53. This does not exclude source-dependent page
 * resets, nonzero block phases, post-encryption rewriting, nonnative
 * plaintext, or time-varying 5x5 keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const reference = read('resources/control/shakespeare_first300k.txt');

const P = 29;
const DIM = 5;
const TRAIN = 400;
const LIMIT = 12;
const mod = n => ((n % P) + P) % P;
/** @type {number[][]} */
const H = [
  [22, 6, 21, 23, 10],
  [28, 26, 11, 21, 23],
  [6, 13, 8, 22, 8],
  [10, 28, 9, 3, 13],
  [12, 16, 22, 18, 22]
];

/** @param {number[][]} input @returns {number} */
function matrixRank(input) {
  const matrix = input.map(row => row.map(mod));
  let rank = 0;
  for (let col = 0; col < DIM; col++) {
    let pivot = rank;
    while (pivot < DIM && !matrix[pivot][col]) pivot++;
    if (pivot === DIM) continue;
    [matrix[pivot], matrix[rank]] = [matrix[rank], matrix[pivot]];
    let reciprocal = 1;
    while (mod(matrix[rank][col] * reciprocal) !== 1) reciprocal++;
    for (let j = col; j < DIM; j++) {
      matrix[rank][j] = mod(matrix[rank][j] * reciprocal);
    }
    for (let row = 0; row < DIM; row++) {
      if (row === rank) continue;
      const factor = matrix[row][col];
      for (let j = col; j < DIM; j++) {
        matrix[row][j] = mod(matrix[row][j] - factor * matrix[rank][j]);
      }
    }
    rank++;
  }
  return rank;
}

/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const symbols = new Map(corpus.translit.map((r, i) => [r, i]));
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  const out = [];
  for (let word of words) {
    word = word.replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    const tokens = word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || [];
    for (let token of tokens) {
      if (token === 'ING') token = 'NG';
      out.push(symbols.get(token));
    }
  }
  assert(out.every(value => Number.isInteger(value) && value >= 0 && value < 29));
  return out;
}

/** @param {number[]} plain @returns {number[]} */
function encryptHill(plain) {
  assert.equal(plain.length % DIM, 0);
  const cipher = [];
  for (let i = 0; i < plain.length; i += DIM) {
    const word = plain.slice(i, i + DIM);
    for (let row = 0; row < DIM; row++) {
      cipher.push(mod(H[row].reduce((sum, h, j) => sum + h * word[j], 0)));
    }
  }
  return cipher;
}

/**
 * @typedef {{v: number[], sum: number, train: number, hold: number}} Candidate
 */
/**
 * Exhaustive 5D GP29 projective linear-projection scanner.
 * Score = sum(count*(count-1))/(N*(N-1)); invariant under multiplication by
 * any nonzero scalar mod 29 and therefore tests *all* possible inverse rows.
 *
 * @param {number[]} values
 * @param {number} train
 * @param {number} retain
 * @returns {{blocks:number,holdBlocks:number,directions:number,seconds:number,top:Candidate[]}}
 */
function scan(values, train, retain) {
  assert.equal(values.length % DIM, 0);
  const blocks = values.length / DIM;
  const held = blocks - train;
  assert(held >= 2 && train >= 2);
  const channel = new Uint8Array(blocks * DIM);
  for (let i = 0; i < blocks; i++) {
    for (let j = 0; j < DIM; j++) channel[j * blocks + i] = values[DIM * i + j];
  }
  const hist = new Uint16Array(P);
  /** @type {Candidate[]} */
  const top = [];
  const v = [0, 0, 0, 0, 0];
  let directions = 0;
  const t0 = Date.now();
  function scoreProjection() {
    hist.fill(0);
    for (let i = 0; i < train; i++) {
      let total = 0;
      for (let j = 0; j < DIM; j++) {
        total += v[j] * channel[j * blocks + i];
      }
      hist[total % P]++;
    }
    let sum = 0;
    for (let i = 0; i < P; i++) sum += hist[i] * (hist[i] - 1);
    if (top.length < retain || sum > top[top.length - 1].sum) {
      top.push({v: v.slice(), sum,
        train: sum / (train * (train - 1)), hold: 0});
      top.sort((a, b) => b.sum - a.sum);
      top.length = Math.min(retain, top.length);
    }
    directions++;
  }
  for (let first = 0; first < DIM; first++) {
    v.fill(0);
    v[first] = 1;
    const combinations = P ** (DIM - first - 1);
    for (let index = 0; index < combinations; index++) {
      let quotient = index;
      for (let j = first + 1; j < DIM; j++) {
        v[j] = quotient % P;
        quotient = Math.floor(quotient / P);
      }
      scoreProjection();
    }
  }
  for (const candidate of top) {
    hist.fill(0);
    for (let i = train; i < blocks; i++) {
      let total = 0;
      for (let j = 0; j < DIM; j++) {
        total += candidate.v[j] * channel[j * blocks + i];
      }
      hist[total % P]++;
    }
    let sum = 0;
    for (let i = 0; i < P; i++) sum += hist[i] * (hist[i] - 1);
    candidate.hold = sum / (held * (held - 1));
  }
  return {blocks, holdBlocks: held, directions,
    seconds: (Date.now() - t0) / 1000, top};
}

const originalFull = corpus.pages
  .filter(p => p.page >= 40 && p.page <= 53).flatMap(p => p.indices);
assert.equal(originalFull.length, 3008);
const blocks = Math.floor(originalFull.length / DIM);
assert.equal(blocks, 601);
const original = originalFull.slice(0, blocks * DIM);
const native = encodeNative(reference);
assert.equal(native.length, 217644);
const plant = native.slice(1300, 1300 + original.length);
assert.equal(plant.length, original.length);
assert.equal(matrixRank(H), DIM);
const encryptedPlant = encryptHill(plant);

const actual = scan(original, TRAIN, LIMIT);
const positive = scan(encryptedPlant, TRAIN, LIMIT);
assert.equal(actual.directions, 732541);
assert.equal(positive.directions, actual.directions);
assert.deepEqual(actual.top[0].v, [1, 13, 27, 26, 4]);
assert.equal(actual.top[0].sum, 6228);
assert.deepEqual(positive.top[0].v, [1, 3, 1, 24, 19]);
assert.equal(positive.top[0].sum, 11008);
assert(positive.top[4].train > 0.058);
assert(actual.top[0].train < 0.04);
assert(positive.top.slice(0, 5).every(p => p.hold > 0.055));
assert(actual.top.slice(0, 5).every(p => p.hold < 0.04));

console.log(JSON.stringify({
  status: 'PASS', source: 'original LP2 p40–p53',
  originalRunes: originalFull.length,
  testedOriginalRunes: original.length, omittedTrailingRunes: 3,
  train: TRAIN, held: actual.holdBlocks,
  sourceNativePlant: 'Shakespeare GP29, 601 blocks, fixed dense full-rank matrix',
  matrixRank: matrixRank(H), original: actual, planted: positive,
  verdict: 'No persistent nonuniform full-rank Hill-5 inverse row at zero block phase.'
}, null, 2));
