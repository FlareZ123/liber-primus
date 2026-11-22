#!/usr/bin/env node
"use strict";

/**
 * Original LP2 previous-ciphertext-word GP-prime nonce, Director issue #564.
 * Source rule: the authentic 2013 title THE INSTAR EMERGENCE has GP-prime
 * total 761, matching the original 761.MP3 basename; 2013 BASE29 documented
 * the mapping of large integers into this 29-symbol register.
 *
 * Hypothesis, NOT an authenticated 2014 LP2 instruction:
 *   s_0 = 761 mod 29 = 7, c_{-1}=0;
 *   C_i = (P_i + C_{i-1} + s_{w-1}) mod 29;
 *   s_w = (sum_{r in completed published ciphertext word w} GPprime(r)) mod 29.
 * Carries across printed words and physical pages within each original chapter.
 * No key guessing, substitutions, punctuation clock, or phrase fitting.
 *
 * Reversible inverse P_i = C_i - C_{i-1} - s_{w-1} (mod29).
 * On the synthetic positive, use the authentic 95-rune solved p57 PARABLE
 * as genuine human-written GP language, then encrypt and recover it exactly.
 *
 * Run from repository root with Node.js 22: node sims/lp2_previous_word_prime_nonce_sft.cjs
 * No writes or additional dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const records = read("resources/lp2-transcription.txt").split("%");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const latinTokens = gp.translit.map((v, i) => ({v, i})).sort((a, b) => b.v.length - a.v.length);
const mod29 = v => ((v % 29) + 29) % 29;

/** GP indices in each *complete* physical word, carrying printed line/page wraps. */
function wordRuns(source) {
  const whole = source.replace(/\/\s*/g, "").replace(/\s+/g, "")
    .match(/[\u16A0-\u16FF]+/gu) || [];
  return whole.map(w => [...w].map(c => {
    const n = runeToIndex.get(c);
    assert.notEqual(n, undefined);
    return n;
  }));
}

/** GP-normalize English controls using the conventional historical digraph rules. */
function gpEncode(source) {
  const out = [];
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  for (const w of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < w.length;) {
      const token = latinTokens.find(t => w.startsWith(t.v, i));
      assert.ok(token, "Unmapped native token " + w.slice(i));
      out.push(token.i);
      i += token.v.length;
    }
  }
  return out;
}
const gpPrimeSum = codes => codes.reduce((n, x) => n + gp.prime[x], 0);
assert.equal(gpPrimeSum(gpEncode("THE INSTAR EMERGENCE")), 761);
const seed = 761 % 29;
assert.equal(seed, 7);

/**
 * @param {number[][]} words printed GP rune words
 * @param {"encrypt"|"decrypt"} mode
 * @param {"prime"|"ordinal"|"zero"} nonceSource
 */
function codec(words, mode, nonceSource="prime") {
  let prev = 0, nonce = seed;
  const output = [];
  const nonceTrace = [];
  for (const word of words) {
    const converted = [];
    for (const v of word) {
      const transformed = mod29(v + (mode === "encrypt" ? 1 : -1) * (prev + nonce));
      converted.push(transformed);
      prev = mode === "encrypt" ? transformed : v;
    }
    const published = mode === "encrypt" ? converted : word;
    nonce = mod29(published.reduce((n, v) =>
      n + (nonceSource === "prime" ? gp.prime[v] :
        nonceSource === "ordinal" ? v : 0), 0));
    output.push(converted);
    nonceTrace.push(nonce);
  }
  return {words:output, values:output.flat(), nonceTrace};
}

/** GP29 marginal collision rate. */
function ioc(values) {
  const cnt = new Uint32Array(29);
  for (const x of values) cnt[x]++;
  return cnt.reduce((n, x) => n + x * (x - 1), 0) /
    (values.length * (values.length - 1));
}

