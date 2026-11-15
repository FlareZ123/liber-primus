"use strict";

/**
 * One-file source test for the historical 2016 signed MEANING word and the
 * previously established repeated LP2 terminal two-word phrase DJU BEI.
 * This is a provisional navigation cross-link, not a decryption.
 *
 * Input artifacts are all original-source references already in resources/.
 * There are no file writes, invented rune spellings, or fitted cipher keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus, physicalLP2Page } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedClear = signed.replace(/\r\n?/g, "\n")\n  .split("\n\n").slice(1).join("\n\n")
  .split("-----BEGIN PGP SIGNATURE-----")[0];
assert.match(signedClear, /their\s+meaning is the road, and their numbers are the direction/i);

const { words, runeCount, crossPageWords } = parseSharedCorpus();
assert.deepEqual([words.length, runeCount, crossPageWords], [2896, 12956, 32]);

const gpByRune = new Map(corpus.runes.map((r, i) => [r, i]));
const prime = corpus.prime;
/** @param {number[]} indices @param {number[]} [p] @returns {number} */
function primeSum(indices, p = prime) {
  return indices.reduce((acc, idx) => acc + p[idx], 0);
}
/** @param {string} runes @returns {number[]} */
function runeIndices(runes) {
  return [...runes].map(rune => {
    assert(gpByRune.has(rune));
    return gpByRune.get(rune);
  });
}
const pair = words.slice(-2);
const previous = words[words.length - 3];
assert.deepEqual(pair.map(w => w.runes), ["ᛞᛄᚢ", "ᛒᛖᛁ"]);
assert.equal(previous.runes, "ᚳᛠᛁᛗᚳᛉ");
assert.equal(physicalLP2Page(pair[0].startPage), 55);

const pairIndices = runeIndices(pair.map(w => w.runes).join(""));
assert.deepEqual(pairIndices, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(pair.map(w => primeSum(runeIndices(w.runes))), [129, 159]);
const terminalTwo = primeSum(pairIndices);
const terminalThree = terminalTwo + primeSum(runeIndices(previous.runes));
assert.deepEqual([terminalTwo, terminalThree], [288, 572]);
assert.deepEqual([terminalTwo % 58, Math.floor(terminalTwo / 58)], [56, 4]);
assert.deepEqual([terminalThree % 58, Math.floor(terminalThree / 58)], [50, 9]);
const p50Cell = grid.pages.find(x => x.page === 50).tokens[9];
assert.equal(p50Cell, "3e");
// Reading the isolated token as hexadecimal 0x3e => '>' is only a conjecture.
// The whole grid uses a 60-symbol alphabet and is not a hexadecimal document.
const at56 = corpus.pages[56];
assert.equal(at56.indices.length, 85);
assert.deepEqual(at56.indices.slice(12, 16), [5, 2, 6, 7]); // C,TH,G,W
const meaningIndices = [19, 28, 9, 21]; // M, EA, N, ING (source-attested ᛝ)
const meaningSum = primeSum(meaningIndices);
assert.equal(meaningSum, 288);
assert.equal(meaningSum, terminalTwo);

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * The source-attested ING ligature is a legitimate alternate spelling;
 * preserve canonical GP longest-token parsing as the other variant.
 * @param {string} word
 * @param {boolean} useIng
 * @returns {number[]}
 */
function encodeSigned(word, useIng) {
  const normalized = word.toLowerCase().replaceAll("v", "u")
    .replaceAll("k", "c").replaceAll("z", "s");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (useIng && normalized.startsWith("ing", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    const found = alphabet.find(x => normalized.startsWith(x.token, i));
    assert(found, "Unencodable signed word: " + word);
    out.push(found.index);
    i += found.token.length;
  }
  return out;
}
assert.deepEqual(encodeSigned("meaning", true), meaningIndices);
const sourceWords = [...signedClear.matchAll(/\b[A-Za-z]+\b/gu)].map(m => m[0]);
assert.equal(sourceWords.length, 43);
const sourceTokenizations = [...new Map(
  sourceWords.flatMap(word => [false, true].map(useIng => {
    const indices = encodeSigned(word, useIng);
    return [indices.join(","), indices];
  }))
).values()];
assert.equal(sourceTokenizations.length, 35);

/**
 * Wrong-alphabet control. Preserve exactly the source phrase and all signed
 * words, while permuting all 29 original GP prime weights as a group.
 * The any-word rate includes the source-selected ING spelling alternative.
 */
let seed = 0x3301288;
/** @returns {number} */
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const shuffled = prime.slice();
const trials = 300000;
let meaningHits = 0;
let anySignedHits = 0;
for (let z = 0; z < trials; z++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rand32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const target = primeSum(pairIndices, shuffled);
  if (target === primeSum(meaningIndices, shuffled)) meaningHits++;
  if (sourceTokenizations.some(indices => primeSum(indices, shuffled) === target))
    anySignedHits++;
}
assert.equal(meaningHits, 838);
assert.equal(anySignedHits, 22977);

console.log(JSON.stringify({
  status: "Exploratory first-party signed-word/terminal-pair numeric bridge; no plaintext/key",
  terminal_2_word_sum: terminalTwo,
  signed_2016_meaning_gp: "M-EA-N-ING",
  signed_2016_meaning_sum: meaningSum,
  terminal_2_base58: { page: 56, word: 4, known_plaintext: "DEEP" },
  terminal_3_word_sum: terminalThree,
  terminal_3_base58: { page: 50, token: 9, printed: p50Cell,
    caution: "The page50 token extension and hexadecimal interpretation lack an authenticated selector" },
  wrong_alphabet_control: {
    trials, fixed_word_exact_matches: meaningHits,
    fixed_word_rate: meaningHits / trials,
    any_signed_word_matches: anySignedHits,
    familywise_rate: anySignedHits / trials,
    scope: "29 permuted prime assignments, 43 signed words, canonical/ING variants"
  }
}, null, 2));
