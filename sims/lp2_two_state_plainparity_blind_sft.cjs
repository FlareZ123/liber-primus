'use strict';
/**
 * Director #873: exhaustive blind inference of a minimal two-state reversible
 * GP29 plaintext-driven transducer, with frozen original-chapter holdout.
 *
 * Original research hypothesis, NOT a known historical Cicada operation:
 *   C[i] = (P[i] + k[state]) mod 29
 *   state' = (state + 1 + (P[i] mod 2)) mod 2
 * State starts at zero at each visually marked chapter. Both state keys are
 * fixed across the whole book. 29^2 = 841 exact key pairs; no secret states,
 * free offsets, hidden rune relabeling, per-word resets, or GP symbol loss.
 *
 * Run from repository root: node sims/lp2_two_state_plainparity_blind_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sortedTokens = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** Convert independent English prose to solved-Cicada native GP29 runes.
 * @param {string} source @returns {number[]}
 */
function gp(source) {
  const words = source.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const match = sortedTokens.find((item) => word.startsWith(item.token, i));
      assert(match, 'Unknown GP29 token in ' + word);
      result.push(match.index);
      i += match.token.length;
    }
  }
  return result;
}
/** @param {number[]} input @param {number} k0 @param {number} k1
 * @returns {Uint8Array} */
function encode(input, k0, k1) {
  const result = new Uint8Array(input.length);
  let state = 0;
  for (let i = 0; i < input.length; i++) {
    const p = input[i];
    assert(p >= 0 && p < 29);
    result[i] = (p + (state ? k1 : k0)) % 29;
    state = (state + 1 + (p & 1)) & 1;
  }
  return result;
}
/** @param {number[]} cipher @param {number} k0 @param {number} k1
 * @returns {Uint8Array} */
function decode(cipher, k0, k1) {
  const result = new Uint8Array(cipher.length);
  let state = 0;
  for (let i = 0; i < cipher.length; i++) {
    const p = (cipher[i] + 29 - (state ? k1 : k0)) % 29;
    result[i] = p;
    state = (state + 1 + (p & 1)) & 1;
  }
  return result;
}
/** @param {number[]} a @param {number[]} b @returns {boolean} */
function same(a, b) {
  return a.length === b.length && Array.from(a).every((x, i) => x === b[i]);
}
const training = gp(read('resources/control/gibran_prophet_58585.txt'));
const native = gp(read('resources/control/shakespeare_first300k.txt'));
assert.equal(training.length, 63114);
assert.equal(native.length, 218800);
const tri = new Int32Array(29 * 29 * 29);
const bi = new Int32Array(29 * 29);
for (let i = 2; i < training.length; i++) {
  const b = training[i - 2] * 29 + training[i - 1];
  bi[b]++;
  tri[b * 29 + training[i]]++;
}
const log = new Float64Array(tri.length);
for (let i = 0; i < log.length; i++) {
  log[i] = Math.log((tri[i] + 0.1) / (bi[Math.floor(i / 29)] + 2.9));
}
/** Native GP29 language log-likelihood, in nats/rune, additive smoothing 0.1.
 * @param {number[]} p @returns {number}
 */
function score(p) {
  let sum = 0;
  for (let i = 2; i < p.length; i++) {
    sum += log[(p[i - 2] * 29 + p[i - 1]) * 29 + p[i]];
  }
  return sum / (p.length - 2);
}
/** Exhaust all 29^2 shared secret key pairs without fitting reset or state.
 * @param {number[]} cipher @returns {{k0:number,k1:number,score:number}}
 */
function best(cipher) {
  let found = {k0: 0, k1: 0, score: -Infinity};
  for (let k0 = 0; k0 < 29; k0++) {
    for (let k1 = 0; k1 < 29; k1++) {
      const current = score(decode(cipher, k0, k1));
      if (current > found.score) found = {k0, k1, score: current};
    }
  }
  return found;
}
/** @param {number[]} data @returns {{min:number,median:number,max:number}} */
function summary(data) {
  const a = Array.from(data).sort((x, y) => x - y);
  return {min: a[0], median: a[Math.floor(a.length / 2)], max: a[a.length - 1]};
}
const page = (n) => db.pages.find((p) => p.page === n).indices;
const train = Uint8Array.from([0, 1, 2].flatMap(page));
const held = Uint8Array.from([54, 55].flatMap(page));
assert.equal(train.length, 729);
assert.equal(held.length, 308);
assert.equal(db.pages.filter((p) => p.page <= 55)
  .reduce((n, p) => n + p.indices.length, 0), 12956);
