"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Original-source direct-key test.  No files are modified.
 * Execute on Node.js 22 from any working directory.
 */

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const jpeg = Buffer.from(read("resources/historical/cicada2013-gematria-jpeg.b64").toString("ascii").replace(/\s/g, ""), "base64");
const SHA1_GIT_BLOB = "65ded13617196f0fd5d210855a75452ff2e7a340";
const pageInputs = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length > 0);
const native = corpus.pages.find(p => p.page === 57).indices;
const raw = pageInputs.flatMap(p => p.indices);
const offsets = [0, 761, 1033, 3301];
const mod = n => (n % 29 + 29) % 29;

/** @param {number[]} values */
function ioc(values) {
  const n = values.length;
  const frequencies = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    frequencies[value]++;
  }
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/** @param {number} byte @param {"mod29" | "scale29"} projection */
function projectByte(byte, projection) {
  return projection === "mod29" ? byte % 29 : Math.floor(byte * 29 / 256);
}

/**
 * @param {number[][]} input
 * @param {number} offset
 * @param {"mod29" | "scale29"} projection
 * @param {1 | -1} sign
 * @param {boolean} pageReset
 */
function translate(input, offset, projection, sign, pageReset) {
  let clock = 0;
  const output = [];
  for (const page of input) {
    if (pageReset) clock = 0;
    const decoded = [];
    for (const value of page) {
      const k = projectByte(jpeg[(clock + offset) % jpeg.length], projection);
      decoded.push(mod(value + sign * k));
      clock++;
    }
    output.push(decoded);
  }
  return output;
}

/**
 * Serialize all GP indices on a complete physical page as a nonnegative
 * big-endian base29 integer, keeping the exact length and leading zeroes.
 * @param {number[]} digits
 */
function packBase29(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert(digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const width = Math.ceil(digits.length * Math.log2(29) / 8);
  const hex = value.toString(16).padStart(2 * width, "0");
  assert.equal(hex.length, 2 * width);
  return Buffer.from(hex, "hex");
}

/**
 * The exact earlier Cicada XOR primitive, with a source JPEG as the
 * speculative 2014 byte operand.
 * @param {Buffer[]} pageBytes
 * @param {number} offset
 * @param {boolean} pageReset
 */
function xorPages(pageBytes, offset, pageReset) {
  let clock = 0;
  const out = [];
  for (const part of pageBytes) {
    if (pageReset) clock = 0;
    const result = Buffer.alloc(part.length);
    for (let i = 0; i < part.length; i++)
      result[i] = part[i] ^ jpeg[(clock + offset) % jpeg.length], clock++;
    out.push(result);
  }
  return out;
}

/** @param {Buffer[]} values */
function byteSummary(values) {
  const flat = Buffer.concat(values);
  let printable = 0;
  for (const value of flat) if (value >= 32 && value <= 126) printable++;
  const prefix = flat.subarray(0, 16).toString("hex");
  const signatures = ["89504e470d0a1a0a", "ffd8ff", "474946383761", "474946383961",
    "504b0304", "25504446", "1f8b", "7f454c46", "526172211a0700"];
  return {
    byteLength: flat.length,
    printableRatio: printable / flat.length,
    first16Hex: prefix,
    recognizedFileSignature: signatures.some(sig => prefix.startsWith(sig))
  };
}

function main() {
  assert.equal(jpeg.length, 64167);
  const gitBlob = crypto.createHash("sha1").update(Buffer.concat([
    Buffer.from("blob " + jpeg.length + "\0", "ascii"), jpeg
  ])).digest("hex");
  assert.equal(gitBlob, SHA1_GIT_BLOB);
  assert.deepEqual(Array.from(jpeg.subarray(0, 4)), [255, 216, 255, 224]);
  assert.equal(pageInputs.length, 55);
  assert.equal(raw.length, 12956);
  assert.equal(native.length, 95);

  const sources = pageInputs.map(p => p.indices);
  const additive = [];
  for (const offset of offsets) {
    for (const projection of ["mod29", "scale29"]) {
      for (const sign of [-1, 1]) {
        for (const reset of [false, true]) {
          const decrypted = translate(sources, offset, projection, sign, reset);
          const recovered = decrypted.flat();
          assert.equal(recovered.length, raw.length);
          assert.deepEqual(
            translate(decrypted, offset, projection, -sign, reset).flat(), raw
          );
          const plant = translate([native], offset, projection, sign, reset);
          assert.deepEqual(translate(plant, offset, projection, -sign, reset)[0], native);
          additive.push({
            offset, projection, sign, reset, ioc: ioc(recovered),
            physicalP0IoC: ioc(decrypted[0]),
            prefix48Runes: recovered.slice(0, 48).map(i => corpus.translit[i]).join("")
          });
        }
      }
    }
  }
  assert.equal(additive.length, 32);
  additive.sort((a, b) => b.ioc - a.ioc);
  // Both sides are calibrated against authentic original GP29 material.
  assert(additive[0].ioc < 0.04);

  const packed = sources.map(packBase29);
  const xorCandidates = [];
  const nativePacked = packBase29(native);
  for (const offset of offsets) {
    for (const reset of [false, true]) {
      const cipher = xorPages(packed, offset, reset);
      const recover = xorPages(cipher, offset, reset);
      assert.deepEqual(recover, packed);
      const knownCipher = xorPages([nativePacked], offset, reset);
      assert.deepEqual(xorPages(knownCipher, offset, reset)[0], nativePacked);
      const observed = byteSummary(cipher);
      assert.equal(observed.recognizedFileSignature, false);
      xorCandidates.push({offset, reset, ...observed});
    }
  }
  assert.equal(xorCandidates.length, 8);

  const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
  const jpegHashMatch = crypto.createHash("sha512").update(jpeg).digest("hex") === target;
  assert.equal(jpegHashMatch, false);

  const summary = {
    source: "2013 recovered gematria.jpg, prior-stage XOR output; new direct-key interpretation unauthenticated",
    sourceGitBlob: gitBlob,
    sourceSHA256: crypto.createHash("sha256").update(jpeg).digest("hex"),
    sourceByteLength: jpeg.length,
    originalUnknownRunes: raw.length,
    baselineUnknownIoC: ioc(raw),
    genuineSolvedP57IoC: ioc(native),
    additiveCases: additive.length,
    additiveBest: additive.slice(0, 4),
    additiveMinIoC: additive[additive.length - 1].ioc,
    base29XorCases: xorCandidates,
    p56SHA512WholeJPEGMatch: jpegHashMatch,
    nativeSolvedReroundtrips: additive.length + xorCandidates.length,
    decision: "No native-GP original plaintext or recognizable binary format recovered from the source JPEG as a direct additive or XOR keystream. This does not exclude a separately sourced KDF, hidden start offset, or different cipher."
  };
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
module.exports = {main, ioc, packBase29};
