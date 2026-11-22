"use strict";

/**
 * Source-visible 8-word ASCII candidate XORed with the exact printed 256-byte
 * p50 numeral table. This tests a direct, finite transfer, not a key search.
 *
 * Run: node sims/lp2_wordbit_p50_byte_xor_original_sft.cjs
 * Requires canonical LP2 corpus, complete original transcription and grid.
 * The first 256 source word-bit bytes are used, and no key is repeated.
 * Read-only; no files written.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ix = new Map(corpus.runes.map((r, i) => [r, i]));

/** @returns {number[][]} */
function parseWords() {
  const words = [];
  let current = [];
  for (const ch of read("resources/liber-primus/lp2-transcription.txt")
    .split("%").slice(0, 55).join("%")) {
    if (ix.has(ch)) current.push(ix.get(ch));
    else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch) &&
             current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {number[]} row @param {number} property */
function feature(row, property) {
  if (property === 0) return row.length;
  if (property === 1)
    return row.reduce((sum, r) => sum + corpus.prime[r], 0);
  return row.reduce((sum, r) => sum + r, 0);
}

/**
 * @param {number[][]} rows
 * @param {number} type 0=printed, 1=8-column-first, 2=inverse 8-column
 * @returns {number[][]}
 */
function readOrder(rows, type) {
  if (type === 0) return rows;
  const height = rows.length / 8;
  return Array.from({length: rows.length}, (_, i) => rows[
    type === 1 ? (i % height) * 8 + Math.floor(i / height) :
      (i % 8) * height + Math.floor(i / 8)]);
}

/**
 * @param {number[][]} rows
 * @param {number} property
 * @param {boolean} lsb
 * @param {boolean} complement
 * @returns {number[]}
 */
function wordsToBytes(rows, property, lsb, complement) {
  const out = [];
  for (let start = 0; start < rows.length; start += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      const bit = (feature(rows[start + j], property) & 1) ^ Number(complement);
      if (lsb) byte |= bit << j;
      else byte = byte * 2 + bit;
    }
    out.push(byte);
  }
  return out;
}

/** @param {number[]} bytes */
function score(bytes) {
  let printable = 0;
  let longest = 0;
  let run = 0;
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  const signatures = [
    [0x25, 0x50, 0x44, 0x46], // PDF
    [0x50, 0x4b, 0x03, 0x04], // ZIP
    [0x1f, 0x8b, 0x08],       // gzip
    [0x89, 0x50, 0x4e, 0x47], // PNG
    [0xff, 0xd8, 0xff],       // JPEG
    [0x42, 0x5a, 0x68],       // bzip2
    [0x7f, 0x45, 0x4c, 0x46]  // ELF
  ];
  return {printable, longest,
    knownHeader: signatures.some((prefix) =>
      prefix.every((value, i) => bytes[i] === value))};
}

const words = parseWords();
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
const digits = grid.rows.flat();
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(grid.alphabet.length, 60);
const key = digits.map((token) =>
  [...token].reduce((sum, ch) => 60 * sum + grid.alphabet.indexOf(ch), 0));
assert.equal(key.length, 256);
assert.ok(key.every((value) => value >= 0 && value < 256));
assert.equal(key.reduce((sum, value) => (sum * 131 + value) >>> 0, 0),
  1822574154);
assert.deepEqual(key.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

// Source-shaped positive: the fixed printed key exactly recovers an arbitrary
// message when the message is first encoded as word-length parity bits.
const message = Buffer.from("LIBER PRIMUS HELDOUT POSITIVE", "ascii");
const masked = message.map((byte, i) => byte ^ key[i]);
const planted = [...masked].flatMap((byte) =>
  Array.from({length: 8}, (_, bit) =>
    Array(((byte >> (7 - bit)) & 1) ? 1 : 2).fill(0)));
const replanted = wordsToBytes(planted, 0, false, false)
  .map((byte, i) => byte ^ key[i]);
assert.deepEqual(replanted, [...message]);

const results = [];
for (let order = 0; order < 3; order++) {
  const rows = readOrder(words, order);
  for (let property = 0; property < 3; property++) {
    for (const lsb of [false, true]) {
      for (const complement of [false, true]) {
        const sourceBytes = wordsToBytes(rows, property, lsb, complement);
        assert.equal(sourceBytes.length, 362);
        // One table byte for each source byte: use the source's whole
        // 256-byte table exactly once, without inventing a 106-byte pad.
        const output = key.map((byte, i) => byte ^ sourceBytes[i]);
        results.push({order, feature: property, lsb, complement,
          ...score(output),
          headHex: Buffer.from(output.slice(0, 16)).toString("hex")});
      }
    }
  }
}
assert.equal(results.length, 36);
const high = Math.max(...results.map((r) => r.printable));
const low = Math.min(...results.map((r) => r.printable));
const run = Math.max(...results.map((r) => r.longest));
assert.deepEqual([low, high, run], [79, 107, 8]);
assert.equal(results.filter((r) => r.knownHeader).length, 0);
assert.equal(results.filter((r) => r.printable === 256).length, 0);
console.log(JSON.stringify({
  originalWords: words.length,
  originalRunes: 12956,
  tableBytes: 256,
  wordsConsumedPerRead: 2048,
  printedWordByteReadLength: 362,
  testedVariants: results.length,
  printableRange: [low, high],
  longestPrintableRun: run,
  knownFileHeaders: 0,
  best: results.filter((r) => r.printable === high),
  firstUnmodifiedSourceReadout: results[0],
}, null, 2));