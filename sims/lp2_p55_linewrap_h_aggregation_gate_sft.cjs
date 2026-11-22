"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}
const wordsByPage = new Map();
let current = [];
let breaks = [];
const offsets = Array(58).fill(0);
let segment = 0;
function finishWord() {
  if (current.length === 0) return;
  const segments = [...new Set(current.map((site) => site.segment))];
  if (segments.length === 1) {
    const page = physicalPage(segments[0]);
    if (page <= 55) {
      if (!wordsByPage.has(page)) wordsByPage.set(page, []);
      const pageWords = wordsByPage.get(page);
      pageWords.push({
        page, ordinal: pageWords.length + 1, start: current[0].offset,
        values: current.map((site) => site.value), breaks: breaks.slice(),
      });
    }
  }
  current = [];
  breaks = [];
}
for (const character of transcription) {
  if (character === "%") segment += 1;
  else if (runeIndex.has(character)) {
    current.push({ segment, offset: offsets[segment], value: runeIndex.get(character) });
    offsets[segment] += 1;
  } else if (character === "/") {
    if (current.length > 0) breaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Physical whitespace does not terminate a printed word.
  } else finishWord();
}
finishWord();

function H(x, y) {
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}
function hPair(values) {
  const out = [];
  for (let layer = 0; layer < Math.floor(values.length / 2); layer += 1) {
    out.push(...H(values[layer], values[values.length - 1 - layer]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}
function hSplit(values) {
  const differences = [];
  const sums = [];
  for (let layer = 0; layer < Math.floor(values.length / 2); layer += 1) {
    const [difference, sum] = H(values[layer], values[values.length - 1 - layer]);
    differences.push(difference);
    sums.unshift(sum);
  }
  if (values.length % 2 === 1) differences.push(values[(values.length - 1) / 2]);
  return [...differences, ...sums];
}
function longestSetRuns(values) {
  const set = new Set(values);
  let best = 0, runs = [];
  for (let start = 0; start < 29;) {
    if (!set.has(start)) { start += 1; continue; }
    let end = start;
    while (end < 29 && set.has(end)) end += 1;
    const length = end - start;
    if (length > best) { best = length; runs = [[start, end - 1]]; }
    else if (length === best) runs.push([start, end - 1]);
    start = end;
  }
  return { best, runs };
}
function longestOrderedRuns(values) {
  let best = 0, runs = [];
  for (let start = 0; start < values.length;) {
    let end = start + 1;
    while (end < values.length && values[end] === values[end - 1] + 1) end += 1;
    const length = end - start;
    if (length > best) { best = length; runs = [[start, end - 1, values[start], values[end - 1]]]; }
    else if (length === best) runs.push([start, end - 1, values[start], values[end - 1]]);
    start = end;
  }
  return { best, runs };
}
function longestSortedMultisetRuns(values) {
  const sorted = [...values].sort((a, b) => a - b);
  let best = 0, runs = [];
  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end] === sorted[end - 1] + 1) end += 1;
    const length = end - start;
    if (length > best) { best = length; runs = [[sorted[start], sorted[end - 1]]]; }
    else if (length === best) runs.push([sorted[start], sorted[end - 1]]);
    start = end;
  }
  return { best, runs };
}

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const signedWords = (signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [])
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
assert.deepEqual(signedWords.slice(16, 27), [
  "ARE", "THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD", "AND", "THEIR", "NUMBERS",
]);

