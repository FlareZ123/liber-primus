"use strict";
/**
 * Matched held-out null for the complete 8x8 column-assignment, unknown
 * global alphabet, collision-conditioned skip inversion. The trained
 * alphabet and key-column assignment are fixed before the next 180 runes.
 *
 * Explicit finite family: eight 32-byte BASE60 grid columns as AES-256-CTR
 * (zero IV), negative byte-mod29 rune pad, independent section key offsets.
 *
 * Null: shuffle each 32-byte source column independently, then repeat all
 * 128 candidate seed fits, 8x8 Hungarian and held-out continuation.
 */
const fs=require("node:fs");
const path=require("node:path");
const {inputs}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {gridKeys}=require("./outer_permutation_pooled_sections.cjs");
const {recover,continuation}=require("./outer_permutation_unknown_column_assignment.cjs");
const {seededRandom}=require("./outer_permutation_assignment.cjs");
const N=180,WIDTH=360;

function permute(columns,random){
  return columns.map(col=>{
    const out=col.slice();
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  });
}
function scan(cGroups,cClasses,keyGroups,model){
  const fit=recover(cGroups,cClasses,keyGroups,model);
  const held=continuation(cGroups,cClasses,keyGroups,model,fit);
  return {
    training:fit.score/(8*N),
    heldout:held.scorePerRune,
    mapping:fit.assignment,
    initialization:fit.initialization,
    decoded:held.decoded
  };
}
function experiment({replicates=60}={}){
  const {groups,columnKeys}=inputs();
  const real=lp2(),cGroups=[],classes=[];
  let off=0;
  for(const section of groups){
    cGroups.push(section.slice(0,WIDTH));
    classes.push(real.classes.slice(off,off+WIDTH));
    off+=section.length;
  }
  const source=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(source),model=training(flatten(corpus.slice(12000,50000)));
  const observed=scan(cGroups,classes,gridKeys(columnKeys,WIDTH),model);
  const rng=seededRandom(0x9a330145),nulls=[];
  for(let i=0;i<replicates;i++){
    const keys=gridKeys(permute(columnKeys,rng),WIDTH);
    const r=scan(cGroups,classes,keys,model);
    nulls.push({i,training:r.training,heldout:r.heldout});
    if((i+1)%10===0){
      console.log("CHECKPOINT",JSON.stringify({nullRuns:i+1,
        countAtOrAboveObserved:nulls.filter(x=>x.heldout>=observed.heldout).length,
        heldBest:Math.max(...nulls.map(x=>x.heldout))}));
    }
  }
  const aboveTrain=nulls.filter(x=>x.training>=observed.training).length;
  const aboveHeld=nulls.filter(x=>x.heldout>=observed.heldout).length;
  console.log("RESULT",JSON.stringify({
    testedModel:"eight 32-byte grid columns AES-256-CTR zero IV; arbitrary bijective global sigma; strict skip; free 8x8 assignment",
    actual:{training:observed.training,heldout:observed.heldout,
      assignment:observed.mapping,init:observed.initialization},
    holdoutStartRune:180,holdoutPerSection:180,
    null:{replicates,seed:"0x9a330145",
      generator:"independent within-each-column 32-byte permutation",
      trainingCountAtOrAbove:aboveTrain,
      holdoutCountAtOrAbove:aboveHeld,
      trainingP:(aboveTrain+1)/(replicates+1),
      holdoutP:(aboveHeld+1)/(replicates+1),
      heldoutMin:Math.min(...nulls.map(x=>x.heldout)),
      heldoutMean:nulls.reduce((a,x)=>a+x.heldout,0)/replicates,
      heldoutMax:Math.max(...nulls.map(x=>x.heldout)),
      rows:nulls
    }
  }));
}
if(require.main===module)experiment();
module.exports={permute,scan,experiment};
