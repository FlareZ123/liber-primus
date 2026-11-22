"use strict";

/**
 * SFT: historical 2014 stage04 1033-marked 256-byte site payload versus
 * the separately printed LP2 256-byte base60 table. Tests direct identity,
 * source-order/reverse XOR, and the invariant that any pure permutation must
 * preserve the byte histogram.
 *
 * Node.js 22, repository root: node sims/stage04_1033_html_lp2_256_gate_sft.cjs
 *
 * The archive witness is participant-preserved, not PGP authenticated.
 * The two 256-byte sources are independent, and there is no original message
 * instructing their combination.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const source = fs.readFileSync(
  path.join(ROOT, "resources", "external", "2014-stage04-index.html"), "utf8"
);
const tableJSON = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));

/** @param {Uint8Array} x @returns {string} */
function sha256(x) {
  return createHash("sha256").update(x).digest("hex");
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @param {boolean} reversed
 * @returns {number[]}
 */
function xor(a, b, reversed) {
  return a.map((x, i) => x ^ b[reversed ? 255 - i : i]);
}

/** @param {number[]} bytes */
function countAscii(bytes) {
  return bytes.filter((x) => x >= 32 && x <= 126).length;
}

/** @param {number[]} a @returns {string} */
function hexPrefix(a) {
  return Buffer.from(a.slice(0, 16)).toString("hex");
}

function main() {
  assert.equal(source.length, 524);
  const lines = source.split("\n");
  assert.equal(lines[0], "<!--1033-->");
  const hex = lines[1];
  assert.match(hex, /^[a-f0-9]{512}$/);
  const stageBytes = [...Buffer.from(hex, "hex")];
  assert.equal(stageBytes.length, 256);
  assert.equal(hex.slice(0, 16), "87de5b7fa26ab85d");

  assert.equal(tableJSON.kind, "base60-byte-table");
  assert.deepEqual(tableJSON.page_row_counts, [10, 13, 9]);
  const { alphabet } = tableJSON;
  assert.equal(alphabet.length, 60);
  const printedRows = tableJSON.rows;
  assert.equal(printedRows.length, 32);
  assert(printedRows.every((row) => row.length === 8));
  const gridBytes = printedRows.flat().map(
    (token) => alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1])
  );
  assert.equal(gridBytes.length, 256);
  assert(gridBytes.every((b) => b >= 0 && b <= 255));

  const matched = stageBytes.filter((x, i) => x === gridBytes[i]).length;
  assert.equal(matched, 1);
  const histogram = (bytes) => {
    const counts = Array(256).fill(0);
    for (const value of bytes) counts[value] += 1;
    return counts;
  };
  const stageHistogram = histogram(stageBytes);
  const gridHistogram = histogram(gridBytes);
  const histogramEqual = stageHistogram.every((count, i) => count === gridHistogram[i]);
  const multisetOverlap = stageHistogram.reduce(
    (sum, count, i) => sum + Math.min(count, gridHistogram[i]), 0
  );
  const distinctStageBytes = new Set(stageBytes).size;
  const distinctGridBytes = new Set(gridBytes).size;
  assert.equal(histogramEqual, false);
  assert.equal(multisetOverlap, 115);
  assert.equal(distinctStageBytes, 157);
  assert.equal(distinctGridBytes, 161);
  const normal = xor(stageBytes, gridBytes, false);
  const reversed = xor(stageBytes, gridBytes, true);
  assert.equal(countAscii(normal), 99);
  assert.equal(countAscii(reversed), 101);
  assert.equal(hexPrefix(normal), "4c39fcc5c387c6ea7eaf588d10f10bee");
  assert.equal(hexPrefix(reversed), "d7637fcb44c6262ce290fc4531df31aa");

  // Plant 256 directly readable bytes and prove sourcewise XOR recovers all.
  const readable = Array.from(
    { length: 256 }, (_, i) => Buffer.from("LIBER PRIMUS 3301")[i % 17]
  );
  const encrypted = xor(readable, gridBytes, false);
  assert.deepEqual(xor(encrypted, gridBytes, false), readable);
  assert.equal(countAscii(readable), 256);

  const report = {
    witnessSiteHtmlBytes: source.length,
    witnessHtmlMarker: lines[0],
    witnessBlobSHA256: sha256(Buffer.from(source)),
    witnessPayloadSHA256: sha256(Buffer.from(stageBytes)),
    printedTableSHA256: sha256(Buffer.from(gridBytes)),
    payloadSize: 256,
    tableSize: 256,
    bytewiseEqual: matched,
    sameByteHistogram: histogramEqual,
    multisetOverlap: multisetOverlap,
    distinctStage04Bytes: distinctStageBytes,
    distinctGridBytes: distinctGridBytes,
    sourceOrderXorPrintable: countAscii(normal),
    reversedOrderXorPrintable: countAscii(reversed),
    directXorHexPrefix: hexPrefix(normal),
    reversedTableXorHexPrefix: hexPrefix(reversed),
    plantedExactAsciiRecovered: true
  };
  console.log(JSON.stringify(report, null, 2));
  console.log("PASS: no direct identity, source-order/reverse XOR plaintext, or pure byte permutation");
}

main();