/** Training GP29 3-gram Markov language model, independent of original LP2. */
const native = gpEncode(shakespeare), cut = Math.floor(native.length * .8);
assert.equal(native.length, 218800);
const counts = new Float64Array(29**3).fill(.01);
const previous = new Float64Array(29**2).fill(29 * .01);
for (let i = 2; i < cut; i++) {
  counts[841 * native[i - 2] + 29 * native[i - 1] + native[i]]++;
  previous[29 * native[i - 2] + native[i - 1]]++;
}
function trigram(values) {
  let log = 0;
  for (let i = 2; i < values.length; i++)
    log += Math.log(counts[841 * values[i - 2] + 29 * values[i - 1] + values[i]] /
      previous[29 * values[i - 2] + values[i - 1]]);
  return log / (values.length - 2);
}
const page = id => gp.pages.find(p => p.page === id).indices;
const entries = [
  {name:"original-p54-55", text:records.slice(53, 55).join(""),
    pages:[54, 55], expectedRunes:308, expectedWords:66,
    hash:null},
  {name:"independent-original-p0-2", text:records.slice(0, 3).join(""),
    pages:[0, 1, 2], expectedRunes:729, expectedWords:158,
    hash:null},
  {name:"authentic-solved-p57-control", text:records[56],
    pages:[57], expectedRunes:95, expectedWords:20,
    hash:null}
];
for (const entry of entries) {
  entry.words = wordRuns(entry.text);
  entry.original = entry.words.flat();
  assert.equal(entry.original.length, entry.expectedRunes);
  assert.equal(entry.words.length, entry.expectedWords);
  assert.deepEqual(entry.original, entry.pages.flatMap(page));
}

const authenticP57 = entries[2];
const plantCipher = codec(authenticP57.words, "encrypt");
const plantDecode = codec(plantCipher.words, "decrypt");
assert.deepEqual(plantDecode.values, authenticP57.original);
assert.deepEqual(codec(plantDecode.words, "encrypt").values, plantCipher.values);
assert.equal(trigram(plantDecode.values), trigram(authenticP57.original));

const result = entries.map(entry => {
  const prime = codec(entry.words, "decrypt", "prime");
  const wrong = codec(entry.words, "decrypt", "ordinal");
  const zero = codec(entry.words, "decrypt", "zero");
  assert.deepEqual(codec(prime.words, "encrypt", "prime").values, entry.original);
  assert.deepEqual(codec(wrong.words, "encrypt", "ordinal").values, entry.original);
  assert.deepEqual(codec(zero.words, "encrypt", "zero").values, entry.original);
  return {
    source:entry.name,
    originalRuneCount:entry.original.length,
    completeWordCount:entry.words.length,
    originalSHA256:crypto.createHash("sha256").update(Buffer.from(entry.original)).digest("hex"),
    originalIoC:ioc(entry.original),
    decodedPrimeNonceIoC:ioc(prime.values),
    originalTrigramNatsPerRune:trigram(entry.original),
    primeNonceTrigramNatsPerRune:trigram(prime.values),
    wrongOrdinalNonceTrigramNatsPerRune:trigram(wrong.values),
    zeroNonceTrigramNatsPerRune:trigram(zero.values),
    predictedOpening:prime.values.slice(0, 45).map(i => gp.translit[i]).join(""),
    exactForwardReconstruction:true
  };
});
assert.ok(Math.abs(result[0].primeNonceTrigramNatsPerRune + 5.416801478825365) < 1e-9);
assert.ok(Math.abs(result[1].primeNonceTrigramNatsPerRune + 5.627594685572253) < 1e-9);
assert.ok(Math.abs(result[2].primeNonceTrigramNatsPerRune + 5.328289014180586) < 1e-9);
assert.ok(Math.abs(trigram(plantCipher.values) + 5.584873715687792) < 1e-9);
assert.ok(Math.abs(trigram(plantDecode.values) + 2.546783848667527) < 1e-9);

console.log(JSON.stringify({
  issue:564,
  historicalNumericSelector:"Original 2013 ID3 THE INSTAR EMERGENCE GP prime sum = 761",
  hypothesis:"previous completed ciphertext word GP-prime sum mod29 as nonce",
  unknownSelector:"mod29 and feedback addition are hypothetical",
  seed,
  sourceMatchedPositive:{runicPlaintext:95,exactNativeRecovery:true,
    plantCipherTrigram:trigram(plantCipher.values),
    recoveredPlaintextTrigram:trigram(plantDecode.values),
    recoveredPlaintextIoC:ioc(plantDecode.values)},
  original:result,
  result:"REJECT: no unknown native-GP plaintext or key recovered under this exact reversible nonce rule"
},null,2));
