"use strict";

/**
 * Exact-source GP29 word-rotor gate using the original 3301/1033 cuneiform numerals.
 * Single runnable test file. Node.js 22, no dependencies or writes.
 *
 * This is an adversarial decryption attempt; no unknown plaintext is claimed.
 * Word-local period-6 phase schedules are tested by a shared five-component
 * invariant, independent of all six secret phase choices and per-word offsets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/lp2-transcription.txt");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.pages.length, 58);

const gp = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (a, n) => ((a % n) + n) % n;

/** Split at *printed* word separators; slash/newline joining is performed only by the caller. */
function runicWords(s) {
  const words = [];
  let word = [];
  for (const c of s) {
    if (gp.has(c)) word.push(gp.get(c));
    else if (word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const pages = raw.split("%");
assert.equal(pages.length, 57, "transcription omits rune-free p50");
pages.splice(50, 0, "");
const unknownWords = runicWords(pages.slice(0, 56).join("").replace(/[\r\n/]/g, ""));
assert.equal(unknownWords.length, 2896);
assert.equal(unknownWords.flat().length, 12956);
const sourceRunes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.deepEqual(unknownWords.flat(), sourceRunes, "all unmodified original ciphertext glyphs");
const solvedWords = solved.sections.flatMap(section => runicWords(section.source_text));

/**
 * The historical numbers are prime and appear in the source cuneiform chapter.
 * The following particular extraction is POST-HOC, not an authored opcode.
 */
function base29Digits(n) {
  const digits = [];
  while (n > 0) {
    digits.unshift(n % 29);
    n = Math.floor(n / 29);
  }
  return digits;
}
const d3301 = base29Digits(3301);
const d1033 = base29Digits(1033);
assert.deepEqual(d3301, [3, 26, 24]);
assert.deepEqual(d1033, [1, 6, 18]);
const lag = mod(d3301[2] - d1033[2], 29);
const slope = d1033[0] - d3301[0];
const intercept = d3301[2];
assert.deepEqual([lag, slope, intercept], [6, -2, 24]);
const T = x => mod(intercept + slope * x, 29);
const cycle = [];
const logT = new Map();
let x = 0;
for (let i = 0; i < 28; i++) {
  assert.equal(logT.has(x), false, "should traverse all non-H GP29 runes");
  logT.set(x, i);
  cycle.push(x);
  x = T(x);
}
assert.equal(x, 0, "T has one orbit of length 28");
assert.equal(T(8), 8, "H is the sole fixed point");
assert.equal(logT.has(8), false);
const power = corpus.runes.map((_, rune) => {
  const out = [rune];
  for (let k = 1; k < 28; k++) out.push(T(out[k - 1]));
  assert.equal(T(out[27]), rune);
  return out;
});

let echoPairs = 0, echoes = 0, insidePairs = 0, doublets = 0;
for (const word of unknownWords) {
  for (let j = 1; j < word.length; j++) {
    insidePairs++;
    if (word[j] === word[j - 1]) doublets++;
  }
  for (let j = 6; j < word.length; j++) {
    echoPairs++;
    if (word[j] === T(word[j - 6])) echoes++;
  }
}
assert.deepEqual([echoPairs, echoes, insidePairs, doublets], [1290, 80, 10060, 63]);
assert.equal(sourceRunes.filter(v => v === 8).length, 414);

const longest = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function encodeLatin(text) {
  const s = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = longest.find(item => s.startsWith(item.s, i));
    if (!pair) return null;
    out.push(pair.i);
    i += pair.s.length;
  }
  return out;
}

const shakespeareWords = new Map();
for (const m of shakespeare.matchAll(/[A-Za-z]{3,}/g)) {
  const word = encodeLatin(m[0]);
  if (word) shakespeareWords.set(word.join(","), word);
}
assert.equal(shakespeare.length, 300000);
assert.equal(shakespeareWords.size, 5599);
const knownLong = solvedWords.filter(w => w.length >= 5);
assert.equal(knownLong.length, 228);
assert.equal(knownLong.filter(w => shakespeareWords.has(w.join(","))).length, 120);

/** Complete 28-shift key search for the source-digit six-position rotor hypothesis. */
function wordHasEnglishInverse(word, seed) {
  for (let shift = 0; shift < 28; shift++) {
    const plain = word.map((c, j) =>
      power[c][mod(-shift - seed[j % 6] - Math.floor(j / 6), 28)]);
    if (shakespeareWords.has(plain.join(","))) return true;
  }
  return false;
}
const longUnknown = unknownWords.filter(w => w.length >= 5);
assert.equal(longUnknown.length, 1132);
const seed3301first = [...d3301, ...d1033];
const seed1033first = [...d1033, ...d3301];
const countForSeed = seed =>
  longUnknown.filter(w => wordHasEnglishInverse(w, seed)).length;
const direct3301First = countForSeed(seed3301first);
const direct1033First = countForSeed(seed1033first);
assert.equal(direct3301First, 0);
assert.equal(direct1033First, 0);

/**
 * In ANY model C_j = T^(s_word + a_(j mod 6) + floor(j/6))(P_j),
 * the 5-vector of differences log_T(C_j)-log_T(P_j) relative to j=0
 * is shared across all words regardless of the unknown phases or s_word.
 * At j>=6 the same relative phase must recur, increased by floor(j/6).
 * H = index 8 is excluded from this register because T fixes H.
 */
const lexicon = new Map(shakespeareWords);
for (const word of solvedWords) lexicon.set(word.join(","), word);
const dictionaries = new Map();
for (const word of lexicon.values()) {
  if (word.length < 6 || word.includes(8)) continue;
  if (!dictionaries.has(word.length)) dictionaries.set(word.length, []);
  dictionaries.get(word.length).push(word);
}

function signatureGroups(cipherWords) {
  const distinct = new Map(cipherWords
    .filter(w => w.length >= 7 && !w.includes(8))
    .map(w => [w.join(","), w]));
  const groups = new Map();
  let accepted = 0;
  for (const [identity, word] of distinct) {
    for (const candidate of dictionaries.get(word.length) || []) {
      const r = word.map((c, j) => mod(logT.get(c) - logT.get(candidate[j]), 28));
      let valid = true;
      for (let j = 6; j < r.length; j++) {
        if (r[j] !== mod(r[j % 6] + Math.floor(j / 6), 28)) {
          valid = false;
          break;
        }
      }
      if (!valid) continue;
      accepted++;
      const signature = r.slice(1, 6).map(z => mod(z - r[0], 28)).join(",");
      if (!groups.has(signature)) groups.set(signature, new Set());
      groups.get(signature).add(identity);
    }
  }
  return {distinct: distinct.size, accepted, groups};
}

const originalSignatures = signatureGroups(unknownWords);
const supports = [...originalSignatures.groups.values()].map(group => group.size);
const maxSupport = Math.max(0, ...supports);
const atLeastTwo = supports.filter(n => n >= 2).length;
const atLeastThree = supports.filter(n => n >= 3).length;
assert.deepEqual([
  originalSignatures.distinct, originalSignatures.accepted,
  originalSignatures.groups.size, maxSupport, atLeastTwo, atLeastThree
], [413, 4564, 4563, 2, 1, 0]);

// Positive: a global, UNKNOWN six-phase vector plus changing word keys is
// recovered from historical solved GP words without providing the vector to the detector.
const plantSeed = [2, 7, 11, 17, 23, 3];
const nativePlants = [...new Map(solvedWords
  .filter(w => w.length >= 7 && !w.includes(8) && shakespeareWords.has(w.join(",")))
  .map(w => [w.join(","), w])).values()];
assert.equal(nativePlants.length, 20);
const ciphertextPlants = nativePlants.map((w, index) =>
  w.map((plain, j) =>
    power[plain][mod(17 * index + plantSeed[j % 6] + Math.floor(j / 6), 28)]));
const planted = signatureGroups(ciphertextPlants);
const plantedSignature = plantSeed.slice(1)
  .map(v => mod(v - plantSeed[0], 28)).join(",");
const plantedSupport = planted.groups.get(plantedSignature)?.size || 0;
assert.equal(plantedSupport, 20);
assert.equal(Math.max(...[...planted.groups.values()].map(group => group.size)), 20);

console.log(JSON.stringify({
  classification: "bounded exclusion; no recovered unknown plaintext",
  original: {runes: 12956, words: 2896, doublets, insidePairs,
    echoPairs, echoes, fixedHCount: 414},
  sourceNumerals: {"3301": d3301, "1033": d1033,
    postSelectedAffine: {lag, slope, intercept, cycle, fixedRune: "H"}},
  directSixDigitRotor: {longWords: longUnknown.length,
    knownEnglishControl: `120/${knownLong.length}`,
    matches3301First: direct3301First,
    matches1033First: direct1033First},
  allSecretSixPhaseRotor: {distinctOriginalLongNoHWords: originalSignatures.distinct,
    survivingDictionaryAlignments: originalSignatures.accepted,
    independentPhaseSignatures: originalSignatures.groups.size,
    maxIndependentWordSupport: maxSupport, signaturesWithTwoOrMoreWords: atLeastTwo,
    signaturesWithThreeOrMoreWords: atLeastThree,
    planted: {knownWords: nativePlants.length,
      recoveredWordsAtUniqueGlobalPhase: plantedSupport,
      recoveredGlobalPhase: plantedSignature}}
}, null, 2));
