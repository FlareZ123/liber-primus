"use strict";

/**
 * LP2 p13/p14: full all-key affine cumulative fold trace, Node.js 22 SFT.
 * Only the original p13 and p14 rune arrays are used as fixed inputs.
 * Source: resources/liber-primus/lp2-corpus.json
 *
 * An alternative to using p13 as an additive key to decrypt p14:
 * 136 paired fold inputs could drive exactly 136 state transitions in
 * p14's 137 original runes, where
 *   C[i+1] = C[i] + u*A[i] + v*B[i] + w (mod29).
 * Enumerate ALL 29^3 static hidden coefficients, including 0.
 *
 * Run from repository root: node sims/lp2_p13_p14_fold_137state_affine_trace_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"),
  "utf8"
));
const top = corpus.pages.find(p => p.page === 13).indices;
const trace = corpus.pages.find(p => p.page === 14).indices;
assert.equal(top.length, 272);
assert.equal(trace.length, 137);
assert.equal(corpus.runes.length, 29);

const modulus = 29;
/** @param {number} x @returns {number} */
function mod(x) { return ((x % modulus) + modulus) % modulus; }

/**
 * @param {number[]} p
 * @param {"adjacent"|"parallel"|"reverse"} mode
 * @returns {Array<[number,number]>}
 */
function pairs(p, mode) {
  const result = [];
  for (let i = 0; i < 136; i++) {
    if (mode === "adjacent") result.push([p[2 * i], p[2 * i + 1]]);
    else if (mode === "parallel") result.push([p[i], p[i + 136]]);
    else result.push([p[i], p[271 - i]]);
  }
  assert.equal(result.length, 136);
  return result;
}

/**
 * Exhausting 29^2 u,v pairs and maximizing the 29 offset counts is
 * algebraically identical to enumerating every one of 29^3 keys.
 *
 * @param {number[]} states 137 consecutive GP29 states
 * @param {Array<[number,number]>} input 136 ordered source rune pairs
 * @returns {{matches:number,u:number,v:number,w:number}}
 */
function bestAffineTrace(states, input) {
  assert.equal(states.length, 137);
  assert.equal(input.length, 136);
  const delta = input.map((_, i) => mod(states[i + 1] - states[i]));
  let best = {matches: -1, u: -1, v: -1, w: -1};
  for (let u = 0; u < modulus; u++) {
    for (let v = 0; v < modulus; v++) {
      const hist = Array(modulus).fill(0);
      for (let i = 0; i < 136; i++) {
        const [a, b] = input[i];
        hist[mod(delta[i] - u * a - v * b)]++;
      }
      for (let w = 0; w < modulus; w++) {
        if (hist[w] > best.matches) best = {matches: hist[w], u, v, w};
      }
    }
  }
  let crosscheck = 0;
  for (let i = 0; i < 136; i++) {
    const [a, b] = input[i];
    if (mod(best.u * a + best.v * b + best.w) === delta[i]) crosscheck++;
  }
  assert.equal(best.matches, crosscheck);
  return best;
}

/**
 * @param {number} initial
 * @param {Array<[number,number]>} input
 * @param {number} u
 * @param {number} v
 * @param {number} w
 * @returns {number[]}
 */
function generateTrace(initial, input, u, v, w) {
  const out = [initial];
  for (const [a, b] of input) {
    out.push(mod(out[out.length - 1] + u * a + v * b + w));
  }
  return out;
}

const expect = {
  adjacent: {matches:15, u:10, v:2, w:7},
  parallel: {matches:16, u:18, v:12, w:22},
  reverse: {matches:15, u:11, v:18, w:13}
};
const results = {};
for (const mode of Object.keys(expect)) {
  const input = pairs(top, mode);
  const actual = bestAffineTrace(trace, input);
  assert.deepEqual(actual, expect[mode], mode + " full all-key original input");
  assert.ok(actual.matches < 136);
  const nativePlant = generateTrace(trace[0], input, 3, 7, 11);
  assert.equal(nativePlant.length, 137);
  assert.deepEqual(bestAffineTrace(nativePlant, input), {
    matches: 136, u: 3, v: 7, w: 11
  }, "valid planted 137-state trace must pass all-key optimum");
  assert.deepEqual(generateTrace(trace[0], input, 3, 7, 11), nativePlant);
  results[mode] = actual;
}
console.log(JSON.stringify({
  model: "C[i+1]-C[i]=u*A[i]+v*B[i]+w modulo29",
  source: "original physical p13(272 rune inputs), p14(137 state runes)",
  allSecretKeysPerMode: 29**3,
  testedSourcePairings: Object.keys(expect),
  originalBest: results,
  exactMatchNeeded: 136,
  nativeSourcePairPlants: "136/136 in every pairing",
  decision: "all three complete source-shaped affine trace models impossible"
}, null, 2));
