"use strict";

/**
 * Source-selected DH six-back key-recurrence inverse on original LP2 words.
 * Node.js 22, CommonJS. Source inputs are read-only, with exact synthetic
 * English-GP word implants and checked inverse.
 *
 * This tests a key recurrence, NOT the previously studied ciphertext rewrite:
 *   C[j] = P[j] + K[j] (mod 29)
 *   K[j] = 24 - 2 K[j-6] (mod 29), j >= 6, fresh unknown K[0..5] per word.
 * For any hidden six-symbol key, the exact necessary condition is:
 *   C[j] + 2C[j-6] - 24 = P[j] + 2P[j-6] (mod 29).
 *
 * No arbitrary starting key or sign is fitted to the unknown original.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const printed = read("resources/liber-primus/lp2-transcription.txt");
const dictionarySource = read("resources/control/english_wordfreq_textblob.txt");
const n = x => (x % 29 + 29) % 29;
const runeIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const originals = [];
let current = [];
for (const char of printed) {
  if (runeIndex.has(char)) current.push(runeIndex.get(char));
  if ("-.&§".includes(char) && current.length) {
    originals.push(current);
    current = [];
  }
}
if (current.length) originals.push(current);
const encrypted = originals.slice(0, 2896);
assert.equal(encrypted.length, 2896);
assert.equal(encrypted.reduce((sum, w) => sum + w.length, 0), 12956);
assert.deepEqual(encrypted.flat(), gp.pages.filter(p => p.page < 56).flatMap(p => p.indices));
const translit = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Encode a word in the 2014 source orthography; ING and IO are single runes.
 * This matches the established solved-LP1 and solved-LP2 p57 spelling rules.
 *
 * @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const letters = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let pos = 0; pos < letters.length;) {
    if (letters.startsWith("ING", pos)) {
      out.push(21);
      pos += 3;
    } else if (letters.startsWith("IO", pos)) {
      out.push(27);
      pos += 2;
    } else {
      const token = translit.find(t => letters.startsWith(t.s, pos));
      assert(token, "Unencodable dictionary token: " + word);
      out.push(token.i);
      pos += token.s.length;
    }
  }
  return out;
}

/**
 * This signature is independent of all six initial running-key values.
 *
 * @param {number[]} runes
 * @param {boolean} ciphertext
 * @returns {string}
 */
function signature(runes, ciphertext) {
  const items = [];
  for (let j = 6; j < runes.length; j++) {
    items.push(n(runes[j] + 2 * runes[j - 6] - (ciphertext ? 24 : 0)));
  }
  return items.join(",");
}

const bySig = new Map();
const wordCounts = new Map();
for (const line of dictionarySource.split(/\r?\n/)) {
  if (!/^[a-z]+ \d+$/.test(line)) continue;
  const [word] = line.split(" ");
  const encoded = encode(word);
  wordCounts.set(encoded.length, (wordCounts.get(encoded.length) || 0) + 1);
  if (encoded.length < 7) continue;
  const key = encoded.length + "|" + signature(encoded, false);
  let list = bySig.get(key);
  if (!list) {
    list = [];
    bySig.set(key, list);
  }
  list.push({word, encoded});
}
assert.equal([...wordCounts.values()].reduce((a, b) => a + b, 0), 29157);
const observed = {};
const matchesNine = [];
for (let wi = 0; wi < encrypted.length; wi++) {
  const text = encrypted[wi], length = text.length;
  if (length < 7) continue;
  const matching = bySig.get(length + "|" + signature(text, true)) || [];
  if (!observed[length]) observed[length] = {words: 0, wordsWithMatch: 0, matches: 0};
  observed[length].words++;
  if (matching.length) {
    observed[length].wordsWithMatch++;
    observed[length].matches += matching.length;
    if (length >= 9) {
      matchesNine.push({
        wordIndex: wi,
        length,
        candidateWords: matching.map(x => x.word)
      });
    }
  }
}
assert.deepEqual(Object.fromEntries(
  Object.entries(observed).filter(([len]) => Number(len) >= 8)
    .map(([len, item]) => [len, [item.words, item.wordsWithMatch]])),
{
  8: [156, 146],
  9: [78, 14],
  10: [52, 0],
  11: [32, 0],
  12: [18, 0],
  13: [4, 0],
  14: [3, 0]
});
const longWords = encrypted.filter(w => w.length >= 10);
assert.equal(longWords.length, 109);

/* Genuine GP-English positive implants at all 109 original long-word slots:
 * freshly unknown six-symbol initial keys, independently for every word.
 * Successful exact forward inversion and dictionary recovery are required.
 */
let positive = 0;
let decoded = 0;
let seed = 0x33012013;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
for (const length of longWords.map(w => w.length)) {
  const entries = [...bySig.entries()]
    .filter(([k]) => k.startsWith(length + "|"))
    .flatMap(([, rows]) => rows);
  assert(entries.length, "No reference word of source-native GP length " + length);
  const plain = entries[next() % entries.length].encoded;
  const key = [];
  for (let j = 0; j < 6; j++) key.push(next() % 29);
  for (let j = 6; j < length; j++) key.push(n(24 - 2 * key[j - 6]));
  const cipher = plain.map((p, j) => n(p + key[j]));
  assert.equal(signature(cipher, true), signature(plain, false));
  const recovered = cipher.map((v, j) => n(v - key[j]));
  assert.deepEqual(recovered, plain);
  assert((bySig.get(length + "|" + signature(cipher, true)) || [])
    .some(row => row.encoded.join(",") === plain.join(",")));
  positive++;
  decoded += recovered.length;
}
assert.equal(positive, 109);
console.log(JSON.stringify({
  model: "word-local six-back affine key recurrence T(k)=24-2k in GF29",
  source: "2013 authenticated DH worked example / independently observed LP2 T6",
  originalWords: encrypted.length,
  originalRunes: 12956,
  originalAtLeastTen: longWords.length,
  originalByLength: observed,
  nineRuneCandidates: matchesNine,
  originalNativeWordMatchesLengthTenPlus: 0,
  positiveNativeControlWords: positive,
  positiveExactDecodedRunes: decoded,
  caveat: "Finite English GP lexicon; no authenticated LP2 key/plaintext"
}, null, 2));
