'use strict';
/**
 * Single-file original-source capacity bound for the p50 GP29/keypad graph.
 *
 * Source-selected facts: 32x8 base60 grid decodes to 256 bytes; GP has 29
 * rune indices. Hypothesis, NOT authenticated by Cicada: quotient 0..8 is
 * the conventional keypad direction (1..9); remainder is a rune label.
 *
 * Exhaust all 256 starting cells. The mandatory natural walk has no
 * plaintext/ciphertext feedback and no external re-seeding. Show how many
 * distinct grid cells it can visit before exiting or repeating.
 *
 * No writes, network, plaintext recovery or password scanning.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));

const bytes = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
assert.equal(bytes.length, 256);
assert.equal(corpus.translit.length, 29);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Bottom-to-top numeric keypad: 1=down-left, 5=stay, 9=up-right.
const directions = [
  [1, -1], [1, 0], [1, 1],
  [0, -1], [0, 0], [0, 1],
  [-1, -1], [-1, 0], [-1, 1],
];

/**
 * @param {number[]} data - Exactly 256 byte values, in original row order.
 * @param {number} start - One-based cell in [1,256].
 * @returns {{start:number, path:number[], cycle:number[], exit:boolean}}
 */
function walk(data, start) {
  assert.equal(data.length, 256);
  assert.ok(Number.isInteger(start) && start >= 1 && start <= 256);
  const seen = new Map();
  const pathCells = [];
  let cursor = start;
  while (cursor > 0 && !seen.has(cursor)) {
    seen.set(cursor, pathCells.length);
    pathCells.push(cursor);
    const byte = data[cursor - 1];
    assert.ok(Number.isInteger(byte) && byte >= 0 && byte <= 255);
    const quotient = Math.floor(byte / 29);
    const [down, right] = directions[quotient];
    const y = Math.floor((cursor - 1) / 8) + down;
    const x = (cursor - 1) % 8 + right;
    cursor = y >= 0 && y < 32 && x >= 0 && x < 8
      ? 1 + 8 * y + x : 0;
  }
  return {
    start,
    path: pathCells,
    cycle: cursor > 0 ? pathCells.slice(seen.get(cursor)) : [],
    exit: cursor === 0,
  };
}

const all = Array.from({length: 256}, (_, i) => walk(bytes, i + 1));
const histogram = {};
const distinctCycles = new Map();
for (const route of all) {
  const size = route.path.length;
  histogram[size] = (histogram[size] || 0) + 1;
  if (route.cycle.length) {
    const key = route.cycle.slice().sort((a, b) => a - b).join(',');
    distinctCycles.set(key, route.cycle.length);
  }
}
assert.deepEqual(histogram, {1:57, 2:74, 3:62, 4:33, 5:21, 6:7, 7:2});
assert.deepEqual(all.filter((x) => x.path.length === 7).map((x) => x.start),
  [14, 102]);
assert.equal(all.filter((x) => x.exit).length, 60);
assert.equal(distinctCycles.size, 49);
const counts = [1, 2, 3].map((length) =>
  Array.from(distinctCycles.values()).filter((value) => value === length).length);
assert.deepEqual(counts, [29, 19, 1]);
const soleThree = Array.from(distinctCycles).find((item) => item[1] === 3)[0];
assert.equal(soleThree, '119,127,128');
assert.equal([119,127,128].map((i) =>
  corpus.translit[bytes[i - 1] % 29]).join(''), 'GEM');
assert.deepEqual(walk(bytes, 120).path, [120, 111, 119, 127, 128]);

// Positive fixture: a user-written keypad graph can indeed have a long walk.
// In a 10x8 snake, all 80 cells are visited before a self-loop.
const snake = Array(256).fill(4 * 29);
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 8; x++) {
    const i = 8 * y + x;
    const last = y === 9 && x === 0;
    const quotient = last ? 4
      : y % 2 === 0 ? (x === 7 ? 1 : 5)
        : (x === 0 ? 1 : 3);
    snake[i] = quotient * 29;
  }
}
const plant = walk(snake, 1);
assert.equal(plant.path.length, 80);
assert.equal(plant.cycle.length, 1);
assert.equal(plant.exit, false);
assert.deepEqual(plant.path.slice(0, 8), [1,2,3,4,5,6,7,8]);

console.log(JSON.stringify({
  reading: 'original p50 byte / 29 quotient as keypad direction; modulo29 as rune',
  nativeGridSha256: '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
  startsExhausted: all.length,
  originalLongestDistinctCells: 7,
  originalLongestStarts: [14,102],
  sourcePath120: walk(bytes,120).path,
  exits: 60,
  distinctCycles: {length1:counts[0],length2:counts[1],length3:counts[2]},
  uniqueThreeCycle: '119->127->128->119 spells GEM',
  syntheticEightyCellPositive: plant.path.length,
  decision: 'Any source-independent, per-cell readout is terminal or ultimately period <= 3 after <= 7 unique cells; cannot directly supply a 76-symbol aperiodic p55 key or 12956-symbol book pad without a separate re-seeding or ciphertext-feedback rule.',
  limitation: 'This bound is conditional on the hypothetical keypad operator. It does not exclude source-authored dynamic state, word re-seeding, or graph use as a short instruction.',
}, null, 2));
