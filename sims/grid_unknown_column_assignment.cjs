"use strict";
/**
 * Joint unknown 8-column key assignment and 29-way unknown outer rune
 * permutation, with key-consumption skips. The original LP2 manuscript has
 * eight natural prose groups and eight independent 256-bit grid columns.
 * Calibration demands exact recovery on a planted random key-assignment.
 *
 * This is a mechanistic cipher inversion and a bounded experimental search,
 * not a solved manuscript.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs,cipherBytes}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {assignmentMax,encrypt,shuffledPermutation,seededRandom}=
  require("./outer_permutation_assignment.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const {split,assignGlobal,recover}=require("./global_grid_sigma_em.cjs");

const M=29, N=8, LENGTHS=[729,1145,1729,1903,1021,1524,1589,3316];
const WIDTH=90, RETRIES=8;
const MATCH=[3,6,1,7,0,2,5,4];

/** @param {number[][]} cols */
function pool(cols){
 const len=Math.max(...LENGTHS)+260;
 return cols.map(col=>[...cipherBytes(col,"aes-256-ctr",len)].map(b=>b%29));
}
/** @param {number} n */
function popcount(n){
 let ct=0;
 for(;n;n&=n-1)ct++;
 return ct;
}

/** @param {number[][]} ciphers @param {string[][]} contexts
 * @param {number[][]} pads @param {object} model @param {number[]} inverse
 */
function optimalAssignment(ciphers,contexts,pads,model,inverse){
 const score=Array.from({length:N},()=>Array(N).fill(0));
 for(let s=0;s<N;s++)for(let j=0;j<N;j++){
  const n=ciphers[s].length;
  const config={strict:true,maxDrift:Math.ceil(n*.06)+18,suppress:.81,
    positionLogPrior:contexts[s].map(c=>model.logProb[c])};
  score[s][j]=viterbi(ciphers[s],pads[j],model.prior,inverse,config).score;
 }
 return assignmentMax(score);
}
/** @param {number[][]} cipher @param {string[][]} ctx
 * @param {number[][]} pads @param {object} model @param {number[]} mapping
 */
function optimize(cipher,ctx,pads,model,mapping){
 const miniCipher=cipher.map(x=>x.slice(0,WIDTH));
 const miniCtx=ctx.map(x=>x.slice(0,WIDTH));
 let selected=mapping.slice();
 let inverse=assignGlobal(miniCipher,miniCtx,
   selected.map(j=>pads[j]),model);
 const observations=[];
 for(let i=0;i<RETRIES;i++){
  const currentKeys=selected.map(j=>pads[j]);
  const positions=miniCipher.map((c,s)=>{
   const config={strict:true,maxDrift:24,suppress:.81,
     positionLogPrior:miniCtx[s].map(cl=>model.logProb[cl])};
   const path=viterbi(c,currentKeys[s],model.prior,inverse,config);
   return [...path.drift].map((d,k)=>k+d);
  });
  const updated=assignGlobal(miniCipher,miniCtx,currentKeys,model,positions);
  const assignment=optimalAssignment(miniCipher,miniCtx,pads,model,updated);
  const next=assignment.assignment;
  observations.push({iter:i,score:assignment.score,assignment:next});
  if(next.every((v,j)=>v===selected[j])&&
    updated.every((v,j)=>v===inverse[j]))break;
  selected=next;
  inverse=updated;
 }
 const final=optimalAssignment(miniCipher,miniCtx,pads,model,inverse);
 return {score:final.score, mapping:final.assignment,
   inverse,history:observations};
}

/** @param {number[][]} cipher @param {string[][]} ctx
 * @param {number[][]} pads @param {object} model
 */
function search(cipher,ctx,pads,model){
 const r=seededRandom(0x250081);
 const initial=[Array.from({length:N},(_,i)=>i),Array.from({length:N},(_,i)=>N-1-i),MATCH];
 for(let i=0;i<9;i++)
  initial.push(shuffledPermutation(Array.from({length:N},(_,j)=>j),r));
 const candidates=initial.map(m=>optimize(cipher,ctx,pads,model,m))
  .sort((a,b)=>b.score-a.score);
 const report={candidates:candidates.map(c=>({score:c.score,mapping:c.mapping})),
   best:candidates[0]};
 return report;
}

function main(){
 const {columnKeys}=inputs(),pads=pool(columnKeys),actual=lp2();
 const ciphers=split(actual.values),contexts=split(actual.classes);
 const text=fs.readFileSync(path.join(__dirname,"..","resources",
   "control","shakespeare_first300k.txt"),"utf8");
 const englishWords=words(text),model=training(flatten(englishWords.slice(4200,50000)));
 const p=flatten(englishWords.slice(0,4000));
 assert(p.values.length>=12956);
 const source=split(p.values),ctx=split(p.classes);
 const r=seededRandom(0x259911);
 const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),r);
 const oracleInv=Array.from({length:M},(_,i)=>sigma.indexOf(i));
 const planted=source.map((part,i)=>encrypt(part,pads[MATCH[i]],sigma,r,.81));
 const test=search(planted.map(x=>x.ciphertext),ctx,pads,model);
 const correctMapping=test.best.mapping.filter((j,i)=>j===MATCH[i]).length;
 const correctLabels=test.best.inverse.filter((j,i)=>j===oracleInv[i]).length;
 const oracleMap=optimalAssignment(planted.map(x=>x.ciphertext.map((v,k)=>v).slice(0,WIDTH)),
    ctx.map(x=>x.slice(0,WIDTH)),pads,model,oracleInv);
 console.log("PLANT",JSON.stringify({
  source:12956,extraSkips:planted.map(x=>x.extraDraws),
  expectedMapping:MATCH,mappingCorrect:correctMapping,
  sigmaCorrect:correctLabels,
  oracleMapping:oracleMap.assignment,oracleMappingCorrect:oracleMap.assignment.filter((j,i)=>j===MATCH[i]).length,
  candidateScores:test.candidates.slice(0,6),best:test.best
 }));
 const real=search(ciphers,contexts,pads,model);
 console.log("REAL",JSON.stringify({
  candidateScores:real.candidates.slice(0,8),
  bestScore:real.best.score,mapping:real.best.mapping,
  alphabet:real.best.inverse,
  caveat:"Conditional short-prefix search; no LP2 plaintext claim"
 }));
}
if(require.main===module)main();
module.exports={pool,optimalAssignment,optimize,search,main};
