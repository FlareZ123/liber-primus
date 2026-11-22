"use strict";
/**
 * Source-locked GF(29^238) inversion of LP2's original 238-rune p36.
 *
 * The original p49–51 table is factored into four already documented small
 * factors and its monic irreducible degree-238 residual Q. Interpret the
 * original p36 runes as a candidate field key A. For the other physical
 * pages, test the full reversible block transform A^-1*C mod Q, including
 * both coefficient orientations and original book/section clocks. Also
 * test the historically meaningful 3301 and 1033 exponent inverses.
 *
 * This model is a falsifiable candidate, not a recovered Cicada operation.
 * Node 22, built-in modules only. No network, writes, or key tuning.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const MOD = 29;
const DEGREE = 238;
const mod = x => (x % MOD + MOD) % MOD;
const inverse = Array(MOD).fill(0);
for (let n = 1; n < MOD; n++)
  for (let m = 1; m < MOD; m++)
    if (n * m % MOD === 1) inverse[n] = m;
assert(inverse.slice(1).every(Boolean));

/** @param {number[]} input @returns {number[]} */
function trim(input) {
  const a = input.slice();
  while (a.length > 1 && a[a.length - 1] === 0) a.pop();
  return a;
}
/** @param {number[]} a @param {number[]} b */
function ordinaryMultiply(a, b) {
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    if (a[i]) for (let j = 0; j < b.length; j++)
      if (b[j]) output[i + j] = mod(output[i + j] + a[i] * b[j]);
  return trim(output);
}
/** @param {number[]} a @param {number[]} b */
function subtract(a, b) {
  return trim(Array.from({length: Math.max(a.length, b.length)},
    (_, i) => mod((a[i] || 0) - (b[i] || 0))));
}
/** All arrays are ascending-power GF29 coefficients.
 * @param {number[]} source @param {number[]} divisor
 */
function divide(source, divisor) {
  const rem = trim(source);
  const q = Array(Math.max(1, rem.length - divisor.length + 1)).fill(0);
  for (let i = rem.length - divisor.length; i >= 0; i--) {
    const scale = mod(rem[i + divisor.length - 1] * inverse[divisor.at(-1)]);
    q[i] = scale;
    for (let j = 0; j < divisor.length; j++)
      rem[i + j] = mod(rem[i + j] - scale * divisor[j]);
  }
  return {quotient: trim(q), remainder: trim(rem.slice(0, divisor.length - 1))};
}

const SMALL_FACTORS = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
let q238 = trim(bytes.slice().reverse().map(mod));
for (const factor of SMALL_FACTORS) {
  const {quotient, remainder} = divide(q238, factor);
  assert(remainder.every(x => x === 0));
  q238 = quotient;
}
q238 = q238.map(x => mod(x * inverse[q238.at(-1)]));
assert.equal(q238.length, DEGREE + 1);
assert.equal(q238.at(-1), 1);
assert.equal(q238[0], 5);

/** Multiplication in GF(29)[X]/(Q238); output is always length 238.
 * @param {number[]} a @param {number[]} b
 */
function fieldMultiply(a, b) {
  const r = divide(ordinaryMultiply(a, b), q238).remainder;
  assert(r.length <= DEGREE);
  return r.concat(Array(DEGREE - r.length).fill(0));
}
/** Extended Euclid, with a fully unknown 238-symbol invertible field element.
 * @param {number[]} x
 */
