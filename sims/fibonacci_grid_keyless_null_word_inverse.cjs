'use strict';
/**
 * Exact hypothesized inverse with one keyless, deletable ciphertext rune in
 * a portion of words. The cipher key is AES128-CTR from p15 Fibonacci selectors
 * into the p49-51 256-byte table. Hidden insertion positions and the drifted
 * stream clock are inferred jointly by dynamic programming.
 *
 * The source gives the key candidates; a fixed null-insertion prior is an
 * unverified architecture, not a discovery. All evidence is tested against
 * original ciphertext and a heldout source-native known-key plant.
 * Run: node sims/fibonacci_grid_keyless_null_word_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {sourceIVs}=require('./fibonacci_indexed_grid_iv.cjs');
const {encode,train}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeId=new Map(GP.runes.map((v,i)=>[v,i]));
const words=read('resources/lp2-transcription.txt').split('%').slice(0,55)
 .join('%').split(/[-.&$§]/u).map(s=>[...s].filter(c=>runeId.has(c))
 .map(c=>runeId.get(c))).filter(w=>w.length);
const N=12956;
assert.equal(words.length,2896);
assert.equal(words.flat().length,N);
assert.deepEqual(words.flat(),GP.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const keys=sourceIVs();
assert.equal(keys.length,8);
const TRAIN=350,HELD=400,USED=TRAIN+HELD,INSERT_P=.42,NUM_NULLS=12;
const widths=words.map(w=>w.length);
const upTo=widths.slice(0,USED).reduce((a,b)=>a+b,0);
const log1=Math.log(1-INSERT_P),logp=Math.log(INSERT_P);
const model=train(read('resources/control/shakespeare_first300k.txt').slice(0,215000));
const {unigram:U,bigram:B,trigram:T}=model;
const M=29,mod=x=>(x%M+M)%M;

/** @param {Uint8Array} key @returns {Buffer} */
function aesPad(key){
 const engine=crypto.createCipheriv('aes-128-ctr',key,Buffer.alloc(16));
 return Buffer.concat([engine.update(Buffer.alloc(N)),engine.final()]);
}
/** @param {Buffer} bytes @param {number} sign @param {boolean} scaled */
function makeMode(bytes,sign,scaled){
 return {pad:scaled?Uint8Array.from(bytes,b=>Math.floor(29*b/256)):
 Uint8Array.from(bytes,b=>b%29),sign,scaled};
}
/**
 * Add GP unigram, within-word bigram and trigram word-likelihoods. The hidden
 * null location is discarded and consumes NO key byte.
 * @param {number[]} word @param {number} pointer
 * @param {number} skip -1: no null, otherwise skip ciphertext index
 * @param {{pad:Uint8Array,sign:number}} mode
 */
function emission(word,pointer,skip,mode){
 let a=-1,b=-1,used=0,score=0;
 for(let j=0;j<word.length;j++){
   if(j===skip)continue;
   const p=mod(word[j]+mode.sign*mode.pad[pointer+used]);
   if(used===0)score+=U[p];
   else if(used===1)score+=B[a*M+p];
   else score+=T[(b*M+a)*M+p];
   b=a;a=p;used++;
 }
 return score;
}
/** Expected inserted-word count and a conservative four-SD source-prior lane. */
function bands(start=0){
 const out=[{low:0,high:0}],prior=INSERT_P;
 let mean=0,v=0;
 for(let w=0;w<USED;w++){
   if(widths[w]>1){mean+=prior;v+=prior*(1-prior);}
   const rad=4*Math.sqrt(v+1)+3;
   out.push({low:Math.max(0,Math.floor(mean-rad)),
     high:Math.min(w+1,Math.ceil(mean+rad))});
 }
 return out;
}
const BAND=bands();
const PREFIX=[0];for(const n of widths.slice(0,USED))PREFIX.push(PREFIX.at(-1)+n);
assert.equal(PREFIX[USED],upTo);
/**
 * Viterbi over the cumulative count of keyless extra runes. First 350 words
 * select a source-fixed key. The top train path fixes the heldout initial clock.
 * @param {number[][]} cipherWords
 * @param {{pad:Uint8Array,sign:number}} mode
 * @param {number} beginWord
 * @param {number} endWord
 * @param {Map<number,number>} initial
 */
