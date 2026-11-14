"use strict";
/**
 * GP29 word-local affine ramp, key-independent dictionary gate.
 * Run: node sims/lp2_word_affine_ramp_dictionary_sft.cjs
 * Works on Windows 11 with Node.js 22. Uses only built-in modules.
 *
 * Hypothesis: C[w,j] = a[w]*P[w,j] + b[w] + t[w]*j (mod 29),
 * independently secret a in 1..28, b,t in 0..28 for every printed word.
 * The normalized nonzero second-difference vector is invariant.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const raw = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
/** @type {number[][]} */
const ciphertextWords = [];
/** @type {number[]} */
let word = [];
let runeCount = 0;
for (const c of raw) {
  if (runeIndex.has(c)) {
    word.push(runeIndex.get(c));
    runeCount += 1;
  } else if ("-.$&§".includes(c) && word.length > 0) {
    ciphertextWords.push(word);
    word = [];
  }
}
if (word.length > 0) ciphertextWords.push(word);
assert.equal(runeCount, 12956);
assert.equal(ciphertextWords.length, 2896);

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;
const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a += 1) {
  for (let k = 1; k < 29; k += 1) {
    if ((a * k) % 29 === 1) inverse[a] = k;
  }
}
assert.deepEqual(inverse.slice(1).filter(Boolean).length, 28);

/**
 * Complete invariant of arbitrary word-specific affine slopes.
 * For j>=0, d[j]=W[j+2]-2W[j+1]+W[j] (mod29).
 * Under C=aP+b+tj, d(C)=a*d(P). Divide by first nonzero d.
 * @param {number[]} letters @returns {string}
 */
function signature(letters) {
  assert.ok(letters.length >= 3);
  const delta = [];
  for (let j = 0; j < letters.length - 2; j += 1) {
    delta.push(mod29(letters[j + 2] -
      2 * letters[j + 1] + letters[j]));
  }
  const pivot = delta.find((x) => x !== 0) || 0;
  return pivot === 0 ? "all-zero" :
    delta.map((x) => mod29(x * inverse[pivot])).join(",");
}

const tokens = ["ING", "IO", ...corpus.translit]
  .sort((a, b) => b.length - a.length);
/**
 * Native GP29 spelling: ING and IO use the single NG and IA rune,
 * while QU, K, V, Z follow the established source-normalized spelling.
 * @param {string} source @returns {number[]}
 */
function encode(source) {
  const rawWord = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const values = [];
  for (let i = 0; i < rawWord.length;) {
    const t = tokens.find((candidate) => rawWord.startsWith(candidate, i));
    if (!t) return [];
    const normalized = t === "ING" ? "NG" : t === "IO" ? "IA" : t;
    const gp = corpus.translit.indexOf(normalized);
    if (gp < 0) return [];
    values.push(gp);
    i += t.length;
  }
  return values;
}

// Independent general-purpose 29,000-word English lexicon.
const dictionaryLines = read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/);
const dictionary = [];
for (const line of dictionaryLines) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (match) {
    const encoded = encode(match[1]);
    if (encoded.length > 0) dictionary.push(encoded);
  }
}
assert.equal(dictionary.length, 29154);
const dictionaryByLength = Array.from({length: 15}, () => []);
const signatureByLength = Array.from({length: 15}, () => new Set());
for (const item of dictionary) {
  if (item.length <= 14) {
    dictionaryByLength[item.length].push(item);
    if (item.length >= 4) {
      signatureByLength[item.length].add(signature(item));
    }
  }
}
const originalByLength = Array.from({length: 15}, () => []);
for (const item of ciphertextWords) {
  assert.ok(item.length >= 1 && item.length <= 14);
  originalByLength[item.length].push(item);
}
/** @type {[number,number,number][]} */
const expected = [
  [4, 513, 513], [5, 317, 312], [6, 256, 48],
  [7, 216, 3], [8, 156, 0], [9, 78, 0],
  [10, 52, 0], [11, 32, 0], [12, 18, 0],
  [13, 4, 0], [14, 3, 0]
];
const rows = expected.map(([n]) => {
  const words = originalByLength[n];
  const matches = words.filter((w) => signatureByLength[n].has(signature(w))).length;
  return [n, words.length, matches];
});
assert.deepEqual(rows, expected);
const longer = rows.filter((r) => r[0] >= 6);
const longTotal = longer.reduce((s, r) => s + r[1], 0);
const longMatched = longer.reduce((s, r) => s + r[2], 0);
assert.equal(longTotal, 815);
assert.equal(longMatched, 51);

// Full 12,956-rune native-GP positive plant. Every printed-word length
// receives an independently selected real dictionary word and secret a,b,t.
let rngState = 0xc0ffee35 >>> 0;
/** @returns {number} */
function rand32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
let roundtripRunes = 0;
let unchangedSignatures = 0;
for (const originalWord of ciphertextWords) {
  const pool = dictionaryByLength[originalWord.length];
  assert.ok(pool.length > 0);
  const plaintext = pool[rand32() % pool.length];
  const a = 1 + (rand32() % 28);
  const b = rand32() % 29;
  const t = rand32() % 29;
  const encoded = plaintext.map((p, j) => mod29(a * p + b + t * j));
  const decoded = encoded.map((c, j) =>
    mod29((c - b - t * j) * inverse[a]));
  assert.deepEqual(decoded, plaintext);
  if (plaintext.length >= 4) {
    assert.equal(signature(encoded), signature(plaintext));
    assert.ok(signatureByLength[plaintext.length].has(signature(encoded)));
    unchangedSignatures += 1;
  }
  roundtripRunes += plaintext.length;
}
assert.equal(roundtripRunes, 12956);
assert.equal(unchangedSignatures, 1645);
console.log(JSON.stringify({
  hypothesis: "Independent arbitrary affine ramp for every printed word",
  equation: "C[w,j] = a[w]*P[w,j] + b[w] + j*t[w] mod 29",
  originalWords: ciphertextWords.length,
  originalRunes: runeCount,
  lexiconWords: dictionary.length,
  byWordLength: rows.map(([length, count, dictionaryCompatible]) => ({
    length, count, dictionaryCompatible, incompatible: count-dictionaryCompatible
  })),
  lengthSixOrMore: {
    originalWords: longTotal,
    compatibleWithLexicon: longMatched,
    incompatibleWithLexicon: longTotal-longMatched
  },
  positivePlant: {
    distinctIndependentWordKeys: ciphertextWords.length,
    originalLengthMatchedRunesRecovered: roundtripRunes,
    invariantPreservedWordsAtLeastFour: unchangedSignatures
  },
  decision: "The independent affine-ramp-per-word family cannot map 764/815 long source words to any entry of the pinned English lexicon. This is an exact finite-dictionary exclusion, conditional on GP-native spelling, source word breaks and English vocabulary; it is not a universal non-English exclusion or recovered plaintext."
}, null, 2));
