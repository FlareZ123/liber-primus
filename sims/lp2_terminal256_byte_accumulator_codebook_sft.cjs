'use strict';

/**
 * Source-exact SFT for 32x8 LP2 table read as a reversible byte accumulator,
 * with a stationary arbitrary GP29 -> byte lookup M, or independent M per
 * physical concentric inner ring. No English corpus, key search, or unknown
 * p55 plaintext is used to fit this exact all-secret necessary condition.
 *
 * Run: node sims/lp2_terminal256_byte_accumulator_codebook_sft.cjs
 * Environment: Windows 11, Node.js 22, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const originalGrid = readJson('resources/liber-primus/base60-grid.json').byte_rows;
assert.equal(corpus.runes.length, 29);
assert.equal(originalGrid.length, 32);
assert.ok(originalGrid.every(r => r.length === 8 && r.every(v => Number.isInteger(v) && v >= 0 && v <= 255)));
const page = number => corpus.pages.find(p => p.page === number).indices;
const p55 = page(55), cipher56 = page(56), clear57 = page(57);
assert.equal(p55.length, 76);
assert.equal(cipher56.length, 85);
assert.equal(clear57.length, 95);
assert.equal(cipher56[56], 0);

function firstPrimes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    if (values.every(p => n % p !== 0)) values.push(n);
  }
  return values;
}
const keys = firstPrimes(84);
let keyClock = 0;
const solved56 = cipher56.map((c, i) => i === 56
  ? 0 : (c - (keys[keyClock++] - 1) % 29 + 29) % 29);
assert.equal(keyClock, 84);
assert.deepEqual(solved56.slice(0, 5), [24, 9, 18, 9, 23]);
assert.deepEqual(clear57.slice(0, 7), [13, 24, 4, 24, 17, 20, 18]);

/**
 * @param {number} top
 * @param {number} bottom
 * @param {number} left
 * @param {number} right
 * @returns {Array<[number,number]>}
 */
function clockwiseRing(top, bottom, left, right) {
  const cells = [];
  for (let c = left; c <= right; c++) cells.push([top, c]);
  for (let r = top + 1; r <= bottom; r++) cells.push([r, right]);
  for (let c = right - 1; c >= left; c--) cells.push([bottom, c]);
  for (let r = bottom - 1; r > top; r--) cells.push([r, left]);
  return cells;
}

/** @returns {Array<Array<[number,number]>>} */
function orientations(top, bottom, left, right) {
  const base = clockwiseRing(top, bottom, left, right);
  const corners = [[top, left], [top, right], [bottom, right], [bottom, left]];
  return [base, [...base].reverse()].flatMap(direction => corners.map(([r, c]) => {
    const offset = direction.findIndex(([x, y]) => x === r && y === c);
    assert.ok(offset >= 0);
    return direction.slice(offset).concat(direction.slice(0, offset));
  }));
}
const rings = Array.from({length: 4}, (_, i) => orientations(i, 31-i, i, 7-i));
assert.deepEqual(rings.map(r => r[0].length), [76, 68, 60, 52]);
assert.equal(new Set(rings.flatMap(r => r[0].map(([x,y]) => x*8+y))).size, 256);

/** @param {number} a @param {number} previous @param {'xor'|'add'} mode */
function delta(a, previous, mode) {
  return mode === 'xor' ? (a ^ previous) : (a - previous + 256) % 256;
}
/** @param {number} previous @param {number} value @param {'xor'|'add'} mode */
function append(previous, value, mode) {
  return mode === 'xor' ? (previous ^ value) : (previous + value) % 256;
}

/**
 * @param {number[][]} grid
 * @param {number[]} known
 * @param {[number,number,number]} layout
 * @param {'xor'|'add'} mode
 * @param {boolean} perRing
 */
function check(grid, known, layout, mode, perRing) {
  assert.equal(known.length, 180);
  const chosen = layout.flatMap((j, i) => rings[i+1][j]);
  const tables = Array.from({length: perRing ? 3 : 1}, () => Array(29).fill(-1));
  let mismatches = 0, tested = 0, firstMismatch = -1, offset = 0;
  for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
    const len = rings[ringIndex+1][0].length;
    for (let j = 0; j < len; j++, offset++) {
      // Exclude first inner cell: previous outer-ring byte is unknown-position
      // dependent. Per-ring model also excludes each new ring's first cell.
      if (offset === 0 || (perRing && j === 0)) continue;
      const [r,c] = chosen[offset], [pr,pc] = chosen[offset-1];
      const observed = delta(grid[r][c], grid[pr][pc], mode);
      const lookup = tables[perRing ? ringIndex : 0];
      const rune = known[offset];
      tested++;
      if (lookup[rune] < 0) lookup[rune] = observed;
      else if (lookup[rune] !== observed) {
        mismatches++;
        if (firstMismatch < 0) firstMismatch = offset;
      }
    }
  }
  return {mismatches, tested, firstMismatch,
    learned: tables.map(lookup => lookup.filter(v => v >= 0).length)};
}

