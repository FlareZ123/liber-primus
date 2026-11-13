'use strict';
/**
 * Source-frozen 2016 563/569 matching-words pair subtraction.
 * Original manuscript only; no ciphertext is deciphered by this test.
 * Node.js 22, built-ins, read-only. Run from repository root:
 * node sims/lp2_563_569_wordpair_delta_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const chunks=transcription.split('%');
assert.equal(chunks.length,57);
const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} text @returns {number[][]} */
function words(text){
  return text.replaceAll('/','').replace(/\s/gu,'')
    .split(/[-.,&$§:!?]/u)
    .map(w=>[...w].filter(r=>idx.has(r)).map(r=>idx.get(r))).filter(w=>w.length);
}
/** @param {number} x @returns {number} */
function mod(x){return ((x%29)+29)%29;}
/** @param {number[]} data @returns {number} */
function sum(data){return data.reduce((n,i)=>n+corpus.prime[i],0);}
const a=words(chunks[0])[5], b=words(chunks[1])[32];
assert.deepEqual(a,[9,18,7,17,24,15,22,12,10,21,1]);
assert.deepEqual(b,[11,0,10,9,28,5,26,27,10,28]);
assert.deepEqual([sum(a),sum(b)],[563,569]);
assert.equal(corpus.prime[a[0]],29);
const diff=a.slice(1).map((v,i)=>mod(v-b[i]));
assert.deepEqual(diff,[7,7,7,15,17,17,15,11,11,3]);
assert.equal(diff.map(i=>corpus.translit[i]).join(''),'WWWSBBSJJO');
/** @param {number[]} data */
function adjacentEqual(data){
  return data.reduce((n,x,i)=>n+Number(i>0&&x===data[i-1]),0);
}
assert.equal(adjacentEqual(diff),4);
let rng=0x7a35090f;
/** @returns {number} */
function next(){
  rng^=rng<<13;
  rng^=rng>>>17;
  rng^=rng<<5;
  return rng>>>0;
}
/** @param {number[]} original @returns {number[]} */
function shuffle(original){
  const out=original.slice();
  for(let i=out.length-1;i>0;i--){
    const j=next()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
const N=200000;
let sameThree=0, fixedWWW=0, enoughRepeats=0, combined=0, fixedCombined=0;
for(let n=0;n<N;n++){
  const x=shuffle(a.slice(1)), y=shuffle(b);
  const d=x.map((v,i)=>mod(v-y[i]));
  const same=d[0]===d[1]&&d[1]===d[2];
  const www=same&&d[0]===7;
  const many=adjacentEqual(d)>=4;
  if(same)sameThree++;
  if(www)fixedWWW++;
  if(many)enoughRepeats++;
  if(same&&many)combined++;
  if(www&&many)fixedCombined++;
}
assert.deepEqual([sameThree,fixedWWW,enoughRepeats,combined,fixedCombined],[176,15,21,5,1]);

// Independent image-size-matched p32 row/column rune keys cannot account
// for the ten-pair same-shift sequence under a common pad.
const grid=corpus.pages[32].indices;
assert.equal(grid.length,121);
const row=grid.slice(0,11);
const column=Array.from({length:11},(_,i)=>grid[i*11]);
assert.deepEqual([sum(row),sum(column)],[563,569]);
const axes=[row.slice(0,10),row.slice(1)];
const sides=[column.slice(0,10),column.slice(1)];
let maxIdentical=0;
for(const x of axes)for(const y of sides)for(const sign of [-1,1]){
  const d=x.map((v,i)=>mod(v+sign*y[i]));
  const matching=d.filter((v,i)=>v===diff[i]).length;
  maxIdentical=Math.max(maxIdentical,matching);
}
assert.equal(maxIdentical,3);
/** @param {number[]} data @returns {number} */
function ioc(data){
  const hist=Array(29).fill(0);
  for(const v of data)hist[v]++;
  return hist.reduce((n,k)=>n+k*(k-1),0)/(data.length*(data.length-1));
}
const directP32=[-1,1].map(sign=>{
  const clear=grid.map((v,i)=>mod(v+sign*diff[i%diff.length]));
  const score=ioc(clear);
  return {sign,score,first32:clear.slice(0,32).map(i=>corpus.translit[i]).join('')};
});
assert.equal(directP32.length,2);
assert(Math.abs(directP32[0].score-0.033884297520661154)<1e-12);
assert(Math.abs(directP32[1].score-0.03305785123966942)<1e-12);
console.log(JSON.stringify({
  status:'Provisional paired source-word delta; not authenticated plaintext or an address',
  sourceWordGP:[a,b],sourcePrimeSums:[563,569],
  alignment:'drop initial GP-N of 11-rune p0#6 to pair with all ten p1#33 runes',
  sourceDeltaGP:diff,
  sourceDeltaTransliteration:'WWWSBBSJJO',
  originalAdjacentMatches:4,
  null:{
    fixedOriginalWordMultisets:true,firstNFixed:true,seed:'0x7a35090f',
    draws:N,sameFirstThreeAny:sameThree,sameFirstThreeW:fixedWWW,
    repeatsAtLeastFour:enoughRepeats,
    sameFirstThreeAndFourRepeats:combined,
    sameFirstThreeWAndFourRepeats:fixedCombined,
    selectionWarning:'The alignment, WWW and repeat-pattern statistics were post-inspection; no manuscript-wide p-value.'
  },
  p32MatchedRowColKeysMaxSameLocations:maxIdentical,
  originalP32DirectVigenereIoCs:directP32,
  originalUnknownPlaintextRecovered:0
},null,2));
