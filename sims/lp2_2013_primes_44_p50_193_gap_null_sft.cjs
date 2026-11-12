#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);

function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push(x);
  }
  return out;
}
const primes = firstPrimes(54);
const multiplicity = new Map();
for (const v of bytes) multiplicity.set(v, (multiplicity.get(v) || 0) + 1);
const observed = [];
for (let gap = 1; gap <= 54; gap++) {
  const p = primes[gap - 1];
  const positions = [];
  for (let i = 0; i + gap < bytes.length; i++) {
    if (bytes[i] === p && bytes[i + gap] === p) positions.push([i, i + gap]);
  }
  if (positions.length) observed.push({
    gap, primeOrdinal: gap, primeValue: p,
    multiplicity: multiplicity.get(p) || 0, positions
  });
}
const gap44Positions = bytes.map((v, i) => v === 193 ? i : -1).filter(i => i >= 0);
assert.deepEqual(gap44Positions, [83, 127]);
assert.equal(gap44Positions[1] - gap44Positions[0], 44);
assert.equal((multiplicity.get(3) || 0), 0); // first doubled-space gap is 2

// Exact conditional placement probability for the two 193 entries.
const fixedGap44Probability = 2 * (256 - 44) / (256 * 255);

// Familywise permutation null: preserve the exact byte histogram and ask
// whether ANY of the first 54 prime ordinals appears as an equal-value gap.
let seed = 0x3301;
function nextUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const simulations = 100000;
let anyMatch = 0, gap44Match = 0;
const matchHistogram = new Uint32Array(5);
for (let rep = 0; rep < simulations; rep++) {
  const shuffled = bytes.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = nextUint32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const positions = new Map();
  for (let i = 0; i < shuffled.length; i++) {
    let a = positions.get(shuffled[i]);
    if (!a) { a = []; positions.set(shuffled[i], a); }
    a.push(i);
  }
  let matches = 0;
  for (let gap = 1; gap <= 54; gap++) {
    const p = primes[gap - 1];
    const at = positions.get(p) || [];
    for (const i of at) {
      if (i + gap < 256 && shuffled[i + gap] === p) matches++;
    }
  }
  if (matches) anyMatch++;
  if ((positions.get(193) || []).some(i => i + 44 < 256 && shuffled[i + 44] === 193)) {
    gap44Match++;
  }
  matchHistogram[Math.min(matches, 4)]++;
}
const expectedMatches = primes.reduce((sum, p, index) => {
  const gap = index + 1;
  const n = multiplicity.get(p) || 0;
  return sum + (n * (n - 1) / 2) * (2 * (256 - gap) / (256 * 255));
}, 0);

console.log(JSON.stringify({
  sourceFacts: {
    byteCount: bytes.length,
    uniqueValues: new Set(bytes).size,
    doubledSpacesIn2013Paste: ['after 29', 'after 3257'],
    firstDoubledSpace: {gap: 2, primeOrdinal: 2, primeValue: 3, tableMultiplicity: multiplicity.get(3) || 0},
    secondDoubledSpace: {gap: 44, primeOrdinal: 44, primeValue: 193, positions: gap44Positions, interiorLength: 43},
    p55InteriorLength: 43
  },
  observedPrimeOrdinalGapMatches: observed,
  null: {
    fixedGap44ConditionalProbability: fixedGap44Probability,
    expectedMatchesAcross54Gaps: expectedMatches,
    simulations,
    familywiseAnyMatchP: (anyMatch + 1) / (simulations + 1),
    fixedGap44P: (gap44Match + 1) / (simulations + 1),
    matchCountHistogram: Array.from(matchHistogram)
  }
}, null, 2));
