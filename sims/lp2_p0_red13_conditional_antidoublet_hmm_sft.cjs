"use strict";
/**
 * Original LP2 p0 red13 residual-key consumer: single redraw on a would-be
 * adjacent ciphertext doublet. Source-native English unigram forward HMM,
 * phase0 continuous after the original 13-rune red title, no fitted phases.
 * Node.js 22 CommonJS SFT. No external libraries or file writes.
 *
 * The title EPIPHANY SEEKS is a conditional 2016 signed-message crib,
 * not confirmed plaintext. This test explicitly does NOT authenticate it.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const original = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p0 = original.pages.find(p => p.page === 0).indices;
const title = encodeSourceNativeGP("EPIPHANY SEEKS");
const M = 29, PERIOD = 13, BETA = 0.2;
const mod = x => (x % M + M) % M;
const key = title.map((p, i) => mod(p0[i] - p));
assert.equal(p0.length, 262);
assert.deepEqual([title.length, key.length], [13, 13]);
assert.deepEqual(key, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.deepEqual(title, [18,13,10,13,8,24,9,26,15,18,18,5,15]);

const gibran = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const shakespeare = encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(gibran.length, 62492);
assert.equal(shakespeare.length, 217106);
const probabilities = Array(M).fill(0.5);
for (const p of gibran) probabilities[p]++;
const total = probabilities.reduce((s, v) => s + v);
for (let p = 0; p < M; p++) probabilities[p] /= total;

/**
 * The optional skip consumes one extra key value without emitting a rune.
 * A skip is allowed only if the first tentative output equals the preceding
 * emitted ciphertext. The next key symbol is then emitted, even if it also
 * produces an equality. This is a finite, fully specified lossless encoder.
 *
 * @param {number[]} plaintext
 * @param {() => number} random
 * @param {number} beta
 * @returns {{cipher:number[], trace:{phase:number,skip:boolean,p:number,c:number}[]}}
 */
function encryptBody(plaintext, random, beta = BETA) {
  const cipher = p0.slice(0, PERIOD), trace = [];
  let phase = 0, previous = cipher[PERIOD - 1];
  for (const p of plaintext) {
    let c = mod(p + key[phase]), skip = false;
    const startingPhase = phase;
    phase = (phase + 1) % PERIOD;
    if (c === previous && random() > beta) {
      skip = true;
      c = mod(p + key[phase]);
      phase = (phase + 1) % PERIOD;
    }
    cipher.push(c);
    trace.push({phase:startingPhase,skip,p,c});
    previous = c;
  }
  return {cipher, trace};
}

/**
 * Complete hidden-phase forward probability of the original ciphertext,
 * conditioned on the first 13 literal ciphertext positions and the claimed
 * title. The 13 key positions and source-English probabilities are frozen.
 * @param {number[]} ciphertext
 * @param {number} beta
 * @returns {number} negative log likelihood per original black ciphertext rune
 */
function entropy(ciphertext, beta = BETA) {
  assert.deepEqual(ciphertext.slice(0, PERIOD), p0.slice(0, PERIOD));
  let current = new Float64Array(PERIOD);
  current[0] = 1;
  let logLikelihood = 0;
  for (let i = PERIOD; i < ciphertext.length; i++) {
    const c = ciphertext[i], previous = ciphertext[i - 1];
    const next = new Float64Array(PERIOD);
    for (let q = 0; q < PERIOD; q++) {
      const mass = current[q];
      if (mass === 0) continue;
      const first = mod(c - key[q]);
      const firstWouldRepeat = c === previous;
      next[(q + 1) % PERIOD] += mass * probabilities[first] *
        (firstWouldRepeat ? beta : 1);
      const secondKey = key[(q + 1) % PERIOD];
      // The rejected first candidate is exactly the previous ciphertext.
      if (c === mod(previous + secondKey - key[q])) {
        next[(q + 2) % PERIOD] +=
          mass * probabilities[mod(previous - key[q])] * (1 - beta);
      }
    }
    const normalization = next.reduce((s, value) => s + value, 0);
    assert(normalization > 0, "No emission path through source");
    logLikelihood += Math.log(normalization);
    for (let q = 0; q < PERIOD; q++) current[q] = next[q] / normalization;
  }
  return -logLikelihood / (ciphertext.length - PERIOD);
}
/**
 * Deterministic source-positive replay of every genuine emitted and skipped
 * source symbol, including cases in which the second candidate also repeats.
 * @param {number[]} plaintext
 * @param {{cipher:number[],trace:{phase:number,skip:boolean,p:number,c:number}[]}} plant
 */
function replay(plaintext, plant) {
  let q = 0, previous = p0[PERIOD - 1];
  assert.equal(plaintext.length, plant.trace.length);
  const out = p0.slice(0, PERIOD);
  for (let i = 0; i < plaintext.length; i++) {
    const step = plant.trace[i], p = plaintext[i];
    assert.equal(step.phase, q);
    assert.equal(step.p, p);
    let c = mod(p + key[q]);
    q = (q + 1) % PERIOD;
    if (step.skip) {
      assert.equal(c, previous);
      c = mod(p + key[q]);
      q = (q + 1) % PERIOD;
    }
    assert.equal(c, step.c);
    out.push(c);
    previous = c;
  }
  assert.deepEqual(out, plant.cipher);
}
let state = 3301;
/** @returns {number} fixed-seed uniform [0,1) */
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
const actual = entropy(p0);
const betaSensitivity = [0.05, 0.2, 0.5, 1].map(beta =>
  ({beta, original:entropy(p0,beta)}));
const controls = [];
for (const [name, stream] of [["Gibran",gibran],["Shakespeare",shakespeare]]) {
  for (let test = 0; test < 45; test++) {
    const plain = stream.slice(1000 + test * 700, 1249 + test * 700);
    const plant = encryptBody(plain, random);
    replay(plain, plant);
    controls.push({
      corpus:name, offset:1000 + test * 700,
      entropy:entropy(plant.cipher),
      skips:plant.trace.filter(s=>s.skip).length,
      doubles:plant.cipher.slice(1).filter((c, i)=>c===plant.cipher[i]).length
    });
  }
}
const ordered = controls.map(c=>c.entropy).sort((a,b)=>a-b);
const max = ordered[ordered.length - 1], min = ordered[0];
const sourceDoublets = p0.slice(1).filter((c,i)=>c===p0[i]).length;
assert.equal(sourceDoublets, 2);
assert(controls.every(c=>c.entropy < actual - 0.5),
  "Frozen genuine-English controls should reject this original original-key transfer");
assert.equal(controls.length,90);
console.log(JSON.stringify({
  classification:"Source-conditional exact negative; no new unknown plaintext",
  target:"LP2 p0, 249 untouched black runes after original red13",
  cipher:"GP29 additive period13 source-crib residual; one redraw of key after would-be repeated ciphertext; phase continuous through body",
  originalKey:key, originalDoublets:sourceDoublets,
  title:"EPIPHANY SEEKS (conditional crib)",
  originalNegativeLogLikelihoodPerRune:actual,
  fixedBetaOriginal:betaSensitivity,
  positiveControl: {
    gibranCount:45,shakespeareCount:45,
    entropyMin:min,median:ordered[45],entropyMax:max,
    firstControl:controls[0],lastControl:controls[controls.length-1],
    sourceNativeRoundtrip:true,exactSourceWordsNoChanges:true
  },
  note:"The original is outside every tested genuine-English plant by >0.5 nats/rune under this explicitly frozen key and emission model. This rejects only the named decoder, not other keys, clocks, source registers or ciphers."
}, null, 2));
