#!/usr/bin/env node
"use strict";
/**
 * LP2 physical page 8 as a 255-node breadth-first binary tree.
 * A secret deterministic upward map H_depth(left,right) is possible only
 * if every equal ordered sibling pair at a given depth has equal parents.
 * Node22 read-only: node sims/lp2_p8_255heap_allkey_merkle_original_sft.cjs
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const c=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const p8=c.pages.find(p=>p.page===8).indices;
const red=ink.pages.find(p=>p.page===8).red_spans;
assert.equal(p8.length,255);assert.equal(red.length,1);
assert.equal(red[0].start,0);assert.equal(red[0].length,12);
assert.equal(p8.slice(0,12).map(v=>c.runes[v]).join(""),red[0].runes);
const depth=i=>Math.floor(Math.log2(i+1));
function check(v) {
  assert.equal(v.length,255);
  const all=new Map(),levels=new Map(),global=[],within=[];
  let gRepeat=0,lRepeat=0,sum=0,product=0;
  for(let i=0;i<127;i++) {
    const a=v[2*i+1],b=v[2*i+2],parent=v[i],d=depth(i);
    const k=a+","+b,prior=all.get(k),lp=levels.get(d+":"+k);
    const obs={i,depth:d,parent,children:[a,b]};
    if(prior){gRepeat++;if(prior.parent!==parent)global.push({first:prior.i,second:i,depths:[prior.depth,d],children:[a,b],parents:[prior.parent,parent]});}
    else all.set(k,obs);
    if(lp){lRepeat++;if(lp.parent!==parent)within.push({depth:d,nodes:[lp.i,i],children:[a,b],parents:[lp.parent,parent]});}
    else levels.set(d+":"+k,obs);
    if(parent===(a+b)%29)sum++;
    if(parent===(a*b)%29)product++;
  }
  return {globalRepeated:gRepeat,globalConflicts:global,withinDepthRepeated:lRepeat,withinDepthConflicts:within,sumMatches:sum,productMatches:product};
}
const original=check(p8);
assert.equal(original.globalRepeated,8);
assert.equal(original.globalConflicts.length,8);
assert.equal(original.withinDepthRepeated,3);
assert.deepEqual(original.withinDepthConflicts,[
 {depth:5,nodes:[45,59],children:[4,14],parents:[23,17]},
 {depth:6,nodes:[73,81],children:[18,16],parents:[4,20]},
 {depth:6,nodes:[77,124],children:[3,10],parents:[4,19]}
]);
assert.equal(original.sumMatches,3);assert.equal(original.productMatches,3);
// Genuine solved p57 native GP leaves form an independent positive. Unlike
// a fitted table, the same declared parent rule must hold for ALL nodes.
const p57=c.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const planted=Array(255).fill(0);
for(let i=0;i<128;i++) planted[127+i]=p57[i%64];
const H=(l,r,d)=>(l+2*r+7+d)%29;
for(let i=126;i>=0;i--) planted[i]=H(planted[2*i+1],planted[2*i+2],depth(i));
for(let i=0;i<127;i++)assert.equal(planted[i],H(planted[2*i+1],planted[2*i+2],depth(i)));
const good=check(planted);
assert.ok(good.withinDepthRepeated>0);
assert.equal(good.withinDepthConflicts.length,0);
assert.deepEqual([planted[127],planted[128]],[planted[191],planted[192]]);
const mutant=planted.slice();mutant[95]=(mutant[95]+1)%29;
assert.ok(check(mutant).withinDepthConflicts.some(o=>o.nodes.includes(63)&&o.nodes.includes(95)));
console.log(JSON.stringify({originalPage:8,sourceRunes:255,parentChildTriples:127,original,
 nativeGPPositive:{leafSymbols:128,derivedParents:127,repeatedPairs:good.withinDepthRepeated,conflicts:0,mutationCaught:true},
 conclusion:"No depth-private fixed deterministic upward H_d(left,right) under this original exact heap. No key or plaintext."},null,2));
console.log("PASS original all-key source and native-GP positive");
