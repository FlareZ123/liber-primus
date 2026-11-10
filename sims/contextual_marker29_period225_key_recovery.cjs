"use strict";
/**
 * Exact 225-column unknown-pad recovery for the proposed LOSSLESS contextual
 * marker GP29 cipher. This attacks *all* 225 arbitrary unknown key values, not
 * just known-source keys. Fit on p0..27 and freeze on physical p28..55.
 *
 * Source-native GP positive controls confirm that the inference would recover
 * an actual 225-period key under this very architecture; the real manuscript
 * must independently succeed on previously unseen source.
 *
 * Run: node sims/contextual_marker29_period225_key_recovery.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {alphabet,encrypt,decrypt}=require("./contextual_marker29_reversible.cjs");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const map=new Map(corpus.runes.map((r,i)=>[r,i]));
const original=parseSharedCorpus().words.flatMap(w=>[...w.runes].map(r=>map.get(r)));
const N=original.length,PERIOD=225;
assert.equal(N,12956);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const pageLocal=new Uint16Array(N),pageIndex=new Uint8Array(N);
const first=new Uint8Array(N);
let at=0;
for(const page of pages)for(let j=0;j<page.indices.length;j++,at++){
  pageLocal[at]=j;pageIndex[at]=page.page;first[at]=Number(j===0);
}
assert.equal(at,N);
const red=ink.pages.flatMap(page=>(page.red_spans||[])
  .flatMap(span=>[...span.runes].map(r=>map.get(r))));
assert.equal(red.length,PERIOD);
const translit=new Map(corpus.translit.map((s,i)=>[s,i]));
const gpText=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
const source=[];
for(const word of gpText.match(/[A-Za-z]+/gu)||[]){
  const s=word.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  for(let i=0;i<s.length;){
    const v=translit.get(s.slice(i,i+2));
    if(v!==undefined){source.push(v);i+=2;}else{
      const x=translit.get(s[i]);assert.notEqual(x,undefined);
      source.push(x);i++;
    }
  }
}
assert.equal(source.length,3248);
const histogram=new Uint32Array(29);
for(const p of source)histogram[p]++;
const logPrior=Array.from(histogram,x=>
  Math.log((x+1)/(source.length+29)));
const mod=(x,n)=>(x%n+n)%n;
const firstHalf=i=>pageIndex[i]<28;
/** Reuse only nonreserved ciphertext symbols: otherwise key is not identifiable. */
function records(cipher){
  assert.equal(cipher.length,N);
  const out=[];
  for(let i=0;i<N;i++){
    if(first[i]){
      out.push({i,first:true,rank:cipher[i],radix:29});
      continue;
    }
    const a=alphabet(cipher,i),delta=mod(cipher[i]-cipher[i-1],29);
    if([...a.reserved.values()].includes(delta))continue;
    const rank=a.freeDeltas.indexOf(delta);
    assert.ok(rank>=0);
    out.push({i,first:false,rank,radix:a.freeDeltas.length,
      symbols:a.freeSymbols});
  }
  return out;
}
/** @param {number[]} cipher @param {"global"|"page"} clock */
function recover(cipher,clock){
  const items=records(cipher);
  const tally=Array.from({length:PERIOD},()=>new Float64Array(29));
  const seen=new Uint16Array(PERIOD);
  let training=0,holdout=0;
  for(const rec of items){
    if(!firstHalf(rec.i))continue;
    training++;
    const phase=(clock==="global"?rec.i:pageLocal[rec.i])%PERIOD;
    seen[phase]++;
    for(let k=0;k<29;k++){
      const p=rec.first?mod(rec.rank-k,29):
        rec.symbols[mod(rec.rank-k,rec.radix)];
      tally[phase][k]+=logPrior[p];
    }
  }
  const key=new Array(PERIOD);
  for(let j=0;j<PERIOD;j++){
    let best=0;
    for(let k=1;k<29;k++)if(tally[j][k]>tally[j][best])best=k;
    key[j]=best;
  }
  let tr=0,ho=0;
  for(const rec of items){
    const phase=(clock==="global"?rec.i:pageLocal[rec.i])%PERIOD;
    const k=key[phase],p=rec.first?mod(rec.rank-k,29):
      rec.symbols[mod(rec.rank-k,rec.radix)];
    if(firstHalf(rec.i))tr+=logPrior[p];
    else{ho+=logPrior[p];holdout++;}
  }
  let uniform=0;
  for(const rec of items){
    if(firstHalf(rec.i))continue;
    if(rec.first)uniform+=logPrior.reduce((a,b)=>a+b,0)/29;
    else uniform+=rec.symbols.reduce((a,b)=>a+logPrior[b],0)/rec.radix;
  }
  return {clock,key,trainRuneCount:training,holdoutRuneCount:holdout,
    trainMean:tr/training,heldoutMean:ho/holdout,
    baseline:uniform/holdout,
    phaseCounts:{min:Math.min(...seen),max:Math.max(...seen)}};
}
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
const direct={repr:"index",reverse:false,clock:"global",sign:1,phase:0};
/** @param {() => number} rand */
function nativePlant(rand){
  const plant=new Uint8Array(N);
  let start=0;
  for(const page of pages){
    const offset=rand()%source.length;
    for(let j=0;j<page.indices.length;j++)
      plant[start+j]=source[(offset+j)%source.length];
    start+=page.indices.length;
  }
  assert.equal(start,N);
  return plant;
}
function report(){
  const realGlobal=recover(original,"global"),realPage=recover(original,"page");
  const r=rng(0x2253ea15),plants=[];
  for(let trial=0;trial<12;trial++){
    const plain=nativePlant(r),cipher=encrypt(plain,direct,red);
    const inferred=recover(cipher,"global");
    const recovered=decrypt(cipher,direct,inferred.key);
    let matched=0,totalHeldout=0;
    for(let i=0;i<N;i++)if(!firstHalf(i)){
      matched+=Number(recovered[i]===plain[i]);totalHeldout++;
    }
    const matches=inferred.key.filter((x,i)=>x===red[i]).length;
    const exactOracle=decrypt(cipher,direct,red);
    assert.deepEqual(exactOracle,plain);
    if(trial===0){
      assert.deepEqual(encrypt(recovered,direct,inferred.key),cipher);
    }
    plants.push({keyMatches:matches,holdoutAccuracy:matched/totalHeldout,
      fittedHoldout:inferred.heldoutMean,baseline:inferred.baseline});
  }
  const sorted=plants.map(p=>p.holdoutAccuracy).sort((a,b)=>a-b);
  const realBest=[realGlobal,realPage].sort((a,b)=>b.trainMean-a.trainMean)[0];
  return {
    cipher:"exact four-marker GP29 conditional step cipher",
    source:{runes:N,red225:PERIOD,unknownKeyChoicesPerColumn:29,
      trainPages:"0..27",holdoutPages:"28..55"},
    original:{
      periodicGlobal:{...realGlobal,key:undefined},
      periodicPage:{...realPage,key:undefined},
      preselectedByTrain:realBest.clock,
      frozenGain:realBest.heldoutMean-realBest.baseline
    },
    nativeControls:{
      sourceLength:source.length,trialCount:plants.length,seed:"0x2253ea15",
      truePeriod225Key:red.join(","),trialExamples:plants.slice(0,5),
      minHoldoutAccuracy:sorted[0],medianHoldoutAccuracy:sorted[6],
      maxHoldoutAccuracy:sorted.at(-1)
    },
    decision:"Recovery is credible only if original heldout GP source-likelihood rises without retuning. Synthetic true-source exact key plants are a power check, not LP2 plaintext."
  };
}
if(require.main===module)console.log(JSON.stringify(report(),null,2));
module.exports={records,recover,report};
