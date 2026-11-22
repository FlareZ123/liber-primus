"use strict";
/**
 * All-secret full-word GP29 integer affine cipher obstruction.
 *
 * Each original complete printed word has length L and BASE29 integer N.
 * Even if every L has its own UNKNOWN a_L and b_L (gcd(a_L,29)=1),
 * a fixed-width modular affine operation
 *    C = (a_L P + b_L) mod 29^L
 * leaves the word's final GP rune an affine-permuted symbol modulo29.
 * It therefore PRESERVES every per-length terminal-rune frequency count,
 * including the sum of the four largest counts. The union over L yields
 * a complete key-independent bound on plaintext word-final statistics.
 *
 * Node.js 22 CommonJS Windows 11 SFT; read-only; no packages.
 *   node sims/lp2_base29_wordinteger_affine_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const text = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
const original = text.words.map(word => [...word.runes].map(rune => {
  const n = alphabet.get(rune);
  assert.notEqual(n, undefined);
  return n;
}));
assert.equal(original.length, 2896);
assert.equal(text.runeCount, 12956);
assert.equal(text.crossPageWords, 32);
assert.deepEqual(original.flat(),
  corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices));

/** @param {number[]} a @returns {bigint} */
function wordNumber(a) {
  return a.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}

/** @param {bigint} n @param {number} length @returns {number[]} */
function wordDigits(n, length) {
  const mod = 29n ** BigInt(length);
  n = ((n % mod) + mod) % mod;
  const result = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    result[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return result;
}

/**
 * @param {number[][]} words
 * @returns {{top4AllLengthUpper:number, perLength:Array<{length:number,words:number,top4:number}>}}
 */
function finalRuneAllSecretBound(words) {
  const grouped = new Map();
  for (const word of words) {
    const arr = grouped.get(word.length) || [];
    arr.push(word.at(-1));
    grouped.set(word.length, arr);
  }
  const perLength = [...grouped].sort((a, b) => a[0] - b[0])
    .map(([length, symbols]) => {
      const hist = Array(29).fill(0);
      for (const symbol of symbols) hist[symbol]++;
      return {
        length, words: symbols.length,
        top4: hist.sort((a, b) => b - a).slice(0, 4)
          .reduce((s, n) => s + n, 0)
      };
    });
  return {
    top4AllLengthUpper: perLength.reduce((s, row) => s + row.top4, 0),
    perLength
  };
}

/** @param {number[][]} words */
function observedTop4Last(words) {
  const hist = Array(29).fill(0);
  for (const word of words) hist[word.at(-1)]++;
  return hist.sort((a, b) => b - a).slice(0, 4)
    .reduce((s, n) => s + n, 0);
}

const source = finalRuneAllSecretBound(original);
assert.equal(source.top4AllLengthUpper, 609);
assert.deepEqual(source.perLength.map(row => row.top4),
  [20, 82, 130, 104, 71, 51, 50, 38, 19, 17, 12, 8, 4, 3]);
assert.deepEqual(source.perLength.map(row => row.words),
  [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);

// Source-native plaintext construction, sharing the exact source letter ->
// GP rune spelling with older GP-native positive-control SFTs.
const tokenizer = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} originalWord @returns {number[]} */
function nativeGPWord(originalWord) {
  const word = originalWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {result.push(21); i += 3;}
    else if (word.startsWith("IO", i)) {result.push(27); i += 2;}
    else {
      const hit = tokenizer.find(entry => word.startsWith(entry.token, i));
      assert.ok(hit, "unmapped GP source word: " + word);
      result.push(hit.index);
      i += hit.token.length;
    }
  }
  return result;
}

/** @param {string} reference @returns {number[][]} */
function matchedNativeWords(reference) {
  const grouped = new Map();
  for (const word of reference.toUpperCase().match(/[A-Z]+/g) || []) {
    const runes = nativeGPWord(word);
    const target = grouped.get(runes.length) || [];
    target.push(runes);
    grouped.set(runes.length, target);
  }
  const native = original.map((word, i) => {
    const candidates = grouped.get(word.length);
    assert.ok(candidates && candidates.length, "missing source word width");
    return candidates[i % candidates.length];
  });
  assert.deepEqual(native.map(word => word.length),
    original.map(word => word.length));
  return native;
}

/**
 * A planted complete affine cipher with multiplier 2, genuinely carrying
 * across BASE29 digits. Since all 29^L moduli are odd,
 * inverse(2) = (29^L+1)/2 without a library or guessed key.
 *
 * @param {number[][]} native
 * @param {string} name
 */
function verifyNativePlant(native, name) {
  const encrypted = native.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const offset = (3301n ** BigInt(L) + 1033n * BigInt(L)) % modulus;
    return wordDigits(2n * wordNumber(word) + offset, L);
  });
  const recovered = encrypted.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const offset = (3301n ** BigInt(L) + 1033n * BigInt(L)) % modulus;
    const inv2 = (modulus + 1n) / 2n;
    assert.equal(2n * inv2 % modulus, 1n);
    return wordDigits(inv2 * (wordNumber(word) - offset), L);
  });
  assert.deepEqual(recovered, native);

  const before = finalRuneAllSecretBound(native);
  const after = finalRuneAllSecretBound(encrypted);
  assert.deepEqual(after.perLength.map(row => row.top4),
    before.perLength.map(row => row.top4));
  assert(before.top4AllLengthUpper > source.top4AllLengthUpper);
  const lastFour = observedTop4Last(native);
  assert(lastFour <= before.top4AllLengthUpper);
  assert(lastFour > source.top4AllLengthUpper);
  return {
    source: name, words: native.length,
    nativeFourMostCommonFinalRunes: lastFour,
    nativePerLengthSumTop4: before.top4AllLengthUpper,
    encryptedPerLengthSumTop4: after.top4AllLengthUpper,
    exactPlantRecovery: "2896/2896"
  };
}

const nativeControls = [
  verifyNativePlant(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  verifyNativePlant(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(nativeControls.map(x => x.nativeFourMostCommonFinalRunes),
  [1547, 1553]);

// Small-n source-independent proof control: enumerate 29×29 single-digit
// affine keys and assert every nonzero slope permutes all 29 GP symbols.
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const vals = Array.from({length:29}, (_, x) => (a*x+b)%29);
    assert.equal(new Set(vals).size,29);
  }
}

console.log(JSON.stringify({
  original: {
    completeWords: original.length, sourceRunes: text.runeCount,
    acrossPageWords: text.crossPageWords,
    originalFourMostCommonFinalRunes: observedTop4Last(original),
    maximumFourFinalRuneSymbolsUnderArbitrarySecretAffineKeysByLength:
      source.top4AllLengthUpper,
    perLength: source.perLength
  },
  nativeControls,
  affineAlphabetBijectionControls: "812/812 (a 1..28, b 0..28)",
  conclusion: "An invertible whole-word BASE29 modular affine integer cipher with ANY unknown a_L,b_L for each source word length preserves last-rune top-four counts per length. Original bound609; source-native matched Gibran/Shakespeare >1547. Not a native-GP English plaintext channel. No unknown LP2 plaintext/key recovered."
}, null, 2));
