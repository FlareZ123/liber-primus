"use strict";

/**
 * Familywise matched-null calibration for the signed-2016 GP0 -> p50 -> p0
 * navigation grammar.
 *
 * The frozen census scans all 42 adjacent signed-word pairs. It asks whether:
 *  1. an adjacent source pair maps to an exact p0 word boundary whose two
 *     surrounding word lengths occur as a contiguous phrase shape in the
 *     signed message; and
 *  2. an adjacent source pair maps to two p0 word ends whose enclosed complete
 *     word-length vector occurs as a contiguous signed phrase shape.
 *
 * The original p50 table has at least one event of each type. The Monte Carlo
 * nulls preserve the exact 256-byte multiset globally, within each original
 * row, or within each original column.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {number[]} values
 * @returns {number}
 */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gp(word);
  return {
    index,
    word: word.toUpperCase(),
    sum: sum(values),
    length: values.length,
  };
});
assert.equal(signedWords.length, 43);

const p0Source = transcription.split(/\r?\n%\r?\n/)[0];
const p0Words = [];
let current = [];
let start = 0;
let offset = 0;

/** @returns {void} */
function flushWord() {
  if (!current.length) return;
  p0Words.push({
    index: p0Words.length,
    start,
    end: start + current.length - 1,
    length: current.length,
  });
  current = [];
}

for (const char of [...p0Source]) {
  const value = runeIndex.get(char);
  if (value !== undefined) {
    if (!current.length) start = offset;
    current.push(value);
    offset += 1;
  } else if (char === "-" || char === ".") {
    flushWord();
  }
}
flushWord();

assert.equal(offset, 262);
assert.equal(p0Words.length, 59);

const endMap = new Map(p0Words.map((word) => [word.end, word]));
const startMap = new Map(p0Words.map((word) => [word.start, word]));
const phraseShapeCache = new Map();

/**
 * @param {number[]} vector
 * @returns {number}
 */
function phraseShapeHits(vector) {
  const key = vector.join(",");
  const cached = phraseShapeCache.get(key);
  if (cached !== undefined) return cached;

  let hits = 0;
  for (let i = 0; i + vector.length <= signedWords.length; i += 1) {
    const candidate = signedWords.slice(i, i + vector.length);
    if (candidate.every((word, j) => word.length === vector[j])) hits += 1;
  }
  phraseShapeCache.set(key, hits);
  return hits;
}

/**
 * @param {number[]} table
 * @returns {{boundaryShape:number, bracket:number, joint:boolean}}
 */
function census(table) {
  let boundaryShape = 0;
  let bracket = 0;

  for (let i = 0; i < signedWords.length - 1; i += 1) {
    const x = table[signedWords[i].sum];
    const y = table[signedWords[i + 1].sum];

    const ending = endMap.get(x);
    const starting = startMap.get(y);
    if (
      ending &&
      starting &&
      y === x + 1 &&
      starting.index === ending.index + 1 &&
      phraseShapeHits([ending.length, starting.length]) > 0
    ) {
      boundaryShape += 1;
    }

    if (endMap.has(x) && endMap.has(y) && x !== y) {
      const low = Math.min(x, y);
      const high = Math.max(x, y);
      const vector = p0Words
        .filter((word) => word.start > low && word.end <= high)
        .map((word) => word.length);
      if (vector.length && phraseShapeHits(vector) > 0) bracket += 1;
    }
  }

  return {
    boundaryShape,
    bracket,
    joint: boundaryShape > 0 && bracket > 0,
  };
}

const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
assert.deepEqual(census(bytes), {
  boundaryShape: 1,
  bracket: 1,
  joint: true,
});

/**
 * @param {number} initial
 * @returns {() => number}
 */
function xorshift32(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/**
 * @param {number[]} values
 * @param {() => number} random
 * @returns {number[]}
 */
function shuffled(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * @param {number[][]} rows
 * @param {() => number} random
 * @returns {number[]}
 */
function rowShuffle(rows, random) {
  return rows.flatMap((row) => shuffled(row, random));
}

/**
 * @param {number[][]} rows
 * @param {() => number} random
 * @returns {number[]}
 */
function columnShuffle(rows, random) {
  const columns = Array.from({ length: 8 }, () => []);
  for (let row = 0; row < 32; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      columns[column].push(rows[row][column]);
    }
  }
  const shuffledColumns = columns.map((column) => shuffled(column, random));
  const out = [];
  for (let row = 0; row < 32; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      out.push(shuffledColumns[column][row]);
    }
  }
  return out;
}

/**
 * @param {{boundaryShape:number,bracket:number,joint:number}} counts
 * @param {{boundaryShape:number,bracket:number,joint:boolean}} result
 * @returns {void}
 */
function addCounts(counts, result) {
  if (result.boundaryShape > 0) counts.boundaryShape += 1;
  if (result.bracket > 0) counts.bracket += 1;
  if (result.joint) counts.joint += 1;
}

const globalTrials = 100000;
const globalRandom = xorshift32(0x6d2b79f5);
const globalCounts = { boundaryShape: 0, bracket: 0, joint: 0 };
for (let trial = 0; trial < globalTrials; trial += 1) {
  addCounts(globalCounts, census(shuffled(bytes, globalRandom)));
}
assert.deepEqual(globalCounts, {
  boundaryShape: 1234,
  bracket: 9174,
  joint: 159,
});

const rows = [];
for (let row = 0; row < 32; row += 1) {
  rows.push(bytes.slice(row * 8, row * 8 + 8));
}

const layoutTrials = 50000;
const layoutRandom = xorshift32(0x9e3779b9);
const rowCounts = { boundaryShape: 0, bracket: 0, joint: 0 };
const columnCounts = { boundaryShape: 0, bracket: 0, joint: 0 };
for (let trial = 0; trial < layoutTrials; trial += 1) {
  addCounts(rowCounts, census(rowShuffle(rows, layoutRandom)));
  addCounts(columnCounts, census(columnShuffle(rows, layoutRandom)));
}
assert.deepEqual(rowCounts, {
  boundaryShape: 1603,
  bracket: 3113,
  joint: 91,
});
assert.deepEqual(columnCounts, {
  boundaryShape: 494,
  bracket: 4867,
  joint: 53,
});

console.log(JSON.stringify({
  status: "PASS",
  original: census(bytes),
  global: {
    seed: "0x6d2b79f5",
    trials: globalTrials,
    counts: globalCounts,
    jointRate: globalCounts.joint / globalTrials,
  },
  withinRows: {
    seed: "0x9e3779b9 shared with column null",
    trials: layoutTrials,
    counts: rowCounts,
    jointRate: rowCounts.joint / layoutTrials,
  },
  withinColumns: {
    seed: "0x9e3779b9 shared with row null",
    trials: layoutTrials,
    counts: columnCounts,
    jointRate: columnCounts.joint / layoutTrials,
  },
}, null, 2));
