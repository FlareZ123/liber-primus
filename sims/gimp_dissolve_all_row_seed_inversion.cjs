"use strict";
/**
 * All 4,096 historical GIMP 2.8 Dissolve row seeds as possible LP2 additive
 * GP29 pads. Exact family: every row seed, offsets 0..64, signs +/-,
 * normal/reversed rune order. Evaluates actual original p7/p23, freezes the
 * best first 104 runes, tests remaining runes, and verifies independently
 * authored Gibran GP language plants with complete key recovery.
 *
 * Distinct from 2D image-coordinate sampling and nonadditive transforms.
 * Run: node sims/gimp_dissolve_all_row_seed_inversion.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {GRand,draws,encodeGP}=require("./gimp_dissolve_directpad.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=encodeGP(read("resources/control/shakespeare_first300k.txt"));
const plantSource=encodeGP(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(source.length,217644);
const n29=29, nTrain=104, nOffset=65;
const left=new Uint32Array(29),pair=new Uint32Array(841);
for(let i=1;i<source.length;i++){left[source[i-1]]++;pair[29*source[i-1]+source[i]]++;}
const log=new Float64Array(841);
for(let a=0;a<29;a++)for(let b=0;b<29;b++)
  log[29*a+b]=Math.log((pair[29*a+b]+.3)/(left[a]+8.7));
/** @param {number[]} p @param {number} start */
function score(p,start=1){let s=0;for(let i=start;i<p.length;i++)s+=log[29*p[i-1]+p[i]];return s/(p.length-start);}
const rootSeed=draws(314159265,4096);
assert.deepEqual(rootSeed.slice(0,3),[3721122731,618219707,807213306]);
const rows=rootSeed.map(seed=>{const rng=new GRand(seed),key=new Uint8Array(350);for(let i=0;i<350;i++)key[i]=rng.nextUint32()%29;return key;});
/**
 * @typedef {{row:number,offset:number,sign:number,rev:boolean,train:number}} Candidate
 * @param {number[]} c @param {Candidate} p */
function decode(c,p){return c.map((v,i)=>(v+29+p.sign*rows[p.row][p.offset+(p.rev?c.length-1-i:i)])%29);}
/** @param {number[]} p @param {Candidate} cfg */
function encrypt(p,cfg){return p.map((v,i)=>(v+29-cfg.sign*rows[cfg.row][cfg.offset+(cfg.rev?p.length-1-i:i)])%29);}
/** @param {number[]} c */
function scan(c){
  /** @type {Candidate[]} */ const top=[];
  for(let row=0;row<4096;row++)for(let offset=0;offset<nOffset;offset++)
  for(const sign of [-1,1])for(const rev of [false,true]){
    let sum=0,previous=0;
    for(let i=0;i<nTrain;i++){
      const v=(c[i]+29+sign*rows[row][offset+(rev?c.length-1-i:i)])%29;
      if(i)sum+=log[29*previous+v];previous=v;
    }
    const train=sum/(nTrain-1);
    if(top.length===32&&train<=top[31].train)continue;
    top.push({row,offset,sign,rev,train});
    top.sort((a,b)=>b.train-a.train);
    if(top.length>32)top.length=32;
  }
  const candidate=top.map(x=>{
    const p=decode(c,x);
    return {...x,heldout:score(p,nTrain),first40:p.slice(0,40).map(v=>gp.translit[v]).join("")};
  });
  return {numberOfConfigs:4096*nOffset*4,
    bestTrain:candidate[0],top5:candidate.slice(0,5),
    bestHeldoutAmongTop32:candidate.slice().sort((a,b)=>b.heldout-a.heldout).slice(0,3)};
}
const originals=[7,23].map(page=>{
  const rec=gp.pages.find(x=>x.page===page);assert.equal(rec.status,"unsolved");
  return {page,cipher:rec.indices};
});
assert.deepEqual(originals.map(x=>x.cipher.length),[208,213]);
const trueKeys=[
  {row:277,offset:31,sign:-1,rev:false,train:0},
  {row:3901,offset:53,sign:1,rev:true,train:0}
];
const planted=originals.map((x,i)=>{
  const plain=plantSource.slice(i?12000:3000,(i?12000:3000)+x.cipher.length);
  assert.equal(plain.length,x.cipher.length);
  const ciphertext=encrypt(plain,trueKeys[i]);
  assert.deepEqual(decode(ciphertext,trueKeys[i]),plain);
  return {layoutPage:x.page,plain,ciphertext,trueKey:trueKeys[i]};
});
const t0=Date.now();
const positive=planted.map(p=>{
  const s=scan(p.ciphertext),w=s.bestTrain,k=p.trueKey;
  assert.equal(w.row,k.row);assert.equal(w.offset,k.offset);
  assert.equal(w.sign,k.sign);assert.equal(w.rev,k.rev);
  assert.deepEqual(decode(p.ciphertext,w),p.plain);
  assert.deepEqual(encrypt(p.plain,w),p.ciphertext);
  return {layoutPage:p.layoutPage,runes:p.plain.length,knownLanguageBigram:score(p.plain),
    trueKey:k,selectedKey:w,exactDecryption:true,exactReencryption:true};
});
const actual=originals.map(x=>({page:x.page,runes:x.cipher.length,
  rawScore:score(x.cipher),...scan(x.cipher)}));
const solved=gp.pages.filter(p=>p.page===56||p.page===57).map(p=>({page:p.page,score:score(p.indices)}));
console.log(JSON.stringify({status:"FINISHED",source:"GIMP 2.8 fixed GRand seed 314159265",
  totalOriginalCandidates:2*4096*nOffset*4,
  sourceRegister:"Shakespeare first300k GP bigram; Gibran heldout plants",
  plantRecovered:true,positive,actual,solvedPageScores:solved,
  elapsedMs:Date.now()-t0,
  qualification:"Excludes only this fixed-row short-offset additive cipher on these two pages. No original plaintext or cryptographic key recovered."},null,2));
