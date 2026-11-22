"use strict";

/**
 * P28 READ OUT reversible-exponent family audit.
 *
 * The source boundary is frozen before this audit:
 *   center rune offset134 + selected p28 word28 offsets135..139.
 *
 * Charge the main remaining arithmetic freedom by exhausting every reversible
 * GP29 power map x -> x^e on the center and every reversible power map on the
 * five-rune word. Reversible exponents are exactly gcd(e,28)=1.
 *
 * The audit reports every one/two-word English-register hit at that exact
 * boundary and identifies the source-derived (3,27) READ OUT member.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
function allRunes(text) {
  return [...text]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

/** @param {string} text */
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
      if (current.length > 0) {
        words.push({ start, values: current });
        current = [];
      }
    }
  }
  if (current.length > 0) words.push({ start, values: current });
  return words;
}

/** @param {string[]} words @param {number} minimumLength */
function makeLexicon(words, minimumLength) {
  return new Set(
    words
      .map((word) => word.toLowerCase())
      .filter((word) => /^[a-z]+$/u.test(word) && word.length >= minimumLength)
  );
}

/** @param {string} value @param {Set<string>} lexicon */
function parses(value, lexicon) {
  const out = [];
  if (lexicon.has(value)) out.push([value]);
  for (let cut = 3; cut <= value.length - 3; cut += 1) {
    const left = value.slice(0, cut);
    const right = value.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) out.push([left, right]);
  }
  return out;
}

const p28 = parts[28];
const runes = allRunes(p28);
const words = parseWords(p28);
assert.equal(runes.length, 269);
assert.equal(words.length, 59);
assert.equal((runes.length - 1) / 2, 134);
assert.deepEqual(words[27], {
  start: 135,
  values: [28, 24, 10, 1, 20],
});

const source = [runes[134], ...words[27].values];
assert.deepEqual(source, [9, 28, 24, 10, 1, 20]);

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

const reversibleExponents = [];
for (let exponent = 1; exponent < 28; exponent += 1) {
  if (gcd(exponent, 28) === 1) reversibleExponents.push(exponent);
}
assert.deepEqual(
  reversibleExponents,
  [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27]
);

const hits = [];
for (const centerExponent of reversibleExponents) {
  for (const wordExponent of reversibleExponents) {
    const output = [
      modPow(source[0], centerExponent, 29),
      ...source
        .slice(1)
        .map((value) => modPow(value, wordExponent, 29)),
    ];
    const latin = translit(output).toLowerCase();
    const wordParses = parses(latin, lexicon);
    if (wordParses.length > 0) {
      hits.push({
        centerExponent,
        wordExponent,
        latin,
        parses: wordParses,
      });
    }
  }
}

const readOut = hits.find(
  (hit) =>
    hit.centerExponent === 3 &&
    hit.wordExponent === 27 &&
    hit.latin === "readout"
);
assert.ok(readOut);
assert.deepEqual(readOut.parses, [["read", "out"]]);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      source: {
        page: 28,
        centerOffset: 134,
        selectedWord: 28,
        source: translit(source),
      },
      family: {
        reversibleExponents,
        combinations: reversibleExponents.length ** 2,
        phraseHits: hits.length,
        hits,
      },
      sourceDerivedCandidate: readOut,
      interpretation:
        "This charges all 144 reversible center/word power-map pairs at the frozen p28 boundary. It is an arithmetic-family audit of READ OUT, not an authorship p-value.",
    },
    null,
    2
  )
);
