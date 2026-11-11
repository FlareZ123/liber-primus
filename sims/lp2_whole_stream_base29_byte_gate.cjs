"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

/**
 * Direct whole-stream BASE29 integer-to-byte test.
 * Motivation: the 2013 signed TCP challenge authenticates ordinary BASE29
 * conversion (3301 -> 3QO), while LP2 uses a 29-symbol GP alphabet. It does
 * not prescribe applying BASE29 to the whole manuscript; this is a cheap,
 * falsifiable human-solve-path hypothesis, not an established cipher.
 *
 * Run: node sims/lp2_whole_stream_base29_byte_gate.cjs
 * Node.js 22, built-ins only.
 */
const ROOT = path.resolve(__dirname, "..");
const corpusPath = path.join(ROOT, "resources/liber-primus/lp2-corpus.json");
const corpusBytes = fs.readFileSync(corpusPath);
const gitBlobSha = crypto.createHash("sha1")
  .update(Buffer.concat([
    Buffer.from("blob " + corpusBytes.length + "\0", "utf8"),
    corpusBytes
  ])).digest("hex");
assert.equal(gitBlobSha, "054f2a0f780b7d46901acbe3d9bf4f0ac1801165");

const corpus = JSON.parse(corpusBytes.toString("utf8"));
const pages = corpus.pages.filter(page => page.page < 56);
const digits = pages.flatMap(page => page.indices);
assert.equal(pages.length, 56);
assert.equal(pages.filter(page => page.indices.length > 0).length, 55);
assert.equal(digits.length, 12956);
assert.deepEqual([digits[0], digits[digits.length - 1]], [15, 10]);
assert.ok(digits.every(d => Number.isInteger(d) && d >= 0 && d < 29));

const BASE29 = "0123456789ABCDEFGHIJKLMNOPQRS";
function encodeBase29(n) {
  assert(Number.isSafeInteger(n) && n >= 0);
  if (n === 0) return "0";
  let out = "";
  while (n > 0) {
    out = BASE29[n % 29] + out;
    n = Math.floor(n / 29);
  }
  return out;
}
assert.equal(encodeBase29(3301), "3QO");

/** @param {number[]} ds */
function base29IntegerToBytes(ds) {
  let value = 0n;
  for (const d of ds) value = value * 29n + BigInt(d);
  let hex = value.toString(16);
  if (hex.length & 1) hex = "0" + hex;
  const bytes = Buffer.from(hex, "hex");
  const width = Math.ceil(ds.length * Math.log2(29) / 8);
  assert.equal(bytes.length, width);
  return {value, bytes, bitLength: value.toString(2).length};
}

/** @param {Buffer} bytes */
function entropy(bytes) {
  const counts = new Uint32Array(256);
  for (const byte of bytes) counts[byte]++;
  let h = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}

/** @param {Buffer} bytes @param {Buffer} needle */
function findAll(bytes, needle) {
  const offsets = [];
  let at = bytes.indexOf(needle);
  while (at >= 0) {
    offsets.push(at);
    at = bytes.indexOf(needle, at + 1);
  }
  return offsets;
}

/** @param {Buffer} bytes */
function summarize(bytes) {
  const printable = bytes.reduce((n, b) =>
    n + (b >= 32 && b <= 126 ? 1 : 0), 0);
  let validUtf8 = true;
  try {
    new TextDecoder("utf-8", {fatal: true}).decode(bytes);
  } catch {
    validUtf8 = false;
  }
  const magic = {
    PNG: "89504e470d0a1a0a", PDF: "25504446", ZIP: "504b0304",
    GZIP: "1f8b08", BZIP2: "425a68", RAR: "526172211a07",
    "7Z": "377abcaf271c", PGP: "2d2d2d2d2d424547494e",
    ELF: "7f454c46", JPEG: "ffd8ff", GIF: "47494638",
    SQLite: "53514c69746520666f726d6174203300",
    ZLIB_FAST: "7801", ZLIB_DEFAULT: "789c", ZLIB_BEST: "78da"
  };
  const magicHits = Object.fromEntries(Object.entries(magic).map(([name, hex]) => [
    name, findAll(bytes, Buffer.from(hex, "hex"))
  ]).filter(([, offsets]) => offsets.length));
  return {
    byteLength: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    entropyBitsPerByte: entropy(bytes),
    printableRatio: printable / bytes.length,
    validUtf8,
    first16Hex: bytes.subarray(0, 16).toString("hex"),
    last16Hex: bytes.subarray(-16).toString("hex"),
    nulCount: bytes.reduce((n, b) => n + (b === 0 ? 1 : 0), 0),
    magicHits
  };
}

