"use strict";

/**
 * Source-constrained original GP29 two-marker exception receiver.
 *
 * Model (restricted): for every within-page pair of ciphertext runes,
 *   C[i] = C[i-1]  IFF  P[i] = M_low or M_high;
 * with the marker chosen by the first digit of the original p50 table cell
 * at (global rune i - 1) mod 256. Both markers are fixed for the book.
 * At page starts the preceding rune is unspecified and is not constrained.
 *
 * Stage1 grants the model a *fresh independent English dictionary word at
 * every one of 2,896 original printed positions*, with no common cipher-key
 * constraints except the two markers. We enumerate all 29^2 marker pairs.
 * Stage2 tests every surviving pair against native GP29 English reference
 * frequency, matching the original exact 2,896 word lengths and each word's
 * printed position/class mask, retaining whole-word count variance.
 * A source-native GP29 plant round trips through one complete reversible
 * synthetic encoder using a G/NG marker pair.
 *
 * This tests only the above exact two-marker/low60/GP29-English model.
 * Other plaintext languages, probabilistic exceptions, state-changing
 * markers, alternate clocks, and external key material remain open.
 *
 * Run: node sims/lp2_p50_two_marker_english_source_gate_sft.cjs
 * Node22 CommonJS, built-in modules only; read-only original files.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const source=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const pages=source.pages.filter(p=>p.page<=55&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
const tokens=table.rows.flat();
const runes=new Set(source.runes);
const sourceWords=read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%").replace(/\/\r?\n/g,"")
  .replace(/[\r\n%]/g,"")
  .match(new RegExp("["+source.runes.join("")+"]+","gu"))||[];
assert.equal(original.length,12956);
assert.equal(sourceWords.length,2896);
assert.equal(tokens.length,256);
assert.equal(table.rows.length,32);
assert.equal(tokens[192],"00");
const pageStarts=new Set();
let all=0;
for(const p of pages){pageStarts.add(all);all+=p.indices.length;}

/** @type {{length:number,low:number,high:number,lowEvent:number,highEvent:number}[]} */
const layout=[];
let clock=0;
const observed=[0,0];
let slots=0;
for(const word of sourceWords) {
  let low=0,high=0,lowEvent=0,highEvent=0;
  const length=[...word].length;
  for(let j=0;j<length;j++,clock++){
    if(pageStarts.has(clock))continue;
    const lowClass=tokens[(clock-1)%256][0]==="0";
    const bit=1<<j;
    const equal=original[clock]===original[clock-1];
    if(lowClass){low|=bit;if(equal)lowEvent|=bit;observed[0]+=+equal;}
    else {high|=bit;if(equal)highEvent|=bit;observed[1]+=+equal;}
    slots++;
  }
  layout.push({length,low,high,lowEvent,highEvent});
}
assert.equal(clock,12956);
assert.equal(slots,12901);
assert.deepEqual(observed,[33,53]);
assert.equal(layout.length,2896);
const ordered=source.translit.map((text,index)=>({text,index}))
  .sort((a,b)=>b.text.length-a.text.length);

/** @param {string} value @returns {number[] | null} */
function gp(value) {
  const x=value.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG");
  const out=[];
  for(let i=0;i<x.length;){
    const t=ordered.find(v=>x.startsWith(v.text,i));
    if(!t)return null;
    out.push(t.index);
    i+=t.text.length;
  }
  return out;
}
/** @type {Map<number,{word:number[],masks:Uint16Array}[]>} */
const dictionary=new Map();
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)){
  const match=line.match(/^([a-z]+) (\d+)$/u);
  if(!match||Number(match[2])<8)continue;
  const word=gp(match[1]);
  if(!word||!word.length||word.length>14)continue;
  const masks=new Uint16Array(29);
  word.forEach((symbol,index)=>masks[symbol]|=1<<index);
  if(!dictionary.has(word.length))dictionary.set(word.length,[]);
  dictionary.get(word.length).push({word,masks});
}
assert.ok(dictionary.get(13).length>50);

/**
 * Return how many original printed words admit at least one independent
 * dictionary candidate under each global pair of marker letters.
 *
 * @param {typeof layout} patterns
 * @returns {Uint16Array}
 */
function candidateCoverage(patterns){
  const cov=new Uint16Array(841);
  for(const b of patterns){
    const compatibleHighByLow=new Uint32Array(29);
    for(const entry of dictionary.get(b.length)||[]){
      let lows=0,highs=0;
      for(let symbol=0;symbol<29;symbol++){
        const mask=entry.masks[symbol];
        if((mask&b.low)===b.lowEvent)lows|=1<<symbol;
        if((mask&b.high)===b.highEvent)highs|=1<<symbol;
      }
      if(!highs)continue;
      for(let symbol=0;symbol<29;symbol++)
        if(lows&(1<<symbol))compatibleHighByLow[symbol]|=highs;
    }
    for(let low=0;low<29;low++)
      for(let high=0;high<29;high++)
        if(compatibleHighByLow[low]&(1<<high))cov[low*29+high]++;
  }
  return cov;
}
const covered=candidateCoverage(layout);
const perfect=[];
for(let i=0;i<841;i++)if(covered[i]===2896)perfect.push(i);
assert.equal(perfect.length,39);

/**
 * Reference-model whole-word moments for two marker classes. Each original
 * whole word is sampled from reference words of the exact original length;
 * all positions in a word share that draw, so variance includes their
 * covariance. The language-source sampling assumption is visible and does
 * not claim a universal p-value.
 *
 * @param {string} file
 */
