"use strict";

/**
 * All-secret plaintext-feedback GP29 four-state original decipherment.
 *
 * The authentic p15 Fibonacci-prime 4x4 matrix is an input to a putative
 * first-order plaintext-autokey block operation:
 *
 *   P_t = C_t + s * A * P_(t-1) mod 29
 *
 * for any unknown initial four-rune plaintext state P_(-1). This distinct
 * architecture is not tested by fixed IV additive OFB, ciphertext feedback,
 * CBC-output or changing-matrix Hill operations. No secret matrix is inferred.
 *
 * The recurrence unfolds into P_t=U_t+B^(t+1)*IV, B=s*A.
 * Four independent original one-rune word constraints fix the entire IV,
 * leaving only 3^4=81 admissible IVs to check on independent one-rune words.
 * All 29^4 possible initial states are represented.
 *
 * Targets (original physical page geometry): pp16-22 1744 GP29 runes
 * and p40-53 black post-heading body 3000 GP29 runes. Eight matrix
 * orientations/directions times two feedback signs, both targets.
 *
 * SFT Windows Node.js 22:
 *   node sims/lp2_p15_plainfeedback_alliv_singleton_sft.cjs
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const core=require("./lp2_p15_fourstate_unknown_iv_singletons_sft.cjs");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"),"utf8"));
const mod=x=>(x%29+29)%29;
const multiply=(A,x)=>A.map(row=>mod(row.reduce(
  (sum,v,j)=>sum+v*x[j],0)));
const product=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce(
  (sum,v,k)=>sum+v*B[k][j],0))));
const neg=A=>A.map(row=>row.map(v=>mod(-v)));
const transpose=A=>A[0].map((_,i)=>A.map(row=>row[i]));
const identity=Array.from({length:4},(_,i)=>Array.from(
  {length:4},(_,j)=>Number(i===j)));
const printed=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
].map(row=>row.map(mod));
const signed=printed.map(row=>row.slice());
signed[3][0]=mod(-4516);
signed[3][1]=mod(-1206);
const origins=[
  ["printed",printed],["signed",signed],
  ["printed-transpose",transpose(printed)],
  ["signed-transpose",transpose(signed)]
];
const wordList=core.printedWords();
assert.equal(wordList.length,2896);
const targets=[
  {name:"original-p16-22",firstPage:16,lastPage:22,skipHeading:0},
  {name:"original-p40-53-black",firstPage:40,lastPage:53,skipHeading:8}
].map(info=>{
  const begin=gp.pages.filter(p=>p.page<info.firstPage)
    .reduce((sum,p)=>sum+p.indices.length,0)+info.skipHeading;
  const end=gp.pages.filter(p=>p.page<=info.lastPage)
    .reduce((sum,p)=>sum+p.indices.length,0);
  const cipher=gp.pages.filter(p=>
    p.page>=info.firstPage&&p.page<=info.lastPage)
    .flatMap(p=>p.indices).slice(info.skipHeading);
  assert.equal(cipher.length,end-begin);
  assert.equal(cipher.length%4,0);
  const sites=wordList.filter(w=>w.runeWord.length===1&&
    w.at>=begin&&w.at<end)
    .map(w=>({at:w.at-begin,cipher:cipher[w.at-begin]}));
  assert.equal(sites.length,info.firstPage===16?17:13);
  return {...info,begin,end,cipher,sites};
});

/**
 * Transform a 4-rune ciphertext array into effective ciphertext U
 * and a public GF29 linear coefficient stream for unknown IV.
 *
 * P_t=U_t - H_t*IV, with U_t=C_t+B*U_(t-1), H_t=-B^(t+1).
 * @param {number[]} C
 * @param {number[][]} A
 * @param {1|-1} sign
 */
function unfold(C,A,sign){
  const B=A.map(row=>row.map(v=>mod(v*sign)));
  let old=Array(4).fill(0);
  let power=B.map(row=>row.slice());
  const effective=[],rows=[];
  for(let t=0;t<C.length;t+=4){
    const current=C.slice(t,t+4);
    const shift=multiply(B,old);
    old=current.map((v,i)=>mod(v+shift[i]));
    effective.push(...old);
    rows.push(...neg(power));
    power=product(B,power);
  }
  return {effective,rows};
}

/**
 * Source-native planted plaintext-feedback inversion: the same decoder
 * recovers a hidden arbitrary seed from A/I/O singleton positions.
 */
function plant(target,A,sign){
  const seed=[9,2,15,20];
  const native=gp.pages[57].indices;
  assert.equal(native.length,95);
  const plain=Array.from({length:target.cipher.length},
    (_,i)=>native[i%native.length]);
  target.sites.forEach((s,i)=>{plain[s.at]=[24,10,3][i%3];});
  const B=A.map(row=>row.map(v=>mod(v*sign)));
  const cipher=[];
  let previous=seed.slice();
  for(let j=0;j<plain.length;j+=4){
    const x=plain.slice(j,j+4),lag=multiply(B,previous);
    cipher.push(...x.map((v,k)=>mod(v-lag[k])));
    previous=x;
  }
  const {effective,rows}=unfold(cipher,A,sign);
  const recovered=core.search(effective,rows,target.sites);
  assert(recovered.perfectKeys.some(x=>x.every((v,i)=>v===seed[i])));
  const decoded=effective.map((v,i)=>mod(v-
    rows[i].reduce((sum,x,k)=>sum+x*seed[k],0)));
  assert.deepEqual(decoded,plain);
  return {plantedPlaintextRunes:decoded.length,
    hiddenStateRecovered:true,plaintextRecoveredExactly:true,
    legalStates:recovered.perfectKeys.length};
}
function run(){
  const original=[];
  for(const target of targets){
    const variants=[];
    for(const [matrixName,raw] of origins)
      for(const [direction,A] of [
        ["forward",raw],["inverse",core.inverse4(raw)]
      ]) for(const sign of [-1,1]){
        const {effective,rows}=unfold(target.cipher,A,sign);
        const search=core.search(effective,rows,target.sites);
        assert.equal(search.perfectKeys.length,0,
          "Original plaintext-feedback key must fail all A/I/O constraints");
        variants.push({matrix:matrixName,direction,feedbackSign:sign,
          firstFourIndependent:search.firstFourIndependent,
          statesAdmittedAfterFourCribs:search.testedCompleteStates,
          heldoutSingleRuneWords:target.sites.length-4,
          minimumContradictions:search.minimumContradictions,
          keysWithNoContradictions:0});
      }
    assert.equal(variants.length,16);
    const positive=plant(target,signed,-1);
    original.push({target:target.name,begin:target.begin,
      end:target.end,runes:target.cipher.length,
      oneRuneWords:target.sites.length,
      completeInitialStateSpacePerVariant:29**4,
      models:variants,positive});
  }
  const minimumByTarget=original.map(o=>
    Math.min(...o.models.map(v=>v.minimumContradictions)));
  assert(minimumByTarget.every(x=>x>=1));
  return {
    hypothesis:"P_t=C_t+sign*A*P_previous modulo29, four-rune blocks",
    source:"original page15 4x4 and p39 red polynomial / p40 boundary",
    allSecretUnknownIV:true,allPossibleInitialStatesCovered:true,
    exactNativeGpPositiveControls:true,
    bestContradictions:minimumByTarget,
    original,
    conclusion:"No original unknown-IV plaintext-feedback fourstate model supports all original one-rune words; this bounded family yields no plaintext or key"
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,unfold,plant};
