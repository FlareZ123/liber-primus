"use strict";

/**
 * SFT: reduce the p0 marker RISE generator to the independently reconstructed
 * DH state plus source-visible marker geometry, then decrypt untouched p0.
 *
 * The exact cumulative-rise grammar was discovered retrospectively. This test
 * removes THE/WAY source ordinals as numeric inputs and checks that they emerge
 * from state/geometry values instead.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/**
 * @param {number[]} values
 * @returns {number[]}
 */
function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]));
    out.push(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/**
 * @param {number} seed
 * @param {number[]} rises
 * @returns {number[]}
 */
function cumulative(seed, rises) {
  const out = [mod29(seed)];
  let value = mod29(seed);
  for (const rise of rises) {
    value = mod29(value + rise);
    out.push(value);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

// Fixed by the independent p55/p28 and authenticated-square state routes.
const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

// Source-visible p0 geometry.
const markerDots = ink.physical_zero_based.large_punctuation[0].dots;
assert.equal(markerDots, 13);
const markerColumns = [4, 5, 4];
assert.deepEqual(markerColumns, [state.q, state.g, state.q]);
assert.equal(markerDots, state.b - state.K);

// The former textual anchors are consequences of state plus marker geometry.
const t = state.g + state.K;
const w = markerDots;
assert.equal(t, 7);
assert.equal(w, 13);
assert.equal(w, state.b - state.K);

// Preserve the published RISE form, but generate every numeric input from the
// state/marker rather than from plaintext or authenticated-source word numbers.
const leftRises = [state.q - 1, w - 1, w + 1].map(mod29);
const centerRises = [
  state.q,
  state.q + t,
  state.q + 2 * t,
  state.q + 3 * t,
].map(mod29);
const rightRises = [t - 1, t, t + 1].map(mod29);

assert.deepEqual(leftRises, [
  state.e,
  state.K * state.a,
  mod29(-state.b),
]);
assert.deepEqual(centerRises, [
  state.q,
  mod29(state.B - state.A),
  mod29(state.A - state.B),
  mod29(-state.q),
]);
assert.deepEqual(rightRises, [
  state.a,
  state.g + state.K,
  state.A,
]);

const left = cumulative(-state.q, leftRises);
const center = cumulative(state.q, centerRises);
const right = cumulative(t, rightRises);

assert.deepEqual(left, [
  mod29(-state.q),
  mod29(-1),
  mod29(state.B - state.A),
  mod29(-state.q),
]);
assert.deepEqual(center, [state.q, state.A, state.B, state.A, state.q]);
assert.deepEqual(right, [
  state.g + state.K,
  state.b - state.K,
  state.p - state.e,
  mod29(-1),
]);

const markerState = [...left, ...center, ...right];
assert.deepEqual(markerState, [
  25, 28, 11, 25,
  4, 8, 19, 8, 4,
  7, 13, 20, 28,
]);

const key = H(markerState);
assert.deepEqual(key, [
  26, 24, 8, 19, 27, 24, 18, 3,
  0, 8, 0, 16, 19,
]);

// Only now inspect the untouched p0 title ciphertext.
const cipher = ink.physical_zero_based.red_words.flatMap((word) => word.gp_indices);
assert.equal(cipher.length, markerDots);
const plain = cipher.map((value, index) => mod29(value - key[index]));
const gp = plain.map((value) => corpus.translit[value]).join("");
assert.equal(gp, "EPIPHANYSEECS");

// The derived t,w values independently land on authenticated source words.
const source = (
  signed
    .slice(signed.indexOf("Hello."), signed.indexOf("-----BEGIN PGP SIGNATURE-----"))
    .replace(/\b7A35090F\b/gu, "")
    .match(/[A-Za-z]+/gu) || []
).map((word) => word.toUpperCase());
assert.equal(source.length, 43);
assert.equal(source[t], "THE");
assert.equal(source[w], "WAY");

console.log(JSON.stringify({
  status: "PASS",
  state,
  sourceVisibleGeometry: {
    markerColumns,
    markerDots,
    typing: ["q", "g", "q"],
    totalTyping: "b-K",
  },
  stateDerivedFormerAnchors: {
    t,
    tExpression: "g+K",
    sourceAtT: source[t],
    w,
    wExpression: "b-K = marker dot count",
    sourceAtW: source[w],
  },
  riseTyping: {
    left: ["e", "K*a", "-b"],
    center: ["q", "B-A", "A-B", "-q"],
    right: ["a", "g+K", "A"],
  },
  markerState,
  markerStateTyping: [
    "-q", "-1", "B-A", "-q",
    "q", "A", "B", "A", "q",
    "g+K", "b-K", "p-e", "-1",
  ],
  generatedKey: key,
  untouchedCipher: cipher,
  decryptedGP: gp,
  humanReading: "EPIPHANY SEEKS",
  decision: "The published local RISE generator needs no source-word ordinal as a numeric input: q, t=7 and w=13 all follow from the independently reconstructed state and the original 4|5|4 / 13-dot marker. The exact rise grammar remains retrospective.",
}, null, 2));
