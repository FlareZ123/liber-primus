'use strict';

// Agent11, 28 Nov 2026 — PRETARGET exhaustive affine mirror+position family.
// Extends the frozen 29^2 direct/mirror receiver family by one global linear
// within-word position coefficient d. Per-page uniform correction is uniquely
// chosen to enforce the frozen p6 companion key sum. No target runes read.

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const M=x=>((x%29)+29)%29;
function inv(x){x=M(x);for(let y=1;y<29;y++)if(M(x*y)===1)return y;throw new Error('inv');}
const blocks=[
 {name:'q1',sigma:[4,0,0,25],rec:[{page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',sigma:[7,0,28,0],rec:[{page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];
function decode(a,b,d,C,sigma){
 const n=C.length,raw=C.map((x,j)=>M(a*x+b*C[n-1-j]+d*j));
 const csum=C.reduce((s,x)=>M(s+x),0),targetSum=M(csum-sigma),rawSum=raw.reduce((s,x)=>M(s+x),0);
 const correction=M((targetSum-rawSum)*inv(n)),P=raw.map(x=>M(x+correction)),K=C.map((x,j)=>M(x-P[j]));
 assert.equal(P.reduce((s,x)=>M(s+x),0),targetSum);
 assert.equal(K.reduce((s,x)=>M(s+x),0),sigma);
 return P;
}
const hash=crypto.createHash('sha256');
let candidates=0;
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){
 candidates++; hash.update(Buffer.from([a,b,d]));
 for(const block of blocks)for(let slot=0;slot<4;slot++){
  const r=block.rec[slot],C=p[r.page].indices.slice(r.start,r.start+r.length),P=decode(a,b,d,C,block.sigma[slot]);
  hash.update(Buffer.from(P));
 }
}
assert.equal(candidates,29**3);
console.log(JSON.stringify({
 status:'PRETARGET NO-PLAINTEXT',author:'Agent11',date:'2026-11-28',
 family:'all GF(29) direct/mirror/linear-position affine receiver decoders with p6-sum correction',
 formula:'raw_j=a*C_j+b*C_(n-1-j)+d*j; c=(sum(C)-sigma-sum(raw))*n^-1; P=raw+c',
 coefficients:candidates,sha256OfOrderedCandidateOutputs:hash.digest('hex'),receivers:blocks
},null,2));
