"use strict";
/**
 * Literal cross-round original-operation gate.
 * In 2013, the complete 761.MP3 bytes XORed with the Twitter binary yielded
 * a JPEG containing the Gematria Primus clue. The same audio's ID3 PARABLE
 * recurs on LP2 p57. Here apply the identical offset-zero XOR to the complete
 * as-printed LP2 32x8 numeric table, treated as 256 radix-60 bytes.
 *
 * Run: node sims/audio761_original_grid_xor_sft.cjs /tmp/761.MP3
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const audio = fs.readFileSync(process.argv[2]);
assert.equal(audio.length, 4010732);
assert.equal(sha256(audio),
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");
assert.equal(audio.toString("ascii", 0, 3), "ID3");

const gridRecord = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
assert.equal(gridRecord.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(gridRecord.bytes.length, 256);
const grid = Buffer.from(gridRecord.bytes);
assert.equal(sha256(grid),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {Buffer} source */
function xorOffset0(source) {
  const output = Buffer.allocUnsafe(source.length);
  for (let i = 0; i < output.length; ++i) output[i] = source[i] ^ audio[i];
  return output;
}
/** @param {Buffer} b */
function inspect(b) {
  const magic = [
    ["JPEG", "ffd8ff"], ["PNG", "89504e470d0a1a0a"], ["GIF", "47494638"],
    ["ZIP", "504b0304"], ["GZIP", "1f8b08"], ["PDF", "25504446"],
    ["7Z", "377abcaf271c"], ["PGP", "9902"], ["ASCII PGP", "2d2d2d2d2d"],
    ["MP3", "494433"], ["RIFF", "52494646"], ["Ogg", "4f676753"],
    ["ELF", "7f454c46"], ["SQLite", "53514c69746520666f726d6174203300"]
  ];
  const hits = magic.filter(([, head]) =>
    b.subarray(0, head.length / 2).toString("hex") === head).map(([name]) => name);
  const frequencies = new Uint32Array(256);
  let printable = 0, ordinals = 0, printableRun = 0, longestRun = 0;
  for (const byte of b) {
    frequencies[byte]++;
    const ok = byte >= 32 && byte <= 126 || byte === 9 || byte === 10 || byte === 13;
    printable += +ok;
    ordinals += +(byte < 29);
    printableRun = ok ? printableRun + 1 : 0;
    longestRun = Math.max(longestRun, printableRun);
  }
  let entropy = 0;
  for (const n of frequencies) if (n) {
    const p = n / b.length;
    entropy -= p * Math.log2(p);
  }
  return {
    length: b.length, sha256: sha256(b),
    first32Hex: b.subarray(0, 32).toString("hex"),
    first64Ascii: Array.from(b.subarray(0, 64), x => x >= 32 && x <= 126 ?
      String.fromCharCode(x) : ".").join(""),
    fileMagic: hits, printable, rawGP29Ordinals: ordinals,
    longestPrintableRun: longestRun, entropyBitsPerByte: entropy
  };
}
const decoded = xorOffset0(grid);
assert.deepEqual(xorOffset0(decoded), grid);
const known = fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp1-plaintext-reference.txt")).subarray(0, 256);
assert.equal(known.length, 256);
const plantedCipher = xorOffset0(known);
assert.deepEqual(xorOffset0(plantedCipher), known);
console.log(JSON.stringify({
  source: "2013 761.MP3 offset-zero raw file, with original ID3 bytes",
  premise: "2013 MP3 XOR is historically successful; ID3 poem recurs as LP2 PARABLE",
  input: {grid: inspect(grid), audioSha256: sha256(audio), bytesUsed: 256},
  exactXor: inspect(decoded),
  positive: {source: "LP1 authentic readable text, 256 bytes",
    exactRecovery: xorOffset0(plantedCipher).equals(known)},
  interpretation: "Require independently readable binary/plaintext or recognized container; exact reencryption alone does not authenticate an LP2 key"
}, null, 2));
