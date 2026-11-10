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
const references=[
  ["Shakespeare","shakespeare_first300k.txt"],
  ["Gibran","gibran_prophet_58585.txt"],
  ["Emerson","emerson_essays_2944.txt"]
].map(([author,file])=>({
  author, english:encodeEnglish(fs.readFileSync(path.join(ROOT,"resources/control",file),"utf8"))
}));
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
  let eq=0,n=0,all=0,erased=0,withinPairs=0,withinEquals=0;
  const pooled=Array(28).fill(0);
  for(const page of pages){
    const code=invertRank(page,kind);
    const local=Array(28).fill(0);
    for(let i=1;i<code.length;i++){
      if(code[i]===28){erased++;continue;}
      all++;
      pooled[code[i]]++;
      local[code[i]]++;
      if(i<2||code[i-1]<0||code[i-1]===28)continue;
      n++;
      eq+=(code[i]===code[i-1]?1:0);
    }
    const v=local.reduce((s,c)=>s+c,0);
    withinPairs+=v*(v-1);
    withinEquals+=local.reduce((s,c)=>s+c*(c-1),0);
  }
  return {
    eq,n,rate:eq/n,erased,valid:all,
    pooledIoC:pooled.reduce((s,c)=>s+c*(c-1),0)/(all*(all-1)),
    withinPageIoC:withinEquals/withinPairs,
  };
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
function plant(english,offset,kind) {
  let at=offset;
  return originals.map((page,pi)=>{
    const out=[];
    for(let i=0;i<page.indices.length;i++){
      // Fold IA into I to obtain one explicit 28-letter representation.
      let p=english[at++%english.length];
      p=p===27?10:p===28?27:p;
      const last=i?out[i-1]:M;
      const c=last===M?p:
        kind==="sorted"?(p>=last?p+1:p):(last+1+p)%M;
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
const methods=["sorted","cyclic"],originalRunes=originals.map(p=>p.indices);
const actual=Object.fromEntries(methods.map(m=>[m,count(originalRunes,m)]));
assert.equal(actual.sorted.valid,12956-55-86);
assert(actual.sorted.n>12000);
const REPS=500,nullCounts={sorted:[],cyclic:[]};
const nullPooled={sorted:[],cyclic:[]},nullPage={sorted:[],cyclic:[]};
for(let i=0;i<REPS;i++){
  const v=antiRepeatNull();
  for(const m of methods){
    const stats=count(v,m);
    nullCounts[m].push(stats.eq);
    nullPooled[m].push(stats.pooledIoC);
    nullPage[m].push(stats.withinPageIoC);
  }
}
function calibrate(value,values){
  const mean=values.reduce((s,x)=>s+x,0)/values.length;
  const sd=Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(values.length-1));
  return {nullMean:mean,nullSD:sd,observedZ:(value-mean)/sd,
    upperTailPlusOne:(1+values.filter(x=>x>=value).length)/(values.length+1)};
}
const summaries={};
for(const m of methods){
  summaries[m]={
    consecutiveRankEquality:calibrate(actual[m].eq,nullCounts[m]),
    pooledSymbolIoC:calibrate(actual[m].pooledIoC,nullPooled[m]),
    withinPageSymbolIoC:calibrate(actual[m].withinPageIoC,nullPage[m])
  };
}
const planted={};
for(const {author,english} of references)for(const m of methods){
  const trials=[];
  for(let rep=0;rep<20;rep++){
    const maxStart=Math.max(1,english.length-12956);
    const start=Math.floor(rng()*maxStart);
    const values=count(plant(english,start,m),m);
    trials.push(values);
  }
  const keys=["eq","pooledIoC","withinPageIoC"];
  planted[author+"-"+m]={
    sourceRunes:english.length,
    ...Object.fromEntries(keys.map(k=>[k,{
      min:Math.min(...trials.map(x=>x[k])),
      median:trials.map(x=>x[k]).sort((a,b)=>a-b)[10],
      max:Math.max(...trials.map(x=>x[k])),
      aboveReal:trials.filter(x=>x[k]>actual[m][k]).length
    }]))
  };
}
console.log(JSON.stringify({
  model:"fixed unknown 28-code-symbol permutation followed by exclusion of last emitted cipher rune",
  invertedRankMethods:methods,originalRunes:12956,erasuresFromExactObservedDoubletSites:86,
  original:actual,
  null:{replicates:REPS,seed:"0x49333031",source:"observed GP ciphertext marginal, conditioned on no adjacent equality, exact original 86 repeat positions",
    ...summaries},
  planted:{
    trialsPerModelPerAuthor:20,
    sources:"Shakespeare, Gibran, Emerson original GP prose (IA folded into I), with exact 86 duplicate-site overwrites",
    controls:planted
  },
  interpretation:"Constrains keyless fixed rank and global bijection models only. A secret changing key, an evolving rank permutation, different source register, or nonuniform insertion rule is untested."
},null,2));
