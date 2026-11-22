"use strict";

/**
 * Original-input all-secret 16-state GF29 Fibonacci crib solver.
 * The physical p15 16-cell Fibonacci-prime spiral and repeated five-dot
 * stencil motivate, but do not authenticate, the candidate recurrence
 * S[n]=(S[n-5]+S[n-16]) mod29. Its full 29^16 state space is searched
 * exactly using sparse printed one-rune-word constraints, with withheld
 * original observations and authentic-source-planted controls.
 *
 * Proposed GP29 full-book cipher families:
 * ADD:  C[n] = P[n]+S[n] mod29.
 * DIFF: C[n] = C[n-1]+P[n]-S[n] mod29, C[-1]=0.
 * These are continuous 12,956-rune clocks without hidden resets.
 * The A/I and A/I/O singleton-plaintext assumptions are conditional.
 *
 * Run: node sims/lp2_singleton_fib16_allseed_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const source = fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const map = new Map(corpus.runes.map((r,i)=>[r,i]));
const mod = x => ((x%29)+29)%29;
const ORDER=16, HALF=8;
const p15Seed = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516].map(mod);
const chapterPages = new Set([0,3,8,15,23,27,33,40,54]);
const chapterStarts = [];
let overallOffset = 0;
for(const page of corpus.pages){
  if(page.page>55)break;
  if(chapterPages.has(page.page))chapterStarts.push(overallOffset);
  overallOffset+=page.indices.length;
}
assert.deepEqual(chapterStarts,[0,729,1874,3603,5506,6527,7960,9640,12648]);

/** @typedef {{at:number,c:number,page:number}} Position */
/** @returns {{cipher:number[],words:Position[][],observed:Position[]}} */
function original() {
  const segments=source.split("%").slice(0,55);
  assert.equal(segments.length,55);
  /** @type {Position[][]} */
  const words=[];
  /** @type {Position[]} */
  let current=[];
  /** @type {number[]} */
  const cipher=[];
  let ordinal=0;
  const finish=()=>{if(current.length){words.push(current);current=[];}};
  for(const ch of segments.join("%")){
    const value=map.get(ch);
    if(value!==undefined){
      current.push({at:cipher.length,c:value,page:ordinal>=50?ordinal+1:ordinal});
      cipher.push(value);
    }else if(ch==="%")ordinal++;
    else if(ch!=="/"&&!/\s/u.test(ch))finish();
  }
  finish();
  assert.deepEqual(cipher,corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
  assert.equal(cipher.length,12956);
  assert.equal(words.length,2896);
  assert.equal(words.filter(w=>new Set(w.map(r=>r.page)).size>1).length,32);
  const observed=words.filter(w=>w.length===1).map(w=>w[0]);
  assert.equal(observed.length,83);
  return {cipher,words,observed};
}

/** @param {number} x @returns {number} */
function inv(x){for(let i=1;i<29;i++)if((x*i)%29===1)return i;throw Error("singular GF29 matrix");}

/** @param {number[][]} a @returns {number[][]} */
function invert(a){
  const n=a.length;
  const aug=a.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>Number(i===j))]);
  for(let col=0;col<n;col++){
    const pivot=aug.findIndex((row,i)=>i>=col&&row[col]!==0);
    assert.ok(pivot>=0,"key observation rank below16");
    [aug[col],aug[pivot]]=[aug[pivot],aug[col]];
    const scale=inv(aug[col][col]);
    for(let j=0;j<2*n;j++)aug[col][j]=mod(aug[col][j]*scale);
    for(let i=0;i<n;i++){
      if(i===col||aug[i][col]===0)continue;
      const factor=aug[i][col];
      for(let j=0;j<2*n;j++)aug[i][j]=mod(aug[i][j]-factor*aug[col][j]);
    }
  }
  return aug.map(r=>r.slice(n));
}

/**
 * Represent all observed stream values in coordinates given by the first
 * 16 independent observed positions. Later 67 observations are withheld.
 * @param {Position[]} observed
 * @param {number} length
 * @param {number[]} resets
 * @returns {{rows:number[][],inverse:number[][]}}
 */
