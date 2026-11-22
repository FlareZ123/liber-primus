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

/**
 * Original source-printed rune-page groups, assigning a word crossing %
 * to its original starting page. There are 55 nonempty unsolved rune pages;
 * physical p50 is the excluded numerical-only source page.
 * @param {string} raw
 * @returns {string[][]}
 */
function originalPageWordGroups(raw) {
  const groups=Array.from({length:55},()=>[]);
  let page=0,start=0,word="";
  const flush=()=>{
    if(!word)return;
    if(start<55)groups[start].push(word);
    word="";
  };
  for(const ch of raw) {
    if(RUNES_SET.has(ch)) {
      if(!word)start=page;
      word+=ch;
    } else if(ch==="%") {
      page++;
    } else if("-.&$§".includes(ch)) {
      flush();
    }
  }
  flush();
  assert.equal(groups.flat().length,2896);
  assert.equal(groups.flat().join("").length,12956);
  return groups;
}
/**
 * Collision pairs for globally distinct per-page word vocabularies. Any
 * injective map may change independently between pages while conserving
 * this partition on each individual page.
 * @param {string[][]} groups
 */
function perPageCollisionMetrics(groups) {
  let pairs=0,longPairs=0,pagesWithoutRepeats=0;
  const pairsByPage=[],pairsByLength={};
  for(const words of groups) {
    const freq=new Map();
    for(const word of words)freq.set(word,(freq.get(word)||0)+1);
    let local=0;
    for(const [word,n] of freq) {
      const collisions=n*(n-1)/2;
      local+=collisions;
      if(word.length>=4)longPairs+=collisions;
      pairsByLength[word.length]=(pairsByLength[word.length]||0)+collisions;
    }
    pairs+=local;
    pairsByPage.push(local);
    if(!local)pagesWithoutRepeats++;
  }
  return {pairs,longPairs,pagesWithoutRepeats,pairsByPage,pairsByLength};
}
/**
 * @param {string[][]} target
 * @param {Map<number,string[]>} pools
 * @param {()=>number} next
 * @returns {string[][]}
 */
function matchedPageSample(target,pools,next) {
  return target.map(words=>words.map(w=>{
    const pool=pools.get(w.length);
    assert.ok(pool?.length, "Missing source GP length "+w.length);
    return pool[next()%pool.length];
  }));
}
/** @param {object[]} obs @param {object} original */
function pageQuantiles(obs,original) {
  const out={};
  for(const field of ["pairs","longPairs","pagesWithoutRepeats"]) {
    const values=obs.map(o=>o[field]).sort((a,b)=>a-b);
    out[field]={min:values[0],p05:values[99],median:values[999],
      p95:values[1899],max:values.at(-1),
      leOriginal:values.filter(v=>v<=original[field]).length,
      geOriginal:values.filter(v=>v>=original[field]).length};
  }
  return out;
}


/** Original source-printed rune lines, with words assigned to starting line.
 * @param {string} raw @returns {string[][]} */
function originalPrintedLineWordGroups(raw) {
  const lines=[];let word="",start=0;
  const flush=()=>{if(word){lines[start].push(word);word="";}};
  for(const page of raw.split("%").slice(0,55))
    for(const printed of page.split("/")) {
      if(![...printed].some(ch=>RUNES_SET.has(ch)))continue;
      const index=lines.length;lines.push([]);
      for(const ch of printed) {
        if(RUNES_SET.has(ch)){if(!word)start=index;word+=ch;}
        else if("-.&$§".includes(ch))flush();
      }
    }
  flush();
  assert.equal(lines.length,594);
  assert.equal(lines.flat().length,2896);
  assert.equal(lines.flat().join("").length,12956);
  return lines;
}

