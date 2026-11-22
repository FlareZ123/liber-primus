"use strict";
/**
 * Source-shaped previous-plaintext-word GP-sum autokey, exact all-29-seed test.
 *
 * A word's GP0 or GP-prime sum is a proposed key for the NEXT word:
 *   C_i = (C_(i-1) + P_i - key_previous_word) mod 29
 * The next key is the sum of that word's P_i values modulo 29.
 *
 * This is an explicit exploratory hypothesis. The signed 2016 message
 * refers to words and numbers but does not specify this cipher operation.
 * All original tests are read-only and keep printed rune words unchanged.
 *
 * SFT: node sims/lp2_previous_plainword_sum_all29_sft.cjs
 * Node.js 22, Windows-compatible CommonJS, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const original = parseLP2Words(transcript);
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);
const runeNumber = new Map(gp.runes.map((r, i) => [r, i]));

/** @param {string} text @returns {number[]} */
function numeric(text) {
  return [...text].map(r => {
    const index = runeNumber.get(r);
    assert.notEqual(index, undefined, "unknown GP29 rune");
    return index;
  });
}
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} word @param {"gp0"|"prime"} mode */
function wordKey(word, mode) {
  return mod(word.reduce((sum, c) =>
    sum + (mode === "prime" ? gp.prime[c] : c), 0));
}
/**
 * @param {number[][]} ciphertextWords
 * @param {number} seed
 * @param {"gp0"|"prime"} mode
 * @returns {number[][]}
 */
function decode(ciphertextWords, seed, mode, initialCipher = 0) {
  let key = seed, precedingCipher = initialCipher;
  return ciphertextWords.map(word => {
    const plain = word.map(c => {
      const p = mod(c - precedingCipher + key);
      precedingCipher = c;
      return p;
    });
    key = wordKey(plain, mode);
    return plain;
  });
}
/**
 * @param {number[][]} plaintextWords
 * @param {number} seed
 * @param {"gp0"|"prime"} mode
 * @returns {number[][]}
 */
function encode(plaintextWords, seed, mode) {
  let key = seed, precedingCipher = 0;
  return plaintextWords.map(word => {
    const cipher = word.map(p => {
      precedingCipher = mod(precedingCipher + p - key);
      return precedingCipher;
    });
    key = wordKey(word, mode);
    return cipher;
  });
}
/**
 * @param {number[][]} plaintextWords
 * @param {Set<string>} dictionary
 */
function score(plaintextWords, dictionary) {
  let wordHits = 0, runeHits = 0, run = 0, longestRun = 0;
  for (const w of plaintextWords) {
    if (dictionary.has(w.join(","))) {
      wordHits++;
      runeHits += w.length;
      run++;
      longestRun = Math.max(longestRun, run);
    } else run = 0;
  }
  return {wordHits, runeHits, longestRun};
}
/** @param {number[][]} ciphertextWords @param {"gp0"|"prime"} mode @param {Set<string>} dictionary */
function bestOriginal(ciphertextWords, mode, dictionary, initialCipher = 0) {
  const results = Array.from({length: 29}, (_, seed) => ({
    seed,
    ...score(decode(ciphertextWords, seed, mode, initialCipher), dictionary)
  }));
  results.sort((a,b) => b.runeHits - a.runeHits ||
    b.wordHits - a.wordHits || a.seed - b.seed);
  return results[0];
}
const sourceWords = (read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g) || []).map(encodeSourceNativeGP);
const dictionary = new Set(sourceWords.map(w => w.join(",")));
assert.equal(dictionary.size, 2482);

// The real clear p57 is the positive plaintext source. No fabricated text,
// original-cipher plaintext, or supplied inverse/key is hidden in this test.
const p57 = parseLP2Words(transcript, 57);
const nativeP57 = p57.words.filter(w =>
  w.startPage === 56 && w.endPage === 56).map(w => numeric(w.runes));
