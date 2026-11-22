"use strict";
/**
 * Frozen source 19-excess direct GP29 one-time-pad hypothesis.
 * Original p29/G quotient275, first13+last6 cut selected by the already
 * visible p27 red marker13 and preceding red heading length19, leaving
 * exactly256 symbols, minus every source-p50 table byte modulo29.
 * Full original inverse and source-native 256 plant, negative source prose.
 * Windows Node22 CommonJS, read-only, no external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const model=buildSourceNativeTrigramModel({corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const source=corpus.pages.find(p=>p.page===29).indices,G=[15,5,27];
const mod=x=>((x%29)+29)%29;
/** @param {number[]} original */
function divide(original){
 const work=original.map(mod),q=[];
 for(let i=0;i<original.length-2;i++){
  const v=mod(work[i]*2);q.push(v);
  for(let j=0;j<3;j++)work[i+j]=mod(work[i+j]-v*G[j]);
 }
 return {q,remainder:work.slice(-2)};
}
/** @param {number[]} q */
function multiply(q){
 const out=Array(q.length+2).fill(0);
 for(let i=0;i<q.length;i++)for(let j=0;j<3;j++)out[i+j]=mod(out[i+j]+G[j]*q[i]);
 return out;
}
/** @param {number[]} a */
function ioc(a){
 const counts=Array(29).fill(0);
 for(const v of a)counts[v]++;
 return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
assert.equal(source.length,277);
assert.equal(grid.bytes.length,256);
const matching=ink.pages.flatMap(page=>(page.red_spans||[]).flatMap(span=>{
 const mark=(page.large_punctuation||[]).some(m=>m[0]===span.start+span.length&&m[1]===13&&m[2]==="red");
 return mark&&span.length===19?[{page:page.page,start:span.start,length:span.length}]:[];
}));
assert.deepEqual(matching,[{page:27,start:0,length:19}]);
const result=divide(source);
assert.deepEqual(result.remainder,[0,0]);
assert.equal(result.q.length,275);
assert.deepEqual(multiply(result.q),source);
const core=result.q.slice(13,-6);
assert.equal(core.length,256);
const plain=core.map((v,i)=>mod(v-grid.bytes[i]));
assert.equal(plain.length,256);
const recovered=plain.map((v,i)=>mod(v+grid.bytes[i]));
assert.deepEqual(recovered,core);
const replayed=[...result.q.slice(0,13),...recovered,...result.q.slice(-6)];
assert.deepEqual(replayed,result.q);
assert.deepEqual(multiply(replayed),source);
const positive=model.training.slice(0,256);
const encrypted=positive.map((v,i)=>mod(v+grid.bytes[i]));
assert.deepEqual(encrypted.map((v,i)=>mod(v-grid.bytes[i])),positive);
const score=model.scoreStream(plain).mean;
assert(Math.abs(score-(-3.4420320744871034))<1e-10);
assert(Math.abs(ioc(plain)-0.03373161764705882)<1e-12);
assert(score<model.p57Score-0.5);
console.log(JSON.stringify({
 status:"PASS",
 interpretation:"Original source 13+6 cut then p50 raw byte pad yields no native-GP plaintext; exact frozen receiver rejected.",
 source:{p29OriginalRunes:277,G,quotientRunes:275,cutFirst:13,cutLast:6,p50Bytes:256,redMarkerPages:matching},
 original:{quotientTrigram:model.scoreStream(result.q).mean,coreTrigram:model.scoreStream(core).mean},
 decoded:{runes:256,trigram:score,ioc:ioc(plain),first150:model.spell(plain.slice(0,150))},
 controls:{solvedP57Trigram:model.p57Score,solvedP57IoC:ioc(corpus.pages.find(p=>p.page===57).indices),
   positivePlantRunes:256,originalReplayRunes:277}
},null,2));
