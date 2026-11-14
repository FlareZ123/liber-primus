"use strict";
/**
 * Exact word-length multiset crib screen for original LP2 printed pages and
 * nine original visual chapters. Node.js 22, CommonJS; read-only.
 *
 * A whole-word permutation preserves the histogram of plaintext word lengths.
 * This scans every equal-word-count contiguous source passage, granting
 * arbitrary word reordering separately inside each candidate page/chapter.
 * It makes no claim about a cipher that changes word boundaries or word lengths.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const PHYSICAL_CHAPTERS = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55],
];
const MAX_LENGTH = 64;
const RUNIC = /[\u16A0-\u16FF]/u;

/** @param {string} relativePath */
function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

/**
 * Preserve words across original page and line breaks.
 * @param {string} raw
 * @returns {Array<{length:number, startPage:number, endPage:number}>}
 */
function parseWords(raw) {
  const sourcePages = raw.split("%").slice(0, 55);
  assert.equal(sourcePages.length, 55);
  const words = [];
  let value = "";
  let startPage = 0;
  let lastRunePage = 0;
  let page = 0;

  function finish() {
    if (!value) return;
    words.push({length: [...value].length, startPage, endPage: lastRunePage});
    value = "";
  }

  for (const character of sourcePages.join("%")) {
    if (RUNIC.test(character)) {
      if (!value) startPage = page;
      value += character;
      lastRunePage = page;
    } else if (character === "%") {
      page++;
    } else if (character === "/" || /\s/u.test(character)) {
      // Typographical wrapping is not a word break.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
  assert.equal(words.filter((word) => word.startPage !== word.endPage).length, 32);
  return words;
}

/** @param {number} runePage */
function physicalPage(runePage) {
  return runePage >= 50 ? runePage + 1 : runePage;
}

/**
 * Existing historical source-length records use this conventional GP register:
 * V -> U, K/Q -> C, Z -> S, ING -> NG, and seven digraph contractions.
 * @param {string} token
 */
function gpLength(token) {
  return token.toUpperCase().replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "@")
    .replace(/TH|EO|NG|OE|AE|IA|EA/g, "@").length;
}

/** @param {string} text */
function sourceWords(text) {
  return text.match(/[A-Za-z]+/g) || [];
}

/**
 * @returns {Array<{name:string, lengths:number[]}>}
 */
function references() {
  const books = [
    ["Blake", "resources/external/blake-marriage-1906-gutenberg45315.txt"],
    ["Liber AL I", "resources/external/2013-liber-al-bookcode-I.txt"],
    ["Liber AL II", "resources/external/2013-liber-al-bookcode-II.txt"],
    ["Liber AL III", "resources/external/2013-liber-al-bookcode-III.txt"],
  ];
  const result = [];
  for (const [name, relativePath] of books) {
    const tokens = sourceWords(read(relativePath));
    result.push({name: name + " Latin", lengths: tokens.map((token) => token.length)});
    result.push({name: name + " GP29", lengths: tokens.map(gpLength)});
  }
  const agrippa = JSON.parse(read(
    "resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json"
  ));
  result.push({name: "Agrippa GP29", lengths: agrippa.word_lengths});
  assert.deepEqual(result.map((r) => r.lengths.length),
    [4609, 4609, 1897, 1897, 1968, 1968, 2002, 2002, 1682]);

  const crowley = JSON.parse(read(
    "resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json"
  ));
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(result[3 + i * 2].lengths, crowley.chapters[i].word_lengths);
  }
  return result;
}

/**
 * Find the closest unordered window of identical word count in a reference.
 * L1 distance of histogram vectors is zero iff all word lengths match as bags.
 * A single length replacement causes distance at least two.
 * @param {number[]} target
 * @param {number[]} source
 */
