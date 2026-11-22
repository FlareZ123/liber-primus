"use strict";
/**
 * SFT: original LP2 p7 five-red-product recurrence, unknown five feedback
 * coefficients shared across *different printed words*.
 *
 * Unlike per-word dictionary matching, shared coefficient reuse could recover
 * an authentic key. Search a pinned 29,229-word independent English lexicon
 * including technical/uncommon terms. Test two distinct key architectures:
 *  - K[i]=Σw*Kprev + Σq*Cprev + r  ciphertext feedback
 *  - K[i]=Σw*Kprev + Σq*Pprev + r  plaintext autokey
 * with C[i]=a*P[i]+b+K[i]. All unknown q, output scalar, offsets and 5-runic
 * initial states are eliminated exactly; no 29^5 brute force or tuning.
 *
 * Source-and-key positive controls are truly encrypted, then tested blind.
 * Windows 11 / Node.js 22:
 *   node sims/lp2_p7_fivefeedback_sharedkey_fullenglish_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const w=[11,26,8,15,2];
const red=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const mod=x=>((x%29)+29)%29;
assert.deepEqual(gp.pages[7].indices.slice(-14),red.flat());
assert.deepEqual(red.map(a=>a.reduce((t,u)=>mod(t*u),1)),w);
const inverse=Array(29).fill(0);
for(let x=1;x<29;x++)for(let y=1;y<29;y++)
  if(x*y%29===1)inverse[x]=y;
assert(inverse.slice(1).every(Boolean));
const rune=new Map(gp.runes.map((t,i)=>[t,i]));
const originals=parseSharedCorpus();
assert.equal(originals.runeCount,12956);
assert.equal(originals.words.length,2896);

/** @param {number[]} s @returns {number[]} */
function innovation(s){
  const out=[];
  for(let i=5;i<s.length;i++){
    let v=s[i];
    for(let j=0;j<5;j++)v-=w[j]*s[i-j-1];
    out.push(mod(v));
  }
  return out;
}
/** @param {number[][]} matrix @param {number[]} target
 * @returns {{q:number[],a:number}|null} */
function solveSix(matrix,target){
  const n=matrix.length;
  assert(n>=7);
  assert.equal(n,target.length);
  const rows=matrix.map((r,k)=>r.map(mod).concat(mod(target[k])));
  const pivots=[];
  let rank=0;
  for(let col=0;col<6;col++){
    let pivot=rank;
    while(pivot<n && rows[pivot][col]===0)pivot++;
    if(pivot===n)continue;
    [rows[pivot],rows[rank]]=[rows[rank],rows[pivot]];
    const fac=inverse[rows[rank][col]];
    for(let k=col;k<=6;k++)rows[rank][k]=mod(rows[rank][k]*fac);
    for(let i=0;i<n;i++){
      if(i===rank || rows[i][col]===0)continue;
      const mul=rows[i][col];
      for(let k=col;k<=6;k++)
        rows[i][k]=mod(rows[i][k]-mul*rows[rank][k]);
    }
    pivots.push(col);
    rank++;
  }
  for(let i=rank;i<n;i++)if(rows[i][6]!==0)return null;
  // An underdetermined five-tap system cannot certify one unique key.
  if(rank!==6)return null;
  const solution=Array(6).fill(0);
  for(let i=0;i<rank;i++)solution[pivots[i]]=rows[i][6];
  if(!solution[5])return null;
  for(let i=0;i<n;i++)
    assert.equal(mod(matrix[i].reduce((sum,t,j)=>
      sum+t*solution[j],0)),mod(target[i]));
  return {q:solution.slice(0,5),a:solution[5]};
}
/** @param {number[]} C @param {number[]} P
 * @param {"ciphertext"|"plaintext"} mode
 * @returns {{q:number[],a:number}|null} */
function compatible(C,P,mode){
  assert.equal(C.length,P.length);
  assert(C.length>=13);
  const Rc=innovation(C),Rp=innovation(P);
  const driving=mode==="ciphertext"?C:P;
  const matrix=Array.from({length:C.length-6},(_,i)=>[
    ...Array.from({length:5},(_,j)=>
      mod(driving[i+6-j-1]-driving[5-j-1])),
    mod(Rp[i+1]-Rp[0])
  ]);
  const target=Rc.slice(1).map(x=>mod(x-Rc[0]));
  return solveSix(matrix,target);
}
/** @param {number[]} P @param {"ciphertext"|"plaintext"} mode
 * @param {number[]} q @param {number} a @param {number} b
 * @param {number} r @param {number[]} seed @returns {number[]} */
