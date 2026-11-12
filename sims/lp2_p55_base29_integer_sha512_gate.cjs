"use strict";
/**
 * Original p55 signed-BASE29 integer serialization gate.
 * Run: node sims/lp2_p55_base29_integer_sha512_gate.cjs
 * Native CommonJS SFT; reads the canonical, unaltered physical-page source.
 * Tests four source-fixed registers without secret keys, resets or bit tuning.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const full = corpus.pages.find(p => p.page === 55).indices;
assert.equal(alphabet.length, 29);
assert.equal(full.length, 76);
assert(full.every(x => Number.isInteger(x) && x >= 0 && x < 29));
const sourceDigits = full.map(i => alphabet[i]).join("");
assert.equal(sourceDigits, "LPJA7FHEJFC6N2P0ROH5174HS0EAJ15D8LKCJFNRD0H8C5CISIA6E6FIFC22IF2M5SAJ5ENB1HIA");
const interiorOffsets = [
  2, 3, 10, 11, 12, 13, 16, 17, 18, 19, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 37, 38, 39, 40, 43, 44, 49, 50, 51, 52, 53,
  56, 57, 58, 59, 60, 65, 66, 67, 68, 71, 74
];
assert.equal(new Set(interiorOffsets).size, 43);
const chosen = new Set(interiorOffsets);
const variants = {
  page76: full,
  completeBody75: full.slice(1),
  interior43: interiorOffsets.map(i => full[i]),
  exterior33: full.filter((_, i) => !chosen.has(i))
};
/** @param {number[]} digits */
function toInteger(digits) {
  return digits.reduce((n, d) => n * 29n + BigInt(d), 0n);
}
/** @param {bigint} n @param {number} length */
function toDigits(n, length) {
  const out = new Array(length);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return out;
}
/** @param {bigint} value */
function toMinimalBytes(value) {
  const hex = value.toString(16);
  return Buffer.from(hex.length % 2 ? `0${hex}` : hex, "hex");
}
assert.equal(toInteger([3, 26, 24]), 3301n); // historical 3301 -> 3QO
assert.equal(toDigits(3301n, 3).map(d => alphabet[d]).join(""), "3QO");
const magic = {
  gzip: "1f8b08", zip: "504b0304", png: "89504e47", pdf: "255044462d",
  bzip2: "425a68", xz: "fd377a585a00", sevenZip: "377abcaf271c",
  jpeg: "ffd8ff", pgpArmor: "2d2d2d2d2d424547494e"
};
const planted = zlib.gzipSync(Buffer.from("A"));
const plantedInt = BigInt(`0x${planted.toString("hex")}`);
const plantedDigits = toDigits(plantedInt, 43);
assert.equal(toInteger(plantedDigits), plantedInt);
assert.equal(zlib.gunzipSync(toMinimalBytes(toInteger(plantedDigits))).toString(), "A");
const rows = [];
for (const [name, digits] of Object.entries(variants)) {
  const n = toInteger(digits);
  const bytes = toMinimalBytes(n);
  const digest = crypto.createHash("sha512").update(bytes).digest("hex");
  assert.deepEqual(toDigits(n, digits.length), digits);
  assert.equal(digest.length, 128);
  const hex = bytes.toString("hex");
  rows.push({
    name, runes: digits.length, bytes: bytes.length,
    first16: hex.slice(0, 32), fullHex: hex,
    sha512: digest, matchesPrintedP56Digest: digest === target,
    signatures: Object.keys(magic).filter(key => hex.startsWith(magic[key]))
  });
}
assert.deepEqual(rows.map(r => r.bytes), [47, 46, 27, 20]);
assert(rows.every(r => !r.matchesPrintedP56Digest && r.signatures.length === 0));
assert.equal(rows[0].first16, "01bddc70abe922301b15ddc26fe5f0d5");
assert.equal(rows[1].first16, "1208186d45908c0295580334de97f691");
assert.equal(rows[2].first16, "013d669f55a697d6b56275a7974c8245");
assert.equal(rows[3].first16, "efe89bff1c7eff588ec80605c99a3640");
// Exact word-circumference integrity model: 33 exterior BASE29 digits
// naturally hold a 160-bit SHA-1 of the 43 interior digits' 27-byte number.
// The source supplies the 33/43 split and the BASE29 radix; there is no
// independent manuscript command asserting SHA-1 or a checksum.
const interiorBytes = Buffer.from(rows[2].fullHex, "hex");
const exteriorBytes = Buffer.from(rows[3].fullHex, "hex");
assert.equal(interiorBytes.length, 27);
assert.equal(exteriorBytes.length, 20);
assert.equal(crypto.createHash("sha1").update("abc").digest("hex"),
  "a9993e364706816aba3e25717850c26c9cd0d89d");
const digestOfInterior = crypto.createHash("sha1").update(interiorBytes).digest();
assert.equal(digestOfInterior.toString("hex"),
  "eddad4828e992391bb68e4e22a7673071f033420");
assert.notDeepEqual(digestOfInterior, exteriorBytes);
// A positive 33-GP-digit outer carrier exactly stores the derived 160-bit digest.
const plantedChecksumOuter = toDigits(
  BigInt(`0x${digestOfInterior.toString("hex")}`), 33);
assert.deepEqual(toMinimalBytes(toInteger(plantedChecksumOuter)), digestOfInterior);
const circumferenceChecksum = {
  innerDigits: 43, innerBytes: 27, outerDigits: 33, outerBytes: 20,
  actualOuterHex: exteriorBytes.toString("hex"),
  computedInnerSha1Hex: digestOfInterior.toString("hex"),
  directSha1Matches: digestOfInterior.equals(exteriorBytes),
  syntheticOriginalSizedCarrierRoundTrips: true
};
console.log(JSON.stringify({historicalBase29Test: "3301 -> 3QO", plantedGzipRecovered: true, variants: rows, circumferenceChecksum,
  conclusion: "No direct p55 BASE29 integer is the p56 SHA-512 preimage or a magic-prefixed file, and the 33 exterior digits do not directly encode SHA-1 of the 43 interior digits; no plaintext claimed."}, null, 2));
