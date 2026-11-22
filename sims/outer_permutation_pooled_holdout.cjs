"use strict";
/**
 * Independent 240-rune continuation challenge for the eight-section,
 * shared-unknown-sigma, source-grid-key, hidden-skip inversion attack.
 *
 * Fit global sigma and per-section key pointer on first 240 runes, freeze
 * sigma and inferred pointer, then score following 240 WITHOUT re-fitting.
 * Compare to equally optimized independently shuffled source-byte grids.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {gridKeys,buildSegments,recover}=
  require("./outer_permutation_pooled_sections.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {seededRandom,shuffledPermutation,encrypt}=
  require("./outer_permutation_assignment.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const M=29,W=240,WIDTH=480;
const mod=x=>(x%M+M)%M;
const RUNES=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
function evaluate(cipherGroups,classGroups,keys,model){
  const train=buildSegments(cipherGroups.map(x=>x.slice(0,W)),keys,
    classGroups.map(x=>x.slice(0,W)),model);
  const found=recover(train,model);
  const scores=[],decodes=[],indices=[];
  for(let s=0;s<8;s++){
    const cipher=cipherGroups[s].slice(W,WIDTH);
    const classes=classGroups[s].slice(W,WIDTH);
    const logPrior=classes.map(c=>model.logProb[c]||
      model.prior.map(p=>Math.log(p)));
    const start=W+found.paths[s].finalDrift;
    const path=viterbi(cipher,keys[s].slice(start),model.prior,
      found.inverse,{strict:true,maxDrift:35,suppress:.81,
        positionLogPrior:logPrior});
    scores.push(path.score);
    decodes.push(cipher.map((c,i)=>mod(found.inverse[c]-
      keys[s][start+i+path.drift[i]])));
    indices.push(cipher.map((c,i)=>start+i+path.drift[i]));
  }
  return {trainScore:found.score,
    trainScorePerRune:found.score/(8*W),
    heldScore:scores.reduce((a,b)=>a+b,0),
    heldScorePerRune:scores.reduce((a,b)=>a+b,0)/(8*W),
    inverse:found.inverse,decodes,indices,seed:found.seed};
}
function shuffle(columns,random){
  return columns.map(col=>{
    const b=col.slice();
    for(let i=b.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [b[i],b[j]]=[b[j],b[i]];
    }
    return b;
  });
}
function main(){
  const {groups,columnKeys}=inputs();
  const english=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(english),test=flatten(corpus.slice(0,16000));
  const model=training(flatten(corpus.slice(16000,50000)));
  const keys=gridKeys(columnKeys,WIDTH),random=seededRandom(33012026);
  const positive=[];
  for(let rep=0;rep<10;rep++){
    const rng=seededRandom((random()*4294967296)>>>0);
    const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rng);
    const inv=Array.from({length:29},(_,c)=>sigma.indexOf(c));
    const cipher=[],classes=[],plain=[],actualIndices=[];
    for(let s=0;s<8;s++){
      const off=(rep*8+s)*WIDTH;
      const p=test.values.slice(off,off+WIDTH);
      assert.equal(p.length,WIDTH);
      const planted=encrypt(p,keys[s],sigma,rng,.81);
      cipher.push(planted.ciphertext);
      classes.push(test.classes.slice(off,off+WIDTH));
      plain.push(p);
      actualIndices.push(planted.keyIndices);
    }
    const v=evaluate(cipher,classes,keys,model);
    const matched=v.inverse.filter((x,i)=>x===inv[i]).length;
    let correct=0,aligned=0;
    for(let s=0;s<8;s++)for(let i=0;i<W;i++){
      if(v.decodes[s][i]===plain[s][W+i])correct++;
      if(v.indices[s][i]===actualIndices[s][W+i])aligned++;
    }
    positive.push({rep,matchedLabels:matched,heldScorePerRune:v.heldScorePerRune,
      heldPlainAccuracy:correct/(8*W),heldKeyAlignment:aligned/(8*W),
      initialSeed:v.seed});
  }
  const real=lp2(),cGroups=[],cClasses=[];
  let off=0;
  for(const section of groups){
    cGroups.push(section.slice(0,WIDTH));
    cClasses.push(real.classes.slice(off,off+WIDTH));
    off+=section.length;
  }
  const actual=evaluate(cGroups,cClasses,keys,model);
  const nullScores=[],nullTraining=[];
  const rand=seededRandom(0x33112299),replicates=50;
  for(let r=0;r<replicates;r++){
    const fakeKeys=gridKeys(shuffle(columnKeys,rand),WIDTH);
    const v=evaluate(cGroups,cClasses,fakeKeys,model);
    nullScores.push(v.heldScorePerRune);
    nullTraining.push(v.trainScorePerRune);
  }
  const holdMore=nullScores.filter(x=>x>=actual.heldScorePerRune).length;
  const trainMore=nullTraining.filter(x=>x>=actual.trainScorePerRune).length;
  console.log(JSON.stringify({
    model:"one shared sigma, AES-256-CTR grid columns in given order, negative pad byte mod29, independent sections",
    trainingRunes:1920,heldoutRunes:1920,
    controls:positive,
    plantFullAlphaRecoveries:positive.filter(x=>x.matchedLabels===29).length,
    plantHeldAccuracyMean:positive.reduce((a,x)=>a+x.heldPlainAccuracy,0)/positive.length,
    real:{trainPerRune:actual.trainScorePerRune,
      heldPerRune:actual.heldScorePerRune,
      seed:actual.seed,
      previews:actual.decodes.slice(0,2).map(x=>x.slice(0,60).map(g=>RUNES[g]).join(""))},
    null:{replicates,
      heldMean:nullScores.reduce((a,b)=>a+b,0)/replicates,
      heldMax:Math.max(...nullScores),
      heldMin:Math.min(...nullScores),
      heldTailP:(holdMore+1)/(replicates+1),
      trainTailP:(trainMore+1)/(replicates+1),
      caveat:"bounded source-byte permutation null, fixed column order, small key family"}
  },null,2));
}
if(require.main===module)main();
module.exports={evaluate,shuffle,main};
