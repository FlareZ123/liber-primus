"use strict";

/**
 * Source-selected p57 "shed circumferences" receiver gate.
 *
 * Derives:
 * 1. the strict interior of the p57 word DIVINITY: I U I N I T,
 * 2. all 55 strict word-interior runes from p57,
 * then tests the two direct receivers motivated by those exact source objects:
 * - IVINIT as the six-symbol seed for the pre-existing word-reset T6 feedback inverse;
 * - the 55 p57 interior runes as one additive page key per rune-bearing unknown page.
 *
 * Also checks the simpler IVINIT word-reset additive Vigenere receiver.
 *
 * Run: node sims/lp2_p57_divinity_within_source_gate_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const lexiconText = fs.readFileSync(
  path.join(root, "resources", "control", "english_wordfreq_textblob.txt"), "utf8");

const A = 29;
const mod = (n) => ((n % A) + A) % A;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((s, i) => [s, i]));
translitIndex.set("ING", translitIndex.get("NG"));
const {words, runeCount, crossPageWords} = parseSharedCorpus();

function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) current.push(v);
    else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
const p57Interiors = p57Words.flatMap((word) => word.slice(1, -1));
assert.equal(p57Interiors.length, 55);

const divinity = p57Words.find((word) =>
  word.map((v) => corpus.translit[v]).join("") === "DIUINITY");
assert.ok(divinity, "p57 must contain DIVINITY in GP spelling");
const divinityWithin = divinity.slice(1, -1);
assert.deepEqual(divinityWithin, [10, 1, 10, 9, 10, 16]);
assert.equal(divinityWithin.reduce((a, b) => a + b, 0), 56);
assert.equal(divinityWithin.reduce((a, b) => a + corpus.prime[b], 0), 184);

const multigraphs = ["ING", "TH", "EO", "NG", "OE", "AE", "IA", "EA"];
const alias = {K:"C", V:"U", Q:"C", Z:"S"};

function encodeEnglish(word) {
  const input = word.toUpperCase().replace(/[KVQZ]/g, (ch) => alias[ch]);
  const out = [];
  for (let i = 0; i < input.length;) {
    const part = multigraphs.find((g) => input.startsWith(g, i)) || input[i];
    const v = translitIndex.get(part);
    if (v === undefined) return null;
    out.push(v);
    i += part.length;
  }
  return out;
}

const dictionary = new Set();
for (const line of lexiconText.split(/\r?\n/)) {
  const m = /^([a-z]+) /.exec(line.trim());
  if (!m) continue;
  const encoded = encodeEnglish(m[1]);
  if (encoded) dictionary.add(encoded.join(","));
}

function ioc(decodedWords) {
  const counts = Array(A).fill(0);
  let n = 0;
  for (const word of decodedWords) {
    for (const v of word) {
      counts[v]++;
      n++;
    }
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function summarize(decodedWords) {
  let dictionaryHits = 0;
  let longestDictionaryRun = 0;
  let run = 0;
  for (const word of decodedWords) {
    if (dictionary.has(word.join(","))) {
      dictionaryHits++;
      run++;
      longestDictionaryRun = Math.max(longestDictionaryRun, run);
    } else {
      run = 0;
    }
  }
  return {
    ioc: ioc(decodedWords),
    dictionaryHits,
    longestDictionaryRun,
    sampleWords: decodedWords.slice(0, 16)
      .map((word) => word.map((v) => corpus.translit[v]).join(""))
  };
}

function wordValues(word) {
  return [...word.runes].map((rune) => {
    const v = runeIndex.get(rune);
    assert.notEqual(v, undefined);
    return v;
  });
}

const originalWords = words.map(wordValues);

function t6Decode(cipher, seed) {
  return cipher.map((value, j) => {
    const state = j < 6 ? seed[j] : cipher[j - 6];
    return mod(value - 24 + 2 * state);
  });
}

const t6 = originalWords.map((word) => t6Decode(word, divinityWithin));
const vigSubtract = originalWords.map((word) =>
  word.map((value, j) => mod(value - divinityWithin[j % 6])));
const vigAdd = originalWords.map((word) =>
  word.map((value, j) => mod(value + divinityWithin[j % 6])));

assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);

const runeBearingPages = corpus.pages.filter((page) => page.page < 56 && page.indices.length);
assert.equal(runeBearingPages.length, 55);
const keyByPhysicalPage = new Map(
  runeBearingPages.map((page, i) => [page.page, p57Interiors[i]]));

function pagewiseDecode(sign) {
  return words.map((word) => {
    const runes = wordValues(word);
    const pageSegments = [];
    for (let p = word.startPage; p <= word.endPage; p++) {
      const physical = p >= 50 ? p + 1 : p;
      pageSegments.push({physical});
    }
    // Cross-page words can contain at most one page turn in this source.
    if (word.startPage === word.endPage) {
      const physical = word.startPage >= 50 ? word.startPage + 1 : word.startPage;
      const k = keyByPhysicalPage.get(physical);
      return runes.map((value) => mod(value + sign * k));
    }

    // Reconstruct physical page membership from canonical page suffix/prefix lengths.
    const startPhysical = word.startPage >= 50 ? word.startPage + 1 : word.startPage;
    const endPhysical = word.endPage >= 50 ? word.endPage + 1 : word.endPage;
    const startPageRunes = corpus.pages.find((p) => p.page === startPhysical).indices;
    const endPageRunes = corpus.pages.find((p) => p.page === endPhysical).indices;
    let suffix = 0;
    for (let n = 1; n <= Math.min(runes.length, startPageRunes.length); n++) {
      if (runes.slice(0, n).every((v, i) => v === startPageRunes[startPageRunes.length - n + i])) {
        suffix = n;
      }
    }
    assert.ok(suffix > 0 && suffix < runes.length);
    assert.deepEqual(runes.slice(suffix), endPageRunes.slice(0, runes.length - suffix));
    const k0 = keyByPhysicalPage.get(startPhysical);
    const k1 = keyByPhysicalPage.get(endPhysical);
    return runes.map((value, i) => mod(value + sign * (i < suffix ? k0 : k1)));
  });
}

const result = {
  source: {
    p57WordCount: p57Words.length,
    p57InteriorRunes: p57Interiors.length,
    divinityWithin,
    divinityWithinTranslit: divinityWithin.map((v) => corpus.translit[v]).join(" "),
    divinityWithinIndexSum: divinityWithin.reduce((a, b) => a + b, 0),
    divinityWithinPrimeSum: divinityWithin.reduce((a, b) => a + corpus.prime[b], 0),
    unknownRuneBearingPages: runeBearingPages.map((page) => page.page)
  },
  baseline: summarize(originalWords),
  t6Seed: summarize(t6),
  wordResetVigenereSubtract: summarize(vigSubtract),
  wordResetVigenereAdd: summarize(vigAdd),
  p57InteriorPerPageSubtract: summarize(pagewiseDecode(-1)),
  p57InteriorPerPageAdd: summarize(pagewiseDecode(1))
};

assert.ok(Math.abs(result.baseline.ioc - 0.03447839786450569) < 1e-15);
assert.equal(result.baseline.dictionaryHits, 199);
assert.equal(result.t6Seed.dictionaryHits, 189);
assert.equal(result.wordResetVigenereSubtract.dictionaryHits, 196);
assert.equal(result.p57InteriorPerPageSubtract.dictionaryHits, 195);
assert.equal(result.p57InteriorPerPageAdd.dictionaryHits, 190);

console.log(JSON.stringify(result, null, 2));
