"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * OpenPGP Armor CRC-24 from RFC 4880 Section 6.1.
 * @param {number[]} data Complete byte message.
 * @returns {number} Unsigned 24-bit checksum.
 */
function openPgpCrc24(data) {
  let crc = 0xb704ce;
  for (const byte of data) {
    crc ^= byte << 16;
    for (let bit = 0; bit < 8; bit++) {
      crc <<= 1;
      if (crc & 0x1000000) crc ^= 0x1864cfb;
    }
  }
  return crc & 0xffffff;
}

/**
 * Convert a checksum to three bytes using exactly one frozen byte order.
 * @param {number} checksum The 24-bit CRC.
 * @param {boolean} reverse Reverse its three byte positions.
 * @returns {number[]} Three checksum bytes.
 */
function crcBytes(checksum, reverse) {
  const encoded = [(checksum >>> 16) & 255, (checksum >>> 8) & 255, checksum & 255];
  return reverse ? encoded.reverse() : encoded;
}

/**
 * Test one systematic 5-data/3-CRC row layout.
 * @param {number[][]} rows Original 32x8 byte matrix or positive-control clone.
 * @param {boolean} parityFirst True if first 3 bytes are checksum, otherwise last 3.
 * @param {boolean} reverse Reverse CRC byte order.
 * @returns {{matches:number,matchingRows:number[],comparisons:number}}
 */
function audit(rows, parityFirst, reverse) {
  const matchingRows = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const payload = parityFirst ? row.slice(3) : row.slice(0, 5);
    const observed = parityFirst ? row.slice(0, 3) : row.slice(5, 8);
    assert.equal(payload.length, 5);
    assert.equal(observed.length, 3);
    if (observed.every((value, index) =>
      value === crcBytes(openPgpCrc24(payload), reverse)[index])) {
      matchingRows.push(i);
    }
  }
  return {matches: matchingRows.length, matchingRows, comparisons:rows.length};
}

/**
 * Compare a visible 16-character printed row against the four RFC4880
 * radix-64 characters encoding CRC24 of its other 12 ASCII characters.
 * @param {string} printed Exactly sixteen original source characters.
 * @param {boolean} crcFirst Whether the four CRC characters precede data.
 * @returns {boolean} Exact match with the original, unmodified characters.
 */
function armorChecksumMatches(printed, crcFirst) {
  assert.equal(printed.length, 16);
  const data = crcFirst ? printed.slice(4) : printed.slice(0, 12);
  const checksum = crcFirst ? printed.slice(0, 4) : printed.slice(12);
  const value = openPgpCrc24([...Buffer.from(data, "ascii")]);
  const base64 = Buffer.from(crcBytes(value, false)).toString("base64");
  assert.equal(base64.length, 4);
  return base64 === checksum;
}

function main() {
  const original = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
    "resources", "liber-primus", "base60-grid.json"), "utf8"));
  const rows = original.byte_rows;
  assert.equal(rows.length, 32);
  assert(rows.every(row => row.length === 8
    && row.every(value => Number.isInteger(value) && value >= 0 && value < 256)));
  assert.deepEqual(rows[13], [122,63,31,218,14,184,32,115]);
  assert.deepEqual(rows[31], [113,158,172,230,180,36,189,80]);
  assert.equal(rows.flat().reduce((checksum, value) => checksum ^ value, 0), 0x94);
  assert.equal(openPgpCrc24([...Buffer.from("123456789","ascii")]), 0x21cf02,
    "Independent standard OpenPGP CRC-24 check vector");
  assert.equal(openPgpCrc24([]), 0xb704ce);

  // Positive source-data plant: preserve original first five table bytes of
  // every row, build correct OpenPGP checksums into the last three positions.
  const positive = rows.map(row => {
    const first = row.slice(0, 5);
    return first.concat(crcBytes(openPgpCrc24(first), false));
  });
  assert.equal(audit(positive, false, false).matches, 32);
  assert.equal(audit(rows.map(row => {
    const payload = row.slice(0, 5);
    return crcBytes(openPgpCrc24(payload), true).concat(payload);
  }), true, true).matches, 32);
  positive[7][7] ^= 1;
  assert.equal(audit(positive, false, false).matches, 31);

  let observedHits = 0;
  for (const parityFirst of [false, true]) {
    for (const reverse of [false, true]) {
      const result = audit(rows, parityFirst, reverse);
      observedHits += result.matches;
      const sample = parityFirst ? rows[0].slice(3) : rows[0].slice(0, 5);
      const actual = parityFirst ? rows[0].slice(0, 3) : rows[0].slice(5, 8);
      console.log(JSON.stringify({
        payload: parityFirst ? "last-five" : "first-five",
        checksum: parityFirst ? "first-three" : "last-three",
        checksumEndianness: reverse ? "reversed" : "rfc4880-big-endian",
        matchingOriginalRows: result.matches,
        originalMatchedRows: result.matchingRows,
        firstRowData: Buffer.from(sample).toString("hex"),
        firstRowComputedCrc: Buffer.from(crcBytes(openPgpCrc24(sample),reverse)).toString("hex"),
        firstRowActualChecksum: Buffer.from(actual).toString("hex"),
      }));
    }
  }
  const visible = original.rows.map(row => row.join(""));
  assert(visible.every(row => row.length === 16));
  const firstArmorMatches = [];
  const lastArmorMatches = [];
  for (let i = 0; i < visible.length; i++) {
    if (armorChecksumMatches(visible[i], true)) firstArmorMatches.push(i);
    if (armorChecksumMatches(visible[i], false)) lastArmorMatches.push(i);
  }
  assert.equal(firstArmorMatches.length, 0);
  assert.equal(lastArmorMatches.length, 0);
  for (const originalRow of visible) {
    const data = originalRow.slice(0, 12);
    const expected = Buffer.from(crcBytes(openPgpCrc24([...Buffer.from(data, "ascii")]), false)).toString("base64");
    assert(armorChecksumMatches(data + expected, false));
    assert(armorChecksumMatches(expected + data, true));
  }
  console.log("Literal source printed 16 characters per row: direct RFC4880 4-character radix-64 CRC matches are 0/32 in either position");
  console.log("All 64 positive literal 12-character data + 4-character checksum row controls pass");
  assert.equal(observedHits, 0, "Expected exact original fixed-layout CRC matches");
  console.log("PASS original base60 32x8 source: zero of 128 possible five-byte/three-byte OpenPGP CRC24 rows match");
  console.log("RFC4880 123456789 check, 32/32 planted source-data checksum positives, flipped-byte negative all passed");
  console.log("Result excludes only the four frozen row-local layouts, not hidden source-independent transport algorithms.");
}

main();
