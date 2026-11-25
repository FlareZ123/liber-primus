#!/usr/bin/env node
'use strict';

// Source-fixed extraction candidate:
// 2014 Stage10 image filenames -> prime ordinals -> positions in the unique
// 121-rune LP2 page. This verifies the arithmetic, not the author's intent.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const responsePath = path.join(root, 'resources/external/2014-stage10-post-square-response.html');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const html = fs.readFileSync(responsePath, 'utf8');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

const imageIds = [...html.matchAll(/\/(\d+)\.jpg/g)].map(match => Number(match[1]));
assert.deepEqual(imageIds, [107, 167, 229], 'preserved response must name exactly these three images');

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function primeOrdinal(n) {
  assert.ok(isPrime(n), String(n) + ' must be prime');
  let rank = 0;
  for (let k = 2; k <= n; k++) if (isPrime(k)) rank++;
  return rank;
}

const primeOrdinals = imageIds.map(primeOrdinal);
assert.deepEqual(primeOrdinals, [28, 39, 50]);
assert.deepEqual(
  primeOrdinals.slice(1).map((value, i) => value - primeOrdinals[i]),
  [11, 11]
);

const pages121 = corpus.pages.filter(page => page.runic_count === 121);
assert.deepEqual(pages121.map(page => page.page), [32], 'p32 must be the unique 121-rune page');
const p32 = pages121[0];
assert.equal(p32.indices.length, 121);

const offsets = primeOrdinals.map(rank => rank - 1); // one-based rune positions -> zero-based offsets
assert.deepEqual(offsets, [27, 38, 49]);
const coordinates = offsets.map(offset => ({
  row: Math.floor(offset / 11) + 1,
  column: (offset % 11) + 1
}));
assert.deepEqual(coordinates, [
  { row: 3, column: 6 },
  { row: 4, column: 6 },
  { row: 5, column: 6 }
]);

const gpIndices = offsets.map(offset => p32.indices[offset]);
const glyphs = gpIndices.map(index => corpus.runes[index]);
const transliteration = gpIndices.map(index => corpus.translit[index]).join('');
assert.deepEqual(glyphs, ['ᛏ', 'ᚹ', 'ᚪ']);
assert.equal(transliteration, 'TWA');

const verticalTwa = [];
for (let row = 0; row <= 8; row++) {
  for (let column = 0; column < 11; column++) {
    const positions = [0, 1, 2].map(delta => (row + delta) * 11 + column);
    const value = positions.map(position => corpus.translit[p32.indices[position]]).join('');
    if (value === 'TWA') verticalTwa.push({ row: row + 1, column: column + 1, positions });
  }
}
assert.equal(verticalTwa.length, 1, 'TWA should be unique among all 99 vertical windows');

const centralColumn = Array.from({ length: 11 }, (_, row) =>
  corpus.translit[p32.indices[row * 11 + 5]]
).join('');

console.log(JSON.stringify({
  source: 'resources/external/2014-stage10-post-square-response.html',
  imageIds,
  primeOrdinals,
  primeOrdinalDifferences: [11, 11],
  unique121RunePage: p32.page,
  oneBasedRunePositions: primeOrdinals,
  zeroBasedOffsets: offsets,
  rowMajor11x11Coordinates: coordinates,
  selectedRunes: glyphs,
  transliteration,
  centralColumn,
  uniqueVerticalTwaWindows: verticalTwa.length,
  classification: 'candidate three-rune clue only; filename intent and 11x11 reflow are not authenticated'
}, null, 2));
