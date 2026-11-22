'use strict';

/**
 * Exact original-data SFT for the source-visible 81x81 / 80x80 bookend
 * and the red-center, clockwise/outward p15 spiral as a positional-only read.
 * Run from any cwd: node sims/lp2_bookend_p15_center_spiral_cropped_perm_sft.cjs
 * Requires only the committed lp2-corpus.json and Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const runes = source.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(runes.length, 12956);
const A = runes.slice(0, 6561);
const suffix = runes.slice(6561);
assert.equal(A.length, 81 ** 2);
assert.equal(suffix.length, 6395);
const holes = [2244, 2384, 2476, 2575, 2672];
const holeSet = new Set(holes);
const B = [];
let sourceIndex = 0;
for (let slot = 0; slot < 6400; slot++) {
  B.push(holeSet.has(slot) ? null : suffix[sourceIndex++]);
}
assert.equal(sourceIndex, suffix.length);
assert.equal(B.length, 80 ** 2);

const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(A.slice(-6), bookend);
assert.deepEqual(suffix.slice(-6), bookend);
assert.deepEqual(B.slice(-6), bookend);

/**
 * The 4x4 p15 figure prints its sole red value at inner-upper-left.
 * Read that cell first, then walk right/down/left/up with steps 1,1,2,2,3,3,...
 * This works for the 81x81 A and even 80x80 B without fitted orientation.
 * @param {number} n
 * @returns {number[]}
 */
function centerOutSpiral(n) {
  const positions = [];
  const visited = new Uint8Array(n * n);
  let r = Math.floor((n - 1) / 2);
  let c = r;
  const moves = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let direction = 0;
  let step = 1;
  const add = () => {
    if (r < 0 || r >= n || c < 0 || c >= n) return;
    const slot = r * n + c;
    assert.equal(visited[slot], 0, 'Source-spiral must not revisit');
    visited[slot] = 1;
    positions.push(slot);
  };
  add();
  while (positions.length < n * n) {
    for (let turn = 0; turn < 2; turn++) {
      const [dr, dc] = moves[direction % 4];
      for (let i = 0; i < step; i++) {
        r += dr;
        c += dc;
        add();
        if (positions.length === n * n) break;
      }
      direction++;
      if (positions.length === n * n) break;
    }
    step++;
  }
  assert.equal(positions.length, n * n);
  assert.equal(visited.reduce((a, b) => a + b, 0), n * n);
  return positions;
}

/**
 * @param {number[]} xs
 * @param {number} start
 * @param {number} width
 * @returns {number}
 */
function top12(xs, start, width) {
  const counts = Array(29).fill(0);
  for (let i = start; i < start + width; i++) {
    const symbol = xs[i];
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    counts[symbol]++;
  }
  return counts.sort((a, b) => b - a).slice(0, 12)
    .reduce((a, b) => a + b, 0);
}

/**
 * Every possible start is checked, including otherwise unreported windows.
 * @param {number[]} xs
 * @param {number} width
 * @returns {{count:number,start:number}}
 */
function bestWindow(xs, width) {
  let best = {count: -1, start: -1};
  for (let start = 0; start + width <= xs.length; start++) {
    const count = top12(xs, start, width);
    if (count > best.count) best = {count, start};
  }
  return best;
}

const aSpiral = centerOutSpiral(81);
const bSpiral = centerOutSpiral(80);
assert.deepEqual(aSpiral.slice(0, 7), [3280, 3281, 3362, 3361, 3360, 3279, 3198]);
assert.deepEqual(bSpiral.slice(0, 7), [3159, 3160, 3240, 3239, 3238, 3158, 3078]);
const aRead = aSpiral.map(i => A[i]);
const bRead = bSpiral.map(i => B[i]).filter(x => x !== null);
assert.equal(aRead.length, 6561);
assert.equal(bRead.length, 6395);
const inverseA = Array(6561);
for (let i = 0; i < aSpiral.length; i++) inverseA[aSpiral[i]] = aRead[i];
assert.deepEqual(inverseA, A);
const inverseB = Array(6400).fill(null);
let plainIndex = 0;
for (const slot of bSpiral) {
  if (!holeSet.has(slot)) inverseB[slot] = bRead[plainIndex++];
}
assert.equal(plainIndex, bRead.length);
assert.deepEqual(inverseB, B);

