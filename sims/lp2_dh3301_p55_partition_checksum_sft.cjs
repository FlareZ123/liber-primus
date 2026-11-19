"use strict";

/**
 * DH3301 p55 partition checksum.
 *
 * Frozen consequence:
 * 1. p28/p27 independently supplies 3301 and base59 selects p55->p56.
 * 2. solved p57 says to shed our own circumferences.
 * 3. For every LP2 rune-bearing page, remove first and last rune from each
 *    printed word (singletons contribute no interior rune).
 * 4. Encode [interiorCount, exteriorCount] as two digits in radix=pageRuneCount.
 * Success requires 3301 to identify p55 uniquely.
 *
 * Node.js 22 / CommonJS.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} page @returns {string} */
function physicalPageText(page) {
  assert.notEqual(page, 50);
  const parts = transcription.split(/^\s*%\s*$/mu);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {number[]} */
function printedWordLengths(text) {
  const lengths = [];
  let current = 0;
  for (const ch of text) {
    if (runeIndex.has(ch)) {
      current += 1;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line wrapping/whitespace does not terminate a printed word.
    } else if (current > 0) {
      lengths.push(current);
      current = 0;
    }
  }
  if (current > 0) lengths.push(current);
  return lengths;
}

/**
 * Literal word-circumference shedding.
 * @param {number[]} lengths
 * @returns {{total:number,interior:number,exterior:number}}
 */
function partition(lengths) {
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const interior = lengths.reduce((sum, length) => sum + Math.max(0, length - 2), 0);
  return {total, interior, exterior: total - interior};
}

/** @param {number} high @param {number} low @param {number} radix @returns {number} */
function encodePair(high, low, radix) {
  assert.ok(high >= 0 && high < radix);
  assert.ok(low >= 0 && low < radix);
  return high * radix + low;
}

/** @param {string} text @returns {string} */
function transliterateRunes(text) {
  return [...text]
    .map((ch) => {
      const value = runeIndex.get(ch);
      return value === undefined ? ch : corpus.translit[value];
    })
    .join("");
}

const signedBody = signed
  .slice(signed.indexOf("Hello."), signed.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/gu, "");
const sourceWords =
  signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/gu) || [];
assert.equal(sourceWords.length, 43);
assert.match(signed, /\n3301\n/u);

const parable = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(parable);
const p57Translit = transliterateRunes(parable.source_text)
  .toUpperCase()
  .replace(/[^A-Z]+/gu, " ");
assert.match(p57Translit, /WE MUST SHED OUR OWN CIRCUMFERENCES/u);

const rows = [];
for (const page of corpus.pages) {
  if (page.page === 50 || page.indices.length === 0) continue;
  const lengths = printedWordLengths(physicalPageText(page.page));
  const counts = partition(lengths);
  assert.equal(counts.total, page.indices.length, `page ${page.page} rune count mismatch`);
  let encoded = null;
  if (counts.interior < counts.total && counts.exterior < counts.total) {
    encoded = encodePair(counts.interior, counts.exterior, counts.total);
  }
  rows.push({
    page: page.page,
    wordCount: lengths.length,
    wordLengths: lengths,
    ...counts,
    encoded,
  });
}

const hits = rows.filter((row) => row.encoded === 3301);
assert.equal(hits.length, 1);
const p55 = hits[0];
assert.equal(p55.page, 55);
assert.deepEqual(p55.wordLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(
  {
    total: p55.total,
    interior: p55.interior,
    exterior: p55.exterior,
    wordCount: p55.wordCount,
  },
  {total:76, interior:43, exterior:33, wordCount:17}
);
assert.equal(43 * 76 + 33, 3301);
assert.deepEqual([Math.floor(3301 / 76), 3301 % 76], [43,33]);

// The same constant's already independently selected base59 reading lands on
// the terminal page pair before this within-p55 consequence is interpreted.
assert.deepEqual([Math.floor(3301 / 59), 3301 % 59], [55,56]);

// Stronger page census: p55 is also the only LP2 page whose total rune count
// makes the quotient of 3301 equal the independently fixed 43 source words.
const quotient43Pages = rows
  .filter((row) => Math.floor(3301 / row.total) === sourceWords.length)
  .map((row) => row.page);
assert.deepEqual(quotient43Pages, [55]);

// Remainder33 is a valid zero-based source index; record it without using it
// as a decoder instruction.
assert.equal(sourceWords[33].toUpperCase(), "WILL");

console.log(JSON.stringify({
  status: "PASS",
  source: {
    constant: 3301,
    authenticatedWordCount: sourceWords.length,
    p57Instruction: "SHED OUR OWN CIRCUMFERENCES",
  },
  terminalNavigation: {
    base59Digits: [Math.floor(3301 / 59), 3301 % 59],
    pages: [55,56],
  },
  p55: {
    wordLengths: p55.wordLengths,
    totalRunes: p55.total,
    interiors: p55.interior,
    exteriors: p55.exterior,
    base76Digits: [p55.interior,p55.exterior],
    recomposed: p55.encoded,
  },
  fullPageControl: {
    runeBearingPages: rows.length,
    exact3301PartitionHits: hits.map((row) => row.page),
    quotient43Pages,
  },
  remainder33SourceWord: sourceWords[33].toUpperCase(),
  decision:
    "3301 uniquely re-encodes p55's independently defined shed-circumference 43/33 partition in radix76, after base59 already selects p55/p56. This authenticates the partition counts; it does not yet define a reversible transform for the 33 exteriors.",
}, null, 2));
