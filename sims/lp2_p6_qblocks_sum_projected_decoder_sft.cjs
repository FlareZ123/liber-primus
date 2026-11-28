'use strict';

// Agent11, 28 Nov 2026 — source-only sum-projected q-block decoder family.
// This generator does NOT read authenticated target rune vectors or language scores.
// It combines two already-frozen p6 mechanisms:
//   (1) the 18 direct/H4/H2adjacent x sign x clock base serializers;
//   (2) the p6 companion packet's per-lane additive key sums.
// Each base key is projected to the required sum hyperplane by the unique
// uniform coordinate correction c=(sigma-sum(K0))/n mod29.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p=corpus.pages;

const mod29=x=>((x%29)+29)%29;
const H4=x=>[mod29(x[0]-x[3]),mod29(x[1]-x[2]),mod29(x[1]+x[2]),mod29(x[0]+x[3])];
const H2=x=>[mod29(x[0]-x[1]),mod29(x[0]+x[1]),mod29(x[2]-x[3]),mod29(x[2]+x[3])];

function inv29(x){
  x=mod29(x);
  for(let y=1;y<29;y++) if(mod29(x*y)===1) return y;
  throw new Error('noninvertible mod29: '+x);
}

const blocks=[
  {
    name:'q1',
    source:p[6].indices.slice(71,75),
    sigma:[4,0,0,25],
    receiver:[
      {page:32,start:30,length:3,class:'first-full-stop complete word'},
      {page:33,start:132,length:4,class:'complete word'},
      {page:34,start:4,length:2,class:'complete word'},
      {page:35,start:25,length:5,class:'adjacent 2+3 packet'},
    ],
  },
  {
    name:'q3',
    source:p[6].indices.slice(76,80),
    sigma:[7,0,28,0],
    receiver:[
      {page:37,start:146,length:4,class:'complete word'},
      {page:38,start:57,length:6,class:'complete word'},
      {page:39,start:132,length:5,class:'complete word'},
      {page:40,start:71,length:4,class:'complete word'},
    ],
  },
];

assert.deepEqual(blocks[0].source,[24,16,14,17]);
assert.deepEqual(blocks[1].source,[6,27,15,17]);

const encodings=['direct','H4','H2adjacent'];
const clocks=['word-constant','word-local-cycle','block-continuous-rune'];
const candidates=[];

for(const encoding of encodings) for(const sign of [1,-1]) for(const clock of clocks){
  const candidate={encoding,sign,clock,blocks:[]};
  for(const block of blocks){
    const vec=encoding==='direct'?block.source:encoding==='H4'?H4(block.source):H2(block.source);
    let global=0;
    const out={name:block.name,seeds:vec,sigma:block.sigma.slice(),receivers:[]};
    for(let slot=0;slot<4;slot++){
      const r=block.receiver[slot];
      const C=p[r.page].indices.slice(r.start,r.start+r.length);
      assert.equal(C.length,r.length);
      const baseKey=[];
      for(let i=0;i<r.length;i++){
        const at=clock==='word-constant'?slot:
          clock==='word-local-cycle'?(slot+i)%4:
          global%4;
        baseKey.push(mod29(sign*vec[at]));
        global++;
      }
      const baseSum=baseKey.reduce((a,b)=>mod29(a+b),0);
      const correction=mod29((block.sigma[slot]-baseSum)*inv29(r.length));
      const key=baseKey.map(k=>mod29(k+correction));
      const keySum=key.reduce((a,b)=>mod29(a+b),0);
      assert.equal(keySum,block.sigma[slot]);
      const decoded=C.map((x,i)=>mod29(x-key[i]));
      assert.deepEqual(decoded.map((x,i)=>mod29(x+key[i])),C);
      out.receivers.push({...r,ciphertext:C,baseKey,baseSum,correction,key,keySum,decoded});
    }
    candidate.blocks.push(out);
  }
  candidates.push(candidate);
}

assert.equal(candidates.length,18);
const flatKey=c=>c.blocks.flatMap(b=>b.receivers.flatMap(r=>r.key)).join(',');
const distinct=new Set(candidates.map(flatKey));

const result={
  schema:1,
  author:'Agent11',
  date:'2026-11-28',
  grading:'PRETARGET NO-PLAINTEXT',
  rule:'uniform affine projection of each p6 base key onto frozen p6 companion key-sum hyperplane',
  formula:'c=(sigma-sum(K0))*n^-1 mod29; K=K0+c*1_n',
  baseFamily:{encodings,signs:[1,-1],clocks,count:18},
  sigmaSource:'frozen p6 companion packet; q1 [4,0,0,25], q3 [7,0,28,0]',
  distinctCompleteKeys:distinct.size,
  candidates,
};

console.log(JSON.stringify(result,null,2));
