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
 * Source-matched native control: each original 1..14-rune
 * printed word independently replaced by a naturally occurring
 * native-English word of the SAME GP29 rune length. This
 * preserves the full original word-length sequence and all 2896
 * true word boundaries. Count F and F-at-word-start.
 * @param {{total:number,start:number}[][]} choices
 * @param {number[]} sourceLengths
 */
function simulate(choices,sourceLengths){
 let seed=0x3301feed;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const trials=5000;
 let sum=0,sumStart=0,sumSquares=0,minTotal=Infinity,minStart=Infinity,
  tailTotal=0,tailStart=0;
 for(let k=0;k<trials;k++){
  let number=0,start=0;
  for(const length of sourceLengths){
   const pool=choices[length];
   assert(pool?.length,"missing source-length-matched native word "+length);
   const pick=pool[Math.floor(random()*pool.length)];
   number+=pick.total;
   start+=pick.start;
  }
  sum+=number;sumStart+=start;sumSquares+=number*number;
  minTotal=Math.min(minTotal,number);minStart=Math.min(minStart,start);
  if(number<=original.total)tailTotal++;
  if(start<=original.atStart)tailStart++;
 }
 return {trials,meanF:sum/trials,meanFAtStart:sumStart/trials,
  minF:minTotal,minFAtStart:minStart,
  expectedFStartAmongF:sumStart/sum,
  hitsAtOrBelowOriginalF:tailTotal,
  hitsAtOrBelowOriginalStartF:tailStart};
}
const sourceLengths=words.map(w=>w.length);
for(const [name,file,expectedCount] of donors){
 const native=(read(file).match(/[A-Za-z]+/g)||[]).map(nativeWord);
 assert.equal(native.length,expectedCount);
 const choices=Array.from({length:15},()=>[]);
 for(const word of native)if(word.length<choices.length){
  choices[word.length].push({
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
