#!/usr/bin/env node
'use strict';
// Source-conditioned chapter/line audit of LP2's within-word lag-five equalities.
// Node.js 22; no external packages or file writes.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const starts=[0,3,8,15,23,27,33,40,54];
const chapterOf=p=>{let g=0;for(let i=1;i<starts.length;i++)if(p>=starts[i])g=i;return g;};
const words=[];let pageBlock=0,startBlock=0,current=[],lineBreaks=[],pageBreaks=[];
function finish(){
 if(!current.length)return;
 const physicalPage=startBlock<50?startBlock:startBlock+1;
 const cuts=[...new Set([0,...lineBreaks,...pageBreaks,current.length])].sort((a,b)=>a-b);
 const segments=[];for(let i=0;i<cuts.length-1;i++)if(cuts[i]<cuts[i+1])segments.push([cuts[i],cuts[i+1]]);
 words.push({a:current,g:chapterOf(physicalPage),page:physicalPage,lineBreaks:lineBreaks.slice(),pageBreaks:pageBreaks.slice(),segments});
 current=[];lineBreaks=[];pageBreaks=[];
}
for(const ch of source){
 if(pageBlock>=55)break;
 if(runeIndex.has(ch)){if(!current.length)startBlock=pageBlock;current.push(runeIndex.get(ch));}
 else if(ch==='/'){if(current.length)lineBreaks.push(current.length);}
 else if(ch==='%'){if(current.length)pageBreaks.push(current.length);pageBlock++;}
 else if((ch==='-'||ch==='.')&&current.length)finish();
}
finish();
const runeCount=words.reduce((s,w)=>s+w.a.length,0);
if(words.length!==2896||runeCount!==12956||pageBlock!==55)throw Error('source parse mismatch');
const names=['sameLine','crossLine','crossPage'];
const category=(w,lo,hi)=>w.pageBreaks.some(b=>lo<b&&b<=hi)?2:w.lineBreaks.some(b=>lo<b&&b<=hi)?1:0;
const observed=Array.from({length:9},()=>[0,0,0]),eligible=Array.from({length:9},()=>[0,0,0]);
let j5=0,j6plus=0;
for(const w of words)for(let j=5;j<w.a.length;j++){
 const c=category(w,j-5,j);eligible[w.g][c]++;
 if(w.a[j]===w.a[j-5]){observed[w.g][c]++;if(j===5)j5++;else j6plus++;}
}
const obsTotal=observed.flat().reduce((s,x)=>s+x,0),obsChapter=observed.map(x=>x.reduce((s,y)=>s+y,0));
if(obsTotal!==104||j5!==36||j6plus!==68)throw Error('five-back count mismatch');
function run(fixEndpoints,N=5000,seed=0x4a3b2c1d){
 let state=seed>>>0;const rnd=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const mean=Array.from({length:9},()=>[0,0,0]),m2=Array.from({length:9},()=>[0,0,0]),tail=Array.from({length:9},()=>[0,0,0]);
 const tmean=Array(9).fill(0),tm2=Array(9).fill(0),samples=[],totals=[];let attempts=0,maxAttempts=0;
 for(let trial=0;trial<N;trial++){
  const counts=Array.from({length:9},()=>[0,0,0]);
  for(const w of words){
   if(w.a.length<=5)continue;
   const sh=w.a.slice(),adj=Array.from({length:sh.length-1},(_,i)=>sh[i]===sh[i+1]);let tries=0;
   for(;;){
    tries++;
    for(const [lo,hi] of w.segments){
     if(fixEndpoints){for(let i=hi-2;i>lo+1;i--){const k=lo+1+Math.floor(rnd()*(i-lo+1));[sh[i],sh[k]]=[sh[k],sh[i]];}}
     else{for(let i=hi-1;i>lo;i--){const k=lo+Math.floor(rnd()*(i-lo+1));[sh[i],sh[k]]=[sh[k],sh[i]];}}
    }
    if(adj.every((v,i)=>(sh[i]===sh[i+1])===v))break;
    if(tries>100000)throw Error('rejection sampler stalled');
   }
   attempts+=tries;if(tries>maxAttempts)maxAttempts=tries;
   for(let j=5;j<sh.length;j++)if(sh[j]===sh[j-5])counts[w.g][category(w,j-5,j)]++;
  }
  samples.push(counts);const totalsByChapter=counts.map(x=>x.reduce((s,y)=>s+y,0));totals.push(totalsByChapter.reduce((s,x)=>s+x,0));
  for(let g=0;g<9;g++){
   const d=totalsByChapter[g]-tmean[g];tmean[g]+=d/(trial+1);tm2[g]+=d*(totalsByChapter[g]-tmean[g]);
   for(let c=0;c<3;c++){const q=counts[g][c]-mean[g][c];mean[g][c]+=q/(trial+1);m2[g][c]+=q*(counts[g][c]-mean[g][c]);if(counts[g][c]>=observed[g][c])tail[g][c]++;}
  }
 }
 const sd=mean.map((x,g)=>x.map((_,c)=>Math.sqrt(m2[g][c]/(N-1))));
 const tsd=tmean.map((_,g)=>Math.sqrt(tm2[g]/(N-1)));
 const overall={};
 for(let c=0;c<3;c++){
  const obs=observed.reduce((s,x)=>s+x[c],0),v=samples.map(x=>x.reduce((s,row)=>s+row[c],0)),mu=v.reduce((s,x)=>s+x,0)/N,s=Math.sqrt(v.reduce((a,x)=>a+(x-mu)**2,0)/(N-1));
  overall[names[c]]={observed:obs,eligible:eligible.reduce((s,x)=>s+x[c],0),nullMean:+mu.toFixed(3),nullSD:+s.toFixed(3),z:+((obs-mu)/s).toFixed(3),upperTail:+((v.filter(x=>x>=obs).length+1)/(N+1)).toFixed(4)};
 }
 const muTotal=totals.reduce((s,x)=>s+x,0)/N,sdTotal=Math.sqrt(totals.reduce((s,x)=>s+(x-muTotal)**2,0)/(N-1));
 const z=obsChapter.map((x,g)=>(x-tmean[g])/(tsd[g]||1)),chi=z.reduce((s,x)=>s+x*x,0);let chiTail=0;
 for(const sample of samples){let q=0;for(let g=0;g<9;g++){const x=sample[g].reduce((s,y)=>s+y,0),v=(x-tmean[g])/(tsd[g]||1);q+=v*v;}if(q>=chi)chiTail++;}
 return {
  fixSegmentEndpoints:fixEndpoints,trials:N,seed:'0x'+seed.toString(16),overall,
  total:{observed:obsTotal,nullMean:+muTotal.toFixed(3),nullSD:+sdTotal.toFixed(3),z:+((obsTotal-muTotal)/sdTotal).toFixed(3),upperTail:+((totals.filter(x=>x>=obsTotal).length+1)/(N+1)).toFixed(4)},
  chapterHeterogeneity:{chiSquare:+chi.toFixed(3),upperTail:+((chiTail+1)/(N+1)).toFixed(4)},
  chapters:observed.map((x,g)=>({chapter:g+1,pages:starts[g]+'–'+((starts[g+1]??56)-1),observed:x,observedTotal:obsChapter[g],eligible:eligible[g],nullMean:mean[g].map(v=>+v.toFixed(3)),nullSD:sd[g].map(v=>+v.toFixed(3)),totalNullMean:+tmean[g].toFixed(3),totalNullSD:+tsd[g].toFixed(3),totalZ:+z[g].toFixed(3),upperTail:tail[g].map(v=>+((v+1)/(N+1)).toFixed(4))})),
  rejectionSampling:{meanAttemptsPerWordDraw:+(attempts/(N*words.filter(w=>w.a.length>5).length)).toFixed(3),maxAttempts}
 };
}
console.log(JSON.stringify({
 source:{words:words.length,runes:runeCount,pageBlocks:pageBlock,wordsLengthAtLeast6:words.filter(w=>w.a.length>5).length,chapterStarts:starts,observedFiveBack:obsTotal,firstEligibleJ5:j5,laterJ6Plus:j6plus,categoryTotals:names.map((name,c)=>({category:name,observed:observed.reduce((s,x)=>s+x[c],0),eligible:eligible.reduce((s,x)=>s+x[c],0)}))},
 segmentMultisetNull:run(false),endpointFixedSensitivityNull:run(true)
},null,2));
