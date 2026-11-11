"use strict";

/**
 * Source-derived p36 key in GF(29^238), original 238-rune block multiplication,
 * and one source-motivated 144-byte fixed-width transport. Standalone:
 * node sims/p36_q238_direct_144byte_transport_sft.cjs
 *
 * The signed 2013 BASE29 command motivates conventional big-endian conversion.
 * 238 GP29 digits have 1156 bits of capacity, so a wholly arbitrary 144-byte
 * frame fits, while an arbitrary 145-byte frame does not. No guessed nonce,
 * selected plaintext score, bit offset, or compression family is fitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const pages = load("resources/liber-primus/lp2-corpus.json").pages;
const b = load("resources/liber-primus/base60-grid.json").byte_rows.flat();
assert.equal(crypto.createHash("sha256").update(Buffer.from(b)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const mod = x => ((x % 29) + 29) % 29;

/** @param {number[]} values @param {number[]} f */
function divideMonic(values, f) {
  const rest = values.slice(), quotient = [];
  for (let i = 0; i <= values.length - f.length; i++) {
    const v = rest[i];
    quotient.push(v);
    for (let j = 0; j < f.length; j++)
      rest[i + j] = mod(rest[i + j] - v * f[j]);
  }
  assert(rest.slice(-(f.length - 1)).every(x => x === 0));
  return quotient;
}
let poly = b.map(mod).slice(1);
for (const f of [
  [1, 5], [1, 5], [1, 18, 11], [1, 14, 16, 24],
  [1, 12, 20, 10, 5, 1, 9, 0, 15, 11]
]) poly = divideMonic(poly, f);
assert.equal(poly.length, 239);
assert.equal(poly[0], 28);
const n = 238;
const q = poly.map(x => mod(28 * x)).reverse();
assert.equal(q[n], 1);

/** @param {Int32Array} a @param {Int32Array} b */
function multiply(a, b) {
  const out = new Int32Array(2 * n - 1);
  for (let i = 0; i < n; i++) {
    const v = a[i];
    if (!v) continue;
    for (let j = 0; j < n; j++) out[i + j] += v * b[j];
  }
  for (let k = 2 * n - 2; k >= n; k--) {
    const v = mod(out[k]);
    if (v) for (let j = 0; j < n; j++)
      out[k - n + j] -= v * q[j];
  }
  const reduced = new Int32Array(n);
  for (let i = 0; i < n; i++) reduced[i] = mod(out[i]);
  return reduced;
}
/** @param {Int32Array} base @param {bigint} exponent */
function power(base, exponent) {
  let result = new Int32Array(n);
  result[0] = 1;
  while (exponent > 0n) {
    if (exponent & 1n) result = multiply(result, base);
    exponent >>= 1n;
    if (exponent) base = multiply(base, base);
  }
  return result;
}
/** @param {ArrayLike<number>} v */
function valueOf(v) {
  let z = 0n;
  for (let i = n - 1; i >= 0; i--) z = z * 29n + BigInt(v[i]);
  return z;
}
/** @param {bigint} z */
function digitsOf(z) {
  const out = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = Number(z % 29n);
    z /= 29n;
  }
  assert.equal(z, 0n);
  return out;
}
const bytes144 = 144;
const limit = 1n << 1152n;
const all = pages.filter(p => p.page < 56).flatMap(p => p.indices);
assert.equal(all.length, 12956);
const p36 = pages[36].indices;
assert.equal(p36.length, n);
const post36 = pages.slice(0, 37).reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(post36, 8944);
const fieldSize = 29n ** 238n;
assert(fieldSize > limit);
const signatures = [
  ["gzip", "1f8b"], ["bzip2", "425a68"], ["XZ", "fd377a585a00"],
  ["ZIP", "504b0304"], ["PNG", "89504e47"], ["7z", "377abcaf271c"],
  ["PDF", "25504446"], ["Zstd", "28b52ffd"]
];
const tests = [];
for (const [keyOrder, keyDigits] of [
  ["ascending", p36], ["descending", p36.slice().reverse()]
]) {
  const key = Int32Array.from(keyDigits);
  const inverse = power(key, fieldSize - 2n);
  const one = new Int32Array(n);
  one[0] = 1;
  assert.deepEqual(multiply(inverse, key), one);

  // A true byte-frame positive must recover the original 144 bytes exactly.
  const plain = Buffer.from("LIBER PRIMUS NATIVE BYTE CONTROL | ".repeat(5)
    .slice(0, bytes144), "ascii");
  assert.equal(plain.length, bytes144);
  const original = BigInt("0x" + plain.toString("hex"));
  assert(original < limit);
  const encrypted = multiply(key, digitsOf(original));
  assert.equal(valueOf(multiply(inverse, encrypted)), original);

  for (const [clock, start] of [["book", 0], ["after-p36", post36]]) {
    for (const [cipherOrder, reverse] of [
      ["ascending", false], ["descending", true]
    ]) {
      let frames = 0, fit144 = 0, bestPrintable = 0, validHeaders = 0;
      const first = [];
      for (let offset = start; offset + n <= all.length; offset += n) {
        const input = all.slice(offset, offset + n);
        const encoded = Int32Array.from(reverse ? input.reverse() : input);
        const decoded = multiply(inverse, encoded);
        assert.deepEqual(multiply(key, decoded), encoded);
        const x = valueOf(decoded);
        if (first.length < 3) first.push(x.toString(16).slice(0, 24));
        frames++;
        if (x >= limit) continue;
        fit144++;
        const h = x.toString(16).padStart(bytes144 * 2, "0");
        const printable = [...Buffer.from(h, "hex")]
          .filter(x => x >= 32 && x <= 126).length;
        bestPrintable = Math.max(bestPrintable, printable);
        if (signatures.some(([, magic]) => h.startsWith(magic)))
          validHeaders++;
      }
      tests.push({keyOrder, clock, cipherOrder, frames, fit144,
        bestPrintable, validHeaders, firstHeadersUnpadded: first,
        nativeByteFrameRecovered: true});
    }
  }
}
assert.deepEqual(tests.map(x => x.fit144), [4, 1, 0, 1, 2, 6, 0, 1]);
assert(tests.every(x => x.validHeaders === 0));
console.log(JSON.stringify({
  source: "p50 original 256-byte GF29 polynomial, p36 original 238-rune key",
  mechanism: "field multiplication inverse, fixed 238-digit / 144-byte frame",
  checkedOriginalCiphertextRunes: all.length,
  original144ByteCapacityCases: tests,
  decision: "All eight fixed source-key variants fail mandatory 144-byte capacity on nearly every original frame. A 144-byte native plaintext positive inverts exactly. This does not exclude 145-byte restricted or variable-rate encodings, or other source-selected field operations."
}, null, 2));
