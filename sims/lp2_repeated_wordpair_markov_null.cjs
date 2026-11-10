"use strict";

const fs = require("node:fs");
const {parseSections, score, makeRng} = require("./lp2_repeated_wordpair_probe.cjs");

/**
 * Draw exactly n distinct positions from integer interval [0, universe).
 * Floyd's algorithm; no repeated positions, uniform subsets.
 * @param {number} universe @param {number} n @param {() => number} rng
 * @returns {Set<number>}
 */
function exactSubset(universe,n,rng){
  const chosen=new Set();
  for(let j=universe-n;j<universe;j++){
    const t=Math.floor(rng()*(j+1));
    if(chosen.has(t))chosen.add(j);
    else chosen.add(t);
  }
  return chosen;
}

/**
 * CDF sampler fitted to the original ciphertext's 29-symbol marginals.
 * @param {Array<{word:string,length:number}>[]} sections
 */
function sampler(sections){
  const counts=new Map();
  for(const s of sections)for(const w of s)for(const c of w.word)counts.set(c,(counts.get(c)||0)+1);
  const alphabet=[...counts.keys()].sort();
  if(alphabet.length!==29)throw Error("unexpected rune alphabet");
  const total=[...counts.values()].reduce((a,b)=>a+b,0);
  let acc=0;
  const cdf=alphabet.map(c=>(acc+=counts.get(c))/total);
  /** @param {() => number} random */
  function pick(random){
    const u=random();
    let low=0,high=cdf.length-1;
    while(low<high){const middle=Math.floor((low+high)/2);if(u<cdf[middle])high=middle;else low=middle+1;}
    return alphabet[low];
  }
  return {pick, alphabet, total};
}

/**
 * Generate a fresh stream with the same word and section lengths and the
 * exact same global number of within-section adjacent equal-rune pairs.
 * Forced repeated positions are a uniform subset of eligible positions.
 * Other rune values follow the original marginal distribution in expectation.
 *
 * @param {Array<{word:string,length:number}>[]} sections
 * @param {() => number} random
 * @param {(r:()=>number)=>string} pick
 * @param {number} fixedRepeats
 */
function synthetic(sections,random,pick,fixedRepeats){
  const eligible=sections.reduce((sum,s)=>sum+s.reduce((a,w)=>a+w.length,0)-1,0);
  const target=exactSubset(eligible,fixedRepeats,random);
  let slot=0,actualRepeats=0;
  const output=sections.map(section=>{
    let previous=null;
    return section.map(w=>{
      let text="";
      for(let i=0;i<w.length;i++){
        const isSectionInitial=previous===null;
        let repeat=false;
        if(!isSectionInitial){repeat=target.has(slot);slot++;}
        let next;
        if(repeat){next=previous;actualRepeats++;}
        else {do{next=pick(random);}while(previous!==null&&next===previous);}
        text+=next;previous=next;
      }
      return {word:text,length:w.length};
    });
  });
  if(slot!==eligible || actualRepeats!==fixedRepeats)throw Error("repeat count mismatch");
  return output;
}

function main(){
  const source=fs.readFileSync(process.argv[2]||"resources/lp2-transcription.txt","utf8");
  const trials=Number(process.argv[3]||30000);
  const sections=parseSections(source), observed=score(sections);
  if(sections.length!==8||observed.maxLength!==6||observed.repeatedTypes!==1)throw Error("corpus control failed");
  let nRepeat=0,nEligible=0;
  for(const section of sections){
    let previous=null;
    for(const w of section)for(const c of w.word){
      if(previous!==null){nEligible++;if(c===previous)nRepeat++;}
      previous=c;
    }
  }
  if(nEligible!==12948||nRepeat!==86)throw Error("doublet calibration failed");
  const rng=makeRng(0x3a19f23b),{pick,total}=sampler(sections);
  let tail=0, max3=0, max4=0, max5=0,max6=0;
  for(let t=0;t<trials;t++){
    const s=score(synthetic(sections,rng,pick,nRepeat));
    if(s.maxLength>=observed.maxLength)tail++;
    if(s.maxLength>=3)max3++;
    if(s.maxLength>=4)max4++;
    if(s.maxLength>=5)max5++;
    if(s.maxLength>=6)max6++;
  }
  const result={model:"cipher marginals in expectation, exact 86/12948 within-section doublet positions",
    source:"resources/lp2-transcription.txt",trials,seed:"0x3a19f23b",runes:total,
    nSections:sections.length,nEligible,nRepeat,observed,
    nullCountAtLeast3:max3,nullCountAtLeast4:max4,nullCountAtLeast5:max5,
    nullCountAtLeast6:max6, tailCount:tail,pUpper:(tail+1)/(trials+1)};
  console.log("MARKOV " + JSON.stringify(result));
}
if(require.main===module)main();
module.exports={exactSubset,sampler,synthetic};
