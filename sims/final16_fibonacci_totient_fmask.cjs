'use strict';
/**
 * LP2 pages 40–55: source-fixed 16-page Fibonacci-square initial prime
 * ordinals with solved-page-56 selective F interrupter. Infer the F-skip
 * mask by a finite Viterbi algorithm rather than treating every cipher-F
 * as a literal plaintext F. Score on independent GP-English bigrams.
 *
 * This is a source-constrained candidate, not an authenticated LP2 key.
 * Node.js 22, CommonJS, built-in modules only. No output files.
 * @module final16_fibonacci_totient_fmask
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {readSquare,clockwiseSpiral}=require('./fibonacci_prime_spiral.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');

const ROOT=path.join(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=55);
const LENGTHS=pages.map(p=>p.indices.length);
assert.equal(pages.length,16);
assert.equal(LENGTHS.reduce((a,b)=>a+b,0),3316);
assert.equal(LENGTHS[10],0,'Source physical p50 has no runes');
const printed=readSquare().flat();
const spiral=clockwiseSpiral().map(([r,c])=>readSquare()[r][c]);
const roots={
  'printed-row-major':printed,
  'clockwise-spiral':spiral
};
const sources={
  'p15-square-value':value=>value,
  'p15-prime-complement':value=>Math.abs(3301-value)
};
const settings=[];
for(const [order,sequence] of Object.entries(roots))
  for(const [basis,initial] of Object.entries(sources))
    for(const sign of [-1,1])
      settings.push({order,basis,sign,starts:sequence.map(initial)});
assert.equal(settings.length,8);
const MOD=29;
const mod=x=>(x%MOD+MOD)%MOD;

const MAX_PRIME_INDEX=9500;
const sieve=new Uint8Array(190001);
const primes=[];
for(let x=2;x<sieve.length&&primes.length<MAX_PRIME_INDEX;x++){
  if(sieve[x])continue;
  primes.push(x);
  if(x*x<sieve.length)
    for(let multiple=x*x;multiple<sieve.length;multiple+=x)sieve[multiple]=1;
}
assert.equal(primes.length,MAX_PRIME_INDEX);
assert.deepEqual(primes.slice(0,5),[2,3,5,7,11]);

const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const englishTrain=encode(source.slice(0,240000));
const englishHeld=encode(source.slice(240000));
assert.ok(englishHeld.length>=3316);
const heldoutPlain=englishHeld.slice(0,3316);
const marginal=new Float64Array(MOD).fill(0.5);
const pairs=Array.from({length:MOD},()=>new Float64Array(MOD).fill(0.5));
for(let i=0;i<englishTrain.length;i++){
  const current=englishTrain[i];
  marginal[current]++;
  if(i>0)pairs[englishTrain[i-1]][current]++;
}
const total=marginal.reduce((a,b)=>a+b,0);
const unigram=Array.from(marginal,count=>Math.log(count/total));
const bigram=pairs.map(row=>{
  const denom=row.reduce((a,b)=>a+b,0);
  return Array.from(row,count=>Math.log(count/denom));
});
/**
 * Encode with the actually solved p56 semantics: plaintext F emits literal
 * ciphertext F, does not consume the prime key, and other plaintext runes
 * consume one prime-totient step. One prime start per physical page.
 * @param {number[]} plain
 * @param {number} start 0-based prime ordinal
 * @param {-1|1} sign decryption convention P=C+sign*K
 */
function encrypt(plain,start,sign) {
  let clock=0;
  return plain.map(p=>{
    if(p===0)return 0;
    const key=primes[start+clock++]-1;
    return mod(p-sign*key);
  });
}
/** Exact inverse with source-prescribed skip positions. */
function decryptWithSkipMask(cipher,start,sign,skipMask) {
  assert.equal(cipher.length,skipMask.length);
  let clock=0;
  return cipher.map((c,i)=>{
    if(skipMask[i]){assert.equal(c,0);return 0;}
    return mod(c+sign*(primes[start+clock++]-1));
  });
}
/**
 * Exact max-product path inference over hidden literal-F choices; the
 * key-consumption clock is forced by the count of previous literal Fs.
 *
 * State (skip-count,previous plaintext symbol). All 29 possible prior
 * plaintext symbols are allowed without hidden source-language knowledge.
 * Only C=0 may be skipped, and P=0 must be skipped in this model.
 * @param {number[]} cipher
 * @param {number} start
 * @param {-1|1} sign
 */
