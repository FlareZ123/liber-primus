"use strict";
/**
 * Literal zero-transition-framed radix28-to-byte interpretation of LP2.
 *
 * The original 2014 round used bzip2, so seek actual BZh magic in the
 * 86 repeated-rune-delimited GP28 runs. This is one bounded original-input
 * candidate, not an assertion that repetition encodes packet boundaries.
 *
 * Node.js 22 CommonJS SFT: node sims/lp2_gp28_repeatframed_bzip2_header_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = source.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * @param {number} prev GP29 index
 * @param {number} cur Distinct GP29 index
 * @param {"cyclic"|"sorted"} mode
 * @returns {number} One radix28 digit.
 */
function rank(prev, cur, mode) {
  assert(cur !== prev);
  return mode === "cyclic"
    ? (cur - prev + 28) % 29
    : cur - Number(cur > prev);
}

/**
 * @param {{page:number,indices:number[]}[]} inputs
 * @param {"cyclic"|"sorted"} mode
 * @returns {{page:number,start:number,digits:number[]}[]}
 */
function frames(inputs, mode) {
  const result = [];
  for (const page of inputs) {
    let digits = [], start = 1;
    for (let i = 1; i < page.indices.length; i++) {
      const prev = page.indices[i - 1], cur = page.indices[i];
      if (prev === cur) {
        result.push({page:page.page, start, digits});
        digits = [];
        start = i + 1;
      } else {
        digits.push(rank(prev, cur, mode));
      }
    }
    result.push({page:page.page, start, digits});
  }
  return result;
}

/**
 * Convert one whole radix28 digit sequence into one minimal big-endian byte
 * integer. Reversing digits tests the second natural reading direction.
 * @param {number[]} digits
 * @param {boolean} reverse
 * @param {boolean} fixedCapacity Pad to ceil(n*log2(28)/8) bytes.
 * @returns {Buffer}
 */
function bytes(digits, reverse, fixedCapacity) {
  let value = 0n;
  for (const d of reverse ? [...digits].reverse() : digits) {
    assert(Number.isInteger(d) && d >= 0 && d < 28);
    value = value * 28n + BigInt(d);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  if (fixedCapacity) {
    const size = Math.ceil(digits.length * Math.log2(28) / 8);
    hex = hex.padStart(size * 2, "0");
  }
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} input @returns {string|null} */
function signature(input) {
  if (input.subarray(0, 3).toString("ascii") === "BZh") return "BZip2";
  if (input.subarray(0, 2).equals(Buffer.from([0x1f, 0x8b]))) return "gzip";
  if (input.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) return "ZIP";
  if (input.subarray(0, 4).toString("ascii") === "%PDF") return "PDF";
  if (input.length > 1 && input[0] === 0x78 &&
      [1, 0x5e, 0x9c, 0xda].includes(input[1])) return "zlib";
  return null;
}

/**
 * Full reversible positive plant for an ordinary BZh9-prefixed byte object.
 * Constructs the canonical no-repeat GP29 cumulative channel and verifies
 * the exact integer rank28 decoder, preserving all original bytes.
 * @param {"cyclic"|"sorted"} mode
 */
function positivePlant(mode) {
  const payload = Buffer.from([0x42,0x5a,0x68,0x39,0x00,0x00,0x01,0xff,0x7a,0x03]);
  let value = BigInt("0x" + payload.toString("hex"));
  const digits = [];
  while (value) {
    digits.unshift(Number(value % 28n));
    value /= 28n;
  }
  const tape = [7];
  for (const d of digits) {
    const prev = tape[tape.length - 1];
    const cur = mode === "cyclic"
      ? (prev + d + 1) % 29
      : d + Number(d >= prev);
    assert.notEqual(cur, prev);
    tape.push(cur);
  }
  const extracted = frames([{page:0, indices:tape}], mode);
  assert.equal(extracted.length, 1);
  const actual = bytes(extracted[0].digits, false, false);
  assert(actual.equals(payload), "Positive byte-level inverse");
  assert.equal(signature(actual), "BZip2");
}

const observations = [];
for (const mode of ["cyclic", "sorted"]) {
  positivePlant(mode);
  const f = frames(pages, mode);
  const readouts = [];
  const whole = f.flatMap(v => v.digits);
  let printable = 0;
  for (const item of f) {
    for (const reverse of [false, true]) {
      for (const fixedCapacity of [false, true]) {
        const result = bytes(item.digits, reverse, fixedCapacity);
        const recognized = signature(result);
        if (recognized) {
          readouts.push({page:item.page, start:item.start,
            reverse, fixedCapacity, recognized});
        }
        if (result.length >= 16) {
          const acceptable = [...result].filter(x => x >= 32 && x <= 126).length;
          if (acceptable / result.length >= 0.85) printable++;
        }
      }
    }
  }
  const wholeOutputs = [];
  for (const reverse of [false, true]) {
    for (const fixedCapacity of [false, true]) {
      const file = bytes(whole, reverse, fixedCapacity);
      wholeOutputs.push({reverse, fixedCapacity, length:file.length,
        signature:signature(file), prefix:file.subarray(0, 16).toString("hex")});
    }
  }
  const actual = {mode, frames:f.length, empty:f.filter(x => !x.digits.length).length,
    sourceDigits:whole.length, maximumFrameDigits:Math.max(...f.map(x => x.digits.length)),
    recognizedFrameHeaders:readouts, highlyPrintableFrames:printable,
    wholeOutputs, positivePlant:true};
  assert.equal(actual.frames, 141);
  assert.equal(actual.empty, 2);
  assert.equal(actual.sourceDigits, 12815);
  assert.equal(actual.maximumFrameDigits, 272);
  assert.deepEqual(readouts, []);
  assert.equal(printable, 0);
  assert(wholeOutputs.every(x => x.length === 7701 && x.signature === null));
  observations.push(actual);
}
console.log(JSON.stringify({status:"PASS; bounded original source test, no unknown plaintext",
  scenario:"2014-style BZip2/standard-header byte stream after no-repeat GP28 framing",
  originalRunes:12956, originalRepeatedWithinPageTransitions:86,
  variants:observations,
  limitation:"Excludes only literal header-at-start and direct rank28 integer-byte conversion. Raw compressed payloads, different framing and secret transforms remain outside test."},null,2));
