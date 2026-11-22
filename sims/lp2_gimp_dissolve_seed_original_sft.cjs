'use strict';

// Original LP2 test of a 2013-era GIMP Dissolve source: GIMP's built-in,
// image-authenticated 314159265 MT19937 seed and 4096 precomputed row seeds.
// This is a single frozen hypothesis about a key consumer, NOT an original
// Cicada instruction to decrypt runes with GIMP's software-default seed.
// Usage on Windows 11 (Node.js 22): node sims/lp2_gimp_dissolve_seed_original_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));

/** @param {number} seed Original 32-bit GIMP/GLib MT19937 seed.
 * @returns {() => number} Exact unsigned MT19937 next-word function. */
function mt19937(seed) {
  const state = new Uint32Array(624);
  state[0] = seed >>> 0;
  for (let i = 1; i < state.length; i += 1) {
    const prev = state[i - 1];
    state[i] = (Math.imul(1812433253, prev ^ (prev >>> 30)) + i) >>> 0;
  }
  let index = state.length;
  return () => {
    if (index >= state.length) {
      for (let i = 0; i < state.length; i += 1) {
        const mixed = (state[i] & 0x80000000) |
          (state[(i + 1) % 624] & 0x7fffffff);
        state[i] = (state[(i + 397) % 624] ^ (mixed >>> 1) ^
          ((mixed & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      index = 0;
    }
    let v = state[index++];
    v ^= v >>> 11;
    v ^= (v << 7) & 0x9d2c5680;
    v ^= (v << 15) & 0xefc60000;
    v ^= v >>> 18;
    return v >>> 0;
  };
}

/** @param {number[]} values GP29 rune indices. @returns {number} IoC. */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v] += 1;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number} x Integer. @returns {number} Canonical GP29 index. */
function residue(x) {
  return ((x % 29) + 29) % 29;
}

const next = mt19937(314159265);
const rowSeeds = Array.from({ length: 4096 }, () => next());
assert.deepEqual(rowSeeds.slice(0, 8), [
  3721122731, 618219707, 807213306, 3144837749,
  3447982176, 3230631767, 755972506, 1398685501
]);
const little = [];
const big = [];
for (const word of rowSeeds) {
  for (let i = 0; i < 4; i += 1) little.push((word >>> (8 * i)) & 255);
  for (let i = 3; i >= 0; i -= 1) big.push((word >>> (8 * i)) & 255);
}
assert.equal(little.length, 16384);
assert.deepEqual(little.slice(0, 12),
  [171, 211, 203, 221, 187, 72, 217, 36, 250, 24, 29, 48]);

const unsolved = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(unsolved.length, 12956);
const native = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(native.length, 95);

const formats = [
  { label: '4096 words', values: rowSeeds, unit: 4294967296 },
  { label: '16384 bytes LE', values: little, unit: 256 },
  { label: '16384 bytes BE', values: big, unit: 256 }
];
console.log('Original runes:', unsolved.length, 'IoC:', ioc(unsolved));
let largest = 0;
for (const format of formats) {
  for (const reducer of ['mod', 'scaled']) {
    for (const sign of [-1, 1]) {
      /** @param {number} i Source-rune position.
       * @returns {number} Source-key GP29 integer. */
      function key(i) {
        const v = format.values[i % format.values.length];
        return reducer === 'mod'
          ? v % 29 : Math.floor(v * 29 / format.unit);
      }
      const plaintext = unsolved.map((c, i) =>
        residue(c - sign * key(i)));
      const score = ioc(plaintext);
      if (score > largest) largest = score;
      const nativePlant = native.map((p, i) =>
        residue(p + sign * key(i)));
      const recovered = nativePlant.map((c, i) =>
        residue(c - sign * key(i)));
      assert.deepEqual(recovered, native);
      const reencoded = plaintext.map((p, i) =>
        residue(p + sign * key(i)));
      assert.deepEqual(reencoded, unsolved);
      console.log(format.label, reducer, 'sign', sign,
        'IoC', score.toFixed(11),
        'first16', plaintext.slice(0, 16).map((x) =>
          corpus.translit[x]).join('.'));
    }
  }
}
assert.ok(largest < 0.035);
console.log('Largest of 12 tested whole-book IoCs:', largest);
console.log('PASS: original remains ciphertext-like, all 12 true-key plants invert.');
