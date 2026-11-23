"use strict";

/**
 * Eight bounded extensions of the original p50 autonomous-pointer state
 * machine: ciphertext feedback, using either the literal current GP29 rune
 * or original same-page GP29 difference (with page-first predecessor 0).
 * State s' = B[s] XOR feedback or (B[s]+feedback) mod256.
 *
 * Exact all-256-seed and all-74-segment fractional collision maximization.
 * Positive-looking source ceilings are feasibility bounds, NOT plaintext
 * recovery, and the author did not specify these feedback opcodes.
 *
 * Windows Node.js22, no dependencies, read-only standalone SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) { return fs.readFileSync(path.join(root,name),"utf8"); }
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const cutsByPage=new Map(ink.pages.filter(p=>p.page<=55).map(p=>
  [p.page,[...new Set((p.large_punctuation||[]).map(x=>x[0]))]
    .filter(x=>x>0&&x<p.rune_count).sort((a,b)=>a-b)]));
assert.equal([...cutsByPage.values()].reduce((s,a)=>s+a.length,0),19);
assert.equal(pages.flatMap(x=>x.indices).length,12956);

/**
 * Input segment record contains [current GP rune, same-page delta].
 * At each physical page's first rune use public predecessor zero
 * when D is the state driver of a C-input cipher. A D-input
 * cipher does not decode the page-first rune (literal IV).
 * @param {"C"|"D"} channel
 */
function originalSegments(channel) {
  const out=[];
  for(const page of pages) {
    const cuts=[0,...(cutsByPage.get(page.page) || []),page.indices.length];
    for(let k=0;k<cuts.length-1;k++) {
      const tuples=[];
      for(let j=Math.max(cuts[k],channel==="D"?1:0);j<cuts[k+1];j++) {
        const cur=page.indices[j];
        const preceding=j>0?page.indices[j-1]:0;
        tuples.push([cur,(cur-preceding+29)%29]);
      }
      if(tuples.length)out.push(tuples);
    }
  }
  return out;
}
/**
 * @param {number[][]} pairs
 * @param {number} initial
 * @param {"C"|"D"} channel
 * @param {"C"|"D"} driver
 * @param {"XOR"|"ADD"} combine
 * @returns {[number,number]}
 */
function score(pairs,initial,channel,driver,combine) {
  const counts=new Uint16Array(256*29);
  const nstate=new Uint16Array(256);
  let s=initial,E=0,T=0;
  for(const [c,d] of pairs) {
    const x=channel==="C"?c:d;
    const value=driver==="C"?c:d;
    E+=counts[s*29+x]++;
    T+=nstate[s]++;
    s=combine==="XOR"?(grid.bytes[s]^value):
      ((grid.bytes[s]+value)&255);
  }
  return [E,T];
}

/**
 * Exact global seed optimum using rational Dinkelbach optimization.
 * Every segment has a completely independent secret 256-way seed
 * and every state/segment may use any private GP29 bijection.
 * @param {number[][][]} segments
 * @param {"C"|"D"} channel
 * @param {"C"|"D"} driver
 * @param {"XOR"|"ADD"} combine
 */
function exactMaximum(segments,channel,driver,combine) {
  const choices=segments.map(x=>Array.from({length:256},
    (_,s)=>score(x,s,channel,driver,combine)));
  let num=0,den=1;
  for(let pass=0;pass<30;pass++) {
    let E=0,T=0;
    for(const options of choices) {
      let best=0,bestScore=-Infinity;
      for(let j=0;j<256;j++) {
        const [e,t]=options[j];
        const candidate=e*den-t*num;
        if(candidate>bestScore) {
          bestScore=candidate;
          best=j;
        }
      }
      E+=options[best][0];T+=options[best][1];
    }
    assert.ok(T>0);
    if(E*den===T*num)
      return {equalPairs:E,statePairs:T,allSeedMaximum:E/T,passes:pass+1};
    num=E;den=T;
  }
  throw new Error("Fractional maximum did not converge");
}
const outcomes=[];
for(const channel of ["C","D"]) {
  const segments=originalSegments(channel);
  assert.equal(segments.length,74);
  for(const driver of ["C","D"]) {
    for(const combine of ["XOR","ADD"]) {
      const result=exactMaximum(segments,channel,driver,combine);
      outcomes.push({channel,driver,combine,...result});
    }
  }
}
assert.deepEqual(outcomes.map(x=>[x.equalPairs,x.statePairs]),[
  [440,6032],[444,6307],[453,5980],[444,5944],
  [440,5821],[476,5885],[439,5971],[449,6076]
]);
assert.ok(outcomes.every(x=>x.allSeedMaximum>0.07));
console.log(JSON.stringify({
  classification:"Feedback-state bound non-exclusion, not an actual decryption",
  originalRunes:12956, sourceSegments:74, realInternalMarks:19,
  assumedUnpublishedOpcode:"XOR or + after original printed table lookup",
  sourceCinputPageFirstDelta:"Current original ciphertext minus literal initial GP0 predecessor 0",
  fullPrivateAlphabetSeedBounds:outcomes,
  interpretation:"All eight sources admit all-key equality ceilings above 7%, so the autonomous-pointer native-language obstruction cannot be carried to these feedback models. They are not proved compatible by equality alone."
},null,2));
console.log("PASS: all-seed exact source-only feedback ambiguity with corrected page-first delta");
