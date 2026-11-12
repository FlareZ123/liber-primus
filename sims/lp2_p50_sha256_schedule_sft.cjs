'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));
const alphabet = source.alphabet;
assert.equal(alphabet.length, 60);
assert.equal(source.rows.length, 32);
const rows = source.rows.map((row) => {
  assert.equal(row.length, 8);
  return row.map((token) => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const v = hi * 60 + lo;
    assert(v >= 0 && v < 256);
    return v;
  });
});
const hash = crypto.createHash('sha256').update(Buffer.from(rows.flat())).digest('hex');
assert.equal(hash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} x @param {number} n @returns {number} */
function ror(x, n) { return (x >>> n) | (x << (32 - n)); }
/** @param {number} x @returns {number} */
function small0(x) { return (ror(x, 7) ^ ror(x, 18) ^ (x >>> 3)) >>> 0; }
/** @param {number} x @returns {number} */
function small1(x) { return (ror(x, 17) ^ ror(x, 19) ^ (x >>> 10)) >>> 0; }
/** @param {number[]} w @returns {number[]} */
function expand(w) {
  assert.equal(w.length, 16);
  const result = [...w];
  for (let t = 16; t < 64; t++) {
    result.push((small1(result[t - 2]) + result[t - 7] + small0(result[t - 15]) + result[t - 16]) >>> 0);
  }
  return result;
}
/** @param {number[]} w @returns {{errors:number,firstMismatch:number,matching:number}} */
function gate(w) {
  assert.equal(w.length, 64);
  const e = expand(w.slice(0, 16));
  const bad = [];
  for (let i = 16; i < 64; i++) if (e[i] !== w[i]) bad.push(i);
  return {errors:bad.length,firstMismatch:bad[0] ?? -1,matching:48-bad.length};
}
/** @param {number[]} block @param {boolean} little @returns {number} */
function word(block, little) {
  const x = little ? [...block].reverse() : block;
  return ((x[0] << 24) | (x[1] << 16) | (x[2] << 8) | x[3]) >>> 0;
}

const initial = Array.from({length:16}, (_,i) => Math.imul(i * 0x10101 + 1234, 0x9e3779b9) >>> 0);
const plant = expand(initial);
assert.deepEqual(gate(plant), {errors:0,firstMismatch:-1,matching:48});
const damage = [...plant];
damage[17] ^= 1;
assert.equal(gate(damage).errors > 0, true);
const results=[];
for (const layout of ['row-major','column-major']) {
  const flat = layout === 'row-major' ? rows.flat() : Array.from({length:8}, (_,c) => rows.map((row) => row[c])).flat();
  for (const reverse of [false,true]) {
    const blocks = Array.from({length:64}, (_,i) => flat.slice(i*4,i*4+4));
    if (reverse) blocks.reverse();
    for (const little of [false,true]) for (const swap of [false,true]) {
      let w = blocks.map((b) => word(b,little));
      if (swap) w = w.map((_,i) => w[i ^ 1]);
      results.push({layout,reverse,little,swap,...gate(w)});
    }
  }
}
assert.equal(results.length,16);
assert(results.every((r) => r.errors>0));
console.log(JSON.stringify({originalHash:hash,sourceBytes:256,orientations:16,minFailures:Math.min(...results.map(r=>r.errors)),maxFailures:Math.max(...results.map(r=>r.errors)),realSHA256ScheduleControl:gate(plant),oneBitDamage:gate(damage),orientationsDetail:results},null,2));