function infer(cipher,start,sign) {
  if(!cipher.length)return {plain:[],mask:[],score:0,perRune:0,skips:0};
  const traces=[];
  let active=new Map([[-1,{score:0}]]);
  for(let i=0;i<cipher.length;i++){
    const next=new Map();
    const c=cipher[i];
    for(const [state,item] of active){
      const skips=state<0?0:Math.floor(state/MOD);
      const prev=state<0?-1:state%MOD;
      const clock=i-skips;
      assert.ok(start+clock<primes.length);
      const normalPlain=mod(c+sign*(primes[start+clock]-1));
      /** @param {number} p @param {boolean} literalF */
      const visit=(p,literalF)=>{
        const s=skips+Number(literalF);
        const nextState=s*MOD+p;
        const prob=prev<0?unigram[p]:bigram[prev][p];
        const score=item.score+prob;
        const prior=next.get(nextState);
        if(!prior || score>prior.score)
          next.set(nextState,{score,parent:state,plaintext:p,literalF});
      };
      if(normalPlain!==0)visit(normalPlain,false);
      if(c===0)visit(0,true);
    }
    if(!next.size)return {plain:[],mask:[],score:-Infinity,perRune:-Infinity,
      skips:0,impossibleAt:i};
    traces.push(next);
    active=next;
  }
  let bestState=-1,bestScore=-Infinity;
  for(const [state,item] of active)if(item.score>bestScore){
    bestScore=item.score;bestState=state;
  }
  const plain=new Array(cipher.length);
  const mask=new Array(cipher.length);
  let cursor=bestState;
  for(let i=cipher.length-1;i>=0;i--){
    const item=traces[i].get(cursor);
    assert.ok(item);
    plain[i]=item.plaintext;
    mask[i]=item.literalF;
    cursor=item.parent;
  }
  assert.deepEqual(encrypt(plain,start,sign),cipher,
    'Inferred path must reproduce every unchanged original ciphertext rune');
  return {plain,mask,score:bestScore,perRune:bestScore/cipher.length,
    skips:mask.filter(Boolean).length};
}
const TRAIN_PAGES=4;
const TRAIN_COUNT=LENGTHS.slice(0,TRAIN_PAGES).reduce((a,b)=>a+b,0);
assert.equal(TRAIN_COUNT,1050);
/**
 * Evaluate all original pages using the same fixed per-page key roots.
 * Train only from original p40–43; untouched p44–55 has no fitted settings.
 * @param {number[][]} cipherPages
 */
