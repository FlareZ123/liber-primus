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

console.log(JSON.stringify({
 source:"LP2 p0-2 canonical 729 runes in original order",
 firstNode:name(firstNode),firstStart:[13,25],firstStopOffset:firstLen,
 firstKey:name(first.key),firstOutput:name(firstPlain),
 nextNode:name(nextNode),secondStart:[14,14],secondKey:name(second.key),
 sourceCribAboveCenter:name(above),sourceCipherAtCenter:name(secondCipher),
 secondOutput:name(secondPlain),
 completeBookUnknownRunes:all.length,
 contiguous729Windows:all.length-729+1,centerSelfCribHits:allHits,
 cyclic729PhasesWithCenterSelfCrib:shiftsMatching,
 classification:"Source-exact candidate. No authenticated stopping rule, independent continuous route or unknown plaintext certification."
},null,2));