const forward = base29IntegerToBytes(digits);
const reverseDigits = base29IntegerToBytes(digits.slice().reverse());
assert.equal(forward.bitLength, 62940);
assert.equal(reverseDigits.bitLength, 62939);
assert.equal(forward.bytes.length, 7868);
assert.equal(reverseDigits.bytes.length, 7868);

const variants = [
  {name: "digits-forward/bytes-big", bytes: forward.bytes},
  {name: "digits-forward/bytes-little", bytes: Buffer.from(forward.bytes).reverse()},
  {name: "digits-reverse/bytes-big", bytes: reverseDigits.bytes},
  {name: "digits-reverse/bytes-little", bytes: Buffer.from(reverseDigits.bytes).reverse()}
].map(v => ({name: v.name, ...summarize(v.bytes)}));

const zlibOffset = 4364;
assert.deepEqual(
  reverseDigits.bytes.subarray(zlibOffset, zlibOffset + 3),
  Buffer.from([0x78, 0x01, 0x86])
);
const deflateBlockType = (reverseDigits.bytes[zlibOffset + 2] >> 1) & 0x03;
assert.equal(deflateBlockType, 3);
assert.throws(() => zlib.inflateSync(reverseDigits.bytes.subarray(zlibOffset)));

const synthetic = Buffer.from([
  0x00, 0x00, 0x43, 0x49, 0x43, 0x41, 0x44, 0x41,
  0x20, 0x33, 0x33, 0x30, 0x31, 0xff
]);
function bytesToBase29(bytes) {
  let value = BigInt("0x" + bytes.toString("hex"));
  if (value === 0n) return [0];
  const out = [];
  while (value > 0n) {
    out.unshift(Number(value % 29n));
    value /= 29n;
  }
  return out;
}
function base29ToFixedBytes(ds, width) {
  let value = 0n;
  for (const d of ds) value = value * 29n + BigInt(d);
  const hex = value.toString(16).padStart(width * 2, "0");
  assert(hex.length <= width * 2);
  return Buffer.from(hex, "hex");
}
const syntheticDigits = bytesToBase29(synthetic);
assert.deepEqual(base29ToFixedBytes(syntheticDigits, synthetic.length), synthetic);

assert.equal(variants[0].first16Hex, "08734843a55193dcbb7231b564a2a088");
assert.equal(variants[2].first16Hex, "05e0cac7aa320afbd8410a7e6f7591f0");
assert.deepEqual(variants[0].magicHits, {});
assert.deepEqual(variants[1].magicHits, {});
assert.deepEqual(variants[2].magicHits, {ZLIB_FAST: [4364]});
assert.deepEqual(variants[3].magicHits, {});

console.log(JSON.stringify({
  classification: "bounded negative: direct whole-stream BASE29 integer-to-byte serialization",
  source: {
    corpusGitBlobSha: gitBlobSha, pageRecords: pages.length,
    runeBearingPages: 55, runes: digits.length,
    firstAndLastGpIndices: [digits[0], digits[digits.length - 1]],
    2013Base29PositiveControl: "3301 -> 3QO"
  },
  wholeNumber: {
    forwardBitLength: forward.bitLength,
    reverseDigitBitLength: reverseDigits.bitLength,
    byteLength: forward.bytes.length,
    variants
  },
  apparentZlib: {
    offset: zlibOffset,
    bytes: reverseDigits.bytes.subarray(zlibOffset, zlibOffset + 3).toString("hex"),
    deflateBlockType,
    valid: false,
    reason: "DEFLATE BTYPE=3 is reserved; zlib.inflateSync rejects the stream"
  },
  syntheticRoundTrip: {
    inputBytes: synthetic.length, base29Digits: syntheticDigits.length, exact: true
  },
  conclusion: "Neither digit direction nor byte order yields a recognized file. The sole 78 01 occurrence is followed by an invalid DEFLATE block header. This excludes transparent whole-stream BASE29-to-bytes only; encryption, other framing, and nonlinear transforms are not tested."
}, null, 2));
