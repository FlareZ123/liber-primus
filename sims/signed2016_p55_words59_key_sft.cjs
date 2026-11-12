"use strict";

/**
 * Frozen 2016 signed sentence -> original LP2 physical p55 one-to-one word test.
 * Run: node sims/signed2016_p55_words59_key_sft.cjs
 * No search, fitted phase, altered transcript, or discretionary F skips.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const source = "Its words are the map, their meaning is the road, and their numbers are the direction.";
assert.ok(signed.includes(source));
const sentenceWords = source.match(/[A-Za-z]+/g);
assert.equal(sentenceWords.length, 16);

const runeValue = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((v, i) => [v, i]));
for (const [variant, original] of [["ING", "NG"], ["IO", "IA"], ["K", "C"], ["V", "U"]]) {
  gp.set(variant, gp.get(original));
}
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);
/** Source-era GP spelling; all choices pinned before inspecting unknown ciphertext.
 * @param {string} word
 * @returns {number[]}
 */
function tokenize(word) {
  let tail = word.toUpperCase(), out = [];
  while (tail.length) {
    const token = tokens.find(t => tail.startsWith(t));
    assert.ok(token, "Unmappable GP token");
    out.push(gp.get(token));
    tail = tail.slice(token.length);
  }
  return out;
}
const keysByWord = sentenceWords.map(tokenize);
const fullKey = keysByWord.flat();
assert.deepEqual(keysByWord.map(a => a.length), [3,5,3,2,3,4,4,2,2,4,3,4,7,3,2,8]);
assert.equal(fullKey.length, 59);
assert.equal(keysByWord.slice(0, 5).flat().length, 16);
assert.equal(keysByWord.slice(5).flat().length, 43);

const fragments = read("resources/lp2-transcription.txt").split("%")[54]
  .replace(/\/\s*/g, "").match(/[\u16A0-\u16FF]+/gu);
assert.deepEqual(fragments.map(w => [...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const bodyWords = fragments.slice(1).map(w => [...w].map(r => runeValue.get(r)));
const body = bodyWords.flat();
assert.deepEqual(fragments.join("").split("").map(r => runeValue.get(r)),
  corpus.pages[55].indices);
assert.equal(body.length, 75);
assert.equal(bodyWords.length, 16);
assert.equal(bodyWords.flatMap(w => w.slice(1, -1)).length, 43);
assert.equal(bodyWords.reduce((s, w) => s + w.length - 1, 0), 59);

const wordPrimeSums = keysByWord.map(word =>
  word.reduce((sum, index) => sum + corpus.prime[index], 0));
assert.deepEqual(wordPrimeSums, [143,179,175,72,211,114,288,84,72,204,215,114,295,175,72,406]);

/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number[][]} words @param {string} mode @param {number} sign */
function apply(words, mode, sign) {
  let absoluteKey = 0;
  return words.map((w, j) => w.map((v, i) => {
    if (mode === "literal-word") return mod29(v + sign * keysByWord[j][i % keysByWord[j].length]);
    if (mode === "prime-sum") return mod29(v + sign * wordPrimeSums[j]);
    if (mode === "minus-last") {
      if (i === w.length - 1) return v;
      return mod29(v + sign * fullKey[absoluteKey++]);
    }
    throw new Error("Unknown locked mode");
  }));
}
/** @param {number[]} seq */
function ioc(seq) {
  const count = Array(29).fill(0);
  seq.forEach(v => count[v]++);
  return count.reduce((t, n) => t + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
const knownPlant = corpus.pages[57].indices.slice(0, 75);
assert.equal(knownPlant.length, 75);
const plantWords = [];
let k = 0;
for (const w of bodyWords) {
  plantWords.push(knownPlant.slice(k, k + w.length));
  k += w.length;
}
assert.equal(k, 75);
const cases = [];
for (const mode of ["literal-word", "prime-sum", "minus-last"]) {
  const originalInverse = apply(bodyWords, mode, -1);
  assert.deepEqual(apply(originalInverse, mode, +1), bodyWords);
  const plantEncrypted = apply(plantWords, mode, +1);
  assert.deepEqual(apply(plantEncrypted, mode, -1), plantWords);
  const result = originalInverse.flat();
  cases.push({
    mode,
    nativePlantRecoveredExactly: true,
    originalReencryptedExactly: true,
    originalBody75IoC: ioc(body),
    candidateIoC: ioc(result),
    transliteration: result.map(v => corpus.translit[v]).join(" "),
  });
}
console.log(JSON.stringify({
  sourceSignedSha256: crypto.createHash("sha256").update(signed).digest("hex"),
  sourcePhrase: source,
  sourceWordCount: sentenceWords.length,
  sourceGP29Runes: fullKey.length,
  completeOriginalP55Words: bodyWords.length,
  originalP55BodyRunes: body.length,
  firstAndInteriorRunes: 59,
  strictInteriors: 43,
  inheritedP54CarryRunes: 1,
  signedPrimeSums: wordPrimeSums,
  cases,
  conclusion: "No source-word direct-key interpretation recovers linguistic original plaintext. The 16/59/43 count alignment remains provisional; the 76-rune p55 decoder is still unknown."
}, null, 2));
