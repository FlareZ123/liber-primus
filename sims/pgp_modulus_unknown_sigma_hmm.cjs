'use strict';
/**
 * Two-layer source-constrained LP2 key attack: known Cicada RSA public-key
 * modulus bytes, completely arbitrary UNKNOWN output 29-rune permutation,
 * and exact marginalization over collision-triggered key-skipping.
 *
 * Unlike a direct unigram key search, no cipher rune is assumed to match its
 * Gematria Primus plaintext label. Learn a single cipher->hidden-symbol
 * permutation by exact 29x29 maximum-weight Hungarian matching on first
 * 16 runes of even-numbered pages, then score the entire 64-rune training
 * prefixes under a skip-marginalized forward HMM. Choose the key offset and
 * permutation using training pages alone. Apply the frozen parameters to
 * odd-numbered pages. All 512 offsets, both RSA moduli, three byte maps,
 * both additive signs are tested. A seeded real-English plant challenges the
 * exact same fitting and held-out evaluation pipeline.
 *
 * This is an identifiable finite test, not a claimed LP2 decryption.
 * Node.js 22, no packages or network.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {assignmentMax}=require('./outer_permutation_assignment.cjs');
const {keys:pgpKeys}=require('./pgp_modulus_skip_attack.cjs');
const {corpusWords}=require('./relative_key_english_probe.cjs');
const ROOT=path.join(__dirname,'..'),M=29,N=64,FIT=16,LIMIT=12,QSKIP=0.81;
const mod=x=>(x%M+M)%M;
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function source(){
  const text=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const train=corpusWords(text.slice(0,240000)).flat();
  const heldout=corpusWords(text.slice(240000)).flat();
  const counts=Array(M).fill(0.5);
  for(const c of train)counts[c]++;
  const total=counts.reduce((a,b)=>a+b,0);
  return {q:counts.map(v=>v/total),heldout,trainingRunes:train.length};
}
/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number[]} key
 * @param {number} offset
 * @param {number} sign
 * @param {number[]} q
 */
function fitPermutation(pages,key,offset,sign,q){
  const weights=Array.from({length:M},()=>Array(M).fill(0));
  const logq=q.map(Math.log);
  for(const {indices} of pages)
    for(let i=0;i<Math.min(FIT,indices.length);i++){
      const c=indices[i],k=key[(offset+i)%key.length];
      const row=weights[c];
      for(let g=0;g<M;g++)row[g]+=logq[mod(g-sign*k)];
    }
  return assignmentMax(weights);
}
/**
 * Exact forward model for a known candidate key and frozen outer inverse
 * sigma. At each rune either consume one key symbol or retry the same
 * plaintext rune using one additional key symbol after an output collision.
 * @param {number[]} page
 * @param {number[]} key
 * @param {number} offset
 * @param {number} sign
 * @param {number[]} q
 * @param {number[]} inv
 */
function likelihood(page,key,offset,sign,q,inv){
  let f=new Float64Array(LIMIT+1),next=new Float64Array(LIMIT+1),ll=0;
  f[0]=1;
  for(let i=0;i<Math.min(N,page.length);i++){
    const raw=page[i],c=inv[raw],prev=i?inv[page[i-1]]:-1;
    next.fill(0);
    for(let d=0;d<=Math.min(i,LIMIT);d++){
      const mass=f[d];
      if(mass===0)continue;
      const j=(offset+i+d)%key.length,k=key[j];
      next[d]+=mass*q[mod(c-sign*k)]*(c===prev?1-QSKIP:1);
      if(prev>=0&&d<LIMIT){
        const after=key[(j+1)%key.length];
        if(c===mod(prev+sign*(after-k)))
          next[d+1]+=mass*QSKIP*q[mod(prev-sign*k)];
      }
    }
    const total=next.reduce((a,b)=>a+b,0);
    assert.ok(total>0&&Number.isFinite(total));
    ll+=Math.log(total);
    for(let d=0;d<next.length;d++)f[d]=next[d]/total;
  }
  return ll;
}
/** @param {number[]} page */
function nullScore(page){
  const n=Math.min(N,page.length),repeat=86/12901;
  let z=-Math.log(M);
  for(let i=1;i<n;i++)
    z+=Math.log(page[i]===page[i-1]?repeat:(1-repeat)/28);
  return z;
}
/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number[]} key
 * @param {number} sign
 * @param {number[]} q
 */
