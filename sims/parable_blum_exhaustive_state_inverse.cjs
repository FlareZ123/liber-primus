"use strict";
/**
 * Entire reachable Blum-square state-space cryptanalysis, with no seed shortlist.
 *
 * The 2013 Cicada audio/761.MP3 metadata contains the product of the three
 * solved PARABLE clause primes 1259*1031*1229. The first two primes are both
 * 3 mod 4, producing a proper Blum modulus M=1,298,029.
 *
 * For x_{i+1}=x_i^2 mod M, exhaustive enumeration over every possible x0
 * reduces exactly to 325,080 distinct first post-square states x1. Enumerate
 * all of them; scan source-key GP29 addition and transparent-EA GP28 field
 * steps, both signs and four byte/bit interpretations, then freeze the best
 * head guesses and assess their untouched continuation on original LP2 page0.
 * This is a true full-state key search for the DECLARED family, not generic
 * cryptographic plaintext recovery.
 *
 * The 2013 metadata does not authenticate this as a historical cipher.
 * Run: node sims/parable_blum_exhaustive_state_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const modulus=1259*1031;
const alphabet=corpus.translit;
const MODE=["state-mod29","state-low8","fivebits-msb","fivebits-lsb"];
const FAM=["GP29-add","GP28-step"];
const SIGNS=[-1,1];
const head=90,continuation=110,total=head+continuation,KEEP=120;
assert.equal(modulus,1298029);
assert.equal(modulus*modulus<Number.MAX_SAFE_INTEGER,true);
const original=Uint8Array.from(corpus.pages[0].indices.slice(0,total));
assert.equal(original.length,total);
const log=new Int8Array(29).fill(-1),exp=new Uint8Array(28);
for(let i=0,v=1;i<28;i++){exp[i]=v;log[v]=i;v=(v*15)%29;}
assert.equal(log.slice(1).every(x=>x>=0),true);
const mod=(x,n)=>(x%n+n)%n;

/**
 * Distinct values of x1=x0*x0%modulus, including noncoprime seeds.
 * All source BBS state possibilities are in this finite exact set.
 */
function reachableStates(){
  const mark=new Uint8Array(modulus);
  for(let x=0;x<modulus;x++)mark[(x*x)%modulus]=1;
  const states=[];
  for(let y=0;y<mark.length;y++)if(mark[y])states.push(y);
  assert.equal(states.length,325080);
  return states;
}

/** @param {number} firstState @param {string} mode @param {number} length */
function keystream(firstState,mode,length=total){
  const pad=new Uint8Array(length);
  let x=firstState;
  for(let i=0;i<length;i++){
    if(mode==="state-mod29"){pad[i]=x%29;x=(x*x)%modulus;}
    else if(mode==="state-low8"){pad[i]=(x&255)%29;x=(x*x)%modulus;}
    else{
      let n=0;
      for(let b=0;b<5;b++){
        const bit=x&1;
        if(mode==="fivebits-lsb")n|=bit<<b;
        else n=(n<<1)|bit;
        x=(x*x)%modulus;
      }
      pad[i]=n%29;
    }
  }
  return pad;
}

/** Construct the exact GP29/GP28 source-key cipher. */
function transform(indices,key,family,sign,decrypt=false) {
  const result=new Uint8Array(indices.length);
  for(let i=0;i<result.length;i++){
    const current=indices[i],shift=key[i];
    if(family==="GP29-add")result[i]=mod(current+(decrypt?-sign:sign)*shift,29);
    else if(i===0)result[i]=current;
    else if(decrypt){
      const delta=mod(current-indices[i-1],29);
      result[i]=delta===0?28:mod(log[delta]-sign*shift,28);
    }else{
      result[i]=current===28?result[i-1]:
        mod(result[i-1]+exp[mod(current+sign*shift,28)],29);
    }
  }
  return result;
}

function score(cipher,key,family,sign,end=head){
  let prev2=-1,prev=-1,sum=0;
  for(let i=0;i<end;i++){
    const c=cipher[i],k=key[i];
    let p;
    if(family==="GP29-add")p=mod(c-sign*k,29);
    else if(i===0)p=c;
    else {
      const delta=mod(c-cipher[i-1],29);
      p=delta===0?28:mod(log[delta]-sign*k,28);
    }
    if(i===0)sum+=lm.unigram[p];
    else if(i===1)sum+=lm.bigram[prev*29+p];
    else sum+=lm.trigram[(prev2*29+prev)*29+p];
    prev2=prev;prev=p;
  }
  return sum/end;
}

/**
 * Fixed-capacity min heap for the exact 325080*4*2*2 search.
 * @param {object[]} heap
 * @param {object} hit
 */
