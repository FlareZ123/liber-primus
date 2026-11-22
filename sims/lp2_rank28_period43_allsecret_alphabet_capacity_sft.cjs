"use strict";
/**
 * Source original GP29 predecessor-exclusion one-rune upper capacity with
 * arbitrary 29-rune ciphertext order and arbitrary 28-way secret plaintext
 * alphabet chosen independently for every periodic key phase.
 * Test every period 1-60 and four source clocks x two consumption policies.
 *
 * Windows Node.js22 CJS, read-only, built-ins only. Exact theorem checked
 * against exhaustive independent q=4/5 secret-permutation oracle.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=s=>fs.readFileSync(path.join(root,s),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const runes=pages.flatMap(p=>p.indices);
assert.equal(runes.length,12956);
assert.equal(pages.length,55);
const E=18,ALPHABET=29;
const sections=[0,729,1874,3612,5506,6527,7960,9640,12956];
const chapters=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const address=(i,end)=>end.findIndex((v,j)=>j<end.length-1&&i>=v&&i<end[j+1]);
const records=[];
let global=0;
for(let page=0;page<pages.length;page++){
  const x=pages[page].indices;
  for(let local=0;local<x.length;local++){
    const section=address(global,sections);
    const chapter=address(global,chapters);
    const previous=x[local-1],current=x[local];
    records.push({page,section,chapter,previous,current,
      free:local===0||global===sections[section]||current===previous});
    global++;
  }
}
assert.equal(records.length,12956);
assert.equal(records.filter(x=>x.free).length,142);
assert.equal(records.filter(x=>!x.free).length,12814);
assert.equal(pages.reduce((n,p)=>n+p.indices.slice(1).filter((v,i)=>v===p.indices[i]).length,0),86);
function maximum(T,q){
  let best=-1;
  for(let a=0;a<q;a++)for(let b=a+1;b<q;b++){
    let sum=T[a*q+b]+T[b*q+a];
    for(let prev=0;prev<q;prev++){
      if(prev===a||prev===b)continue;
      sum+=Math.max(T[prev*q+a],T[prev*q+b]);
    }
    best=Math.max(best,sum);
  }
  return best;
}
/**
 * Independent exhaustive GP-ordering oracle on small q matrices. The rank
 * is a position in the ordered q-1 remaining symbols, and one plaintext
 * E can represent exactly one such rank under a bijective secret mapping.
 */
function brute(T,q){
  let mx=-1;
  const order=Array.from({length:q},(_,i)=>i);
  const permute=(i)=>{
    if(i===q){
      const position=Array(q);
      for(let k=0;k<q;k++)position[order[k]]=k;
      const ranks=Array(q-1).fill(0);
      for(let a=0;a<q;a++)for(let b=0;b<q;b++)
        if(a!==b)ranks[position[b]-Number(position[a]<position[b])]+=T[a*q+b];
      mx=Math.max(mx,...ranks);
      return;
    }
    for(let j=i;j<q;j++){
      [order[i],order[j]]=[order[j],order[i]];
      permute(i+1);
      [order[i],order[j]]=[order[j],order[i]];
    }
  };
  permute(0);
  return mx;
}
let seed=3301;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
let bruteCases=0;
for(const q of [4,5,6])for(let t=0;t<12;t++){
  const T=new Int32Array(q*q);
  for(let a=0;a<q;a++)for(let b=0;b<q;b++)if(a!==b)T[a*q+b]=random()%17;
  assert.equal(maximum(T,q),brute(T,q));
  bruteCases++;
}
assert.equal(bruteCases,36);
/**
 * @param {"book"|"page"|"section"|"chapter"} reset
 * @param {"all"|"nonfree"} consumption
 */
function observations(reset,consumption){
  let group=-1,phase=0,free=0;
  const obs=[];
  for(const r of records){
    const current=reset==="book"?0:r[reset];
    if(current!==group){phase=0;group=current;}
    if(r.free)free++;
    else obs.push([phase,r.previous,r.current]);
    if(consumption==="all"||!r.free)phase++;
  }
  assert.equal(free,142);
  assert.equal(obs.length,12814);
  return obs;
}
const modes=[];
for(const reset of ["book","page","section","chapter"])
for(const consumption of ["all","nonfree"])
  modes.push({reset,consumption,obs:observations(reset,consumption)});
