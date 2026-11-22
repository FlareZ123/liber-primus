"use strict";

// Test whether the 56-word 2012 MIDI chorus supplies a base-56 book-coordinate
// path through the 56 unsolved LP2 pages. The operation is source-motivated,
// not established: GP29 prime-weight word sum -> page modulo 56 and printed
// word index floor(sum / 56), followed by strict interior extraction.
//
// Run from the repository root:
//   node sims/lp2-2012-chorus-base56-wordmap-gate.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const chorusSource = read("resources/control/cicada2012_blake_chorus.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const chorusText = chorusSource.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0];
const sourceWords = chorusText.match(/[A-Za-z]+/g) || [];
assert.equal(sourceWords.length, 56);

const printedSource = transcription.split("%");
assert.equal(printedSource.length, 57);

function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

const pages = Array.from({ length: 58 }, (_, p) =>
  p === 50 ? [] : printedWords(printedSource[p > 50 ? p - 1 : p])
);
assert.equal(pages.slice(0, 56).reduce((n, page) => n + page.length, 0) > 0, true);

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const source = word.toLowerCase()
    .replace(/v/g, "u")
    .replace(/k/g, "c")
    .replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({ token }) => source.startsWith(token, i));
    if (!hit) throw new Error("No GP token at " + word + ":" + source.slice(i));
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

function decodeRunes(runes) {
  return [...runes].map(rune => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1, "Unknown rune " + rune);
    return corpus.translit[index];
  }).join("");
}

const rows = sourceWords.map((word, sourceIndex) => {
  const indices = encodeWord(word);
  const primeSum = indices.reduce((sum, index) => sum + corpus.prime[index], 0);
  const page = primeSum % 56;
  const wordIndex = Math.floor(primeSum / 56);
  const selectedRunes = pages[page]?.[wordIndex] ?? null;
  const selected = selectedRunes === null ? null : decodeRunes(selectedRunes);
  const runes = selectedRunes === null ? [] : [...selectedRunes];
  const interiorRunes = runes.length > 2 ? runes.slice(1, -1) : [];
  return {
    sourceIndex,
    sourceWord: word,
    gp29PrimeSum: primeSum,
    page,
    wordIndex,
    selectedRunes,
    selected,
    interiorRunes: interiorRunes.join(""),
    interior: decodeRunes(interiorRunes),
    pageWordCount: pages[page]?.length ?? 0
  };
});

const pageCounts = new Map();
for (const row of rows) pageCounts.set(row.page, (pageCounts.get(row.page) || 0) + 1);
const distinctPages = pageCounts.size;
const missingPages = Array.from({ length: 56 }, (_, p) => p).filter(p => !pageCounts.has(p));
const duplicates = [...pageCounts].filter(([, count]) => count > 1);
const valid = rows.filter(row => row.selectedRunes !== null);
const interiorRuneCount = rows.reduce((n, row) => n + [...row.interiorRunes].length, 0);
const interiorOutput = rows.map(row => row.interior).join("");
const fullOutput = rows.map(row => row.selected || "").join("");
const maxWordIndex = Math.max(...rows.map(row => row.wordIndex));
const minRunePageWords = Math.min(...pages.slice(0, 56).filter((_, p) => p !== 50).map(page => page.length));

const page50 = grid.pages.find(page => page.page === 50);
assert(page50);
assert.deepEqual(
  [page50.tokens[2], page50.bytes[2], page50.tokens[3], page50.bytes[3]],
  ["3L", 201, "3D", 193]
);

const note = rows.find(row => row.sourceWord.toLowerCase() === "note");
const withWord = rows.find(row => row.sourceWord.toLowerCase() === "with");
assert.deepEqual(
  [note.gp29PrimeSum, note.page, note.wordIndex, note.selected],
  [162, 50, 2, null]
);
assert.deepEqual(
  [withWord.gp29PrimeSum, withWord.page, withWord.wordIndex, withWord.selected],
  [55, 55, 0, "NG"]
);

// The page-50 hit for "lies" at cell 3 is independently recorded in the
// 2016 signed-message base-58 word-map report. This script does not re-run it.
assert.equal(rows.length, 56);
assert.equal(valid.length, 55);
assert.equal(distinctPages, 34);
assert.equal(maxWordIndex, 8);
assert.equal(minRunePageWords, 17);
assert.equal(interiorRuneCount, 154);
assert.equal(maxWordIndex < minRunePageWords, true);
assert.equal(missingPages.includes(50), true);

console.log(JSON.stringify({
  hypothesis: "2012 chorus word GP29 prime sum S -> LP2 page S mod 56, printed-word index floor(S/56); extract strict interior",
  source: {
    words: sourceWords.length,
    wording: "Let the Chorus be your guide to the depths",
    spellingVariantsPreserved: ["letchery", "every thing"]
  },
  target: {
    pages: "0-55",
    pageCount: 56,
    printedWordSegmentation: "resources/lp2-transcription.txt; printed delimiters; p50 has no rune words"
  },
  mapping: {
    validAddresses: valid.length,
    invalidAddresses: rows.filter(row => row.selectedRunes === null).map(row => ({
      sourceWord: row.sourceWord,
      primeSum: row.gp29PrimeSum,
      page: row.page,
      wordIndex: row.wordIndex
    })),
    distinctPages,
    duplicatePages: duplicates,
    missingPages,
    isPagePermutation: distinctPages === 56 && duplicates.length === 0,
    maxWordIndex,
    minimumRunePageWordCount: minRunePageWords,
    validityIsAutomaticExceptP50: maxWordIndex < minRunePageWords
  },
  selectedOutput: {
    strictInteriorRuneCount: interiorRuneCount,
    strictInteriorPreview: interiorOutput,
    fullWordPreview: fullOutput
  },
  p50Convergence: {
    chorusWord: "note",
    chorusPrimeSum: note.gp29PrimeSum,
    p50CellIndex: note.wordIndex,
    p50CellToken: page50.tokens[2],
    p50CellValue: page50.bytes[2],
    prior2016MessageWord: "lies",
    prior2016MapP50CellIndex: 3,
    prior2016MapP50CellToken: page50.tokens[3],
    prior2016MapP50CellValue: page50.bytes[3]
  },
  rows,
  conclusion: "Not a page permutation; 55/56 validity is automatic from short word indices; strict interiors do not yield plaintext."
}, null, 2));
