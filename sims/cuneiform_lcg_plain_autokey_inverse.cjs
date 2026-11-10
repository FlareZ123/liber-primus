"use strict";
/**
 * Source-constrained original LP2 inverse with hidden plaintext-driven
 * LCG state and original 256-byte base60 table. The repeated Babylonian
 * numeral inscription 1033/3301 supplies the generator constants.
 *
 * Candidate relation for non-marker plaintext P in GP indices 0..27:
 *   C_i = C_(i-1) + 1 + (P_i + sign * K[S_i] mod 28) mod 29
 * A plaintext EA index28 produces a repeated ciphertext glyph.
 *   S_(i+1) = (1033 S_i + 3301 + feedback(P_i,C_i,delta_i)) mod256.
 * The original pages' first runes are transported as literal IVs only at
 * explicit resets. All candidates have exact encryption and decryption.
 *
 * This SFT tests 16,384 parameter combinations on original ciphertext,
 * source-separated GP-English positive controls and a page-heldout test.
 * It does not imply that the candidate was Cicada's historical cipher.
 *
 * node sims/cuneiform_lcg_plain_autokey_inverse.cjs
 * Node 22 builtins, deterministic, no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const GRID=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const BYTES=GRID.byte_rows.flat();
assert.equal(BYTES.length,256);
const pages=GP.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
const N=pages.reduce((a,p)=>a+p.indices.length,0);
assert.equal(N,12956);
const nTrain=pages.filter(p=>p.page<28).reduce((a,p)=>a+p.indices.length,0);
assert.equal(nTrain,6761);
const vocab=GP.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpText(input){
 const result=[];
 for(let w of input.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
   .replace(/Z/g,"S").replace(/ING/g,"NG");
  const candidate=[];
  for(let i=0;i<w.length;){
    const hit=vocab.find(q=>w.startsWith(q.s,i));
    if(!hit){candidate.length=0;break;}
    candidate.push(hit.i);i+=hit.s.length;
  }
  result.push(...candidate);
 }
 return result;
}
const source=gpText(read("resources/control/shakespeare_first300k.txt"));
assert.ok(source.length>=170000);
const count=Array(28).fill(1);
for(const q of source.slice(0,100000))if(q<28)count[q]++;
const sum=count.reduce((a,b)=>a+b,0);
const logp=count.map(v=>Math.log(v/sum*28));
/** Original-marker preserving, separate-position GP-English positive source. */
function makePlain(){
 let pointer=150000;
 return pages.map(page=>{
  const indices=[];
  for(let i=0;i<page.indices.length;i++){
   if(i===0){indices.push(page.indices[0]);continue;}
   if(page.indices[i]===page.indices[i-1]){indices.push(28);continue;}
   while(source[pointer]===28)pointer++;
   indices.push(source[pointer++]);
  }
  return{page:page.page,indices};
 });
}
const sourcePlant=makePlain();
function key(s,map){
 const b=BYTES[s];
 return map===0?b%28:map===1?(b*28)>>8:
  map===2?(b%60)%28:(b^(b>>>4))%28;
}
function next(s,p,c,delta,f){
 const add=f===0?p:f===1?GP.prime[p]:f===2?(p^c):delta;
 return (1033*s+3301+add)&255;
}
/** @typedef {{f:number,map:number,sign:number,reset:boolean,seed:number}} Config */
/** @param {{page:number,indices:number[]}[]} input @param {Config} config
 * @returns {{page:number,indices:number[]}[]}
 */
function encrypt(input,config){
 const {f,map,sign,reset,seed}=config;
 const result=[];
 let s=seed,previous=-1;
 for(const page of input){
  if(reset){s=seed;previous=-1;}
  const indices=[];
  for(const p of page.indices){
   const c=previous<0?p:p===28?previous:
    (previous+1+(p+sign*key(s,map)+28)%28)%29;
   const d=previous<0?0:(c-previous+29)%29;
   indices.push(c);
   s=next(s,p,c,d,f);
   previous=c;
  }
  result.push({page:page.page,indices});
 }
 return result;
}
/** @param {{page:number,indices:number[]}[]} input @param {Config} config
 * @returns {{train:number,heldout:number,decoded:{page:number,indices:number[]}[]}}
 */
