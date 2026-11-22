"use strict";
/**
 * Fixed 2016 "lies" word -> LP2 numeric cell -> original byte-pointer graph.
 * The exact walk is a source fact; it is not a decipherment.
 * Run: node sims/lp2_2016_lies_pointer_route_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.match(signed,/The path lies empty;/);
assert.equal(corpus.pages.length,58);
assert.deepEqual(grid.pages.map(p=>p.page),[49,50,51]);
assert.equal(grid.bytes.length,256);
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word @returns {number} */
function gpPrimeSum(word) {
  const w=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  let sum=0;
  for(let i=0;i<w.length;){
    const item=alphabet.find(x=>w.startsWith(x.token,i));
    assert.ok(item);
    sum+=corpus.prime[item.index];
    i+=item.token.length;
  }
  return sum;
}
/** @param {number} start @returns {{path:number[],transient:number,cycle:number[]}} */
function orbit(start) {
  const visit=new Int16Array(256).fill(-1);
  const positions=[];
  let current=start;
  while(visit[current]<0){
    visit[current]=positions.length;
    positions.push(current);
    current=grid.bytes[current];
  }
  return {path:positions,transient:visit[current],cycle:positions.slice(visit[current])};
}
const value=gpPrimeSum("lies");
const page=value%58;
const wordIndex=Math.floor(value/58);
assert.deepEqual([value,page,wordIndex],[224,50,3]);
const tablePage=grid.pages.find(p=>p.page===page);
assert.ok(tablePage);
assert.deepEqual([tablePage.tokens[wordIndex],tablePage.bytes[wordIndex]],["3D",193]);
const offset=grid.pages.filter(p=>p.page<page).reduce((n,p)=>n+p.bytes.length,wordIndex);
assert.equal(offset,83);
const selected=orbit(offset);
const path83=[83,193,155,112,73,79,82,201,74,205,76,114,197,115,247,192,0,203,68,199,47];
assert.deepEqual(selected.path,path83);
assert.deepEqual(selected.cycle,[76,114,197,115,247,192,0,203,68,199,47]);
assert.equal(selected.transient,10);
assert.deepEqual(orbit(193).path,path83.slice(1));
assert.deepEqual(orbit(0).cycle,[0,203,68,199,47,76,114,197,115,247,192]);
assert.equal(selected.path[6],82);
assert.equal(grid.bytes[82],201);
const left6=[];
for(let i=0;i<256;i++){
  const step=orbit(i).path.indexOf(i-1);
  if(step>=1&&step<=6)left6.push([i,step]);
}
assert.deepEqual(left6,[[53,4],[83,6],[116,6],[157,6],[190,3]]);
const basin=Array.from({length:256},(_,i)=>orbit(i)).filter(x=>x.cycle.includes(0)).length;
assert.equal(basin,252);
const locations193=grid.bytes.flatMap((v,i)=>v===193?[i]:[]);
assert.deepEqual(locations193,[83,127]);
assert.equal(orbit(127).path.includes(128),false);
const reversedPairs=[];
for(let i=0;i<255;i++)for(let j=i+2;j<255;j++){
  if(grid.bytes[i]===grid.bytes[j+1]&&grid.bytes[i+1]===grid.bytes[j])
    reversedPairs.push([i,j]);
}
assert.deepEqual(reversedPairs,[[82,127]]);
console.log(JSON.stringify({
  source:{word:"lies",primeSum:value,page,wordIndex,globalCell:offset,token:"3D",byte:193},
  pointer:selected,adjacentReturn:{step:6,cell:82,byte:201,otherStarts:left6},
  graph:{basinOf11Cycle:basin,locations193,reversedPairs},
  interpretation:"exact source route; no key, stop rule or original plaintext"
},null,2));
