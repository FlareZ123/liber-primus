'use strict';
/**
 * Source-key exhaustive *decryption* challenge: every GF29 quartic seed,
 * after the Cicada-F marker as a predecessor-exclusion repair.
 * The recurrence comes only from the two independently printed source
 * quadratics, not a tuned cryptanalytic polynomial.
 *
 * Run: Node.js 22, from the repository root or as a manual SFT workflow.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=gp.pages.filter(p=>p.page>=0&&p.page<=7);
const counts=source.map(p=>p.indices.length);
assert.deepEqual(counts,[262,266,201,217,261,263,196,208]);
const c=source.flatMap(p=>p.indices);
assert.equal(c.length,1874);
assert.equal(counts.slice(0,3).reduce((a,b)=>a+b,0),729);
const mod=n=>(n%29+29)%29;
const rem=new Uint8Array(145);
for(let i=0;i<145;i++)rem[i]=i%29;
/** @param {number[]} seed @returns {Uint8Array} */
function keyFromSeed(seed){
 const k=seed.slice(),out=new Uint8Array(1874);
 for(let i=0;i<out.length;i++){
  const j=i%4;
  out[i]=k[j];
  k[j]=mod(-14*k[j]-9*k[(j+1)%4]-13*k[(j+2)%4]-28*k[(j+3)%4]);
 }
 return out;
}
const bases=Array.from({length:4},(_,d)=>keyFromSeed(
 Array.from({length:4},(_,j)=>j===d?1:0)));
const contributions=bases.map(b=>Array.from({length:29},(_,v)=>{
 const p=new Uint8Array(1874);
 for(let i=0;i<p.length;i++)p[i]=(v*b[i])%29;
 return p;
}));
const continuous=process.argv.includes('--book-continuous');
const begins=new Set(),chapterA=729;
let start=0;
for(const n of counts){begins.add(start);start+=n;}
if(continuous){begins.clear();begins.add(0);}
const rank=new Uint8Array(1874);
for(let i=0;i<c.length;i++){
 if(begins.has(i)){rank[i]=c[i];continue;}
 rank[i]=c[i]===c[i-1]?0:c[i]-(c[i]>c[i-1]?1:0)+1;
}
/** Inverse for exceptional intermediate GP index0. @param {number} u
 * @param {number} previous */
function emit(u,previous){
 if(u===0)return previous;
 const r=u-1;
 return r+(r>=previous?1:0);
}
/** @param {number[]} plaintext @param {number[]} seed */
function encipher(plaintext,seed){
 const key=keyFromSeed(seed),out=new Uint8Array(plaintext.length);
 for(let i=0;i<out.length;i++){
  const u=mod(plaintext[i]+key[i]);
  out[i]=begins.has(i)?u:emit(u,out[i-1]);
 }
 return out;
}
/** @param {Uint8Array} encrypted @param {number[]} seed */
function decipher(encrypted,seed){
 const key=keyFromSeed(seed),out=new Uint8Array(encrypted.length);
 for(let i=0;i<out.length;i++){
  let u=begins.has(i)?encrypted[i]:(encrypted[i]===encrypted[i-1]
   ?0:encrypted[i]-(encrypted[i]>encrypted[i-1]?1:0)+1);
  out[i]=mod(u-key[i]);
 }
 return out;
}
function pairs(vec,start,end){
 const h=new Uint32Array(29);
 for(let i=start;i<end;i++)h[vec[i]]++;
 let p=0;for(const x of h)p+=x*(x-1);
 return p;
}
const english=read('resources/control/shakespeare_first300k.txt').match(/[a-zA-Z]+/g)
 .flatMap(w=>encodeSourceNativeGP(w)).slice(0,1874);
