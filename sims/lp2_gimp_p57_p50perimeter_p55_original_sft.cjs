'use strict';
/**
 * Legacy GIMP Dissolve fixed-seed p57 -> p50 32x8 outer-ring -> original p55.
 * Single source-frozen GP29 additive receiver; no external packages or writes.
 * Node.js 22 CommonJS. The software seed is not an authenticated cipher key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} seed @returns {() => number} */
function mt(seed) {
  const a = new Uint32Array(624);
  a[0] = seed >>> 0;
  for (let i = 1; i < 624; i++) {
    const v = a[i-1] ^ (a[i-1] >>> 30);
    a[i] = (Math.imul(1812433253, v) + i) >>> 0;
  }
  let pos = 624;
  return () => {
    if (pos === 624) {
      for (let i = 0; i < 624; i++) {
        const y = (a[i] & 0x80000000) | (a[(i+1)%624] & 0x7fffffff);
        a[i] = (a[(i+397)%624] ^ (y>>>1) ^ ((y&1) ? 0x9908b0df : 0)) >>> 0;
      }
      pos = 0;
    }
    let y = a[pos++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };
}
const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const original = data.pages.find(p => p.page === 55).indices;
assert.equal(original.length, 76);
assert.equal(data.translit.length, 29);
const source = mt(314159265);
const rowSeeds = Array.from({length:4096}, () => source());
assert.deepEqual(rowSeeds.slice(0,12),
  [3721122731,618219707,807213306,3144837749,3447982176,3230631767,
   755972506,1398685501,3196876378,1337812403,909895126,1889049173]);

/** GLib g_rand_int_range(0,255) agrees with raw%255 at every frozen control.
 * @param {number} x @param {number} y
 */
function threshold(x,y) {
  const next = mt(rowSeeds[((y%4096)+4096)%4096]);
  for (let i=0;i<x;i++) next();
  return next()%255;
}
const dots=[[53,250],[44,256],[41,265],[57,269]];
assert.deepEqual(dots.map(([x,y])=>threshold(x+4,y-9)),[0,0,0,0]);
assert.deepEqual(Array.from({length:11},(_,x)=>threshold(x,241)),
  [172,35,200,213,198,175,232,174,177,222,176]);

const ring=[
  ...Array.from({length:8},(_,x)=>[x,0]),
  ...Array.from({length:31},(_,i)=>[7,i+1]),
  ...Array.from({length:7},(_,i)=>[6-i,31]),
  ...Array.from({length:30},(_,i)=>[0,30-i])
];
assert.equal(ring.length,76);
assert.equal(new Set(ring.map(([x,y])=>String(x)+','+String(y))).size,76);
const raw = ring.map(([x,y])=>threshold(x+4,y-9));
assert.deepEqual(raw.slice(0,20),
 [254,36,200,76,154,130,146,88,174,7,160,38,185,161,159,199,235,163,67,46]);
const key=raw.map(n=>n%29);

/** @param {number[]} runes */
function ioc(runes) {
 const counts=new Uint32Array(29);
 for(const n of runes) counts[n]++;
 return Array.from(counts).reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}
const variants=[-1,+1].map(sign=>{
 const p=original.map((v,i)=>((v+sign*key[i])%29+29)%29);
 assert.deepEqual(p.map((v,i)=>((v-sign*key[i])%29+29)%29),original);
 return {sign, GP29_IoC:ioc(p),decoded:p.map(v=>data.translit[v]).join('')};
});
console.log(JSON.stringify({
 seed:314159265, four_dot_thresholds:[0,0,0,0], perimeter:76,
 original_GP29_IoC:ioc(original), variants
},null,2));