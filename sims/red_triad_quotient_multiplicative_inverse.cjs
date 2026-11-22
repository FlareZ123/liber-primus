"use strict";

/**
 * Source-driven variable-multiplier GF(29^2) inverse on original LP2 runes.
 *
 * Public source: red p3 quadratic u^2=8+3u; p39 factor 15(X-24)^2
 * of the printed 256-byte polynomial; 254 quotient coefficients parsed as
 * 127 ascending low/high GF(29^2) pairs. First two p0 ciphertext runes
 * initialize the state; remaining 12954 runes form 51 x 127 field pairs.
 *
 * This tests Q[t mod 127] as a MULTIPLIER, distinct from the previously
 * tested u*S + Q[t] additive forcing. Only ciphertext-vs-plaintext
 * additive feedback is varied. No guessed key or optimized offsets.
 *
 * Run: node sims/red_triad_quotient_multiplicative_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { quotientForcing, coincidence, nativeGP } = require("./red_triad_gf841_127cycle_inverse.cjs");

const root = path.resolve(__dirname, "..");

/** @param {string} file @returns {any} */
function json(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/** @typedef {[number,number]} Field */
/** @param {Field} x @param {Field} y @returns {Field} */
function add(x, y) {
  return [mod(x[0] + y[0]), mod(x[1] + y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function sub(x, y) {
  return [mod(x[0] - y[0]), mod(x[1] - y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
  ];
}

/**
 * Q is the public 127-element multiplier schedule.
 * @param {number[]} sequence
 * @param {Field} initial
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function transform(sequence, initial, q, feedback, decrypt) {
  assert.equal(sequence.length % 2, 0);
  assert.equal(q.length, 127);
  const result = [];
  let state = initial.slice();
  for (let t = 0; t < sequence.length / 2; t++) {
    const input = /** @type {Field} */ ([sequence[2 * t], sequence[2 * t + 1]]);
    const output = decrypt ? sub(input, state) : add(input, state);
    result.push(...output);
    const previous = feedback === "cipher"
      ? (decrypt ? input : output)
      : (decrypt ? output : input);
    state = add(mul(q[t % 127], state), previous);
  }
  return result;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function matching(a, b) {
  assert.equal(a.length, b.length);
  let result = 0;
  for (let i = 0; i < a.length; i++) result += Number(a[i] === b[i]);
  return result;
}

function main() {
  const corpus = json("resources/liber-primus/lp2-corpus.json");
  const grid = json("resources/liber-primus/base60-grid.json");
  const source = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(source.length, 12956);
  assert.deepEqual(corpus.pages.filter(p => p.page === 0)[0].indices.slice(0, 2), [15, 8]);
  const initial = /** @type {Field} */ ([source[0], source[1]]);
  const payload = source.slice(2);
  const q = quotientForcing(grid.byte_rows.flat());
  assert.equal(q.length, 127);
  assert.equal(payload.length, 51 * 127 * 2);
  assert.equal(q.filter(x => x[0] === 0 && x[1] === 0).length, 0);
  const text = "IN THE BEGINNING WAS THE WORD AND THE WORD WAS WITH GOD AND THE WORD WAS GOD THIS IS THE PATH TO KNOWLEDGE AND THE SEARCH FOR TRUTH ALL THINGS ARE INTERCONNECTED THROUGH NUMBER AND THROUGH LANGUAGE ";
  const native = nativeGP(text.repeat(100)).slice(0, payload.length);
  assert.equal(native.length, payload.length);
  const shifted = q.slice(1).concat([q[0]]);

  const rows = [];
  for (const feedback of /** @type {const} */ (["cipher", "plain"])) {
    const original = transform(payload, initial, q, feedback, true);
    assert.equal(matching(transform(original, initial, q, feedback, false), payload), payload.length);
    const encryptedPlant = transform(native, initial, q, feedback, false);
    assert.equal(matching(transform(encryptedPlant, initial, q, feedback, true), native), native.length);
    const wrong = transform(encryptedPlant, initial, shifted, feedback, true);
    rows.push({
      feedback,
      originalIoC: coincidence(original),
      originalHead: original.slice(0, 65).map(i => corpus.translit[i]).join(" "),
      reencrypted: payload.length,
      plantedRecovered: native.length,
      wrongSourceMatches: matching(wrong, native),
    });
  }
  process.stdout.write(JSON.stringify({
    method: "Q[t mod127]*S[t] + feedback field pair",
    initial, quotientPairs: q.length, sourcePayload: payload.length,
    inputIoC: coincidence(payload), nativePlantIoC: coincidence(native),
    rows, conclusion: "No native-GP-like original output under either of the two fixed feedback laws."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { transform, mul };