function encrypt(P,mode,q,a,b,r,seed){
  const K=seed.slice(),C=[];
  assert.equal(seed.length,5);
  assert.equal(q.length,5);
  for(let i=0;i<P.length;i++){
    if(i>=5){
      let k=r;
      const driving=mode==="ciphertext"?C:P;
      for(let j=0;j<5;j++)
        k+=w[j]*K[i-j-1]+q[j]*driving[i-j-1];
      K.push(mod(k));
    }
    C.push(mod(a*P[i]+b+K[i]));
  }
  return C;
}
const sharedPlant=[7,14,4,25,9];
for(const mode of ["ciphertext","plaintext"]){
  for(const word of ["approximately","circumferences"]){
    const P=encodeSourceNativeGP(word);
    assert(P.length>=13);
    const C=encrypt(P,mode,sharedPlant,7,11,3,[23,2,5,2,19]);
    const answer=compatible(C,P,mode);
    assert.deepEqual(answer,{q:sharedPlant,a:7},
      "genuinely encrypted native word must recover global q and a");
  }
}

const byLength=new Map([[13,[]],[14,[]]]);
const nativeWords=read("resources/control/dwyl-english-alpha-gp13-14-only.txt")
  .trim().split(/\r?\n/);
assert.equal(nativeWords.length,29229);
for(const word of nativeWords){
  const P=encodeSourceNativeGP(word);
  assert(byLength.has(P.length));
  byLength.get(P.length).push({word,P});
}
assert.equal(byLength.get(13).length,17772);
assert.equal(byLength.get(14).length,11457);
const result={};
for(const mode of ["ciphertext","plaintext"]){
  const candidates=[];
  const keymap=new Map();
  for(const word of originals.words){
    if(word.length<13)continue;
    const C=[...word.runes].map(glyph=>{
      const x=rune.get(glyph);
      assert.notEqual(x,undefined);
      return x;
    });
    const physicalPage=physicalLP2Page(word.startPage);
    const fits=[];
    for(const candidate of byLength.get(C.length)){
      const params=compatible(C,candidate.P,mode);
      if(!params)continue;
      const hit={physicalPage,word:candidate.word,
        q:params.q,a:params.a};
      fits.push(hit);
      const signature=params.q.join(",");
      const list=keymap.get(signature)||[];
      list.push(hit);
      keymap.set(signature,list);
    }
    candidates.push({physicalPage,originalRuneLength:C.length,
      dictionaryWords:byLength.get(C.length).length,
      compatibleWords:fits.length});
  }
  const crossword=[];
  for(const [key,hits] of keymap){
    if(new Set(hits.map(x=>x.physicalPage)).size<2)continue;
    crossword.push({key,hits});
  }
  result[mode]={wordFits:candidates,sharedFiveDriverKeys:crossword};
}
assert.deepEqual(result.ciphertext.wordFits.map(x=>[
  x.physicalPage,x.originalRuneLength,x.compatibleWords]),[
  [11,13,570],[13,14,10],[16,13,569],[25,14,15],
  [43,14,18],[52,13,598],[55,13,617]
]);
assert.deepEqual(result.plaintext.wordFits.map(x=>[
  x.physicalPage,x.originalRuneLength,x.compatibleWords]),[
  [11,13,604],[13,14,8],[16,13,581],[25,14,14],
  [43,14,14],[52,13,598],[55,13,592]
]);
assert.deepEqual(result.ciphertext.sharedFiveDriverKeys,[{
  key:"24,3,16,21,17",
  hits:[
    {physicalPage:16,word:"unpresentably",q:[24,3,16,21,17],a:4},
    {physicalPage:52,word:"operationalism",q:[24,3,16,21,17],a:10}
  ]
}]);
assert.deepEqual(result.plaintext.sharedFiveDriverKeys,[]);
console.log(JSON.stringify({
  source:"Original LP2 pp0-55 complete printed words; p7 source five red products; pinned independent dwyl/english-words exact SHA d3a119e7ce57d068c3f3c9cbd694fc2ff14571ab",
  independentWordlistLength:nativeWords.length,
  sourceNativeGP13:byLength.get(13).length,
  sourceNativeGP14:byLength.get(14).length,
  mathematicalTest:"For each candidate plaintext word of n>=13 GP runes, exact GF29 Gaussian over n-6 equations in five feedback coefficients q and one output multiplier a, with IV/b/r cancelled; scan for same q across different original words",
  originalResults:result,
  syntheticPositiveGlobalKeyRecoveries:4,
  decision:"NO shared ciphertext-five-driver q AND a; ONE low-quality cross-page q-only coincidence with different a; ZERO shared plaintext-five-driver q. No authenticated key or unknown plaintext."
},null,2));
