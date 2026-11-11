"use strict";
/**
 * Issue #356: collision-class invariants of all 2,896 original LP2 rune words.
 * Test: node sims/lp2_word_collision_injective_sft.cjs
 *
 * A deterministic injective word encoder preserves all equality classes;
 * source-normalized English GP controls and independent per-occurrence pads
 * discriminate it without searching a key or making plaintext guesses.
 *
 * @module lp2_word_collision_injective_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const RUNES_SET = new Set(RUNES);
const N = 1000;
const SEED = 0x4c503335;
const SOURCES = [
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
/** @param {string} f */
function read(f) {
  return fs.readFileSync(path.join(ROOT,f),"utf8");
}
/** @param {string} raw @returns {string[]} */
function unknownRuneWords(raw) {
  let runesSeen=0,word="",words=[];
  const finish=()=>{
    if(!word)return;
    if(runesSeen<=12956)words.push(word);
    word="";
  };
  for(const ch of raw) {
    if(RUNES_SET.has(ch)) {
      word+=ch;
      runesSeen++;
    } else if ("-.&$§".includes(ch)) finish();
    // / and % are line/page boundaries, not rune-word boundaries.
  }
  finish();
  assert.equal(words.length,2896);
  assert.equal(words.join("").length,12956);
  return words;
}
/** @param {string} raw English source word @returns {string} GP spelling */
function normalizeGP(raw) {
  const word=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const digraph={TH:"@",EO:"#",OE:"+",AE:"%",IA:"^",EA:"~",NG:"!"};
  let result="";
  for(let i=0;i<word.length;) {
    if(word.startsWith("ING",i)) {
      result+="!";
      i+=3;
    } else if(digraph[word.slice(i,i+2)]) {
      result+=digraph[word.slice(i,i+2)];
      i+=2;
    } else {
      result+=word[i++];
    }
  }
  return result;
}
/** @param {string} file @returns {Map<number,string[]>} */
function sourcePools(file) {
  let text=read(file);
  if(file.includes("lp1-plaintext")) {
    text=text.split(/^###\s*56\s*$/m)[0]
      .replace(/\[[^\]]+\]/g," ")
      .replace(/^\s*###.*$/gm," ")
      .replace(/^\s*[0-9a-f ]{16,}$/gmi," ")
      .replace(/^\s*[0-9 ]{8,}$/gm," ");
    // Add the exactly solved second-release Parable so the authentic solved
    // corpus covers native words of GP length 14 as the full original does.
    text+="\nPARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
  }
  const pools=new Map();
  for(const token of text.match(/[A-Za-z]+/g)||[]) {
    const w=normalizeGP(token);
    if(!pools.has(w.length))pools.set(w.length,[]);
    pools.get(w.length).push(w);
  }
  return pools;
}
/** @param {string[]} words @returns {object} */
function metrics(words) {
  const byLength=new Map();
  for(const w of words) {
    const l=w.length;
    if(!byLength.has(l))byLength.set(l,new Map());
    const freq=byLength.get(l);
    freq.set(w,(freq.get(w)||0)+1);
  }
  let pairs=0,longPairs=0,shortPairs=0,distinct=0,singleDistinct=0;
  const byLengthRows=[];
  for(const [length,freq] of [...byLength].sort((a,b)=>a[0]-b[0])) {
    const m=[...freq.values()];
    const n=m.reduce((a,b)=>a+b,0);
    const collisions=m.reduce((a,b)=>a+b*(b-1)/2,0);
    const repeatedTypes=m.filter(x=>x>1).length;
    pairs+=collisions;
    if(length>=4)longPairs+=collisions;
    else shortPairs+=collisions;
    distinct+=freq.size;
    if(length===1)singleDistinct=freq.size;
    byLengthRows.push({length,words:n,distinct:freq.size,
      collisionPairs:collisions,repeatedTypes});
  }
  return {pairs,longPairs,shortPairs,distinct,singleDistinct,byLengthRows};
}
/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x=seed>>>0;
  return()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return x>>>0;
  };
}
/**
 * @param {Map<number,number>} counts
 * @param {Map<number,string[]>} pool
 * @param {()=>number} next
 * @returns {string[]}
 */
