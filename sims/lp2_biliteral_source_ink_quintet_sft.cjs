#!/usr/bin/env node
"use strict";

/* LP2 source-ink biliteral five-rune framing gate (Director #3303).
 * No guessed rune->bit key. The only observed two-state font attribute is
 * printed black vs red, using exact original source-annotated page offsets.
 * Source-native solved p57 is a negative "same typography, clear writing"
 * control, not an encrypted Bacon positive.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const dir = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(dir,"lp2-corpus.json"),"utf8"));
const annotations = JSON.parse(fs.readFileSync(
  path.join(dir,"lp2-ink-annotations.json"),"utf8"));
assert.equal(corpus.pages.length,58);
assert.equal(annotations.counts.red,225);

function inkBitPages(start,end) {
  const bits=[], locations=[];
  for (let p=start;p<=end;p++) {
    const n=corpus.pages[p].indices.length;
    const spans=annotations.pages.find(x=>x.page===p)?.red_spans || [];
    const mask=new Uint8Array(n);
    for(const span of spans) {
      assert(span.start>=0 && span.start+span.length<=n);
      assert.equal([...span.runes].length,span.length);
      for(let i=span.start;i<span.start+span.length;i++) {
        assert.equal(mask[i],0, "overlap");
        mask[i]=1;
      }
    }
    for(let i=0;i<n;i++) {
      bits.push(mask[i]);
      locations.push([p,i]);
    }
  }
  return {bits, locations};
}
function quintets(bits,phase=0) {
  let full=Math.floor((bits.length-phase)/5),zero=0,nonzero=0;
  const patterns=new Map();
  for(let i=0;i<full;i++){
    const s=bits.slice(phase+i*5,phase+i*5+5).join("");
    patterns.set(s,(patterns.get(s)||0)+1);
    if(s==="00000")zero++;else nonzero++;
  }
  return {phase,full,zero,nonzero,distinctPatterns:patterns.size,
    zeroPercent:100*zero/full,
    counts:Object.fromEntries(patterns)};
}
function longestBlack(bits,locations){
  let st=0,longest={length:0,at:null,through:null};
  for(let i=0;i<=bits.length;i++){
    if(i<bits.length && bits[i]===0)continue;
    if(i-st>longest.length)longest={length:i-st,at:locations[st],through:locations[i-1]};
    st=i+1;
  }
  return longest;
}
const unsolved=inkBitPages(0,55),N=unsolved.bits.length;
const all=Array.from({length:5},(_,phase)=>quintets(unsolved.bits,phase));
const numRed=unsolved.bits.reduce((s,x)=>s+x,0);
assert.equal(N,12956);
assert.equal(numRed,213);
assert.deepEqual(all.map(x=>x.zero),[2538,2538,2538,2539,2538]);
assert.equal(all[0].full,2591);
assert.equal(all[0].nonzero,53);
const run=longestBlack(unsolved.bits,unsolved.locations);
assert.deepEqual(run,{length:2949,at:[40,8],through:[53,127]});
console.log("ORIGINAL "+JSON.stringify({
  runes:N,red:numRed,black:N-numRed,longestNoRed:run,
  quintetsByPhase:all.map(({phase,full,zero,nonzero,distinctPatterns,zeroPercent})=>
    ({phase,full,zero,nonzero,distinctPatterns,zeroPercent}))
}));
for(const page of [56,57]){
  const bits=inkBitPages(page,page).bits,frames=quintets(bits);
  const red=bits.reduce((s,x)=>s+x,0);
  if(page===56) {
    assert.deepEqual({total:frames.full,black:frames.zero,red},
      {total:17,black:16,red:5});
    assert.equal(frames.counts["11111"],1);
  } else {
    assert.deepEqual({total:frames.full,black:frames.zero,red},
      {total:19,black:17,red:7});
    assert.equal(frames.counts["11111"],1);
    assert.equal(frames.counts["11000"],1);
  }
  console.log("SOLVED_SOURCE p"+page+" "+JSON.stringify({
    red,quintets:frames.full,allBlackQuintets:frames.zero,
    patterns:frames.counts,
    note:page===57?"p57 is actual clear GP writing, not biliteral encoded":
      "p56 original visible heading is encrypted by known prime/F-hold mechanism"
  }));
}
assert.equal(all[0].zero/all[0].full > .97,true);
console.log("PASS: literal visible ink Bacon quintets >97% identical on unsolved source; source-native solved control behaves alike.");
