"use strict";

/**
 * Issue #1492. Exact all-F-skip alphabet-conjugation E-concentration UPPER bound.
 *
 * Given C_i=pi((pi^-1(P_i)+phi(p_(start+t))) mod29), every normal emission
 * decrypting to a chosen plaintext letter E must satisfy
 * phi(p) = pi^-1(C_i)-pi^-1(E) mod29.
 * Since pi is a global 29-label permutation, these required residues form a
 * PERMUTATION over the 29 ciphertext symbols, with row E -> residue 0.
 *
 * For each pair (cipher glyph x, required key residue r), dynamic programming
 * finds the exact largest number of (C==x, shift==r) source positions under
 * EVERY optional plaintext-F skip at any printed ciphertext F. It intentionally
 * lets DIFFERENT pairs optimize DIFFERENT skip histories, thus U[x][r] is a
 * rigorous entrywise upper bound for any COMMON history. Hungarian maximum
 * matching then yields a rigorous all-secret single-letter-E upper bound for
 * any pi and every legal F skip history. Original glyph boundaries are fixed.
 *
 * Scope: continuous p0-start, literal printed F bypass, original GP English
 * and one global pi. Reset at nine chapters / physical pages tested separately.
 *
 * Read-only Windows Node 22 CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const source=pages.flatMap(p=>p.indices);
assert.equal(source.length,12956);
assert.equal(pages.length,55);
const cutPages=new Set([0,3,8,15,23,27,33,40,54]);
const chapterTapes=[], pageTapes=[];
let chapter=[];
for(const page of pages){
  if(cutPages.has(page.page)&&chapter.length){chapterTapes.push(chapter);chapter=[];}
  chapter.push(...page.indices);
  pageTapes.push(page.indices);
}
chapterTapes.push(chapter);
assert.deepEqual(chapterTapes.map(a=>a.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
/** @returns {number[]} */
function firstPrimes(size){
  const values=[];
  for(let n=2;values.length<size;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)values.push(n);
  }
  return values;
}
const primes=firstPrimes(source.length+465);
const shifts=Uint8Array.from(primes,p=>(p-1)%29);
const E=18,F=0;
const mod=n=>(n%29+29)%29;
const cipher=gp.pages[56].indices;
const expected="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text */
function gpNative(text) {
  const out=[];
  const clean=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(const word of clean.match(/[A-Z]+/g)||[]) {
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){out.push(21);i+=3;}
      else if(word.startsWith("IO",i)){out.push(27);i+=2;}
      else{
        const t=tokens.find(x=>word.startsWith(x.s,i));
        assert(t,"unmapped native GP spelling");
        out.push(t.i);i+=t.s.length;
      }
    }
    if(out.length>=source.length)break;
  }
  return out;
}
const p56=gpNative(expected);
assert.equal(p56.length,85);
let used=0;
let skipCount=0;
for(let i=0;i<cipher.length;i++) {
  if(p56[i]===F){
    assert.equal(cipher[i],F);
    skipCount++;
  }else{
    assert.equal(cipher[i],mod(p56[i]+shifts[used]),"p56 genuine prime cipher");
    used++;
  }
}
assert.equal(skipCount,1);
assert.equal(used,84);
assert.equal(cipher[56],F);
const refs=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"];
const native=refs.map(name=>{
  const text=read("resources/control/"+name);
  const nums=gpNative(text).slice(0,source.length);
  assert.equal(nums.length,source.length);
  return {name,E:nums.filter(x=>x===E).length,
    counts:nums.reduce((a,x)=>(a[x]++,a),Array(29).fill(0))};
});
assert.deepEqual(gpNative("FOLLOWING"),[0,3,20,20,3,7,21]);
assert.deepEqual(gpNative("FUNCTION"),[0,1,9,5,16,27,9]);
assert.deepEqual(gpNative("GREAT"),[6,4,28,16]);
assert.deepEqual(gpNative("QUESTION"),[5,7,18,15,16,27,9]);
assert.deepEqual(gpNative("SHE"),[15,8,18]);
console.log("POSITIVE_AUTHENTIC_P56",cipher.length,"source rune emissions",used,"transparent-F skips",skipCount);
console.log("NATIVE_ENGLISH_E",JSON.stringify(native.map(x=>({name:x.name,count:x.E,fraction:x.E/source.length}))));
/**
 * For a fixed ciphertext x and key residue r, maximize number of compatible
 * E events over EVERY full legal marker-F skip path. Multiple target residue
 * trackers are updated together.
 * @param {number[]} tape
 * @param {number} start
 * @returns {number[][]}
 */