function matchedSample(counts,pool,next) {
  const out=[];
  for(const [length,count] of counts) {
    const candidates=pool.get(length);
    assert.ok(candidates?.length, "Source lacks GP length "+length);
    for(let i=0;i<count;i++)out.push(candidates[next()%candidates.length]);
  }
  return out;
}
/** @param {Map<number,number>} counts @param {()=>number} next @param {boolean} avoidRepeat */
function independentPad(counts,next,avoidRepeat) {
  const out=[];
  for(const [length,count] of counts)
    for(let j=0;j<count;j++) {
      let word="",previous=-1;
      for(let k=0;k<length;k++) {
        let symbol=next()%29;
        if(avoidRepeat && symbol===previous)symbol=(symbol+1+next()%28)%29;
        word+=RUNES[symbol];
        previous=symbol;
      }
      out.push(word);
    }
  return out;
}
/**
 * Assign a deterministic injective GP29 word to each distinct source word
 * while retaining length. This construction must preserve collision counts.
 * @param {string[]} words @returns {string[]}
 */
function plantedInjectiveWordCodebook(words) {
  const maps=new Map(),allocated=new Map();
  for(const w of words) {
    if(!allocated.has(w.length))allocated.set(w.length,0);
    const key=w.length+":"+w;
    if(maps.has(key))continue;
    let n=allocated.get(w.length);
    const a=Array(w.length).fill(RUNES[0]);
    for(let i=w.length-1;i>=0;i--) {
      a[i]=RUNES[n%29];
      n=Math.floor(n/29);
    }
    assert.equal(n,0,"Source word inventory exceeds alphabet capacity");
    maps.set(key,a.join(""));
    allocated.set(w.length,allocated.get(w.length)+1);
  }
  return words.map(w=>maps.get(w.length+":"+w));
}
function quantiles(observations,original) {
  const out={};
  for(const field of ["pairs","longPairs","shortPairs","distinct","singleDistinct"]) {
    const vals=observations.map(x=>x[field]).sort((a,b)=>a-b);
    out[field]={min:vals[0],p05:vals[49],median:vals[499],
      p95:vals[949],max:vals.at(-1),
      leObserved:vals.filter(x=>x<=original[field]).length};
  }
  return out;
}
function run() {
  const originalWords=unknownRuneWords(
    read("resources/liber-primus/lp2-transcription.txt"));
  const original=metrics(originalWords);
  assert.equal(original.pairs,230);
  assert.equal(original.longPairs,0);
  assert.equal(original.distinct,2731);
  assert.equal(original.singleDistinct,28);
  const counts=new Map(original.byLengthRows.map(x=>[x.length,x.words]));
  const next=rng(SEED);
  const results=[];
  for(const file of SOURCES) {
    const pool=sourcePools(file),obs=[];
    for(let trial=0;trial<N;trial++) {
      const sample=matchedSample(counts,pool,next);
      const a=metrics(sample);
      if(trial===0) {
        const encoded=plantedInjectiveWordCodebook(sample);
        assert.deepEqual(metrics(encoded),a,
          "Any injective deterministic word substitution must preserve all equality classes");
      }
      obs.push(a);
    }
    assert.ok(Math.min(...obs.map(x=>x.longPairs))>0);
    results.push({source:file,sourceWordCount:[...pool.values()]
      .reduce((n,p)=>n+p.length,0),matchedTrials:N,
      quantiles:quantiles(obs,original)});
  }
  for(const avoidRepeat of [false,true]) {
    const obs=[];
    for(let trial=0;trial<N;trial++) {
      obs.push(metrics(independentPad(counts,next,avoidRepeat)));
    }
    results.push({source:avoidRepeat?"iid GP29 (within-word no-repeat)":
      "iid GP29 (unfiltered)",matchedTrials:N,
      quantiles:quantiles(obs,original)});
  }
  console.log(JSON.stringify({unknownWords:originalWords.length,
    GP29AlphabetSize:29,original,seed:SEED,
    controlTrialCount:N,sources:results},null,2));
}
if(require.main===module)run();
module.exports={unknownRuneWords,normalizeGP,metrics,matchedSample,
  independentPad,plantedInjectiveWordCodebook,run};
