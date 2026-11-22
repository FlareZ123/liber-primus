'use strict';

/**
 * SFT: search the original unsolved LP2 for short native-GP English islands
 * under source-historically simple GP29 affine or first-difference inverses.
 *
 * node sims/lp2_local_plaintext_islands_sft.cjs
 *
 * Train a GP29 trigram model only on the first 195,000 characters of an
 * independently pinned Shakespeare corpus. Hold out the remaining text.
 *
 * Search every valid physical-page window of 32, 64 and 96 runes, under
 *   P_i = (a*C_i+b) mod29
 *   P_i = (a*(C_i-C_(i-1))+b) mod29
 * for a in {+1,-1}, b in 0..28. No source word or key fitted.
 *
 * This is a limited direct-English plaintext-island test, NOT a full LP2
 * cipher exclusion. The matched null preserves the suppressed adjacent
 * doublets; the positive plant checks exact GP plaintext recovery.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(
  path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');

const M = 29;
const LENGTHS = [32, 64, 96];
const PAGES = gp.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((n, page) => n + page.indices.length, 0), 12956);
assert.equal(reference.length, 300000);
const TOKENS = gp.translit.map((s, i) => [s, i])
  .sort((a, b) => b[0].length - a[0].length);

/**
 * GP29 romanization as used by the project's existing solved-source controls.
 * @param {string} text
 * @returns {number[]}
 */
function spell(text) {
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW')
      .replace(/[KVZ]/g, char => ({K: 'C', V: 'U', Z: 'S'})[char]);
    const fragment = [];
    for (let i = 0; i < word.length;) {
      const token = TOKENS.find(([grapheme]) => word.startsWith(grapheme, i));
      if (!token) {
        fragment.length = 0;
        break;
      }
      fragment.push(token[1]);
      i += token[0].length;
    }
    result.push(...fragment);
  }
  return result;
}

/**
 * Per-next-symbol conditional trigram probabilities with Dirichlet 0.1
 * smoothing. Each context has 29 outcomes and 2.9 pseudocounts.
 * @param {number[]} train
 * @returns {Float64Array}
 */
function model(train) {
  const triplets = new Uint32Array(M ** 3);
  const pairs = new Uint32Array(M ** 2);
  const weights = new Float64Array(M ** 3);
  for (let i = 2; i < train.length; i++) {
    const pair = train[i - 2] * M + train[i - 1];
    pairs[pair]++;
    triplets[pair * M + train[i]]++;
  }
  for (let i = 0; i < weights.length; i++) {
    weights[i] = Math.log(
      (triplets[i] + 0.1) / (pairs[Math.floor(i / M)] + 2.9));
  }
  return weights;
}

/**
 * @param {ArrayLike<number>} array
 * @param {number} offset
 * @param {number} length
 * @param {Float64Array} weights
 * @returns {number}
 */
function score(array, offset, length, weights) {
  let total = 0;
  for (let i = offset + 2; i < offset + length; i++) {
    total += weights[array[i - 2] * M * M + array[i - 1] * M + array[i]];
  }
  return total / (length - 2);
}

/**
 * Direct original-ink page-local scan, exhaustive over all shifts, signs,
 * differences, and all contiguous starts for three predeclared lengths.
 * @param {Array<{page: number,indices: number[]}>} pages
 * @param {Float64Array} weights
 * @returns {Record<number,{value:number,page:number,start:number,mode:string,sign:number,shift:number}>}
 */
function scan(pages, weights) {
  const winners = Object.fromEntries(LENGTHS.map(length =>
    [length, {value: -Infinity, page: -1, start: -1,
      mode: 'none', sign: 0, shift: 0}]));

  for (const page of pages) {
    const source = page.indices;
    for (const mode of ['direct', 'difference']) {
      for (const sign of [1, -1]) {
        for (let shift = 0; shift < M; shift++) {
          const decoded = source.map((v, i) => {
            const raw = mode === 'difference' && i > 0
              ? (v - source[i - 1] + M) % M : v;
            return ((sign * raw + shift) % M + M) % M;
          });
          const sums = new Float64Array(decoded.length + 1);
          for (let i = 2; i < decoded.length; i++) {
            sums[i + 1] = sums[i] +
              weights[decoded[i - 2] * M * M +
                decoded[i - 1] * M + decoded[i]];
          }
          for (const length of LENGTHS) {
            for (let start = 0; start + length <= decoded.length; start++) {
              const value = (sums[start + length] - sums[start + 2]) /
                (length - 2);
              if (value > winners[length].value) {
                winners[length] = {
                  value, page: page.page, start, mode, sign, shift
                };
              }
            }
          }
        }
      }
    }
  }
  return winners;
}

