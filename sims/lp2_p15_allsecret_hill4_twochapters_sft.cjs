'use strict';

/**
 * SFT: all-secret, all-four-phase Hill-4 gate for authentic LP2 p16–p21 and
 * pretable floral p40–p48, selected by LP2 p15's genuine 4x4 number square.
 *
 * Windows 11 / Node.js 22, read-only:
 *   node sims/lp2_p15_allsecret_hill4_twochapters_sft.cjs
 *
 * Every 4x4 invertible GP29 matrix H has four nonzero inverse rows.
 * Each plaintext coordinate is therefore some linear projection v·C mod29.
 * Multiplication of v by any nonzero scalar only relabels the histogram, so
 * all (29^4-1)/28=25260 projective directions exhaust *every* unknown H.
 * All four starting offsets are tested per corridor, with original heldout.
 * This is not a search for secret keys or selected plaintext cribs.
 *
 * The full-rank original p15 4x4 Fibonacci-prime square is used only for a
 * positive synthetic Hill plant. The original test exhausts all secret keys.
 *
 * Limits: standard nonfeedback Hill-4, one matrix over each entire corridor,
 * native English GP29 alphabet. No conclusion about transformed/plaintext-
 * uniform, block rewriting, varying matrices or nonce-dependent ciphers.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {readSquare} = require('./fibonacci_prime_spiral.cjs');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const M = 29;
const D = 4;
const mod = value => ((value % M) + M) % M;

/** @param {number[][]} source @returns {number} */
function rankMatrix(source) {
  const matrix = source.map(row => row.map(mod));
  let rank = 0;
  for (let column = 0; column < D; column++) {
    let pivot = rank;
    while (pivot < D && matrix[pivot][column] === 0) pivot++;
    if (pivot === D) continue;
    [matrix[pivot], matrix[rank]] = [matrix[rank], matrix[pivot]];
    let inverse = 1;
    while (mod(matrix[rank][column] * inverse) !== 1) inverse++;
    for (let j = column; j < D; j++) {
      matrix[rank][j] = mod(matrix[rank][j] * inverse);
    }
    for (let row = 0; row < D; row++) {
      if (row === rank) continue;
      const factor = matrix[row][column];
      for (let j = column; j < D; j++) {
        matrix[row][j] = mod(matrix[row][j] - factor * matrix[rank][j]);
      }
    }
    rank++;
  }
  return rank;
}

/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const map = new Map(corpus.translit.map((r, i) => [r, i]));
  const out = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let token of (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || [])) {
      if (token === 'ING') token = 'NG';
      out.push(map.get(token));
    }
  }
  assert(out.every(x => Number.isInteger(x) && x >= 0 && x < M));
  return out;
}

/**
 * @param {number[]} plain
 * @param {number[][]} key
 * @returns {number[]}
 */
function encodeHill(plain, key) {
  assert.equal(plain.length % D, 0);
  const out = [];
  for (let i = 0; i < plain.length; i += D) {
    const block = plain.slice(i, i + D);
    for (const row of key) {
      out.push(mod(row.reduce((s, a, j) => s + a * block[j], 0)));
    }
  }
  return out;
}

/**
 * @typedef {{v:number[],score:number,train:number,hold:number}} Candidate
 */
/**
 * @param {number[]} original
 * @param {number} start
 * @param {number} training
 * @returns {{phase:number,blocks:number,trainBlocks:number,heldBlocks:number,
 *  directions:number,top:Candidate[]}}
 */
