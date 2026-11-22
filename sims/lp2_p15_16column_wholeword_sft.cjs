"use strict";

/**
 * Original LP2 p15 4x4 Fibonacci-prime spiral, sixteen-column word gate.
 * Run with Node 22: node sims/lp2_p15_16column_wholeword_sft.cjs
 * Source: all 2,896 complete unsolved printed words, including page carries.
 * Original/source-rank arrangements are fixed before any language scoring.
 * The held-Karp search maximizes within-row adjacency over ALL 16! paths;
 * its final row-wrap is scored, but is not included in the optimization.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {nativeLengths, rankMatch, stats} = require("./lp2_wordlength_order_grammar_sft.cjs");
const {trainWeights} = require("./lp2_8column_allperm_wordgrammar_sft.cjs");

const N = 2896;
const C = 16;
const H = 181;
const SQUARE = [3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820];
const ORDER = Array.from({length:C}, (_,i)=>i);
const RANK = ORDER.slice().sort((a,b)=>SQUARE[a]-SQUARE[b]);
const COLMAJOR = ORDER.map(i=>(i%4)*4+Math.floor(i/4));
// Authenticated numerical relation: |3301 - prime[Fibonacci-index]| laid
// clockwise into the printed 4x4 spiral, beginning at red center 3299.
const SPIRAL = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const CHI_SEED = 0x33011681;
const SECRET_SEED = 0x33011681;

/** @param {number[]} original */
function categories(original) {
  return Uint8Array.from(original, v=>Math.min(v,9)-1);
}

/**
 * Source in sixteen complete columns of 181 words; read transposed rows.
 * @param {Uint8Array} a
 * @param {number[]} order
 * @returns {Uint8Array}
 */
function decode(a,order) {
  assert.equal(a.length,N);
  const result = new Uint8Array(N);
  for(let r=0;r<H;r++)
    for(let k=0;k<C;k++)
      result[r*C+k]=a[order[k]*H+r];
  return result;
}

/**
 * Inverse whole-word columnar arrangement.
 * @param {Uint8Array} a
 * @param {number[]} order
 * @returns {Uint8Array}
 */
function encode(a,order) {
  const result = new Uint8Array(N);
  for(let r=0;r<H;r++)
    for(let k=0;k<C;k++)
      result[order[k]*H+r]=a[r*C+k];
  return result;
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state=seed>>>0;
  return ()=>{
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return state>>>0;
  };
}

/** @param {Uint8Array} input @param {()=>number} rand */
function shuffle(input,rand) {
  for(let k=input.length-1;k>0;k--) {
    const i=rand()%(k+1);
    [input[k],input[i]]=[input[i],input[k]];
  }
}

/**
 * Exact max-weight Hamiltonian PATH for the 15 within-row column joins.
 * Adding the closing wrap afterward is only a diagnostic, not full-cycle
 * optimization. It has one common methodology for originals/nulls/plants.
 * @param {Uint8Array} input
 * @param {Float64Array} weights
 */
function bestPath(input,weights) {
  const edges=new Float64Array(C*C);
  const wraps=new Float64Array(C*C);
  for(let a=0;a<C;a++) for(let b=0;b<C;b++) {
    let same=0,wrap=0;
    for(let r=0;r<H;r++) {
      same+=weights[input[a*H+r]*9+input[b*H+r]];
      if(r<H-1) wrap+=weights[input[a*H+r]*9+input[b*H+r+1]];
    }
    edges[a*C+b]=same;
    wraps[a*C+b]=wrap;
  }
  const masks=1<<C;
  const dp=new Float64Array(masks*C);
  const prev=new Int8Array(masks*C);
  dp.fill(-Infinity);
  prev.fill(-1);
  for(let c=0;c<C;c++) dp[(1<<c)*C+c]=0;
  for(let mask=1;mask<masks;mask++) {
    for(let last=0;last<C;last++) if((mask>>last)&1) {
      const score=dp[mask*C+last];
      if(score===-Infinity)continue;
      for(let next=0;next<C;next++) if(!((mask>>next)&1)) {
        const key=((mask|(1<<next))*C+next);
        const trial=score+edges[last*C+next];
        if(trial>dp[key]) {dp[key]=trial;prev[key]=last;}
      }
    }
  }
  const finalMask=masks-1;
  let last=0;
  for(let x=1;x<C;x++)
    if(dp[finalMask*C+x]>dp[finalMask*C+last])last=x;
  const pathScore=dp[finalMask*C+last];
  let m=finalMask,k=last;
  const order=[];
  while(k>=0) {
    order.push(k);
    const before=prev[m*C+k];
    m^=1<<k;
    k=before;
  }
  order.reverse();
  assert.equal(order.length,C);
  const score=pathScore+wraps[order[C-1]*C+order[0]];
  let maxWrap=-Infinity;
  for(const v of wraps)maxWrap=Math.max(maxWrap,v);
  return {order,score,pathScore,upperBound:pathScore+maxWrap};
}

