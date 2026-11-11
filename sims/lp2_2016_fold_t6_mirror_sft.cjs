"use strict";

/**
 * Original-source p14 FOLD and historical T6: 56-page mirror-alignment gate.
 * Run as a standalone CommonJS file with the repository resources installed.
 * No plaintext or key assumptions are fitted to the target book.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = corpus.pages.map(page => page.indices);
const transcript = read("resources/lp2-transcription.txt").split("%");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc").replace(/\s+/gu, " ");
assert(signed.includes("Its words are the map, their meaning is the road, and their numbers are the direction."));
assert.equal(corpus.runes.length, 29);
assert.equal(physical.length, 58);
assert.equal(physical.slice(0, 56).reduce((n, a) => n + a.length, 0), 12956);
assert.equal(physical[50].length, 0);

/** @param {string} s @returns {string[]} */
function printedWords(s) {
  return (s.replace(/\/\s*/gu, "").replace(/\s+/gu, "").match(/[\u16A0-\u16FF]+/gu) || []);
}
const primeByRune = new Map(corpus.runes.map((c, i) => [c, corpus.prime[i]]));
/** @param {string} runes @returns {number} */
function runePrimeSum(runes) {
  return [...runes].reduce((n, c) => n + primeByRune.get(c), 0);
}
assert.equal(printedWords(transcript[14])[1], "ᚠᚩᛚᛞ");
assert.equal(printedWords(transcript[55 - 1])[2], "ᛋᛒ"); // rune-only transcript omits physical p50
assert.equal(printedWords(transcript[56 - 1])[1], "ᛟᛋᚱ");
assert.equal(runePrimeSum("ᚠᚩᛚᛞ"), 171);
assert.equal(runePrimeSum("ᛋᛒ"), 114);
assert.equal(runePrimeSum("ᛟᛋᚱ"), 147);
assert.equal(72 % 58, 14); // GP-prime sum(THE)=72
assert.equal(Math.floor(72 / 58), 1);
assert.equal(171 % 58, 55);
assert.equal(Math.floor(171 / 58), 2);
assert.equal(114 % 58, 56);
assert.equal(Math.floor(114 / 58), 1);

/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** Previously source-derived affine map T6. @param {number} n @returns {number} */
function T6(n) { return mod(24 - 2 * n); }

/**
 * @param {number[]} left
 * @param {number[]} right
 * @param {boolean} reverse
 * @param {boolean} suffix
 * @returns {{hits:number,n:number}}
 */
function pairScore(left, right, reverse, suffix) {
  const n = Math.min(left.length, right.length);
  let hits = 0;
  for (let i = 0; i < n; i++) {
    const a = left[(suffix ? left.length - n : 0) + i];
    const bIndex = reverse
      ? right.length - 1 - (suffix ? 0 : right.length - n) - i
      : (suffix ? right.length - n : 0) + i;
    const b = right[bIndex];
    hits += Number(b === T6(a));
  }
  return {hits, n};
}
/** @typedef {{pairing:string,reverse:boolean,suffix:boolean}} Mode */
const modes = [];
for (const pairing of ["offset", "mirror"]) {
  for (const reverse of [false, true]) {
    for (const suffix of [false, true]) {
      modes.push({pairing, reverse, suffix});
    }
  }
}
/**
 * @param {Mode} mode
 * @param {number[]} permutation mapping 28 left pages to 28 right pages
 * @returns {{hits:number,n:number,z:number}}
 */
function score(mode, permutation) {
  let hits = 0;
  let n = 0;
  for (let i = 0; i < 28; i++) {
    const right = mode.pairing === "offset" ? permutation[i] : permutation[27 - i];
    const v = pairScore(physical[i], physical[right], mode.reverse, mode.suffix);
    hits += v.hits;
    n += v.n;
  }
  return {hits, n, z: (hits - n / 29) / Math.sqrt(n * 28 / (29 * 29))};
}
const original = Array.from({length:28}, (_, i) => 28 + i);
const sourceScores = modes.map(m => score(m, original));
const candidate = sourceScores[5];
assert.deepEqual(modes[5], {pairing:"mirror", reverse:false, suffix:true});
assert.equal(candidate.n, 5705);
assert.equal(candidate.hits, 238);
assert.equal(sourceScores[0].hits, 202);

