"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Source-number-defined conditional RSA receiver against the literal
 * 32x8 Cicada 2014 256-byte numeral table. This does not claim the
 * historical artifacts instruct RSA; it tests that bounded possibility.
 */
const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const tokens = source.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const bytes = tokens.map(t => {
  assert.equal(t.length, 2);
  const digit0 = alphabet.indexOf(t[0]), digit1 = alphabet.indexOf(t[1]);
  assert(digit0 >= 0 && digit1 >= 0);
  return 60 * digit0 + digit1;
});
assert(bytes.every(x => x >= 0 && x < 256));
const factors = [1259n, 1031n, 1229n];
const n = factors.reduce((a, b) => a * b);
const e = 761n;
const phi = factors.reduce((a, p) => a * (p - 1n), 1n);
assert.equal(n, 1595277641n);
assert.equal(phi, 1591168720n);
/** @param {bigint} a @param {bigint} b */
function invmod(a, b) {
  let [u, v, x, y] = [1n, 0n, a, b];
  while (y) {
    const q = x / y;
    [x, y] = [y, x - q * y];
    [u, v] = [v, u - q * v];
  }
  assert.equal(x, 1n);
  return (u % b + b) % b;
}
const d = invmod(e, phi);
assert.equal(d, 190271161n);
assert.equal(e * d % phi, 1n);
/** @param {bigint} x @param {bigint} power @param {bigint} modulus */
function powmod(x, power, modulus) {
  let out = 1n;
  for (; power; power >>= 1n) {
    if (power & 1n) out = out * x % modulus;
    x = x * x % modulus;
  }
  return out;
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const clear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
const planted = Array.from({ length: 64 }, (_, i) => clear.slice(i % 15, i % 15 + 6)
  .reduce((x, y) => x * 29n + BigInt(y), 0n));
assert(planted.every(x => x < n));
assert(planted.every(x => powmod(powmod(x, e, n), d, n) === x));

const originalReads = [
  ["printed-row-major", bytes],
  ["printed-column-major", Array.from({ length: 8 }, (_, c) =>
    Array.from({ length: 32 }, (_, r) => bytes[8 * r + c])).flat()]
];
const results = [];
for (const [reading, arr] of originalReads) {
  for (const endianness of ["big-endian", "little-endian"]) {
    const words = Array.from({ length: 64 }, (_, k) =>
      Array.from({ length: 4 }, (_, j) => arr[4 * k + j])
        .reduce((sum, v, j) => sum + BigInt(v) * (256n ** BigInt(
          endianness === "big-endian" ? 3 - j : j)), 0n));
    const rejected = words.flatMap((v, i) => v >= n ? [i] : []);
    results.push({
      reading, endianness, total: words.length,
      allowed: words.length - rejected.length,
      impossible: rejected.length,
      firstImpossibleBlock: rejected[0],
      first4Values: words.slice(0, 4).map(v => v.toString())
    });
  }
}
assert.deepEqual(results.map(r => r.impossible), [45, 32, 43, 38]);
assert(results.every(r => r.impossible > 0));
console.log(JSON.stringify({
  status: "PASS",
  sourceMetadata: "2013 filename 761.mp3 and PARABLE ID3 label 1,595,277,641",
  conditionalOperation: "RSA n=product of 3 clear Parable prime clause sums, e=761",
  modulus: n.toString(), exponent: e.toString(), totient: phi.toString(),
  computedPrivateExponent: d.toString(),
  positive: "64/64 native p57-derived integer RSA encrypt-decrypt round trips",
  literal256ByteReceiver: "original LP2 p50 32x8 numeral table",
  originalBlockFamily: results,
  recoveredUnknownPlaintext: false
}, null, 2));
