"use strict";
/**
 * Source-exact original p0 two-tap affine GP29 feedback test.
 * Usage: node sims/lp2_affine_twotap_p0_allkey_sft.cjs
 * Node.js 22 CommonJS, standard library only. Reads canonical project sources.
 *
 * Model: C[i] = P[i] + a*C[i-1] + b*P[i-1] + d (mod 29).
 * All a,b,d in GF29 and every independent first plaintext rune P[0]
 * are enumerated. C[0] is the authentic printed first rune.
 * This is a declared finite model, not an identified Cicada mechanism.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const solved = read("resources/external/relikd-solved-gp29-native-v1.json");
const C = corpus.pages.find(p => p.page === 0).indices;
const N = C.length, Q = 29;
assert.equal(N,262);
const mod = v => ((v % Q) + Q) % Q;

/** @param {number[]} sequence @returns {number} Twice-ordered equal pairs */
function equalityPairs(sequence) {
  const counts = new Uint16Array(Q);
  for (const value of sequence) counts[value]++;
  let pairs = 0;
  for (const count of counts) pairs += count * (count - 1);
  return pairs;
}

/** @param {number[]} c @param {number} a @param {number} b
 *  @param {number} d @param {number} firstP @returns {number[]} */
function decode(c,a,b,d,firstP) {
  const p = new Array(c.length);
  p[0] = firstP;
  for (let i=1;i<c.length;i++) {
    p[i] = mod(c[i]-a*c[i-1]-b*p[i-1]-d);
  }
  return p;
}

/** @param {number[]} p @param {number} a @param {number} b
 *  @param {number} d @param {number} firstC @returns {number[]} */
function encode(p,a,b,d,firstC) {
  const c = new Array(p.length);
  c[0]=firstC;
  for (let i=1;i<p.length;i++) {
    c[i]=mod(p[i]+a*c[i-1]+b*p[i-1]+d);
  }
  return c;
}
let best=-1, winners=[], sampled=0, reached5=0;
for(let a=0;a<Q;a++) for(let b=0;b<Q;b++) for(let d=0;d<Q;d++) {
  for(let firstP=0;firstP<Q;firstP++) {
    const hist = new Uint16Array(Q);
    hist[firstP]++;
    let prevP=firstP, prevC=C[0];
    for(let i=1;i<N;i++) {
      const p=mod(C[i]-a*prevC-b*prevP-d);
      hist[p]++;
      prevP=p;
      prevC=C[i];
    }
    let pairs=0;
    for(const count of hist) pairs+=count*(count-1);
    sampled++;
    if(pairs*1000 >= 50*N*(N-1))reached5++;
    if(pairs>best) {best=pairs;winners=[[a,b,d,firstP]];}
    else if(pairs===best && winners.length<16) winners.push([a,b,d,firstP]);
  }
}
assert.equal(sampled,707281);
assert.equal(best,2748);
assert.equal(reached5,0);
const mapping = new Map(corpus.runes.map((r,i)=>[r,i]));
let nativeMin=Infinity, nativeWindows=0, nativeSource="";
for(const s of solved.sections){
  const seq=Array.from(s.source_text).filter(ch=>mapping.has(ch)).map(ch=>mapping.get(ch));
  for(let j=0;j+N<=seq.length;j++){
    const pairs=equalityPairs(seq.slice(j,j+N));
    if(pairs<nativeMin) { nativeMin=pairs;nativeSource=s.name; }
    nativeWindows++;
  }
}
assert.equal(nativeWindows,1325);
assert.equal(nativeMin,3788);
assert(best<nativeMin);
const donor=Array.from(solved.sections.find(s=>s.name==="0_welcome").source_text)
  .filter(ch=>mapping.has(ch)).map(ch=>mapping.get(ch)).slice(0,N);
const plant=encode(donor,23,3,0,C[0]);
assert.deepEqual(decode(plant,23,3,0,donor[0]),donor);
assert.deepEqual(encode(decode(C,23,3,0,7),23,3,0,C[0]),C);
console.log(JSON.stringify({
  status:"PASS",model:"C_i=P_i+a*Cprev+b*Pprev+d mod29",
  originalPage:0,runes:N,enumerated:sampled,
  maxCipherInverseEqualityPairs:best,
  maxCipherInverseIoC:best/(N*(N-1)),
  candidateExamples:winners.slice(0,4),
  originalCandidatesIoCAtLeast0_050:reached5,
  solvedNativeContiguousWindows:nativeWindows,
  solvedNativeMinPairs:nativeMin,
  solvedNativeMinIoC:nativeMin/(N*(N-1)),
  solvedNativeMinSource:nativeSource,
  sourceNativeForwardInverse:"exact"
},null,2));
