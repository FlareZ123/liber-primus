'use strict';
/**
 * Common page-aligned pad test under independent Caesar offsets.
 * C[p,t] = (P[p,t] + K[t] + shift[p]) mod 29.
 * Empirical null independently circularly rotates each page.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length).map(p=>p.indices);
const solved=corpus.pages.filter(p=>p.status==='solved').flatMap(p=>p.indices);
const M=29;
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.length,0),12956);
assert.equal(solved.length,180);
const weights=Array(M).fill(0);
for(const c of solved)weights[c]++;
const maxLen=Math.max(...pages.map(p=>p.length));
/** @param {number} seed @returns {()=>number} */
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
/** @param {number[]} a @param {()=>number} rng */
function rotate(a,rng){const s=Math.floor(rng()*a.length);return a.slice(s).concat(a.slice(0,s));}
/** @param {number} x @param {number} s */
function remap(x,s){return(x-s+M)%M;}
/**
 * Search the 29 offsets for every page by repeated coordinate ascent.
 * @param {number[][]} pg @param {number} seed @param {number} starts
 * @returns {{score:number,shifts:number[]}}
 */
function optimize(pg,seed,starts=4){
 const n=pg.length,max=Math.max(...pg.map(p=>p.length));
 let best=-Infinity,bestShift=[];
 for(let start=0;start<starts;start++){
  const rng=random((seed+start*26869)>>>0);
  const shifts=Array.from({length:n},()=>Math.floor(rng()*M));
  const count=new Uint8Array(max*M);
  for(let p=0;p<n;p++)for(let t=0;t<pg[p].length;t++)count[t*M+remap(pg[p][t],shifts[p])]++;
  for(let iter=0;iter<16;iter++){
   let moved=0;const order=Array.from({length:n},(_,i)=>i);
   for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
   for(const p of order){
    const a=pg[p],old=shifts[p];
    for(let t=0;t<a.length;t++)count[t*M+remap(a[t],old)]--;
    let bestLocal=-1,target=old;
    for(let cand=0;cand<M;cand++){
     let v=0;for(let t=0;t<a.length;t++)v+=count[t*M+remap(a[t],cand)];
     if(v>bestLocal){bestLocal=v;target=cand;}
    }
    for(let t=0;t<a.length;t++)count[t*M+remap(a[t],target)]++;
    shifts[p]=target;moved+=Number(target!==old);
   }
   if(moved===0)break;
  }
  let s=0;for(const c of count)s+=c*(c-1)/2;
  if(s>best){best=s;bestShift=shifts.slice();}
 }
 return{score:best,shifts:bestShift};
}
/** @param {number[][]} pg @param {()=>number} rng */
function rotateAll(pg,rng){return pg.map(a=>rotate(a,rng));}
/** @param {()=>number} rng */
function sampleRune(rng){
 const u=rng()*solved.length;let acc=0;
 for(let i=0;i<M-1;i++){acc+=weights[i];if(u<acc)return i;}
 return M-1;
}
/** @param {number} seed */
function plant(seed){
 const rng=random(seed);
 const key=Array.from({length:maxLen},()=>Math.floor(rng()*M));
 const offsets=pages.map(()=>Math.floor(rng()*M));
 const result=pages.map((a,p)=>a.map((unused,t)=>(sampleRune(rng)+key[t]+offsets[p])%M));
 for(const page of result)for(let t=1;t<page.length;t++){
  if(page[t]===page[t-1]&&rng()<.81){
   const v=Math.floor(rng()*(M-1));page[t]=v>=page[t-1]?v+1:v;
  }
 }
 return{result,offsets};
}
/** @param {number[]} arr */
function stats(arr){
 const mean=arr.reduce((s,x)=>s+x,0)/arr.length;
 const sd=Math.sqrt(arr.reduce((s,x)=>s+(x-mean)**2,0)/(arr.length-1));
 return{mean,sd,min:Math.min(...arr),max:Math.max(...arr)};
}
/** @param {number[]} inferred @param {number[]} actual */
function alignment(inferred,actual){
 const hist=Array(M).fill(0);
 for(let i=0;i<inferred.length;i++)hist[(inferred[i]-actual[i]+M)%M]++;
 return Math.max(...hist);
}
function main(){
 const observed=optimize(pages,67123,4);
 const rng=random(0xd190faff),nulls=[];
 for(let j=0;j<150;j++)nulls.push(optimize(rotateAll(pages,rng),(91983+j*1009)>>>0,4).score);
 const nullStat=stats(nulls);
 const artificial=[],broken=[],recovered=[];
 for(let j=0;j<30;j++){
  const sample=plant((0xa90313+j*139)>>>0);
  const opt=optimize(sample.result,(9013+j*11)>>>0,4);
  artificial.push(opt.score);
  recovered.push(alignment(opt.shifts,sample.offsets));
  broken.push(optimize(rotateAll(sample.result,random(1993+j*11)),(29913+j*11)>>>0,4).score);
 }
 const result={
  model:'aligned shared mod-29 keystream plus independent page Caesar shifts',
  pages:pages.length,runes:12956,maxLen,starts:4,maxIterations:16,
  observed:observed.score,nullReplicates:nulls.length,null: nullStat,
  observedZ:(observed.score-nullStat.mean)/nullStat.sd,
  empiricalUpperP:(1+nulls.filter(s=>s>=observed.score).length)/(nulls.length+1),
  planted:artificial.length,plantedScores:stats(artificial),
  rotatedPlantedScores:stats(broken),
  recoveredOffsetsOutOf55:stats(recovered),observedOffsets:observed.shifts
 };
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 return result;
}
module.exports={random,rotate,optimize,plant,alignment,main};
if(require.main===module)main();
