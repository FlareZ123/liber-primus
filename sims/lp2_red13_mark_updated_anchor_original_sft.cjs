"use strict";
/**
 * LP2 original red-13-dot ruby-span changing-anchor hypothesis.
 *
 * Freeze source input before black-rune comparison:
 * A red GP29 span ending EXACTLY at an original 13-dot separator changes
 * both anchors for following text: b=first red rune GP29 index;
 * r=last red rune GP29 index. Continue until next such span.
 *
 * Proposed black-cipher operation:
 * D_i=C_i-C_(i-1)=b + A_i*(P_i-r) mod29, any nonzero secret A_i.
 * The all-secret necessary event invariant D_i=b iff P_i=r is tested
 * against real source-layout native-Cicada matched word samples.
 *
 * A concrete source-root8 positive/negative chooses A_i=8^b mod29.
 * Red spans are hypothesized transparent key headers, sent unchanged.
 *
 * This is an independently frozen candidate, NOT an authenticated
 * author instruction. No unknown original LP2 plaintext is recovered.
 *
 * Windows 11, Node.js22:
 * node sims/lp2_red13_mark_updated_anchor_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=file=>fs.readFileSync(path.join(__dirname,"..",file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const reference=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} r @returns {number} */
function idx(r){const k=runeIndex.get(r);assert.notEqual(k,undefined);return k;}
/** @param {string} s @returns {number[][]} */
function runicWords(s){return (s.match(/[\u16A0-\u16FF]+/gu)||[])
  .map(w=>[...w].map(idx));}
const originalWords=read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\r\n%&$\s]/g,"").split(/[-.]/)
  .filter(w=>/[\u16A0-\u16FF]/u.test(w))
  .slice(0,2896).map(w=>[...w].map(idx));
const solvedWords=reference.sections.flatMap(s=>runicWords(s.source_text));
const pages=corpus.pages.filter(p=>p.page<=55);
const source=pages.flatMap(p=>p.indices);
const pageStart=new Map(),pageOf=[],physicalStarts=new Set();
for(const p of pages){
  pageStart.set(p.page,pageOf.length);
  if(p.indices.length)physicalStarts.add(pageOf.length);
  for(const value of p.indices)pageOf.push(p.page);
}
assert.equal(source.length,12956);
assert.equal(originalWords.length,2896);
assert.deepEqual(originalWords.flat(),source);
assert.equal(solvedWords.length,740);
assert.equal(solvedWords.flat().length,2979);
assert.equal(physicalStarts.size,55);
const redPositions=new Set(),markAt=new Map(),events=[];
for(const p of ink.pages.filter(p=>p.page<=55)){
  const base=pageStart.get(p.page);
  for(const span of p.red_spans||[]){
    assert.equal(span.runes.length,span.length);
    for(let j=span.start;j<span.start+span.length;j++)
      redPositions.add(base+j);
    const end=span.start+span.length;
    const marked=(p.large_punctuation||[])
      .some(([at,dotCount])=>at===end&&dotCount===13);
    if(!marked)continue;
    const runeSequence=[...span.runes].map(idx);
    assert.deepEqual(pages.find(page=>page.page===p.page)
      .indices.slice(span.start,end),runeSequence);
    const event={page:p.page,position:base+end,
      b:runeSequence[0],r:runeSequence.at(-1)};
    assert.ok(!markAt.has(event.position));
    markAt.set(event.position,event);
    events.push(event);
  }
}
assert.equal(redPositions.size,213);
assert.equal(markAt.size,14);
assert.deepEqual(events.map(e=>[e.page,e.b,e.r]),[
  [0,15,5],[3,20,22],[3,13,2],[6,24,12],[7,23,19],
  [15,0,24],[15,20,21],[23,1,26],[27,19,13],[33,23,6],
  [33,21,12],[39,27,15],[53,16,9],[54,24,19]
]);
/** Immutable event state obtained from the visible red spans alone. */
const states=[];
let b=0,r=0,active=false;
for(let i=0;i<source.length;i++){
  const event=markAt.get(i);
  if(event){b=event.b;r=event.r;active=true;}
  states.push({b,r,active});
}
const textWords=[];let offset=0;
for(const w of originalWords){
  textWords.push({runes:w,start:offset});
  offset+=w.length;
}
assert.equal(offset,12956);
const donorPools=new Map();
for(const w of solvedWords){
  if(!donorPools.has(w.length))donorPools.set(w.length,[]);
  donorPools.get(w.length).push(w);
}
for(const w of originalWords)assert.ok(donorPools.get(w.length)?.length);
const region=p=>p<=14?"training_p0to14":
  p>=16&&p<=21?"untouched_p16to21":
  p>=40&&p<=53?"untouched_p40to53":"remaining";
