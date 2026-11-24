#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

function armor(text, label) {
  const begin = "-----BEGIN PGP " + label + "-----";
  const end = "-----END PGP " + label + "-----";
  const a = text.indexOf(begin);
  const b = text.indexOf(end, a + begin.length);
  assert(a >= 0 && b > a, "missing armor: " + label);
  const lines = text.slice(a + begin.length, b).split(/\r?\n/);
  while (lines.length && lines[0].trim() === "") lines.shift();
  const blank = lines.findIndex((x) => x.trim() === "");
  assert(blank >= 0, "missing armor separator");
  return Buffer.from(lines.slice(blank + 1).filter((x) => x && !x.startsWith("=")).join(""), "base64");
}

function firstPacket(buf) {
  let p = 0;
  const start = p;
  const h = buf[p++];
  assert((h & 0x80) !== 0, "invalid packet header");
  let tag, length;
  if (h & 0x40) {
    tag = h & 0x3f;
    const x = buf[p++];
    if (x < 192) length = x;
    else if (x < 224) length = ((x - 192) << 8) + buf[p++] + 192;
    else if (x === 255) { length = buf.readUInt32BE(p); p += 4; }
    else throw new Error("partial packet length not expected");
  } else {
    tag = (h >> 2) & 15;
    const t = h & 3;
    if (t === 0) length = buf[p++];
    else if (t === 1) { length = buf.readUInt16BE(p); p += 2; }
    else if (t === 2) { length = buf.readUInt32BE(p); p += 4; }
    else length = buf.length - p;
  }
  const body = buf.subarray(p, p + length);
  assert.equal(body.length, length, "truncated packet");
  return { tag, body, totalLength: p - start + length };
}

function mpi(buf, p) {
  const bits = buf.readUInt16BE(p);
  const bytes = Math.ceil(bits / 8);
  return { bits, bytes: buf.subarray(p + 2, p + 2 + bytes), next: p + 2 + bytes };
}

const table = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8"));
const alphabet = table.alphabet;
assert.equal(alphabet.length, 60);
assert.deepEqual(table.pages.map((x) => x.page), [49, 50, 51]);
assert.deepEqual(table.pages.map((x) => x.tokens.length), [80, 104, 72]);
const tokens = table.pages.flatMap((x) => x.tokens);
assert.equal(tokens.length, 256);
assert.equal(table.byte_count, 256);
const values = tokens.map((token, i) => {
  assert.equal(token.length, 2, "bad token at cell " + i);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0, "token outside alphabet at cell " + i);
  return 60 * a + b;
});
assert(values.every((x) => x >= 0 && x <= 255));
assert.deepEqual(values, table.bytes);
const tableBytes = Buffer.from(values);
assert.equal(tableBytes.length, 256);
const tableHash = crypto.createHash("sha256").update(tableBytes).digest("hex");
assert.equal(tableHash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const keyText = fs.readFileSync("resources/cicada-3301-authentic-public-key.asc", "utf8");
const keyPacket = firstPacket(armor(keyText, "PUBLIC KEY BLOCK"));
assert.equal(keyPacket.tag, 6);
assert.equal(keyPacket.body[0], 4);
assert.equal(keyPacket.body[5], 1);
const n = mpi(keyPacket.body, 6);
const e = mpi(keyPacket.body, n.next);
assert.equal(n.bits, 4096);
assert.equal(n.bytes.length, 512);
const fpInput = Buffer.concat([
  Buffer.from([0x99, (keyPacket.body.length >> 8) & 255, keyPacket.body.length & 255]),
  keyPacket.body
]);
const fingerprint = crypto.createHash("sha1").update(fpInput).digest("hex").toUpperCase();
assert.equal(fingerprint, "6D854CD7933322A601C3286D181F01E57A35090F");

const controlText = fs.readFileSync("resources/cicada2014-may2-signed-message.asc", "utf8");
const signaturePacket = firstPacket(armor(controlText, "SIGNATURE"));
assert.equal(signaturePacket.tag, 2);
const b = signaturePacket.body;
const version = b[0], sigType = b[1], pubAlg = b[2], hashAlg = b[3];
let p = 4;
const hashedLen = b.readUInt16BE(p); p += 2 + hashedLen;
const unhashedLen = b.readUInt16BE(p); p += 2 + unhashedLen;
p += 2;
const sig = mpi(b, p);
assert.equal(sig.next, b.length);
assert.equal(version, 4);
assert.equal(sigType, 1);
assert.equal(pubAlg, 1);
assert.equal(hashAlg, 2);
assert.equal(sig.bits, 4096);
assert.equal(sig.bytes.length, 512);

const form = fs.readFileSync("resources/historical/cicada2014-stage10-original-form.html", "utf8");
assert(/GnuPG/i.test(form) && /key\.asc/i.test(form));
const formSelectsRsaSize = /RSA[\s-]?2048|2048[\s-]?bit|RSA[\s-]?4096|4096[\s-]?bit/i.test(form);
assert.equal(formSelectsRsaSize, false);

console.log(JSON.stringify({
  table: {
    pages: [49, 50, 51],
    pageCellCounts: [80, 104, 72],
    cells: tokens.length,
    bytes: tableBytes.length,
    minByte: Math.min(...values),
    maxByte: Math.max(...values),
    distinctByteCount: new Set(values).size,
    sha256IntegrityFingerprint: tableHash
  },
  authenticCicadaControl: {
    fingerprint: fingerprint,
    keyId: fingerprint.slice(-16),
    rsaBits: n.bits,
    exponentBits: e.bits,
    signatureVersion: version,
    signatureType: sigType,
    signaturePublicKeyAlgorithm: pubAlg,
    signatureHashAlgorithm: hashAlg,
    signaturePacketBodyBytes: b.length,
    signaturePacketTotalBytes: signaturePacket.totalLength,
    signatureMPIBits: sig.bits,
    signatureMPIBytes: sig.bytes.length,
    note: "The control was independently verified with gpg; this SFT checks packet structure and lengths."
  },
  stage10Contract: {
    requestsGnuPGKeyAtKeyAsc: true,
    fixesRsaKeySize: formSelectsRsaSize
  },
  decision: {
    tableBytes: tableBytes.length,
    cicadaSignatureMPIBytes: sig.bytes.length,
    compatibleWithAuthenticCicadaKey: tableBytes.length === sig.bytes.length,
    rsa2048LengthFitAloneAuthenticatesNoVerifier: true,
    publicVerificationRegisterSupported: false
  }
}, null, 2));
