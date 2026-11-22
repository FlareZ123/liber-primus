#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const grid=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
const b=grid.bytes;
assert.equal(b.length,256);
const p49=grid.pages.find(p=>p.page===49),p50=grid.pages.find(p=>p.page===50),p51=grid.pages.find(p=>p.page===51);
assert.deepEqual([p49.bytes.length,p50.bytes.length,p51.bytes.length],[80,104,72]);
assert.equal(p50.tokens[3],"3D");
assert.equal(p49.bytes.length+3,83);
assert.equal(b[83],193);
const S=210;
function pairs(a,s){const out=[];for(let i=Math.max(0,s-255);i<=Math.floor((s-1)/2);i++){const j=s-i;if(i<j&&j<a.length&&a[i]===a[j])out.push({i,j,value:a[i]});}return out;}
function run(p){let best=0,n=0,prev=null;for(const x of [...p].sort((a,b)=>a.i-b.i)){n=prev!==null&&x.i===prev+1?n+1:1;best=Math.max(best,n);prev=x.i;}return best;}
const observed=pairs(b,S);
assert.deepEqual(observed,[{i:19,j:191,value:33},{i:82,j:128,value:201},{i:83,j:127,value:193}]);
assert.equal(run(observed),2);
assert.deepEqual(b.slice(82,84),[201,193]);
assert.deepEqual(b.slice(127,129),[193,201]);
const all=[];for(let s=2;s<=508;s++){const p=pairs(b,s);if(p.length)all.push({sum:s,count:p.length,maxRun:run(p)});}
const run2Sums=all.filter(x=>x.maxRun>=2).map(x=>x.sum);assert.deepEqual(run2Sums,[210]);
const counts=Array(256).fill(0);for(const x of b)counts[x]++;
const expected=104*counts.reduce((s,n)=>s+n*(n-1),0)/(256*255);
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function sample(kind,r){
 const a=b.slice();
 if(kind==="full")return shuffle(a,r);
 if(kind==="row"){for(let row=0;row<32;row++)for(let i=7;i>0;i--){const j=Math.floor(r()*(i+1)),x=row*8+i,y=row*8+j;[a[x],a[y]]=[a[y],a[x]];}return a;}
 if(kind==="column"){for(let col=0;col<8;col++)for(let i=31;i>0;i--){const j=Math.floor(r()*(i+1)),x=i*8+col,y=j*8+col;[a[x],a[y]]=[a[y],a[x]];}return a;}
 if(kind==="rowBlocks"){const order=shuffle(Array.from({length:32},(_,i)=>i),r);return order.flatMap(row=>b.slice(row*8,(row+1)*8));}
 throw Error(kind);
}
function measure(a){let n=0,streak=0,best=0;for(let i=1;i<=104;i++){if(a[i]===a[S-i]){n++;streak++;best=Math.max(best,streak);}else streak=0;}return{n,best};}
function simulate(kind,trials,seed){const r=rng(seed);let ge3=0,run2=0,ge1=0,total=0;for(let t=0;t<trials;t++){const x=measure(sample(kind,r));total+=x.n;if(x.n>=1)ge1++;if(x.n>=3)ge3++;if(x.best>=2)run2++;}return{kind,trials,mean:total/trials,p_ge1:ge1/trials,p_ge3:ge3/trials,p_run2:run2/trials};}
console.log(JSON.stringify({shape:"32x8 pp49-51",p50Cell3:{token:p50.tokens[3],offset:83,value:b[83]},mirrorSum:S,observedPairs:observed,adjacentReversal:{left:b.slice(82,84),right:b.slice(127,129)},allSums:{maxPairCount:Math.max(...all.map(x=>x.count)),sumsWithRun2:run2Sums,sumsWith3Plus:all.filter(x=>x.count>=3)},expectedMatches104:expected,distinctBytes:counts.filter(x=>x>0).length,duplicateValues:counts.filter(x=>x>1).length,nulls:[simulate("full",100000,0x6d2b79f5),simulate("row",50000,0x12345678),simulate("column",50000,0x23456789),simulate("rowBlocks",50000,0x3456789a)]},null,2));
