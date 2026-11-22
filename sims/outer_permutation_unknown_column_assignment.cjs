"use strict";
/**
 * Unknown grid-column-to-section assignment with a SHARED unknown outer rune
 * alphabet and independently drifting, collision-filtered key pointers.
 *
 * Conditional on an inverse alphabet: solve the eight-by-eight key-to-section
 * matching exactly via maximum-weight bipartite assignment, where each edge
 * is scored by a strict hidden-skip Viterbi. Conditional on the matching and
 * key indices, solve the 29-way unknown alphabet exactly via Hungarian.
 *
 * Multi-start 60-rune prefix fits initialize this nonconvex joint inference.
 * Positive controls explicitly randomize both the unknown rune alphabet
 * and the section-to-grid-column assignment.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {assignmentMax,encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const {gridKeys,buildSegments,assignmentFromSegments}=
  require("./outer_permutation_pooled_sections.cjs");
const {inputs}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const N=180,M=29,WIDTH=360,MAX_DRIFT=26;
const mod=x=>(x%M+M)%M;
function evaluateMap(cipherGroups,classGroups,keyGroups,model,inverse,length){
  const paths=[],weighted=[];
  for(let s=0;s<8;s++){
    const c=cipherGroups[s].slice(0,length);
    const ctx=classGroups[s].slice(0,length);
    const logPrior=ctx.map(x=>model.logProb[x]||
      model.prior.map(v=>Math.log(v)));
    const scores=[];
    const options=[];
    for(let t=0;t<8;t++){
      const p=viterbi(c,keyGroups[t],model.prior,inverse,{
        strict:true,maxDrift:MAX_DRIFT,suppress:.81,positionLogPrior:logPrior});
      scores.push(p.score);
      options.push(p);
    }
    weighted.push(scores);paths.push(options);
  }
  const matched=assignmentMax(weighted);
  return {score:matched.score,assignment:matched.assignment,
    paths:matched.assignment.map((t,s)=>paths[s][t])};
}
function proposals(cipherGroups,classGroups,keyGroups,model){
  const starts=[],seen=new Set();
  for(let s=0;s<8;s++)for(let t=0;t<8;t++){
    const cipher=cipherGroups[s].slice(0,60);
    const cls=classGroups[s].slice(0,60);
    const base=fit(cipher,keyGroups[t],cls,model);
    const opts=[{inverse:base.inverse,score:base.score,at:0,s,t}];
    for(let at=1;at<60;at++){
      const indices=Array.from({length:60},(_,i)=>i+(i>=at?1:0));
      const found=fit(cipher,keyGroups[t],cls,model,indices);
      opts.push({inverse:found.inverse,score:found.score,at,s,t});
    }
    opts.sort((a,b)=>b.score-a.score);
    let picked=0;
    for(const o of opts){
      const id=o.inverse.join(",");
      if(seen.has(id))continue;
      seen.add(id);starts.push(o);
      if(++picked===2)break;
    }
  }
  return starts;
}
function recover(cipherGroups,classGroups,keyGroups,model,{shortlist=16}={}){
  const starts=proposals(cipherGroups,classGroups,keyGroups,model);
  const ranked=starts.map(s=>({
    ...s,globalScore:evaluateMap(cipherGroups,classGroups,keyGroups,
      model,s.inverse,80).score
  })).sort((a,b)=>b.globalScore-a.globalScore);
  let best={score:-Infinity};
  for(const guess of ranked.slice(0,shortlist)){
    let inverse=guess.inverse.slice();
    for(let iter=0;iter<6;iter++){
      const v=evaluateMap(cipherGroups,classGroups,keyGroups,
        model,inverse,N);
      if(v.score>best.score)best={...v,inverse:inverse.slice(),
        initialization:{section:guess.s,column:guess.t,skip:guess.at,
          shortScore:guess.globalScore},iterations:iter+1};
      const selected=buildSegments(cipherGroups.map(x=>x.slice(0,N)),
        v.assignment.map(t=>keyGroups[t]),classGroups.map(x=>x.slice(0,N)),model);
      const keyIndices=v.paths.map(p=>Array.from(p.drift,(d,i)=>i+d));
      const next=assignmentFromSegments(selected,keyIndices);
      if(next.every((x,i)=>x===inverse[i]))break;
      inverse=next;
    }
  }
  return {...best,initialCandidates:starts.length,shortlist};
}
function continuation(cipherGroups,classGroups,keyGroups,model,fitResult){
  const decoded=[],scores=[],indices=[];
  for(let s=0;s<8;s++){
    const key=keyGroups[fitResult.assignment[s]];
    const c=cipherGroups[s].slice(N,WIDTH);
    const classes=classGroups[s].slice(N,WIDTH);
    const logPrior=classes.map(x=>model.logProb[x]);
    const offset=N+fitResult.paths[s].finalDrift;
    const v=viterbi(c,key.slice(offset),model.prior,fitResult.inverse,
      {strict:true,maxDrift:MAX_DRIFT,suppress:.81,positionLogPrior:logPrior});
    scores.push(v.score);
    decoded.push(c.map((r,i)=>mod(fitResult.inverse[r]-
      key[offset+i+v.drift[i]])));
    indices.push(c.map((r,i)=>offset+i+v.drift[i]));
  }
  return {scorePerRune:scores.reduce((a,b)=>a+b,0)/(8*N),decoded,indices};
}
function study({replicates=4}={}){
  const raw=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(raw),control=flatten(corpus.slice(0,12000));
  const model=training(flatten(corpus.slice(12000,50000)));
  const {groups,columnKeys}=inputs(),keys=gridKeys(columnKeys,WIDTH);
  const master=seededRandom(20261110),rows=[];
  for(let r=0;r<replicates;r++){
    const rng=seededRandom((master()*4294967296)>>>0);
    const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
    const inverse=Array.from({length:M},(_,c)=>sigma.indexOf(c));
    const mapping=shuffledPermutation(Array.from({length:8},(_,i)=>i),rng);
    const cipher=[],classes=[],plain=[],index=[];
    for(let s=0;s<8;s++){
      const off=(r*8+s)*WIDTH,p=control.values.slice(off,off+WIDTH);
      assert.equal(p.length,WIDTH);
      const made=encrypt(p,keys[mapping[s]],sigma,rng,.81);
      cipher.push(made.ciphertext);
      classes.push(control.classes.slice(off,off+WIDTH));
      plain.push(p);index.push(made.keyIndices);
    }
    const found=recover(cipher,classes,keys,model);
    const held=continuation(cipher,classes,keys,model,found);
    let correct=0,align=0;
    for(let s=0;s<8;s++)for(let i=0;i<N;i++){
      if(held.decoded[s][i]===plain[s][N+i])correct++;
      if(held.indices[s][i]===index[s][N+i])align++;
    }
    rows.push({r,trueMapping:mapping,estimatedMapping:found.assignment,
      matchingColumns:mapping.filter((x,i)=>found.assignment[i]===x).length,
      matchedLabels:found.inverse.filter((x,i)=>x===inverse[i]).length,
      heldPlain:correct/(8*N),heldAlign:align/(8*N),
      heldScore:held.scorePerRune,fitScore:found.score/(8*N),
      init:found.initialization,initialCandidates:found.initialCandidates});
  }
  const real=lp2(),realC=[],realClasses=[];let off=0;
  for(const section of groups){
    realC.push(section.slice(0,WIDTH));
    realClasses.push(real.classes.slice(off,off+WIDTH));
    off+=section.length;
  }
  const realFit=recover(realC,realClasses,keys,model);
  const heldReal=continuation(realC,realClasses,keys,model,realFit);
  return {model:"unknown column assignment, one shared arbitrary sigma, strict hidden skips",
    N,replicates,successes:rows.filter(x=>x.matchingColumns===8&&x.matchedLabels===29).length,
    rows,real:{assignment:realFit.assignment,fitScorePerRune:realFit.score/(8*N),
      heldScorePerRune:heldReal.scorePerRune,initializer:realFit.initialization,
      continuation:heldReal.decoded[0].slice(0,60)}};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={evaluateMap,proposals,recover,continuation,study};
