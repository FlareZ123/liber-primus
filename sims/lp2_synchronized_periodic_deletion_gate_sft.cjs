'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const marks = JSON.parse(fs.readFileSync(path.join(root, 'lp2-punctuation-identity.json'), 'utf8')).events.filter(e => e.large_mark);
const tape = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);

/** @param {number[]} x @param {number} q */
function send(x,q) {
  const out = [];
  let d=0;
  for(let i=0;i<x.length;i++){
    const v=x[i];
    if((i+1)%q===0 && out.at(-1)===v) d++;
    else out.push(v);
  }
  return {out,d,phase:x.length%q};
}
/** @param {number[]} y @param {number} q @returns {bigint[]} */
function inverseCounts(y,q) {
  const m=y.length, cap=Math.floor(m/(q-1))+1;
  let a=Array(cap+1).fill(0n); a[0]=1n;
  for(let i=0;i<=m;i++){
    const b=Array(cap+1).fill(0n);
    for(let d=0;d<=cap;d++){
      const n=a[d]; if(!n) continue;
      const gated=(i+d+1)%q===0;
      if(gated && i>0 && d<cap) a[d+1]+=n;
      if(i<m && !(gated && i>0 && y[i]===y[i-1])) b[d]+=n;
    }
    if(i===m) return a;
    a=b;
  }
  throw new Error('unreachable');
}
/** @param {number} n @returns {number[][]} */
function binaryWords(n){
  if(!n)return [[]];
  return binaryWords(n-1).flatMap(x=>[[...x,0],[...x,1]]);
}
// Check the exact count for every binary input of length <= 9, q=2,3,4.
for(const q of [2,3,4]){
  const byOutput=new Map();
  for(let n=0;n<=9;n++){
    for(const x of binaryWords(n)){
      const {out,d}=send(x,q), k=out.join(',');
      if(!byOutput.has(k))byOutput.set(k,new Map());
      const h=byOutput.get(k); h.set(d,(h.get(d)??0n)+1n);
    }
  }
  for(const [key,h] of byOutput){
    const y=key===''?[]:key.split(',').map(Number), a=inverseCounts(y,q);
    for(let d=0;d<=9-y.length;d++)assert.equal(a[d]??0n,h.get(d)??0n);
  }
}
assert.equal(tape.length,12956);
assert.equal(marks.length,31);
assert.equal(marks[0].rune_offset,13);
assert.equal(marks[1].rune_offset,729);
const segments=[[0,13,13],...marks.map((e,i)=>[e.rune_offset,marks[i+1]?.rune_offset??tape.length,e.large_mark.dot_count])];
let minDel=0,total=1n,minWays=1n;
const rows=segments.map(([s,e,q])=>{
  const a=inverseCounts(tape.slice(s,e),q), d=a.findIndex(n=>n>0n);
  assert.ok(d>=0); minDel+=d; minWays*=a[d]; total*=a.reduce((x,y)=>x+y,0n);
  return {s,e,q,minDeleted:d,minWays:String(a[d]),oneDeleted:String(a[1]??0n)};
});
const y=tape.slice(13,729);
const witnesses=[13,26].map(k=>{
  const x=y.slice(); x.splice(k-1,0,y[k-2]);
  const r=send(x,13); assert.deepEqual(r.out,y);assert.equal(r.d,1);assert.equal(r.phase,2);
  return x;
});
assert.notDeepEqual(...witnesses);
assert.equal(inverseCounts(y,13)[1],15n);
assert.equal(minDel,5);
assert.equal(minWays,6833970n);
assert.equal(String(total).length,317);
console.log(JSON.stringify({rows,minDel,minWays:String(minWays),totalDigits:String(total).length,opening:{insertionPositions:[13,26],phase:2,visible:y.length,hiddenLength:y.length+1,counts:inverseCounts(y,13).slice(0,5).map(String)}},null,2));
