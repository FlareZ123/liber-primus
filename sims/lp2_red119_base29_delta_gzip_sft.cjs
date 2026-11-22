"use strict";

const assert = require("node:assert/strict");
const zlib = require("node:zlib");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const ink = require("../resources/liber-primus/lp2-ink-annotations.json");

/**
 * Frozen, single framing for a source-selected two-page test:
 * - source punctuation: red13-bracketed local 119..121 on p3 and p39;
 * - payload: local offsets 122 through the end of each physical page;
 * - digits: (current GP29 index - previous GP29 index) mod 29, retaining 0;
 * - radix: historical 2013 BASE29, high-order digit first;
 * - byte width: ceil(log2(29^digitCount)/8), zero-padded on the left;
 * - format target: the historic 2013 sky/ICMP gzip magic 1f8b08.
 *
 * No guessed key, offset, header displacement, alphabet change or phase.
 */
const CASES = [
  { page: 3, triad: [13, 23, 2], word: "SCY", length: 95, width: 58,
    zeroSteps: 2, first16: "1052e2f3ed41c367005213d06a39d2ae" },
  { page: 39, triad: [27, 5, 15], word: "UDP", length: 118, width: 72,
    zeroSteps: 1, first16: "23b6257b5821076843c256c986339e8f" },
];

/**
 * @param {number} digitCount
 * @returns {number}
 */
function byteWidth(digitCount) {
  let capacity = 29n ** BigInt(digitCount) - 1n;
  let result = 0;
  while (capacity > 0n) {
    capacity >>= 8n;
    result++;
  }
  return result;
}

/**
 * @param {number[]} digits
 * @returns {Buffer}
 */
function packBase29(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const result = Buffer.alloc(byteWidth(digits.length));
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return result;
}

/**
 * @param {Buffer} bytes
 * @param {number} digitCount
 * @returns {number[]}
 */
function unpackBase29(bytes, digitCount) {
  let value = 0n;
  for (const octet of bytes) value = value * 256n + BigInt(octet);
  assert.ok(value < 29n ** BigInt(digitCount));
  const digits = new Array(digitCount);
  for (let i = digitCount - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

/**
 * @param {number} previous
 * @param {number[]} deltas
 * @returns {number[]}
 */
function reconstructCipher(previous, deltas) {
  return deltas.map((step) => {
    previous = (previous + step) % 29;
    return previous;
  });
}

function run() {
  const knownText = "SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
  const magic = Buffer.from([0x1f, 0x8b, 0x08]);

  for (const item of CASES) {
    const source = corpus.pages.find((entry) => entry.page === item.page);
    const pageInk = ink.pages.find((entry) => entry.page === item.page);
    assert.ok(source && pageInk);
    assert.equal(source.indices.length, pageInk.rune_count);
    const marked = pageInk.red_spans.find((span) => span.start === 119 && span.length === 3);
    assert.ok(marked);
    const marker = [...marked.runes].map((rune) => corpus.runes.indexOf(rune));
    assert.deepStrictEqual(marker, item.triad);
    assert.deepStrictEqual(source.indices.slice(119, 122), marker);
    const atbash = marker.map((i) => corpus.translit[28 - i]).join("");
    assert.equal(atbash, item.word);

    const preceding = source.indices[121];
    const deltas = [];
    for (let i = 122; i < source.indices.length; i++) {
      deltas.push((source.indices[i] - source.indices[i - 1] + 29) % 29);
    }
    assert.equal(deltas.length, item.length);
    assert.equal(deltas.filter((x) => x === 0).length, item.zeroSteps);

    const actual = packBase29(deltas);
    assert.equal(actual.length, item.width);
    assert.equal(actual.subarray(0, 16).toString("hex"), item.first16);
    assert.deepStrictEqual(unpackBase29(actual, deltas.length), deltas);
    assert.deepStrictEqual(reconstructCipher(preceding, deltas), source.indices.slice(122));
    const hasGzipHeader = actual.subarray(0, 3).equals(magic);
    assert.equal(hasGzipHeader, false);

    // Original-length, authentic solved-text gzip plant. Level 0 gives
    // a fixed 23-byte gzip overhead for these sub-64KiB payloads.
    const plain = Buffer.from(knownText.slice(0, item.width - 23), "ascii");
    assert.equal(plain.length, item.width - 23);
    const gzip = zlib.gzipSync(plain, { level: 0 });
    assert.equal(gzip.length, item.width);
    assert.ok(gzip.subarray(0, 3).equals(magic));
    assert.deepStrictEqual(zlib.gunzipSync(gzip), plain);
    const plantedSteps = unpackBase29(gzip, deltas.length);
    const plantedCipher = reconstructCipher(preceding, plantedSteps);
    assert.equal(plantedCipher.length, deltas.length);
    assert.deepStrictEqual(packBase29(plantedSteps), gzip);
    let last = preceding;
    const recoveredSteps = plantedCipher.map((x) => {
      const step = (x - last + 29) % 29;
      last = x;
      return step;
    });
    assert.deepStrictEqual(recoveredSteps, plantedSteps);

    console.log("p" + item.page + " marker=" + atbash +
      " start=122 deltas=" + deltas.length +
      " zero-steps=" + item.zeroSteps +
      " base29-bytes=" + actual.length +
      " first16=" + item.first16 +
      " gzip-magic=" + hasGzipHeader +
      " original-roundtrip=PASS gzip-plant=PASS");
  }
  console.log("RESULT: both source-bracketed BASE29 delta tails fail literal gzip framing.");
}

run();