assert.equal(nativeP57.length, 20);
assert.deepEqual(nativeP57.flat(), gp.pages[57].indices);
for (const mode of ["gp0", "prime"]) {
  const plant = encode(nativeP57, 17, mode);
  assert.deepEqual(decode(plant, 17, mode), nativeP57,
    "original GP p57 full-word positive");
  assert.deepEqual(encode(decode(plant, 17, mode), 17, mode), plant,
    "forward reencryption must reproduce every cipher rune");
}
/** Find the original immediate ciphertext predecessor of a page-local complete-word window. */
function originalPredecessor(page, ciphertextWords) {
  const printed = gp.pages[page].indices;
  const prefix = ciphertextWords.slice(0, Math.min(4, ciphertextWords.length)).flat();
  for (let i = 0; i + prefix.length <= printed.length; i++) {
    if (prefix.every((c, j) => c === printed[i + j])) {
      return {runeOffset:i, cipher:i > 0 ? printed[i - 1] : 0};
    }
  }
  throw new Error("original page-local word prefix not found: p" + page);
}
const scopes = [
  {name:"p0-black-complete-words", page:0, skip:2},
  {name:"p8-black-complete-words", page:8, skip:2},
  {name:"p55-complete-words", page:55, skip:0}
];
const scopeResults = scopes.map(scope => {
  const words = original.words.filter(w =>
    w.startPage === (scope.page >= 50 ? scope.page - 1 : scope.page) &&
    w.endPage === (scope.page >= 50 ? scope.page - 1 : scope.page))
    .slice(scope.skip).map(w => numeric(w.runes));
  assert(words.length > 10);
  const predecessor = originalPredecessor(scope.page, words);
  const output = {
    scope:scope.name, words:words.length,
    runes:words.flat().length,
    firstRuneOffset:predecessor.runeOffset,
    gp0:bestOriginal(words,"gp0",dictionary,predecessor.cipher),
    prime:bestOriginal(words,"prime",dictionary,predecessor.cipher),
    pageReset: {
      gp0:bestOriginal(words,"gp0",dictionary,0),
      prime:bestOriginal(words,"prime",dictionary,0)
    }
  };
  assert(output.gp0.runeHits < 15 && output.prime.runeHits < 15,
    "new source lexical evidence requires investigation");
  return output;
});
const pageResults = [];
for (let p = 0; p <= 55; p++) {
  if (p === 50) continue;
  const offset = p >= 50 ? p - 1 : p;
  const words = original.words.filter(w => w.startPage === offset &&
    w.endPage === offset).map(w => numeric(w.runes));
  if (!words.length) continue;
  const predecessor = originalPredecessor(p, words);
  pageResults.push({
    page:p, words:words.length, runes:words.flat().length,
    gp0:bestOriginal(words, "gp0", dictionary, predecessor.cipher),
    prime:bestOriginal(words, "prime", dictionary, predecessor.cipher)
  });
}
assert.equal(pageResults.length, 55);
const strongest = mode => pageResults.slice()
  .sort((a,b) => b[mode].runeHits / b.runes -
    a[mode].runeHits / a.runes).slice(0, 5)
  .map(({page,words,runes,...scores}) => ({page,words,runes,...scores[mode]}));
const report = {
  status:"No recovered LP2 plaintext or authentic cipher",
  wordKeyHypotheses:["gp0 of preceding plaintext word",
    "GP prime sum of preceding plaintext word"],
  originalWords:original.words.length,
  originalRunes:original.runeCount,
  originalCrossPageWords:original.crossPageWords,
  candidateInitialKeys:29,
  dictionaryDistinctNativeGPWords:dictionary.size,
  positive:"20 original clear p57 words, 95 runes, exact in both modes",
  originalScopes:scopeResults,
  strongestPages:{
    gp0:strongest("gp0"), prime:strongest("prime")
  },
  limitation:"Word-sum and predecessor-cipher shift are conjectural; this excludes only the two fully specified one-stage models under the source-native lexical test."
};
console.log(JSON.stringify(report,null,2));
