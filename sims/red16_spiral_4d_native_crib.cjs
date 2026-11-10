"use strict";
/**
 * Original LP2 known-plaintext, global-state inverse driven by the sixteen
 * original red spans arranged in the page-15 4x4 Fibonacci spiral.
 * Use each span's complete GP-prime sum mod 29 as one state-matrix cell;
 * solved Cicada GP-EA words are the independent candidate cribs.
 *
 * Hypothesis (not historically established):
 * A = 16 red-span GP-prime sums in the original p15 spiral (mod29),
 * state S(t+1)=A*S(t).
 * K(t)=first coordinate of S(t), reduced mod28 after field arithmetic.
 * Cipher page-head: C0 = P0+K0 (mod29).
 * Other positions: GP EA(index28) emits repeated C, while every other
 * plaintext rune P emits Cprev + 15^((P+K)%28) (mod29).
 * State continues across all 55 rune pages; cipher differences restart
 * at physical page heads. The fixed red16 matrix is tested here against
 * the original 12,956 ciphertext runes, rather than as a repeating pad.
 *
 * Four known non-EA GP letters at a possible EA marker impose a 4x4
 * linear system over F29, solving the UNKNOWN four-coordinate state;
 * test all 0->28 projection aliases and then PREDICT the remaining
 * letters of that word, other native EA words, and the rest of LP2.
 *
 * The source dictionary is exclusively original solved-Cicada GP words.
 * A successful synthetic genuine-key recovery and 12,956-symbol exact
 * decrypt/encrypt roundtrip are mandatory. Original candidates require
 * independently reproduced, unfitted plaintext to establish a result.
 *
 * Run: node sims/source_native_4d_matrix_crib_attack.cjs
 * Node 22+, CommonJS, no third-party dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
const read = f=>fs.readFileSync(path.join(root,f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const C=pages.flatMap(p=>p.indices);
const N=C.length,MOD=29,EA=28;
assert.equal(pages.length,55);
assert.equal(N,12956);
const mod=(x,m=MOD)=>(x%m+m)%m;
const source=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return s && !s.startsWith("#")&&!s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
const byToken=new Map(gp.translit.map((t,i)=>[t,i]));
/** @param {string} word @returns {number[]} */
function encode(word) {
  const s=word.toUpperCase().replace(/QU/gu,"CW")
    .replace(/V/gu,"U").replace(/K/gu,"C").replace(/Z/gu,"S");
  const row=[];
  for(let i=0;i<s.length;) {
    const pair=byToken.get(s.slice(i,i+2));
    if(pair!==undefined){row.push(pair);i+=2;}
    else {
      const unit=byToken.get(s[i]);
      assert.notEqual(unit,undefined,"unknown native GP symbol");
      row.push(unit);i++;
    }
  }
  return row;
}
const nativeWords=(source.match(/[A-Za-z]+/gu)||[])
  .map(name=>({name:name.toUpperCase(),runes:encode(name)}));
assert.equal(nativeWords.length,796);
const nativeSymbols=nativeWords.flatMap(w=>w.runes);
assert.equal(nativeSymbols.length,3248);
const nativeEA=[...new Map(nativeWords.filter(w=>w.runes.includes(EA))
  .map(w=>[w.name,w])).values()].map(w=>
  ({...w,ea:w.runes.indexOf(EA)}));
assert.equal(nativeWords.reduce((s,w)=>s+
  w.runes.filter(x=>x===EA).length,0),21);
const fittingWords=nativeEA.filter(w=>
  w.runes.length>=5&&w.runes.filter(x=>x!==EA).length>=4);
assert.deepEqual(fittingWords.map(w=>w.name),
  ["REALITY","REALITIES","AETHEREAL","UNREASONABLE","REASON"]);
