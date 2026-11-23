"use strict";
/**
 * Physical-book p50 2-cycle: a source-visible length-address link, and a
 * full-register one-time-pad falsifier of the literal two-stream reading.
 *
 * The 256 printed base60 tokens are self-addressed via f(i)=B[i].
 * The two-cycle f(158)=249 and f(249)=158 coincides numerically with two
 * independent visible lengths: p49+p51 runic flanks = 66+92 = 158; p0
 * black body after a red 13-runic title = 262-13 = 249.
 *
 * This was noticed POST HOC. The exact predeclared-pair probability is
 * NOT a discovery p-value because source lengths were inspected after
 * seeing the cycle. Neither the graph nor the length match specifies a
 * key, plaintext receiver, sign, alignment, or a cipher instruction.
 *
 * Candidate falsifier: full native GP29 additive/subtractive word-stream
 * transfer between those two complete original rune registers. To compare
 * equal lengths, take one of the two natural 158-rune windows of p0 black,
 * preserving all 158 symbols and the physical p49,p51 concatenate; check
 * forward/reverse neighbor and both signs. No fitted phase or key.
 * Node 22 CommonJS: node sims/lp2_p50_158_249_lengthcycle_twoflank_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const B=grid.bytes, tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(B.length,256);
assert.equal(tokens.length,256);
assert.equal(new Set(B).size,161);
assert.equal(corpus.pages[50].indices.length,0);
const p0=corpus.pages[0].indices,flankL=corpus.pages[49].indices,flankR=corpus.pages[51].indices;
const source=p0.slice(13),key=flankL.concat(flankR);
assert.deepEqual([p0.length,p0.slice(0,13).length,source.length,flankL.length,flankR.length,key.length],
  [262,13,249,66,92,158]);
assert.equal(B[key.length],source.length);
assert.equal(B[source.length],key.length);
assert.equal(tokens[158],"49");
assert.equal(tokens[249],"2c");
assert.deepEqual([9,158,227,249].map(i=>B[i]),[249,249,249,158]);
const mod=x=>(x%29+29)%29;
function ioc(x){
  const f=Array(29).fill(0);for(const v of x)f[v]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
function profile(values){
  return {n:values.length,ioc:+ioc(values).toFixed(9),
    startGP:values.slice(0,60).map(x=>corpus.translit[x]).join("")};
}
function decoded(cipher,pad,sign){return cipher.map((c,i)=>mod(c+sign*pad[i]));}
let actual=[];
for(const window of ["first158","last158"]){
  const c=window==="first158"?source.slice(0,158):source.slice(-158);
  for(const reverse of [false,true]){
    const pad=reverse?key.slice().reverse():key;
    for(const sign of [-1,1]){
      const p=decoded(c,pad,sign);
      assert.deepEqual(decoded(p,pad,-sign),c);
      actual.push({window,reverse,sign,...profile(p)});
    }
  }
}
assert.equal(actual.length,8);
assert(actual.every(x=>x.ioc<0.04));
/**
 * Even granting a completely secret, arbitrary fixed GP29 symbol-map from
 * the 158-runic p0 window into the flank, the maximum exact matches are the
 * row-wise modal output counts. This is a universal necessary condition for
 * the two passages being the SAME 158-rune plaintext under two stationary
 * independently keyed monoalphabetic alphabets. No key is guessed.
 * Not applicable to context-changing, unrelated-plaintext, or layer ciphers.
 */
function maximumStationaryMatches(a,b){
  assert.equal(a.length,b.length);
  const h=Array.from({length:29},()=>Array(29).fill(0));
  for(let i=0;i<a.length;i++)h[a[i]][b[i]]++;
  return h.reduce((n,row)=>n+Math.max(...row),0);
}
const sameText=[];
for(const window of ["first158","last158"]){
  const a=window==="first158"?source.slice(0,158):source.slice(-158);
  for(const reverse of [false,true]){
    const b=reverse?key.slice().reverse():key;
    const possible=maximumStationaryMatches(a,b);
    sameText.push({window,reverse,bestArbitraryFunctionMatches:possible,
      unavoidableMismatches:a.length-possible});
  }
}
assert.deepEqual(sameText.map(x=>x.bestArbitraryFunctionMatches),[38,37,43,40]);
// Positive plant: a fully secret fixed GP29 permutation achieves all 158.
const plantedSameText=source.slice(0,158).map(x=>(7*x+13)%29);
assert.equal(maximumStationaryMatches(source.slice(0,158),plantedSameText),158);

const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
assert(ioc(solved)>0.06);
const positivePlain=Array.from({length:158},(_,i)=>solved[i%95]);
const syntheticallyEncrypted=decoded(positivePlain,key,-1);
assert.deepEqual(decoded(syntheticallyEncrypted,key,+1),positivePlain);
assert.equal(positivePlain.length,158);
const histogram=n=>B.filter(v=>v===n).length;
assert.deepEqual([histogram(249),histogram(158)],[3,1]);
const preselectedPairProbability=histogram(249)*histogram(158)/(256*255);
assert(Math.abs(preselectedPairProbability-3/65280)<1e-12);
console.log(JSON.stringify({
  status:"source-motivated length/address observation, NOT a cipher solve",
  table:"literal original 32x8 base60 bytes, f(i)=B[i]",
  physical:{p0Total:262,p0RedTitle:13,p0Black:249,p49Flank:66,p51Flank:92,flankTotal:158},
  twoCycle:{addresses:[158,249],targets:[B[158],B[249]],
    otherDirectPreimagesOf249:[9,227]},
  exactFixedByteMultisetRandomCellNull:{
    multiplicity249:histogram(249),multiplicity158:histogram(158),
    probabilitySpecificDirected2CycleIfEndpointsPredeclared:preselectedPairProbability,
    criticalQualification:"Endpoints noticed after the graph; this is NOT an unconditional p-value or author authentication."
  },
  originalAdditiveInverse:{
    total:actual.length,p0BodyRuns:source.length,flankRunes:key.length,
    maximumIoC:Math.max(...actual.map(x=>x.ioc)),
    knownSolvedP57IoC:+ioc(solved).toFixed(9),
    candidates:actual
  },
  inversePlant:{authenticSolvedGPRepeatedTo158:true,recovered:158},
  originalSameTextStationaryAlphabetUpperBound:{tests:4,bestObservedMatches:43,positions:158,positivePlantMatches:158,results:sameText},
  decision:"Exact 2-cycle is real and intersects independent visible text lengths; eight direct whole-register GP29 pad transfers fail native plaintext; any fixed whole-passage GP29 symbol relabeling also must mismatch ≥115 of 158 aligned positions. Absent an authored receiver/clock, do not promote this numeric match to a cipher mechanism."
},null,2));
