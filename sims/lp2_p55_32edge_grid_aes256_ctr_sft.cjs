"use strict";
/**
 * Original LP2 p55 16-word key/IV against the printed 32x8 byte table.
 *
 * Hypothesis (not author-authenticated):
 * - 16 complete p55 word lengths are a 16-byte AES-256-CTR IV.
 * - Their 32 endpoint GP runes each choose one column in the respective
 *   row of the printed 32x8 number table, producing a 32-byte key.
 * - The 43 inner GP indices are one big-endian BASE29 integer in 27 bytes.
 * - Both source-native rune-number readings, index and prime mod 8, are frozen.
 *
 * No source suggests an IV/key/CTR algorithm explicitly. The structural
 * domain obstruction and raw byte decryption are tested on original source.
 * Node.js 22, CommonJS; read only. Run from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} filename @returns {any} */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
}
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json");
const page = corpus.pages.find((p) => p.page === 55).indices;
const solved = corpus.pages.find((p) => p.page === 57).indices;
const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(page.length, 76);
assert.equal(solved.length, 95);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8 &&
  row.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)));
assert.equal(wordLengths.length, 16);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 75);

// The first p55 rune completes the final printed word of physical p54.
// Its source-correct 16 complete p55 words contain 32 endpoints and 43 cores.
const endpoints = [];
const interior = [];
let cursor = 1;
for (const length of wordLengths) {
  const word = page.slice(cursor, cursor + length);
  assert.equal(word.length, length);
  endpoints.push(word[0], word.at(-1));
  interior.push(...word.slice(1, -1));
  cursor += length;
}
assert.equal(cursor, 76);
assert.equal(endpoints.length, 32);
assert.equal(interior.length, 43);
assert.deepEqual(interior.slice(0, 10), [19,10,12,6,23,2,27,24,17,5]);
assert.deepEqual(endpoints.slice(0, 10), [25,7,15,17,14,19,15,25,0,1]);

const CAPACITY = 29n ** 43n;
/** @param {number[]} digits @returns {bigint} */
function numberOf(digits) {
  return digits.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}
/** @param {bigint} n @returns {Buffer} */
function bytes27(n) {
  assert(n >= 0n && n < CAPACITY);
  return Buffer.from(n.toString(16).padStart(54, "0"), "hex");
}
/** @param {Buffer} bytes @returns {bigint} */
function integerOf(bytes) {
  assert.equal(bytes.length, 27);
  return BigInt(`0x${bytes.toString("hex")}`);
}
/** @param {Buffer} key @param {Buffer} iv @param {Buffer} data @returns {Buffer} */
function aesCtr(key, iv, data) {
  const operation = crypto.createCipheriv("aes-256-ctr", key, iv);
  return Buffer.concat([operation.update(data), operation.final()]);
}

const originalCipher = bytes27(numberOf(interior));
const iv = Buffer.from(wordLengths);
assert.equal(originalCipher.toString("hex"),
  "013d669f55a697d6b56275a7974c8245639c8c8e09d48f70e92368");
assert.equal(iv.toString("hex"), "0402020606020d060402070702060303");

// A 43-digit GP29 integer has at most 209 bits. Padded to 27 bytes,
// its leading byte is always either 0x00 or 0x01.
assert(CAPACITY > 1n << 208n);
assert(CAPACITY < 1n << 209n);
const columns = {
  runeIndex: endpoints.map((value) => value % 8),
  GPPrime: endpoints.map((value) => corpus.prime[value] % 8)
};
const pinnedKeys = {
  runeIndex: "e7d457c6854950767a4f41ec960ef72ab32ef60e6912a6219f7f9633afea8dac",
  GPPrime: "edde8942054cabc419b1c131e53fb8568d2ed2701275afc07344969734793850"
};
const pinnedOriginalInverse = {
  runeIndex: "5a34a58d96e349fe5b1b4393a1dcf4408ffd56b7eb2e66a993496c",
  GPPrime: "6658abf5073bdafc1ce6cd2ca5d3ce96020cb766743937a8dd5850"
};
const pinnedFirstKeystreamByte = {runeIndex: 0x5b, GPPrime: 0x67};
const plant = bytes27(numberOf(solved.slice(0, 43)));
assert.equal(plant.toString("hex"),
  "00e2ccf3e5d18d007174f10c15adc5b1456bf7128947d0205bf6bb");

const reports = {};
for (const [name, selects] of Object.entries(columns)) {
  assert.equal(selects.length, 32);
  const key = Buffer.from(selects.map((col, row) => grid.byte_rows[row][col]));
  assert.equal(key.length, 32);
  assert.equal(key.toString("hex"), pinnedKeys[name]);
  const mask = aesCtr(key, iv, Buffer.alloc(27));
  assert.equal(mask[0], pinnedFirstKeystreamByte[name]);
  assert(![0,1].includes(mask[0]) && ![0,1].includes(mask[0] ^ 1));

  const inverse = aesCtr(key, iv, originalCipher);
  assert.equal(inverse.toString("hex"), pinnedOriginalInverse[name]);
  assert(aesCtr(key, iv, inverse).equals(originalCipher));
  assert(integerOf(inverse) >= CAPACITY);
  assert(inverse.some((v) => v < 32 || v > 126));

  const plantedCipher = aesCtr(key, iv, plant);
  assert(aesCtr(key, iv, plantedCipher).equals(plant));
  assert(integerOf(plantedCipher) >= CAPACITY);
  reports[name] = {
    keyHex: key.toString("hex"),
    ctrFirstByte: mask[0],
    originalCipherHex: originalCipher.toString("hex"),
    decrypted27BytesHex: inverse.toString("hex"),
    decryptedAs43GPdigits: integerOf(inverse) < CAPACITY,
    all27BytesPrintableASCII: inverse.every((v) => v >= 32 && v <= 126),
    sourceNative43GPPlantRecoversAll43: aesCtr(key, iv, plantedCipher).equals(plant),
    sourceNative43GPPlantCipherFits43Digits: integerOf(plantedCipher) < CAPACITY,
    impossibleGP29ToGP29ForEvery43DigitInput:
      ![0,1].includes(mask[0]) && ![0,1].includes(mask[0] ^ 1)
  };
}
assert(Object.values(reports).every((r) =>
  !r.decryptedAs43GPdigits && !r.all27BytesPrintableASCII &&
  r.sourceNative43GPPlantRecoversAll43 &&
  !r.sourceNative43GPPlantCipherFits43Digits &&
  r.impossibleGP29ToGP29ForEvery43DigitInput));
console.log(JSON.stringify({
  source: "Original 32x8 table; physical p55 16 complete word lengths, 32 endpoint runes, 43 interior runes",
  originalSourceDigits: 43,
  sourceSelectedIV: iv.toString("hex"),
  originalCipherBytes: originalCipher.length,
  originalByteEncodingBound: CAPACITY.toString(),
  readingFamilies: reports,
  decision: "Both fixed index/prime row-selective AES-256-CTR inverses are nonlinguistic and exceed the GP29 43-digit range. Stronger: neither can map ANY 43-digit GP29 plaintext to a valid 43-digit GP29 ciphertext with this bytewise AES-CTR IV/key, because of their leading keystream bytes. No original plaintext or authentic cipher found."
}, null, 2));
