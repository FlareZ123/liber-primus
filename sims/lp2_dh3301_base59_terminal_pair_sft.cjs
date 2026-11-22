"use strict";

/**
 * P28/p27 3QO=3301 -> fixed base59 -> terminal p55/p56 page-pair receiver.
 *
 * The upstream object fixes both ingredients independently of this receiver:
 * - p28/p27 serializes 3QO = 3301 in the authenticated BASE29 alphabet;
 * - the p28 DH23 table traversal selects base59 over base60 because only
 *   base59 reaches the state endpoint in exactly A=8 hops.
 *
 * This SFT then freezes the new consequence: interpret 3301 as two base59
 * digits and test the resulting physical page pair.
 *
 * Node.js 22 / CommonJS.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const parts = transcription.split(/^\s*%\s*$/mu);

assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(tokens.length, 256);

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number} value @param {number} radix @returns {[number, number]} */
function twoDigits(value, radix) {
  return [Math.floor(value / radix), value % radix];
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = result * factor % modulus;
    factor = factor * factor % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {string} text @returns {number[][]} */
function parseWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} line @returns {number[]} */
function lineRunes(line) {
  return [...line]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

/**
 * @param {string} alphabet
 * @param {number} source
 * @param {number} target
 * @param {number} limit
 * @returns {number|null}
 */
function firstArrival(alphabet, source, target, limit = 32) {
  let value = source;
  const seen = new Set([value]);
  for (let hop = 1; hop <= limit; hop += 1) {
    value = decodeToken(tokens[value], alphabet);
    if (value === target) return hop;
    if (value < 0 || value >= tokens.length || seen.has(value)) return null;
    seen.add(value);
  }
  return null;
}

/** @param {string} encoded @returns {number} */
function decodeBase29(encoded) {
  let value = 0;
  for (const ch of encoded) {
    const digit = base29Alphabet.indexOf(ch);
    assert.ok(digit >= 0);
    value = value * 29 + digit;
  }
  return value;
}

// Reproduce the p28 state values needed to lock base59 before the new receiver.
const p28Words = parseWords(physicalPart(28));
const selected = p28Words[27];
assert.deepEqual(selected, [28, 24, 10, 1, 20]);

const p28Lines = physicalPart(28).trim().split("/").filter(Boolean);
const lineNumber = 6;
const line6 = lineRunes(p28Lines[lineNumber - 1]);
assert.equal(line6.length, 23);
assert.equal(selected.length, 5);

let beforeLine6 = 0;
for (let index = 0; index < lineNumber - 1; index += 1) {
  beforeLine6 += lineRunes(p28Lines[index]).length;
}
let beforeWord28 = 0;
for (let index = 0; index < 27; index += 1) {
  beforeWord28 += p28Words[index].length;
}
const peerPublic = beforeWord28 - beforeLine6 + 1;
assert.equal(peerPublic, 19);

const p = line6.length;
const g = selected.length;
const a = lineNumber;
const A = powMod(g, a, p);
const K = powMod(peerPublic, a, p);
assert.deepEqual({p, g, a, B: peerPublic, A, K}, {p:23, g:5, a:6, B:19, A:8, K:2});

const center = selected[2];
assert.equal(corpus.translit[center], "I");
assert.equal(corpus.prime[center], 31);
const centerCoordinate = corpus.prime[center] * A + a;
assert.equal(centerCoordinate, 254);
assert.equal(tokens[centerCoordinate], "39");

const pointerStart = decodeToken(tokens[centerCoordinate], alphabet59);
const pointerEndpoint = decodeToken(tokens[centerCoordinate], alphabet60);
assert.equal(pointerStart, 186);
assert.equal(pointerEndpoint, 189);
assert.equal(firstArrival(alphabet59, pointerStart, pointerEndpoint), A);
assert.notEqual(firstArrival(alphabet60, pointerStart, pointerEndpoint), A);
assert.equal(decodeToken(tokens[pointerEndpoint], alphabet59), pointerEndpoint);

// Reproduce the independently serialized 3QO = 3301 from the p27 receiver.
const p27Words = parseWords(physicalPart(27));
let carrier = null;
let offset = 0;
for (const word of p27Words) {
  if (translit(word) === "EORNSOOCAEYEE") carrier = {word, start: offset};
  offset += word.length;
}
assert.ok(carrier);
assert.equal(carrier.start, 79);
const divinityInterior = carrier.word.slice(2, -2);
assert.equal(translit(divinityInterior), "NSOOCAEY");
assert.equal(gp0(divinityInterior), 103);
assert.equal(tokens[103], "3Q");
assert.equal(divinityInterior[a - 1], 24);
assert.equal(base29Alphabet[24], "O");

const serialized3301 = tokens[103] + base29Alphabet[divinityInterior[a - 1]];
assert.equal(serialized3301, "3QO");
const modulus = decodeBase29(serialized3301);
assert.equal(modulus, 3301);

// Independent first-party 2016 source repeats the same visible number.
assert.match(signed2016, /\n3301\n/u);

// New frozen consequence: radix59 turns 3301 into exactly physical pages 55,56.
const digits59 = twoDigits(modulus, alphabet59.length);
const digits60 = twoDigits(modulus, alphabet60.length);
assert.deepEqual(digits59, [55, 56]);
assert.deepEqual(digits60, [55, 1]);
assert.equal(alphabet59[digits59[0]] + alphabet59[digits59[1]], "uv");
assert.equal(alphabet60[digits60[0]] + alphabet60[digits60[1]], "t1");

// Finite control over every radix up through the manuscript's printed 60-symbol
// table alphabet. Only radix59 yields two adjacent valid physical LP2 pages.
const pageMax = 57;
const pagePairRadices = [];
const adjacentPagePairRadices = [];
for (let radix = 2; radix <= alphabet60.length; radix += 1) {
  const digits = twoDigits(modulus, radix);
  if (digits[0] <= pageMax && digits[1] <= pageMax) {
    pagePairRadices.push({radix, digits});
    if (Math.abs(digits[0] - digits[1]) === 1) {
      adjacentPagePairRadices.push({radix, digits});
    }
  }
}
assert.deepEqual(pagePairRadices, [
  {radix:57, digits:[57,52]},
  {radix:58, digits:[56,53]},
  {radix:59, digits:[55,56]},
  {radix:60, digits:[55,1]},
]);
assert.deepEqual(adjacentPagePairRadices, [
  {radix:59, digits:[55,56]},
]);

// The selected pair is exactly the terminal unknown/solved boundary.
const page55 = corpus.pages.find((page) => page.page === 55);
const page56 = corpus.pages.find((page) => page.page === 56);
const page57 = corpus.pages.find((page) => page.page === 57);
assert.ok(page55 && page56 && page57);
assert.deepEqual(
  [page55.indices.length, page56.indices.length, page57.indices.length],
  [76, 85, 95]
);
const solved56 = solved.sections.find((section) => section.name === "p56_an_end");
const clear57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(solved56 && clear57);
assert.match(solved56.source_text, /^ᚪᚾ•ᛖᚾᛞ/u);
assert.match(clear57.source_text, /^ᛈᚪᚱᚪᛒᛚᛖ/u);

console.log(JSON.stringify({
  status: "PASS",
  fixedInputs: {
    p28State: {p, g, a, B: peerPublic, A, K},
    base59Pointer: {
      start: pointerStart,
      endpoint: pointerEndpoint,
      requiredHops: A,
      base59Arrival: firstArrival(alphabet59, pointerStart, pointerEndpoint),
      base60Arrival: firstArrival(alphabet60, pointerStart, pointerEndpoint),
    },
    serialized: serialized3301,
    value: modulus,
  },
  newReceiver: {
    radix: 59,
    alphabetDigits: alphabet59[55] + alphabet59[56],
    pageDigits: digits59,
    pageRuneCounts: [page55.indices.length, page56.indices.length],
    page56Control: "p56_an_end",
    followingClearPage: "p57_parable",
  },
  alternateBase60: {
    digits: digits60,
    alphabetDigits: alphabet60[digits60[0]] + alphabet60[digits60[1]],
  },
  boundedRadixControl: {
    pagePairRadices,
    adjacentPagePairRadices,
  },
}, null, 2));
