"use strict";
/**
 * Exact known-text GP word-length gate on Cicada's signed 2013 NEXT message.
 * Uses only the pinned, derived 406-word source fingerprint and the canonical
 * original LP2 word parser. Does not test a guessed plaintext or cipher key.
 *
 * Run from repository root: node sims/lp2_2013_signed_next_wordlength_sft.cjs
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const source = require("../resources/derived/2013-signed-next-gp-wordlengths.json");

/**
 * @param {number[]} target
 * @param {number[]} candidate
 * @returns {{span:number,word:number,at:number}}
 */
function maxExact(target,candidate) {
  let prev = new Uint16Array(candidate.length+1);
  let next = new Uint16Array(candidate.length+1);
  let best = {span:0,word:0,at:0};
  for(let i=0;i<target.length;i++){
    next.fill(0);
    for(let j=0;j<candidate.length;j++){
      if(target[i]!==candidate[j]) continue;
      const span=prev[j]+1;
      next[j+1]=span;
      if(span>best.span)best={span,word:i-span+1,at:j-span+1};
    }
    [prev,next]=[next,prev];
  }
  return best;
}

/**
 * One six-word exact seed, followed by at most two length differences in a
 * 40-word window. The third mismatch is excluded from the match length.
 * @param {number[]} target
 * @param {number[]} candidate
 * @returns {{span:number,errors:number,word:number,at:number}[]}
 */
function fuzzy(target,candidate) {
  const seed=6,limit=40;
  /** @type {Map<string,number[]>} */
  const index=new Map();
  for(let j=0;j+seed<=candidate.length;j++){
    const key=candidate.slice(j,j+seed).join(",");
    const positions=index.get(key)||[];
    positions.push(j);
    index.set(key,positions);
  }
  const hits=[];
  for(let i=0;i+seed<=target.length;i++){
    const key=target.slice(i,i+seed).join(",");
    for(const j of index.get(key)||[]){
      let span=seed,errors=0;
      while(span<limit&&i+span<target.length&&j+span<candidate.length){
        if(target[i+span]!==candidate[j+span]){
          if(errors===2)break;
          errors++;
        }
        span++;
      }
      if(span>=11)hits.push({span,errors,word:i,at:j});
    }
  }
  hits.sort((a,b)=>b.span-a.span||a.errors-b.errors||a.word-b.word||a.at-b.at);
  return hits;
}

/**
 * xorshift32 used solely to reproduce the shuffled control distribution.
 * @param {number} initialSeed
 * @returns {()=>number}
 */
function random(initialSeed) {
  let state=initialSeed>>>0;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
/** @param {number[]} input @param {()=>number} next @returns {number[]} */
function shuffled(input,next){
  const output=input.slice();
  for(let i=output.length-1;i>0;i--){
    const j=Math.floor(next()*(i+1));
    [output[i],output[j]]=[output[j],output[i]];
  }
  return output;
}

const original=parseSharedCorpus();
assert.equal(original.runeCount,12956);
assert.equal(original.words.length,2896);
const target=original.words.map(w=>w.length);
const candidate=source.lengths;
assert.equal(source.schema,1);
assert.equal(candidate.length,406);
assert.equal(source.source_sha256,"062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87");

const exact=maxExact(target,candidate);
const fuzzyHits=fuzzy(target,candidate);
assert.deepEqual(exact,{span:8,word:410,at:308});
assert.equal(fuzzyHits.length,0,"No original match survives a six-word seed and two-error extension to 11 words.");

// Positive control: fixed 40-word signed-source passage, two inserted errors.
const planted=candidate.slice(0,40);
planted[12]++;planted[29]++;
assert(fuzzy(planted,candidate).some(h=>h.word===0&&h.at===0&&h.span===40&&h.errors===2));

// Shuffled source preserves exact lengths and word-length frequency, but
// deliberately destroys the original authored word order.
const next=random(0x33012013);
const controls=[];
for(let i=0;i<128;i++){
  const control=shuffled(candidate,next);
  const hits=fuzzy(target,control);
  controls.push({exact:maxExact(target,control).span,fuzzy:hits[0]?.span||0});
}
const baseline={
  n:controls.length,
  exactRange:[Math.min(...controls.map(c=>c.exact)),Math.max(...controls.map(c=>c.exact))],
  fuzzyRange:[Math.min(...controls.map(c=>c.fuzzy)),Math.max(...controls.map(c=>c.fuzzy))],
  fuzzyMean:controls.reduce((sum,c)=>sum+c.fuzzy,0)/controls.length
};
assert.deepEqual(baseline.exactRange,[6,10]);
assert.deepEqual(baseline.fuzzyRange,[0,13]);
console.log(JSON.stringify({
  source:"authenticated March 2013 NEXT signed body",
  signedSourceSHA256:source.source_sha256,
  signedSourceWords:406,originalLP2Words:2896,originalRunes:12956,
  exactLongest:exact,qualifiedFuzzyAtLeast11:fuzzyHits.length,
  requiredDistinctiveSpan:20,qualifiedAtLeast20:0,
  positivePlantRecovered:true,shuffledControls:baseline,
  decision:"no independent original-LP2 known-plaintext crib"
},null,2));
