/**
 * Historical GIMP Dissolve 4096-row MT stream versus the original 256-byte grid.
 * Run under Node.js 18+ from the repository root.
 * This checks only contiguous plaintext bytes, not a general cipher.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} seed @returns {() => number} */
function mt19937(seed) {
  const state = new Uint32Array(624);
  state[0] = seed >>> 0;
  for (let i = 1; i < state.length; i++) {
    state[i] = (Math.imul(1812433253, state[i - 1] ^ (state[i - 1] >>> 30)) + i) >>> 0;
  }
  let pointer = state.length;
  return () => {
    if (pointer === state.length) {
      for (let j = 0; j < state.length; j++) {
        const y = (state[j] & 0x80000000) | (state[(j + 1) % 624] & 0x7fffffff);
        state[j] = (state[(j + 397) % 624] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      pointer = 0;
    }
    let y = state[pointer++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };
}

const PROJECTIONS = ['low-byte', 'high-byte', 'range255', 'LE32', 'BE32'];

/** @param {number[]} words @param {number} projection @returns {number[]} */
function bytesFor(words, projection) {
  if (projection === 0) return words.map(n => n & 255);
  if (projection === 1) return words.map(n => n >>> 24);
  if (projection === 2) return words.map(n => n % 255);
  return words.flatMap(n => projection === 3
    ? [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, n >>> 24]
    : [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}

/**
 * @param {number[]} grid
 * @param {number[]} seeds
 * @param {number} wordsPerRow
 * @returns {{row:number, offset:number, projection:number, gridOffset:number, matched:number}[]}
 */
function scan(grid, seeds, wordsPerRow) {
  const four = new Map();
  for (let g = 0; g <= grid.length - 4; g++) {
    const word = (grid[g] | (grid[g + 1] << 8) | (grid[g + 2] << 16) | (grid[g + 3] << 24)) >>> 0;
    const offsets = four.get(word) || [];
    offsets.push(g);
    four.set(word, offsets);
  }
  const candidates = [];
  for (let row = 0; row < seeds.length; row++) {
    const next = mt19937(seeds[row]);
    const windows = new Uint32Array(5);
    for (let i = 0; i < wordsPerRow; i++) {
      const x = next();
      const values = [x & 255, x >>> 24, x % 255];
      for (let p = 0; p < 3; p++) {
        const word = windows[p] = ((windows[p] >>> 8) | (values[p] << 24)) >>> 0;
        if (i >= 3) for (const g of four.get(word) || []) {
          candidates.push({ row, projection: p, offset: i - 3, gridOffset: g });
        }
      }
      for (let k = 0; k < 4; k++) {
        const valuesLEBE = [(x >>> (k * 8)) & 255, (x >>> ((3 - k) * 8)) & 255];
        for (let p = 3; p <= 4; p++) {
          const word = windows[p] = ((windows[p] >>> 8) | (valuesLEBE[p - 3] << 24)) >>> 0;
          if (i * 4 + k >= 3) for (const g of four.get(word) || []) {
            candidates.push({ row, projection: p, offset: i * 4 + k - 3, gridOffset: g });
          }
        }
      }
    }
  }
  return candidates.map(({ row, projection, offset, gridOffset }) => {
    const next = mt19937(seeds[row]);
    const words = Array.from({ length: wordsPerRow }, () => next());
    const stream = bytesFor(words, projection);
    let before = 0, after = 4;
    while (gridOffset > before && offset > before &&
      grid[gridOffset - before - 1] === stream[offset - before - 1]) before++;
    while (gridOffset + after < grid.length && offset + after < stream.length &&
      grid[gridOffset + after] === stream[offset + after]) after++;
    return { row, projection, offset, gridOffset, matched: before + after };
  }).sort((a, b) => a.row - b.row || a.projection - b.projection || a.offset - b.offset);
}

const source = JSON.parse(fs.readFileSync(path.join('resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const grid = source.byte_rows.flat();
assert.equal(grid.length, 256);
assert.deepEqual([grid[45], grid[50], grid[246]], [107, 47, 198]);

const master = mt19937(314159265);
const rowSeeds = Array.from({ length: 4096 }, () => master());
assert.deepEqual(rowSeeds.slice(0, 8), [
  3721122731, 618219707, 807213306, 3144837749,
  3447982176, 3230631767, 755972506, 1398685501
]);
const row0 = mt19937(rowSeeds[0]);
assert.deepEqual(Array.from({ length: 8 }, () => row0()), [
  505524582, 4277517655, 1702989131, 912900261,
  1432505218, 4108960502, 2270003630, 316039421
]);

const wordsPerRow = 4096;
const matches = scan(grid, rowSeeds, wordsPerRow);
assert.equal(matches.length, 16);
assert.equal(matches.filter(m => m.matched >= 5).length, 0);
assert.deepEqual(PROJECTIONS.map((_, p) => matches.filter(m => m.projection === p).length),
  [2, 0, 1, 5, 8]);

// Blind positive control: plant an eight-byte sequence from row 300 at offset 115.
const plantRow = 300, plantProjection = 3, plantStart = 115;
const plantSource = mt19937(rowSeeds[plantRow]);
const plantStream = bytesFor(Array.from({ length: wordsPerRow }, () => plantSource()), plantProjection);
const plantGrid = grid.slice();
plantGrid.splice(12, 8, ...plantStream.slice(plantStart, plantStart + 8));
const plantMatches = scan(plantGrid, [rowSeeds[plantRow]], wordsPerRow);
assert(plantMatches.some(m => m.row === 0 && m.projection === plantProjection &&
  m.gridOffset === 12 && m.offset === plantStart && m.matched >= 8));

console.log(JSON.stringify({
  source: 'LP2 pp49-51 original 256-byte table', seed: 314159265,
  rowSeeds: rowSeeds.length, wordsPerRow, projections: PROJECTIONS,
  matchingFourByteWindows: matches, longestMatch: 4, fullFiveByteMatches: 0,
  plantedEightByteMatch: true
}, null, 2));
