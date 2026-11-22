"use strict";
/**
 * Cicada source HTML title133 + div331 = 464 and prime(464) = 3301.
 * The original 2,896 word lengths and 12,956 runes remain fixed. A secret 464-state
 * alphabet permutes EACH consecutive original first difference mod29, where
 * C[i] = C[i-1] + permutation[phase](P[i]) mod29. The first rune after
 * every reset is transmitted as a free IV/plaintext symbol. This is a
 * source-motivated anti-repeat family rather than a raw-rune substitution.
 * This is a lexical frequency reference (synthetic, not coherent prose),
 * independent of an authored key claim. Node 22; one file; no writes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = (p) => fs.readFileSync(path.join(root, p), "utf8");
const rawCorpus = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"));
const sha = crypto.createHash("sha256").update(rawCorpus).digest("hex");
assert.equal(sha, "7f311254d406b755df39510b8b3f4e53d7dfaea87a0320074c16507d46a07522");
const book = JSON.parse(rawCorpus.toString("utf8"));
const chars = new Map(book.runes.map((r,i) => [r,i]));
const raw = source("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(raw.length, 57);
const words = [], ciphertext = [], originalBegins = [], physicalPages = [];
let current = [], newWord = true;
for (let sourcePage = 0; sourcePage < 55; sourcePage++) {
  const physical = sourcePage < 50 ? sourcePage : sourcePage + 1;
  const decoded = [];
  for (const ch of raw[sourcePage]) {
    if (chars.has(ch)) {
      const val = chars.get(ch);
      ciphertext.push(val);
      decoded.push(val);
      current.push(val);
      originalBegins.push(newWord);
      physicalPages.push(physical);
      newWord = false;
    } else if ("-.&$§".includes(ch)) {
      if (current.length) { words.push(current); current=[]; }
      newWord = true;
    } else {
      assert.ok("/\r\n\t 0123456789".includes(ch), "Unexpected manuscript glyph " + ch);
    }
  }
  assert.deepEqual(decoded, book.pages[physical].indices);
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.equal(ciphertext.length, 12956);
assert.equal(words.reduce((n,w) => n + w.length, 0), 12956);
assert.equal(originalBegins.filter(Boolean).length, words.length);
assert.equal(Math.max(...words.map(w=>w.length)), 14);
const chapterLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const chapters = chapterLengths.flatMap((len,index) => Array(len).fill(index));
assert.equal(chapters.length, ciphertext.length);
const dictionary = book.translit.map((t,i)=>({token:t.toLowerCase(),value:i}))
  .sort((a,b)=>b.token.length-a.token.length);

/** GP29 source spelling, using the same ING, QU, IO aliases as controls. */
function gpToken(word) {
  const normalized = word.toLowerCase().replace(/qu/g,"cw")
    .replace(/ing/g,"ng").replace(/io/g,"ia")
    .replace(/[vkz]/g,(c)=>({v:"u",k:"c",z:"s"})[c]);
  const output=[];
  for(let i=0;i<normalized.length;) {
    const selected=dictionary.find(x=>normalized.startsWith(x.token,i));
    assert.ok(selected,"Unsupported source word "+word);
    output.push(selected.value);
    i+=selected.token.length;
  }
  return output;
}

/** @returns {number[][][]} */
function wordPools(rawText) {
  const pools=Array.from({length:15},()=>[]);
  for(const rawWord of rawText.match(/[A-Za-z]+/g)||[]) {
    const encoded=gpToken(rawWord);
    if(encoded.length<15)pools[encoded.length].push(encoded);
  }
  for(let len=1;len<=14;len++)
    assert.ok(pools[len].length, "No lexical control words of GP rune length "+len);
  return pools;
}
/** Already solved, genuinely Cicada-authored native GP29 rune words. */
function solvedWordPools(rawSource) {
  const solved=JSON.parse(rawSource);
  const pools=Array.from({length:15},()=>[]);
  for(const section of solved.sections) {
    let current=[];
    for(const rune of section.source_text) {
      if(chars.has(rune)) {
        current.push(chars.get(rune));
      } else if(current.length) {
        if(current.length<15)pools[current.length].push(current);
        current=[];
      }
    }
    if(current.length && current.length<15)pools[current.length].push(current);
  }
  for(let length=1;length<=14;length++)
    assert.ok(pools[length].length,"Native solved corpus misses length "+length);
  return pools;
}
function rng(seed) {
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
function nativePlant(pools, seed) {
  const next=rng(seed);
  const output=[];
  for (const sourceWord of words) {
    const options=pools[sourceWord.length];
    const chosen=options[Math.floor(next()*options.length)];
    assert.equal(chosen.length,sourceWord.length);
    output.push(...chosen);
  }
  assert.equal(output.length,ciphertext.length);
  return output;
}
/**
 * Every original rune advances one key position, including across printed word
 * boundaries. Fixed 464 clock phases independent of rune values. No F bypass.
 */
function isStart(reset,i) {
  return i===0||
    (reset==="page"&&physicalPages[i]!==physicalPages[i-1])||
    (reset==="chapter"&&chapters[i]!==chapters[i-1]);
}
function clock(reset) {
  const phases=[], phase=464;
  let counter=0;
  for(let i=0;i<ciphertext.length;i++) {
    if(isStart(reset,i))counter=0;
    // Continuous source rune clock; word boundaries only condition controls.
    phases.push(counter);
    counter=(counter+1)%phase;
  }
  return phases;
}
function coincidence(data,phases) {
  const counts=new Uint16Array(464*29);
  const sizes=new Uint16Array(464);
  for (let i=0;i<data.length;i++) {
    const phase=phases[i];
    const rune=data[i];
    if(rune<0)continue; // first rune at reset has no predecessor
    assert.ok(rune<29);
    counts[29*phase+rune]++;
    sizes[phase]++;
  }
  let equal=0,pairs=0;
  for(const n of counts)equal+=n*(n-1)/2;
  for(const n of sizes)pairs+=n*(n-1)/2;
  return {equal,pairs,rate:equal/pairs};
}
/** Arbitrary independent secret 29! permutation at each of 464 states. */
function invertiblePlant(plaintext, phases, seed, reset) {
  const next=rng(seed);
  const maps=Array.from({length:464},()=>{
    const map=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){const j=Math.floor(next()*(i+1));[map[i],map[j]]=[map[j],map[i]];}
    return map;
  });
  const inverses=maps.map(map=>{
    const out=Array(29);
    map.forEach((n,i)=>{out[n]=i;});
    return out;
  });
  const ciphertextPlant=[];
  for(let i=0;i<plaintext.length;i++){
    ciphertextPlant[i]=isStart(reset,i) ? plaintext[i]
      :(ciphertextPlant[i-1]+maps[phases[i]][plaintext[i]])%29;
  }
  const differences=ciphertextPlant.map((v,i)=>isStart(reset,i)
    ? -1 : (v-ciphertextPlant[i-1]+29)%29);
  const recovered=ciphertextPlant.map((v,i)=>isStart(reset,i)
    ? v : inverses[phases[i]][differences[i]]);
  assert.deepEqual(recovered,plaintext);
  const present=plaintext.map((v,i)=>isStart(reset,i)?-1:v);
  assert.deepEqual(coincidence(differences,phases),coincidence(present,phases));
  return recovered.length;
}

