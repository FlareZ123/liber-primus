"use strict";
/**
 * Test word-order Josephus inverses with manuscript-derived step constants.
 * These reorder WHOLE canonical LP2 words, never page fragments or runes.
 * A heldout Shakespeare source supplies a planted correct-Josephus recovery.
 * This is an exploratory search for a layout/key mechanism, not a decryption.
 * @module prime_josephus_word_order
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname,"..");
const RUNES = new Set([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"]);
const STEPS = [5,23,29,53,91,256,809,1033,3299,3301];
const SEED = 0x13093301;
const TRIALS = Number(process.argv[2] || "1500");

/** @param {string} word @returns {number} Approximated GP rune count. */
function gpLength(word) {
  return Math.min(9,word.toUpperCase().replace(/ING|TH|EO|OE|AE|IA|EA|NG/g,"#").length);
}
/** @param {string} content @returns {Float64Array} */
function englishModel(content) {
  const cells = new Uint32Array(81).fill(1);
  const left = new Uint32Array(9).fill(9);
  const right = new Uint32Array(9).fill(9);
  let total=81;
  for(const clause of content.slice(0,180000).split(/[.!?;:]+/)){
    const words=(clause.match(/[A-Za-z]+/g)||[]).map(gpLength);
    for(let i=1;i<words.length;i++){
      const a=words[i-1]-1,b=words[i]-1;
      cells[9*a+b]++;left[a]++;right[b]++;total++;
    }
  }
  return Float64Array.from(cells,(v,k)=>
    Math.log(v*total/(left[Math.floor(k/9)]*right[k%9])));
}
/** @param {number} size @param {number} step @returns {number[]} */
function josephus(size,step) {
  const pool=Array.from({length:size},(_,i)=>i),result=[];
  let cursor=0;
  while(pool.length){
    cursor=(cursor+step-1)%pool.length;
    result.push(pool.splice(cursor,1)[0]);
  }
  return result;
}
/**
 * The indices specify the restored reading order from ciphertext positions.
 * @param {number[]} sizes @param {number} step
 * @param {"forward"|"inverse"} orientation
 * @returns {Uint16Array}
 */
function wordIndices(sizes,step,orientation){
  let offset=0;
  const indices=[];
  for(const size of sizes){
    let perm=josephus(size,step);
    if(orientation==="inverse"){
      const inverse=Array(size);
      perm.forEach((source,i)=>{inverse[source]=i;});
      perm=inverse;
    }
    for(const p of perm) indices.push(offset+p);
    offset+=size;
  }
  return Uint16Array.from(indices);
}
/**
 * @param {Uint8Array} lengths @param {Uint16Array} indices
 * @param {Float64Array} model @returns {number}
 */
