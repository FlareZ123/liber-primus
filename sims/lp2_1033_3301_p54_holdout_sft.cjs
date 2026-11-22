'use strict';
/**
 * Source-printed 1033x3301 all-initial-state chapter key: p54 train / p55 blind.
 * Node.js 22, CommonJS, standard library, run from repository root.
 * Exact GP29 F-skip Viterbi with a unigram prior built only from known LP1.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const known = fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt', 'utf8');
const M = 1033 * 3301;
const cipher = corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(cipher.length, 308);
const words = (known.match(/^[A-Z][A-Z ,.'\-]*$/gm) || [])
  .join(' ').match(/[A-Z]+/g) || [];
assert.equal(words.length, 511);
const dictionary = new Map(corpus.translit.map((s, i) => [s, i]));
dictionary.set('ING', dictionary.get('NG'));
const patterns = [...dictionary.keys()].sort((a, b) => b.length - a.length);
const counts = new Float64Array(29).fill(1);
for (const raw of words) {
  const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  for (let i = 0; i < word.length;) {
    const token = patterns.find(p => word.startsWith(p, i));
    assert(token, 'Unsupported GP token in ' + word.slice(i));
    counts[dictionary.get(token)]++;
    i += token.length;
  }
}
const total = counts.reduce((a, b) => a + b);
assert.equal(total, 2191);
const logP = Array.from(counts, count => Math.log(count / total));

/**
 * All initial states at p54 training; a single p54-selected state at p55.
 * The text prior is independent of unknown GP plaintext.
 * @param {'delta'|'direct'} mode
 * @param {1|-1} sign
 * @param {number} first
 * @param {number} last
 * @param {boolean} allInitialStates
 * @param {number} initialState
 * @param {number[]} [data]
 * @returns {{score:number,state:number,count:number}}
 */
function viterbi(mode, sign, first, last, allInitialStates, initialState, data = cipher) {
  let states = new Uint32Array(M), other = new Uint32Array(M);
  let scores = new Float64Array(M), nextScores = new Float64Array(M);
  const seen = new Uint32Array(M);
  let length = allInitialStates ? M : 1;
  if (allInitialStates) for (let i = 0; i < M; i++) states[i] = i;
  else states[0] = initialState;
  for (let i = first; i < last; i++) {
    if (mode === 'delta' && i === 0) continue;
    const q = mode === 'delta'
      ? (data[i] - data[i - 1] + 29) % 29 : data[i];
    const stamp = i + 1;
    let following = 0;
    for (let j = 0; j < length; j++) {
      const x = states[j];
      const residue = x % 29;
      const k = sign === 1 ? residue : (29 - residue) % 29;
      const prior = scores[x];
      if (q === 0) {
        const proposed = prior + logP[0];
        if (seen[x] !== stamp) {
          seen[x] = stamp;
          other[following++] = x;
          nextScores[x] = proposed;
        } else nextScores[x] = Math.max(nextScores[x], proposed);
      }
      if (q !== k) {
        const y = (x * x) % M;
        const p = (q - k + 29) % 29;
        const proposed = prior + logP[p];
        if (seen[y] !== stamp) {
          seen[y] = stamp;
          other[following++] = y;
          nextScores[y] = proposed;
        } else nextScores[y] = Math.max(nextScores[y], proposed);
      }
    }
    [states, other] = [other, states];
    [scores, nextScores] = [nextScores, scores];
    length = following;
    if (length === 0) break;
  }
  let bestScore = -Infinity, bestState = -1;
  for (let i = 0; i < length; i++) {
    const x = states[i];
    if (scores[x] > bestScore) {
      bestScore = scores[x];
      bestState = x;
    }
  }
  return {score: bestScore, state: bestState, count: length};
}

const outcomes = [];
for (const mode of ['delta', 'direct']) {
  for (const sign of [1, -1]) {
    const train = viterbi(mode, sign, 0, 232, true, 0);
    const heldout = viterbi(mode, sign, 232, 308, false, train.state);
    outcomes.push({mode, sign, train, heldout});
  }
}
// A true native-GP 308-cell plant, unknown seed 3299: all four decoders
// must independently recover its exact hidden p54->p55 state on training.
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
/**
 * @param {'delta'|'direct'} mode
 * @param {1|-1} sign
 * @returns {{cipher:number[],boundaryState:number}}
 */
function plantedCipher(mode, sign) {
  const plain = Array.from({length:mode === 'delta' ? 307 : 308},
    (_, i) => native[i % native.length]);
  let x = 3299, preceding = cipher[0], boundaryState = -1;
  const encoded = mode === 'delta' ? [preceding] : [];
  for (let i = 0; i < plain.length; i++) {
    if ((mode === 'delta' ? i + 1 : i) === 232) boundaryState = x;
    const p = plain[i];
    let delta = 0;
    if (p !== 0) {
      const r = x % 29;
      const k = sign === 1 ? r : (29 - r) % 29;
      delta = (p + k) % 29;
      x = (x * x) % M;
    }
    const out = mode === 'delta' ? (preceding + delta) % 29 : delta;
    encoded.push(out);
    preceding = out;
  }
  assert.equal(encoded.length, 308);
  assert(boundaryState > 0);
  return {cipher: encoded, boundaryState};
}
const plantedControls = [];
for (const mode of ['delta', 'direct']) {
  for (const sign of [1, -1]) {
    const plant = plantedCipher(mode, sign);
    const fitted = viterbi(mode, sign, 0, 232, true, 0, plant.cipher);
    assert.equal(fitted.state, plant.boundaryState);
    assert.equal(plant.boundaryState, mode === 'delta' ? 2122059 : 749212);
    const continuation = viterbi(mode, sign, 232, 308, false, fitted.state, plant.cipher);
    assert(continuation.count > 0);
    plantedControls.push({mode, sign, trueBoundaryState:plant.boundaryState,
      independentlySelected: fitted.state, heldoutFeasible:true});
  }
}

const expected = [
  ['delta', 1, 3116091, 105, -915.0312788656956, 0],
  ['delta', -1, 461832, 123, -893.1263142880789, 1],
  ['direct', 1, 3382427, 238, -902.8474865449709, 0],
  ['direct', -1, 2377539, 223, -898.3798832477786, 0],
];
for (let i = 0; i < expected.length; i++) {
  const [mode, sign, state, count, score, heldoutCount] = expected[i];
  const actual = outcomes[i];
  assert.equal(actual.mode, mode);
  assert.equal(actual.sign, sign);
  assert.equal(actual.train.state, state);
  assert.equal(actual.train.count, count);
  assert(Math.abs(actual.train.score - score) < 1e-8);
  assert.equal(actual.heldout.count, heldoutCount);
}
const candidate = outcomes[1];
assert.equal(candidate.heldout.state, 1844712);
assert(Math.abs(candidate.heldout.score / 76 - (-4.0492437551151115)) < 1e-11);
const clear = corpus.pages[57].indices;
const clearScore = clear.reduce((acc, symbol) => acc + logP[symbol], 0) / clear.length;
assert(Math.abs(clearScore - (-2.899602870506984)) < 1e-11);
console.log(JSON.stringify({
  source: 'LP2 physical p54 232 rune training, original p55 76 rune withheld',
  prior: '2162 solved LP1 native-GP letter tokens + 29 Laplace pseudocounts',
  selectedByP54Only: 'delta, sign -',
  p55HeldoutLogScorePerRune: candidate.heldout.score / 76,
  independentClearP57LogScorePerRune: clearScore,
  cases: outcomes,
  plantedNativeGpControls: plantedControls
}, null, 2));