function linearize(observed,length,resets){
  const basis=[];
  const boundaries=new Set(resets);
  let resetAt=0;
  for(let n=0;n<length;n++){
    if(boundaries.has(n))resetAt=n;
    const phase=n-resetAt,row=Array(ORDER).fill(0);
    if(phase<ORDER)row[phase]=1;
    else for(let j=0;j<ORDER;j++)row[j]=(basis[n-5][j]+basis[n-16][j])%29;
    basis.push(row);
  }
  const selected=observed.map(o=>basis[o.at]);
  const inverse=invert(selected.slice(0,ORDER));
  const rows=selected.map(row=>Array.from({length:ORDER},(_,j)=>mod(row.reduce((v,x,k)=>v+x*inverse[k][j],0))));
  for(let i=0;i<ORDER;i++)for(let j=0;j<ORDER;j++)assert.equal(rows[i][j],Number(i===j));
  return {rows,inverse};
}

/**
 * @param {Position[]} observed
 * @param {number[]} ciphertext
 * @param {"add"|"diff"} mode
 * @param {number[]} alphabet
 * @param {number[]} resets
 * @returns {number[][]}
 */
function possibilities(observed,ciphertext,mode,alphabet,resets){
  const boundaries=new Set(resets);
  return observed.map(o=>{
    const c=ciphertext[o.at],previous=boundaries.has(o.at)?0:ciphertext[o.at-1];
    return alphabet.map(p=>mode==="add"?mod(c-p):mod(previous+p-c));
  });
}

/** @param {number[][]} options @param {number} offset @returns {number[][]} */
function halfChoices(options,offset){
  const radix=options[0].length,count=radix**HALF,result=[];
  for(let i=0;i<count;i++){
    let value=i;
    const row=[];
    for(let j=0;j<HALF;j++){row.push(options[offset+j][value%radix]);value=Math.floor(value/radix);}
    result.push(row);
  }
  return result;
}

/** @param {number[][]} rows @param {number[][]} halves @param {number} offset @returns {Uint8Array[]} */
function partialSums(rows,halves,offset){
  return rows.slice(ORDER).map(row=>{
    const partial=new Uint8Array(halves.length);
    for(let i=0;i<halves.length;i++){
      let sum=0;
      for(let j=0;j<HALF;j++)sum+=row[offset+j]*halves[i][j];
      partial[i]=sum%29;
    }
    return partial;
  });
}

/**
 * Enumerates exactly 2^16 or 3^16 initial observed-key choices. Rank16
 * makes every seed appear exactly once, including all 29^16 secret seeds
 * that satisfy the first sixteen A/I(/O) constraints.
 * @param {number[][]} options
 * @param {number[][]} rows
 * @param {number[][]} basisInverse
 * @returns {{counts:number[],longest:number,seed:number[]|null}}
 */
function solve(options,rows,basisInverse){
  const left=halfChoices(options,0),right=halfChoices(options,HALF);
  const L=partialSums(rows,left,0),R=partialSums(rows,right,HALF);
  const masks=options.slice(ORDER).map(values=>{
    const mask=new Uint8Array(29);
    for(const v of values)mask[v]=1;
    return mask;
  });
  const counts=Array(masks.length+1).fill(0);
  counts[0]=left.length*right.length;
  let longest=ORDER;
  /** @type {number[]|null} */
  let seed=null;
  for(let i=0;i<left.length;i++)for(let j=0;j<right.length;j++){
    let accepted=0;
    for(let h=0;h<masks.length;h++){
      if(!masks[h][(L[h][i]+R[h][j])%29])break;
      counts[++accepted]++;
    }
    if(ORDER+accepted>longest){
      longest=ORDER+accepted;
      const y=left[i].concat(right[j]);
      seed=basisInverse.map(row=>mod(row.reduce((sum,x,k)=>sum+x*y[k],0)));
    }
  }
  for(let i=1;i<counts.length;i++)assert.ok(counts[i]<=counts[i-1]);
  return {counts,longest,seed};
}