function fieldInverse(x) {
  let r0 = q238, r1 = trim(x), s0 = [0], s1 = [1];
  while (r1.some(v => v !== 0)) {
    const d = divide(r0, r1);
    [r0, r1] = [r1, d.remainder];
    [s0, s1] = [s1, subtract(s0, ordinaryMultiply(d.quotient, s1))];
  }
  assert.equal(r0.length, 1);
  assert.notEqual(r0[0], 0);
  const r = divide(s0.map(v => mod(v * inverse[r0[0]])), q238).remainder;
  return r.concat(Array(DEGREE - r.length).fill(0));
}
/** @param {number[]} x @param {bigint} power */
function fieldPower(x, power) {
  let result = Array(DEGREE).fill(0);
  result[0] = 1;
  let base = x.slice();
  for (let exponent = power; exponent > 0n; exponent >>= 1n) {
    if ((exponent & 1n) !== 0n) result = fieldMultiply(result, base);
    if (exponent > 1n) base = fieldMultiply(base, base);
  }
  return result;
}
/** @param {bigint} a @param {bigint} modulus */
function modularInverse(a, modulus) {
  let u = a, v = modulus, x = 1n, y = 0n;
  while (v !== 0n) {
    const quotient = u / v;
    [u, v] = [v, u % v];
    [x, y] = [y, x - quotient * y];
  }
  assert.equal(u, 1n);
  return (x % modulus + modulus) % modulus;
}
/** @param {number[]} input */
function ioc(input) {
  const counts = Array(MOD).fill(0);
  for (const v of input) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {number[]} input */
function text(input) {
  return input.map(index => corpus.translit[index]).join("");
}
const keySource = corpus.pages.find(p => p.page === 36).indices;
assert.equal(keySource.length, DEGREE);
const pages = corpus.pages.filter(p => p.page < 56 &&
  p.page !== 36 && p.indices.length > 0);
const raw = pages.flatMap(p => p.indices);
assert.equal(raw.length, 12718);
const SECTIONS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const sections = SECTIONS.map(([lo, hi]) =>
  pages.filter(page => page.page >= lo && page.page <= hi)
    .flatMap(page => page.indices)).filter(Boolean);
/** @param {number[][]} groups @param {number[]} key
 * @param {boolean} reverse
 */
function blocks(groups, key, reverse) {
  const out = [];
  for (const group of groups)
    for (let start = 0; start < group.length; start += DEGREE) {
      const original = group.slice(start, start + DEGREE);
      // An incomplete terminal field block cannot be multiplied and
      // truncated without losing information. Keep it literal.
      if (original.length < DEGREE) {
        out.push(...original);
        continue;
      }
      const coeff = reverse ? original.reverse() : original;
      const decoded = fieldMultiply(coeff, key);
      if (reverse) decoded.reverse();
      out.push(...decoded);
    }
  return out;
}
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const positive = Array.from({length: DEGREE}, (_, i) => native[i % native.length]);
const controls = [];
const results = [];
for (const reverse of [false, true]) {
  const seed = reverse ? keySource.slice().reverse() : keySource.slice();
  const key = fieldInverse(seed);
  const identity = fieldMultiply(seed, key);
  assert.deepEqual(identity, [1, ...Array(DEGREE - 1).fill(0)]);
  const planted = fieldMultiply(positive, seed);
  assert.deepEqual(fieldMultiply(planted, key), positive);
  for (const [direction, factor] of [["inverse", key], ["forward", seed]])
    for (const [clock, groups] of [["book", [raw]], ["section", sections]]) {
      const result = blocks(groups, factor, reverse);
      assert.equal(result.length, raw.length);
      const opposite = direction === "inverse" ? seed : key;
      let offset = 0;
      const originalGroups = groups.map(group => {
        const window = result.slice(offset, offset + group.length);
        offset += group.length;
        return window;
      });
      assert.equal(offset, result.length);
      assert.deepEqual(blocks(originalGroups, opposite, reverse), raw);
      results.push({
        orientation: reverse ? "first-rune-high" : "first-rune-low",
        direction, clock, runeCount: result.length,
        ioc: ioc(result), prefix: text(result.slice(0, 52))
      });
    }
  const groupOrder = 29n ** 238n - 1n;
  for (const exponent of [3301, 1033]) {
    const e = BigInt(exponent), decryptExponent = modularInverse(e, groupOrder);
    const candidate = fieldPower(seed, decryptExponent);
    assert.deepEqual(fieldPower(candidate, e), seed);
    const ciphertextControl = fieldPower(positive, e);
    assert.deepEqual(fieldPower(ciphertextControl, decryptExponent), positive);
    controls.push({orientation: reverse ? "first-rune-high" : "first-rune-low",
      exponent, ioc: ioc(candidate), prefix: text(candidate.slice(0, 52)),
      originalForwardReplay: true, nativePlantRecovered: true});
  }
}
assert.equal(results.length, 8);
assert.equal(controls.length, 4);
assert(results.every(x => x.ioc < 0.035));
console.log(JSON.stringify({
  source: "LP2 p36 and p49–51 exactly factorized original table",
  field: "GF(29^238)", smallFactors: SMALL_FACTORS,
  keyPage: 36, sourceKeyLength: keySource.length,
  otherOriginalRunes: raw.length, originalIoc: ioc(raw),
  nativePlantIoc: ioc(positive), results, exponentRoots: controls,
  interpretation: "Source-shaped Hill238 blocks and 3301/1033 field exponent inverses do not recover authentic native-GP plaintext"
}, null, 2));
