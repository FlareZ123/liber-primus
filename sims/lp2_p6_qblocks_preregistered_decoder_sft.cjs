'use strict';
// Agent11, 28 Nov 2026: pre-target paired q-block decoder family, Issue #3390.
// NO signed target rune strings, fitted local keys, or language scores are read.
// The program emits the complete source-only candidate family and raw original-cipher inverses.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;

const H4=x=>[(x[0]-x[3]+29)%29,(x[1]-x[2]+29)%29,(x[1]+x[2])%29,(x[0]+x[3])%29];
const H2=x=>[(x[0]-x[1]+29)%29,(x[0]+x[1])%29,(x[2]-x[3]+29)%29,(x[2]+x[3])%29];

const blocks=[
  {
    name:'q1',
    source:p[6].indices.slice(71,75),
    receiver:[
      {page:32,start:30,length:3,class:'first-full-stop complete word'},
      {page:33,start:132,length:4,class:'complete word'},
      {page:34,start:4,length:2,class:'complete word'},
      {page:35,start:25,length:5,class:'adjacent 2+3 packet'}
    ]
  },
  {
    name:'q3',
    source:p[6].indices.slice(76,80),
    receiver:[
      {page:37,start:146,length:4,class:'complete word'},
      {page:38,start:57,length:6,class:'complete word'},
      {page:39,start:132,length:5,class:'complete word'},
      {page:40,start:71,length:4,class:'complete word'}
    ]
  }
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
    let global=0;
    const out={name:block.name,seeds:vec,receivers:[]};
    for(let j=0;j<4;j++){
      const r=block.receiver[j];
      const C=p[r.page].indices.slice(r.start,r.start+r.length);
      assert.equal(C.length,r.length);
      const K=[],P=[];
      for(let i=0;i<r.length;i++){
        const at=clock==='word-constant'?j:
          clock==='word-local-cycle'?(j+i)%4:
          global%4;
        const k=((sign*vec[at])%29+29)%29;
        K.push(k);
        P.push((C[i]-k+29)%29);
        global++;
      }
      assert.deepEqual(P.map((x,i)=>(x+K[i])%29),C);
      out.receivers.push({...r,ciphertext:C,key:K,decoded:P});
    }
    candidate.blocks.push(out);
  }
  candidates.push(candidate);
}

assert.equal(candidates.length,18);
const flatKey=c=>c.blocks.flatMap(b=>b.receivers.flatMap(r=>r.key)).join(',');
assert.equal(new Set(candidates.map(flatKey)).size,18);

const result={
  schema:1,
  issue:3390,
  author:'Agent11',
  grading:'PRETARGET NO-PLAINTEXT',
  source:{
    p6Physical:6,
    qBlocks:[
      {name:'q1',titleRuneStart:71,source:blockSource(blocks[0])},
      {name:'q3',titleRuneStart:76,source:blockSource(blocks[1])}
    ]
  },
  grammar:{
    sameRuleAcrossBothQBlocks:true,
    transformations:encodings,
    signs:[1,-1],
    clocks,
    chargedCompleteDecoders:18,
    selectorStatus:'NONIDENTIFYING: all 18 remain source-compatible before target comparison',
    directInverse:'P=(C-K) mod29 with exact forward round trip',
    exclusionBoundary:'paired q-block transfer of the three predeclared p6 transforms, two global signs, and three block-local clocks only'
  },
  candidates
};

function blockSource(block){
  return {
    p6Runes:block.source,
    receiver:block.receiver.map(r=>({...r,ciphertext:p[r.page].indices.slice(r.start,r.start+r.length)}))
  };
}

console.log(JSON.stringify(result,null,2));
