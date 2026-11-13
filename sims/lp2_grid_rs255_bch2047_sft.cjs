"use strict";
/**
 * Direct source-codeword gate for the original LP2 32x8 base60-byte table.
 *
 * Two historically intelligible uses of 256 printed bytes are considered:
 * (1) one byte outside a 255-byte conventional GF(256) Reed-Solomon block,
 *     or eight 32-byte / thirty-two 8-byte shortened RS codewords;
 * (2) one bit outside a 2047-bit primitive binary BCH length.
 *
 * The RS tests cover the QR GF(256) polynomial 0x11d and the AES polynomial
 * 0x11b, two byte roots used as an exact necessary condition for >=2 check
 * symbols, both byte/bit orders and both end-byte exclusions.
 * The interleaved test grants an arbitrary single common RS root, not merely
 * a guessed generator offset.
 *
 * The BCH test enumerates every primitive degree-11 polynomial and
 * checks roots alpha and alpha^3, the necessary t=2 BCH syndromes.
 * Eight layouts handle both byte traversal directions, both bit orders,
 * and either terminal bit removed.
 *
 * All tests retain the original 256 numeric bytes; no cipher plaintext is
 * inferred. Run: node sims/lp2_grid_rs255_bch2047_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const table = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "base60-grid.json"), "utf8"));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every(row => row.length === 8));
assert.deepEqual(bytes.slice(0, 4), [203, 231, 167, 186]);
assert.equal(bytes.at(-1), 80);

/** @param {number} a @param {number} b @param {number} poly */
function gf8Mul(a, b, poly) {
  let out = 0;
  while (b) {
    if (b & 1) out ^= a;
    b >>>= 1;
    a = ((a << 1) ^ ((a & 128) ? poly : 0)) & 255;
  }
  return out;
}
/** @param {number} a @param {number} exp @param {number} poly */
function gf8Pow(a, exp, poly) {
  let v = 1;
  while (exp) {
    if (exp & 1) v = gf8Mul(v, a, poly);
    a = gf8Mul(a, a, poly);
    exp >>>= 1;
  }
  return v;
}
/** Horner-evaluate one byte polynomial at x in GF256.
 * @param {number[]} coefficients @param {number} x @param {number} poly */
function gf8Eval(coefficients, x, poly) {
  let value = 0;
  for (const b of coefficients) value = gf8Mul(value, x, poly) ^ b;
  return value;
}
/** @param {number} b */
function reverseBits(b) {
  let r = 0;
  for (let i = 0; i < 8; i++) r = (r << 1) | ((b >>> i) & 1);
  return r;
}

let rsBlocks = 0, rsSingleSyndromeZeros = 0, rsDoubleRootPasses = 0;
let maximumCommonColumns = 0;
for (const poly of [0x11d, 0x11b]) {
  for (const omit of [0, 255]) {
    for (const backwards of [false, true]) {
      for (const bitReverse of [false, true]) {
        let block = bytes.filter((_, i) => i !== omit);
        if (backwards) block.reverse();
        if (bitReverse) block = block.map(reverseBits);
        for (const base of [2, 3]) {
          for (const firstExponent of [0, 1, 2]) {
            const roots = [firstExponent, firstExponent + 1,
              firstExponent + 2, firstExponent + 3];
            const synd = roots.map(k => gf8Eval(
              block, gf8Pow(base, k, poly), poly));
            rsSingleSyndromeZeros += synd.filter(x => x === 0).length;
            if (synd[0] === 0 && synd[1] === 0) rsDoubleRootPasses++;
            rsBlocks++;
          }
        }
      }
    }
  }
  for (const kind of ["columns", "rows"]) {
    for (const backwards of [false, true]) {
      const sequences = kind === "columns"
        ? Array.from({length: 8}, (_, column) => Array.from(
          {length: 32}, (_, row) => bytes[8 * row + column]))
        : Array.from({length: 32}, (_, row) => bytes.slice(
          row * 8, row * 8 + 8));
      if (backwards) sequences.forEach(s => s.reverse());
      let max = 0;
      for (let root = 0; root < 256; root++) {
        const equal = sequences.filter(s => gf8Eval(s, root, poly) === 0)
          .length;
        if (equal > max) max = equal;
      }
      if (kind === "columns") {
        maximumCommonColumns = Math.max(maximumCommonColumns, max);
        assert.ok(max < 8, "All eight source columns share an RS root");
      } else {
        assert.ok(max < 32, "All 32 source rows share an RS root");
      }
      console.log("RS interleave", {poly, kind, backwards, max});
    }
  }
}
assert.equal(rsBlocks, 96);
assert.equal(rsSingleSyndromeZeros, 0);
assert.equal(rsDoubleRootPasses, 0);
assert.equal(maximumCommonColumns, 1);

