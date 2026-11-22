"use strict";

/**
 * Source-fixed p56 512-bit digest gate for the 85 original LP2 repeat-bearing
 * printed words. Standalone Windows-compatible SFT, Node.js >= 20.
 * Run from repository root: node sims/lp2_repeat85_word_combinadic_sha512_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const digest512 = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const sha512 = (buf) => crypto.createHash("sha512").update(buf).digest("hex");
assert.equal(sha512(Buffer.from("abc", "ascii")).slice(0, 24),
  "ddaf35a193617abacc417349", "published SHA-512 arithmetic control");

// Percent separates source pages; physical p50 is an illustration-only
// numerical table absent from this rune transcription. The first 55
// segments are exactly the 55 unsolved rune-bearing pages p0-p55.
// Source '-' and '.' delimit printed words; '/' marks line wraps and is
// removed, not counted as a word boundary. This preserves cross-page
// partial words and reproduces the authoritative 2,896-word inventory.
const source = transcription.split("%").slice(0, 55).join("").replace(/\//g, "");
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const words = source.split(/[-.]/).map((chunk) =>
  Array.from(chunk).filter((c) => index.has(c)));
const nonempty = words.filter((w) => w.length > 0);
assert.equal(nonempty.length, 2896);
const runes = [], wordId = [];
for (const [id, word] of nonempty.entries()) {
  for (const rune of word) {
    runes.push(index.get(rune));
    wordId.push(id);
  }
}
assert.equal(runes.length, 12956);
assert.deepEqual(runes,
  corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices),
  "word parse must preserve every original ciphertext rune in order");

// The event word is the word owning the second occurrence of an
// adjacent-equal rune pair (including pairs crossing word delimiters).
const events = [];
for (let j = 1; j < runes.length; j++)
  if (runes[j] === runes[j - 1]) events.push(wordId[j]);
const affected = [...new Set(events)].sort((a, b) => a - b);
assert.equal(events.length, 86);
assert.equal(affected.length, 85);
assert.deepEqual(affected.slice(0, 4), [27, 46, 101, 145]);
assert.deepEqual(affected.slice(-4), [2768, 2834, 2865, 2891]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  let value = 1n;
  for (let j = 1; j <= k; j++)
    value = value * BigInt(n - j + 1) / BigInt(j);
  return value;
}
/** @param {number[]} sortedWordIds @returns {bigint} */
function colex(sortedWordIds) {
  return sortedWordIds.reduce((sum, id, i) => sum + choose(id, i + 1), 0n);
}
/** @param {bigint} val @param {number} count @returns {Buffer} */
function asBytes(val, count) {
  const bytes = Buffer.alloc(count);
  for (let j = count - 1; j >= 0; j--) {
    bytes[j] = Number(val & 255n);
    val >>= 8n;
  }
  assert.equal(val, 0n);
  return bytes;
}

const capacity = choose(nonempty.length, affected.length);
assert.equal(capacity.toString(2).length, 549);
const width = Math.ceil(capacity.toString(2).length / 8);
const reversed = affected.map((id) => nonempty.length - 1 - id).reverse();
const forwardRank = colex(affected);
const backwardRank = colex(reversed);
const ranks = {
  colex: forwardRank,
  reverse_colex: backwardRank,
  lex: capacity - 1n - forwardRank,
  reverse_lex: capacity - 1n - backwardRank
};
const candidates = new Map();
for (const [name, rank] of Object.entries(ranks)) {
  assert(rank >= 0n && rank < capacity);
  const bigEndian = asBytes(rank, width);
  candidates.set(name + "_big", bigEndian);
  candidates.set(name + "_little", Buffer.from(bigEndian).reverse());
}

const bitmaskMSB = Buffer.alloc(nonempty.length / 8);
for (const id of affected) bitmaskMSB[Math.floor(id / 8)] |= 1 << (7 - id % 8);
const bitmaskLSB = Buffer.from(bitmaskMSB).map((b) => {
  let flipped = 0;
  for (let i = 0; i < 8; i++) flipped |= ((b >> i) & 1) << (7 - i);
  return flipped;
});
candidates.set("bitmap_msb", bitmaskMSB);
candidates.set("bitmap_lsb", bitmaskLSB);

for (const basis of [0, 1]) {
  for (const endian of ["big", "little"]) {
    const packed = Buffer.alloc(affected.length * 2);
    affected.forEach((id, j) => {
      if (endian === "big") packed.writeUInt16BE(id + basis, j * 2);
      else packed.writeUInt16LE(id + basis, j * 2);
    });
    candidates.set("indices" + basis + "_" + endian, packed);
  }
}
assert.equal(candidates.size, 14);
assert.equal(sha512(candidates.get("colex_big")).slice(0, 24),
  "ea078e0dd750fdb8e3d08c61", "independent Python 3.11 regression");
const summaries = [];
for (const [name, bytes] of candidates) {
  const digest = sha512(bytes);
  assert.notEqual(digest, digest512,
    "digest unexpectedly matches p56: independently inspect and verify");
  summaries.push({ name, bytes: bytes.length, sha512_prefix: digest.slice(0, 24) });
}
console.log(JSON.stringify({
  input: { original_runes: runes.length, printed_words: nonempty.length,
    doublet_sites: events.length, affected_words: affected.length },
  address_capacity_bits: capacity.toString(2).length,
  fixed_target: digest512,
  candidates_tested: summaries.length,
  matches: 0,
  candidates: summaries,
  scope: "Only these natural fixed-order encodings under SHA-512; no unknown plaintext or p56 preimage."
}, null, 2));
