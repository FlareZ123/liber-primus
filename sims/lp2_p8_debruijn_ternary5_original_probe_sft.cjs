"use strict";

/**
 * Source-led p8 full five-trit de Bruijn register probe.
 *
 * The untouched physical p8 has 12 red GP runes followed by 243 black
 * GP runes: 243=3^5. If black p8 were one complete cyclic ternary
 * order-five de Bruijn sequence under a single fixed 29->3 rune-class
 * map, EVERY five-trit cyclic window would be present exactly once.
 *
 * The original is tested under first-party GP index/prime/totient
 * residues; an optimistic arbitrary hidden static 29->3 assignment is
 * ALSO heuristically optimized with exactly the same deterministic
 * search on 20 independent permutation controls preserving the 243
 * original source rune counts. No completeness claim about the 3^29
 * mapping search: this is a falsifiable clue-first probe, not a proof
 * that every possible mapping fails.
 *
 * Windows11 Node22 CommonJS SFT:
 * node sims/lp2_p8_debruijn_ternary5_original_probe_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(
  path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const p7=gp.pages[7].indices, p8=gp.pages[8].indices;
assert.equal(p7.length,208);
assert.equal(p8.length,255);
assert.deepEqual(p7.slice(194),[
  23,3,22,16,2,25,5,7,11,14,28,6,28,19
]);
const body=p8.slice(12);
assert.equal(body.length,3**5);
assert.equal(new Set(body).size,29);
const productPacket=[
  [23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]
].map(w=>w.reduce((a,b)=>a*b%29,1));
assert.deepEqual(productPacket,[11,26,8,15,2]);

/** @param {number[]} seq @param {number[]} mapping
 * @returns {number} how many of 243 cyclic five-trit windows are distinct
 */
function distinctFive(seq,mapping){
  assert.equal(seq.length,243);
  const seen=new Uint8Array(243);
  let unique=0;
  for(let i=0;i<243;i++){
    let value=0;
    for(let j=0;j<5;j++)
      value=3*value+mapping[seq[(i+j)%243]];
    if(!seen[value]){seen[value]=1;unique++;}
  }
  return unique;
}

/** @param {number} seed */
function rng(seed){
  let state=seed>>>0;
  return()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return(state>>>0)/4294967296;
  };
}
/**
 * Identical optimistic (not exhaustive) free-map search on original
 * and permuted original samples. Under exactly the same optimization
 * budget, no signal should be inferred from a similar score.
 * @param {number[]} sequence
 * @param {number} seed
 */
function bestMap(sequence,seed){
  const draw=rng(seed);
  let best=0,bestMap=null;
  for(let restart=0;restart<80;restart++){
    const mapping=Array.from({length:29},
      ()=>Math.floor(3*draw()));
    let score=distinctFive(sequence,mapping);
    if(score>best){best=score;bestMap=mapping.slice();}
    for(let iteration=0;iteration<900;iteration++){
      const chosen=Math.floor(29*draw());
      const old=mapping[chosen],next=(old+1+Math.floor(2*draw()))%3;
      mapping[chosen]=next;
      const trial=distinctFive(sequence,mapping);
      const diff=trial-score;
      const temperature=5*Math.pow(0.035,iteration/900);
      if(diff>=0||draw()<Math.exp(diff/temperature)){
        score=trial;
        if(score>best){best=score;bestMap=mapping.slice();}
      }else mapping[chosen]=old;
      if(best===243)break;
    }
    if(best===243)break;
  }
  assert(bestMap);
  return {bestDistinct:best,collisionWindows:243-best,
    bestMapping:bestMap};
}
/** @param {number[]} values @param {()=>number} draw */
function shuffle(values,draw){
  const copy=values.slice();
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor((i+1)*draw());
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

/** @param {number} symbols @param {number} order
 * @returns {number[]}
 */
function deBruijn(symbols,order){
  const register=Array(symbols*order+1).fill(0),out=[];
  function descend(t,p){
    if(t>order){
      if(order%p===0)
        for(let k=1;k<=p;k++)out.push(register[k]);
    }else{
      register[t]=register[t-p];
      descend(t+1,p);
      for(let k=register[t-p]+1;k<symbols;k++){
        register[t]=k;
        descend(t+1,t);
      }
    }
  }
  descend(1,1);
  return out;
}
const positive=deBruijn(3,5);
assert.equal(positive.length,243);
assert.equal(distinctFive(positive,[0,1,2]),243);
const moduloMaps=[
  ["GP ordinal mod3",v=>v%3],
  ["GP prime mod3",v=>gp.prime[v]%3],
  ["GP totient mod3",v=>gp.prime[v]===2?1:(gp.prime[v]-1)%3]
].map(([name,func])=>{
  const m=Array.from({length:29},(_,i)=>func(i));
  return{name,distinct:distinctFive(body,m)};
});
const optimizedOriginal=bestMap(body,0x33012026);
const draw=rng(0x33012027),controls=[];
for(let trial=0;trial<20;trial++){
  const shuffled=shuffle(body,draw);
  controls.push(bestMap(shuffled,0x33013000+trial).bestDistinct);
}
const mean=controls.reduce((s,x)=>s+x,0)/controls.length;
const sd=Math.sqrt(controls.reduce((s,x)=>s+(x-mean)**2,0)/controls.length);
assert(positive.length===243);
assert(optimizedOriginal.bestDistinct<243);
const output={
  original:{
    source:"p8 red12 + black243 GP29; p7 terminal five red-word products",
    sourcePacket:productPacket,
    sites:243,
    rawFiveTuples:new Set(Array.from({length:243},(_,i)=>
      Array.from({length:5},(_,j)=>body[(i+j)%243]).join(","))).size,
    staticSourceMaps:moduloMaps,
    optimized:optimizedOriginal
  },
  controls:{
    positiveDeBruijnDistinct:distinctFive(positive,[0,1,2]),
    permutationPreservesOriginalSymbolCounts:true,
    optimizationBudget:"80 restarts x 900 moves, seeded and equal",
    permutationBestUnique:controls,
    mean:+mean.toFixed(3),sd:+sd.toFixed(3),
    originalZ:+((optimizedOriginal.bestDistinct-mean)/sd).toFixed(3)
  },
  interpretation:"No tested source-residue mapping is a ternary order-five de Bruijn cycle. Optimized original is only a heuristic best and is compared to histogram-matched random permutations; absence of an arbitrary hidden 29-to-3 map is not mathematically proven, and no LP2 plaintext or creator key is obtained."
};
console.log(JSON.stringify(output,null,2));
