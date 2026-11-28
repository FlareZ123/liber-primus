'use strict';

// Agent11, 28 Nov 2026 — pretarget outer-H-sum projection.
// No authenticated target rune vector or language score is read.
// Freeze the existing 18 p6 q-block base serializers and the p6 companion
// key-sum packet. Enforce each page sum by modifying only the outer H sum
// channel: add delta/2 to first and last raw-key coordinates. This preserves
// the outer difference and changes total sum by delta exactly.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const mod29=x=>((x%29)+29)%29;
const inv2=15;
const H4=x=>[mod29(x[0]-x[3]),mod29(x[1]-x[2]),mod29(x[1]+x[2]),mod29(x[0]+x[3])];
const H2=x=>[mod29(x[0]-x[1]),mod29(x[0]+x[1]),mod29(x[2]-x[3]),mod29(x[2]+x[3])];

const blocks=[
 {name:'q1',source:p[6].indices.slice(71,75),sigma:[4,0,0,25],receiver:[
  {page:32,start:30,length:3},{page:33,start:132,length:4},{page:34,start:4,length:2},{page:35,start:25,length:5}]},
 {name:'q3',source:p[6].indices.slice(76,80),sigma:[7,0,28,0],receiver:[
  {page:37,start:146,length:4},{page:38,start:57,length:6},{page:39,start:132,length:5},{page:40,start:71,length:4}]}
];
assert.deepEqual(blocks[0].source,[24,16,14,17]);
assert.deepEqual(blocks[1].source,[6,27,15,17]);

const encodings=['direct','H4','H2adjacent'];
const clocks=['word-constant','word-local-cycle','block-continuous-rune'];
const candidates=[];
for(const encoding of encodings)for(const sign of [1,-1])for(const clock of clocks){
 const candidate={encoding,sign,clock,blocks:[]};
 for(const block of blocks){
  const vec=encoding==='direct'?block.source:encoding==='H4'?H4(block.source):H2(block.source);
  let global=0; const out={name:block.name,seeds:vec,sigma:block.sigma.slice(),receivers:[]};
  for(let slot=0;slot<4;slot++){
   const r=block.receiver[slot],C=p[r.page].indices.slice(r.start,r.start+r.length),baseKey=[];
   assert.equal(C.length,r.length);
   for(let i=0;i<r.length;i++){
    const at=clock==='word-constant'?slot:clock==='word-local-cycle'?(slot+i)%4:global%4;
    baseKey.push(mod29(sign*vec[at])); global++;
   }
   const baseSum=baseKey.reduce((a,b)=>mod29(a+b),0);
   const delta=mod29(block.sigma[slot]-baseSum);
   const half=mod29(delta*inv2);
   const key=baseKey.slice(); key[0]=mod29(key[0]+half); key[key.length-1]=mod29(key[key.length-1]+half);
   const keySum=key.reduce((a,b)=>mod29(a+b),0);
   assert.equal(keySum,block.sigma[slot]);
   assert.equal(mod29(key[0]-key.at(-1)),mod29(baseKey[0]-baseKey.at(-1)));
   const decoded=C.map((x,i)=>mod29(x-key[i]));
   assert.deepEqual(decoded.map((x,i)=>mod29(x+key[i])),C);
   out.receivers.push({...r,ciphertext:C,baseKey,baseSum,delta,half,key,keySum,decoded});
  }
  candidate.blocks.push(out);
 }
 candidates.push(candidate);
}
assert.equal(candidates.length,18);
const flat=c=>c.blocks.flatMap(b=>b.receivers.flatMap(r=>r.key)).join(',');
console.log(JSON.stringify({
 schema:1,author:'Agent11',date:'2026-11-28',grading:'PRETARGET NO-PLAINTEXT',
 rule:'outer-H-sum projection of each p6 base key onto frozen p6 companion key sum',
 formula:'delta=sigma-sum(K0); h=delta/2; K[0]=K0[0]+h; K[n-1]=K0[n-1]+h',
 invariant:'outer raw-key difference preserved; total key sum forced to sigma',
 baseFamily:{encodings,signs:[1,-1],clocks,count:18},
 distinctCompleteKeys:new Set(candidates.map(flat)).size,candidates
},null,2));
