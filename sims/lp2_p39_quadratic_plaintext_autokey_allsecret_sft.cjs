"use strict";

/**
 * Complete all-secret original-LP2 p39 red-quadratic, plaintext-autokey gate.
 * Run: node sims/lp2_p39_quadratic_plaintext_autokey_allsecret_sft.cjs
 *
 * Fixed source coefficients: p39 red [27,5,15] => 15(X-24)^2 (GF29).
 * Two unknown state runes k0,k1 => 841 keys. Four source-defined feedback
 * maps: true plaintext GP index or the corresponding prime mod29, and
 * additive cipher sign +/-1. Every candidate is reversible and is tested
 * against all 3000 original black pp40-53 runes and original printed words.
 * Independent GP-native Shakespeare bigram training and Gibran positive plants.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const j = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const train = read("resources/control/shakespeare_first300k.txt");
const control = read("resources/control/gibran_prophet_58585.txt");
const mod = x => ((x % 29) + 29) % 29;

assert.deepEqual(j.pages.find(p => p.page === 39).indices.slice(119, 122),
  [27, 5, 15]);
const body = j.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(body.length, 3008);
assert.deepEqual(body.slice(0, 8), [0, 9, 19, 26, 6, 23, 25, 8]);
const cipher = body.slice(8);
assert.equal(cipher.length, 3000);

const words = parseLP2Words(transcript).words.filter(
  w => w.startPage >= 40 && w.startPage <= 52).slice(2);
assert.equal(words.length, 667);
const wordLengths = words.map(w => w.length);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), cipher.length);
const wordStarts = new Uint8Array(cipher.length);
for (let cursor = 0, i = 0; i < wordLengths.length; i++) {
  wordStarts[cursor] = 1;
  cursor += wordLengths[i];
}

const idx = new Map(j.translit.map((r, i) => [r, i]));
idx.set("ING", idx.get("NG"));
idx.set("IO", idx.get("EO"));
const combos = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA", "IO"];

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < s.length;) {
    const digraph = combos.find(x => s.startsWith(x, i));
    const t = digraph === undefined ? s[i] : digraph;
    const v = idx.get(t);
    assert.notEqual(v, undefined, "Unknown native GP token: " + t);
    result.push(v);
    i += t.length;
  }
  return result;
}

// Frozen independent Shakespeare within-word GP29 bigram language model.
const frequencies = new Int32Array(29 * 29);
for (const word of train.match(/[A-Za-z]+/g) || []) {
  const symbols = gpWord(word);
  for (let i = 1; i < symbols.length; i++)
    frequencies[symbols[i - 1] * 29 + symbols[i]]++;
}
const logProb = new Float64Array(29 * 29);
for (let x = 0; x < 29; x++) {
  let total = 0;
  for (let y = 0; y < 29; y++) total += frequencies[x * 29 + y];
  for (let y = 0; y < 29; y++)
    logProb[x * 29 + y] = Math.log(
      (frequencies[x * 29 + y] + 0.4) / (total + 29 * 0.4));
}

/** @param {number[]} sequence @returns {number} */
function score(sequence) {
  let log = 0;
  let pairs = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (wordStarts[i]) continue;
    log += logProb[sequence[i - 1] * 29 + sequence[i]];
    pairs++;
  }
  assert.equal(pairs, 3000 - 667);
  return log / pairs;
}

/** @param {number} p @param {"index"|"prime"} forcing */
function injection(p, forcing) {
  return forcing === "index" ? p : j.prime[p] % 29;
}

/** @param {number[]} C
 * @param {1|-1} sign
 * @param {"index"|"prime"} forcing
 * @param {number} a
 * @param {number} b
 * @returns {number[]} */
function decrypt(C, sign, forcing, a, b) {
  const k = [a, b], P = new Array(C.length);
  for (let i = 0; i < C.length; i++) {
    P[i] = mod(C[i] - sign * k[i]);
    if (i + 2 < C.length)
      k.push(mod(19 * k[i + 1] + 4 * k[i] + injection(P[i], forcing)));
  }
  return P;
}

/** @param {number[]} P
 * @param {1|-1} sign
 * @param {"index"|"prime"} forcing
 * @param {number} a
 * @param {number} b
 * @returns {number[]} */
