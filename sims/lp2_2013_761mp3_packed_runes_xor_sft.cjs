"use strict";
/**
 * Test the literal, historically authentic 2013 761.MP3 offset-zero XOR on
 * the original unsolved GP29 rune stream in three direct byte serializations.
 * Read-only. Does not assume any hidden key, guessed audio offset or rune shift.
 *
 * Usage: node sims/lp2_2013_761mp3_packed_runes_xor_sft.cjs C:\\path\\to\\761.MP3
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {Buffer} input */
const sha256 = input => crypto.createHash("sha256").update(input).digest("hex");
const audio = fs.readFileSync(process.argv[2]);
assert.equal(audio.length, 4010732);
assert.equal(sha256(audio), "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");
assert.equal(audio.toString("ascii", 0, 3), "ID3");

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const cipher = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const known = corpus.pages[57].indices;
assert.equal(cipher.length, 12956);
assert.equal(known.length, 95);
for (const digit of [...cipher, ...known]) assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);

/**
 * @param {number[]} indices
 * @param {"msb"|"lsb"} order
 * @returns {Buffer}
 */
function pack5(indices, order) {
  const result = Buffer.alloc(Math.ceil(indices.length * 5 / 8));
  for (let i = 0; i < indices.length; ++i) {
    for (let j = 0; j < 5; ++j) {
      const bit = (indices[i] >>> (order === "msb" ? 4 - j : j)) & 1;
      const at = i * 5 + j;
      result[at >>> 3] |= bit << (order === "msb" ? 7 - (at & 7) : at & 7);
    }
  }
  return result;
}
/**
 * @param {Buffer} packed
 * @param {number} count
 * @param {"msb"|"lsb"} order
 * @returns {number[]}
 */
function unpack5(packed, count, order) {
  const result = [];
  for (let i = 0; i < count; ++i) {
    let digit = 0;
    for (let j = 0; j < 5; ++j) {
      const at = i * 5 + j;
      const bit = packed[at >>> 3] >>> (order === "msb" ? 7 - (at & 7) : at & 7) & 1;
      digit |= bit << (order === "msb" ? 4 - j : j);
    }
    result.push(digit);
  }
  return result;
}
/** @param {Buffer} input */
function xorOriginal(input) {
  assert.ok(input.length <= audio.length);
  const result = Buffer.allocUnsafe(input.length);
  for (let i = 0; i < input.length; ++i) result[i] = input[i] ^ audio[i];
  return result;
}
/** @param {Buffer} data */
function inspect(data) {
  const format = [
    ["JPEG", "ffd8ff"], ["PNG", "89504e470d0a1a0a"], ["ZIP", "504b0304"],
    ["GZIP", "1f8b08"], ["PDF", "25504446"], ["PGP Armor", "2d2d2d2d2d"],
    ["GIF", "47494638"], ["7zip", "377abcaf271c"], ["RIFF", "52494646"],
    ["Ogg", "4f676753"], ["MP3", "494433"]
  ].filter(([, prefix]) => data.subarray(0, prefix.length / 2).toString("hex") === prefix)
    .map(([name]) => name);
  let printable = 0, run = 0, longest = 0, zeroTo28 = 0;
  for (const b of data) {
    const ok = b >= 32 && b <= 126 || b === 9 || b === 10 || b === 13;
    printable += +ok;
    run = ok ? run + 1 : 0;
    longest = Math.max(longest, run);
    zeroTo28 += +(b < 29);
  }
  return {
    bytes: data.length,
    sha256: sha256(data),
    first32hex: data.subarray(0, 32).toString("hex"),
    fileMagic: format,
    printableCount: printable,
    printableRate: printable / data.length,
    longestPrintableRun: longest,
    literalGp29Bytes: zeroTo28
  };
}
const cases = [
  {name: "one_byte_ordinal", encoded: Buffer.from(cipher), bitOrder: null},
  {name: "five_bit_msb", encoded: pack5(cipher, "msb"), bitOrder: "msb"},
  {name: "five_bit_lsb", encoded: pack5(cipher, "lsb"), bitOrder: "lsb"}
];
const results = [];
for (const item of cases) {
  const decoded = xorOriginal(item.encoded);
  assert.deepEqual(xorOriginal(decoded), item.encoded);
  const record = {name: item.name, sourceBytes: item.encoded.length, output: inspect(decoded)};
  if (item.bitOrder) {
    const order = item.bitOrder;
    assert.deepEqual(unpack5(item.encoded, cipher.length, order), cipher);
    const interpreted = unpack5(decoded, cipher.length, order);
    record.gp29InvalidIndices = interpreted.filter(x => x >= 29).length;
    record.gp29ValidIndices = interpreted.length - record.gp29InvalidIndices;
    assert.ok(record.gp29InvalidIndices > 0);
    const plant = pack5(known, order);
    assert.deepEqual(unpack5(xorOriginal(xorOriginal(plant)), known.length, order), known);
  } else {
    assert.deepEqual([...xorOriginal(xorOriginal(Buffer.from(known)))], known);
    record.gp29InvalidBytes = [...decoded].filter(x => x >= 29).length;
  }
  results.push(record);
}
console.log(JSON.stringify({
  premise: "Original 2013 761.MP3 was the exact byte-offset-zero XOR operand in a Cicada stage; metadata is reproduced on solved LP2 p57.",
  originalRunes: cipher.length,
  originalAudioSha256: sha256(audio),
  packaging: "Original 56 unknown pages concatenated; no fitted audio start, key, page reset or guessed bit transformation",
  results,
  positive: "All 95 source-authentic solved p57 GP29 runes recovered through each synthetic XOR encoding exactly",
  decision: "A genuine direct native GP29 plaintext or recognizable file header would be necessary to advance this original cipher"
}, null, 2));