// A full positional-only transposition necessarily preserves all source rune counts.
assert.equal(top12(aRead, 0, aRead.length), 2908);
assert.equal(top12(bRead, 0, bRead.length), 2797);
assert.equal(top12(A, 0, A.length), 2908);
assert.equal(top12(suffix, 0, suffix.length), 2797);
assert.deepEqual(bestWindow(aRead, 300), {count: 172, start: 3854});
assert.deepEqual(bestWindow(bRead, 300), {count: 177, start: 370});
assert.deepEqual(bestWindow(aRead, 200), {count: 124, start: 6044});
assert.deepEqual(bestWindow(bRead, 200), {count: 128, start: 360});

// Four source-canonical crops delete one 81-cell row and one 81-cell column.
// The terminal echo selects the lower-right retained corner (delete first/first).
const crops = [];
for (const rowOffset of [0, 1]) {
  for (const colOffset of [0, 1]) {
    let whole = 0;
    let tail = 0;
    for (let k = 0; k < 6400; k++) {
      if (B[k] === null) continue;
      const row = Math.floor(k / 80);
      const col = k % 80;
      const fromA = A[(row + rowOffset) * 81 + col + colOffset];
      if (fromA === B[k]) {
        whole++;
        if (k >= 6394) tail++;
      }
    }
    crops.push({rowOffset, colOffset, whole, tail});
  }
}
assert.deepEqual(crops, [
  {rowOffset:0,colOffset:0,whole:214,tail:0},
  {rowOffset:0,colOffset:1,whole:210,tail:0},
  {rowOffset:1,colOffset:0,whole:237,tail:0},
  {rowOffset:1,colOffset:1,whole:239,tail:6},
]);

// Matched-null: move the *entire* 80x80 source-cropped A register in all 6400
// possible cyclic displacements; keep B's actual five missing slots fixed.
const aCrop = Array.from({length: 6400}, (_, k) => {
  const row = Math.floor(k / 80);
  const col = k % 80;
  return A[(row + 1) * 81 + col + 1];
});
const matchedShift = [];
for (let shift = 0; shift < 6400; shift++) {
  let equal = 0;
  for (let k = 0; k < 6400; k++) {
    if (B[k] !== null && B[k] === aCrop[(k + shift) % 6400]) equal++;
  }
  matchedShift.push(equal);
}
assert.equal(matchedShift[0], 239);
assert.equal(matchedShift.reduce((a, b) => a + b, 0), 1410604);
assert.equal(matchedShift.filter(x => x >= 239).length, 703);
assert.equal(Math.max(...matchedShift), 273);

// Genuine solved source GP29 controls: perfectly reversible source-selected
// transposition. Under a correct plaintext plant a 300-symbol rune window
// really does contain a native-GP concentration, unlike the original.
const solved = source.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({length: 6395}, (_, i) => solved[i % solved.length]);
const planted = Array(6400).fill(null);
let nativeIndex = 0;
for (const slot of bSpiral) if (!holeSet.has(slot)) planted[slot] = native[nativeIndex++];
assert.equal(nativeIndex, native.length);
const decodedPlant = bSpiral.map(i => planted[i]).filter(x => x !== null);
assert.deepEqual(decodedPlant, native);
assert.deepEqual(bestWindow(decodedPlant, 300), {count:246,start:0});
assert.equal(top12(solved,0,solved.length),77);

console.log(JSON.stringify({
  source: 'Original LP2 p0..55, five printed numbered holes, original solved p57',
  geometry: {first: [81,81], second:[80,80], holes},
  seam: {runes:bookend, atA:[6555,6561], atB:[12950,12956]},
  sourceSelectedSpiral: {A:{first:aSpiral.slice(0,7),max300:bestWindow(aRead,300)},
    B:{first:bSpiral.slice(0,7),max300:bestWindow(bRead,300)}},
  keylessCropControls: crops,
  terminalSelectedCrop: {match:239,excludingSix:233,possible:6389},
  cyclicNull: {all6400:matchedShift.length,atLeastOriginal:703,max:273},
  plantedSolvedPositive: {recovered:decodedPlant.length,max300:bestWindow(decodedPlant,300)}
},null,2));
console.log('PASS: exact source-selected spiral and full 81x81/80x80 inverse; zero authentic GP29 prose');
