"use strict";

/**
 * Source-led original receiver: the p15 4x4 Fibonacci-prime spiral selects
 * exactly sixteen original 2013 Instar audio bytes as one AES-128 key.
 * The 256 as-printed p50 panel bytes form sixteen full AES blocks.
 * No cipher key, phase, salt, IV, or source offset is learned from plaintext.
 *
 * This is a conditional hypothesis; it is not a creator-authenticated opcode.
 * Run: node sims/lp2_p15_audio761_spiral_aes128_p50_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash, createCipheriv, createDecipheriv } = require("node:crypto");

const SOURCE_URL =
  "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3";
const AUDIO_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const GRID_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
const SPIRAL = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * @param {Buffer} input
 * @param {Buffer} key
 * @param {boolean} encrypt
 * @returns {Buffer}
 */
function aes128(input, key, encrypt) {
  const cipher = encrypt
    ? createCipheriv("aes-128-ecb", key, null)
    : createDecipheriv("aes-128-ecb", key, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}

/** @param {Buffer} bytes @returns {number} */
function printableFraction(bytes) {
  return bytes.reduce((n, x) => n + Number(
    (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13
  ), 0) / bytes.length;
}

/** @param {Buffer} bytes @returns {number} */
function longestPrintable(bytes) {
  let longest = 0;
  let current = 0;
  for (const x of bytes) {
    if ((x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

/** @returns {Promise<void>} */
async function main() {
  const data = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json"),
    "utf8"
  ));
  assert.deepEqual(data.page_row_counts, [10, 13, 9]);
  assert.equal(data.rows.length, 32);
  assert(data.rows.every((row) => row.length === 8));
  assert.equal(data.byte_rows.length, 32);
  const grid = Buffer.from(data.byte_rows.flat());
  assert.equal(grid.length, 256);
  assert.equal(sha256(grid), GRID_SHA256);

  const response = await fetch(SOURCE_URL);
  assert.equal(response.status, 200, "pinned 2013 audio fetch");
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length, 4010732);
  assert.equal(sha256(audio), AUDIO_SHA256);

  assert.equal(SPIRAL.length, 16);
  assert.equal(new Set(SPIRAL).size, 16);
  assert(SPIRAL.every((offset) => offset >= 0 && offset < audio.length));
  const key = Buffer.from(SPIRAL.map((offset) => audio[offset]));
  assert.equal(key.length, 16);

  const plain = aes128(grid, key, false);
  assert.deepEqual(aes128(plain, key, true), grid);

  // Real readable source-positive: any 256-byte text can be encrypted and
  // recovered exactly with the same AES-128 codec and original key bytes.
  const clearText = Buffer.from(
    ("LIKE THE INSTAR TUNNELING TO THE SURFACE. WE MUST SHED OUR " +
     "OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE. ").repeat(3)
      .slice(0, 256), "ascii"
  );
  assert.equal(clearText.length, 256);
  assert.deepEqual(aes128(aes128(clearText, key, true), key, false), clearText);

  console.log(JSON.stringify({
    kind: "p15-spiral 2013-audio-byte-indexed AES-128-ECB original p50",
    keyOffsetsZeroBased: SPIRAL,
    audioLength: audio.length,
    audioSha256: sha256(audio),
    keyHex: key.toString("hex"),
    gridSha256: sha256(grid),
    decodedSha256: sha256(plain),
    decodedFirst64Hex: plain.subarray(0, 64).toString("hex"),
    decodedFirst128Latin1: plain.subarray(0, 128).toString("latin1"),
    printableFraction: printableFraction(plain),
    longestPrintableRun: longestPrintable(plain),
    firstBytes: [...plain.subarray(0, 12)],
    originalGridPrintableFraction: printableFraction(grid),
    originalGridLongestPrintableRun: longestPrintable(grid),
    originalReplay: "256/256 PASS",
    knownTextPositive: "256/256 PASS"
  }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