function encrypt(P, sign, forcing, a, b) {
  const k = [a, b], C = new Array(P.length);
  for (let i = 0; i < P.length; i++) {
    C[i] = mod(P[i] + sign * k[i]);
    if (i + 2 < P.length)
      k.push(mod(19 * k[i + 1] + 4 * k[i] + injection(P[i], forcing)));
  }
  return C;
}

/** Exhaust exactly 29² unknown starting keys, selecting a key only by the
 * independently fixed GP-native within-word bigram language model.
 * @param {number[]} C
 * @param {1|-1} sign
 * @param {"index"|"prime"} forcing
 * @returns {{a:number,b:number,score:number,median:number,min:number,decoded:number[]}} */
function allKeys(C, sign, forcing) {
  const values = [];
  let best = {a: 0, b: 0, score: -Infinity, decoded: []};
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const decoded = decrypt(C, sign, forcing, a, b);
    const value = score(decoded);
    values.push(value);
    if (value > best.score) best = {a, b, score: value, decoded};
  }
  values.sort((a, b) => a - b);
  return {...best, median: values[420], min: values[0]};
}

const pools = Array.from({length: 24}, () => []);
for (const word of control.match(/[A-Za-z]+/g) || []) {
  const seq = gpWord(word);
  if (seq.length < pools.length) pools[seq.length].push(seq);
}
for (const length of wordLengths)
  assert(pools[length].length > 0, "Missing native GP word size " + length);
let rng = 0x290203;
/** @returns {number} deterministic xorshift32 */
function random32() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const nativeScores = [];
let nativeFirst = [];
for (let trial = 0; trial < 100; trial++) {
  const P = [];
  for (const n of wordLengths) {
    const pool = pools[n];
    P.push(...pool[random32() % pool.length]);
  }
  assert.equal(P.length, cipher.length);
  if (trial === 0) nativeFirst = P;
  nativeScores.push(score(P));
}
nativeScores.sort((a, b) => a - b);
assert(Math.abs(nativeScores[0] - (-2.41812382389001)) < 1e-10);
assert(Math.abs(nativeScores[49] - (-2.363513179239373)) < 1e-10);
assert(Math.abs(nativeScores[99] - (-2.301110948660443)) < 1e-10);

const original = [];
const positive = [];
for (const forcing of ["index", "prime"]) {
  for (const sign of [1, -1]) {
    const result = allKeys(cipher, sign, forcing);
    assert.deepEqual([result.a, result.b],
      forcing === "index" && sign === 1 ? [10, 5] :
      forcing === "index" && sign === -1 ? [26, 10] :
      forcing === "prime" && sign === 1 ? [14, 12] : [3, 13]);
    assert(result.score < nativeScores[0]);
    assert.deepEqual(encrypt(result.decoded, sign, forcing,
      result.a, result.b), cipher);
    original.push({
      forcing, sign, bestState: [result.a, result.b],
      bestNatsPerWithinWordPair: result.score,
      medianNatsPerPair: result.median,
      first50: result.decoded.slice(0, 50).map(i => j.translit[i]).join(" ")
    });
    const plant = encrypt(nativeFirst, sign, forcing, 9, 24);
    assert.deepEqual(decrypt(plant, sign, forcing, 9, 24), nativeFirst);
    const solved = allKeys(plant, sign, forcing);
    assert.deepEqual([solved.a, solved.b], [9, 24]);
    assert.deepEqual(solved.decoded, nativeFirst);
    positive.push({forcing, sign, recoveredKey: [solved.a, solved.b],
      score: solved.score, correctFullLength: solved.decoded.length});
  }
}

console.log(JSON.stringify({
  originalSource: {page39Red: [27, 5, 15], target: "pp40-53 after 8 red runes",
    targetRunes: cipher.length, targetWords: wordLengths.length,
    cipherSignOptions: 2, feedbackTypes: 2, secretSeedsPerModel: 841},
  model: "C[i]=P[i]+sign*K[i]; K[i+2]=19*K[i+1]+4*K[i]+GP(P[i]) mod29",
  original,
  nativeControls: {count: 100, min: nativeScores[0],
    median: nativeScores[49], max: nativeScores[99]},
  nativePositivePlants: positive,
  decision: "Four all-secret original inverses fail native GP-English; no plaintext"
}, null, 2));
