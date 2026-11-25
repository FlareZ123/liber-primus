#!/usr/bin/env node
'use strict';

// Frozen, source-derived matched controls for the provisional p57→p50→p32→p37 route.
// Run from the repository root with Node 22:
//   node sims/lp2_p57_p50_p32_p37_matched_decoy_sft.cjs
//
// This tests only the already-published four addresses and compass rule. It does not
// search new addresses, directions, starts, page layouts, or cipher families.

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const translit = corpus.translit;

const addresses = [204, 179, 215, 130];
const tokens = grid.pages.flatMap(page => page.tokens);
const bytes60 = grid.pages.flatMap(page => page.bytes);
const selectedTokens = addresses.map(i => tokens[i]);
const selectedBytes60 = addresses.map(i => bytes60[i]);
const base59Alphabet = grid.alphabet.replace('f', '');
const selectedBytes59 = selectedTokens.map(token =>
  base59Alphabet.indexOf(token[0]) * 59 + base59Alphabet.indexOf(token[1])
);

assert.deepEqual(selectedTokens, ['3E', '2t', '1O', '1Q']);
assert.deepEqual(selectedBytes60, [194, 175, 84, 86]);
assert.deepEqual(selectedBytes59, [191, 172, 83, 85]);

// Coordinates are row/column; direction order is N,NE,E,SE,S,SW,W,NW.
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];

function trace(start, bytes, split = 'low3') {
  let row = Math.floor(start / 11);
  let col = start % 11;
  const path = [start];

  for (const byte of bytes) {
    const direction = split === 'low3' ? (byte & 7) : (byte >> 5);
    const distance = split === 'low3' ? (byte >> 3) : (byte & 31);
    row = ((row + directions[direction][0] * distance) % 11 + 11) % 11;
    col = ((col + directions[direction][1] * distance) % 11 + 11) % 11;
    path.push(row * 11 + col);
  }
  return path;
}

function positions(values, value) {
  return values.map((v, i) => v === value ? i : -1).filter(i => i >= 0);
}

function scanWindow(values) {
  const hits = [];
  for (const start of positions(values, 8)) { // GP rune H; prime weight 23
    const path = trace(start, selectedBytes60);
    const runes = path.map(i => translit[values[i]]);
    if (path[4] < 43 && values[path[4]] === 14) { // X at a valid signed-message word index
      hits.push({
        start,
        path,
        runes,
        marker: runes[1] === 'M' && runes[3] === 'E' && runes[4] === 'X'
      });
    }
  }
  return hits;
}

const p32 = corpus.pages.find(page => page.page === 32);
assert.ok(p32);
assert.equal(p32.runic_count, 121);
assert.equal(p32.indices.length, 121);
assert.equal(corpus.pages.filter(page => page.runic_count === 121).length, 1);
const hPositions = positions(p32.indices, 8);
const xPositions = positions(p32.indices, 14);
assert.deepEqual(hPositions, [11, 23, 33, 74, 79]);
assert.deepEqual(xPositions, [37, 54, 61, 68, 70]);

const p32Traces = hPositions.map(start => {
  const path = trace(start, selectedBytes60);
  return { start, path, end: path[4], runes: path.map(i => translit[p32.indices[i]]) };
});
assert.deepEqual(p32Traces.map(item => item.end), [15, 27, 37, 67, 83]);
const p32Match = p32Traces.filter(item => item.end < 43 && p32.indices[item.end] === 14);
assert.equal(p32Match.length, 1);
assert.equal(p32Match[0].start, 33);
assert.deepEqual(p32Match[0].path, [33, 35, 47, 36, 37]);
assert.deepEqual(p32Match[0].runes, ['H', 'M', 'IA', 'E', 'X']);

// The four moves have net displacement (0,+4) modulo 11.
const endpoint = p32Match[0].end;
assert.equal(Math.floor(endpoint / 11), Math.floor(33 / 11));
assert.equal((endpoint % 11 - 33 % 11 + 11) % 11, 4);

// Same addresses under the drop-f base59 rival: no H reaches an X.
const p32Base59Ends = hPositions.map(start => trace(start, selectedBytes59)[4]);
assert.deepEqual(p32Base59Ends, [98, 99, 120, 29, 34]);
assert.equal(p32Base59Ends.some(i => p32.indices[i] === 14), false);

// Opposite high-three-bit direction / low-five-bit distance split reaches X70
// from H23, which is outside the 43-word signed-message index range.
const reversedPath = trace(23, selectedBytes60, 'high3');
assert.equal(reversedPath[4], 70);
assert.equal(p32.indices[70], 14);
assert.ok(reversedPath[4] >= 43);

// Matched physical-page-prefix control: first 121 runes of every page with >=121.
const pagePrefixes = corpus.pages.slice(0, 56)
  .filter(page => page.runic_count >= 121)
  .map(page => ({ page: page.page, hits: scanWindow(page.indices.slice(0, 121)) }));
assert.equal(pagePrefixes.length, 52);
assert.deepEqual(
  pagePrefixes.filter(item => item.hits.length > 0).map(item => item.page),
  [5, 25, 32, 38]
);
assert.deepEqual(
  pagePrefixes.filter(item => item.hits.some(hit => hit.marker)).map(item => item.page),
  [32]
);

// Length-matched, disjoint 121-rune windows, tiled around the exact p32 page start.
// These are windows, not claims that the other windows are physical pages.
const unknownTape = corpus.pages.slice(0, 56).flatMap(page => page.indices);
const p32Start = corpus.pages.slice(0, 32)
  .reduce((sum, page) => sum + page.runic_count, 0);
assert.equal(p32Start, 7839);

const windowStarts = [];
for (let start = p32Start; start + 121 <= unknownTape.length; start += 121) {
  windowStarts.push(start);
}
for (let start = p32Start - 121; start >= 0; start -= 121) {
  windowStarts.push(start);
}
windowStarts.sort((a, b) => a - b);
assert.equal(windowStarts.length, 106);

const windows = windowStarts.map(start => ({
  start,
  hits: scanWindow(unknownTape.slice(start, start + 121))
}));
assert.equal(windows.filter(item => item.hits.length > 0).length, 7);
const markerWindows = windows.filter(item => item.hits.some(hit => hit.marker));
assert.equal(markerWindows.length, 1);
assert.equal(markerWindows[0].start, p32Start);

const output = {
  sourceFiles: [
    'resources/liber-primus/lp2-corpus.json',
    'resources/liber-primus/lp2-grid-256.json'
  ],
  addresses,
  selectedTokens,
  selectedBytes60,
  selectedBytes59,
  p32HPositions: hPositions,
  p32XPositions: xPositions,
  p32HEndpoints: p32Traces.map(item => item.end),
  p32SelectedPath: p32Match[0],
  netDisplacementModulo11: [0, 4],
  base59HEndpoints: p32Base59Ends,
  reversedSplitFromH23: reversedPath,
  pagePrefixControl: {
    pagesTested: pagePrefixes.length,
    pagesWithHtoX: [5, 25, 32, 38],
    pagesWithHtoMtoEtoX: [32]
  },
  disjointWindowControl: {
    windowsTested: windows.length,
    windowsWithHtoX: windows.filter(item => item.hits.length > 0).map(item => item.start),
    windowsWithHtoMtoEtoX: markerWindows.map(item => item.start)
  },
  interpretation: 'Descriptive conditional controls only; no discovery-wide p-value or source authentication.'
};

console.log(JSON.stringify(output, null, 2));
