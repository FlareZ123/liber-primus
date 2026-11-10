"use strict";
/**
 * Deterministic finite-sample bound on any GP plaintext recoverable via
 * a fixed bijection table indexed by previous ciphertext rune and a
 * predeclared periodic phase. No English scorer or Monte Carlo needed.
 *
 * Run: node sims/context_majorization_bound.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const {toGematria}=require("./previous_cipher_sbox_invariant.cjs");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter((p)=>p.status==="unsolved"&&p.indices.length>0).map((p)=>p.indices);
const shakespeare=toGematria(fs.readFileSync(path.join(root,"resources","control","shakespeare_first300k.txt"),"utf8"));
const fullMaster=fs.readFileSync(path.join(root,"resources","transcriptions","liber_primus_master.txt"),"utf8");
const masterPages=fullMaster.split("%");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const solvedReference=[4,9,10,11,12,15,73].flatMap((page)=>
  [...masterPages[page]].filter((r)=>runeIndex.has(r)).map((r)=>runeIndex.get(r)));

/**
 * @param {number[]} symbols
 * @returns {{n:number,maxShare:number,ioc:number}}
 */
function languageProfile(symbols){
  const histogram=new Uint32Array(29);
  for(const symbol of symbols)histogram[symbol]++;
  const n=symbols.length;
  return {n,maxShare:Math.max(...histogram)/n,
    ioc:Array.from(histogram).reduce((sum,count)=>sum+count*(count-1),0)/(n*(n-1))};
}

/**
 * @param {number} period - number of public position phases
 * @param {"page"|"book"} clock - page-local or across actual rune offsets
 * @returns {{period:number,clock:string,n:number,maxHistogram:number[],maxShare:number,maxIoc:number}}
 */
function bound(period,clock){
  const alphabet=29;
  const groups=Array.from({length:period*alphabet},()=>new Uint16Array(alphabet));
  let offset=0,n=0;
  for(const page of pages){
    for(let i=1;i<page.length;i++){
      const phase=clock==="page"?(i-1)%period:(offset+i)%period;
      groups[phase*alphabet+page[i-1]][page[i]]++;
      n++;
    }
    offset+=page.length;
  }
  const maximumHistogram=Array(alphabet).fill(0);
  for(const row of groups){
    const sorted=Array.from(row).sort((a,b)=>b-a);
    for(let j=0;j<alphabet;j++)maximumHistogram[j]+=sorted[j];
  }
  if(maximumHistogram.reduce((a,b)=>a+b,0)!==n)throw new Error("Row totals mismatch");
  const maximumIoc=maximumHistogram.reduce((sum,k)=>sum+k*(k-1),0)/(n*(n-1));
  return {period,clock,n,maxHistogram:maximumHistogram,
    maxShare:maximumHistogram[0]/n,maxIoc:maximumIoc};
}

/** All six permutations of 3 distinct indices. */
function permutations3(){
  return [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
}

/** Exhaustively verify attainment of the sorted-rows bound for a toy alphabet. */
function testToyMajorization(){
  const counts=[[4,1,0],[0,2,3],[1,0,4]];
  const sorted=counts.map((x)=>[...x].sort((a,b)=>b-a));
  const aligned=[0,1,2].map((j)=>sorted.reduce((s,row)=>s+row[j],0));
  const optimum=aligned.reduce((s,x)=>s+x*x,0);
  let bruteMaximum=-Infinity;
  const perms=permutations3();
  for(const a of perms)for(const b of perms)for(const c of perms){
    const v=Array(3).fill(0);
    for(const [row,perm] of [[counts[0],a],[counts[1],b],[counts[2],c]]){
      for(let j=0;j<3;j++)v[j]+=row[perm[j]];
    }
    const score=v.reduce((s,x)=>s+x*x,0);
    bruteMaximum=Math.max(bruteMaximum,score);
  }
  if(bruteMaximum!==optimum)throw new Error("Rearrangement bound failed brute force");
  return {permutationsChecked:6**3,optimum,bruteMaximum};
}

function main(){
  if(pages.length!==55||pages.reduce((s,x)=>s+x.length,0)!==12956||
     shakespeare.length!==218800||solvedReference.length!==1096||
     masterPages.length!==75)throw new Error("Reference contract changed");
  const toyCheck=testToyMajorization();
  const reference={shakespeare:languageProfile(shakespeare),solvedLP1:languageProfile(solvedReference)};
  const pageClock=Array.from({length:20},(_,i)=>bound(i+1,"page"));
  const continuousClock=Array.from({length:20},(_,i)=>bound(i+1,"book"));
  console.log(JSON.stringify({
    theorem:"For any per-(phase,previous-ciphertext) bijective substitution, the complete decoded symbol histogram is majorized by the sum of sorted conditional ciphertext rows",
    toyCheck,reference,
    fixedOneStep:pageClock[0],
    pageClock:pageClock.map(({period,maxShare,maxIoc})=>({period,maxShare,maxIoc})),
    continuousClock:continuousClock.map(({period,maxShare,maxIoc})=>({period,maxShare,maxIoc})),
    interpretation:"Exact finite-sample bounds, conditional on one GP plaintext rune per cipher rune, specified phase clock and a shared substitution row for each history/phase. Post-processing or hidden keys are not covered."
  },null,2));
}
if(require.main===module)main();
module.exports={languageProfile,bound,testToyMajorization};
