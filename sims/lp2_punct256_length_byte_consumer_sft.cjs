"use strict";
/**
 * Original 256 punctuation/page intervals versus the original 256 numeral cells.
 * One reproducible, bounded byte-consumer test. Node.js 22, CommonJS.
 *
 * Run as a single-file test from any working directory. No file writes.
 * Counts original visible punctuation and reinstates the runeless p50 turn.
 * Reports only the exact zero-parameter constructions below, not a cipher key.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sourcePages = text.split("%");
assert.equal(sourcePages.length, 57);
const source = [...sourcePages.slice(0, 50), "", ...sourcePages.slice(50, 55)].join("%");
/** @param {string} s @returns {number[]} */
const ids = s => [...s].flatMap(ch => runeIndex.has(ch) ? [runeIndex.get(ch)] : []);
const groups = source.split(/[.&$%]/u).map(ids);
assert.deepEqual(source.split("").filter(x => ".&$%".includes(x))
  .reduce((o, k) => (o[k] = (o[k] || 0) + 1, o), {}), {".": 175, "&": 17, "$": 8, "%": 55});
assert.equal(groups.length, 256);
assert.deepEqual(groups.flat(), corpus.pages.slice(0, 56).flatMap(p => p.indices));
const lengths = Buffer.from(groups.map(x => x.length));
const table = Buffer.from(grid.byte_rows.flat());
assert.equal(table.length, 256);
assert.equal(lengths.length, 256);
assert.equal(Math.max(...lengths), 240);
assert.equal(lengths.filter(x => x === 0).length, 37);
/** @param {Buffer} bytes @returns {string} */
const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
/** @param {Buffer} bytes @returns {string} */
const sha512 = bytes => crypto.createHash("sha512").update(bytes).digest("hex");
assert.equal(sha256(Buffer.from("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
assert.equal(sha256(lengths), "2039651b953a2f9c6337ff1c389d389c6c2f48b36e979a688a38fa1544220d85");
assert.equal(sha256(table), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  return Buffer.from(a.map((v, i) => v ^ b[i]));
}
const combined = xor(lengths, table);
assert.deepEqual(xor(combined, lengths), table);
assert.equal(sha256(combined), "288d3a4a585439bb9e3ae2af8fad5a8b844bfa5bf26539fb471c7da0dd84d93c");
assert.equal([...combined].filter(x => x >= 32 && x <= 126).length, 91);
const hash32 = Buffer.from(sha256(lengths), "hex");
const hash64 = Buffer.from(sha512(lengths), "hex");
const hash32Matches = Array.from({length: 8}, (_, i) => hash32.equals(table.subarray(i * 32, i * 32 + 32)));
const hash64Matches = Array.from({length: 4}, (_, i) => hash64.equals(table.subarray(i * 64, i * 64 + 64)));
assert.deepEqual(hash32Matches, Array(8).fill(false));
assert.deepEqual(hash64Matches, Array(4).fill(false));
/** @param {number[]} row @returns {number} */
const sumIndex = row => row.reduce((a, x) => a + x, 0) & 255;
/** @param {number[]} row @returns {number} */
const sumPrime = row => row.reduce((a, x) => a + corpus.prime[x], 0) & 255;
/** @param {number[]} row @returns {number} */
const xorIndex = row => row.reduce((a, x) => a ^ x, 0);
/** @param {number[]} row @returns {number} */
const xorPrime = row => row.reduce((a, x) => a ^ corpus.prime[x], 0);
const functions = {runeLength: row => row.length, sumIndex, sumPrime, xorIndex, xorPrime};
const directChecksumMatches = {};
for (const [name, fn] of Object.entries(functions)) {
  directChecksumMatches[name] = groups.flatMap((row, i) => fn(row) === table[i] ? [i] : []);
}
assert.deepEqual(Object.fromEntries(Object.entries(directChecksumMatches).map(([k, v]) => [k, v.length])),
  {runeLength: 1, sumIndex: 1, sumPrime: 0, xorIndex: 0, xorPrime: 2});
const zeroSlotBytes = Buffer.from(groups.flatMap((row, i) => row.length === 0 ? [table[i]] : []));
assert.equal(zeroSlotBytes.length, 37);
const zeroSlotPrintable = [...zeroSlotBytes].filter(x => x >= 32 && x <= 126).length;
assert.equal(zeroSlotPrintable, 18);
// All outputs derive from unchanged original source; no fitted parameters.
console.log(JSON.stringify({
  source: "unknown LP2 physical pp0-55; 256 intervals and 256 printed base60 bytes",
  delimiters: {periods:175, ampersands:17, dollars:8, pageTurns:55},
  runeTotal: groups.flat().length,
  maxRuneLength: Math.max(...lengths), emptyIntervals: 37,
  lengthByteSha256: sha256(lengths), tableSha256: sha256(table),
  xorSha256: sha256(combined), xorFirst16: combined.subarray(0,16).toString("hex"),
  xorPrintableAscii: 91,
  sha256LengthEqualsAnyAlignedTableBlock: hash32Matches.some(Boolean),
  sha512LengthEqualsAnyAlignedTableBlock: hash64Matches.some(Boolean),
  directChecksumMatches,
  emptySlotTableBytesHex: zeroSlotBytes.toString("hex"), emptySlotPrintableAscii: zeroSlotPrintable,
  conclusion: "No zero-parameter ASCII XOR plaintext, matching aligned digest, or direct interval checksum is recovered."
}, null, 2));
