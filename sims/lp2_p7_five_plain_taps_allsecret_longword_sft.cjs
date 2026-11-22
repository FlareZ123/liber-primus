"use strict";
/**
 * LP2 p7 five-red-product recurrence: exact original-input ALL-SECRET
 * PLAINTEXT-feedback five-tap family exclusion. Distinct from the ciphertext-
 * feedback companion; no candidate key guessing or wordwise q enumeration.
 *
 * Windows Node.js 22 SFT:
 *   node sims/lp2_p7_five_plain_taps_allsecret_longword_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = x => ((x % 29) + 29) % 29;
const W = [11,26,8,15,2];
const p7Words = [[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(-14), p7Words.flat());
assert.deepEqual(p7Words.map(a => a.reduce((v,x) => mod(v*x),1)),W);
const source = parseSharedCorpus();
assert.equal(source.runeCount,12956);
assert.equal(source.words.length,2896);
assert.equal(source.crossPageWords,32);
const runeIndex = new Map(gp.runes.map((r,i) => [r,i]));
const inverse = Array(29).fill(0);
for(let x=1;x<29;x++)for(let y=1;y<29;y++)
  if(x*y%29===1)inverse[x]=y;
assert(inverse.slice(1).every(Boolean));
/** @param {number[]} values @returns {number[]} */
function innovation(values) {
  const out=[];
  for(let i=5;i<values.length;i++) {
    let x=values[i];
    for(let j=0;j<5;j++)x-=W[j]*values[i-1-j];
    out.push(mod(x));
  }
  return out;
}
/**
 * Solve any overdetermined 5-unknown GF29 system, counting rank-deficient
 * compatible systems as solutions.
 * @param {number[][]} matrix
 * @param {number[]} target
 * @returns {{q:number[],rank:number}|null}
 */
function solveFive(matrix,target) {
  const rows=matrix.map((line,i)=>line.map(mod).concat(mod(target[i])));
  assert.equal(matrix.length,target.length);
  let rank=0, pivot=[];
  for(let col=0;col<5;col++){
    let k=rank;
    while(k<rows.length && rows[k][col]===0)k++;
    if(k===rows.length)continue;
    [rows[k],rows[rank]]=[rows[rank],rows[k]];
    let mul=inverse[rows[rank][col]];
    for(let j=col;j<=5;j++)rows[rank][j]=mod(rows[rank][j]*mul);
    for(let i=0;i<rows.length;i++){
      if(i===rank||rows[i][col]===0)continue;
      const f=rows[i][col];
      for(let j=col;j<=5;j++)rows[i][j]=mod(rows[i][j]-f*rows[rank][j]);
    }
    pivot.push(col);rank++;
  }
  for(let i=rank;i<rows.length;i++)if(rows[i][5])return null;
  const q=Array(5).fill(0);
  for(let i=0;i<rank;i++)q[pivot[i]]=rows[i][5];
  for(let i=0;i<matrix.length;i++)
    assert.equal(mod(matrix[i].reduce((s,x,j)=>s+x*q[j],0)),mod(target[i]));
  return {q,rank};
}
/**
 * Model: K_i=SUM(W_j K_(i-j))+SUM(q_j P_(i-j))+r;
 * C_i=a P_i+b+K_i. Every unknown five-symbol K seed, b, r disappear
 * from innovation differences. Given *hypothetical* GP plaintext,
 * solve all q coefficients analytically for each of all 28 nonzero a.
 *
 * @param {number[]} cipher
 * @param {number[]} plain
 * @returns {{a:number,q:number[],rank:number}|null}
 */
function compatible(cipher,plain) {
  assert.equal(cipher.length,plain.length);
  const n=cipher.length;
  assert(n>=13);
  const Rc=innovation(cipher),Rp=innovation(plain);
  const mat=Array.from({length:n-6},(_,k)=>Array.from({length:5},(_,j)=>
    mod(plain[k+6-j-1]-plain[5-j-1])));
  const lhs=Array.from({length:n-6},(_,k)=>mod(Rc[k+1]-Rc[0]));
  const dP=Array.from({length:n-6},(_,k)=>mod(Rp[k+1]-Rp[0]));
  for(let a=1;a<29;a++) {
    const rhs=lhs.map((x,k)=>mod(x-a*dP[k]));
    const answer=solveFive(mat,rhs);
    if(answer)return {a,q:answer.q,rank:answer.rank};
  }
  return null;
}
/**
 * Positive legitimate plaintext-driven encoder.
 * @param {number[]} plain
 * @param {number[]} q
 * @param {number} a
 * @param {number} b
 * @param {number} r
 * @param {number[]} seed
 * @returns {number[]}
 */
function encrypt(plain,q,a,b,r,seed) {
  const state=seed.slice(),cipher=[];
  for(let i=0;i<plain.length;i++){
    if(i>=5) {
      let ki=r;
      for(let j=0;j<5;j++)
        ki+=W[j]*state[i-j-1]+q[j]*plain[i-j-1];
      state.push(mod(ki));
    }
    cipher.push(mod(a*plain[i]+b+state[i]));
  }
  return cipher;
}
const p=encodeSourceNativeGP("CIRCUMFERENCES");
assert.equal(p.length,14);
let positives=0;
for(const seed of [[23,2,5,2,19],[0,0,0,0,0]])
  for(let k=0;k<15;k++) {
    const q=[k,mod(k+7),mod(3*k+5),mod(11*k+8),mod(17*k+1)];
    const a=mod(3*k+1)||1;
    const c=encrypt(p,q,a,mod(9*k+2),mod(4*k+11),seed);
    assert(compatible(c,p), "source-native planted inverse failure "+k);
    positives++;
  }
assert.equal(positives,30);
const {sourceNativeLongwords}=require("./lp2_source_native_longword_lexicon.cjs");
const dict=sourceNativeLongwords();
assert.equal(dict.get(13).length,426);
assert.equal(dict.get(14).length,175);
const outcomes=[];
for(const sourceWord of source.words) {
  if(sourceWord.length<13)continue;
  const C=[...sourceWord.runes].map(r=>{
    const value=runeIndex.get(r);assert.notEqual(value,undefined);return value;
  });
  const matches=[];
  for(const candidate of dict.get(C.length)||[]) {
    const params=compatible(C,candidate.P);
    if(params)matches.push({word:candidate.word,params});
  }
  outcomes.push({physicalPage:physicalLP2Page(sourceWord.startPage),
    runeLength:C.length,tested:dict.get(C.length).length,matches});
}
assert.deepEqual(outcomes.map(x=>[x.physicalPage,x.runeLength,x.matches.length]),[
  [11,13,20],[13,14,0],[16,13,16],[25,14,0],
  [43,14,0],[52,13,12],[55,13,18]
]);
console.log(JSON.stringify({
  result:"NO source-native GP29 14-rune words compatible in original three 14-rune cases under any secret linear five-plaintext-tap family",
  sourceProducts:W,
  model:"K_i=Σw_j K_(i-j)+Σq_j P_(i-j)+r, C_i=aP_i+b+K_i (mod29)",
  unknowns:"all q_j in GF29, any nonzero a, any constants b/r and five initial state symbols per printed word",
  originalLongWords:outcomes.map(x=>({physicalPage:x.physicalPage,
    originalLength:x.runeLength,nativeLexiconSize:x.tested,
    compatibleCount:x.matches.length})),
  sourceNativePositiveControls:positives,
  recoveredUnknownPlaintext:false
},null,2));