/**
 * @param {number[][]} grid
 * @param {number[]} known
 * @param {'xor'|'add'} mode
 * @param {boolean} perRing
 */
function scan(grid, known, mode, perRing) {
  let best = null, zeros = 0, max = 0;
  for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++)
    for (let c = 0; c < 8; c++) {
      const tested = check(grid, known, [a,b,c], mode, perRing);
      if (!best || tested.mismatches < best.mismatches)
        best = {...tested, layout: [a,b,c]};
      if (tested.mismatches === 0) zeros++;
      max = Math.max(max, tested.mismatches);
    }
  return {best, zeros, max, checked: 512};
}
const expected = {
  'solved-xor-shared': [153,179,3,[23],[0,0,0],156],
  'solved-xor-perRing': [117,177,3,[20,19,18],[0,3,4],120],
  'solved-add-shared': [154,179,3,[23],[1,0,1],156],
  'solved-add-perRing': [119,177,3,[20,19,18],[0,0,0],120],
  'printed-xor-shared': [148,179,10,[29],[0,3,2],150],
  'printed-xor-perRing': [105,177,10,[28,23,18],[6,5,4],108],
  'printed-add-shared': [147,179,10,[29],[0,2,0],150],
  'printed-add-perRing': [106,177,10,[28,23,18],[0,7,0],108],
};
for (const [register, known] of [['solved', solved56.concat(clear57)],
  ['printed', cipher56.concat(clear57)]]) {
  for (const mode of ['xor','add']) for (const perRing of [false,true]) {
    const name = [register,mode,perRing?'perRing':'shared'].join('-');
    const result = scan(originalGrid, known, mode, perRing);
    const [m,t,first,learned,layout,max] = expected[name];
    assert.equal(result.best.mismatches,m,name);
    assert.equal(result.best.tested,t,name);
    assert.equal(result.best.firstMismatch,first,name);
    assert.deepEqual(result.best.learned,learned,name);
    assert.deepEqual(result.best.layout,layout,name);
    assert.equal(result.max,max,name);
    assert.equal(result.zeros,0,name);
    console.log('ORIGINAL',name,JSON.stringify(result));
  }
}

/**
 * Original-format planted positive: a reversible byte accumulator encodes
 * authentic p56 plaintext+p57 clear text and a withheld 76-rune sample.
 * Every allowed ring has a physically distinct byte coordinate.
 */
for (const mode of ['xor','add']) {
  const known = solved56.concat(clear57);
  const withheld = clear57.slice(0, 76);
  const plain = withheld.concat(known);
  const allCells = rings.flatMap(r => r[0]);
  const planted = Array.from({length:32},()=>Array(8).fill(-1));
  const secretMap = Array.from({length:29},(_,i)=>(37*i+13)%256);
  let prev = 52;
  for (let i=0;i<256;i++) {
    prev = append(prev,secretMap[plain[i]],mode);
    const [r,c] = allCells[i];
    planted[r][c] = prev;
  }
  assert.ok(planted.every(row => row.every(v => v >= 0 && v <= 255)));
  const fit = check(planted,known,[0,0,0],mode,false);
  assert.equal(fit.mismatches,0);
  assert.equal(fit.tested,179);
  const recovered = Array(29).fill(-1);
  for (let i=77;i<256;i++) {
    const [r,c] = allCells[i], [pr,pc] = allCells[i-1];
    const found = delta(planted[r][c],planted[pr][pc],mode);
    const symbol = plain[i];
    if (recovered[symbol] < 0) recovered[symbol] = found;
    else assert.equal(recovered[symbol],found);
  }
  const inverseLookup = new Map(recovered.map((byte,rune)=>[byte,rune])
    .filter(([byte])=>byte>=0));
  assert.equal(inverseLookup.size,fit.learned[0]);
  const decoded = [];
  let before = 52;
  for (let i=0;i<76;i++) {
    const [r,c] = allCells[i];
    const value = planted[r][c];
    const step = delta(value,before,mode);
    assert.ok(inverseLookup.has(step),'planted symbol seen in authentic 180 known suffix');
    decoded.push(inverseLookup.get(step));
    before = value;
  }
  assert.deepEqual(decoded,withheld);
  console.log('POSITIVE',mode,'known=',known.length,'withheldRecovered=',decoded.length,
    'distinctKnownSymbols=',fit.learned[0]);
}
console.log('PASS: 8 x 512 original-source ring tests; 2 x 76-rune blind synthetic positives.');