/** @param {number[]} seed @param {number} n @param {number[]} resets @returns {number[]} */
function stream(seed,n,resets){
  const boundaries=new Set(resets),out=[];
  let resetAt=0;
  for(let i=0;i<n;i++){
    if(boundaries.has(i))resetAt=i;
    const phase=i-resetAt;
    out.push(phase<ORDER?seed[phase]:(out[i-5]+out[i-16])%29);
  }
  return out;
}
/** @param {number[]} plain @param {number[]} key @param {"add"|"diff"} mode @param {number[]} resets @returns {number[]} */
function encrypt(plain,key,mode,resets){
  const boundaries=new Set(resets);
  let prev=0;
  return plain.map((p,i)=>{
    if(boundaries.has(i))prev=0;
    const c=mode==="add"?mod(p+key[i]):mod(prev+p-key[i]);
    prev=c;return c;
  });
}
/** @param {number[]} cipher @param {number[]} key @param {"add"|"diff"} mode @param {number[]} resets @returns {number[]} */
function decrypt(cipher,key,mode,resets){
  const boundaries=new Set(resets);
  return cipher.map((c,i)=>mode==="add"?mod(c-key[i]):mod(c-(boundaries.has(i)?0:cipher[i-1])+key[i]));
}

/** @param {{cipher:number[],observed:Position[]}} x @param {"add"|"diff"} mode @param {number[]} alphabet @param {number[][]} rows @param {number[][]} matrixInverse @param {number[]} resets @param {string} clock */
function positive(x,mode,alphabet,rows,matrixInverse,resets,clock){
  const clear=corpus.pages.find(p=>p.page===57).indices;
  const plain=Array.from({length:x.cipher.length},(_,i)=>clear[i%clear.length]);
  for(let i=0;i<x.observed.length;i++)plain[x.observed[i].at]=alphabet[i%alphabet.length];
  const key=stream(p15Seed,plain.length,resets);
  const encoded=encrypt(plain,key,mode,resets);
  assert.deepEqual(decrypt(encoded,key,mode,resets),plain);
  assert.deepEqual(encrypt(decrypt(encoded,key,mode,resets),key,mode,resets),encoded);
  const recovered=solve(possibilities(x.observed,encoded,mode,alphabet,resets),rows,matrixInverse);
  assert.equal(recovered.counts.at(-1),1,"one planted true key must survive");
  assert.deepEqual(recovered.seed,p15Seed);
  const wrong=p15Seed.slice();wrong[0]=mod(wrong[0]+1);
  const wrongClear=decrypt(encoded,stream(wrong,plain.length,resets),mode,resets);
  assert.ok(x.observed.some(o=>!alphabet.includes(wrongClear[o.at])));
  console.log("PLANTED "+clock+" "+mode+" A/I"+(alphabet.length===3?"/O":"")+": recovered 16/16 key cells, exact full-stream replay, wrong key rejected");
}

function main(){
  const x=original();
  console.log("SOURCE: 12956 unchanged original runes, 2896 words, 32 cross-page carries, 83 one-rune words");
  console.log("MODEL: global GF29 5+16 recurrence, all 29^16 secret initial states, continuous or nine shared visible-chapter resets");
  for(const [clock,resets] of [["continuous",[0]],["nine-shared-resets",chapterStarts]]){
    const {rows,inverse}=linearize(x.observed,x.cipher.length,resets);
    for(const mode of ["add","diff"])for(const alphabet of [[24,10],[24,10,3]]){
      const result=solve(possibilities(x.observed,x.cipher,mode,alphabet,resets),rows,inverse);
      console.log("ORIGINAL "+clock+" "+mode+" A/I"+(alphabet.length===3?"/O":"")+
        ": exhaustive "+result.counts[0]+" first16 key assignments; max compatible prefix "+
        result.longest+"/83; full 83-site survivors "+result.counts.at(-1));
      assert.equal(result.counts.at(-1),0,"Unexpected source candidate: investigate original plaintext");
      positive(x,mode,alphabet,rows,inverse,resets,clock);
    }
  }
  console.log("PASS: exact all-secret finite exclusion under explicit plaintext and clock assumptions; no original unknown-page plaintext recovered");
}
main();
