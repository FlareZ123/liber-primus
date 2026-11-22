"use strict";
/**
 * Key-independent test of all 29!^24389 stationary, third-order GP29
 * ciphertext-feedback substitution systems against original LP2.
 *
 * For every possible fixed secret bijection S[state], the model
 * C[i]=S[C[i-3],C[i-2],C[i-1]][P[i]] has an exact invariant:
 * within a given observable ciphertext predecessor-triple state, all equal
 * pairs of successor ciphertext runes remain equal plaintext runes, and
 * distinct pairs remain distinct. Their equality rate is independent
 * of the unknown 24,389 S-boxes and cannot be altered by key guessing.
 *
 * Compare the original invariant to 32 independently encrypted GP-English
 * plants using original page sizes, 24,389 *truly randomized* stationary
 * bijections and exact forward/inverse checks.
 *
 * Node.js 22, CommonJS, no external packages, no writes.
 * Run: node sims/lp2_thirdorder_predecessor_collision_sft.cjs
 * @module lp2_thirdorder_predecessor_collision_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.filter(p => p.status === "unsolved" &&
  p.indices.length).map(p => p.indices);
const pageLengths = original.map(p => p.length);
const BASE = 29;
const STATE_COUNT = BASE ** 3;
const TABLE_COUNT = STATE_COUNT * BASE;
assert.equal(original.length, 55);
assert.equal(original.flat().length, 12956);
/** @param {string} raw */
function encode(raw) {
  const tokens = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (let word of raw.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let at = 0; at < word.length;) {
      const item = tokens.find(x => word.startsWith(x.t, at));
      assert.ok(item, "source token " + word.slice(at));
      out.push(item.i);
      at += item.t.length;
    }
  }
  return out;
}
const controls = [
  encode(read("resources/control/shakespeare_first300k.txt")),
  encode(read("resources/control/gibran_prophet_58585.txt"))
];
assert.deepEqual(controls.map(a => a.length), [218800, 63114]);

/** @param {number[]} a @param {number} i */
const stateAt = (a, i) =>
  (a[i - 3] * BASE + a[i - 2]) * BASE + a[i - 1];
/**
 * Original source conditional collision statistic, not an estimated cipher.
 * Same predecessor state and same emitted symbol imply same plaintext symbol
 * for any independent, stationary 29-way secret bijection at that state.
 *
 * @param {number[][]} book
 */
function collision(book) {
  const hist = new Uint16Array(TABLE_COUNT);
  const states = new Uint16Array(STATE_COUNT);
  let eligible = 0;
  for (const a of book) for (let i = 3; i < a.length; i++) {
    const s = stateAt(a, i);
    hist[s * BASE + a[i]]++;
    states[s]++;
    eligible++;
  }
  let pairs = 0, equals = 0;
  for (const n of states) pairs += n * (n - 1);
  for (const n of hist) equals += n * (n - 1);
  return {eligible, pairs, equals, coincidence: equals / pairs};
}
const source = collision(original);
assert.deepEqual(source, {
  eligible: 12791,
  pairs: 6946,
  equals: 248,
  coincidence: 248 / 6946
});
let seed = 0x435b33aa;
/** Reproducible RNG seed for both the native language and S-box rows. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** Generate 24,389 genuinely random and invertible rows, no fitted key. */
function secretTables() {
  const forward = new Uint8Array(TABLE_COUNT);
  const inverse = new Uint8Array(TABLE_COUNT);
  for (let s = 0; s < STATE_COUNT; s++) {
    const permutation = Array.from({length: BASE}, (_, i) => i);
    for (let i = BASE - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [permutation[i], permutation[j]] =
        [permutation[j], permutation[i]];
    }
    for (let plain = 0; plain < BASE; plain++) {
      const cipher = permutation[plain];
      forward[s * BASE + plain] = cipher;
      inverse[s * BASE + cipher] = plain;
    }
  }
  return {forward, inverse};
}
/** @param {number[]} native */
function plant(native) {
  const start = random() % (native.length - 12956);
  const plain = native.slice(start, start + 12956);
  const {forward, inverse} = secretTables();
  const ciphertext = [];
  let offset = 0, roundtrip = 0;
  for (const len of pageLengths) {
    const p = plain.slice(offset, offset + len);
    const c = p.slice(0, 3);
    for (let i = 3; i < len; i++) {
      const s = stateAt(c, i);
      c[i] = forward[s * BASE + p[i]];
      assert.equal(inverse[s * BASE + c[i]], p[i]);
      roundtrip++;
    }
    offset += len;
    ciphertext.push(c);
  }
  assert.equal(roundtrip, 12791);
  assert.equal(offset, 12956);
  return {sourceStart: start, roundtrip, ...collision(ciphertext)};
}
const plants = Array.from({length: 32}, (_, i) =>
  ({trial: i, language: i % 2 ? "Gibran" : "Shakespeare",
    ...plant(controls[i % 2])}));
const rates = plants.map(x => x.coincidence);
assert.ok(plants.every(x => x.coincidence > source.coincidence + 0.02));
assert.ok(Math.abs(Math.min(...rates) - 0.05622146118721461) < 1e-12);
assert.ok(Math.abs(Math.max(...rates) - 0.07592800899887514) < 1e-12);
const output = {
  status: "source-original finite controlled negative for static three-ciphertext-predecessor GP29 substitutions; not a decipherment",
  alphabet: 29, observablePreviousRuneDepth: 3,
  independentSecretPermutationRows: STATE_COUNT,
  unknownRuneCount: 12956,
  original: source,
  plants: {
    trulyStationaryRandomBijectiveTableCountEach: STATE_COUNT,
    nativeEnglishBooks: plants.length,
    exactForwardInverseRuneCountEach: 12791,
    minimumConditionalEquality: Math.min(...rates),
    maximumConditionalEquality: Math.max(...rates),
    meanConditionalEquality: rates.reduce((sum, x) => sum + x, 0) /
      rates.length,
    betterThanOriginal: plants.filter(p =>
      p.coincidence > source.coincidence).length,
    trials: plants
  },
  limitations: "English-source and random-key calibration; cannot disprove arbitrary specially tailored plaintext, evolving key/state, other symbol representation or a fourth previous-ciphertext rune"
};
console.log(JSON.stringify(output, null, 2));
