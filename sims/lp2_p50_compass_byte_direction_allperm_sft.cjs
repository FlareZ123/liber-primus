'use strict';

/**
 * LP2 original 256 base60 byte field: 8-compass-direction, 8-bit adjacency
 * or 5-bit GP symbol plus 3-bit pointer, full unknown compass alphabet gate.
 * Original-source read-only SFT. Windows Node.js 22 CommonJS.
 *
 * Original printed field: resources/liber-primus/lp2-grid-256.json.
 * Source-facing motivation: 2016 signed words/numbers/direction message,
 * 32 printed rows × 8 cells, values 0..255 (eight bits).
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const grid = JSON.parse(readFileSync(join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const source = grid.bytes;
assert.equal(source.length, 256);
assert.deepStrictEqual(grid.pages.flatMap((p) => p.bytes), source);
assert.equal(createHash('sha256').update(Buffer.from(source)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const HEIGHT = 32;
const WIDTH = 8;
const OFFSETS = [[-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]];
const IDENTITY = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * @param {number[]} bytes
 * @returns {{border:number[][],pairs:number[][][],edges:number[]}}
 */
function compassCosts(bytes) {
  const border = Array.from({ length: 8 }, () => Array(8).fill(0));
  const pairs = Array.from({ length: 4 }, () =>
    Array.from({ length: 8 }, () => Array(8).fill(0)));
  const edges = [0, 0, 0, 0];
  for (let row = 0; row < HEIGHT; row += 1) {
    for (let col = 0; col < WIDTH; col += 1) {
      const first = bytes[row * WIDTH + col];
      for (let d = 0; d < 8; d += 1) {
        const r = row + OFFSETS[d][0];
        const c = col + OFFSETS[d][1];
        if (r < 0 || r >= HEIGHT || c < 0 || c >= WIDTH) {
          for (let bit = 0; bit < 8; bit += 1) border[d][bit] += (first >>> bit) & 1;
        } else if (d < 4) {
          edges[d] += 1;
          const second = bytes[r * WIDTH + c];
          for (let bit = 0; bit < 8; bit += 1) {
            for (let opposite = 0; opposite < 8; opposite += 1) {
              pairs[d][bit][opposite] +=
                ((first >>> bit) & 1) !== ((second >>> opposite) & 1) ? 1 : 0;
            }
          }
        }
      }
    }
  }
  return { border, pairs, edges };
}

/**
 * @param {{border:number[][],pairs:number[][][]}} cost
 * @param {number[]} bitsForDirection
 * @returns {{outside:number,nonreciprocal:number,total:number}}
 */
function adjacencyViolations(cost, bitsForDirection) {
  let outside = 0;
  let nonreciprocal = 0;
  for (let d = 0; d < 8; d += 1) outside += cost.border[d][bitsForDirection[d]];
  for (let d = 0; d < 4; d += 1) {
    nonreciprocal += cost.pairs[d][bitsForDirection[d]][bitsForDirection[d + 4]];
  }
  return { outside, nonreciprocal, total: outside + nonreciprocal };
}

/**
 * Calculates, in O(256), the maximal number of distinct cells visited before
 * an edge crosses the printed border or repeats a cell, starting ANYWHERE.
 * Functional graph distances count all nodes on the eventual directed cycle.
 * @param {number[]} bytes
 * @param {'low3'|'high3'} part
 * @param {boolean} toroidal
 * @param {number[]} directionForThreeBitCode
 * @returns {{length:number,start:number}}
 */
function longestArrowWalk(bytes, part, toroidal, directionForThreeBitCode) {
  const next = new Int16Array(256);
  const state = new Uint8Array(256);
  const distance = new Uint16Array(256);
  const position = new Int16Array(256);
  const stack = new Int16Array(256);
  for (let i = 0; i < 256; i += 1) {
    const digit = part === 'low3' ? bytes[i] & 7 : bytes[i] >>> 5;
    const direction = directionForThreeBitCode[digit];
    const row = (i >>> 3) + OFFSETS[direction][0];
    const col = (i & 7) + OFFSETS[direction][1];
    next[i] = !toroidal && (row < 0 || row >= HEIGHT || col < 0 || col >= WIDTH) ?
      -1 : (((row + HEIGHT) % HEIGHT) * WIDTH + (col + WIDTH) % WIDTH);
  }
  for (let start = 0; start < 256; start += 1) {
    if (state[start] !== 0) continue;
    let at = start;
    let size = 0;
    while (at !== -1 && state[at] === 0) {
      state[at] = 1;
      position[at] = size;
      stack[size] = at;
      size += 1;
      at = next[at];
    }
    if (at !== -1 && state[at] === 1) {
      const cycleStart = position[at];
      const cycleLength = size - cycleStart;
      for (let i = cycleStart; i < size; i += 1) {
        state[stack[i]] = 2;
        distance[stack[i]] = cycleLength;
      }
      size = cycleStart;
    }
    while (size > 0) {
      size -= 1;
      const node = stack[size];
      state[node] = 2;
      distance[node] = 1 + (next[node] === -1 ? 0 : distance[next[node]]);
    }
  }
  let length = 0;
  let start = -1;
  for (let i = 0; i < 256; i += 1) {
    if (distance[i] > length) {
      length = distance[i];
      start = i;
    }
  }
  return { length, start };
}