function decrypt(input,config,trainOnly=false){
 const {f,map,sign,reset,seed}=config;
 const result=[];
 let s=seed,previous=-1,n=0,train=0,heldout=0,nt=0,nh=0;
 for(const page of input){
  if(reset){s=seed;previous=-1;}
  const indices=[];
  for(const c of page.indices){
   const d=previous<0?0:(c-previous+29)%29;
   const p=previous<0?c:d===0?28:((d-1-sign*key(s,map)+56)%28);
   indices.push(p);
   if(previous>=0&&d){
    if(n<nTrain){train+=logp[p];nt++;}else{heldout+=logp[p];nh++;}
   }
   s=next(s,p,c,d,f);
   previous=c;n++;
   if(trainOnly&&n===nTrain)return{train:train/nt,heldout:NaN,decoded:[]};
  }
  result.push({page:page.page,indices});
 }
 return{train:train/nt,heldout:heldout/nh,decoded:result};
}
function run(){
 const modes=[];
 for(let f=0;f<4;f++)
 for(let map=0;map<4;map++)
 for(const sign of [-1,1])
 for(const reset of [false,true])
 for(let seed=0;seed<256;seed++)
  modes.push({f,map,sign,reset,seed});
 assert.equal(modes.length,16384);
 const trueModel={f:1,map:0,sign:1,reset:true,seed:79};
 const positiveCipher=encrypt(sourcePlant,trueModel);
 const recovered=decrypt(positiveCipher,trueModel);
 assert.deepEqual(recovered.decoded,sourcePlant);
 assert.deepEqual(encrypt(recovered.decoded,trueModel),positiveCipher);
 const plantedRanked=modes.map(m=>({config:m,score:decrypt(positiveCipher,m,true).train}));
 plantedRanked.sort((a,b)=>b.score-a.score);
 const rank=plantedRanked.findIndex(x=>
   Object.entries(trueModel).every(([k,v])=>x.config[k]===v))+1;
 assert.equal(rank,1,"True hidden-state source key must be recovered blindly");
 const ranked=modes.map(m=>({config:m,score:decrypt(pages,m,true).train}));
 ranked.sort((a,b)=>b.score-a.score);
 const finalists=ranked.slice(0,24).map(x=>{
   const test=decrypt(pages,x.config);
   assert.deepEqual(encrypt(test.decoded,x.config),pages.map(p=>({page:p.page,indices:p.indices})),
     "Original candidate must exactly re-encrypt every genuine GP rune");
   return{...x,heldout:test.heldout};
 });
 assert.ok(finalists[0].score<-.2,
   "Original source-conditioned candidate unexpectedly resembles normal GP prose");
 return{
  source:"original 256-byte base60 table, independently displayed 1033 and 3301",
  originalRunes:N,physicalRunePages:pages.length,trainRunes:nTrain,
  heldoutRunes:N-nTrain,candidateCount:modes.length,
  generator:"state=(1033*state+3301+feedback(plaintext,ciphertext,step)) mod256",
  publicInputs:{maps:["byte mod28","scaled byte into 0..27",
   "base60 low digit mod28","byte xor high nibble mod28"],
   feedback:["plaintext GP index","plaintext GP prime",
     "plaintext index XOR ciphertext index","nonzero emitted step"],
   signs:[-1,1],resets:["book","page"],seeds:256},
  sourceNativePositive:{trueModel,rank,totalCandidates:modes.length,
   trainScore:plantedRanked[0].score,heldoutScore:recovered.heldout,
   exactlyRecovered:N,exactlyReencrypted:N},
  originalTrainingWinner:finalists[0],
  originalOtherFinalists:finalists.slice(1,8),
  conclusion:"No unknown LP2 plaintext recovered by this finite hidden-state key family; all original candidate roundtrips are algebraic, not authentication."
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,encrypt,decrypt,key,next};