const { clockwiseSpiral } = require("./fibonacci_prime_spiral.cjs");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const originalRed = ink.pages.filter(p => p.page < 56)
  .flatMap(p => (p.red_spans || []).map(s => ({
    page: p.page,
    count: [...s.runes].length,
    gpPrimeSum: [...s.runes].reduce((n, ch) => {
      const idx = gp.runes.indexOf(ch);
      assert.ok(idx >= 0);
      return n + gp.prime[idx];
    }, 0)
  })));
assert.equal(originalRed.length, 16);
assert.equal(originalRed.reduce((n, s) => n + s.count, 0), 213);
const A = Array.from({ length: 4 }, () => Array(4).fill(0));
const spiral = clockwiseSpiral();
originalRed.forEach((s, i) => {
  const [r, c] = spiral[i];
  A[r][c] = mod(s.gpPrimeSum);
});
/** @param {number[][]} matrix */
const transpose=matrix=>matrix[0].map((_,j)=>matrix.map(r=>r[j]));
/** @param {number[][]} left @param {number[][]} right */
const multiply=(left,right)=>left.map(row=>
  right[0].map((_,j)=>mod(row.reduce((s,x,k)=>s+x*right[k][j],0))));
const identity=Array.from({length:4},(_,i)=>
  Array.from({length:4},(_,j)=>Number(i===j)));
const powers=[identity,A];
for(let i=2;i<=4;i++)powers.push(multiply(powers.at(-1),A));
// Compute the source matrix's characteristic polynomial in F29
// and verify Cayley-Hamilton.
const descending = [1];
let B = identity;
for (let k = 1; k <= 4; k++) {
  const prod = multiply(A, B);
  const trace = mod(prod.reduce((n, row, i) => n + row[i], 0));
  let inverseK = 1;
  while (inverseK * k % MOD !== 1) inverseK++;
  const coefficient = mod(-trace * inverseK);
  descending.push(coefficient);
  B = prod.map((row, i) => row.map((x, j) =>
    mod(x + (i === j ? coefficient : 0))));
}
const characteristic = descending.slice().reverse();
for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
  assert.equal(mod(powers.reduce((sum, m, k) =>
    sum + characteristic[k] * m[i][j], 0)), 0);

