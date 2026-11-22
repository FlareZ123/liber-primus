/**
 * Reproduce exhaustive unknown-state recovery for legacy carry-bearing LCGs
 * against the original LP2 32x8 base60 byte table (256 bytes).
 * Uses only source-visible row, column, serpentine traversals.
 * Requires Node.js 22. Run from repository root. Read-only.
 * @typedef {{name:string,a:number,c:number}} Generator
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const source = JSON.parse(fs.readFileSync(
  path.join('resources','liber-primus','base60-grid.json'), 'utf8'));
/** @type {number[][]} */
const rows = source.byte_rows;
assert.equal(rows.length, 32);
assert(rows.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x < 256)));
const native = rows.flat();
assert.equal(createHash('sha256').update(Buffer.from(native)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} kind @returns {number[]} */
function traversal(kind) {
  const out = [];
  for (let i = 0; i < 256; i++) {
    const row = kind === 1 ? i % 32 : Math.floor(i / 8);
    let col = kind === 1 ? Math.floor(i / 32) : i % 8;
    if (kind === 2 && row % 2) col = 7 - col;
    out.push(rows[row][col]);
  }
  return out;
}

/** @param {number} x @returns {number} */
function inverseOdd(x) {
  let inv = x >>> 0;
  for (let i = 0; i < 5; i++) inv = Math.imul(inv, 2 - Math.imul(x, inv)) >>> 0;
  assert.equal(Math.imul(x, inv) >>> 0, 1);
  return inv;
}

/**
 * Treat printed first byte as bits [shift..shift+7] of the state after
 * the first update. Enumerate all 2^24 hidden state bits, with no key assumptions.
 * @param {number[]} bytes
 * @param {Generator} g
 * @param {number} shift
 * @returns {Array<{seed:number,post:number,matchCount:number}>}
 */
function invert(bytes, g, shift) {
  const lowMask = (2 ** shift) - 1;
  const inv = inverseOdd(g.a);
  const hits = [];
  for (let free = 0; free < 0x1000000; free++) {
    const post = ((free & lowMask) | (bytes[0] << shift)
      | ((free >>> shift) << (shift + 8))) >>> 0;
    let state = post;
    let at = 1;
    for (; at < 16; at++) {
      state = (Math.imul(g.a, state) + g.c) >>> 0;
      if (((state >>> shift) & 255) !== bytes[at]) break;
    }
    if (at === 16) {
      const seed = Math.imul(inv, (post - g.c) >>> 0) >>> 0;
      state = seed;
      let matchCount = 0;
      for (const b of bytes) {
        state = (Math.imul(g.a, state) + g.c) >>> 0;
        if (((state >>> shift) & 255) === b) matchCount++;
      }
      hits.push({ seed, post, matchCount });
    }
  }
  return hits;
}

/** @type {Generator[]} */
const machines = [
  { name:'MSVC-rand', a:214013, c:2531011 },
  { name:'ANSI-LCG', a:1103515245, c:12345 },
  { name:'Numerical-Recipes-LCG', a:1664525, c:1013904223 }
];

// Positive control: exactly invert 16 bytes, then recover 256 planted bytes.
const plant = [];
let plantState = 0x3301;
for (let i = 0; i < 256; i++) {
  plantState = (Math.imul(machines[0].a, plantState) + machines[0].c) >>> 0;
  plant.push((plantState >>> 23) & 255);
}
const recoveredPlant = invert(plant, machines[0], 23);
assert.equal(recoveredPlant.length, 2);
assert(recoveredPlant.every(x => (x.seed & 0x7fffffff) === 0x3301 && x.matchCount === 256));
console.log('PLANTED MSVC state recovered modulo 2^31; both equivalent states reproduce 256/256 bytes');

let originalSurvivors = 0;
for (let order = 0; order < 3; order++) {
  const bytes = traversal(order);
  for (const generator of machines) for (const shift of [16, 23, 24]) {
    const found = invert(bytes, generator, shift);
    originalSurvivors += found.length;
    if (found.length) console.log(JSON.stringify({order, generator:generator.name, shift, found}));
  }
  console.log('SOURCE traversal complete', order);
}
console.log(JSON.stringify({
  source:'LP2 printed base60 table', bytes:256, traversals:3,
  generators:machines.map(x => x.name), lanes:[16,23,24],
  enumeratedStatesPerModel:16777216, originalSurvivors,
  plantedControl:true
},null,2));
assert.equal(originalSurvivors, 0);
