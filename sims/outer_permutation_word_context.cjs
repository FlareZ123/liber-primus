"use strict";
/**
 * Word-position-conditioned alphabet matching for planted controls.
 * Uses cleartext word lengths as side information to improve an unknown
 * 29-way rune permutation attack when candidate keystream indices are known.
 * Only the scenario of preserved word boundaries is modelled.
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  assignmentMax, encodeEnglish, encrypt, seededRandom, shuffledPermutation
} = require("./outer_permutation_assignment.cjs");

const M=29;
function words(text) {
  return (text.match(/[A-Za-z]+/g)||[]).map(w=>encodeEnglish(w))
    .filter(w=>w.length);
}
function category(n,j) {
  if(n===1) return "one";
  if(n===2) return "two"+j;
  if(n===3) return "three"+j;
  if(n===4) return "four"+j;
  if(j===0) return "start";
  if(j===1) return "second";
  if(j===2) return "third";
  if(j===n-1) return "last";
  if(j===n-2) return "penult";
  return "middle";
}
function flatten(wordList) {
  const values=[],classes=[];
  for (const word of wordList) {
    for(let j=0;j<word.length;j++){
      values.push(word[j]);
      classes.push(category(word.length,j));
    }
  }
  return {values,classes};
}
function training(items) {
  const base=Array(M).fill(0.5),counts=new Map();
  for(let i=0;i<items.values.length;i++){
    const c=items.classes[i],v=items.values[i];
    base[v]++;
    if(!counts.has(c))counts.set(c,Array(M).fill(0));
    counts.get(c)[v]++;
  }
  const den=base.reduce((a,b)=>a+b),prior=base.map(v=>v/den);
  const logProb={};
  for(const [c,row] of counts){
    const size=row.reduce((a,b)=>a+b),alpha=c==="one"?7:40;
    logProb[c]=row.map((v,g)=>Math.log((v+alpha*prior[g])/(size+alpha)));
  }
  return {prior,logProb};
}
function fit(cipher,key,classes,model,keyIndices) {
  const weights=Array.from({length:M},()=>Array(M).fill(0));
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i],k=key[keyIndices?keyIndices[i]:i];
    const lp=model.logProb[classes[i]] || model.prior.map(x=>Math.log(x));
    for(let g=0;g<M;g++) weights[c][g]+=lp[(g-k+M)%M];
  }
  const {assignment,score}=assignmentMax(weights);
  return {inverse:assignment,score};
}
function study(){
  const raw=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(raw);
  const evalWords=corpus.slice(0,520);
  const test=flatten(evalWords);
  const train=flatten(corpus.slice(600,50000));
  const model=training(train);
  const rng=seededRandom(93447);
  const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
  const N=1500,key=Array.from({length:N+250},()=>Math.floor(rng()*M));
  const source=test.values.slice(0,N),classes=test.classes.slice(0,N);
  const plain=encrypt(source,key,sigma,rng,0);
  const filtered=encrypt(source,key,sigma,rng,.81);
  const results={seed:93447,model:"position-conditioned GP unigram",
    trainingRunes:train.values.length,controlRunes:source.length,
    extraKeyDraws:filtered.extraDraws,sizes:{}};
  const correct=(res)=>res.inverse.filter((x,c)=>sigma[x]===c).length;
  for(const n of [60,100,300,1000,1500]){
    const pure=fit(plain.ciphertext.slice(0,n),key,classes.slice(0,n),model);
    const trueAligned=fit(filtered.ciphertext.slice(0,n),key,
      classes.slice(0,n),model,filtered.keyIndices.slice(0,n));
    const naive=fit(filtered.ciphertext.slice(0,n),key,classes.slice(0,n),model);
    const wrong=[];
    for(let j=0;j<100;j++){
      const k=Array.from({length:n},()=>Math.floor(rng()*M));
      wrong.push(fit(filtered.ciphertext.slice(0,n),k,classes.slice(0,n),model).score);
    }
    wrong.sort((a,b)=>a-b);
    results.sizes[n]={
      pure:{score:pure.score,correct:correct(pure)},
      trueAligned:{score:trueAligned.score,correct:correct(trueAligned)},
      naive:{score:naive.score,correct:correct(naive),
        nullMedian:wrong[50],nullMax:wrong[99],
        pUpper:(1+wrong.filter(x=>x>=naive.score).length)/101}
    };
  }
  return results;
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={words,category,flatten,training,fit,study};
