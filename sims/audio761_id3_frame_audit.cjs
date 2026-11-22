"use strict";
/**
 * Byte-exact inventory of the original 2013 Cicada 761.MP3 ID3v2 frames.
 *
 * Run: node sims/audio761_id3_frame_audit.cjs /tmp/761.MP3
 * Pinned source: rtkd/iddqd commit f2267b0c2f1e1d2662806b90b9c3a2953b3a7023,
 * 2013/02/761.MP3 (Git blob 7e2bd299fbc7b96283219cf15e2904641daf631f).
 * Source hash is checked before interpretation. Only ID3 metadata is parsed.
 *
 * @module audio761_id3_frame_audit
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const SOURCE_SHA256 =
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

/** @param {Buffer} bytes @param {number} offset @returns {number} */
function synchsafe(bytes, offset) {
  let result = 0;
  for (let i = 0; i < 4; i++) {
    assert.equal(bytes[offset + i] >> 7, 0,
      "ID3v2 synchsafe bytes have the high bit cleared");
    result = (result << 7) | bytes[offset + i];
  }
  return result;
}

/** @param {number} value @returns {Buffer} */
function makeSynchsafe(value) {
  return Buffer.from([(value >>> 21) & 0x7f, (value >>> 14) & 0x7f,
    (value >>> 7) & 0x7f, value & 0x7f]);
}

/**
 * Decode an ordinary ID3 textual frame, with encoding byte 0–3.
 * COMM and USLT carry a three-byte language before the text; preserve
 * their optional description as visible text rather than discarding it.
 * @param {string} id
 * @param {Buffer} payload
 * @returns {string|null}
 */
function frameText(id, payload) {
  if (!(id.startsWith("T") || id === "COMM" || id === "USLT")) return null;
  assert.ok(payload.length >= 1);
  const encoding = payload[0];
  let data = payload.subarray(1);
  if (id === "COMM" || id === "USLT") {
    assert.ok(data.length >= 3);
    data = data.subarray(3);
  }
  if (encoding === 0) return data.toString("latin1").replace(/\u0000/g, " | ");
  if (encoding === 3) return data.toString("utf8").replace(/\u0000/g, " | ");
  if (encoding === 1) {
    if (data.length >= 2 && data[0] === 0xfe && data[1] === 0xff) {
      const swapped = Buffer.from(data.subarray(2));
      swapped.swap16();
      return swapped.toString("utf16le").replace(/\u0000/g, " | ");
    }
    if (data.length >= 2 && data[0] === 0xff && data[1] === 0xfe) {
      data = data.subarray(2);
    }
    assert.equal(data.length % 2, 0);
    return data.toString("utf16le").replace(/\u0000/g, " | ");
  }
  if (encoding === 2) {
    const swapped = Buffer.from(data);
    assert.equal(swapped.length % 2, 0);
    swapped.swap16();
    return swapped.toString("utf16le").replace(/\u0000/g, " | ");
  }
  throw new Error("Unsupported ID3 text encoding byte: " + encoding);
}

