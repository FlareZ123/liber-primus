"use strict";
/**
 * Test exact original LP2 p50 byte-table feedback as an executable
 * GP29 decoder on all 55 unsolved rune-bearing pages and every possible
 * eight-bit secret starting state.
 *
 * Motivated operation: the 2016 signed text says the words are a map,
 * numbers a direction; the p50 printed 32x8 table gives a 256-byte lookup
 * map. An additive ciphertext- or plaintext-feedback update is one simple
 * way to avoid the source table's short static pointer cycles.
 *
 * This state rule is NOT a Cicada-authenticated instruction.
 * No cryptographic key or plaintext is supplied in the test.
 *
 * Eight source-fixed states: K=state or table[state] (mod29); transition
 * table[(state+rune)%256] or (table[state]+rune)%256; rune=cipher or plain.
 * GP29 subtractive inverse is reversible and reset once per source page.
 *
 * Repro: node sims/lp2_p50_rune_feedback_allbyte_source_sft.cjs
 * Read-only, Node22, Windows11, CommonJS, no dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const dir=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(dir,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const B=grid.bytes;
assert.equal(B.length,256);
assert.deepEqual(grid.pages.map(p=>[p.rows,p.cols]),[[10,8],[13,8],[9,8]]);
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const lm=buildSourceNativeTrigramModel({
 corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")
});
/** @typedef {{key:"state"|"byte", index:"with"|"after", input:"cipher"|"plain"}} Mode */
const modes=[];
for(const key of ["state","byte"])
for(const index of ["with","after"])
for(const input of ["cipher","plain"])
 modes.push({key,index,input});
assert.equal(modes.length,8);
const mod29=x=>(x%29+29)%29;
/**
 * @param {number[]} ciphertext
 * @param {number} seed
 * @param {Mode} mode
 * @returns {number[]}
 */
function decode(ciphertext,seed,mode){
 const P=[];
 let state=seed;
 for(let i=0;i<ciphertext.length;i++){
  const c=ciphertext[i];
  const k=(mode.key==="state"?state:B[state])%29;
  const p=mod29(c-k);
  P.push(p);
  const rune=mode.input==="cipher"?c:p;
  state=mode.index==="with"?B[(state+rune)&255]:(B[state]+rune)&255;
 }
 return P;
}
/**
 * @param {number[]} plaintext
 * @param {number} seed
 * @param {Mode} mode
 * @returns {number[]}
 */
function encode(plaintext,seed,mode){
 const C=[];
 let state=seed;
 for(let i=0;i<plaintext.length;i++){
  const p=plaintext[i];
  const k=(mode.key==="state"?state:B[state])%29;
  const c=mod29(p+k);
  C.push(c);
  const rune=mode.input==="cipher"?c:p;
  state=mode.index==="with"?B[(state+rune)&255]:(B[state]+rune)&255;
 }
 return C;
}
function ioc(a){
 const c=new Int32Array(29);
 a.forEach(x=>c[x]++);
 return c.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} source @returns {Array<{seed:number,score:number}>} */
function topForMode(source,mode){
 const candidates=[];
 for(let seed=0;seed<256;seed++){
  const P=decode(source,seed,mode);
  candidates.push({seed,score:lm.scoreStream(P).mean,ioc:ioc(P),start:lm.spell(P.slice(0,45))});
 }
 candidates.sort((a,b)=>b.score-a.score);
 return candidates.slice(0,2);
}
const planted=corpus.pages.find(p=>p.page===57).indices;
for(const mode of modes){
 const enc=encode(planted,201,mode);
 const dec=decode(enc,201,mode);
 assert.deepEqual(dec,planted);
 assert.deepEqual(encode(dec,201,mode),enc);
}
const rows=[];
for(const page of pages){
 for(const mode of modes){
  const winners=topForMode(page.indices,mode);
  const first=winners[0];
  rows.push({page:page.page,len:page.indices.length,mode,
    ...first,runnerUp:winners[1].score});
 }
}
rows.sort((a,b)=>b.score-a.score);
const top=rows.slice(0,20);
const pageScores=pages.map(page=>{
 const best=rows.find(x=>x.page===page.page);
 return {page:page.page,n:page.indices.length,best:best.score,mode:best.mode,seed:best.seed};
});
const randomControls=[];
let rng=0x50463301;
function random(){
 rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
 return rng>>>0;
}
for(const pageNo of [0,32,55]){
 const page=pages.find(p=>p.page===pageNo);
 const nulls=[];
 for(let t=0;t<40;t++){
  const a=page.indices.slice();
  for(let j=a.length-1;j>0;j--){
   const k=random()%(j+1);
   [a[j],a[k]]=[a[k],a[j]];
  }
  let max=-Infinity;
  for(const mode of modes)max=Math.max(max,topForMode(a,mode)[0].score);
  nulls.push(max);
 }
 nulls.sort((a,b)=>a-b);
 const best=rows.find(x=>x.page===pageNo);
 randomControls.push({page:pageNo,n:page.indices.length,
  originalBest:best.score,
  nullMedian:nulls[20],nullMax:nulls.at(-1),
  nullAtLeastOriginal:nulls.filter(x=>x>=best.score).length,
  controls:nulls.length});
}
console.log(JSON.stringify({
 source:"authentic 256 base60 bytes and 12,956 original GP29 symbols",
 modeCount:modes.length,seedsPerMode:256,decodedPageKeys:rows.length*256,
 nativeBenchmarks:{lp1:lm.trainingScore,p57:lm.p57Score},
 bestOriginalCandidates:top,pagewiseBest:pageScores,
 finiteShuffleControls:randomControls,
 positiveInversePlants:8,
 conclusion:"The tests are conditional on a proposed table-feedback state; a high language score is necessary for native GP English, and no source-selected state update has been established."
},null,2));
console.log("PASS: all 55 original pages, all 256 seeds x 8 state maps, complete positive GP29 inverses and matched shuffle controls.");
