"use strict";
/**
 * Original LP2 red-span / authenticated 2016 signed-message phrase-shape SFT.
 *
 * Source-only (no plaintext assumptions): take all 14 red spans with two
 * or more complete printed GP29 words across original unknown pp0-55.
 * Compare whole span word lengths against all consecutive word sequences
 * of the entire 43-word authenticated 2016 message. Enumerate both literal
 * Latin-character and solved-LP-calibrated GP29-rune source word lengths.
 *
 * Complete source-word multiset Fisher-Yates controls estimate, in separate
 * training/evaluation pools, the joint score across all original red shapes.
 * Duplicate [3,5] source shapes count once. No search over guessed plaintext.
 *
 * Node 22 CommonJS, built-ins only. Run from repository root:
 * node sims/lp2_signed2016_allred_source_shape_familywise_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8").replace(/\r\n/g,"\n");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signedRaw=read("resources/historical/cicada2016-4gq25-outguess.asc");
const signedBody=signedRaw.split("\n\n").slice(1).join("\n\n")
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/\b7A35090F\b/g,"");
const signed=(signedBody.match(/[A-Za-z]+/g)||[]).map(s=>s.toUpperCase());
assert.equal(signed.length,43);
assert.equal(signed[0],"HELLO");
assert.equal(signed[signed.length-1],"OPENPGP");
const runeSet=new Set(gp.runes);
const words=[];
let pos=0,start=0;
for(const glyph of transcription){
  if(runeSet.has(glyph))pos++;
  else if("-.$&§".includes(glyph)&&pos>start){
    words.push({start,end:pos,length:pos-start});
    start=pos;
  }
}
assert.equal(pos,13136);
assert.equal(words.length,2941);
let offset=0;
const scopes=[];
for(const page of gp.pages){
  const annotation=ink.pages.find(p=>p.page===page.page);
  if(page.page<=55) for(const marked of annotation?.red_spans||[]){
    const at=offset+marked.start, end=at+marked.length;
    const complete=words.filter(w=>w.start>=at&&w.end<=end);
    if(complete.length<2)continue;
    const sum=complete.reduce((n,w)=>n+w.length,0);
    if(sum===marked.length)scopes.push({
      page:page.page,runes:marked.length,
      pattern:complete.map(w=>w.length).join(",")
    });
  }
  offset+=page.indices.length;
}
assert.equal(scopes.length,14);
assert.equal(offset,13136);
const distinct=[...new Set(scopes.map(s=>s.pattern))];
assert.equal(distinct.length,13);
const patterns=distinct.map(s=>s.split(",").map(Number));
const tokens=gp.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} word @returns {number} */
function sourceGPRuneLength(word){
  const w=word.replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let n=0;
  for(let i=0;i<w.length;n++){
    if(w.startsWith("ING",i))i+=3;
    else if(w.startsWith("IO",i))i+=2;
    else {
      const token=tokens.find(s=>w.startsWith(s,i));
      assert(token,"No GP29 token "+word+" at "+i);
      i+=token.length;
    }
  }
  return n;
}
const sourceModes=[
  {name:"Latin-character",lengths:signed.map(s=>s.length)},
  {name:"native-GP29",lengths:signed.map(sourceGPRuneLength)}
];
/** @param {number[]} sequence @returns {number[]} */
function matches(sequence){
  const out=Array(patterns.length).fill(0);
  for(let k=0;k<patterns.length;k++){
    const p=patterns[k];
    for(let i=0;i+p.length<=sequence.length;i++){
      if(p.every((n,j)=>n===sequence[i+j])){out[k]=1;break;}
    }
  }
  return out;
}
const actual=sourceModes.map(m=>matches(m.lengths));
assert.deepEqual(actual.map((a)=>a.reduce((n,x)=>n+x,0)),[4,5]);
/** @param {number[]} hits */
const names = hits => hits.flatMap((x,i)=>x?[distinct[i]]:[]);
assert.deepEqual(names(actual[0]),["8,5","4,5","4,2,5","3,5"]);
assert.deepEqual(names(actual[1]),["8,5","4,5","4,2,5","2,8","3,5"]);
let state=0x33011624;
/** @returns {number} */
function randomU32(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
/** @returns {number[]} */
function shuffleIndices(){
  const out=Array.from({length:signed.length},(_,i)=>i);
  for(let i=out.length-1;i>0;i--){
    const j=randomU32()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/** @param {number[]} permutation @param {number[]} source */
function permuted(permutation,source){return permutation.map(i=>source[i]);}
const TRAIN=110000,EVAL=110000;
const patternHits=sourceModes.map(()=>Array(patterns.length).fill(0));
for(let trial=0;trial<TRAIN;trial++){
  const permutation=shuffleIndices();
  for(let m=0;m<sourceModes.length;m++){
    const hit=matches(permuted(permutation,sourceModes[m].lengths));
    for(let k=0;k<hit.length;k++)patternHits[m][k]+=hit[k];
  }
}
const weights=patternHits.map(row=>row.map(count=>
  -Math.log((count+1)/(TRAIN+2))));
/** @param {number[]} hits @param {number[]} w */
function score(hits,w){
  return hits.reduce((sum,hit,i)=>sum+hit*w[i],0);
}
const actualScores=actual.map((x,i)=>score(x,weights[i]));
const tails=[0,0],scoreMeans=[0,0];
let anyTail=0;
for(let trial=0;trial<EVAL;trial++){
  const permutation=shuffleIndices();
  const scores=sourceModes.map((source,i)=>
    score(matches(permuted(permutation,source.lengths)),weights[i]));
  let any=false;
  for(let m=0;m<scores.length;m++){
    scoreMeans[m]+=scores[m];
    if(scores[m]>=actualScores[m]-1e-10){tails[m]++;any=true;}
  }
  if(any)anyTail++;
}
assert.deepEqual(tails,[7925,6659]);
assert.equal(anyTail,12957);
const report={
  classification:"no title, plaintext, key or cipher established",
  signedWords:signed.length,
  sourceRedSpans:scopes,
  distinctSourceShapes:distinct.length,
  sourceSpecificMatchedShapes:actual.map(names),
  null:{seed:"0x33011624",train:TRAIN,evaluate:EVAL,
    score:"sum of negative log baseline incidence, each distinct source shape once",
    observedScores:actualScores,
    meanNullScores:scoreMeans.map(n=>n/EVAL),
    marginalTails:tails.map(n=>(n+1)/(EVAL+1)),
    bothRegisterFamilywiseTail:(anyTail+1)/(EVAL+1)}
};
console.log(JSON.stringify(report,null,2));
