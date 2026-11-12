"use strict";

/**
 * Director #569: exact printed-order SHA-256/SHA-512 hash-chain gate
 * on the conditional LP2 32x8 base60-byte table.
 *
 * Source fixed to original physical pp49-51 order (80/104/72 cells),
 * with no shifts, IVs, guessed salts, candidate offsets or key fits.
 * The source-specific statement is conditional on this numeral codec.
 *
 * SFT: node sims/lp2_p50_sha256_sha512_block_chain_sft.cjs
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} algorithm @param {Buffer} payload @returns {Buffer} */
function hash(algorithm, payload) {
  return createHash(algorithm).update(payload).digest();
}

const root = path.resolve(__dirname, "..");
const src = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
assert.deepEqual(src.original_scans, ["66.jpg", "67.jpg", "68.jpg"]);
assert.deepEqual(src.page_row_counts, [10, 13, 9]);
assert.deepEqual(src.byte_rows.map((row) => row.length), Array(32).fill(8));

const alphabet = src.alphabet;
assert.equal(alphabet.length, 60);
const bytes = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    const token = src.rows[row][col];
    assert.equal(token.length, 2);
    const value = alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
    assert.ok(value >= 0 && value <= 255);
    assert.equal(value, src.byte_rows[row][col]);
    bytes.push(value);
  }
}
assert.equal(bytes.length, 256);
const source = Buffer.from(bytes);
assert.equal(hash("sha256", source).toString("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// FIPS published ABC vectors verify both algorithms.
assert.equal(hash("sha256", Buffer.from("abc")).toString("hex"),
  "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
assert.equal(hash("sha512", Buffer.from("abc")).toString("hex"),
  "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
  "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f");

/**
 * One complete exact hash chain test on fixed, consecutive, complete
 * equal-width blocks. No partial equality or approximate score.
 * @param {Buffer} data
 * @param {"sha256" | "sha512"} algorithm
 * @param {number} width
 * @returns {{blocks:number, links:number, exactLinks:number, steps:Array<{sourceBlock:number,nextBlock:number,match:boolean,firstMismatchedByte:number}>}}
 */
function chain(data, algorithm, width) {
  assert.equal(data.length % width, 0);
  const blocks = data.length / width;
  const steps = [];
  for (let i = 0; i < blocks - 1; i++) {
    const prior = data.subarray(i * width, (i + 1) * width);
    const following = data.subarray((i + 1) * width, (i + 2) * width);
    const output = hash(algorithm, prior);
    assert.equal(output.length, width);
    const mismatch = output.findIndex((x, j) => x !== following[j]);
    steps.push({
      sourceBlock: i, nextBlock: i + 1,
      match: mismatch === -1,
      firstMismatchedByte: mismatch
    });
  }
  return {
    blocks, links: steps.length,
    exactLinks: steps.filter((s) => s.match).length,
    steps
  };
}

/**
 * A true three-block SHA chain tests the same exact comparison.
 * The seed and all outputs are distinct reproducible bytes.
 * @param {"sha256"|"sha512"} algorithm
 * @param {number} width
 */
function planted(algorithm, width) {
  const first = Buffer.from(Array.from({length: width}, (_, i) => (7 * i + 19) & 255));
  const second = hash(algorithm, first);
  const third = hash(algorithm, second);
  const encoded = Buffer.concat([first, second, third]);
  const r = chain(encoded, algorithm, width);
  assert.equal(r.exactLinks, 2);
  assert.equal(r.links, 2);
  return r;
}
const original256 = chain(source, "sha256", 32);
const original512 = chain(source, "sha512", 64);
const reverse = Buffer.from(source).reverse();
const wrongOrder256 = chain(reverse, "sha256", 32);
const wrongOrder512 = chain(reverse, "sha512", 64);

assert.deepEqual([original256.links, original512.links], [7, 3]);
assert.equal(original256.exactLinks, 0);
assert.equal(original512.exactLinks, 0);
assert.equal(wrongOrder256.exactLinks, 0);
assert.equal(wrongOrder512.exactLinks, 0);
assert.ok(original256.steps.every((s) => s.firstMismatchedByte === 0));
assert.ok(original512.steps.every((s) => s.firstMismatchedByte === 0));

const positive = {
  sha256: planted("sha256", 32),
  sha512: planted("sha512", 64)
};
console.log(JSON.stringify({
  source: "Original LP2 66.jpg–68.jpg, 32 rows x 8 columns, row-major, conditional base60",
  originalByteCount: source.length,
  originalBytesSha256: hash("sha256", source).toString("hex"),
  original256, original512,
  wrongOrder256, wrongOrder512, positive,
  conclusion: "No exact SHA-256 or SHA-512 consecutive-block chain under original byte serialization; no recovered key or LP2 plaintext."
}, null, 2));