assert.equal(english.length,1874);
const planted=[7,11,19,23];
const synthetic=encipher(english,planted);
assert.deepEqual([...decipher(synthetic,planted)],english);
const syntheticRepeats=[...synthetic].reduce((a,v,i)=>a+(i>0&&!begins.has(i)&&v===synthetic[i-1]?1:0),0);
const knownPlant=Array.from(decipher(synthetic,planted));
const trainPairPlant=pairs(knownPlant,0,chapterA),heldPairPlant=pairs(knownPlant,chapterA,1874);
const originalPairs=pairs([...rank],0,chapterA);
const hist=new Uint16Array(29);
let bestPair=-1,bestSeed=[0,0,0,0],thresholdCount=0;
const top=[];
for(let a=0;a<29;a++){
 const u=contributions[0][a];
 for(let b=0;b<29;b++){
  const v=contributions[1][b];
  for(let d=0;d<29;d++){
   const w=contributions[2][d];
   for(let e=0;e<29;e++){
    const x=contributions[3][e];
    hist.fill(0);
    for(let i=0;i<chapterA;i++){
     const decoded=rem[rank[i]+116-u[i]-v[i]-w[i]-x[i]];
     hist[decoded]++;
    }
    let p=0;
    for(let j=0;j<29;j++)p+=hist[j]*(hist[j]-1);
    if(p>=0.05*chapterA*(chapterA-1))thresholdCount++;
    if(p>bestPair){bestPair=p;bestSeed=[a,b,d,e];}
    if(top.length<32||p>top[top.length-1].p){
     top.push({p,s:[a,b,d,e]});
     top.sort((q,r)=>r.p-q.p);
     if(top.length>32)top.pop();
    }
   }
  }
 }
}
const held=top.map(entry=>{
 const seed=entry.s,key=keyFromSeed(seed);
 const d=new Uint8Array(1874);
 for(let i=0;i<1874;i++)d[i]=mod(rank[i]-key[i]);
 const heldp=pairs(d,chapterA,1874);
 return {seed,p0to2IoC:entry.p/(729*728),p3to7IoC:heldp/(1145*1144),
  opening:[...d.slice(0,32)].map(q=>gp.translit[q]).join('')};
});
held.sort((u,v)=>v.p3to7IoC-u.p3to7IoC);

/**
 * Discovery-power control: run the SAME exhaustive 707281-key search
 * against an independently constructed source-native English cipher.
 * Do not settle for merely checking known-seed encryption/decryption.
 */
const srank=new Uint8Array(1874);
for(let i=0;i<1874;i++){
  if(begins.has(i))srank[i]=synthetic[i];
  else srank[i]=synthetic[i]===synthetic[i-1]
    ?0:1+synthetic[i]-(synthetic[i]>synthetic[i-1]?1:0);
}
const plantTruth=pairs(knownPlant,0,chapterA);
let plantBestPair=-1,plantBestSeed=[],plantKeysAtOrAboveTruth=0,plantKeysAtOrAbove005=0;
for(let a=0;a<29;a++){
 const u=contributions[0][a];
 for(let b=0;b<29;b++){
  const v=contributions[1][b];
  for(let d=0;d<29;d++){
   const w=contributions[2][d];
   for(let e=0;e<29;e++){
    const x=contributions[3][e];
    hist.fill(0);
    for(let i=0;i<chapterA;i++){
     const p=rem[srank[i]+116-u[i]-v[i]-w[i]-x[i]];
     hist[p]++;
    }
    let score=0;
    for(let k=0;k<29;k++)score+=hist[k]*(hist[k]-1);
    if(score>=plantTruth)plantKeysAtOrAboveTruth++;
    if(score>=0.05*chapterA*(chapterA-1))plantKeysAtOrAbove005++;
    if(score>plantBestPair){plantBestPair=score;plantBestSeed=[a,b,d,e];}
   }
  }
 }
}
assert.deepEqual(plantBestSeed,planted);
assert.equal(plantBestPair,plantTruth);
assert.equal(plantKeysAtOrAboveTruth,1);

const plantKeys=keyFromSeed(planted);
const plantMatches=knownPlant.every((r,i)=>r===mod((begins.has(i)?synthetic[i]:(synthetic[i]===synthetic[i-1]?0:synthetic[i]-(synthetic[i]>synthetic[i-1]?1:0)+1))-plantKeys[i]));
assert(plantMatches);
console.log(JSON.stringify({
 model:'2013 BASE29+p39-red-triad quartic GF29 recurrence; book-continuous 4-state key; '+(continuous?'book-continuous predecessor':'physical-page predecessor resets')+'; GP F=0 reserved predecessor-exclusion marker',
 original:{runes:1874,pages:8,firstChapter:729,secondChapter:1145,
  rawInverseRankIoC:originalPairs/(729*728),
  allSeeds:707281,trainThreshold:0.05,numTrainAtOrAboveThreshold:thresholdCount,
  bestSeed,bestTrainIoC:bestPair/(729*728),frozenTop32BestHeldout:held.slice(0,8)},
 positive:{plantedSeed:planted,originalShape:true,exactlyRecovered:plantMatches,
   plantedRepeatCount:syntheticRepeats,
   trueSeedTrainIoC:trainPairPlant/(729*728),trueSeedHeldoutIoC:heldPairPlant/(1145*1144),
   exhaustiveSeedRank:plantKeysAtOrAboveTruth,keysAbove005:plantKeysAtOrAbove005}
},null,2));
