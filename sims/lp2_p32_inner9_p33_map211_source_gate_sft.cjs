"use strict";
/**
 * Source-selected p32 inner 9×9 / p33 81-rune black body:
 * unmodified GP-prime sum gap and signed-2016 MAP checksum.
 *
 * SFT: node sims/lp2_p32_inner9_p33_map211_source_gate_sft.cjs
 *
 * Preserves original image-selected p32 row0/column0 rune values while
 * shuffling its other 100 values, then tests the originally selected 81-cell
 * center and source-separated p33 black81 without searching new alignments.
 *
 * Conditional null ranks are NOT discovery-wide probabilities: the MAP
 * keyword, body pairing, and index-additive inverse were discovered through
 * exploration. No unknown text, key, direction or actual cipher is recovered.
 *
 * @module lp2_p32_inner9_p33_map211_source_gate_sft
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const signed=fs.readFileSync(path.join(ROOT,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const A=corpus.runes,P=corpus.prime,R=new Set(A);
/** @param {string} s @returns {string} */
function blob(s){
  const b=Buffer.from(s,"utf8");
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
/** @param {number[]} symbols @returns {number} */
const primeSum=symbols=>symbols.reduce((sum,n)=>sum+P[n],0);
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const f=Array(29).fill(0);for(const n of symbols)f[n]++;
  return f.reduce((sum,n)=>sum+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number} seed @returns {()=>number} */
function rng32(seed){
  let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0};
}
/** @param {number[]} sourceKey @param {number[]} ciphertext */
function compare(sourceKey,ciphertext){
  assert.equal(sourceKey.length,81);
  assert.equal(ciphertext.length,81);
  const p=ciphertext.map((v,i)=>(v-sourceKey[i]+29)%29);
  const f1=Array(29).fill(0),f2=Array(29).fill(0);
  let equal=0;for(let i=0;i<81;i++){
    equal+=ciphertext[i]===sourceKey[i];
    f1[sourceKey[i]]++;f2[ciphertext[i]]++;
  }
  const minSubstitutions=f1.reduce((n,x,i)=>n+Math.abs(x-f2[i]),0)/2;
  const squareGap=(size)=>{
    const margin=(9-size)/2;let delta=0;
    for(let row=margin;row<9-margin;row++)
      for(let col=margin;col<9-margin;col++){
        const i=row*9+col;
        delta+=P[ciphertext[i]]-P[sourceKey[i]];
      }
    return delta;
  };
  return {delta:primeSum(ciphertext)-primeSum(sourceKey),
    centerPrimeDelta:P[ciphertext[40]]-P[sourceKey[40]],
    inner7PrimeDelta:squareGap(7),
    equal,decodedIoC:ioc(p),minSubstitutions};
}
/** @param {number[]} p32 */
function fixedInner9(p32){
  assert.equal(p32.length,121);
  return Array.from({length:9},(_,r)=>p32.slice((r+1)*11+1,(r+1)*11+10)).flat();
}
function run(){
  assert.equal(blob(source),"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
  assert.ok(signed.includes("Its words are the map, their"));
  const ann=ink.pages.find(p=>p.page===33);
  assert.ok(ann);
  assert.deepEqual(ann.red_spans.slice(0,2).map(s=>[s.start,s.length]),[[0,10],[91,8]]);
  assert.ok(ann.large_punctuation.some(q=>q[0]===10&&q[1]===13));
  assert.ok(ann.large_punctuation.some(q=>q[0]===91&&q[1]===13));
  const all=[...source].filter(ch=>R.has(ch)).map(ch=>A.indexOf(ch));
  assert.equal(all.length,13136);
  const p32=all.slice(7839,7960),p33=all.slice(7960,8051);
  const key=fixedInner9(p32),body=p33.slice(10);
  assert.equal(key.length,81);assert.equal(body.length,81);
  const top=primeSum(p32.slice(0,11)),
    left=primeSum(Array.from({length:11},(_,r)=>p32[11*r]));
  assert.deepEqual([top,left],[563,569]);
  const mapWord=Array.from("MAP").map(ch=>corpus.translit.indexOf(ch));
  assert.deepEqual(mapWord,[19,24,13]);
  assert.equal(primeSum(mapWord),211);
  const original=compare(key,body);
  assert.equal(primeSum(key),4128);
  assert.equal(primeSum(body),4339);
  assert.equal(original.delta,211);
  assert.deepEqual([key[40],body[40],P[key[40]],P[body[40]]],[7,20,19,73]);
  assert.equal(original.centerPrimeDelta,54);
  assert.equal(original.inner7PrimeDelta,105);
  const gp0=word=>Array.from(word).reduce((sum,char)=>
    sum+corpus.translit.indexOf(char),0);
  assert.equal(gp0('ROAD'),54);
  assert.equal(gp0('DIUINITY'),105); // Solved physical p57's DIVINITY.
  assert.deepEqual([13,24,2,15].map(i=>corpus.translit[i]),
    ["P","A","TH","S"]);
  assert.equal(13+24+2+15,54); // PATHS also GP0=54: ambiguity is explicit.
  // Conditional, previously evidenced p35 handoff: the native p50 low60
  // opcode sends ROAD/PATHS54 to FOUND36, and p35 has the independently
  // documented unique 2+3 native-word mutual-pointer packet.
  const table=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/base60-grid.json"),"utf8")).byte_rows.flat();
  assert.equal(table[54],156);
  assert.equal(table[54]%60,36);
  assert.equal(table[36],54);
  assert.equal(table[36]%60,54);
  const found=[0,3,1,9,23];
  assert.deepEqual(found.map(i=>corpus.translit[i]),["F","O","U","N","D"]);
  assert.equal(found.reduce((sum,i)=>sum+i,0),36);
  const p35=corpus.pages[35].indices;
  const p35Selected=p35.slice(25,30);
  assert.deepEqual(p35Selected,[19,17,19,24,11]);
  assert.equal(p35Selected.slice(0,2).reduce((sum,i)=>sum+i,0),36);
  assert.equal(p35Selected.slice(2).reduce((sum,i)=>sum+i,0),54);
  const foundLocalKey=p35Selected.map((value,i)=>(value-found[i]+29)%29);
  assert.deepEqual(foundLocalKey,[19,14,18,15,17]);
  assert.deepEqual(foundLocalKey.map((key,i)=>(found[i]+key)%29),
    p35Selected);

  assert.equal(original.equal,7);
  assert.equal(original.minSubstitutions,17);
  assert.equal(original.decodedIoC,0.04197530864197531);
  const controls=Array.from({length:11},(_,offset)=>({
    offset,...compare(key,p33.slice(offset,offset+81))}));
  assert.equal(controls.filter(x=>x.equal>=original.equal).length,1);
  assert.equal(controls.filter(x=>x.decodedIoC>=original.decodedIoC).length,1);
  const following=compare(key,all.slice(8051,8132));
  assert.deepEqual([following.delta,following.equal],[-318,4]);
  const move=[];for(let r=1;r<11;r++)
    for(let c=1;c<11;c++)move.push(p32[r*11+c]);
  assert.equal(move.length,100);
  const innerSites=[];for(let r=0;r<9;r++)
    for(let c=0;c<9;c++)innerSites.push(10*r+c);
  const seed=0x56356981,rand=rng32(seed),N=200000;
  const hits={difference211:0,equalAtLeast7:0,
    iocAtLeastOriginal:0,equalAndIoc:0,allThree:0,editAtMost17:0,
    centerDelta54:0,mapAndCenter:0,allThreeAndCenter:0,
    inner7Delta105:0,mapAndDivinity:0,mapDivinityRoad:0};
  for(let t=0;t<N;t++){
    const b=move.slice();
    for(let i=b.length-1;i>0;i--){
      const j=rand()%(i+1);
      [b[i],b[j]]=[b[j],b[i]];
    }
    const candidate=innerSites.map(j=>b[j]);
    const q=compare(candidate,body);
    const a=q.delta===211,
      e=q.equal>=original.equal,
      v=q.decodedIoC>=original.decodedIoC,
      center=q.centerPrimeDelta===54,
      divinity=q.inner7PrimeDelta===105;
    hits.difference211+=a;
    hits.equalAtLeast7+=e;
    hits.iocAtLeastOriginal+=v;
    hits.equalAndIoc+=e&&v;
    hits.allThree+=a&&e&&v;
    hits.editAtMost17+=q.minSubstitutions<=17;
    hits.centerDelta54+=center;
    hits.mapAndCenter+=a&&center;
    hits.allThreeAndCenter+=a&&e&&v&&center;
    hits.inner7Delta105+=divinity;
    hits.mapAndDivinity+=a&&divinity;
    hits.mapDivinityRoad+=a&&divinity&&center;
  }
  assert.deepEqual({
    difference211:hits.difference211,equalAtLeast7:hits.equalAtLeast7,
    iocAtLeastOriginal:hits.iocAtLeastOriginal,
    equalAndIoc:hits.equalAndIoc,allThree:hits.allThree
  },{
    difference211:444,equalAtLeast7:7173,iocAtLeastOriginal:4593,
    equalAndIoc:572,allThree:2
  });
  assert.deepEqual([hits.centerDelta54,hits.mapAndCenter,
    hits.allThreeAndCenter],[16152,38,0]);
  assert.deepEqual([hits.inner7Delta105,hits.mapAndDivinity,
    hits.mapDivinityRoad],[324,0,0]);
  const entire=all.slice(0,12956),M=entire.length-80;
  let windows={difference211:0,equalAtLeast7:0,
    iocAtLeastOriginal:0,allThree:0,allFour:0,
    centerDelta54:0,mapAndCenter:0,
    inner7Delta105:0,mapAndDivinity:0,mapDivinityRoad:0};
  const allFourOffsets=[];
  for(let i=0;i<M;i++){
    const q=compare(key,entire.slice(i,i+81));
    const a=q.delta===211,e=q.equal>=original.equal,
      v=q.decodedIoC>=original.decodedIoC,
      d=q.minSubstitutions<=17,
      center=q.centerPrimeDelta===54,
      divinity=q.inner7PrimeDelta===105;
    windows.difference211+=a;
    windows.equalAtLeast7+=e;
    windows.iocAtLeastOriginal+=v;
    windows.allThree+=a&&e&&v;
    windows.allFour+=a&&e&&v&&d;
    windows.centerDelta54+=center;
    windows.mapAndCenter+=a&&center;
    windows.inner7Delta105+=divinity;
    windows.mapAndDivinity+=a&&divinity;
    windows.mapDivinityRoad+=a&&divinity&&center;
    if(a&&e&&v&&d)allFourOffsets.push(i);
  }
  assert.deepEqual([M,windows.difference211,windows.equalAtLeast7,
    windows.iocAtLeastOriginal,windows.allThree,windows.allFour],
    [12876,11,286,305,1,1]);
  assert.deepEqual(allFourOffsets,[7970]);
  assert.deepEqual([windows.centerDelta54,windows.mapAndCenter],[460,1]);
  assert.deepEqual([windows.inner7Delta105,windows.mapAndDivinity,
    windows.mapDivinityRoad],[11,1,1]);
  const report={
    sourceGitBlob:blob(source),originalImageSelectedP32:{
      GP11x11:true,topPrimeSum:563,leftPrimeSum:569,
      outsideBorderRunes:40,inside9x9Runes:81,
      insidePrimeSum:primeSum(key)
    },originalP33:{titleRunes:10,bodyRunes:81,bodyPrimeSum:primeSum(body),
      red13DotAfterTitle:true},
    signedKeyword:{value:"MAP",primeWeights:mapWord.map(i=>P[i]),primeSum:211},
    centeredSignedWordCheck:{originalP32Prime:P[key[40]],
      originalP33Prime:P[body[40]],delta54:original.centerPrimeDelta,
      signedCandidateWords:["ROAD","PATHS"],nativeGP0Value:54,
      onwardConditionalHandoff:{center54ToP50Low60:36,
        foundNativeGP0:36,p35Offset25to29:p35Selected,
        p35FoundCandidate:found,p35LocalInverseKey:foundLocalKey,
        status:"Known candidate FOUND; source-derived selector remains conditional"},
      center7GpPrimeDelta:original.inner7PrimeDelta,
      center7P57SolvedWord:"DIUINITY",center7NativeGp0:105,
      interpretation:"Retrospective semantic label, not a plaintext rune"},
    exactCrossPageObservations:original,
    frozenLocalSourceOffsets:controls,
    adjacentNextSectionControl:following,
    originalImageChecksumPreservingShuffle:{
      trials:N,seed,firstRowAndColumnFrozen:true,other100CellsPermuted:true,
      hits,plusOneJointTail:(hits.allThree+1)/(N+1),
      plusOneMapCenterTail:(hits.mapAndCenter+1)/(N+1),
      plusOneMapDivinityTail:(hits.mapAndDivinity+1)/(N+1)},
    originalUnknownCiphertextWindowControl:{
      totalWindows:M,hits:windows,allFourOffsets},
    interpretation:"Causal source-link hypothesis; no recovered plaintext or decoder; null rates conditional on postselected signals"
  };
  console.log(JSON.stringify(report,null,2));
}
if(require.main===module)run();
module.exports={run,compare,fixedInner9};