function score(lengths,indices,model){
  let sum=0,previous=lengths[indices[0]]-1;
  for(let i=1;i<indices.length;i++){
    const current=lengths[indices[i]]-1;
    sum+=model[previous*9+current];
    previous=current;
  }
  return sum/(indices.length-1);
}
/** @param {number[]} values @returns {{mean:number,sd:number,p05:number,p50:number,p95:number}} */
function stats(values){
  const sorted=values.slice().sort((a,b)=>a-b);
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const sd=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/values.length);
  return {mean,sd,p05:sorted[Math.floor(.05*(sorted.length-1))],
    p50:sorted[Math.floor(.5*(sorted.length-1))],
    p95:sorted[Math.floor(.95*(sorted.length-1))]};
}
function main(){
  const raw=fs.readFileSync(path.join(ROOT,"resources","lp2-transcription.txt"),"utf8");
  const english=fs.readFileSync(path.join(ROOT,"resources","control","shakespeare_first300k.txt"),"utf8");
  const corpus=parseSharedCorpus();
  const words=corpus.words;
  assert.equal(words.length,2896);
  assert.equal(corpus.runeCount,12956);
  assert.equal(corpus.crossPageWords,32);
  const pages=corpus.byStartPage.map(arr=>arr.length);
  assert.equal(pages.length,55);
  const joined=raw.split("%").slice(0,55).join("%");
  const sections=joined.split("$").map(part=>
    part.replace(/[\/\s%]/g,"").split(/[-.&§]/g)
      .filter(word=>word.length>0&&[...word].every(c=>RUNES.has(c))).length).filter(Boolean);
  assert.deepEqual(sections,[158,255,385,435,224,326,378,735]);
  const model=englishModel(english);
  const lengths=Uint8Array.from(words,w=>Math.min(9,w.length));
  const identity=Uint16Array.from(lengths,(_,i)=>i);
  const original=score(lengths,identity,model);
  const configurations=[];
  for(const [group,sizes] of [["page",pages],["section",sections],["global",[lengths.length]]]){
    for(const step of STEPS)for(const orientation of ["forward","inverse"]){
      configurations.push({group,step,orientation,indices:wordIndices(sizes,step,orientation)});
    }
  }
  const ranked=configurations.map((cfg,id)=>({id,group:cfg.group,step:cfg.step,
    orientation:cfg.orientation,score:score(lengths,cfg.indices,model)}))
    .sort((a,b)=>b.score-a.score);
  const chosen=configurations.findIndex(c=>c.group==="page"&&c.step===809&&c.orientation==="forward");
  const observedFixed=score(lengths,configurations[chosen].indices,model);
  let state=SEED>>>0;
  const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
  const nullMax=[],nullFixed=[];
  for(let b=0;b<TRIALS;b++){
    const copy=lengths.slice();
    let offset=0;
    // Preserve the complete 55-page word-length inventory in every null.
    for(const n of pages){
      for(let i=n-1;i>0;i--){
        const j=next()%(i+1),swap=copy[offset+i];
        copy[offset+i]=copy[offset+j];copy[offset+j]=swap;
      }
      offset+=n;
    }
    let maximum=-Infinity;
    for(let k=0;k<configurations.length;k++){
      const value=score(copy,configurations[k].indices,model);
      if(value>maximum)maximum=value;
      if(k===chosen)nullFixed.push(value);
    }
    nullMax.push(maximum);
  }
  const trueTop=ranked[0].score;
  const familyExceed=nullMax.filter(v=>v>=trueTop).length;
  const fixedExceed=nullFixed.filter(v=>v>=observedFixed).length;
  // Positive control: hide a real heldout English sequence under the exact
  // page-reset Josephus-809 forward permutation; invert every candidate.
  const heldoutWords=(english.slice(220000).match(/[A-Za-z]+/g)||[]).map(gpLength);
  assert.ok(heldoutWords.length>=lengths.length);
  const plain=Uint8Array.from(heldoutWords.slice(0,lengths.length));
  const encrypt=wordIndices(pages,809,"forward");
  const planted=Uint8Array.from(encrypt,i=>plain[i]);
  const plantScores=configurations.map(cfg=>score(planted,cfg.indices,model));
  const decoder=configurations.findIndex(c=>c.group==="page"&&c.step===809&&c.orientation==="inverse");
  assert.equal(score(planted,configurations[decoder].indices,model),score(plain,identity,model));
  const decoderRank=1+plantScores.filter(x=>x>plantScores[decoder]).length;
  assert.equal(decoderRank,1);
  return {
    sourceSHA256:createHash("sha256").update(joined).digest("hex"),
    englishSHA256:createHash("sha256").update(english).digest("hex"),
    corpus:{runes:corpus.runeCount,words:words.length,crossPageWords:corpus.crossPageWords,
      runePages:pages.length,sections},
    candidates:configurations.length, steps:STEPS,
    originalScore:original,
    actualTop:ranked.slice(0,10),
    familywise:{trials:TRIALS,seed:"0x"+SEED.toString(16),
      exceeds:familyExceed,upperTailP:(familyExceed+1)/(TRIALS+1),nullMax:stats(nullMax)},
    fixedSourceClue809:{observed:observedFixed,exceeds:fixedExceed,
      upperTailP:(fixedExceed+1)/(TRIALS+1),null:stats(nullFixed)},
    planted:{source:"heldout Shakespeare source words",encryptedWith:"page-reset Josephus 809 forward",
      correctInverseRank:decoderRank,plaintextScore:score(plain,identity,model),
      encryptedScore:score(planted,identity,model),recoveredScore:plantScores[decoder]},
    interpretation:"Finite source-number Josephus word-order family; no LP2 transposition key or rune plaintext recovered"
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+"\n");
module.exports={gpLength,englishModel,josephus,wordIndices,score,main};
