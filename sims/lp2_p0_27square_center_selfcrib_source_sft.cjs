"use strict";
/**
 * A source-anchored 27x27 first-chapter candidate and the all-window exact
 * center self-crib census. Reproduces the claimed ASIGOTHE -> WEATHER
 * arithmetic without selecting letters from English text.
 *
 * Candidate reading coordinates and the phi/mu key law are documented by
 * 2retooz270703; first mirror stop, target center and row-above self-crib
 * are hypotheses, not original Cicada-authenticated instructions.
 *
 * Run: node sims/lp2_p0_27square_center_selfcrib_source_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const label = n => corpus.translit[n];
const chapter = corpus.pages.slice(0,3).flatMap(p=>p.indices);
const all = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(chapter.length,729);
assert.equal(all.length,12956);
assert.deepEqual(chapter,all.slice(0,729));

/** @param {number} n @returns {number} */
function phi(n){assert.ok(n>=1);let v=n,m=n;for(let d=2;d*d<=m;d++){
 if(m%d===0){v-=v/d;while(m%d===0)m/=d;}
}if(m>1)v-=v/m;return v;}
/** @param {number} n @returns {number} */
function mu(n){assert.ok(n>=1);let s=1,m=n;for(let d=2;d*d<=m;d++){
 if(m%d===0){m/=d;s=-s;if(m%d===0)return 0;}
}return m>1?-s:s;}
const tot=Array.from({length:29},(_,i)=>i?phi(i):0);
const mob=tot.map((n,i)=>i?mu(n):0);
const pos=(r,c)=>27*(r-1)+(c-1);
const cell=(r,c)=>chapter[pos(r,c)];
const name=seq=>seq.map(label).join(" ");
/** @param {number[]} original key source */
function derive(original){
 assert.equal(original.length,3);assert.ok(original.every(x=>x>0&&x<29));
 const raw=[original[0],tot[original[1]],original[2]];
 const signature=raw.map(x=>mob[x]);
 const phase=((signature.reduce((a,b)=>a+b,0)%3)+3)%3;
 return {raw,signature,phase,
   key:raw.slice(phase).concat(raw.slice(0,phase))};
}
const firstNode=[cell(13,11),cell(13,12),cell(13,13)];
assert.deepEqual(firstNode,[25,11,28]);
const first=derive(firstNode);
assert.deepEqual(first.key,[25,10,28]);
assert.equal(first.phase,0);
const firstDistance=tot[firstNode[1]]+tot[tot[firstNode[1]]];
assert.equal(firstDistance,14);
const firstStart=pos(13,11+firstDistance);
assert.equal(firstStart,pos(13,25));
const firstMirrorAt=(()=>{
 for(let i=0;i<100;i++)if(chapter[firstStart+i]===chapter[firstStart+i+2])return i;
 return -1;
})();
assert.equal(firstMirrorAt,6);
const firstLen=firstMirrorAt+1;
const firstCipher=chapter.slice(firstStart,firstStart+firstLen);
assert.deepEqual(firstCipher,[20,25,9,2,13,1,14]);
const firstPlain=firstCipher.map((x,i)=>(x-first.key[i%3]+29)%29);
assert.deepEqual(firstPlain,[24,15,10,6,3,2,18]); // AS I GO THE
const nextNode=chapter.slice(firstStart+firstMirrorAt,
  firstStart+firstMirrorAt+3);
assert.deepEqual(nextNode,[14,22,14]);
const second=derive(nextNode);
assert.deepEqual(second.key,[14,14,10]);
assert.equal(second.phase,2);
const nodeLeft=4,secondDistance=tot[nextNode[1]];
assert.equal(secondDistance,10);
const secondStart=pos(14,nodeLeft+secondDistance);
assert.equal(secondStart,pos(14,14));
const secondCipher=chapter.slice(secondStart,secondStart+5);
const secondPlain=secondCipher.map((x,i)=>(x-second.key[i%3]+29)%29);
assert.deepEqual(secondCipher,[21,13,12,3,18]);
assert.deepEqual(secondPlain,[7,28,2,18,4]); // W EA TH E R
const above=chapter.slice(pos(13,14),pos(13,14)+3);
assert.deepEqual(above,[7,28,2]);
assert.deepEqual(above,secondPlain.slice(0,3));
// The source at row 13 supplies the three-rune self-crib, and the original
// row14 cells + the key selected ten columns to the left reproduce it.
assert.deepEqual(above.map((x,i)=>(secondCipher[i]-x+29)%29),
 second.key);

