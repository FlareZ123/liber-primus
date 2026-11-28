'use strict';
// Agent10, 28 Nov 2026: pre-target complete q-block1 serializer, Issue #3382.
// NO signed text or fitted target keys used. This script only emits original
// p6/p32-p35 operands, 18 frozen full key streams, and raw inverse outputs.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;
const W1=p[6].indices.slice(71,75);
assert.deepEqual(W1,[24,16,14,17]);
const receiver=[
 {page:32,start:30,length:3,class:'first-full-stop complete word'},
 {page:33,start:132,length:4,class:'source-selected complete word'},
 {page:34,start:4,length:2,class:'source-selected complete word'},
 {page:35,start:25,length:5,class:'unique 2+3 adjacent word packet'}
];
const H4=x=>[(x[0]-x[3]+29)%29,(x[1]-x[2]+29)%29,(x[1]+x[2])%29,(x[0]+x[3])%29];
const H2=x=>[(x[0]-x[1]+29)%29,(x[0]+x[1])%29,(x[2]-x[3]+29)%29,(x[2]+x[3])%29];
const basis=[['direct',W1],['H4',H4(W1)],['H2adjacent',H2(W1)]];
const clocks=['word-constant','word-local-cycle','continuous-source-rune'];
const candidates=[];
for(const [encoding,vec] of basis)for(const sign of [1,-1])for(const clock of clocks){
  let global=0,keys=[],decoded=[];
  for(let j=0;j<4;j++){
    const r=receiver[j],C=p[r.page].indices.slice(r.start,r.start+r.length),K=[],P=[];
    assert.equal(C.length,r.length);
    for(let i=0;i<r.length;i++){
      const at=clock==='word-constant'?j:
        clock==='word-local-cycle'?(j+i)%4:global%4;
      const k=((sign*vec[at])%29+29)%29;
      K.push(k);P.push((C[i]-k+29)%29);global++;
    }
    assert.deepEqual(P.map((x,i)=>(x+K[i])%29),C);
    keys.push(K);decoded.push(P);
  }
  candidates.push({encoding,sign,clock,seeds:vec,keys,decoded});
}
assert.equal(candidates.length,18);
assert.equal(new Set(candidates.map(x=>x.keys.flat().join(','))).size,18);
const result={
 schema:1,issue:3382,author:'Agent10',grading:'PRETARGET NO-PLAINTEXT',
 source:{
  p6Physical:6,titleWordRuneStarts:[71,75,76,80],
  titleWordLengths:[4,1,4,2],fourRuneSource:W1,
  receiver:receiver.map(r=>({...r,ciphertext:p[r.page].indices.slice(r.start,r.start+r.length)}))
 },
 grammar:{
  transformations:['direct','canonical-H4','canonical-H2-adjacent'],
  signs:[1,-1],clocks,chargedCompleteKeys:18,
  successCriterion:'All four decoded outputs must exactly equal authenticated signed source words32-35; no key/receiver retuning.',
  exclusionBoundary:'This frozen 18-member low-description grammar only'
 },
 candidates
};
console.log(JSON.stringify(result,null,2));
