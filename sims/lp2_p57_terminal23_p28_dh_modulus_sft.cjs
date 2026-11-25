"use strict";

/**
 * Reproduce the unique terminal 23-dot punctuation on solved p57 and compare
 * it with the independently selected p28 DH line length.
 *
 * Run from repository root:
 *   node sims/lp2_p57_terminal23_p28_dh_modulus_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/**
 * Physical page mapping for the canonical transcription, whose rune-free p50
 * is omitted from the percent-delimited source.
 * @param {number} physicalPage
 * @returns {string}
 */
function physicalPageSource(physicalPage) {
  const parts = transcription.split(/\r?\n%\r?\n/);
  return parts[physicalPage < 50 ? physicalPage : physicalPage - 1];
}

/**
 * @param {string} line
 * @returns {number[]}
 */
function lineRunes(line) {
  return [...line].flatMap((char) => {
    const value = runeIndex.get(char);
    return value === undefined ? [] : [value];
  });
}

const marks = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation || []) {
    marks.push({
      page: page.page,
      start: mark[0],
      count: mark[1],
      color: mark[2],
    });
  }
}
assert.equal(marks.length, 36);

const histogram = new Map();
for (const mark of marks) {
  histogram.set(mark.count, (histogram.get(mark.count) || 0) + 1);
}
assert.deepEqual(
  Object.fromEntries([...histogram.entries()].sort((a, b) => a[0] - b[0])),
  {"10": 4, "13": 31, "23": 1}
);

const count23 = marks.filter((mark) => mark.count === 23);
assert.deepEqual(count23, [{
  page: 57,
  start: 95,
  count: 23,
  color: "red",
}]);

const p57Ink = ink.pages.find((page) => page.page === 57);
assert(p57Ink);
assert.equal(p57Ink.rune_count, 95);
assert.deepEqual(p57Ink.large_punctuation, [
  [7, 13, "red"],
  [95, 23, "red"],
]);
assert.equal(count23[0].start, p57Ink.rune_count);

const p28Lines = physicalPageSource(28)
  .trim()
  .split(/\r?\n/)
  .map(lineRunes);
assert.equal(p28Lines.length, 12);
assert.equal(p28Lines[5].length, 23);
assert.equal(
  p28Lines[5].slice(0, 2).map((value) => corpus.translit[value]).join(""),
  "DH"
);

// Cross-page control over unknown p0..p55: the existing p28 DH line is the
// only physical line beginning DH. This SFT recomputes the fact independently
// of the earlier DH report.
const dhLines = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = physicalPageSource(page).trim().split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const runes = lineRunes(lines[lineIndex]);
    if (runes.length < 2) continue;
    const first2 = runes.slice(0, 2)
      .map((value) => corpus.translit[value])
      .join("");
    if (first2 === "DH") {
      dhLines.push({
        page,
        line: lineIndex + 1,
        length: runes.length,
      });
    }
  }
}
assert.deepEqual(dhLines, [{page: 28, line: 6, length: 23}]);

const count13 = marks.filter((mark) => mark.count === 13);
assert.equal(count13.length, 31);
assert(count13.some((mark) => mark.page === 27 && mark.start === 19));
assert(count13.some((mark) => mark.page === 57 && mark.start === 7));

/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  let seen = 0;
  for (let candidate = 2; ; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (!prime) continue;
    seen += 1;
    if (seen === ordinal) return candidate;
  }
}

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

// The two red punctuation counts on solved p57 form a closed radix test.
assert.equal(nthPrime(13), 41);
assert.equal(nthPrime(23), 83);
assert.equal(tableTokens[41], "1O");
assert.equal(tokenValue(tableTokens[41], alphabet59), 83);
assert.equal(tokenValue(tableTokens[41], alphabet60), 84);

// Reuse the already-asserted source-counted count13 marker array above.

// Derive the final solved word directly from the p57 source and verify its GP0.
const p57Words = [];
let currentWord = [];
for (const char of physicalPageSource(57)) {
  const value = runeIndex.get(char);
  if (value !== undefined) {
    currentWord.push(value);
  } else if (currentWord.length && "-.$&§".includes(char)) {
    p57Words.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) p57Words.push(currentWord);
const lastWord = p57Words.at(-1);
assert(lastWord);
assert.equal(lastWord.map((value) => corpus.translit[value]).join(""), "EMERGE");
assert.equal(lastWord.reduce((sum, value) => sum + value, 0), 83);

// Family control over every distinct large-punctuation count present in LP2.
const distinctCounts = [...new Set(marks.map((mark) => mark.count))].sort((a, b) => a - b);
assert.deepEqual(distinctCounts, [10, 13, 23]);
function countPairEdges(alphabet) {
  const edges = [];
  for (const from of distinctCounts) {
    const address = nthPrime(from);
    const decoded = tokenValue(tableTokens[address], alphabet);
    for (const to of distinctCounts) {
      if (decoded === nthPrime(to)) edges.push({from, to, address, decoded});
    }
  }
  return edges;
}
assert.deepEqual(countPairEdges(alphabet59), [
  {from: 13, to: 23, address: 41, decoded: 83},
]);
assert.deepEqual(countPairEdges(alphabet60), []);

process.stdout.write(JSON.stringify({
  classification:
    "independent source-visible modulus selector; no unknown plaintext recovered",
  largePunctuation: {
    total: marks.length,
    histogram: Object.fromEntries([...histogram.entries()].sort((a, b) => a[0] - b[0])),
    unique23: count23[0],
    count13Total: count13.length,
    p57RadixBridge: {
      count13Prime: nthPrime(13),
      tableToken: tableTokens[nthPrime(13)],
      base59: tokenValue(tableTokens[nthPrime(13)], alphabet59),
      base60: tokenValue(tableTokens[nthPrime(13)], alphabet60),
      count23Prime: nthPrime(23),
      finalWord: "EMERGE",
      finalWordGp0: lastWord.reduce((sum, value) => sum + value, 0),
      base59CountPairEdges: countPairEdges(alphabet59),
      base60CountPairEdges: countPairEdges(alphabet60),
    },
  },
  independentDhReceiver: {
    page: 28,
    line: 6,
    firstFragment: "DH",
    lineLength: p28Lines[5].length,
    allDhLineStarts: dhLines,
  },
  decision:
    "Solved p57 terminates with the only 23-dot large punctuation mark in LP2. Its own 13-dot and 23-dot marks form the unique punctuation-count edge 13th-prime=41 -> p50[41]=1O -> base59 83 = 23rd-prime = GP0(EMERGE), while base60 fails. Independently selected p28 line6 is the only DH-starting unknown line and has length23. Treat p57 punctuation as an independent prime/radix/modulus selector, while ordinary 13-dot punctuation remains common.",
}, null, 2) + "\n");
