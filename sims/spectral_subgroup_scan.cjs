'use strict';
/**
 * Family-wise calibrated subset search for a shared pad under arbitrary
 * independent per-page alphabet permutations.
 *
 * For each contiguous page window of 16, 24, 32 or 40 rune-bearing pages
 * (stride 4, with a final boundary-aligned window), score the top eigenvalue
 * of its aggregate centered rune one-hot Gram operator. Calibrate each
 * window against 70 page-rotation nulls, and calibrate the MAX standardized
 * score against 180 new, independent whole-corpus rotations.
 *
 * Source, underlying eigen operator and a common-key planted simulator:
 * sims/spectral_pad_synchrony.cjs.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {rng,rotateAll,plant,topEigen,stats}=require('./spectral_pad_synchrony.cjs');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const entries=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length);
const pages=entries.map(e=>e.indices), pageIDs=entries.map(e=>e.page);
assert.equal(entries.length,55);
assert.equal(pages.reduce((s,p)=>s+p.length,0),12956);
const windows=[];
for(const size of [16,24,32,40]){
 const starts=[];
 for(let i=0;i+size<=pages.length;i+=4)starts.push(i);
 if(starts[starts.length-1]!==pages.length-size)starts.push(pages.length-size);
 for(const start of starts)windows.push({start,size});
}
const ITER=95;
function evaluate(samples){
 return windows.map(({start,size})=>topEigen(samples.slice(start,start+size),ITER));
}
/** @param {number[]} scores @param {{mean:number,sd:number}[]} baseline */
function standardized(scores,baseline){
 return scores.map((v,i)=>(v-baseline[i].mean)/baseline[i].sd);
}
function max(xs){return Math.max(...xs);}
function main(){
 const randomTrain=rng(0xa59b712);
 const distributions=windows.map(()=>[]);
 for(let k=0;k<70;k++){
  const v=evaluate(rotateAll(pages,randomTrain));
  for(let i=0;i<v.length;i++)distributions[i].push(v[i]);
 }
 const baseline=distributions.map(stats);
 const measured=evaluate(pages);
 const z=standardized(measured,baseline);
 const strongest=windows.map((w,i)=>({pageStart:pageIDs[w.start],pageEnd:pageIDs[w.start+w.size-1],runePageCount:w.size,rawEigen:measured[i],z:z[i],windowIndex:i})).sort((a,b)=>b.z-a.z);
 const randomNull=rng(0x3c995e1),maxNulls=[];
 for(let k=0;k<180;k++)maxNulls.push(max(standardized(evaluate(rotateAll(pages,randomNull)),baseline)));
 const maxObs=strongest[0].z;
 const limit95=maxNulls.slice().sort((a,b)=>a-b)[Math.floor(.95*maxNulls.length)];
 // Plant one shared pad only in a target contiguous window. All remaining
 // synthetic pages have independent circular shifts, destroying pad alignment.
 const planted={};
 for(const size of [16,24,32]){
  const res=[];
  for(let k=0;k<12;k++){
   const sample=plant((0xca171+size*3001+k*10093)>>>0);
   const shifted=rotateAll(sample,rng((0xb1a5+size*181+k*101)>>>0));
   const start=Math.floor(rng(0x4499+size*79+k*777)()*(56-size));
   for(let j=start;j<start+size;j++)shifted[j]=sample[j];
   res.push(max(standardized(evaluate(shifted),baseline)));
  }
  planted[size]={summary:stats(res),numAboveNull95:res.filter(x=>x>limit95).length,scores:res};
 }
 const result={
  method:'scan four page-window lengths; label-permutation invariant Gram spectral test',
  pageWindows:windows.length,lengths:[16,24,32,40],startStride:4,
  powerIterations:ITER,nullTraining:70,heldoutNulls:maxNulls.length,
  strongestObserved:strongest.slice(0,10),
  maxObservedZ:maxObs,heldoutMaxNull:stats(maxNulls),
  nullMax95thPercentile:limit95,
  familywiseP:(1+maxNulls.filter(x=>x>=maxObs).length)/(maxNulls.length+1),
  partialKeyPlants:planted
 };
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 return result;
}
module.exports={windows,evaluate,standardized,main};
if(require.main===module)main();