const original = best(train);
const originalHold = decode(held, original.k0, original.k1);
assert(same(encode(originalHold, original.k0, original.k1), held));
assert.deepEqual([original.k0, original.k1], [7, 25]);
assert(Math.abs(original.score + 4.245414550577764) < 1e-10);
assert(Math.abs(score(originalHold) + 4.255966549046384) < 1e-10);
/** Xorshift32, frozen seed, used for relabeling nulls and planted keys. */
let rngState = 0x3301;
/** @returns {number} */
function rng() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
// A complete GP rune relabeling preserves original equalities at EVERY lag,
// including rare adjacent doubles and the excess original lag-five matches.
const nullScores = [];
for (let repeat = 0; repeat < 40; repeat++) {
  const permutation = Uint8Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rng() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const tr = Uint8Array.from(train, (c) => permutation[c]);
  const te = Uint8Array.from(held, (c) => permutation[c]);
  const fit = best(tr);
  nullScores.push(score(decode(te, fit.k0, fit.k1)));
}
assert.equal(nullScores.filter((v) => v >= score(originalHold)).length, 3);
// A matched plaintext plant uses genuine Shakespeare (independent of Gibran),
// true one-to-one GP29 encoding, the exact source chapter lengths, and random
// fixed two-state keys. The decoder never observes native plaintext in fit.
const plants = [];
for (let repeat = 0; repeat < 35; repeat++) {
  const start = 3500 + repeat * 1131;
  const plantTrain = Uint8Array.from(native.slice(start, start + 729));
  const plantHeld = Uint8Array.from(native.slice(start + 729, start + 1037));
  const k0 = rng() % 29;
  const k1 = rng() % 29;
  const cipherTrain = encode(plantTrain, k0, k1);
  const cipherHeld = encode(plantHeld, k0, k1);
  const fit = best(cipherTrain);
  const recovered = decode(cipherHeld, fit.k0, fit.k1);
  assert(same(encode(decode(cipherTrain, fit.k0, fit.k1), fit.k0, fit.k1), cipherTrain));
  assert(same(decode(cipherTrain, k0, k1), plantTrain));
  assert(same(decode(cipherHeld, k0, k1), plantHeld));
  const correct = Array.from(recovered).filter((v, i) => v === plantHeld[i]).length;
  plants.push({wholeKey: fit.k0 === k0 && fit.k1 === k1,
    correct, hold: score(recovered)});
}
assert.equal(plants.filter((p) => p.wholeKey).length, 26);
assert(plants.every((p) => p.correct >= 300));
const nativeScores = [];
for (let i = 0; i < 200; i++) {
  nativeScores.push(score(native.slice(5000 + i * 230, 5308 + i * 230)));
}
const preview = Array.from(originalHold.slice(0, 90))
  .map((v) => db.translit[v]).join('');
const report = {
  model: 'C=P+k[state] mod29; state=(state+1+(P mod2)) mod2; reset=0',
  keyBits: Math.log2(841),
  trainPages: [0, 1, 2], heldoutPages: [54, 55],
  trainRunes: train.length, heldoutRunes: held.length,
  original: {k0: original.k0, k1: original.k1,
    trainScore: original.score, heldoutScore: score(originalHold),
    heldoutPreview: preview},
  nativeShakespeareHeldoutScore: summary(nativeScores),
  letterRelabelNull: {runs: nullScores.length, heldoutScore: summary(nullScores),
    nullAtLeastOriginal: nullScores.filter((v) => v >= score(originalHold)).length},
  nativeCipherPlants: {runs: plants.length,
    exactlyIdentifiedKeyPairs: plants.filter((p) => p.wholeKey).length,
    heldoutScore: summary(plants.map((p) => p.hold)),
    heldoutExactRunes: summary(plants.map((p) => p.correct))}
};
assert(report.original.heldoutScore < report.nativeShakespeareHeldoutScore.min - 1);
console.log(JSON.stringify(report, null, 2));
