"use strict";
/**
 * LP2 all-secret period-1..256 predecessor-exclusion capacity proof.
 * The two source-natural orders of the 28 outputs, four source clocks,
 * and both event-consumption policies are tested without guessing a key.
 * Each phase may use ANY of 28! secret GP28 output label permutations.
 *
 * Native source controls: pinned solved LP1 and p57 orthography, exhaustive
 * full-length windows over independently stored public prose.
 *
 * Windows 11 / Node.js22 / CommonJS / built-ins only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const text=pages.flatMap(p=>p.indices);
assert.equal(text.length,12956);
const starts=arr=>{const a=[0];for(const x of arr)a.push(a[a.length-1]+x);return a;};
const sectionEnds=starts([729,1145,1738,1894,1021,1433,1680,3316]);
const chapterEnds=starts([729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(sectionEnds.at(-1),12956);
assert.equal(chapterEnds.at(-1),12956);
const at=(g,ends)=>ends.findIndex((v,i)=>i<ends.length-1&&g>=v&&g<ends[i+1]);
/**
 * Original-source absolute positions. To be maximally permissive, every
 * physical page first symbol and the additional within-page $-section
 * first symbol are unclaimed IVs in EVERY tested key clock.
 */
const entries=[];let global=0,pageNo=0;
for(const page of pages){
  for(let local=0;local<page.indices.length;local++){
    const previous=page.indices[local-1],c=page.indices[local];
    const d=local===0?0:(c-previous+29)%29;
    const section=at(global,sectionEnds),chapter=at(global,chapterEnds);
    const free=local===0||global===sectionEnds[section]||d===0;
    const cyclic=(d+28)%29;
    const sorted=local===0?0:c-Number(c>previous);
    if(!free)assert(cyclic<28&&sorted<28);
    entries.push({g:global,page:pageNo,section,chapter,free,cyclic,sorted});
    global++;
  }
  pageNo++;
}
assert.equal(global,12956);
const freePositions=entries.filter(x=>x.free).length;
assert.equal(freePositions,142);
assert.equal(entries.filter(x=>!x.free).length,12814);
const exceptionEqual=pages.reduce((n,p)=>n+p.indices.slice(1)
  .filter((v,i)=>v===p.indices[i]).length,0);
assert.equal(exceptionEqual,86);
const sourceIV=freePositions-exceptionEqual;
assert.equal(sourceIV,56);

/**
 * @param {"global"|"page"|"section"|"chapter"} reset
 * @param {"all"|"nonrepeat"} consumption
 * @returns {{cyclic:number[][],sorted:number[][]}}
 */
function phaseRows(reset,consumption){
  let phase=0,group=-1;
  const cyclic=[],sorted=[];
  for(const e of entries){
    const current=reset==="global"?0:e[reset];
    if(current!==group){phase=0;group=current;}
    if(!e.free){
      cyclic.push([phase,e.cyclic]);
      sorted.push([phase,e.sorted]);
    }
    if(consumption==="all"||!e.free)phase++;
  }
  assert.equal(cyclic.length,12814);
  return {cyclic,sorted};
}
/**
 * Exact one-letter occupancy maximum under 28! arbitrary bijections
 * independently chosen in each of PERIOD phase states.
 * @param {number[][]} observations [unbounded clock position, rank]
 * @param {number} period
 */
function maxSingleSymbol(observations,period){
  const bins=new Uint16Array(period*28);
  for(const [clock,rank] of observations)bins[(clock%period)*28+rank]++;
  let capacity=0;
  for(let phase=0;phase<period;phase++){
    let high=0;
    for(let r=0;r<28;r++)high=Math.max(high,bins[phase*28+r]);
    capacity+=high;
  }
  return capacity;
}
const worst=Array(257).fill(0),witnesses=[];
for(const reset of ["global","page","section","chapter"])
for(const consumption of ["all","nonrepeat"]){
  const ranks=phaseRows(reset,consumption);
  for(const order of ["cyclic","sorted"]){
    let firstAllFreeFail=null,maxAt256=0;
    for(let period=1;period<=256;period++){
      const m=maxSingleSymbol(ranks[order],period);
      worst[period]=Math.max(worst[period],m);
      if(period===256)maxAt256=m;
      if(m+freePositions>=1397&&firstAllFreeFail===null)
        firstAllFreeFail=period;
    }
    witnesses.push({reset,consumption,order,
      maximumEAtPeriod256:maxAt256,
      maximumPlus142AtPeriod256:maxAt256+freePositions,
      firstPeriodAtWhichAll142FreeCouldMeet1397:firstAllFreeFail});
  }
}
const worstWithFree=worst.slice(1).map(m=>m+freePositions);
const worstPlusIVOnly=worst.slice(1).map(m=>m+sourceIV);
assert.equal(Math.max(...worst),1287);
assert.equal(worst[256],1280);
assert.equal(Math.max(...worstWithFree),1429);
assert.equal(Math.max(...worstPlusIVOnly),1343);
let longestAllFreePrefix=0;
for(let period=1;period<=256;period++){
  if(worst[period]+freePositions>=1397)break;
  longestAllFreePrefix=period;
}
assert.equal(longestAllFreePrefix,232);
assert.equal(worst[256]+sourceIV,1336);

// Exact GP-native input normalization as in the previously verified
// 13-phase all-secret control, with the historical ING and IO spellings.
const tokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/**
 * @param {string} input
 * @param {boolean} calibrated
 * @returns {number[]}
 */
