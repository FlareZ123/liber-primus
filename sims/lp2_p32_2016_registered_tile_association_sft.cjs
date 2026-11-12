"use strict";
/**
 * LP2 p32 ↔ 2016 tree JPEG: held-out, source-registered tile-intensity
 * association test. Run with Node.js 22 at repository root.
 *
 * The 11 p32 top-row/left-column prime values partition the signed 2016
 * 563×569 JPEG. The 100 interior rune positions do not participate in
 * defining tile boundaries; only those are used for the association gate.
 * No tile orientation, shift, cipher key, image filter or threshold is fitted.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const jpeg=require("./vendor/jpeg-js-decoder.cjs");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const p32=corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const primes=p32.map(i=>corpus.prime[i]);
const xWidths=primes.slice(0,11);
const yHeights=Array.from({length:11},(_,r)=>primes[11*r]);
assert.equal(xWidths.reduce((a,b)=>a+b),563);
assert.equal(yHeights.reduce((a,b)=>a+b),569);
const image=jpeg(fs.readFileSync(path.join(root,
  "resources/historical/cicada2016-4gq25.jpg")),
  {useTArray:true,formatAsRGBA:false,maxResolutionInMP:2});
assert.deepEqual([image.width,image.height],[563,569]);
const x0=[0],y0=[0];
for(const w of xWidths)x0.push(x0.at(-1)+w);
for(const h of yHeights)y0.push(y0.at(-1)+h);
const tiles=[];
for(let r=0;r<11;r++)for(let c=0;c<11;c++){
  let sum=0,sum2=0,dark=0,n=0;
  for(let y=y0[r];y<y0[r+1];y++)
    for(let x=x0[c];x<x0[c+1];x++){
      const k=(y*563+x)*3;
      const v=(image.data[k]+image.data[k+1]+image.data[k+2])/3;
      sum+=v;sum2+=v*v;n++;
      if(v<128)dark++;
    }
  const xm=Math.floor((x0[c]+x0[c+1]-1)/2);
  const ym=Math.floor((y0[r]+y0[r+1]-1)/2);
  const k=(ym*563+xm)*3;
  tiles.push({
    meanDark:255-sum/n,
    centerDark:255-(image.data[k]+image.data[k+1]+image.data[k+2])/3,
    darkFraction:dark/n,
    localStd:Math.sqrt(Math.max(0,sum2/n-(sum/n)**2)),
    cellPixels:n
  });
}
assert.equal(tiles.length,121);
const positions=Array.from({length:100},(_,i)=>11*(Math.floor(i/10)+1)+(i%10)+1);
assert.equal(new Set(positions).size,100);
/** @param {number[]} a @param {number[]} b */
function corr(a,b){
  const n=a.length;
  assert.equal(n,b.length);
  const sa=a.reduce((x,y)=>x+y,0)/n;
  const sb=b.reduce((x,y)=>x+y,0)/n;
  let aa=0,bb=0,ab=0;
  for(let i=0;i<n;i++){
    const x=a[i]-sa,y=b[i]-sb;
    aa+=x*x;bb+=y*y;ab+=x*y;
  }
  return aa*bb>0 ? ab/Math.sqrt(aa*bb) : 0;
}
const metricNames=["meanDark","centerDark","darkFraction","localStd"];
const features=metricNames.map(name=>positions.map(i=>tiles[i][name]));
const targets=[
  positions.map(i=>p32[i]),
  positions.map(i=>primes[i])
];
const labels=["gpIndex","gpPrime"];
/** @param {number[][]} candidates */
function family(candidates){
  return candidates.flatMap((target,j)=>features.map((feature,k)=>({
    label:labels[j]+"/"+metricNames[k],
    r:corr(target,feature)
  })));
}
const observed=family(targets);
const maxObserved=Math.max(...observed.map(x=>Math.abs(x.r)));
const seed=0x56356932;
let rng=seed;
/** Deterministic unsigned xorshift32. */
function next(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
const trials=20000;
let exceed=0,mean=0,maxNull=0;
for(let t=0;t<trials;t++){
  const shuf=Array.from({length:100},(_,i)=>i);
  for(let i=99;i>0;i--){const j=next()%(i+1);[shuf[i],shuf[j]]=[shuf[j],shuf[i]];}
  const nullFamily=family(targets.map(v=>shuf.map(i=>v[i])));
  const m=Math.max(...nullFamily.map(x=>Math.abs(x.r)));
  if(m>=maxObserved)exceed++;
  mean+=m;maxNull=Math.max(maxNull,m);
}
const plant=targets[1].map(x=>x*7+13);
assert.equal(corr(targets[1],plant),1);
const ranking=observed.slice().sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));
console.log(JSON.stringify({
  hypothesis:"Original p32 interior 100 GP values are encoded directly as brightness/ink density in 2016 dimension-registered tree tiles",
  source:"p32 original 121 runes, 2016 signed original 563x569 JPEG",
  dimensions:[image.width,image.height],xWidths,yHeights,
  heldoutCells:positions.length,
  firstRowAndColumnReservedForPartition:true,
  candidateReadings:observed.length,
  measured:ranking,
  familyMaxAbsolutePearson:maxObserved,
  shuffledFixedMarginalTrials:trials,
  nullMeanMaxAbsolutePearson:mean/trials,
  nullMaximum:maxNull,
  familyCalibratedUpperP:(exceed+1)/(trials+1),
  plantedLinearBrightnessCorrelation:corr(targets[1],plant),
  conclusion:"Association diagnostic only. A low p-value would motivate a tile-value inverse; absent that, no plaintext or key is recovered."
},null,2));