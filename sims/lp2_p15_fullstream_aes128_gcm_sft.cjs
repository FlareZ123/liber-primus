"use strict";
/**
 * Original LP2 GP29 integer to AES-128-GCM authentication, with candidate
 * AES-128 keys supplied by the p15 Fibonacci-prime sixteen-cell square.
 * Authenticated plaintext, if any, must be accepted by a full 128-bit tag.
 * Source-ordered input and nonce12|body7840|tag16 framing are frozen.
 *
 * Run: node sims/lp2_p15_fullstream_aes128_gcm_sft.cjs
 * @module lp2_p15_fullstream_aes128_gcm_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash, createCipheriv, createDecipheriv} = require("node:crypto");
const {deriveKeys} = require("./fibonacci_aes128_grid_key.cjs");
const ROOT = path.resolve(__dirname, "..");

/** @param {number[]} source GP29 runes in original physical order. */
function minimalBigEndianBase29(source) {
  assert.ok(source.length > 0);
  let integer = 0n;
  for (const digit of source) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    integer = integer * 29n + BigInt(digit);
  }
  const hex = integer.toString(16);
  return Buffer.from(hex.length % 2 === 0 ? hex : "0" + hex, "hex");
}

/** @returns {Buffer} Source-ordered original p0..55, including no rune on p50. */
function original() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const symbols = corpus.pages.filter(page => page.page < 56)
    .flatMap(page => page.indices);
  assert.equal(symbols.length, 12956);
  const binary = minimalBigEndianBase29(symbols);
  assert.equal(binary.length, 7868);
  assert.equal(createHash("sha256").update(binary).digest("hex"),
    "c6eae1335b7809becbdb6a2bc9895a1efbfe705adf75d6990bc4aaf37b41ad62");
  return binary;
}

/** @param {Buffer} key @param {Buffer} nonce
 * @param {Buffer} ciphertext @param {Buffer} tag */
function authenticate(key, nonce, ciphertext, tag) {
  const decoder = createDecipheriv("aes-128-gcm", key, nonce,
    {authTagLength: 16});
  decoder.setAuthTag(tag);
  return Buffer.concat([decoder.update(ciphertext), decoder.final()]);
}

/** @param {Buffer} key */
function plantControl(key) {
  const plain = fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/lp1-plaintext-reference.txt")).subarray(0, 256);
  assert.equal(plain.length, 256);
  const nonce = Buffer.from("000102030405060708090a0b", "hex");
  const cipher = createCipheriv("aes-128-gcm", key, nonce,
    {authTagLength: 16});
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  assert.deepEqual(authenticate(key, nonce, encrypted, tag), plain);
  const altered = Buffer.from(tag);
  altered[0] ^= 1;
  assert.throws(() => authenticate(key, nonce, encrypted, altered),
    /authenticat|decrypt|bad decrypt|unable/i);
  return {source:"solved LP1 reference bytes", recovered:256,
    exact:true, alteredTagRejected:true};
}

/** Perform the finite original-input authentication challenge. */
function main() {
  const input = original();
  const nonce = input.subarray(0, 12);
  const ciphertext = input.subarray(12, input.length - 16);
  const tag = input.subarray(input.length - 16);
  assert.equal(ciphertext.length, 7840);
  const keys = deriveKeys().keys;
  assert.equal(keys.length, 40);
  const plant = plantControl(keys[0].key);
  let rejects = 0;
  const accepted = [];
  for (const {name, key} of keys) {
    try {
      const plain = authenticate(key, nonce, ciphertext, tag);
      accepted.push({key:name, length:plain.length,
        sha256:createHash("sha256").update(plain).digest("hex"),
        prefix:plain.subarray(0,128).toString("utf8")});
    } catch (error) {
      if (!/authenticat|decrypt|bad decrypt|unable/i.test(String(error.message)))
        throw error;
      rejects++;
    }
  }
  assert.equal(rejects + accepted.length, keys.length);
  const result = {
    input:"physical LP2 p0..55 canonical GP29 integer",
    sourceRuneCount:12956, serializedBytes:input.length,
    envelope:"nonce12/body7840/tag16", keySource:"p15 4x4 Fibonacci prime numerals",
    attemptedKeys:keys.map(item => item.name),
    authenticated:accepted, rejected:rejects, control:plant
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main === module) main();
module.exports = {minimalBigEndianBase29, original, authenticate,
  plantControl, main};
