"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const page = parts[25];

function powmod(base, exponent, modulus) {
  let result = 1 % modulus;
  let value = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function parseWords(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };
  for (const ch of text) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return { words, runes };
}

const parsed = parseWords(page);
const word = parsed.words[29];
assert.equal(word.start, 145);
assert.deepEqual(word.values, [3,20,10,11,16]);
assert.equal(parsed.runes[144], 18);
const source = [parsed.runes[144], ...word.values];
assert.deepEqual(source, [18,3,20,10,11,16]);

let runeOffset = 0;
const lines = [];
for (const [sourceLine, line] of page.split("\n").entries()) {
  const values = [];
  const start = runeOffset;
  for (const ch of line) {
    const value = runeIndex.get(ch);
    if (value === undefined) continue;
    values.push(value);
    runeOffset += 1;
  }
  if (values.length) lines.push({ sourceLine, start, end: runeOffset - 1, values, text: line });
}
assert.equal(lines.length, 12);
assert.equal(runeOffset, 273);
const line = lines.find((row) => row.start <= 144 && row.end >= 149);
assert.ok(line);
assert.equal(lines.indexOf(line) + 1, 7);
assert.deepEqual([line.start, line.end, line.values.length], [137,160,24]);

const localBoundary = 144 - line.start;
const localWordStart = 145 - line.start;
const localWordEnd = 149 - line.start;
assert.deepEqual([localBoundary, localWordStart, localWordEnd], [7,8,12]);
assert.deepEqual(line.values.slice(localBoundary, localWordEnd + 1), source);

// The selected singleton is not a printed singleton: on this line it is the
// final rune of the ordinary four-rune word immediately before the five-rune
// target word.
assert.deepEqual(line.values.slice(4,8), [9,20,7,18]);
assert.deepEqual(line.values.slice(8,13), [3,20,10,11,16]);

// A left-right reflection of the 24-rune line does not fix the computational
// six-rune source interval.
const reflect = (position) => line.values.length - 1 - position;
const reflectedRange = [reflect(localWordEnd), reflect(localBoundary)];
assert.deepEqual(reflectedRange, [11,16]);
assert.notDeepEqual(reflectedRange, [localBoundary, localWordEnd]);

const C = (x) => powmod(x, 3, 29);
const I = (x) => powmod(x, 27, 29);
const variants = {
  C_I: [C(source[0]), ...source.slice(1).map(I)],
  I_C: [I(source[0]), ...source.slice(1).map(C)],
  C_C: source.map(C),
  I_I: source.map(I),
};
assert.deepEqual(variants.C_I, [3,10,16,3,8,20]);
assert.deepEqual(variants.I_C, [21,27,25,14,26,7]);
assert.deepEqual(variants.C_C, [3,27,25,14,26,7]);
assert.deepEqual(variants.I_I, [21,10,16,3,8,20]);

console.log(JSON.stringify({
  classification: "bounded negative: p25 source geometry does not identify the mixed cube/reciprocal role assignment",
  source,
  geometry: {
    runeBearingLines: lines.length,
    selectedLineOrdinal: lines.indexOf(line) + 1,
    selectedLineRuneSpan: [line.start, line.end],
    selectedLineLength: line.values.length,
    localBoundary,
    localWord: [localWordStart, localWordEnd],
    sourceInterval: [localBoundary, localWordEnd],
    reflectedInterval: reflectedRange,
    reflectionFixed: false,
    precedingPrintedWordLength: 4,
    selectedPrintedWordLength: 5,
  },
  frozenActionFamily: variants,
  decision:
    "retain the unique [K,g] p25 object and numerical downstream convergence, but require a new source selector before treating boundary C / word I as causal",
}, null, 2));
