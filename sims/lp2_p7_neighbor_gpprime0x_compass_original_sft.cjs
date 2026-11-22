"use strict";
/**
 * Exact original LP2 two-word compass / hexadecimal joint-source gate.
 * A first ciphertext word's GP0 selects its literal 32x8 table movement.
 * Its neighboring complete printed word must land at the predicted GP0
 * destination; that second word's independently given GP prime sum must
 * point to the printed literal 0x/0X token. This is a candidate grammar,
 * not an established cipher or plaintext.
 *
 * Windows 11, Node.js 22, CommonJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const dir=path.resolve(__dirname,"..","resources");
const gp=JSON.parse(fs.readFileSync(path.join(dir,"liber-primus","lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(dir,"liber-primus","base60-grid.json"),"utf8")).rows.flat();
const source=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]);
const parsed=parseSharedCorpus();
assert.equal(source.length,12956);
assert.deepEqual([parsed.words.length,parsed.crossPageWords,parsed.runeCount],[2896,32,12956]);
assert.equal(grid.length,256);
const runeIndex=new Map(gp.runes.map((glyph,i)=>[glyph,i]));
const words=parsed.words.map(word=>{
 const indices=[...word.runes].map(r=>runeIndex.get(r));
 assert.ok(indices.every(Number.isInteger));
 return {gp0:indices.reduce((s,i)=>s+i,0),
   gpPrime:indices.reduce((s,i)=>s+gp.prime[i],0),
   page:physicalLP2Page(word.startPage),
   translit:indices.map(i=>gp.translit[i]).join(""),
   indices};
});
assert.deepEqual(words.flatMap(w=>w.indices),source);
/** @param {number} index @param {string} token @returns {number|null} */
function move(index,token){
 const match=/^([1-9])([NSEW])$/i.exec(token);
 if(!match)return null;
 const count=Number(match[1]),dir=match[2].toUpperCase();
 const row=Math.floor(index/8),col=index%8;
 const r=row+(dir==="N"?-count:dir==="S"?count:0);
 const c=col+(dir==="W"?-count:dir==="E"?count:0);
 return r>=0&&r<32&&c>=0&&c<8?r*8+c:null;
}
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const groups=chapters.map(([a,b])=>words.filter(w=>w.page>=a&&w.page<=b));
assert.deepEqual(groups.map(g=>g.length),[158,255,383,437,224,326,378,669,66]);
/** @param {number} phase @returns {{eligible:number,direct:number,joint:object[]}} */
function census(phase){
 let eligible=0,direct=0;
 const joint=[];
 for(let i=0;i+1<words.length;i++){
  const prev=words[i],next=words[i+1];
  if(prev.gp0>=256)continue;
  const target=move(prev.gp0,grid[(prev.gp0+phase)%256]);
  if(target===null)continue;
  eligible++;
  if(target!==next.gp0)continue;
  direct++;
  if(next.gpPrime>=256)continue;
  if(grid[(next.gpPrime+phase)%256].toLowerCase()!=="0x")continue;
  joint.push({wordIndex:i,sourcePage:prev.page,firstWord:prev.translit,
   secondWord:next.translit,sourceGp0:prev.gp0,destinationGp0:next.gp0,
   receiverPrimeSum:next.gpPrime,sourceTableToken:grid[(prev.gp0+phase)%256],
   receiverTableToken:grid[(next.gpPrime+phase)%256],
   literalDestinationCell:grid[next.gp0]});
 }
 return {eligible,direct,joint};
}
const original=census(0);
assert.deepEqual([original.eligible,original.direct,original.joint.length],[289,2,1]);
assert.deepEqual(original.joint,[{
 wordIndex:385,sourcePage:7,firstWord:"IEOTH",secondWord:"EOUO",
 sourceGp0:24,destinationGp0:16,receiverPrimeSum:51,
 sourceTableToken:"1n",receiverTableToken:"0x",literalDestinationCell:"21"
}]);
assert.equal(String.fromCharCode(parseInt(grid[16],16)),"!");
assert.deepEqual([grid[24],grid[16],grid[51]],["1n","21","0x"]);
// A fully explicit and source-calibrated negative for treating 0x as an
// *universal* hexadecimal interpreter of all unknown word addresses:
const chosen=words.filter(w=>w.gpPrime<256&&grid[w.gpPrime]==="0x");
assert.equal(chosen.length,10);
const canHex=chosen.filter(w=>w.gp0<256&&/^[0-9A-F]{2}$/i.test(grid[w.gp0]));
assert.ok(canHex.length<chosen.length);
const phases=Array.from({length:256},(_,i)=>({phase:i,...census(i)}));
const nJoint=phases.filter(x=>x.joint.length>=original.joint.length).length;
assert.equal(nJoint,10);
assert.equal(phases.filter(x=>x.joint.length>1).length,0);
// Exact null expectation for permuting *complete* words within their
// own nine original illustration chapters; every distinct ordered pair
// is equally likely to become adjacent under a random chapter permutation.
// No simulation, fitted key, or manipulated ciphertext words.
let mean=0;
for(const group of groups){
 for(const w of group){
  if(w.gp0>=256)continue;
  const dest=move(w.gp0,grid[w.gp0]);
  if(dest===null)continue;
  for(const next of group){
   if(w===next||dest!==next.gp0||next.gpPrime>=256)continue;
   if(grid[next.gpPrime].toLowerCase()==="0x")mean+=1/(group.length-1);
  }
 }
}
assert.ok(Math.abs(mean-0.027116867137479742)<1e-12);
console.log(JSON.stringify({
 label:"Source-typed original adjacent-word grid compass + 0x readout",
 unknownOriginalRunes:source.length,
 printedWords:words.length,
 fullOriginalMatches:original,
 sourcePhaseJointRank:{atLeastOriginal:nJoint,outOf:256,max:1},
 chapterPermutationExpectedJointHits:mean,
 sourceSelectorReceiver:{source:"original p7 IEOTH",destination:"EOUO",
  movement:"cell24 1n -> cell16",hexCue:"GPprime(EOUO)=51 -> 0x",
  byte:"0x21",ASCII:"!",authenticatedPlaintext:false},
 exact0xUnknownWords:chosen.length,
 directHexReadouts:canHex.map(w=>({page:w.page,word:w.translit,
  hex:grid[w.gp0],code:parseInt(grid[w.gp0],16)})),
 unlicensedOperationWarning:"No first-party instruction selects this two-word checksum route; phase is postobserved.",
 recoveredUnknownPlaintext:false
},null,2));
