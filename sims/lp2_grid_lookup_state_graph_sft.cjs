'use strict';

/**
 * Source-native single-file test of the 256-byte LP2 grid as an 8-bit
 * lookup-state generator. Computes every possible orbit, without scoring
 * decoded plaintext, searching seeds, or changing the original table.
 *
 * Run from any directory with Node.js:
 *   node sims/lp2_grid_lookup_state_graph_sft.cjs
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../resources/liber-primus/base60-grid.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(source.alphabet, alphabet);
assert.equal(source.rows.length, 32);
assert.deepEqual(source.page_row_counts, [10, 13, 9]);

/** @type {number[]} Original 32 x 8 values, scan-row-major. */
const table = [];
for (const [rowIndex, row] of source.rows.entries()) {
  assert.equal(row.length, 8, `row ${rowIndex} has exactly eight tokens`);
  for (const token of row) {
    assert.equal(token.length, 2);
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0, `invalid token: ${token}`);
    const value = high * 60 + low;
    assert.ok(value >= 0 && value <= 255, `not a byte: ${token}`);
    table.push(value);
  }
}
assert.equal(table.length, 256);
const bytes = Buffer.from(table);
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(new Set(table).size, 161);

/**
 * Follow the exact function s_(i+1) = table[s_i] from a given byte seed.
 * @param {number} seed Initial state in [0,255].
 * @returns {{ transient: number, cycle: number[] }}
 */
function orbit(seed) {
  /** @type {Map<number,number>} */
  const seen = new Map();
  /** @type {number[]} */
  const pathStates = [];
  let state = seed;
  while (!seen.has(state)) {
    seen.set(state, pathStates.length);
    pathStates.push(state);
    state = table[state];
  }
  const transient = seen.get(state);
  assert.notEqual(transient, undefined);
  return { transient, cycle: pathStates.slice(transient) };
}

/**
 * Rotate the directed cycle to start at its smallest node.
 * @param {number[]} cycle
 * @returns {number[]}
 */
function canonicalCycle(cycle) {
  const start = cycle.indexOf(Math.min(...cycle));
  return cycle.slice(start).concat(cycle.slice(0, start));
}

/** @type {Map<string,{ states:number[], basin:number, maxTransient:number }>} */
const basins = new Map();
let maxTransient = 0;
for (let seed = 0; seed < 256; seed += 1) {
  const { transient, cycle } = orbit(seed);
  maxTransient = Math.max(maxTransient, transient);
  const states = canonicalCycle(cycle);
  const id = states.join(',');
  const existing = basins.get(id);
  if (existing) {
    existing.basin += 1;
    existing.maxTransient = Math.max(existing.maxTransient, transient);
  } else {
    basins.set(id, { states, basin: 1, maxTransient: transient });
  }

  // Independent check: after the 24th transition, the orbit is cyclic.
  let state = seed;
  for (let i = 0; i < 24; i += 1) state = table[state];
  let next = state;
  for (let i = 0; i < cycle.length; i += 1) next = table[next];
  assert.equal(next, state, `seed ${seed} has wrong periodicity`);
}

const cycles = Array.from(basins.values()).sort((a, b) => b.states.length - a.states.length);
assert.equal(cycles.length, 2);
assert.deepEqual(cycles[0].states, [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]);
assert.equal(cycles[0].basin, 252);
assert.deepEqual(cycles[1].states, [158, 249]);
assert.equal(cycles[1].basin, 4);
assert.equal(maxTransient, 24);
assert.equal(cycles.reduce((sum, cycle) => sum + cycle.basin, 0), 256);

console.log(JSON.stringify({
  source: 'resources/liber-primus/base60-grid.json',
  sourceBytesSha256: sha256,
  values: table.length,
  distinctValues: new Set(table).size,
  maxTransient,
  cycles: cycles.map(({ states, basin, maxTransient: maximum }) => ({
    period: states.length,
    states,
    emittedModulo29: states.map(value => value % 29),
    basinSeeds: basin,
    maximumTransient: maximum
  })),
  conclusion: 'All 256 seeds reach a cycle by 24 transitions; subsequent output period is at most 11.'
}, null, 2));
