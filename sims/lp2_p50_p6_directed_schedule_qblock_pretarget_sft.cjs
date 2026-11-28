'use strict';

// Agent11, 28 Nov 2026 — PRETARGET operational follow-up to the directed p50↔p6 H bridge.
// The p50 support-edge order selects exactly [-e,g,a,K]. This script tests that
// single signed schedule under five low-description clock conventions.
// No authenticated target rune vector or language score is read.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const M=x=>((x%29)+29)%29;
const H4=x=>[M(x[0]-x[3]),M(x[1]-x[2]),M(x[1]+x[2]),M(x[0]+x[3])];

const titleLengths=[4,1,4,2];
const titleH=H4(titleLengths);
assert.deepEqual(titleH,[2,26,5,6]);
const schedule=[titleH[1],titleH[2],titleH[3],titleH[0]];
assert.deepEqual(schedule,[26,5,6,2]); // [-e,g,a,K], fixed by p50 directed line order.

const blocks=[
 {name:'q1',sigma:[4,0,0,25],rec:[
  {page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',sigma:[7,0,28,0],rec:[
  {page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];

const modes=['word-restart','word-slot-offset','word-constant','block-continuous','corridor-continuous'];
const candidates=[];
for(const mode of modes){
 let corridor=0;
 const candidate={mode,schedule:schedule.slice(),blocks:[],checksumMatches:0};
 for(const block of blocks){
  let blockClock=0;
  const bout={name:block.name,receivers:[]};
  for(let slot=0;slot<4;slot++){
   const r=block.rec[slot],C=p[r.page].indices.slice(r.start,r.start+r.length),key=[];
   assert.equal(C.length,r.length);
   for(let j=0;j<r.length;j++){
    let at;
    if(mode==='word-restart') at=j%4;
    else if(mode==='word-slot-offset') at=(slot+j)%4;
    else if(mode==='word-constant') at=slot;
    else if(mode==='block-continuous') at=blockClock%4;
    else at=corridor%4;
    key.push(schedule[at]);
    blockClock++; corridor++;
   }
   const keySum=key.reduce((a,b)=>M(a+b),0);
   const checksumMatch=keySum===block.sigma[slot];
   candidate.checksumMatches+=Number(checksumMatch);
   const decoded=C.map((x,j)=>M(x-key[j]));
   assert.deepEqual(decoded.map((x,j)=>M(x+key[j])),C);
   bout.receivers.push({...r,sigma:block.sigma[slot],ciphertext:C,key,keySum,checksumMatch,decoded});
  }
  candidate.blocks.push(bout);
 }
 candidates.push(candidate);
}
assert.equal(candidates.length,5);
const hist={};for(const c of candidates)hist[c.checksumMatches]=(hist[c.checksumMatches]||0)+1;
console.log(JSON.stringify({
 schema:1,author:'Agent11',date:'2026-11-28',
 grading:'PRETARGET NO-PLAINTEXT / CHECKSUM HELD OUT',
 sourceSchedule:{titleLengths,titleH,p50DirectedRotation:schedule},
 modes,
 checksumHistogram:hist,
 candidates
},null,2));