function run() {
  const originalWords=unknownRuneWords(
    read("resources/liber-primus/lp2-transcription.txt"));
  const original=metrics(originalWords);
  const pageGroups=originalPageWordGroups(
    read("resources/liber-primus/lp2-transcription.txt"));
  assert.deepEqual(pageGroups.flat(),originalWords);
  const pageObserved=perPageCollisionMetrics(pageGroups);
  assert.equal(pageGroups.length,55);
  assert.equal(pageObserved.pairs,4);
  assert.equal(pageObserved.longPairs,0);
  assert.equal(pageObserved.pagesWithoutRepeats,51);
  const printedLines=originalPrintedLineWordGroups(
    read("resources/liber-primus/lp2-transcription.txt"));
  assert.deepEqual(printedLines.flat(),originalWords);
  const lineObserved=perPageCollisionMetrics(printedLines);
  assert.equal(lineObserved.pairs,1);
  assert.equal(lineObserved.longPairs,0);
  assert.equal(lineObserved.pagesWithoutRepeats,593);
  // Exact iid-GP29 expected collision pairs, conditional on the original
  // printed-line GP word lengths, without any fitted language parameter.
  const iidLineExpectation=printedLines.reduce((total,line)=>{
    const byLength=new Map();
    for(const w of line)byLength.set(w.length,(byLength.get(w.length)||0)+1);
    for(const [length,count] of byLength)
      total += count*(count-1)/2/29**length;
    return total;
  },0);
  assert.ok(Math.abs(iidLineExpectation-0.2577481406171682)<1e-10);
  assert.deepEqual(printedLines[84].slice(1,3),["ᛞᛝ","ᛞᛝ"]);

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
  // A second, stricter key-independent invariant even when the secret
  // word codebook is allowed to change arbitrarily at each physical page.
  const pageNext=rng(0x503331),pageSources=[];
  for(const file of SOURCES) {
    const pool=sourcePools(file),observations=[];
    for(let i=0;i<2000;i++) {
      const planted=matchedPageSample(pageGroups,pool,pageNext);
      if(i===0) {
        const code=plantedInjectiveWordCodebook(planted.flat());
        let cursor=0;
        const replanted=planted.map(g=>{
          const words=code.slice(cursor,cursor+g.length);
          cursor+=g.length;
          return words;
        });
        assert.deepEqual(perPageCollisionMetrics(replanted),
          perPageCollisionMetrics(planted),
          "An injective source-native whole-word map retains page collision partitions");
      }
      observations.push(perPageCollisionMetrics(planted));
    }
    assert.ok(Math.min(...observations.map(x=>x.pairs))>pageObserved.pairs);
    pageSources.push({source:file,trials:observations.length,
      quantiles:pageQuantiles(observations,pageObserved)});
  }
  // Freeze and test 594 individual original printed-line dictionaries.
  const nextLine=rng(0x5033301),lineSources=[];
  for(const file of SOURCES) {
    const pools=sourcePools(file),obs=[];
    for(let trial=0;trial<2000;trial++) {
      const sample=matchedPageSample(printedLines,pools,nextLine);
      if(trial===0) {
        const encoded=plantedInjectiveWordCodebook(sample.flat());
        let cursor=0;
        const planted=sample.map(line=>{
          const words=encoded.slice(cursor,cursor+line.length);
          cursor+=line.length;return words;
        });
        assert.deepEqual(perPageCollisionMetrics(planted),
          perPageCollisionMetrics(sample),"A line-static injective map must preserve line collisions");
      }
      obs.push(perPageCollisionMetrics(sample));
    }
    assert.ok(Math.min(...obs.map(x=>x.pairs))>lineObserved.pairs);
    lineSources.push({source:file,trials:obs.length,
      quantiles:pageQuantiles(obs,lineObserved)});
  }
  console.log(JSON.stringify({unknownWords:originalWords.length,
    GP29AlphabetSize:29,original,seed:SEED,
    controlTrialCount:N,sources:results,
    pageLocal:{runePages:55,original:pageObserved,
      sourceSeed:"0x503331",sources:pageSources},
    lineLocal:{runeLines:594,
      iidGP29ExpectedCollisions:iidLineExpectation,
      solePrintedLinePair:{zeroBasedLine:84,physicalPage:7,
        originalGPWord:"ᛞᛝ",runeOffsets:[1800,1802]},
      original:{
      pairs:lineObserved.pairs,longPairs:lineObserved.longPairs,
      linesWithoutRepeats:lineObserved.pagesWithoutRepeats,
      pairsByLength:lineObserved.pairsByLength},
      sourceSeed:"0x5033301",sources:lineSources}},null,2));
}
if(require.main===module)run();
module.exports={unknownRuneWords,normalizeGP,metrics,matchedSample,
  independentPad,plantedInjectiveWordCodebook,
  originalPageWordGroups,originalPrintedLineWordGroups,
  perPageCollisionMetrics,matchedPageSample,run};
