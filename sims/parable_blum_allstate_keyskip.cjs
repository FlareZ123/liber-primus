"use strict";
/**
 * Exhaust ALL initial square states of the historical 2-Blum-prime Cicada
 * Parable modulus M=1259*1031, under an exact collision-keyskip GP29 cipher.
 *
 * Native original p0 first28 rune keyless skip-Viterbi head -> top800 states.
 * Fit original first130 runes, freeze key and actual inferred consumed-stream
 * clock on next80 runes. Every state is tried, no shortlist of guessed seeds.
 *
 * Historical source guarantees the primes, not the putative square PRNG.
 * Run: node sims/parable_blum_allstate_keyskip.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {reachableStates}=require("./parable_blum_exhaustive_state_inverse.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const co=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const N=1259*1031,M=29;
const MODES=["state-mod29","state-low8","fivebits-msb","fivebits-lsb"];
const SIGNS=[-1,1];
const HEAD=28, FIT=130,HOLD=80,KLEN=340;
const MAX_SKIPS_HEAD=4,KEEP=800,PENALTY=3.5;
const corpus=co.pages[0].indices.slice(0,FIT+HOLD);
assert.equal(corpus.length,FIT+HOLD);
const mod=(x,n)=>(x%n+n)%n;
const states=reachableStates();
assert.equal(states.length,325080);

/** Source-native exact modular squaring with arithmetic safe under 2^53. */
function keystream(first,mode,length=KLEN){
  const key=new Uint8Array(length);
  let x=first;
  for(let i=0;i<length;i++){
    if(mode==="state-mod29"){
      key[i]=x%29;x=x*x%N;
    } else if(mode==="state-low8") {
      key[i]=(x&255)%29;x=x*x%N;
    } else {
      let value=0;
      for(let b=0;b<5;b++){
        const bit=x&1;
        if(mode==="fivebits-msb")value=value*2+bit;
        else value|=bit<<b;
        x=x*x%N;
      }
      key[i]=value%29;
    }
  }
  return key;
}

/**
 * Exact max-probability 29-GP Viterbi on first 28 observed ciphertext runes,
 * allowing up to four collision-proven single extra-key draws. No supplied
 * skipped-key positions. Bigrams/trigrams trained on independent public text.
 */
