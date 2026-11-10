"use strict";
/**
 * Source-derived nonperiodic matrix keystreams for original LP2.
 *
 * Exactly 225 annotated red runes (15x15) and the 256-cell base-60 grid
 * (16x16) supply candidate full-state F29 transition matrices.
 * No matrix coefficient is fitted from any putative plaintext.
 *
 * State: S[j+1] = A*S[j] mod 29; K[j] is the first, last or sum coordinate.
 * Cipher: C = P + sign*K[j] mod29, skipping a proposed key when its
 * output equals the previous published rune with probability 0.81.
 * A skipped draw keeps the same plaintext rune.
 *
 * The forward likelihood sums over all consistent collision-rejection
 * alignments, capped at 40 rejected key draws per physical page and 3
 * rejected draws per published rune. The key resets each physical page.
 * Source model: Shakespeare GP unigrams from first 240000 characters.
 * Heldout plant: remainder of the pinned source, with actual rejection.
 *
 * Status: bounded source-driven attack; no plaintext assertion.
 * Node.js 22, CommonJS; no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {logLikelihood, encrypt} = require("./keyskip_transducer.cjs");
const {encode} = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length);
const MOD = 29;
const REJECT = 0.81;
const MAX_SKIP = 40;
const MAX_PER_RUNE = 3;
const SEED = 0x3301a549;
const FIBONACCI_SPIRAL = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
];
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n,p) => n+p.indices.length,0),12956);
assert.equal(ink.counts.red, 225);
assert.equal(grid.byte_rows.flat().length,256);
const runeIndex = new Map(corpus.runes.map((glyph,index) => [glyph,index]));
const red = ink.pages.flatMap(p => (p.red_spans || [])
  .flatMap(s => [...s.runes].map(c => runeIndex.get(c))));
assert.equal(red.length,225);
assert.ok(red.every(x => Number.isInteger(x) && x>=0 && x<MOD));

/** @param {number} n @returns {number} */
function mod(n){return ((n % MOD)+MOD)%MOD;}
/** @param {number[]} vector @param {number} n @returns {number[][]} */
function square(vector,n){
  assert.equal(vector.length,n*n);
  return Array.from({length:n},(_,i)=>vector.slice(i*n,(i+1)*n));
}
/** @param {number[][]} A @returns {number[][]} */
function transpose(A){return A[0].map((_,i)=>A.map(row=>row[i]));}
/** @param {number} seed @returns {()=>number} */
function random32(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/**
 * @param {number[][]} A Matrix 15x15 or 16x16.
 * @param {number[]} initial Initial state.
 * @param {number} tap 0:first, 1:last, 2:sum.
 * @param {number} length Key symbols to generate.
 * @returns {number[]}
 */
function keystream(A,initial,tap,length){
  const n=A.length;
  assert.equal(initial.length,n);
  let state=initial.slice();
  const key=new Array(length);
  for(let t=0;t<length;t++){
    key[t]=tap===0?state[0]:tap===1?state[n-1]:
      state.reduce((s,x)=>s+x,0)%MOD;
    const next=new Array(n);
    for(let i=0;i<n;i++){
      let sum=0;
      for(let j=0;j<n;j++)sum+=A[i][j]*state[j];
      next[i]=sum%MOD;
    }
    state=next;
  }
  return key;
}

/** @returns {{name:string, A:number[][]}[]} */
function sourceMatrices(){
  const bytes=grid.byte_rows.flat();
  return [
    {name:"red-GP-index",A:square(red,15)},
    {name:"red-GP-prime",A:square(red.map(x=>corpus.prime[x]%MOD),15)},
    {name:"grid-byte-mod29",A:square(bytes.map(x=>x%MOD),16)},
    {name:"grid-byte-scaled29",A:square(bytes.map(x=>Math.floor(x*MOD/256)),16)}
  ];
}

/**
 * @typedef {{name:string,source:string,orientation:string,seed:string,
 * tap:number,sign:number,key:number[]}} Candidate
 * @returns {Candidate[]}
 */
function configurations(){
  const length=Math.max(...pages.map(p=>p.indices.length))+MAX_SKIP+1;
  const candidates=[];
  for(const src of sourceMatrices()){
    for(const [orientation,A] of [["row",src.A],["column",transpose(src.A)]]){
      const seeds=[
        ["first-row",A[0]],
        ["last-row",A[A.length-1]],
        ["first-column",A.map(row=>row[0])],
        ["Fibonacci-spiral",FIBONACCI_SPIRAL.slice(0,A.length)]
      ];
      for(const [seed,initial] of seeds)
        for(let tap=0;tap<3;tap++){
          const key=keystream(A,initial,tap,length);
          for(const sign of [-1,1]){
            const name=[src.name,orientation,seed,"tap"+tap,"sign"+sign].join("/");
            candidates.push({name,source:src.name,orientation,seed,tap,sign,
              key:key.map(k=>mod(sign*k))});
          }
        }
    }
  }
  assert.equal(candidates.length,192);
  return candidates;
}

/** @param {string} source @returns {number[]} */
function englishRunes(source){return encode(source);}
/** @param {number[]} sample @returns {number[]} */
function trainingDistribution(sample){
  const c=new Float64Array(MOD).fill(0.5);
  for(const x of sample)c[x]++;
  const n=c.reduce((sum,x)=>sum+x,0);
  return Array.from(c,x=>x/n);
}
const training=englishRunes(shakespeare.slice(0,240000));
const heldout=englishRunes(shakespeare.slice(240000));
const q=trainingDistribution(training);
assert.ok(heldout.length>=12956 && training.length>100000);
const IDENTITY=Array.from({length:MOD},(_,i)=>i);

/**
 * @param {number[]} ciphertext
 * @param {Candidate} candidate
 * @returns {number} Forward log likelihood on original symbols.
 */
function likelihood(ciphertext,candidate){
  return logLikelihood(ciphertext,{
    key:candidate.key,q,inverseSigma:IDENTITY,
    rejectRepeat:REJECT,maxTotalSkips:MAX_SKIP,
    maxSkippedPerOutput:MAX_PER_RUNE
  });
}

/**
 * @param {number[][]} target Original page arrays or planted pages.
 * @param {Candidate[]} candidates
 * @returns {{top:object[],best:object,ranked:object[]}}
 */
function scan(target,candidates){
  assert.equal(target.length,pages.length);
  const trainN=pages.filter(p=>p.page%2===0)
    .reduce((s,p)=>s+p.indices.length,0);
  const holdN=12956-trainN;
  const ranked=[];
  for(const c of candidates){
    let train=0,hold=0;
    for(let i=0;i<pages.length;i++){
      const ll=likelihood(target[i],c);
      if(pages[i].page%2===0)train+=ll;
      else hold+=ll;
    }
    ranked.push({name:c.name,source:c.source,orientation:c.orientation,
      seed:c.seed,tap:c.tap,sign:c.sign,
      trainPerRune:train/trainN,heldoutPerRune:hold/holdN});
  }
  ranked.sort((a,b)=>b.trainPerRune-a.trainPerRune);
  return {best:ranked[0],top:ranked.slice(0,12),ranked,
    trainRunes:trainN,heldoutRunes:holdN};
}

/**
 * @param {Candidate} trueCandidate
 * @returns {{cipher:number[][],skips:number,sourceRuneCount:number}}
 */
function plant(trueCandidate){
  const draw=random32(SEED);
  let at=0,skips=0;
  const cipher=[];
  for(const page of pages){
    const next=heldout.slice(at,at+page.indices.length);
    assert.equal(next.length,page.indices.length);
    at+=next.length;
    const planted=encrypt(next,trueCandidate.key,IDENTITY,draw,{
      rejectRepeat:REJECT,offset:0
    });
    cipher.push(planted.cipher);
    skips+=planted.skips;
  }
  return {cipher,skips,sourceRuneCount:at};
}

/** Run full original and source-disjoint planted searches. */
function run(){
  const candidates=configurations();
  const actual=scan(pages.map(p=>p.indices),candidates);
  const truth=candidates.find(c=>c.name==="red-GP-index/row/first-row/tap0/sign1");
  assert.ok(truth);
  const planted=plant(truth);
  const positive=scan(planted.cipher,candidates);
  const rank=positive.ranked.findIndex(c=>c.name===truth.name)+1;
  assert.ok(rank>=1 && rank<=5,"Planted exact matrix key must rank in top five");
  assert.ok(positive.ranked[rank-1].heldoutPerRune>actual.best.heldoutPerRune+0.35,
    "Planted true model must distinguish itself in heldout");
  return {
    hypothesis:"Source-derived GL(15/16,F29) matrix-state additive stream with same-plaintext collision rejection",
    sourceCount:4,candidates:candidates.length,pageReset:true,
    keyState:"S_(j+1)=A*S_j mod29",
    original:{
      pages:pages.length,runes:12956,
      trainingRunes:actual.trainRunes,heldoutRunes:actual.heldoutRunes,
      originalBest:actual.best,top:actual.top
    },
    planted:{
      trueModel:truth.name,trueModelRank:rank,
      generatedRunes:planted.sourceRuneCount,
      actualRejectedKeys:planted.skips,
      trainingPerRune:positive.ranked[rank-1].trainPerRune,
      heldoutPerRune:positive.ranked[rank-1].heldoutPerRune,
      top:positive.top.slice(0,5)
    },
    fixedParameters:{
      source:"resources/liber-primus/lp2-ink-annotations.json and base60-grid.json",
      sourceCountRed:225,sourceCountGrid:256,
      rejectionProbability:REJECT,maxTotalSkipsPerPage:MAX_SKIP,
      maxRejectedPerOutput:MAX_PER_RUNE,
      trainingCorpus:"Shakespeare [0,240000) characters",
      independentPlantCorpus:"Shakespeare [240000,300000) characters",
      deterministicPlantSeed:"0x"+SEED.toString(16),
      shakespeareSHA256:createHash("sha256").update(shakespeare).digest("hex")
    },
    caveat:"A narrow original-ciphertext source-key screen; no unknown LP2 plaintext or cryptographic key recovered. Rejection states are marginalized, not guessed as free parameters."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={keystream,sourceMatrices,configurations,trainingDistribution,
  likelihood,scan,plant,run};
