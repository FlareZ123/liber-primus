#!/usr/bin/env node
'use strict';

// Reproduce two bounded, source-motivated uses of the p32 inner-5 perimeter
// against the exact 1,136-byte 2016 OutGuess payload. No key/orientation sweep.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const payload = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'));
const page = corpus.pages.find((p) => p.page === 32);
assert.ok(page, 'p32 must exist');
assert.equal(page.indices.length, 121, 'p32 must contain the source 11×11 rune matrix');

const weights = page.indices.map((index) => corpus.prime[index]);
const grid = Array.from({ length: 11 }, (_, r) => weights.slice(r * 11, (r + 1) * 11));
const ring = [
  ...grid[3].slice(3, 8),
  ...grid.slice(4, 8).map((row) => row[7]),
  ...grid[7].slice(3, 7).reverse(),
  ...grid.slice(4, 7).map((row) => row[3]).reverse()
];
assert.deepEqual(ring, [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107]);
assert.equal(ring.reduce((a, b) => a + b, 0), 1136);
assert.equal(payload.length, 1136, 'use the exact preserved ASCII-armored bytes');

const width = 16;
const height = payload.length / width;
assert.equal(height, 71, 'the exact payload must form a 16×71 rectangle');
const order = ring
  .map((value, index) => ({ value, index }))
  .sort((a, b) => a.value - b.value || a.index - b.index)
  .map((entry) => entry.index);

function permuteRows(bytes, columnOrder) {
  const out = Buffer.alloc(bytes.length);
  for (let r = 0; r < height; r += 1) {
    for (let k = 0; k < width; k += 1) {
      out[r * width + k] = bytes[r * width + columnOrder[k]];
    }
  }
  return out;
}
const columnar = permuteRows(payload, order);
const inverseOrder = Array.from({ length: width }, (_, originalColumn) => order.indexOf(originalColumn));
const columnarRecovered = permuteRows(columnar, inverseOrder);
assert.deepEqual(columnarRecovered, payload, 'column permutation must be reversible');

function raggedColumnHeightForward(bytes, heights) {
  const columns = heights.map(() => []);
  let cursor = 0;
  for (let c = 0; c < heights.length; c += 1) {
    for (let r = 0; r < heights[c]; r += 1) columns[c][r] = bytes[cursor++];
  }
  assert.equal(cursor, bytes.length);
  const out = Buffer.alloc(bytes.length);
  cursor = 0;
  for (let r = 0; r < Math.max(...heights); r += 1) {
    for (let c = 0; c < heights.length; c += 1) {
      if (r < heights[c]) out[cursor++] = columns[c][r];
    }
  }
  assert.equal(cursor, bytes.length);
  return out;
}
function raggedColumnHeightInverse(bytes, heights) {
  const columns = heights.map(() => []);
  let cursor = 0;
  for (let r = 0; r < Math.max(...heights); r += 1) {
    for (let c = 0; c < heights.length; c += 1) {
      if (r < heights[c]) columns[c][r] = bytes[cursor++];
    }
  }
  assert.equal(cursor, bytes.length);
  return Buffer.concat(columns.map((column) => Buffer.from(column)));
}
const ragged = raggedColumnHeightForward(payload, ring);
const raggedRecovered = raggedColumnHeightInverse(ragged, ring);
assert.deepEqual(raggedRecovered, payload, 'ragged transposition must be reversible');

const markers = [
  'BEGIN PGP SIGNATURE',
  'END PGP SIGNATURE',
  'CICADA 3301',
  'LIBER PRIMUS',
  'BEWARE FALSE PATHS',
  'SEEK AND YOU WILL BE FOUND',
  '7A35090F',
  'ONION'
];
function inspect(bytes) {
  const text = bytes.toString('latin1');
  return {
    preview: text.slice(0, 160).replace(/\r/g, '\\r').replace(/\n/g, '\\n'),
    markerHits: markers.filter((marker) => text.toUpperCase().includes(marker)),
    longestAlphaRuns: (text.match(/[A-Za-z]{3,}/g) || [])
      .sort((a, b) => b.length - a.length)
      .slice(0, 8)
  };
}

console.log(JSON.stringify({
  inputBytes: payload.length,
  ringClockwise: ring,
  ringSum: ring.reduce((a, b) => a + b, 0),
  rectangularColumnar: {
    dimensions: [height, width],
    stableAscendingColumnOrderZeroBased: order,
    sortedKey: order.map((index) => ring[index]),
    roundTripExact: columnarRecovered.equals(payload),
    ...inspect(columnar)
  },
  raggedColumnHeights: {
    heightsClockwise: ring,
    rowCount: Math.max(...ring),
    roundTripExact: raggedRecovered.equals(payload),
    ...inspect(ragged)
  }
}, null, 2));