function viterbi(cipherWords,mode,beginWord,endWord,initial){
 let state=initial;
 for(let w=beginWord;w<endWord;w++){
   const src=cipherWords[w],candidate=new Map();
   const bound=BAND[w+1],pointerBase=PREFIX[w];
   const accept=(i,s)=>{
     if(i<bound.low||i>bound.high)return;
     if(s>(candidate.get(i)??-Infinity))candidate.set(i,s);
   };
   for(const [count,oldScore] of state){
     const pointer=pointerBase-count;
     assert.ok(pointer>=0&&pointer+src.length<=mode.pad.length);
     accept(count,oldScore+log1+emission(src,pointer,-1,mode));
     if(src.length>1){
       let best=-Infinity;
       for(let j=0;j<src.length;j++)best=Math.max(best,emission(src,pointer,j,mode));
       accept(count+1,oldScore+logp-Math.log(src.length)+best);
     }
   }
   assert.ok(candidate.size>0,'No null-insertion path at '+w);
   state=candidate;
 }
 return state;
}
function bestState(states){
 let best={inserted:-1,score:-Infinity};
 for(const [inserted,score] of states)
  if(score>best.score)best={inserted,score};
 return best;
}
/** @param {number[][]} cipherWords @param {Uint8Array[]} sourceKeys */
function rank(cipherWords,sourceKeys){
 const matches=[];
 for(let ki=0;ki<sourceKeys.length;ki++){
   const key=sourceKeys[ki],bytePad=aesPad(key);
   for(const sign of [-1,1])for(const scaled of [false,true]){
     const mode=makeMode(bytePad,sign,scaled);
     const training=bestState(viterbi(cipherWords,mode,0,TRAIN,new Map([[0,0]])));
     matches.push({ki,sign,scaled,training:training.score,
       trainingInsertions:training.inserted,mode});
   }
 }
 matches.sort((a,b)=>b.training-a.training);
 for(const selected of matches.slice(0,4)){
   const seed=new Map([[selected.trainingInsertions,0]]);
   const held=bestState(viterbi(cipherWords,selected.mode,TRAIN,USED,seed));
   selected.held=held.score;
   selected.heldInsertions=held.inserted-selected.trainingInsertions;
 }
 return matches;
}
function xorshift(seed){
 let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
/** Synthetic control on the exact first 750 original cipher-word lengths. */
function planted(){
 const rng=xorshift(0x33011547);
 const pools=new Map();
 for(const w of (read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/gu)||[])){
   const plain=encode(w);
   if(!pools.has(plain.length))pools.set(plain.length,[]);
   pools.get(plain.length).push(plain);
 }
 // Even very long ciphertext words must be supportable in the independent control.
 for(const w of (read('resources/control/shakespeare_first300k.txt').slice(215000).match(/[A-Za-z]+/gu)||[])){
   const plain=encode(w);
   if(!pools.has(plain.length))pools.set(plain.length,[]);
   pools.get(plain.length).push(plain);
 }
 const key=keys[3].iv,sign=-1,scaled=false;
 const mode=makeMode(aesPad(key),sign,scaled),synthetic=[],original=[];
 let cursor=0,allInsertions=0;
 for(let wi=0;wi<USED;wi++){
   const length=widths[wi],doInsert=length>1&&rng()%1000<420;
   const plainLen=length-Number(doInsert),pool=pools.get(plainLen);
   assert.ok(pool&&pool.length>0,'Missing control word length '+plainLen);
   const chosen=pool[rng()%pool.length],cipher=[];
   const at=doInsert?rng()%length:-1;
   for(let i=0,j=0;i<length;i++){
     if(i===at)cipher.push(rng()%M);
     else{
       const p=chosen[j++];
       const c=mod(p-sign*mode.pad[cursor++]);
       cipher.push(c);
     }
   }
   assert.equal(cipher.length,length);
   const pointer=cursor-chosen.length,decoded=[];
   for(let j=0,k=0;j<length;j++){
     if(j===at)continue;
     decoded.push(mod(cipher[j]+sign*mode.pad[pointer+k++]));
   }
   assert.deepEqual(decoded,chosen);
   allInsertions+=Number(doInsert);
   synthetic.push(cipher);original.push({word:chosen,nullPosition:at});
 }
 const tested=rank(synthetic,keys.map(k=>k.iv));
 const top=tested[0];
 const truthRank=tested.findIndex(a=>a.ki===3&&a.sign===sign&&a.scaled===scaled)+1;
 assert.equal(truthRank,1,'Planted exact source key must win');
 const controlHeld=top.held;
 assert.ok(Number.isFinite(controlHeld));
 return {tested,diagnostic:{seed:'0x33011547',words:USED,
   exactOraclePlaintextRunes:cursor,insertedNullRunes:allInsertions,
   trueSourceKeyRank:truthRank,sourceKey:keys[3].name,
   trainLogPerCipherRune:top.training/PREFIX[TRAIN],
   frozenHoldoutLogPerCipherRune:controlHeld/(PREFIX[USED]-PREFIX[TRAIN]),
   trueTrainingDrift:original.slice(0,TRAIN).filter(x=>x.nullPosition>=0).length,
   recoveredTrainingDrift:top.trainingInsertions}};
}
/** Exposed candidate summary, source-key names only (no fitted key bytes). */
function compact(row){return {sourceKey:keys[row.ki]?.name??('random-'+row.ki),
 sign:row.sign,scaled:row.scaled,
 trainLogPerCipherRune:row.training/PREFIX[TRAIN],
 trainInserts:row.trainingInsertions,
 heldLogPerCipherRune:Number.isFinite(row.held)?
 row.held/(PREFIX[USED]-PREFIX[TRAIN]):null,
 heldInserts:row.heldInsertions??null};}
