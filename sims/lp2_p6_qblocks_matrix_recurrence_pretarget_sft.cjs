'use strict';

// Agent11, 28 Nov 2026 — PRETARGET q-block 2x2 state-matrix recurrence.
// No authenticated target rune vector or language score is read.
// Each p6 q-word (W1/W3, four runes) is interpreted as a 2x2 GF(29)
// transition matrix. Each selected receiver page is seeded only by the
// independently frozen receiver-delta and p6-companion key-sum scalars.
// One convention is shared across both q blocks.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const M=x=>((x%29)+29)%29;
function inv(x){x=M(x);for(let y=1;y<29;y++)if(M(x*y)===1)return y;throw new Error('no inverse '+x);}
const H4=x=>[M(x[0]-x[3]),M(x[1]-x[2]),M(x[1]+x[2]),M(x[0]+x[3])];

const blocks=[
 {name:'q1',W:p[6].indices.slice(71,75),delta:[3,2,26,1],sigma:[4,0,0,25],rec:[
  {page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',W:p[6].indices.slice(76,80),delta:[1,3,20,6],sigma:[7,0,28,0],rec:[
  {page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];
assert.deepEqual(blocks[0].W,[24,16,14,17]);
assert.deepEqual(blocks[1].W,[6,27,15,17]);

function matrixFrom(word,representation,transpose){
 const v=representation==='direct'?word:H4(word);
 let A=[[v[0],v[1]],[v[2],v[3]]];
 if(transpose) A=[[A[0][0],A[1][0]],[A[0][1],A[1][1]]];
 return A;
}
function matrixInverse(A){
 const det=M(A[0][0]*A[1][1]-A[0][1]*A[1][0]),z=inv(det);
 return [[M(z*A[1][1]),M(-z*A[0][1])],[M(-z*A[1][0]),M(z*A[0][0])]];
}
function mul(A,v){return [M(A[0][0]*v[0]+A[0][1]*v[1]),M(A[1][0]*v[0]+A[1][1]*v[1])];}

const representations=['direct','H4'];
const candidates=[];
for(const representation of representations)
for(const transpose of [false,true])
for(const direction of ['forward','inverse'])
for(const seedOrder of ['delta-sigma','sigma-delta'])
for(const output of [0,1])
for(const timing of ['seed-first','step-first']){
 const candidate={representation,transpose,direction,seedOrder,output,timing,blocks:[],checksumMatches:0};
 for(const block of blocks){
  let A=matrixFrom(block.W,representation,transpose);
  if(direction==='inverse') A=matrixInverse(A);
  const bout={name:block.name,W:block.W.slice(),matrix:A,receivers:[]};
  for(let slot=0;slot<4;slot++){
   const r=block.rec[slot],C=p[r.page].indices.slice(r.start,r.start+r.length);
   let v=seedOrder==='delta-sigma'?[block.delta[slot],block.sigma[slot]]:[block.sigma[slot],block.delta[slot]];
   const key=[];
   for(let j=0;j<r.length;j++){
    if(timing==='step-first') v=mul(A,v);
    key.push(v[output]);
    if(timing==='seed-first') v=mul(A,v);
   }
   const keySum=key.reduce((a,b)=>M(a+b),0);
   const checksumMatch=keySum===block.sigma[slot];
   candidate.checksumMatches+=Number(checksumMatch);
   const decoded=C.map((x,j)=>M(x-key[j]));
   assert.deepEqual(decoded.map((x,j)=>M(x+key[j])),C);
   bout.receivers.push({...r,delta:block.delta[slot],sigma:block.sigma[slot],ciphertext:C,key,keySum,checksumMatch,decoded});
  }
  candidate.blocks.push(bout);
 }
 candidates.push(candidate);
}
assert.equal(candidates.length,64);
const histogram={};for(const c of candidates)histogram[c.checksumMatches]=(histogram[c.checksumMatches]||0)+1;
console.log(JSON.stringify({
 schema:1,author:'Agent11',date:'2026-11-28',grading:'PRETARGET NO-PLAINTEXT',
 family:'p6 q-word 2x2 GF29 state recurrence seeded by receiver-delta/key-sum',
 conventions:{representations,transpose:[false,true],direction:['forward','inverse'],seedOrder:['delta-sigma','sigma-delta'],output:[0,1],timing:['seed-first','step-first']},
 count:candidates.length,checksumHistogram:histogram,candidates
},null,2));
