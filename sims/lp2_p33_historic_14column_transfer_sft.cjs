"use strict";
/**
 * One frozen 2014 Cicada 14-column row-reordering transfer on the intact
 * 196 black runes of original LP2 p33. Source red spans are excluded, while
 * the 81|115 black-run section seam is retained without rephasing.
 *
 * Historical documented 2014 source: the 70-character Stage 6 cipher
 * in https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3
 * demonstrates the fixed printed-order permutation below. It is a
 * participant-documented solution, not a first-party signed LP2 decoder.
 *
 * Node.js 22, CommonJS, offline and read-only.
 * Reproducer: node sims/lp2_p33_historic_14column_transfer_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p33 = book.pages.find(page => page.page === 33);
const annotation = ink.pages.find(page => page.page === 33);
assert.equal(p33.runic_count, 214);
assert.deepEqual(annotation.red_spans.map(span => [span.start, span.length]),
  [[0, 10], [91, 8]]);
const red = new Set(annotation.red_spans.flatMap(span =>
  Array.from({length: span.length}, (_, i) => span.start + i)));
const source = p33.indices;
const black = source.filter((_, i) => !red.has(i));
assert.equal(black.length, 196);
assert.deepEqual([black.length, 91 - 10, 214 - 99], [196, 81, 115]);

// Never split words at layout slash/newline; original black word runs
// are 21 above and 28 below the intervening red 3+5-rune heading.
const printed = read("resources/lp2-transcription.txt").split("%")[33]
  .replace(/\/\s*/gu, "");
const runeSet = new Set(book.runes);
const canonicalWords = [...printed.matchAll(/[ᚠ-᛿]+/gu)].map(x => x[0]);
let offset = 0;
const words = canonicalWords.map(value => {
  const start = offset;
  offset += [...value].length;
  return {start, end: offset, length: offset - start};
});
assert.equal(offset, 214);
assert.equal(words.length, 53);
assert.equal(words.filter(w => w.start >= 10 && w.end <= 91).length, 21);
assert.equal(words.filter(w => w.start >= 99 && w.end <= 214).length, 28);
assert.equal(words.filter(w => w.end > 91 && w.start < 91).length, 0);
assert.equal(words.filter(w => w.end > 99 && w.start < 99).length, 0);

/** @type {number[]} Documented original 2014 source column order, zero based. */
const columns = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const inverse = Array(14);
columns.forEach((sourceColumn, destinationColumn) => {
  inverse[sourceColumn] = destinationColumn;
});
assert.equal(new Set(columns).size, 14);
/**
 * The actual historical row-by-row 14-column reorder, no alternate
 * orientation, phase, or English-optimized offset.
 * @template T
 * @param {T[]} values
 * @param {number[]} permutation
 * @returns {T[]}
 */
function rearrange(values, permutation) {
  assert.equal(values.length % 14, 0);
  const result = [];
  for (let base = 0; base < values.length; base += 14) {
    for (const sourceColumn of permutation) {
      result.push(values[base + sourceColumn]);
    }
  }
  return result;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const index of values) counts[index]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
const translit = values => values.map(index => book.translit[index]).join("");

// Published 2014 stage: one fixed permutation must recover the complete
// 70-character truth/illusion/onion handoff, not just a familiar prefix.
const historicalRows = [
  "IDGTKUMLOOARWO", "ERTHISUTETLHUT", "IATSLLOUIMNITE",
  "LNJ7TFYVOIUAUS", "NOCO5JI4MEODZZ"
];
const documentedClearRows = [
  "GOODWORKULTIMA", "TETRUTHISTHEUL", "TIMATEILLUSION",
  "JOINUSATFV7LYU", "CMEOZZD5J4ONIO"
];
const historical = historicalRows.join("").split("");
const historicalDecoded = rearrange(historical, columns).join("");
assert.equal(historicalDecoded, documentedClearRows.join(""));
assert.deepEqual(rearrange(historicalDecoded.split(""), inverse), historical);

// Independent original solved LP1 source-rune positive, 196 exact symbols.
// Encrypt with inverse historical row permutation, decrypt with source order.
const native = [...read("resources/transcriptions/lp1_wulfic_canonical.txt")]
  .filter(character => runeSet.has(character))
  .slice(0, black.length)
  .map(character => book.runes.indexOf(character));
assert.equal(native.length, black.length);
const planted = rearrange(native, inverse);
assert.deepEqual(rearrange(planted, columns), native);
assert.deepEqual(rearrange(planted.slice(0, 147).concat(planted.slice(147)),
  columns), native);

// One source-locked original unknown-p33 transformation, with final49
// withheld as an unoptimized diagnostic rather than a fitted key target.
const decoded = rearrange(black, columns);
assert.deepEqual(rearrange(decoded, inverse), black);
assert.equal(decoded.length, 196);
assert.equal(ioc(decoded), ioc(black));
const blackBreakPosition = 81;
const output = {
  classification: "Negative fixed historical 14-column transposition; no unknown plaintext",
  original: {
    physicalPage: 33,
    fullRuneCount: source.length,
    redSpans: annotation.red_spans.map(span => [span.start, span.length]),
    blackRuneCount: black.length,
    firstBlackSectionRunes: 81,
    secondBlackSectionRunes: 115,
    firstBlackSectionWords: 21,
    secondBlackSectionWords: 28,
    blackoutBoundaryRowRemainder: blackBreakPosition % 14
  },
  historic2014: {
    source: "2014 stage-6 participant-documented source cipher",
    columnOrderZeroBased: columns,
    originalCipherRows: historicalRows,
    verifiedClearRows: documentedClearRows,
    exactHistoricalReconstruction: true
  },
  control: {
    native: "First 196 authentic solved LP1 runes",
    recovered: native.length,
    expected: native.length,
    exactRecovered: true,
    nativeIoC: ioc(native)
  },
  decodedP33: {
    preservedBlackRuneCount: decoded.length,
    originalIoC: ioc(black),
    rearrangedIoC: ioc(decoded),
    sourceRoundTrip: true,
    first147: translit(decoded.slice(0, 147)),
    untouchedLast49: translit(decoded.slice(147)),
    runeIndexLast49: decoded.slice(147),
    all14RuneRows: Array.from({length: 14}, (_, row) =>
      translit(decoded.slice(row * 14, row * 14 + 14)))
  },
  decision: "This specific 2014 14-column row order does not yield coherent native GP29 prose on the untouched p33 black text. No other cipher family is excluded."
};
console.log(JSON.stringify(output, null, 2));
