"use strict";
/**
 * Exhaustive 28-choose-14 search of every fixed secret GP parity alphabet.
 * Evaluates the strongest possible original LP2 short-word model fit when
 * every odd-prime totient shift is even, for the cyclic and 15-power 28-rank
 * predecessor-excluding emitters.
 *
 * The statistic is GP-English length-conditional binary-word-profile
 * Pearson chi-square, with 0.5 source pseudocount per profile cell.
 * All source histograms derive exclusively from external Shakespeare
 * GP words and both source and original ciphertext are held fixed.
 *
 * This provides an exact finite minimizer over all 40,116,600 partitions,
 * not a proof that LP2 uses or does not use the given source register.
 * The 28! independent full-order permutations reduce exactly to these
 * partitions because odd-prime totients preserve rank parity modulo28.
 *
 * Usage: node sims/prime_totient_secret_parity_exact.cjs [maxMasks]
 * Maximum omitted or zero means all 40,116,600 masks.
 *
 * @module prime_totient_secret_parity_exact
 */
const assert=require("node:assert/strict");
const {source,sourceCounts,flattened,observedProfiles}=require("./prime_totient_secret_parity_wordfit.cjs");
const bins=[0,0,2,6,14,30],TOTAL=62,TOP=1<<28;
const sourceLen=source.length;
const data=source.map(({seq,weight,len})=>({seq,weight,len,alphabetMask:seq.reduce((a,x)=>a|(1<<x),0),code:0}));
const reverse=Array.from({length:28},()=>[]);
for(let i=0;i<sourceLen;i++){
  const m=data[i].alphabetMask;
  for(let b=0;b<28;b++)if(m&(1<<b))reverse[b].push(i);
}
const observed={
  cyclic:observedProfiles(flattened,"cyclic"),
  fieldPower:observedProfiles(flattened,"fieldPower")
};
assert.deepEqual(observed.cyclic.n,observed.fieldPower.n);
const sourceProfile=new Int32Array(TOTAL),profiles=Array.from({length:TOTAL},()=>({}));
const keys=["cyclic","fieldPower"];
const corrections={cyclic:new Float64Array(TOTAL),fieldPower:new Float64Array(TOTAL)};
const contributions={cyclic:new Array(TOTAL),fieldPower:new Array(TOTAL)};
for(let l=1;l<=5;l++){
  const prefix=bins[l],possible=1<<l,sourceN=sourceCounts[l];
  for(let t=0;t<possible;t++){
    const idx=prefix+t;
    profiles[idx]={length:l,code:t};
    for(const k of keys){
      const observedN=observed[k].n[l],obs=observed[k].counts[l][t],den=sourceN+possible*.5;
      const values=new Float64Array(sourceN+1);
      for(let v=0;v<=sourceN;v++){
        const e=observedN*(v+.5)/den;
        values[v]=(obs-e)**2/e;
      }
      contributions[k][idx]=values;
    }
  }
}
function code(word,mask){
  let out=0;
  for(const letter of word.seq)out=(out<<1)|((mask>>>letter)&1);
  return out;
}
function rebuild(mask){
  sourceProfile.fill(0);
  for(const word of data){word.code=code(word,mask);sourceProfile[bins[word.len]+word.code]+=word.weight;}
}
function fromScratch(){
  const chi={cyclic:0,fieldPower:0};
  for(let idx=0;idx<TOTAL;idx++)for(const key of keys){
    const c=contributions[key][idx][sourceProfile[idx]];
    corrections[key][idx]=c;
    chi[key]+=c;
  }
  return chi;
}
/**
 * Uniform-cardinality colex enumeration using Gosper's next-combination
 * identity. Every 14-subset of 28 symbols is visited once.
 * @param {number} limit
 */
function run(limit=0){
  assert.ok(Number.isSafeInteger(limit)&&limit>=0);
  const max=limit||40116600;
  const t0=Date.now(),initial=(1<<14)-1;
  let mask=initial,chi,best={cyclic:{value:Infinity},fieldPower:{value:Infinity}};
  rebuild(mask);chi=fromScratch();
  const wordVisited=new Uint32Array(sourceLen),profileVisited=new Uint32Array(TOTAL);
  const changedWords=[],changedProfiles=[];
  let checked=0,runVersion=0;
  while(true){
    checked++;
    for(const key of keys)if(chi[key]<best[key].value){
      best[key]={value:chi[key],mask,bitset:mask.toString(2).padStart(28,"0"),iteration:checked};
    }
    if(checked===max)break;
    if(checked%2000000===0){
      console.log(JSON.stringify({checkpoint:checked,elapsedSeconds:(Date.now()-t0)/1000,best}));
    }
    const low=mask&-mask,raised=mask+low;
    if(raised>=TOP)break;
    const next=((((raised^mask)>>>2)/low)|raised)>>>0;
    assert.equal(popcount(next),14,"Gosper cardinality");
    const delta=mask^next;
    runVersion++;
    changedWords.length=0;changedProfiles.length=0;
    for(let q=delta;q;q&=q-1){
      const b=31-Math.clz32(q&-q);
      for(const index of reverse[b])if(wordVisited[index]!==runVersion){
        wordVisited[index]=runVersion;
        changedWords.push(index);
      }
    }
    for(const index of changedWords){
      const word=data[index],newCode=code(word,next),oldCode=word.code;
      if(newCode===oldCode)continue;
      const a=bins[word.len]+oldCode,b=bins[word.len]+newCode;
      if(profileVisited[a]!==runVersion){profileVisited[a]=runVersion;changedProfiles.push(a);}
      if(profileVisited[b]!==runVersion){profileVisited[b]=runVersion;changedProfiles.push(b);}
      sourceProfile[a]-=word.weight;
      sourceProfile[b]+=word.weight;
      word.code=newCode;
    }
    for(const idx of changedProfiles)for(const key of keys){
      const updated=contributions[key][idx][sourceProfile[idx]];
      chi[key]+=updated-corrections[key][idx];
      corrections[key][idx]=updated;
    }
    mask=next;
    if(checked%1000000===0){
      const literal=fromScratch();
      for(const key of keys)assert.ok(Math.abs(literal[key]-chi[key])<.00001,
        key+" incremental fit drift");
      chi=literal;
    }
  }
  const full=checked===40116600;
  const result={status:"PASS",exhaustive:full,visited:checked,totalBalancedMasks:40116600,
    sourceUnique:sourceLen,sourceReference:sourceCounts,
    originalWordCounts:observed.cyclic.n,originalExcludedShortWords:observed.cyclic.skipped,
    result:best,elapsedSeconds:(Date.now()-t0)/1000};
  if(full)assert.equal(checked,40116600);
  console.log(JSON.stringify(result,null,2));
  return result;
}
function popcount(x){
  x=x-((x>>>1)&0x55555555);
  x=(x&0x33333333)+((x>>>2)&0x33333333);
  return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24;
}
if(require.main===module)run(Number(process.argv[2]||0));
module.exports={run};
