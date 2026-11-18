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

// The 36-byte zero bracket is now source-selected by 192/229.
const bracketBytes = gridBytes.slice(outerPrimeSum + 1, secondZero);
assert.equal(bracketBytes.length, 36);

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let b = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  b %= m;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

// Two literal DH roles for the source bracket bytes:
// 1. each byte is a client share handled by the selected server secret331;
// 2. each byte is an exponent of the selected base2757.
const serverShareKeys = bracketBytes.map((b) => modPow(b, 331, 3301) % A);
const exponentKeys = bracketBytes.map((b) => modPow(2757, b, 3301) % A);

// The final five large marks are on solved p56/p57 and therefore form a fixed gate.
const p56Cipher = corpus.pages.find((page) => page.page === 56).indices;
const p57Cipher = corpus.pages.find((page) => page.page === 57).indices;
const p56Plain = parseRuneWords(
  solved.sections.find((section) => section.name === "p56_an_end").source_text).flat();
const p57Plain = parseRuneWords(
  solved.sections.find((section) => section.name === "p57_parable").source_text).flat();
assert.equal(p56Cipher.length, 85);
assert.equal(p57Cipher.length, 95);
assert.equal(p56Plain.length, 85);
assert.equal(p57Plain.length, 95);

const solvedMarkCipher = [p56Cipher[4], p56Cipher[44], p56Cipher[84], p57Cipher[6], p57Cipher[94]];
const solvedMarkPlain = [p56Plain[4], p56Plain[44], p56Plain[84], p57Plain[6], p57Plain[94]];
assert.deepEqual(solvedMarkCipher, [4,25,15,18,18]);
assert.deepEqual(solvedMarkPlain, [23,3,18,18,18]);

function solvedMarkMatches(keys, sign) {
  const tail = keys.slice(-5);
  return solvedMarkCipher.reduce((count, value, i) =>
    count + (mod(value + sign * tail[i]) === solvedMarkPlain[i] ? 1 : 0), 0);
}
const dhSolvedGate = {
  serverShareByteSubtract: solvedMarkMatches(serverShareKeys, -1),
  serverShareByteAdd: solvedMarkMatches(serverShareKeys, 1),
  exponentByteSubtract: solvedMarkMatches(exponentKeys, -1),
  exponentByteAdd: solvedMarkMatches(exponentKeys, 1)
};
assert.deepEqual(dhSolvedGate, {
  serverShareByteSubtract: 0,
  serverShareByteAdd: 0,
  exponentByteSubtract: 1,
  exponentByteAdd: 1
});

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

// Source-selected nonperiodic interval-state receiver.
// The 31 large marks on unknown p0-p55 end 31 consecutive intervals, with the
// final p55 mark exactly at the end of the 12,956-rune unknown stream.
// Pair the first31 zero-bracket bytes to those intervals in printed order,
// use each byte as the initial DH state, and evolve by the selected base2757
// modulo3301. Test only emit-before-advance / advance-before-emit and both signs.
const unknownPages = corpus.pages.filter((page) => page.page < 56 && page.indices.length);
const unknownFlat = unknownPages.flatMap((page) => page.indices);
assert.equal(unknownFlat.length, 12956);

const pageStarts = new Map();
let unknownOffset = 0;
for (const page of unknownPages) {
  pageStarts.set(page.page, unknownOffset);
  unknownOffset += page.indices.length;
}

const unknownLargeMarkEnds = [];
for (const page of ink.pages.filter((page) => page.page < 56 && pageStarts.has(page.page))) {
  for (const [offset] of page.large_punctuation || []) {
    unknownLargeMarkEnds.push(pageStarts.get(page.page) + offset);
  }
}
unknownLargeMarkEnds.sort((a, b) => a - b);
assert.equal(unknownLargeMarkEnds.length, 31);
assert.equal(unknownLargeMarkEnds[unknownLargeMarkEnds.length - 1], unknownFlat.length);

const intervalSeeds = bracketBytes.slice(0, 31);
assert.equal(intervalSeeds.length, 31);

function symbolIoc(values) {
  const counts = Array(A).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

function adjacentEquals(values) {
  let matches = 0;
  for (let i = 0; i + 1 < values.length; i++) {
    if (values[i] === values[i + 1]) matches++;
  }
  return matches;
}

function intervalDhDecode(sign, advanceFirst) {
  const out = [];
  let from = 0;
  for (let interval = 0; interval < unknownLargeMarkEnds.length; interval++) {
    let state = intervalSeeds[interval];
    const to = unknownLargeMarkEnds[interval];
    for (let i = from; i < to; i++) {
      if (advanceFirst) state = (state * 2757) % 3301;
      out.push(mod(unknownFlat[i] + sign * (state % A)));
      if (!advanceFirst) state = (state * 2757) % 3301;
    }
    from = to;
  }
  assert.equal(out.length, unknownFlat.length);
  return out;
}

const intervalDhVariants = {};
for (const advanceFirst of [false, true]) {
  for (const sign of [-1, 1]) {
    const decoded = intervalDhDecode(sign, advanceFirst);
    const name = `${advanceFirst ? "advance" : "emit"}_${sign < 0 ? "subtract" : "add"}`;
    intervalDhVariants[name] = {
      ioc: symbolIoc(decoded),
      adjacentEquals: adjacentEquals(decoded)
    };
  }
}

assert.equal(adjacentEquals(unknownFlat), 86);
assert.ok(Math.abs(intervalDhVariants.emit_subtract.ioc - 0.034477754413626195) < 1e-15);
assert.equal(intervalDhVariants.emit_subtract.adjacentEquals, 442);
assert.ok(Math.abs(intervalDhVariants.emit_add.ioc - 0.03447982775534901) < 1e-15);
assert.equal(intervalDhVariants.emit_add.adjacentEquals, 409);
assert.ok(Math.abs(intervalDhVariants.advance_subtract.ioc - 0.034493888348641706) < 1e-15);
assert.equal(intervalDhVariants.advance_subtract.adjacentEquals, 425);
assert.ok(Math.abs(intervalDhVariants.advance_add.ioc - 0.0344633482633797) < 1e-15);
assert.equal(intervalDhVariants.advance_add.adjacentEquals, 422);

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
    dhSolvedGate,
    unknownLargeMarkCount: unknownLargeMarkEnds.length,
    intervalDhVariants,
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
