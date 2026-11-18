"use strict";

/**
 * Exact source-linked p39/Q240 predecessor-excluding GP28 inverse.
 *
 * Run: node sims/lp2_p39_q240_nonrepeat_original_sft.cjs
 * Native Windows Node.js >=22; read-only; no external libraries.
 *
 * Hypothesis only: the source-authenticated degree-16 GF29 divisor of the
 * original 256-byte grid yields 240 quotient digits. The exactly 240-rune
 * p39 page is the proposed target; its very rare repeats motivate a
 * reversible 28-option predecessor-exclusion receiver. Neither this
 * receiver nor the quotient-to-page assignment is author-confirmed.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const readJson = (filename) => JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", filename), "utf8"
));
const corpus = readJson("lp2-corpus.json");
const table = readJson("base60-grid.json");
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const mod = (n, p) => (n % p + p) % p;

/** @param {number[]} a ascending GF29 coefficients
 *  @param {number[]} b ascending GF29 coefficients */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j], 29);
  return out;
}

// Exact irreducible factorization, sourced to the original table:
const factors = [
  [25, 10, 1],                         // (X+5)^2, p39 red triad
  [11, 18, 1],                         // 2013 BASE29 factor
  [24, 16, 14, 1],                     // cubic
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1] // primitive nonic
];
const factor16 = factors.reduce(multiply, [1]);
assert.deepEqual(factor16, [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]);

// The source polynomial is highest-degree-first; divide it over GF29.
const remainder = bytes.map(value => value % 29).reverse();
const quotientLow = Array(240).fill(0);
for (let i = 239; i >= 0; i--) {
  const factor = remainder[i + 16];
  quotientLow[i] = factor;
  for (let j = 0; j <= 16; j++)
    remainder[i + j] = mod(remainder[i + j] - factor * factor16[j], 29);
}
assert(remainder.slice(0, 16).every(value => value === 0));
const quotientHigh = quotientLow.slice().reverse();
assert.deepEqual(quotientHigh.slice(0, 20),
  [0,28,18,14,3,2,14,21,7,27,23,2,3,2,25,26,24,0,16,12]);
const cipher = corpus.pages.find(page => page.page === 39).indices;
assert.equal(cipher.length, 240);

/**
 * Source-frozen, bijective GP29-to-GP28 nonrepeat receiver.
 * The first cipher rune is an explicit IV (excluded from English scoring).
 * The 29th plaintext symbol (28 = EA) repeats the previous output rune.
 * @param {number[]} input source ciphertext, including IV
 * @param {number[]} key source 240-digit coefficient vector
 * @param {number} sign signed quotient direction
 * @returns {number[]} 239 plaintext runes
 */
function decode(input, key, sign) {
  const out = [];
  for (let i = 1; i < input.length; i++) {
    const difference = mod(input[i] - input[i - 1], 29);
    out.push(difference === 0 ? 28 : mod(difference - 1 + sign * key[i], 28));
  }
  return out;
}

/** Forward replay from exact plaintext under the same IV and key.
 * @param {number[]} plain plaintext without IV
 * @param {number[]} key complete 240-digit quotient
 * @param {number} sign signed quotient direction
 * @param {number} iv first source cipher rune
 * @returns {number[]} ciphertext including IV
 */
function encode(plain, key, sign, iv) {
  const out = [iv];
  for (let i = 1; i <= plain.length; i++) {
    const p = plain[i - 1];
    const step = p === 28 ? 0 : 1 + mod(p - sign * key[i], 28);
    out.push(mod(out[out.length - 1] + step, 29));
  }
  return out;
}

/** @param {number[]} xs source GP indices */
function ioc(xs) {
  const bins = Array(29).fill(0);
  xs.forEach(x => bins[x]++);
  return bins.reduce((total, n) => total + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const planted = Array.from({length: 239}, (_, i) => native[i % native.length]);
const output = [];
for (const reversed of [false, true]) {
  const key = reversed ? quotientHigh.slice().reverse() : quotientHigh;
  for (const sign of [-1, 1]) {
    const recovered = decode(cipher, key, sign);
    assert.deepEqual(encode(recovered, key, sign, cipher[0]), cipher,
      "Complete forward reconstruction of all original ciphertext runes");
    const encodedPlant = encode(planted, key, sign, cipher[0]);
    assert.deepEqual(decode(encodedPlant, key, sign), planted,
      "Independent 239-rune native GP plaintext plant");
    const doublets = recovered.filter(x => x === 28).length;
    assert.equal(doublets, 1);
    const result = {
      reversed, sign, ioc: ioc(recovered),
      plaintextEA: doublets,
      preview: recovered.slice(0, 95).map(x => corpus.translit[x]).join("")
    };
    output.push(result);
    console.log(JSON.stringify(result));
  }
}
assert.deepEqual(output.map(x => Number(x.ioc.toFixed(12))), [
  0.034879223656, 0.036004359903, 0.034597939594, 0.035758236349
]);
console.log("No source-key/GP28 variant yields sustained original unknown-page plaintext.");