const regions=["training_p0to14","untouched_p16to21","untouched_p40to53","remaining"];
const totals={};
const mod=x=>((x%29)+29)%29;
for(const name of regions){
  const actual=Array(7).fill(0),expected=Array(7).fill(0),
    variance=Array(7).fill(0);
  let sites=0;
  for(const {runes:w,start} of textWords){
    const slots=[];
    for(let j=0;j<w.length;j++){
      const pos=start+j;
      if(physicalStarts.has(pos)||redPositions.has(pos)
        ||!states[pos].active||region(pageOf[pos])!==name)continue;
      slots.push({pos,j,bin:Math.min(j,6)});
    }
    if(!slots.length)continue;
    const pool=donorPools.get(w.length);
    const sums=Array(7).fill(0),sq=Array(7).fill(0);
    for(const donor of pool){
      const vector=Array(7).fill(0);
      for(const slot of slots)
        if(donor[slot.j]===states[slot.pos].r)vector[slot.bin]++;
      for(let j=0;j<7;j++){
        sums[j]+=vector[j];sq[j]+=vector[j]*vector[j];
      }
    }
    for(let j=0;j<7;j++){
      const mean=sums[j]/pool.length;
      expected[j]+=mean;
      variance[j]+=sq[j]/pool.length-mean*mean;
    }
    for(const slot of slots){
      sites++;
      if(mod(source[slot.pos]-source[slot.pos-1])===states[slot.pos].b)
        actual[slot.bin]++;
    }
  }
  const sum=a=>a.reduce((v,x)=>v+x,0);
  const chi=actual.reduce((v,x,i)=>v+(x-expected[i])**2/
    Math.max(1,variance[i]),0);
  totals[name]={sites,actual,expected,actualTotal:sum(actual),
    expectedTotal:sum(expected),sumVariance:sum(variance),chi};
}
assert.deepEqual(totals.untouched_p16to21.actual,
  [10,12,7,10,10,6,5]);
assert.equal(totals.untouched_p16to21.sites,1607);
assert.equal(totals.untouched_p16to21.actualTotal,60);
assert.ok(Math.abs(totals.untouched_p16to21.expectedTotal
  -18.74129818618335)<1e-7);
assert.deepEqual(totals.untouched_p40to53.actual,
  [18,26,22,14,11,6,10]);
assert.equal(totals.untouched_p40to53.sites,2937);
assert.equal(totals.untouched_p40to53.actualTotal,107);
assert.ok(Math.abs(totals.untouched_p40to53.expectedTotal
  -199.1209046931654)<1e-7);
