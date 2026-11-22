"use strict";
/**
 * Train-only GP-native conditional bigram coordinate ascent for unknown 225
 * key digits in the exact reversible four-marker cipher. An original p0..27
 * fitted key is FROZEN on p28..55. Independently seeded solved-Cicada
 * plaintext plants verify recovery and heldout source-language power.
 *
 * Unigram column ML comes from period225_key_recovery.cjs. No original
 * plaintext may be asserted without withheld source-language evidence.
 * Run: node sims/contextual_marker29_bigram225_key_recovery.cjs
 */
const assert=require("node:assert/strict");
const {alphabet,encrypt,decrypt}=
  require("./contextual_marker29_reversible.cjs");
const {records,recover,original,pageLocal,pageIndex,first,source,red,pages,logPrior}=
  require("./contextual_marker29_period225_key_recovery.cjs");
const N=original.length,MOD=29,PERIOD=225,WT=.75;
assert.equal(N,12956);assert.equal(source.length,3248);
const mod=(a,n)=>(a%n+n)%n;
const pair=new Float64Array(MOD*MOD).fill(.5);
for(let i=1;i<source.length;i++)pair[source[i-1]*MOD+source[i]]++;
const biLog=new Float64Array(MOD*MOD);
for(let a=0;a<MOD;a++){
  let total=0;
  for(let b=0;b<MOD;b++)total+=pair[a*MOD+b];
  for(let b=0;b<MOD;b++)
    biLog[a*MOD+b]=Math.log(pair[a*MOD+b]/total);
}
const direct=clock=>({repr:"index",reverse:false,clock,sign:1,phase:0});
/** @param {ArrayLike<number>} cipher */
function table(cipher){
  const candidates=new Array(N);
  for(const rec of records(cipher)){
    const options=new Uint8Array(MOD);
    for(let k=0;k<MOD;k++)
      options[k]=rec.first?mod(rec.rank-k,MOD):
        rec.symbols[mod(rec.rank-k,rec.radix)];
    candidates[rec.i]=options;
  }
  for(let i=0;i<N;i++)if(candidates[i]===undefined){
    assert.ok(!first[i]);
    const delta=mod(cipher[i]-cipher[i-1],MOD);
    const res=alphabet(cipher,i);
    const marker=[...res.reserved].find(([,d])=>d===delta);
    assert.ok(marker);
    candidates[i]=new Uint8Array(MOD).fill(marker[0]);
  }
  return candidates;
}
/** @param {Uint8Array[]} lookup @param {number[]} keys @param {string} clock */
function plaintext(lookup,keys,clock){
  const out=new Uint8Array(N);
  for(let i=0;i<N;i++)
    out[i]=lookup[i][keys[(clock==="global"?i:pageLocal[i])%keys.length]];
  return out;
}
/**
 * @param {Uint8Array[]} lookup
 * @param {Uint8Array} plain
 * @param {boolean} train
 */
function score(lookup,plain,train){
  let uni=0,bi=0,n=0,m=0;
  for(let i=0;i<N;i++){
    if((pageIndex[i]<28)!==train)continue;
    uni+=logPrior[plain[i]];n++;
    if(pageLocal[i]>0){
      bi+=biLog[plain[i-1]*MOD+plain[i]];m++;
    }
  }
  return {meanUnigram:uni/n,meanConditionalBigram:bi/m,
    nSymbols:n,nBigram:m,meanObjective:(WT*uni+bi)/m};
}
/**
 * @param {number[]} cipher
 * @param {"global"|"page"} clock
 * @param {number} [passes]
 */
