"use strict";
/**
 * Does the manuscript's own 32x8 byte table order its otherwise
 * scrambled GP words? Source-frozen 256-cell stable sorting key.
 *
 * Uses no ciphertext rune identity to fit any key. A nontrivial hit
 * must restore heldout, source-independent English word-length order.
 * @module grid256_word_sort_inverse
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {manuscriptBodies,generator,fisherYates}=
  require("./wordlength_seeded_shuffle.cjs");
const {languageModel,restored,orderScore}=
  require("./grid_word_order_inversion.cjs");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-grid-256.json"),"utf8"));
const original=grid.bytes;
assert.equal(original.length,256);
assert.equal(grid.byte_count,256);
const FIELD=256;
const SETTINGS=[];
for(const geometry of ["row","column"])
for(const reverse of [false,true])
for(let phase=0;phase<FIELD;phase++)
for(const inverse of [false,true])
  SETTINGS.push({geometry,reverse,phase,inverse});
assert.equal(SETTINGS.length,2048);
/** @param {number[]} bytes @param {"row"|"column"} shape @param {boolean} reverse */
function serialization(bytes,shape,reverse){
  const ordered=shape==="row"?bytes:
    Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]);
  return reverse?[...ordered].reverse():ordered;
}
/** @param {number} n @param {number[]} bytes @param {number} phase */
function stableSort(n,bytes,phase){
  const perm=Int32Array.from({length:n},(_,i)=>i);
  perm.sort((a,b)=>bytes[(a+phase)%FIELD]-bytes[(b+phase)%FIELD] || a-b);
  assert.equal(new Set(perm).size,n);
  return perm;
}
/** @param {number} length @param {number[]} bytes @param {number} phase */
function sectionPermutation(length,bytes,phase){
  const out=new Int32Array(length);
  for(let base=0;base<length;base+=FIELD){
    const sub=stableSort(Math.min(FIELD,length-base),bytes,phase);
    for(let i=0;i<sub.length;i++)out[base+i]=base+sub[i];
  }
  return out;
}
/**
 * @param {number[][]} bodies
 * @param {number[]} bytes
 * @param {object} mode
 * @param {number[][]} ratios
 */
function evaluate(bodies,bytes,mode,ratios){
  const stream=serialization(bytes,mode.geometry,mode.reverse);
  let train=0,heldout=0;
  for(let j=0;j<bodies.length;j++){
    const a=bodies[j],perm=sectionPermutation(a.length,stream,mode.phase);
    const restoredSection=restored(a,perm,mode.inverse);
    const score=orderScore(restoredSection,ratios);
    if(j<4)train+=score;else heldout+=score;
  }
  return {train,heldout};
}
/** @param {number[][]} bodies @param {number[]} bytes @param {number[][]} ratios */
function search(bodies,bytes,ratios){
  let winner=null;
  for(const setting of SETTINGS){
    const score=evaluate(bodies,bytes,setting,ratios);
    if(!winner||score.train>winner.train)
      winner={...setting,...score};
  }
  return winner;
}
/** @param {number[][]} bodies @param {object} setting @param {number[]} bytes */
function scramble(bodies,setting,bytes){
  const stream=serialization(bytes,setting.geometry,setting.reverse);
  return bodies.map(a=>{
    const p=sectionPermutation(a.length,stream,setting.phase);
    if(!setting.inverse)return Array.from(p,k=>a[k]);
    const out=new Array(a.length);
    for(let i=0;i<a.length;i++)out[p[i]]=a[i];
    return out;
  });
}
/** @param {number[][]} groups @param {number[][]} ratios */
function bare(groups,ratios){
  return {train:groups.slice(0,4).reduce((s,x)=>s+orderScore(x,ratios),0),
    heldout:groups.slice(4).reduce((s,x)=>s+orderScore(x,ratios),0)};
}
function plant(bodies,model,bytes){
  const count=bodies.reduce((s,a)=>s+a.length,0);
  assert(model.heldout.length>count);
  let at=0;
  const english=bodies.map(g=>{
    const a=model.heldout.slice(at,at+g.length);at+=g.length;return a;
  });
  const key={geometry:"row",reverse:false,phase:0,inverse:false};
  const scrambled=scramble(english,key,bytes);
  const solution=search(scrambled,bytes,model.ratios);
  const expected=evaluate(scrambled,bytes,key,model.ratios);
  const stream=serialization(bytes,key.geometry,key.reverse);
  let same=0;
  for(let g=0;g<english.length;g++){
    const reconstructed=restored(scrambled[g],
      sectionPermutation(english[g].length,stream,0),false);
    for(let i=0;i<english[g].length;i++)
      same+=Number(reconstructed[i]===english[g][i]);
  }
  assert.equal(same,count);
  return {trueMode:key,originalSourceScore:bare(english,model.ratios),
    scrambledScore:bare(scrambled,model.ratios),expected,
    trainingSearchWinner:solution,exactRecoveredWordLengths:same,
    sourceWordLengths:count};
}
/** @param {number[][]} bodies @param {number[][]} ratios @param {object} real */
function nulls(bodies,ratios,real){
  const next=generator(0x2563301,"xorshift");
  const out=[];
  for(let t=0;t<36;t++){
    const perm=fisherYates(256,next);
    const shuffled=Array.from(perm,i=>original[i]);
    out.push(search(bodies,shuffled,ratios));
  }
  const trainHigher=out.filter(x=>x.train>=real.train).length;
  const holdHigher=out.filter(x=>x.heldout>=real.heldout).length;
  return {sourceTablePermutations:out.length,
    trainExceed:trainHigher,trainAddOneUpper:(trainHigher+1)/(out.length+1),
    heldoutExceed:holdHigher,
    heldoutAddOneUpper:(holdHigher+1)/(out.length+1),
    trainExtrema:[Math.min(...out.map(x=>x.train)),Math.max(...out.map(x=>x.train))],
    heldoutExtrema:[Math.min(...out.map(x=>x.heldout)),Math.max(...out.map(x=>x.heldout))]};
}
function main(){
  const bodies=manuscriptBodies();
  assert.deepEqual(bodies.map(x=>x.length),[156,252,381,432,220,346,353,733]);
  const model=languageModel(),baseline=bare(bodies,model.ratios);
  const real=search(bodies,original,model.ratios);
  const planted=plant(bodies,model,original);
  const randomKeyControl=nulls(bodies,model.ratios,real);
  console.log(JSON.stringify({source:"resources/liber-primus/lp2-grid-256.json",
    sourceGeometry:"printed 32 rows by 8 columns, literal byte values",
    permutation:"sort each consecutive up-to-256-word block by source byte value, stable ties",
    framings:"row/column source; reverse source; 256 source phases; forward/inverse word permutation; reset at eight red-heading-excluded section bodies",
    tested:SETTINGS.length,sourceRunes:12956,
    wordCount:bodies.reduce((s,a)=>s+a.length,0),
    split:"first four original section bodies train, remaining four holdout",
    scoring:"independent 80%-Shakespeare GP word-length Markov log odds, five word-length bins",
    originalBaseline:baseline,originalBestByTraining:real,
    originalHeldoutDeltaFromBaseline:real.heldout-baseline.heldout,
    planted,randomKeyControl,
    caveat:"A table-selected heldout word-order gain must be independently credible and recover rune plaintext to constitute decryption."
  },null,2));
}
if(require.main===module)main();
module.exports={serialization,stableSort,sectionPermutation,evaluate,search,scramble,plant,main};
