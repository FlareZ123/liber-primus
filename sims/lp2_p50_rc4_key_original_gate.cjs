#!/usr/bin/env node
'use strict';

// Bounded test: the original p50 base60 table as an ordinary RC4 key.
// Run from the repository root: node sims/lp2_p50_rc4_key_original_gate.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const fullKey = grid.byte_rows.flat();
assert.equal(fullKey.length, 256);
assert.ok(fullKey.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

const unknownPages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
const unknown = unknownPages.flatMap(p => p.indices);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(unknown.length, 12956);
assert.equal(p55.length, 76);

// Source-visible NW-starting clockwise perimeter of the 32x8 table.
const rows = grid.byte_rows;
const outerRing = [];
for (let col = 0; col < 8; col++) outerRing.push(rows[0][col]);
for (let row = 1; row < 32; row++) outerRing.push(rows[row][7]);
for (let col = 6; col >= 0; col--) outerRing.push(rows[31][col]);
for (let row = 30; row >= 1; row--) outerRing.push(rows[row][0]);
assert.equal(outerRing.length, 76);

function rc4(key, length) {
  assert.ok(key.length >= 1 && key.length <= 256);
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const out = Buffer.alloc(length);
  let i = 0;
  j = 0;
  for (let n = 0; n < length; n++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    [S[i], S[j]] = [S[j], S[i]];
    out[n] = S[(S[i] + S[j]) & 255];
  }
  return out;
}

function ioc(values) {
  const freq = Array(29).fill(0);
  for (const value of values) freq[value]++;
  const n = values.length;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function decode(cipher, stream, sign) {
  assert.equal(cipher.length, stream.length);
  return cipher.map((value, i) => (value + sign * (stream[i] % 29) + 29) % 29);
}

function result(name, key, targetName, target, order, sign) {
  const stream = rc4(key, target.length);
  const decoded = decode(target, stream, sign);
  return {
    candidate: name,
    key_order: order,
    target: targetName,
    sign: sign < 0 ? 'subtract' : 'add',
    length: decoded.length,
    ioc: ioc(decoded),
    first24: decoded.slice(0, 24)
  };
}

// RFC 6229 / classic RC4 known-answer check: RC4("Key") begins EB9F7781B734CA72A7.
assert.equal(rc4(Buffer.from('Key', 'ascii'), 9).toString('hex'), 'eb9f7781b734ca72a7');

// Positive control: same modulo-29 stream operation must invert a planted GP29 text exactly.
const plant = p57.slice(0, 76);
const plantStream = rc4(fullKey, plant.length);
const plantedCipher = plant.map((v, i) => (v + plantStream[i] % 29) % 29);
assert.deepEqual(decode(plantedCipher, plantStream, -1), plant);

const outputs = [];
for (const [order, key] of [['row-major', fullKey], ['reversed', fullKey.slice().reverse()]]) {
  const globalStream = rc4(key, unknown.length);
  for (const sign of [-1, 1]) {
    outputs.push({
      candidate: 'full-256-byte-table-key',
      key_order: order,
      target: 'continuous p0-p55',
      sign: sign < 0 ? 'subtract' : 'add',
      length: unknown.length,
      ioc: ioc(decode(unknown, globalStream, sign))
    });
  }
  for (const sign of [-1, 1]) {
    outputs.push(result('full-256-byte-table-key', key, 'p55-only, stream reset at p55', p55, order, sign));
  }
}
for (const [order, key] of [['NW-clockwise-outer-ring', outerRing], ['reversed-outer-ring', outerRing.slice().reverse()]]) {
  for (const sign of [-1, 1]) {
    outputs.push(result('76-byte-outer-ring-key', key, 'p55-only, stream starts at ring origin', p55, order, sign));
  }
}

console.log(JSON.stringify({
  source: 'resources/liber-primus/base60-grid.json + resources/liber-primus/lp2-corpus.json',
  base60_interpretation: 'conditional derived byte mapping; not an author-authenticated radix',
  unknown_runes: unknown.length,
  p55_runes: p55.length,
  p57_clear_runes: p57.length,
  full_key_bytes: fullKey.length,
  outer_ring_bytes: outerRing.length,
  raw_unknown_ioc: ioc(unknown),
  raw_p55_ioc: ioc(p55),
  clear_p57_ioc: ioc(p57),
  rc4_known_answer: 'passed',
  planted_round_trip: '76/76 passed',
  outputs
}, null, 2));
