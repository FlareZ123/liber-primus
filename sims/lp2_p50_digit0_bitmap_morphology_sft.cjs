'use strict';

/**
 * Director #1513: literal-leading-zero p50 bitmap morphology.
 * Windows Node.js 22, CommonJS, standard library only.
 *
 * Frozen object: 32 printed rows x 8 columns, one iff the token's first
 * character is the literal digit 0. No numeric conversion, shift, threshold,
 * OCR tuning, reordering, or added table value is used.
 */

const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map((page) => page.tokens.length), [80, 104, 72]);

const mask = Uint8Array.from(tokens, (token) => Number(token[0] === '0'));
assert.equal(Array.from(mask).reduce((sum, value) => sum + value, 0), 60);

const HEIGHT = 32;
const WIDTH = 8;

/**
 * @param {Uint8Array} bits
 * @param {boolean} diagonal
 * @returns {{count:number, largest:number}}
 */
function components(bits, diagonal = false) {
  const seen = new Uint8Array(256);
  const directions = diagonal
    ? [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
    : [[-1,0],[1,0],[0,-1],[0,1]];
  let count = 0;
  let largest = 0;

  for (let start = 0; start < 256; start++) {
    if (!bits[start] || seen[start]) continue;
    count++;
    const queue = [start];
    let cursor = 0;
    let size = 0;
    seen[start] = 1;

    while (cursor < queue.length) {
      const current = queue[cursor++];
      const row = Math.floor(current / WIDTH);
      const column = current % WIDTH;
      size++;

      for (const [dr, dc] of directions) {
        const nextRow = row + dr;
        const nextColumn = column + dc;
        if (nextRow < 0 || nextRow >= HEIGHT || nextColumn < 0 || nextColumn >= WIDTH) continue;
        const next = nextRow * WIDTH + nextColumn;
        if (bits[next] && !seen[next]) {
          seen[next] = 1;
          queue.push(next);
        }
      }
    }
    largest = Math.max(largest, size);
  }
  return {count, largest};
}

/**
 * @param {Uint8Array} bits
 */
function morphology(bits) {
  const rowSums = Array(HEIGHT).fill(0);
  const columnSums = Array(WIDTH).fill(0);
  const rowPatterns = new Map();

  for (let row = 0; row < HEIGHT; row++) {
    let pattern = '';
    for (let column = 0; column < WIDTH; column++) {
      const value = bits[row * WIDTH + column];
      rowSums[row] += value;
      columnSums[column] += value;
      pattern += String(value);
    }
    rowPatterns.set(pattern, (rowPatterns.get(pattern) || 0) + 1);
  }

  let duplicateRowPairs = 0;
  for (const count of rowPatterns.values()) duplicateRowPairs += count * (count - 1) / 2;

  const four = components(bits, false);
  const eight = components(bits, true);
  const blockCounts = Array.from(
    {length: 4},
    (_, block) => rowSums.slice(block * 8, block * 8 + 8).reduce((sum, value) => sum + value, 0)
  );

  return {
    components4: four.count,
    largest4: four.largest,
    components8: eight.count,
    largest8: eight.largest,
    emptyRows: rowSums.filter((value) => value === 0).length,
    duplicateRowPairs,
    rowSS: rowSums.reduce((sum, value) => sum + (value - 1.875) ** 2, 0),
    columnSS: columnSums.reduce((sum, value) => sum + (value - 7.5) ** 2, 0),
    blockSS: blockCounts.reduce((sum, value) => sum + (value - 15) ** 2, 0),
    rowSums,
    columnSums,
    blockCounts
  };
}

/**
 * @param {Uint8Array} bits
 * @param {number} block
 * @returns {number[][]}
 */
function block8(bits, block) {
  return Array.from(
    {length: 8},
    (_, row) => Array.from({length: 8}, (_, column) => bits[(block * 8 + row) * 8 + column])
  );
}

/** @param {number[][]} matrix */
function rotateSquare(matrix) {
  return Array.from({length: 8}, (_, row) =>
    Array.from({length: 8}, (_, column) => matrix[7 - column][row])
  );
}

/** @param {number[][]} matrix */
function flipSquare(matrix) {
  return matrix.map((row) => row.slice().reverse());
}

/** @param {number[][]} matrix */
function d4(matrix) {
  const out = [];
  let current = matrix;
  for (let turn = 0; turn < 4; turn++) {
    out.push(current);
    out.push(flipSquare(current));
    current = rotateSquare(current);
  }
  return out;
}

/** @param {number[][]} a @param {number[][]} b */
function hamming(a, b) {
  let distance = 0;
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) distance += Number(a[row][column] !== b[row][column]);
  }
  return distance;
}

/**
 * Fixed repeated-motif diagnostic for the four natural 8x8 blocks.
 * @param {Uint8Array} bits
 */