let state = 0x330128;
/** @returns {number} */
function next() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state;
}
const N = Number(process.env.LP2_FOLD_SHUFFLES || 3000);
assert(Number.isSafeInteger(N) && N > 0);
const extreme = Array(8).fill(0);
let familyExtreme = 0;
const sourceBest = Math.max(...sourceScores.map(x => x.z));
for (let trial = 0; trial < N; trial++) {
  const shuffled = original.slice();
  for (let i = 27; i > 0; i--) {
    const j = next() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let best = -Infinity;
  for (let j = 0; j < modes.length; j++) {
    const v = score(modes[j], shuffled).z;
    extreme[j] += Number(v >= sourceScores[j].z);
    best = Math.max(best, v);
  }
  familyExtreme += Number(best >= sourceBest);
}
if (N === 3000) {
  assert.equal(extreme[5], 4);
  assert.equal(familyExtreme, 64);
}

const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const english = read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().replace(/V/gu, "U").replace(/K/gu, "C")
  .replace(/Q/gu, "CW").replace(/Z/gu, "S");
const seq = [];
for (const word of english.match(/[A-Z]+/gu) || []) {
  for (let i = 0; i < word.length;) {
    const tok = alphabet.find(x => word.startsWith(x.s, i));
    assert(tok, "Unsupported GP control digraph");
    seq.push(tok.i);
    i += tok.s.length;
  }
}
assert(seq.length >= 185705);
const train = 160000;
const freq = Array(29).fill(0);
for (let i = 0; i < train; i++) freq[seq[i]]++;
for (let i = 0; i < 29; i++) freq[i] /= train;
const nativeDifference = Array(29).fill(0);
for (let i = 0; i < 29; i++) {
  for (let j = 0; j < 29; j++) {
    nativeDifference[mod(i - j)] += freq[i] * freq[j];
  }
}
const originalResidual = Array(29).fill(0);
for (let i = 0; i < 28; i++) {
  const A = physical[i];
  const B = physical[55 - i];
  const n = Math.min(A.length, B.length);
  for (let k = 0; k < n; k++) {
    const x = A[A.length - n + k];
    const y = B[B.length - n + k];
    const inferredPlainDelta = mod(14 * mod(y - T6(x))); // (-2)^(-1) = 14 mod 29
    originalResidual[inferredPlainDelta]++;
  }
}
assert.equal(originalResidual.reduce((a, b) => a + b, 0), candidate.n);
assert.equal(originalResidual[0], candidate.hits);
/** @param {number[]} hist @returns {number} */
function logLikelihood(hist) {
  return hist.reduce((sum, count, i) =>
    sum + count * Math.log(nativeDifference[i] * 29), 0);
}
const originalEnglishLLR = logLikelihood(originalResidual);

// Synthetic actual-GP, full-length native positive: different true plaintext
// positions masked by the same secret key under the two affine conventions.
const plantedResidual = Array(29).fill(0);
let controlState = 0x129b3301;
for (let i = 0; i < candidate.n; i++) {
  controlState = (Math.imul(controlState, 1664525) + 1013904223) >>> 0;
  const key = controlState % 29;
  const pA = seq[160000 + i];
  const pB = seq[180000 + i];
  const cA = mod(pA + key);
  const cB = T6(mod(pB + key));
  assert.equal(mod(cA - key), pA);
  assert.equal(mod(14 * mod(cB - 24) - key), pB);
  const z = mod(14 * mod(cB - T6(cA)));
  assert.equal(z, mod(pB - pA));
  plantedResidual[z]++;
}
const plantedEnglishLLR = logLikelihood(plantedResidual);
assert(originalEnglishLLR < 0);
assert(plantedEnglishLLR > 0);
assert(Math.abs(originalEnglishLLR + 105.21608494355361) < 1e-6);
assert(Math.abs(plantedEnglishLLR - 110.84445498653946) < 1e-6);

console.log(JSON.stringify({
  source: "signed 2016 THE→FOLD and established 563x569-derived T6",
  candidate: {mode: modes[5], ...candidate, rawRepeatRate: candidate.hits / candidate.n},
  originalEightAlignmentModes: modes.map((mode, i) => ({mode, ...sourceScores[i]})),
  permutationNull: {seed:"0x330128", trials:N,
    candidateTail:(extreme[5] + 1) / (N + 1),
    familyMaxTail:(familyExtreme + 1) / (N + 1),
    candidateAtLeast:extreme[5], familyAtLeast:familyExtreme},
  nativeGP: {train, totalSourceRunes:seq.length, originalEnglishLLR,
    plantedEnglishLLR, original0:originalResidual[0], planted0:plantedResidual[0],
    englishExpected0:candidate.n * nativeDifference[0],
    originalResidual, plantedResidual, reversiblePlant:true}
}, null, 2));
