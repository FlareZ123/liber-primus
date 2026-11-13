"use strict";

/**
 * Original LP2 word-bit ASCII candidate, restricted to source-visible clocks.
 *
 * Run with: node sims/lp2_wordbit_ascii_gate_sft.cjs
 * Requires the checked-in original transcription and GP29 corpus.
 * No external packages, argument search or network.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const transcript = fs.readFileSync(path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @returns {number[][]} Complete printed words, with line and page carries preserved. */
function originalWords() {
  const raw = transcript.split("%").slice(0, 55).join("%");
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  for (const character of raw) {
    if (index.has(character)) current.push(index.get(character));
    else if (character === "%" || character === "/" || /\s/u.test(character)) {
      // Physical page boundaries and line wrapping do not terminate words.
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {number[][]} words */
function features(words) {
  return words.map((word) => [
    word.length,
    word.reduce((sum, rune) => sum + corpus.prime[rune], 0),
    word.reduce((sum, rune) => sum + rune, 0),
  ]);
}

/**
 * Convert eight original complete words per byte, source zero phase.
 * @param {number[][]} rows
 * @param {number} featureIndex
 * @param {boolean} lsbFirst
 * @param {boolean} complement
 * @returns {number[]}
 */
function bytesFor(rows, featureIndex, lsbFirst, complement) {
  assert.equal(rows.length % 8, 0);
  const output = [];
  for (let start = 0; start < rows.length; start += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      const bit = ((rows[start + j][featureIndex] & 1) ^ Number(complement));
      byte = lsbFirst ? byte | (bit << j) : (byte << 1) | bit;
    }
    output.push(byte);
  }
  return output;
}

/** @param {number[][]} rows */
function columnFirstEight(rows) {
  const output = [];
  for (let column = 0; column < 8; column++) {
    for (let i = column; i < rows.length; i += 8) output.push(rows[i]);
  }
  return output;
}

/** @param {number[][]} rows */
function rowFromColumnEight(rows) {
  assert.equal(rows.length % 8, 0);
  const output = [];
  const height = rows.length / 8;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < 8; j++) output.push(rows[j * height + i]);
  }
  return output;
}

/** @param {number[]} bytes */
function statistics(bytes) {
  let printable = 0;
  let current = 0;
  let longest = 0;
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      current++;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  return {printable, longest};
}

// A planted, untransposed, length-parity English byte stream decodes exactly.
const plantedMessage = Buffer.from("LIBER PRIMUS ORIGINAL BIT PLANT", "ascii");
const plantedRows = [...plantedMessage].flatMap((byte) =>
  Array.from({length: 8}, (_, bit) => [((byte >> (7 - bit)) & 1) ? 1 : 2, 0, 0]));
assert.deepEqual(bytesFor(plantedRows, 0, false, false), [...plantedMessage]);

const sourceWords = originalWords();
assert.equal(sourceWords.length, 2896);
assert.equal(sourceWords.reduce((n, word) => n + word.length, 0), 12956);
const rows = features(sourceWords);
assert.equal(rows.filter((row) => row[0] % 2).length, 1450);
const readings = [
  ["printed", rows],
  ["eight-column-first", columnFirstEight(rows)],
  ["eight-column-inverse", rowFromColumnEight(rows)],
];
const outputs = [];
for (const [ordering, featureRows] of readings) {
  for (let featureIndex = 0; featureIndex < 3; featureIndex++) {
    for (const lsbFirst of [false, true]) {
      for (const complement of [false, true]) {
        const bytes = bytesFor(featureRows, featureIndex, lsbFirst, complement);
        assert.equal(bytes.length, 362);
        outputs.push({
          ordering,
          sourceQuantity: ["length", "GP-prime sum", "GP-index sum"][featureIndex],
          bitOrder: lsbFirst ? "LSB-first" : "MSB-first",
          complement,
          ...statistics(bytes),
        });
      }
    }
  }
}
assert.equal(outputs.length, 36);
outputs.sort((left, right) => right.printable - left.printable);
assert.equal(outputs[0].printable, 153);
assert.equal(Math.max(...outputs.map((item) => item.longest)), 7);
console.log(JSON.stringify({
  sourceWords: sourceWords.length,
  sourceRunes: 12956,
  bytesPerRead: 362,
  candidateCount: outputs.length,
  best: outputs[0],
  worst: outputs.at(-1),
  readableFullByteStreams: outputs.filter((item) => item.printable === 362).length,
  outputs,
}, null, 2));