function nativeGP(input,calibrated){
  const cleaned=input.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(const word of cleaned.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(calibrated&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(calibrated&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const symbol=tokens.find(t=>word.startsWith(t.s,i));
      assert(symbol);
      out.push(symbol.i);i+=symbol.s.length;
    }
  }
  return out;
}
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
assert(lp1.includes("ᚠᚢᚾᚳᛏᛡᚾ"));
assert.equal(nativeGP("FUNCTION",true).map(i=>corpus.runes[i]).join(""),"ᚠᚢᚾᚳᛏᛡᚾ");
assert.deepEqual(nativeGP("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true),corpus.pages[57].indices);
const controls=[];
for(const [name,file,legacyCount,calibratedCount] of [
  ["Gibran","resources/control/gibran_prophet_58585.txt",63114,62492],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",218800,217106],
  ["Emerson","resources/control/emerson_essays_2944.txt",324630,321327]
]){
  for(const calibrated of [false,true]){
    const native=nativeGP(read(file),calibrated);
    assert.equal(native.length,calibrated?calibratedCount:legacyCount);
    let e=0,min=Infinity;
    for(let i=0;i<12956;i++)e+=Number(native[i]===18);
    for(let i=0;i+12956<=native.length;i++){
      if(i){e-=Number(native[i-1]===18);
        e+=Number(native[i+12956-1]===18);}
      if(e<min)min=e;
    }
    controls.push({name,calibrated,windows:native.length-12956+1,
      minE:min,marginOverBound256ExcludingRepeatE:min-1343});
  }
}
assert.deepEqual(controls.map(c=>c.minE),[1407,1416,1397,1408,1482,1491]);
assert.equal(controls.reduce((s,c)=>s+c.windows,0),1129739);
assert(controls.every(c=>c.minE>1343));

// Positive: a genuine solved-p57 native GP stream encoded into exactly
// 12,956 synthetic symbols by a fixed, arbitrary 256-stage mod28 key.
// We additionally force 3 escape sites to validate repeat preservation.
const clear=Array.from({length:12956},(_,i)=>corpus.pages[57].indices[i%95]);
for(const i of [200,500,999])clear[i]=28;
const key=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.flatMap(p=>p.bytes).map(x=>x%28);
assert.equal(key.length,256);
/**
 * Fully reversible planted GP28 predecessor cipher with section reset.
 * Sends 55 page initials plus one source section beginning as literal IVs.
 */
function syntheticControl(order,consumption){
  const cipher=[],received=[];
  let phase=0,oldGroup=-1;
  for(let i=0;i<clear.length;i++){
    const template=entries[i],group=template.section;
    if(group!==oldGroup){phase=0;oldGroup=group;}
    const iv=template.g===sectionEnds[group]||template.g===
      (entries.find(e=>e.page===template.page).g);
    // Implement page-initial reset by explicit original page layout.
    const firstInPage=i===0||entries[i-1].page!==template.page;
    if(iv||firstInPage){
      cipher.push(clear[i]);
      received.push(clear[i]);phase+=Number(consumption==="all");
      continue;
    }
    const prev=cipher[i-1],p=clear[i];
    if(p===28){
      cipher.push(prev);received.push(28);
      phase+=Number(consumption==="all");
      continue;
    }
    const rank=(p+key[phase%256])%28;
    const c=order==="cyclic"?(prev+rank+1)%29:
      rank+Number(rank>=prev);
    cipher.push(c);
    const got=order==="cyclic"?(c-prev+28)%29:
      c-Number(c>prev);
    received.push((got-key[phase%256]+28)%28);
    phase++;
  }
  assert.deepEqual(received,clear);
  // The all-secret bound must admit an actual source-generated member.
  // It is evaluated on this new ciphertext's own 28-rank observations.
  const bins=new Uint16Array(256*28);phase=0;oldGroup=-1;
  for(let i=0;i<cipher.length;i++){
    const template=entries[i],group=template.section;
    if(group!==oldGroup){phase=0;oldGroup=group;}
    const first=i===0||entries[i-1].page!==template.page||i===sectionEnds[group];
    if(first){phase+=Number(consumption==="all");continue;}
    if(cipher[i]===cipher[i-1]){phase+=Number(consumption==="all");continue;}
    const rank=order==="cyclic"?(cipher[i]-cipher[i-1]+28)%29:
      cipher[i]-Number(cipher[i]>cipher[i-1]);
    bins[(phase%256)*28+rank]++;
    phase++;
  }
  let upper=0;
  for(let s=0;s<256;s++){
    let m=0;for(let r=0;r<28;r++)m=Math.max(m,bins[s*28+r]);
    upper+=m;
  }
  const realE=clear.filter(x=>x===18).length;
  assert(upper+sourceIV>=realE);
  return {order,consumption,plantedRunes:clear.length,
    recoveredRunes:received.length,actualE:realE,maxEFromUnknownKey:upper+sourceIV};
}
const positive=[syntheticControl("cyclic","all"),
  syntheticControl("sorted","nonrepeat")];
console.log(JSON.stringify({
  original:{runes:12956,nonrepeatRankEvents:12814,
    freelyGrantedPositions:freePositions,unknownPhysicalIVs:55,
    additionalIntraPageSectionIV:1,identicalPairs:86},
  keyFamily:{periods:"every integer from 1 through 256 inclusive",
    perPhaseSecret:"any one of 28! independent alphabet permutations",
    ranks:["cyclic","sorted"],reset:["global","page","section","chapter"],
    clock:["all","nonrepeat"],classes:16,periodSettings:4096},
  maximumOriginalE:{
    per256MaxExcludingFreed:worst[256],
    per256IfAll142FreedCouldBeE:worst[256]+142,
    per256IfRepeatSymbolIsNotE:worst[256]+56,
    allPeriodAll142FreedExclusionThrough:longestAllFreePrefix,
    allPeriodMaxIfRepeatSymbolIsNotE:Math.max(...worstPlusIVOnly)},
  independentFullLengthNativeControl:controls,positive
},null,2));
