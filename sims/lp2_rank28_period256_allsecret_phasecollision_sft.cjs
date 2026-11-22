"use strict";
/**
 * Key-independent conditional-equality invariant for LP2's source-fixed
 * 28-nonrepeat rank cipher with arbitrary 256 independent hidden phase
 * permutations (not necessarily additive keys).
 *
 * Directly compare original phase/rank collision with 900 deterministic
 * length-matched native GP-English windows at precisely the same original
 * 142 erased/cipher-IV positions, including both GP spelling conventions.
 *
 * Node22 / Windows 11 CJS / built-in modules, no files written.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const runes=pages.flatMap(p=>p.indices);
assert.equal(runes.length,12956);
assert.equal(pages.length,55);
const sectionEnds=[0,729,1874,3612,5506,6527,7960,9640,12956];
const chapterEnds=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const group=(x,b)=>b.findIndex((v,i)=>i<b.length-1&&x>=v&&x<b[i+1]);
const records=[];let global=0;
for(let page=0;page<pages.length;page++){
  const p=pages[page];
  for(let i=0;i<p.indices.length;i++){
    const section=group(global,sectionEnds),chapter=group(global,chapterEnds);
    const old=p.indices[i-1],now=p.indices[i];
    const free=i===0||global===sectionEnds[section]||now===old;
    const cyclic=free?0:(now-old+28)%29;
    const sorted=free?0:now-Number(now>old);
    if(!free)assert(cyclic<28&&sorted<28);
    records.push({page,section,chapter,free,cyclic,sorted});
    global++;
  }
}
assert.equal(records.length,12956);
assert.equal(records.filter(x=>x.free).length,142);
const tokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @param {boolean} calibrated */
function nativeGP(raw,calibrated){
  const cleaned=raw.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(const word of cleaned.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(calibrated&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(calibrated&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const token=tokens.find(t=>word.startsWith(t.s,i));
      assert(token);out.push(token.i);i+=token.s.length;
    }
  }
  return out;
}
assert.equal(nativeGP("FUNCTION",true).map(i=>corpus.runes[i]).join(""),
  "ᚠᚢᚾᚳᛏᛡᚾ");
assert.deepEqual(nativeGP("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true),corpus.pages[57].indices);
const corpusControls=[];
for(const [name,file,legacyCount,correctCount] of [
  ["Gibran","resources/control/gibran_prophet_58585.txt",63114,62492],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",218800,217106],
  ["Emerson","resources/control/emerson_essays_2944.txt",324630,321327]
]){
  const input=read(file);
  for(const calibrated of [false,true]){
    const g=nativeGP(input,calibrated);
    assert.equal(g.length,calibrated?correctCount:legacyCount);
    const starts=Array.from({length:150},(_,i)=>
      Math.floor((g.length-12956)*i/149));
    assert.equal(new Set(starts).size,150);
    corpusControls.push({name,calibrated,runes:g,starts});
  }
}
assert.equal(corpusControls.length,6);
/**
 * For each fixed key phase: equality pairs are invariant under an unknown
 * permutation of the 28 ranks. The ratio Q is determined without any key.
 * @param {Uint16Array} counts
 * @param {Uint16Array} phaseN
 * @param {number} alphabetSize
 */
function collision(counts,phaseN,alphabetSize){
  let equal=0,denom=0;
  for(let phase=0;phase<256;phase++){
    const n=phaseN[phase];
    denom+=n*(n-1);
    for(let x=0;x<alphabetSize;x++){
      const c=counts[phase*alphabetSize+x];
      equal+=c*(c-1);
    }
  }
  return {equal,denom,Q:equal/denom};
}
/**
 * @param {"book"|"page"|"section"|"chapter"} reset
 * @param {"all"|"nonfree"} consumption
 */
function positions(reset,consumption){
  const eventPhase=new Int16Array(runes.length).fill(-1);
  let old=-1,phase=0,n=0;
  for(let i=0;i<records.length;i++){
    const r=records[i],current=reset==="book"?0:r[reset];
    if(current!==old){old=current;phase=0;}
    if(!r.free){eventPhase[i]=phase%256;n++;}
    if(consumption==="all"||!r.free)phase++;
  }
  assert.equal(n,12814);
  return eventPhase;
}
/**
 * @param {Int16Array} phase
 * @param {"cyclic"|"sorted"} rank
 * @returns {{raw:ReturnType<typeof collision>,n:Uint16Array,mask:number[]}}
 */
function sourceCount(phase,rank){
  const bins=new Uint16Array(256*28),n=new Uint16Array(256),mask=[];
  for(let i=0;i<phase.length;i++){
    if(phase[i]===-1)continue;
    const q=phase[i],v=records[i][rank];
    bins[q*28+v]++;
    n[q]++;
    mask.push(i);
  }
  assert.equal(mask.length,12814);
  return {raw:collision(bins,n,28),n,mask};
}
/** @param {number[]} native @param {number} offset
 * @param {Int16Array} phase @param {Uint16Array} n @param {number[]} mask
 */
function nativeCount(native,offset,phase,n,mask){
  const bins=new Uint16Array(256*29);
  for(const i of mask)bins[phase[i]*29+native[i+offset]]++;
  return collision(bins,n,29);
}
const results=[];let totalComparisons=0,lowestControl=Infinity,highestOriginal=0;
for(const reset of ["book","page","section","chapter"])
for(const consumption of ["all","nonfree"]){
  const phases=positions(reset,consumption);
  for(const rank of ["cyclic","sorted"]){
    const {raw,n,mask}=sourceCount(phases,rank);
    highestOriginal=Math.max(highestOriginal,raw.Q);
    let controlMin=Infinity,controlMax=-Infinity,
      belowOrEqual=0,minControl=null;
    const detail=[];
    for(const control of corpusControls){
      let localMin=Infinity,localMax=-Infinity;
      for(const start of control.starts){
        const score=nativeCount(control.runes,start,phases,n,mask);
        totalComparisons++;
        localMin=Math.min(localMin,score.Q);
        localMax=Math.max(localMax,score.Q);
        if(score.Q<controlMin){controlMin=score.Q;
          minControl={name:control.name,calibrated:control.calibrated,
            start,Q:score.Q};}
        if(score.Q<=raw.Q)belowOrEqual++;
      }
      detail.push({name:control.name,calibrated:control.calibrated,
        minimum:localMin,maximum:localMax});
      controlMax=Math.max(controlMax,localMax);
    }
    lowestControl=Math.min(lowestControl,controlMin);
    assert.equal(belowOrEqual,0);
    assert(controlMin>raw.Q+0.01);
    results.push({reset,consumption,rank,originalQ:raw.Q,
      eligible:12814,phasePairDenominator:raw.denom,controlMin,
      controlMax,smallestControl:minControl,
      nativeSamples:900,nativeAtOrBelowOriginal:belowOrEqual,
      bySource:detail});
  }
}
assert.equal(totalComparisons,14400);
assert.equal(results.length,16);

// Separate original-solved positive: arbitrarily key a p57-derived native
// plaintext with 256 distinct phase shifts, and show exact equality
// signature is conserved between its own eligible ciphertext rank and
// its genuine recovered plaintext runes (unconstrained IV and escapes omit).
const originalSolved=corpus.pages[57].indices;
const P=Array.from({length:12956},(_,i)=>originalSolved[i%originalSolved.length]);
for(const pos of [200,500,999])P[pos]=28;
const key=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.flatMap(p=>p.bytes).map(v=>v%28);
assert.equal(key.length,256);
const C=[],Kphase=[];
let section=-1,q=0;
for(let i=0;i<P.length;i++){
  const r=records[i];
  if(section!==r.section){section=r.section;q=0;}
  const first=i===0||records[i-1].page!==r.page||
    i===sectionEnds[section];
  const prev=C[i-1];
  if(first)C.push(P[i]);
  else if(P[i]===28)C.push(prev);
  else C.push((prev+1+(P[i]+key[q%256])%28)%29);
  Kphase.push(q%256);
  q++;
}
const kbins=new Uint16Array(256*28),
  pbins=new Uint16Array(256*29),pn=new Uint16Array(256);
let plantPositions=0,recovered=0;
for(let i=0;i<P.length;i++){
  const r=records[i];
  const first=i===0||records[i-1].page!==r.page||
    i===sectionEnds[r.section];
  if(first){assert.equal(C[i],P[i]);recovered++;continue;}
  if(C[i]===C[i-1]){assert.equal(P[i],28);recovered++;continue;}
  const cipherRank=(C[i]-C[i-1]+28)%29;
  const clear=(cipherRank-key[Kphase[i]]+28)%28;
  assert.equal(clear,P[i]);recovered++;
  kbins[Kphase[i]*28+cipherRank]++;
  pbins[Kphase[i]*29+P[i]]++;
  pn[Kphase[i]]++;plantPositions++;
}
assert.equal(recovered,12956);
const cipherCollision=collision(kbins,pn,28);
const plainCollision=collision(pbins,pn,29);
assert.equal(cipherCollision.Q,plainCollision.Q);
assert.equal(cipherCollision.equal,plainCollision.equal);
assert(plainCollision.Q>0.06);
console.log(JSON.stringify({
  original:{runes:12956,fullyFree:142,eligible:12814},
  model:{phasePeriod:256,variants:16,
    arbitrarySecretKeyPerPhase:"each phase can use any of 28! independent substitutions",
    comparison:"phase-indexed equal-pair probability on same source positions"},
  originalResults:{highestOriginalQ:highestOriginal,
    lowestNativeControlQ:lowestControl,
    sampleTotal:totalComparisons,nativeAtOrBelowOriginal:0,
    byClock:results.map(({reset,consumption,rank,originalQ,
      controlMin,phasePairDenominator,smallestControl})=>
      ({reset,consumption,rank,originalQ,controlMin,
        phasePairDenominator,smallestControl}))},
  positive:{genuineNativeRUnes:P.length,reencryptedAndRecovered:recovered,
    eligiblePositions:plantPositions,
    sourceNativeQ:plainCollision.Q,cipherRankQ:cipherCollision.Q,
    exactEqualPairNumerator:plainCollision.equal}
},null,2));
