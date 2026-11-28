'use strict';
// Original LP2 p49-51 base59 pointer sink -> mirror -> eight-step DH circuit.
// Standalone read-only Node 22 SFT; evidence is structural, NOT plaintext.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const alpha59 = grid.alphabet.replace('f', '');
assert.equal(alpha59.length, 59);
assert(!tokens.some(t => t[1] === 'f'));
const v59 = tokens.map(t => 59 * alpha59.indexOf(t[0]) + alpha59.indexOf(t[1]));
const v60 = tokens.map(t => 60 * grid.alphabet.indexOf(t[0]) + grid.alphabet.indexOf(t[1]));
assert(v59.every(v => v >= 0 && v <= 255));
assert.deepEqual(v60, grid.bytes);
assert.equal(tokens[189], '3C');
assert.equal(v59[189], 189);
assert.equal(tokens[186], '0J');
assert.equal(v59[186], 19);
assert.equal(v60[186], 19);
function allReach189(v) {
  if (v[189] !== 189) return false;
  const state = new Uint8Array(256);
  state[189] = 2;
  for (let i = 0; i < 256; i++) {
    if (state[i] === 2) continue;
    const stack = [];
    let j = i;
    while (state[j] === 0) {
      state[j] = 1;
      stack.push(j);
      j = v[j];
    }
    if (state[j] === 1) return false;
    for (const node of stack) state[node] = 2;
  }
  return true;
}
function returnPath(v, start = 186) {
  let j = start;
  const seen = new Set();
  const nodes = [j];
  while (j !== 189 && !seen.has(j)) {
    seen.add(j);
    j = v[j];
    nodes.push(j);
  }
  return j === 189 ? nodes : null;
}
assert(allReach189(v59));
assert(!allReach189(v60));
const expectedPath = [186,19,33,112,72,161,214,247,189];
assert.deepEqual(returnPath(v59), expectedPath);
assert.equal(expectedPath.length - 1, 8);
assert.equal(23 * 8 + 5, 189);
assert.equal(23 * 8 + (7 - 5), 186);
let pow = (x,e,p) => {let y=1;while(e--) y=y*x%p;return y;};
assert.equal(pow(5,6,23),8);
assert.equal(pow(5,15,23),19);
assert.equal(pow(19,6,23),2);
let seed = 20261128;
function rand() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
function control(kind,trials) {
  const perm = Array.from({length:256},(_,i)=>i);
  const counts = [
    {radix:59,self:0,sink:0,depth8:0,B19:0,joint:0},
    {radix:60,self:0,sink:0,depth8:0,B19:0,joint:0}
  ];
  for(let k=0;k<trials;k++) {
    for(let i=0;i<256;i++)perm[i]=i;
    if(kind==='global') {
      for(let i=255;i>0;i--) {
        const j=rand()%(i+1); [perm[i],perm[j]]=[perm[j],perm[i]];
      }
    } else {
      for(let row=0;row<32;row++)for(let i=7;i>0;i--) {
        const u=row*8+i, w=row*8+(rand()%(i+1));
        [perm[u],perm[w]]=[perm[w],perm[u]];
      }
    }
    for(let z=0;z<2;z++) {
      const source=z===0?v59:v60;
      if(source[perm[189]]!==189)continue;
      const c=counts[z];c.self++;
      const v=new Uint8Array(256);
      for(let i=0;i<256;i++)v[i]=source[perm[i]];
      if(!allReach189(v))continue;
      c.sink++;
      const route=returnPath(v);
      const d8=route!==null && route.length-1===8;
      const B19=v[186]===19;
      if(d8)c.depth8++;
      if(B19)c.B19++;
      if(d8&&B19)c.joint++;
    }
  }
  return {kind,trials,counts};
}
const controls=[control('global',400000),control('row',400000)];
assert.deepEqual(controls[0].counts.map(x=>[x.self,x.sink,x.depth8,x.B19,x.joint]),
  [[6365,65,1,0,0],[3137,10,1,0,0]]);
assert.deepEqual(controls[1].counts.map(x=>[x.self,x.sink,x.depth8,x.B19,x.joint]),
  [[50090,683,27,95,4],[0,0,0,0,0]]);
console.log(JSON.stringify({source:{sink:189,mirror:186,path:expectedPath,A:8,B:19,K:2},
  controls},null,2));
