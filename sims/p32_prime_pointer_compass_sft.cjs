'use strict';

/**
 * Original LP2 physical p32, source-selected 11x11 prime navigation gate.
 * No plaintext, key, directional rotation, page phase, or alphabet is fitted.
 * Requires resources/liber-primus/lp2-corpus.json in the repository root.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find(p => p.page === 32);
const primes = corpus.prime;
const glyph = corpus.translit;
assert.equal(page.indices.length, 121);
assert.equal(primes.length, 29);
const symbols = page.indices;
const weights = symbols.map(i => primes[i]);
assert.equal(weights.slice(0, 11).reduce((a, b) => a + b, 0), 563);
assert.equal(Array.from({length: 11}, (_, r) => weights[11 * r]).reduce((a, b) => a + b, 0), 569);

/** Return all directed cycles in the one-based GP-prime cell-address map. */
function findCycles(list) {
  const state = new Uint8Array(121);
  const cycles = [];
  for (let start = 0; start < 121; start++) {
    if (state[start]) continue;
    const path = [], at = new Map();
    let cell = start;
    while (!state[cell]) {
      state[cell] = 1;
      at.set(cell, path.length);
      path.push(cell);
      cell = list[cell] - 1;
    }
    if (at.has(cell)) cycles.push(path.slice(at.get(cell)).map(i => i + 1).sort((a, b) => a - b));
    for (const i of path) state[i] = 2;
  }
  return cycles.sort((a, b) => a.length - b.length || a[0] - b[0]);
}

/** Follow the one-based prime-address pointer from a preselected source cell. */
function addressWalk(start) {
  let cell = start;
  const visited = [], at = new Map();
  while (!at.has(cell)) {
    at.set(cell, visited.length);
    visited.push(cell + 1);
    cell = weights[cell] - 1;
  }
  return {start: start + 1, path: visited, cycleFrom: at.get(cell), cycleLength: visited.length - at.get(cell),
    labels: visited.map(i => glyph[symbols[i - 1]]).join('')};
}

/**
 * One-square clockwise NESW compass read. Odd primes have residues 1,3,5,7
 * modulo 8; prime 2 is a separately frozen terminal. No wrapping.
 */
const cardinal = {1: [-1, 0], 3: [0, 1], 5: [1, 0], 7: [0, -1]};
function compassWalk(start) {
  let cell = start, reason, path = [], seen = new Set();
  while (true) {
    if (seen.has(cell)) {reason = 'cycle'; break;}
    seen.add(cell);
    path.push(cell + 1);
    const prime = weights[cell];
    if (prime === 2) {reason = 'prime2'; break;}
    const [dr, dc] = cardinal[prime % 8];
    const r = Math.floor(cell / 11), c = cell % 11;
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= 11 || nc < 0 || nc >= 11) {reason = 'exit'; break;}
    cell = nr * 11 + nc;
  }
  return {start: start + 1, path, reason, labels: path.map(i => glyph[symbols[i - 1]]).join('')};
}

const cycles = findCycles(weights);
assert.deepEqual(cycles, [[17, 83, 107], [3, 11, 79, 101]]);
const naturalStarts = [0, 60, 115];
const addressStarts = naturalStarts.map(addressWalk);
assert.deepEqual(addressStarts.map(x => x.path.length), [6, 9, 10]);
assert.deepEqual(addressStarts.map(x => x.cycleLength), [4, 4, 4]);
assert.equal(Math.max(...weights), 109);  // 110..121 are unreachable after any transition
assert.equal(Math.min(...weights), 2);

const compassStats = {prime2: 0, exit: 0, cycle: 0};
const compassStarts = naturalStarts.map(compassWalk);
let longest = 0;
for (let i = 0; i < 121; i++) {
  const walk = compassWalk(i);
  compassStats[walk.reason]++;
  longest = Math.max(longest, walk.path.length);
}
assert.deepEqual(compassStats, {prime2: 12, exit: 36, cycle: 73});
assert.equal(longest, 7);
assert.deepEqual(compassStarts.map(x => x.path.length), [1, 2, 1]);

// Deliberate seven-cycle positive: each cell contains the one-based prime label
// of the next cell. The other 114 cells feed into the same cycle.
const planted = Array(121).fill(2);
const seven = [2, 3, 5, 7, 11, 13, 17];
for (let i = 0; i < seven.length; i++) planted[seven[i] - 1] = seven[(i + 1) % seven.length];
assert.deepEqual(findCycles(planted), [seven]);

// Original-source conditional diagnostic, not an independent discovery-wide
// p-value: the {3,4} cycle lengths were observed before this statistic was set.
let rngState = 0x5163301;
function nextRandom() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
const draws = 100000;
const shuffled = weights.slice();
let matching = 0, totalSeven = 0;
for (let trial = 0; trial < draws; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const k = nextRandom() % (i + 1);
    [shuffled[k], shuffled[i]] = [shuffled[i], shuffled[k]];
  }
  const lengths = findCycles(shuffled).map(c => c.length);
  if (lengths.length === 2 && lengths[0] === 3 && lengths[1] === 4) matching++;
  if (lengths.reduce((a, b) => a + b, 0) === 7) totalSeven++;
}
assert.equal(matching, 931);
assert.equal(totalSeven, 10896);

console.log(JSON.stringify({source: 'LP2 physical p32 / signed 2016 tree dimensions', originalRuneCount: symbols.length,
  imageAxes: [563, 569], oneBasedPrimeCycles: cycles, addressStarts,
  unreachableAfterMove: 12, compassStats, longestCompassWalk: longest, compassStarts,
  conditionalShuffled: {seed: '0x5163301', draws, exactCycleLengths3and4: matching, totalCycleNodes7: totalSeven},
  sevenCyclePositive: 'passed', recoveredPlaintext: false}, null, 2));
