"use strict";

/**
 * p57 DIVINITY circumference -> p50 28/00 -> historical DH3301 -> zero bracket.
 *
 * Run:
 *   node sims/lp2_p57_divinity_p50_2800_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const historical2013 = fs.readFileSync(
  path.join(root, "resources", "external", "2013-tcp-server-signed-source.md"), "utf8");
const lexiconText = fs.readFileSync(
  path.join(root, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");

const A = 29;
const mod = (n) => ((n % A) + A) % A;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((s, i) => [s, i]));
translitIndex.set("ING", translitIndex.get("NG"));

function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) current.push(v);
    else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
const divinity = p57Words.find((word) =>
  word.map((v) => corpus.translit[v]).join("") === "DIUINITY");
assert.deepEqual(divinity, [23, 10, 1, 10, 9, 10, 16, 26]);

const inner = divinity.slice(1, -1);
const outer = [divinity[0], divinity[divinity.length - 1]];
const primeSum = (values) => values.reduce((sum, v) => sum + corpus.prime[v], 0);
const innerPrimeSum = primeSum(inner);
const outerPrimeSum = primeSum(outer);

assert.equal(primeSum(divinity), 376);
assert.equal(innerPrimeSum, 184);
assert.equal(outerPrimeSum, 192);
assert.equal(outerPrimeSum - innerPrimeSum, divinity.length);
assert.equal(divinity.length, 8);

const gridCells = grid.pages.flatMap((page) => page.tokens);
assert.equal(gridCells.length, 256);
assert.equal(gridCells[innerPrimeSum], "28");
assert.equal(gridCells[outerPrimeSum], "00");
assert.equal(gridCells[innerPrimeSum] + gridCells[outerPrimeSum], "2800");

const gridBytes = gridCells.map((cell) =>
  grid.alphabet.indexOf(cell[0]) * 60 + grid.alphabet.indexOf(cell[1]));
assert.ok(gridBytes.every((value) => value >= 0 && value <= 255));

for (const needle of [
  "base 2757",
  "server secret 331",
  "server public share 1264",
  "client public share 2800",
  "returned shared value 1067",
  "e ≡ 11 (mod 550)"
]) {
  assert.ok(historical2013.includes(needle), "missing historical field: " + needle);
}

const historicalTuple = [3301, 2757, 331, 1264, 2800, 1067];
const tupleSeed = historicalTuple.map((value) => value % A);
assert.deepEqual(tupleSeed, [24, 2, 12, 17, 16, 23]);

// The selected historical modulus reaches the second and only other literal zero cell.
const secondZero = 3301 % gridCells.length;
assert.equal(secondZero, 229);
assert.equal(gridCells[secondZero], "00");
assert.deepEqual(
  gridCells.map((cell, i) => cell === "00" ? i : -1).filter((i) => i >= 0),
  [192, 229]
);
assert.equal(secondZero - outerPrimeSum - 1, 36);
assert.equal(ink.counts.large, 36);

// The table's own byte-as-next-address graph gives 11 cells from 184 through 192.
const path184to192 = [];
const seen = new Set();
for (let at = innerPrimeSum; !seen.has(at); at = gridBytes[at]) {
  seen.add(at);
  path184to192.push(at);
  if (at === outerPrimeSum) break;
}
assert.equal(path184to192[path184to192.length - 1], outerPrimeSum);
assert.equal(path184to192.length, 11);
assert.deepEqual(path184to192, [184,128,201,74,205,76,114,197,115,247,192]);

const BASE29_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {number} value @returns {number[]} */
function base29Digits(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  if (value === 0) return [0];
  const out = [];
  for (let n = value; n > 0; n = Math.floor(n / A)) out.push(n % A);
  return out.reverse();
}
const sharedDigits = base29Digits(1067);
assert.deepEqual(sharedDigits, [1, 7, 23]);
assert.equal(sharedDigits.map((v) => BASE29_DIGITS[v]).join(""), "17N");

const {words, runeCount} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);

function wordValues(word) {
  return [...word.runes].map((rune) => {
    const v = runeIndex.get(rune);
    assert.notEqual(v, undefined);
    return v;
  });
}
const originalWords = words.map(wordValues);

const multigraphs = ["ING", "TH", "EO", "NG", "OE", "AE", "IA", "EA"];
const alias = {K:"C", V:"U", Q:"C", Z:"S"};

function encodeEnglish(word) {
  const input = word.toUpperCase().replace(/[KVQZ]/g, (ch) => alias[ch]);
  const out = [];
  for (let i = 0; i < input.length;) {
    const part = multigraphs.find((g) => input.startsWith(g, i)) || input[i];
    const v = translitIndex.get(part);
    if (v === undefined) return null;
    out.push(v);
    i += part.length;
  }
  return out;
}

const dictionary = new Set();
for (const line of lexiconText.split(/\r?\n/)) {
  const m = /^([a-z]+) /.exec(line.trim());
  if (!m) continue;
  const encoded = encodeEnglish(m[1]);
  if (encoded) dictionary.add(encoded.join(","));
}

function summarize(decodedWords) {
  const counts = Array(A).fill(0);
  let n = 0;
  let dictionaryHits = 0;
  let longestDictionaryRun = 0;
  let run = 0;
  for (const word of decodedWords) {
    for (const v of word) {
      counts[v]++;
      n++;
    }
    if (dictionary.has(word.join(","))) {
      dictionaryHits++;
      run++;
      longestDictionaryRun = Math.max(longestDictionaryRun, run);
    } else {
      run = 0;
    }
  }
  return {
    ioc: counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1)),
    dictionaryHits,
    longestDictionaryRun,
    sampleWords: decodedWords.slice(0, 16)
      .map((word) => word.map((v) => corpus.translit[v]).join(""))
  };
}

function t6Decode(cipher, seed) {
  return cipher.map((value, j) => {
    const state = j < 6 ? seed[j] : cipher[j - 6];
    return mod(value - 24 + 2 * state);
  });
}

const tupleT6 = originalWords.map((word) => t6Decode(word, tupleSeed));
let phase = 0;
const shared1067 = originalWords.map((word) =>
  word.map((value) => mod(value - sharedDigits[phase++ % sharedDigits.length])));

const result = {
  source: {
    divinityPrimeSum: primeSum(divinity),
    innerPrimeSum,
    outerPrimeSum,
    tableWidth: 8,
    grid184: gridCells[184],
    grid192: gridCells[192],
    selectedPrintedPair: gridCells[184] + gridCells[192],
    historicalTuple,
    historicalClientExponentClass: 11,
    path184to192,
    secondZero,
    zeroBracketLength: secondZero - outerPrimeSum - 1,
    largePunctuationCount: ink.counts.large,
    tupleSeed,
    shared1067Base29: sharedDigits.map((v) => BASE29_DIGITS[v]).join("")
  },
  baseline: summarize(originalWords),
  tupleT6: summarize(tupleT6),
  shared1067GlobalSubtract: summarize(shared1067)
};

assert.ok(Math.abs(result.baseline.ioc - 0.03447839786450569) < 1e-15);
assert.equal(result.baseline.dictionaryHits, 199);
assert.equal(result.tupleT6.dictionaryHits, 189);
assert.ok(Math.abs(result.shared1067GlobalSubtract.ioc - 0.03446372956760459) < 1e-15);
assert.equal(result.shared1067GlobalSubtract.dictionaryHits, 192);

console.log(JSON.stringify(result, null, 2));
