"use strict";
const fs = require("node:fs");
/** @param {string} text @returns {{word:string,length:number}[][]} */
function parseSections(text) {
  return text.split("%").slice(0,55).join("").replace(/[\r\n\/]/g,"")
    .split("$").map(part => part.split(/[-.&§]/g)
      .map(raw => [...raw].filter(c => /^[\u16A0-\u16FF]$/u.test(c)).join(""))
      .filter(Boolean).map(word => ({word,length:[...word].length})))
    .filter(section => section.length);
}
/** @param {{word:string,length:number}[][]} sections */
function score(sections) {
  const hist = new Map();
  for(const section of sections) for(let i=0;i+1<section.length;i++){
    const a=section[i],b=section[i+1],pair=a.word+"|"+b.word;
    const row=hist.get(pair);
    if(row) row.count++;
    else hist.set(pair,{pair,count:1,length:a.length+b.length});
  }
  let maxLength=0,nPairsAtLeast6=0,repeatedTypes=0,longest=[];
  for(const row of hist.values()){
    if(row.count<2)continue;
    repeatedTypes++;
    if(row.length>=6)nPairsAtLeast6++;
    if(row.length>maxLength){maxLength=row.length;longest=[{pair:row.pair,count:row.count}];}
    else if(row.length===maxLength)longest.push({pair:row.pair,count:row.count});
  }
  return {maxLength,nPairsAtLeast6,repeatedTypes,longest};
}
/** @param {number} seed */
function makeRng(seed) {
  let state=seed>>>0;
  return () => { state ^= state<<13; state ^= state>>>17; state ^= state<<5; return (state>>>0)/4294967296; };
}
/** @param {{word:string,length:number}[][]} sections @param {() => number} random */
function shuffleWithinLength(sections,random){
  return sections.map(section=>{
    const next=section.slice(), buckets=new Map();
    for(let i=0;i<section.length;i++){
      const len=section[i].length;
      if(!buckets.has(len))buckets.set(len,[]);
      buckets.get(len).push(i);
    }
    for(const idxs of buckets.values())for(let i=idxs.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1)),a=idxs[i],b=idxs[j];
      [next[a],next[b]]=[next[b],next[a]];
    }
    return next;
  });
}
/** @param {{word:string,length:number}[][]} sections @param {number} trials @param {number} seed */
function permutationTest(sections,trials,seed){
  const observed=score(sections),random=makeRng(seed),maxima=new Map();
  let tailMax=0,tail6=0;
  for(let i=0;i<trials;i++){
    const sim=score(shuffleWithinLength(sections,random));
    maxima.set(sim.maxLength,(maxima.get(sim.maxLength)||0)+1);
    if(sim.maxLength>=observed.maxLength)tailMax++;
    if(sim.nPairsAtLeast6>=observed.nPairsAtLeast6)tail6++;
  }
  return {nSections:sections.length,nWords:sections.reduce((a,s)=>a+s.length,0),
    sectionWordCounts:sections.map(s=>s.length),observed,trials,seed:"0x"+seed.toString(16),
    nullMaximaHistogram:Object.fromEntries([...maxima].sort((a,b)=>a[0]-b[0])),
    pMaxLength:(tailMax+1)/(trials+1),pNumPairsAtLeast6:(tail6+1)/(trials+1)};
}
if(require.main===module){
  const text=fs.readFileSync(process.argv[2]||"resources/lp2-transcription.txt","utf8"),
    trials=Number(process.argv[3]||20000),
    sections=parseSections(text),actual=score(sections);
  if(sections.length!==8||sections.reduce((a,s)=>a+s.length,0)!==2896||
    actual.repeatedTypes!==1||actual.maxLength!==6||actual.longest.length!==1||
    actual.longest[0].pair!=="ᛞᛄᚢ|ᛒᛖᛁ")throw Error("Corpus or word-bigram invariant changed");
  console.log(JSON.stringify(permutationTest(sections,trials,0x33012321),null,2));
}
module.exports={parseSections,score,shuffleWithinLength,makeRng,permutationTest};
