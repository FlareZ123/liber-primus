"use strict";
/**
 * Key-independent original p55 exterior-copy obstruction.
 *
 * Preserving every first/last GP rune of each original complete printed word,
 * while changing only the 43 strict interior runes, necessarily preserves
 * all five original two-rune words. None are in any of four pinned independent
 * native-GP English word sets. Therefore no interior-only receiver can yield
 * fully ordinary source-native English with preserved original word breaks.
 *
 * Runs read-only under Windows Node.js 22:
 *   node sims/lp2_p55_exterior_copy_two_rune_obstruction_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page = corpus.pages.find(p=>p.page===55).indices;
assert.equal(page.length,76);

// First one-rune fragment is a carry from p54; then 16 complete words.
const fragmentLengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(fragmentLengths.reduce((a,b)=>a+b,0),76);
const fragments=[];
let at=0;
for(const n of fragmentLengths){
  fragments.push({start:at,indices:page.slice(at,at+n)});
  at+=n;
}
const complete=fragments.slice(1);
assert.equal(complete.length,16);

// Strictly interior positions are never touched by a proposed exterior-copy
// decoding, regardless of its inner key, feedback, permutation or output map.
const inside=[];
const outside=[0];
for(const word of complete){
  const n=word.indices.length;
  outside.push(word.start,word.start+n-1);
  for(let i=1;i<n-1;i++)inside.push(word.start+i);
}
assert.equal(outside.length,33);
assert.equal(inside.length,43);
assert.equal(new Set([...inside,...outside]).size,76);

const short=complete
  .filter(w=>w.indices.length===2)
  .map(w=>({
    start:w.start,
    gp:w.indices,
    transliteration:w.indices.map(x=>corpus.translit[x]).join("")
  }));
assert.deepEqual(short.map(x=>x.start),[5,7,22,46,62]);
assert.deepEqual(short.map(x=>x.transliteration),
  ["SB","XM","WR","EOE","THOE"]);

// Derive source-native GP symbols via the same published spelling encoder
// used to calibrate solved LP1 and p57. This avoids textblob's Latin spelling
// differences for TH/EO/NG/EA/AE/IA/...
const independent=[
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
const lexicons=independent.map(file=>{
  const tokens=read(file).match(/[A-Za-z]+/g)||[];
  const native=new Set();
  for(const token of tokens){
    const encoded=encodeSourceNativeGP(token);
    if(encoded.length===2)native.add(encoded.join(","));
  }
  assert(native.has([10,9].join(",")), "IN must encode to GP29 I,N");
  assert(native.has([2,18].join(",")), "THE must encode to GP29 TH,E");
  return {file,native};
});
const wordStatus=short.map(w=>({
  ...w,
  memberships:lexicons.map(({file,native})=>({
    file,
    present:native.has(w.gp.join(","))
  }))
}));
assert(wordStatus.every(w=>w.memberships.every(x=>!x.present)));

// Positive control: an authentic native two-rune word is accepted.
assert.deepEqual(encodeSourceNativeGP("IN"),[10,9]);
assert(lexicons.every(x=>x.native.has("10,9")));

// Architecture control: mutate ALL 43 interior positions with an arbitrary
// reversible per-symbol operation and confirm the five two-rune words
// necessarily remain the original GP symbols.
const changed=page.slice();
for(const i of inside)changed[i]=(changed[i]+17)%29;
for(const w of short)assert.deepEqual(changed.slice(w.start,w.start+2),w.gp);
assert(inside.every(i=>changed[i]!==page[i]));
assert(outside.every(i=>changed[i]===page[i]));

console.log(JSON.stringify({
  classification:"source-conditional key-independent architecture obstruction",
  physicalPage:55,
  sourceRunes:page.length,
  completeWords:complete.length,
  strictInterior:inside.length,
  retainedExteriors:outside.length,
  unchangedTwoRuneWords:wordStatus,
  independentLexicons:lexicons.map(x=>({file:x.file,nativeTwoRuneTypes:x.native.size})),
  unchangedTwoRuneWordsInAnyLexicon:0,
  minimumExteriorValueEditsForFullNativeLexiconEnglish:5,
  interiorOnlyPlantPreservesAllFive:true,
  recoveredUnknownPlaintext:false,
  scope:"Preserved source printed word breaks, native-GP English lexicons, exact literal exterior-copy; does not exclude transformed boundaries, non-English, or changed word segmentation"
},null,2));
