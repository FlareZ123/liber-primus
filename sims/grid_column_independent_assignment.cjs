"use strict";
/**
 * Infer the eight-way assignment of actual LP2 base60 grid columns to eight
 * text groups using independently deciphered long sections. Every section
 * gets its own arbitrary hidden 29-symbol alphabet and keyskip path.
 * Assignment maximizes all eight calibrated likelihood scores exactly.
 *
 * No candidate can be deemed recovered absent full plaintext/held-out evidence.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs,cipherBytes}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {assignmentMax,encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {search}=require("./outer_permutation_real_skip_scan.cjs");
const {split}=require("./global_grid_sigma_em.cjs");

const M=29,MAX=1200,LENGTHS=[729,1145,1729,1903,1021,1524,1589,3316];
const TRUE=[3,6,1,7,0,2,5,4];

/** @param {number[][]} grid */
function keyPool(grid) {
 return grid.map(col=>[...cipherBytes(col,"aes-256-ctr",MAX+270)].map(b=>b%29));
}

/** @param {number[][]} c @param {string[][]} ctx
 * @param {number[][]} keys @param {object} model
 */
function allPairs(c,ctx,keys,model) {
 const scores=[];
 for(let s=0;s<8;s++){
  const n=Math.min(MAX,c[s].length);
  const row=[];
  for(let col=0;col<8;col++){
   const got=search(c[s].slice(0,n),keys[col],ctx[s].slice(0,n),model);
   row.push(got.score);
  }
  scores.push(row);
  const ranked=row.map((score,i)=>({col:i,perRune:score/n}))
    .sort((a,b)=>b.perRune-a.perRune);
  console.log("GROUP",JSON.stringify({s,n,top:ranked.slice(0,3)}));
 }
 const result=assignmentMax(scores);
 return {scores,assignment:result.assignment,total:result.score,
  weightedAverage:result.score/c.reduce((n,x)=>n+Math.min(MAX,x.length),0)};
}

function main() {
 const src=fs.readFileSync(path.join(__dirname,"..","resources",
  "control","shakespeare_first300k.txt"),"utf8");
 const corpus=words(src),model=training(flatten(corpus.slice(4200,50000)));
 const original=flatten(corpus.slice(0,4000));
 assert(original.values.length>=12956);
 const source=split(original.values),sourceContext=split(original.classes);
 const keys=keyPool(inputs().columnKeys),rng=seededRandom(0x25aa031);
 const planted=source.map((p,s)=>{
  const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
  return encrypt(p.slice(0,MAX),keys[TRUE[s]],sigma,rng,.81);
 });
 const plant=allPairs(planted.map(x=>x.ciphertext),sourceContext,keys,model);
 console.log("PLANT",JSON.stringify({
  expected:TRUE,assignment:plant.assignment,
  correctlyAssigned:plant.assignment.filter((x,i)=>x===TRUE[i]).length,
  score:plant.weightedAverage,extraDraws:planted.map(x=>x.extraDraws),
  rankingEach:plant.scores.map((row,s)=>{
   const sorted=row.map((v,i)=>({i,v})).sort((a,b)=>b.v-a.v);
   return {s,trueKey:TRUE[s],trueKeyRank:sorted.findIndex(v=>v.i===TRUE[s])+1,
    top:sorted[0].i,margin:(row[TRUE[s]]-sorted.find(v=>v.i!==TRUE[s]).v)/Math.min(MAX,source[s].length)};
  })
 }));
 const actual=lp2();
 assert.equal(actual.values.length,12956);
 const real=allPairs(split(actual.values),split(actual.classes),keys,model);
 console.log("REAL",JSON.stringify({assignment:real.assignment,
  weightedAverage:real.weightedAverage,
  groupScores:real.assignment.map((col,s)=>
    real.scores[s][col]/Math.min(MAX,LENGTHS[s])),
  totalCandidateFits:64,source:"actual 8 grid columns as 256bit AES256CTR keys, byte mod29, positive sign, zero nonce"}));
}
if(require.main===module)main();
module.exports={keyPool,allPairs,main};
