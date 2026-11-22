"use strict";

/**
 * Original 2014 LP2 p55 center-five / signed 2013 BASE29 distinction.
 * Reads the canonical 29-rune corpus and the original-source word transcript;
 * computes a deterministic matched-original-page shuffle baseline for the
 * newly identified prime-of-first-rune self-index property.
 * 
 * Run: node sims/p55_center5_prime_selfindex_signed_base29_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sections = read("resources/lp2-transcription.txt").split("%");
assert.equal(sections.length, 57);
const gpPrimes = corpus.prime;
assert.equal(gpPrimes.length, 29);
const nthPrimes = [];
for (let n = 2; nthPrimes.length < Math.max(...gpPrimes); n++) {
  let isPrime = true;
  for (let k = 2; k * k <= n; k++) {
    if (n % k === 0) { isPrime = false; break; }
  }
  if (isPrime) nthPrimes.push(n);
}

/** @param {string} section @returns {number[][]} */
function sectionWords(section) {
  return section.replace(/[\\/\r\n\s]/gu, "")
    .split(/[^ᚠ-ᛪ]+/u).filter(Boolean)
    .map(fragment => [...fragment].map(rune => {
      const index = corpus.runes.indexOf(rune);
      assert.ok(index >= 0);
      return index;
    }));
}
/** @param {number[]} core */
function sourceSelfIndex(core) {
  assert.equal(core.length,5);
  const firstPrime = gpPrimes[core[0]];
  const sum = core.reduce((s,idx) => s + gpPrimes[idx], 0);
  return {firstPrime,sum,nthPrime: nthPrimes[firstPrime-1],
    matches:sum === nthPrimes[firstPrime-1]};
}
const p55Words = sectionWords(sections[54]);
const p55Inside = p55Words.flatMap(w => w.slice(1,-1));
assert.equal(p55Inside.length,43);
const fixedCore = p55Inside.slice(19,24);
assert.deepEqual(fixedCore,[21,20,15,23,27]);
const calc = sourceSelfIndex(fixedCore);
assert.deepEqual(calc,{firstPrime:79,sum:401,nthPrime:401,matches:true});
const quotient = Math.floor(calc.sum/29);
const remainder = calc.sum%29;
assert.deepEqual([quotient,remainder],[13,24]);
assert.equal(corpus.translit[quotient]+corpus.translit[remainder],"PA");

/**
 * Protocol alphabet is NOT the 29 GP rune characters.
 * The only authenticated 2013 TCP example specifies 3301 -> 3QO,
 * directly fixing digit 24 to printable "O" (and 26 to "Q").
 * The usual full printable radix alphabet is conventional, not
 * independently fixed by that one authenticated vector.
 */
const conventionalDigits = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {number} n */
function ordinaryBase29(n) {
  assert.ok(Number.isSafeInteger(n) && n>=0);
  if(n===0) return "0";
  let out="";
  while(n){out=conventionalDigits[n%29]+out;n=Math.floor(n/29);}
  return out;
}
assert.equal(ordinaryBase29(3301),"3QO");
assert.equal(ordinaryBase29(401),"DO");
assert.equal(conventionalDigits[24],"O");
assert.notEqual(corpus.translit[24],conventionalDigits[24]);

const pages = [];
for(let sec=0;sec<55;sec++) {
  const words=sectionWords(sections[sec]);
  const interior=words.flatMap(w=>w.slice(1,-1));
  if(interior.length%2===0) continue; // even length has two plausible centers
  const page=sec<50?sec:sec+1; // physical p50 has no rune section
  assert.deepEqual(words.flat(),corpus.pages.find(p=>p.page===page).indices);
  const start=(interior.length-5)/2;
  pages.push({page,interior,original:sourceSelfIndex(interior.slice(start,start+5))});
}
assert.equal(pages.length,29);
assert.deepEqual(pages.filter(r=>r.original.matches).map(r=>r.page),[55]);

// Matched-source diagnostic: each of the 29 uniquely centered physical pages
// draws five different indices uniformly without replacement from its own
// actual strict-word-interior rune multiset. No English model, cipher fitting,
// or target-word search is used.
let seed=3301503>>>0;
/** @returns {number} */
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
const iterations=50000;
let anyHit=0,p55Hit=0,totalHit=0;
for(let trial=0;trial<iterations;trial++){
  let any=false;
  for(const row of pages){
    const picks=[],n=row.interior.length;
    while(picks.length<5){
      const candidate=Math.floor(random()*n);
      if(!picks.includes(candidate))picks.push(candidate);
    }
    const sampled=picks.map(k=>row.interior[k]);
    if(sourceSelfIndex(sampled).matches) {
      any=true;totalHit++;
      if(row.page===55)p55Hit++;
    }
  }
  if(any)anyHit++;
}
assert.deepEqual([anyHit,p55Hit,totalHit],[4137,202,4305]);
console.log(JSON.stringify({
  original:{
    physicalPage:55, strictInterior:43, centeredCoreIndices:fixedCore,
    corePrimeWeights:fixedCore.map(i=>gpPrimes[i]),...calc,
    base29DigitPair:[quotient,remainder],GPIndexText:"PA",
    conventionallyPrintedBASE29:ordinaryBase29(calc.sum),
    authenticatedSignedDigit24:"O"
  },
  uniquelyCenteredOriginalPages:pages.length,
  originalSelfIndexMatches:pages.filter(row=>row.original.matches).map(row=>row.page),
  shuffle:{trials:iterations,seed:3301503,anyPageHits:anyHit,
    anyPageRate:anyHit/iterations,p55Hits:p55Hit,
    p55Rate:p55Hit/iterations,totalHits:totalHit},
  interpretation:"candidate original-centered checksum; no authenticated 401 consumer or full-page inverse",
  status:"PASS"
},null,2));
