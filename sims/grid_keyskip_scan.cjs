"use strict";
/**
 * Test base60-grid bytes as a 256-step, mod29 page-reset key stream under
 * an exact anti-doublet rejection/key-skip cipher.
 *
 * The forward model marginalizes every candidate skip state, retaining
 * the same plaintext character across skipped keystream positions.
 * Searches all 256 start phases and compares the maximum log likelihood
 * to 100 independently permuted grid keys. Synthetic ciphertexts made
 * with the actual model verify statistical power.
 *
 * This program assumes native rune ordering (sigma=identity) and uses
 * the first 64 runes from all 55 unsolved rune pages.
 */
const fs = require("node:fs");
const path = require("node:path");
const {logLikelihood,encrypt} = require("./keyskip_transducer.cjs");
const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const pages = corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length>=64);
const reference = corpus.pages.filter(p=>p.status==="solved").flatMap(p=>p.indices);
const qcounts = Array(29).fill(1);
for(const p of reference)qcounts[p]++;
const q=qcounts.map(x=>x/(reference.length+29));
const key=grid.byte_rows.flat().map(x=>x%29);
const inverseSigma=Array.from({length:29},(_,i)=>i);
const data=pages.map(p=>p.indices.slice(0,64));
const R=0.83, MAX_EXTRA=18, MAX_LOCAL=3, REPS=100, PLANTS=20;
let seed=0x11033301;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
function sample(){let r=random();for(let i=0;i<29;i++){r-=q[i];if(r<=0)return i;}return 28;}
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function scan(pages,keys){
 let max=-Infinity,bestOffset=0;
 for(let offset=0;offset<256;offset++){
   let score=0;
   for(const page of pages)score+=logLikelihood(page,{
     key:keys,q,inverseSigma,offset,rejectRepeat:R,
     maxTotalSkips:MAX_EXTRA,maxSkippedPerOutput:MAX_LOCAL
   });
   if(score>max){max=score;bestOffset=offset;}
 }
 return{score:max,offset:bestOffset};
}
const observed=scan(data,key);
const nulls=[];
for(let i=0;i<REPS;i++)nulls.push(scan(data,shuffle(key)).score);
const nullMean=nulls.reduce((a,b)=>a+b,0)/REPS;
const nullSd=Math.sqrt(nulls.reduce((a,b)=>a+(b-nullMean)**2,0)/(REPS-1));
const nullSorted=nulls.slice().sort((a,b)=>a-b);
const planted=[];
let skipped=0;
for(let i=0;i<PLANTS;i++){
 const cipher=data.map(a=>{
  const p=a.map(()=>sample());
  const c=encrypt(p,key,inverseSigma,random,{rejectRepeat:R});
  skipped+=c.skips;return c.cipher;
 });
 planted.push(scan(cipher,key));
}
const threshold=nullSorted[Math.floor(.95*REPS)];
console.log(JSON.stringify({
 hypothesis:"C=(P+gridByte[j] mod29) mod29, key resets each page; 0.83 repeat rejection",
 qSource:"180 solved LP2 runes + one pseudocount each",
 gridSource:"base60-grid.json; 256 row-major bytes reduced mod29",
 model:"exact hidden pointer paths with same plaintext rune across rejected key positions",
 pageCount:data.length,prefixRunes:64,seed:"0x11033301",
 allPhases:256,nullReplicates:REPS,plantReplicates:PLANTS,
 observed,randomizedKeyMean:nullMean,randomizedKeySD:nullSd,
 observedZ:(observed.score-nullMean)/nullSd,
 familywiseP:(1+nulls.filter(x=>x>=observed.score).length)/(REPS+1),
 plantedDetectionAtNull95:planted.filter(x=>x.score>threshold).length,
 plantedPhaseCorrect:planted.filter(x=>x.offset===0).length,
 totalPlantedKeySkips:skipped,
 plantedScores:planted.map(x=>x.score)
},null,2));
