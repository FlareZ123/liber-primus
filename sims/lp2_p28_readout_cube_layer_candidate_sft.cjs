"use strict";

/**
 * P28 center + word28 GP29 cube-layer READ OUT candidate.
 *
 * This is a candidate unknown-page plaintext recovery. The source-selected
 * p28 object and DH23 state pre-exist this test. The lexicon census is a
 * post-discovery family control, not an authorship p-value.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number} page
 * @returns {string}
 */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {Array<{start:number,values:number[]}>}
 */
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
        words.push({ start, values: current });
        current = [];
      }
    }
  }
  if (current.length) words.push({ start, values: current });
  return words;
}

/**
 * @param {string} text
 * @returns {number[]}
 */
function allRunes(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/**
 * @param {string[]} words
 * @param {number} minimumLength
 * @returns {Set<string>}
 */
function makeLexicon(words, minimumLength) {
  return new Set(
    words
      .map((word) => word.toLowerCase())
      .filter((word) => /^[a-z]+$/u.test(word) && word.length >= minimumLength)
  );
}

/**
 * @param {string} text
 * @param {Set<string>} lexicon
 * @returns {string[][]}
 */
function oneOrTwoWordParses(text, lexicon) {
  const out = [];
  if (lexicon.has(text)) out.push([text]);
  for (let cut = 3; cut <= text.length - 3; cut += 1) {
    const left = text.slice(0, cut);
    const right = text.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) out.push([left, right]);
  }
  return out;
}

// Existing p28 source selection and DH23 state.
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
assert.equal(modPow(A, b, p), K);

// The GP29 cube bridge.
const cubeExponent = g - K;
assert.equal(cubeExponent, 3);
assert.equal(a / K, cubeExponent);
assert.equal(modPow(K, cubeExponent, 29), A);
assert.equal(modPow(A, cubeExponent, 29), B);
assert.equal(modPow(B, cubeExponent, 29), b);

const p28Words = parseWords(physicalPart(28));
const p28Runes = allRunes(physicalPart(28));
assert.equal(p28Words.length, 59);
assert.equal(p28Runes.length, 269);
const centerOffset = (p28Runes.length - 1) / 2;
assert.equal(centerOffset, 134);

const selected = p28Words[27];
assert.deepEqual(selected, {
  start: 135,
  values: [28, 24, 10, 1, 20],
});
assert.equal(selected.start, centerOffset + 1);

// A single rune has one layer. The selected five-rune word has three nested
// layers: outer pair, inner pair, center. Apply the cube map once per layer.
const centerLayers = 1;
const wordLayers = Math.ceil(selected.values.length / 2);
assert.equal(wordLayers, 3);

const centerExponent = modPow(cubeExponent, centerLayers, 28);
const wordExponent = modPow(cubeExponent, wordLayers, 28);
assert.equal(centerExponent, 3);
assert.equal(wordExponent, 27);
assert.equal(A + B, wordExponent);

const sourceSpan = [p28Runes[centerOffset], ...selected.values];
assert.deepEqual(sourceSpan, [9, 28, 24, 10, 1, 20]);
assert.equal(translit(sourceSpan), "NEAAIUL");

const decoded = [
  modPow(sourceSpan[0], centerExponent, 29),
  ...sourceSpan.slice(1).map((value) => modPow(value, wordExponent, 29)),
];
assert.deepEqual(decoded, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(decoded), "READOUT");

// Exact inversion to the six original ciphertext runes.
const inverseCenterExponent = 19;
const inverseWordExponent = 27;
assert.equal((centerExponent * inverseCenterExponent) % 28, 1);
assert.equal((wordExponent * inverseWordExponent) % 28, 1);
const reconstructed = [
  modPow(decoded[0], inverseCenterExponent, 29),
  ...decoded.slice(1).map((value) => modPow(value, inverseWordExponent, 29)),
];
assert.deepEqual(reconstructed, sourceSpan);

// Build the same finite native-English register already used elsewhere in the
// repository. Restrict phrase words to at least three Latin letters.
const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon = makeLexicon(dictionaryWords, 3);

// Broad post-discovery family control: every five-rune unknown-page word with
// an actual predecessor rune gets exactly the same transform.
const phraseHits = [];
let fiveRuneWords = 0;
let eligibleWithPredecessor = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  const runes = allRunes(physicalPart(page));
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.values.length !== 5) continue;
    fiveRuneWords += 1;
    if (word.start === 0) continue;
    eligibleWithPredecessor += 1;

    const output = [
      modPow(runes[word.start - 1], 3, 29),
      ...word.values.map((value) => modPow(value, 27, 29)),
    ];
    const latin = translit(output).toLowerCase();
    const parses = oneOrTwoWordParses(latin, lexicon);
    if (parses.length) {
      phraseHits.push({
        page,
        word: index + 1,
        start: word.start,
        latin,
        parses,
      });
    }
  }
}

assert.equal(fiveRuneWords, 318);
assert.equal(eligibleWithPredecessor, 314);
assert.deepEqual(phraseHits, [{
  page: 28,
  word: 28,
  start: 135,
  latin: "readout",
  parses: [["read", "out"]],
}]);

console.log(JSON.stringify({
  status: "PASS",
  source: {
    page: 28,
    centerOffset,
    centerRune: corpus.translit[sourceSpan[0]],
    selectedWord: 28,
    selectedStart: selected.start,
    selectedRunes: translit(selected.values),
    sourceSpan: translit(sourceSpan),
  },
  dh23: { p, g, a, b, A, B, K },
  transform: {
    cubeExponent,
    centerLayers,
    centerExponent,
    wordLayers,
    wordExponent,
    decoded: translit(decoded),
    exactReconstruction: translit(reconstructed),
  },
  postDiscoveryFamilyControl: {
    fiveRuneWords,
    eligibleWithPredecessor,
    phraseHits,
  },
  classification:
    "candidate unknown-page plaintext; requires an independently untouched downstream prediction before promotion to established decryption",
}, null, 2));
