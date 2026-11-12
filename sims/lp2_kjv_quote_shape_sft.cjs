"use strict";

/**
 * Reproduce the original LP2 full-KJV quotation word-length crib gate.
 * Node.js 22+; requires network access to a commit-pinned public KJV edition.
 * Run from any working directory: node sims/lp2_kjv_quote_shape_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const KJV_COMMIT = "a9aa4e55afbb3e095f57e4b14cd1f22c5ee8d7c9";
const KJV_ROOT = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/${KJV_COMMIT}/`;
const EXPECTED = new Map([
  [9811, {length: 58, words: 14, max: 5}],
  [10211, {length: 68, words: 13, max: 6}],
  [10279, {length: 160, words: 34, max: 5}],
  [12522, {length: 70, words: 14, max: 5}]
]);

/** @param {string} word @returns {number} */
function gpWordLength(word) {
  const wordUpper = word.toUpperCase();
  let at = 0;
  let n = 0;
  while (at < wordUpper.length) {
    const match = /^(ING|TH|NG|EO|OE|AE|IA|EA)/u.exec(wordUpper.slice(at));
    at += match ? match[0].length : 1;
    n++;
  }
  return n;
}

/** @param {string} url @returns {Promise<any>} */
async function fetchJson(url) {
  const response = await fetch(url, {signal: AbortSignal.timeout(60000)});
  assert.ok(response.ok, `HTTP ${response.status} for ${url}`);
  return response.json();
}

/** @param {number[]} haystack @param {number[]} needle */
function matchLongestPrefix(haystack, needle) {
  let longest = 0;
  let full = 0;
  let at = -1;
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] !== needle[0]) continue;
    let length = 1;
    while (length < needle.length &&
      i + length < haystack.length &&
      haystack[i + length] === needle[length]) length++;
    if (length > longest) {
      longest = length;
      at = i;
    }
    if (length === needle.length) full++;
  }
  return {longest, full, at};
}

/** @returns {Map<number, number[]>} */
function originalQuotationShapes() {
  const corpus = parseSharedCorpus();
  assert.equal(corpus.runeCount, 12956);
  assert.equal(corpus.words.length, 2896);
  let offset = 0;
  const wordPositions = corpus.words.map(({length}) => {
    const item = {start: offset, end: offset + length, length};
    offset += length;
    return item;
  });
  const quotes = JSON.parse(fs.readFileSync(path.join(
    __dirname, "..", "resources", "liber-primus",
    "lp2-quote-punctuation-spans.json"), "utf8")).quotes;
  const shapes = new Map();
  for (const quote of quotes) {
    if (!EXPECTED.has(quote.start)) continue;
    const shape = wordPositions.filter(w =>
      w.start >= quote.start && w.end <= quote.end)
      .map(w => w.length);
    const expected = EXPECTED.get(quote.start);
    assert.equal(quote.end - quote.start, expected.length);
    assert.equal(shape.length, expected.words);
    assert.equal(shape.reduce((n, x) => n + x, 0), expected.length);
    shapes.set(quote.start, shape);
  }
  assert.equal(shapes.size, EXPECTED.size);
  return shapes;
}

/** @param {string} book @returns {Promise<{book:string, lengths:number[]}>} */
async function readBook(book) {
  const sourceName = book.replace(/\s+/gu, "");
  const document = await fetchJson(KJV_ROOT + sourceName + ".json");
  assert.ok(Array.isArray(document.chapters), sourceName);
  const lengths = [];
  for (const chapter of document.chapters) {
    for (const verse of chapter.verses) {
      for (const token of verse.text.match(/[A-Za-z]+/gu) || []) {
        lengths.push(gpWordLength(token));
      }
    }
  }
  return {book, lengths};
}

async function main() {
  const shapes = originalQuotationShapes();
  const books = await fetchJson(KJV_ROOT + "Books.json");
  assert.equal(books.length, 66);

  // A real 40-word passage must be recovered under the same GP conversion.
  const genesis = await readBook("Genesis");
  const plant = genesis.lengths.slice(0, 40);
  assert.equal(matchLongestPrefix(genesis.lengths, plant).longest, 40);
  assert.equal(matchLongestPrefix(genesis.lengths, [100, ...plant.slice(1)]).full, 0);

  const best = new Map([...shapes.keys()].map(start => [start, {longest: 0, book: "", at: -1}]));
  let totalWords = 0;
  for (let first = 0; first < books.length; first += 8) {
    const batch = await Promise.all(books.slice(first, first + 8).map(readBook));
    for (const {book, lengths} of batch) {
      totalWords += lengths.length;
      for (const [start, target] of shapes) {
        const found = matchLongestPrefix(lengths, target);
        assert.equal(found.full, 0, `complete quotation shape hit ${start} in ${book}`);
        if (found.longest > best.get(start).longest) {
          best.set(start, {longest: found.longest, book, at: found.at});
        }
      }
    }
  }
  console.log(`KJV edition SHA ${KJV_COMMIT}, 66 books, ${totalWords} tokens`);
  for (const [start, {longest, book, at}] of best) {
    console.log(`LP2 global rune ${start}: longest ${longest}/${shapes.get(start).length} KJV words; ${book} source-word offset ${at}; full matches 0`);
    assert.equal(longest, EXPECTED.get(start).max);
  }
  console.log("PASS: four original full-quotation shapes have zero exact KJV source matches.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
