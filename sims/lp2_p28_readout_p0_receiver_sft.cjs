"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find((candidate) => normalized.startsWith(candidate.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * @param {string} text
 * @returns {{runes:number[],words:Array<{n:number,start:number,end:number,len:number,values:number[],sum:number}>}}
 */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      len: current.length,
      values: current.slice(),
      sum: sum(current),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

const read = gp("READ");
const out = gp("OUT");
assert.deepEqual(read, [4, 28, 23]);
assert.deepEqual(out, [3, 1, 16]);
assert.equal(sum(read), 55);
assert.equal(sum(out), 20);

const table = grid.pages.flatMap((page) => page.bytes);
assert.equal(table.length, 256);
assert.equal(table[55], 80);
assert.equal(table[20], 102);

const parts = transcription.split(/^\s*%\s*$/m);
const p0 = parsePage(parts[0]);
assert.equal(p0.runes.length, 262);
assert.equal(p0.words.length, 59);

const start = table[55];
const end = table[20];
assert.equal(end - start + 1, 23);
assert.equal(p0.runes[start + 11], 0);

const startWord = p0.words.find((word) => word.start === start);
const endWord = p0.words.find((word) => word.end === end);
assert.ok(startWord);
assert.ok(endWord);
assert.equal(startWord.n, 18);
assert.equal(endWord.n, 21);

const selectedWords = p0.words.filter((word) => word.start >= start && word.end <= end);
assert.deepEqual(selectedWords.map((word) => word.n), [18, 19, 20, 21]);
assert.deepEqual(selectedWords.map((word) => word.len), [3, 7, 5, 8]);
assert.deepEqual(selectedWords.map((word) => word.sum), [48, 78, 63, 139]);
assert.deepEqual(selectedWords.map((word) => word.sum % 29), [19, 20, 5, 23]);

const geometry = [];
for (let x = 0; x + 22 < p0.runes.length; x += 1) {
  const y = x + 22;
  const startsWord = p0.words.some((word) => word.start === x);
  const endsWord = p0.words.some((word) => word.end === y);
  if (startsWord && endsWord && p0.runes[x + 11] === 0) {
    geometry.push([x, y]);
  }
}
assert.deepEqual(geometry, [[80, 102], [166, 188]]);

const multiplicity = new Map();
for (const value of table) multiplicity.set(value, (multiplicity.get(value) || 0) + 1);
assert.equal(multiplicity.get(80), 4);
assert.equal(multiplicity.get(102), 1);
assert.equal(multiplicity.get(166), 1);
assert.equal(multiplicity.get(188) || 0, 0);

const reachable = geometry.filter(([x, y]) =>
  (multiplicity.get(x) || 0) > 0 && (multiplicity.get(y) || 0) > 0
);
assert.deepEqual(reachable, [[80, 102]]);

const fixedAddressNullNumerator =
  (multiplicity.get(80) || 0) * (multiplicity.get(102) || 0);
const fixedAddressNullDenominator = 256 * 255;
assert.equal(fixedAddressNullNumerator, 4);
assert.equal(fixedAddressNullDenominator, 65280);

// Independent homology: the already selected p28 DH line is also a 23-rune
// object with exact center F.
const p28Part = parts[28];
const physicalLines = p28Part.trim().split("/").filter((line) => line.trim().length > 0);
assert.equal(physicalLines.length, 12);
const line6 = [...physicalLines[5]]
  .filter((char) => runeSet.has(char))
  .map((char) => runeIndex.get(char));
assert.equal(line6.length, 23);
assert.equal(line6[11], 0);
assert.deepEqual(line6.slice(0, 2), [23, 8]);

console.log(JSON.stringify({
  status: "PASS",
  instruction: {
    READ: { gp: read, sum: 55, p50: table[55] },
    OUT: { gp: out, sum: 20, p50: table[20] },
  },
  p0Receiver: {
    start,
    end,
    inclusiveLength: end - start + 1,
    center: start + 11,
    centerRune: corpus.translit[p0.runes[start + 11]],
    words: selectedWords.map((word) => ({
      n: word.n,
      start: word.start,
      end: word.end,
      len: word.len,
      gp0: word.sum,
      mod29: word.sum % 29,
    })),
  },
  allP0WholeWord23CenterFIntervals: geometry,
  reachableUnderExactP50ByteMultiset: reachable,
  fixedAddressPermutationNull: {
    numerator: fixedAddressNullNumerator,
    denominator: fixedAddressNullDenominator,
    probability: fixedAddressNullNumerator / fixedAddressNullDenominator,
  },
  p28DhLineHomology: {
    length: line6.length,
    centerRune: corpus.translit[line6[11]],
    startsWith: line6.slice(0, 2).map((value) => corpus.translit[value]).join(""),
  },
  classification:
    "independent structural continuation of the READ OUT candidate through the already established GP0->p50->p0 navigation grammar",
}, null, 2));
