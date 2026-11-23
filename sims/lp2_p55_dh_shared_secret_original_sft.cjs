"use strict";

/**
 * LP2 physical p55: 2013-style Diffie–Hellman *shared-secret* follow-through.
 * The inputs are the unmodified original p55 source runes and the separately
 * recovered full finite-field discrete logarithms. No CLI, network or writes.
 *
 * Scoped hypothesis: p55's page-local word-exterior/interior parse supplies a
 * field P and generator Q; the two conditionally posited public values are 8
 * and 43Q. No creator-authenticated operation makes these assumptions true.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const page = data.pages.find((p) => p.page === 55);
const expectedLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(page.indices.length, 76);
let offset = 1; // Real first p55 rune is carried from physical p54.
const sourceWords = expectedLengths.map((length) => {
  const word = page.indices.slice(offset, offset + length);
  assert.equal(word.length, length);
  offset += length;
  return word;
});
assert.equal(offset, 76);
const inside = sourceWords.flatMap((word) => word.slice(1, -1));
const outside = sourceWords.flatMap((word) => [word[0], word.at(-1)]);
assert.equal(inside.length, 43);
assert.equal(outside.length, 32);

/** @param {number[]} digits @returns {bigint} */
function number29(digits) {
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}

/** @param {bigint} value @param {number} length @returns {number[]} */
function digits29(value, length) {
  const digits = Array(length).fill(0);
  for (let i = length - 1; i >= 0; --i) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

/** @param {bigint} a @param {bigint} e @param {bigint} mod @returns {bigint} */
function power(a, e, mod) {
  let result = 1n;
  a %= mod;
  for (; e > 0n; e >>= 1n) {
    if (e & 1n) result = result * a % mod;
    a = a * a % mod;
  }
  return result;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const n of values) counts[n] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {string} */
function originalWordDisplay(values) {
  let cursor = 0;
  const words = sourceWords.map((word) => {
    const len = word.length - 2;
    const text = values.slice(cursor, cursor + len).map((index) => data.translit[index]).join("");
    cursor += len;
    return text;
  });
  assert.equal(cursor, values.length);
  return words.join(" | ");
}

const N = number29(inside);
const E = number29(outside);
assert.equal(N % 8n, 0n);
assert.equal(E % 43n, 0n);
const P = N / 8n;
const Q = E / 43n;
assert.equal(P, 63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q, 1268532719737981052966698570711268391040527137n);

const x8 = 14347449201966638813083683299370469317053765371148427588804751n;
const xE = 58027263295081800276048492624932826148348813312381561491440230n;
assert.equal(power(Q, x8, P), 8n);
assert.equal(power(Q, xE, P), E);

// The actual historical DH mathematical operation combines both participants'
// public/private powers to one shared group element.
const sharedFrom8 = power(8n, xE, P);
const sharedFromE = power(E, x8, P);
const sharedFromGenerator = power(Q, x8 * xE, P);
assert.equal(sharedFrom8, sharedFromE);
assert.equal(sharedFromE, sharedFromGenerator);
assert.equal(sharedFromE, 18534943457637434371337714419521892971722473566563310008765178n);

const key = digits29(sharedFrom8, 43);
const hypotheticalPlain = inside.map((v, i) => (v - key[i] + 29) % 29);
assert.deepEqual(hypotheticalPlain.map((v, i) => (v + key[i]) % 29), inside);
const sourceNativePositive = data.pages.find((p) => p.page === 57).indices.slice(0, 43);
assert.equal(sourceNativePositive.length, 43);
const planted = sourceNativePositive.map((v, i) => (v + key[i]) % 29);
assert.deepEqual(planted.map((v, i) => (v - key[i] + 29) % 29), sourceNativePositive);

assert.equal(Number(ioc(hypotheticalPlain).toFixed(8)), 0.03654485);
console.log(JSON.stringify({
  source: "original p55 76 GP29 runes, strict page-local 16-word shell",
  relation: "DH shared = Q^(x8*xE) mod P = 8^xE mod P = (43Q)^x8 mod P",
  shared_integer: sharedFrom8.toString(),
  shared_bits: sharedFrom8.toString(2).length,
  gp29_shared_key_ioc: ioc(key),
  p55_original_interior_subtraction_ioc: ioc(hypotheticalPlain),
  p55_original_word_preserving_readout: originalWordDisplay(hypotheticalPlain),
  exact_forward_reencryption: true,
  known_solved_p57_43_rune_positive: true,
  source_selected_DH_public_values: false,
  genuine_unknown_plaintext_recovered: false
}, null, 2));
