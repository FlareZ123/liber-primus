"use strict";
/**
 * Source-constrained affine transport between the two uniquely marked LP2
 * three-rune red inscriptions at physical p3:119 and p39:119.
 *
 * T(x)=24-2*x mod29 was observed in the independent lag-six manuscript
 * ciphertext analysis. Reverse T exactly 36 times, fixed by the source
 * page separation, before examining red-rune values:
 *
 * T^-36(x)=23*x+27 mod29.
 *
 * This maps the two red payload positions and their following black rune
 * at the same source offset; it does NOT decrypt the remaining page pair.
 *
 * Node 22 / CommonJS, original source, no filesystem writes.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const mod=x=>((x%29)+29)%29;
/** @param {number} x */
const T=x=>mod(24-2*x);
/** @param {number} y */
const inverseT=y=>mod(15*(24-y));
/** @param {(x:number)=>number} f @param {number} x @param {number} k */
function repeat(f,x,k){
  for(let i=0;i<k;i++)x=f(x);
  return x;
}
for(let x=0;x<29;x++){
  assert.equal(inverseT(T(x)),x);
  assert.equal(T(inverseT(x)),x);
  assert.equal(repeat(T,x,28),x);
}
assert.equal(T(8),8);
assert.notEqual(repeat(T,0,14),0);
const triads=ink.pages.flatMap(page=>(page.red_spans||[])
  .filter(span=>span.length===3)
  .map(span=>({page:page.page,at:span.start,length:span.length})));
assert.deepEqual(triads,[
  {page:3,at:119,length:3},{page:39,at:119,length:3}
]);
const [first,second]=triads;
const page3=corpus.pages.find(p=>p.page===first.page).indices;
const page39=corpus.pages.find(p=>p.page===second.page).indices;
const red3=page3.slice(first.at,first.at+3);
const red39=page39.slice(second.at,second.at+3);
assert.deepEqual(red3,[13,23,2]);
assert.deepEqual(red39,[27,5,15]);

// Distance comes from the physical page labels, not fitted text data.
const gap=second.page-first.page;
assert.equal(gap,36);
const intercept=repeat(inverseT,0,gap);
const multiplier=mod(repeat(inverseT,1,gap)-intercept);
const f=x=>mod(multiplier*x+intercept);
assert.deepEqual([multiplier,intercept],[23,27]);
for(let x=0;x<29;x++)assert.equal(f(x),repeat(inverseT,x,gap));
assert.equal(red3[1],multiplier);
assert.equal(red39[0],intercept);

// The first marked target rune encodes the affine intercept, so the first
// marked input is not itself expected to match the transport.
assert.equal(T(page3[119]),page39[119]);
assert.notEqual(f(page3[119]),page39[119]);
for(const i of [120,121,122])assert.equal(f(page3[i]),page39[i]);
// Position122 is the first non-red rune, withheld from the two red payload
// positions and the intercept used to state the map.
assert.notEqual(f(page3[123]),page39[123]);

/**
 * @param {number[]} left @param {number[]} right
 * @returns {{length:number,hits:number,matches:number[],tripleStarts:number[]}}
 */
function align(left,right){
  const length=Math.min(left.length,right.length);
  const isMatch=Array.from({length},(_,i)=>f(left[i])===right[i]);
  return {
    length,
    hits:isMatch.filter(Boolean).length,
    matches:isMatch.flatMap((yes,i)=>yes?[i]:[]),
    tripleStarts:isMatch.flatMap((yes,i)=>yes&&i+2<length&&
      isMatch[i+1]&&isMatch[i+2]?[i]:[])
  };
}
const marked=align(page3,page39);
assert.deepEqual(marked,{
  length:217,hits:7,
  matches:[97,120,121,122,150,155,203],
  tripleStarts:[120]
});
const pairs=[];
for(let left=0;left+gap<=55;left++){
  const right=left+gap;
  const p=corpus.pages.find(page=>page.page===left).indices;
  const q=corpus.pages.find(page=>page.page===right).indices;
  if(!p.length||!q.length)continue;
  const stats=align(p,q);
  pairs.push({left,right,...stats});
}
assert.equal(pairs.length,19);
assert.deepEqual(pairs.flatMap(p=>p.tripleStarts.map(at=>
  [p.left,p.right,at])),[[3,39,120]]);
const transcription=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const textPages=transcription.split("%");
for(const [page,triad] of [[3,red3],[39,red39]]){
  const glyphs=triad.map(i=>corpus.runes[i]).join("");
  assert(textPages[page].includes("&\\n"+glyphs+"."),
    "red triple must follow 13-dot marker and finish before period");
}
const source3Unicode=page3.slice(119,124).map(i=>corpus.runes[i]).join("");
const source39Unicode=page39.slice(119,124).map(i=>corpus.runes[i]).join("");
console.log(JSON.stringify({
  classification:"Exact three-rune local source transport; no recovered plaintext or generalized page decryption",
  source:"Canonical unsolved LP2 original physical pages with red spans and GP29 rune ordinals",
  priorT6:"T(x)=(24-2x) mod29",pageSeparation:gap,
  fixedReverseMap:{steps:gap,multiplier,intercept},
  markedTriples:{page3:red3,page39:red39},
  visualGrammar:"Both p3 and p39 have 13-dot marker, a three-red-rune unit, a period, and a black word starting at offset122",
  firstMarkedSymbolMapsByOneT6Step:T(red3[0])===red39[0],
  heldoutAdjacentBlackRune:{
    sourceIndex:122,sourceGlyph:corpus.translit[page3[122]],
    predictedTargetIndex:f(page3[122]),
    actualTargetIndex:page39[122],
    match:true
  },
  sourceWindow:{page3:source3Unicode,page39:source39Unicode},
  fullMarkedPair:{overlap:marked.length,matches:marked.hits,
    expectedAtUniformRate:marked.length/29,
    exactMatchOffsets:marked.matches,
    longestExactSourceRun:marked.tripleStarts},
  allNineteenGap36Pairs:{
    pairs:pairs.length,totalAlignedPositions:pairs.reduce((s,p)=>s+p.length,0),
    pairsWithAnyTriple:pairs.filter(p=>p.tripleStarts.length).length,
    tripleLocations:pairs.flatMap(p=>p.tripleStarts.map(at=>
      ({pageA:p.left,pageB:p.right,offset:at})))
  },
  caveat:"The transform family and negative page direction are chosen from research leads. The local 1-rune black extension is a new original-input prediction; 7/217 full-page matches do not indicate shared plaintext or an authenticated cipher."
},null,2));
