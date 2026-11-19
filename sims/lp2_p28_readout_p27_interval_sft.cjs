"use strict";

/**
 * READ OUT downstream p27 interval holdout.
 *
 * Reconstructs the p28 READ OUT candidate from the already selected cube-layer
 * rule, then consumes its two GP0 word sums through the existing p50/base59
 * navigation grammar on independently selected p27.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {string} text @returns {Array<{start:number,end:number,values:number[]}>} */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      if (current.length) {
        words.push({ start, end: offset - 1, values: current });
        current = [];
      }
    }
  }
  if (current.length) words.push({ start, end: offset - 1, values: current });
  return words;
}

/** @param {string} text @returns {number[]} */
function allRunes(text) {
  return [...text].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

// Reconstruct the exact p28 candidate.
const p = 23;
const g = 5;
const a = 6;
const B = 19;
const b = 15;
const A = 8;
const K = 2;
assert.equal(modPow(g, a, p), A);
assert.equal(modPow(g, b, p), B);
assert.equal(modPow(B, a, p), K);

const cubeExponent = g - K;
assert.equal(cubeExponent, 3);
const p28Runes = allRunes(physicalPart(28));
const p28Words = parseWords(physicalPart(28));
const center = 134;
const selected = p28Words[27];
assert.equal(selected.start, 135);
assert.deepEqual(selected.values, [28, 24, 10, 1, 20]);
const sourceSpan = [p28Runes[center], ...selected.values];
const decoded = [
  modPow(sourceSpan[0], 3, 29),
  ...sourceSpan.slice(1).map((value) => modPow(value, 27, 29)),
];
assert.deepEqual(decoded, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(decoded), "READOUT");

const readWord = decoded.slice(0, 3);
const outWord = decoded.slice(3);
assert.equal(translit(readWord), "READ");
assert.equal(translit(outWord), "OUT");
const readGp0 = gp0(readWord);
const outGp0 = gp0(outWord);
assert.equal(readGp0, 55);
assert.equal(outGp0, 20);

// Consume both words through the already established GP0 -> p50 -> base59 state.
const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.alphabet;
const base59 = base60.replace("f", "");
const readToken = tokens[readGp0];
const outToken = tokens[outGp0];
assert.equal(readToken, "1K");
assert.equal(outToken, "1g");
const start59 = decodeToken(readToken, base59);
const end59 = decodeToken(outToken, base59);
const start60 = decodeToken(readToken, base60);
const end60 = decodeToken(outToken, base60);
assert.equal(start59, 79);
assert.equal(end59, 100);
assert.equal(start60, 80);
assert.equal(end60, 102);

// On independently selected p27, base59 gives exact complete-word boundaries.
const p27Words = parseWords(physicalPart(27));
const p27Runes = allRunes(physicalPart(27));
const first59 = p27Words.findIndex((word) => word.start === start59);
const last59 = p27Words.findIndex((word) => word.end === end59);
assert.equal(first59 + 1, outGp0); // OUT=20 selects word20.
assert.equal(last59 + 1, 24);
const selectedWords = p27Words.slice(first59, last59 + 1);
assert.equal(selectedWords.length, g);
assert.equal(end59 - start59 + 1, p - 1);
assert.deepEqual(selectedWords.map((word) => word.values.length), [12, 2, 2, 3, 3]);
const receiver = p27Runes.slice(start59, end59 + 1);
assert.equal(receiver.length, 22);
assert.equal(translit(receiver), "EORNSOOCAEYEETRUYOEJXEAGNG");

// Base60 cuts words at both ends on p27.
assert.equal(p27Words.some((word) => word.start === start60), false);
assert.equal(p27Words.some((word) => word.end === end60), false);

// Full source census for the fixed endpoints. p27 is the only base59 page whose
// 79..100 interval is complete-word bounded and contains exactly g=5 words.
const base59BoundaryHits = [];
const base60BoundaryHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));

  const s59 = words.findIndex((word) => word.start === start59);
  const e59 = words.findIndex((word) => word.end === end59);
  if (s59 >= 0 && e59 >= s59) {
    base59BoundaryHits.push({
      page,
      firstWord: s59 + 1,
      lastWord: e59 + 1,
      wordCount: e59 - s59 + 1,
    });
  }

  const s60 = words.findIndex((word) => word.start === start60);
  const e60 = words.findIndex((word) => word.end === end60);
  if (s60 >= 0 && e60 >= s60) {
    base60BoundaryHits.push({
      page,
      firstWord: s60 + 1,
      lastWord: e60 + 1,
      wordCount: e60 - s60 + 1,
    });
  }
}
assert.deepEqual(
  base59BoundaryHits.filter((row) => row.wordCount === g),
  [{ page: 27, firstWord: 20, lastWord: 24, wordCount: 5 }]
);

// Minimal receiver tests. The source-selected interval does not become prose
// under one cube, inverse cube, or the already used per-word layer-count rule.
const cube = receiver.map((value) => modPow(value, 3, 29));
const inverseCube = receiver.map((value) => modPow(value, 19, 29));
const layerDecoded = selectedWords.flatMap((word) => {
  const layers = Math.ceil(word.values.length / 2);
  const exponent = modPow(3, layers, 28);
  return word.values.map((value) => modPow(value, exponent, 29));
});
assert.equal(translit(cube), "BGRJIAIANLOTHOOWGUTHCYEEAPI");
assert.equal(translit(inverseCube), "BNCMEEOEWXJXXDNUJPSIEARIA");
assert.equal(translit(layerDecoded), "EORNSOOCAEYEEWGUTHNTHOEAOEX");

console.log(JSON.stringify({
  status: "PASS",
  readOut: {
    decoded: translit(decoded),
    READ: { gp0: readGp0, token: readToken, base59: start59, base60: start60 },
    OUT: { gp0: outGp0, token: outToken, base59: end59, base60: end60 },
  },
  p27Receiver: {
    page: 27,
    start: start59,
    end: end59,
    runes: receiver.length,
    groupOrder: p - 1,
    firstWord: first59 + 1,
    lastWord: last59 + 1,
    wordCount: selectedWords.length,
    generator: g,
    wordLengths: selectedWords.map((word) => word.values.length),
    ciphertext: translit(receiver),
  },
  controls: {
    base59BoundaryHits,
    base59FiveWordHits: base59BoundaryHits.filter((row) => row.wordCount === g),
    base60BoundaryHits,
    p27Base60CutsBothEnds: true,
    directCube: translit(cube),
    inverseCube: translit(inverseCube),
    wordLayerCube: translit(layerDecoded),
  },
  interpretation:
    "READ OUT passes an untouched downstream structural holdout: under the already selected base59 GP0/p50 grammar it brackets p27 offsets79..100, exactly five complete words and 22=p-1 runes, starting at word20=GP0(OUT). The interval is a source-selected receiver; the minimal cube consumers remain nonprose.",
}, null, 2));
