"use strict";
/**
 * Source-original HOMEX instruction-landmark uniqueness SFT.
 * SFT: node sims/lp2_p32_homex_fullbook_sentence_marker_sft.cjs
 *
 * Scans every one of 12,956 original unknown LP2 runes for HOME and HOMEX,
 * reconstructs physical p32 punctuation, and checks source-derived 11x11
 * cell coordinates and prime-axis dimensions. This certifies an authentic
 * visible marker, NOT a plaintext decryption or an intended compass.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=key=>fs.readFileSync(path.join(root,key),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const H=[8,3,19,18],X=[...H,14];
/**
 * @param {number[]} text
 * @param {number[]} motif
 * @returns {number[]}
 */
function findAll(text,motif) {
  const matches=[];
  for(let k=0;k<=text.length-motif.length;k++){
    if(motif.every((x,i)=>text[k+i]===x))matches.push(k);
  }
  return matches;
}
const allH=pages.flatMap(p=>findAll(p.indices,H)
  .map(offset=>({page:p.page,offset})));
const allX=pages.flatMap(p=>findAll(p.indices,X)
  .map(offset=>({page:p.page,offset})));
assert.deepEqual(allH,[{page:32,offset:33}]);
assert.deepEqual(allX,[{page:32,offset:33}]);
const p32=pages.find(p=>p.page===32);
assert.equal(p32.indices.length,121);
assert.deepEqual(p32.indices.slice(33,38),X);
assert.deepEqual([Math.floor(33/11),33%11,Math.floor(37/11),37%11],
  [3,0,3,4]);
const prime=corpus.prime;
assert.equal(p32.indices.slice(0,11).reduce((sum,x)=>sum+prime[x],0),563);
assert.equal(Array.from({length:11},(_,i)=>p32.indices[i*11])
  .reduce((sum,x)=>sum+prime[x],0),569);
const lines=read("resources/liber-primus/lp2-transcription.txt")
  .trim().split(/\n%\n/);
assert.equal(lines.length,58);
const text=lines[32];
const src=corpus.runes;
const marker=X.map(i=>src[i]).join("");
const idx=text.indexOf("."+marker);
assert(idx>=0,"the unique p32 original HOME starts immediately after a period");
assert.equal(text.indexOf("."+marker,idx+1),-1);
const originalGP=new Map(src.map((s,i)=>[s,i]));
const prior=Array.from(text.slice(0,idx+1))
  .filter(ch=>originalGP.has(ch)).length;
assert.equal(prior,33);
const after=Array.from(text.slice(idx+1)).map(ch=>originalGP.get(ch));
assert.deepEqual(after.slice(0,5),X);
assert(!originalGP.has(text[idx]),"sentence break is punctuation, not a rune");
assert.equal(text[idx],".");
// Disjoint independent corruption control: a one-rune mutation to the
// exact original marker must remove both whole-book HOME/HOMEX occurrences.
const altered=p32.indices.slice();altered[35]=(altered[35]+1)%29;
assert.deepEqual(findAll(altered,H),[]);
assert.deepEqual(findAll(altered,X),[]);
console.log(JSON.stringify({
  source:"complete original physical LP2 pp0-55",
  unknownRunes:12956,unknownRunePages:55,
  HOME:[...H],HOMEX:[...X],occurrencesHOME:allH,occurrencesHOMEX:allX,
  originalP32RuneCount:121,originalSentenceStartIndex:33,
  originalWordInitialRuneOffset:33,
  exactWordStartAfterFullStop:true,
  HOMECell:{row:3,column:0,offset:33},
  XCell:{row:3,column:4,offset:37},
  firstElevenRunePrimeSum:563,firstColumnElevenPrimeSum:569,
  positiveMarkerMutantElimination:true,
  originalUnknownPlaintextRecovered:0
},null,2));
