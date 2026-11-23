"use strict";
/**
 * Original LP2 #2083-adjacent structural gate: is a zero ciphertext
 * predecessor difference a *literal* F interrupter, as solved 2014
 * Cicada used? This is conditional on native-GP plaintext and source
 * printed words retaining actual plaintext word boundaries.
 *
 * Read-only Windows Node.js 22 / CommonJS:
 * node sims/agent43_delta0_f_literal_wordshape_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIds=new Map(gp.runes.map((x,i)=>[x,i]));
const mod=x=>((x%29)+29)%29;
const parsed=parseSharedCorpus();
const words=parsed.words.map(w=>[...w.runes].map(x=>runeIds.get(x)));
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.crossPageWords,32);
assert.deepEqual(words.flat(),gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
assert.equal(gp.translit[0],"F");

/** @param {number[][]} textWords */
function equalPredecessors(textWords){
 let previous=-1,total=0,atStart=0;
 const byPos=new Array(15).fill(0);
 for(const word of textWords){
  for(let i=0;i<word.length;i++){
   const current=word[i];
   if(current===previous){
    total++;
    if(i===0)atStart++;
    byPos[i]++;
   }
   previous=current;
  }
 }
 return {total,atStart,byPos};
}
const original=equalPredecessors(words);
assert.equal(original.total,86);
assert.equal(original.atStart,23);
assert.deepEqual(original.byPos.slice(0,12),[23,12,21,7,8,6,5,1,2,0,0,1]);

/* Literal F-bypass candidate: the solved author-authentic Cicada
 * systems preserve F as a special rune. If the original unknown
 * ciphertext instead cumulative-sums plaintext GP ordinals, with
 * any secret nonzero-rune bijection fixing F to step0, each *and
 * every* C_i=C_(i-1) marks literal F, without needing the key.
 * This is an explicit, falsifiable candidate, not an authored LP2
 * instruction. */
const plant=gp.pages[57].indices;
assert.equal(plant.length,95);
let state=0;
const ciphertext=plant.map(p=>(state=mod(state+p)));
let previous=0;
const positive=ciphertext.map(c=>{const p=mod(c-previous);previous=c;return p});
assert.deepEqual(positive,plant);
assert.equal(ciphertext.filter((c,i)=>c=== (i===0?0:ciphertext[i-1])).length,
 plant.filter(x=>x===0).length);

const orderedSpell=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function nativeWord(word){
 const s=word.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const output=[];
 for(let i=0;i<s.length;){
  if(s.startsWith("ING",i)){output.push(21);i+=3;}
  else if(s.startsWith("IO",i)){output.push(27);i+=2;}
  else{
   const x=orderedSpell.find(z=>s.startsWith(z.s,i));
   assert(x,"unmapped GP rune from "+word);
   output.push(x.i);
   i+=x.s.length;
  }
 }
 return output;
}
const donors=[
 ["Gibran", "resources/control/gibran_prophet_58585.txt",15733],
 ["Shakespeare","resources/control/shakespeare_first300k.txt",55407],
 ["Emerson","resources/control/emerson_essays_2944.txt",77932]
];

/**
 * Complete source-word-length and native-rune conditional mean,
 * variance, start-site variance and covariance for EACH of the
 * 29 GP symbols. This eliminates a secret-symbol-choice loophole:
 * any fixed bijection from plaintext rune to ciphertext delta
 * must designate some ONE GP rune as delta0.
 *
 * @param {{word:number[],total:number,start:number}[][]} choices
 * @param {number[]} sourceLengths
 * @returns {{mean:number,meanStart:number,variance:number,varianceStart:number,covariance:number}[]}
 */
function profilesFor(choices,sourceLengths){
 const countByLength=new Map();
 for(const n of sourceLengths)countByLength.set(n,(countByLength.get(n)||0)+1);
 const moments=Array.from({length:29},()=>({
  mean:0,meanStart:0,variance:0,varianceStart:0,covariance:0
 }));
 for(const [n,number] of countByLength){
  const sample=choices[n];
  assert(sample?.length,"missing independent native length "+n);
  for(let letter=0;letter<29;letter++){
   let sum=0,head=0,sumsq=0,headSquare=0,cross=0;
   for(const pick of sample){
    const x=pick.word.filter(c=>c===letter).length;
    const y=Number(pick.word[0]===letter);
    sum+=x;head+=y;sumsq+=x*x;headSquare+=y*y;cross+=x*y;
   }
   const N=sample.length,mean=sum/N,meanStart=head/N,p=moments[letter];
   p.mean+=number*mean;
   p.meanStart+=number*meanStart;
   p.variance+=number*(sumsq/N-mean*mean);
   p.varianceStart+=number*(headSquare/N-meanStart*meanStart);
   p.covariance+=number*(cross/N-mean*meanStart);
  }
 }
 return moments;
}

