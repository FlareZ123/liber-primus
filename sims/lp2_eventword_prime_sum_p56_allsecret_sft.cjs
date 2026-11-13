"use strict";
/** Exact all-secret fixed-GP29-bijection exclusion for word-sum carrier
 * of the 85 original LP2 event-bearing words versus the authentic p56 AN END
 * 85-rune plaintext. Source-native readout only; no file writes.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcript=fs.readFileSync(path.join(__dirname,
  "../resources/lp2-transcription.txt"),"utf8");
const local=transcript.split("\n§")[0].split("\n$\n")
  .slice(0,-2).join("\n$\n").replace(/[\/%\r\n]/g,"");
const positions=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=local.split(/[-.&$§]+/).map(part=>[...part]
  .filter(r=>positions.has(r)).map(r=>positions.get(r))).filter(w=>w.length);
assert.equal(words.length,2896);
const pages=corpus.pages.filter(p=>p.page<=55),original=pages.flatMap(p=>p.indices);
assert.deepEqual(words.flat(),original);
const pageStarts=new Set();
let absolute=0;
for (const p of pages) {
  pageStarts.add(absolute);
  absolute+=p.indices.length;
}
const carriers=[];
let start=0;
for (const word of words) {
  let isCarrier=false;
  for (let i=0;i<word.length;i++) {
    const here=start+i;
    if (here>0&&!pageStarts.has(here)&&original[here]===original[here-1])
      isCarrier=true;
  }
  if (isCarrier) carriers.push(word);
  start+=word.length;
}
assert.equal(carriers.length,85);
const primeSums=carriers.map(word=>word
  .reduce((sum,v)=>sum+corpus.prime[v],0)%29);

/** @param {number[]} symbols @returns {number[]} */
function histogram(symbols) {
  const bins=Array(29).fill(0);
  for(const v of symbols)bins[v]++;
  return bins.sort((a,b)=>b-a);
}
const solvedCipher=corpus.pages[56].indices;
assert.equal(solvedCipher.length,85);
const primes=[];
for(let n=2;primes.length<85;n++)if(primes.every(p=>n%p!==0))primes.push(n);
let clock=0;
const solved=solvedCipher.map((v,i)=>i===56?v:
  (v-(primes[clock++]-1)+29*100)%29);
assert.deepEqual(solved.slice(0,5),[24,9,18,9,23]); // ANEND
assert.equal(clock,84);
const sourceHist=histogram(primeSums),plaintextHist=histogram(solved);
assert.equal(sourceHist[0],5);
assert.equal(plaintextHist[0],16);
assert.notDeepEqual(sourceHist,plaintextHist);
console.log(JSON.stringify({
  originalCipherRunes:original.length,sourcePrintedWords:words.length,
  originalEventWords:carriers.length,authenticP56PlaintextRunes:solved.length,
  sourceWordPrimeSumMod29HistogramSorted:sourceHist,
  solvedP56HistogramSorted:plaintextHist,
  maxSourcePrimeSumMultiplicity:sourceHist[0],
  maxSolvedP56RuneMultiplicity:plaintextHist[0],
  fixedUnknownGP29BijectionCanMatch:false
},null,2));
