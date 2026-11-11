"use strict";
// Original-image, source-frozen art-boundary SFT. Node.js 22 / CommonJS.
// Run: node sims/lp2_artwork_change_point_sft.cjs
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const C=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const pages=C.pages.slice(0,56).filter(p=>p.indices.length);
const runeMap=new Map(C.runes.map((r,i)=>[r,i]));
const train=[3,8,15,16,24,27],heldout=[33,40],tableSensitivity=[33,40,49,52];

/** @param {Array<{indices:number[]}>} list @param {1|2} order */
function histogram(list,order){
 const a=Array(order===1?29:841).fill(0);
 for(const p of list)for(let i=0;i<p.indices.length-(order-1);i++){
  const x=p.indices[i];
  a[order===1?x:x*29+p.indices[i+1]]++;
 }
 return a;
}
/** Jeffreys-like, symmetric pseudocount alpha=0.25; nats. */
function bigramJS(a,b){
 const alpha=.25,n=a.length,A=a.reduce((x,y)=>x+y,0)+n*alpha,B=b.reduce((x,y)=>x+y,0)+n*alpha;
 let sum=0;for(let i=0;i<n;i++){
  const x=(a[i]+alpha)/A,y=(b[i]+alpha)/B,m=(x+y)/2;
  sum+=(x*Math.log(x/m)+y*Math.log(y/m))/2;
 }return sum;
}
function unigramH2(a,b){
 const A=a.reduce((x,y)=>x+y,0),B=b.reduce((x,y)=>x+y,0);
 let sum=0;for(let i=0;i<a.length;i++)sum+=(Math.sqrt(a[i]/A)-Math.sqrt(b[i]/B))**2;
 return sum/2;
}
const seams=[];
for(let i=2;i<pages.length-2;i++){
 const left=pages.slice(i-2,i),right=pages.slice(i,i+2);
 seams.push({boundary:pages[i].page,
  js:bigramJS(histogram(left,2),histogram(right,2)),
  h2:unigramH2(histogram(left,1),histogram(right,1))});
}
/** Exact k-of-n label randomization; larger mean is the locked alternative. */
function exactUpper(values,chosen){
 const k=chosen.length,observed=chosen.reduce((s,i)=>s+values[i],0)/k;
 let total=0,upper=0;
 function recur(start,depth,sum){
  if(depth===k){total++;if(sum/k>=observed-1e-13)upper++;return;}
  for(let i=start;i<=values.length-(k-depth);i++)recur(i+1,depth+1,sum+values[i]);
 }
 recur(0,0,0);
 return {mean:observed,highOrEqual:upper,combinations:total,upperTail:upper/total};
}
function test(boundaries,low,high){
 const v=seams.filter(s=>s.boundary>=low&&s.boundary<=high);
 const chosen=v.flatMap((s,i)=>boundaries.includes(s.boundary)?[i]:[]);
 assert.equal(chosen.length,boundaries.length);
 return {boundaries,js:exactUpper(v.map(x=>x.js),chosen),
  h2:exactUpper(v.map(x=>x.h2),chosen),
  selected:v.filter(x=>boundaries.includes(x.boundary))};
}
// Explicit punctuation, not slash/newline, terminates words.
// Page 50 contains no runes. The 55 transcript sections map 0..49 and 51..55.
const pairs=[];let previous=null,seen=0;
const chunks=raw.split("%").slice(0,55);
for(let i=0;i<chunks.length;i++){
 const physical=i<50?i:i+1,indices=[];
 for(const char of chunks[i]){
  if(runeMap.has(char)){
   indices.push(runeMap.get(char));seen++;
   if(previous)pairs.push({page:physical,prevPage:previous.page,
    eq:previous.rune===char,within:previous.within});
   previous={page:physical,rune:char,within:true};
  }else if(char!=="/"&&!/\s/u.test(char)){
   if(previous)previous.within=false;
  }
 }
 assert.deepEqual(indices,C.pages[physical].indices,"Rune mismatch physical p"+physical);
}
const within=pairs.filter(p=>p.within),cross=pairs.filter(p=>!p.within),
      edges=pairs.filter(p=>p.page!==p.prevPage);
const same=p=>p.filter(x=>x.eq).length;
assert.equal(seen,12956);
assert.deepEqual([same(within),within.length],[63,10060]);
assert.deepEqual([same(cross),cross.length],[23,2895]);
assert.deepEqual([same(edges),edges.length],[0,54]);
const boundaries=[0,3,8,15,16,24,27,33,40,49,52,56];
const groupRates=[];
for(let i=0;i<boundaries.length-1;i++){
 const lo=boundaries[i],hi=boundaries[i+1];
 const group=pairs.filter(p=>p.page>=lo&&p.page<hi);
 const a=group.filter(p=>p.within),b=group.filter(p=>!p.within);
 groupRates.push({pages:[lo,hi-1],
  runes:pages.filter(p=>p.page>=lo&&p.page<hi).reduce((s,p)=>s+p.indices.length,0),
  within:[same(a),a.length],crossWord:[same(b),b.length]});
}
const training=test(train,3,31),heldoutText=test(heldout,32,48),
      withTable=test(tableSensitivity,32,53);
assert.deepEqual([training.js.highOrEqual,training.js.combinations],[413737,475020]);
assert.deepEqual([heldoutText.js.highOrEqual,heldoutText.js.combinations],[68,136]);
assert.deepEqual([heldoutText.h2.highOrEqual,heldoutText.h2.combinations],[76,136]);
assert.deepEqual([withTable.h2.highOrEqual,withTable.h2.combinations],[189,5985]);
console.log(JSON.stringify({runes:seen,within:[same(within),within.length],
 crossWord:[same(cross),cross.length],crossPage:[same(edges),edges.length],
 training,heldoutText,withTable,groupRates},null,2));
