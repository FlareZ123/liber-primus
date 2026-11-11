"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const resource = (name) => JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
const corpus = resource("lp2-corpus.json");
const grid = resource("lp2-grid-256.json");
const transcript = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const words = parseLP2Words(transcript);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.pages.flatMap((page) => page.bytes);

/**
 * Source-fixed GP29 word integer, leading rune most significant.
 * @param {string} runes Word in canonical GP rune characters.
 * @returns {bigint}
 */
function wordValue(runes) {
  let value = 0n;
  for (const rune of runes) {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined);
    value = value * 29n + BigInt(index);
  }
  return value;
}

/**
 * @param {string} runes Original or planted GP word.
 * @returns {number} Low byte of its base-29 numeric value.
 */
function wordAddress(runes) {
  return Number(wordValue(runes) % 256n);
}

/**
 * @param {number} index Source byte or table-cell address.
 * @returns {string} Its canonical two-rune base-29 representation.
 */
function twoRuneAddress(index) {
  assert(index >= 0 && index <= 255);
  return corpus.runes[Math.floor(index / 29)] + corpus.runes[index % 29];
}

/** @param {number[]} bytes */
function diagnostics(bytes) {
  const frequencies = new Array(256).fill(0);
  for (const byte of bytes) frequencies[byte]++;
  let entropy = 0;
  for (const count of frequencies) {
    if (count) {
      const probability = count / bytes.length;
      entropy -= probability * Math.log2(probability);
    }
  }
  let longest = "";
  let current = "";
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      current += String.fromCharCode(byte);
      if (current.length > longest.length) longest = current;
    } else {
      current = "";
    }
  }
  const string = Buffer.from(bytes).toString("latin1");
  return {
    length: bytes.length,
    entropy_bits_per_byte: entropy,
    printable_fraction: bytes.filter((byte) => byte >= 32 && byte <= 126).length / bytes.length,
    longest_printable_run: longest,
    planted_english_trigrams: ["THE", "AND", "ING", "ION", "YOU", "KEY", "END"]
      .map((token) => [token, string.split(token).length - 1]),
  };
}

assert.equal(words.words.length, 2896);
assert.equal(words.runeCount, 12956);
assert.equal(table.length, 256);
assert.equal(new Set(table).size, 161);
assert.equal(wordValue(twoRuneAddress(3301 % 256)), BigInt(3301 % 256));

const addresses = words.words.map((word) => wordAddress(word.runes));
const originalLowBytes = addresses;
const originalTableBytes = addresses.map((address) => table[address]);

const original = {
  words: words.words.length,
  runes: words.runeCount,
  table_cells: table.length,
  distinct_table_byte_values: new Set(table).size,
  byte_mod256: diagnostics(originalLowBytes),
  p50_lookup: diagnostics(originalTableBytes),
};

// Positive controls verify both entire source-specified transports with fresh inputs.
const rawPositive = [72, 73].map((value) => twoRuneAddress(value));
assert.equal(Buffer.from(rawPositive.map(wordAddress)).toString("ascii"), "HI");
const tablePositive = [84, 72, 69].map((character) => {
  const address = table.indexOf(character);
  assert(address >= 0);
  return twoRuneAddress(address);
});
assert.equal(Buffer.from(tablePositive.map((runes) => table[wordAddress(runes)])).toString("ascii"), "THE");

// Frozen original-input outputs, computed without fitting offsets or any key.
assert.equal(original.byte_mod256.length, 2896);
assert.equal(original.p50_lookup.length, 2896);
assert(Math.abs(original.byte_mod256.printable_fraction - 0.3639502762430939) < 1e-12);
assert(Math.abs(original.p50_lookup.printable_fraction - 0.4053867403314917) < 1e-12);
assert.equal(original.byte_mod256.longest_printable_run, "Z'_]1!&");
assert.equal(original.p50_lookup.longest_printable_run, "P*L\\ns4");
assert(original.byte_mod256.planted_english_trigrams.every(([, count]) => count === 0));
assert(original.p50_lookup.planted_english_trigrams.every(([, count]) => count === 0));

console.log(JSON.stringify({ test: "PASS", original, controls: { raw: "HI", table: "THE" } }, null, 2));