function scan(source, target) {
  const count = target.length;
  assert(count > 0 && count <= source.length);
  const wanted = new Int32Array(MAX_LENGTH);
  const current = new Int32Array(MAX_LENGTH);
  for (const n of target) {
    assert(n > 0 && n < MAX_LENGTH);
    wanted[n]++;
  }
  for (const n of source) assert(n > 0 && n < MAX_LENGTH);
  for (let i = 0; i < count; i++) current[source[i]]++;

  let delta = 0;
  for (let i = 0; i < MAX_LENGTH; i++) delta += Math.abs(wanted[i] - current[i]);
  let minimum = delta;
  let firstStart = 0;
  let exactCount = Number(delta === 0);
  for (let i = count; i < source.length; i++) {
    const leaving = source[i - count];
    const entering = source[i];
    delta -= Math.abs(wanted[leaving] - current[leaving]);
    current[leaving]--;
    delta += Math.abs(wanted[leaving] - current[leaving]);
    delta -= Math.abs(wanted[entering] - current[entering]);
    current[entering]++;
    delta += Math.abs(wanted[entering] - current[entering]);

    if (delta < minimum) {
      minimum = delta;
      firstStart = i - count + 1;
    }
    if (delta === 0) exactCount++;
  }
  return {minimum, firstStart, exactCount};
}

function main() {
  const words = parseWords(read("resources/liber-primus/lp2-transcription.txt"));
  const refs = references();
  const pageWords = Array.from({length: 55}, (_, page) =>
    words.filter((word) => word.startPage === page && word.endPage === page)
      .map((word) => word.length));
  const chapters = PHYSICAL_CHAPTERS.map(([lo, hi]) =>
    words.filter((word) => {
      const page = physicalPage(word.startPage);
      return page >= lo && page <= hi;
    }).map((word) => word.length));

  assert.equal(pageWords.length, 55);
  assert.equal(pageWords.reduce((n, page) => n + page.length, 0), 2864);
  assert.deepEqual(chapters.map((chapter) => chapter.length),
    [158, 255, 383, 437, 224, 326, 378, 669, 66]);
  assert.deepEqual(chapters.map((chapter) =>
    chapter.reduce((total, n) => total + n, 0)),
    [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

  // Strong positive controls: whole-word reversal preserves every original
  // donor-window length even though the order no longer matches.
  const plantedBlake = refs[1].lengths.slice(400, 452).reverse();
  const plantedCrowley = refs[6].lengths.slice(1111, 1148).reverse();
  assert.equal(scan(refs[1].lengths, plantedBlake).minimum, 0);
  assert.equal(scan(refs[1].lengths, plantedBlake).exactCount > 0, true);
  assert.equal(scan(refs[6].lengths, plantedCrowley).minimum, 0);

  let pageMatches = 0;
  let chapterMatches = 0;
  let minimumAnyPage = Infinity;
  for (const reference of refs) {
    const perPage = pageWords.map((wordLengths) =>
      scan(reference.lengths, wordLengths));
    const perChapter = chapters.map((wordLengths) =>
      scan(reference.lengths, wordLengths));
    pageMatches += perPage.reduce((n, hit) => n + hit.exactCount, 0);
    chapterMatches += perChapter.reduce((n, hit) => n + hit.exactCount, 0);
    minimumAnyPage = Math.min(minimumAnyPage, ...perPage.map((hit) => hit.minimum));
    process.stdout.write(JSON.stringify({
      source: reference.name,
      sourceWords: reference.lengths.length,
      chapterMinL1: perChapter.map((hit) => hit.minimum),
      pageMinL1: Math.min(...perPage.map((hit) => hit.minimum)),
      matchingPageWindows: perPage.reduce((n, hit) => n + hit.exactCount, 0),
      matchingChapterWindows: perChapter.reduce((n, hit) => n + hit.exactCount, 0),
    }) + "\n");
  }
  assert.equal(pageMatches, 0);
  assert.equal(chapterMatches, 0);
  assert.equal(minimumAnyPage, 2);
  process.stdout.write(JSON.stringify({
    originalPages: 55, originalWords: 2896, originalRunes: 12956,
    containedWords: 2864, pageCarryWords: 32, chapters: 9,
    sourceRegisters: refs.length, exactPageWindows: pageMatches,
    exactChapterWindows: chapterMatches, minimumAnyPageL1: minimumAnyPage,
    controls: "two arbitrary-permutation plants passed",
  }) + "\n");
}
main();
