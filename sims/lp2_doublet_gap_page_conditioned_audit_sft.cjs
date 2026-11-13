#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const pages = corpus.pages.filter(p => p.status === "unsolved");
assert.equal(pages.length, 55);

const pageRows = [];
const runes = [], runePages = [];
let offset = 0;
for (const p of pages) {
  const local = [];
  for (let i = 0; i < p.indices.length - 1; i++) if (p.indices[i] === p.indices[i + 1]) local.push(i);
  pageRows.push({ page: p.page, len: p.indices.length, local, offset });
  for (const r of p.indices) { runes.push(r); runePages.push(p.page); }
  offset += p.indices.length;
}
assert.equal(offset, 12956);

const sites = [];
for (let i = 0; i < runes.length - 1; i++) if (runes[i] === runes[i + 1]) sites.push({ pos: i, page: runePages[i] });
assert.equal(sites.length, 86);
assert.equal(sites.filter(s => runePages[s.pos] !== runePages[s.pos + 1]).length, 0);
const positions = sites.map(s => s.pos), sitePages = sites.map(s => s.page);
const gaps = positions.slice(1).map((v, i) => v - positions[i]);
assert.equal(gaps.length, 85);
assert.equal(Math.min(...gaps), 6);

function ac(a) {
  if (a.length < 3) return null;
  const x = a.slice(0, -1), y = a.slice(1);
  const mx = x.reduce((s,v)=>s+v,0)/x.length, my = y.reduce((s,v)=>s+v,0)/y.length;
  let xy=0, xx=0, yy=0;
  for(let i=0;i<x.length;i++){const dx=x[i]-mx,dy=y[i]-my;xy+=dx*dy;xx+=dx*dx;yy+=dy*dy;}
  return xx && yy ? xy/Math.sqrt(xx*yy) : null;
}
function pairAc(pairs) {
  const x=pairs.map(p=>p[0]), y=pairs.map(p=>p[1]);
  const mx=x.reduce((s,v)=>s+v,0)/x.length, my=y.reduce((s,v)=>s+v,0)/y.length;
  let xy=0,xx=0,yy=0;
  for(let i=0;i<x.length;i++){const dx=x[i]-mx,dy=y[i]-my;xy+=dx*dy;xx+=dx*dx;yy+=dy*dy;}
  return xx && yy ? xy/Math.sqrt(xx*yy) : null;
}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function chooseSorted(n,k,rand){const a=Array.from({length:n},(_,i)=>i);for(let i=0;i<k;i++){const j=i+Math.floor(rand()*(n-i));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,k).sort((x,y)=>x-y);}
function sampleMinGap(M,k,d,rand){if(!k)return[];const n=M-(d-1)*(k-1);assert.ok(n>=k);return chooseSorted(n,k,rand).map((v,i)=>v+(d-1)*i);}
function sampleInterior(first,last,k,d,rand){if(k===0)return[];if(k===1)return[first];if(k===2)return[first,last];const m=k-2,slots=last-first-2*d+1,n=slots-(d-1)*(m-1);assert.ok(n>=m);return[first,...chooseSorted(n,m,rand).map((v,i)=>first+d+v+(d-1)*i),last];}
function summarize(v,obs,absolute=false){
  const s=v.slice().sort((a,b)=>a-b),med=s[Math.floor(s.length/2)],up=v.filter(x=>x>=obs).length;
  const lo=v.filter(x=>x<=2*med-obs).length,abs=v.filter(x=>Math.abs(x)>=Math.abs(obs)).length;
  const mean=v.reduce((a,b)=>a+b,0)/v.length,variance=v.reduce((a,b)=>a+b*b,0)/v.length-mean*mean;
  return {n:v.length,mean,sd:Math.sqrt(Math.max(0,variance)),q95:s[Math.floor(.95*(s.length-1))],q99:s[Math.floor(.99*(s.length-1))],median:med,pUpper:(up+1)/(v.length+1),pTwoSided: absolute?(abs+1)/(v.length+1):Math.min(1,(2*Math.min(up,lo)+1)/(v.length+1))};
}
const blockN=Math.ceil(runes.length/1000);
function blockCounts(pos){const a=Array(blockN).fill(0);for(const v of pos)a[Math.floor(v/1000)]++;return a;}

const categories={WW:[],WX:[],XW:[],XX:[]};
for(let i=0;i<gaps.length-1;i++){
  const a=sitePages[i]===sitePages[i+1],b=sitePages[i+1]===sitePages[i+2];
  categories[(a?"W":"X")+(b?"W":"X")].push([gaps[i],gaps[i+1]]);
}
const categorySummary=Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,{n:v.length,ac1:pairAc(v)}]));
const crossPageGaps=sitePages.slice(1).filter((p,i)=>p!==sitePages[i]).length;
const pageCounts=pageRows.map(p=>p.local.length),pageCountDistribution={};
for(const k of pageCounts)pageCountDistribution[k]=(pageCountDistribution[k]||0)+1;
const observed={gapAc1:ac(gaps),blockCounts:blockCounts(positions),blockCountAc1:ac(blockCounts(positions)),pageCountAc1:ac(pageCounts)};

