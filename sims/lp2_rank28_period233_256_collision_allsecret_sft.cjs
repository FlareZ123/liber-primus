"use strict";
/**
 * Full original, escape-identity-independent, all-secret GP28 periodic
 * rank-collision test for periods 233..256 inclusive. These are exactly
 * the periods not yet excluded under completely free repeat symbols by the
 * independent key-free single-E occupancy theorem for 1..232.
 *
 * All 8 clock conventions, both source-fixed predecessor rank schemes,
 * every relevant period, 900 original-sized source-GP native controls
 * per clock & period (172,800 matched comparisons).
 * Windows Node.js22 CJS, no dependencies beyond built-ins.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=c.pages.filter(p=>p.page<=55&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.equal(pages.length,55);
const secs=[0,729,1874,3612,5506,6527,7960,9640,12956];
const chapters=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const section=i=>secs.findIndex((v,j)=>j<8&&i>=v&&i<secs[j+1]);
const chapter=i=>chapters.findIndex((v,j)=>j<9&&i>=v&&i<chapters[j+1]);
const rec=[];let global=0;
for(let page=0;page<pages.length;page++){
  const a=pages[page].indices;
  for(let i=0;i<a.length;i++){
    const s=section(global),h=chapter(global),v=a[i],previous=a[i-1];
    const free=i===0||global===secs[s]||v===previous;
    rec.push({page,section:s,chapter:h,free,
      cyclic:free?0:(v-previous+28)%29,
      sorted:free?0:v-Number(v>previous)});
    global++;
  }
}
assert.equal(rec.length,12956);
assert.equal(rec.filter(x=>x.free).length,142);
assert.equal(rec.filter(x=>!x.free).length,12814);
const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} source @param {boolean} calibrated */
function native(source,calibrated){
  const raw=source.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const result=[];
  for(const word of raw.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(calibrated&&word.startsWith("ING",i)){result.push(21);i+=3;continue;}
      if(calibrated&&word.startsWith("IO",i)){result.push(27);i+=2;continue;}
      const token=tokens.find(z=>word.startsWith(z.s,i));
      assert(token);result.push(token.i);i+=token.s.length;
    }
  }
  return result;
}
assert.deepEqual(native("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE",true),c.pages[57].indices);
const sources=[];
for(const [name,file,legacy,correct] of [
  ["Gibran","resources/control/gibran_prophet_58585.txt",63114,62492],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",218800,217106],
  ["Emerson","resources/control/emerson_essays_2944.txt",324630,321327]
]){
  const raw=read(file);
  for(const calibrated of [false,true]){
    const g=native(raw,calibrated);
    assert.equal(g.length,calibrated?correct:legacy);
    const offsets=Array.from({length:150},(_,i)=>
      Math.floor((g.length-original.length)*i/149));
    assert.equal(new Set(offsets).size,150);
    sources.push({name,calibrated,g,offsets});
  }
}
assert.equal(sources.length,6);
/**
 * @param {"book"|"page"|"section"|"chapter"} reset
 * @param {"all"|"nonfree"} advance
 * @param {number} period
 */
function mask(reset,advance,period){
  const mask=new Int16Array(rec.length).fill(-1),positions=[];
  let state=0,group=-1;
  for(let i=0;i<rec.length;i++){
    const r=rec[i],grp=reset==="book"?0:r[reset];
    if(grp!==group){state=0;group=grp;}
    if(!r.free){mask[i]=state%period;positions.push(i);}
    if(advance==="all"||!r.free)state++;
  }
  assert.equal(positions.length,12814);
  return {mask,positions};
}
/** @param {Uint16Array} n @param {number} period */
function pairDenominator(n,period){
  let sum=0;for(let phase=0;phase<period;phase++)sum+=n[phase]*(n[phase]-1);
  return sum;
}
/** @param {Uint16Array} bins @param {number} period
 * @param {number} alphabet
 */
function pairNumerator(bins,period,alphabet){
  let sum=0;for(let i=0;i<period*alphabet;i++){
    const n=bins[i];sum+=n*(n-1);
  }
  return sum;
}
function originalQ(rows,period){
  const n=new Uint16Array(period);
  const cyc=new Uint16Array(period*28);
  const sorted=new Uint16Array(period*28);
  for(const i of rows.positions){
    const phase=rows.mask[i],r=rec[i];
    n[phase]++;cyc[phase*28+r.cyclic]++;sorted[phase*28+r.sorted]++;
  }
  const denom=pairDenominator(n,period);
  return {max:Math.max(pairNumerator(cyc,period,28),
      pairNumerator(sorted,period,28))/denom,
    cyclic:pairNumerator(cyc,period,28)/denom,
    sorted:pairNumerator(sorted,period,28)/denom,
    denom};
}
/** @param {number[]} g @param {number} start
 * @param {ReturnType<typeof mask>} rows @param {number} period
 * @param {number} denom
 */