function motif(bits) {
  const blocks = Array.from({length: 4}, (_, block) => block8(bits, block));
  const pairs = [];
  let minimum = 64;
  let sum = 0;

  for (let first = 0; first < 4; first++) {
    for (let second = first + 1; second < 4; second++) {
      let best = 64;
      for (const transformed of d4(blocks[second])) {
        best = Math.min(best, hamming(blocks[first], transformed));
      }
      pairs.push([first, second, best]);
      minimum = Math.min(minimum, best);
      sum += best;
    }
  }
  return {minimum, sum, pairs};
}

/**
 * @param {number} seed
 */
function makeSampler(seed) {
  let state = seed >>> 0;

  function u32() {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17; state >>>= 0;
    state ^= state << 5; state >>>= 0;
    return state >>> 0;
  }

  function below(bound) {
    const limit = Math.floor(0x100000000 / bound) * bound;
    let value;
    do value = u32(); while (value >= limit);
    return value % bound;
  }

  return function sample60() {
    const pool = Array.from({length: 256}, (_, index) => index);
    const bits = new Uint8Array(256);
    for (let index = 0; index < 60; index++) {
      const swap = index + below(256 - index);
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
      bits[pool[index]] = 1;
    }
    return bits;
  };
}

/** @param {Uint8Array} bits */
function render(bits) {
  return Array.from(
    {length: HEIGHT},
    (_, row) => Array.from({length: WIDTH}, (_, column) => bits[row * WIDTH + column] ? '#' : '.').join('')
  ).join('\n');
}

const observed = morphology(mask);
const observedMotif = motif(mask);
assert.deepEqual(observed, {
  components4: 33,
  largest4: 9,
  components8: 23,
  largest8: 15,
  emptyRows: 3,
  duplicateRowPairs: 16,
  rowSS: 39.5,
  columnSS: 46,
  blockSS: 18,
  rowSums: [0,1,3,1,3,1,3,1,1,1,2,3,2,3,2,4,0,3,0,3,1,2,1,3,2,1,2,4,2,1,3,1],
  columnSums: [4,4,9,10,8,11,7,7],
  blockCounts: [13,18,13,16]
});
assert.deepEqual(observedMotif, {
  minimum: 17,
  sum: 108,
  pairs: [[0,1,17],[0,2,18],[0,3,19],[1,2,19],[1,3,18],[2,3,17]]
});

const trials = 50000;
const sampleMorphology = makeSampler(0x3301c1ca);
const tails = {
  components4AtMost: 0,
  largest4AtLeast: 0,
  components8AtMost: 0,
  largest8AtLeast: 0,
  emptyRowsAtMost: 0,
  emptyRowsAtLeast: 0,
  duplicateRowPairsAtLeast: 0,
  rowSSAtLeast: 0,
  columnSSAtLeast: 0,
  blockSSAtMost: 0,
  blockSSAtLeast: 0
};

for (let trial = 0; trial < trials; trial++) {
  const current = morphology(sampleMorphology());
  tails.components4AtMost += Number(current.components4 <= observed.components4);
  tails.largest4AtLeast += Number(current.largest4 >= observed.largest4);
  tails.components8AtMost += Number(current.components8 <= observed.components8);
  tails.largest8AtLeast += Number(current.largest8 >= observed.largest8);
  tails.emptyRowsAtMost += Number(current.emptyRows <= observed.emptyRows);
  tails.emptyRowsAtLeast += Number(current.emptyRows >= observed.emptyRows);
  tails.duplicateRowPairsAtLeast += Number(current.duplicateRowPairs >= observed.duplicateRowPairs);
  tails.rowSSAtLeast += Number(current.rowSS >= observed.rowSS);
  tails.columnSSAtLeast += Number(current.columnSS >= observed.columnSS);
  tails.blockSSAtMost += Number(current.blockSS <= observed.blockSS);
  tails.blockSSAtLeast += Number(current.blockSS >= observed.blockSS);
}

assert.deepEqual(tails, {
  components4AtMost: 16937,
  largest4AtLeast: 7613,
  components8AtMost: 37393,
  largest8AtLeast: 10703,
  emptyRowsAtMost: 23890,
  emptyRowsAtLeast: 38805,
  duplicateRowPairsAtLeast: 12382,
  rowSSAtLeast: 35226,
  columnSSAtLeast: 17561,
  blockSSAtMost: 17845,
  blockSSAtLeast: 34877
});

const sampleMotif = makeSampler(0x1513cafe);
let motifMinimumAtMost = 0;
let motifSumAtMost = 0;
for (let trial = 0; trial < trials; trial++) {
  const current = motif(sampleMotif());
  motifMinimumAtMost += Number(current.minimum <= observedMotif.minimum);
  motifSumAtMost += Number(current.sum <= observedMotif.sum);
}
assert.equal(motifMinimumAtMost, 43931);
assert.equal(motifSumAtMost, 7053);

console.log(JSON.stringify({
  pageRowSplit: [10,13,9],
  pageMarkedCounts: [15,26,19],
  observed,
  observedMotif,
  exact60RandomMasks: {
    trials,
    seeds: ['0x3301c1ca','0x1513cafe'],
    tails,
    motifMinimumAtMost,
    motifSumAtMost
  },
  printedMask: render(mask)
}, null, 2));
