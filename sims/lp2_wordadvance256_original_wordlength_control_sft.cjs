"use strict";
/**
 * LP2 #1341 follow-up: make the 256-secret-alphabet invariant robust to the
 * printed WORD LENGTHS, not just its source event positions. The original
 * page/word architecture is held exactly; every native source word is
 * independently sampled from a length-matched Shakespeare/Gibran occurrence.
 *
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
 * Word start always adds a key step except at the first rune of a reset
 * segment. Fixed 256 clock phases independent of rune values. No F bypass.
 */
function clock(reset) {
  const phases=[], phase=256;
  let counter=0;
  for(let i=0;i<ciphertext.length;i++) {
    const resetNow=i===0||
      (reset==="page"&&physicalPages[i]!==physicalPages[i-1])||
      (reset==="chapter"&&chapters[i]!==chapters[i-1]);
    if(resetNow)counter=0;
    if(!resetNow&&originalBegins[i])counter=(counter+1)%phase;
    phases.push(counter);
    counter=(counter+1)%phase;
  }
  return phases;
}
function coincidence(data,phases) {
  const counts=new Uint16Array(256*29);
  const sizes=new Uint16Array(256);
  for (let i=0;i<data.length;i++) {
    const phase=phases[i];
    const rune=data[i];
    assert.ok(rune>=0&&rune<29);
    counts[29*phase+rune]++;
    sizes[phase]++;
  }
  let equal=0,pairs=0;
  for(const n of counts)equal+=n*(n-1)/2;
  for(const n of sizes)pairs+=n*(n-1)/2;
  return {equal,pairs,rate:equal/pairs};
}
/** Arbitrary independent secret 29! permutation at each of 256 states. */
function invertiblePlant(plaintext, phases, seed) {
  const next=rng(seed);
  const maps=Array.from({length:256},()=>{
    const map=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--){const j=Math.floor(next()*(i+1));[map[i],map[j]]=[map[j],map[i]];}
    return map;
  });
  const inverses=maps.map(map=>{
    const out=Array(29);
    map.forEach((n,i)=>{out[n]=i;});
    return out;
  });
  const ciphertextPlant=plaintext.map((val,i)=>maps[phases[i]][val]);
  const recovered=ciphertextPlant.map((val,i)=>inverses[phases[i]][val]);
  assert.deepEqual(recovered,plaintext);
  assert.deepEqual(coincidence(ciphertextPlant,phases),coincidence(plaintext,phases));
  return recovered.length;
}
const resets=["global","chapter","page"];
const phases=resets.map(clock);
const measured=phases.map(ph=>coincidence(ciphertext,ph));
assert.deepEqual(measured.map(x=>x.equal),[11199,11199,12291]);
assert.deepEqual(measured.map(x=>x.pairs),[322515,323233,353012]);
const refs=[
 ["Gibran",wordPools(source("resources/control/gibran_prophet_58585.txt"))],
 ["Shakespeare",wordPools(source("resources/control/shakespeare_first300k.txt"))]
];
const reports=[];
for(const [name,pools] of refs) {
  const scores=phases.map(()=>[]);
  let positive=null;
  for(let seedIndex=0;seedIndex<256;seedIndex++) {
    const runSeed=(0x33012026+seedIndex*1013904223)>>>0;
    const native=nativePlant(pools,runSeed);
    if(seedIndex===0)positive=invertiblePlant(native,phases[0],0x3301caca);
    for(let k=0;k<phases.length;k++)scores[k].push(coincidence(native,phases[k]).equal);
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
    lengthMatchedIndependentNativeControls:256,
    exactSecret256AlphabetRecovered:positive,
    clocks
  });
}
console.log(JSON.stringify({
  classification:"Original word-length-conditioned necessary invariant; no plaintext",
  assumption:"One independent secret GP29 substitution for each 256 phase; +1 key position at each genuine original word start",
  controls:"Exact original 2896-word GP length profile; independent sampled native Shakespeare or Gibran word occurrences per length",
  plaintextCoherence:"Control words independently resampled, not syntactically connected text",
  corpusSHA256:sha,
  results:reports
},null,2));
console.log("PASS source-word-length matched all-secret 256-phase original gate");
