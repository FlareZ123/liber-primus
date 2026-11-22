"use strict";

/**
 * Source-native, direct OpenPGP literal-packet gate for LP2's 256-cell table.
 * Run on Windows 11 with Node.js 22: node sims/lp2_p50_openpgp_direct_packet_sft.cjs
 * RFC 4880 sections 4.2.2.4 and 5.9 describe the tested 2014-era format.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json");
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
assert.equal(data.rows.length, 32);
assert(data.rows.every((row) => row.length === 8));
const bytes = data.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  assert([...token].every((ch) => data.alphabet.includes(ch)));
  return 60 * data.alphabet.indexOf(token[0]) + data.alphabet.indexOf(token[1]);
});
assert.equal(bytes.length, 256);
assert.deepEqual(bytes, data.byte_rows.flat());
assert(bytes.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));

/**
 * @param {number[]} octets A complete packet prefix.
 * @returns {{ok:boolean, reason:string, tag:number|null, partialBytes:number|null}}
 */
function literalGate(octets) {
  if (octets.length < 3) return {ok:false, reason:"short header", tag:null, partialBytes:null};
  const tag = (octets[0] & 0xc0) === 0xc0 ? (octets[0] & 0x3f) : null;
  if (tag !== 11) return {ok:false, reason:"not new-format literal packet", tag, partialBytes:null};
  const lenByte = octets[1];
  if (lenByte >= 224 && lenByte < 255) {
    const partialBytes = 2 ** (lenByte & 31);
    if (partialBytes < 512) {
      return {ok:false, reason:"first partial length under 512 bytes", tag, partialBytes};
    }
  } else if (lenByte >= 192) {
    return {ok:false, reason:"only one-octet or partial header covered by this SFT", tag, partialBytes:null};
  }
  const format = octets[2];
  if (![0x62,0x74,0x75,0x6c].includes(format)) {
    return {ok:false, reason:"invalid literal format octet", tag, partialBytes:null};
  }
  return {ok:true, reason:"header passes direct gate", tag, partialBytes:null};
}

const positive = [0xcb,0x07,0x62,0,0,0,0,0,0];
assert.equal(literalGate(positive).ok, true, "known-good binary literal-data plant");
const first = bytes.slice(0, 3);
assert.deepEqual(first, [203,231,167], "source tokens 3N 3p 2l");
const result = literalGate(bytes);
assert.equal(result.ok, false);
assert.equal(result.tag, 11);
assert.equal(result.partialBytes, 128);
assert.equal(result.reason, "first partial length under 512 bytes");
assert.equal([0x62,0x74,0x75,0x6c].includes(bytes[2]), false, "independent bad content-format byte");
console.log(JSON.stringify({
  source: "original LP2 p49-51 table tokens, source order, base60 reading",
  sourceBytes: bytes.length,
  firstThreeTokens: data.rows[0].slice(0,3),
  firstThreeBytes: first,
  packetTag: result.tag,
  partialBytes: result.partialBytes,
  rfc4880MinimumFirstPartialBytes: 512,
  firstLiteralFormatByte: bytes[2],
  firstLiteralFormatAllowed: false,
  positivePlantPassed: true,
  directOpenPGPLiteralPacket: "REJECTED"
}, null, 2));
