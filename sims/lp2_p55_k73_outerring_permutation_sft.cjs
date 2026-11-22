#!/usr/bin/env node
'use strict';

// Test direct 76-position permutation interpretations of the original p50
// outer ring as a receiver for the 76-rune original p55 page.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const alphabet=grid.alphabet.replace('f','');
const values=grid.rows.map(row=>row.map(token=>{
 const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
 assert(a>=0&&b>=0);
 return a*59+b;
}));
const ring=[];
for(let x=0;x<8;x++)ring.push(values[0][x]);
for(let y=1;y<32;y++)ring.push(values[y][7]);
for(let x=6;x>=0;x--)ring.push(values[31][x]);
for(let y=30;y>0;y--)ring.push(values[y][0]);
assert.equal(ring.length,76);
const p55=corpus.pages.find(page=>page.page===55).indices;
assert.equal(p55.length,76);
const mod=(x,n)=>((x%n)+n)%n;
const render=a=>a.map(x=>corpus.translit[x]).join('');
function gather(sequence,permutation){return permutation.map(index=>sequence[index]);}
const output=[];
for(const start of [0,73]){
 const rotated=ring.slice(start).concat(ring.slice(0,start));
 const residues=rotated.map(value=>mod(value,76));
 const residueFrequency=new Map();
 residues.forEach(value=>residueFrequency.set(value,(residueFrequency.get(value)||0)+1));
 const rank=rotated.map((value,index)=>({value,index}))
  .sort((a,b)=>a.value-b.value||a.index-b.index)
  .map(item=>item.index);
 const inverse=Array(76);
 rank.forEach((index,position)=>{inverse[index]=position;});
 output.push({
  start,
  mod76Distinct:new Set(residues).size,
  mod76CanBePermutation:new Set(residues).size===76,
  mod76DuplicateResidues:[...residueFrequency.entries()].filter(([,count])=>count>1),
  stableRankOrder:rank,
  stableRankOrderText:render(gather(p55,rank)),
  inverseRankOrder:inverse,
  inverseRankOrderText:render(gather(p55,inverse))
 });
}
assert.equal(new Set(ring).size,68);
assert.equal(new Set(ring.map(value=>mod(value,76))).size,47);
console.log(JSON.stringify({
 source:{
  ringLength:ring.length,
  p55Length:p55.length,
  distinctRingValues:new Set(ring).size,
  distinctResiduesMod76:new Set(ring.map(value=>mod(value,76))).size,
  traversal:'clockwise from top-left of original 32x8 table',
  candidateK73Start:73
 },
 tests:{
  directValueModulo76:'not a permutation because only 47 residues are distinct',
  stableAscendingRankAndInverse:output
 },
 conclusion:'The direct ring-value mod76 map is impossible as a bijection; stable rank-order and inverse permutations at starts 0 and 73 do not yield readable p55 plaintext.'
},null,2));
