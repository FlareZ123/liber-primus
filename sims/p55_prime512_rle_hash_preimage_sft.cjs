"use strict";

/**
 * Source-motivated p55 13/10/23-dot GP-prime run-length hash gates.
 * Tests the 13-dot 512-bit stream, ten-dot complement plus four corners
 * (512 bits), and full 23-dot stencil plus four corners (1024 bits), both
 * starting polarities, direct digest equality where lengths agree, and
 * SHA-512/SHA3-512/BLAKE2b-512. The source does not authenticate RLE or hash.
 * Run: node sims/p55_prime512_rle_hash_preimage_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(parsed.runeCount, 12956);
const words = parsed.words.filter(w => w.startPage === 54);
assert.deepEqual(words.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const symbols = new Map(corpus.runes.map((r, i) => [r, i]));
const twicePeeled = words.flatMap(w => [...w.runes].slice(2, -2))
  .map(g => {
    const v = symbols.get(g);
    assert.notEqual(v, undefined);
    return v;
  });
assert.equal(twicePeeled.length, 23);
const translit = seq => seq.map(x => corpus.translit[x]).join(" ");
assert.equal(translit(twicePeeled),
  "G D A B F X I M U C P H NG D IA I G X EO TH TH I M");
// Three source-retained columns of the 23 occupied p57 red-dot stencil.
const retainedDotSlots = [1, 3, 4, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21];
const thirteen = retainedDotSlots.map(i => twicePeeled[i]);
assert.equal(translit(thirteen), "D B F I U C H D IA G EO TH I");
const lengths = thirteen.map(i => corpus.prime[i]);
assert.deepEqual(lengths, [89,61,2,31,3,13,23,89,107,17,41,5,31]);
assert.equal(lengths.reduce((a, b) => a + b), 512);
// Original solved p56 printed 128-hex deep-web page hash. Hash *algorithm*
// and hashed object have never been authenticated; this is a finite test.
const target =
  "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(target.length, 128);
assert.equal(crypto.createHash("sha512").update("abc").digest("hex").slice(0, 16),
  "ddaf35a193617aba");
const outputs = [];
for (const firstBit of [0, 1]) {
  const bits = lengths.map((n, i) => String((firstBit + i) % 2)
    .repeat(n)).join("");
  assert.equal(bits.length, 512);
  const bytes = Buffer.alloc(64);
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") bytes[i >> 3] |= 1 << (7 - (i & 7));
  }
  const rawHex = bytes.toString("hex");
  assert.notEqual(rawHex, target);
  const digests = {};
  for (const [name, algorithm] of [
    ["sha512", "sha512"], ["sha3_512", "sha3-512"],
    ["blake2b", "blake2b512"]
  ]) {
    const digest = crypto.createHash(algorithm).update(bytes).digest("hex");
    assert.equal(digest.length, 128);
    assert.notEqual(digest, target);
    digests[name] = digest;
  }
  outputs.push({ firstBit, bitLength: bits.length,
    rawPrefix: bytes.toString("hex").slice(0, 48), digests });
}
assert.equal(outputs[0].digests.sha512.slice(0, 16),
  "fc6531f1fcd1f715");
assert.equal(outputs[1].digests.sha512.slice(0, 16),
  "7b44f334250146ac");

// The other two stencil columns contain ten runes with prime sum 508.
// Insert the four empty corners of the 9x5 stencil around the first and last
// two complement runs, yielding a second, independently selected 512-bit stream.
const complementDotSlots = [0, 2, 5, 7, 10, 12, 15, 17, 20, 22];
const ten = complementDotSlots.map(i => twicePeeled[i]);
assert.equal(translit(ten), "G A X M P NG I X TH M");
const tenLengths = ten.map(i => corpus.prime[i]);
assert.deepEqual(tenLengths, [17,97,47,71,43,79,31,47,5,71]);
assert.equal(tenLengths.reduce((a, b) => a + b), 508);
const complementOutputs = [];
for (const firstBit of [0, 1]) {
  const runs = tenLengths.map((n, i) => String((firstBit + i) % 2).repeat(n));
  const bits = "0" + runs.slice(0, 2).join("") + "0" +
    runs.slice(2, 8).join("") + "0" + runs.slice(8).join("") + "0";
  assert.equal(bits.length, 512);
  const bytes = Buffer.alloc(64);
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") bytes[i >> 3] |= 1 << (7 - (i & 7));
  }
  const rawHex = bytes.toString("hex");
  assert.notEqual(rawHex, target);
  const digests = {};
  for (const [name, algorithm] of [
    ["sha512", "sha512"], ["sha3_512", "sha3-512"],
    ["blake2b", "blake2b512"]
  ]) {
    const digest = crypto.createHash(algorithm).update(bytes).digest("hex");
    assert.equal(digest.length, 128);
    assert.notEqual(digest, target);
    digests[name] = digest;
  }
  complementOutputs.push({ firstBit, bitLength: bits.length,
    rawPrefix: rawHex.slice(0, 48), rawEqualsTarget: rawHex === target, digests });
}
assert.equal(complementOutputs[0].digests.sha512.slice(0, 16), "fa4128e813b7db71");
assert.equal(complementOutputs[1].digests.sha512.slice(0, 16), "b24f6c1b8adba3d4");

// The complete 23-dot stencil is a 9x5 mask with four empty corner cells.
// The 23 source runes occupy the remaining marked cells in row-major order.
// Their GP-prime weights total 1020; insert one literal zero bit at each
// empty corner (before run 0, after run 2, before run 20, after run 22).
const fullPrimeWeights = twicePeeled.map(i => corpus.prime[i]);
assert.equal(fullPrimeWeights.reduce((a, b) => a + b), 1020);
const fullStencilOutputs = [];
for (const firstBit of [0, 1]) {
  const runs = fullPrimeWeights.map((n, i) => String((firstBit + i) % 2).repeat(n));
  const bits = "0" + runs.slice(0, 3).join("") + "0" +
    runs.slice(3, 20).join("") + "0" + runs.slice(20).join("") + "0";
  assert.equal(bits.length, 1024);
  const bytes = Buffer.alloc(128);
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") bytes[i >> 3] |= 1 << (7 - (i & 7));
  }
  const digests = {};
  for (const [name, algorithm] of [
    ["sha512", "sha512"], ["sha3_512", "sha3-512"],
    ["blake2b", "blake2b512"]
  ]) {
    const digest = crypto.createHash(algorithm).update(bytes).digest("hex");
    assert.equal(digest.length, 128);
    assert.notEqual(digest, target);
    digests[name] = digest;
  }
  fullStencilOutputs.push({ firstBit, bitLength: bits.length,
    rawPrefix: bytes.toString("hex").slice(0, 48), digests });
}
assert.equal(fullStencilOutputs[0].digests.sha512.slice(0, 16), "0e873d48a15650f3");
assert.equal(fullStencilOutputs[1].digests.sha512.slice(0, 16), "c2327e586c444d5a");
console.log(JSON.stringify({
  source: "Original p55 two-peel 13-dot projection, original solved p56 hash",
  primeRunLengths: lengths, totalBits: 512,
  targetHash: target,
  test: "Exactly two bit polarities, raw 64-byte RLE input, three standard 512-bit hash functions",
  results: outputs,
  complement512: complementOutputs,
  fullStencil1024: fullStencilOutputs,
  decision: "Neither the 13-run 512-bit stream, the 10-run plus four-corner 512-bit complement stream, nor the four-corner-completed 23-run 1024-bit stream matches the published target directly or under SHA-512, SHA3-512, or BLAKE2b-512; no authentic hash algorithm or preimage established."
}, null, 2));
