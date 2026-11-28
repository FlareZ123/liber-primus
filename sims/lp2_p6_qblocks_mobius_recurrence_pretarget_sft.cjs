'use strict';

// Agent11, 28 Nov 2026 — PRETARGET projective/Mobius q-block recurrence.
// No authenticated target runes and no key sums are used to generate a key.
// W1/W3 (or H4 thereof) define a 2x2 GF(29) matrix acting on the projective
// scalar x -> (a*x+b)/(c*x+d). Each page starts from its frozen receiver
// delta. The p6 companion key sum is held out and checked only after emission.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const M=x=>((x%29)+29)%29;
function inv(x){x=M(x);for(let y=1;y<29;y++)if(M(x*y)===1)return y;return null;}
const H4=x=>[M(x[0]-x[3]),M(x[1]-x[2]),M(x[1]+x[2]),M(x[0]+x[3])];
const blocks=[
 {name:'q1',W:p[6].indices.slice(71,75),delta:[3,2,26,1],sigma:[4,0,0,25],rec:[
  {page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',W:p[6].indices.slice(76,80),delta:[1,3,20,6],sigma:[7,0,28,0],rec:[
  {page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];
function matrix(word,rep,transpose){
 const v=rep==='direct'?word:H4(word);let A=[[v[0],v[1]],[v[2],v[3]]];
 if(transpose)A=[[A[0][0],A[1][0]],[A[0][1],A[1][1]]];return A;
}
function inverseMatrix(A){
 const z=inv(M(A[0][0]*A[1][1]-A[0][1]*A[1][0]));assert.notEqual(z,null);
 return [[M(z*A[1][1]),M(-z*A[0][1])],[M(-z*A[1][0]),M(z*A[0][0])]];
}
function step(A,x){const den=M(A[1][0]*x+A[1][1]),z=inv(den);if(z===null)return null;return M((A[0][0]*x+A[0][1])*z);}

const candidates=[];
for(const representation of ['direct','H4'])
for(const transpose of [false,true])
for(const direction of ['forward','inverse'])
for(const timing of ['seed-first','step-first']){
 const candidate={representation,transpose,direction,timing,blocks:[],checksumMatches:0,invalidPages:0};
 for(const block of blocks){
  let A=matrix(block.W,representation,transpose);if(direction==='inverse')A=inverseMatrix(A);
  const bout={name:block.name,W:block.W.slice(),matrix:A,receivers:[]};
  for(let slot=0;slot<4;slot++){
   const r=block.rec[slot],C=p[r.page].indices.slice(r.start,r.start+r.length);let x=block.delta[slot],invalid=false;const key=[];
   for(let j=0;j<r.length;j++){
    if(timing==='step-first'){x=step(A,x);if(x===null){invalid=true;break;}}
    key.push(x);
    if(timing==='seed-first'&&j+1<r.length){x=step(A,x);if(x===null){invalid=true;break;}}
   }
   let keySum=null,checksumMatch=false,decoded=null;
   if(!invalid&&key.length===r.length){keySum=key.reduce((a,b)=>M(a+b),0);checksumMatch=keySum===block.sigma[slot];candidate.checksumMatches+=Number(checksumMatch);decoded=C.map((v,j)=>M(v-key[j]));}
   else candidate.invalidPages++;
   bout.receivers.push({...r,delta:block.delta[slot],sigma:block.sigma[slot],ciphertext:C,key,keySum,checksumMatch,invalid,decoded});
  }
  candidate.blocks.push(bout);
 }
 candidates.push(candidate);
}
assert.equal(candidates.length,16);
const checksumHistogram={},invalidHistogram={};
for(const c of candidates){checksumHistogram[c.checksumMatches]=(checksumHistogram[c.checksumMatches]||0)+1;invalidHistogram[c.invalidPages]=(invalidHistogram[c.invalidPages]||0)+1;}
console.log(JSON.stringify({schema:1,author:'Agent11',date:'2026-11-28',grading:'PRETARGET NO-PLAINTEXT / KEY SUM HELD OUT',family:'p6 q-word Mobius recurrence seeded by receiver delta',count:candidates.length,checksumHistogram,invalidHistogram,candidates},null,2));
