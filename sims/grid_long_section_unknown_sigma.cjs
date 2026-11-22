"use strict";
/**
 * LP2 longest section inversion under eight source-derived 32-byte column
 * keys, section-specific unknown outer permutation and hidden repeated-glyph
 * key skips. Reuse the independently developed 29! alphabet Hungarian solver
 * and early-one-skip Viterbi search rather than inventing a cipher breaker.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs,cipherBytes}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {search}=require("./outer_permutation_real_skip_scan.cjs");

const LEN=2400;
const GROUPS=[729,1145,1729,1903,1021,1524,1589,3316];
const OFFSET=GROUPS.slice(0,-1).reduce((a,b)=>a+b,0);
const MODE=["aes-256-ctr","chacha20"];
const mod=n=>(n%29+29)%29;

/** @param {number[][]} columns */
function options(columns){
 const output=[];
 for(let column=0;column<8;column++)
  for(const algorithm of MODE)
   for(const reverse of [false,true]){
    const pad=cipherBytes(reverse?columns[column].slice().reverse():columns[column],
      algorithm,LEN+120);
    for(const scaled of [false,true])
      for(const sign of [-1,1]){
       const key=[...pad].map(b=>mod(sign*(scaled?Math.floor(b*29/256):b%29)));
       output.push({column,algorithm,reverse,scaled,sign,key});
      }
   }
 assert.equal(output.length,128);
 return output;
}

function main(){
 const corpus=lp2();
 assert.equal(corpus.values.length,12956);
 const cipher=corpus.values.slice(OFFSET,OFFSET+LEN);
 const ctx=corpus.classes.slice(OFFSET,OFFSET+LEN);
 assert.equal(cipher.length,LEN);
 const src=fs.readFileSync(path.join(__dirname,"..","resources",
   "control","shakespeare_first300k.txt"),"utf8");
 const ww=words(src),model=training(flatten(ww.slice(4200,50000)));
 const english=flatten(ww.slice(0,1000));
 assert(english.values.length>=LEN);
 const original=english.values.slice(0,LEN),
   origCtx=english.classes.slice(0,LEN);
 const columns=inputs().columnKeys;
 const opts=options(columns);
 const trueOption=opts.find(x=>x.column===0&&x.algorithm==="aes-256-ctr"&&
   !x.reverse&&!x.scaled&&x.sign===1);
 assert(trueOption);
 const plants=[];
 for(let i=0;i<12;i++){
  const rng=seededRandom(0x250000+i*317);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rng);
  const planted=encrypt(original,trueOption.key,sigma,rng,.81);
  const plantedFit=search(planted.ciphertext,trueOption.key,origCtx,model);
  plants.push({seed:i,skips:planted.extraDraws,score:plantedFit.score/LEN,
    finalDrift:plantedFit.drift,width:plantedFit.width,
    signal:plantedFit.score/LEN>-3.6});
 }
 console.log("PLANT",JSON.stringify({
  n:plants.length,signals:plants.filter(x=>x.signal).length,
  details:plants
 }));
 const scores=opts.map(x=>({...x,key:undefined,
   ...search(cipher,x.key,ctx,model)})).map(x=>({
    column:x.column,algorithm:x.algorithm,reverse:x.reverse,
    scaled:x.scaled,sign:x.sign,score:x.score/LEN,
    width:x.width,drift:x.drift,skipHypothesis:x.skipHypothesis
 })).sort((a,b)=>b.score-a.score);
 console.log("REAL",JSON.stringify({length:LEN,section:7,offset:OFFSET,
   candidates:scores.length,top:scores.slice(0,10),worst:scores.at(-1).score
 }));
}
if(require.main===module)main();
module.exports={options,main};
