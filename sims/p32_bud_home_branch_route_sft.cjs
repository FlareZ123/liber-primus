'use strict';

/**
 * Original LP2 p32 BUD/HOME branch-route SFT.
 *
 * Reads the canonical 121 GP indices, freezes the source dimension axes,
 * both source-visible four-rune words, and the perimeter defining M7.
 * Its comparison conditions on these discoveries; it does not estimate
 * the chance of an intended Cicada solve after the original search.
 *
 * Usage from repository root: node sims/p32_bud_home_branch_route_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const p32 = corpus.pages.find((p) => p.page === 32).indices;
const prime = corpus.prime;
assert.equal(p32.length, 121);
const pos = (r, c) => 11 * r + c;
const mod29 = (n) => ((n % 29) + 29) % 29;

/** @param {number} n Nonzero element of F29. */
function inverse29(n) {
  const value = mod29(n);
  for (let i = 1; i < 29; i++) {
    if (mod29(i * value) === 1) return i;
  }
  return null;
}

/** @param {number|null} x Projective input, null means infinity. */
function m7(x) {
  if (x === null) return mod29(14 * inverse29(25));
  const denominator = mod29(25 * x + 28);
  if (denominator === 0) return null;
  return mod29((14 * x + 25) * inverse29(denominator));
}

/** @param {number[]} positions Zero-based original source cells. */
function primeSum(positions, grid = p32) {
  return positions.reduce((sum, index) => sum + prime[grid[index]], 0);
}

const home = [0, 1, 2, 3].map((c) => pos(3, c));
const buds = [5, 6, 7, 8].map((c) => pos(8, c));
assert.deepEqual(home.map((i) => p32[i]), [8, 3, 19, 18]);
assert.deepEqual(buds.map((i) => p32[i]), [17, 1, 23, 15]);
const secondaryBud = [[10, 9], [9, 8], [8, 7]].map(([r, c]) => pos(r, c));
assert.deepEqual(secondaryBud.map((i) => p32[i]), [17, 1, 23]);

const route9 = [
  [8, 5], [7, 4], [6, 3], [5, 2], [4, 1],
  [3, 0], [3, 1], [3, 2], [3, 3],
].map(([r, c]) => pos(r, c));
const route13 = [
  [10, 9], [9, 8], [8, 7], [8, 6],
  ...[[8, 5], [7, 4], [6, 3], [5, 2], [4, 1],
    [3, 0], [3, 1], [3, 2], [3, 3]],
].map(([r, c]) => pos(r, c));
assert.equal(route9.length, 9);
assert.equal(route13.length, 13);
assert.deepEqual(route9.map((i) => p32[i]), [17, 21, 27, 19, 17, 8, 3, 19, 18]);
assert.deepEqual(route13.map((i) => p32[i]), [17, 1, 23, 1, 17, 21, 27, 19, 17, 8, 3, 19, 18]);
const nineSum = primeSum(route9);
const thirteenSum = primeSum(route13);
assert.equal(nineSum, 547);
assert.equal(thirteenSum, 703);
// Original printed word HOMEX includes the X one cell after HOME E.
const xCell = pos(3, 4);
assert.equal(p32[xCell], 14);
const tenSum = nineSum + prime[p32[xCell]];
const fourteenSum = thirteenSum + prime[p32[xCell]];
assert.equal(tenSum, 594);
assert.equal(fourteenSum, 750);
assert.equal(mod29(nineSum), 25);
assert.equal(mod29(thirteenSum), 7);
assert.equal(m7(25), 25);
assert.equal(m7(7), null);
assert.equal(m7(mod29(tenSum)), 18); // Adjacent p33 cuneiform 1033 mod 29.
assert.equal(m7(mod29(fourteenSum)), 25);
assert.deepEqual([7, null, 11, 16, 10, 8, 2, 7], (() => {
  const orbit = [7];
  for (let i = 0; i < 7; i++) orbit.push(m7(orbit[orbit.length - 1]));
  return orbit;
})());

