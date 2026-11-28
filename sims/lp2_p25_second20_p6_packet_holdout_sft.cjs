"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8").replace(/\r/g, "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} page @returns {{words: object[], lines: object[]}} */
function parsePage(page) {
  const block = page >= 51 ? page - 1 : page;
  const text = parts[block];
  let offset = 0;
  let start = -1;
  let values = [];
  const words = [];
  const flush = () => {
    if (!values.length) return;
    words.push({ start, end: start + values.length, length: values.length, values: values.slice() });
    values = [];
  };
  for (const char of text) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
  flush();

  let lineOffset = 0;
  const lines = [];
  for (const rawLine of text.split("\n")) {
    const lineValues = [...rawLine]
      .map((char) => runeIndex.get(char))
      .filter((value) => value !== undefined);
    if (!lineValues.length) continue;
    lines.push({
      start: lineOffset,
      end: lineOffset + lineValues.length,
      width: lineValues.length,
      values: lineValues,
    });
    lineOffset += lineValues.length;
  }
  return { words, lines };
}

const address = 71;
const key = [20,20,12,6];

const p40 = parsePage(40);
const p40Word = p40.words.find((word) => word.start === address);
const p40Line = p40.lines.find((line) => line.start <= address && address < line.end);
assert.deepEqual(p40Word, { start: 71, end: 75, length: 4, values: [4,15,14,21] });
assert.equal(p40Line.width, 20);
const p40Plain = p40Word.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(p40Plain, [13,24,2,15]);

// Prospectively frozen second destination from the p25 40|20 output.
const p20 = parsePage(20);
const p20Word = p20.words.find((word) => word.start === address) || null;
const p20Line = p20.lines.find((line) => line.start <= address && address < line.end);
assert.equal(p20Word, null);
assert.deepEqual(
  { start: p20Line.start, end: p20Line.end, width: p20Line.width },
  { start: 65, end: 88, width: 23 },
);

console.log(JSON.stringify({
  status: "PASS",
  frozenPacket: { address, arity: 4, lineWidth: 20, key, direction: "subtract" },
  positiveControl: {
    page: 40,
    receiver: p40Word,
    lineWidth: p40Line.width,
    output: p40Plain,
    transliteration: p40Plain.map((value) => corpus.translit[value]).join(""),
  },
  prospectiveHoldout: {
    page: 20,
    wordAtAddress71: p20Word,
    containingLine: { start: p20Line.start, end: p20Line.end, width: p20Line.width },
    decision: "negative before rune decoding: address71 is not a word start and line width is 23, not 20",
  },
}, null, 2));
