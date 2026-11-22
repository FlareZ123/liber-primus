"use strict";

/**
 * A fixed 16-step GF(29) ciphertext-feedback inversion selected by the
 * physically printed p15 Fibonacci-prime spiral. Tests the untouched p16-p22
 * continuation; no fitted key, phase, English words, or language score.
 *
 * Model: c[i] = c[i-1] + k[(i-1)%16] * (p[i-1]+1) (mod 29).
 * The plaintext EA rune (index 28) produces a zero ciphertext step.
 *
 * Run as a single file with Node.js 22. No dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const modulus = 29;
const mod = (x) => ((x % modulus) + modulus) % modulus;

/** @param {number} x Nonzero residue modulo 29. */
function inverse(x) {
  for (let y = 1; y < modulus; y++) if (mod(x * y) === 1) return y;
  throw new Error("The source key cannot be inverted");
}

/** @param {number[]} a GP29 indices. */
function ioc(a) {
  const counts = new Uint32Array(modulus);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/** Recover the 16 distinct Fibonacci labels, skipping the duplicated 1. */
function fibonacci() {
  const a = [0, 1, 2];
  while (a.length < 16) a.push(a[a.length - 1] + a[a.length - 2]);
  return a;
}

/** Return the one-based nth prime by exact integer trial division. */
function nthPrime(n) {
  let found = 0;
  for (let x = 2;; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) {
      prime = false;
      break;
    }
    if (prime && ++found === n) return x;
  }
}

const fibonacciIndices = fibonacci();
const primes = fibonacciIndices.map(f => nthPrime(f + 1));
const printedSpiral = primes.map(p => Math.abs(3301 - p));
assert.deepEqual(fibonacciIndices,
  [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]);
assert.deepEqual(primes,
  [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]);
assert.deepEqual(printedSpiral,
  [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
    3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]);

const original = corpus.pages.filter(p => p.page >= 16 && p.page <= 22)
  .flatMap(p => p.indices);
const authenticP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(original.length, 1744);
assert.equal(authenticP57.length, 95);

/**
 * @param {number[]} cipher Including the first, untreated initial rune.
 * @param {number[]} keys Sixteen source-specified nonzero GF29 residues.
 */
function decode(cipher, keys) {
  assert.equal(keys.length, 16);
  const inv = keys.map(inverse);
  return cipher.slice(1).map((x, i) =>
    mod(mod(x - cipher[i]) * inv[i % 16] - 1));
}

/**
 * Exact forward operation. Cipher initial is stored as part of the source
 * register, not inferred from the native text plant.
 * @param {number[]} plain GP29 runes, excluding the first initial.
 * @param {number[]} keys Source 16-position spiral.
 * @param {number} initial Source register initial rune.
 */
function encode(plain, keys, initial) {
  const cipher = [initial];
  for (let i = 0; i < plain.length; i++) {
    cipher.push(mod(cipher[i] + keys[i % 16] * (plain[i] + 1)));
  }
  return cipher;
}

const keys = [
  ["generated-primes", primes],
  ["prime-totients", primes.map(p => p - 1)],
  ["printed-absolute-values", printedSpiral]
];
const rows = [];
const nativePlant = Array.from({length: original.length - 1},
  (_, i) => authenticP57[i % authenticP57.length]);

for (const [source, values] of keys) {
  for (const reversed of [false, true]) {
    const sequence = (reversed ? values.slice().reverse() : values).map(mod);
    assert.ok(sequence.every(k => k > 0 && k < 29));
    const recovered = decode(original, sequence);
    assert.deepEqual(encode(recovered, sequence, original[0]), original);
    const plantCipher = encode(nativePlant, sequence, original[0]);
    assert.deepEqual(decode(plantCipher, sequence), nativePlant);
    rows.push({
      source, reversed, decodedRunes: recovered.length,
      decodedIoC: ioc(recovered),
      sameStepAsEA: recovered.filter(x => x === 28).length,
      opening: recovered.slice(0, 40).map(i => corpus.translit[i]).join("")
    });
  }
}

const reference = [
  0.03543384625923737, 0.03560181351945423,
  0.03550103316332412, 0.03562750262984034,
  0.03553133313967696, 0.03548390708973338
];
assert.equal(rows.length, reference.length);
for (let i = 0; i < rows.length; i++) {
  assert.ok(Math.abs(rows[i].decodedIoC - reference[i]) < 1e-12);
  assert.equal(rows[i].sameStepAsEA, 10);
}
assert.ok(rows.every(x => x.decodedIoC < 0.036));
assert.ok(ioc(authenticP57) > 0.062 && ioc(authenticP57) < 0.063);

console.log(JSON.stringify({
  hypothesis: "source-16-key GF29 multiplicative ciphertext feedback",
  source: "p15 4x4 Fibonacci-prime spiral, untouched physical pp16-22",
  originalRuneCount: original.length,
  originalIoC: ioc(original),
  sourceNativeP57IoC: ioc(authenticP57),
  exactNativePlantRecovered: nativePlant.length * rows.length,
  exactOriginalForwardPositions: original.length * rows.length,
  models: rows,
  verdict: "Six fully source-specified inverses produce no sustained GP-native plaintext; period-16 feedback family rejected only in its stated scope."
}, null, 2));