function score(cipherPages){
  assert.deepEqual(cipherPages.map(x=>x.length),LENGTHS);
  const output=[];
  for(const setting of settings){
    const decoded=cipherPages.map((page,i)=>
      infer(page,setting.starts[i],setting.sign));
    const training=decoded.slice(0,TRAIN_PAGES);
    const held=decoded.slice(TRAIN_PAGES);
    const trainLL=training.some(x=>x.impossibleAt!==undefined) ? -Infinity :
      training.reduce((s,x)=>s+x.score,0)/TRAIN_COUNT;
    const heldLL=held.some(x=>x.impossibleAt!==undefined) ? -Infinity :
      held.reduce((s,x)=>s+x.score,0)/(3316-TRAIN_COUNT);
    output.push({setting,decoded,trainLL,heldLL,
      heldoutCount:3316-TRAIN_COUNT,
      skips:decoded.reduce((n,x)=>n+x.skips,0)});
  }
  output.sort((a,b)=>a.trainLL===b.trainLL?0:(a.trainLL>b.trainLL?-1:1));
  return output;
}
/** @param {ReturnType<typeof score>[number]} result */
function summary(result){
  return {order:result.setting.order,basis:result.setting.basis,
    sign:result.setting.sign,trainLL:result.trainLL,
    heldLL:result.heldLL,skips:result.skips,
    selectedPageSkips:result.decoded.map(x=>x.skips),
    impossiblePages:result.decoded.map((x,i)=>x.impossibleAt===undefined?null:
      ({page:pages[i].page,localOffset:x.impossibleAt})).filter(Boolean),
    startPrimes:result.setting.starts};
}
const excerpt='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
function p56AuthenticWitness(){
  const original=corpus.pages.find(x=>x.page===56).indices;
  const gpTokens=corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const decoded=[];
  for(const word of excerpt.split(' '))for(let i=0;i<word.length;){
    const match=gpTokens.find(x=>word.startsWith(x.token,i));
    assert.ok(match,'Solved p56 word not transcribable as GP: '+word);
    decoded.push(match.index);
    i+=match.token.length;
  }
  assert.equal(original.length,85);
  assert.equal(decoded.length,85);
  const expected=encrypt(decoded,0,-1);
  assert.deepEqual(expected,original,'p56 authentic solved page is source cipher positive control');
  const mask=decoded.map(x=>x===0);
  const markerPos=mask.map((v,i)=>v?i:-1).filter(x=>x>=0);
  assert.deepEqual(markerPos,[56]);
  assert.deepEqual(decryptWithSkipMask(original,0,-1,mask),decoded);
  const blind=infer(original,0,-1);
  const correct=decoded.filter((v,i)=>v===blind.plain[i]).length;
  return {cipherRunes:original.length,realGpRunes:decoded.length,
    authenticLiteralFPositions:markerPos,
    exactWithSourceMask:true,
    blindRecovered:correct,
    blindRecoveredRate:correct/85,
    blindPredictedSkipPositions:blind.mask.map((v,i)=>v?i:-1).filter(x=>x>=0),
    blindPerRune:blind.perRune};
}
function run(){
  const authentic=p56AuthenticWitness();
  const original=score(pages.map(p=>p.indices));
  const truth=settings.find(s=>s.order==='printed-row-major'&&
    s.basis==='p15-square-value'&&s.sign===-1);
  assert.ok(truth);
  let pos=0;
  const knownPlain=pages.map(p=>heldoutPlain.slice(pos,pos+=p.indices.length));
  assert.equal(pos,3316);
  const planted=knownPlain.map((p,i)=>encrypt(p,truth.starts[i],truth.sign));
  for(let i=0;i<16;i++)
    assert.deepEqual(decryptWithSkipMask(planted[i],truth.starts[i],truth.sign,
      knownPlain[i].map(x=>x===0)),knownPlain[i]);
  const plantResults=score(planted);
  const found=plantResults.findIndex(x=>x.setting===truth);
  const winner=plantResults[0];
  const sourceBest=plantResults[found];
  const decoded=sourceBest.decoded.flatMap(x=>x.plain);
  const matched=decoded.filter((v,i)=>v===heldoutPlain[i]).length;
  assert.ok(found===0,'Planted p15 roots must rank first among eight source-frozen keys');
  assert.ok(matched>0.85*3316,'Inferred hidden F masks should recover the known GP language');
  const realBest=original[0];
  const fullyReversibleOriginal=original.filter(x=>x.decoded.every(d=>
    d.impossibleAt===undefined));
  const result={
    classification:'Original-source finite inverse, not an authenticated LP2 key or decryption',
    source:{physicalPages:'40..55',runes:3316,primeStarts:'p15 red-centered Fibonacci-prime 4x4 square',
      sourceOrderOptions:Object.keys(roots),primeStartOptions:Object.keys(sources),
      cipherSigns:[-1,1],keyChoices:settings.length},
    exactSolvedSourceControl:authentic,
    original:{trainedOn:'physical 40–43, 1050 runes',heldout:'physical 44–55, 2266 runes',
      fullyReversibleOriginalModels:fullyReversibleOriginal.length,
      winning:summary(realBest),topThree:original.slice(0,3).map(summary),
      allSourceCases:original.map(summary),
      first40DecodedGp:realBest.decoded[0].plain.slice(0,40).map(v=>corpus.translit[v]).join('')},
    hiddenFPlant:{trueSource:summary(sourceBest),
      selectedKeyRank:found+1,
      originalEnglishRunes:3316,
      recoveredHiddenPathRunes:matched,
      recoveredFraction:matched/3316,
      exactForwardReencryption:true,
      firstMaskPositions:sourceBest.decoded[0].mask.map((x,i)=>x?i:-1).filter(x=>x>=0)},
    limits:'Ciphertext F may be skipped iff plaintext F; every non-F consumes one prime. Physical pages reset the key. Source-derived starts are 0-based prime ordinals. This does not cover a different Gp alphabet, hidden reset rule or multilayer cipher.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,encrypt,decryptWithSkipMask,infer,score};
