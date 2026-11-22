#!/usr/bin/env node
"use strict";

/**
 * Exact original-source red-title punctuation/word register and finite
 * historical-book phrase gate, Director #453.
 *
 * Run from repository root:
 * node sims/lp2_red_title_ordered_phrase_source_sft.cjs
 *
 * This does not search ciphertext keys or claim an LP2 decoder.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const read = (path) => fs.readFileSync(path, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const printed = read("resources/lp2-transcription.txt").split("%");
const tokenTable = corpus.translit.map((token, index) => ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);
const titleStarts = [
  [0, 0, 13], [3, 0, 16], [8, 0, 12], [15, 9, 11],
  [23, 0, 16], [27, 0, 19], [33, 0, 10], [33, 91, 8],
  [40, 0, 8]
];

/** @param {number} page @param {number} start @param {number} count */
function originalPrintedWords(page, start, count) {
  const source = printed[page > 50 ? page - 1 : page];
  assert.equal(typeof source, "string");
  let seen = 0;
  let word = [];
  const words = [];
  for (const ch of source) {
    const index = corpus.runes.indexOf(ch);
    if (index >= 0) {
      if (seen >= start && seen < start + count) word.push(index);
      seen++;
    } else if (seen >= start && seen <= start + count && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  assert.equal(words.flat().length, count);
  return words;
}

const titles = titleStarts.map(([page, start, count]) => {
  const annotation = ink.pages.find((x) => x.page === page);
  const span = annotation?.red_spans?.find((x) => x.start === start && x.length === count);
  assert.ok(span, "Missing original red span p" + page + "@" + start);
  const words = originalPrintedWords(page, start, count);
  assert.equal(words.flat().map((i) => corpus.runes[i]).join(""), span.runes);
  return {page, start, count, words};
});
assert.deepEqual(titles.map((t) => t.words.map((w) => w.length).join("-")),
  ["8-5", "2-11-3", "4-8", "4-2-5", "2-6-3-5",
    "3-12-4", "2-8", "3-5", "3-5"]);
assert.equal(ink.pages.flatMap((p) => p.red_spans || []).length, 18);
assert.equal(ink.pages.flatMap((p) => p.red_spans || [])
  .reduce((n, s) => n + s.length, 0), 225);
assert.equal(titles.reduce((n, t) => n + t.count, 0), 113);
const solved57 = originalPrintedWords(57, 0, 7);
assert.equal(solved57.flat().map((i) => corpus.translit[i]).join(""), "PARABLE");
assert.equal(originalPrintedWords(56, 0, 5).map((w) => w.length).join("-"), "2-3");

/** @param {string} word @param {boolean} ing */
function encode(word, ing) {
  const s = word.toLowerCase().replaceAll("q", "cw")
    .replaceAll("v", "u").replaceAll("k", "c").replaceAll("z", "s");
  const ids = [];
  for (let i = 0; i < s.length;) {
    if (ing && s.startsWith("ing", i)) {
      ids.push(21); // Source-confirmed ᛝ = ING alternate.
      i += 3;
      continue;
    }
    const found = tokenTable.find((t) => s.startsWith(t.token, i));
    if (!found) return null;
    ids.push(found.index);
    i += found.token.length;
  }
  return ids;
}

/** @param {number[]} cipher @param {number[]} plain */
function bijection(cipher, plain) {
  const forward = new Map();
  const reverse = new Map();
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const p = plain[i];
    if ((forward.has(c) && forward.get(c) !== p)
      || (reverse.has(p) && reverse.get(p) !== c)) return null;
    forward.set(c, p);
    reverse.set(p, c);
  }
  return {forward, reverse};
}

/** @param {ReturnType<typeof bijection>} a @param {ReturnType<typeof bijection>} b */
function compatible(a, b) {
  assert.ok(a && b);
  for (const [c, p] of b.forward) if (a.forward.has(c) && a.forward.get(c) !== p) return false;
  for (const [p, c] of b.reverse) if (a.reverse.has(p) && a.reverse.get(p) !== c) return false;
  return true;
}

/** @param {string} path */
function sourceWords(path) {
  let s = read(path);
  if (path.includes("cicada2012_blake_chorus"))
    s = s.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0];
  if (path.includes("2013-book-of-law"))
    s = s.replace(/^\s*\d+\.\s*/gm, ""); // Remove printed chapter verse labels.
  if (path.includes("lp1-plaintext-reference"))
    s = s.replace(/^#.*$/gm, "");
  return s.match(/[A-Za-z]+/g) || [];
}

const sources = [
  "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
  "resources/control/cicada2012_blake_chorus.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const expected = [
  [[0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,1]],
  [[0,0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,0,1]],
  [[0,0,0,0,0,0,1,0,9],[0,0,0,0,0,0,1,0,9]],
  [[0,0,0,0,0,0,2,3,18],[0,0,0,0,0,0,2,3,19]],
  [[0,0,0,0,0,0,1,3,14],[0,0,0,0,0,0,1,3,15]],
  [[0,0,0,0,0,0,0,0,5],[0,0,0,0,0,0,0,0,5]]
];
for (let src = 0; src < sources.length; src++) {
  const path = sources[src];
  const words = sourceWords(path);
  for (const ing of [false, true]) {
    const candidates = words.map((word) => encode(word, ing));
    const all = titles.map((title) => {
      const matches = [];
      for (let offset = 0; offset + title.words.length <= candidates.length; offset++) {
        const trial = candidates.slice(offset, offset + title.words.length);
        if (trial.some((word, i) => !word || word.length !== title.words[i].length)) continue;
        const mapping = bijection(title.words.flat(), trial.flat());
        if (mapping) matches.push({offset, mapping,
          phrase: words.slice(offset, offset + title.words.length).join(" ")});
      }
      return matches;
    });
    const counts = all.map((matches) => matches.length);
    assert.deepEqual(counts, expected[src][Number(ing)],
      "Original source/title register changed for " + path + ", ING=" + ing);
    const crossPairs = [];
    for (const index of [6, 7]) {
      for (const first of all[index]) {
        for (const second of all[8]) {
          if (first.offset < second.offset && compatible(first.mapping, second.mapping))
            crossPairs.push([first.phrase, second.phrase]);
        }
      }
    }
    assert.equal(crossPairs.length, 0,
      "No 2013-source ordered p33→p40 shared-bijection two-title match");
    console.log(path + " ING=" + ing + " sourceWords=" + words.length
      + " nine-title-substitution-matches=" + counts.join(",")
      + " consecutive-order-p33-to-p40-shared-bijection=" + crossPairs.length);
  }
}

// Positive control: any bijectively substituted source phrase must recover
// an exact candidate after the pattern/equality test, with no key knowledge.
const library = sourceWords("resources/external/2013-book-of-law-I.txt");
const at = library.findIndex((word, i) => word.toLowerCase() === "thou"
  && library[i + 1]?.toLowerCase() === "hadit");
assert.ok(at >= 0);
const known = library.slice(at, at + 2).map((word) => encode(word, false));
assert.equal(known.flat().length, 8);
const plant = known.flat().map((i) => (i + 9) % 29);
const test = bijection(plant, known.flat());
assert.ok(test);
console.log("Controlled source phrase THOU HADIT: independent 29-label bijection recovered pattern.");
console.log("SFT PASS: nine ordered red headings/18 original spans checked, source-fixed negative gate.");
