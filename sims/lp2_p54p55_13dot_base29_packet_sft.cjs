"use strict";

/**
 * Bounded test of the p54–55 13-dot-framed 29-ary packet hypothesis.
 *
 * Source cue: p54 has a 9-rune red span followed by a red 13-dot mark;
 * p55 ends with a red 13-dot mark. The 299 runes between those marks equal
 * 23 * 13. The single tested serialization groups 13 canonical GP digits
 * (leftmost most-significant) into one unsigned 64-bit big-endian word.
 *
 * This is a hypothesis test, not an authenticated historical decoder:
 * the signed 2013 BASE29 source specifies positional base conversion but
 * does not specify 13-rune packets or a binary endianness.
 *
 * Run: node sims/lp2_p54p55_13dot_base29_packet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const corpusBytes = fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"));
const inkBytes = fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-ink-annotations.json"));
const transcriptionBytes = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"));

function gitBlobSha(bytes) {
  return crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes]))
    .digest("hex");
}
assert.equal(gitBlobSha(corpusBytes),
  "054f2a0f780b7d46901acbe3d9bf4f0ac1801165", "canonical corpus version");
assert.equal(gitBlobSha(inkBytes),
  "3c52f209ce6bd7b138eaa2d4a9323526952ba9f9", "ink annotation version");
assert.equal(gitBlobSha(transcriptionBytes),
  "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7", "transcription version");

const corpus = JSON.parse(corpusBytes.toString("utf8"));
const ink = JSON.parse(inkBytes.toString("utf8"));
const transcription = transcriptionBytes.toString("utf8").split("%");
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const annotations = new Map(ink.pages.map(p => [p.page, p]));
const RUNE_SET = new Set(corpus.runes);
const WIDTH = 13;
const LIMIT = 29n ** BigInt(WIDTH);
const U64 = 1n << 64n;

function page(n) {
  const p = pages.get(n);
  assert.ok(p, "missing physical page " + n);
  return p;
}
function annotation(n) {
  const p = annotations.get(n);
  assert.ok(p, "missing ink annotation for physical page " + n);
  return p;
}
function digitsToInteger(digits) {
  let n = 0n;
  for (const d of digits) {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 29);
    n = n * 29n + BigInt(d);
  }
  return n;
}
function integerToDigits(value) {
  assert.ok(value >= 0n && value < LIMIT, "13-digit GP29 value overflow");
  const out = Array(WIDTH).fill(0);
  for (let i = WIDTH - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}
function packExact(digits) {
  assert.equal(digits.length % WIDTH, 0, "exact packets require 13-rune blocks");
  const out = Buffer.alloc((digits.length / WIDTH) * 8);
  for (let i = 0; i < digits.length; i += WIDTH) {
    const value = digitsToInteger(digits.slice(i, i + WIDTH));
    assert.ok(value < U64);
    out.writeBigUInt64BE(value, (i / WIDTH) * 8);
  }
  return out;
}
function unpackExact(bytes) {
  assert.equal(bytes.length % 8, 0);
  const out = [];
  for (let i = 0; i < bytes.length; i += 8) {
    const value = bytes.readBigUInt64BE(i);
    assert.ok(value < LIMIT, "byte word is outside the 13-digit GP29 range");
    out.push(...integerToDigits(value));
  }
  return out;
}
function packPadded(digits) {
  const padded = digits.slice();
  while (padded.length % WIDTH) padded.push(0);
  return packExact(padded);
}
function unpackPadded(bytes, originalLength) {
  return unpackExact(bytes).slice(0, originalLength);
}
function bytesToDigits(bytes) {
  assert.equal(bytes.length % 8, 0);
  const out = [];
  for (let i = 0; i < bytes.length; i += 8) {
    const value = bytes.readBigUInt64BE(i);
    assert.ok(value < LIMIT, "plant block must fit in 13 GP29 digits");
    out.push(...integerToDigits(value));
  }
  return out;
}
function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}
function separatorEvents(text, startRune) {
  let runeCount = 0;
  const out = [];
  for (const ch of text) {
    if (RUNE_SET.has(ch)) {
      runeCount++;
    } else if ((ch === "-" || ch === ".") && runeCount > startRune) {
      out.push({ offset: runeCount - startRune, kind: ch });
    }
  }
  return out;
}

// Exact source markers: the red nine-rune preamble is before the p54 13-dot
// marker; the framed body begins immediately after that marker and ends at
// p55's terminal 13-dot marker.
const p53 = page(53), p54 = page(54), p55 = page(55);
const p54Ink = annotation(54), p55Ink = annotation(55);
assert.equal(p54.status, "unsolved");
assert.equal(p55.status, "unsolved");
assert.equal(p54.indices.length, 232);
assert.equal(p55.indices.length, 76);
assert.deepEqual(p54Ink.red_spans.map(x => [x.start, x.length]), [[0, 9]]);
assert.deepEqual(p54Ink.large_punctuation, [[9, 13, "red"]]);
assert.deepEqual(p55Ink.large_punctuation, [[76, 13, "red"]]);

const preamble = p54.indices.slice(0, 9);
const body = [...p54.indices.slice(9), ...p55.indices];
assert.equal(body.length, 299);
assert.equal(body.length / WIDTH, 23);
assert.equal(p54.indices.length - preamble.length, 223);
assert.equal(223 % WIDTH, 2, "physical page turn should split one packet after two digits");

// The transcription omits the rune-free physical p50, so p54/p55 are blocks
// 53/54. Count word/period boundaries inside the framed body and check which
// of the 22 inferred 13-rune packet boundaries coincide with them.
assert.equal(transcription.length, 57);
const p54Separators = separatorEvents(transcription[53], 9);
const p55Separators = separatorEvents(transcription[54], 0)
  .map(x => ({ ...x, offset: x.offset + 223 }));
const separators = [...p54Separators, ...p55Separators];
const internalBoundaries = Array.from({ length: 22 }, (_, i) => (i + 1) * WIDTH);
const alignedBoundaries = separators.filter(x => internalBoundaries.includes(x.offset));
assert.equal(separators.filter(x => x.kind === "-").length, 63);
assert.equal(separators.filter(x => x.kind === ".").length, 2);
assert.equal(alignedBoundaries.length, 2);

// The only candidate serialization: 23 left-to-right, most-significant-first
// base29 groups, each written as one 8-byte big-endian integer.
const candidate = packExact(body);
assert.equal(candidate.length, 184);
const recovered = unpackExact(candidate);
assert.deepEqual(recovered, body, "original source packet round-trip");
const candidateHash = sha256(candidate);
assert.equal(candidateHash,
  "0e88c53eb62a1cb5b65e1799c8339ca81cc4c744c69423e506ab3e5a84980712");
const openPgpProbe = {
  firstByte: candidate[0],
  secondByte: candidate[1],
  thirdByte: candidate[2],
  oldFormatHeader: (candidate[0] & 0xc0) === 0x80,
  packetTag: (candidate[0] >> 2) & 0x0f,
  lengthType: candidate[0] & 0x03,
  declaredLength: candidate[1],
  signatureVersion: candidate[2],
  signatureVersionValid: [3, 4, 5].includes(candidate[2])
};
assert.deepEqual(openPgpProbe, {
  firstByte: 0x88, secondByte: 0x8c, thirdByte: 0x84,
  oldFormatHeader: true, packetTag: 2, lengthType: 0,
  declaredLength: 140, signatureVersion: 132, signatureVersionValid: false
});

// Source-native known-text controls. p56/p57 are not 13-rune multiples, so
// their known original lengths supply the padding side information; this
// tests the serializer implementation, not the hypothesized p54/p55 framing.
const p56 = page(56).indices, p57 = page(57).indices;
for (const [name, digits] of [["p56", p56], ["p57", p57]]) {
  const bytes = packPadded(digits);
  assert.deepEqual(unpackPadded(bytes, digits.length), digits,
    name + " exact known-source round-trip");
}

// Same-size synthetic positive: 23 representable 64-bit words -> 299 GP29
// digits -> 184 bytes. The leading zero in each 8-byte word guarantees that
// the planted words are inside the 13-digit base29 range.
const plant = Buffer.alloc(184);
for (let block = 0; block < 23; block++) {
  plant[block * 8] = 0;
  for (let j = 1; j < 8; j++) plant[block * 8 + j] = (block * 53 + j * 31) & 0xff;
}
const plantDigits = bytesToDigits(plant);
assert.equal(plantDigits.length, 299);
assert.ok(packExact(plantDigits).equals(plant));
assert.deepEqual(unpackExact(plant), plantDigits);

// The same 13-dot count is used as ordinary punctuation on adjacent/solved
// pages whose marked bodies are not multiples of 13: this prevents treating
// dot count as a universal packet-width convention.
const p56Ink = annotation(56), p57Ink = annotation(57), p53Ink = annotation(53);
assert.deepEqual(p53Ink.large_punctuation, [[179, 13, "red"]]);
assert.equal(p53.indices.length, 179);
assert.deepEqual(p56Ink.large_punctuation, [[5, 13, "red"], [45, 10, "red"], [85, 13, "red"]]);
assert.equal(p56.indices.length - 5, 80);
assert.deepEqual(p57Ink.large_punctuation, [[7, 13, "red"], [95, 23, "red"]]);
assert.equal(p57.indices.length - 7, 88);
assert.ok([179, 80, 88].every(n => n % WIDTH !== 0));

const report = {
  source: {
    corpusGitBlob: gitBlobSha(corpusBytes),
    annotationGitBlob: gitBlobSha(inkBytes),
    transcriptionGitBlob: gitBlobSha(transcriptionBytes),
    p54Runes: p54.indices.length,
    p54RedPreambleRunes: preamble.length,
    p54StartMarker: p54Ink.large_punctuation[0],
    p55Runes: p55.indices.length,
    p55EndMarker: p55Ink.large_punctuation[0],
    framedBodyRunes: body.length,
    frameCount: body.length / WIDTH,
    frameWidth: WIDTH,
    pageTurnAfterBodyRune: 223,
    pageTurnRemainder: 223 % WIDTH
  },
  packetization: {
    digitAlphabet: "canonical GP indices 0..28",
    digitOrder: "left-to-right, most-significant first",
    packetInteger: "13 base29 digits -> uint64",
    byteOrder: "big-endian",
    bytesPerPacket: 8,
    totalBytes: candidate.length,
    sha256: candidateHash,
    first32Hex: candidate.subarray(0, 32).toString("hex"),
    last32Hex: candidate.subarray(-32).toString("hex"),
    openPgpProbe
  },
  controls: {
    p56: { runes: p56.length, paddedBytes: packPadded(p56).length, exactRoundTrip: true },
    p57: { runes: p57.length, paddedBytes: packPadded(p57).length, exactRoundTrip: true },
    sameSizeSyntheticPlant: { runes: plantDigits.length, bytes: plant.length, exactRoundTrip: true },
    internalPacketBoundaries: internalBoundaries.length,
    wordOrPeriodBoundaryAlignments: alignedBoundaries.length,
    adjacentMarkedBodyLengthsNotDivisibleBy13: [179, 80, 88]
  },
  decision: "one bounded 13-rune/uint64 serialization is exactly reversible but does not yield an authenticated binary object; no endian, phase, prefix, or codec search is authorized by the source"
};
console.log("LP2_P54_P55_13DOT_BASE29 " + JSON.stringify(report, null, 2));
