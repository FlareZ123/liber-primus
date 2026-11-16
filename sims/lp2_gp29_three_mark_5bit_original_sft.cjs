"use strict";

/**
 * Original-source GP29 + three physical dot-mark classes -> 5-bit receiver.
 * Candidate serialization only. Source imagery does not establish this cipher.
 * Usage: node sims/lp2_gp29_three_mark_5bit_original_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const extra = new Map([[10, 29], [13, 30], [23, 31]]);
const byPage = new Map(ink.pages.map((p) => [p.page, p]));
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55], [56, 56], [57, 57]];

/** @param {number} lo @param {number} hi @returns {number[]} */
function originalSymbols(lo, hi) {
  /** @type {number[]} */
  const symbols = [];
  for (let page = lo; page <= hi; page++) {
    const indices = corpus.pages[page].indices;
    const marks = byPage.get(page)?.large_punctuation || [];
    assert.equal(indices.length, corpus.pages[page].runic_count);
    let markIndex = 0;
    for (let offset = 0; offset <= indices.length; offset++) {
      while (markIndex < marks.length && marks[markIndex][0] === offset) {
        assert.ok(extra.has(marks[markIndex][1]));
        symbols.push(extra.get(marks[markIndex][1]));
        markIndex++;
      }
      if (offset < indices.length) {
        assert.ok(Number.isInteger(indices[offset]) && indices[offset] >= 0 &&
          indices[offset] < 29);
        symbols.push(indices[offset]);
      }
    }
    assert.equal(markIndex, marks.length, `unprocessed marks on p${page}`);
  }
  return symbols;
}

/**
 * Source-visible first-order 5-bit serialization, MSB first, no silent padding.
 * @param {number[]} symbols
 */
function packFive(symbols) {
  /** @type {number[]} */
  const bytes = [];
  let accumulator = 0;
  let bits = 0;
  for (const symbol of symbols) {
    accumulator = (accumulator << 5) | symbol;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((accumulator >> bits) & 255);
      accumulator &= (1 << bits) - 1;
    }
  }
  return { bytes, tail: accumulator, tailBits: bits };
}

/** @param {number[]} b */
function hex(b) {
  return b.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** @param {number} lo @param {number} hi */
function measure(lo, hi) {
  const symbols = originalSymbols(lo, hi);
  const packed = packFive(symbols);
  const runes = corpus.pages.slice(lo, hi + 1)
    .reduce((sum, p) => sum + p.indices.length, 0);
  const printable = packed.bytes.filter((b) => b >= 32 && b <= 126).length;
  const typedHeaders = [
    "89504e470d0a1a0a", // PNG
    "255044462d", // PDF
    "504b0304", // ZIP
    "1f8b08", // gzip
    "425a68", // bzip2
    "fd377a585a00", // xz
    "474946383761", // GIF87a
    "474946383961", // GIF89a
    "7f454c46", // ELF
    "4d5a", // MZ / PE
  ];
  const bytesHex = hex(packed.bytes);
  return {
    pages: `${lo}-${hi}`,
    runes,
    marks: symbols.length - runes,
    symbols: symbols.length,
    byteCount: packed.bytes.length,
    residualBits: packed.tailBits,
    residualValue: packed.tail,
    first24Hex: bytesHex.slice(0, 48),
    printablePercent: Number((100 * printable / packed.bytes.length).toFixed(2)),
    standardHeader: typedHeaders.find((h) => bytesHex.startsWith(h)) || null,
    completeAscii: printable === packed.bytes.length,
  };
}

function main() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(ink.counts.large, 36);
  const whole = measure(0, 57);
  assert.deepEqual(
    [whole.runes, whole.marks, whole.symbols, whole.byteCount,
      whole.residualBits, whole.residualValue],
    [13136, 36, 13172, 8232, 4, 15],
  );
  assert.equal(whole.first24Hex,
    "7a24334f607ea552f84b3640bb0d224c8f1c3ecc55429c99");
  const reports = chapters.map(([start, end]) => measure(start, end));
  assert.equal(reports[6].first24Hex,
    "bb1c502b0741bccb0212b731b79b5c48b241ee6774f578c0");
  assert.deepEqual([reports[6].byteCount, reports[6].residualBits], [1055, 0]);
  assert.equal(reports[9].byteCount, 55);
  assert.equal(reports[9].residualBits, 0);
  assert.ok(reports.every((r) => r.standardHeader === null && !r.completeAscii));
  console.log(JSON.stringify({ alphabet: "GP29 + 10/13/23-dot marks -> 0..31",
    bitOrder: "MSB-first", markOrder: "ascending 10,13,23",
    chapters: reports, whole }, null, 2));
}

if (require.main === module) main();

module.exports = { originalSymbols, packFive, measure };
