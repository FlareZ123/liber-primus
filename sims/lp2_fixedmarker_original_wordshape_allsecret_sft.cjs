"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const ALPHABET = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const INDEX = new Map(ALPHABET.map((s, i) => [s, i]));
const PROSE = ["resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"];
const TOKENS = /TH|NG|EO|OE|AE|IA|EA|./g;
const RUNE = /[\u16A0-\u16FF]/u;

/** @param {string} word @returns {number[]} */
function gp(word) {
  return (word.toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U")
    .replace(/Z/g, "S").match(TOKENS) || []).map((s) => {
      const index = INDEX.get(s);
      assert.notEqual(index, undefined);
      return index;
    });
}

/** @param {string} text @returns {number[][]} */
function nativeWords(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(gp);
}

/**
 * The original printed words continue across physical pages and line wraps.
 * Marks are the second rune in same-physical-page ciphertext doublets.
 * @param {string} raw
 */
function originalWords(raw) {
  const pages = raw.split("%").slice(0, 55);
  assert.equal(pages.length, 55);
  const words = [], stream = [], lengths = Array(55).fill(0);
  let word = [], marks = [], blind = [], prev = null, page = 0;
  function finish() {
    if (!word.length) return;
    words.push({runes: word, marks, blind});
    word = []; marks = []; blind = [];
  }
  for (const ch of pages.join("%")) {
    if (RUNE.test(ch)) {
      if (prev && prev.page === page && prev.rune === ch) marks.push(word.length);
      if (!prev || prev.page !== page) blind.push(word.length);
      word.push(ch); stream.push(ch); lengths[page]++;
      prev = {page, rune: ch};
    } else if (ch === "%") page++;
    else if (ch === "/" || /\s/u.test(ch)) { /* line break */ }
    else finish();
  }
  finish();
  return {words, stream, lengths};
}

/** @param {number[]} plain @param {number[]} lengths @param {number} marker */
function testReversiblePlant(plain, lengths, marker) {
  const decoded = [], encoded = [];
  let i = 0;
  for (const length of lengths) {
    let previous = -1;
    for (let j = 0; j < length; j++, i++) {
      const p = plain[i];
      const rank = p < marker ? p : p - 1;
      const c = j === 0 ? (p + 17) % 29 :
        (previous + (p === marker ? 0 : 1 + ((rank + 17 * i) % 28))) % 29;
      const step = (c - previous + 29) % 29;
      const recovered = j === 0 ? (c + 12) % 29 :
        step === 0 ? marker :
        (() => {
          const r = (step - 1 - (17 * i) % 28 + 56) % 28;
          return r < marker ? r : r + 1;
        })();
      encoded.push(c); decoded.push(recovered);
      if (j > 0) assert.equal(c === previous, p === marker);
      previous = c;
    }
  }
  assert.equal(i, plain.length);
  assert.deepEqual(decoded, plain);
  return encoded;
}

