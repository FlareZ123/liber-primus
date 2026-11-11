#!/usr/bin/env node
'use strict';

// Frozen 2014 5x5 bearing selector over 25 consecutive 3x3 red-rune blocks.
// Each of the 225 original red runes is used exactly once in source order.
// No block phase, stream rotation, grid rotation, or direction fitting is used.

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
const targets = square.flat().map(n => phi(n) % 29);
const directions = square.flat().map(n => Math.round(((n % 360) / 45)) % 8);
const expectedDirections = [6, 3, 0, 3, 3, 0, 4, 3, 7, 0, 5, 5, 2, 5, 5, 0, 7, 3, 4, 0, 3, 3, 0, 3, 6];
if (directions.some((x, i) => x !== expectedDirections[i])) throw new Error('direction indices changed');

// Position in a row-major 3x3 block for each of the eight directions.
// Math: 0° east, counter-clockwise. Compass: 0° north, clockwise.
const perimeterMath = [5, 2, 1, 0, 3, 6, 7, 8];       // E,NE,N,NW,W,SW,S,SE
const perimeterCompass = [1, 2, 5, 8, 7, 6, 3, 0];   // N,NE,E,SE,S,SW,W,NW

function select(stream, perimeter) {
  return Array.from({ length: 25 }, (_, cell) => {
    const block = stream.slice(cell * 9, cell * 9 + 9);
    const position = perimeter[directions[cell]];
    const source = block[position];
    const targetIndex = targets[cell];
    return {
      cell: cell + 1,
      directionIndex: directions[cell],
      blockPosition: position,
      redStreamIndex: cell * 9 + position,
      sourcePage: source.page,
      sourceOffset: source.offset,
      runeIndex: source.index,
      gp: corpus.translit[source.index],
      targetIndex,
      targetGP: corpus.translit[targetIndex],
      match: source.index === targetIndex
    };
  });
}

function phaseNull(perimeter, authenticMatches) {
  const counts = [];
  for (let shift = 0; shift < 225; shift++) {
    const shifted = Array.from({ length: 225 }, (_, i) => red[(i + shift) % 225]);
    counts.push(select(shifted, perimeter).filter(x => x.match).length);
  }
  const distribution = Array.from({ length: 26 }, (_, matches) => ({
    matches,
    shifts: counts.filter(x => x === matches).length
  })).filter(x => x.shifts > 0);
  const greater = counts.filter(x => x > authenticMatches).length;
  const equal = counts.filter(x => x === authenticMatches).length;
  return {
    shifts: 225,
    distribution,
    greater,
    equal,
    greaterOrEqual: greater + equal,
    empiricalP: (greater + equal) / 225,
    rankFromBottom: greater + 1
  };
}

const mathSelection = select(red, perimeterMath);
const compassSelection = select(red, perimeterCompass);
const possibleMatches = [];
for (let cell = 0; cell < 25; cell++) {
  const block = red.slice(cell * 9, cell * 9 + 9);
  const positions = [0, 1, 2, 3, 5, 6, 7, 8];
  const matches = positions.filter(pos => block[pos].index === targets[cell]).map(pos => ({
    position: pos,
    page: block[pos].page,
    offset: block[pos].offset,
    gp: corpus.translit[block[pos].index]
  }));
  if (matches.length) possibleMatches.push({
    cell: cell + 1,
    targetGP: corpus.translit[targets[cell]],
    possible: matches
  });
}
const capacity = possibleMatches.reduce((sum, x) => sum + x.possible.length, 0);
const mathMatches = mathSelection.filter(x => x.match).length;
const compassMatches = compassSelection.filter(x => x.match).length;

console.log(JSON.stringify({
  source: {
    redRunes: red.length,
    framing: '25 consecutive blocks of 9; each block is row-major 3x3',
    targetMatrix: Array.from({ length: 5 }, (_, r) => targets.slice(5 * r, 5 * r + 5)),
    directionMatrix: Array.from({ length: 5 }, (_, r) => directions.slice(5 * r, 5 * r + 5))
  },
  perimeterPositions: {
    mathematical: perimeterMath,
    compass: perimeterCompass
  },
  targetCapacity: {
    blocksWithAnyPerimeterMatch: possibleMatches,
    maximumPossibleMatches: capacity,
    equiprobableDirectionExpectedMatches: capacity / 8,
    probabilityAtLeast2: 1 - Math.pow(7 / 8, 3) - 3 * (1 / 8) * Math.pow(7 / 8, 2),
    probabilityAtLeast3: Math.pow(1 / 8, 3)
  },
  mathematicalConvention: {
    convention: '0 degrees east, counter-clockwise',
    sequence: mathSelection.map(x => x.gp).join(' '),
    matches: mathMatches,
    matchCells: mathSelection.filter(x => x.match).map(x => x.cell),
    selected: mathSelection,
    orderPreservingCyclicNull: phaseNull(perimeterMath, mathMatches)
  },
  compassConvention: {
    convention: '0 degrees north, clockwise',
    sequence: compassSelection.map(x => x.gp).join(' '),
    matches: compassMatches,
    matchCells: compassSelection.filter(x => x.match).map(x => x.cell),
    selected: compassSelection,
    orderPreservingCyclicNull: phaseNull(perimeterCompass, compassMatches)
  }
}, null, 2));
