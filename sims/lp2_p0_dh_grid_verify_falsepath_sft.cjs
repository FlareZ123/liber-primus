"use strict";

/**
 * SFT: sealed p0 DH aggregate -> p50 coordinate -> VERIFY,
 * with the second valid p28 H coordinate entering the false-path trap.
 * Run: node sims/lp2_p0_dh_grid_verify_falsepath_sft.cjs
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const signed = fs.readFileSync(path.join(ROOT, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");

const table = grid.pages.flatMap((p) => p.tokens);
const alphabet = grid.alphabet;
assert.strictEqual(table.length, 256);
assert.strictEqual(alphabet.length, 60);

const sourceText = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const sourceWords = [...new Set(sourceText
  .split(/[^A-Za-z0-9]+/)
  .filter((w) => /^[A-Za-z]+$/.test(w))
  .map((w) => w.toUpperCase()))];

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gpValues(word) {
  const text = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (text.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = gpTokens.find((item) => text.startsWith(item.symbol, i));
    assert(token, `cannot tokenize ${text.slice(i)}`);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

const labelsByGp0 = new Map();
for (const word of sourceWords) {
  const state = gpValues(word).reduce((a, b) => a + b, 0);
  const labels = labelsByGp0.get(state) || [];
  labels.push(word);
  labelsByGp0.set(state, labels);
}

function lowDigit(state) {
  assert(state >= 0 && state < table.length);
  return alphabet.indexOf(table[state][1]);
}

function walk(start, limit = 100) {
  const seen = new Set();
  const emitted = [];
  let state = start;
  for (let i = 0; i < limit && !seen.has(state); i += 1) {
    seen.add(state);
    state = lowDigit(state);
    emitted.push(state);
  }
  return emitted;
}

const dhPairs = [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
];

const valid = dhPairs.map(([row, col], index) => ({
  index,
  row,
  col,
  valid: row >= 0 && row < 32 && col >= 0 && col < 8,
})).filter((item) => item.valid);

assert.deepStrictEqual(valid.map(({ index, row, col }) => [index, row, col]), [
  [0, 15, 2],
  [1, 14, 4],
]);

const a0 = 15 * 8 + 2;
const a1 = 14 * 8 + 4;
assert.strictEqual(a0, 122);
assert.strictEqual(a1, 116);
assert.strictEqual(table[a0], "1Q");
assert.strictEqual(table[a1], "0s");

assert.deepStrictEqual(walk(a0), [26, 53, 51, 59, 9, 9]);
assert.deepStrictEqual(walk(a1), [54, 36, 54]);

assert.deepStrictEqual(labelsByGp0.get(59), ["VERIFY"]);
assert.deepStrictEqual(labelsByGp0.get(54), ["ROAD", "PATHS"]);
assert.deepStrictEqual(labelsByGp0.get(36), ["FOUND"]);
assert.strictEqual(labelsByGp0.has(26), false);
assert.strictEqual(labelsByGp0.has(53), false);
assert.strictEqual(labelsByGp0.has(51), false);

function firstVocabularyHit(start) {
  const seq = walk(start);
  for (let i = 0; i < seq.length; i += 1) {
    const labels = labelsByGp0.get(seq[i]);
    if (labels) return { state: seq[i], index: i, labels };
  }
  return null;
}

assert.deepStrictEqual(firstVocabularyHit(a0), { state: 59, index: 3, labels: ["VERIFY"] });
assert.deepStrictEqual(firstVocabularyHit(a1), { state: 54, index: 0, labels: ["ROAD", "PATHS"] });

// Immediate one-based row/column control.
const oneA0 = (15 - 1) * 8 + (2 - 1);
const oneA1 = (14 - 1) * 8 + (4 - 1);
assert.strictEqual(oneA0, 113);
assert.strictEqual(oneA1, 107);
assert.deepStrictEqual(firstVocabularyHit(oneA0), { state: 25, index: 2, labels: ["IS"] });
assert.deepStrictEqual(firstVocabularyHit(oneA1), { state: 20, index: 4, labels: ["THE"] });

// Swapped [col,row] orientation is invalid for both because columns 15/14 exceed width8.
assert(15 >= 8 && 14 >= 8);

// Global calibration.
let hitVerify = 0;
let firstVerify = 0;
let firstTrap = 0;
for (let addr = 0; addr < 256; addr += 1) {
  const seq = walk(addr);
  if (seq.includes(59)) hitVerify += 1;
  const first = firstVocabularyHit(addr);
  if (first && first.state === 59) firstVerify += 1;
  if (first && first.state === 54) firstTrap += 1;
}
assert.strictEqual(hitVerify, 190);
assert.strictEqual(firstVerify, 79);
assert.strictEqual(firstTrap, 16);

console.log("first valid DH coordinate:", { pair: dhPairs[0], address: a0, token: table[a0], walk: walk(a0), first: firstVocabularyHit(a0) });
console.log("second valid DH coordinate:", { pair: dhPairs[1], address: a1, token: table[a1], walk: walk(a1), first: firstVocabularyHit(a1) });
console.log("one-based controls:", { oneA0, first0: firstVocabularyHit(oneA0), oneA1, first1: firstVocabularyHit(oneA1) });
console.log("global calibration:", { hitVerify, firstVerify, firstTrap });
console.log("PASS");
