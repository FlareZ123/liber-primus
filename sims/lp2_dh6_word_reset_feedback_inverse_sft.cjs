"use strict";

// Test whether the signed-2013 DH6 affine echo is a complete word-reset
// additive-feedback cipher when initialized from two source-derived
// six-symbol candidates. This is not the sparse collision-repair model.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const {words, runeCount, crossPageWords} = parseSharedCorpus();
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translit = corpus.translit;
const mod29 = (n) => ((n % 29) + 29) % 29;

const seeds = {
  // Original p3 and p39 red spans concatenated in page order.
  redTriads: [13, 23, 2, 27, 5, 15],
  // 2013 signed DH example in protocol order: p, g, A, B, K, x.
  dhTuple: [23, 5, 8, 19, 2, 6]
};

function encryptWord(plain, seed) {
  const cipher = [];
  for (let j = 0; j < plain.length; j++) {
    const state = j < 6 ? seed[j] : cipher[j - 6];
    cipher.push(mod29(plain[j] + 24 - 2 * state));
  }
  return cipher;
}

function decryptWord(cipher, seed) {
  return cipher.map((value, j) => {
    const state = j < 6 ? seed[j] : cipher[j - 6];
    return mod29(value - 24 + 2 * state);
  });
}

function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

function decode(seed) {
  const decodedWords = words.map(({runes}) => {
    const cipher = [...runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined, "Unknown rune in shared corpus");
      return value;
    });
    return decryptWord(cipher, seed);
  });
  const flat = decodedWords.flat();
  const sampleWords = decodedWords.slice(0, 12)
    .map((word) => word.map((value) => translit[value]).join(""));
  return {
    seed,
    ioc: indexOfCoincidence(flat),
    zeroRunes: flat.filter((value) => value === 0).length,
    sampleWords
  };
}

function countLag6Echoes() {
  let eligible = 0;
  let matches = 0;
  for (const {runes} of words) {
    const cipher = [...runes].map((rune) => runeIndex.get(rune));
    for (let j = 6; j < cipher.length; j++) {
      eligible++;
      if (cipher[j] === mod29(24 - 2 * cipher[j - 6])) matches++;
    }
  }
  return {eligible, matches};
}

// Algebraic implementation control: both seeds must round-trip a known vector.
const testPlain = Array.from({length: 37}, (_, i) => (7 * i + 11) % 29);
for (const seed of Object.values(seeds)) {
  assert.deepEqual(decryptWord(encryptWord(testPlain, seed), seed), testPlain);
}

assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
const echo = countLag6Echoes();
assert.deepEqual(echo, {eligible: 1290, matches: 80});

const results = Object.fromEntries(
  Object.entries(seeds).map(([name, seed]) => [name, decode(seed)])
);
console.log(JSON.stringify({
  model: "C[w,j] = P[w,j] + 24 - 2*S[w,j] mod29; S=seed[j] for j<6 else C[w,j-6]",
  corpus: {words: words.length, runes: runeCount, crossPageWords},
  lag6Echo: echo,
  uniformBaseline: 1 / 29,
  results
}, null, 2));
