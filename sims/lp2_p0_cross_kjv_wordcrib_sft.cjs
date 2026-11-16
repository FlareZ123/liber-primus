"use strict";

/**
 * Original-input KJV whole-word-length crib SFT.
 * The cross imagery on LP2 p0–2 motivates one finite, historically available
 * Bible-quotation source. The whole-book run is an overinclusive control.
 * The source is the exact 2018 GITenberg 10.txt blob listed below.
 * Run with Node 22 and the 2018 source text as the first argument.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const KJV_BLOB_SHA = "d3c6c679342d594cf3a9cf7629fadc1cb4a7ee55";
const SEED = 7;
const RADIX = 32;
const REMOVE = RADIX ** (SEED - 1);

/** @param {string} word Upper-case Latin word. @returns {number} */
function gpLength(word) {
  return (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}

/** @param {Buffer} buf @returns {string} */
function gitSha(buf) {
  return crypto.createHash("sha1")
    .update("blob " + buf.length + "\0")
    .update(buf)
    .digest("hex");
}

/**
 * Every 7-gram is indexed; longer exact matches are extended in both
 * directions and de-duplicated. Rune orthography is fixed before testing.
 * @param {number[]} source GP rune-length tape of the historical source.
 * @param {number[]} target Original LP2 GP rune-length tape.
 * @returns {{best:{count:number,sourceStart:number,targetStart:number},
 *   tenOrMore:Array<{count:number,sourceStart:number,targetStart:number}>}}
 */
function longestWordMatches(source, target) {
  assert(source.length >= SEED && target.length >= SEED);
  const index = new Map();
  const initial = (a) => {
    let k = 0;
    for (let j = 0; j < SEED; j++) k = k * RADIX + a[j];
    return k;
  };
  let key = initial(target);
  for (let i = 0; i + SEED <= target.length; i++) {
    if (i > 0) key = (key - target[i - 1] * REMOVE) * RADIX + target[i + SEED - 1];
    const matches = index.get(key) || [];
    matches.push(i);
    index.set(key, matches);
  }
  key = initial(source);
  let best = { count: 0, sourceStart: -1, targetStart: -1 };
  const tenOrMore = new Map();
  for (let i = 0; i + SEED <= source.length; i++) {
    if (i > 0) key = (key - source[i - 1] * REMOVE) * RADIX + source[i + SEED - 1];
    for (const j of (index.get(key) || [])) {
      let a = i, b = j, n = SEED;
      while (a > 0 && b > 0 && source[a - 1] === target[b - 1]) {
        a--; b--; n++;
      }
      while (a + n < source.length && b + n < target.length
          && source[a + n] === target[b + n]) n++;
      const item = { count: n, sourceStart: a, targetStart: b };
      if (n > best.count) best = item;
      if (n >= 10) tenOrMore.set(a + ":" + b, item);
    }
  }
  return {
    best,
    tenOrMore: [...tenOrMore.values()].sort((a, b) => b.count - a.count),
  };
}

/**
 * @param {Buffer} bible Byte-exact GITenberg Bible 10.txt.
 * @param {string} transcript Native LP2 rune transcript.
 * @returns {object}
 */
function run(bible, transcript) {
  assert.equal(gitSha(bible), KJV_BLOB_SHA, "KJV source edition changed");
  const corpus = parseLP2Words(transcript, 55);
  assert.equal(corpus.runeCount, 12956);
  assert.equal(corpus.words.length, 2896);
  assert.equal(corpus.crossPageWords, 32);
  const original = corpus.words.map((w) => w.length);
  const firstThree = corpus.words.filter((w) => w.startPage <= 2 && w.endPage <= 2);
  assert.equal(firstThree.length, 158);
  assert.equal(firstThree.reduce((n, w) => n + w.length, 0), 729);
  const kjvWords = (bible.toString("utf8").match(/[A-Za-z]+/g) || [])
    .map((s) => s.toUpperCase());
  assert.equal(kjvWords.length, 794918);
  const lengths = kjvWords.map(gpLength);
  const p0 = longestWordMatches(lengths, firstThree.map((w) => w.length));
  const book = longestWordMatches(lengths, original);
  const positive = longestWordMatches(lengths, lengths.slice(300000, 300016));
  assert.equal(positive.best.count, 16, "native-GP planted source quote failed");
  assert.equal(p0.best.count, 9, "p0–2 reference drift");
  assert.equal(book.best.count, 11, "whole-book reference drift");
  assert.equal(book.tenOrMore.length, 17, "inventory drift");
  return {
    status: "FINITE NEGATIVE: no unknown plaintext or key",
    source: "KJV 10.txt, GITenberg commit e876c82a7299f0615ba035607f1c75d7945acc04",
    sourceBlobSha: KJV_BLOB_SHA,
    sourceWords: lengths.length,
    originalRuneCount: corpus.runeCount,
    originalWords: corpus.words.length,
    p0to2: {
      runes: 729, words: 158,
      longest: p0.best.count,
      candidateBibleWords: kjvWords.slice(p0.best.sourceStart,
        p0.best.sourceStart + p0.best.count).join(" "),
    },
    allUnsolved: {
      longest: book.best.count,
      atPage: corpus.words[book.best.targetStart].startPage,
      candidateBibleWords: kjvWords.slice(book.best.sourceStart,
        book.best.sourceStart + book.best.count).join(" "),
      tenOrMoreMatches: book.tenOrMore.length,
      longVerbatimCribs12PlusWords: book.tenOrMore.filter((x) => x.count >= 12).length,
    },
    nativePlanted16WordPositive: positive.best.count,
    scope: "Excludes exact sequential GP word lengths from the frozen KJV; "
      + "paraphrase, translated source, changed segmentation and nonlinear encodings remain open",
  };
}

if (require.main === module) {
  const sourcePath = process.argv[2];
  assert(sourcePath, "Provide exact GITenberg 10.txt as the first argument");
  const source = fs.readFileSync(sourcePath);
  const transcript = fs.readFileSync(path.join(__dirname, "..", "resources",
    "liber-primus", "lp2-transcription.txt"), "utf8");
  console.log(JSON.stringify(run(source, transcript), null, 2));
}
module.exports = { gpLength, gitSha, longestWordMatches, run };
