"use strict";
/**
 * Bootstrap a drifting key-pointer and arbitrary unknown rune permutation
 * from preserved word lengths and the early unskipped key prefix.
 * Synthetic, controlled study of an optimization strategy; LP2 remains unsolved.
 */
const fs=require("node:fs");
const path=require("node:path");
const {encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");

function study(){
  const source=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(source);
  const evaluation=flatten(corpus.slice(0,600));
  const N=1200;
  const plaintext=evaluation.values.slice(0,N);
  const contexts=evaluation.classes.slice(0,N);
  const train=flatten(corpus.slice(600,50000));
  const model=training(train),rng=seededRandom(93447);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rng);
  const inverse=Array.from({length:29},(_,c)=>sigma.indexOf(c));
  const key=Array.from({length:N+350},()=>Math.floor(rng()*29));
  const {ciphertext,keyIndices,extraDraws}=
    encrypt(plaintext,key,sigma,rng,.81);
  const trueDrift=keyIndices.map((k,i)=>k-i);
  const positionLogPrior=contexts.map(c=>model.logProb[c]);
  const config={strict:true,maxDrift:80,suppress:.81,positionLogPrior};
  const correct=g=>g.filter((v,c)=>v===inverse[c]).length;
  const oracle=viterbi(ciphertext,key,model.prior,inverse,config);
  const aligned=([...oracle.drift].filter((d,i)=>d===trueDrift[i])).length;
  const report={seed:93447, N, plantedSkips:extraDraws,
    firstSkipAt:trueDrift.findIndex(d=>d>0),
    oracle:{score:oracle.score,aligned,final:oracle.finalDrift},
    trials:[]};
  for(const W of [60,80,100,120,160,220,300]){
    let current=fit(ciphertext.slice(0,W),key,contexts.slice(0,W),model).inverse;
    const history=[];
    for(let iteration=0;iteration<10;iteration++){
      const v=viterbi(ciphertext,key,model.prior,current,config);
      const matched=[...v.drift].filter((d,i)=>d===trueDrift[i]).length;
      const indices=[...v.drift].map((d,i)=>i+d);
      const updated=fit(ciphertext,key,contexts,model,indices).inverse;
      history.push({iter:iteration,correctLabels:correct(current),
        score:v.score,finalDrift:v.finalDrift,aligned:matched});
      if(updated.every((g,i)=>g===current[i]))break;
      current=updated;
    }
    report.trials.push({prefix:W,history});
  }
  return report;
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={study};
