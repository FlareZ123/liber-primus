"use strict";

/**
 * Literal GP30 running-row differential gate.
 *
 * Complete the published 15x2 GP chart with SPACE in its sole missing cell.
 * Represent each symbol as (row in Z15, side in Z2). Freeze the simplest
 * state-changing row inverse:
 *
 *   P_row[i]  = C_row[i] - C_row[i-1] mod15
 *   P_side[i] = C_side[i]
 *   C_row[-1] = 0
 *
 * This is exactly reversible by cumulative row addition and can move spaces.
 * SFT: node sims/lp2_gp30_row_differential_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n");

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const SEP = 29;

function encodeWord(raw) {
  const s = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = tokens.find((x) => s.startsWith(x.s, i));
    if (!token) return null;
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

function originalWords() {
  const stream = transcription.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [];
  const finish = () => { if (word.length) words.push(word); word = []; };
  for (const ch of stream) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
    else finish();
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.flat().length, 12956);
  return words;
}

const coordinate = (symbol) => symbol < 15 ? [symbol, 0] : [symbol - 15, 1];
const symbolAt = (row, side) => side ? 15 + row : row;
const mod15 = (x) => ((x % 15) + 15) % 15;

function decode(tape) {
  const out = [];
  let previousCipherRow = 0;
  for (const symbol of tape) {
    const [cipherRow, side] = coordinate(symbol);
    out.push(symbolAt(mod15(cipherRow - previousCipherRow), side));
    previousCipherRow = cipherRow;
  }
  return out;
}

function encode(tape) {
  const out = [];
  let previousCipherRow = 0;
  for (const symbol of tape) {
    const [plainRow, side] = coordinate(symbol);
    const cipherRow = mod15(plainRow + previousCipherRow);
    out.push(symbolAt(cipherRow, side));
    previousCipherRow = cipherRow;
  }
  return out;
}

function splitAtSpaces(tape) {
  const words = [];
  let word = [];
  for (const symbol of tape) {
    if (symbol === SEP) {
      if (word.length) words.push(word);
      word = [];
    } else word.push(symbol);
  }
  if (word.length) words.push(word);
  return words;
}

function runeIoc(tape) {
  const counts = new Array(29).fill(0);
  for (const symbol of tape) if (symbol < 29) counts[symbol]++;
  const n = counts.reduce((a, b) => a + b, 0);
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}

const words = originalWords();
const input = words.flatMap((word) => [...word, SEP]);
assert.equal(input.length, 15852);
const plain = decode(input);
const plainWords = splitAtSpaces(plain);

assert.equal(plain.filter((x) => x === SEP).length, 617);
assert.equal(plainWords.length, 597);
assert.equal(Math.max(...plainWords.map((w) => w.length)), 170);
assert.ok(Math.abs(runeIoc(plain) - 0.03595146003496316) < 1e-15);

const dictionary = new Set(read("resources/control/english_wordfreq_textblob.txt")
  .split("\n")
  .filter((line) => /^[a-z]+\s+\d+$/.test(line))
  .map((line) => encodeWord(line.split(/\s+/)[0])).filter(Boolean)
  .map((word) => word.join(",")));

let n4 = 0, m4 = 0, n5 = 0, m5 = 0;
for (const word of plainWords) {
  const hit = dictionary.has(word.join(","));
  if (word.length >= 4) { n4++; m4 += Number(hit); }
  if (word.length >= 5) { n5++; m5 += Number(hit); }
}
assert.deepEqual([n4, m4, n5, m5], [530, 0, 511, 0]);

// Native positive: source-calibrated first 1,000 Shakespeare words.
const controlWords = (read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().match(/[A-Z]+/g) || [])
  .slice(0, 1000).map(encodeWord).filter(Boolean);
assert.equal(controlWords.length, 1000);
const clear = controlWords.flatMap((word) => [...word, SEP]);
const cipher = encode(clear);
assert.deepEqual(decode(cipher), clear);

// Any source-frame reset changes only the first decoded symbol after each reset.
// It cannot alter sustained interior nonprose produced by this first-order inverse.

console.log(JSON.stringify({
  original: {
    inputSymbols: input.length,
    inputSeparators: words.length,
    outputSeparators: plain.filter((x) => x === SEP).length,
    outputWords: plainWords.length,
    maxWordLength: Math.max(...plainWords.map((w) => w.length)),
    runeIoc: runeIoc(plain),
    dictionaryLengthAtLeast4: [m4, n4],
    dictionaryLengthAtLeast5: [m5, n5]
  },
  positive: {
    words: controlWords.length,
    symbols: clear.length,
    exactRoundtrip: true
  }
}, null, 2));
