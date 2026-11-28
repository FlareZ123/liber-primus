#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'),
  'utf8',
));
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);

const a60 = grid.alphabet;
const a59 = a60.replace('f', '');
assert.equal(a60.length, 60);
assert.equal(a59.length, 59);

/** @param {string} token @param {string} alphabet @param {number} radix */
function value(token, alphabet, radix) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  if (hi < 0 || lo < 0) return null;
  return radix * hi + lo;
}

const d59 = tokens.map((t) => value(t, a59, 59));
const d60 = tokens.map((t) => value(t, a60, 60));
const sink = 189;

const fixed59 = d59
  .map((v, i) => (v === i ? i : null))
  .filter((x) => x !== null);
const fixed60 = d60
  .map((v, i) => (v === i ? i : null))
  .filter((x) => x !== null);
assert.deepEqual(fixed59, [sink]);
assert.deepEqual(fixed60, []);

/** @param {(number|null)[]} map @param {number} start */
function walk(map, start) {
  const out = [start];
  const seen = new Set();
  while (true) {
    const x = out.at(-1);
    if (x === sink) return { path: out, hitSink: true, cycle: false };
    assert.ok(Number.isInteger(x) && x >= 0 && x < 256);
    if (seen.has(x)) return { path: out, hitSink: false, cycle: true };
    seen.add(x);
    const next = map[x];
    assert.ok(Number.isInteger(next));
    out.push(next);
  }
}

for (let i = 0; i < 256; i++) {
  assert.equal(walk(d59, i).hitSink, true);
}

const boundaryHits = [];
for (let cell = 0; cell < 256; cell++) {
  const v59 = d59[cell];
  const v60 = d60[cell];
  if (v59 === null || v60 === null) continue;
  if (v59 - cell === 29 && v60 - cell === 30) {
    boundaryHits.push({ cell, token: tokens[cell], v59, v60 });
  }
}
assert.deepEqual(boundaryHits, [{
  cell: 43,
  token: '1D',
  v59: 72,
  v60: 73,
}]);

const direction = 'DIRECTION';
const seek = 'SEEK';
assert.equal(direction.length, 9);
assert.equal(seek.length, 4);

const selected = boundaryHits[0];
const coords59 = [Math.floor(selected.v59 / 8), selected.v59 % 8];
const coords60 = [Math.floor(selected.v60 / 8), selected.v60 % 8];
assert.deepEqual(coords59, [direction.length, 0]);
assert.deepEqual(coords60, [direction.length, 1]);

const seek59 = walk(d59, selected.v59);
assert.deepEqual(seek59.path, [72, 161, 214, 247, 189]);
assert.equal(seek59.path.length - 1, seek.length);

const seek60 = walk(d60, selected.v60);
assert.equal(seek60.hitSink, false);
assert.equal(seek60.cycle, true);
assert.deepEqual(seek60.path.slice(0, 18), [
  73, 79, 82, 201, 74, 205, 76, 114, 197,
  115, 247, 192, 0, 203, 68, 199, 47, 76,
]);

assert.deepEqual([Math.floor(sink / 8), sink % 8], [23, 5]);
assert.deepEqual([Math.floor(sink / 29), sink % 29], [6, 15]);

console.log(JSON.stringify({
  status: 'PASS',
  selectedCell: selected,
  sourceWords: {
    boundaryIndices: [29, 30],
    words: [direction, seek],
    lengths: [direction.length, seek.length],
  },
  candidateDestinations: {
    base59: { address: selected.v59, coords: coords59, walk: seek59.path },
    base60: {
      address: selected.v60,
      coords: coords60,
      hitSink: seek60.hitSink,
      cycle: seek60.cycle,
      pathPrefix: seek60.path.slice(0, 18),
    },
  },
  fixedPoints: { base59: fixed59, base60: fixed60 },
  sinkPacking: {
    rowMajor8: [Math.floor(sink / 8), sink % 8],
    base29: [Math.floor(sink / 29), sink % 29],
  },
  decision:
    'DIRECTION/SEEK selects base59 locally at cell43: both radix destinations lie on DIRECTION row9, but only base59 reaches the unique sink in exactly SEEK=4 edges.',
}, null, 2));