/** @param {number[][]} rows */
function determinant(rows) {
  const a=rows.map(r=>r.slice());
  let det=1;
  for(let i=0;i<4;i++){
    const pivot=a.findIndex((r,j)=>j>=i&&r[i]!==0);
    if(pivot<0)return 0;
    if(pivot!==i){
      [a[i],a[pivot]]=[a[pivot],a[i]];
      det=mod(-det);
    }
    det=mod(det*a[i][i]);
    let inv=1;
    while(inv*a[i][i]%29!==1)inv++;
    for(let k=i;k<4;k++)a[i][k]=mod(a[i][k]*inv);
    for(let j=i+1;j<4;j++){
      const v=a[j][i];
      for(let k=i;k<4;k++)a[j][k]=mod(a[j][k]-v*a[i][k]);
    }
  }
  return det;
}
// With an arbitrary secret 4D state, every source matrix orientation and
// every one-coordinate/sum output tap produces exactly the SAME family of
// scalar F29 streams: each four-symbol prefix selects one unique state.
const tapDeterminants={};
for(const [label,matrix] of [["printed",A],["transposed",transpose(A)]]) {
  tapDeterminants[label]=[];
  for(let tap=0;tap<5;tap++){
    let v=Array.from({length:4},(_,j)=>
      tap===4?1:Number(tap===j));
    const rows=[];
    for(let step=0;step<4;step++){
      rows.push(v);
      v=v.map((_,j)=>mod(v.reduce((s,x,k)=>s+x*matrix[k][j],0)));
    }
    const det=determinant(rows);
    if(label==="printed" && tap===0)
      assert.notEqual(det,0,"selected source red16 tap must be observable");
    tapDeterminants[label].push(det);
  }
}
const pageAt=new Int16Array(N),pageIndex=new Int16Array(N);
let offset=0;
for(let j=0;j<pages.length;j++) {
  for(let i=0;i<pages[j].indices.length;i++) {
    pageAt[offset+i]=i;
    pageIndex[offset+i]=j;
  }
  offset+=pages[j].indices.length;
}
const exp=Array.from({length:28},(_,i)=>{
  let x=1;
  for(let j=0;j<i;j++)x=x*15%MOD;
  return x;
});
const log=new Int8Array(MOD).fill(-1);
exp.forEach((x,i)=>{log[x]=i;});
assert.equal(new Set(exp).size,28);
let row=[1,0,0,0];
const V=[];
for(let i=0;i<N;i++){
  V.push(row);
  row=row.map((_,j)=>mod(row.reduce((s,x,k)=>s+x*A[k][j],0)));
}
/** @param {number[][]} M @param {number[]} y @returns {number[]|null} */
function solve(M,y) {
  const t=M.map((r,i)=>[...r,mod(y[i])]);
  for(let i=0;i<4;i++){
    const pivot=t.findIndex((r,j)=>j>=i&&r[i]!==0);
    if(pivot<0)return null;
    [t[i],t[pivot]]=[t[pivot],t[i]];
    let inv=1;
    while(inv*t[i][i]%MOD!==1)inv++;
    for(let k=i;k<5;k++)t[i][k]=mod(t[i][k]*inv);
    for(let j=0;j<4;j++){
      if(j===i)continue;
      const factor=t[j][i];
      for(let k=i;k<5;k++)t[j][k]=mod(t[j][k]-factor*t[i][k]);
    }
  }
  return t.map(r=>r[4]);
}
/** @param {number[]} state @param {number} pos */
function key(state,pos) {
  return V[pos].reduce((s,x,j)=>s+x*state[j],0)%MOD%28;
}
/** @param {number[]} ciphertext @param {number[]} state */
function decrypt(ciphertext,state) {
  const result=new Array(N);
  for(let i=0;i<N;i++) {
    const k=key(state,i);
    if(pageAt[i]===0)result[i]=mod(ciphertext[i]-k);
    else {
      const d=mod(ciphertext[i]-ciphertext[i-1]);
      result[i]=d===0?EA:mod(log[d]-k,28);
    }
  }
  return result;
}
/** @param {number[]} plain @param {number[]} state */
function encrypt(plain,state) {
  const result=new Array(N);
  for(let i=0;i<N;i++) {
    const k=key(state,i);
    if(pageAt[i]===0)result[i]=mod(plain[i]+k);
    else {
      const previous=result[i-1];
      result[i]=plain[i]===EA?previous:
        mod(previous+exp[mod(plain[i]+k,28)]);
    }
  }
  return result;
}
/** @param {number[]} cipher */
function markers(cipher) {
  const result=[];
  for(let i=1;i<N;i++)
    if(pageAt[i]>0 && cipher[i]===cipher[i-1])
      result.push(i);
  return result;
}
assert.equal(markers(C).length,86);
/**
 * An EA-bearing solved-native word is aligned by its EA rune at marker
 * position. Four non-EA steps solve an unknown F29 initial state,
 * with both field 0 and 28 considered when Kmod28=0.
 * @param {number[]} cipher
 * @param {{name:string,runes:number[],ea:number}} word
 * @param {number} marker
 * @returns {{state:number[],wholeCrib:boolean}[]}
 */
