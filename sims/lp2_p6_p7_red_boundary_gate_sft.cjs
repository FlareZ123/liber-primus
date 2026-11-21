"use strict";
/**
 * SFT: p6->p7 reversed GP0 red-word pair and #2051 p50 source-selector gate.
 * Reads the canonical original-source transcription; makes no file changes.
 * Run with Node.js 22: node sims/lp2_p6_p7_red_boundary_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const ink = readJson("resources/liber-primus/lp2-ink-annotations.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const pages = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%");
const lookup = new Map(corpus.runes.map((rune, value) => [rune, value]));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);

/** @param {number} page */
function wordsOnPage(page) {
  const out = [];
  let offset = 0;
  let values = [];
  const flush = () => {
    if (!values.length) return;
    out.push({
      start: offset - values.length,
      end: offset,
      length: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      values: values.slice()
    });
    values = [];
  };
  for (const char of Array.from(pages[page])) {
    const value = lookup.get(char);
    if (value !== undefined) {
      values.push(value);
      offset++;
    } else if ("-.$&§".includes(char)) {
      flush();
    }
  }
  flush();
  return out;
}

const spans = ink.pages.filter(p => p.page <= 55).flatMap(p =>
  (p.red_spans || []).map(span => {
    const words = wordsOnPage(p.page).filter(w =>
      w.start >= span.start && w.end <= span.start + span.length
    );
    return { page: p.page, start: span.start, length: span.length, words };
  })
);
const p6 = spans.find(s => s.page === 6 && s.start === 71);
const p7 = spans.find(s => s.page === 7 && s.start === 194);
assert.ok(p6 && p7);
assert.deepEqual(p6.words.map(w => w.length), [4, 1, 4, 2]);
assert.deepEqual(p6.words.map(w => w.sum), [71, 19, 65, 26]);
assert.deepEqual(p7.words.map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(p7.words.map(w => w.sum), [26, 65, 23, 42, 53]);
assert.deepEqual(p6.words.slice(-2).map(w => [w.length, w.sum]), [[4, 65], [2, 26]]);
assert.deepEqual(p7.words.slice(0, 2).map(w => [w.length, w.sum]), [[2, 26], [4, 65]]);
assert.notDeepEqual(p6.words[2].values, p7.words[1].values);
assert.notDeepEqual(p6.words[3].values, p7.words[0].values);

const adjacent = [];
for (const a of spans) for (const b of spans) {
  if (b.page !== a.page + 1) continue;
  const left = a.words.slice(-2);
  const right = b.words.slice(0, 2);
  const shape = left.length === 2 && right.length === 2 &&
    left.every((w, i) => w.length === right[1 - i].length);
  const sums = shape && left.every((w, i) => w.sum === right[1 - i].sum);
  adjacent.push({
    pages: [a.page, b.page],
    tail: left.map(w => [w.length, w.sum]),
    head: right.map(w => [w.length, w.sum]),
    reversedLength: shape,
    reversedLengthAndSum: sums
  });
}
assert.equal(spans.length, 16);
assert.deepEqual(adjacent.map(x => x.pages), [[6, 7], [7, 8], [39, 40], [53, 54]]);
assert.deepEqual(adjacent.filter(x => x.reversedLength).map(x => x.pages), [[6, 7]]);
assert.deepEqual(adjacent.filter(x => x.reversedLengthAndSum).map(x => x.pages), [[6, 7]]);

const redWords = spans.filter(s => s.words.length >= 2).flatMap(s => s.words);
assert.equal(redWords.length, 48);
/** @param {number} length */
function coincidence(length) {
  const sums = redWords.filter(w => w.length === length).map(w => w.sum);
  const counts = new Map();
  for (const sum of sums) counts.set(sum, (counts.get(sum) || 0) + 1);
  const orderedMatchingPairs = [...counts.values()].reduce((n, count) => n + count * (count - 1), 0);
  const possiblePairs = sums.length * (sums.length - 1);
  return {
    length, count: sums.length,
    duplicates: [...counts].filter(([, n]) => n > 1),
    orderedMatchingPairs, possiblePairs,
    conditionalProbability: orderedMatchingPairs / possiblePairs
  };
}
const lengthTwo = coincidence(2);
const lengthFour = coincidence(4);
assert.deepEqual([lengthTwo.count, lengthFour.count], [10, 10]);
assert.deepEqual(lengthTwo.duplicates, [[26, 2]]);
assert.deepEqual(lengthFour.duplicates, [[65, 2], [57, 2]]);
assert.deepEqual([lengthTwo.orderedMatchingPairs, lengthFour.orderedMatchingPairs], [2, 4]);
const probability = lengthTwo.conditionalProbability * lengthFour.conditionalProbability;
assert.ok(Math.abs(probability - 8 / 8100) < 1e-15);

const addresses = [71, 19, 65, 26, 181];
const p50Reads = addresses.map(address => ({
  address, row: Math.floor(address / 8), column: address % 8,
  token: tokens[address], hypotheticalBase60: grid.bytes[address]
}));
assert.deepEqual(p50Reads.map(x => x.token), ["1m", "0X", "4F", "2r", "0e"]);
assert.deepEqual(p50Reads.map(x => x.hypotheticalBase60), [108, 33, 255, 173, 40]);
assert.equal(p6.words.map(w => w.length).reduce((a, b) => a * b, 1), 32);
assert.equal(p6.words.map(w => w.sum).reduce((a, b) => a + b, 0), 181);
assert.equal(p7.words.map(w => w.sum).reduce((a, b) => a + b, 0), 209);

console.log(JSON.stringify({
  classification: "Verified adjacent red-word GP0 reversal, not a cipher inverse",
  p6: { page: p6.page, start: p6.start, lengths: p6.words.map(w => w.length), sums: p6.words.map(w => w.sum) },
  p7: { page: p7.page, start: p7.start, lengths: p7.words.map(w => w.length), sums: p7.words.map(w => w.sum) },
  controls: { redSpanCount: spans.length, redWordCount: redWords.length, adjacent, lengthTwo, lengthFour, conditionalProbability: probability },
  p50DirectAddressGate: p50Reads,
  receiver: "No uniquely source-selected address, cipher operation, or plaintext"
}, null, 2));
