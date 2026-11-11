"use strict";

/**
 * Source-fixed RSA 3-to-4 GP29 lift gate for unsolved LP2.
 *
 * A four-GP-rune word represents c in [0, 29^4); the recoverable
 * quotient k = floor(c/N) is allowed to be 0, 1 or 2. The putative
 * RSA residue is c mod N, and its private inverse must fit exactly
 * THREE GP29 runes. This tests the entire ciphertext, not only c<N.
 *
 * Execute from the repository root: node sims/lp2_treeprime_rsa_lift_3to4_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const all = pages.flatMap((p) => p.indices);

const RADIX = 29n;
const N = 563n * 569n;
const PHI = 562n * 568n;
const EXPONENT = 3301n;
const PRIVATE_EXPONENT = 250557n;
const MAX_THREE = RADIX ** 3n;
const MAX_FOUR = RADIX ** 4n;

assert.equal(N, 320347n);
assert.equal(PHI, 319216n);
assert.equal((EXPONENT * PRIVATE_EXPONENT) % PHI, 1n);
assert.equal(pages.length, 55);
assert.equal(all.length, 12956);

/** @param {bigint} a @param {bigint} e @param {bigint} m */
function modPow(a, e, m) {
  let result = 1n;
  while (e > 0n) {
    if (e & 1n) result = result * a % m;
    a = a * a % m;
    e >>= 1n;
  }
  return result;
}

/** @param {number[]} symbols */
function toNumber(symbols) {
  return symbols.reduce((a, x) => a * RADIX + BigInt(x), 0n);
}

/** @param {bigint} num @param {number} length */
function toDigits(num, length) {
  const digits = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = Number(num % RADIX);
    num /= RADIX;
  }
  assert.equal(num, 0n);
  return digits;
}

/** @param {number[]} digits @param {number} phase @param {boolean} reverse */
function evaluate(digits, phase, reverse) {
  let valid = 0;
  let blocks = 0;
  let longest = 0;
  let run = 0;
  for (let i = phase; i + 3 < digits.length; i += 4) {
    const block = digits.slice(i, i + 4);
    if (reverse) block.reverse();
    const c = toNumber(block);
    const m = modPow(c % N, PRIVATE_EXPONENT, N);
    const quotient = c / N;
    assert(quotient >= 0n && quotient <= 2n);
    // Full RSA inverse is always valid: retain the original quotient.
    const encoded = modPow(m, EXPONENT, N) + quotient * N;
    assert.equal(encoded, c);
    const isValid = m < MAX_THREE;
    if (isValid) valid++;
    run = isValid ? run + 1 : 0;
    longest = Math.max(longest, run);
    blocks++;
  }
  return {valid, blocks, longest};
}

/** @param {string} text */
function gpEncode(text) {
  const symbols = new Map(corpus.translit.map((letter, i) => [letter, i]));
  const normalized = text.toUpperCase().replaceAll("QU", "CW")
    .replaceAll("V", "U").replaceAll("K", "C").replaceAll("Z", "S")
    .replace(/[^A-Z]/g, "");
  const encoded = [];
  for (let i = 0; i < normalized.length;) {
    const two = normalized.slice(i, i + 2);
    const letter = symbols.has(two) ? two : normalized[i];
    assert(symbols.has(letter), "missing GP symbol: " + letter);
    encoded.push(symbols.get(letter));
    i += letter.length;
  }
  return encoded;
}

// True solved-PARABLE source-language example, with synthetic RSA packing.
const known = gpEncode(
  "LIKE THE INSTAR TUNNELING TO THE SURFACE " +
  "WE MUST SHED OUR OWN CIRCUMFERENCES");
assert(known.length >= 50);
const plain = known.slice(0, Math.floor(known.length / 3) * 3);
const packed = [];
const preservedQuotients = [];
for (let i = 0; i < plain.length; i += 3) {
  const m = toNumber(plain.slice(i, i + 3));
  assert(m < MAX_THREE);
  const residue = modPow(m, EXPONENT, N);
  const suggested = BigInt((i / 3) % 3);
  const quotient = residue + suggested * N < MAX_FOUR ? suggested : 0n;
  const c = residue + quotient * N;
  packed.push(...toDigits(c, 4));
  preservedQuotients.push(quotient);
}
const decoded = [];
for (let i = 0; i < packed.length; i += 4) {
  const c = toNumber(packed.slice(i, i + 4));
  const m = modPow(c % N, PRIVATE_EXPONENT, N);
  assert(m < MAX_THREE);
  decoded.push(...toDigits(m, 3));
  assert.equal(c / N, preservedQuotients[i / 4]);
}
assert.deepEqual(decoded, plain);
assert.equal(evaluate(packed, 0, false).valid, packed.length / 4);

const expected = [
  [247, 3239, 2], [228, 3239, 3],
  [249, 3238, 3], [256, 3238, 3],
  [250, 3238, 3], [255, 3238, 3],
  [256, 3238, 2], [243, 3238, 4]
];
const original = [];
let ordinal = 0;
for (let phase = 0; phase < 4; phase++) {
  for (const reverse of [false, true]) {
    const found = evaluate(all, phase, reverse);
    assert.deepEqual([found.valid, found.blocks, found.longest], expected[ordinal++]);
    original.push({phase, reverse, ...found});
  }
}
const pageReset = [false, true].map((reverse) => {
  const sum = pages.map((p) => evaluate(p.indices, 0, reverse));
  return {reverse,
    valid: sum.reduce((a, r) => a + r.valid, 0),
    blocks: sum.reduce((a, r) => a + r.blocks, 0),
    longest: Math.max(...sum.map((r) => r.longest))};
});
assert.deepEqual(pageReset.map((p) => [p.valid, p.blocks]), [[253,3219], [230,3219]]);

console.log(JSON.stringify({
  model: "RSA 563x569; e=3301; three GP29 plaintext symbols/four ciphertext symbols",
  modulus: Number(N),
  maximumPlaintext: Number(MAX_THREE),
  maximumCiphertext: Number(MAX_FOUR),
  randomLegalFraction: Number(MAX_THREE) / Number(N),
  original, pageReset,
  positive: {inputRunes: plain.length, outputRunes: packed.length,
    recoveredRunes: decoded.length, quotientValues: preservedQuotients.map(Number)}
}, null, 2));
