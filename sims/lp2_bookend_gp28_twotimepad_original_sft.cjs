"use strict";
/**
 * Original LP2 source-selected 28-way two-time-pad inverse.
 * Test the 366-rune-offset bookend echo and 28 physical page pairs.
 * Run: node sims/lp2_bookend_gp28_twotimepad_original_sft.cjs
 * Native GP controls, fixed 145k Shakespeare train, heldout Shakespeare
 * plus Gibran. Node 22 CJS, no dependencies, no network or writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55);
const a=pages.filter(p=>p.page<28).flatMap(p=>p.indices);
const b=pages.filter(p=>p.page>=28).flatMap(p=>p.indices);
assert.equal(pages.length,56);
assert.deepEqual([a.length,b.length],[6761,6195]);
assert.deepEqual(a.concat(b).slice(6555,6561),[23,11,1,17,18,10]);
assert.deepEqual(b.slice(-6),[23,11,1,17,18,10]);
const origin=6555-(b.length-6);
assert.equal(origin,366);
const originalA=a.slice(origin,origin+b.length);
assert.deepEqual(originalA.slice(-6),b.slice(-6));

const roman=new Map(corpus.translit.map((s,i)=>[s,i]));
/** @param {string} text @returns {number[]} */
function gp28(text) {
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const pair=roman.get(word.slice(i,i+2));
      let symbol;
      if(pair!==undefined){symbol=pair;i+=2;}
      else{symbol=roman.get(word[i]);i++;}
      if(symbol!==undefined && symbol!==28)out.push(symbol);
    }
  }
  return out;
}
const sh=gp28(read("resources/control/shakespeare_first300k.txt"));
const gi=gp28(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(sh.length,217167);
assert.equal(gi.length,62508);
const hist=new Uint32Array(28);
for(const g of sh.slice(0,145000))hist[g]++;
const prior=Array.from(hist,n=>n/145000);
const q=Array.from({length:28},(_,d)=>prior.reduce((s,v,i)=>
  s+v*prior[(i-d+28)%28],0));
const w=q.map(v=>Math.log(28*v));
assert.ok(Math.abs(q.reduce((a,b)=>a+b,0)-1)<1e-12);
/** Ciphertext-step map is a 28-rank, with -1 for a repeated rune.
 * @param {number[]} v @returns {number[]} */
function rank(v) {
  return v.slice(1).map((c,i)=>{
    const delta=(c-v[i]+29)%29;
    return delta===0?-1:delta-1;
  });
}
/** @param {number[]} x @param {number[]} y @param {number} trim */
function score(x,y,trim=0){
  assert.equal(x.length,y.length);
  const differences=new Uint32Array(28);
  let eligible=0,equal=0,llr=0;
  for(let i=0;i<x.length-trim;i++){
    if(x[i]<0||y[i]<0)continue;
    const d=(x[i]-y[i]+28)%28;
    eligible++;equal+=Number(d===0);llr+=w[d];differences[d]++;
  }
  return {eligible,equal,equalRate:equal/eligible,llr,
    logFactorPerSite:llr/eligible,histogram:Array.from(differences)};
}
const ar=rank(originalA),br=rank(b);
const observed=score(ar,br,6); // Six reused glyphs motivated the alignment.
const suffixStart=a.length-b.length; // 2016 source JPEG 563×569 mean: 566.
assert.equal(suffixStart,(563+569)/2);
const suffixRanks=rank(a.slice(suffixStart));
const lengthMatched=score(suffixRanks,br);
assert.equal(lengthMatched.eligible,6111);
assert.equal(lengthMatched.equal,232);
assert.ok(Math.abs(lengthMatched.llr+126.89460437740401)<1e-7);
assert.equal(observed.eligible,6108);
assert.equal(observed.equal,235);
assert.ok(Math.abs(observed.llr+109.04543777853046)<1e-7);

const shift=[];
for(let k=0;k<br.length;k++){
  let llr=0;
  for(let i=0;i<br.length-6;i++){
    const u=ar[i],v=br[(i+k)%br.length];
    if(u>=0&&v>=0)llr+=w[(u-v+28)%28];
  }
  shift.push(llr);
}
const reference={shakespeareRunes:sh.length,gibranRunes:gi.length,
  trainedGP28Runes:145000,nativeSameRuneProbability:q[0],
  independentUniformSameRuneProbability:1/28};
const bookNull={shifts:shift.length,
  mean:shift.reduce((a,b)=>a+b,0)/shift.length,
  lowerFraction:shift.filter(v=>v<=observed.llr+1e-9).length/shift.length,
  upperFraction:shift.filter(v=>v>=observed.llr-1e-9).length/shift.length};

/** @param {number} s @returns {()=>number} */
function rng(s){
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
const next=rng(0x33015628);
const key=Array.from({length:ar.length},()=>next()%28);
/** GP28 native source, exact original exception-site mask, shared key.
 * @param {number[]} plain @param {number[]} mask @param {number} initial */
function encrypt(plain,mask,initial){
  const result=[initial];
  for(let i=0;i<plain.length;i++){
    const previous=result[result.length-1];
    result.push(mask[i]<0?previous:
      (previous+1+(plain[i]+key[i])%28)%29);
  }
  assert.deepEqual(rank(result),mask.map((v,i)=>v<0?-1:(plain[i]+key[i])%28));
  return rank(result);
}
const pA=gi.slice(0,ar.length);
const pB=sh.slice(160000,160000+ar.length);
const synthetic=score(encrypt(pA,ar,2),encrypt(pB,br,18),6);
assert.equal(synthetic.eligible,observed.eligible);
assert.ok(synthetic.llr>0);
const lengthMatchedPlant=score(
  encrypt(pA,suffixRanks,3),encrypt(pB,br,17));
assert.equal(lengthMatchedPlant.eligible,lengthMatched.eligible);
assert.ok(lengthMatchedPlant.llr>0);
assert.ok(observed.llr<0);

// Independent natural 28-page pair clock, same-ranked steps at page offset.
const pairs=Array.from({length:28},(_,i)=>({left:rank(pages[i].indices),
  right:rank(pages[i+28].indices)})).filter(p=>p.left.length&&p.right.length);
assert.equal(pairs.length,27);
let nPair=0,ePair=0,llPair=0;
for(const pair of pairs){
  const length=Math.min(pair.left.length,pair.right.length);
  const s=score(pair.left.slice(0,length),pair.right.slice(0,length));
  nPair+=s.eligible;ePair+=s.equal;llPair+=s.llr;
}
assert.equal(nPair,5562);
assert.equal(ePair,172);
const pairObservation={pairs:pairs.length,eligible:nPair,equal:ePair,
  equalRate:ePair/nPair,llr:llPair,logFactorPerSite:llPair/nPair};
const pairedRand=rng(0x33010333);
function pairedRate(order){
  let n=0,e=0;
  for(let i=0;i<pairs.length;i++){
    const left=pairs[i].left,right=pairs[order[i]].right;
    for(let j=0;j<Math.min(left.length,right.length);j++){
      if(left[j]<0||right[j]<0)continue;
      n++;e+=Number(left[j]===right[j]);
    }
  }
  return e/n;
}
const rates=[];
for(let t=0;t<10000;t++){
  const order=pairs.map((_,i)=>i);
  for(let i=order.length-1;i>0;i--){
    const j=pairedRand()%(i+1);
    [order[i],order[j]]=[order[j],order[i]];
  }
  rates.push(pairedRate(order));
}
const pairNull={seed:"0x33010333",replicates:rates.length,
  mean:rates.reduce((a,b)=>a+b,0)/rates.length,
  lowerTail:(1+rates.filter(v=>v<=pairObservation.equalRate).length)/(rates.length+1),
  upperTail:(1+rates.filter(v=>v>=pairObservation.equalRate).length)/(rates.length+1)};
const output={
  result:"No plaintext. GP28 equal-key bookend and 28-page-pair inverse fails its native-prose necessary condition.",
  original:{pages:pages.length,runes:a.length+b.length,
    firstHalf:a.length,secondHalf:b.length,echoAt:[6555,12950],
    sourceLockedOverlapStart:origin,excludedEchoRunes:6},
  model:"Ciphertext GP29 successor = previous + 1 + ((GP28 plaintext + equal keystream) mod28), with zero step as transparent exception",
  reference,bookend:{observed,rotationNull:bookNull,sourceNativeSharedKeyPlant:synthetic},
  exactHalfLengthAlignment:{suffixStart,sourceDimensions:[563,569],observed:lengthMatched,sourceNativeSharedKeyPlant:lengthMatchedPlant},
  physicalPagePairs:{observed:pairObservation,pagePermutationNull:pairNull},
  limitations:"This excludes only the same GP28 additive pad under two source-selected public alignments and native GP prose. Changes of key phase, nonlinear feedback, source compression and non-English alphabets remain open."
};
console.log(JSON.stringify(output,null,2));
