"use strict";
/**
 * Historical Parable GP-prime clauses 1259,1031,1229 have ordinary prime
 * ordinals 205,173,201. Between ordinal 173 and 205 are exactly 32 primes
 * p174..p205, beginning at the historical 2014 magic-square prime 1033.
 *
 * Conditional test: take their 32 low bytes (or phi(p) low bytes) as
 * AES-256 key, decrypt 256 original printed LP2 table bytes in standard AES
 * modes with finite source-derived IVs. Never infer a key from test output.
 *
 * No original claim of plaintext or creator intent is implied.
 * Run: node sims/parable_prime32_grid_aes_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
assert.equal(source.bytes.length, 256);
assert.equal(source.shape.rows, 32);
assert.equal(source.shape.columns, 8);

/** @param {number} x */
function prime(x) {
  if (x < 2) return false;
  for (let y = 2; y * y <= x; y++) if (x % y === 0) return false;
  return true;
}
const primes = [];
for (let p = 2; primes.length < 205; p++) if (prime(p)) primes.push(p);
assert.deepEqual([primes[204], primes[172], primes[200]], [1259, 1031, 1229]);
assert.deepEqual([primes[173], primes[200], primes[204]], [1033, 1229, 1259]);
const interval = primes.slice(173, 205);
assert.equal(interval.length, 32);

const keys = [
  ["prime-lowbyte-forward", Buffer.from(interval.map(p => p % 256))],
  ["totient-lowbyte-forward", Buffer.from(interval.map(p => (p - 1) % 256))],
  ["prime-lowbyte-reverse", Buffer.from(interval.slice().reverse().map(p => p % 256))],
  ["totient-lowbyte-reverse", Buffer.from(interval.slice().reverse().map(p => (p - 1) % 256))]
];
const raw = Buffer.from(source.bytes);
const corrected = Buffer.from(raw);
for (const [at, before, after] of [
  [45, 107, 81], [50, 47, 21], [165, 18, 47],
  [172, 148, 174], [246, 198, 224]
]) {
  assert.equal(corrected[at], before);
  corrected[at] = after;
}
const ciphertexts = [["printed", raw], ["audited", corrected]];
const IVS = (data) => [
  ["zero", Buffer.alloc(16)],
  ["first16", data.subarray(0, 16)],
  ["last16", data.subarray(240)]
];
const MODES = ["ecb", "cbc", "cfb", "ofb", "ctr"];

/**
 * @param {Buffer} data
 * @param {Buffer} key
 * @param {string} mode
 * @param {Buffer|null} iv
 * @param {boolean} encrypt
 */
function transform(data, key, mode, iv, encrypt = false) {
  const algorithm = "aes-256-" + mode;
  const state = encrypt
    ? crypto.createCipheriv(algorithm, key, iv)
    : crypto.createDecipheriv(algorithm, key, iv);
  state.setAutoPadding(false);
  return Buffer.concat([state.update(data), state.final()]);
}

/** @param {Buffer} data */
function stats(data) {
  let print = 0, letters = 0, zeros = 0;
  for (const byte of data) {
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) print++;
    if ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122)) letters++;
    if (byte === 0) zeros++;
  }
  return {
    printable: print, letters, zeros,
    hasPGPHeader: data.includes(Buffer.from("-----BEGIN PGP")),
    hasGzip: data.subarray(0, 2).equals(Buffer.from([0x1f, 0x8b])),
    hasZip: data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
    hasPdf: data.subarray(0, 4).equals(Buffer.from("%PDF")),
    sha256: crypto.createHash("sha256").update(data).digest("hex")
  };
}
const results = [];
for (const [edition, ciphertext] of ciphertexts) {
  for (const [keyName, key] of keys) {
    assert.equal(key.length, 32);
    for (const mode of MODES) {
      for (const [ivName, ivData] of (mode === "ecb"
        ? [["none", null]] : IVS(ciphertext))) {
        const plain = transform(ciphertext, key, mode, ivData);
        assert.deepEqual(transform(plain, key, mode, ivData, true),
          ciphertext);
        results.push({
          edition, key: keyName, mode, iv: ivName, ...stats(plain)
        });
      }
    }
  }
}
assert.equal(results.length, 2 * 4 * (1 + 4 * 3));

// A true independent ASCII/PGP-like plant checks the exact tested AES family.
const exampleText = Buffer.from(
  "-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA256\n\n" +
  "PARABLE PRIME32 KEY-ORIGIN SOURCE-NATIVE KNOWN ANSWER.\n", "ascii");
const planted = Buffer.alloc(256, 0x20);
exampleText.copy(planted, 0);
const plantedCipher = transform(planted, keys[0][1], "cbc", Buffer.alloc(16), true);
const decoded = transform(plantedCipher, keys[0][1], "cbc", Buffer.alloc(16));
assert.deepEqual(decoded, planted);
const positive = stats(decoded);
assert.ok(positive.hasPGPHeader);
assert.equal(positive.printable, 256);
results.sort((a, b) => b.printable - a.printable);
const successes = results.filter(r => r.hasPGPHeader || r.hasGzip || r.hasZip || r.hasPdf);
console.log(JSON.stringify({
  evidence: "bounded original-input negative if no decipherment; no source instruction selects this AES construction",
  clausePrimeOrdinalsInTextOrder: [205, 173, 201],
  primeInterval: {startOrdinal:174, endOrdinal:205, startValue:1033, endValue:1259, count:32},
  tableCells: 256, checkedConfigurations: results.length,
  originalRecognizedHeaders: successes,
  originalMaxPrintable: results[0].printable,
  topResults: results.slice(0, 8),
  sourceNativePlant: {recoveredExactly:decoded.equals(planted), hasPGPHeader:positive.hasPGPHeader,
    printable:positive.printable}
}, null, 2));