function main() {
  const corpus=parseSharedCorpus();
  assert.equal(corpus.words.length,N);
  assert.equal(corpus.runeCount,12956);
  assert.equal(corpus.crossPageWords,32);
  const lengths=corpus.words.map(w=>w.length);
  assert(Math.abs(stats(lengths).chi-68.27318638192133)<1e-8);
  const original=categories(lengths);
  const shakespeare=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const {weights,windows}=trainWeights(lengths);
  assert.equal(windows,19);
  const rank=decode(original,RANK);
  assert.deepEqual(Array.from(encode(rank,RANK)),Array.from(original));
  const fixed={
    printed:stats(Array.from(decode(original,ORDER),v=>v+1)).chi,
    rankAscending:stats(Array.from(rank,v=>v+1)).chi,
    rankDescending:stats(Array.from(decode(original,RANK.slice().reverse()),v=>v+1)).chi,
    columnMajor:stats(Array.from(decode(original,COLMAJOR),v=>v+1)).chi,
    spiralFibonacciPrime:stats(Array.from(decode(original,SPIRAL),v=>v+1)).chi,
    spiralReversed:stats(Array.from(decode(original,SPIRAL.slice().reverse()),v=>v+1)).chi
  };
  // Null-shuffle all 2,896 complete word lengths, with the same source-fixed
  // arrangements and the same learned grammar path search.
  const rand=random(CHI_SEED);
  const nulls=Object.fromEntries(Object.keys(fixed).map(k=>[k,0]));
  const trials=1200;
  for(let t=0;t<trials;t++) {
    const input=original.slice();
    shuffle(input,rand);
    const candidates={
      printed:ORDER,
      rankAscending:RANK,
      rankDescending:RANK.slice().reverse(),
      columnMajor:COLMAJOR,
      spiralFibonacciPrime:SPIRAL,
      spiralReversed:SPIRAL.slice().reverse()
    };
    for(const [label,key] of Object.entries(candidates)) {
      const score=stats(Array.from(decode(input,key),v=>v+1)).chi;
      if(score>=fixed[label])nulls[label]++;
    }
  }
  assert(Math.abs(fixed.printed-51.451119953906264)<1e-8);
  assert(Math.abs(fixed.rankAscending-74.44538996031895)<1e-8);
  assert.equal(nulls.printed,1045);
  assert.equal(nulls.rankAscending,186);
  assert(Math.abs(fixed.spiralFibonacciPrime-61.03379101585962)<1e-8);
  assert(Math.abs(fixed.spiralReversed-63.2860539552214)<1e-8);
  assert.equal(nulls.spiralFibonacciPrime,690);
  assert.equal(nulls.spiralReversed,599);
  const free=bestPath(original,weights);
  const next=random(SECRET_SEED);
  let exceeds=0;
  const searchTrials=60;
  const shuffleScores=[];
  for(let t=0;t<searchTrials;t++) {
    const input=original.slice();
    shuffle(input,next);
    const score=bestPath(input,weights).score;
    shuffleScores.push(score);
    if(score>=free.score)exceeds++;
  }
  assert(Math.abs(free.score-6.9836888735694735)<1e-8);
  assert.equal(exceeds,59);
  // Independent native-word-length plant: source-shaped columnar encoding
  // under exactly the square-rank key and exact inverse.
  const native=nativeLengths(shakespeare);
  const matched=categories(rankMatch(native.slice(0,N),
    lengths.slice().sort((a,b)=>a-b)));
  const plant=encode(matched,RANK);
  assert.deepEqual(Array.from(decode(plant,RANK)),Array.from(matched));
  const plantChi=stats(Array.from(decode(plant,RANK),v=>v+1)).chi;
  assert(plantChi>fixed.rankAscending);
  const plantBest=bestPath(plant,weights);
  console.log(JSON.stringify({source:{runes:corpus.runeCount,words:N,
    columns:C,rows:H,p15Square:SQUARE,p15AscendingColumnKey:RANK,
      p15FibonacciPrimeSpiralKey:SPIRAL},
    fixedOriginalChi:fixed,fixedNull:{draws:trials,
      seed:"0x33011681",plusOneUpperTails:Object.fromEntries(
        Object.entries(nulls).map(([k,v])=>[k,(v+1)/(trials+1)]))},
    freePath:{modelTrainingWindows:windows,...free,draws:searchTrials,
      shuffleExceeds:exceeds,plusOneUpperTail:(exceeds+1)/(searchTrials+1)},
    nativePositive:{exactInvert:true,chi:plantChi,
      optimizedScore:plantBest.score},
    decision:"No original plaintext/key. The tested sixteen-column route is unsupported; full wrap-optimized all-key exclusion is not claimed."},null,2));
}

if(require.main===module)main();
module.exports={decode,encode,bestPath};
