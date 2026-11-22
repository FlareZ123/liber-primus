"use strict";

/**
 * Issue #335: the nine source-delimited LP2 units, with their printed titles,
 * interpreted as base29 integers in canonical GP rune order (0..28).
 *
 * Fixed conventions: ordinary big-endian radix29 and minimal big-endian byte
 * serialization; no artificial zero-padding or endian/offset search.
 * The original rune length is used only to restore leading zero digits for
 * the reversible test, never to pad or alter the byte output.
 *
 * Reproduce: node sims/issue335_nine_base29_binary_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { TextDecoder } = require("node:util");
const { gzipSync, gunzipSync } = require("node:zlib");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"
));
const bases = new Map();
const stream = [];
for (let p = 0; p < 56; p++) {
  const page = corpus.pages.find(item => item.page === p);
  assert.ok(page, "missing page " + p);
  bases.set(p, stream.length);
  for (const digit of page.indices) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    stream.push(digit);
  }
}
assert.equal(stream.length, 12956);
assert.deepEqual(corpus.runes.length, 29);
assert.equal(corpus.pages.find(item => item.page === 50).indices.length, 0);

// Titles are included: these are the complete source-delimited units.
// The p15 title starts after a 9-rune carry from the previous unit.
// P33 has two separate title starts, at local rune offsets 0 and 91.
const starts = [
  [0, 0], [3, 0], [8, 0], [15, 9], [23, 0],
  [27, 0], [33, 0], [33, 91], [40, 0]
];
const startsGlobal = starts.map(([p, off]) => {
  const page = corpus.pages.find(item => item.page === p);
  assert.ok(page && off < page.indices.length);
  return bases.get(p) + off;
});
assert.deepEqual(startsGlobal, [
  0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640
]);
const units = startsGlobal.map((start, i) =>
  stream.slice(start, startsGlobal[i + 1] ?? stream.length)
);
assert.deepEqual(units.map(unit => unit.length),
  [729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316]);

// Each non-zero local title is verified against its original red ink span.
const titles = [
  [0, 0, 13], [3, 0, 16], [8, 0, 12], [15, 9, 11],
  [23, 0, 16], [27, 0, 19], [33, 0, 10], [33, 91, 8],
  [40, 0, 8]
];
for (const [page, start, length] of titles) {
  const p = corpus.pages.find(item => item.page === page);
  const a = ink.pages.find(item => item.page === page);
  const mark = a.red_spans.find(item => item.start === start &&
    item.length === length);
  assert.ok(mark, "missing source-red title " + page + ":" + start);
  assert.equal(p.indices.slice(start, start + length)
    .map(digit => corpus.runes[digit]).join(""), mark.runes);
}

/** @param {number[]} digits @returns {Buffer} */
function digitsToBytes(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes @param {number} width @returns {number[]} */
function bytesToDigits(bytes, width = 0) {
  assert.ok(Buffer.isBuffer(bytes));
  assert.ok(Number.isInteger(width) && width >= 0);
  let value = BigInt("0x" + bytes.toString("hex"));
  const reversed = [];
  do {
    reversed.push(Number(value % 29n));
    value /= 29n;
  } while (value !== 0n);
  const digits = reversed.reverse();
  assert.ok(digits.length <= width || width === 0,
    "original width is shorter than its integer representation");
  while (digits.length < width) digits.unshift(0);
  return digits;
}

/** @param {Buffer} bytes @returns {string[]} */
function signatures(bytes) {
  const has = hex => bytes.subarray(0, hex.length / 2)
    .equals(Buffer.from(hex, "hex"));
  const hits = [];
  if (has("89504e470d0a1a0a") && bytes.length > 33 &&
      bytes.readUInt32BE(8) === 13 &&
      bytes.toString("ascii", 12, 16) === "IHDR" &&
      bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0) {
    hits.push("PNG-IHDR");
  }
  if (bytes.length >= 6 &&
      [ "GIF87a", "GIF89a" ].includes(bytes.toString("ascii", 0, 6)) &&
      bytes.length >= 13 &&
      bytes.readUInt16LE(6) > 0 && bytes.readUInt16LE(8) > 0) {
    hits.push("GIF-screen");
  }
  if (has("255044462d312e") && bytes.includes(Buffer.from("%%EOF"))) {
    hits.push("PDF-EOF");
  }
  if (has("504b0304") && bytes.includes(Buffer.from("504b0506", "hex"))) {
    hits.push("ZIP-EOCD");
  }
  if (has("1f8b08") && bytes.length >= 18 && (bytes[3] & 0xe0) === 0) {
    try {
      gunzipSync(bytes);
      hits.push("GZIP-valid");
    } catch (_) {
      // A matching prefix alone is not a valid compressed stream.
    }
  }
  if (has("425a68") && bytes.length > 15 &&
      bytes[3] >= 49 && bytes[3] <= 57) hits.push("BZIP2-header");
  if (has("fd377a585a00") && bytes.length >= 32) hits.push("XZ-header");
  if (has("377abcaf271c") && bytes.length >= 32) hits.push("7Z-header");
  if (has("ffd8ff") && bytes.length >= 4 &&
      bytes.subarray(bytes.length - 2).equals(Buffer.from("ffd9", "hex"))) {
    hits.push("JPEG-SOI-EOI");
  }
  if (has("7f454c46") && bytes.length >= 52 &&
      [1, 2].includes(bytes[4]) && [1, 2].includes(bytes[5])) {
    hits.push("ELF-header");
  }
  if (has("4d5a") && bytes.length >= 64) {
    const off = bytes.readUInt32LE(0x3c);
    if (off + 4 <= bytes.length &&
        bytes.toString("ascii", off, off + 4) === "PE\u0000\u0000") {
      hits.push("PE-header");
    }
  }
  if (bytes.length >= 100 && bytes.toString("ascii", 0, 16) ===
      "SQLite format 3\u0000") {
    const size = bytes.readUInt16BE(16);
    if (size === 1 || (size >= 512 && size <= 32768 &&
        (size & (size - 1)) === 0)) hits.push("SQLite-page");
  }
  if (bytes.length >= 512 &&
      bytes.toString("ascii", 257, 262) === "ustar") hits.push("TAR-header");
  if (has("52494646") && bytes.length >= 12 &&
      bytes.readUInt32LE(4) + 8 === bytes.length &&
      [ "WAVE", "AVI " ].includes(bytes.toString("ascii", 8, 12))) {
    hits.push("RIFF-valid-length");
  }
  return hits;
}

/** @param {Buffer} bytes */
function textChecks(bytes) {
  const printable = bytes.reduce((total, b) => total +
    ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13 ? 1 : 0), 0);
  let validUtf8 = true;
  let strictJson = false;
  try {
    const s = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    try {
      JSON.parse(s);
      strictJson = true;
    } catch (_) {
      // A valid UTF-8 string need not be JSON.
    }
  } catch (_) {
    validUtf8 = false;
  }
  return {
    printableAsciiBytes: printable,
    printableAsciiFraction: Number((printable / bytes.length).toFixed(6)),
    validUtf8,
    strictJson
  };
}