/**
 * Count EVERY same-row, left-of-center original key-node that would align
 * its phi(center) step onto column14 and reproduce the three raw ciphertext
 * runes one row above the central three, with no language score or guess.
 * @param {number[]} tape source tape, length >= 729
 * @param {number} start the first cell of an arbitrary consecutive 729-window
 * @returns {number[]} matching source-node left columns
 */
function centerSelfCrib(tape,start){
 const row=start+pos(14,1),center=start+pos(14,14),above=start+pos(13,14);
 const hits=[];
 for(let left=1;left<=13;left++){
  const original=[tape[row+left-1],tape[row+left],tape[row+left+1]];
  if(original.includes(0))continue;
  if(left+tot[original[1]]!==14)continue;
  const key=derive(original).key;
  if([0,1,2].every(i=>(tape[center+i]-key[i]+29)%29===tape[above+i]))
   hits.push(left);
 }
 return hits;
}
assert.deepEqual(centerSelfCrib(chapter,0),[4]);
const allHits=[];
for(let start=0;start<=all.length-729;start++){
 for(const left of centerSelfCrib(all,start))allHits.push([start,left]);
}
assert.deepEqual(allHits,[[0,4]]);
// An exact control preserving every original rune, punctuation-free order and
// adjacent pair in the 729 source tests every one of its 729 cyclic phases.
let shiftsMatching=0;
for(let shift=0;shift<729;shift++){
 const rotated=chapter.slice(shift).concat(chapter.slice(0,shift));
 if(centerSelfCrib(rotated,0).length){
  shiftsMatching++;
  assert.equal(shift,0);
 }
}
assert.equal(shiftsMatching,1);
// Native positive plant for the all-secret self-crib test, with all three
// crib symbols set algebraically before applying the detector.
const plant=chapter.slice(1).concat(chapter[0]);
for(let i=0;i<3;i++)plant[pos(14,4)+i]=[14,22,14][i];
const plantedKey=derive([14,22,14]).key;
for(let i=0;i<3;i++)
 plant[pos(13,14)+i]=(plant[pos(14,14)+i]-plantedKey[i]+29)%29;
assert.ok(centerSelfCrib(plant,0).includes(4));


// A further conditional continuation uses independent source geometry:
// current original OE (22) has phi=10, its transformed I (10) has phi=4.
// The grid center is NG; find a later radius-4 same-NG horizontal mirror.
const rawNextCenter=nextNode[1];
const verticalRadius=tot[rawNextCenter];
const horizontalRadius=tot[tot[rawNextCenter]];
assert.deepEqual([verticalRadius,horizontalRadius],[10,4]);
const horizontalCenters=[];
for(let k=15+horizontalRadius;k<=27-horizontalRadius;k++){
 if(cell(14,k)===cell(14,14) &&
   cell(14,k-horizontalRadius)===cell(14,k+horizontalRadius))
   horizontalCenters.push(k);
}
assert.deepEqual(horizontalCenters,[23]);
const thirdNode=[cell(14-verticalRadius,23),cell(14,23),
 cell(14+verticalRadius,23)];