// Uniform K-subset sampler over sorted candidate positions with global gap >= d.
// Log-space DP recurrence counts subsets that skip i or select i and jump to next[i].
function spacingSampler(candidates,k,d,rand){
  const n=candidates.length,next=new Int32Array(n);let j=0;
  for(let i=0;i<n;i++){if(j<i+1)j=i+1;while(j<n&&candidates[j]-candidates[i]<d)j++;next[i]=j;}
  function logAdd(a,b){if(a===-Infinity)return b;if(b===-Infinity)return a;const m=Math.max(a,b);return m+Math.log1p(Math.exp(Math.min(a,b)-m));}
  const dp=Array.from({length:n+1},()=>new Float64Array(k+1).fill(-Infinity));
  for(let i=0;i<=n;i++)dp[i][0]=0;
  for(let i=n-1;i>=0;i--)for(let r=1;r<=k;r++)dp[i][r]=logAdd(dp[i+1][r],dp[next[i]][r-1]);
  assert.ok(Number.isFinite(dp[0][k]));
  return {logWays:dp[0][k],sample(){
    const out=[];let start=0,remaining=k;
    while(remaining){const threshold=dp[start][remaining]+Math.log(1-rand());let lo=start,hi=n-1;
      while(lo<hi){const mid=(lo+hi)>>1;if(dp[mid+1][remaining]<=threshold)hi=mid;else lo=mid+1;}
      out.push(candidates[lo]);start=next[lo];remaining--;
    }
    assert.equal(out.length,k);for(let i=1;i<out.length;i++)assert.ok(out[i]-out[i-1]>=d);return out;
  }};
}

const D=Number(process.env.LP2_T7_D||100000), MIN=6;
const candidates=[];let off=0;
for(const p of pages){for(let i=0;i<p.indices.length-1;i++)candidates.push(off+i);off+=p.indices.length;}
assert.equal(candidates.length,12901);
const globalSampler=spacingSampler(candidates,86,MIN,rng(0x4d595df4));
const globalGap=[],globalBlock=[];
for(let i=0;i<D;i++){const p=globalSampler.sample(),g=p.slice(1).map((v,j)=>v-p[j]);globalGap.push(ac(g));globalBlock.push(ac(blockCounts(p)));}

const conditionalRand=rng(0x6f6c6453),countGap=[],countBlock=[],endpointGap=[];
let rejected=0;
for(let t=0;t<D;t++){
  let pos=[],base=0,accepted=false;
  while(!accepted){pos=[];base=0;for(const p of pageRows){for(const v of sampleMinGap(p.len-1,p.local.length,MIN,conditionalRand))pos.push(base+v);base+=p.len;}
    accepted=pos.slice(1).every((v,i)=>v-pos[i]>=MIN);if(!accepted)rejected++;
  }
  const g=pos.slice(1).map((v,i)=>v-pos[i]);countGap.push(ac(g));countBlock.push(ac(blockCounts(pos)));
  pos=[];base=0;
  for(const p of pageRows){for(const v of sampleInterior(p.local[0],p.local[p.local.length-1],p.local.length,MIN,conditionalRand))pos.push(base+v);base+=p.len;}
  const eg=pos.slice(1).map((v,i)=>v-pos[i]);assert.ok(eg.every(v=>v>=MIN));endpointGap.push(ac(eg));
}

const runeSet=new Set(corpus.runes),segments=transcription.split("%").map(s=>s.trim()).filter(s=>[...s].some(c=>runeSet.has(c)));
assert.equal(segments.length,57);
let transcribedRunes=0,transcribedSites=0;const sepSites={},sepOpp={};
for(const segment of segments.slice(0,55)){let prev=null,between="";for(const c of segment){if(runeSet.has(c)){
  if(prev!==null){const key=between.replace(/\s/g,"")||"NONE";sepOpp[key]=(sepOpp[key]||0)+1;if(prev===c){transcribedSites++;sepSites[key]=(sepSites[key]||0)+1;}}
  prev=c;between="";transcribedRunes++;
}else if(prev!==null)between+=c;}}
assert.equal(transcribedRunes,12956);assert.equal(transcribedSites,86);

console.log(JSON.stringify({
  pages:pages.length,runes:runes.length,sites:sites.length,gaps:gaps.length,minGap:6,
  observed,crossPageGaps,gapPairCategories:categorySummary,pageCountDistribution,
  withinPageGapPairCount:categories.WW.length,withinPageGapPairAc1:categorySummary.WW.ac1,
  globalPageAwareUniformNull:summarize(globalGap,observed.gapAc1,true),
  globalNullBlockCount:summarize(globalBlock,observed.blockCountAc1),
  pageCountConditionedNull:summarize(countGap,observed.gapAc1),
  pageCountAndEndpointsConditionedNull:summarize(endpointGap,observed.gapAc1),
  pageConditionedBlockNull:summarize(countBlock,observed.blockCountAc1),
  rejectedPageConditionedDraws:rejected,
  transcription:{doubletsBySeparator:sepSites,opportunitiesBySeparator:sepOpp},
  nullDesign:{draws:D,globalSeed:"0x4d595df4",conditionalSeed:"0x6f6c6453",minimumGap:MIN,familywiseAlpha:0.01/7,global:"uniform 86-subset of all within-page adjacency slots, no page-join candidate, global gap >=6",conditional:"fixed per-page counts; endpoint sensitivity additionally fixes first/last site positions"}
},null,2));
