"use strict";

/**
 * Original LP2 175 full-stop-delimited BASE29 byte fields.
 *
 * Genuine 2013 Cicada TCP instructions explicitly named BASE29, and
 * these punctuation stops are source-visible on original LP2 scans.
 * This tests one unambiguous fixed-width big-endian integer encoding,
 * distinct from previous whole-book/page/chapter/per-word framings.
 *
 * Reproduce: node sims/lp2_period_stop_base29_fields_sft.cjs
 * Node.js 22, CommonJS, standard library only; no writes/network.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const db = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const pages = transcription.split(/\r?\n%\r?\n/);
const original = pages.slice(0, -2).join("\n");
const runeId = new Map(db.runes.map((s, i) => [s, i]));
assert.equal(pages.length, 57);

/** @param {string} source @returns {number[][]} */
function readStopFields(source) {
  const fields = [];
  let current = [];
  for (const ch of source) {
    const rune = runeId.get(ch);
    if (rune !== undefined) {
      current.push(rune);
    } else if (ch === "." && current.length) {
      fields.push(current);
      current = [];
    }
  }
  assert.deepEqual(current, [], "Unterminated final original GP field");
  return fields;
}

/** @param {number[]} digits @returns {bigint} */
function from29(digits) {
  let n = 0n;
  for (const d of digits) {
    assert(Number.isInteger(d) && d >= 0 && d < 29);
    n = 29n * n + BigInt(d);
  }
  return n;
}

/** @param {bigint} value @param {number} length @returns {number[]} */
function to29(value, length) {
  assert(value >= 0n);
  const digits = Array(length).fill(0);
  let remainder = value;
  for (let i = length - 1; i >= 0; i--) {
    digits[i] = Number(remainder % 29n);
    remainder /= 29n;
  }
  assert.equal(remainder, 0n, "Byte field exceeds available BASE29 digits");
  return digits;
}

/** @param {number} length @returns {number} */
const width = length => Math.ceil(length * Math.log2(29) / 8);
/** @param {number} length @returns {number} */
const safePayloadWidth = length => Math.floor(length * Math.log2(29) / 8);

/** @param {number[]} digits @returns {Buffer} */
function bytesOf(digits) {
  const n = from29(digits);
  const target = width(digits.length);
  const hex = n.toString(16).padStart(target * 2, "0");
  assert.equal(hex.length, target * 2);
  return Buffer.from(hex, "hex");
}

/**
 * Reversible source-native positive: a genuine solved-p57 GP spelling
 * serialized as ASCII and repeated into the exactly 175 original
 * field lengths. Leading zero padding is explicitly part of this
 * mathematically fixed-width transport. The right-aligned content of
 * every field must recover every source plaintext byte.
 * @param {number[][]} fields
 */
function plant(fields) {
  const p57 = db.pages.find(p => p.page === 57);
  assert(p57 && p57.indices.length === 95);
  const source = Buffer.from(
    p57.indices.map(i => db.translit[i]).join(""), "ascii");
  assert(source.length > 95);
  let cursor = 0;
  let recovered = 0;
  for (const field of fields) {
    const available = safePayloadWidth(field.length);
    const message = Buffer.alloc(available);
    for (let i = 0; i < available; i++) {
      message[i] = source[cursor % source.length];
      cursor++;
    }
    const value = message.length ?
      BigInt("0x" + message.toString("hex")) : 0n;
    const plantedDigits = to29(value, field.length);
    const rebuilt = bytesOf(plantedDigits);
    const expected = Buffer.concat([
      Buffer.alloc(width(field.length) - available), message]);
    assert.deepEqual(rebuilt, expected);
    assert.deepEqual(to29(from29(plantedDigits), field.length),
      plantedDigits);
    assert.deepEqual(rebuilt.subarray(rebuilt.length - available),
      message);
    recovered += available;
  }
  return {source: "authentic solved LP2 p57 GP transliteration",
    fields: fields.length, sourceBytes: source.length,
    recoveredEnglishBytes: recovered, lossless: true};
}

const fields = readStopFields(original);
assert.equal(fields.length, 175);
assert.equal(fields.flat().length, 12956);
assert.deepEqual(fields.slice(0, 10).map(w => w.length),
  [13, 141, 121, 22, 53, 44, 40, 97, 198, 16]);

const bytes = Buffer.concat(fields.map(bytesOf));
assert.equal(bytes.length, 7956);
const first80 = bytes.subarray(0, 80).toString("hex");
assert.equal(first80,
  "4b1cde6f9c9af1e10296faf2ead403d2ba85d422667a0a867e3c94819762d7fea3c209f6803ae8e03503a5d077e5f23d5b70594c4c9edbe59d068a6f8b0530005ac5b97ff0a68cbda1f024f94231d77b");

let printable = 0;
let zeros = 0;
let longest = 0;
let run = 0;
for (const b of bytes) {
  if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) printable++;
  if (b === 0) zeros++;
  if (b >= 32 && b <= 126) {
    run++;
    longest = Math.max(longest, run);
  } else {
    run = 0;
  }
}
assert.equal(printable, 3035);
assert.equal(zeros, 54);
assert.equal(longest, 10);

let validUTF8 = true;
try {
  new TextDecoder("utf-8", {fatal: true}).decode(bytes);
} catch (error) {
  assert(error instanceof TypeError);
  validUTF8 = false;
}
assert.equal(validUTF8, false);

const knownMagic = [
  ["gzip", "1f8b08"], ["bzip2", "425a68"],
  ["xz", "fd377a585a00"], ["zip", "504b0304"],
  ["png", "89504e470d0a1a0a"], ["pdf", "25504446"]
];
const prefix = bytes.subarray(0, 8).toString("hex");
const signatures = knownMagic.filter(([, hex]) => prefix.startsWith(hex))
  .map(([name]) => name);
assert.deepEqual(signatures, []);
assert.equal((bytes[0] & 0x80) === 0, true,
  "Offset-zero OpenPGP packets must begin with a set high bit");

const positive = plant(fields);
assert(positive.recoveredEnglishBytes > 7500);
console.log(JSON.stringify({
  source: "original 55 rune-bearing LP2 pages p0-55, printed periods",
  operation: "GP29 positional big-endian integer; ceil(L*log2(29)/8) bytes each",
  periodsWithNonemptyRunes: fields.length,
  runes: fields.flat().length, bytes: bytes.length,
  first80Hex: first80, printable, printableFraction: printable / bytes.length,
  zeroBytes: zeros, longestPrintableRun: longest,
  utf8: validUTF8, magic: signatures,
  validInitialOpenPGPPacket: (bytes[0] & 0x80) !== 0,
  positive,
  decision: "No direct original ASCII/UTF8 or source-framed standard file at byte zero; this exact BASE29 punctuation-field transport is negative."
}, null, 2));
