#!/usr/bin/env node
'use strict';

// Source-motivated test: "shed our own circumferences" selects p55 word
// interiors; the 2016 signed message says numbers are direction; p32 is a
// map. Reuse the already source-derived p50 compass encoding:
// direction = GP29_index & 7, distance = GP29_index >> 3.
// Test only five source-visible origins, forward reading, toroidal 11x11 walk.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const model = trainNativeGP(read('resources/control/emerson_essays_2944.txt'));
const p32 = corpus.pages.find(p => p.page === 32).indices;
assert.strictEqual(p32.length, 121);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p55Words = transcription.split('%')[54]
  .replace(/\/\s*/g, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const interior = p55Words.flatMap(word => Array.from(word).slice(1, -1))
  .map(rune => runeIndex.get(rune));
assert.strictEqual(interior.length, 43);

const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
const starts = [
  { name: 'p32-map-center', row: 5, col: 5 },
  { name: '2016-dimension-selected-EN-first', row: 9, col: 3 },
  { name: '2016-dimension-selected-EN-second', row: 9, col: 4 },
  { name: '2014-7x7-square-center', row: 3, col: 3 },
  { name: 'p50-compass-route-origin', row: 3, col: 0 },
];
const mod = n => ((n % 11) + 11) % 11;
const ioc = xs => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const results = starts.map(start => {
  let row = start.row, col = start.col;
  const coords = [], output = [];
  for (const value of interior) {
    const [dy, dx] = directions[value & 7];
    const distance = value >> 3;
    row = mod(row + dy * distance);
    col = mod(col + dx * distance);
    coords.push([row, col]);
    output.push(p32[row * 11 + col]);
  }
  return {
    start: start.name,
    startCoordinate: [start.row, start.col],
    endCoordinate: [row, col],
    firstCoordinates: coords.slice(0, 8),
    outputTokens: output.map(x => corpus.translit[x]),
    output: output.map(x => corpus.translit[x]).join(''),
    distinctSymbols: new Set(output).size,
    ioc: ioc(output),
    emersonGpLanguageScore: languageScore(output, model),
  };
});
console.log(JSON.stringify({
  hypothesis: 'p55 interior rune ordinals are 8-way direction + distance codes on p32 map',
  sourceInterior: interior.map(x => corpus.translit[x]).join(''),
  interiorRunes: interior.length,
  encoding: { direction: 'value & 7', distance: 'value >> 3', wrap: 'mod 11' },
  results,
  conclusion: 'None of the five source-visible origins produces plaintext. This rejects only the p50-derived compass encoding applied to p55 interiors on the p32 map at these origins.',
}, null, 2));
