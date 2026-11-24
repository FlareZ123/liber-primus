"use strict";
/**
 * #2599 follow-up to the before/q13 control failure: use natural-order
 * trigram scoring on every legal F mask, with deterministic coordinate
 * optimization from permuted bigram, trigram, and unigram starts.
 * No original q13-before data scored by the first driver.
 * Fresh seeded controls include two entirely different native sections.
 */
const R=a=>a.map((_,i)=>a[i-i%14+[2,8,9,1,12,13,11,4,5,7,3,0,6,10][i%14]]);
function refinedLibrary(base){
 let natural,trainingCalls=0;
 function train(seqs){const lm=base.train(seqs);if(trainingCalls++===0)natural=lm;return lm}
 function recover(C,q,surrogate,{maxZeros=4}={}){
  const z=C.filter(x=>x===0).length;
  if(z>maxZeros)return {zeros:z,reason:"F mask budget",ranked:[]};
  const shortlist=[];
  for(let mask=0;mask<2**z;mask++){
   const state=base.fixedMask(C,q,mask);if(!state)continue;
   const big=base.optimize(state,base.factors(C,q,state,surrogate,2),2);
   const uni=state.domains.map((d,j)=>d.reduce((best,k)=>{
    const score=k=>C.reduce((s,c,i)=>s+(state.phase[i]===j?natural.uni[(c-k+29)%29]:0),0);
    return score(k)>score(best)?k:best;
   },d[0]));
   shortlist.push({mask,state,big,seeds:[big.key,uni]});
  }
  shortlist.sort((a,b)=>b.big.score-a.big.score);
  for(const x of shortlist.slice(0,4))x.seeds.push(base.optimize(x.state,base.factors(C,q,x.state,surrogate,3),3).key);
  const ranks=[];
  for(const x of shortlist){
   const {state,mask}=x;
   const score=k=>base.scorePlain(R(base.plainFor(C,state,k)),natural);
   let best=null;
   for(const seed of x.seeds){
    const key=seed.slice();let value=score(key);
    for(let sweep=0;sweep<12;sweep++){
     let changed=false;
     for(let index=0;index<q;index++){
      const j=sweep%2===0?index:q-index-1,old=key[j];let selected=old,bestScore=value;
      for(const k of state.domains[j]){if(k===old)continue;key[j]=k;const s=score(key);if(s>bestScore+1e-9){bestScore=s;selected=k}}
      key[j]=selected;if(selected!==old)changed=true;value=bestScore;
     }
     if(!changed)break;
    }
    if(!best||value>best.score)best={mask,key,score:value,p:base.plainFor(C,state,key),endPhase:state.endPhase};
   }
   ranks.push(best);
  }
  ranks.sort((a,b)=>b.score-a.score);
  return {zeros:z,totalMasks:2**z,legalMasks:ranks.length,trigramMasks:ranks.length,exhaustiveTrigram:false,ranked:ranks};
 }
 function continueFrozen(C,split,key,surrogate){
  function paths(a){
   const q=key.length,z=a.filter(x=>x===0).length;
   if(z>16)throw Error("fixed path enumeration cap");
   const out=[];
   for(let mask=0;mask<2**z;mask++){
    const state=base.fixedMask(a,q,mask);
    if(!state||state.domains.some((d,i)=>!d.includes(key[i])))continue;
    const p=base.plainFor(a,state,key),score=base.scorePlain(R(p),natural);
    out.push({p,score});
   }
   return out;
  }
  const pref=paths(C.slice(0,split)),all=paths(C);
  if(!all.length){const f=base.continueFrozen(C,split,key,surrogate);if(f.legal)throw Error("path discrepancy");return f}
  const logZ=a=>a.reduce((s,x)=>base.logadd(s,x.score),-Infinity);
  const best=all.reduce((a,b)=>b.score>a.score?b:a);
  return {legal:true,prefix:best.p.slice(0,split),suffix:best.p.slice(split),conditionalLogEvidence:logZ(all)-logZ(pref),replay:true};
 }
 return {...base,train,recover,continueFrozen};
}
const calibration={seed:0x2599f13,controlNames:["0_koan_1","0_loss_of_divinity","0_welcome","jpg107-167"]};
function run(driver,lib,inputs){
 return {...driver.study(inputs,refinedLibrary(lib),"before",13,calibration),variant:"natural-order-coordinate-refinement",calibration,refinement:{allMasks:true,seedMethods:["permuted exact bigram","native unigram","top-four permuted exact trigram"],maxAlternatingSweeps:12,exactFrozenPathMarginal:true}};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),driver=require("./lp2_p33_14column_additive_fhold_sft.cjs"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(run(driver,lib,driver.files.map(f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8"))),null,2));}
module.exports={run};
