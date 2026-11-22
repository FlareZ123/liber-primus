"use strict";

/**
 * Source-fixed p55→p27 word-pair/table-coordinate continuation.
 *
 * Node.js 22 CommonJS, read-only standalone original-source test.
 * Prints a navigation candidate; it does not claim plaintext recovery.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt").split("%");

assert.equal(parts.length, 57);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages[50].runic_count, 0);
assert.equal(grid.rows.flat().length, 256);

/** @type {Map<number, Array<{offset:number,length:number,primeSum:number,indices:number[]}>>} */
const words = new Map();
for (let page = 0; page < 58; page++) {
  if (page === 50) continue;
  const original = parts[page < 50 ? page : page - 1]
    .replace(/[\s/]+/gu, "");
  let offset = 0;
  const pageWords = [];
  for (const fragment of original.split(/[-.&$§]+/u)) {
    const indices = Array.from(fragment)
      .map((rune) => corpus.runes.indexOf(rune))
      .filter((index) => index >= 0);
    if (!indices.length) continue;
    pageWords.push({
      offset,
      length: indices.length,
      indices,
      primeSum: indices.reduce((total, index) => total + corpus.prime[index], 0),
    });
    offset += indices.length;
  }
  assert.equal(offset, corpus.pages[page].runic_count, "page " + page);
  words.set(page, pageWords);
}
const tokens = grid.rows.flat();
const base60 = grid.byte_rows.flat();
const alphabet59 = grid.alphabet.replace("f", "");
const base59 = tokens.map((token) => Array.from(token).reduce(
  (value, digit) => value * 59 + alphabet59.indexOf(digit), 0
));
assert.equal(base60.length, 256);
assert.equal(base59.length, 256);

/** @param {number} wordSum @param {number[]} cells @returns {number} */
function tableValue(wordSum, cells) {
  assert.ok(wordSum > 0);
  return cells[(wordSum - 1) % 256];
}

/** @param {number} page @param {number} offset @param {number[]} cells */
function nextPoint(page, offset, cells) {
  if (page === 50) return null;
  const pageWords = words.get(page);
  assert.ok(pageWords);
  const first = pageWords.findIndex((word) => word.offset >= offset);
  if (first < 0 || first + 1 >= pageWords.length) return null;
  const a = pageWords[first];
  const b = pageWords[first + 1];
  return {
    page: tableValue(a.primeSum, cells),
    offset: tableValue(b.primeSum, cells),
    sourceOffsets: [a.offset, b.offset],
    primeSums: [a.primeSum, b.primeSum],
    cells: [
      ((a.primeSum - 1) % 256) + 1,
      ((b.primeSum - 1) % 256) + 1,
    ],
  };
}

/** The uniquely repeated six-rune footer is the initial fixed anchor. */
assert.deepEqual(
  corpus.pages[55].indices.slice(-6),
  corpus.pages[27].indices.slice(28, 34)
);
const p27 = words.get(27);
assert.deepEqual(
  p27.filter((w) => w.offset === 28 || w.offset === 31)
    .map((w) => w.primeSum), [129, 159]
);
const afterAnchor = p27.filter((word) => word.offset >= 34).slice(0, 2);
assert.deepEqual(afterAnchor.map((word) => word.offset), [34, 36]);
assert.deepEqual(afterAnchor.map((word) => word.primeSum), [103, 43]);
assert.equal(tokens[102], "0W");
assert.equal(tokens[42], "0S");
assert.deepEqual(
  afterAnchor.map((word) => tableValue(word.primeSum, base60)), [32, 28]
);
assert.deepEqual(
  afterAnchor.map((word) => tableValue(word.primeSum, base59)), [32, 28]
);
assert.deepEqual(corpus.pages[32].indices.slice(28, 31), [2, 0, 0]);

function assertHop(cells, originPage, originOffset, expectedPage,
  expectedOffset, expectedSums, expectedCells) {
  const hop = nextPoint(originPage, originOffset, cells);
  assert.ok(hop);
  assert.equal(hop.page, expectedPage);
  assert.equal(hop.offset, expectedOffset);
  assert.deepEqual(hop.primeSums, expectedSums);
  assert.deepEqual(hop.cells, expectedCells);
  console.log("HOP", originPage + ":" + originOffset, "→",
    hop.page + ":" + hop.offset, "primeSums", hop.primeSums.join(","),
    "oneBasedCells", hop.cells.join(","));
}

console.log("START", "p55@70→p27@28; p27 next two words",
  afterAnchor.map((w) => w.primeSum).join(","), "→ p32@28");

console.log("BASE60");
assertHop(base60, 32, 28, 4, 25, [14, 540], [14, 28]);
assertHop(base60, 4, 25, 51, 32, [320, 111], [64, 111]);
assertHop(base60, 51, 32, 16, 70, [562, 213], [50, 213]);
assertHop(base60, 16, 70, 184, 5, [110, 40], [110, 40]);

console.log("BASE59");
assertHop(base59, 32, 28, 4, 25, [14, 540], [14, 28]);
assertHop(base59, 4, 25, 50, 32, [320, 111], [64, 111]);

console.log("RESULT", "source-exact pointer hypothesis; base59 ends on",
  "the numeric page p50; base60 next proposes out-of-range p184.",
  "No original plaintext or authenticated decoder.");
