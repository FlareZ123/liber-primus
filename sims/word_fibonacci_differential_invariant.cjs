"use strict";
/**
 * Source-weighted key-free Fibonacci-differential invariant.
 *
 * A wordwise additive key satisfying K[i]=K[i-1]+K[i-2] cancels out of
 * C[i]-C[i-1]-C[i-2] mod29. The opposite reading direction with
 * K[i]=K[i-2]-K[i-1] cancels from C[i]+C[i-1]-C[i-2].
 * The cancellation holds for arbitrary unrelated 2-rune seeds per word.
 *
 * We compare the complete original LP2 differential distributions with
 * held-out Shakespeare GP source words encrypted under exactly these keys,
 * plus 81% collision-triggered repair, and per-character pad controls.
 * The training GP distributions are frozen from a disjoint first240k source.
 *
 * An optional max over affine output relabelings is calibrated on the same
 * independent-pad controls; no free source dictionary decisions are fitted.
 * No encrypted LP2 plaintext or valid key is asserted by this diagnostic.
 *
 * @module word_fibonacci_differential_invariant
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {encode,loadLexicon,sampleHeldout}=require("./word_period5_unknown_key_exact_inverse.cjs");
const {encipher}=require("./word_fibonacci_exact_inverse.cjs");

const ROOT=path.resolve(__dirname,"..");
const CORPUS=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const REFERENCE=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const LP2=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
const IDS=new Map(CORPUS.runes.map((r,i)=>[r,i]));
const WORDS=parseSharedCorpus().words.map(w=>[...w.runes].map(c=>{
  const n=IDS.get(c);assert.notEqual(n,undefined);return n;
}));
assert.equal(WORDS.length,2896);
assert.equal(WORDS.flat().length,12956);
const GROUPS=6;
const M=29;
const SEED=0x9cc17e12;
const ROUNDS=100;
const DIRECTION=["forward","reverse"];
const mod=x=>(x%M+M)%M;
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
/** @param {number} length @param {number} i */
function group(length,i){
  return (length<=5?0:length<=8?1:2)*2+(i<=4?0:1);
}
/** @param {number[]} word @param {number} i @param {"forward"|"reverse"} direction */
function delta(word,i,direction){
  return direction==="forward"
    ?mod(word[i]-word[i-1]-word[i-2])
    :mod(word[i]+word[i-1]-word[i-2]);
}
/**
 * Sufficient 6x29 histogram for every word-local second difference.
 * @param {number[][]} words
 * @param {"forward"|"reverse"} direction
 */
function histogram(words,direction){
  const table=Array.from({length:GROUPS},()=>Array(M).fill(0));
  for(const word of words){
    for(let i=2;i<word.length;i++)table[group(word.length,i)][delta(word,i,direction)]++;
  }
  return table;
}
function total(table){return table.reduce((s,row)=>s+row.reduce((a,b)=>a+b,0),0);}
/** Source-only reference independent of actual LP2 rune labels. */
function train(){
  const src=REFERENCE.slice(0,240000).toUpperCase().match(/[A-Z]+/g)||[];
  const words=src.map(encode).filter(w=>w&&w.length>=3);
  return Object.fromEntries(DIRECTION.map(d=>{
    const counts=histogram(words,d);
    // Modest group shrinkage guards empty cells in the longest-word group.
    const probabilities=counts.map(row=>{
      const sum=row.reduce((a,b)=>a+b,0);
      return row.map(x=>(x+1)/(sum+M));
    });
    return [d,{sourceWords:words.length,sourceSymbols:total(counts),
      groupCounts:counts.map(row=>row.reduce((a,b)=>a+b,0)),
      probabilities}];
  }));
}
/**
 * The exact unconstrained affine output relabeling family:
 * map a*d+b for 1<=a<29 and 0<=b<29. An affine ciphertext
 * permutation induces this relabeling of the differential statistic.
 * @param {number[][]} counts
 * @param {number[][]} probabilities
 */
