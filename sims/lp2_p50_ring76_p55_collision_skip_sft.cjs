"use strict";

/**
 * Source-frozen original LP2 p50 outer ring -> p55 GP29 key stream.
 * One previous-cipher-collision key rejection is inferred with the
 * existing exact Viterbi decoder. The true rule and receiver remain hypotheses.
 * Node 22 CommonJS. Read-only, run from the repository root:
 * node sims/lp2_p50_ring76_p55_collision_skip_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {viterbi} = require("./grid_stream_collision_viterbi.cjs");
const {train} = require("./grid_keyskip_viterbi.cjs");

const root = path.resolve(__dirname,"..");
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(root,filename),"utf8");
/** @param {number} n @returns {number} */
const mod = (n) => ((n%29)+29)%29;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const ciphertext = corpus.pages.find(p=>p.page===55).indices;
const solved = corpus.pages.find(p=>p.page===57).indices;
assert.equal(ciphertext.length,76);
assert.equal(solved.length,95);
assert.equal(grid.rows.length,32);
assert(grid.rows.every(r=>r.length===8));
assert.equal(grid.alphabet,"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");

const alphabet59 = grid.alphabet.replace("f","");
assert.equal(alphabet59.length,59);
const tokens = grid.rows.flat();
assert.equal(tokens.length,256);
const ringPositions = [];
for(let col=0;col<8;col++)ringPositions.push(col);
for(let row=1;row<32;row++)ringPositions.push(row*8+7);
for(let col=6;col>=0;col--)ringPositions.push(31*8+col);
for(let row=30;row>=1;row--)ringPositions.push(row*8);
assert.equal(ringPositions.length,76);
assert.equal(new Set(ringPositions).size,76);
const ringTokens = ringPositions.map(i=>tokens[i]);
const ring = ringTokens.map(token=>{
  const a=alphabet59.indexOf(token[0]),b=alphabet59.indexOf(token[1]);
  assert(a>=0&&b>=0, "Source token outside established base59 alphabet: "+token);
  return mod(59*a+b);
});
assert.equal(ring.length,76);
const CAP = 34, N = ciphertext.length;
const key = Array.from({length:N+CAP+1},(_,i)=>ring[i%ring.length]);
const lm = train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const GP = corpus.translit;
/** @param {number[]} values @returns {string} */
const render = (values) => values.map(x=>GP[x]).join("");
/** @param {number[]} plain @returns {number} */
function plainScore(plain){
  let sum=lm.unigram[plain[0]]+lm.bigram[plain[0]*29+plain[1]];
  for(let i=2;i<plain.length;i++){
    sum+=lm.trigram[(plain[i-2]*29+plain[i-1])*29+plain[i]];
  }
  return sum/plain.length;
}
/** @param {number} seed @returns {()=>number} */
function xorshift(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/**
 * Exact conditional one-reject GP29 additive encryption.
 * @param {number[]} plain
 * @param {number[]} pad
 * @param {1|-1} sign
 * @param {()=>number} next
 */
function encrypt(plain,pad,sign,next){
  let cursor=0,previous=-1,skips=0;
  const output=[];
  for(const p of plain){
    let c=mod(p+sign*pad[cursor]);
    if(c===previous && (next()/4294967296)<0.81){
      cursor++;
      c=mod(p+sign*pad[cursor]);
      skips++;
    }
    output.push(c);
    previous=c;
    cursor++;
  }
  return {cipher:output,skips,keysConsumed:cursor};
}
const plantedPlain=solved.slice(0,N);
const planted=encrypt(plantedPlain,key,1,xorshift(0x33015576));
const recovered=viterbi(planted.cipher,key,1,lm);
const correct=recovered.plaintext.filter((v,i)=>v===plantedPlain[i]).length;
assert(correct>=70, "Positive planted GP-native passage was not recovered sufficiently");
const original=[-1,1].map(sign=>{
  const result=viterbi(ciphertext,key,sign,lm);
  return {sign,score:result.perRune,skips:result.skips,
    output:render(result.plaintext),indices:result.plaintext};
});
original.sort((a,b)=>b.score-a.score);
const RNG=xorshift(0x50205576),REPLICATES=256;
/** @param {number} limit @returns {number} unbiased selected random index */
function randomIndex(limit){
  const cutoff=Math.floor(4294967296/limit)*limit;
  let x;do{x=RNG();}while(x>=cutoff);
  return x%limit;
}
const nullBest=[];
for(let trial=0;trial<REPLICATES;trial++){
  const shuffled=ring.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=randomIndex(i+1);
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  const shufKey=Array.from({length:N+CAP+1},(_,i)=>shuffled[i%76]);
  const best=Math.max(...[-1,1].map(sign=>viterbi(ciphertext,shufKey,sign,lm).perRune));
  nullBest.push(best);
}
nullBest.sort((a,b)=>a-b);
const exceed=nullBest.filter(x=>x>=original[0].score).length;
console.log(JSON.stringify({
  classification:"Conditional original key/receiver collision-skip gate; no authenticated plaintext assumed",
  source:{
    table:"original p49..51 printed 32x8 two-symbol tokens",
    selector:"p57 SHED CIRCUMFERENCES, depth0 perimeter = p55's 76 runes",
    radix:"source-selected drop-f base59",
    circumference:"top-left clockwise, 76 tokens and 76 GP29 residues",
    receiver:"complete original p55 76-rune sequence"
  },
  inverse:{
    model:"C=P+sign*K; conditional max-one skipped key if tentative C equals previous C",
    skippedKeyPenalty:3.5,maxExtraPerReceiver:CAP,
    keysRepeatedCyclically:true,initialPhase:0,variants:2
  },
  controls:{
    solvedP57PlainScore:plainScore(plantedPlain),recoveredPlantScore:recovered.perRune,
    plantedSkipped:planted.skips,inferredSkipped:recovered.skips,
    recoveredSourceNativeRunes:correct,total:N
  },
  original:original.map(({sign,score,skips,output})=>({sign,score,skips,output})),
  null:{
    shuffledRingTrials:REPLICATES,seed:"0x50205576",
    exceedOriginal:exceed,
    empiricalTailUpper:(exceed+1)/(REPLICATES+1),
    median:nullBest[Math.floor(REPLICATES/2)],max:nullBest[REPLICATES-1]
  }
},null,2));
