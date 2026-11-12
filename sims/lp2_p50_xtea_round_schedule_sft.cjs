'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DELTA = 0x9e3779b9;
const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
assert.equal(json.rows.length, 32);
assert.equal(json.alphabet.length, 60);
const rows = json.rows.map(row => {
  assert.equal(row.length, 8);
  return row.map(token => {
    assert.equal(token.length, 2);
    const a = json.alphabet.indexOf(token[0]), b = json.alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const v = 60 * a + b;
    assert(v >= 0 && v <= 255);
    return v;
  });
});
const bytes = Buffer.from(rows.flat());
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number[][]} pairs */
function gate(pairs) {
  const first = pairs.map(([a], i) => (a - Math.imul(i, DELTA)) >>> 0);
  const second = pairs.map(([, b], i) => (b - Math.imul(i + 1, DELTA)) >>> 0);
  let failures = 0;
  for (let i = 4; i < 32; i++) if (first[i] !== first[i - 4]) failures++;
  return { failures, secondDistinct: new Set(second).size };
}

/** @param {number[]} bytes4 @param {boolean} little */
function uint32(bytes4, little) {
  const x = little ? [...bytes4].reverse() : bytes4;
  return ((x[0] << 24) | (x[1] << 16) | (x[2] << 8) | x[3]) >>> 0;
}
const key = [0x13579bdf, 0x2468ace0, 0x11223344, 0x89abcdef], init = 0x6a09e667;
const plant = Array.from({length:32}, (_,i) => {
  const s = (init + Math.imul(i, DELTA)) >>> 0, t = (init + Math.imul(i + 1, DELTA)) >>> 0;
  return [(s + key[s & 3]) >>> 0, (t + key[(t >>> 11) & 3]) >>> 0];
});
assert.deepEqual(gate(plant), {failures:0,secondDistinct:4});
const damaged = plant.map(pair => [...pair]); damaged[4][0] ^= 1;
assert(gate(damaged).failures > 0);

const results = [];
for (const layout of ['row-major', 'column-major']) {
  const flat = layout === 'row-major' ? rows.flat() : Array.from({length:8}, (_,c) => rows.map(row => row[c])).flat();
  for (const reverse of [false,true]) {
    const blocks = Array.from({length:32}, (_,i) => flat.slice(i*8, i*8+8));
    if (reverse) blocks.reverse();
    for (const little of [false,true]) for (const swap of [false,true]) {
      const pairs = blocks.map(block => {
        const a = uint32(block.slice(0,4), little), b = uint32(block.slice(4,8), little);
        return swap ? [b,a] : [a,b];
      });
      const g = gate(pairs);
      assert(g.failures > 0 || g.secondDistinct > 4);
      results.push({layout, reverse, little, swap, ...g});
    }
  }
}
assert.equal(results.length,16);
console.log(JSON.stringify({originalBytes:256,originalOrientations:16,failures:[Math.min(...results.map(x=>x.failures)),Math.max(...results.map(x=>x.failures))],secondDistinct:[Math.min(...results.map(x=>x.secondDistinct)),Math.max(...results.map(x=>x.secondDistinct))],positive:gate(plant),damaged:gate(damaged),all:results},null,2));
