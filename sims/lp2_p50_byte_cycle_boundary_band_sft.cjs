"use strict";
/**
 * Reproducer for im-results/lp2-p50-byte-cycle-boundary-band.md
 * Run: node sims/lp2_p50_byte_cycle_boundary_band_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const A60=grid.alphabet,A59=A60.replace("f","");
const TOKENS=grid.rows.flat(),B60=grid.byte_rows.flat();
const B59=TOKENS.map(t=>59*A59.indexOf(t[0])+A59.indexOf(t[1]));
const pages=corpus.pages.filter(p=>p.status==="unsolved"&&p.page<=55&&p.runic_count);
const lens=pages.map(p=>p.indices.length),original=pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);assert.equal(TOKENS.length,256);

function comb(n,k){
  if(k<0||k>n)return 0;if(k>n-k)k=n-k;
  let x=1;for(let j=1;j<=k;j++)x=x*(n-k+j)/j;return x;
}
/**
 * Conditional exact band-hit distribution. Each residue's observed repeat
 * count is fixed; only which cycle occurrences carry those repeats varies.
 * @param {number[]} runes
 * @param {number[]} values
 * @param {{excludeResidue?:number|null,cycleMin?:number,cycleMax?:number}} [opt]
 */
function analyze(runes,values,opt={}){
  assert.equal(runes.length,12956);
  const exclude=opt.excludeResidue??null,cmin=opt.cycleMin??0,cmax=opt.cycleMax??50;
  const opp=Array.from({length:256},()=>[]),hit=Array.from({length:256},()=>[]);
  let global=0;
  for(const L of lens){
    for(let k=0;k<L-1;k++){
      const i=global+k,cycle=Math.floor(i/256),r=i&255;
      if(cycle<cmin||cycle>cmax||r===exclude)continue;
      opp[r].push(i);if(runes[i]===runes[i+1])hit[r].push(i);
    }
    global+=L;
  }
  let dp=[1],observed=0,flagged=0,events=0,expected=0;const hitList=[];
  for(let r=0;r<256;r++){
    const n=opp[r].length,e=hit[r].length,b=values[r];events+=e;
    if(!n)continue;
    const targets=opp[r].filter(i=>{const c=Math.floor(i/256);return c===b||c===b-1;});
    const set=new Set(targets),these=hit[r].filter(i=>set.has(i)),m=targets.length;
    flagged+=m;observed+=these.length;expected+=m*e/n;
    if(these.length)hitList.push({r,token:TOKENS[r],value:b,sites:these});
    const den=comb(n,e),maxk=Math.min(e,m),p=[];
    for(let k=0;k<=maxk;k++)p[k]=den?comb(m,k)*comb(n-m,e-k)/den:0;
    const nd=Array(dp.length+maxk).fill(0);
    for(let a=0;a<dp.length;a++)for(let k=0;k<p.length;k++)nd[a+k]+=dp[a]*p[k];
    dp=nd;
  }
  return {events,flagged,observed,expected,tail:dp.slice(observed).reduce((a,b)=>a+b,0),hitList};
}
const b60=analyze(original,B60),b59=analyze(original,B59);
assert.deepEqual([b60.events,b60.flagged,b60.observed],[86,83,6]);
assert(Math.abs(b60.expected-0.9002240896358542)<1e-12);
assert(Math.abs(b60.tail-0.00015674867770998913)<1e-15);
assert.deepEqual(b60.hitList.map(x=>[x.r,x.token,x.value,...x.sites]),[
 [13,"04",4,781,1037],[78,"0k",46,11598],[165,"0I",18,4773],
 [181,"0e",40,10165],[188,"0c",38,9916]
]);
assert.deepEqual([b59.flagged,b59.observed],[85,6]);
assert(Math.abs(b59.tail-0.0002027125605546032)<1e-15);
assert.deepEqual(b59.hitList.flatMap(x=>x.sites).sort((a,b)=>a-b),
 [781,1037,4773,9916,10165,11598]);

const no13=analyze(original,B60,{excludeResidue:13});
assert.deepEqual([no13.events,no13.flagged,no13.observed],[84,81,4]);
assert(Math.abs(no13.tail-0.007466771447343139)<1e-15);
const early=analyze(original,B60,{cycleMin:0,cycleMax:24});
const late=analyze(original,B60,{cycleMin:25,cycleMax:50});
assert.deepEqual([early.events,early.flagged,early.observed],[40,35,3]);
assert.deepEqual([late.events,late.flagged,late.observed],[46,48,3]);
assert(Math.abs(early.tail-0.009063093333333333)<1e-15);
assert(Math.abs(late.tail-0.023324184145674713)<1e-15);

