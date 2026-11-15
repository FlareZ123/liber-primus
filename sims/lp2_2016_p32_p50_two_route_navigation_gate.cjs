#!/usr/bin/env node
"use strict";

// Frozen test of the marker-derived p50 navigation hypothesis.
// Visual transcription: centre-only rows are bit 1; left+right rows are bit 0.
// Correct image mapping: only logical p32 (original JPEG49) supplies the 13-dot
// marker used here; the earlier p49/p53 marker corroboration was erroneous.
// The 2016 signed-message map supplies Good/Luck target runes.
// The 13-rune window at offset25 is not source-selected and matches sum413
// only after searching among the page's 109 consecutive 13-rune windows.
// A 256-start enumeration is an internal consistency check, not a null model
// correcting for the selected window, polarity or traversal rules.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = p => fs.readFileSync(p, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const printedSource = read("resources/lp2-transcription.txt").split("%");
assert.equal(printedSource.length, 57);

function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const lp2Pages = Array.from({length: 58}, (_, p) =>
  p === 50 ? [] : printedWords(printedSource[p > 50 ? p - 1 : p]));
const alphabet = corpus.translit
  .map((token, index) => ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

function encodeWord(word) {
  const source = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = alphabet.find(({token}) => source.startsWith(token, i));
    if (!hit) throw new Error(`No GP token at ${word}:${source.slice(i)}`);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}
function decodeRunes(word) {
  return [...word].map(rune => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1);
    return corpus.translit[index];
  }).join("");
}
const mod = (n, m) => ((n % m) + m) % m;
const address = value => ({page: value % 58, wordIndex: Math.floor(value / 58)});
const wordAtValue = value => {
  const {page, wordIndex} = address(value);
  const runes = lp2Pages[page]?.[wordIndex] ?? null;
  return {value, page, wordIndex, gp: runes ? decodeRunes(runes) : null};
};

// Reconstruct the 43 authentic words in the signed 2016 message and its
// provisional 58-page prime-sum word map.
const signedPayload = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedMessage = signedPayload.slice(
  signedPayload.indexOf("Hello."),
  signedPayload.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedWords = signedMessage.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);
const mapped = signedWords.map(word => {
  const sum = encodeWord(word).reduce((n, index) => n + corpus.prime[index], 0);
  const {page, wordIndex} = address(sum);
  return {word, sum, page, wordIndex, runes: lp2Pages[page]?.[wordIndex] ?? null};
});
const good = mapped.find(row => row.word.toLowerCase() === "good");
const luck = mapped.find(row => row.word.toLowerCase() === "luck");
assert.deepEqual(
  [good.page, good.wordIndex, decodeRunes(good.runes), luck.page, luck.wordIndex, decodeRunes(luck.runes)],
  [4, 2, "LGFNIACX", 44, 1, "GTHY"]
);
const goodLuckRunes = [...good.runes, ...luck.runes];
const goodLuckSteps = [...goodLuckRunes].map(rune => corpus.prime[corpus.runes.indexOf(rune)]);
assert.equal(goodLuckSteps.length, 10);
assert.equal(goodLuckSteps.reduce((a, b) => a + b, 0), 413);
assert.deepEqual(goodLuckSteps, [73, 17, 2, 29, 107, 13, 47, 17, 5, 103]);

// Exploratory p32 13-rune window: word start at offset25, but the span
// ends five runes into an eleven-rune printed word; no ink marks this span.
const p32Window = corpus.pages.find(page => page.page === 32).indices.slice(25, 38);
const p32WindowText = p32Window.map(index => corpus.translit[index]);
const p32Steps = p32Window.map(index => corpus.prime[index]);
assert.deepEqual(p32WindowText, ["IA", "R", "T", "TH", "F", "F", "O", "TH", "H", "O", "M", "E", "X"]);
assert.equal(p32Steps.length, 13);
assert.equal(p32Steps.reduce((a, b) => a + b, 0), 413);
assert.deepEqual(p32Steps, [107, 11, 59, 5, 2, 2, 7, 5, 23, 7, 71, 67, 47]);

// Correct image mapping: logical p32 is original JPEG49. Its final red
// marker has 13 dots in nine alternating rows. This binary polarity is a
// hypothesis; the earlier p49/p53 marker corroboration was based on wrong files.
const p32MarkerBits = "101010101";
const dotCount = bits => [...bits].reduce((sum, bit) => sum + (bit === "1" ? 1 : 2), 0);
const p32MarkerCode = Number.parseInt(p32MarkerBits, 2);
assert.equal(dotCount(p32MarkerBits), 13);
assert.equal(p32MarkerCode, 341);
const oppositePolarityCode = Number.parseInt("010101010", 2);
const start = p32MarkerCode % 256;
assert.equal(start, 85);
assert.equal(oppositePolarityCode, 170);

const tableBytes = grid.pages.flatMap(page => page.bytes);
const tableTokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tableBytes.length, 256);
assert.equal(tableTokens.length, 256);

function tableFor(order) {
  if (order === "row-major") return tableBytes;
  // The source table is 32 rows × 8 columns; transpose the flattened order.
  return Array.from({length: 256}, (_, index) =>
    tableBytes[(index % 32) * 8 + Math.floor(index / 32)]
  );
}
function walk(steps, startCell, table = tableBytes, sign = 1) {
  let position = startCell;
  const positions = [];
  const values = [];
  for (const step of steps) {
    position = mod(position + sign * step, 256);
    positions.push(position);
    values.push(table[position]);
  }
  return {positions, values, end: position};
}

