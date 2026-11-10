'use strict';

const assert = require('node:assert/strict');

// Test the source-motivated walk x' = x +/- phi(p_x) (mod 29),
// where p_x is the x-th Gematria Primus prime. This is a walk over
// rune indices, not the p56 cipher itself.
const primes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109,
];
const runes = [
  'Feoh', 'Ur', 'Thorn', 'Os', 'Rad', 'Cen', 'Gyfu', 'Wynn', 'Haegl', 'Nyd',
  'Is', 'Ger', 'Eoh', 'Peorth', 'Eolh', 'Sigel', 'Tiwaz', 'Beorc', 'Eh', 'Mannaz',
  'Lagu', 'Ing', 'Ethel', 'Daeg', 'Ac', 'Aesc', 'Yr', 'Ior', 'Ear',
];

function next(index, sign) {
  return ((index + sign * (primes[index] - 1)) % 29 + 29) % 29;
}

function orbit(start, sign) {
  const seen = new Map();
  const sequence = [];
  let current = start;
  while (!seen.has(current)) {
    seen.set(current, sequence.length);
    sequence.push(current);
    current = next(current, sign);
  }
  return {
    sequence,
    preperiod: seen.get(current),
    period: sequence.length - seen.get(current),
    cycle: sequence.slice(seen.get(current)),
  };
}

function canonicalCycle(cycle) {
  const rotations = cycle.map((_, i) => cycle.slice(i).concat(cycle.slice(0, i)));
  rotations.sort((a, b) => {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  });
  return rotations[0];
}

function summarize(sign) {
  const basins = new Map();
  for (let start = 0; start < 29; start++) {
    const result = orbit(start, sign);
    const cycle = canonicalCycle(result.cycle);
    const key = cycle.join(',');
    if (!basins.has(key)) basins.set(key, { cycle, starts: [] });
    basins.get(key).starts.push(start);
  }
  const ac = orbit(24, sign);
  const label = index => ({ index, rune: runes[index], prime: primes[index], road: `A${primes[index]}` });
  return {
    sign: sign > 0 ? 'plus' : 'minus',
    ac: {
      sequence: ac.sequence.map(label),
      preperiod: ac.preperiod,
      period: ac.period,
      cycle: ac.cycle.map(label),
    },
    cycles: [...basins.values()].map(b => ({
      cycle: b.cycle.map(label),
      basin_size: b.starts.length,
      starts: b.starts.map(label),
    })).sort((a, b) => a.cycle.length - b.cycle.length || a.cycle[0].index - b.cycle[0].index),
  };
}

const plus = summarize(1);
const minus = summarize(-1);
assert.deepEqual(plus.ac.sequence.map(x => x.index), [24, 4, 14, 2, 6, 22, 17, 19]);
assert.equal(plus.ac.preperiod, 3);
assert.equal(plus.ac.period, 5);
assert.deepEqual(plus.cycles.map(x => x.basin_size).sort((a, b) => a - b), [1, 8, 20]);
assert.deepEqual(minus.ac.sequence.map(x => x.index), [24, 15, 21, 1, 28, 7, 18, 10, 9]);
assert.equal(minus.ac.preperiod, 7);
assert.equal(minus.ac.period, 2);
assert.deepEqual(minus.cycles.map(x => x.basin_size).sort((a, b) => a - b), [1, 28]);

console.log(JSON.stringify({
  rule: 'x_next = (x +/- (p_x - 1)) mod 29, with p_x the GP prime at index x',
  plus,
  minus,
}, null, 2));
