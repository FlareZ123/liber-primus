"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeMap = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const mod = (x) => ((x % 29) + 29) % 29;

function parseOriginalWords(raw) {
  const pageSegments = raw.split("%").slice(0, 55);
  const stream = pageSegments.join("%");
  const words = [];
  const pageRunes = Array.from({length: pageSegments.length}, () => []);
  let current = [];
  let page = 0;
  function finish() {
    if (current.length) { words.push(current); current = []; }
  }
  for (const ch of stream) {
    if (runeMap.has(ch)) {
      const item = {c: runeMap.get(ch), page};
      current.push(item);
      pageRunes[page].push(item.c);
    } else if (ch === "%") page++;
    else if (ch === "/" || /\s/u.test(ch)) { /* layout only */ }
    else finish();
  }
  finish();
  return {words, pageRunes};
}

function encodeNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { out.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { out.push(27); i += 2; }
      else {
        const token = tokens.find((t) => word.startsWith(t.s, i));
        if (!token) return null;
        out.push(token.i); i += token.s.length;
      }
    }
  }
  return out;
}

function decryptWord(cipher, seed, sign, feedback) {
  const plain = [];
  for (let j = 0; j < cipher.length; j++) {
    const source = feedback === "plaintext" ? plain[j - 5] : cipher[j - 5];
    const key = j < 5 ? seed[j] : mod(gp.prime[source] - 1);
    plain.push(mod(cipher[j] - sign * key));
  }
  return plain;
}
function encryptWord(plain, seed, sign, feedback) {
  const cipher = [];
  for (let j = 0; j < plain.length; j++) {
    const source = feedback === "plaintext" ? plain[j - 5] : cipher[j - 5];
    const key = j < 5 ? seed[j] : mod(gp.prime[source] - 1);
    cipher.push(mod(plain[j] + sign * key));
  }
  return cipher;
}

const dictionary = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")) {
  if (!line || line.startsWith(";")) continue;
  const word = line.trim().split(/\s+/)[0];
  if (!/^[a-z]+$/i.test(word)) continue;
  const encoded = encodeNativeGP(word);
  if (encoded) dictionary.add(encoded.join(","));
}

function metrics(words) {
  let run = 0, maxRun = 0, dictionaryHits = 0;
  let adjacentWithinWords = 0, adjacentCrossWordSamePage = 0, adjacentSamePage = 0;
  let lag5 = 0, eligible5 = 0, runeCount = 0;
  const frequencies = new Uint32Array(29);
  let previousWordLast = null;
  for (const word of words) {
    const values = word.map((x) => x.v);
    if (dictionary.has(values.join(","))) {
      dictionaryHits++; run++; maxRun = Math.max(maxRun, run);
    } else run = 0;
    for (let j = 0; j < word.length; j++) {
      const x = word[j]; runeCount++; frequencies[x.v]++;
      if (j > 0) {
        if (x.v === word[j - 1].v) adjacentWithinWords++;
        if (x.page === word[j - 1].page && x.v === word[j - 1].v) adjacentSamePage++;
      }
      if (j >= 5) {
        eligible5++;
        if (x.v === word[j - 5].v) lag5++;
      }
      if (j === 0 && previousWordLast &&
          previousWordLast.page === x.page && previousWordLast.v === x.v) {
        adjacentCrossWordSamePage++; adjacentSamePage++;
      }
    }
    const last = word[word.length - 1];
    previousWordLast = {v: last.v, page: last.page};
  }
  let collisionSum = 0;
  for (const n of frequencies) collisionSum += n * (n - 1);
  return {
    runes: runeCount, ioc: collisionSum / (runeCount * (runeCount - 1)),
    adjacentWithinWords, adjacentCrossWordSamePage, adjacentSamePage,
    lag5, eligible5, dictionaryHits, maxConsecutiveDictionaryWords: maxRun
  };
}

