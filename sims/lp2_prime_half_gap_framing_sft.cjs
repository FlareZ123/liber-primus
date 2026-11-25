"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(raw, corpus, trials=2000){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const gp=JSON.parse(corpus), alphabet=new Map(gp.runes.map((x,i)=>[x,i]));
 const original=[];let w=[];
 for(const x of raw.split("%").slice(0,55).join("%")){if(alphabet.has(x))w.push(alphabet.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){original.push(w);w=[]}}if(w.length)original.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(original.length===2896&&original.flat().length===12956&&original.flat().every((x,i)=>x===tape[i]),"corpus mismatch");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,gp.pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0),12956];
 const chapters=Array.from({length:9},()=>[]);let pos=0,ch=0;
 for(const group of original){while(pos===cuts[ch+1])ch++;assert(pos+group.length<=cuts[ch+1],"chapter cuts group");chapters[ch].push(group.length);pos+=group.length}
 const scopes=[...chapters,chapters.flat()];
 const maxOrdinal=3301,n=scopes.at(-1).length;
 const primes=[];for(let x=2;primes.length<maxOrdinal+n;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
 const gaps=primes.slice(1).map((p,i)=>(p-primes[i])/2);
 const byFirst=new Map();for(let j=1;j<maxOrdinal;j++){let v=gaps[j];if(!byFirst.has(v))byFirst.set(v,[]);byFirst.get(v).push(j)}
 function fit(a){
  let best=0,starts=[];for(const j of byFirst.get(a[0])||[]){let k=1;while(k<a.length&&a[k]===gaps[j+k])k++;if(k>best){best=k;starts=[j]}else if(k===best)starts.push(j)}
  return {best,starts};
 }
 function details(a){
  const {best,starts}=fit(a),half=Math.floor(a.length/2);let holdBest=-1;
  for(const j of starts){let h=0;for(let k=half;k<a.length;k++)h+=Number(a[k]===gaps[j+k]);holdBest=Math.max(holdBest,h)}
  const j=starts[0];let suffixMatches=0,allMatches=0;if(j!==undefined)for(let k=0;k<a.length;k++){const m=Number(a[k]===gaps[j+k]);allMatches+=m;if(k>=half)suffixMatches+=m}
  // Two consecutive half-gaps of 1 force 3,5,7; no repeated occurrence possible.
  const twinPairOffsets=[];for(let i=0;i+1<a.length;i++)if(a[i]===1&&a[i+1]===1)twinPairOffsets.push(i);
  // Any triple of distinct mod3 cumulative residues contains a multiple of 3.
  // At offset >=1 all three consecutive odd primes exceed 3.
  const mod3Obstructions=[];for(let i=1;i+1<a.length;i++){const u=(2*a[i])%3,v=(2*(a[i]+a[i+1]))%3;if(u!==0&&v!==0&&u!==v)mod3Obstructions.push(i)}
  const histogram=Array(15).fill(0);for(const k of a){if(k>=histogram.length)histogram.length=k+1;histogram[k]=(histogram[k]||0)+1}
  return {groups:a.length,runes:a.reduce((s,x)=>s+x,0),first:a.slice(0,12),histogram,bestPrefix:best,optimalStarts:starts.length,firstOrdinal:j===undefined?null:j+1,firstPrime:j===undefined?null:primes[j],exact:best===a.length,half,heldoutLength:a.length-half,frozenSuffixMatches:suffixMatches,bestTiedSuffixMatches:holdBest,allMatches,twinPairOffsets,mod3Obstructions:mod3Obstructions.length,firstMod3Obstruction:mod3Obstructions.length?{offset:mod3Obstructions[0],pair:a.slice(mod3Obstructions[0],mod3Obstructions[0]+2)}:null};
 }
 let state=33012788;function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const observed=scopes.map(details),nulls=scopes.map(()=>({ge:0,hist:{}}));let familyGe=0;const familyObserved=Math.max(...observed.map(x=>x.bestPrefix));
 for(let k=0;k<trials;k++){const s=chapters.map(shuffle);s.push(s.flat());let mx=0;for(let i=0;i<s.length;i++){const v=fit(s[i]).best;mx=Math.max(mx,v);const q=nulls[i];q.ge+=Number(v>=observed[i].bestPrefix);q.hist[v]=(q.hist[v]||0)+1}familyGe+=Number(mx>=familyObserved)}
 let unrestrictedBookGe=0;for(let k=0;k<trials;k++)unrestrictedBookGe+=Number(fit(shuffle(scopes.at(-1))).best>=observed.at(-1).bestPrefix);
 const plantOrdinals=[2,13,23,59,83,133,331,1033,3301,3301];
 const plants=scopes.map((a,i)=>{const j=plantOrdinals[i]-1;const p=gaps.slice(j,j+a.length);const d=details(p);assert(d.exact&&fit(p).starts.includes(j)&&d.optimalStarts===1&&d.frozenSuffixMatches===d.heldoutLength,"plant not uniquely recovered");let nullMax=0;for(let k=0;k<100;k++)nullMax=Math.max(nullMax,fit(shuffle(p)).best);return {ordinal:j+1,groups:p.length,recoveredOrdinal:d.firstOrdinal,prefix:d.bestPrefix,heldout:d.frozenSuffixMatches,heldoutLength:d.heldoutLength,matchingHistogramShuffleMax:nullMax}});
 return {cuts,ordinalRange:[2,maxOrdinal],trials,observed,nulls,familyObserved,familyGe,unrestrictedBookGe,plants};
}
const root=path.join(__dirname,"..");
const inputs=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json"];
console.log(JSON.stringify(experiment(...inputs.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));