/**
 * @param {number[]} input
 * @param {Float64Array} weights
 * @returns {Record<number,{sampleSize:number,min:number,p01:number,p05:number,median:number}>}
 */
function heldoutStatistics(input, weights) {
  const output = {};
  for (const length of LENGTHS) {
    const scores = [];
    for (let i = 0; i + length <= input.length; i++) {
      scores.push(score(input, i, length, weights));
    }
    scores.sort((a, b) => a - b);
    output[length] = {
      sampleSize: scores.length, min: scores[0],
      p01: scores[Math.floor(scores.length * 0.01)],
      p05: scores[Math.floor(scores.length * 0.05)],
      median: scores[Math.floor(scores.length * 0.5)]
    };
  }
  return output;
}

/**
 * Deterministic xorshift32 for reproducible source-shaped nulls.
 * @param {number} initial
 */
function generator(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * A GP29 uniform sequence with the empirically observed low doublet rate.
 * @param {()=>number} rng
 * @returns {Array<{page:number,indices:number[]}>}
 */
function matchedNull(rng) {
  return PAGES.map(page => {
    const indices = [];
    for (let i = 0; i < page.indices.length; i++) {
      let value = Math.floor(rng() * M);
      if (i > 0 && rng() > 86 / 12901 && value === indices[i - 1]) {
        value = (value + 1 + Math.floor(rng() * 28)) % M;
      }
      indices.push(value);
    }
    return {page: page.page, indices};
  });
}

function run() {
  const train = spell(reference.slice(0, 195000));
  const test = spell(reference.slice(195000));
  assert.equal(train.length, 142272);
  assert.equal(test.length, 76528);
  const weights = model(train);
  const original = scan(PAGES, weights);
  const expected = {
    32: -3.293400984773393,
    64: -3.6957813530986434,
    96: -3.833667900089762
  };
  for (const length of LENGTHS) {
    assert(Math.abs(original[length].value - expected[length]) < 1e-9);
  }
  const heldout = heldoutStatistics(test, weights);
  assert(heldout[64].min > original[64].value);
  assert(heldout[96].min > original[96].value);

  const rng = generator(0x3301);
  const nulls = Array.from({length: 3}, () => scan(matchedNull(rng), weights));

  // Four fixed-source control keys leave the 64-symbol insertion detectable.
  const page = PAGES.find(item => item.page === 39);
  assert(page);
  const planted = PAGES.map(item =>
    item.page === 39 ? {...item, indices: item.indices.slice()} : item);
  const plantedPage = planted.find(item => item.page === 39);
  assert(plantedPage);
  const payload = test.slice(8000, 8064);
  for (let i = 0; i < payload.length; i++) {
    plantedPage.indices[149 + i] = (11 - payload[i] + M) % M;
    assert.equal(
      (-plantedPage.indices[149 + i] + 11 + M) % M, payload[i]);
  }
  const control = scan(planted, weights);
  assert(control[64].value > original[64].value);
  assert.equal(control[64].page, 39);
  // Trigram windows omit their first two positions; the adjacent 64-window
  // may score higher even though the full planted source begins at 149.
  assert(control[64].start >= 149 && control[64].start <= 151);
  assert.equal(control[64].mode, 'direct');
  assert.equal(control[64].sign, -1);
  assert.equal(control[64].shift, 11);

  const power = Object.fromEntries(LENGTHS.map(length => {
    const step = Math.max(1, Math.floor((test.length - length) / 100));
    let successes = 0;
    for (let i = 0; i < 100; i++) {
      if (score(test, i * step, length, weights) >
          original[length].value) successes++;
    }
    return [length, successes];
  }));
  assert.deepEqual(power, {32: 100, 64: 100, 96: 100});

  const result = {
    source: 'original unsolved LP2 physical pages 0..55, 12956 GP29 runes',
    scope: '116 fixed per-page affine/difference variants; all starts; L=32,64,96',
    trainingGpRunes: train.length, heldoutGpRunes: test.length,
    original, heldout, power100Sample: power,
    matchedSuppressedDoubletNulls: nulls.map(item =>
      Object.fromEntries(LENGTHS.map(length => [length, item[length].value]))),
    plantedRecovered: {page: control[64].page, start: control[64].start,
      mode: control[64].mode, sign: control[64].sign,
      shift: control[64].shift, recoveredRunes: payload.length},
    inference: 'No native GP-English plaintext island meeting this exact length/transform model; no LP2 key or genuine plaintext identified.'
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {spell, model, score, scan, matchedNull, run};
