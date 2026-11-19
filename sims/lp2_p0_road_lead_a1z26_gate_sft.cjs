"use strict";

/**
 * SFT: p0 ROAD candidate has A1Z26 additive-key word LEAD.
 *
 * This is a post-discovery semantic/key checksum on the independently selected
 * p0 ROAD receiver. It does not claim that A1Z26 supplies a general LP2 KDF.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current});
    current = [];
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} cipher @param {number[]} plain @returns {number[]} */
function additiveKey(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  return cipher.map((value, index) => (value - plain[index] + 29) % 29);
}

/** @param {number[]} values @returns {string|null} */
function a1z26(values) {
  if (!values.every((value) => value >= 1 && value <= 26)) return null;
  return values.map((value) => String.fromCharCode(64 + value)).join("").toLowerCase();
}

/** @param {number[]} values @param {"A1"|"A0"|"Z1"|"Z0"} mode @returns {string|null} */
function numberedAlphabet(values, mode) {
  if (mode === "A1") return a1z26(values);
  if (mode === "A0") {
    if (!values.every((value) => value >= 0 && value <= 25)) return null;
    return values.map((value) => String.fromCharCode(65 + value)).join("").toLowerCase();
  }
  if (mode === "Z1") {
    if (!values.every((value) => value >= 1 && value <= 26)) return null;
    return values.map((value) => String.fromCharCode(91 - value)).join("").toLowerCase();
  }
  if (!values.every((value) => value >= 0 && value <= 25)) return null;
  return values.map((value) => String.fromCharCode(90 - value)).join("").toLowerCase();
}

const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon4 = new Set(
  dictionaryWords.filter((word) => /^[a-z]{4}$/u.test(word))
);
assert.equal(lexicon4.has("lead"), true);
assert.equal(lexicon4.has("gums"), true);

// Fixed p0 receiver from the independent THE ROAD navigation hypothesis.
const p0Words = parseWords(physicalPart(0));
const roadWord = p0Words[22];
assert.deepEqual(roadWord, {
  start: 105,
  end: 108,
  values: [16, 8, 25, 27],
});
const roadPlain = gp("ROAD");
assert.deepEqual(roadPlain, [4, 3, 24, 23]);
const roadKey = additiveKey(roadWord.values, roadPlain);
assert.deepEqual(roadKey, [12, 5, 1, 4]);
assert.equal(a1z26(roadKey), "lead");

// Exact forward reconstruction.
assert.deepEqual(
  roadPlain.map((value, index) => (value + roadKey[index]) % 29),
  roadWord.values
);

// The key word LEAD collides canonically with authenticated SEEKS under GP0.
const leadGp = gp("LEAD");
const seeksGp = gp("SEEKS");
assert.deepEqual(leadGp, [20, 28, 23]);
const leadGp0 = leadGp.reduce((a, b) => a + b, 0);
const seeksGp0 = seeksGp.reduce((a, b) => a + b, 0);
assert.deepEqual([leadGp0, seeksGp0], [71, 71]);
const tableBytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableBytes[leadGp0], 108);

// Existing local DH factorization of the same four ROAD increments.
const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2};
const factored = [
  (dh.a * dh.K) % 29,
  dh.g,
  (dh.K * dh.b) % 29,
  (dh.b * dh.A) % 29,
];
assert.deepEqual(factored, roadKey);

// Fixed-target placement control: ROAD against every complete four-rune word.
const fixedTargetHits = [];
let fourRuneWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.values.length !== 4) continue;
    fourRuneWords += 1;
    const key = additiveKey(word.values, roadPlain);
    const keyWord = a1z26(key);
    if (keyWord !== null && lexicon4.has(keyWord)) {
      fixedTargetHits.push({
        page,
        word: index + 1,
        start: word.start,
        key,
        keyWord,
      });
    }
  }
}
assert.equal(fourRuneWords, 514);
assert.deepEqual(fixedTargetHits, [
  {page: 0, word: 23, start: 105, key: [12,5,1,4], keyWord: "lead"},
  {page: 5, word: 45, start: 196, key: [7,21,13,19], keyWord: "gums"},
]);

// Fixed-receiver source-vocabulary control.
const signedClear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/u)
  .slice(1)
  .join("\n");
const signedTargets = [...new Set(
  signedClear
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .map((word) => word.toUpperCase())
    .filter((word) => gp(word).length === 4)
)];
assert.deepEqual(signedTargets, [
  "LIES", "THEIR", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const modes = ["A1", "A0", "Z1", "Z0"];
const fixedReceiverHits = [];
for (const target of signedTargets) {
  const key = additiveKey(roadWord.values, gp(target));
  for (const mode of modes) {
    const keyWord = numberedAlphabet(key, mode);
    if (keyWord !== null && lexicon4.has(keyWord)) {
      fixedReceiverHits.push({target, mode, key, keyWord});
    }
  }
}
assert.deepEqual(fixedReceiverHits, [{
  target: "ROAD",
  mode: "A1",
  key: [12,5,1,4],
  keyWord: "lead",
}]);

// Wider A1 family: all distinct signed four-rune targets at all four-rune
// unknown-manuscript words. This is a descriptive post-discovery calibration.
const allA1Hits = [];
for (const target of signedTargets) {
  const plain = gp(target);
  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    const words = parseWords(physicalPart(page));
    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      if (word.values.length !== 4) continue;
      const key = additiveKey(word.values, plain);
      const keyWord = a1z26(key);
      if (keyWord !== null && lexicon4.has(keyWord)) {
        allA1Hits.push({
          target,
          page,
          word: index + 1,
          start: word.start,
          keyWord,
        });
      }
    }
  }
}
assert.equal(signedTargets.length * fourRuneWords, 4112);
assert.equal(allA1Hits.length, 12);

// LEAD is local: repeating it beyond ROAD does not yield a prose continuation.
const p0Runes = corpus.pages.find((page) => page.page === 0).indices;
const repeated = p0Runes.slice(105, 145)
  .map((value, index) => (value - roadKey[index % roadKey.length] + 29) % 29);
const translit = (values) => values.map((value) => corpus.translit[value]).join("");
assert.equal(translit(repeated).startsWith("ROAD"), true);
assert.equal(translit(repeated).startsWith("ROADTHE"), false);

console.log(JSON.stringify({
  status: "PASS",
  road: {
    cipher: roadWord.values,
    plain: roadPlain,
    additiveKey: roadKey,
    a1z26: a1z26(roadKey),
    dhFactorization: "[a*K,g,K*b,b*A] mod29",
  },
  lead: {
    gp: leadGp,
    gp0: leadGp0,
    seeksGp0,
    p50Byte: tableBytes[leadGp0],
  },
  controls: {
    fourRuneWords,
    fixedTargetHits,
    signedFourRuneTargets: signedTargets,
    numberedAlphabetModes: modes,
    fixedReceiverHits,
    allA1PairCount: signedTargets.length * fourRuneWords,
    allA1HitCount: allA1Hits.length,
  },
  classification:
    "ROAD->LEAD is a post-discovery semantic/key checksum on an independently selected receiver. It strengthens the local ROAD candidate but does not source-select A1Z26 as a general cipher or define the next state transition.",
}, null, 2));
