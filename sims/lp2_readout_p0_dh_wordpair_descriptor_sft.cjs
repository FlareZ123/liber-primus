"use strict";

/**
 * SFT: READ OUT p0 receiver as a DH23 word-geometry state descriptor.
 *
 * Re-derives the split READ/OUT p50 receiver, then tests the selected four
 * complete p0 words using only each word's rune length and GP0 residue.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/**
 * @param {string} text
 * @returns {{runes:number[],words:Array<{start:number,end:number,len:number,sum:number,res:number}>}}
 */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    const sum = current.reduce((a, b) => a + b, 0);
    words.push({
      start,
      end: offset - 1,
      len: current.length,
      sum,
      res: sum % 29,
    });
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      assert.notEqual(value, undefined);
      if (!current.length) start = offset;
      current.push(value);
      runes.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} generator @param {number} target @param {number} modulus @returns {number} */
function discreteLog(generator, target, modulus) {
  let value = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent += 1) {
    if (value === target) return exponent;
    value = (value * generator) % modulus;
  }
  throw new Error("target is outside generator orbit");
}

const tableBytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableBytes.length, 256);

const readGp0 = gp("READ").reduce((a, b) => a + b, 0);
const outGp0 = gp("OUT").reduce((a, b) => a + b, 0);
assert.deepEqual([readGp0, outGp0], [55, 20]);
const start = tableBytes[readGp0];
const end = tableBytes[outGp0];
assert.deepEqual([start, end], [80, 102]);

const p0 = parsePage(physicalPart(0));
const firstWord = p0.words.findIndex((word) => word.start === start);
const lastWord = p0.words.findIndex((word) => word.end === end);
assert.deepEqual([firstWord + 1, lastWord + 1], [18, 21]);
const selected = p0.words.slice(firstWord, lastWord + 1);
assert.equal(selected.length, 4);
assert.equal(end - start + 1, 23);
assert.equal(p0.runes[start + 11], 0);

// Independently fixed p28 DH23 state and cube exponent.
const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3};
assert.equal(modPow(dh.g, dh.a, dh.p), dh.A);
assert.equal(modPow(dh.g, dh.b, dh.p), dh.B);
assert.equal(modPow(dh.B, dh.a, dh.p), dh.K);
assert.equal(discreteLog(dh.g, dh.A, dh.p), dh.a);
assert.equal(discreteLog(dh.g, dh.B, dh.p), dh.b);

const dhValues = [dh.p, dh.g, dh.a, dh.A, dh.B, dh.b, dh.K];
const stateCount = dhValues.length;
const stateSum = dhValues.reduce((a, b) => a + b, 0);
assert.deepEqual([stateCount, stateSum], [7, 78]);

// The selected four words form a compact ordered state descriptor:
// (length, GP0 mod29) = (e,B), (state-count,OUT), (g,g), (A,p).
const expectedPairs = [
  [dh.e, dh.B],
  [stateCount, outGp0],
  [dh.g, dh.g],
  [dh.A, dh.p],
];
const actualPairs = selected.map((word) => [word.len, word.res]);
assert.deepEqual(actualPairs, expectedPairs);

// The second word supplies an additional checksum: raw GP0 equals the
// sum of all seven standard DH23 state values.
assert.equal(selected[1].sum, stateSum);

// The pair descriptor itself is enough to recover the standard DH tuple.
const recovered = {
  e: actualPairs[0][0],
  B: actualPairs[0][1],
  g: actualPairs[2][0],
  A: actualPairs[3][0],
  p: actualPairs[3][1],
};
assert.equal(actualPairs[2][1], recovered.g);
recovered.a = discreteLog(recovered.g, recovered.A, recovered.p);
recovered.b = discreteLog(recovered.g, recovered.B, recovered.p);
recovered.K = modPow(recovered.B, recovered.a, recovered.p);
assert.deepEqual(recovered, dh);

// Exact manuscript census for the frozen ordered pair descriptor.
let windows = 0;
const pairHits = [];
const checksumHits = [];
const scoreCounts = {};
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let i = 0; i + 3 < parsed.words.length; i += 1) {
    windows += 1;
    const candidate = parsed.words.slice(i, i + 4);
    const tests = [
      candidate[0].len === dh.e,
      candidate[0].res === dh.B,
      candidate[1].len === stateCount,
      candidate[1].res === outGp0,
      candidate[2].len === dh.g,
      candidate[2].res === dh.g,
      candidate[3].len === dh.A,
      candidate[3].res === dh.p,
      candidate[1].sum === stateSum,
    ];
    const score = tests.filter(Boolean).length;
    scoreCounts[score] = (scoreCounts[score] || 0) + 1;

    if (tests.slice(0, 8).every(Boolean)) {
      pairHits.push({
        page,
        firstWord: i + 1,
        start: candidate[0].start,
        end: candidate[3].end,
        sums: candidate.map((word) => word.sum),
      });
    }
    if (tests.every(Boolean)) {
      checksumHits.push({
        page,
        firstWord: i + 1,
        start: candidate[0].start,
        end: candidate[3].end,
      });
    }
  }
}
assert.equal(windows, 2763);
assert.deepEqual(pairHits, [{
  page: 0,
  firstWord: 18,
  start: 80,
  end: 102,
  sums: [48, 78, 63, 139],
}]);
assert.deepEqual(checksumHits, [{
  page: 0,
  firstWord: 18,
  start: 80,
  end: 102,
}]);

// Source-visible comparison family: whole-word-bounded 23-rune spans
// whose exact center is F.
const centerF23 = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let i = 0; i < parsed.words.length; i += 1) {
    for (let j = i; j < parsed.words.length; j += 1) {
      const length = parsed.words[j].end - parsed.words[i].start + 1;
      if (length > 23) break;
      if (length !== 23) continue;
      const center = parsed.words[i].start + 11;
      if (parsed.runes[center] !== 0) continue;
      centerF23.push({
        page,
        firstWord: i + 1,
        lastWord: j + 1,
        start: parsed.words[i].start,
        end: parsed.words[j].end,
      });
    }
  }
}
assert.equal(centerF23.length, 23);
assert.equal(centerF23.filter((row) =>
  row.page === 0 && row.start === 80 && row.end === 102).length, 1);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    readGp0,
    outGp0,
    start,
    end,
    wordNumbers: [firstWord + 1, lastWord + 1],
    pairs: actualPairs,
    rawSums: selected.map((word) => word.sum),
  },
  dh,
  recovered,
  stateCount,
  stateSum,
  census: {
    fourWordWindows: windows,
    pairHits,
    checksumHits,
    scoreCounts,
    wholeWordBounded23CenterF: centerF23.length,
  },
  classification:
    "The prospectively selected READ OUT p0 receiver uniquely matches an ordered DH23 word-geometry descriptor. The descriptor was recognized after receiver selection, so uniqueness is structural evidence rather than a discovery-wide p-value; no plaintext or running key is recovered.",
}, null, 2));