function recover(cipher,word,marker){
  const a=marker-word.ea,b=a+word.runes.length-1;
  if(a<0||b>=N||pageIndex[a]!==pageIndex[b]||pageAt[a]===0)
    return [];
  const constraints=[];
  for(let j=0;j<word.runes.length;j++){
    const i=a+j,p=word.runes[j];
    if(p===EA) {
      if(pageAt[i]===0||cipher[i]!==cipher[i-1])return [];
      continue;
    }
    if(pageAt[i]===0||cipher[i]===cipher[i-1])return [];
    const d=mod(cipher[i]-cipher[i-1]);
    constraints.push({i,b:mod(log[d]-p,28)});
  }
  if(constraints.length<4)return [];
  const selected=constraints.slice(0,4);
  const zeros=selected.flatMap((x,j)=>x.b===0?[j]:[]);
  const results=[];
  for(let mask=0;mask<(1<<zeros.length);mask++){
    const y=selected.map(x=>x.b);
    zeros.forEach((j,k)=>{if(mask&(1<<k))y[j]=28;});
    const state=solve(selected.map(x=>V[x.i]),y);
    if(!state)continue;
    const wholeCrib=constraints.every(x=>key(state,x.i)===x.b);
    results.push({state,wholeCrib});
  }
  return results;
}
/**
 * A known word at a second, never-fitted marker is a genuine prediction
 * under the declared model. Printed word boundaries are intentionally
 * irrelevant: page boundaries still matter for differential initialization.
 * @param {number[]} decoded
 * @param {number[]} mark
 */
function nativeMatches(decoded,mark){
  const matches=[];
  for(const m of mark)for(const w of nativeEA){
    const a=m-w.ea,b=a+w.runes.length-1;
    if(a<0||b>=N||pageIndex[a]!==pageIndex[b])continue;
    if(w.runes.every((x,j)=>decoded[a+j]===x))
      matches.push({name:w.name,site:m,length:w.runes.length,
        physicalPage:pages[pageIndex[m]].page});
  }
  return matches;
}
const counts=new Float64Array(29).fill(0.5);
nativeSymbols.forEach(x=>counts[x]++);
const sourceSum=counts.reduce((s,x)=>s+x,0);
const prior=Array.from(counts,x=>Math.log(29*x/sourceSum));
const info=plain=>plain.reduce((s,x)=>s+prior[x],0)/plain.length;

// Genuine-key planted challenge: original source GP runes (not a random
// iid alphabet), one hidden 4D key, original 55 physical page boundaries.
const plantedPlain=Array.from({length:N},(_,i)=>nativeSymbols[i%nativeSymbols.length]);
const actualSecret=[11,7,22,3];
const plantedCipher=encrypt(plantedPlain,actualSecret);
assert.deepEqual(decrypt(plantedCipher,actualSecret),plantedPlain);
const plantedWords=markers(plantedCipher);
const plantedRecovery=[];
for(const m of plantedWords){
  for(const result of recover(plantedCipher,fittingWords[0],m))
    if(result.wholeCrib && result.state.every((x,j)=>x===actualSecret[j]))
      plantedRecovery.push(m);
}
assert.ok(plantedRecovery.length>0,
  "REALITY authentic native source crib must recover full secret state");
const recovered=plantedRecovery[0];
assert.deepEqual(
  decrypt(plantedCipher,actualSecret),
  plantedPlain
);
assert.deepEqual(
  encrypt(decrypt(plantedCipher,actualSecret),actualSecret),
  plantedCipher
);

const originalMarker=markers(C),candidates=new Map();
const byWord={};
for(const word of fittingWords){
  let fits=0,fullFits=0;
  for(const m of originalMarker)for(const result of recover(C,word,m)){
    fits++;
    fullFits+=Number(result.wholeCrib);
    const id=result.state.join(",");
    if(!candidates.has(id))
      candidates.set(id,{state:result.state,cribs:[]});
    candidates.get(id).cribs.push({word:word.name,site:m,
      physicalPage:pages[pageIndex[m]].page,
      fullWordPrediction:result.wholeCrib});
  }
  byWord[word.name]={fourLetterStateSolutions:fits,
    wholeWordPredictions:fullFits};
}
const scored=[];
for(const candidate of candidates.values()){
  const decoded=decrypt(C,candidate.state);
  const matching=nativeMatches(decoded,originalMarker);
  const longSites=[...new Set(matching.filter(x=>x.length>=4)
    .map(x=>x.site))];
  scored.push({state:candidate.state,score:info(decoded),
    longSites:longSites.length,
    fittedCribs:candidate.cribs,
    longMatches:matching.filter(x=>x.length>=4),
    otherMatches:matching.filter(x=>x.length<4)});
}
scored.sort((a,b)=>b.longSites-a.longSites||b.score-a.score);
const byScore=scored.slice().sort((a,b)=>b.score-a.score);
const verifiedCribs=scored.reduce((s,c)=>s+
  c.fittedCribs.filter(x=>x.fullWordPrediction).length,0);
