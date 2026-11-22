"use strict";
/**
 * Original-image-anchored 256 numerical cells -> 512 adjacent runes gate.
 * No arbitrary scanning or new alignment: page49/51 actual 32x8 grid, the
 * next original large rubric span p51..p53 534 runes, first five printed
 * words length 3+6+5+5+3=22, leaving exactly 512 runes.
 *
 * Executable Windows 11 Node.js 22 single-file read-only regression:
 *   node sims/lp2_grid256_adjacent_rune512_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const marks = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const bytes = grid.pages.flatMap(p => p.bytes);
assert.deepEqual(grid.pages.map(p => p.rows), [10, 13, 9]);
assert.equal(bytes.length, 256);
const runes = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(runes.length, 12956);
const beginningMark = marks.events.find(e => e.index === 171);
const endingMark = marks.events.find(e => e.index === 177);
assert.equal(beginningMark.rune_offset, 12114);
assert.equal(endingMark.rune_offset, 12648);
assert.equal(beginningMark.symbol, "⁜");
assert.equal(endingMark.symbol, "⁜");
const page51 = transcript.split("%")[50];
const page51Words = page51.replace(/[\/\n\r\s]/g, "")
  .split(/[-.]/).filter(w => /[\u16A0-\u16FF]/u.test(w))
  .map(w => Array.from(w));
assert.deepEqual(page51Words.slice(0, 5).map(w => w.length),
  [3, 6, 5, 5, 3]);
const fiveWordHeader = page51Words.slice(0, 5)
  .reduce((n, w) => n + w.length, 0);
assert.equal(fiveWordHeader, 22);
const body = runes.slice(beginningMark.rune_offset + fiveWordHeader,
  endingMark.rune_offset);
assert.equal(endingMark.rune_offset - beginningMark.rune_offset, 534);
assert.equal(body.length, 512);
const ambiguousCellIndices = new Set([
  2, 25, 45, 50, 90, 165, 175, 182, 199, 246
]);
assert.equal(ambiguousCellIndices.size, 10);
const rows = [];
for (const tableOrder of ["row-major", "column-major"]) {
  for (const bodyOrder of ["forward", "reverse"]) {
    let repeatedValueComparisons = 0;
    let equalRunePairs = 0;
    let scaledByteEquals = 0;
    const seen = new Map();
    const sourceRunes = bodyOrder === "forward" ? body : body.slice().reverse();
    for (let i = 0; i < 256; i++) {
      const byteIndex = tableOrder === "row-major" ? i :
        (i % 32) * 8 + Math.floor(i / 32);
      // Original I/l font ambiguity in ten numerical glyph cells changes
      // their base60 byte, but never affects any test on the other 246 cells.
      if (ambiguousCellIndices.has(byteIndex)) continue;
      const byte = bytes[byteIndex];
      const a = sourceRunes[2 * i];
      const b = sourceRunes[2 * i + 1];
      const code = 29 * a + b;
      scaledByteEquals += Number(Math.floor(code * 256 / 841) === byte);
      const prior = seen.get(byte);
      if (prior) {
        repeatedValueComparisons++;
        equalRunePairs += Number(prior[0] === a && prior[1] === b);
      } else {
        seen.set(byte, [a, b]);
      }
    }
    rows.push({
      tableOrder, bodyOrder, unambiguousCells: 246,
      repeatedValueComparisons, equalRunePairs, scaledByteEquals
    });
  }
}
assert.deepEqual(rows.map(row => [
  row.repeatedValueComparisons,
  row.equalRunePairs,
  row.scaledByteEquals
]), [[90, 0, 0], [90, 0, 3], [90, 0, 2], [90, 0, 3]]);
console.log("SOURCE BRACKETS large red marks #171/#177",
  beginningMark.rune_offset, endingMark.rune_offset,
  "one original 534-rune rubric unit");
console.log("SOURCE PREFIX five printed words",
  page51Words.slice(0, 5).map(w => w.length).join("+"),
  "following original rune interval 12136..12647 exactly",
  body.length, "=2*256 runes");
console.log("SOURCE-EXACT 256 BYTE TO 512 RUNES FOUR READINGS",
  JSON.stringify(rows));
console.log("RESULT: direct fixed deterministic byte -> GP29 rune-pair",
  "table excluded at this word-boundary alignment (90/90 repeated",
  "unambiguous byte instances disagree with original paired runes)");
console.log("RESULT: no decoded original prose, no key or stateful",
  "byte-code exclusion; 22-rune split has no independent rubric marker");

/**
 * Distinct single-register stateful alternative: one previous output GP29
 * rune is the complete decoder state. If the same input byte and same
 * predecessor rune occur twice, their deterministic two-rune outputs must
 * agree, irrespective of unknown secret table entries for all 256*29 states.
 * Check all same source-physical 4 direction/byte traversal pairs.
 */
const predecessorRows = [];
for (const tableOrder of ["row-major", "column-major"]) {
  for (const bodyOrder of ["forward", "reverse"]) {
    const sourceRunes = bodyOrder === "forward" ? body : body.slice().reverse();
    let collisions = 0, contradictions = 0;
    const seen = new Map();
    for (let i = 0; i < 256; i++) {
      const j = tableOrder === "row-major" ? i :
        (i % 32) * 8 + Math.floor(i / 32);
      if (ambiguousCellIndices.has(j)) continue;
      const byte = bytes[j];
      const prev = i > 0 ? String(sourceRunes[2*i - 1]) : "START";
      const input = byte + "," + prev;
      const output = sourceRunes.slice(2*i, 2*i+2).join(",");
      if (seen.has(input)) {
        collisions++;
        contradictions += Number(seen.get(input) !== output);
      } else {
        seen.set(input, output);
      }
    }
    predecessorRows.push({
      tableOrder, bodyOrder,
      collisionsOfSameInputByteAndPredecessor: collisions,
      differentOriginalPairedOutputs: contradictions
    });
  }
}
assert.deepEqual(predecessorRows.map(x => [
  x.collisionsOfSameInputByteAndPredecessor,
  x.differentOriginalPairedOutputs
]), [[6,6],[6,6],[5,5],[5,5]]);
console.log("SECRET-ALL-29x256 PREDECESSOR-RUNE OUTPUT MAP TEST",
  JSON.stringify(predecessorRows),
  "impossible as a deterministic 1-GP-state byte-to-pair decoder");

console.log("PASS: original 256/512 rubric-boundary pairing SFT");
