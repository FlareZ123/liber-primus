"use strict";
/**
 * A combined original-source attempt: GIMP 2.8's COMPLETE 4096-row GRand
 * table as a nonzero-step/transparent-EA prime-field GP28 key, tested on the
 * two independent five-dot source pages.
 *
 * C0 = transmitted page seed. For i>=1:
 *   if P_i == EA(28), C_i=C_(i-1);
 *   otherwise C_i = C_(i-1)+15^((P_i+sgn*K_i)mod28) mod29.
 * K_i = (GIMP-row-rng-output mod 28) at one fixed short offset, traversed
 * forward or backwards. This is exact and invertible for EVERY 29-symbol
 * plaintext rune, including EA; the transmitted page seed is recovered C0.
 * We scan all 4096 row states, offsets 0..64, signs and directions. Freeze
 * the 104-rune training winner and inspect authentic heldout suffix.
 *
 * Independently encrypted GP-language plants verify correct full key,
 * plaintext, EA markers and reencryption on identical page-sized layouts.
 * No cipher interpretation is asserted without authentic readable plaintext.
 * Reproduce: node sims/gimp_dissolve_fullstep_source_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {GRand,draws,encodeGP}=require("./gimp_dissolve_directpad.cjs");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare=encodeGP(read("resources/control/shakespeare_first300k.txt"));
const gibran=encodeGP(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(shakespeare.length,217644);
const M=29,Q=28,L=104,KEY_OFFSETS=65;
const LOG=new Int8Array(M).fill(-1),EXP=new Uint8Array(Q);
for(let k=0,x=1;k<Q;k++,x=x*15%M){LOG[x]=k;EXP[k]=x;}
assert.equal(new Set(EXP).size,Q);
const hist=new Uint32Array(M*M),tot=new Uint32Array(M);
for(let i=1;i<shakespeare.length;i++){const a=shakespeare[i-1],b=shakespeare[i];hist[M*a+b]++;tot[a]++;}
const scores=new Float64Array(M*M);
for(let a=0;a<M;a++)for(let b=0;b<M;b++)scores[M*a+b]=Math.log((hist[M*a+b]+.3)/(tot[a]+8.7));
const rowSeeds=draws(314159265,4096);
assert.deepEqual(rowSeeds.slice(0,3),[3721122731,618219707,807213306]);
const keys=rowSeeds.map(seed=>{const g=new GRand(seed),key=new Uint8Array(350);for(let i=0;i<key.length;i++)key[i]=g.nextUint32()%Q;return key;});
const real=[7,23].map(p=>({page:p,c:gp.pages.find(x=>x.page===p).indices}));
assert.deepEqual(real.map(x=>x.c.length),[208,213]);
/** @typedef {{row:number,offset:number,sgn:number,reverse:boolean,score:number}} Candidate */
/** @param {number[]} ciphertext @param {Candidate} model */
function inverse(ciphertext,model){
  const out=[ciphertext[0]],key=keys[model.row],n=ciphertext.length;
  for(let i=1;i<n;i++){
    const delta=(ciphertext[i]-ciphertext[i-1]+29)%29;
    if(!delta){out.push(28);continue;}
    const p=LOG[delta]-model.sgn*key[model.offset+(model.reverse?n-1-i:i)];
    out.push((p%28+28)%28);
  }
  return out;
}
/** @param {number[]} plain @param {Candidate} model */
function forward(plain,model){
  const out=[plain[0]],key=keys[model.row],n=plain.length;
  for(let i=1;i<n;i++){
    const p=plain[i],delta=p===28?0:EXP[(p+model.sgn*key[model.offset+(model.reverse?n-1-i:i)])%28];
    out.push((out[i-1]+delta)%29);
  }
  return out;
}
/** @param {number[]} stream @param {number} start */
function score(stream,start=2){
  let sum=0;
  for(let i=start;i<stream.length;i++)sum+=scores[29*stream[i-1]+stream[i]];
  return sum/(stream.length-start);
}
/** @param {number[]} c */
function exhaustive(c){
  /** @type {Candidate[]} */
  const top=[];
  for(let row=0;row<4096;row++)for(let off=0;off<KEY_OFFSETS;off++)
  for(const sgn of [-1,1])for(const reverse of [false,true]){
    const key=keys[row];let sum=0,prev=-1;
    for(let i=1;i<L;i++){
      const d=(c[i]-c[i-1]+29)%29;
      const v=d?((LOG[d]-sgn*key[off+(reverse?c.length-1-i:i)])%Q+Q)%Q:28;
      if(i>=2)sum+=scores[29*prev+v];
      prev=v;
    }
    const train=sum/(L-2);
    if(top.length===32&&train<=top[31].score)continue;
    top.push({row,offset:off,sgn,reverse,score:train});
    top.sort((a,b)=>b.score-a.score);
    if(top.length>32)top.length=32;
  }
  const candidates=top.map(t=>{
    const p=inverse(c,t);
    return {...t,heldout:score(p,L),preview:p.slice(1,45).map(v=>gp.translit[v]).join("")};
  });
  return {candidatesTested:4096*KEY_OFFSETS*4,selectedByTrain:candidates[0],
    bestHeldoutAmong32:candidates.slice().sort((a,b)=>b.heldout-a.heldout).slice(0,2)};
}
const plantConfigs=[
  {row:277,offset:31,sgn:-1,reverse:false,score:0},
  {row:3901,offset:53,sgn:+1,reverse:true,score:0}
];
const t0=Date.now();
const positives=real.map((rec,i)=>{
  const plain=gibran.slice(i?12000:3000,(i?12000:3000)+rec.c.length);
  assert.equal(plain.length,rec.c.length);
  const c=forward(plain,plantConfigs[i]);
  assert.deepEqual(inverse(c,plantConfigs[i]),plain);
  const result=exhaustive(c),selected=result.selectedByTrain;
  assert.equal(selected.row,plantConfigs[i].row);assert.equal(selected.offset,plantConfigs[i].offset);
  assert.equal(selected.sgn,plantConfigs[i].sgn);assert.equal(selected.reverse,plantConfigs[i].reverse);
  assert.deepEqual(inverse(c,selected),plain);
  assert.deepEqual(forward(inverse(c,selected),selected),c);
  return {layoutPage:rec.page,originalSizedRunes:rec.c.length,
    markerEA:plain.slice(1).filter(x=>x===28).length,
    hidden:plantConfigs[i],selected,exactInverse:true,exactReencryption:true};
});
const actual=real.map(rec=>({page:rec.page,n:rec.c.length,
  repeatedCipherEdges:rec.c.slice(1).filter((v,j)=>v===rec.c[j]).length,
  ...exhaustive(rec.c)}));
console.log(JSON.stringify({status:"PASS",model:"GIMP-4096/GP28-F29/EAtag",
  sourceRootSeed:314159265,positive:positives,actual,
  knownClearLP2p57GPBigram:score(gp.pages.find(x=>x.page===57).indices),
  elapsedMs:Date.now()-t0,
  conclusion:"No authentic LP2 plaintext or key recovered within this finite family. The planted source-native full 29-ary invertible GP28 step transducer recovers both secret configs exactly."},null,2));