function fit(cipher,clock,passes=6){
  const unigrams=recover(cipher,clock,PERIOD);
  const lookup=table(cipher),key=unigrams.key.slice();
  const positions=Array.from({length:PERIOD},()=>[]);
  for(let i=0;i<N;i++)if(pageIndex[i]<28){
    const col=(clock==="global"?i:pageLocal[i])%PERIOD;
    positions[col].push(i);
  }
  const p=plaintext(lookup,key,clock);
  const trace=[score(lookup,p,true).meanObjective];
  for(let pass=0;pass<passes;pass++){
    let changed=0;
    for(let col=0;col<PERIOD;col++){
      let bestKey=key[col],bestGain=0;
      for(let k=0;k<MOD;k++){
        if(k===key[col])continue;
        let gain=0;
        for(const i of positions[col]){
          const old=p[i],next=lookup[i][k];
          if(old===next)continue;
          gain+=WT*(logPrior[next]-logPrior[old]);
          if(pageLocal[i]>0)
            gain+=biLog[p[i-1]*MOD+next]-
              biLog[p[i-1]*MOD+old];
          if(i+1<N&&pageLocal[i+1]>0)
            gain+=biLog[next*MOD+p[i+1]]-
              biLog[old*MOD+p[i+1]];
        }
        if(gain>bestGain+1e-10){bestGain=gain;bestKey=k;}
      }
      if(bestKey!==key[col]){
        key[col]=bestKey;changed++;
        for(const i of positions[col])p[i]=lookup[i][bestKey];
      }
    }
    trace.push(score(lookup,p,true).meanObjective);
    if(changed===0)break;
  }
  const frozen=plaintext(lookup,key,clock);
  const initial=plaintext(lookup,unigrams.key,clock);
  return {
    clock,key,trainTrace:trace,changedKeyDigits:key.filter(
      (k,i)=>k!==unigrams.key[i]).length,
    unigramSeed:{training:score(lookup,initial,true),
      frozenHoldout:score(lookup,initial,false)},
    refined:{training:score(lookup,frozen,true),
      frozenHoldout:score(lookup,frozen,false)},
    recovered:frozen
  };
}
/** @param {number} seed */
function random32(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function plant(rand){
  const p=new Uint8Array(N);
  let at=0;
  for(const page of pages){
    const offset=rand()%source.length;
    for(let j=0;j<page.indices.length;j++)
      p[at+j]=source[(offset+j)%source.length];
    at+=page.indices.length;
  }
  assert.equal(at,N);
  return p;
}
/** @param {ArrayLike<number>} a @param {ArrayLike<number>} b */
function heldoutAccuracy(a,b){
  let same=0,n=0;
  for(let i=0;i<N;i++)if(pageIndex[i]>=28){
    same+=Number(a[i]===b[i]);n++;
  }
  return {same,eligible:n,accuracy:same/n};
}
function run(){
  const originalGlobal=fit(original,"global");
  const originalPage=fit(original,"page");
  assert.deepEqual(Array.from(encrypt(originalGlobal.recovered,direct("global"),
    originalGlobal.key)),original);
  assert.deepEqual(Array.from(encrypt(originalPage.recovered,direct("page"),
    originalPage.key)),original);
  const r=random32(0xbeeff00d),positive=[];
  for(let i=0;i<4;i++){
    const p=plant(r),c=encrypt(p,direct("global"),red);
    const fitted=fit(c,"global");
    const round=encrypt(fitted.recovered,direct("global"),fitted.key);
    assert.deepEqual(round,c);
    const oracle=decrypt(c,direct("global"),red);
    assert.deepEqual(oracle,p);
    positive.push({keyDigitsCorrect:fitted.key.filter((x,j)=>x===red[j]).length,
      holdoutAccuracy:heldoutAccuracy(fitted.recovered,p),
      seededHoldout:fitted.unigramSeed.frozenHoldout,
      refinedHoldout:fitted.refined.frozenHoldout});
  }
  return {
    cipher:"reversible four-marker GP29 with 225 arbitrary repeating pad symbols",
    source:{runes:N,trainPages:"0..27",untouchedPages:"28..55",
      solvedAuthorGP:source.length,conditionalBigramWeight:1,
      unigramWeight:WT},
    original:{
      global:{clock:originalGlobal.clock,
        trainTrace:originalGlobal.trainTrace,
        changedKeyDigits:originalGlobal.changedKeyDigits,
        unigramSeed:originalGlobal.unigramSeed,
        refined:originalGlobal.refined},
      page:{clock:originalPage.clock,
        trainTrace:originalPage.trainTrace,
        changedKeyDigits:originalPage.changedKeyDigits,
        unigramSeed:originalPage.unigramSeed,
        refined:originalPage.refined}
    },
    positive:{seed:"0xbeeff00d",examples:positive},
    caveat:"Original full ciphertext forward roundtrip is an algebraic identity under arbitrary fitted key; genuine decryption requires independent readable heldout language."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={table,plaintext,score,fit,run};
