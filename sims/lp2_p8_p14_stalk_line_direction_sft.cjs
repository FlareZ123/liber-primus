"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function runes(text) {
  return [...text].filter(char => runeIndex.has(char)).map(char => runeIndex.get(char));
}
/** @param {number} page @returns {string[]} */
function pageLines(page) {
  const segment = page > 50 ? page - 1 : page;
  return parts[segment].split("\n").filter(line => line.length > 0);
}
/** Reverse a printed line's contents; slash marks the line break and stays there.
 * @param {string} line @returns {string} */
function reverseLine(line) {
  const hasSlash = line.endsWith("/");
  const body = hasSlash ? line.slice(0, -1) : line;
  return [...body].reverse().join("") + (hasSlash ? "/" : "");
}
/** @param {number} page @param {boolean} alternate @returns {number[]} */
function pageValues(page, alternate) {
  const lines = pageLines(page);
  const reverse = alternate && page % 2 === 1;
  const mapped = lines.map(line => reverse ? reverseLine(line) : line);
  for (let i = 0; i < lines.length; i += 1) {
    assert.equal(reverse ? reverseLine(mapped[i]) : mapped[i], lines[i]);
    assert.equal(runes(mapped[i]).length, runes(lines[i]).length);
  }
  return runes(mapped.join("\n"));
}
/** @param {string} text @returns {number[]} */
function encode(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(row => word.startsWith(row.token, i));
      assert.ok(token);
      result.push(token.index);
      i += token.token.length;
    }
  }
  return result;
}
const sources = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
].map(name => {
  const values = encode(read(name));
  const split = Math.floor(values.length * 0.70);
  return {train: values.slice(0, split), holdout: values.slice(split)};
});
const counts = new Uint32Array(29 ** 3);
for (const source of sources) {
  for (let i = 2; i < source.train.length; i += 1) {
    counts[841 * source.train[i - 2] + 29 * source.train[i - 1] + source.train[i]] += 1;
  }
}
const total = counts.reduce((sum, count) => sum + count, 0);
/** @param {number[]} values @returns {number} */
function score(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i += 1) {
    const key = 841 * values[i - 2] + 29 * values[i - 1] + values[i];
    sum += Math.log((counts[key] + 0.5) / (total + 0.5 * counts.length));
  }
  return sum / (values.length - 2);
}
const native = [];
for (const source of sources) {
  for (let i = 0; i + 40 <= source.holdout.length; i += 40) {
    native.push(score(source.holdout.slice(i, i + 40)));
  }
}
native.sort((a, b) => a - b);
const nativeP1 = native[Math.floor(native.length * 0.01)];
/** @param {number[]} pages @param {boolean} alternate */
function summary(pages, alternate) {
  const rows = pages.map(page => {
    const values = pageValues(page, alternate);
    let max40 = -Infinity;
    let maxOffset = -1;
    let above = 0;
    for (let i = 0; i + 40 <= values.length; i += 1) {
      const candidate = score(values.slice(i, i + 40));
      if (candidate > max40) { max40 = candidate; maxOffset = i; }
      if (candidate >= nativeP1) above += 1;
    }
    return {page, length: values.length, score: score(values), max40, maxOffset, aboveNativeP1: above};
  });
  return rows;
}
const target = [8,9,10,11,12,13,14];
const before = [3,4,5,6,7];
const after = [15,16,17,18,19,20,21];
assert.deepEqual(target.map(p => p % 2 ? "R" : "L"), ["L","R","L","R","L","R","L"]);
for (const page of [...before, ...target, ...after]) {
  assert.equal(pageValues(page, true).length, corpus.pages[page].runic_count);
}
// A source-native 40-rune plant passes through the same line reversal and inverse.
const plant = sources[1].holdout.slice(0, 40).map(value => corpus.runes[value]).join("");
assert.deepEqual(runes(reverseLine(reverseLine(plant + "/"))), runes(plant));
const result = {
  native: {windows: native.length, p1: nativeP1, median: native[Math.floor(native.length / 2)]},
  knownClearP57: {length: pageValues(57, false).length, score: score(pageValues(57, false))},
  targetOriginal: summary(target, false),
  targetStalkDirection: summary(target, true),
  beforeControlOriginal: summary(before, false),
  beforeControlAlternating: summary(before, true),
  afterControlOriginal: summary(after, false),
  afterControlAlternating: summary(after, true),
};
assert.equal(result.knownClearP57.length, 95);
assert.ok(result.knownClearP57.score > nativeP1);
assert.equal(result.targetStalkDirection.reduce((sum, row) => sum + row.length, 0), 1729);
assert.equal(result.targetStalkDirection.reduce((sum, row) => sum + row.aboveNativeP1, 0), 0);
assert.equal(result.targetStalkDirection.reduce((sum, row) => sum + row.length - 39, 0), 1456);
console.log(JSON.stringify(result, null, 2));