function sourceMoment(file){
  const byLength=new Map();
  let sourceWordCount=0;
  for(const str of read(file).match(/[A-Za-z]+/g)||[]){
    sourceWordCount++;
    const word=gp(str);
    if(!word||!word.length||word.length>14)continue;
    if(!byLength.has(word.length))byLength.set(word.length,[]);
    byLength.get(word.length).push(word);
  }
  const cache=new Map();
  const means=[new Float64Array(29),new Float64Array(29)];
  const variances=[new Float64Array(29),new Float64Array(29)];
  for(const b of layout){
    for(const [kind,mask] of [[0,b.low],[1,b.high]]){
      if(!mask)continue;
      const key=b.length+":"+mask;
      let cached=cache.get(key);
      if(!cached){
        const native=byLength.get(b.length);
        assert.ok(native && native.length, "Missing reference words length "+b.length);
        const sum=new Float64Array(29),sumSq=new Float64Array(29);
        for(const w of native){
          const letterCount=new Uint8Array(29);
          for(let j=0;j<w.length;j++)if(mask&(1<<j))letterCount[w[j]]++;
          for(let symbol=0;symbol<29;symbol++){
            sum[symbol]+=letterCount[symbol];
            sumSq[symbol]+=letterCount[symbol]**2;
          }
        }
        const mean=Array.from(sum,v=>v/native.length);
        const variance=Array.from(sumSq,(v,i)=>v/native.length-mean[i]**2);
        cached={mean,variance};
        cache.set(key,cached);
      }
      for(let symbol=0;symbol<29;symbol++){
        means[kind][symbol]+=cached.mean[symbol];
        variances[kind][symbol]+=cached.variance[symbol];
      }
    }
  }
  const contenders=perfect.map(id=>{
    const low=(id/29)|0,high=id%29;
    const zLow=(observed[0]-means[0][low])/Math.sqrt(variances[0][low]);
    const zHigh=(observed[1]-means[1][high])/Math.sqrt(variances[1][high]);
    return {low:source.translit[low],high:source.translit[high],
      meanLow:means[0][low],meanHigh:means[1][high],
      sdHigh:Math.sqrt(variances[1][high]),zLow,zHigh,
      zSquared:zLow*zLow+zHigh*zHigh};
  }).sort((a,b)=>a.zSquared-b.zSquared);
  const best=contenders[0];
  assert.ok(Math.min(...contenders.map(x=>Math.abs(x.zHigh)))>17);
  const round=v=>Math.round(v*100)/100;
  return {file,sourceWords:sourceWordCount,distinctWordMasks:cache.size,
    minimumAbsHighZ:round(Math.min(...contenders.map(x=>Math.abs(x.zHigh)))),
    bestPair:{low:best.low,high:best.high,
      meanLow:round(best.meanLow),meanHigh:round(best.meanHigh),
      sdHigh:round(best.sdHigh),zLow:round(best.zLow),
      zHigh:round(best.zHigh),sumZSquared:round(best.zSquared)}};
}

/** Positive reversible GP29 two-marker cipher with word-length-matched source
 * dictionary letters. Does not impersonate an original historical cipher. */
function positiveControl(){
  const low=source.translit.indexOf("G");
  const high=source.translit.indexOf("NG");
  assert.ok(low>=0&&high>=0);
  const plain=sourceWords.flatMap((w,i)=>{
    const options=dictionary.get([...w].length);
    return options[(i*7919+17)%options.length].word;
  });
  assert.equal(plain.length,12956);
  const encrypted=[];
  for(let i=0;i<plain.length;i++){
    if(pageStarts.has(i)){encrypted.push(plain[i]);continue;}
    const marker=tokens[(i-1)%256][0]==="0"?low:high;
    if(plain[i]===marker){encrypted.push(encrypted[i-1]);continue;}
    const rank=plain[i]<marker?plain[i]:plain[i]-1;
    const step=rank+1;
    encrypted.push((encrypted[i-1]+step)%29);
  }
  const recovered=[];
  let doublets=0;
  for(let i=0;i<encrypted.length;i++){
    if(pageStarts.has(i)){recovered.push(encrypted[i]);continue;}
    const marker=tokens[(i-1)%256][0]==="0"?low:high;
    const step=(encrypted[i]-encrypted[i-1]+29)%29;
    if(step===0){recovered.push(marker);doublets++;continue;}
    const rank=step-1;
    recovered.push(rank<marker?rank:rank+1);
  }
  assert.deepEqual(recovered,plain);
  assert.ok(doublets>0);
  return {plaintextRunes:plain.length,ciphertextRunes:encrypted.length,
    equalityEvents:doublets,fullReversal:"exact 12956/12956"};
}
const references=[
  sourceMoment("resources/control/shakespeare_first300k.txt"),
  sourceMoment("resources/control/gibran_prophet_58585.txt"),
  sourceMoment("resources/control/emerson_essays_2944.txt")
];
console.log(JSON.stringify({
  scope:"fixed two-marker iff-equality GP29 cipher with original p50 low60 class",
  original:{wordCount:layout.length,runes:original.length,slots,
    leadingZeroEqualityEvents:observed[0],otherEqualityEvents:observed[1],
    allSecretMarkerPairs:841,
    fullyDictionaryWordCompatiblePairs:perfect.length,
    compatibleMarkerPairs:perfect.map(id=>source.translit[(id/29)|0]+"/"+source.translit[id%29])},
  referenceWholeWordMoments:references,
  sourceNativePositive:positiveControl(),
  conclusion:"No marker pair satisfies both exact original word-local equality geometry and the rate of equalities in three length-matched native GP English registers. Conditional model exclusion only, no unknown plaintext."
},null,2));