const indexHTML=source("resources/historical/cicada2014-onion7-original-index.html");
assert.match(indexHTML, /<title>133<\/title>/);
assert.match(indexHTML, /<div id="331">/);
assert.equal(133+331,464);
assert.equal(464,16*29);
const resets=["global","chapter","page"];
const phases=resets.map(clock);
const originalDifferences=resets.map(reset=>ciphertext.map((v,i)=>
  isStart(reset,i)?-1:(v-ciphertext[i-1]+29)%29));
const measured=phases.map((ph,k)=>coincidence(originalDifferences[k],ph));
assert.deepEqual(measured.map(x=>x.equal),[6050,6121,11006]);
assert.ok(measured.every(x=>x.pairs>0));
const refs=[
 ["Gibran",wordPools(source("resources/control/gibran_prophet_58585.txt"))],
 ["Shakespeare",wordPools(source("resources/control/shakespeare_first300k.txt"))],
 ["AuthenticSolvedCicadaGP",solvedWordPools(
   source("resources/external/relikd-solved-gp29-native-v1.json"))]
];
const reports=[];
for(const [name,pools] of refs) {
  const scores=phases.map(()=>[]);
  let positive=null;
  for(let seedIndex=0;seedIndex<64;seedIndex++) {
    const runSeed=(0x33012026+seedIndex*1013904223)>>>0;
    const native=nativePlant(pools,runSeed);
    if(seedIndex===0)positive=phases.map((ph,k)=>
      invertiblePlant(native,ph,0x3301caca+k,resets[k]));
    for(let k=0;k<phases.length;k++){
      const aligned=native.map((v,i)=>isStart(resets[k],i)?-1:v);
      scores[k].push(coincidence(aligned,phases[k]).equal);
    }
  }
  const clocks=scores.map((array,i)=>{
    const min=Math.min(...array),max=Math.max(...array);
    const mean=array.reduce((sum,x)=>sum+x,0)/array.length;
    assert.ok(min>measured[i].equal,
      "At least one length-matched native control no stronger than original");
    return {
      reset:resets[i], originalEqual:measured[i].equal,
      originalPossiblePairs:measured[i].pairs,
      sourceNativeEqualMin:min, sourceNativeEqualMax:max,
      sourceNativeEqualMean:mean, count:array.length,
      sourceNativeAtOrBelowOriginal:array.filter(x=>x<=measured[i].equal).length
    };
  });
  reports.push({
    independentCorpus:name,
    originalSourceWordLengthSequence:words.length,
    originalSourceRuneCount:ciphertext.length,
    lengthMatchedIndependentNativeControls:64,
    exactSecret464DifferenceAlphabetsRecoveredByClock:positive,
    clocks
  });
}
console.log(JSON.stringify({
  classification:"2014-original HTML 133+331 source-conditioned 464-period all-key predecessor-difference invariant; no plaintext",
  assumption:"Cumulative predecessor-difference GP29 cipher with one unknown full permutation per 464 rune phases; free initial rune at book/chapter/page reset; source word geometry fixed",
  controls:"Exact original 2896-word GP length profile; independent source-native Shakespeare, Gibran or actual solved Cicada-GP word occurrences per length",
  plaintextCoherence:"Control words independently resampled, not syntactically connected text",
  corpusSHA256:sha,
  results:reports
},null,2));
console.log("PASS original 464-state predecessor-difference allsecret native-word-shape gate");