assert.deepEqual(thirdNode,[8,21,5]); // H-NG-C
// A source-driven selector for whether a node transforms its center is
// missing. Test the raw-center branch and preserve the alternative.
const thirdSignature=thirdNode.map(x=>mob[x]);
const thirdPhase=((thirdSignature.reduce((a,b)=>a+b,0)%3)+3)%3;
const thirdKey=thirdNode.slice(thirdPhase).concat(thirdNode.slice(0,thirdPhase));
assert.deepEqual(thirdKey,[8,21,5]);
const thirdCipher=Array.from({length:5},(_,i)=>cell(14-i,19));
const thirdPlain=thirdCipher.map((x,i)=>(x-thirdKey[i%3]+29)%29);
assert.deepEqual(thirdPlain,[16,1,4,9,15]); // T-U-R-N-S
const altKey=derive(thirdNode).key;
const altPlain=thirdCipher.map((x,i)=>(x-altKey[i%3]+29)%29);
assert.deepEqual(altPlain,[16,10,4,9,24]); // T-I-R-N-A
const pageZeroEnd=corpus.pages[0].indices.length;
const thirdGlobalSourcePositions=Array.from({length:5},(_,i)=>pos(14-i,19)+1);
assert.equal(pageZeroEnd,262);
assert.deepEqual(thirdGlobalSourcePositions,[370,343,316,289,262]);
// The last TURNS rune is the original last rune of physical p0.
// Reading the vertical sequence upward from its p1 start, this is the
// FIRST symbol located on p0. A source-selected terminal is therefore
// possible without knowing that the five-rune output spells TURNS.
assert.ok(thirdGlobalSourcePositions.slice(0,-1).every(i=>i>pageZeroEnd));
assert.equal(thirdGlobalSourcePositions.at(-1),pageZeroEnd);

// Conditional fourth stage: phi(original NG=21)=12 moves down from
// the left A of the preceding radius-4 mirror (14,19) to TH(26,19);
// its immediate vertical neighbors H/ H supply H-TH-H.
const down=tot[thirdNode[1]];
assert.equal(down,12);
assert.equal(cell(14+down,19),2); // TH
const fourthNode=[cell(25,19),cell(26,19),cell(27,19)];
const fourth=derive(fourthNode);
assert.deepEqual(fourthNode,[8,2,8]);
assert.deepEqual(fourth.key,[1,8,8]); // U-H-H
// Moving left from the same A anchor by phi(NG)=12 yields (14,7),
// which the author's axis prediction subsequently reads vertically up.
const coldStart=19-down;
assert.equal(coldStart,7);
const fourthCipher=Array.from({length:4},(_,i)=>cell(14-i,coldStart));
const fourthPlain=fourthCipher.map((x,i)=>(x-fourth.key[i%3]+29)%29);
assert.deepEqual(fourthPlain,[5,3,20,23]); // C-O-L-D
// Source-visible stopping point: the FIRST visited cell that is the
// center of an immediately adjacent vertical mirrored triple.
let firstCenterMirrorRow=-1;
for(let r=14;r>=2;r--){
 if(cell(r-1,coldStart)===cell(r+1,coldStart)){
  firstCenterMirrorRow=r;break;
 }
}
assert.equal(firstCenterMirrorRow,11);
assert.deepEqual([cell(10,7),cell(11,7),cell(12,7)],[28,24,28]); // EA-A-EA
const fourthGlobalPositions=Array.from({length:4},(_,i)=>pos(14-i,coldStart)+1);
assert.deepEqual(fourthGlobalPositions,[358,331,304,277]);

console.log(JSON.stringify({
 source:"LP2 p0-2 canonical 729 runes in original order",
 firstNode:name(firstNode),firstStart:[13,25],firstStopOffset:firstLen,
 firstKey:name(first.key),firstOutput:name(firstPlain),
 nextNode:name(nextNode),secondStart:[14,14],secondKey:name(second.key),
 sourceCribAboveCenter:name(above),sourceCipherAtCenter:name(secondCipher),
 secondOutput:name(secondPlain),
 thirdSameCenterMirrorAt:[14,23], thirdRawCenterPhiRadius:verticalRadius,
 thirdDerivedCenterPhiRadius:horizontalRadius,
 thirdSourceNode:name(thirdNode), thirdRawKey:name(thirdKey),
 thirdOutput:name(thirdPlain), thirdTransformedAlternative:name(altPlain),
 thirdSourcePositions:thirdGlobalSourcePositions,
 originalPhysicalP0Last:pageZeroEnd,
 fourthSourceNode:name(fourthNode), fourthKey:name(fourth.key),
 fourthOutput:name(fourthPlain), fourthSourcePositions:fourthGlobalPositions,
 firstFourthRayVerticalMirrorCenter:[firstCenterMirrorRow,coldStart],
 completeBookUnknownRunes:all.length,
 contiguous729Windows:all.length-729+1,centerSelfCribHits:allHits,
 cyclic729PhasesWithCenterSelfCrib:shiftsMatching,
 classification:"Source-exact candidate. No authenticated stopping rule, independent continuous route or unknown plaintext certification."
},null,2));
