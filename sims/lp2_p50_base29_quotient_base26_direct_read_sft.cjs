"use strict";

/**
 * Single-file test: LP2 p49–51 H×G quotient as a BASE29 integer.
 * The historical Cicada 2013 example explicitly used BASE29; a natural
 * downstream plaintext register is ordinary unspaced radix-26 Latin.
 * Reads original-derived repository resources only and writes no files.
 * Tested against original table bytes and a genuine solved p57 text plant.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function multiplyAscending(left, right) {
  const out = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      out[i + j] = mod29(out[i + j] + left[i] * right[j]);
    }
  }
  return out;
}

// Signed 2013 BASE29(3301)=3QO, read as [3,26,24] ascending;
// original physical p39 red GP indices [27,5,15], also ascending.
const H = [3, 26, 24];
const G = [27, 5, 15];
const divisor = multiplyAscending(H, G).reverse();
assert.deepEqual(divisor, [12, 17, 11, 21, 23]);

/**
 * @param {number[]} coefficients Descending original GF29 coefficients
 * @returns {{quotient:number[],remainder:number[]}}
 */
function quotientHG(coefficients) {
  assert.equal(coefficients.length, 256);
  const rem = coefficients.map(mod29);
  const quotient = [];
  const inverseLeading = 17; // 12*17 = 1 mod 29.
  for (let i = 0; i < 252; i++) {
    const q = mod29(rem[i] * inverseLeading);
    quotient.push(q);
    for (let j = 0; j < divisor.length; j++) {
      rem[i + j] = mod29(rem[i + j] - q * divisor[j]);
    }
    assert.equal(rem[i], 0);
  }
  return { quotient, remainder: rem.slice(-4) };
}

/** @param {number[]} digits @param {number} radix @returns {bigint} */
function fromDigits(digits, radix) {
  return digits.reduce((n, digit) => {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < radix);
    return n * BigInt(radix) + BigInt(digit);
  }, 0n);
}

/** @param {bigint} integer @param {number} radix @returns {number[]} */
function toDigits(integer, radix) {
  assert.ok(integer >= 0n);
  if (integer === 0n) return [0];
  const result = [];
  for (let n = integer; n !== 0n; n /= BigInt(radix)) {
    result.push(Number(n % BigInt(radix)));
  }
  return result.reverse();
}

/** @param {number[]} quotient @returns {string} */
function toLatin26(quotient) {
  return toDigits(fromDigits(quotient, 29), 26)
    .map((d) => String.fromCharCode(65 + d)).join("");
}

/** @param {number[]} quotient @returns {number[]} */
function toBytes(quotient) {
  return toDigits(fromDigits(quotient, 29), 256);
}

/** @param {string} latin @returns {number} */
function coincidence(latin) {
  const counts = Array(26).fill(0);
  for (const ch of latin) {
    const i = ch.charCodeAt(0) - 65;
    assert.ok(i >= 0 && i < 26);
    counts[i]++;
  }
  return counts.reduce((sum, v) => sum + v * (v - 1), 0)
    / (latin.length * (latin.length - 1));
}

/** @param {string} latin @param {number} size @returns {number[]} */
function toPadded29(latin, size) {
  let n = fromDigits([...latin].map((ch) => ch.charCodeAt(0) - 65), 26);
  const digits = Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n, "Latin plant does not fit original source capacity");
  return digits;
}

/** @param {number[]} quotient @returns {number[]} */
function convolveHG(quotient) {
  assert.equal(quotient.length, 252);
  const output = Array(256).fill(0);
  for (let i = 0; i < quotient.length; i++) {
    for (let j = 0; j < divisor.length; j++) {
      output[i + j] = mod29(output[i + j] + quotient[i] * divisor[j]);
    }
  }
  return output;
}

assert.equal(grid.bytes.length, 256);
const sourceHash = crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex");
assert.equal(sourceHash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const source = quotientHG(grid.bytes);
assert.deepEqual(source.remainder, [0, 0, 0, 0]);
assert.deepEqual(source.quotient.slice(0, 16), [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]);

const forward = toLatin26(source.quotient);
const reversed = toLatin26([...source.quotient].reverse());
const fBytes = toBytes(source.quotient);
const rBytes = toBytes([...source.quotient].reverse());
assert.equal(forward.length, 260);
assert.equal(reversed.length, 260);
assert.ok(Math.abs(coincidence(forward) - 0.03926343926343926) < 1e-13);
assert.ok(Math.abs(coincidence(reversed) - 0.038461538461538464) < 1e-13);
assert.equal(fBytes.length, 153);
assert.equal(rBytes.length, 153);
assert.equal(Buffer.from(fBytes.slice(0, 24)).toString("hex"),
  "04598e588f3e70d4100f40d7489f9855a468a0d950156d2a");
assert.equal(Buffer.from(rBytes.slice(0, 24)).toString("hex"),
  "3ef7c86dc5ef7da8cd68d10456cd7049ae3af3a6cf3c9760");

// Genuine historical p57 plaintext, not a synthetic English string;
// only its exact solved GP transliteration is used for the positive plant.
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p57 && p57.indices.length === 95);
const clearLatin = p57.indices.map((index) => corpus.translit[index]).join("");
assert.match(clearLatin, /^[A-Z]+$/);
assert.ok(clearLatin.startsWith("PARABLE"));
const plant = clearLatin.repeat(3).slice(0, 245);
const plantedQuotient = toPadded29(plant, 252);
const plantedBytes = convolveHG(plantedQuotient);
assert.ok(plantedBytes.every((byte) => byte >= 0 && byte < 29));
const recovered = quotientHG(plantedBytes);
assert.deepEqual(recovered.remainder, [0, 0, 0, 0]);
assert.deepEqual(recovered.quotient, plantedQuotient);
assert.equal(toLatin26(recovered.quotient), plant);
assert.ok(coincidence(plant) > 0.055);

console.log(JSON.stringify({
  sourceSha256: sourceHash, originalCoefficients: 256,
  factor: divisor, quotientDigits: source.quotient.length,
  originalRemainder: source.remainder,
  latinForward: { length: forward.length, ioc: coincidence(forward), text: forward },
  latinReverse: { length: reversed.length, ioc: coincidence(reversed), text: reversed },
  base256Forward: { length: fBytes.length, first24hex: Buffer.from(fBytes.slice(0, 24)).toString("hex") },
  base256Reverse: { length: rBytes.length, first24hex: Buffer.from(rBytes.slice(0, 24)).toString("hex") },
  positive: { type: "solved-p57-native-Latin26", length: plant.length,
    ioc: coincidence(plant), exact: true }
}, null, 2));