function nativeQ(g,start,rows,period,denom){
  const bins=new Uint16Array(period*29);
  const phases=rows.mask;
  for(const i of rows.positions)bins[phases[i]*29+g[start+i]]++;
  return pairNumerator(bins,period,29)/denom;
}
const results=[];let minGap=Infinity,highestOriginal=-1,
  lowestControl=Infinity,totalComparisons=0;
for(let period=233;period<=256;period++){
  let bestOriginal=0,worstControl=Infinity,minClock=null;
  for(const reset of ["book","page","section","chapter"])
  for(const advance of ["all","nonfree"]){
    const rows=mask(reset,advance,period);
    const original=originalQ(rows,period);
    bestOriginal=Math.max(bestOriginal,original.max);
    highestOriginal=Math.max(highestOriginal,original.max);
    let low=Infinity,first=null;
    for(const s of sources){
      for(const start of s.offsets){
        const q=nativeQ(s.g,start,rows,period,original.denom);
        totalComparisons++;
        if(q<low){low=q;first={source:s.name,
          calibrated:s.calibrated,start};}
      }
    }
    lowestControl=Math.min(lowestControl,low);
    const gap=low-original.max;
    if(gap<minGap)minGap=gap;
    if(low<worstControl){worstControl=low;minClock={reset,advance,first};}
    assert(gap>0.01,
      `Original rank native collision gap failed at period ${period} ${reset} ${advance}: ${gap}`);
  }
  results.push({period,maxOriginalQ:bestOriginal,minNativeQ:worstControl,
    minNativeClock:minClock});
}
assert.equal(results.length,24);
assert.equal(totalComparisons,172800);
assert(results.every(x=>x.minNativeQ>x.maxOriginalQ));
const p256=results.at(-1);
assert.equal(p256.period,256);
assert.equal(p256.maxOriginalQ,0.03629385269301529);
assert.equal(p256.minNativeQ,0.05630316188273788);

// Exact planted equality invariant for a new period-233 source-native
// ciphertext; modulo28 secret shifts permute rank labels at each state.
const p57=c.pages[57].indices;
const P=Array.from({length:12956},(_,i)=>p57[i%95]);
for(const pos of [200,500,999])P[pos]=28;
const C=[],K=[],secret=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.flatMap(p=>p.bytes).map(x=>x%28);
assert.equal(secret.length,256);
let last=-1,clock=0;
for(let i=0;i<P.length;i++){
  const r=rec[i];
  if(r.section!==last){clock=0;last=r.section;}
  const iv=i===0||rec[i-1].page!==r.page||i===secs[r.section];
  K.push(clock%233);
  if(iv)C.push(P[i]);
  else if(P[i]===28)C.push(C[i-1]);
  else C.push((C[i-1]+1+((P[i]+secret[clock%233])%28))%29);
  clock++;
}
const a=new Uint16Array(233*28),b=new Uint16Array(233*29),n=new Uint16Array(233);
let included=0;
for(let i=0;i<P.length;i++){
  const r=rec[i],iv=i===0||rec[i-1].page!==r.page||i===secs[r.section];
  if(iv){assert.equal(C[i],P[i]);continue;}
  if(C[i]===C[i-1]){assert.equal(P[i],28);continue;}
  const diff=(C[i]-C[i-1]+28)%29,rank=diff;
  assert.equal((rank-secret[K[i]]+28)%28,P[i]);
  a[K[i]*28+rank]++;b[K[i]*29+P[i]]++;n[K[i]]++;included++;
}
const denom=pairDenominator(n,233);
const qa=pairNumerator(a,233,28)/denom;
const qb=pairNumerator(b,233,29)/denom;
assert.equal(qa,qb);
assert(qb>0.06);
console.log(JSON.stringify({
  original:{runes:12956,sourceEqualEvents:86,unclaimed:142,
    ordinaryRankEvents:12814},
  family:{periods:"every integer 233..256 inclusive",
    sourceClocks:["book","page","section","chapter"],
    consumption:["all","nonfree"],
    hiddenKeys:"arbitrary 28! plaintext permutation independently each phase",
    keySettingCount:24*8*2},
  results:{periods:results,
    totalMatchedNativeWindowTests:totalComparisons,
    highestOriginalQ,lowestControl,minGap,
    nativeMatchesAtOrBelowOriginal:0,
    previouslyProvedAllFreeEExclusion:"periods1..232"},
  positive:{period:233,knownSolvedNativeRunes:P.length,
    exactlyRecovered:P.length,eligible:included,rankQ:qa,
    sourcePlainQ:qb}
},null,2));
