"use strict";
/**
 * Exact source-original p40-p55 floral 3301 within-page directed edge receiver.
 * This is a bounded negative; no first-party instruction currently selects
 * differences, byte sign directions, key schedule or page-internal reset.
 *
 * Native Windows/Linux Node 22:
 *   node sims/lp2_floral3301_pageedge_literal_inversion_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const load = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const solved = load("resources/external/relikd-solved-gp29-native-v1.json");
const mod = x => ((x % 29) + 29) % 29;
const pages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55);
assert.equal(pages.length, 16);
const counts = [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76];
assert.deepEqual(pages.map(p => p.indices.length), counts);
const nonempty = pages.filter(p => p.indices.length);
const heads = nonempty.map(p => p.indices[0]);
assert.equal(heads.length, 15);
const dByPage = nonempty.map(p => p.indices.slice(1)
  .map((v, i) => mod(v - p.indices[i])));
const steps = dByPage.flat();
assert.equal(steps.length, 3301);
assert.equal(steps.filter(x => x === 0).length, 21);
function diff(p) {
  assert(p.length > 0);
  return [p[0], ...p.slice(1).map((v,i) => mod(v-p[i]))];
}
function integrate(source) {
  assert(source.length > 0);
  const output = [source[0]];
  for(let i=1;i<source.length;i++) output.push(mod(output[i-1]+source[i]));
  return output;
}
function ioc(a) {
  const f = Array(29).fill(0);
  for(const x of a) f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0) / (a.length * (a.length-1));
}
const sourceCandidate = pages.map(p =>
  p.indices.length ? diff(p.indices) : []);
assert.deepEqual(sourceCandidate.map(x=>x.length), counts);
pages.forEach((p,i) => {
  if (!p.indices.length) assert.deepEqual(sourceCandidate[i], []);
  else assert.deepEqual(integrate(sourceCandidate[i]), p.indices);
});
const groups = [[40,45],[46,49],[51,55]];
const partitions = groups.map(([lo,hi]) => {
  const candidate = pages.filter(p => p.page>=lo&&p.page<=hi)
    .flatMap(p => sourceCandidate[p.page-40]);
  const original = pages.filter(p => p.page>=lo&&p.page<=hi)
    .flatMap(p => p.indices);
  const length = candidate.length;
  return {
    pages:`p${lo}-${hi}`, length, candidateIoC: ioc(candidate),
    sourceIoC: ioc(original),
    first40: candidate.slice(0,40).map(x => corpus.translit[x]).join("-")
  };
});
assert.deepEqual(partitions.map(x=>x.length), [1593,881,842]);
assert.ok(partitions[0].candidateIoC < 0.04);
assert.ok(partitions[2].candidateIoC < 0.04);

const gpIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const authenticSolvedLP1 = [...solved.sections[0].source_text]
  .filter(c=>gpIndex.has(c)).map(c=>gpIndex.get(c));
const authenticSolvedLP2p57 = corpus.pages.find(p=>p.page===57).indices;
assert.ok(authenticSolvedLP1.length >= 100);
assert.equal(authenticSolvedLP2p57.length, 95);
function plantedRoundTrip(plaintext) {
  let last=plaintext[0]; const cipher=[last];
  for(let i=1;i<plaintext.length;i++){last=mod(last+plaintext[i]);cipher.push(last);}
  assert.deepEqual(diff(cipher),plaintext);
  assert.deepEqual(integrate(plaintext),cipher);
  return {sourceLength:plaintext.length,plaintextIoC:ioc(plaintext), exact:true};
}
const controls = [
  plantedRoundTrip(authenticSolvedLP1),
  plantedRoundTrip(authenticSolvedLP2p57)
];
assert.ok(controls.every(x=>x.plaintextIoC > 0.05));

// Distinct lossy directional-bit interpretation of the official wording
// "their numbers are the direction": one if GP prime increases at each
// physical same-page transition, zero otherwise. GP primes are monotone,
// hence using source prime versus index produces the same single bit.
function upBits(pgs) {
  const bits=[];
  for(const p of pgs) for(let i=1;i<p.length;i++)
    bits.push(Number(corpus.prime[p[i]] > corpus.prime[p[i-1]]));
  return bits;
}
function printableRatio(bits) {
  let printable=0; const bytes=Math.floor(bits.length/8);
  for(let i=0;i<bytes;i++){
    let b=0;for(let k=0;k<8;k++)b=(b<<1)|bits[8*i+k];
    if(b>=32&&b<=126)printable++;
  }
  return {bytes,printable,ratio:printable/bytes};
}
const originalBits=upBits(nonempty.map(p=>p.indices));
assert.equal(originalBits.length,3301);
const bitResult=printableRatio(originalBits);
assert.deepEqual([bitResult.bytes,bitResult.printable],[412,196]);
let seed=0x33012026>>>0;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
let sum=0,largerOrEqual=0;
for(let trial=0;trial<1000;trial++){
  const shuffled=nonempty.map(p=>{
    const a=[...p.indices];
    for(let i=a.length-1;i>0;i--){const k=rand()%(i+1);[a[i],a[k]]=[a[k],a[i]];}
    return a;
  });
  const ratio=printableRatio(upBits(shuffled)).ratio;
  sum+=ratio;
  largerOrEqual+=Number(ratio>=bitResult.ratio);
}
assert.equal(largerOrEqual,362);
const shuffledMean=sum/1000;
assert.ok(Math.abs(shuffledMean-0.4665922330097069)<1e-13);
console.log(JSON.stringify({
  status:"PASS",source:"unchanged physical LP2 p40..p55 pages",
  noAuthenticatedDifferenceOrDirectionOpcode:true,
  originalRunes:3316,originalPages:16,
  runeBearingPages:15,sourceHeads:heads,
  withinPageTransitions:steps.length,zeroEdges:21,
  literalDifferenceInversion:partitions,independentSolvedPositives:controls,
  signedDirectionBitCounterfactual:{
    ...bitResult, sourceFrequencyPreservingShuffled1000Mean:shuffledMean,
    shuffledGEoriginal:largerOrEqual, addOneTail:(largerOrEqual+1)/1001
  },fullOriginalExactReconstruction:true,
  decision:"Neither simple direct differences nor unsigned up/down bytes recover a native GP29 paragraph or typed payload. No independently authenticated historical instruction selects a more complex edge cipher."
},null,2));