/** @param {number} value @param {number} poly */
function gf11X(value, poly) {
  return ((value << 1) ^ ((value & 1024) ? poly : 0)) & 2047;
}
/** @param {number} poly */
function isPrimitive11(poly) {
  let value = 1;
  for (let exp = 1; exp <= 2047; exp++) {
    value = gf11X(value, poly);
    if (value === 1) return exp === 2047;
  }
  return false;
}
/** @param {number} bits @param {number} poly */
function bchSyndromes(bits, poly) {
  let s1 = 0, s3 = 0;
  for (const b of bits) {
    s1 = gf11X(s1, poly) ^ b;
    s3 = gf11X(gf11X(gf11X(s3, poly), poly), poly) ^ b;
  }
  return [s1, s3];
}
const primitivePolys = [];
for (let low = 1; low < 2048; low += 2) {
  if (isPrimitive11(2048 | low)) primitivePolys.push(2048 | low);
}
assert.equal(primitivePolys.length, 176);
const layouts = [];
for (const backwards of [false, true]) {
  for (const lsbFirst of [false, true]) {
    for (const drop of ["first", "last"]) {
      const stream = backwards ? [...bytes].reverse() : [...bytes];
      const bits = [];
      for (const b of stream) for (let j = 0; j < 8; j++) {
        bits.push((b >>> (lsbFirst ? j : 7 - j)) & 1);
      }
      if (drop === "first") bits.shift();
      else bits.pop();
      assert.equal(bits.length, 2047);
      layouts.push(bits);
    }
  }
}
let bchSingleRootPasses = 0, bchDoubleRootPasses = 0;
for (const poly of primitivePolys) for (const bits of layouts) {
  const [a, b] = bchSyndromes(bits, poly);
  if (a === 0) bchSingleRootPasses++;
  if (b === 0) bchSingleRootPasses++;
  if (a === 0 && b === 0) bchDoubleRootPasses++;
}
assert.equal(layouts.length * primitivePolys.length, 1408);
assert.equal(bchSingleRootPasses, 0);
assert.equal(bchDoubleRootPasses, 0);

// Nonzero positive plants for both syndrome implementations.
// RS(255,253): g(x)=(x+1)(x+2)=x^2+3x+2 over GF(256).
const messageRS = new Array(253).fill(0);
messageRS[0] = 1;
messageRS.at(-1); // Keep the last coefficient of the message zero.
const rsPlant = new Array(255).fill(0);
for (let i = 0; i < messageRS.length; i++) {
  rsPlant[i] ^= messageRS[i];
  rsPlant[i + 1] ^= gf8Mul(messageRS[i], 3, 0x11d);
  rsPlant[i + 2] ^= gf8Mul(messageRS[i], 2, 0x11d);
}
assert.equal(gf8Eval(rsPlant, 1, 0x11d), 0);
assert.equal(gf8Eval(rsPlant, 2, 0x11d), 0);

/** @param {number} a @param {number} b @param {number} poly */
function gf11Mul(a, b, poly) {
  let value = 0;
  while (b) {
    if (b & 1) value ^= a;
    b >>>= 1;
    a = gf11X(a, poly);
  }
  return value;
}
/** @param {number} exponent @param {number} poly */
function minPoly(exponent, poly) {
  const powers = [];
  for (let e = exponent; !powers.includes(e); e = (e * 2) % 2047) {
    powers.push(e);
  }
  assert.equal(powers.length, 11);
  let coefficients = [1];
  for (const e of powers) {
    let root = 1;
    for (let j = 0; j < e; j++) root = gf11X(root, poly);
    const next = new Array(coefficients.length + 1).fill(0);
    for (let j = 0; j < coefficients.length; j++) {
      next[j] ^= gf11Mul(coefficients[j], root, poly);
      next[j + 1] ^= coefficients[j];
    }
    coefficients = next;
  }
  assert.ok(coefficients.every(x => x === 0 || x === 1));
  return coefficients.reduce((sum, value, i) => sum | (value << i), 0);
}
const testPoly = 0x805; // x^11 + x^2 + 1, a primitive polynomial.
assert.ok(isPrimitive11(testPoly));
const g1 = minPoly(1, testPoly), g3 = minPoly(3, testPoly);
let generator = 0;
for (let j = 0; j < 12; j++) if ((g1 >>> j) & 1) {
  generator ^= g3 << j;
}
assert.equal(Math.floor(Math.log2(generator)), 22);
const plantedNumber = BigInt(generator) << 500n;
const plantedBits = Array.from({length: 2047}, (_, i) => Number(
  (plantedNumber >> BigInt(2046 - i)) & 1n));
assert.deepEqual(bchSyndromes(plantedBits, testPoly), [0, 0]);
assert.ok(plantedBits.some(Boolean));

console.log("Source-gated direct codeword results", {
  originalBytes: bytes.length,
  rsBlocks, rsSingleSyndromeZeros, rsDoubleRootPasses,
  maximumCommonColumns,
  primitivePolynomials: primitivePolys.length,
  bitLayouts: layouts.length,
  bchTrials: layouts.length * primitivePolys.length,
  bchSingleRootPasses, bchDoubleRootPasses,
  rsPlantNonzero: rsPlant.some(Boolean),
  bchPlantNonzero: plantedBits.some(Boolean)
});
