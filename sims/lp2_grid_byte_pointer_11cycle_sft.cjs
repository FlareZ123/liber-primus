"use strict";
/**
 * Original LP2 32x8 grid as a self-indexing byte-to-cell functional graph.
 * Independent original clues: p32 has an 11x11 rune square; the red p39
 * triad and Ac24 mark select the double root P(24)=P'(24)=0 in GF29.
 *
 * Source hypothesis: the top-left cell (index 0) is the obvious initial
 * pointer. Decode table tokens row-major base60; value 0..255 points to
 * the next of 256 printed cells. The original path closes after 11 hops.
 *
 * All random controls preserve the exact 256-byte source multiset.
 * No plaintext, genuine cipher key, or original solution is asserted.
 *
 * Node.js 22: node sims/lp2_grid_byte_pointer_11cycle_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"),"utf8"));
const alphabet60=source.alphabet;
const alphabet59=alphabet60.replace("f","");
const tokens=source.rows;
assert.equal(tokens.length,32);
assert(tokens.every(row=>row.length===8));
assert.equal(alphabet60.length,60);
assert.equal(alphabet59.length,59);
const canonical=source.byte_rows.flat();
assert.equal(canonical.length,256);
assert(canonical.every(v=>v>=0&&v<256));

/** @param {number[]} values @returns {{prefix:number[],entry:number,transient:number,cycle:number}} */
function orbitFromZero(values){
  assert.equal(values.length,256);
  const positions=new Int16Array(256).fill(-1);
  const prefix=[];
  let current=0;
  while(positions[current]<0){
    positions[current]=prefix.length;
    prefix.push(current);
    current=values[current];
    assert.ok(prefix.length<=256);
  }
  return {prefix,entry:current,transient:positions[current],
    cycle:prefix.length-positions[current]};
}
/** @param {number[]} values @returns {{root:number,derivative:number}} */
function jet24(values){
  let root=0,derivative=0;
  for(const byte of values){
    derivative=(24*derivative+root)%29;
    root=(24*root+byte)%29;
  }
  return {root,derivative};
}
/** @param {number[]} values @returns {{cycle:number[],basin:number}[]} */
function components(values){
  const belong=new Int16Array(256).fill(-1);
  const cycles=[];
  for(let start=0;start<256;start++){
    if(belong[start]>=0)continue;
    const positions=new Map(),walk=[];
    let v=start;
    while(belong[v]<0&&!positions.has(v)){
      positions.set(v,walk.length);
      walk.push(v);
      v=values[v];
    }
    let target;
    if(positions.has(v)){
      target=cycles.length;
      cycles.push(walk.slice(positions.get(v)));
    } else target=belong[v];
    for(const item of walk)belong[item]=target;
  }
  return cycles.map((cycle,i)=>({
    cycle,basin:Array.from(belong).filter(x=>x===i).length,
  })).sort((a,b)=>b.basin-a.basin);
}
const interpretations=[];
for(const [radix,alphabet] of [[60,alphabet60],[59,alphabet59]]){
  const matrix=tokens.map(row=>row.map(pair=>
    radix*alphabet.indexOf(pair[0])+alphabet.indexOf(pair[1])));
  assert(matrix.every(row=>row.every(v=>v>=0&&v<=255)));
  for(const order of ["row","column"]){
    const forward=order==="row"?matrix.flat():
      Array.from({length:8},(_,column)=>matrix.map(row=>row[column])).flat();
    for(const direction of ["forward","reverse"]){
      const values=direction==="forward"?forward:[...forward].reverse();
      const orbit=orbitFromZero(values);
      interpretations.push({
        radix,order,direction,transient:orbit.transient,
        cycle:orbit.cycle,entry:orbit.entry,
        jet:jet24(values),
      });
    }
  }
}
const observed=orbitFromZero(canonical);
assert.deepEqual(observed.prefix,
  [0,203,68,199,47,76,114,197,115,247,192]);
assert.deepEqual([observed.entry,observed.transient,observed.cycle],[0,0,11]);
const components60=components(canonical);
assert.deepEqual(components60,[
  {cycle:[0,203,68,199,47,76,114,197,115,247,192],basin:252},
  {cycle:[249,158],basin:4},
]);
assert.deepEqual(jet24(canonical),{root:0,derivative:0});
assert.equal(interpretations.length,8);
assert.equal(interpretations.filter(x=>x.transient===0&&x.cycle===11).length,1);
assert.deepEqual(
  interpretations.find(x=>x.radix===59&&x.order==="row"&&x.direction==="forward"),
  {radix:59,order:"row",direction:"forward",transient:25,
   cycle:1,entry:189,jet:{root:20,derivative:12}}
);

// Conditional multiset-permutation null. Freeze these two separate source
// events before looking at any shuffled result: root24+derivative0 and
// first-index11-cycle. The experiment does not correct for other hypotheses
// explored by the research project.
let state=0x24a11b7d;
/** @returns {number} */
function random32(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
let countCycle11=0,countRoot24=0,countJoint=0;
const samples=300000;
for(let trial=0;trial<samples;trial++){
  const permuted=canonical.slice();
  for(let i=255;i>0;i--){
    const j=random32()%(i+1);
    [permuted[i],permuted[j]]=[permuted[j],permuted[i]];
  }
  const jet=jet24(permuted);
  // Stop at the first repeated pointer, without computing unrelated basins.
  const visit=new Int16Array(256).fill(-1);
  let current=0,length=0;
  while(visit[current]<0){
    visit[current]=length++;
    current=permuted[current];
  }
  const cycle11=visit[current]===0&&length===11;
  const doubleRoot=jet.root===0&&jet.derivative===0;
  if(cycle11)countCycle11++;
  if(doubleRoot)countRoot24++;
  if(cycle11&&doubleRoot)countJoint++;
}
assert.deepEqual([countCycle11,countRoot24,countJoint],[1900,352,2]);

console.log(JSON.stringify({
  originalOrbit:observed,
  originalGraph:components60,
  originalJet:jet24(canonical),
  codecComparators:interpretations,
  multisetShuffle:{seed:"0x24a11b7d",samples,countCycle11,
    countRoot24,countJoint},
  status:"Exact source traversal, conditional rarity; no decryption",
},null,2));
