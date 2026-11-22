"use strict";

/**
 * Original-source LP2 p48 G-E-M-Y / p49-51 prime-keypad table selector.
 * Read-only Node.js 22 CommonJS single-file test, with deterministic matched
 * multiset shuffles. Results are a source-level hypothesis, not decryption.
 *
 * Test contract fixed before the null: source page48 immediately precedes
 * the printed table; take GP prime value of rune4 as a 1-based table start;
 * under the existing canonical base60 B=29q+r keypad graph, require the
 * first encountered three-cycle's source rune labels to equal runes1..3.
 * Check all 29 possible GP prime starts and every p48 four-rune window.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");

/** @param {string} relativePath */
function readJSON(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const bytes = readJSON("resources/liber-primus/base60-grid.json").byte_rows.flat();
const physical48 = corpus.pages.find((page) => page.page === 48).indices;
const unsolved = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const DIRECTIONS = [
  [1, -1], [1, 0], [1, 1], [0, -1], [0, 0],
  [0, 1], [-1, -1], [-1, 0], [-1, 1],
];
assert.equal(bytes.length, 256);
assert.equal(physical48.length, 271);
assert.equal(unsolved.length, 55);
assert.equal(unsolved.reduce((n, page) => n + page.indices.length, 0), 12956);

/**
 * Count every exact source four-rune window by GP index of its final rune
 * and ordered packed numerical identity of the preceding three runes.
 * @param {number[][]} pages
 */
function fourgramMap(pages) {
  const result = Array.from({length: 29}, () => new Map());
  for (const page of pages) {
    for (let i = 0; i + 3 < page.length; i++) {
      const finalRune = page[i + 3];
      const triple = (29 * (29 * page[i] + page[i + 1])) + page[i + 2];
      const hits = result[finalRune];
      hits.set(triple, (hits.get(triple) || 0) + 1);
    }
  }
  return result;
}
const p48Grams = fourgramMap([physical48]);
const wholeBookGrams = fourgramMap(unsolved.map((page) => page.indices));

/**
 * Construct source-fixed finite 32×8 keypad graph without edge wrap.
 * @param {number[]} table
 */
function steps(table) {
  const next = new Int16Array(256);
  for (let i = 0; i < 256; i++) {
    const [dRow, dColumn] = DIRECTIONS[Math.floor(table[i] / 29)];
    const row = Math.floor(i / 8) + dRow;
    const column = i % 8 + dColumn;
    next[i] = row >= 0 && row < 32 && column >= 0 && column < 8
      ? 8 * row + column : -1;
  }
  return next;
}

/**
 * From a 1-based GP-prime table cell, find the first encountered cycle,
 * returning its three GP29 symbols only when that cycle has length three.
 * Phase is fixed by the entrance node, rather than rotating to fit text.
 * @param {number[]} table
 * @param {Int16Array} next
 * @param {number} oneBasedCell
 * @returns {number[] | null}
 */
function firstThreeCycle(table, next, oneBasedCell) {
  const seen = new Int16Array(256).fill(-1);
  const path = [];
  let cell = oneBasedCell - 1;
  while (cell >= 0 && seen[cell] === -1) {
    seen[cell] = path.length;
    path.push(cell);
    cell = next[cell];
  }
  if (cell < 0) return null;
  const first = seen[cell];
  if (path.length - first !== 3) return null;
  return path.slice(first).map((index) => table[index] % 29);
}

/**
 * All original four-rune candidates are considered. A selector is the
 * fourth rune's GP prime weight; its loop must spell the first three runes.
 * @param {number[]} table
 * @param {Array<Map<number,number>>} source
 */
function matchingPointers(table, source) {
  const next = steps(table);
  let matches = 0;
  let primeSelectorsReachingThreeCycle = 0;
  const matched = [];
  for (let rune = 0; rune < 29; rune++) {
    const start = corpus.prime[rune];
    const triple = firstThreeCycle(table, next, start);
    if (!triple) continue;
    primeSelectorsReachingThreeCycle++;
    const packed = 29 * (29 * triple[0] + triple[1]) + triple[2];
    const count = source[rune].get(packed) || 0;
    matches += count;
    if (count) {
      matched.push({selector: corpus.translit[rune], prime: start,
        cycle: triple.map((index) => corpus.translit[index]), count});
    }
  }
  return {matches, primeSelectorsReachingThreeCycle, matched};
}

const exact48 = matchingPointers(bytes, p48Grams);
const exactAll = matchingPointers(bytes, wholeBookGrams);
assert.deepEqual(exact48, {matches: 1, primeSelectorsReachingThreeCycle: 1,
  matched: [{selector: "Y", prime: 103, cycle: ["G", "E", "M"], count: 1}]});
assert.deepEqual(exactAll, exact48);
const discovered = [6, 18, 19, 26];
const sourceOffsets = [];
for (const page of unsolved) {
  for (let i = 0; i + 4 <= page.indices.length; i++) {
    if (discovered.every((value, j) => page.indices[i + j] === value)) {
      sourceOffsets.push({page: page.page, offset: i});
    }
  }
}
assert.deepEqual(sourceOffsets, [{page: 48, offset: 139}]);
/*
 * Longer source-context consequence, evaluated after discovering GEMY:
 * at p48:138 the preceding rune is M, the last rune in the GEM cycle,
 * yielding MGEMY. This is a source fact, not an independent null p-value.
 */
assert.deepEqual(physical48.slice(138, 143), [19, 6, 18, 19, 26]);

/*
 * Radix59 removes the unused lowercase f from the original 60-character
 * conventional alphabet. It is a real lossless competitor for the printed
 * tokens, but changes the original 103→GEM label to 103→GST under the
 * very same q/keypad rule. This is a conditional codec discriminator.
 */
const printed = readJSON("resources/liber-primus/base60-grid.json");
const alphabet59 = printed.alphabet.replace("f", "");
assert.equal(alphabet59.length, 59);
const radix59 = printed.rows.flat().map((token) =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert.equal(radix59.length, 256);
assert.equal(radix59.filter((n, i) => n !== bytes[i]).length, 220);
assert.deepEqual(matchingPointers(radix59, p48Grams),
  {matches: 0, primeSelectorsReachingThreeCycle: 1, matched: []});
assert.deepEqual(firstThreeCycle(radix59, steps(radix59), 103)
  .map((index) => corpus.translit[index]), ["G", "S", "T"]);


const nextOriginal = steps(bytes);
const start103 = [103];
while (start103.length < 5) {
  start103.push(nextOriginal[start103[start103.length - 1] - 1] + 1);
}
assert.deepEqual(start103, [103, 111, 119, 127, 128]);
assert.deepEqual(start103.map((n) =>
  corpus.translit[bytes[n - 1] % 29]), ["O", "O", "G", "E", "M"]);
assert.equal(nextOriginal[127], 118); // one-based cell128 → cell119

let rngState = 0x33014850;
/** Deterministic xorshift32. */
function nextRandom() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}

/** @param {number[]} table @param {"global"|"row"|"column"} mode */
function shuffle(table, mode) {
  const result = table.slice();
  if (mode === "global") {
    for (let i = 255; i > 0; i--) {
      const j = nextRandom() % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
  } else if (mode === "row") {
    for (let row = 0; row < 32; row++) {
      for (let col = 7; col > 0; col--) {
        const j = nextRandom() % (col + 1);
        const a = row * 8 + col, b = row * 8 + j;
        [result[a], result[b]] = [result[b], result[a]];
      }
    }
  } else {
    for (let col = 0; col < 8; col++) {
      for (let row = 31; row > 0; row--) {
        const j = nextRandom() % (row + 1);
        const a = row * 8 + col, b = j * 8 + col;
        [result[a], result[b]] = [result[b], result[a]];
      }
    }
  }
  return result;
}

const TRIALS = 50000;
const results = {};
for (const mode of ["global", "row", "column"]) {
  let hits48 = 0;
  let hitsAll = 0;
  let selectors = 0;
  for (let trial = 0; trial < TRIALS; trial++) {
    const alternate = shuffle(bytes, mode);
    const p48 = matchingPointers(alternate, p48Grams);
    const all = matchingPointers(alternate, wholeBookGrams);
    hits48 += Number(p48.matches > 0);
    hitsAll += Number(all.matches > 0);
    selectors += p48.primeSelectorsReachingThreeCycle;
  }
  results[mode] = {hits48, hitsAll, selectors};
}
assert.deepEqual(results, {
  global: {hits48: 39, hitsAll: 1715, selectors: 99590},
  row: {hits48: 21, hitsAll: 1080, selectors: 58288},
  column: {hits48: 34, hitsAll: 1922, selectors: 109996},
});
process.stdout.write(JSON.stringify({
  original: {sourceOffsets, exact48, exactAll, table103: start103},
  trialsPerNull: TRIALS, shuffles: results,
  interpretation: "original-source cross-artifact pointer; not deciphered text",
}) + "\n");
