"use strict";
/**
 * Frozen 2016 signed RSA-signature to original 256-number LP2 grid test.
 * Reproduce with: node sims/signed2016_signature_half_grid_inverse_sft.cjs
 *
 * The p32 11x11 rune-prime layout selects the 1136-byte verified signed
 * 2016 source through its central five-by-five perimeter. The original
 * signature is a 512-octet MPI, exactly two 256-octet grid lengths.
 * Test only first, last, XORed halves as keys on the original 256 tokens
 * interpreted by existing radix60 and competing f-skip radix59 codecs.
 * Original cipher key and original LP2 plaintext remain unknown.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const asc = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const armored = asc.slice(asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const rows = armored.split(/\r?\n/u);
const versionLine = rows.findIndex(line => line.startsWith("Version:"));
assert(versionLine >= 0);
const encoded = rows.slice(versionLine + 2)
  .filter(line => /^[A-Za-z0-9+/]+={0,2}$/u.test(line) && line.length > 12)
  .join("");
const packet = Buffer.from(encoded, "base64");
assert.equal(asc.length, 1136);
assert.equal(packet.length, 543);
assert.equal(packet.readUInt16BE(1), 540);
const signature = packet.subarray(-512);
assert.equal(signature.length, 512);
assert.equal(signature.subarray(0, 8).toString("hex"), "20d723ff65aafbbf");
const sources = [
  ["first256", signature.subarray(0, 256)],
  ["last256", signature.subarray(256)],
  ["xor-halves", Buffer.from(Array.from({length: 256},
    (_, i) => signature[i] ^ signature[256 + i]))]
];
const radix59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
/** @param {string} token @returns {number} */
function read59(token) {
  const first = radix59.indexOf(token[0]);
  const second = radix59.indexOf(token[1]);
  assert(first >= 0 && second >= 0);
  return first * 59 + second;
}
const readings = [
  ["base60", grid.bytes],
  ["base59-f-skip", grid.pages.flatMap(page => page.tokens.map(read59))]
];
assert.equal(readings[0][1].length, 256);
assert.equal(readings[1][1].length, 256);
/** @param {number} byte @returns {boolean} */
const printable = byte => byte === 10 || byte === 13 ||
  (byte >= 32 && byte <= 126);
/** @param {number[]} input */
function summarize(input) {
  let count = 0;
  let run = 0;
  let longest = 0;
  for (const byte of input) {
    if (printable(byte)) {
      count++;
      longest = Math.max(longest, ++run);
    } else {
      run = 0;
    }
  }
  return {
    printable: count,
    longestPrintableRun: longest,
    prefix: input.slice(0, 40).map(byte =>
      byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".").join(""),
    probableFileHeader: ["-----BEGIN", "PK", "%PDF", (String.fromCharCode(137) + "PNG"), "GIF8", "BZh"]
      .some(mark => input.slice(0, mark.length)
        .every((byte, i) => byte === mark.charCodeAt(i)))
  };
}
/** @param {number[]} ciphertext @param {ArrayLike<number>} key @param {string} op @returns {number[]} */
function decode(ciphertext, key, op) {
  return ciphertext.map((byte, i) =>
    op === "xor" ? byte ^ key[i] :
      op === "sub" ? (byte - key[i] + 256) % 256 :
        (byte + key[i]) % 256);
}
const cases = [];
for (const [radix, table] of readings) {
  for (const [keySource, key] of sources) {
    for (const op of ["xor", "sub", "add"]) {
      cases.push({
        radix, keySource, operation: op,
        ...summarize(decode(table, key, op))
      });
    }
  }
}
assert.equal(cases.length, 18);
assert.equal(Math.max(...cases.map(x => x.printable)), 108);
assert(cases.every(x => !x.probableFileHeader));
const example = Buffer.from("THE KEY IS FROM THE SIGNED MESSAGE", "ascii");
const encrypted = Array.from(example, (v, i) => v ^ sources[0][1][i]);
assert.deepEqual(Buffer.from(decode(encrypted, sources[0][1], "xor")), example);
console.log(JSON.stringify({
  classification: "bounded negative, not a decipherment",
  exactInput: {source: "2016 authenticated 1136-byte signed payload",
    signatureOctets: 512, gridOctets: 256,
    radix60AndFSkipRadix59: true},
  positiveControl: "source-half XOR exactly recovers planted ASCII",
  results: cases,
  summary: {variants: 18, mostPrintable: 108,
    anyFileHeader: false, recoveredOriginalPlaintext: false}
}, null, 2));
