"use strict";

/**
 * Source-fixed necessary-condition test, LP2 original pp40–55.
 * P15's adjacent spiral primes 463 and 829 correspond to the runeless
 * floral page p50 and its numeric-table ending p51, respectively.
 * Full floral length 3316 = 4 * 829 runes. A textbook RSA proposal
 * with modulus N=463*829 would require each four-GP29-digit packet <N.
 *
 * Test both literal 4x829 layouts and both digit significances with
 * all four possible framing residues. No ciphertext keys are sought.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const MODULUS = 463 * 829;
const PHI = (463 - 1) * (829 - 1);
const E = 3301;
const RADIX = 29;
const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.slice(40, 56);
const counts = [231, 273, 272, 274, 273, 270, 270, 274,
  271, 66, 0, 92, 263, 179, 232, 76];
assert.deepEqual(pages.map((p) => p.page), Array.from({ length: 16 }, (_, i) => 40 + i));
assert.deepEqual(pages.map((p) => p.indices.length), counts);
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 4 * 829);

/** @param {number} n */
function firstPrimes(n) {
  const out = [];
  for (let k = 2; out.length < n; k++) {
    if (out.every((p) => p * p > k || k % p !== 0)) out.push(k);
  }
  return out;
}

const F = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const printed = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const primes = firstPrimes(988);
const spiralPrime = F.map((f, i) => {
  assert.equal(Math.abs(3301 - primes[f]), printed[i]);
  return primes[f];
});
assert.equal(spiralPrime[10], 463);
assert.equal(spiralPrime[11], 829);
assert.equal(primes[462], printed[0]); // 463rd prime is red 3299.
assert.equal(pages[10].page, 50);
assert.equal(pages[10].indices.length, 0);
assert.equal(pages[11].page, 51);
assert.ok(MODULUS > RADIX ** 3 && MODULUS < RADIX ** 4);

/**
 * @param {number[]} digits
 * @param {"MSB"|"LSB"} significance
 */
function unpack(digits, significance) {
  const ordered = significance === "MSB" ? digits : digits.slice().reverse();
  return ordered.reduce((acc, digit) => RADIX * acc + digit, 0);
}

/**
 * @param {number} value
 * @param {"MSB"|"LSB"} significance
 */
function pack(value, significance) {
  let x = value;
  const output = Array(4);
  for (let i = 3; i >= 0; i--) {
    output[i] = x % RADIX;
    x = Math.floor(x / RADIX);
  }
  assert.equal(x, 0);
  return significance === "MSB" ? output : output.reverse();
}

/**
 * @param {number[]} stream
 * @param {number} phase
 * @param {"MSB"|"LSB"} significance
 */
function domainTest(stream, phase, significance) {
  let failures = 0;
  let firstFailure = null;
  for (let offset = phase; offset + 4 <= stream.length; offset += 4) {
    const digits = stream.slice(offset, offset + 4);
    const block = unpack(digits, significance);
    if (block >= MODULUS) {
      failures++;
      if (firstFailure === null) firstFailure = { offset, block, digits };
    }
  }
  return {
    packets: Math.floor((stream.length - phase) / 4),
    invalid: failures,
    firstFailure
  };
}

// Matrix row-major means all 829 positions of row 0 precede row 1.
// Matrix column-major means the four row positions of column 0 precede column 1.
const columnReadout = Array.from({ length: 829 }, (_, column) =>
  Array.from({ length: 4 }, (_, row) => original[row * 829 + column])).flat();
const samples = [];
for (const [layout, stream] of [["printed", original], ["four-row-column", columnReadout]]) {
  for (const significance of ["MSB", "LSB"]) {
    for (let phase = 0; phase < 4; phase++) {
      samples.push({
        layout, significance, phase,
        ...domainTest(stream, phase, significance)
      });
    }
  }
}
assert.equal(samples.length, 16);
const expected = {
  "printed|MSB": [416, 364, 396, 382],
  "printed|LSB": [380, 417, 364, 402],
  "four-row-column|MSB": [370, 407, 391, 390],
  "four-row-column|LSB": [392, 370, 403, 389]
};
for (const sample of samples) {
  const want = expected[sample.layout + "|" + sample.significance][sample.phase];
  assert.equal(sample.invalid, want);
  assert.ok(sample.invalid > 0);
}

/** @param {bigint} a @param {bigint} exponent @param {bigint} modulus */
function powmod(a, exponent, modulus) {
  let result = 1n;
  let base = a % modulus;
  let k = exponent;
  while (k > 0n) {
    if (k & 1n) result = result * base % modulus;
    base = base * base % modulus;
    k >>= 1n;
  }
  return result;
}

/** @param {number} a @param {number} b */
function invmod(a, b) {
  let [t, t1, r, r1] = [0, 1, b, a];
  while (r1 !== 0) {
    const q = Math.floor(r / r1);
    [t, t1] = [t1, t - q * t1];
    [r, r1] = [r1, r - q * r1];
  }
  assert.equal(r, 1);
  return (t % b + b) % b;
}
const D = invmod(E, PHI);
assert.equal(E * D % PHI, 1);
let planted = 0;
for (let i = 0; i < 829; i++) {
  const message = BigInt((1021 * i + 321) % MODULUS);
  const ciphertext = powmod(message, BigInt(E), BigInt(MODULUS));
  const plaintext = powmod(ciphertext, BigInt(D), BigInt(MODULUS));
  assert.equal(plaintext, message);
  for (const significance of ["MSB", "LSB"]) {
    const packed = pack(Number(ciphertext), significance);
    assert.equal(unpack(packed, significance), Number(ciphertext));
    assert.ok(unpack(packed, significance) < MODULUS);
  }
  planted++;
}
console.log(JSON.stringify({
  sourcePages: "40..55", fullRuneCount: original.length,
  floralRunelessPage: 50, sourceAdjacentSpiralIndices: [10, 11],
  sourcePrimes: [463, 829], targetModulus: MODULUS,
  fourRuneRadix29Limit: RADIX ** 4, positivePlantCount: planted,
  possiblePublicExponent: E, positivePlantPrivateExponent: D, samples
}, null, 2));
