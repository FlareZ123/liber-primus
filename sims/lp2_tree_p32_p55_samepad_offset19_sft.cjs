"use strict";
/**
 * Agent 9 original-input source-art pair same-pad key-free difference test.
 * Conditional exploratory maximum-IoC null, no plaintext recovery.
 * node sims/lp2_tree_p32_p55_samepad_offset19_sft.cjs
 */
const fs=require("node:fs");
const assert=require("node:assert/strict");
const j=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const p=j.pages.find(x=>x.page===32).indices;
const q=j.pages.find(x=>x.page===55).indices;
assert.equal(p.length,121);assert.equal(q.length,76);
const ioc=a=>{const c=new Uint16Array(29);for(const v of a)c[v]++;return [...c].reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));};
const scores=q0=>Array.from({length:46},(_,o)=>ioc(q0.map((v,i)=>(p[o+i]-v+29)%29)));
const original=scores(q), observed=Math.max(...original);
assert.equal(original.indexOf(observed),19);
assert.equal(observed,0.05263157894736842);
let state=3021156619>>>0;
const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
let maxExceed=0,fixedExceed=0,sum=0;
const maxima=[];
for(let t=0;t<6000;t++){
 const sample=q.slice();
 for(let i=sample.length-1;i>0;i--){const k=Math.floor(rand()*(i+1));[sample[i],sample[k]]=[sample[k],sample[i]];}
 const vals=scores(sample), maximum=Math.max(...vals);
 if(maximum>=observed-1e-12)maxExceed++;
 if(vals[19]>=original[19]-1e-12)fixedExceed++;
 maxima.push(maximum);sum+=maximum;
}
maxima.sort((a,b)=>a-b);
assert.equal(maxExceed,31);assert.equal(fixedExceed,1);
console.log(JSON.stringify({
sourcePages:[32,55], lengths:[121,76], alphabet:29,
operation:"(p32[offset+i]-p55[i]) mod 29",
alignments:46, bestOffset:19, observedMaxIoC:observed,
null:"permute p55 rune identities without changing its unigram multiset",
random:"xorshift32 seed3021156619 Fisher-Yates", trials:6000,
maxExceed, familywiseAddOneP:(maxExceed+1)/6001,
fixed19Exceed, fixed19AddOneP:(fixedExceed+1)/6001,
maxMean:sum/6000, max95: maxima[5700], max99:maxima[5940],
warning:"RUNE shuffling breaks doublet and word structure; this is a conditional weak null, not evidence of historical same-pad reuse. Offset19 was selected as the maximum among 46, despite previously known p32 W/19 clue; no unknown plaintext or authenticated key."
},null,2));