/**
 * Minimum source-conditioned 2D Mahalanobis distance over all
 * possible secret mappings delta0 -> one GP plaintext rune.
 * No plaintext letter assignment is fitted into the output;
 * min over all 29 is the *optimistic* secret-key control.
 * @param {number[]} counts
 * @param {number[]} starts
 * @param {ReturnType<typeof profilesFor>} profiles
 */
function minDistance(counts,starts,profiles){
 let min=Infinity,which=-1;
 for(let letter=0;letter<29;letter++){
  const m=profiles[letter];
  const det=m.variance*m.varianceStart-m.covariance*m.covariance;
  if(det<1e-8)continue;
  const x=counts[letter]-m.mean;
  const y=starts[letter]-m.meanStart;
  const square=Math.max(0,(m.varianceStart*x*x+m.variance*y*y-2*m.covariance*x*y)/det);
  if(square<min){min=square;which=letter}
 }
 return {square:min,letter:which,translit:gp.translit[which]};
}

/**
 * Source-matched native control: replace each of the original
 * 2,896 printed words with an independently sampled native-English
 * word of exactly the same GP29 rune length. Every replicate
 * preserves all original word slots and length counts.
 *
 * Compute the original F gate AND family-wise 29-symbol secret
 * mapping null on complete synthetic native books, with no
 * alphabet parameter fitted to the source ciphertext.
 * @param {{word:number[],total:number,start:number}[][]} choices
 * @param {number[]} sourceLengths
 */
function simulate(choices,sourceLengths){
 let seed=0x3301feed;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const trials=5000,profiles=profilesFor(choices,sourceLengths);
 const originalCounts=Array(29).fill(original.total);
 const originalStarts=Array(29).fill(original.atStart);
 const originalBest=minDistance(originalCounts,originalStarts,profiles);
 let sum=0,sumStart=0,minTotal=Infinity,minStart=Infinity,
  tailTotal=0,tailStart=0,tailAnySecret=0,maxNativeMinDistance=0;
 for(let k=0;k<trials;k++){
  const symbols=new Array(29).fill(0),starts=new Array(29).fill(0);
  for(const length of sourceLengths){
   const pool=choices[length];
   const pick=pool[Math.floor(random()*pool.length)];
   for(const rune of pick.word)symbols[rune]++;
   starts[pick.word[0]]++;
  }
  const number=symbols[0],start=starts[0];
  sum+=number;sumStart+=start;
  minTotal=Math.min(minTotal,number);minStart=Math.min(minStart,start);
  if(number<=original.total)tailTotal++;
  if(start<=original.atStart)tailStart++;
  const trialBest=minDistance(symbols,starts,profiles);
  maxNativeMinDistance=Math.max(maxNativeMinDistance,trialBest.square);
  if(trialBest.square>=originalBest.square)tailAnySecret++;
 }
 assert(originalBest.square>20,"unexpected new plausible letter mapping");
 assert.equal(tailAnySecret,0);
 return {trials,meanF:sum/trials,meanFAtStart:sumStart/trials,
  minF:minTotal,minFAtStart:minStart,
  expectedFStartAmongF:sumStart/sum,
  hitsAtOrBelowOriginalF:tailTotal,
  hitsAtOrBelowOriginalStartF:tailStart,
  bestOf29PlaintextRune:originalBest,
  nativeMaxMinDistance:maxNativeMinDistance,
  nativeCountAsExtremeAsActualUnderAnySecretRune:tailAnySecret};
}
const sourceLengths=words.map(w=>w.length);
for(const [name,file,expectedCount] of donors){
 const native=(read(file).match(/[A-Za-z]+/g)||[]).map(nativeWord);
 assert.equal(native.length,expectedCount);
 const choices=Array.from({length:15},()=>[]);
 for(const word of native)if(word.length<choices.length){
  choices[word.length].push({
   word,
   total:word.filter(v=>v===0).length,
   start:Number(word[0]===0)
  });
 }
 const trial=simulate(choices,sourceLengths);
 assert.equal(trial.hitsAtOrBelowOriginalF,0);
 assert.equal(trial.hitsAtOrBelowOriginalStartF,0);
 assert(trial.meanF>200&&trial.meanF<310);
 console.log(JSON.stringify({donor:name,nativeWords:native.length,...trial}));
}
console.log(JSON.stringify({originalDeltaZero:original,solvedNativeF:plant.filter(v=>v===0).length,
 sourceWordCount:sourceLengths.length,sourceRunes:parsed.runeCount}));
console.log("PASS: exact source delta0 and native p57 cumulative-positive; literal F step0 cannot plausibly explain original 86 sites if printed words remain English plaintext words.");
