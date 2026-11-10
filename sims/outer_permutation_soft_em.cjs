"use strict";
/**
 * Exact forward-backward phase marginalization for a proposed mod29 key stream
 * with an UNKNOWN outer 29-way substitution alphabet. The auxiliary loose
 * skip model assigns each rune an extra key draw with probability suppress/29.
 * For this explicit model, posterior-weighted Hungarian alphabet updates are
 * an EM M-step (globally optimal conditional on expected key occupancies).
 *
 * A strict collision-conditioned Viterbi path is used only for scoring and
 * subsequent hard refinement. This distinguishes surrogate EM likelihood from
 * the actual rejection cipher. Nothing here is a Liber Primus decryption.
 */
const fs=require("node:fs");
const path=require("node:path");
const {assignmentMax,encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const M=29,NEG=-1e100;
function mod(x){return (x%M+M)%M;}
function lse(a,b){
  if(a<=NEG/2)return b;
  if(b<=NEG/2)return a;
  const hi=Math.max(a,b);
  return hi+Math.log1p(Math.exp(Math.min(a,b)-hi));
}
/**
 * Sum over drift paths, return posterior occupancy for every rune/key offset.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number[][]} logPrior
 * @param {number[]} inverse
 * @param {{maxDrift:number,suppress:number,strict?:boolean}} config
 */
function forwardBackward(cipher,key,logPrior,inverse,config){
  const n=cipher.length, D=Math.min(config.maxDrift,key.length-n);
  if(n===0||D<0)throw Error("Missing ciphertext or key");
  const alpha=Array.from({length:n},()=>new Float64Array(D+1).fill(NEG));
  const beta=Array.from({length:n},()=>new Float64Array(D+1).fill(NEG));
  const looseSkip=Math.log(config.suppress/29);
  const looseStay=Math.log(1-config.suppress/29);
  const strict=config.strict===true;
  const emission=(i,d)=>logPrior[i][mod(inverse[cipher[i]]-key[i+d])];
  function skipAllowed(i,d){
    if(!strict)return true;
    return mod(inverse[cipher[i-1]]-inverse[cipher[i]])===
      mod(key[i+d-1]-key[i+d]);
  }
  const stayCost=i=>strict?
    (cipher[i]===cipher[i-1]?Math.log(1-config.suppress):0):looseStay;
  const skipCost=strict?Math.log(config.suppress):looseSkip;
  alpha[0][0]=emission(0,0);
  for(let i=1;i<n;i++){
    for(let d=0;d<=Math.min(i,D);d++){
      const stay=alpha[i-1][d]+stayCost(i);
      const skip=d>0&&skipAllowed(i,d)?
        alpha[i-1][d-1]+skipCost:NEG;
      alpha[i][d]=lse(stay,skip)+emission(i,d);
    }
  }
  let score=NEG;
  for(let d=0;d<=D;d++)score=lse(score,alpha[n-1][d]);
  beta[n-1].fill(0);
  for(let i=n-2;i>=0;i--){
    const ni=i+1;
    for(let d=0;d<=Math.min(i,D);d++){
      const stay=beta[ni][d]+emission(ni,d)+stayCost(ni);
      const skip=d<D&&skipAllowed(ni,d+1)?
        beta[ni][d+1]+emission(ni,d+1)+skipCost:NEG;
      beta[i][d]=lse(stay,skip);
    }
  }
  const posterior=alpha.map((row,i)=>{
    const p=new Float64Array(D+1);
    for(let d=0;d<=Math.min(i,D);d++)
      p[d]=Math.exp(row[d]+beta[i][d]-score);
    return p;
  });
  return {score,posterior,maxDrift:D};
}
/** Exact EM M-step for the loose drift model, O(29*N*D+29^3). */
function weightedAlphabet(cipher,key,logPrior,posterior){
  const weights=Array.from({length:M},()=>Array(M).fill(0));
  for(let i=0;i<cipher.length;i++){
    const row=weights[cipher[i]];
    const pos=posterior[i];
    for(let d=0;d<pos.length;d++){
      const mass=pos[d];
      if(mass<1e-9)continue;
      const k=key[i+d],prior=logPrior[i];
      for(let g=0;g<M;g++)row[g]+=mass*prior[mod(g-k)];
    }
  }
  return assignmentMax(weights).assignment;
}
function emRefine(cipher,key,logPrior,initial,{maxDrift=100,suppress=.81,iterations=8}={}){
  let inverse=initial.slice(),summary=forwardBackward(cipher,key,logPrior,inverse,{maxDrift,suppress});
  const history=[summary.score];
  for(let iter=0;iter<iterations;iter++){
    const update=weightedAlphabet(cipher,key,logPrior,summary.posterior);
    if(update.every((v,i)=>v===inverse[i]))break;
    const next=forwardBackward(cipher,key,logPrior,update,{maxDrift,suppress});
    if(next.score+1e-6<summary.score)
      throw Error("EM M-step lowered auxiliary likelihood");
    inverse=update;summary=next;
    history.push(summary.score);
  }
  return {inverse,history,auxScore:summary.score,posterior:summary.posterior};
}
function seeds(cipher,key,contexts,model){
  const proposals=[];
  for(const width of [60,100]){
    const chunk=cipher.slice(0,width),cls=contexts.slice(0,width);
    proposals.push({inverse:fit(chunk,key,cls,model).inverse,width,at:0});
    for(let at=1;at<width;at++){
      const indices=Array.from({length:width},(_,i)=>i+(i>=at?1:0));
      const result=fit(chunk,key,cls,model,indices);
      proposals.push({inverse:result.inverse,width,at,score:result.score});
    }
  }
  proposals.sort((a,b)=>(b.score??-Infinity)-(a.score??-Infinity));
  const seen=new Set(),unique=[];
  for(const p of proposals){
    const id=p.inverse.join(",");
    if(!seen.has(id)){seen.add(id);unique.push(p);}
    if(unique.length===6)break;
  }
  return unique;
}
function recover(cipher,key,contexts,model,{maxDrift=100,suppress=.81}={}){
  const logPrior=contexts.map(x=>model.logProb[x]||model.prior.map(Math.log));
  const conf={strict:true,maxDrift,suppress,positionLogPrior:logPrior};
  let best={score:-Infinity};
  const starters=seeds(cipher,key,contexts,model);
  for(const s of starters){
    const em=emRefine(cipher,key,logPrior,s.inverse,{maxDrift,suppress,iterations:8});
    let inv=em.inverse;
    for(let it=0;it<4;it++){
      const v=viterbi(cipher,key,model.prior,inv,conf);
      if(v.score>best.score)
        best={score:v.score,inverse:inv.slice(),drift:v.drift,
          seedWidth:s.width,seedSkip:s.at,emHistory:em.history};
      const indices=Array.from(v.drift,(d,i)=>d+i);
      const updated=fit(cipher,key,contexts,model,indices).inverse;
      if(updated.every((x,i)=>x===inv[i]))break;
      inv=updated;
    }
  }
  return best;
}
function study({replicates=12}={}){
  const source=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(source),test=flatten(corpus.slice(0,600));
  const model=training(flatten(corpus.slice(600,50000)));
  const N=1200,plain=test.values.slice(0,N),contexts=test.classes.slice(0,N);
  const random=seededRandom(20261110),rows=[];
  for(let r=0;r<replicates;r++){
    const seed=(random()*4294967296)>>>0,rng=seededRandom(seed);
    const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
    const inverse=Array.from({length:M},(_,c)=>sigma.indexOf(c));
    const trueKey=Array.from({length:N+400},()=>Math.floor(rng()*29));
    const planted=encrypt(plain,trueKey,sigma,rng,.81);
    const fakeKey=Array.from({length:N+400},()=>Math.floor(rng()*29));
    const found=recover(planted.ciphertext,trueKey,contexts,model);
    const wrong=recover(planted.ciphertext,fakeKey,contexts,model);
    const labelCount=found.inverse.filter((v,i)=>v===inverse[i]).length;
    const driftCorrect=[...found.drift].filter((d,i)=>
      d===planted.keyIndices[i]-i).length;
    rows.push({r,seed,firstSkip:planted.keyIndices.findIndex((j,i)=>j>i),
      labels:labelCount,driftCorrect:driftCorrect/N,
      margin:found.score-wrong.score,seedSkip:found.seedSkip,
      emHistory:found.emHistory});
  }
  return {model:"loose-skip exact forward-backward EM, strict Viterbi refinement",
    replicates,seed:20261110,N,
    exactAlphabet:rows.filter(x=>x.labels===29).length,
    trueBeatsWrong:rows.filter(x=>x.margin>0).length,
    meanCorrectDrift:rows.reduce((s,x)=>s+x.driftCorrect,0)/rows.length,
    rows};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={forwardBackward,weightedAlphabet,emRefine,recover,study};