function main(){
 const plant=planted(),original=rank(words,keys.map(k=>k.iv));
 const rng=xorshift(0x20143301),nulls=[];
 for(let t=0;t<NUM_NULLS;t++){
   const replacement=Array.from({length:keys.length},()=>
     Uint8Array.from({length:16},()=>rng()%256));
   const ranks=rank(words,replacement);
   nulls.push(compact(ranks[0]));
 }
 const winner=compact(original[0]),scores=nulls.map(x=>x.heldLogPerCipherRune);
 const exceeds=scores.filter(x=>x>=winner.heldLogPerCipherRune).length;
 const out={classification:'Source-locked AES128 key and hidden mid-word null-drift inverse, not authentic decryption',
   source:{originalRunes:N,cipherWords:words.length,trainWords:TRAIN,holdWords:HELD,
    matchedOriginalRunes:upTo,sourceSelectors:8,models:32,insertionPrior:INSERT_P,
    maxNullsPerWord:1,keyConsumption:'only emitted plaintext, null insertion keyless'},
   planted:plant.diagnostic,
   original:{winner,topFour:original.slice(0,4).map(compact)},
   wrongSource:{replicates:NUM_NULLS,reselectModelsEach:32,
    nullHeldScores:scores,atLeastOriginal:exceeds,
    addOneHeldoutUpperTail:(exceeds+1)/(NUM_NULLS+1)},
   result:'True original AES key would need a materially higher frozen GP word-language likelihood than independently randomly selected keys, and a reliable genuine plaintext preview'};
 console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
module.exports={viterbi,rank,planted,main};
