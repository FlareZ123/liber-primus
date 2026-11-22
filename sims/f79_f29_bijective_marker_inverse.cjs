"use strict";
/**
 * Original LP2 reversible F79-F29 29-rune successor-cipher test, including
 * all 28! possible shared alphabet relabelings and source-English controls.
 * Source red quotients 15 and 22 generate F79 Fibonacci period 78.
 * F29 primitive root 15 parametrizes the 28 nonzero successor differences.
 * A fixed GP rune EA is the unchanged-output event. Model is bijective.
 *
 * Train on 1,448 LP2 words, freeze on another 1,448; original page heads are
 * unencoded seeds. A planted unknown alphabet must decode and re-encode.
 * Run: node sims/f79_f29_bijective_marker_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {words:encodeWords,flatten,category,training} =
  require("./outer_permutation_word_context.cjs");
const {assignmentMax,seededRandom,shuffledPermutation} =
  require("./outer_permutation_assignment.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalPages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const all=originalPages.flatMap(p=>p.indices.map((r,local)=>({r,page:p.page,local})));
const id=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parseSharedCorpus().words;
const layout=[];let off=0;
for(const word of words){const row=[];for(const c of word.runes){const entry=all[off++];assert.equal(entry.r,id.get(c));row.push(entry);}layout.push(row);}
assert.equal(off,12956);assert.equal(layout.length,2896);
const source=encodeWords(read("resources/control/shakespeare_first300k.txt"));
const model=training(flatten(source.slice(0,30000)));
const controlSource=source.slice(30000);
const M=29,Q=28,MARK=28,HALF=1448;
const mod=(v,m)=>(v%m+m)%m;
const log=new Int16Array(M).fill(-1),pow=[];
for(let i=0,x=1;i<Q;i++,x=x*15%M){assert.equal(log[x],-1);log[x]=i;pow.push(x);}
const F=[15,22];for(let i=2;i<80;i++)F.push((F[i-1]+F[i-2])%79);
assert.deepEqual(F.slice(78),[15,22]);F.length=78;
const dlog79=v=>{if(!v)return 0;let x=1;for(let i=0;i<78;i++,x=x*53%79)if(x===v)return i%Q;throw Error("Field log");};
const family={
  residue:F.map(v=>v%Q),scaled:F.map(v=>Math.floor(Q*v/79)),
  difference:F.map((v,i)=>mod(F[(i+1)%78]-v,Q)),fieldlog:F.map(dlog79)
};
const configs=[];
for(const [name,key] of Object.entries(family))
for(const sign of [-1,1])
for(const reset of ["page","word","continuous"])
for(const phase of [0,15,22,53])
for(const advance of [false,true])
configs.push({name,key,sign,reset,phase,advance});
assert.equal(configs.length,192);
const names=Array.from(new Set(layout.flatMap(w=>w.map((_,j)=>category(w.length,j)))));
const categoryId=new Map(names.map((s,i)=>[s,i]));
const categories=layout.map(w=>w.map((_,j)=>categoryId.get(category(w.length,j))));
const likelihoods=names.map(name=>model.logProb[name]||model.prior.map(Math.log));
/**
 * @param {Array<Array<{r:number,page:number,local:number}>>} text
 * @param {typeof configs[number]} cfg
 */
