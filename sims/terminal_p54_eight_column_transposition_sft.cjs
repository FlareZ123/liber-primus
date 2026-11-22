"use strict";

/**
 * One-layer classical 8-column transposition of the source-selected terminal
 * 256-rune composite: p53 + p54 enlarged A + p55. No additive byte key.
 *
 * Run: node sims/terminal_p54_eight_column_transposition_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const readText = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
const p53 = pages.get(53), p54 = pages.get(54), p55 = pages.get(55);
assert.deepEqual([p53.length, p54.length, p55.length], [179, 232, 76]);
assert.equal(p54[0], 24);
const source = [...p53, p54[0], ...p55];
assert.equal(source.length, 256);
const key = p54.slice(1, 9);
assert.deepEqual(key, [19, 21, 23, 27, 2, 14, 10, 19]);
const keyOrder = key.map((value, index) => ({value, index}))
  .sort((a, b) => a.value - b.value || a.index - b.index)
  .map(x => x.index);
assert.deepEqual(keyOrder, [4, 6, 5, 0, 7, 1, 2, 3]);

/** Read a row-major 32x8 stream down columns in ascending-key order. */
function readDownColumns(values) {
  assert.equal(values.length, 256);
  return keyOrder.flatMap(col =>
    Array.from({length: 32}, (_, row) => values[row * 8 + col]));
}
/** Inverse: write the stream down columns in key order, then read rows. */
function undoColumnar(values) {
  assert.equal(values.length, 256);
  const output = Array(256);
  let at = 0;
  for (const col of keyOrder)
    for (let row = 0; row < 32; row++)
      output[row * 8 + col] = values[at++];
  return output;
}
assert.deepEqual(undoColumnar(readDownColumns(source)), source);
assert.deepEqual(readDownColumns(undoColumnar(source)), source);

function gpEncode(text) {
  const tokenIndex = new Map(corpus.translit.map((token, index) => [token, index]));
  tokenIndex.set("ING", 21);
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (tokenIndex.has(token)) {
          output.push(tokenIndex.get(token));
          i += n;
          matched = true;
          break;
        }
      }
      assert(matched, "unmapped GP text token");
    }
  }
  return output;
}
const reference = gpEncode(readText("resources/control/emerson_essays_2944.txt"));
const gibran = gpEncode(readText("resources/control/gibran_prophet_58585.txt"));
assert(reference.length > 70_000 + 256);
const counts = new Uint32Array(29 ** 3);
for (let i = 2; i < 50_000; i++)
  counts[reference[i - 2] * 841 + reference[i - 1] * 29 + reference[i]]++;
const alpha = 0.2;
const denominator = 49_998 + counts.length * alpha;
function score(values) {
  let total = 0, n = 0;
  for (let i = 2; i < values.length; i++, n++)
    total += Math.log((counts[values[i - 2] * 841 + values[i - 1] * 29 + values[i]] + alpha) / denominator);
  return total / n;
}
const forward = readDownColumns(source);
const inverse = undoColumnar(source);
const scores = {raw: score(source), readDownColumns: score(forward), inverseColumnar: score(inverse)};
const controls = [];
for (let start = 70_000; start + 256 <= reference.length; start += 300) {
  const block = reference.slice(start, start + 256);
  controls.push(Math.max(score(readDownColumns(block)), score(undoColumnar(block))));
}
controls.sort((a, b) => a - b);
const bestCandidate = Math.max(scores.readDownColumns, scores.inverseColumnar);
const exceedances = controls.filter(value => value >= bestCandidate).length;
const plant = gibran.slice(1024, 1280);
assert.equal(plant.length, 256);
assert.deepEqual(undoColumnar(readDownColumns(plant)), plant);
assert.deepEqual(readDownColumns(undoColumnar(plant)), plant);
assert.equal(controls.length, 843);
assert.equal(exceedances, 843);

function rows(values) {
  return Array.from({length: 32}, (_, row) =>
    values.slice(row * 8, row * 8 + 8).map(index => corpus.runes[index]).join(""));
}
function sourceLocation(index) {
  if (index < 179) return {compositeIndex: index, page: 53, localRuneOffset: index};
  if (index === 179) return {compositeIndex: index, page: 54, localRuneOffset: 0};
  return {compositeIndex: index, page: 55, localRuneOffset: index - 180};
}
function forwardMap(outputPosition) {
  const keyRank = Math.floor(outputPosition / 32);
  const row = outputPosition % 32;
  return sourceLocation(row * 8 + keyOrder[keyRank]);
}
function inverseMap(outputPosition) {
  const row = Math.floor(outputPosition / 8);
  const col = outputPosition % 8;
  const keyRank = keyOrder.indexOf(col);
  return sourceLocation(keyRank * 32 + row);
}
console.log(JSON.stringify({
  classification: "bounded negative; no plaintext or authentic key",
  source: {
    p53Runes: 179, p54EnlargedA: 1, p55Runes: 76, compositeRunes: 256,
    p54KeyRunes: key.map(index => corpus.runes[index]).join(""),
    p54KeyGPOrdinals: key, keyOrderZeroBased: keyOrder,
    tableShape: [32, 8]
  },
  sourceOffsetMap: {
    readDownFormula: "output j=32*k+r receives source i=8*r+keyOrder[k]",
    inverseFormula: "output j=8*r+c receives source i=32*keyOrder.indexOf(c)+r",
    compositeToOriginal: "i<179 => p53/local i; i=179 => p54/local 0; i>=180 => p55/local i-180",
    first16ReadDown: Array.from({length: 16}, (_, i) => forwardMap(i)),
    first16Inverse: Array.from({length: 16}, (_, i) => inverseMap(i))
  },
  scores,
  previews: {
    raw: source.slice(0, 48).map(i => corpus.translit[i]).join(""),
    readDownColumns: forward.slice(0, 48).map(i => corpus.translit[i]).join(""),
    inverseColumnar: inverse.slice(0, 48).map(i => corpus.translit[i]).join("")
  },
  familywiseControl: {
    count: controls.length, windowLength: 256, stride: 300,
    min: controls[0], median: controls[Math.floor(controls.length / 2)],
    max: controls[controls.length - 1], bestCandidate,
    exceedances, plusOneUpperTailP: (exceedances + 1) / (controls.length + 1)
  },
  positiveControl: {
    source: "Gibran native-GP symbols [1024,1280)",
    score: score(plant),
    inverseOfForwardExact: true,
    forwardOfInverseExact: true
  },
  readDownColumnsOutput32x8: rows(forward),
  inverseColumnarOutput32x8: rows(inverse)
}, null, 2));
