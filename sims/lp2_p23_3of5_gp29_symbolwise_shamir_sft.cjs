#!/usr/bin/env node
"use strict";
/**
 * Original p23-26 five 201-rune strands as 3-of-5 Shamir over GP29 itself.
 *
 * Distinct from the historical 2013 binary GF(2^984) interpretation:
 * each aligned rune position is its own GF(29) share coordinate.
 * Node.js 22, CJS, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const data=JSON.parse(fs.readFileSync(path.join(
  __dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const pages=data.pages.filter(p=>p.page>=23&&p.page<=26);
assert.deepEqual(pages.map(p=>p.indices.length),[213,270,273,265]);
const all=pages.flatMap(p=>p.indices),body=all.slice(16);
assert.equal(all.length,1021);assert.equal(body.length,1005);
const layouts=[
 {name:"quintets-forward",strands:Array.from({length:5},
   (_,lane)=>body.filter((_,i)=>i%5===lane))},
 {name:"blocks-forward",strands:Array.from({length:5},
   (_,lane)=>body.slice(lane*201,(lane+1)*201))}
];
const views=layouts.flatMap(o=>[
 o,{name:o.name.replace("forward","reverse"),
 strands:o.strands.map(v=>[...v].reverse())}
]);
for(const o of views)
 assert.ok(o.strands.every(v=>v.length===201&&v.every(x=>x>=0&&x<29)));
const mod=x=>(x%29+29)%29;
const inverse=Array.from({length:29},(_,a)=>{
 if(a===0)return 0;
 for(let j=1;j<29;j++)if(a*j%29===1)return j;
 throw Error("no inverse "+a);
});
/** @param {number[]} xs Four distinct nonzero GF29 share labels. */
function weights(xs) {
 assert.equal(xs.length,4);assert.equal(new Set(xs).size,4);
 return xs.map((xi,i)=>{
  let den=1;
  for(let j=0;j<4;j++)if(j!==i)den=mod(den*(xi-xs[j]));
  return inverse[den];
 });
}
/** @param {number[]} xs @param {number[]} ys */
function recoverConstant(xs,ys) {
 assert.equal(xs.length,3);
 let result=0;
 for(let i=0;i<3;i++) {
  let coef=1;
  for(let j=0;j<3;j++)if(j!==i)
   coef=mod(coef*xs[j]*inverse[mod(xs[j]-xs[i])]);
  result=mod(result+coef*ys[i]);
 }
 return result;
}
// Positive plant with independent 201-rune source secret (printed p2).
const secret=data.pages[2].indices;
assert.equal(secret.length,201);
const shares=Array.from({length:5},(_,i)=>secret.map((s,t)=>{
 const x=i+1,a=mod(5*t+7),b=mod(11*t+3);
 return mod(s+a*x+b*x*x);
}));
for(let omit=0;omit<5;omit++) {
 const xs=[1,2,3,4,5].filter((_,i)=>i!==omit),w=weights(xs);
 for(let t=0;t<201;t++)
  assert.equal(mod(w.reduce((sum,k,j)=>sum+k*shares[xs[j]-1][t],0)),0);
}
for(let t=0;t<201;t++)
 assert.equal(recoverConstant([1,2,3],
  [shares[0][t],shares[1][t],shares[2][t]]),secret[t]);
const corrupt=shares.map(x=>x.slice());corrupt[0][0]=mod(corrupt[0][0]+1);
assert.notEqual(mod(weights([1,2,3,4]).reduce(
 (sum,k,j)=>sum+k*corrupt[j][0],0)),0);

// All 4-of-5 lane selections, C(10,4) historical 01..10 labels,
// all 24 permutations. For 3-of-5 quadratic, EVERY 4-share subset
// must satisfy every positional equation. Reject a candidate on
// its first failed column; if any passes, independently count all 201.
const ids=[];
for(let a=1;a<=7;a++)for(let b=a+1;b<=8;b++)
 for(let c=b+1;c<=9;c++)for(let d=c+1;d<=10;d++)
 ids.push([a,b,c,d]);
assert.equal(ids.length,210);
const perms=[];
/** @param {number[]} rest @param {number[]} prefix */
function permutations(rest,prefix){
 if(!rest.length){perms.push(prefix);return;}
 for(let i=0;i<rest.length;i++)
  permutations(rest.filter((_,j)=>j!==i),[...prefix,rest[i]]);
}
permutations([0,1,2,3],[]);
assert.equal(perms.length,24);
const stats=views.map(x=>({layout:x.name,tests:0,passedFirstCoordinate:0,
 passedAll201:0,maxConsecutiveMatchingCoordinates:0}));
for(const xs of ids){
 const w=weights(xs);
 for(let omit=0;omit<5;omit++){
  const lanes=views.map(v=>v.strands.filter((_,j)=>j!==omit));
  for(const order of perms)
   for(let i=0;i<views.length;i++){
    const s=stats[i],r=lanes[i];s.tests++;
    let j=0;
    for(;j<201;j++){
     let p=0;
     for(let k=0;k<4;k++)p+=w[k]*r[order[k]][j];
     if(mod(p)!==0)break;
    }
    if(j>0)s.passedFirstCoordinate++;
    if(j>s.maxConsecutiveMatchingCoordinates)
     s.maxConsecutiveMatchingCoordinates=j;
    if(j===201)s.passedAll201++;
   }
 }
}
assert.deepEqual(stats.map(x=>x.tests),[25200,25200,25200,25200]);
assert.deepEqual(stats.map(x=>x.passedAll201),[0,0,0,0]);
console.log(JSON.stringify({status:"PASS",originalRunePositions:1005,
 originalExactFourShareAssignments:100800,
 exact201CoordinateFits:0,
 positiveNativeSecretRecovered:201,
 nativePlantAllFourPointTests:true,stats},null,2));
