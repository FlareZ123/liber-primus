"use strict";
/**
 * Agent18 Director #1003, an original visual clue-to-opcode handoff.
 * Physical LP2 p7 original last red 14 runes is divided 6/8 by the
 * book's only red four-dot small stop (source audit event26).
 * Earlier in the same p3-7 chapter red p3 local119 Atbash yields SCY.
 * Test authentic historical GP29 Vigenere minus with this 3-rune
 * source-selected key, frozen at red region start.
 * No key variants or free fitted offsets. Node22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation=JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const redStop=punctuation.events.find(x=>x.index===26);
assert.equal(redStop.page,7);
assert.equal(redStop.local_rune_offset,200);
assert.equal(redStop.rune_offset,1866);
assert.equal(redStop.symbol,"⁘");
assert.equal(punctuation.source_audit.morphology.stop_four_dot_diamonds.red,1);

const triad=gp.pages[3].indices.slice(119,122);
const key=triad.map(x=>28-x);
assert.deepEqual(key,[15,5,26]); // authentic GP Atbash of red p3 => SCY
const red=gp.pages[7].indices.slice(194,208);
assert.deepEqual(red,[23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
assert.equal(red.length,14);
const breakAt=redStop.local_rune_offset-194;
assert.equal(breakAt,6);
assert.equal(breakAt%key.length,0);

/** C=P+K (mod29) / P=C−K (mod29), keyed only at original red start.
 * @param {number[]} sequence Original C or known P
 * @param {boolean} inverse If true C->P; else P->C
 * @param {boolean} reset Whether the red original stop resets 3-rune key
 * @returns {number[]}
 */
function transform(sequence,inverse,reset) {
  return sequence.map((x,i)=>{
    const step=reset && i>=breakAt ? i-breakAt : i;
    const k=key[step%key.length];
    return (x+(inverse?-k:k)+29)%29;
  });
}
const originalNoReset=transform(red,true,false);
const originalReset=transform(red,true,true);
assert.deepEqual(originalNoReset,originalReset); // no discriminating reset
assert.deepEqual(originalNoReset,[8,27,25,1,26,28,19,2,14,28,23,9,13,14]);
// Source-native control uses exactly printed six/eight-rune word lengths.
// A native English two-word plant checks original GP bigram and symbol order.
const files=[
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/shakespeare_first300k.txt",
 "resources/control/emerson_essays_2944.txt"
];
const refs=[[],[]];
const lookup=[new Set(),new Set()];
for(const file of files) {
 const raw=read(file).split(/\r?\n/).filter(s=>!s.startsWith("#")).join(" ");
 for(const word of raw.match(/[A-Za-z]+/g)||[]) {
  const arr=encodeSourceNativeGP(word);
  const row=arr.length===6?0:arr.length===8?1:-1;
  if(row>=0){
    refs[row].push(arr);
    lookup[row].add(arr.join(","));
  }
 }
}
const originalLexical=[lookup[0].has(originalReset.slice(0,6).join(",")),
  lookup[1].has(originalReset.slice(6).join(","))];
assert.deepEqual(originalLexical,[false,false]);
const plant=[...refs[0][18],...refs[1][42]];
const pc=transform(plant,false,true);
assert.deepEqual(transform(pc,true,true),plant);
assert.deepEqual(transform(pc,true,false),plant);
assert.deepEqual(transform(originalReset,false,true),red);
const fmt=arr=>arr.map(i=>gp.translit[i]).join(".");
console.log(JSON.stringify({
  clue:{originalJpeg:"resources/liber-primus/24.jpg",
    smallRedStop:{event:26,page:7,localRune:200,globalRune:1866},
    terminalRedRuneStart:194,terminalRedRuneCount:14,spanSizes:[6,8],
    sameChapterRedP3Atbash119Key:fmt(key)},
  keyInvariant:{keyPeriod:key.length,stopIndex:breakAt,
    resetsAndContinuousGiveIdenticalInverse:originalReset.every((x,i)=>x===originalNoReset[i])},
  frozenOriginal:{cipher:fmt(red),decoded:fmt(originalReset),
    bothOriginalWordsInPinnedNativeEnglishLexicon:originalLexical,
    exactForwardReconstruction:true},
  positive:{plantGP:fmt(plant),fullyRecovered:14},
  decision:"The sole red four-dot mark types a 6+8 red operand boundary, but no independent author opcode. Historical p3 SCY Vigenere is reversible and fails both original red-operand GP-native words; the visible boundary lies at key period6=2*3 and cannot distinguish an SCY key reset. No original unknown plaintext recovered."
},null,2));