const report={
  classification:"Red16 Fibonacci-spiral F29 4D state, solved-Cicada EA crib inverse; original source evaluated with synthetic positive, no invented LP2 plaintext",
  primarySource:"LP2 original 16 red-rune spans and physical p15 Fibonacci-spiral placement",
  redSource:{spanCount:originalRed.length,primeSums:originalRed.map(x=>x.gpPrimeSum),
    redRuneCount:213,matrixMod29:A},
  sourceDictionary:"796 solved-Cicada GP words; 21 EA tokens in 13 distinct source words; five source words have four non-EA constraining symbols",
  model:"global continuous 4D F29 state using red16 prime-sum spiral matrix; coordinate0 mod28, primitive root 15 nonzero steps, GP EA transparent zero step",
  fieldAlgebra:{characteristicPolynomialMod29:characteristic,
    observabilityDeterminantsMod29:tapDeterminants,
    consequence:"The selected red16 row-matrix first-coordinate tap is fully observable. The other tap determinants are reported for scope; zero indicates a lower-dimensional family not covered by this inverse."},
  original:{
    runes:N,physicalRunePages:pages.length,EAmarkers:originalMarker.length,
    sourceSelectedWords:fittingWords.map(w=>w.name),
    crib4DStateSolutionCount:[...Object.values(byWord)].reduce((s,v)=>s+v.fourLetterStateSolutions,0),
    unique4DKeys:candidates.size,byWord,
    strongestOriginalGPUnigramScore:byScore[0]?.score,
    maxIndependentLongNativeEASites:scored[0]?.longSites,
    keysMatchingTwoDistinctLongSourceEAWords:scored.filter(x=>x.longSites>=2).length,
    bestLanguageKey:byScore[0]?{
      state:byScore[0].state,meanGPLogRatio:byScore[0].score,
      matchedLongNativeEASites:byScore[0].longMatches,
      cribs:byScore[0].fittedCribs.slice(0,5)
    }:null,
    strongestLongMatchKey:scored[0]?{
      state:scored[0].state,meanGPLogRatio:scored[0].score,
      matches:scored[0].longMatches
    }:null
  },
  plant:{
    sourceGP:"solved-Cicada reference runes concatenated cyclically across original ciphertext page lengths",
    secretState:actualSecret, sourceRunes:plantedPlain.length,
    EAmarkerCount:plantedWords.length,
    authenticREALITYCribRecoveredSecretAt:recovered,
    plaintextRuneRecovery:N,
    exactForwardRoundtrip:N,
    meanGPLogRatio:info(plantedPlain)
  },
  limitation:"This finite global red16 4D source-matrix/transparent-EA/author-word model is bounded; per-page seeds, different matrix transforms, unknown cipher semantics and source vocabulary outside solved-Cicada remain open."
};
assert.ok(scored.length>0);
// A recovered multi-site crib hypothesis is reported, not discarded;
// source-selected verification follows from the full candidate records.
assert.ok(report.plant.meanGPLogRatio>report.original.strongestOriginalGPUnigramScore);
process.stdout.write(JSON.stringify(report,null,2)+"\n");
module.exports={A,V,solve,key,encrypt,decrypt,recover,nativeMatches,report};
