"use strict";
/**
 * Necessary-condition inverse for a source alphabet ordered-exclusion cipher.
 *
 * Every plaintext rune in a 28-symbol code selects the cipher rune at the same
 * rank among the 28 values other than the preceding ciphertext rune. Tests two
 * rank conventions (sorted absolute, cyclic after previous). Any additional
 * fixed arbitrary permutation of the 28 code symbols preserves equality of
 * adjacent decoded rank symbols; thus the test does not need to guess sigma.
 *
 * The 86 observed cipher repeats are marked as erasures, not forced decodes.
 * Planted source-language controls independently encrypt authentic Shakespeare
 * GP text through a no-repeat transducer and overwrite those exact 86 sites.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {encodeEnglish,seededRandom}=require("./outer_permutation_assignment.cjs");
const ROOT=path.resolve(__dirname,".."), M=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const originals=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(originals.length,55);
assert.equal(originals.reduce((n,p)=>n+p.indices.length,0),12956);
const source=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const english=encodeEnglish(source);
assert(english.length>20000);
const rng=seededRandom(0x49333031);
const hist=Array(M).fill(1);
for(const p of originals)for(const x of p.indices)hist[x]++;
const frequencies=hist.map(x=>x/hist.reduce((a,b)=>a+b,0));
/** @param {number[]} word @param {"sorted"|"cyclic"} kind */
function invertRank(word,kind) {
  const out=[];
  for(let i=0;i<word.length;i++) {
    const c=word[i],last=i?word[i-1]:M;
    out.push(last===M ? -1 : c===last ? 28 :
      kind==="sorted" ? c-(c>last?1:0) : (c-last+M)%M-1);
  }
  return out;
}
/** @param {number[][]} pages @param {"sorted"|"cyclic"} kind */
function count(pages,kind){
  let eq=0,n=0,all=0,erased=0;
  for(const page of pages){
    const code=invertRank(page,kind);
    for(let i=1;i<code.length;i++){
      if(code[i]===28){erased++;continue;}
      all++;
      if(i<2||code[i-1]<0||code[i-1]===28)continue;
      n++;
      eq+=(code[i]===code[i-1]?1:0);
    }
  }
  return {eq,n,rate:eq/n,erased,valid:all};
}
/** @param {number} x */
function sampleSymbol(x){
  let running=0;
  for(let i=0;i<M;i++){running+=frequencies[i];if(x<running)return i;}
  return M-1;
}
/** @param {number} from @param {number} previous */
function sampleExcluding(from,previous){
  let z=from,r=0;
  for(let i=0;i<M;i++)if(i!==previous){
    r+=frequencies[i];
  }
  const norm=r;
  r=0;
  for(let i=0;i<M;i++)if(i!==previous){
    r+=frequencies[i]/norm;
    if(z<r)return i;
  }
  return previous===M-1?M-2:M-1;
}
const duplicateSites=originals.map(p=>new Set(p.indices.flatMap((c,i)=>
  i&&c===p.indices[i-1]?[i]:[])));
assert.equal(duplicateSites.reduce((sum,s)=>sum+s.size,0),86);
/** @param {number} offset */
function plant(offset) {
  let at=offset;
  return originals.map((page,pi)=>{
    const out=[];
    for(let i=0;i<page.indices.length;i++){
      // Fold IA into I to obtain one explicit 28-letter representation.
      let p=english[at++%english.length];
      p=p===27?10:p===28?27:p;
      const last=i?out[i-1]:M;
      const c=last===M?p:p>=last?p+1:p;
      out.push(duplicateSites[pi].has(i)?last:c);
    }
    return out;
  });
}
/** @returns {number[][]} */
function antiRepeatNull(){
  return originals.map((page,pi)=>{
    const out=[];
    for(let i=0;i<page.indices.length;i++){
      const last=i?out[i-1]:M;
      out.push(duplicateSites[pi].has(i)?last:
        last===M?sampleSymbol(rng()):sampleExcluding(rng(),last));
    }
    return out;
  });
}
const methods=["sorted","cyclic"],actual=Object.fromEntries(methods.map(m=>[m,count(originals,m)]));
const REPS=500,nullCounts={sorted:[],cyclic:[]},nullZ=[];
for(let i=0;i<REPS;i++){
  const v=antiRepeatNull();
  for(const m of methods)nullCounts[m].push(count(v,m).eq);
}
const summaries={};
for(const m of methods){
  const values=nullCounts[m],mean=values.reduce((s,x)=>s+x,0)/REPS;
  const sd=Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(REPS-1));
  summaries[m]={
    nullMean:mean,nullSD:sd,
    observedZ:(actual[m].eq-mean)/sd,
    upperTailPlusOne:(1+values.filter(x=>x>=actual[m].eq).length)/(REPS+1)
  };
}
const planted=[];
for(let rep=0;rep<20;rep++){
  const start=Math.floor(rng()*(english.length-12956));
  const v=plant(start);
  planted.push({start,...Object.fromEntries(methods.map(m=>[m,count(v,m).eq]))});
}
const sortedPlant=planted.map(x=>x.sorted).sort((a,b)=>a-b);
console.log(JSON.stringify({
  model:"fixed unknown 28-code-symbol permutation followed by exclusion of last emitted cipher rune",
  invertedRankMethods:methods,originalRunes:12956,erasuresFromExactObservedDoubletSites:86,
  original:actual,
  null:{replicates:REPS,seed:"0x49333031",source:"observed GP ciphertext marginal, conditioned on no adjacent equality, exact original 86 repeat positions",
    ...summaries},
  planted:{replicates:planted.length,source:"authentic length-matched 29-GP Shakespeare with IA folded into I; deterministic rank cipher; exact 86 repeat-site overwrites",
    sortedMin:sortedPlant[0],sortedMedian:sortedPlant[10],sortedMax:sortedPlant.at(-1),
    sortedAboveActual:planted.filter(x=>x.sorted>actual.sorted.eq).length,
    cyclicAboveActual:planted.filter(x=>x.cyclic>actual.cyclic.eq).length},
  interpretation:"Constrains keyless fixed rank and global bijection models only. A secret changing key, an evolving rank permutation, different source register, or nonuniform insertion rule is untested."
},null,2));