/** @param {number[]} word @param {number} symbol @returns {bigint} */
function maskFor(word, symbol) {
  return word.reduce((mask, rune, j) =>
    rune === symbol ? mask | (1n << BigInt(j)) : mask, 0n);
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const source = originalWords(read("resources/lp2-transcription.txt"));
  const unchanged = corpus.pages.filter((p) => p.page <= 55)
    .flatMap((p) => p.indices.map((i) => corpus.runes[i]));
  assert.deepEqual(source.stream, unchanged);
  assert.equal(source.stream.length, 12956);
  assert.equal(source.words.length, 2896);
  assert.equal(source.lengths.length, 55);
  const events = source.words.reduce((n, w) => n + w.marks.length, 0);
  const markedWords = source.words.filter((w) => w.marks.length);
  const starts = markedWords.reduce((n, w) =>
    n + w.marks.filter((x) => x === 0).length, 0);
  const blindCount = source.words.reduce((n, w) => n + w.blind.length, 0);
  assert.deepEqual([events, markedWords.length, starts, blindCount], [86,85,23,55]);
  assert.equal(source.words[1476].runes.length, 12);
  assert.deepEqual(source.words[1476].marks, [5,11]);

  const native = PROSE.map((file) => nativeWords(read(file)));
  assert.deepEqual(native.map((v) => v.reduce((n, w) => n + w.length, 0)),
    [63114,218800,324630]);
  const plant = native[1].flat().slice(0, source.stream.length);
  for (const label of ["EA","G","N"])
    testReversiblePlant(plant, source.lengths, INDEX.get(label));

  const additional = read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/).map((line) => line.match(/^([a-z]+)\s+\d+$/i)?.[1])
    .filter(Boolean).map(gp);
  const vocabulary = new Map();
  for (const word of [...native.flatMap((list) => list), ...additional]) {
    const len = word.length;
    if (!len) continue;
    if (!vocabulary.has(len)) vocabulary.set(len, new Map());
    vocabulary.get(len).set(word.join(","), word);
  }

  const masksByLength = new Map();
  for (const [length, types] of vocabulary) {
    const masks = Array.from({length:29}, () => new Set());
    for (const word of types.values())
      for (let symbol = 0; symbol < 29; symbol++)
        masks[symbol].add(maskFor(word, symbol).toString());
    masksByLength.set(length, masks);
  }
  const lexicalSupported = Array(29).fill(0), missingWitness = Array(29).fill(null);
  source.words.forEach((word, wi) => {
    if (!word.marks.length) return;
    const len = word.runes.length;
    const full = (1n << BigInt(len)) - 1n;
    const blind = word.blind.reduce((mask, j) => mask | (1n << BigInt(j)), 0n);
    const required = word.marks.reduce((mask, j) => mask | (1n << BigInt(j)), 0n);
    for (let symbol = 0; symbol < 29; symbol++) {
      const shapes = masksByLength.get(len)?.[symbol] || new Set();
      const compatible = [...shapes].some((shape) =>
        (((BigInt(shape) ^ required) & (full ^ blind)) === 0n));
      if (compatible) lexicalSupported[symbol]++;
      else if (!missingWitness[symbol])
        missingWitness[symbol] = {wordIndex: wi, wordLength: len, marks: word.marks};
    }
  });

  // Grant an arbitrary hidden marker on each page's first rune.
  // A window containing the original plaintext must have between 86 and 141
  // instances of the same marker, even when its cipher state changes at will.
  const N = source.stream.length;
  const minimum = Array(29).fill(Infinity), maximum = Array(29).fill(0);
  let windows = 0;
  for (const list of native) {
    const tape = list.flat(), count = Array(29).fill(0);
    for (let i = 0; i < tape.length; i++) {
      count[tape[i]]++;
      if (i >= N) count[tape[i-N]]--;
      if (i >= N-1) {
        windows++;
        for (let symbol = 0; symbol < 29; symbol++) {
          minimum[symbol] = Math.min(minimum[symbol], count[symbol]);
          maximum[symbol] = Math.max(maximum[symbol], count[symbol]);
        }
      }
    }
  }
  assert.equal(windows, 567679);
  const table = ALPHABET.map((rune, i) => ({
    rune, lexicalSupported: lexicalSupported[i],
    minimumInNativeWindows: minimum[i], maximumInNativeWindows: maximum[i],
    earliestMissingWord: missingWitness[i],
    passesBoth: lexicalSupported[i] === 85 &&
      minimum[i] <= 141 && maximum[i] >= 86,
  }));
  assert.deepEqual(table.filter((x) => x.lexicalSupported === 85).map((x) => x.rune),
    ["C","N","S","T","E","L","D","A","Y"]);
  assert.equal(table.filter((x) => x.passesBoth).length, 0);
  assert.equal(table.find((x) => x.rune === "EA").lexicalSupported, 80);
  assert.equal(table.find((x) => x.rune === "EA").minimumInNativeWindows, 35);

  console.log(JSON.stringify({
    hypothesis: "Same-page ciphertext doublet iff one fixed plaintext rune",
    original: {runes:N, words:source.words.length, events, markedWords:markedWords.length,
      wordInitialEvents:starts, pageFirstBlindPositions:blindCount},
    nativeWindows:windows,
    distinctVocabularyWords:[...vocabulary.values()].reduce((s, v) => s + v.size, 0),
    exactLexicalFits:table.filter((x) => x.lexicalSupported === 85),
    frequencyEligible:table.filter((x) =>
      x.minimumInNativeWindows <= 141 && x.maximumInNativeWindows >= 86),
    compatibleSymbols:table.filter((x) => x.passesBoth),
    positiveReversibleControls:["EA","G","N"],
  }, null, 2));
}

main();