/** Full arbitrary-order 29! exact upper per phase and 28! output alphabet. */
function sourceCapacity(data,period){
  const T=Array.from({length:period},()=>new Int32Array(ALPHABET*ALPHABET));
  for(const [clock,previous,current] of data)
    T[clock%period][previous*ALPHABET+current]++;
  return T.reduce((sum,m)=>sum+maximum(m,ALPHABET),142);
}
const periods=[];
for(let period=1;period<=60;period++){
  let highest=0,winner=null;
  for(const mode of modes){
    const count=sourceCapacity(mode.obs,period);
    if(count>highest){
      highest=count;
      winner={reset:mode.reset,consumption:mode.consumption};
    }
  }
  periods.push({period,maxPossibleE:highest,winningClock:winner});
}
assert.deepEqual(periods.slice(0,13).map(x=>x.maxPossibleE),
 [716,770,807,855,875,887,921,946,957,988,1004,1034,1036]);
assert.equal(periods[31].maxPossibleE,1288);
assert.equal(periods[42].maxPossibleE,1370);
assert.equal(periods[43].maxPossibleE,1398);
assert.equal(periods[59].maxPossibleE,1526);
const minProseE=1397;
const firstPotential=periods.find(p=>p.maxPossibleE>=minProseE);
assert.equal(firstPotential.period,44);
assert(periods.slice(0,43).every(x=>x.maxPossibleE<minProseE));
assert.equal(Math.max(...periods.slice(0,43).map(x=>x.maxPossibleE)),1372);

// Positive: encrypt a full authentic solved-p57 GP29 native source with
// source-rune ordering unavailable to the observer. The theorem must not
// exclude the originating native source; correct secret inverse recovers all.
const clear=Array.from({length:12956},(_,i)=>corpus.pages[57].indices[i%95]);
assert.equal(corpus.pages[57].indices.length,95);
for(const pos of [200,500,999])clear[pos]=28;
const expectedE=clear.filter(v=>v===E).length;
assert.equal(expectedE,2044);
const secretOrder=Array.from({length:29},(_,i)=>(i*11+3)%29);
assert.equal(new Set(secretOrder).size,29);
const pos=Array(29).fill(0);
for(let i=0;i<29;i++)pos[secretOrder[i]]=i;
const key=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))
  .pages.flatMap(x=>x.bytes).map(v=>v%28);
assert.equal(key.length,256);
const cipher=[],recovered=[];let clock=0,priorSection=-1;
for(let i=0;i<clear.length;i++){
  const r=records[i];
  if(r.section!==priorSection){priorSection=r.section;clock=0;}
  const iv=i===0||records[i-1].page!==r.page||
    i===sections[r.section];
  if(iv){cipher.push(clear[i]);recovered.push(clear[i]);clock++;continue;}
  const prev=cipher[i-1],plain=clear[i];
  if(plain===28){cipher.push(prev);recovered.push(28);clock++;continue;}
  const rank=(plain+key[clock%256])%28;
  const emitted=secretOrder.filter(v=>v!==prev)[rank];
  cipher.push(emitted);
  const observed=pos[emitted]-Number(pos[prev]<pos[emitted]);
  recovered.push((observed-key[clock%256]+28)%28);
  clock++;
}
assert.deepEqual(recovered,clear);
const t=[];clock=0;priorSection=-1;
for(let i=0;i<cipher.length;i++){
  const r=records[i];
  if(r.section!==priorSection){priorSection=r.section;clock=0;}
  const iv=i===0||records[i-1].page!==r.page||i===sections[r.section];
  if(!iv&&cipher[i]!==cipher[i-1])t.push([clock,cipher[i-1],cipher[i]]);
  clock++;
}
const positiveCap=sourceCapacity(t,256);
assert(positiveCap>=expectedE);
console.log(JSON.stringify({
  original:{runes:runes.length,sourcePageInitials:55,
    extraSectionIV:1,repeatEvents:86,fullyFree:142,
    rankEvents:12814},
  family:{periods:"every period from 1 through 60; threshold at 44",
    independent29RuneSourceOrdersPerPhase:"every one of 29! possible source orders",
    independent28WayPlaintextMappingsPerPhase:"every one of 28! mappings",
    clockPolicies:modes.map(m=>m.reset+"/"+m.consumption),
    exactFormula:"max(a<b) T[a,b]+T[b,a]+SUM(s other than a,b) max(T[s,a],T[s,b])",
    smallAlphabetExhaustiveOracles:bruteCases},
  sourceResult:{periods1through43MaxPossibleE:1372,
    firstPeriodCapableOf1397E:firstPotential,
    period32Cap:periods[31].maxPossibleE,
    period43Cap:periods[42].maxPossibleE,
    period44Cap:periods[43].maxPossibleE,
    period60Cap:periods[59].maxPossibleE},
  sourceControls:{lowestFullLengthEnglishE:minProseE,
    controlDetails:"1,129,739 original-sized native GP-English windows independently pinned in period256 SFT"},
  positive:{sourceNativeRunes:clear.length,recovered:recovered.length,
    actualE:expectedE,capacityForPlantedOriginal:positiveCap}
},null,2));
