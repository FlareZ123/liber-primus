// F-transparent p55 recovery under Parable-derived Blum-square GP29 pads.
// Exhausts all modular states, two additive signs and all observed F bypass masks.
// Windows Node22: node sims/lp2_p55_parable_bbs_allstate_ftransparent_sft.cjs
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {buildSourceNativeTrigramModel}=require('./lp1_source_native_trigram_model.cjs');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ref=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const model=buildSourceNativeTrigramModel({corpus,referenceText:ref});
const target=corpus.pages.find(p=>p.page===55).indices.slice(1);
const clear=corpus.pages.find(p=>p.page===57).indices.slice(0,75);
assert.equal(target.length,75);
const zeroPositions=target.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(zeroPositions,[14,24,40]);
const Q=29,M=1259*1031,controlState=1229**2%M;
const n=35;
const train=model.training;
const bi=new Int32Array(Q*Q),tri=new Int32Array(Q*Q*Q),logp=new Float64Array(Q*Q*Q);
for(let i=2;i<train.length;i++){const j=Q*train[i-2]+train[i-1];bi[j]++;tri[Q*j+train[i]]++;}
for(let j=0;j<Q*Q;j++)for(let z=0;z<Q;z++)logp[Q*j+z]=Math.log((tri[Q*j+z]+1)/(bi[j]+Q));

/** @param {number[]} a @returns {number} */
function score(a){
 let x=0;
 for(let i=2;i<a.length;i++)x+=logp[Q*(Q*a[i-2]+a[i-1])+a[i]];
 return x/(a.length-2);
}
assert.ok(Math.abs(score(clear)-model.scoreStream(clear).mean)<1e-12);

/**
 * Source-unselected but fixed conventional 5-bit MSB modulo29 BBS pad.
 * A secret initial state covers every seed and finite clock skip.
 * @param {number} state
 * @param {number} length
 * @returns {number[]}
 */
function pad(state,length){
 const out=[];
 for(let i=0;i<length;i++){
  let v=0;
  for(let j=0;j<5;j++){state=state*state%M;v=(v<<1)|(state&1);}
  out.push(v%Q);
 }
 return out;
}

/**
 * Interpret ciphertext F as a literal F (no key clock) according to the
 * supplied source-position mask, or as an encrypted non-F rune.
 * For a non-F cipher symbol, plaintext F is prohibited by the published
 * p56 transparency rule. An invalid branch returns null.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {number} mask
 * @param {number[]} fSites
 * @returns {number[] | null}
 */
function inverse(cipher,key,sign,mask,fSites){
 const fMap=new Map(fSites.map((position,j)=>[position,j]));
 const out=[];
 let clock=0;
 for(let i=0;i<cipher.length;i++){
  if(cipher[i]===0 && (mask&(1<<fMap.get(i)))){
   out.push(0);
  }else{
   const p=(cipher[i]+sign*key[clock]+Q)%Q;
   if(p===0)return null;
   out.push(p);
   clock++;
  }
 }
 return out;
}

/** @param {{state:number,sign:number,mask:number,first35:number}[]} top */
function pushTop(top,x){
 if(top.length>=32&&x.first35<=top[top.length-1].first35)return;
 top.push(x);
 top.sort((a,b)=>b.first35-a.first35);
 if(top.length>32)top.pop();
}

// Source-native plant: unchanged p57 75 runes encrypted with the same
// bypass mechanism, recording every true F position and key consumption.
const positiveKey=pad(controlState,75);
let clock=0;
const plant=[];
const plantF=[];
for(let i=0;i<clear.length;i++){
 if(clear[i]===0){plant.push(0);plantF.push(i);}
 else{plant.push((clear[i]+positiveKey[clock++])%Q);}
}
const reconstructed=[];
clock=0;
for(let i=0;i<plant.length;i++){
 if(plantF.includes(i))reconstructed.push(0);
 else reconstructed.push((plant[i]-positiveKey[clock++]+Q)%Q);
}
assert.deepEqual(reconstructed,clear);
assert.ok(Math.abs(score(clear.slice(0,n))-model.scoreStream(clear.slice(0,n)).mean)<1e-12);

const best=[];
let atOrAboveClear=0;
let candidateBranches=0;
const clear35=score(clear.slice(0,n));
const front=target.slice(0,n);
const frontF=zeroPositions.filter(i=>i<n);
assert.deepEqual(frontF,[14,24]);
for(let state=0;state<M;state++){
 const key=pad(state,n);
 for(const sign of [-1,1])for(let mask=0;mask<4;mask++){
  const decoded=inverse(front,key,sign,mask,frontF);
  if(!decoded)continue;
  candidateBranches++;
  const first35=score(decoded);
  if(first35>=clear35)atOrAboveClear++;
  pushTop(best,{state,sign,mask,first35});
 }
}
const finalists=[];
for(const x of best){
 const key=pad(x.state,75);
 for(const tailMask of [0,1]){
  const mask=x.mask+(tailMask<<2);
  const decoded=inverse(target,key,x.sign,mask,zeroPositions);
  if(!decoded)continue;
  finalists.push({...x,mask,full:score(decoded),heldout:score(decoded.slice(n)),
    text:model.spell(decoded)});
 }
}
finalists.sort((a,b)=>b.first35-a.first35);
console.log(JSON.stringify({
 source:'original physical p55 75 complete-word runes with published p56 F transparency',
 stateModulus:M,states:M,additiveSigns:2,first35BypassMasks:4,
 zeroPositions,rankedFirst35OriginalBranches:candidateBranches,
 originalAtOrAboveIndependentClearP57:atOrAboveClear,
 independentClearP57First35Score:clear35,
 directNoBypassOriginalRawScore:score(target.slice(0,n)),
 first35Candidates:finalists.slice(0,12),
 positiveNativeControl:{source:'original clear p57 75 runes',state:controlState,
   literalFPositions:plantF,roundTrip:clear.length,
   first35Score:clear35,full75Score:score(clear)}
},null,2));
console.log('PASS: original p55 F-transparent Blum all-state inverse and p57 source plant');
