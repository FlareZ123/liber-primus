'use strict';

// Agent11, 28 Nov 2026 — PRETARGET source-only receiver-dependent family.
// Motivation: p6 repeatedly licenses outside-pair H geometry; the frozen p6
// companion packet fixes each q-page additive key sum. Exhaust every GF(29)
// two-coefficient direct/mirror affine shape, then apply the unique uniform
// correction that forces the p6-implied plaintext sum. No target rune vector
// or language score is read here.

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const mod29=x=>((x%29)+29)%29;
function inv29(x){x=mod29(x);for(let y=1;y<29;y++)if(mod29(x*y)===1)return y;throw new Error('no inverse');}

const blocks=[
 {name:'q1',sigma:[4,0,0,25],receiver:[
  {page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',sigma:[7,0,28,0],receiver:[
  {page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];

function decode(a,b,C,sigma){
 const n=C.length,raw=C.map((x,j)=>mod29(a*x+b*C[n-1-j]));
 const csum=C.reduce((s,x)=>mod29(s+x),0),targetSum=mod29(csum-sigma);
 const rawSum=raw.reduce((s,x)=>mod29(s+x),0);
 const correction=mod29((targetSum-rawSum)*inv29(n));
 const P=raw.map(x=>mod29(x+correction));
 assert.equal(P.reduce((s,x)=>mod29(s+x),0),targetSum);
 const K=C.map((x,j)=>mod29(x-P[j]));
 assert.equal(K.reduce((s,x)=>mod29(s+x),0),sigma);
 assert.deepEqual(P.map((x,j)=>mod29(x+K[j])),C);
 return {rawSum,targetSum,correction,P,K};
}

const candidates=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
 const outputs=[];
 for(const block of blocks)for(let slot=0;slot<4;slot++){
  const r=block.receiver[slot],C=p[r.page].indices.slice(r.start,r.start+r.length);
  assert.equal(C.length,r.length);
  outputs.push({block:block.name,slot,page:r.page,start:r.start,length:r.length,ciphertext:C,sigma:block.sigma[slot],...decode(a,b,C,block.sigma[slot])});
 }
 candidates.push({a,b,outputs});
}
assert.equal(candidates.length,841);

const serialized=JSON.stringify(candidates);
const digest=crypto.createHash('sha256').update(serialized).digest('hex');
const unique=new Set(candidates.map(c=>c.outputs.flatMap(o=>o.P).join(',')));
console.log(JSON.stringify({
 status:'PRETARGET NO-PLAINTEXT',author:'Agent11',date:'2026-11-28',
 family:'all GF(29) direct/mirror affine receiver decoders with p6-sum correction',
 formula:'raw_j=a*C_j+b*C_(n-1-j); c=(sum(C)-sigma-sum(raw))*n^-1; P=raw+c',
 coefficients:841,distinctCompletePlaintextStreams:unique.size,sha256OfAllCandidateOutputs:digest,
 receivers:blocks
},null,2));