const variants = ["whole", "fragments", "whole+prefix", "whole+suffix", "whole+both"];
const rows = [];
for (const [page, pageWords] of wordsByPage) {
  for (const word of pageWords) {
    if (word.breaks.length !== 1 || word.breaks[0] <= 0 || word.breaks[0] >= word.values.length) continue;
    const split = word.breaks[0];
    const whole = hPair(word.values);
    const prefix = hPair(word.values.slice(0, split));
    const suffix = hPair(word.values.slice(split));
    const objects = {
      whole,
      fragments: [...prefix, ...suffix],
      "whole+prefix": [...whole, ...prefix],
      "whole+suffix": [...whole, ...suffix],
      "whole+both": [...whole, ...prefix, ...suffix],
    };
    const row = { page, ordinal: word.ordinal, start: word.start, length: word.values.length, split };
    for (const variant of variants) row[variant] = longestSetRuns(objects[variant]);
    row.orderedPair = longestOrderedRuns([...whole, ...prefix, ...suffix]);
    row.orderedSplit = longestOrderedRuns([
      ...hSplit(word.values), ...hSplit(word.values.slice(0, split)), ...hSplit(word.values.slice(split)),
    ]);
    row.fullValues = objects["whole+both"];
    rows.push(row);
  }
}
assert.equal(rows.length, 388);
const p55 = rows.find((row) => row.page === 55 && row.ordinal === 7);
assert.ok(p55);
assert.deepEqual([p55.start, p55.length, p55.split], [23, 13, 1]);
assert.deepEqual(p55.whole, { best: 4, runs: [[21, 24]] });
assert.deepEqual(p55.fragments, { best: 3, runs: [[16, 18]] });
assert.deepEqual(p55["whole+prefix"], { best: 4, runs: [[21, 24]] });
assert.deepEqual(p55["whole+suffix"], { best: 9, runs: [[18, 26]] });
assert.deepEqual(p55["whole+both"], { best: 11, runs: [[16, 26]] });
assert.deepEqual(longestSortedMultisetRuns(p55.fullValues), { best: 7, runs: [[16, 22]] });
const p55Counts = new Map();
for (const value of p55.fullValues) p55Counts.set(value, (p55Counts.get(value) || 0) + 1);
const p55TargetCounts = Object.fromEntries(
  Array.from({ length: 11 }, (_, i) => [16 + i, p55Counts.get(16 + i) || 0])
);
assert.deepEqual(p55TargetCounts, {
  16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 2, 23: 1, 24: 1, 25: 1, 26: 1,
});

const p24 = rows.find((row) => row.page === 24 && row.ordinal === 37);
assert.ok(p24);
assert.deepEqual(p24["whole+prefix"], { best: 7, runs: [[9, 15]] });
assert.deepEqual(p24["whole+both"], { best: 7, runs: [[9, 15]] });

const p32Words = wordsByPage.get(32);
assert.ok(p32Words);
assert.equal(p32Words.length, 21);
const p32Middle = p32Words[10];
assert.deepEqual([p32Middle.ordinal, p32Middle.start, p32Middle.breaks], [11, 64, [7]]);
assert.deepEqual(longestSetRuns([
  ...hPair(p32Middle.values),
  ...hPair(p32Middle.values.slice(0, 7)),
  ...hPair(p32Middle.values.slice(7)),
]), { best: 5, runs: [[0, 4]] });

const maxima = {};
for (const variant of variants) {
  const max = Math.max(...rows.map((row) => row[variant].best));
  maxima[variant] = {
    max,
    winners: rows.filter((row) => row[variant].best === max)
      .map((row) => [row.page, row.ordinal, row[variant].runs]),
  };
}
for (const [key, property] of [["orderedPair", "orderedPair"], ["orderedSplit", "orderedSplit"]]) {
  const max = Math.max(...rows.map((row) => row[property].best));
  maxima[key] = {
    max,
    winners: rows.filter((row) => row[property].best === max)
      .map((row) => [row.page, row.ordinal, row[property].runs]),
  };
}
assert.deepEqual(
  Object.fromEntries(variants.map((variant) => [variant, maxima[variant].max])),
  { whole: 5, fragments: 6, "whole+prefix": 7, "whole+suffix": 9, "whole+both": 11 }
);
assert.equal(maxima.orderedPair.max, 3);
assert.equal(maxima.orderedSplit.max, 3);
assert.equal(rows.filter((row) => row["whole+both"].best >= 9).length, 1);
assert.equal(rows.filter((row) => row.length === 13).length, 3);

console.log(JSON.stringify({
  status: "PASS",
  lineWrappedWords: rows.length,
  p55: {
    page: p55.page, word: p55.ordinal, length: p55.length, split: p55.split,
    alternatives: Object.fromEntries(variants.map((variant) => [variant, p55[variant]])),
    orderedHpair: p55.orderedPair, orderedHsplit: p55.orderedSplit,
    sortedMultiset: longestSortedMultisetRuns(p55.fullValues),
    targetResidueMultiplicities: p55TargetCounts,
  },
  p24: { page: p24.page, word: p24.ordinal, wholePlusPrefix: p24["whole+prefix"], wholePlusBoth: p24["whole+both"] },
  p32: { middleWord: p32Middle.ordinal, split: p32Middle.breaks[0], wholePlusFragments: { best: 5, runs: [[0, 4]] } },
  maxima,
  sourceRegisterLength: signedWords.length,
  sourceRun16to26: signedWords.slice(16, 27),
}, null, 2));
