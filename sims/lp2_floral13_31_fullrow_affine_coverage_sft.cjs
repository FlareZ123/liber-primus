'use strict';
// Exact original floral 13/31 dot-mask 32-row allocation gate; Node.js 22.
// No ciphertext inverse or creator-authenticated cipher/key is claimed.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { bytes } = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
assert.equal(bytes.length, 256);
assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number} a @param {number} b @param {number} s @param {number} t */
function pairs(a, b, s, t) {
  return Array.from({length: 16}, (_, i) => [(a + s*i)%32, (b + t*i)%32]);
}
/** @param {number[][]} x */
function covers(x) { return new Set(x.flat()).size === 32; }
/** @param {number} a @param {number} b */
function slopes(a, b) {
  const out = [];
  for (let s=0; s<32; s++) for (let t=0; t<32; t++)
    if (covers(pairs(a,b,s,t))) out.push([s,t]);
  return out;
}
// Original image left 01101, right 11111. Read origin/direction not fixed.
const bits=[0,1,1,0,1], readings=new Set();
for (const d of [1,-1]) for(let i=0;i<5;i++) {
  const v=Array.from({length:5},(_,j)=>bits[((i+d*j)%5+5)%5]).join('');
  readings.add(parseInt(v,2));
}
const values=[...readings].sort((a,b)=>a-b);
assert.deepEqual(values,[11,13,21,22,26]);
const counts={};
for (const a of values) {
  const candidates=slopes(a,31);
  counts[a]=candidates.length;
  assert.equal(counts[a],a%2===0?65:0);
  if (a%2===0) {
    assert.ok(candidates.some(([s,t])=>s===2 && t===2));
    assert.equal(candidates.filter(([s,t])=>s%4===2 && t%4===2).length,64);
    const layout=pairs(a,31,2,2);
    assert.ok(covers(layout));
    const cells=layout.flatMap(([l,r])=>[
      ...Array.from({length:8},(_,i)=>8*l+i),
      ...Array.from({length:8},(_,i)=>8*r+i)]);
    assert.equal(new Set(cells).size,256);
    const key=Buffer.from([...bytes.slice(layout[0][0]*8,layout[0][0]*8+8),
      ...bytes.slice(layout[0][1]*8,layout[0][1]*8+8)]);
    console.log('conditional',JSON.stringify({left:a,right:31,
      rowPairs:layout,first16ByteRecord:key.toString('hex')}));
  }
}
assert.equal(slopes(13,31).length,0);
assert.equal(slopes(12,30).length,0); // Same one-based conversion.

// A source-shaped mirror: the two five-bit masks define a reflection
// r -> (left+right-r) mod32. An odd mask sum pairs all 32 rows with
// no fixed point, whereas an even sum leaves two self-paired rows.
/** @param {number} left @param {number} right */
function reflectionPairs(left, right) {
  const used = new Set();
  const pairs = [];
  for (let i = 0; i < 32; i++) {
    if (used.has(i)) continue;
    const partner = (left + right - i + 64) % 32;
    used.add(i); used.add(partner);
    pairs.push([i, partner]);
  }
  return pairs;
}
assert.deepEqual(reflectionPairs(13, 31).filter(([x,y]) => x === y),
  [[6,6],[22,22]]);
assert.equal(reflectionPairs(13, 31).length, 17);
assert.equal(reflectionPairs(22, 31).length, 16);
assert.ok(reflectionPairs(22, 31).every(([x,y]) => x !== y));
assert.equal(reflectionPairs(26, 31).length, 16);

// The exceptional non-even stride among the 65 complete covers is
// exactly the two seeds' own gap d=(right-left), counter-rotating
// around the same mask-sum reflection r + partner = left+right mod32.
for (const left of [22,26]) {
  const gap = 31 - left;
  const mirror = [32 - gap, gap];
  const valid = slopes(left,31);
  assert.deepEqual(valid.filter(([s,t]) => s % 4 !== 2 || t % 4 !== 2),
    [mirror]);
  const layout = pairs(left,31,...mirror);
  assert.equal(new Set(layout.flat()).size, 32);
  assert.ok(layout.every(([l,r]) => (l+r)%32 === (left+31)%32));
}
console.log('PASS',JSON.stringify({original13_31FixedStride32rowCover:0,
  candidateLeftCyclicReadings:values,all1024StridePairCounts:counts,
  interpretation:'a 32-row cover requires an unselected left-bit origin and a cipher/codec'}));
