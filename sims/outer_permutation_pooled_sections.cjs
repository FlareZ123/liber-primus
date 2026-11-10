"use strict";
/**
 * Joint inversion of eight ciphertext sections sharing one unknown 29-way
 * outer alphabet but using DIFFERENT known, section-local keystreams.
 *
 * Prefix-derived multi-section alphabet starts -> exact loose-skip
 * forward/backward EM -> collision-conditioned Viterbi + Hungarian polishing.
 * Demonstration controls use eight original base60 columns as AES-CTR keys.
 *
 * Separate sections reset their key-pointer states. Unknown section/key
 * permutations are deliberately not searched here.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {assignmentMax,encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const {forwardBackward}=require("./outer_permutation_soft_em.cjs");
const {inputs,cipherBytes}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const M=29;
const mod=x=>(x%M+M)%M;
function gridKeys(columns,N) {
  return columns.map(col=>[...cipherBytes(col,"aes-256-ctr",N+100)]
    .map(b=>mod(-b)));
}
function buildSegments(cipherGroups,keyGroups,classGroups,model) {
  return cipherGroups.map((cipher,i)=>({
    cipher,key:keyGroups[i],classes:classGroups[i],
    logPrior:classGroups[i].map(c=>model.logProb[c]||
      model.prior.map(p=>Math.log(p)))
  }));
}
function assignmentFromSegments(segments,indices) {
  const W=Array.from({length:M},()=>Array(M).fill(0));
  segments.forEach((seg,s)=>{
    for(let i=0;i<seg.cipher.length;i++){
      const c=seg.cipher[i],ki=indices[s][i],k=seg.key[ki];
      for(let t=0;t<M;t++)
        W[c][t]+=seg.logPrior[i][mod(t-k)];
    }
  });
  return assignmentMax(W).assignment;
}
function assignmentFromPosteriors(segments,posteriors) {
  const W=Array.from({length:M},()=>Array(M).fill(0));
  segments.forEach((seg,s)=>{
    const posterior=posteriors[s];
    for(let i=0;i<seg.cipher.length;i++){
      const row=W[seg.cipher[i]];
      for(let d=0;d<posterior[i].length;d++){
        const mass=posterior[i][d];
        if(mass<1e-9)continue;
        const k=seg.key[i+d],prior=seg.logPrior[i];
        for(let t=0;t<M;t++)row[t]+=mass*prior[mod(t-k)];
      }
    }
  });
  return assignmentMax(W).assignment;
}
function starts(segments,model){
  const starts=[],seen=new Set();
  function push(inv,tag){
    const id=inv.join(",");
    if(!seen.has(id)){seen.add(id);starts.push({inverse:inv,tag});}
  }
  // Share unskipped earliest prefixes to overwhelm a misleading single page.
  for(const W of [12,20,30,50]){
    const cipher=[],classes=[],key=[],positions=[];
    for(const seg of segments){
      const off=key.length;
      for(let i=0;i<W;i++){
        cipher.push(seg.cipher[i]);classes.push(seg.classes[i]);
      }
      key.push(...seg.key.slice(0,W));
      for(let i=0;i<W;i++)positions.push(off+i);
    }
    push(fit(cipher,key,classes,model,positions).inverse,"pooled/"+W);
  }
  // Preserve alternative single-section starts, including an early skip.
  for(let s=0;s<segments.length;s++){
    const seg=segments[s],W=60;
    const text=seg.cipher.slice(0,W),cls=seg.classes.slice(0,W);
    const base=fit(text,seg.key,cls,model);
    push(base.inverse,"section/"+s+"/no-skip");
    const choices=[];
    for(let at=1;at<W;at++){
      const indices=Array.from({length:W},(_,i)=>i+(i>=at?1:0));
      const f=fit(text,seg.key,cls,model,indices);
      choices.push({inverse:f.inverse,score:f.score,at});
    }
    choices.sort((a,b)=>b.score-a.score);
    for(const x of choices){
      const before=starts.length;
      push(x.inverse,"section/"+s+"/skip/"+x.at);
      if(starts.length>before)break;
    }
  }
  return starts;
}
function scoreStrict(segments,inverse,conf){
  const paths=segments.map(seg=>viterbi(seg.cipher,seg.key,conf.prior,
    inverse,{strict:true,maxDrift:conf.maxDrift,suppress:conf.suppress,
      positionLogPrior:seg.logPrior}));
  return {score:paths.reduce((sum,p)=>sum+p.score,0),paths};
}
function recover(segments,model,{maxDrift=35,suppress=.81}={}){
  const seeds=starts(segments,model);
  const conf={prior:model.prior,maxDrift,suppress};
  let best={score:-Infinity};
  for(const s of seeds){
    let inverse=s.inverse.slice();
    for(let iteration=0;iteration<8;iteration++){
      const fb=segments.map(seg=>forwardBackward(seg.cipher,seg.key,
        seg.logPrior,inverse,{maxDrift,suppress}));
      const updated=assignmentFromPosteriors(segments,fb.map(x=>x.posterior));
      if(updated.every((x,i)=>x===inverse[i]))break;
      const before=fb.reduce((sum,r)=>sum+r.score,0);
      const after=segments.reduce((sum,seg)=>
        sum+forwardBackward(seg.cipher,seg.key,seg.logPrior,updated,
          {maxDrift,suppress}).score,0);
      if(after+1e-5<before)throw Error("Pooled EM decreased auxiliary objective");
      inverse=updated;
    }
    for(let iteration=0;iteration<5;iteration++){
      const score=scoreStrict(segments,inverse,conf);
      if(score.score>best.score){
        best={score:score.score,inverse:inverse.slice(),paths:score.paths,
          seed:s.tag,iteration};
      }
      const indices=score.paths.map((p,s)=>
        Array.from(p.drift,(d,i)=>i+d));
      const update=assignmentFromSegments(segments,indices);
      if(update.every((x,i)=>x===inverse[i]))break;
      inverse=update;
    }
  }
  return {...best,seeds:seeds.length};
}
function experiment({replicates=6}={}){
  const source=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(source),test=flatten(corpus.slice(0,6000));
  const model=training(flatten(corpus.slice(6000,50000)));
  const {groups,columnKeys}=inputs(),N=240;
  const keyGroups=gridKeys(columnKeys,N),master=seededRandom(20261110);
  const rows=[];
  for(let rep=0;rep<replicates;rep++){
    const rng=seededRandom((master()*4294967296)>>>0);
    const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
    const actualInverse=Array.from({length:M},(_,c)=>sigma.indexOf(c));
    const cipherGroups=[],classGroups=[],plainGroups=[],keyIndices=[];
    for(let s=0;s<8;s++){
      const at=(rep*8+s)*N;
      const plain=test.values.slice(at,at+N),classes=test.classes.slice(at,at+N);
      assert.equal(plain.length,N);
      const planted=encrypt(plain,keyGroups[s],sigma,rng,.81);
      cipherGroups.push(planted.ciphertext);
      classGroups.push(classes);plainGroups.push(plain);
      keyIndices.push(planted.keyIndices);
    }
    const segments=buildSegments(cipherGroups,keyGroups,classGroups,model);
    const found=recover(segments,model);
    const labels=found.inverse.filter((x,i)=>x===actualInverse[i]).length;
    const aligned=found.paths.reduce((a,p,s)=>
      a+[...p.drift].filter((d,i)=>i+d===keyIndices[s][i]).length,0)/(8*N);
    const correct=found.paths.reduce((a,p,s)=>a+
      cipherGroups[s].filter((c,i)=>mod(found.inverse[c]-keyGroups[s][i+p.drift[i]])===plainGroups[s][i]).length,0)/(8*N);
    rows.push({rep,labels,aligned,correct,seed:found.seed,score:found.score,
      starts:found.seeds,firstSkips:keyIndices.map(a=>a.findIndex((j,i)=>j>i))});
  }
  // Fixed section-to-column order, zero IV, AES-256-CTR, byte mod29, minus sign.
  const real=lp2(),realContexts=[],realCipher=[];
  let off=0;
  for(const group of groups){
    realCipher.push(group.slice(0,N));
    realContexts.push(real.classes.slice(off,off+N));
    off+=group.length;
  }
  const actual=recover(buildSegments(realCipher,keyGroups,realContexts,model),model);
  return {scope:"eight source-derived AES keys; global arbitrary sigma; q=.81 rejection",
    N,replicates,
    exactAlphabetPlants:rows.filter(x=>x.labels===29).length,
    rows,real:{score:actual.score,scorePerRune:actual.score/(8*N),
      starts:actual.seeds,seed:actual.seed,
      plaintextPreview:realCipher.slice(0,2).map((x,s)=>
        x.slice(0,60).map((c,i)=>mod(actual.inverse[c]-
          keyGroups[s][i+actual.paths[s].drift[i]])).join(","))}};
}
if(require.main===module)console.log(JSON.stringify(experiment(),null,2));
module.exports={gridKeys,buildSegments,assignmentFromSegments,assignmentFromPosteriors,starts,recover,experiment};
