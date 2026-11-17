"use strict";

/**
 * Original-source hard obstruction to external Phase57 R3:
 * strict anti-repeat before a second-pass insertion of AT MOST ONE null
 * rune per printed word. A single deletion must therefore restore the
 * pre-null no-doublet property in every original printed word.
 *
 * Source p27 archive 44.jpg has a literal 12-rune word with two separated
 * doubled pairs. Node 22 CommonJS, read-only and independent of any key.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp2-transcription.txt");
const runeSet=new Set(gp.runes);
const TOTAL=12956;
const words=[];let n=0,w=[],start=0;
for(const ch of source){
  if(runeSet.has(ch)){
    if(!w.length)start=n;
    w.push(ch);n++;
    if(n===TOTAL){words.push({start,runes:w});break;}
  }else if(ch==="-"||ch==="."||ch==="&"){
    if(w.length)words.push({start,runes:w});
    w=[];
  }
}
assert.equal(n,TOTAL);
assert.equal(words.length,2896);

/** @param {string[]} word @returns {number[]} */
function adjacentDoubles(word){
  const s=[];
  for(let j=1;j<word.length;j++)if(word[j]===word[j-1])s.push(j);
  return s;
}
/**
 * R3 necessary condition: deleting zero or one rune eliminates all
 * pre-existing within-word doubles. Independent of where a null is
 * inserted or what its 29-symbol value is.
 * @param {string[]} word @returns {boolean}
 */
function fitsAtMostOneNull(word){
  if(adjacentDoubles(word).length===0)return true;
  for(let i=0;i<word.length;i++){
    const cut=word.filter((_,j)=>i!==j);
    if(adjacentDoubles(cut).length===0)return true;
  }
  return false;
}
const doubled=words.map((w,i)=>({...w,word:i,sites:adjacentDoubles(w.runes)}))
  .filter(w=>w.sites.length>0);
const failures=doubled.filter(w=>!fitsAtMostOneNull(w.runes));
assert.equal(doubled.length,62);
assert.equal(doubled.reduce((sum,w)=>sum+w.sites.length,0),63);
assert.deepEqual(failures.map(w=>w.word),[1476]);
const witness=failures[0];
assert.equal(witness.start,6606);
assert.deepEqual(witness.sites,[5,11]);
assert.deepEqual(witness.runes.map(r=>gp.runes.indexOf(r)),
  [12,4,9,15,3,3,5,24,18,26,18,18]);
assert.equal(witness.runes.join(""),"ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ");

// Determine source physical page and local index, not ZIP filename guesswork.
let offset=0,location=null;
for(const p of gp.pages){
  if(p.page>=56)break;
  if(witness.start>=offset && witness.start<offset+p.indices.length){
    location={physicalPage:p.page,archiveJpeg:p.page+17,
      pageLocalStart:witness.start-offset};
    break;
  }
  offset+=p.indices.length;
}
assert.deepEqual(location,{physicalPage:27,archiveJpeg:44,pageLocalStart:79});

/**
 * Positive plant: every strict adjacent-distinct GP29 word with zero or
 * one inserted source-alphabet rune is accepted regardless of slot/value.
 * Fully enumerate all 29 values and 12 positions of a chosen 11-rune base.
 */
const base=gp.runes.slice(0,11);
assert.equal(adjacentDoubles(base).length,0);
let planted=0;
for(let slot=0;slot<=base.length;slot++)for(const nullRune of gp.runes){
  const word=base.slice(0,slot).concat(nullRune,base.slice(slot));
  assert.ok(fitsAtMostOneNull(word),"positive plant failed at "+slot);
  planted++;
}
assert.equal(planted,348);

// Construct a two-null negative word with two disjoint doublet pairs.
const twoNull=base.slice();
twoNull.splice(3,0,twoNull[2]);
twoNull.splice(9,0,twoNull[8]);
assert.ok(!fitsAtMostOneNull(twoNull),"two-spaced-doublet negative must fail");

console.log(JSON.stringify({
  claim:"R3 strict pre-null no-doublet plus at-most-one later null per original printed word is impossible",
  scope:"The external model R3 exact printed boundaries only; does not exclude R4/R7 residual doublets or >1 null",
  source:{runes:TOTAL,words:words.length},
  real:{insideWordDoubles:63,wordsWithDoubles:doubled.length,
    impossibleWordCount:failures.length,
    witness:{globalPrintedWord0:witness.word,globalRuneStart0:witness.start,
      originalRuneIndices:witness.runes.map(r=>gp.runes.indexOf(r)),
      localDoubletEndIndices0:witness.sites,physicalPage:location.physicalPage,
      archiveJpeg:location.archiveJpeg,pageLocalRuneStart0:location.pageLocalStart}},
  control:{singleInsertedNullPlantedAndAccepted:planted,
    twoDistantInsertionsRejected:true},
  recoveredUnknownPlaintext:false
},null,2));