function allSkipUpper(tape,start,budgets=null){
  const fCount=tape.filter(x=>x===F).length;
  const W=fCount+1;
  const requests=budgets||[fCount];
  const outputs=requests.map(()=>Array.from({length:29},()=>Array(29).fill(0)));
  const BAD=-16000;
  for(let c=0;c<29;c++){
    const dp=new Int16Array(29*W);dp.fill(BAD);
    for(let r=0;r<29;r++)dp[r*W]=0;
    let skips=0;
    for(let i=0;i<tape.length;i++){
      if(tape[i]===F){
        for(let r=0;r<29;r++) {
          const base=r*W;
          for(let d=skips;d>=0;d--){
            const old=dp[base+d];
            if(old===BAD)continue;
            const reward=(c===F&&shifts[start+i-d]===r)?1:0;
            dp[base+d]=old+reward;
            if(dp[base+d+1]<old)dp[base+d+1]=old;
          }
        }
        skips++;
      }else if(tape[i]===c){
        for(let d=0;d<=skips;d++){
          const residue=shifts[start+i-d];
          const at=residue*W+d;
          dp[at]++;
        }
      }
    }
    for(let r=0;r<29;r++){
      let best=0,nextD=0;
      for(let j=0;j<requests.length;j++){
        const limit=Math.min(requests[j],skips);
        while(nextD<=limit){
          best=Math.max(best,dp[r*W+nextD]);
          nextD++;
        }
        outputs[j][c][r]=best;
      }
    }
  }
  return budgets?outputs:outputs[0];
}
/** Hungarian assignment maximum for one global permutation, row E forced r0. */
function maxPermutation(U){
  // All ciphertext symbols other than E use all residues 1..28 once each.
  const rows=Array.from({length:29},(_,i)=>i).filter(i=>i!==E);
  const n=28;
  const u=new Float64Array(n+1),v=new Float64Array(n+1);
  const p=new Int16Array(n+1), way=new Int16Array(n+1);
  for(let i=1;i<=n;i++){
    p[0]=i;
    const min=new Float64Array(n+1);min.fill(Infinity);
    const used=new Uint8Array(n+1);
    let j0=0;
    do{
      used[j0]=1;
      const i0=p[j0];
      let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++)if(!used[j]){
        const cur=-U[rows[i0-1]][j]-u[i0]-v[j];
        if(cur<min[j]){min[j]=cur;way[j]=j0;}
        if(min[j]<delta){delta=min[j];j1=j;}
      }
      for(let j=0;j<=n;j++){
        if(used[j]){u[p[j]]+=delta;v[j]-=delta;}
        else min[j]-=delta;
      }
      j0=j1;
    }while(p[j0]!==0);
    do{
      const j1=way[j0];p[j0]=p[j1];j0=j1;
    }while(j0!==0);
  }
  let total=U[E][0];
  const assignment=new Int16Array(29).fill(-1);
  assignment[E]=0;
  for(let j=1;j<=n;j++){
    assignment[rows[p[j]-1]]=j;
    total+=U[rows[p[j]-1]][j];
  }
  assert.equal(new Set(assignment).size,29);
  return {total,assignment:Array.from(assignment)};
}
function aggregate(tapes,starts){
  const agg=Array.from({length:29},()=>Array(29).fill(0));
  for(let j=0;j<tapes.length;j++){
    const U=allSkipUpper(tapes[j],starts[j]);
    for(let c=0;c<29;c++)for(let r=0;r<29;r++)agg[c][r]+=U[c][r];
  }
  return agg;
}
// Exact synthetic positive: 29-global conjugation at prime0 with arbitrary
// printed-F skips preserves the E bound automatically.
const seed=0x5ed12;
let state=seed|0;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
const perm=Array.from({length:29},(_,i)=>i);
for(let i=28;i>0;i--){const j=Math.floor(rng()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
const inverse=new Uint8Array(29);perm.forEach((x,i)=>{inverse[x]=i;});
const nativePlant=gpNative(read("resources/control/gibran_prophet_58585.txt")).slice(0,729);
const planted=[];let t=0;
for(const x of nativePlant){
  if(x===F){planted.push(F);}
  else planted.push(perm[(inverse[x]+shifts[t++])%29]);
}
const Uplant=allSkipUpper(planted,0);
const checkPlant=maxPermutation(Uplant);
assert.ok(checkPlant.total>=nativePlant.filter(x=>x===E).length,
  "all-secret max must cover actual unknown π + F skips");
console.log("POSITIVE_729_RANDOM_CONJUGATION",JSON.stringify({
  exactPlantE:nativePlant.filter(x=>x===E).length,
  allSecretUpperE:checkPlant.total,sourcePrimeConsumed:t
}));
const configs=[
  {name:"book-continuous-prime2",tapes:[source],starts:[0]},
  {name:"nine-illustrated-chapter-resets-prime2",tapes:chapterTapes,starts:chapterTapes.map(()=>0)},
  {name:"every-original-page-reset-prime2",tapes:pageTapes,starts:pageTapes.map(()=>0)}
];
for(const config of configs){
  const U=aggregate(config.tapes,config.starts);
  const best=maxPermutation(U);
  const unsorted=U.reduce((a,row)=>a+Math.max(...row),0);
  const Eactual=source.filter(x=>x===E).length;
  console.log("ORIGINAL_ALLSECRET_E",JSON.stringify({
    name:config.name, sourceRunes:source.length,
    ciphertextE:Eactual,ciphertextF:source.filter(x=>x===F).length,
    allSkipUpperE:best.total,
    permissiveNoUniqueColumnUpperE:unsorted,
    originalUpperFraction:best.total/source.length,
    nativeEnglishMinimumE:Math.min(...native.map(x=>x.E)),
    excludesAllNativeControls:best.total<Math.min(...native.map(x=>x.E)),
    optimizingResidueMatching:best.assignment
  }));
}
console.log("SCOPE","Row-cell skip paths are independently optimized, making every output an upper bound; source-selected global pi, clock start and plaintext register remain unknown.");

const allBudgets=Array.from({length:source.filter(x=>x===F).length+1},(_,i)=>i);
const Ubudget=allSkipUpper(source,0,allBudgets);
const englishMinimum=Math.min(...native.map(x=>x.E));
const profile=Ubudget.map((matrix,b)=>({skips:b,upper:maxPermutation(matrix).total}));
for(const b of [0,1,2,4,8,16,32,64,80,96,112,128,160,192,224,256,320,384,458])
  console.log("SKIP_BUDGET",JSON.stringify(profile[b]));
const threshold=profile.find(x=>x.upper>=englishMinimum);
console.log("ALLSECRET_MIN_SKIP_NECESSITY",JSON.stringify({
  originalFPositions:allBudgets.length-1,referenceMinE:englishMinimum,
  threshold:threshold||null,atP56OneInFiveF:profile[Math.floor((allBudgets.length-1)/5)]
}));
for(let i=1;i<profile.length;i++)
  assert(profile[i].upper>=profile[i-1].upper,"budget E upper must be monotone");