const p32Path = walk(p32Steps, start);
const goodLuckPath = walk(goodLuckSteps, start);
assert.deepEqual(p32Path.positions, [192, 203, 6, 11, 13, 15, 22, 27, 50, 57, 128, 195, 242]);
assert.deepEqual(goodLuckPath.positions, [158, 175, 177, 206, 57, 70, 117, 134, 139, 242]);
assert.equal(p32Path.end, 242);
assert.equal(goodLuckPath.end, 242);

const sharedPositions = [...new Set(p32Path.positions.filter(position => goodLuckPath.positions.includes(position)))];
const sharedValues = sharedPositions.map(position => tableBytes[position]);
assert.deepEqual(sharedPositions, [57, 242]);
assert.deepEqual(sharedValues, [118, 42]);
assert.equal(Math.abs(sharedValues[0] - sharedValues[1]), 76);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);

// Directly interpret each route value as a base-58 page/word address.
// This is a source-motivated book-cipher candidate, but its full readout is
// nonlinguistic; retain the exact output as a negative control.
const p32ValueWords = p32Path.values.map(wordAtValue);
const goodLuckValueWords = goodLuckPath.values.map(wordAtValue);
assert.deepEqual(p32ValueWords.map(row => [row.page, row.wordIndex, row.gp]), [
  [0, 0, "SHEOGMIAF"], [10, 1, "XU"], [10, 2, "PTSUE"], [48, 3, "IATI"],
  [4, 0, "LIA"], [38, 3, "SRUTH"], [1, 1, "SOERUWSLIA"], [25, 0, "HN"],
  [47, 0, "EAITH"], [2, 2, "HT"], [27, 3, "NHGUIAHU"], [31, 1, "SIA"], [42, 0, "D"]
]);
assert.deepEqual(goodLuckValueWords.map(row => [row.page, row.wordIndex, row.gp]), [
  [17, 4, "NM"], [18, 0, "EAAJEOEAL"], [15, 2, "LUNGN"], [11, 2, "NLNG"],
  [2, 2, "HT"], [53, 2, "XIUNOOEN"], [55, 2, "SB"], [14, 1, "FOLD"],
  [13, 0, "GTHFJGC"], [42, 0, "D"]
]);
assert.deepEqual(goodLuckPath.values.slice(6, 8), [171, 72]);
assert.deepEqual(goodLuckValueWords.slice(6, 8).map(row =>
  [row.page, row.wordIndex, row.gp]), [[55, 2, "SB"], [14, 1, "FOLD"]]);

// Sweep every start under row/column-major and positive/negative traversal.
function sweep(order, sign) {
  const table = tableFor(order);
  const rows = Array.from({length: 256}, (_, candidateStart) => {
    const a = walk(p32Steps, candidateStart, table, sign);
    const b = walk(goodLuckSteps, candidateStart, table, sign);
    const shared = [...new Set(a.positions.filter(position => b.positions.includes(position)))];
    const values = shared.map(position => table[position]);
    const difference = values.length === 2 ? Math.abs(values[0] - values[1]) : null;
    const mappedGoodLuck = b.values.map(wordAtValue);
    const sbThenFold = mappedGoodLuck.some((row, i) =>
      row.page === 55 && row.wordIndex === 2 &&
      mappedGoodLuck[i + 1]?.page === 14 && mappedGoodLuck[i + 1]?.wordIndex === 1
    );
    return {start: candidateStart, shared, sharedValues: values, difference, sbThenFold};
  });
  return {
    order, sign,
    startsWithSbThenFold: rows.filter(row => row.sbThenFold).map(row => row.start),
    startsWithDifference76: rows.filter(row => row.difference === 76).map(row => row.start),
    startsWithBoth: rows.filter(row => row.sbThenFold && row.difference === 76).map(row => row.start)
  };
}
const orientationSweep = [
  sweep("row-major", 1),
  sweep("row-major", -1),
  sweep("column-major", 1),
  sweep("column-major", -1)
];
assert.deepEqual(orientationSweep[0].startsWithSbThenFold, [44, 85]);
assert.deepEqual(orientationSweep[0].startsWithDifference76, [85, 223]);
assert.deepEqual(orientationSweep[0].startsWithBoth, [85]);
assert.deepEqual(orientationSweep.slice(1).map(row => row.startsWithBoth), [[], [], []]);
assert(!orientationSweep.some(row => row.startsWithBoth.includes(oppositePolarityCode)));

console.log(JSON.stringify({
  markerEncoding: {
    logicalPage: 32, originalImage: "49.jpg", p32Bits: p32MarkerBits,
    p32Code: p32MarkerCode, oppositePolarityCode, startCell: start
  },
  p32Window: {text: p32WindowText.join(" "), steps: p32Steps, sum: 413},
  goodLuck: {
    mappedTargets: [{page: good.page, wordIndex: good.wordIndex, gp: decodeRunes(good.runes)},
      {page: luck.page, wordIndex: luck.wordIndex, gp: decodeRunes(luck.runes)}],
    steps: goodLuckSteps, sum: 413
  },
  p32Path, goodLuckPath,
  p32ValueAddressReadout: p32ValueWords,
  goodLuckValueAddressReadout: goodLuckValueWords,
  sharedCheckpoints: {positions: sharedPositions, values: sharedValues, difference: 76, p55Length: 76},
  goodLuckFoldPointer: goodLuckValueWords.slice(6, 8),
  orientationSweep
}, null, 2));
