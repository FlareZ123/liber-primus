"use strict";

/**
 * Freeze the historical 2013 byte-XOR operation on the original p49–51
 * 256-cell printed numerical table, using the exact p15 BASE29 heading
 * as the DATA/560.13 offset and file selector.
 *
 * This tests one original-source bridge with no guessed padding, phase,
 * reverse order, or KDF. It is a candidate, not a claimed Cicada decoder.
 *
 * Node.js 22: node sims/p15_iso56013_grid256_historical_xor_sft.cjs <DATA_560.13>
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const target = JSON.parse(read("resources/cicada2014-anend-binary-witness.json"));
const source = corpus.pages.find((page) => page.page === 15);
assert.ok(source);
const heading = source.indices.slice(0, 9);
assert.deepEqual(heading, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const number = heading.reduce((v, x) => v * 29n + BigInt(x), 0n);
const quotient = number / 3301n;
const remainder = number % 3301n;
assert.deepEqual([number, quotient, remainder],
  [29553734724n, 8952964n, 560n]);

const table = Buffer.from(grid.bytes);
assert.equal(table.length, 256);
assert.equal(grid.pages.reduce((n, page) => n + page.bytes.length, 0), 256);
const hash = (bytes, algorithm) => crypto.createHash(algorithm).update(bytes).digest("hex");
assert.equal(hash(table, "sha256"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const asset = process.argv[2];
assert.ok(asset, "Authentic full DATA/560.13 file path required");
const file = fs.readFileSync(asset);
assert.equal(file.length, 118818811);
assert.equal(hash(file, "sha256"),
  "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");

// Historical positive: the 2013 challenge used this same file and bytewise
// XOR with a fixed offset to recover a known v2 .onion address.
const phoneCipher = Buffer.from("28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex");
const phone = Buffer.from(phoneCipher.map((byte, i) => byte ^ file[12821 + i]));
assert.equal(phone.toString("ascii"), "gbyh7znm6c7ezsmr.onion\n");

const offset = Number(quotient);
const pad = file.subarray(offset, offset + table.length);
assert.equal(pad.length, table.length);
/** @param {Buffer} src @param {Buffer} key */
function xor(src, key) {
  assert.equal(src.length, key.length);
  return Buffer.from(src.map((v, i) => v ^ key[i]));
}
const decoded = xor(table, pad);
assert.deepEqual(xor(decoded, pad), table);
const plantedPlaintext = Buffer.from(
  "CICADA 3301 SOURCE-SELECTED BYTE XOR TEST. ".repeat(7).slice(0, 256), "ascii");
assert.equal(plantedPlaintext.length, 256);
assert.deepEqual(xor(xor(plantedPlaintext, pad), pad), plantedPlaintext);
const printable = [...decoded].filter((b) => b >= 32 && b <= 126).length;
const letters = [...decoded].filter((b) =>
  (b >= 65 && b <= 90) || (b >= 97 && b <= 122)).length;
const view = [...decoded].map((b) => b >= 32 && b <= 126
  ? String.fromCharCode(b) : ".").join("");
const fileMagic = [
  ["PDF", "25504446"], ["PNG", "89504e470d0a1a0a"], ["ZIP", "504b0304"],
  ["gzip", "1f8b"], ["7z", "377abcaf271c"], ["GIF", "47494638"],
  ["Ogg", "4f676753"], ["bzip2", "425a68"], ["zstd", "28b52ffd"],
  ["PGP-armour", "2d2d2d2d2d424547494e20504750"]
].filter(([, magic]) => decoded.toString("hex").startsWith(magic))
  .map(([label]) => label);
const digest = hash(decoded, "sha512");
const output = {
  source: "physical p15 red9 BASE29 ÷3301: quotient as DATA/560.13 byte offset; original 32x8 table as target",
  p15Number: number.toString(),
  quotientOffset: offset,
  fileStem: Number(remainder),
  input: {tableBytes: table.length, tableSha256: hash(table, "sha256"),
    dataBytes: file.length, dataSha256: hash(file, "sha256")},
  historical2013Positive: phone.toString("ascii"),
  method: "original 256 p49–51 table bytes XOR 256 source-file bytes at selected zero-based offset",
  padSliceSha256: hash(pad, "sha256"),
  decoded: {sha256: hash(decoded, "sha256"), hex: decoded.toString("hex"),
    printable, letters, preview: view, magic: fileMagic},
  p56Sha512TargetMatches: digest === target.target_hex.toLowerCase(),
  positive: "256/256 exact forward/back round trip for original and independent planted ASCII",
  status: "original source-frozen direct byte inverse; no claim of plaintext without recognizable output"
};
console.log(JSON.stringify(output, null, 2));
