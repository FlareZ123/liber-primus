#!/usr/bin/env node
'use strict';

// Frozen 2014-compass / LP2-red225 selector test.
// No grid rotations, direction rotations, block phases, or key fitting.
// The sole null cycles the original 225-rune stream origin while preserving order.

const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const readJSON = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const annotations = readJSON('resources/liber-primus/lp2-ink-annotations.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const red = [];

for (const page of [...annotations.pages].sort((a, b) => a.page - b.page)) {
  for (const span of [...(page.red_spans || [])].sort((a, b) => a.start - b.start)) {
    const runes = [...span.runes];
    for (let k = 0; k < runes.length; k++) {
      const index = runeToIndex.get(runes[k]);
      if (index === undefined) throw new Error('red rune absent from canonical alphabet');
      red.push({ page: page.page, offset: span.start + k, rune: runes[k], index });
    }
  }
}
if (red.length !== 225) throw new Error('expected exactly 225 red runes');

const square = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result = result / p * (p - 1);
    }
  }
  if (x > 1) result = result / x * (x - 1);
  return result;
}

// Compass convention: 0=N, then NE,E,SE,S,SW,W,NW clockwise.
const directionNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const directions = square.flat().map(n => Math.round(((n % 360) / 45)) % 8);
const expectedDirections = [6, 3, 0, 3, 3, 0, 4, 3, 7, 0, 5, 5, 2, 5, 5, 0, 7, 3, 4, 0, 3, 3, 0, 3, 6];
if (directions.some((x, i) => x !== expectedDirections[i])) throw new Error('compass direction matrix changed');

const targets = square.flat().map(n => phi(n) % 29);
const perimeter = [
  [0, 1], // N
  [0, 2], // NE
  [1, 2], // E
  [2, 2], // SE
  [2, 1], // S
  [2, 0], // SW
  [1, 0], // W
  [0, 0]  // NW
];

function select(stream) {
  const grid = Array.from({ length: 15 }, (_, r) => stream.slice(15 * r, 15 * r + 15));
  const selected = [];
  for (let br = 0; br < 5; br++) {
    for (let bc = 0; bc < 5; bc++) {
      const cell = br * 5 + bc;
      const direction = directions[cell];
      const [dr, dc] = perimeter[direction];
      const row = br * 3 + dr;
      const col = bc * 3 + dc;
      const redIndex = row * 15 + col;
      const source = grid[row][col];
      const targetIndex = targets[cell];
      selected.push({
        cell: cell + 1,
        block: [br, bc],
        direction,
        directionName: directionNames[direction],
        grid: [row, col],
        redStreamIndex: redIndex,
        sourcePage: source.page,
        sourceOffset: source.offset,
        runeIndex: source.index,
        gp: corpus.translit[source.index],
        targetIndex,
        targetGP: corpus.translit[targetIndex],
        match: source.index === targetIndex
      });
    }
  }
  return selected;
}

const sourceSelection = select(red);
const matchCount = sourceSelection.filter(x => x.match).length;
const nullCounts = [];
for (let shift = 0; shift < 225; shift++) {
  const shifted = Array.from({ length: 225 }, (_, i) => red[(i + shift) % 225]);
  nullCounts.push({ shift, matches: select(shifted).filter(x => x.match).length });
}
const distribution = Array.from({ length: 26 }, (_, matches) => ({
  matches,
  shifts: nullCounts.filter(x => x.matches === matches).length
})).filter(x => x.shifts > 0);
const greater = nullCounts.filter(x => x.matches > matchCount).length;
const equal = nullCounts.filter(x => x.matches === matchCount).length;
const greaterOrEqual = nullCounts.filter(x => x.matches >= matchCount).length;

console.log(JSON.stringify({
  source: {
    redRunes: red.length,
    grid: '15x15 row-major',
    blocks: '25 consecutive 3x3 blocks, row-major',
    compassConvention: directionNames,
    directionMatrix: Array.from({ length: 5 }, (_, r) => directions.slice(5 * r, 5 * r + 5)),
    phiTargetMatrix: Array.from({ length: 5 }, (_, r) => targets.slice(5 * r, 5 * r + 5))
  },
  selectedSequence: sourceSelection.map(x => x.gp).join(' '),
  selected: sourceSelection,
  matchCount,
  matchCells: sourceSelection.filter(x => x.match).map(x => x.cell),
  orderPreservingCyclicNull: {
    shifts: 225,
    distribution,
    greater,
    equal,
    greaterOrEqual,
    empiricalP: greaterOrEqual / 225,
    rankFromBottom: greater + 1
  },
  randomMatchExpectation: 25 / 29
}, null, 2));
