"use strict";
/**
 * Original p15 numeric Fibonacci-prime spiral -> authenticated 2014
 * Emerson letter source -> 16-byte literal key -> p49-p51 256-byte
 * table, one exact AES-128-ECB receiver.
 *
 * This is a negative original-input gate. Neither 16-byte extraction nor
 * AES-ECB is authenticated as an LP2 cipher instruction. It does not
 * exclude a different KDF, cipher mode, source witness, or receiver.
 *
 * Run on Windows 11: node sims/lp2_p15_emerson16_p50_aes128_ecb_original_sft.cjs
 * Official API: https://nodejs.org/api/crypto.html
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
function source(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
/** @param {Buffer} value */
function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
/** @param {Buffer} value */
function entropy(value) {
  const counts = new Uint32Array(256);
  for (const byte of value) counts[byte]++;
  let result = 0;
  for (const count of counts) if (count) {
    const p = count / value.length;
    result -= p * Math.log2(p);
  }
  return result;
}
/** @param {Buffer} ciphertext @param {Buffer} key */
function decrypt(ciphertext, key) {
  const op = crypto.createDecipheriv("aes-128-ecb", key, null);
  op.setAutoPadding(false);
  return Buffer.concat([op.update(ciphertext), op.final()]);
}
/** @param {Buffer} plaintext @param {Buffer} key */
function encrypt(plaintext, key) {
  const op = crypto.createCipheriv("aes-128-ecb", key, null);
  op.setAutoPadding(false);
  return Buffer.concat([op.update(plaintext), op.final()]);
}

const p15Spiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const witness = source("resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt");
const letters = witness.toUpperCase().replace(/[^A-Z]/g, "");
assert.equal(letters.length, 43516);
const proposedLabel = p15Spiral.map(index => letters[index - 1]).join("").toLowerCase();
assert.equal(proposedLabel, "vnteacldthtirony");
const proposedKey = Buffer.from(proposedLabel, "ascii");
assert.equal(proposedKey.length, 16);

const tableSource = JSON.parse(source("resources/liber-primus/base60-grid.json"));
const verifiedSource = JSON.parse(source("resources/liber-primus/lp2-grid-256.json"));
const original = Buffer.from(tableSource.byte_rows.flat());
assert.equal(original.length, 256);
assert.deepEqual([...original], verifiedSource.pages.flatMap(page => page.bytes));
assert.equal(sha(original), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// The source's ASCII 16-letter candidate is the only experimental key.
// The published first-onion label is a contextual comparison, not a key search.
const baselines = [proposedLabel, "auqgnxjtvdbll3pv"];
const expected = [
  {
    sha: "33807973e4a2f2e20e788effa12c8522d7de039114ffda86b5040b128a9b92b8",
    printable: 99
  },
  {
    sha: "b750d95fe23406004f5feca3cbdd5541e923005f57a33c5610cdb0a3bf0022a0",
    printable: 98
  }
];

for (let k = 0; k < baselines.length; k++) {
  const key = Buffer.from(baselines[k], "ascii");
  const output = decrypt(original, key);
  assert.equal(output.length, 256);
  assert.deepEqual(encrypt(output, key), original);
  assert.equal(sha(output), expected[k].sha);
  const printable = output.filter(value => value >= 32 && value <= 126).length;
  assert.equal(printable, expected[k].printable);
  console.log(JSON.stringify({
    key: baselines[k],
    input_sha256: sha(original),
    output_sha256: sha(output),
    ascii_printable_bytes: printable,
    total_bytes: output.length,
    shannon_entropy_bits_per_byte: entropy(output),
    first32_hex: output.subarray(0, 32).toString("hex")
  }));
}

// True positive plant validates this exact no-padding ECB implementation.
const planted = Buffer.from("SOURCE SELECTED KEY AND SOURCE OPERATOR MUST PREDICT CONTENT ", "ascii");
const padded = Buffer.alloc(256, 0);
planted.copy(padded);
assert.deepEqual(decrypt(encrypt(padded, proposedKey), proposedKey), padded);
console.log("PASS: exact 256-byte original ciphertext and planted AES-128-ECB controls; no recovered LP2 plaintext.");