const syntheticPayload = gzipSync(
  Buffer.from("LP2 BASE29 planted original-content positive control\n", "utf8")
);
const syntheticDigits = bytesToDigits(syntheticPayload);
assert.deepEqual(digitsToBytes(syntheticDigits), syntheticPayload);
assert.deepEqual(bytesToDigits(digitsToBytes(syntheticDigits)), syntheticDigits);
assert.deepEqual(signatures(syntheticPayload), ["GZIP-valid"]);

const findings = units.map((digits, i) => {
  const bytes = digitsToBytes(digits);
  assert.deepEqual(bytesToDigits(bytes, digits.length), digits,
    "source-width base29 round trip failed for section " + (i + 1));
  const rotated = digits.slice(1).concat(digits[0]);
  const wrongBytes = digitsToBytes(rotated);
  const readout = {
    unit: i + 1,
    sourceStart: startsGlobal[i],
    runes: digits.length,
    leadingZeroRunes: digits.findIndex(d => d !== 0),
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    first32Hex: bytes.subarray(0, 32).toString("hex"),
    last32Hex: bytes.subarray(-32).toString("hex"),
    ...textChecks(bytes),
    verifiedContainerSignatures: signatures(bytes),
    wrongUnitOneRuneRotation: {
      bytes: wrongBytes.length,
      verifiedContainerSignatures: signatures(wrongBytes)
    }
  };
  assert.equal(readout.verifiedContainerSignatures.length, 0,
    "a possible original container requires investigation");
  return readout;
});
console.log(JSON.stringify({
  hypothesis: "canonical GP29 digits, all nine titled intervals, one whole-unit integer per interval",
  conventions: "big-endian radix29; minimal big-endian bytes; original rune width only used for inverse zero restoration",
  sourceCorpus: "resources/liber-primus/lp2-corpus.json",
  sourceInk: "resources/liber-primus/lp2-ink-annotations.json",
  sourceTotalRunes: stream.length,
  boundaryOffsets: startsGlobal,
  synthetic: {
    payloadLength: syntheticPayload.length,
    digits: syntheticDigits.length,
    roundTrip: true,
    formatGate: "GZIP-valid"
  },
  control: "rotate every whole title+body unit by one rune, preserving its rune multiset",
  findings
}, null, 2));