/** @param {Buffer} bytes */
function parseTag(bytes) {
  assert.equal(bytes.toString("ascii", 0, 3), "ID3");
  const major = bytes[3], minor = bytes[4], flags = bytes[5];
  assert.ok(major === 3 || major === 4, "Expected ID3v2.3/2.4");
  const size = synchsafe(bytes, 6);
  const end = 10 + size;
  assert.ok(end <= bytes.length);
  assert.equal(flags & 0xc0, 0, "Unsynchronization/extended header requires separate parser");
  assert.equal(flags & 0x10, 0, "ID3 footer requires separate parser");
  const frames = [];
  let cursor = 10;
  while (cursor + 10 <= end) {
    const id = bytes.toString("ascii", cursor, cursor + 4);
    if (id === "\u0000\u0000\u0000\u0000") break;
    assert.match(id, /^[A-Z0-9]{4}$/u, "Invalid ID3 frame ID");
    const frameSize = major === 4 ? synchsafe(bytes, cursor + 4) :
      bytes.readUInt32BE(cursor + 4);
    const frameFlags = bytes.readUInt16BE(cursor + 8);
    const next = cursor + 10 + frameSize;
    assert.ok(next <= end, "Frame must fit in declared ID3v2 tag");
    const body = bytes.subarray(cursor + 10, next);
    frames.push({
      id, start: cursor, bytes: frameSize,
      frameFlags, text: frameText(id, body),
      payloadSha256: sha256(body),
      payloadHexPrefix: body.subarray(0, 24).toString("hex")
    });
    cursor = next;
  }
  const padding = bytes.subarray(cursor, end);
  assert.ok(padding.every((byte) => byte === 0),
    "Only zero padding may follow the ID3v2 frames");
  return {major, minor, flags, declaredBodyBytes: size, endOffset: end,
    paddingBytes: padding.length, frames};
}

/** @param {string} id @param {Buffer} payload @returns {Buffer} */
function makeV23Frame(id, payload) {
  const header = Buffer.alloc(10);
  header.write(id, 0, 4, "ascii");
  header.writeUInt32BE(payload.length, 4);
  return Buffer.concat([header, payload]);
}

const title = makeV23Frame("TIT2",
  Buffer.concat([Buffer.from([0]), Buffer.from("ORIGINAL CONTROL", "latin1")]));
const comment = makeV23Frame("COMM", Buffer.concat([
  Buffer.from([0]), Buffer.from("eng\u0000", "latin1"),
  Buffer.from("A message to test frames.", "latin1")
]));
const plantData = Buffer.concat([title, comment, Buffer.alloc(5)]);
const planted = Buffer.concat([
  Buffer.from([0x49, 0x44, 0x33, 3, 0, 0]), makeSynchsafe(plantData.length),
  plantData
]);
const positive = parseTag(planted);
assert.equal(positive.endOffset, planted.length);
assert.equal(positive.paddingBytes, 5);
assert.deepEqual(positive.frames.map((frame) => frame.id),
  ["TIT2", "COMM"]);
assert.equal(positive.frames[0].text, "ORIGINAL CONTROL");
assert.equal(positive.frames[1].text, " | A message to test frames.");

const input = process.argv[2];
assert.ok(input, "Pass path to pinned 2013/02/761.MP3");
const data = fs.readFileSync(input);
assert.equal(data.length, 4010732);
assert.equal(sha256(data), SOURCE_SHA256, "Refuse non-pinned audio bytes");

const source = parseTag(data);
assert.equal(source.endOffset, 206,
  "Original ID3 tag should end at previously recorded 206-byte boundary");
const v1 = data.subarray(-128);
let trailingTag = null;
if (v1.toString("ascii", 0, 3) === "TAG") {
  trailingTag = {
    title: v1.toString("latin1", 3, 33).replace(/\u0000+$/u, ""),
    artist: v1.toString("latin1", 33, 63).replace(/\u0000+$/u, ""),
    album: v1.toString("latin1", 63, 93).replace(/\u0000+$/u, ""),
    year: v1.toString("ascii", 93, 97),
    comment: v1.toString("latin1", 97, 127).replace(/\u0000+$/u, ""),
    genre: v1[127]
  };
}
console.log(JSON.stringify({
  pinnedAudio: input, fileBytes: data.length, sha256: SOURCE_SHA256,
  source, firstAudioBytesAfterTag: data.subarray(206, 222).toString("hex"),
  id3v1: trailingTag,
  syntheticPositive: {
    parsedTwoFrames: positive.frames.map((frame) => frame.id),
    readPlaintext: positive.frames.map((frame) => frame.text),
    paddingBytes: positive.paddingBytes
  },
  scope: "ID3 metadata source only; no MP3 waveform or unknown LP2 ciphertext decoding"
}, null, 2));