const costs = compassCosts(source);
assert.deepStrictEqual(costs.edges, [248, 217, 224, 217]);
const modes = [
  { part: 'low3', wrap: false, expected: 41 },
  { part: 'low3', wrap: true, expected: 49 },
  { part: 'high3', wrap: false, expected: 31 },
  { part: 'high3', wrap: true, expected: 49 },
];
let optimum = { total: Infinity, outside: 0, nonreciprocal: 0, permutation: null };
let borderMinimum = Infinity;
let enumerationCount = 0;
const bestArrow = modes.map((mode) => ({
  ...mode, best: 0, start: null, permutation: null,
}));
const permutation = Array(8).fill(0);

/**
 * @param {number} depth
 * @param {number} occupied
 */
function enumerate(depth, occupied) {
  if (depth === 8) {
    enumerationCount += 1;
    // Here permutation[direction] = assigned bit index. Its inverse is
    // permutation[threeBitSymbol] = assigned direction after relabeling:
    // Both traverse the complete symmetric group S8, so no assignment
    // is omitted by using this one array for both interpretations.
    const v = adjacencyViolations(costs, permutation);
    if (v.total < optimum.total) optimum = { ...v, permutation: permutation.slice() };
    if (v.outside < borderMinimum) borderMinimum = v.outside;
    for (const entry of bestArrow) {
      const s = longestArrowWalk(source, entry.part, entry.wrap, permutation);
      if (s.length > entry.best) {
        entry.best = s.length;
        entry.start = s.start;
        entry.permutation = permutation.slice();
      }
    }
    return;
  }
  for (let d = 0; d < 8; d += 1) {
    if ((occupied & (1 << d)) !== 0) continue;
    permutation[depth] = d;
    enumerate(depth + 1, occupied | (1 << d));
  }
}
enumerate(0, 0);
assert.equal(enumerationCount, 40320);
assert.equal(borderMinimum, 97);
assert.deepStrictEqual([optimum.total, optimum.outside, optimum.nonreciprocal],
  [509, 104, 405]);
assert.deepStrictEqual(bestArrow.map((entry) => entry.best), modes.map((entry) => entry.expected));

/** Positive control: two-way N/S and E/W lattice with zero boundary leakage. */
const plantedAdjacency = Array(256).fill(0);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const i = row * WIDTH + col;
    if (row > 0) plantedAdjacency[i] |= 1 << 0;
    if (col + 1 < WIDTH) plantedAdjacency[i] |= 1 << 2;
    if (row + 1 < HEIGHT) plantedAdjacency[i] |= 1 << 4;
    if (col > 0) plantedAdjacency[i] |= 1 << 6;
  }
}
assert.equal(adjacencyViolations(compassCosts(plantedAdjacency), IDENTITY).total, 0);

/** Positive control: one 256-cell Hamiltonian serpentine walk, GP29 5-bit payload. */
const plantedLow3 = Array(256).fill(0);
const plantedHigh3 = Array(256).fill(0);
for (let row = 0; row < HEIGHT; row += 1) {
  const forward = row % 2 === 0;
  for (let i = 0; i < WIDTH; i += 1) {
    const col = forward ? i : WIDTH - 1 - i;
    const at = row * WIDTH + col;
    let direction;
    if (i === WIDTH - 1) direction = row === HEIGHT - 1 ?
      (forward ? 6 : 2) : 4;
    else direction = forward ? 2 : 6;
    const rune = at % 29;
    plantedLow3[at] = (rune << 3) | direction;
    plantedHigh3[at] = (direction << 5) | rune;
  }
}
assert.equal(longestArrowWalk(plantedLow3, 'low3', false, IDENTITY).length, 256);
assert.equal(longestArrowWalk(plantedHigh3, 'high3', false, IDENTITY).length, 256);

console.log('SOURCE 256 cells, 32×8; eight compass neighbors = 906 unordered interior pairs');
console.log('SOURCE all 40,320 bit-to-compass permutations: best reciprocal+boundary violations ' +
  optimum.total + ' = ' + optimum.nonreciprocal + '/906 nonreciprocal interior edges + ' +
  optimum.outside + ' outward boundary flags; minimum boundary-alone ' + borderMinimum);
for (const e of bestArrow) {
  console.log('SOURCE 5+3 ' + e.part + ' compass direction, toroidal=' + e.wrap +
    ': best path ANY start ' + e.best + '/256 unique cells across all 40,320 maps');
}
console.log('CONTROL full 8-way lattice: 0 violations; planted 5+3 routes: 256/256');
console.log('PASS original-source all-map compass and 5+3 GP29/arrow gates');
