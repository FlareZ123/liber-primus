"use strict";

/**
 * Source-frozen p57 clear-Parable GP29 running-key collision-skip inverse
 * on the original p55 75-rune complete-word body (exclude carried first rune).
 * No key phase/direction/word-reset optimization.
 * Node22 CommonJS, read-only:
 * node sims/lp2_p57_parable95_p55body75_keyskip_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {train}=require("./grid_keyskip_viterbi.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const clear=corpus.pages.find(p=>p.page===57).indices;
const unknown=corpus.pages.find(p=>p.page===55).indices;
assert.equal(clear.length,95);
assert.equal(unknown.length,76);
const text=unknown.slice(1); // p55 rune0 completes the previous page's word
assert.equal(text.length,75);
const LIMIT=34,MOD=29;
const sourceLength=clear.length;
const ringkey=Array.from({length:text.length+LIMIT+1},(_,i)=>clear[i%sourceLength]);
const mod=x=>(x%MOD+MOD)%MOD;
const model=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
/** @param {number} seed @returns {()=>number} */
function xorshift(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
/** @param {number[]} p @param {number[]} key @param {1|-1} sign @param {()=>number} rng */
function plant(p,key,sign,rng){
  let previous=-1,offset=0,skips=0;
  const cipher=[];
  for(const value of p){
    let out=mod(value+sign*key[offset]);
    if(out===previous && rng()/4294967296<.81){
      offset++;
      out=mod(value+sign*key[offset]);
      skips++;
    }
    cipher.push(out);previous=out;offset++;
  }
  return {cipher,skips,consumed:offset};
}
/** @param {number[]} vals @returns {number} */
function ioc(vals){
  const counts=Array(29).fill(0);
  vals.forEach(x=>counts[x]++);
  return counts.reduce((sum,x)=>sum+x*(x-1),0)/(vals.length*(vals.length-1));
}
/** @param {number[]} x @returns {string} */
function translit(x){return x.map(i=>corpus.translit[i]).join("");}

const plantedPlain=clear.slice(20,95);
assert.equal(plantedPlain.length,75);
const prepared=plant(plantedPlain,ringkey,1,xorshift(0x33015755));
const found=viterbi(prepared.cipher,ringkey,1,model);
const recovered=found.plaintext.filter((v,i)=>v===plantedPlain[i]).length;
assert.ok(recovered>=70, "planted source-native decryption insufficient");
assert.equal(found.skips,prepared.skips);
const outputs=[-1,1].map(sign=>{
  const out=viterbi(text,ringkey,sign,model);
  return {sign,score:out.perRune,skips:out.skips,
    keyConsumed:text.length+out.skips,
    ioc:ioc(out.plaintext),preview:translit(out.plaintext)};
}).sort((a,b)=>b.score-a.score);

const rng=xorshift(0x50205755),REPLICATES=256;
/** @param {number} n @returns {number} */
function randomIndex(n){
  const cutoff=Math.floor(4294967296/n)*n;
  let v;do{v=rng()}while(v>=cutoff);return v%n;
}
const controls=[];
for(let trial=0;trial<REPLICATES;trial++){
  const shuffled=clear.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=randomIndex(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  const pad=Array.from({length:ringkey.length},(_,i)=>shuffled[i%sourceLength]);
  controls.push(Math.max(...[-1,1].map(sign=>viterbi(text,pad,sign,model).perRune)));
}
controls.sort((a,b)=>a-b);
const exceed=controls.filter(score=>score>=outputs[0].score).length;
console.log(JSON.stringify({
  classification:"Exact original p57 text95 as natural p55 body75 collision-keyskip key: conditional",
  source:{
    key:"solved original p57 PARABLE entire 95 runes",
    receiver:"physical p55 original 75-rune body, excluding one carried p54 rune",
    sourceRemainder:sourceLength-text.length,
    noKeySourcePhases:true,
    keyRepeatOnlyForViterbiTailBuffer:true
  },
  cipher:{
    formula:"C = P + sign * K mod 29",
    oneConditionalSkip:"tentative C equals previous ciphertext rune",
    totalSkipCap:34,skipPenalty:3.5,signs:[-1,1]
  },
  planted:{
    textSource:"solved p57 runes20..94",
    expectedPlain:plantedPlain.length,
    matched:recovered,
    actualSkips:prepared.skips,
    recoveredSkips:found.skips,
    score:found.perRune,
    nativeIoc:ioc(plantedPlain)
  },
  original:{
    sourceCipherIoc:ioc(text),
    decoded:outputs
  },
  null:{
    trials:REPLICATES,seed:"0x50205755",
    greaterOrEqual:exceed,upperTail:(exceed+1)/(REPLICATES+1),
    min:controls[0],median:controls[Math.floor(REPLICATES/2)],
    max:controls[controls.length-1]
  }
},null,2));
