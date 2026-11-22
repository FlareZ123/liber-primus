"use strict";
/**
 * Original LP2 period-equality keyless inverse gate (Agent 15, 2026-11-12).
 *
 * Any direct, length-preserving GP29 cipher with a secret bijection
 * per repeating phase must preserve equality of plaintext symbols separated
 * by exactly one full phase period within a shared reset segment:
 *    C[i]===C[i-T]  <=>  P[i]===P[i-T].
 * The theorem covers *all* secret 29! permutations at each key phase,
 * including additive and affine Vigenere schedules.
 *
 * Source-exact scopes: book continuous, nine manuscript sections, physical
 * pages p0..55. Ten frozen native GP English windows, 5 Shakespeare and
 * 5 Gibran; no search over keys or fitted language.
 *
 * Run: node sims/lp2_period_equality_allsecret_original_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} name */
function read(name){return fs.readFileSync(path.join(ROOT,name),"utf8");}
const db=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=db.pages.filter(p=>p.page<=55);
assert.equal(pages.length,56);
const C=pages.flatMap(p=>p.indices),N=C.length;
assert.equal(N,12956);
const book=[0,N];
const chapter=[0,729,1874,3603,5506,6527,7960,9640,12648,N];
const physical=[0];
for(const p of pages)physical.push(physical.at(-1)+p.indices.length);
assert.equal(physical.length,57);
assert(physical.slice(1).every((n,i)=>n>=physical[i]));
const boundaries={book,chapter,physical};
const gp=db.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/**
 * Greedy native GP29 text conversion, using the standard 29 rune tokens and
 * historical V/K/Z/Q phonetic normalizations.
 * @param {string} text
 * @returns {number[]}
 */
function tokenize(text){
  const result=[];
  for(const original of text.match(/[A-Za-z]+/g)||[]){
    const word=original.toUpperCase().replace(/[VKZQ]/g,c=>
      ({V:"U",K:"C",Z:"S",Q:"C"})[c]);
    for(let i=0;i<word.length;){
      const next=gp.find(x=>word.startsWith(x.token,i));
      assert(next,"Cannot encode "+word.slice(i));
      result.push(next.index);i+=next.token.length;
    }
  }
  return result;
}
const shakespeare=tokenize(read("resources/control/shakespeare_first300k.txt"));
const gibran=tokenize(read("resources/control/gibran_prophet_58585.txt"));
assert(shakespeare.length>=177000&&gibran.length>=54000);
const windows=[
  ...Array.from({length:5},(_,i)=>({
    source:"shakespeare", start:20000+36000*i,
    values:shakespeare.slice(20000+36000*i,20000+36000*i+N)
  })),
  ...Array.from({length:5},(_,i)=>({
    source:"gibran", start:1000+10000*i,
    values:gibran.slice(1000+10000*i,1000+10000*i+N)
  }))
];
for(const w of windows)assert.equal(w.values.length,N);
/**
 * Same-symbol count across all valid distance-T pairs, excluding reset
 * boundaries, without importing any plaintext model.
 * @param {number[]} values
 * @param {number[]} segments 0, sorted cut positions, N
 * @param {number} T Positive phase period
 */
function matches(values,segments,T){
  let equal=0,pairs=0;
  for(let s=1;s<segments.length;s++){
    const first=segments[s-1],end=segments[s];
    for(let i=first+T;i<end;i++){
      pairs++;equal+=Number(values[i]===values[i-T]);
    }
  }
  return {equal,pairs,rate:pairs?equal/pairs:null};
}
const specs=[
  {scope:"book",bounds:book,maximumPeriod:6000},
  {scope:"chapter",bounds:chapter,maximumPeriod:1000},
  {scope:"physical_page",bounds:physical,maximumPeriod:250}
];
const comparisons=[];
for(const spec of specs){
  let evaluated=0,totalCases=0,violations=0;
  let minimumMargin=Infinity,closest=null;
  let largestObserved={rate:0,lag:0,pairs:0};
  let smallestNative={rate:1,lag:0,pairs:0};
  for(let period=1;period<=spec.maximumPeriod;period++){
    const original=matches(C,spec.bounds,period);
    assert(original.pairs>0);
    evaluated++;
    if(original.rate>largestObserved.rate)
      largestObserved={rate:original.rate,lag:period,pairs:original.pairs};
    for(const w of windows){
      const normal=matches(w.values,spec.bounds,period);
      assert.equal(normal.pairs,original.pairs);
      const difference=normal.rate-original.rate;
      totalCases++;
      if(normal.rate<smallestNative.rate)
        smallestNative={rate:normal.rate,lag:period,pairs:normal.pairs,
          source:w.source,start:w.start};
      if(difference<minimumMargin){
        minimumMargin=difference;
        closest={period,observed:original.rate,native:normal.rate,
          pairs:original.pairs,source:w.source,start:w.start};
      }
      if(difference<=0)violations++;
    }
  }
  assert.equal(violations,0,
    "Native English reference outranked original for a tested phase");
  comparisons.push({scope:spec.scope,maximumPeriod:spec.maximumPeriod,
    periods:evaluated,windows:windows.length,comparisons:totalCases,
    originalRatesBelowEveryNativeWindow:true,minimumGap:minimumMargin,
    closest,largestObserved,smallestNative});
}

/** @param {number} seed */
function seeded(seed){
  let z=seed>>>0;
  return ()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return z>>>0;};
}
const rng=seeded(0x15f29966);
/**
 * Plant a completely unknown random 29! bijection at every period phase,
 * honoring the exact segmentation. Recover by the inverse perm and confirm
 * equality at full periods, independently of key distribution.
 * @param {number[]} plain
 * @param {number[]} cuts
 * @param {number} period
 */
function plant(plain,cuts,period){
  const permutation=Array.from({length:period},()=>{
    const a=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){
      const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  });
  const inverse=permutation.map(a=>{
    const inv=Array(29);a.forEach((v,i)=>inv[v]=i);return inv;
  });
  const cipher=Array(N).fill(0),recovered=Array(N).fill(0);
  for(let s=1;s<cuts.length;s++){
    const first=cuts[s-1];
    for(let i=first;i<cuts[s];i++){
      const phase=(i-first)%period;
      cipher[i]=permutation[phase][plain[i]];
      recovered[i]=inverse[phase][cipher[i]];
    }
  }
  assert.deepEqual(recovered,plain);
  assert.deepEqual(matches(cipher,cuts,period),
    matches(plain,cuts,period));
  return{period,exactRecoveredRunes:N,
    samePeriodEqualityPreserved:true};
}
const positive=[
  {scope:"book",...plant(windows[0].values,book,464)},
  {scope:"chapter",...plant(windows[1].values,chapter,128)},
  {scope:"physical_page",...plant(windows[2].values,physical,37)}
];
console.log(JSON.stringify({
  hypothesis:"Unknown independent GP29 substitution at every clock phase",
  originalCipherRunes:N,
  clockContracts:specs.map(s=>s.scope),
  controlWindowStarts:windows.map(w=>({
    source:w.source,start:w.start,length:w.values.length})),
  comparisons,positive,
  conclusion:"All tested source-matched native-GP controls have higher same-period equality than original at every tested period. Any direct GP29 phase-bijective period with the specified clock is disfavored for ordinary English GP plaintext. No original plaintext or key recovered."
},null,2));
