"use strict";

/**
 * All-secret wordwise GP29 predecessor-difference invariant.
 *
 * Word model for each j >= 1:
 * C[w,j] = a[w] * (f(P[w,j]) - f(P[w,j-1])) + b[w] (mod 29)
 * for ANY a[w] in GF(29)*, b[w] in GF(29) and unconstrained C[w,0].
 *
 * Direct GP ordinal and GP prime-residue difference cases are included.
 * GP prime totient produces exactly the same differences as GP prime.
 *
 * No library dependencies; original repository source-only operation.
 * Run from repository root: node sims/lp2_word_prime_difference_affine_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const native = parseSharedCorpus();
const map = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = corpus.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
const MOD = 29;
const mod = (v) => (v % MOD + MOD) % MOD;
const inverse = Array(MOD).fill(0);
for (let x = 1; x < MOD; x++)
  for (let y = 1; y < MOD; y++)
    if (x * y % MOD === 1) inverse[x] = y;

/** @param {string} runes @returns {number[]} */
function runeIndices(runes) {
  return [...runes].map((ch) => {
    assert.ok(map.has(ch), "unknown rune in original input");
    return map.get(ch);
  });
}
const original = native.words.map((w) => runeIndices(w.runes));
assert.equal(original.length, 2896);
assert.equal(original.reduce((s, w) => s + w.length, 0), 12956);

/**
 * GP digraph tokenization; permissive uses simple historical approximations
 * V -> U, Q/K -> C, Z -> S. Both codecs are tested separately.
 * @param {string} word
 * @param {boolean} permissive
 * @returns {number[]|null}
 */
function englishToGP(word, permissive) {
  if (permissive) word = word.replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    const found = tokens.find((x) => word.startsWith(x.t, i));
    if (!found) return null;
    out.push(found.i);
    i += found.t.length;
  }
  return out;
}

/**
 * Complete affine-shape invariant over F29 for a sequence of >=1 symbols:
 * records first nonequal anchor and normalizes its delta to 1.
 * Translation and nonzero scaling produce the identical string.
 * @param {number[]} values
 * @returns {string}
 */
function affineSignature(values) {
  assert.ok(values.length);
  const base = values[0];
  const pivot = values.findIndex((v, j) => j > 0 && v !== base);
  if (pivot < 0) return values.length + ":constant";
  const scale = inverse[mod(values[pivot] - base)];
  return values.length + ":" + pivot + ":" +
    values.map((v) => mod((v - base) * scale)).join(",");
}

/**
 * Native-English candidate differences, discarding their unknown affine key.
 * @param {number[]} word
 * @param {(x:number)=>number} f
 * @returns {string}
 */
function plaintextSignature(word, f) {
  return affineSignature(word.slice(1).map((v, j) =>
    mod(f(v) - f(word[j]))));
}

/** @param {number[]} ciphertext @returns {string} */
function cipherSignature(ciphertext) {
  return affineSignature(ciphertext.slice(1));
}

/**
 * Genuine encoding with independent arbitrary affine key per word; the
 * word's first ciphertext rune is deliberately free as in the tested model.
 * @param {number[]} plain
 * @param {(x:number)=>number} f
 * @param {number} wordNumber
 * @returns {number[]}
 */
function encryptNative(plain, f, wordNumber) {
  const a = 1 + wordNumber % 28, b = (wordNumber * 13 + 7) % 29;
  return plain.map((v, i) => i === 0 ? wordNumber * 17 % 29 :
    mod(a * (f(v) - f(plain[i-1])) + b));
}
const wordfreq = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/u)
  .map((line) => /^([a-z]+) [0-9]+$/u.exec(line))
  .filter(Boolean)
  .map((m) => m[1].toUpperCase());
const englishCorpus = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
].map(([name, file]) => ({
  name,
  words: read(file).toUpperCase().match(/[A-Z]+/gu) || [],
}));
const families = [
  ["ordinal", (x) => x],
  ["prime residue", (x) => corpus.prime[x] % 29],
];
const results = [];
for (const permissive of [false, true]) {
  const dictionary = wordfreq.map((w) => englishToGP(w, permissive))
    .filter((w) => w && w.length >= 2);
  const controls = englishCorpus.map(({name, words}) => ({
    name, words: words.map((w) => englishToGP(w, permissive))
      .filter((w) => w && w.length >= 2),
  }));
  for (const [family, f] of families) {
    const vocab = new Set(dictionary.map((w) => plaintextSignature(w, f)));
    const originalHits = Object.fromEntries([5, 6, 7, 8].map((minLength) => {
      const subset = original.filter((w) => w.length >= minLength);
      return [String(minLength), {
        total: subset.length,
        matched: subset.filter((w) => vocab.has(cipherSignature(w))).length,
      }];
    }));
    const controlHits = [];
    for (const {name, words} of controls) {
      for (let j = 0; j < words.length; j++) {
        const nativeCipher = encryptNative(words[j], f, j);
        assert.equal(cipherSignature(nativeCipher),
          plaintextSignature(words[j], f),
          "all-secret affine invariant failed on native control");
      }
      const subset = words.filter((w) => w.length >= 8);
      controlHits.push({
        source:name, total:subset.length,
        matched:subset.filter((w) => vocab.has(plaintextSignature(w, f)))
          .length,
      });
    }
    results.push({permissive, family, dictionarySize:dictionary.length,
      originalHits, nativeControlHitsAtLength8:controlHits});
  }
}
assert.deepEqual(results.map((r) => r.originalHits["8"].matched), [0, 0, 0, 0]);
assert.deepEqual(results.map((r) => r.originalHits["7"].matched), [2, 1, 2, 2]);
assert.deepEqual(results.map((r) => r.originalHits["6"].matched), [42, 40, 44, 52]);
assert.deepEqual(results.map((r) => r.nativeControlHitsAtLength8
  .map((x) => x.matched),
  [[1021,5955,2131],[1021,5955,2132],
   [1171,7150,2581],[1171,7150,2582]]);
console.log(JSON.stringify({
  verdict:"No original word of length>=8 fits any English lexicon word under any per-word affine predecessor-difference key",
  originalWords:original.length, originalRuneCount:12956,
  models:results,
}, null, 2));