/** Deterministic donor-conditional full printed-word plants. */
let seed=0x1320ca24;
/** @returns {number} */
function rng(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
function donorBook(){
  const words=originalWords.map(w=>{
    const p=donorPools.get(w.length);
    return p[rng()%p.length];
  });
  return words.flat();
}
/** @param {number[]} native @param {string} tag */
function scoreCandidateAnchor(native,tag){
  let x=0;
  for(let i=1;i<native.length;i++){
    if(physicalStarts.has(i)||redPositions.has(i)
      ||!states[i].active||region(pageOf[i])!==tag)continue;
    if(native[i]===states[i].r)x++;
  }
  return x;
}
const controlOut={};
for(const name of ["untouched_p16to21","untouched_p40to53"]){
  const counts=[];
  for(let rep=0;rep<2000;rep++){
    const v=donorBook();
    assert.equal(v.length,12956);
    counts.push(scoreCandidateAnchor(v,name));
  }
  counts.sort((a,b)=>a-b);
  controlOut[name]={replicates:counts.length,low:counts[0],
    median:counts[999],high:counts.at(-1),
    observed:totals[name].actualTotal,
    countAtLeastObserved:counts.filter(x=>x>=totals[name].actualTotal).length,
    countAtMostObserved:counts.filter(x=>x<=totals[name].actualTotal).length};
}
assert.equal(controlOut.untouched_p16to21.countAtLeastObserved,0);
assert.equal(controlOut.untouched_p40to53.countAtMostObserved,0);
/** Exact source-root8 invertible multiplier. */
const multiplier=[1];
for(let j=1;j<28;j++)multiplier.push(multiplier.at(-1)*8%29);
assert.equal(new Set(multiplier).size,28);
const inverse=multiplier.map(v=>{
  for(let x=1;x<29;x++)if(v*x%29===1)return x;
  throw Error("nonunit");
});
/**
 * Source original visible red spans remain transparent. Their first and
 * last rune at a marked end are observed and set the following state.
 * @param {number[]} cipher
 * @param {Set<number>} clear
 * @param {Map<number,{b:number,r:number}>} triggers
 */
function decode(cipher,clear,triggers){
  let prev=0,b=0,r=0;
  return cipher.map((cur,i)=>{
    const update=triggers.get(i);
    if(update){b=update.b;r=update.r;}
    const p=clear.has(i)?cur:
      mod(r+inverse[b%28]*mod(cur-prev-b));
    prev=cur;
    return p;
  });
}
/**
 * @param {number[]} plain
 * @param {Set<number>} clear
 * @param {Map<number,{b:number,r:number}>} triggers
 */
function encode(plain,clear,triggers){
  let prev=0,b=0,r=0;
  return plain.map((value,i)=>{
    const update=triggers.get(i);
    if(update){b=update.b;r=update.r;}
    const c=clear.has(i)?value:
      mod(prev+b+multiplier[b%28]*mod(value-r));
    prev=c;
    return c;
  });
}
/** @param {number[]} x */
function ioc(x){
  const h=Array(29).fill(0);
  for(const z of x)h[z]++;
  return h.reduce((a,n)=>a+n*(n-1),0)/(x.length*(x.length-1));
}
const bodyDecryption=decode(source,redPositions,markAt);
assert.deepEqual(encode(bodyDecryption,redPositions,markAt),source);
const blackIoC={};
for(const name of regions){
  const values=bodyDecryption.filter((v,i)=>
    region(pageOf[i])===name&&!redPositions.has(i));
  blackIoC[name]={runes:values.length,ioc:ioc(values),
    decodedE:values.filter(x=>x===18).length,
    opening:values.slice(0,18).map(x=>corpus.translit[x]).join(" ")};
}
assert.ok(blackIoC.untouched_p16to21.ioc<0.04);
assert.ok(blackIoC.untouched_p40to53.ioc<0.04);
const nativeOriginal=donorBook();
for(const i of redPositions)nativeOriginal[i]=source[i];
const synthetic=encode(nativeOriginal,redPositions,markAt);
assert.deepEqual(decode(synthetic,redPositions,markAt),nativeOriginal);
for(let i=1;i<synthetic.length;i++)if(!redPositions.has(i)){
  const st=states[i];
  const d=mod(synthetic[i]-synthetic[i-1]);
  assert.equal(d===st.b,nativeOriginal[i]===st.r);
}
const p57=corpus.pages.find(p=>p.page===57).indices;
const r57=new Set(Array.from({length:7},(_,i)=>i));
const marker57=new Map([[7,{b:p57[0],r:p57[6]}]]);
assert.deepEqual(decode(encode(p57,r57,marker57),r57,marker57),p57);
assert.equal(p57.length,95);
const knownSolved=solvedWords.flat();
console.log(JSON.stringify({
  source:{originalRunes:12956,completeWords:2896,runePages:55,
    redClearSourceRunes:redPositions.size,markedRed13Transitions:events,
    originalSamePageTransitions:12901},
  fixedProposal:"after red span ending exactly at genuine 13-dot mark, b=first red GP index,r=last red GP index; D=b + 8^b(P-r), all GP29",
  allSecretNecessary:"If A_i can be any nonzero, D=b iff plaintext rune r",
  nativeOriginalHoldouts:totals,
  nativeCompleteWordControls:controlOut,
  concreteRoot8OriginalBlackDecode: blackIoC,
  actualSolvedNativeIoC:ioc(knownSolved),
  exactRoundtrip:{source:source.length,
    originalShapedNativePlant:nativeOriginal.length,
    knownSolvedP57:p57.length},
  decision:"The frozen source-red-endpoint update is non-native in both untouched chapters for every nonzero hidden A_i; the concrete source-root8 inverse is likewise nonprose. The manuscript does not print this endpoint-to-anchor rule; no unknown plaintext."
},null,2));
console.log("PASS original red13 mark-changing anchor source gate and genuine GP29 positive cipher plants");
