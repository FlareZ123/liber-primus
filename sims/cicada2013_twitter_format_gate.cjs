#!/usr/bin/env node
"use strict";

// Format/reconstruction gate for the 2013 address-labelled Twitter stream.
// This is deliberately a file-identification test, not an LP2 key search.
//
// Run from repository root:
//   node sims/cicada2013_twitter_format_gate.cjs

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "resources/cicada2013-twitter-hex-stream.txt"), "utf8");
const lines = source.trim().split(/\r?\n/);
const records = lines.map((line, index) => {
  const m = line.match(/^([0-9a-fA-F]+):\s*([0-9a-fA-F]+)$/);
  assert(m, `Malformed address/value record at line ${index + 1}`);
  assert.equal(m[2].length % 2, 0, `Odd hex length at line ${index + 1}`);
  return {
    address: Number.parseInt(m[1], 16),
    bytes: Buffer.from(m[2], "hex"),
  };
});

const ascending = [...records].sort((a, b) => a.address - b.address);
let totalBytes = 0;
let gaps = [];
let overlaps = [];
let minAddress = Infinity;
let maxAddress = -1;
const recordLengths = {};
for (let i = 0; i < ascending.length; i += 1) {
  const r = ascending[i];
  totalBytes += r.bytes.length;
  recordLengths[r.bytes.length] = (recordLengths[r.bytes.length] || 0) + 1;
  minAddress = Math.min(minAddress, r.address);
  maxAddress = Math.max(maxAddress, r.address + r.bytes.length - 1);
  if (i > 0) {
    const previousEndExclusive = ascending[i - 1].address + ascending[i - 1].bytes.length;
    if (r.address > previousEndExclusive) {
      gaps.push({ from: previousEndExclusive, to: r.address - 1 });
    } else if (r.address < previousEndExclusive) {
      overlaps.push({ start: r.address, end: previousEndExclusive - 1 });
    }
  }
}

const span = maxAddress - minAddress + 1;
const bytes = Buffer.alloc(span);
for (const r of ascending) r.bytes.copy(bytes, r.address - minAddress);
const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");

const frequencies = new Array(256).fill(0);
for (const b of bytes) frequencies[b] += 1;
const entropy = -frequencies.reduce((sum, n) => {
  if (!n) return sum;
  const p = n / bytes.length;
  return sum + p * Math.log2(p);
}, 0);

function positions(needle) {
  const out = [];
  for (let i = 0; i <= bytes.length - needle.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) out.push(i);
  }
  return out;
}

const magic = {
  JPEG_SOI: positions([0xff, 0xd8]),
  PNG: positions([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  GIF87a: positions(Buffer.from("GIF87a")),
  GIF89a: positions(Buffer.from("GIF89a")),
  ZIP: positions([0x50, 0x4b, 0x03, 0x04]),
  GZIP: positions([0x1f, 0x8b, 0x08]),
  PDF: positions(Buffer.from("%PDF-")),
  ELF: positions([0x7f, 0x45, 0x4c, 0x46]),
  SevenZip: positions([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
  RAR: positions(Buffer.from("Rar!")),
  BMP: positions(Buffer.from("BM")),
  SQLite: positions(Buffer.from("SQLite format 3\0")),
};
const jpegMarkers = {
  SOI: positions([0xff, 0xd8]),
  EOI: positions([0xff, 0xd9]),
  DQT: positions([0xff, 0xdb]),
  DHT: positions([0xff, 0xc4]),
  SOS: positions([0xff, 0xda]),
  SOF0: positions([0xff, 0xc0]),
  SOF2: positions([0xff, 0xc2]),
  APP0: positions([0xff, 0xe0]),
  JFIF: positions(Buffer.from("JFIF")),
};

const prefixBytes = bytes.subarray(0, 23);
const prefixHex = prefixBytes.toString("hex").match(/.{2}/g).join(" ");
const blockAlignedPrefixLengths = [7, 23, 39, 55].map((prefixLength) => ({
  prefixLength,
  remainingBytes: bytes.length - prefixLength,
  blocksOf16: (bytes.length - prefixLength) / 16,
  aligned: (bytes.length - prefixLength) % 16 === 0,
}));

assert.equal(records.length, 988);
assert.equal(totalBytes, 64167);
assert.equal(minAddress, 0);
assert.equal(maxAddress, 64166);
assert.equal(span, 64167);
assert.deepEqual(gaps, []);
assert.deepEqual(overlaps, []);
assert.deepEqual(recordLengths, { "12": 1, "65": 987 });
assert.equal(sha256, "defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776");
assert.equal(frequencies.filter((n) => n > 0).length, 256);
assert.equal(jpegMarkers.SOI.length, 0);
assert.equal(jpegMarkers.DQT.length, 0);
assert.equal(magic.PNG.length, 0);
assert.equal(magic.ZIP.length, 0);
assert.equal(magic.GZIP.length, 0);
assert.equal(magic.PDF.length, 0);

console.log(JSON.stringify({
  reconstruction: {
    records: records.length,
    addressesInSourceOrderDescending: records.every((r, i) => i === 0 || records[i - 1].address > r.address),
    minAddress,
    maxAddress,
    span,
    recordLengths,
    totalBytes,
    gaps,
    overlaps,
    sha256,
  },
  byteStatistics: {
    entropyBitsPerByte: entropy,
    distinctByteValues: frequencies.filter((n) => n > 0).length,
    prefix23Hex: prefixHex,
  },
  standardMagicOffsets: magic,
  jpegMarkerOffsets: jpegMarkers,
  nonUnique16ByteAlignment: blockAlignedPrefixLengths,
  interpretation: "No standard file/container signature at offset zero; sparse-address reconstruction is contiguous. Isolated JPEG-like marker pairs do not form a valid JPEG. The 23-byte-prefix/16-byte-block alignment is non-unique and does not identify AES or any other container.",
}, null, 2));
