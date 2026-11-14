#!/usr/bin/env node
'use strict';

// Bounded test: p50 innermost 26x2 perimeter -> p55 final 52 GP29 runes.
// The 24-rune p55 first-line boundary is source-visible in the original page.
const fs = require('node:fs');

const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8')).bytes;
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const p55 = corpus.pages.find(p => p.page === 55).indices;
const tail = p55.slice(24);
if (grid.length !== 256 || p55.length !== 76 || tail.length !== 52) {
  throw new Error('Unexpected original input dimensions');
}

// One-based rows 4..29, columns 4..5: 26x2 innermost rectangle.
const coords = [[4, 4], [4, 5]];
for (let row = 5; row <= 28; row++) coords.push([row, 5]);
coords.push([29, 5], [29, 4]);
for (let row = 28; row >= 5; row--) coords.push([row, 4]);
if (coords.length !== 52 || new Set(coords.map(x => x.join(','))).size !== 52) {
  throw new Error('Inner perimeter coordinate error');
}
const ring = coords.map(([row, col]) => grid[(row - 1) * 8 + (col - 1)]);

function bestStationaryMap(source, target) {
  const classes = new Map();
  for (let i = 0; i < source.length; i++) {
    if (!classes.has(source[i])) classes.set(source[i], Array(29).fill(0));
    classes.get(source[i])[target[i]]++;
  }
  return [...classes.values()].reduce((sum, counts) => sum + Math.max(...counts), 0);
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

let bestRaw = 0, bestMod29 = 0;
for (let reverse = 0; reverse < 2; reverse++) {
  for (let start = 0; start < 52; start++) {
    const aligned = Array.from({ length: 52 }, (_, i) =>
      ring[(start + (reverse ? -i : i) + 104) % 52]);
    bestRaw = Math.max(bestRaw, bestStationaryMap(aligned, tail));
    bestMod29 = Math.max(bestMod29, bestStationaryMap(aligned.map(x => x % 29), tail));
  }
}
const add = tail.map((x, i) => (x + ring[i] % 29) % 29);
const subtract = tail.map((x, i) => (x - ring[i] % 29 + 29) % 29);
const xorLow5 = tail.map((x, i) => x ^ (ring[i] & 31));
const xorMod29 = tail.map((x, i) => (x ^ (ring[i] % 29)) % 29);
const result = {
  coordinates: coords.length,
  distinctRawBytes: new Set(ring).size,
  distinctMod29Bytes: new Set(ring.map(x => x % 29)).size,
  tailIoC: ioc(tail),
  bestStationaryRawAll104: bestRaw,
  bestStationaryMod29All104: bestMod29,
  addIoC: ioc(add),
  subtractIoC: ioc(subtract),
  xorLow5Valid: xorLow5.filter(x => x >= 0 && x < 29).length,
  xorMod29IoC: ioc(xorMod29),
};
console.log(JSON.stringify(result, null, 2));
if (result.bestStationaryRawAll104 !== 47 ||
    result.bestStationaryMod29All104 !== 28 ||
    result.xorLow5Valid !== 48) {
  throw new Error('Frozen expected result mismatch');
}