function scan(original, start, training) {
  const blocks = Math.floor((original.length - start) / D);
  const held = blocks - training;
  assert(held > 2);
  const transpose = new Uint8Array(blocks * D);
  for (let i = 0; i < blocks; i++) {
    for (let j = 0; j < D; j++) {
      transpose[j * blocks + i] = original[start + D * i + j];
    }
  }
  const hist = new Uint16Array(M);
  /** @type {Candidate[]} */
  const best = [];
  const v = [0, 0, 0, 0];
  let directions = 0;
  for (let first = 0; first < D; first++) {
    v.fill(0);
    v[first] = 1;
    for (let key = 0; key < M ** (D - first - 1); key++) {
      let quotient = key;
      for (let j = first + 1; j < D; j++) {
        v[j] = quotient % M;
        quotient = Math.floor(quotient / M);
      }
      hist.fill(0);
      for (let i = 0; i < training; i++) {
        let dot = 0;
        for (let j = 0; j < D; j++) {
          dot += v[j] * transpose[j * blocks + i];
        }
        hist[dot % M]++;
      }
      let score = 0;
      for (let k = 0; k < M; k++) score += hist[k] * (hist[k] - 1);
      if (best.length < 8 || score > best[best.length - 1].score) {
        best.push({v: v.slice(), score,
          train: score / (training * (training - 1)), hold: 0});
        best.sort((a, b) => b.score - a.score);
        best.length = Math.min(8, best.length);
      }
      directions++;
    }
  }
  for (const candidate of best) {
    hist.fill(0);
    for (let i = training; i < blocks; i++) {
      let dot = 0;
      for (let j = 0; j < D; j++) {
        dot += candidate.v[j] * transpose[j * blocks + i];
      }
      hist[dot % M]++;
    }
    let score = 0;
    for (let k = 0; k < M; k++) score += hist[k] * (hist[k] - 1);
    candidate.hold = score / (held * (held - 1));
  }
  return {phase: start, blocks, trainBlocks: training,
    heldBlocks: held, directions, top: best};
}

const H = readSquare();
assert.equal(rankMatrix(H), D);
const source = encodeNative(shakespeare);
assert.equal(source.length, 217644);

const corridors = [
  {name: 'unillustrated p16–p21', first: 16, last: 21,
    expected: 1613, training: 280},
  {name: 'pretable floral p40–p48', first: 40, last: 48,
    expected: 2408, training: 400}
];

const results = [];
for (const section of corridors) {
  const original = corpus.pages
    .filter(p => p.page >= section.first && p.page <= section.last)
    .flatMap(p => p.indices);
  assert.equal(original.length, section.expected);
  const real = [0, 1, 2, 3].map(phase =>
    scan(original, phase, section.training));
  assert(real.every(s => s.directions === 25260));
  assert(real.every(s => s.top[0].train < 0.041));
  assert(real.every(s => s.top.slice(0, 4).every(x => x.hold < 0.043)));

  const aligned = Math.floor(original.length / D) * D;
  const sourceNative = source.slice(1300, 1300 + aligned);
  const positive = scan(encodeHill(sourceNative, H), 0, section.training);
  assert.equal(positive.directions, 25260);
  assert(positive.top.slice(0, 4).every(x => x.train > 0.058));
  assert(positive.top.slice(0, 4).every(x => x.hold > 0.055));

  results.push({section: section.name, originalRunes: original.length,
    allFourPhases: real.map(s => ({
      phase: s.phase, blocks: s.blocks, trainBlocks: s.trainBlocks,
      heldBlocks: s.heldBlocks, totalDirections: s.directions,
      strongest: s.top[0], strongestFour: s.top.slice(0, 4)
    })),
    p15MatrixPositive: {sourceNativeRunes: aligned,
      confirmedInvertibleMatrixRank: rankMatrix(H),
      topFour: positive.top.slice(0, 4)}
  });
}

assert.deepEqual(results[0].allFourPhases[0].strongest.v, [1, 1, 21, 7]);
assert.equal(results[0].allFourPhases[0].strongest.score, 3138);
assert.deepEqual(results[1].allFourPhases[0].strongest.v, [1, 4, 26, 5]);
assert.equal(results[1].allFourPhases[0].strongest.score, 6156);
console.log(JSON.stringify({
  status: 'PASS', sourceVisualKey: 'p15 4x4 Fibonacci prime square',
  sourceKeyDeterminantMod29: 17, exhaustiveProjectiveKeyspace: 25260,
  results, conclusion: 'No stable four-rune inverse projection with native-GP language skew at any original block origin; uniform unknown Hill-4 is unsupported on both chapters.'
}, null, 2));