const {words: sourceWords, pageRunes} = parseOriginalWords(read("resources/lp2-transcription.txt"));
const runeCount = sourceWords.reduce((n, w) => n + w.length, 0);
const carriedWords = sourceWords.filter((w) => w[0].page !== w[w.length - 1].page).length;
assert.equal(sourceWords.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(carriedWords, 32);
const sourcePages = gp.pages.filter((p) => p.page < 56 && p.indices.length);
assert.equal(sourcePages.length, 55);
assert.deepEqual(pageRunes, sourcePages.map((p) => p.indices));
const seedRaw = sourceWords[1].map((x) => x.c);
assert.deepEqual(seedRaw, [15, 26, 18, 21, 5]);
const seedPhi = seedRaw.map((x) => mod(gp.prime[x] - 1));
assert.deepEqual(seedPhi, [23, 15, 8, 20, 12]);

const original = sourceWords.map((w) => w.map((x) => ({...x, v: x.c})));
const originalMetrics = metrics(original);
assert.deepEqual([
  originalMetrics.adjacentSamePage, originalMetrics.adjacentWithinWords,
  originalMetrics.adjacentCrossWordSamePage, originalMetrics.lag5,
  originalMetrics.eligible5, originalMetrics.dictionaryHits
], [86, 63, 23, 104, 2105, 201]);

const plantWords = ["FOLLOWING", "CONSUMPTION", "YOURSELF", "SHALL", "LIFE", "AND", "ONE"]
  .map((w) => encodeNativeGP(w));
assert(plantWords.every(Boolean));
assert(plantWords.some((w) => w.length > 5));
assert(plantWords.flat().includes(0));

const variants = [];
for (const feedback of ["plaintext", "ciphertext"]) {
  for (const seedName of ["raw", "phi-prime"]) {
    const seed = seedName === "raw" ? seedRaw : seedPhi;
    for (const sign of [1, -1]) {
      for (const plain of plantWords) {
        const cipher = encryptWord(plain, seed, sign, feedback);
        assert.deepEqual(decryptWord(cipher, seed, sign, feedback), plain);
      }
      const decoded = sourceWords.map((word) => {
        const cipher = word.map((x) => x.c);
        const plain = decryptWord(cipher, seed, sign, feedback);
        return word.map((x, j) => ({page: x.page, v: plain[j]}));
      });
      variants.push({feedback, seedName, seed, sign, ...metrics(decoded),
        first20: decoded.slice(0, 20).map((w) => w.map((x) => gp.translit[x.v]).join(""))});
    }
  }
}

const expected = [
  ["plaintext", "raw", 1, 472, 370, 102, 78, 191, 2],
  ["plaintext", "raw", -1, 419, 322, 98, 72, 182, 2],
  ["plaintext", "phi-prime", 1, 418, 319, 102, 76, 202, 3],
  ["plaintext", "phi-prime", -1, 425, 331, 96, 73, 205, 3],
  ["ciphertext", "raw", 1, 467, 362, 105, 72, 191, 2],
  ["ciphertext", "raw", -1, 427, 336, 92, 72, 182, 2],
  ["ciphertext", "phi-prime", 1, 430, 324, 110, 84, 202, 3],
  ["ciphertext", "phi-prime", -1, 424, 333, 93, 83, 205, 3]
];
for (let i = 0; i < expected.length; i++) {
  const e = expected[i], a = variants[i];
  assert.deepEqual([
    a.feedback, a.seedName, a.sign, a.adjacentSamePage,
    a.adjacentWithinWords, a.adjacentCrossWordSamePage, a.lag5,
    a.dictionaryHits, a.maxConsecutiveDictionaryWords
  ], e);
}
console.log(JSON.stringify({
  model: "word-local lag-five prime-totient autokey; p0 red-word seed; both plaintext and ciphertext feedback",
  source: {words: sourceWords.length, runes: runeCount, pageCarries: carriedWords},
  seedRaw, seedPhi, dictionarySize: dictionary.size,
  original: originalMetrics, variants,
  positivePlant: {words: ["FOLLOWING", "CONSUMPTION", "YOURSELF", "SHALL", "LIFE", "AND", "ONE"],
    exactRoundTripsPerVariant: true, fIsOrdinarySymbol: true},
  conclusion: "All eight source-constrained seed/direction/feedback variants fail native GP-English recovery and destroy the original low-adjacent/elevated-lag-five joint signature."
}, null, 2));
console.log("PASS: source transcription, 32 page carries, 8 exact original inverses, 16 native-GP positive round trips");
