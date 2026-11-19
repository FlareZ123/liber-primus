"use strict";

/**
 * Retrospective 80-shift p50 bridge tying GCD/GOOD/FOUND state addresses to
 * the p0 AND receiver and its known source-state key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} source @returns {Array<{index:number,start:number,end:number,values:number[]}>} */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ index: words.length + 1, start, end: offset - 1, values: current.slice() });
    current = [];
  };
  for (const char of [...source]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

assert.equal(gp0("GCD"), 34);
assert.equal(gp0("GOOD"), 35);
assert.equal(gp0("FOUND"), 36);
const sourceSpan = [34, 35, 36];
const readoutStart = 80;
const shiftedSpan = sourceSpan.map((address) => address + readoutStart);
assert.deepEqual(shiftedSpan, [114, 115, 116]);

// Across the full p50 table, these are the only equal-token pairs separated
// by the frozen READ OUT packet start 80.
const equalAt80 = [];
for (let address = 0; address + readoutStart < tokens.length; address += 1) {
  if (tokens[address] === tokens[address + readoutStart]) {
    equalAt80.push({
      source: address,
      shifted: address + readoutStart,
      token: tokens[address],
      base60: base60[address],
    });
  }
}
assert.deepEqual(equalAt80, [
  { source: 34, shifted: 114, token: "3H", base60: 197 },
  { source: 36, shifted: 116, token: "0s", base60: 54 },
]);

const sourceMods = sourceSpan.map((address) => base60[address] % 29);
const shiftedMods = shiftedSpan.map((address) => base60[address] % 29);
assert.deepEqual(sourceMods, [state.p, 10, state.p + state.K]);
assert.deepEqual(shiftedMods, [state.p, state.b, state.p + state.K]);

// HERE[a] and DH[p] are canonical p28 source lookups.
const p28Lines = parts[28].trim().split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
const hereValues = [...p28Lines[0]].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
const dhValues = [...p28Lines[5]].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
assert.equal(hereValues[state.a - 1], 10);
assert.equal(dhValues[state.p - 1], 20);

const andKey = [
  sourceMods[1],
  dhValues[state.p - 1],
  shiftedMods[1],
];
assert.deepEqual(andKey, [10, 20, 15]);

const p0Words = parseWords(parts[0]);
const receiver = p0Words.find((word) => word.start === 114 && word.end === 116);
assert.ok(receiver);
assert.deepEqual(receiver.values, [5, 0, 9]);
const plaintext = receiver.values.map((value, index) => mod29(value - andKey[index]));
assert.deepEqual(plaintext, gp("AND"));
assert.deepEqual(
  plaintext.map((value, index) => mod29(value + andKey[index])),
  receiver.values
);

// Fixed-key transfer over every complete three-rune unknown-page word.
const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/u).slice(1).join("\n");
const targets = [...new Map(
  (clear.match(/[A-Za-z]+/g) || [])
    .map((word) => word.toUpperCase())
    .map((word) => [word, gp(word)])
    .filter(([, values]) => values.length === 3)
).entries()].map(([word, values]) => ({ word, values }));
const targetByGp = new Map(targets.map((target) => [target.values.join(","), target.word]));

let threeRuneWords = 0;
const fixedKeyHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const text = parts[page <= 49 ? page : page - 1];
  for (const word of parseWords(text)) {
    if (word.values.length !== 3) continue;
    threeRuneWords += 1;
    const plain = word.values.map((value, index) => mod29(value - andKey[index]));
    const target = targetByGp.get(plain.join(","));
    if (target) fixedKeyHits.push({ page, word: word.index, start: word.start, target });
  }
}
assert.equal(threeRuneWords, 726);
assert.deepEqual(fixedKeyHits, [{ page: 0, word: receiver.index, start: 114, target: "AND" }]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "retrospective cross-chain compression: the only p50 token repeats at +80 bracket the AND receiver, and the two triplet centers plus DH[p] reproduce the exact AND key",
  sourceSpan: {
    addresses: sourceSpan,
    meanings: ["GP0(GCD)", "GP0(GOOD)", "GP0(FOUND)"],
    tokens: sourceSpan.map((address) => tokens[address]),
    base60Mod29: sourceMods,
  },
  shiftedSpan: {
    addresses: shiftedSpan,
    tokens: shiftedSpan.map((address) => tokens[address]),
    base60Mod29: shiftedMods,
    receiver,
  },
  equalAt80,
  key: andKey,
  plaintext,
  plaintextText: plaintext.map((value) => corpus.translit[value]).join(""),
  fixedKeyTransfer: { threeRuneWords, hits: fixedKeyHits },
}, null, 2));