function score(counts,probabilities){
  const logs=probabilities.map(row=>row.map(p=>Math.log(p*M)));
  let ordinary=0,best=-Infinity,bestA=0,bestB=0;
  const n=total(counts);
  for(let a=1;a<M;a++){
    for(let b=0;b<M;b++){
      let stat=0;
      for(let g=0;g<GROUPS;g++){
        const row=counts[g],lp=logs[g];
        for(let x=0;x<M;x++)stat+=row[x]*lp[(a*x+b)%M];
      }
      if(a===1&&b===0)ordinary=stat;
      if(stat>best){best=stat;bestA=a;bestB=b;}
    }
  }
  return {runes:n,rawLogLR:ordinary,rawPerRune:ordinary/n,
    affineBestLogLR:best,affineBestPerRune:best/n,
    affineOutputMap:{a:bestA,b:bestB}};
}
/** @param {number[][]} words @param {ReturnType<typeof train>} model */
function analyze(words,model){
  return Object.fromEntries(DIRECTION.map(d=>
    [d,score(histogram(words,d),model[d].probabilities)]));
}
function summarize(values,observed){
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const variance=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;
  return {mean,standardDeviation:Math.sqrt(variance),
    min:Math.min(...values),max:Math.max(...values),
    atOrBelowOriginal:values.filter(x=>x<=observed).length,
    atOrAboveOriginal:values.filter(x=>x>=observed).length,
    trials:values.length};
}
/** Independent source-disjoint controls and complete original-cipher analysis. */
function run(trials=ROUNDS){
  assert.ok(Number.isInteger(trials)&&trials>=10);
  const model=train(),real=analyze(WORDS,model);
  const random=rng(SEED),lexicon=loadLexicon();
  const controls=Object.fromEntries(DIRECTION.map(d=>[d,
    {trueKeyRaw:[],trueKeyAffine:[],iidPadRaw:[],iidPadAffine:[]}
  ]));
  let positiveExactSourceWords=0,sourceFallbackWords=0;
  let positiveRewrites=0;
  for(let trial=0;trial<trials;trial++){
    const source=sampleHeldout(lexicon,random);
    sourceFallbackWords+=source.fallbackWordCount;
    const predicted={};
    for(const d of DIRECTION){
      const planted=encipher(source.plaintext,d,random);
      positiveRewrites+=planted.rewrites;
      const outcome=analyze(planted.words,model)[d];
      controls[d].trueKeyRaw.push(outcome.rawPerRune);
      controls[d].trueKeyAffine.push(outcome.affineBestPerRune);
    }
    const iid=encipher(source.plaintext,"iid",random);
    const disconnected=analyze(iid.words,model);
    for(const d of DIRECTION){
      controls[d].iidPadRaw.push(disconnected[d].rawPerRune);
      controls[d].iidPadAffine.push(disconnected[d].affineBestPerRune);
    }
    positiveExactSourceWords+=source.plaintext.length;
  }
  const outcomes={};
  for(const d of DIRECTION){
    const ctrl=controls[d],s=real[d];
    outcomes[d]={
      original:s,
      trueFibonacciSource:{
        raw:summarize(ctrl.trueKeyRaw,s.rawPerRune),
        affine:summarize(ctrl.trueKeyAffine,s.affineBestPerRune)
      },
      independentPerRunePad:{
        raw:summarize(ctrl.iidPadRaw,s.rawPerRune),
        affine:summarize(ctrl.iidPadAffine,s.affineBestPerRune)
      },
      referenceTraining:model[d].groupCounts
    };
  }
  return {
    source:"original LP2, 2896 whole words, 12956 runes, original Shakespeare first240k GP training and disjoint last60k plant",
    dataSHA256:{
      ciphertext:createHash("sha256").update(LP2).digest("hex"),
      english:createHash("sha256").update(REFERENCE).digest("hex")
    },
    hypothesis:"wordwise two-state Fibonacci modulo29 key; full 29-way affine output relabeling also permitted",
    trainingVocabulary:{words:model.forward.sourceWords,transformedRunes:model.forward.sourceSymbols},
    settings:{seed:"0x"+SEED.toString(16),trials,GPmodulus:29,
      exactWordLengthSource:true,groups:"3–5/6–8/9+ runes, positions 2–4 vs >=5"},
    controlPower:{sourceWords:positiveExactSourceWords,
      sourceFallbackWords,
      meanFibonacciRepairEvents:positiveRewrites/(2*trials)},
    outcomes,
    inferenceBoundary:"No recovered original LP2 plaintext. A non-GP source, an unknown nonaffine outer alphabet, altered segmentation, or other key recurrence lies outside this test."
  };
}
if(require.main===module){
  const trials=Number(process.argv[2]||ROUNDS);
  console.log(JSON.stringify(run(trials),null,2));
}
module.exports={group,delta,histogram,train,score,analyze,run};