function opportunityCounts(runes){
  const opp=Array.from({length:256},()=>[]),counts=Array(256).fill(0),sites=[];
  let global=0;
  for(const L of lens){
    for(let k=0;k<L-1;k++){
      const i=global+k,r=i&255;opp[r].push(i);
      if(runes[i]===runes[i+1]){counts[r]++;sites.push(i);}
    }
    global+=L;
  }
  return {opp,counts,sites};
}
function maxAdjacentBand(sites){
  const h=new Map();
  for(const i of sites){const d=B60[i&255]-Math.floor(i/256);h.set(d,(h.get(d)||0)+1);}
  let best=-1,bestKs=[];
  for(let k=-51;k<=255;k++){
    const v=(h.get(k)||0)+(h.get(k+1)||0);
    if(v>best){best=v;bestKs=[k];}else if(v===best)bestKs.push(k);
  }
  return {best,bestKs,source:(h.get(0)||0)+(h.get(1)||0)};
}
const oc=opportunityCounts(original);
assert.deepEqual(maxAdjacentBand(oc.sites),{best:6,bestKs:[0],source:6});
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
const random=rng(0x3301b0ad);
function conditionalSites(){
  const out=[];
  for(let r=0;r<256;r++){
    const a=oc.opp[r].slice(),e=oc.counts[r];
    for(let j=0;j<e;j++){
      const k=j+(random()%(a.length-j));[a[j],a[k]]=[a[k],a[j]];out.push(a[j]);
    }
  }
  return out;
}
let sourceGE=0,anyGE=0;
for(let t=0;t<50000;t++){
  const m=maxAdjacentBand(conditionalSites());
  sourceGE+=Number(m.source>=6);anyGE+=Number(m.best>=6);
}
assert.equal(sourceGE,6);assert.equal(anyGE,676);
const sourceTail=(sourceGE+1)/50001,familyTail=(anyGE+1)/50001;
assert(Math.abs(sourceTail-0.0001399972000559989)<1e-15);
assert(Math.abs(familyTail-0.013539729205415891)<1e-15);

// Calibrated source-native GP controls.
const gpTokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeNativeGP(text){
  const clean=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(const word of clean.match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const t=gpTokens.find(x=>word.startsWith(x.s,i));assert(t);
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const controls=[];
for(const [name,file,countExpected] of [
 ["Shakespeare","resources/control/shakespeare_first300k.txt",32],
 ["Gibran","resources/control/gibran_prophet_58585.txt",8],
 ["Emerson","resources/control/emerson_essays_2944.txt",48]
]){
  const enc=encodeNativeGP(read(file));let n=0;
  for(let start=0;start+12956<=enc.length;start+=6478){
    controls.push({name,start,...analyze(enc.slice(start,start+12956),B60});n++;
  }
  assert.equal(n,countExpected);
}
assert.equal(controls.length,88);
assert.equal(controls.filter(x=>x.tail<=b60.tail).length,0);
assert.equal(controls.filter(x=>x.observed>=6).length,4);
const best=controls.slice().sort((a,b)=>a.tail-b.tail)[0];
assert.deepEqual([best.name,best.start,best.events,best.observed],["Shakespeare",0,412,9]);
assert(Math.abs(best.tail-0.0008543505559437308)<1e-15);

console.log(JSON.stringify({
 classification:"exploratory cycle-dependent p50 timing lead; no plaintext/key/opcode",
 base60:{events:b60.events,bandOpportunities:b60.flagged,hits:b60.observed,expected:b60.expected,tail:b60.tail,hitList:b60.hitList},
 dropF59:{bandOpportunities:b59.flagged,hits:b59.observed,expected:b59.expected,tail:b59.tail},
 hotspotExcluded:{events:no13.events,bandOpportunities:no13.flagged,hits:no13.observed,tail:no13.tail},
 temporal:{early:{hits:early.observed,tail:early.tail},late:{hits:late.observed,tail:late.tail}},
 offsetFamily:{draws:50000,seed:"0x3301b0ad",sourceGE,anyGE,sourceTail,familyTail},
 sourceNativeControls:{windows:88,tailsAtOrBelowOriginal:0,rawHitsAtOrAboveOriginal:4,best:{name:best.name,start:best.start,events:best.events,hits:best.observed,tail:best.tail}},
 decision:"preserve as cycle-state candidate; require first-party selector and reversible ciphertext consequence"
},null,2));