const fixed = new Set();
for (let i = 0; i < 11; i++) {
  fixed.add(pos(0, i));
  fixed.add(pos(i, 0));
}
for (let row = 3; row <= 7; row++) {
  for (let col = 3; col <= 7; col++) {
    if (row === 3 || row === 7 || col === 3 || col === 7) fixed.add(pos(row, col));
  }
}
for (const i of home.concat(buds)) fixed.add(i);
const mutable = Array.from({ length: 121 }, (_, i) => i).filter((i) => !fixed.has(i));
assert.equal(fixed.size, 43);
assert.equal(mutable.length, 78);

// Any straight 3-glyph B-U-D path ending at D of the fixed horizontal BUDS.
const directions = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1],
];
const joins = [];
for (const [dr, dc] of directions) {
  const br = 8 - 2 * dr;
  const bc = 7 - 2 * dc;
  const ur = 8 - dr;
  const uc = 7 - dc;
  if ([br, bc, ur, uc].some((v) => v < 0 || v >= 11)) continue;
  const b = pos(br, bc);
  const u = pos(ur, uc);
  if (b === pos(8, 5) && u === pos(8, 6)) continue;
  joins.push([b, u]);
}
assert.equal(joins.length, 7);
assert.equal(joins.filter(([b, u]) => p32[b] === 17 && p32[u] === 1).length, 1);

/** @returns {number} Deterministic uniform 32-bit source scaled to [0,1). */
let state = 0x03213569;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

const samples = 200000;
let hitNine = 0;
let hitBranch = 0;
let hitJoint = 0;
const grid = Uint8Array.from(p32);
const values = mutable.map((i) => grid[i]);
for (let t = 0; t < samples; t++) {
  for (let k = values.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1));
    const tmp = values[k];
    values[k] = values[j];
    values[j] = tmp;
  }
  for (let k = 0; k < values.length; k++) grid[mutable[k]] = values[k];
  const nine = mod29(primeSum(route9, grid)) === 25;
  const branch = joins.some(([b, u]) => grid[b] === 17 && grid[u] === 1);
  if (nine) hitNine++;
  if (branch) hitBranch++;
  if (nine && branch) hitJoint++;
}
assert.deepEqual([hitNine, hitBranch, hitJoint], [6107, 3173, 84]);

console.log(JSON.stringify({
  status: 'conditional exploratory source-route, no decrypted LP2 plaintext',
  p32RuneCount: 121,
  home: home.map((i) => [Math.floor(i / 11), i % 11]),
  buds: buds.map((i) => [Math.floor(i / 11), i % 11]),
  secondaryBud: secondaryBud.map((i) => [Math.floor(i / 11), i % 11]),
  nine: { runeIndices: route9.map((i) => p32[i]), sum: nineSum, residue: mod29(nineSum), M7: m7(mod29(nineSum)) },
  thirteen: { runeIndices: route13.map((i) => p32[i]), sum: thirteenSum, residue: mod29(thirteenSum), M7: m7(mod29(thirteenSum)) },
  xEndpointAlternative: {
    terminalGlyph: 'X', extraPrime: prime[p32[xCell]],
    shorter: { vertices: 10, steps: 9, sum: tenSum, residue: mod29(tenSum), M7: m7(mod29(tenSum)) },
    longer: { vertices: 14, steps: 13, sum: fourteenSum, residue: mod29(fourteenSum), M7: m7(mod29(fourteenSum)) },
    nullEventsIdentical: true,
  },
  sourceFixedCells: fixed.size,
  shuffledCells: mutable.length,
  samples,
  seed: '0x03213569',
  nullCounts: { nine: hitNine, additionalBranch: hitBranch, joint: hitJoint },
  jointConditionalAddOne: (hitJoint + 1) / (samples + 1),
}, null, 2));