function scan(pages,key,sign,q){
  const train=pages.filter(p=>p.page%2===0),heldout=pages.filter(p=>p.page%2===1);
  const trainNull=train.reduce((z,p)=>z+nullScore(p.indices),0);
  const heldoutNull=heldout.reduce((z,p)=>z+nullScore(p.indices),0);
  let best={training:-Infinity};
  for(let offset=0;offset<key.length;offset++){
    const fitted=fitPermutation(train,key,offset,sign,q);
    const inv=fitted.assignment;
    let training=-trainNull;
    for(const p of train)training+=likelihood(p.indices,key,offset,sign,q,inv);
    if(training>best.training)
      best={offset,training,inverse:inv,fitScore:fitted.score};
  }
  let heldoutScore=-heldoutNull;
  for(const p of heldout)
    heldoutScore+=likelihood(p.indices,key,best.offset,sign,q,best.inverse);
  return {offset:best.offset,trainLLR:Number(best.training.toFixed(5)),
    heldoutLLR:Number(heldoutScore.toFixed(5)),
    fittedAlphabet:best.inverse};
}
/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number[]} key
 * @param {number[]} english
 * @param {number} sign
 * @param {number} offset
 * @param {number} seed
 */
function plant(pages,key,english,sign,offset,seed){
  const rand=rng(seed),sigma=Array.from({length:M},(_,i)=>i);
  for(let i=M-1;i>0;i--){let j=Math.floor(rand()*(i+1));[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
  let retries=0;
  const data=pages.map(({page,indices})=>{
    const at=Math.floor(rand()*(english.length-indices.length-1));
    const output=[];
    let j=offset,previous=-1;
    for(let i=0;i<indices.length;i++){
      const p=english[at+i];
      let raw=sigma[mod(p+sign*key[j%key.length])];
      j++;
      if(previous>=0&&raw===previous&&rand()<QSKIP){
        raw=sigma[mod(p+sign*key[j%key.length])];
        j++;
        retries++;
      }
      output.push(raw);previous=raw;
    }
    return {page,indices:output};
  });
  return {data,offset,retries,sigma};
}
function main(){
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(pages.length,55);
  const known=source(),bytes=pgpKeys();
  const candidates=[];
  for(let id=0;id<2;id++)
    for(const map of ['mod','scaled','rejection']){
      const b=bytes[id];
      const key=map==='mod'?b.map(x=>x%M):
        map==='scaled'?b.map(x=>Math.floor(M*x/256)):
        b.filter(x=>x<232).map(x=>x%M);
      for(const sign of [1,-1])
        candidates.push({source:id?'subkey':'primary',map,sign,key});
    }
  const authentic=[];
  for(const c of candidates){
    const fitted=scan(pages,c.key,c.sign,known.q);
    authentic.push({source:c.source,map:c.map,sign:c.sign,
      offset:fitted.offset,training:fitted.trainLLR,heldout:fitted.heldoutLLR});
  }
  authentic.sort((a,b)=>b.heldout-a.heldout);
  const sourceKey=candidates[0];
  const positive=[];
  for(const seed of [3301,1033,2014,8451,31415]){
    const x=plant(pages,sourceKey.key,known.heldout,1,107,seed);
    const hit=scan(x.data,sourceKey.key,1,known.q);
    const recovered=hit.fittedAlphabet.filter((v,c)=>x.sigma[v]===c).length;
    positive.push({seed,offsetRecovered:hit.offset===107,
      chosenOffset:hit.offset,permutationLabelsRecovered:recovered,
      skips:x.retries,training:hit.trainLLR,heldout:hit.heldoutLLR});
  }
  return {
    model:'C=sigma(P + sign*K[j]) mod29; retry once using K[j+1] on adjacent collision with probability 0.81',
    candidateSources:'Cicada authenticated primary and subkey RSA4096 modulus bytes',
    setup:'GP English on first240k Shakespeare chars; true plaintext never used for training',
    training:'Even numbered pages; first16 rune letters for exact Hungarian sigma, then first64 for full skip-HMM offset',
    holdout:'Odd numbered pages; full 64 rune likelihood with frozen offset and sigma',
    trainSourceRunes:known.trainingRunes,
    targets:pages.length,
    keyVariants:12,
    original:authentic,
    control:'Independent heldout Shakespeare GP text; one unknown randomly permuted alphabet; authentic key and 81% repeated-symbol retry',
    positives:positive,
    actualDecryption:false
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={fitPermutation,likelihood,scan,plant,main};
