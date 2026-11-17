'use strict';

/**
 * Source-frozen 2016 EPIPHANY SEECS candidate crib -> hidden 32-bit PRNG state.
 * Windows 11, Node.js 22: node sims/lp2_epiphany_prng32_unknownseed_sft.cjs
 * Exact enumeration, no packages. Conditional crib test, not a plaintext recovery.
 */
const assert = require('node:assert/strict');

// Original LP2 physical p0 red heading, 8+5 runes; independent signed 2016 phrase.
const CIPHER = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const CRIB = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const KEY = CIPHER.map((c, i) => (c - CRIB[i] + 29) % 29);
assert.deepEqual(KEY, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);

/** @param {number} s @returns {number} */
function xorshift32(s) {
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}

/** @param {number} a @param {number} b @param {number} s @returns {number} */
function lcg32(a, b, s) {
  return (Math.imul(a, s) + b) >>> 0;
}

/** @typedef {{name:string,step:(x:number)=>number,output:(x:number)=>number,high15:boolean}} Model */
/** @type {Model[]} */
const MODELS = [
  { name: 'xorshift32(13,17,5): full32 mod29', step: xorshift32, output: s => s % 29, high15: false },
  { name: 'ANSI C LCG32: full32 mod29', step: s => lcg32(1103515245, 12345, s), output: s => s % 29, high15: false },
  { name: 'Microsoft LCG32: full32 mod29', step: s => lcg32(214013, 2531011, s), output: s => s % 29, high15: false },
  { name: 'Numerical Recipes LCG32: full32 mod29', step: s => lcg32(1664525, 1013904223, s), output: s => s % 29, high15: false },
  { name: 'ANSI C LCG32: rand15 mod29', step: s => lcg32(1103515245, 12345, s), output: s => ((s >>> 16) & 0x7fff) % 29, high15: true },
  { name: 'Microsoft LCG32: rand15 mod29', step: s => lcg32(214013, 2531011, s), output: s => ((s >>> 16) & 0x7fff) % 29, high15: true }
];

/**
 * Enumerate every initial 32-bit state compatible with the first key digit.
 * Full32: integers congruent to first (mod29). Rand15: high bits 16..30
 * are fixed to a matching residue; bit31 and bits0..15 remain unconstrained.
 * @param {Model} model
 * @param {number} first
 * @param {(state:number)=>void} visit
 */
function initialStates(model, first, visit) {
  if (!model.high15) {
    for (let s = first; s <= 0xffffffff; s += 29) visit(s);
    return;
  }
  for (let high15 = first; high15 < 0x8000; high15 += 29) {
    const upper = high15 << 16;
    for (let low = 0; low < 0x10000; low++) {
      visit((upper | low) >>> 0);
      visit((upper | low | 0x80000000) >>> 0);
    }
  }
}

/**
 * Check every possible hidden state, rejecting immediately upon mismatch.
 * @param {Model} model
 * @param {number[]} prefix
 * @returns {{matchesByPrefix:number[],states:number[]}}
 */
function scan(model, prefix) {
  const matchesByPrefix = Array(prefix.length).fill(0);
  const states = [];
  initialStates(model, prefix[0], initial => {
    matchesByPrefix[0]++;
    let state = initial;
    for (let i = 1; i < prefix.length; i++) {
      state = model.step(state);
      if (model.output(state) !== prefix[i]) return;
      matchesByPrefix[i]++;
    }
    states.push(initial);
  });
  return { matchesByPrefix, states };
}

/** @param {Model} model @param {number} state @param {number} length @returns {number[]} */
function tape(model, state, length) {
  const digits = [];
  for (let i = 0; i < length; i++) {
    digits.push(model.output(state));
    state = model.step(state);
  }
  return digits;
}

for (const model of MODELS) {
  const original = scan(model, KEY);
  assert.equal(original.matchesByPrefix[6], 0, model.name);
  assert.equal(original.states.length, 0);
  // Genuine positive: planted unknown state, independent GP source plaintext.
  const hidden = model.step(0x3301);
  const plantedKey = tape(model, hidden, 13);
  const recovered = scan(model, plantedKey);
  assert.ok(recovered.states.includes(hidden), model.name);
  const plain = [24, 9, 18, 9, 23, 7, 10, 2, 10, 9, 2, 18, 23]; // "AN END WITHIN THE D..."
  const encrypted = plain.map((p, i) => (p + plantedKey[i]) % 29);
  assert.deepEqual(encrypted.map((c, i) => (c - plantedKey[i] + 29) % 29), plain);
  console.log(JSON.stringify({
    generator: model.name, sourceMatchesByPrefix: original.matchesByPrefix,
    sourceStateCandidates: original.states.length,
    plantedHiddenStateRecovered: true, plantedStateCandidates: recovered.states.length
  }));
}
console.log('CONDITIONAL NEGATIVE: all six original-title-derived 32-bit PRNG families fail at the seventh key digit. No original plaintext recovered.');
