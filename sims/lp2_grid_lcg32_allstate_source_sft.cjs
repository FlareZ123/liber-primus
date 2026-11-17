'use strict';

/**
 * Single-file test of six fixed 32-bit LCGs against the original LP2
 * 32x8 table in both decimal interpretations and twelve natural traversals.
 * Covers all initial states by exact low-bit equivalence classes.
 * Node 22, CommonJS, read-only and deterministic.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources',
  'liber-primus','base60-grid.json'),'utf8'));
const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f','');
assert.equal(source.rows.length,32);
assert.ok(source.rows.every(r=>r.length===8));

/** @param {string} alphabet @returns {number[][]} */
function decode(alphabet) {
  return source.rows.map(row=>row.map(token=>{
    assert.equal(token.length,2);
    const a=alphabet.indexOf(token[0]), b=alphabet.indexOf(token[1]);
    assert.ok(a>=0 && b>=0);
    const n=a*alphabet.length+b;
    assert.ok(n<=255);
    return n;
  }));
}
const base60 = decode(alpha60);
assert.deepEqual(base60,source.byte_rows);
const algorithms = [
  ['ANSI_C',1103515245,12345],
  ['MSVC_C',214013,2531011],
  ['Borland_C',22695477,1],
  ['NumericalRecipes',1664525,1013904223],
  ['Pascal',134775813,1],
  ['KnuthMMIX32',69069,1]
];

/** @param {number} t @param {number} l @param {number} b @param {number} r
 * @returns {Array<[number,number]>} */
function perimeter(t,l,b,r) {
  const cells=[];
  for(let c=l;c<=r;c++)cells.push([t,c]);
  for(let i=t+1;i<=b;i++)cells.push([i,r]);
  for(let c=r-1;c>=l;c--)cells.push([b,c]);
  for(let i=b-1;i>t;i--)cells.push([i,l]);
  return cells;
}

/** @returns {Array<{name:string,cells:Array<[number,number]>}>} */
function layouts() {
  const row=[],rowSnake=[],col=[],colSnake=[],out=[];
  for(let r=0;r<32;r++)for(let c=0;c<8;c++){
    row.push([r,c]);rowSnake.push([r,r%2?7-c:c]);
  }
  for(let c=0;c<8;c++)for(let r=0;r<32;r++){
    col.push([r,c]);colSnake.push([c%2?31-r:r,c]);
  }
  out.push({name:'row-major',cells:row},{name:'row-snake',cells:rowSnake},
    {name:'column-major',cells:col},{name:'column-snake',cells:colSnake});
  for(const clockwise of [true,false])for(let corner=0;corner<4;corner++){
    const cells=[];
    for(let k=0;k<4;k++){
      const t=k,l=k,b=31-k,r=7-k,ring=perimeter(t,l,b,r);
      const target=[[t,l],[t,r],[b,r],[b,l]][corner];
      const start=ring.findIndex(([a,z])=>a===target[0]&&z===target[1]);
      assert.ok(start>=0);
      for(let j=0;j<ring.length;j++)
        cells.push(ring[(start+(clockwise?j:ring.length-j))%ring.length]);
    }
    out.push({name:'spiral-'+(clockwise?'cw':'ccw')+'-corner'+corner,cells});
  }
  for(const {cells} of out){
    assert.equal(cells.length,256);
    assert.equal(new Set(cells.map(([r,c])=>8*r+c)).size,256);
  }
  assert.equal(out.length,12);
  return out;
}

/** @param {number[]} bytes @param {number} a @param {number} b @param {number} shift
 * @returns {{prefix:number,eight:number,full:number,seed:number|null}} */
function scan(bytes,a,b,shift) {
  // Only the low shift+8 state bits influence a fixed shifted byte.
  // The first byte determines eight bits, leaving 2^shift states to check;
  // all 2^(24-shift) high-bit completions are output-equivalent.
  let prefix=0,eight=0,full=0,seed=null;
  const states=2 ** shift;
  for(let lower=0;lower<states;lower++){
    let state=((bytes[0]<<shift)|lower)>>>0;
    const start=state;
    let i=1;
    for(;i<bytes.length;i++){
      state=(Math.imul(a,state)+b)>>>0;
      if(((state>>>shift)&255)!==bytes[i])break;
    }
    if(i>prefix)prefix=i;
    if(i>=8)eight++;
    if(i===bytes.length){full++;seed=start;}
  }
  return {prefix,eight,full,seed};
}

/** @param {number} a @param {number} b @param {number} shift @param {number} initial
 * @returns {number[]} */
function plant(a,b,shift,initial){
  let state=initial>>>0;
  const out=[];
  for(let i=0;i<256;i++){
    out.push((state>>>shift)&255);
    state=(Math.imul(a,state)+b)>>>0;
  }
  return out;
}
for(const [a,b,shift,seed] of [
  [1103515245,12345,16,0x81234567],
  [214013,2531011,24,0xabcdef01]
]){
  const result=scan(plant(a,b,shift,seed),a,b,shift);
  assert.equal(result.full,1);
  const mask=shift===24?0xffffffff:(2 ** (shift+8))-1;
  assert.equal(result.seed&mask,seed&mask);
  assert.equal(result.prefix,256);
  console.log('PLANT_PASS shift='+shift+' seed='+seed.toString(16));
}

let tested=0,longest=0,eight=0,full=0;
for(const [base,rows] of [[60,base60],[59,decode(alpha59)]]){
  for(const {name,cells} of layouts()){
    const bytes=cells.map(([r,c])=>rows[r][c]);
    let best=0,seen8=0,complete=0;
    for(const [algorithm,a,b] of algorithms)for(const shift of [0,8,16,24]){
      const res=scan(bytes,a,b,shift);
      tested++;best=Math.max(best,res.prefix);
      seen8+=res.eight;complete+=res.full;
      if(res.full)console.log('RECOVERED_SOURCE_GENERATOR',base,name,algorithm,shift,res.seed);
    }
    longest=Math.max(longest,best);eight+=seen8;full+=complete;
    console.log('SOURCE base'+base,name,'max-prefix',best,
      'eight-byte-state-classes',seen8,'complete256',complete);
  }
}
assert.equal(tested,576);
assert.equal(eight,0);
assert.equal(full,0);
assert.equal(longest,4);
console.log('PASS: 576 source-conditioned LCG variants, all 32-bit seeds covered, max prefix 4, no key');