function headScore(cipher,key,sign){
  const WIDTH=2*(MAX_SKIPS_HEAD+1);
  let dp=new Float64Array(WIDTH).fill(-Infinity);
  let nx=new Float64Array(WIDTH);
  const get=(i,e)=>mod(cipher[i]-sign*key[i+e],M);
  const first=get(0,0);
  dp[0]=lm.unigram[first];
  for(let i=1;i<cipher.length;i++){
    nx.fill(-Infinity);
    for(let e=0;e<=MAX_SKIPS_HEAD;e++)for(let prevSkip=0;prevSkip<=1;prevSkip++){
      const state=2*e+prevSkip,old=dp[state];
      if(!Number.isFinite(old))continue;
      const pprev=get(i-1,e),pprev2=i>1?get(i-2,e-prevSkip):0;
      for(let skip=0;skip<=1&&e+skip<=MAX_SKIPS_HEAD;skip++){
        const p=get(i,e+skip);
        if(skip&&mod(p+sign*key[i+e],M)!==cipher[i-1])continue;
        const log=i===1?lm.bigram[pprev*M+p]:
          lm.trigram[(pprev2*M+pprev)*M+p];
        const next=old+log-PENALTY*skip;
        const target=2*(e+skip)+skip;
        if(next>nx[target])nx[target]=next;
      }
    }
    [dp,nx]=[nx,dp];
  }
  let best=-Infinity;
  for(const value of dp)if(value>best)best=value;
  return best/cipher.length;
}
function insert(heap,hit){
  if(heap.length>=KEEP){
    if(hit.train<=heap[0].train)return;
    heap[0]=hit;
    let i=0;
    while(2*i+1<heap.length){
      let j=2*i+1;
      if(j+1<heap.length&&heap[j+1].train<heap[j].train)j++;
      if(heap[i].train<=heap[j].train)break;
      [heap[i],heap[j]]=[heap[j],heap[i]];i=j;
    }
  }else{
    heap.push(hit);
    for(let i=heap.length-1;i>0;){
      const j=(i-1)>>1;
      if(heap[j].train<=heap[i].train)break;
      [heap[j],heap[i]]=[heap[i],heap[j]];i=j;
    }
  }
}
function screen(cipher){
  const best=[];let tested=0;
  for(const first of states)for(const mode of MODES){
    const key=keystream(first,mode,HEAD+MAX_SKIPS_HEAD+4);
    for(const sign of SIGNS){
      insert(best,{state:first,mode,sign,
        train:headScore(cipher,key,sign)});
      tested++;
    }
  }
  assert.equal(tested,states.length*MODES.length*SIGNS.length);
  return {tested,top:best.sort((a,b)=>b.train-a.train)};
}
function continueFull(cipher,shortlist){
  const fitText=cipher.slice(0,FIT),heldout=cipher.slice(FIT,FIT+HOLD);
  const output=shortlist.map(item=>{
    const key=Array.from(keystream(item.state,item.mode));
    const fit=viterbi(fitText,key,item.sign,lm);
    const next=viterbi(heldout,key.slice(FIT+fit.skips),item.sign,lm);
    return {...item,first130:fit.perRune,following80:next.perRune,
      inferredFirstSkips:fit.skips,inferredHeldSkips:next.skips,
      fittedFirst30:fit.plaintext.slice(0,30).map(x=>co.translit[x]).join(""),
      heldFirst30:next.plaintext.slice(0,30).map(x=>co.translit[x]).join("")};
  });
  output.sort((a,b)=>b.first130-a.first130);
  return {topByFit:output.slice(0,8),
    topByHeldPostselected:[...output].sort((a,b)=>b.following80-a.following80).slice(0,5)};
}
function random(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function plant(){
  const native=encode(read("resources/control/shakespeare_first300k.txt").slice(214000));
  assert(native.length>=FIT+HOLD);
  const text=native.slice(0,FIT+HOLD),seed=3301;
  const first=(seed*seed)%N;
  const square=(first*first)%N;
  assert(states.includes(square));
  const trueModel={state:square,mode:"fivebits-msb",sign:1};
  const key=Array.from(keystream(square,trueModel.mode));
  const rng=random(0x76123301),encrypted=[];
  let p=0,previous=-1,totalSkips=0,headSkips=0;
  for(let i=0;i<text.length;i++){
    let next=mod(text[i]+key[p],M);
    if(next===previous&&rng()<.81){
      p++;next=mod(text[i]+key[p],M);
      totalSkips++;if(i<HEAD)headSkips++;
    }
    encrypted.push(next);previous=next;p++;
  }
  const recovered=viterbi(encrypted,key,1,lm);
  const exact=recovered.plaintext.filter((x,i)=>x===text[i]).length;
  assert.equal(exact,text.length,"true model must recover all planted source plaintext");
  assert(headSkips<=MAX_SKIPS_HEAD);
  const ranked=screen(encrypted.slice(0,HEAD));
  const matched=ranked.top.findIndex(hit=>Object.entries(trueModel)
    .every(([k,v])=>hit[k]===v));
  assert(matched>=0,"true initial state/clock must survive head shortlist");
  return {trueModel,headSkips,totalSkips,exactRecovered:exact,
    plantRunes:text.length,blindHeadRank:matched+1,
    recoveredKeySkips:recovered.skips,
    fitted:continueFull(encrypted,ranked.top).topByFit.slice(0,2)};
}
function main(){
  const ranked=screen(corpus.slice(0,HEAD));
  const original=continueFull(corpus,ranked.top);
  const planted=plant();
  console.log(JSON.stringify({
    source:"2013 AUDIO/761.MP3 Parable prime factors1259*1031",
    modulus:N,allInitialStates:N,distinctSquareStates:states.length,
    outputModes:MODES,signs:SIGNS,testedOriginalModels:ranked.tested,
    initialHeadRunes:HEAD,headMaxExtraDraws:MAX_SKIPS_HEAD,
    firstFitRunes:FIT,frozenContinuationRunes:HOLD,
    topHead:ranked.top.slice(0,6),original,
    planted,
    status:"Full original starting-state search in direct GP29 additive with <=4 head key skips; no historical key unless heldout natural-language source"
  },null,2));
}
if(require.main===module)main();
module.exports={keystream,headScore,screen,continueFull,plant,main};
