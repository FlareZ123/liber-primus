"use strict";

/**
 * Reproduce the signed 2016 message's native OpenPGP SHA-1 digest, and test
 * its clue-constrained base-29 direct use on physical LP2 page 32.
 *
 * Standalone Node.js 22 SFT; reads only checked-in source files. A successful
 * signature hash prefix and cipher round-trip are implementation checks,
 * not evidence that the digest was a historical Liber Primus key.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const source = read("resources/historical/cicada2016-4gq25-outguess.asc");
const historicalKey = read("resources/historical/cicada-3301-2012-public-key.asc");
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const prime = corpus.prime;

function parseSignature() {
  const match = source.match(/-----BEGIN PGP SIGNATURE-----\r?\nVersion: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----END PGP SIGNATURE-----/u);
  assert.ok(match, "armored 2016 signature present");
  const base64 = match[1].split(/\r?\n/u).filter((line) => line && !line.startsWith("=")).join("");
  const packet = Buffer.from(base64, "base64");
  assert.equal(packet.length, 543, "exact single-packet binary length");
  assert.equal((packet[0] >> 2) & 15, 2, "old-format OpenPGP signature packet tag");
  assert.equal(packet[0] & 3, 1, "two-octet packet length encoding");
  assert.equal(packet.readUInt16BE(1), 540, "signature body length");
  const body = packet.subarray(3);
  assert.equal(body.length, 540);
  assert.deepEqual(Array.from(body.subarray(0, 4)), [4, 1, 1, 2],
    "version-4 canonical-text RSA/SHA1");
  const hashedLength = body.readUInt16BE(4);
  assert.equal(hashedLength, 6);
  const hashed = body.subarray(6, 6 + hashedLength);
  assert.equal(hashed.toString("hex"), "05025685c1c3",
    "only hashed subpacket is signed creation time");
  const unhashedStart = 6 + hashedLength;
  const unhashedLength = body.readUInt16BE(unhashedStart);
  const unhashed = body.subarray(unhashedStart + 2, unhashedStart + 2 + unhashedLength);
  assert.equal(unhashed.toString("hex"), "0910181f01e57a35090f",
    "only unhashed subpacket is issuer key ID");
  const hashPrefixOffset = unhashedStart + 2 + unhashedLength;
  const hashPrefix = body.subarray(hashPrefixOffset, hashPrefixOffset + 2);
  assert.equal(hashPrefix.toString("hex"), "f065");
  const mpiBits = body.readUInt16BE(hashPrefixOffset + 2);
  assert.equal(mpiBits, 4094);
  assert.equal(body.subarray(hashPrefixOffset + 4).length, 512,
    "RSA signature MPI occupies the remaining bytes");
  return {body, hashedLength, hashPrefix, signatureValue: body.subarray(hashPrefixOffset + 4)};
}

function verified2012PublicKey() {
  const match = historicalKey.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----\r?\n([\s\S]*?)\r?\n-----END PGP PUBLIC KEY BLOCK-----/u);
  assert.ok(match, "historical public key source");
  const base64 = match[1].split(/\r?\n/u)
    .filter((line) => line && !line.startsWith("=") && !line.includes(":")).join("");
  const blob = Buffer.from(base64, "base64");
  assert.equal((blob[0] >> 2) & 15, 6, "public-key primary packet tag");
  assert.equal(blob[0] & 3, 1, "two-byte primary packet length");
  const nbytes = blob.readUInt16BE(1);
  assert.equal(nbytes, 525);
  const packet = blob.subarray(3, 3 + nbytes);
  assert.equal(packet[0], 4, "v4 primary PGP public key");
  assert.equal(packet[5], 1, "RSA primary algorithm");
  const modulusBits = packet.readUInt16BE(6);
  assert.equal(modulusBits, 4096);
  const modulus = packet.subarray(8, 8 + modulusBits / 8);
  const exponentStart = 8 + modulus.length;
  const exponentBits = packet.readUInt16BE(exponentStart);
  assert.equal(exponentBits, 17);
  const exponent = packet.subarray(exponentStart + 2, exponentStart + 5);
  assert.equal(exponent.toString("hex"), "010001");
  return crypto.createPublicKey({
    key: { kty: "RSA", n: modulus.toString("base64url"), e: exponent.toString("base64url") },
    format: "jwk",
  });
}

function canonicalSignedBytes() {
  const match = source.match(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/u);
  assert.ok(match, "OpenPGP cleartext-signed message");
  // RFC 4880 cleartext-signature canonical text: CRLF line endings and
  // trailing spaces/tabs discarded. The armor-delimiter newline is excluded.
  const canon = match[1].replace(/\r\n/gu, "\n")
    .split("\n").map((line) => line.replace(/[ \t]+$/gu, "")).join("\r\n");
  return Buffer.from(canon, "utf8");
}

function signatureHash(parsed) {
  const headerLength = 6 + parsed.hashedLength;
  const hashedHeader = parsed.body.subarray(0, headerLength);
  const trailer = Buffer.from([4, 255, 0, 0, 0, headerLength]);
  const digest = crypto.createHash("sha1")
    .update(canonicalSignedBytes()).update(hashedHeader).update(trailer).digest();
  assert.equal(digest.toString("hex"), "f065d7bfaa3963c313eec67bfe5496c491d0c26d");
  assert.deepEqual(digest.subarray(0, 2), parsed.hashPrefix,
    "computed signed SHA-1 prefix matches OpenPGP packet");
  // Historical 2012 primary public key fully verifies the 2016 source's RSA
  // signature, making the entire digest authentication meaningful.
  const publicKey = verified2012PublicKey();
  const signedBytes = Buffer.concat([canonicalSignedBytes(), hashedHeader, trailer]);
  assert.equal(crypto.verify("RSA-SHA1", signedBytes, publicKey, parsed.signatureValue), true,
    "complete 2016 RSA/SHA1 signature verification under original 2012 primary public key");
  const recoveredBlock = crypto.publicDecrypt(
    {key: publicKey, padding: crypto.constants.RSA_NO_PADDING}, parsed.signatureValue);
  const derDigestInfo = Buffer.from("3021300906052b0e03021a05000414", "hex");
  const tail = Buffer.concat([Buffer.from([0]), derDigestInfo, digest]);
  const expected = Buffer.concat([
    Buffer.from([0, 1]), Buffer.alloc(recoveredBlock.length - 2 - tail.length, 0xff), tail,
  ]);
  assert.deepEqual(recoveredBlock, expected,
    "RSA signature encodes only standard 0xFF PKCS#1 v1.5 padding and canonical SHA1");
  return digest;
}

function originalPage32Words() {
  const pages = transcript.replace(/\r\n/gu, "\n").split("\n%\n");
  const page = pages[32].replace(/\/\n/gu, "").replace(/\n/gu, "");
  const words = page.match(/[\u16a0-\u16ff]+/gu) || [];
  assert.equal(words.length, 22, "p32 has 22 printed words");
  const indices = [...words.join("")].map((r) => {
    assert.ok(alphabet.has(r), "every original rune has a GP index");
    return alphabet.get(r);
  });
  assert.deepEqual(indices, corpus.pages[32].indices);
  const sums = words.map((w) => [...w].reduce((n, r) => n + prime[alphabet.get(r)], 0));
  assert.deepEqual(sums.slice(0, 8), [73, 125, 267, 613, 191, 184, 14, 540]);
  assert.equal(words.slice(0, 7).join("").length, 33);
  assert.equal([...words[7]].length, 11);
  assert.equal(sums.slice(0, 7).reduce((x, y) => x + y, 0), 1467);
  assert.equal(sums.reduce((x, y) => x + y, 0), 6045);
  console.log("p32 22 printed word GP-prime sums:", sums.join(","));
  console.log("p32 first sentence 33 runes, seventh sum 14; next 11-rune row-word sum 540");
  return indices;
}

function base29Digits(digest) {
  let number = BigInt("0x" + digest.toString("hex"));
  const digits = [];
  while (number > 0n) {
    digits.unshift(Number(number % 29n));
    number /= 29n;
  }
  assert.equal(digits.length, 33);
  return digits;
}

function ioc(input) {
  const count = new Array(29).fill(0);
  for (const x of input) count[x]++;
  return count.reduce((sum, x) => sum + x * (x - 1), 0) / (input.length * (input.length - 1));
}

function run() {
  const parsed = parseSignature();
  const digest = signatureHash(parsed);
  const page = originalPage32Words();
  const key = base29Digits(digest);
  const full = corpus.pages.slice(0, 56)
    .filter((p) => p.runic_count > 0).flatMap((p) => p.indices);
  assert.equal(full.length, 12956);
  console.log("signed PGP digest:", digest.toString("hex"));
  console.log("digest base-29 digits (33):", key.join(","));
  console.log("unciphered global IoC:", ioc(full).toFixed(8));
  for (const reversed of [false, true]) {
    const pad = reversed ? key.slice().reverse() : key;
    for (const [name, f, inverse] of [
      ["cipher - key", (x, k) => x - k, (x, k) => x + k],
      ["cipher + key", (x, k) => x + k, (x, k) => x - k],
      ["key - cipher", (x, k) => k - x, (x, k) => k - x],
      ["Atbash - key", (x, k) => 28 - x - k, (x, k) => 28 - x - k],
    ]) {
      const decode = (text) => text.map((x, i) => (f(x, pad[i % pad.length]) + 290) % 29);
      const enc = (text) => text.map((x, i) => (inverse(x, pad[i % pad.length]) + 290) % 29);
      const original = decode(full);
      assert.deepEqual(enc(original), full, "exact original-input forward re-encryption");
      const first = decode(page.slice(0, 33));
      console.log(JSON.stringify({
        key: reversed ? "reverse" : "forward", direction: name,
        fullIoc: Number(ioc(original).toFixed(8)),
        first33: first.map((i) => corpus.translit[i]).join(""),
      }));
    }
  }
  console.log("No direct digest-key inverse yields source-native readable p32 text; all round-trips are key-blind.");
}
run();
