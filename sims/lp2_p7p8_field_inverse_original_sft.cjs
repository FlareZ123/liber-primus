"use strict";

/**
 * P7-red quartic / p8 XIXM four-symbol finite-field inversion gate.
 * Reproduces one frozen, reversible, NONLINEAR GF(29^4) decoder.
 * Source-local idea only: no first-party instruction selects field inversion.
 * SFT: node sims/lp2_p7p8_field_inverse_original_sft.cjs
 * Node 22/CommonJS, read-only, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
/** @param {number} p @returns {number[]} */
function page(p) {
  const found = source.pages.find(v => v.page === p);
  assert.ok(found, "missing physical LP2 page " + p);
  return found.indices;
}
const MOD = 29;
const ONE = [1, 0, 0, 0];
const ZERO = [0, 0, 0, 0];
const P7 = [11, 26, 8, 15, 2];
const MONIC = [20, 13, 4, 22, 1];
const SEED = page(8).slice(0, 4);
assert.deepEqual(SEED, [14, 10, 14, 19]);
assert.deepEqual(page(8).slice(0, 12),
  [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.equal(page(8).length, 255);
assert.deepEqual(P7.map(x => x * 15 % MOD), MONIC);

/** @param {number} x @returns {number} */
function mod(x) { return (x % MOD + MOD) % MOD; }
/**
 * Multiply four-coefficient field elements modulo the monic p7 quartic.
 * The original p7 coefficient order is low first.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function mul(a, b) {
  assert.equal(a.length, 4);
  assert.equal(b.length, 4);
  const out = Array(7).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) out[i + j] += a[i] * b[j];
  for (let k = 6; k >= 4; k--) {
    const factor = mod(out[k]);
    for (let j = 0; j < 4; j++) out[k - 4 + j] -= factor * MONIC[j];
  }
  return out.slice(0, 4).map(mod);
}
/**
 * Exponentiation uses GF(29^4) field Fermat inversion x^(29^4-2).
 * Zero is explicitly fixed, making inversion a full field permutation.
 * @param {number[]} x @returns {number[]}
 */
function invert(x) {
  if (x.every(v => v === 0)) return ZERO.slice();
  let base = x.slice(), acc = ONE.slice(), exponent = MOD ** 4 - 2;
  while (exponent > 0) {
    if (exponent % 2 === 1) acc = mul(acc, base);
    exponent = Math.floor(exponent / 2);
    base = mul(base, base);
  }
  return acc;
}
/**
 * Frozen inverse P=inv(C)-XIXM, all four coordinates modulo29.
 * @param {number[]} cipher @returns {number[]}
 */
function decrypt(cipher) {
  return invert(cipher).map((v, j) => mod(v - SEED[j]));
}
/**
 * Exact reversible encryption C=inv(P+XIXM).
 * @param {number[]} plain @returns {number[]}
 */
function encrypt(plain) {
  return invert(plain.map((v, j) => mod(v + SEED[j])));
}
/**
 * @param {number[]} input @param {(block: number[]) => number[]} fn
 * @returns {number[]}
 */
function blocks(input, fn) {
  assert.equal(input.length % 4, 0);
  const result = [];
  for (let offset = 0; offset < input.length; offset += 4)
    result.push(...fn(input.slice(offset, offset + 4)));
  return result;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const x of values) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
function preview(values) {
  return values.slice(0, 64).map(n => source.translit[n]).join(" ");
}
const raw = page(8).slice(12).concat(
  ...Array.from({length: 6}, (_, i) => page(9 + i)));
assert.equal(raw.length, 1717);
assert.equal(page(8).slice(12).length, 243);
assert.deepEqual(page(9).slice(0, 5), [26, 7, 25, 6, 11]);
const cipher = raw.slice(0, 1716);
assert.equal(cipher.length % 4, 0);
const plain = blocks(cipher, decrypt);
assert.deepEqual(blocks(plain, encrypt), cipher);

for (let n = 1; n <= 100; n++) {
  const x = [n % 29, Math.floor(n / 29) % 29,
    Math.floor(n / 841) % 29, Math.floor(n / 24389) % 29];
  assert.deepEqual(mul(x, invert(x)), ONE);
}
assert.deepEqual(invert(ZERO), ZERO);
const knownNative = page(57).slice(0, 92);
const plant = blocks(knownNative, encrypt);
assert.deepEqual(blocks(plant, decrypt), knownNative);
const wrongSeed = SEED.map((x, i) => i === 0 ? mod(x + 1) : x);
const wronglyRecovered = blocks(plant,
  b => invert(b).map((v, j) => mod(v - wrongSeed[j])));
assert.notDeepEqual(wronglyRecovered, knownNative);
const metrics = (v) => ({runes:v.length, ioc:ioc(v), prefix:preview(v)});
console.log(JSON.stringify({
  hypothesis:"GF(29^4) inversion with fixed XIXM whitening, p7 monic quartic",
  source:"p7 five red-word products and p8 4-rune red title",
  source_p7_lowfirst:P7,
  source_p7_monic:MONIC,
  red_seed:SEED,
  original_black_p8_plus_p9_to_p14_runes:raw.length,
  processed_runes:plain.length,
  omitted_final_one_rune:raw.length - plain.length,
  exact_original_replay:true,
  native_p57_control:true,
  incorrect_seed_rejected:true,
  ciphertext:metrics(cipher),
  aligned_p8_and_carry:metrics(plain.slice(0, 248)),
  training_first300:metrics(plain.slice(0, 300)),
  withheld_next300:metrics(plain.slice(300, 600)),
  remaining:metrics(plain.slice(600)),
  entire_decoded:metrics(plain),
  conclusion:"Original output remains nonprose; no author-selected field inverse/key."
}, null, 2));