function insert(heap,hit) {
  if(heap.length===KEEP) {
    if(hit.train<=heap[0].train)return;
    heap[0]=hit;
    let i=0;
    while(true){
      let a=2*i+1,b=a+1,child=i;
      if(a<heap.length&&heap[a].train<heap[child].train)child=a;
      if(b<heap.length&&heap[b].train<heap[child].train)child=b;
      if(child===i)break;
      [heap[i],heap[child]]=[heap[child],heap[i]];
      i=child;
    }
  }else{
    heap.push(hit);
    let i=heap.length-1;
    while(i>0){
      const j=Math.floor((i-1)/2);
      if(heap[j].train<=heap[i].train)break;
      [heap[i],heap[j]]=[heap[j],heap[i]];i=j;
    }
  }
}

function screen(cipher,states){
  const best=[];
    let totalChecks=0;
  for(const firstState of states){
    for(const mode of MODE){
      const key=keystream(firstState,mode,head);
      for(const family of FAM)for(const sign of SIGNS){
        const scoreVal=score(cipher,key,family,sign);
        insert(best,{state:firstState,mode,family,sign,train:scoreVal});
        totalChecks++;
      }
    }
  }
  assert.equal(totalChecks,states.length*MODE.length*FAM.length*SIGNS.length);
  best.sort((a,b)=>b.train-a.train);
  return {best,totalChecks};
}

/** Independent first-90 selection, only then look at subsequent 110 GP runes. */
function frozenContinuation(cipher,top) {
  const out=top.map(hit=>{
    const key=keystream(hit.state,hit.mode,total);
    const p=transform(cipher,key,hit.family,hit.sign,true);
    let tail=0;
    for(let i=head;i<total;i++){
      const prev=i>0?p[i-1]:0,prev2=i>1?p[i-2]:0;
      tail+=i===0?lm.unigram[p[i]]:
        i===1?lm.bigram[prev*29+p[i]]:
          lm.trigram[(prev2*29+prev)*29+p[i]];
    }
    const segment=p.slice(head,total);
    const hist=new Uint32Array(29);
    for(const value of segment)hist[value]++;
    let ioc=0;
    for(const n of hist)ioc+=n*(n-1);
    ioc/=segment.length*(segment.length-1);
    return {...hit,heldLog:tail/(total-head),heldIoC:ioc,
      headRunes:Array.from(p.slice(0,45),v=>alphabet[v]).join(""),
      heldRunes:Array.from(p.slice(head,head+40),v=>alphabet[v]).join("")};
  });
  return {rankedByTrain:out.slice(0,8),
    bestHeldoutPostselected:[...out].sort((a,b)=>b.heldLog-a.heldLog).slice(0,5)};
}

function positive(states){
  const native=encode(read("resources/control/shakespeare_first300k.txt").slice(210000));
  assert(native.length>total);
  const plaintext=Uint8Array.from(native.slice(0,total));
  const sourceSeed=3301;
  const startingSquare=(sourceSeed*sourceSeed)%modulus;
  const firstState=(startingSquare*startingSquare)%modulus;
  assert(states.includes(firstState));
  const trueModel={state:firstState,mode:"fivebits-msb",family:"GP28-step",sign:1};
  const key=keystream(firstState,trueModel.mode);
  const cipher=transform(plaintext,key,trueModel.family,trueModel.sign);
  assert.deepEqual(Array.from(transform(cipher,key,trueModel.family,trueModel.sign,true)),
    Array.from(plaintext));
  const found=screen(cipher,states);
  const top=found.best[0];
  // Many initial states can share a post-square trajectory. Require the
  // source-compatible exact planted key in the retained first-90 finalists.
  const matched=found.best.find(x=>Object.entries(trueModel).every(([k,v])=>x[k]===v));
  assert(matched,"exhaustive source BBS inverse failed to retain exact planted model");
  const realRecovered=transform(cipher,keystream(matched.state,matched.mode),
    matched.family,matched.sign,true);
  assert.deepEqual(Array.from(realRecovered),Array.from(plaintext));
  return {trueModel,topCandidate:top,exactPlantedRetainedRank:found.best.indexOf(matched)+1,
    originalShapedNativeGpRunes:total,exactRecoveredRunes:total,
    trueTrainScore:matched.train,
    selectedHeldout:frozenContinuation(cipher,found.best).rankedByTrain.slice(0,2)};
}

function main(){
  const states=reachableStates();
  const originalScan=screen(original,states);
  const originalResult=frozenContinuation(original,originalScan.best);
  const planted=positive(states);
  const summary={source:"Cicada 2013 761.MP3 Parable clause-prime product",
    factors:[1259,1031],modulus,allStartingStates:modulus,
    distinctReachableFirstStates:states.length,
    testedOriginalModels:originalScan.totalChecks,
    fourOutputFormats:MODE,emissionFamilies:FAM,signs:SIGNS,
    originalPhysicalPage:0,trainingRunes:head,heldoutRunes:continuation,
    originalTop:originalResult,
    independentPlanted:planted,
    baseline:"Native GP language needed on full source; no inferred key is authenticated by high short-window fit"};
  console.log(JSON.stringify(summary,null,2));
}
if(require.main===module)main();
module.exports={reachableStates,keystream,transform,score,screen,positive,main};
