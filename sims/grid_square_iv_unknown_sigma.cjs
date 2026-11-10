"use strict";
/**
 * Actual LP2 longest-section inversion using independently grounded
 * Fibonacci-prime 4x4 square as exact 16-byte IV and eight 256-bit
 * base60-table columns as AES/ChaCha keys; unrestricted outer
 * 29-rune alphabet plus collision-triggered hidden key skips.
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

const LENGTHS=[729,1145,1729,1903,1021,1524,1589,3316];
const SECTION=7,OFFSET=LENGTHS.slice(0,SECTION).reduce((a,b)=>a+b,0);
const LENGTH=2400,mod=n=>(n%29+29)%29;
const IVS={
 rowNumber:"ba9650decee3e216d8dee0a8a4b6c41c",
 rowPrime:"2b4f9507170203cf0d07053dbf2f21c9",
 spiralNumber:"e3e2e0ded8ceba9650de16a81cc4b6a4",
 spiralPrime:"020305070d172b4f9507cf3dc9212fbf"
};

/** @param {number[][]} columns */
function candidateKeys(columns){
 const out=[];
 for(const [ivName,hex] of Object.entries(IVS)){
  const iv=Buffer.from(hex,"hex");
  assert.equal(iv.length,16);
  for(let column=0;column<8;column++)
   for(const algorithm of ["aes-256-ctr","chacha20"])
    for(const reversed of [false,true]){
     const k=reversed?columns[column].slice().reverse():columns[column];
     const pad=cipherBytes(k,algorithm,LENGTH+190,iv);
     for(const scaled of [false,true])
      for(const sign of [-1,1]){
       const key=[...pad].map(b=>mod(sign*(scaled?Math.floor(29*b/256):b%29)));
       out.push({ivName,column,algorithm,reversed,scaled,sign,key});
      }
    }
 }
 assert.equal(out.length,512);
 return out;
}

function main(){
 const options=candidateKeys(inputs().columnKeys);
 const source=fs.readFileSync(path.join(__dirname,"..","resources",
  "control","shakespeare_first300k.txt"),"utf8");
 const corpus=words(source),model=training(flatten(corpus.slice(4200,50000)));
 const original=flatten(corpus.slice(0,1000));
 assert(original.values.length>=LENGTH);
 const actualSource=original.values.slice(0,LENGTH),
  context=original.classes.slice(0,LENGTH);
 const actual=lp2();
 assert.equal(actual.values.length,12956);
 const c=actual.values.slice(OFFSET,OFFSET+LENGTH),ctx=actual.classes.slice(OFFSET,OFFSET+LENGTH);
 const plantOptions=options.filter(x=>x.column===0&&
   x.algorithm==="aes-256-ctr"&&!x.reversed&&!x.scaled&&x.sign===1);
 assert.equal(plantOptions.length,4);
 const plants=[];
 for(let j=0;j<plantOptions.length;j++){
  const rng=seededRandom(0x253300+j*101);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rng);
  const encrypted=encrypt(actualSource,plantOptions[j].key,sigma,rng,.81);
  const decoded=search(encrypted.ciphertext,plantOptions[j].key,context,model);
  plants.push({ivName:plantOptions[j].ivName,
   extraDraws:encrypted.extraDraws,score:decoded.score/LENGTH,
   inferredDrift:decoded.drift,matchedDrift:decoded.drift===encrypted.extraDraws});
 }
 console.log("PLANT",JSON.stringify({runes:LENGTH,results:plants}));
 const scores=options.map(({key,...params})=>{
  const fit=search(c,key,ctx,model);
  return {...params,score:fit.score/LENGTH,drift:fit.drift,
   init:fit.width,firstSkip:fit.skipHypothesis};
 }).sort((a,b)=>b.score-a.score);
 console.log("REAL",JSON.stringify({runes:LENGTH,candidateKeys:scores.length,
  section:SECTION,top:scores.slice(0,12),worst:scores.at(-1),
  byIV:Object.keys(IVS).map(name=>({iv:name,
   best:scores.find(x=>x.ivName===name).score})),
  note:"No genuine plaintext without a clearly English-like full-window score and stable independent validation"}));
}
if(require.main===module)main();
module.exports={IVS,candidateKeys,main};
