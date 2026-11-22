"use strict";
/**
 * Director #657: one frozen, source-selected 3,000-rune p40–53 inverse.
 * Node.js 22, CommonJS, original source JSON only, no network/writes.
 * NOTE: historical Stage04's exact decrypt sign is additive;
 * the issue's fixed subtractive sign is a new, testable convention.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const read = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json").bytes;
const mod = (x) => (x % 29 + 29) % 29;
const originalChapter = corpus.pages.slice(40, 54).flatMap((p) => p.indices);
assert.equal(originalChapter.length, 3008);
const heading = originalChapter.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const order = heading.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v).map((x) => x.i);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);
assert.equal(grid.length, 256);
assert.equal(corpus.pages[50].indices.length, 0);
const original = originalChapter.slice(8);
assert.equal(original.length, 3000);

const length = 375;
const shift = (row, col) => grid[(row % 32) * 8 + col] % 29;
/** @param {number[]} ciphertext @returns {number[]} */
function decrypt(ciphertext) {
  assert.equal(ciphertext.length, 3000);
  const columns = Array(8);
  for (let block = 0; block < 8; block++) {
    const column = order[block];
    columns[column] = ciphertext.slice(block * length, (block + 1) * length);
  }
  return Array.from({ length: 3000 }, (_, i) => {
    const row = Math.floor(i / 8), col = i % 8;
    return mod(columns[col][row] - shift(row, col));
  });
}
/** @param {number[]} plaintext @returns {number[]} */
function encrypt(plaintext) {
  assert.equal(plaintext.length, 3000);
  const columns = Array.from({ length: 8 }, () => []);
  for (let row = 0; row < length; row++) {
    for (let col = 0; col < 8; col++) {
      columns[col].push(mod(plaintext[row * 8 + col] + shift(row, col)));
    }
  }
  return order.flatMap((column) => columns[column]);
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const hist = Array(29).fill(0);
  for (const v of seq) hist[v]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
/** @param {number[]} seq @returns {string} */
const gp = (seq) => seq.map((v) => corpus.translit[v]).join("");

const plain = decrypt(original);
assert.deepEqual(encrypt(plain), original, "full original ciphertext roundtrip");
assert.equal(ioc(original), 0.03454440369011893);
assert.equal(ioc(plain), 0.034579748805157275);

const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const plant = Array.from({ length: 3000 }, (_, i) => native[i % native.length]);
const plantCipher = encrypt(plant);
assert.deepEqual(decrypt(plantCipher), plant, "native GP exact positive");
assert.deepEqual(encrypt(decrypt(plantCipher)), plantCipher);

// Original p53 last51 source ciphertext runes are the end of sorted column3,
// mapping to spaced row-major plaintext slots; their unedited ciphertext must
// never be omitted from the same full 3000-rune cipher.
const red51 = Array.from({ length: 51 }, (_, j) => {
  const i = 2949 + j;
  return plain[(i % length) * 8 + order[Math.floor(i / length)]];
});
assert.equal(red51.length, 51);
assert.equal(gp(red51).slice(0, 12), "GIAGUYRIANGY");
const digest = crypto.createHash("sha256").update(Buffer.from(plain)).digest("hex");
console.log(JSON.stringify({
  input: "original LP2 pp40–53 post-red8 3000 runes, grid256 32×8, no F skips",
  red8: heading, sortedColumnOrder: order, rowKeyPeriod: 32,
  originalGP29IoC: ioc(original),
  fixedInverseGP29IoC: ioc(plain),
  fixedInverseSHA256OfGPIndexes: digest,
  decodedFirst200: gp(plain).slice(0, 200),
  decodedLast200: gp(plain).slice(-200),
  originalP53Red51MappedOutput: gp(red51),
  fullRunes: gp(plain), original3000CipherExactReencryption: true,
  plantedNative3000GPExactRecovery: true,
}, null, 2));
