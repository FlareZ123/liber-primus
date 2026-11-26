#!/usr/bin/env node
'use strict';

// Source-selected p50 horizontal reflection composed with the p50 successor map.
// Inputs: resources/liber-primus/lp2-grid-256.json (original 32x8 base60 bytes).
// R(i)=8r+(7-c) is fixed by the mirrored p50 tree artwork.
// T(i)=byte[i] is the already investigated forward successor map.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const bytes = grid.bytes;
assert.equal(bytes.length, 256, 'p49-p51 table must contain 256 cells');
assert(bytes.every(x => Number.isInteger(x) && x >= 0 && x < 256), 'table entries must be byte values');

const R = i => 8 * Math.floor(i / 8) + (7 - (i % 8));
for (let i = 0; i < 256; i++) assert.equal(R(R(i)), i, 'horizontal reflection must be an involution');

const T = i => bytes[i];
const maps = {
  raw: i => T(i),
  input_reflected: i => T(R(i)),       // T o R: read the reflected cell
  output_reflected: i => R(T(i)),      // R o T: reflect the destination address
  conjugate: i => R(T(R(i))),          // R o T o R: change both coordinate frames
};

function cyclesOf(next) {
  const globallySeen = new Set();
  const cycles = [];
  for (let start = 0; start < 256; start++) {
    if (globallySeen.has(start)) continue;
    const local = new Map();
    const path = [];
    let x = start;
    while (!local.has(x) && !globallySeen.has(x)) {
      local.set(x, path.length);
      path.push(x);
      x = next(x);
    }
    if (local.has(x)) cycles.push(path.slice(local.get(x)));
    for (const v of path) globallySeen.add(v);
  }
  return cycles.sort((a, b) => b.length - a.length || a[0] - b[0]);
}

const results = {};
for (const [name, next] of Object.entries(maps)) {
  const cycles = cyclesOf(next);
  results[name] = { cycle_lengths: cycles.map(c => c.length), cycles };
}

assert.deepEqual(results.raw.cycle_lengths, [11, 2]);
assert.deepEqual(results.input_reflected.cycle_lengths, [10, 7, 6, 2, 2]);
assert.deepEqual(results.output_reflected.cycle_lengths, [10, 7, 6, 2, 2]);
assert.deepEqual(results.conjugate.cycle_lengths, [11, 2]);

console.log(JSON.stringify({
  table_cells: bytes.length,
  reflection: 'R(i)=8*floor(i/8)+(7-(i mod 8))',
  maps: results,
}, null, 2));
