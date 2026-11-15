"use strict";
/**
 * Director #984: frozen literal previous ciphertext-word Vigenere key.
 *
 * Source hypothesis: solved Cicada stages used GP29 Vigenere keys; the 2016
 * signed continuation names words and their numbers as a route. Test whether
 * the published preceding ciphertext word, repeated as a key, decrypts the
 * next original word. This is a bounded hypothesis, not an authorial opcode.
 *
 * Model: C[w,j] = P[w,j] + C[w-1,j mod |C[w-1]|] mod29, w>0.
 * First word is transmitted unchanged because no previous word exists.
 * All 32 physical-page word carries are joined before keying; no reset.
 *
 * No custom dependencies; Node.js 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyphIndex = new Map(gp.runes.map((r, i) => [r, i]));
const re = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const printed = read("resources/lp2-transcription.txt");
const sourceWords = (printed.split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "")
  .match(re) || []).map(w => Array.from(w, ch => glyphIndex.get(ch)));
const sourcePages = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(sourceWords.length, 2896);
assert.equal(sourceWords.flat().length, 12956);
assert.deepEqual(sourceWords.flat(), sourcePages.flatMap(p => p.indices));

/**
 * A completely specified causal, lossless original-word cipher.
 * @param {number[][]} plain Native GP29 words
 * @returns {number[][]}
 */
function encrypt(plain) {
  const out = [];
  for (const word of plain) {
    const previous = out.at(-1) || [0];
    out.push(word.map((p, j) => (p + previous[j % previous.length]) % 29));
  }
  return out;
}
/** @param {number[][]} cipher @returns {number[][]} */
function decrypt(cipher) {
  return cipher.map((word, w) => {
    const prev = cipher[w - 1] || [0];
    return word.map((c, j) => (c - prev[j % prev.length] + 29) % 29);
  });
}
/** @param {number[][]} arr @returns {number} */
function ioc(arr) {
  const counts = new Array(29).fill(0);
  for (const w of arr) for (const r of w) counts[r]++;
  const n = counts.reduce((a,b) => a+b, 0);
  return counts.reduce((a,v) => a+v*(v-1), 0)/(n*(n-1));
}
const originalPlain = decrypt(sourceWords);
assert.deepEqual(encrypt(originalPlain), sourceWords);
const originalSingletons = originalPlain.filter(w => w.length === 1).map(w => w[0]);
assert.equal(originalSingletons.length, 83);
const A = 24, I = 10, O = 3;
const nativeAllowed = new Set([A, I, O]);
const originalNativeOneRune = originalSingletons.filter(x => nativeAllowed.has(x)).length;
assert.equal(originalNativeOneRune, 11);
const originalIOC = ioc(originalPlain);
assert(originalIOC >= 0.033 && originalIOC <= 0.036);

/** Native source words normalized using original GP29 ING/IO controls. */
const controls = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const buckets = Array.from({length:15}, () => []);
for (const source of controls) {
  const raw = read(source).split(/\r?\n/).filter(line => !line.startsWith("#")).join(" ");
  for (const word of raw.match(/[A-Za-z]+/g) || []) {
    const gpword = encodeSourceNativeGP(word);
    if (gpword.length >= 1 && gpword.length <= 14) buckets[gpword.length].push(gpword);
  }
}
assert(buckets.slice(1).every(group => group.length > 0));
const lexicon = buckets.map(group => new Set(group.map(w => w.join(","))));
const originalDictionaryHits = originalPlain.filter(w =>
  lexicon[w.length].has(w.join(","))).length;
const nativeOneRuneSource = [...new Set(buckets[1].map(w => w[0]))]
  .sort((a,b) => a-b).map(i => gp.translit[i]);

let state = 0x3301984;
/** @returns {number} */
function next() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state;
}
const plant = sourceWords.map(word => {
  const source = buckets[word.length];
  return source[next() % source.length];
});
const plantCipher = encrypt(plant);
const plantRecovered = decrypt(plantCipher);
assert.deepEqual(plantRecovered, plant);
assert.deepEqual(encrypt(plantRecovered), plantCipher);
const plantNativeOneRune = plantRecovered.filter(w => w.length === 1)
  .filter(w => nativeAllowed.has(w[0])).length;
const inverseNativeRate = originalNativeOneRune / 83;
assert(originalNativeOneRune < 15);
console.log(JSON.stringify({
  hypothesis:"C[w,j]=P[w,j]+C[w-1,j mod |C[w-1]|] mod29; first word unchanged",
  corpus:{words:sourceWords.length,runes:12956,singletons:83},
  sourceNativeOneRuneLabels:nativeOneRuneSource,
  original:{
    decryptedIOC:originalIOC,
    decodedOneRuneAIO:originalNativeOneRune,
    dictionaryWordHits:originalDictionaryHits,
    decodedOneRuneAIOFraction:inverseNativeRate,
    allOriginalRunesForwardExactlyReconstructed:encrypt(originalPlain).flat().length===12956
  },
  positive:{
    nativeGPRecovered:plantRecovered.flat().length,
    matchedPlaintextWords:plantRecovered.length,
    dictionaryWordHits:plantRecovered.filter(w => lexicon[w.length].has(w.join(","))).length,
    decodedOneRuneAIO:plantNativeOneRune,
    plaintextIOC:ioc(plant)
  },
  conclusion:"No authentic plaintext or key: a direct previous-literal-ciphertext-word Vigenere key leaves original near-uniform and only 11/83 decoded A/I/O singleton words. Positive source-native plant exactly recovered. The historical first-party clue does not itself specify a previous-word handoff."
},null,2));
