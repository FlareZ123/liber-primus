'use strict';

/**
 * Liber Primus LP2 pp0–2, 27×27 Aztec compact-four-layer finder necessary condition.
 * Complete source: resources/liber-primus/lp2-corpus.json.
 *
 * A genuine compact Aztec symbol has a predetermined central 9×9 black/white
 * finder structure. If original GP29 glyphs represent modules through ANY
 * stationary unknown binary alphabet mapping, repeated source glyphs cannot
 * demand both fixed colors. This code computes the exact minimal mismatches
 * over all 2^29 binary maps without enumerating them.
 *
 * Runtime: Node.js 22, CommonJS, Windows-compatible.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const corpus = JSON.parse(readFileSync(join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pageCounts = [262, 266, 201];
for (let i = 0; i < 3; i += 1) {
  assert.equal(corpus.pages[i].page, i);
  assert.equal(corpus.pages[i].runic_count, pageCounts[i]);
}
const source = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.equal(source.length, 729);
assert.equal(corpus.runes.length, 29);
assert(source.every((v) => Number.isInteger(v) && v >= 0 && v < 29));

const SIDE = 27;
const CENTER = 13;

/**
 * @typedef {{minEdits:number,conflicts:number,usedSymbols:number,positionCount:number,counts:number[][]}} FinderResult
 * @param {number[]} tape - 729 GP29 original or planted symbols.
 * @param {(col:number,row:number)=>number} originalPosition
 * @returns {FinderResult}
 */
function inspectFinder(tape, originalPosition) {
  const counts = Array.from({ length: 29 }, () => [0, 0]);
  let positionCount = 0;
  for (let row = CENTER - 4; row <= CENTER + 4; row += 1) {
    for (let col = CENTER - 4; col <= CENTER + 4; col += 1) {
      const ring = Math.max(Math.abs(row - CENTER), Math.abs(col - CENTER));
      const fixedBit = ring % 2 === 0 ? 1 : 0;
      const pos = originalPosition(col, row);
      assert(pos >= 0 && pos < tape.length);
      counts[tape[pos]][fixedBit] += 1;
      positionCount += 1;
    }
  }
  return {
    minEdits: counts.reduce((sum, [light, dark]) => sum + Math.min(light, dark), 0),
    conflicts: counts.filter(([light, dark]) => light > 0 && dark > 0).length,
    usedSymbols: counts.filter(([light, dark]) => light + dark > 0).length,
    positionCount,
    counts,
  };
}

const views = {
  'row-major': (x, y) => y * SIDE + x,
  'column-major': (x, y) => x * SIDE + y,
  'row-snake': (x, y) => y * SIDE + (y % 2 === 0 ? x : SIDE - 1 - x),
  'column-snake': (x, y) => x * SIDE + (x % 2 === 0 ? y : SIDE - 1 - y),
  'reverse-row-major': (x, y) => source.length - 1 - (y * SIDE + x),
};
const results = Object.entries(views).map(([view, position]) => {
  const observed = inspectFinder(source, position);
  assert.equal(observed.positionCount, 81);
  assert.equal(observed.minEdits, 24);
  assert.equal(observed.conflicts, 20);
  assert.equal(observed.usedSymbols, 27);
  return { view, errors: observed.minEdits };
});

/**
 * Positive known-bit example: choose source-native-looking arbitrary glyphs 3
 * for a black module and 7 for a white module at each fixed finder coordinate.
 * Every other (data) glyph is untouched, and the trained all-map check must
 * reconstruct all 81 fixed modules.
 */
const planted = source.slice();
for (let row = CENTER - 4; row <= CENTER + 4; row += 1) {
  for (let col = CENTER - 4; col <= CENTER + 4; col += 1) {
    const ring = Math.max(Math.abs(row - CENTER), Math.abs(col - CENTER));
    planted[row * SIDE + col] = ring % 2 === 0 ? 3 : 7;
  }
}
const positive = inspectFinder(planted, views['row-major']);
assert.equal(positive.minEdits, 0);
assert.equal(positive.positionCount, 81);
const corrupted = planted.slice();
corrupted[CENTER * SIDE + CENTER] = 7;
assert.equal(inspectFinder(corrupted, views['row-major']).minEdits, 1);

console.log('SOURCE pp0–2 exact rune counts: 262+266+201=729=27²');
console.log('SOURCE four-layer compact Aztec candidate: center 9×9 fixed bullseye');
for (const row of results) {
  console.log('SOURCE ' + row.view + ': at least ' + row.errors +
    '/81 fixed finder modules must change under ANY stationary GP29→bit map');
}
console.log('CONTROL planted true finder: 0/81 corrections; one corrupted: 1/81');
console.log('PASS original-cipher finder necessary condition and positive controls');
