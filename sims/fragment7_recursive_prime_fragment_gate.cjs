"use strict";
/**
 * Reproduce the direct recursive prime->fragment test on LP2 fragment 7.
 * Run from repository root: node sims/fragment7_recursive_prime_fragment_gate.cjs
 * Node 22; deterministic, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

function readFrozen(relativePath, expectedBlobSha) {
  const raw = fs.readFileSync(path.join(__dirname, "..", relativePath));
  const sha = crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob " + raw.length + "\0"), raw]))
    .digest("hex");
  assert.equal(sha, expectedBlobSha, relativePath + " source version");
  return JSON.parse(raw.toString("utf8"));
}
const corpus = readFrozen("resources/liber-primus/lp2-corpus.json",
  "054f2a0f780b7d46901acbe3d9bf4f0ac1801165");
const ink = readFrozen("resources/liber-primus/lp2-ink-annotations.json",
  "3c52f209ce6bd7b138eaa2d4a9323526952ba9f9");

// Rebuild the 32 fragments from original red spans and 13-dot punctuation.
// At a shared offset, the separator is processed before the red rune.
const events = [];
for (const page of ink.pages) {
  const source = corpus.pages.find(p => p.page === page.page);
  for (const span of page.red_spans || []) {
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      events.push({page: page.page, offset, kind: 1, rune: source.indices[offset]});
    }
  }
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) events.push({page: page.page, offset: mark[0], kind: 0});
  }
}
events.sort((a,b) => a.page-b.page || a.offset-b.offset || a.kind-b.kind);
const fragments = [[]];
let eventIndex = 0;
for (const page of corpus.pages) {
  for (let offset = 0; offset <= page.indices.length; offset++) {
    while (eventIndex < events.length &&
      events[eventIndex].page === page.page &&
      events[eventIndex].offset === offset) {
      const event = events[eventIndex++];
      if (event.kind === 0) fragments.push([]);
      else fragments[fragments.length - 1].push(event.rune);
    }
  }
}
assert.equal(eventIndex, events.length);
assert.equal(fragments.length, 32);
const expectedLengths = [13,0,16,0,2,0,11,0,0,14,12,0,9,11,0,16,0,13,0,7,0,10,0,3,0,59,9,0,5,0,6,0];
assert.deepEqual(fragments.map(f => f.length), expectedLengths);
const seedFragmentId = 7;
const seed = fragments[seedFragmentId - 1];
assert.deepEqual(seed, [24,16,14,17,19,6,27,15,17,14,12]);
assert.equal(corpus.translit[seed[0]], "A"); // Ac anchor

// Gematria Primus symbols carry the first 29 prime weights.
const primes = [];
for (let n=2; primes.length<29; n++) {
  let prime = true;
  for (let d=2; d*d<=n; d++) if (n%d===0) {prime=false;break;}
  if (prime) primes.push(n);
}
const mod = (x,m) => ((x%m)+m)%m;
const targetForPrime = p => ({
  phiFragment: mod(p-1,32) || 32,
  primeFragment: mod(p,32) || 32,
  label: mod(p-1,29)
});
function matches(records,p) {
  const t=targetForPrime(p), a=records[t.phiFragment-1], b=records[t.primeFragment-1];
  const emptyA=a.length===0, emptyB=b.length===0;
  return (emptyA!==emptyB) &&
    ((emptyA && b.includes(t.label)) || (emptyB && a.includes(t.label)));
}
const perRune = seed.map((rune,position) => {
  const p=primes[rune],t=targetForPrime(p);
  return {position,runeIndex:rune,translit:corpus.translit[rune],prime:p,
    pair:[t.phiFragment,t.primeFragment],label:t.label,
    match:matches(fragments,p)};
});
const uniquePrimes = [...new Set(seed.map(r => primes[r]))];
const allUniqueMatches = uniquePrimes.filter(p=>matches(fragments,p));
const nonAnchorUnique = uniquePrimes.filter(p=>p!==71); // p=71 maps back to the already-selected 6/7 anchor pair.
const observedNonAnchorMatches = nonAnchorUnique.filter(p=>matches(fragments,p)).length;
assert.equal(perRune.filter(x=>x.match).length,5);
assert.equal(allUniqueMatches.length,4);
assert.equal(nonAnchorUnique.length,8);
assert.equal(observedNonAnchorMatches,3);

// A within-corpus diagnostic: apply the same rule to every nonempty fragment.
const allFragmentScores = fragments.map((seedRows,i) => {
  const unique = [...new Set(seedRows.map(r => primes[r]))];
  const matched = unique.filter(p => matches(fragments,p));
  return {fragment:i+1,length:seedRows.length,uniquePrimeCount:unique.length,
    uniqueMatches:matched.length,rate:unique.length?matched.length/unique.length:0};
}).filter(x=>x.length>0).sort((a,b)=>b.rate-a.rate || b.uniqueMatches-a.uniqueMatches);
const fragment7Rank = allFragmentScores.findIndex(x=>x.fragment===7)+1;

// Conditional null: preserve the selected empty fragment 6 and seed fragment 7;
// permute the other 30 original fragment records among their slots.
let rng=0x199;
function next32(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function randInt(max){const limit=Math.floor(0x100000000/max)*max;let x;do{x=next32();}while(x>=limit);return x%max;}
const slots=Array.from({length:32},(_,i)=>i).filter(i=>i!==5 && i!==6);
const originalOther=slots.map(i=>fragments[i]);
const SAMPLES=200000,histogram=Array(9).fill(0);
let tail=0;
for(let trial=0;trial<SAMPLES;trial++){
  const shuffled=originalOther.slice();
  for(let i=shuffled.length-1;i>0;i--){const j=randInt(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const records=fragments.slice();
  slots.forEach((slot,j)=>{records[slot]=shuffled[j];});
  const score=nonAnchorUnique.filter(p=>matches(records,p)).length;
  histogram[score]++;
  if(score>=observedNonAnchorMatches)tail++;
}
const pAddOne=(tail+1)/(SAMPLES+1);

// Positive control: plant one empty/label pair for each of the nine distinct
// prime weights; the exact same detector must recover all nine.
const synthetic=Array.from({length:32},()=>[]);
for(const p of uniquePrimes){
  const t=targetForPrime(p);
  assert.equal(synthetic[t.phiFragment-1].length,0);
  assert.equal(synthetic[t.primeFragment-1].length,0);
  synthetic[t.phiFragment-1]=[];
  synthetic[t.primeFragment-1]=[t.label];
}
const plantedMatches=uniquePrimes.filter(p=>matches(synthetic,p)).length;
assert.equal(plantedMatches,uniquePrimes.length);

console.log(JSON.stringify({
  sources:{corpusGitBlobSha:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
    inkGitBlobSha:"3c52f209ce6bd7b138eaa2d4a9323526952ba9f9"},
  fragmentLengths:expectedLengths,
  seed:{fragment:7,translit:seed.map(r=>corpus.translit[r]).join(" "),
    runeIndices:seed,primeWeights:seed.map(r=>primes[r]),perRune,
    positionalMatches:perRune.filter(x=>x.match).length,
    uniquePrimeCount:uniquePrimes.length,uniqueMatches:allUniqueMatches.length,
    nonAnchorUniquePrimeCount:nonAnchorUnique.length,
    nonAnchorUniqueMatches:observedNonAnchorMatches},
  allFragmentScan:{nonemptyFragments:allFragmentScores.length,fragment7RankByUniqueMatchRate:fragment7Rank,
    fragment7Score:allFragmentScores.find(x=>x.fragment===7),top:allFragmentScores.slice(0,5)},
  conditionalNull:{condition:"fragments 6 and 7 fixed; other 30 fragment records permuted",
    samples:SAMPLES,seed:"0x199",histogram,tailCount:tail,pAddOne},
  positiveControl:{plantedPairs:uniquePrimes.length,recoveredMatches:plantedMatches}
},null,2));