function inverse(text,cfg){
  const out=[];let pointer=0,prev=-1;
  for(const word of text){
    if(cfg.reset==="word")pointer=0;
    const row=[];
    for(const item of word){
      if(item.local===0){if(cfg.reset==="page")pointer=0;prev=item.r;row.push(-2);continue;}
      if(item.r===prev){row.push(-1);if(cfg.advance)pointer++;}
      else{const e=log[mod(item.r-prev,M)];assert(e>=0);
        row.push(mod(e-cfg.sign*cfg.key[(pointer+cfg.phase)%78],Q));pointer++;}
      prev=item.r;
    }
    out.push(row);
  }
  return out;
}
/** Global optimum of unrestricted 28-symbol bijection under positional unigram. */
function fit(R){
  const hist=Array.from({length:Q},()=>new Uint32Array(names.length));
  for(let i=0;i<HALF;i++)for(let j=0;j<R[i].length;j++){
    const d=R[i][j];if(d>=0)hist[d][categories[i][j]]++;
  }
  const weights=Array.from({length:Q},()=>Array(Q).fill(0));
  for(let d=0;d<Q;d++)for(let g=0;g<Q;g++)
  for(let c=0;c<names.length;c++)weights[d][g]+=hist[d][c]*likelihoods[c][g];
  return assignmentMax(weights).assignment;
}
function score(R,sigma,start,end,plain=null){
  let sum=0,n=0,exact=0,marker=0;
  for(let i=start;i<end;i++)for(let j=0;j<R[i].length;j++){
    const d=R[i][j];if(d===-2)continue;
    const p=d===-1?MARK:sigma[d];
    sum+=likelihoods[categories[i][j]][p];n++;
    if(d===-1)marker++;
    if(plain&&p===plain[i][j])exact++;
  }
  return {mean:sum/n,n,marker,exact};
}
function screen(text){
  const rec=configs.map(cfg=>{
    const R=inverse(text,cfg),sigma=fit(R);
    return {cfg,sigma,train:score(R,sigma,0,HALF),test:score(R,sigma,HALF,layout.length)};
  });
  rec.sort((a,b)=>b.train.mean-a.train.mean);
  const report=r=>({source:r.cfg.name,sign:r.cfg.sign,reset:r.cfg.reset,
    phase:r.cfg.phase,advanceRepeat:r.cfg.advance,
    train:r.train.mean,heldout:r.test.mean,heldoutRunes:r.test.n,
    heldoutMarkers:r.test.marker});
  return {best:rec[0],chosen:report(rec[0]),
    postselected:report(rec.slice().sort((a,b)=>b.test.mean-a.test.mean)[0])};
}
/** Exact source-key forward cipher with a uniformly random secret 28! alphabet. */
function plant(cfg){
  const rng=seededRandom(0x02153301);
  const sigma=shuffledPermutation(Array.from({length:Q},(_,i)=>i),rng);
  const inverted=new Map(sigma.map((v,i)=>[v,i]));
  const byLen=new Map();
  for(const word of controlSource){if(!byLen.has(word.length))byLen.set(word.length,[]);byLen.get(word.length).push(word);}
  const P=layout.map(w=>{
    const b=byLen.get(w.length);
    return b?.length?b[Math.floor(rng()*b.length)].slice():w.map(()=>Math.floor(rng()*M));
  });
  const C=[];let prev=-1,pointer=0;
  for(let i=0;i<layout.length;i++){
    if(cfg.reset==="word")pointer=0;
    const row=[];
    for(let j=0;j<layout[i].length;j++){
      const sourceItem=layout[i][j];
      if(sourceItem.local===0){
        if(cfg.reset==="page")pointer=0;
        prev=Math.floor(rng()*M);
        row.push({...sourceItem,r:prev});continue;
      }
      const p=P[i][j];let c;
      if(p===MARK){c=prev;if(cfg.advance)pointer++;}
      else{const d=inverted.get(p);assert(d!==undefined);
        c=mod(prev+pow[mod(d+cfg.sign*cfg.key[(pointer+cfg.phase)%78],Q)],M);pointer++;}
      row.push({...sourceItem,r:c});prev=c;
    }
    C.push(row);
  }
  const R=inverse(C,cfg);
  for(let i=0;i<layout.length;i++)for(let j=0;j<layout[i].length;j++){
    if(layout[i][j].local===0)continue;
    assert.equal(R[i][j]===-1?MARK:sigma[R[i][j]],P[i][j]);
  }
  return {C,P,sigma};
}
function main(){
  const real=screen(layout);
  const trueCfg=configs.find(c=>c.name==="difference"&&c.sign===1&&
    c.reset==="page"&&c.phase===22&&c.advance);
  assert(trueCfg);
  const planted=plant(trueCfg),control=screen(planted.C);
  const decoded=inverse(planted.C,control.best.cfg);
  const test=score(decoded,control.best.sigma,HALF,layout.length,planted.P);
  const sigmaHits=control.best.sigma.filter((v,i)=>v===planted.sigma[i]).length;
  console.log(JSON.stringify({
    type:"exact reversible F79-F29 GP marker/inverse challenge",
    source:"LP2 12956 glyphs, 2896 words; Shakespeare 300k GP training",
    candidates:configs.length,marker:"EA",unencodedPageSeeds:55,
    real:{trainSelected:real.chosen,optimisticHoldoutSelected:real.postselected},
    planted:{trainSelected:control.chosen,heldoutExact:test.exact,
      heldoutEligible:test.n,secretPermutationMatches:sigmaHits,
      trueConfiguration:{source:trueCfg.name,reset:trueCfg.reset,phase:trueCfg.phase}},
    claim:"Finite source-cued candidate only; no plaintext claimed"
  },null,2));
}
if(require.main===module)main();
module.exports={inverse,plant,fit,screen};
