"use strict";

/**
 * Source-motivated Infinity sign on three original LP2 opening pages.
 * A small hand-drawn ∞ symbol is repeated on original scans 17,18,19.jpg
 * (LP2 p0,p1,p2) in the same page-header location. Restrict the candidate
 * word supplied by this literal icon to "INFINITY" and "INFINITE", whose
 * eight GP29 runes match the first p0 red word length exactly.
 *
 * Test the two simplest known-2014 GP29 periodic Vigenere readings:
 * A: the original icon provides an eight-rune repeating keyword.
 * B: the icon spells the original first eight plaintext red runes, fixing
 * an eight-rune repeating Vigenere key; evaluate the untouched second red
 * word and all 716 following p0-p2 source black runes.
 *
 * This is a clue-constrained bounded negative, not a source-signed cipher.
 * Run: node sims/lp2_p0_original_infinity_rubric_period8_source_gate_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const span=c.pages.slice(0,3).flatMap((p)=>p.indices);
assert.deepEqual(c.pages.slice(0,3).map((p)=>p.indices.length),[262,266,201]);
assert.equal(span.length,729);
const gpIndex=new Map(c.translit.map((x,i)=>[x,i]));
const mod29=(n)=>((n%29)+29)%29;
/** @param {string} word */
const gpWord=(word)=>[...word].map((s)=>{assert(gpIndex.has(s));return gpIndex.get(s);});
/** @param {number[]} xs */
const text=(xs)=>xs.map((x)=>c.translit[x]).join("");
/** @param {number[]} xs */
function ioc(xs){const a=Array(29).fill(0);xs.forEach((x)=>a[x]++);return a.reduce((s,x)=>s+x*(x-1),0)/(xs.length*(xs.length-1));}
/** @param {number[]} xs @param {number[]} key */
const enc=(xs,key)=>xs.map((v,i)=>mod29(v+key[i%key.length]));
/** @param {number[]} xs @param {number[]} key */
const dec=(xs,key)=>xs.map((v,i)=>mod29(v-key[i%key.length]));
assert.equal(text(span.slice(0,13)),"SHEOGMIAFSYENGC");
const black=span.slice(13);
assert.equal(black.length,716);
assert.equal(text(span.slice(0,8)),"SHEOGMIAF");
assert.equal(text(span.slice(8,13)),"SYENGC");
const expectedBodyIoC=ioc(black);
assert(expectedBodyIoC>0.03&&expectedBodyIoC<0.04);
const p57=c.pages.find((p)=>p.page===57).indices;
assert.equal(p57.length,95);
const positiveBody=Array.from({length:716},(_,i)=>p57[i%p57.length]);
assert(ioc(positiveBody)>0.05);
const results=[];
for (const candidate of ["INFINITY","INFINITE"]){
  const operand=gpWord(candidate);
  assert.equal(operand.length,8);
  // The infinity symbol directly names the repeating key.
  const asKey=dec(span,operand);
  assert.deepEqual(enc(asKey,operand),span);
  assert.deepEqual(dec(enc(positiveBody,operand),operand),positiveBody);
  assert(ioc(asKey.slice(13))<0.04);
  results.push({reading:"icon as literal eight-rune keyword",word:candidate,
    title: text(asKey.slice(0,13)),
    blackIoC:ioc(asKey.slice(13)),
    sourceExactForwardReplay:true,positive716:true,
    nextBlack96:text(asKey.slice(13,109))});
  // The infinity symbol provides the FIRST eight plaintext red runes, not a key.
  const sourceKey=span.slice(0,8).map((x,i)=>mod29(x-operand[i]));
  const asCrib=dec(span,sourceKey);
  assert.deepEqual(asCrib.slice(0,8),operand);
  assert.deepEqual(enc(asCrib,sourceKey),span);
  assert.equal(text(asCrib.slice(8,13)),"IIAFEAH");
  assert(ioc(asCrib.slice(13))<0.04);
  const nativePlant=operand.concat(Array.from({length:721},(_,i)=>p57[i%95]));
  assert.equal(nativePlant.length,729);
  const plantCipher=enc(nativePlant,sourceKey);
  const recoveredKey=plantCipher.slice(0,8).map((x,i)=>mod29(x-operand[i]));
  assert.deepEqual(recoveredKey,sourceKey);
  assert.deepEqual(dec(plantCipher,recoveredKey),nativePlant);
  const wrong=sourceKey.slice(1).concat(sourceKey[0]);
  assert.notDeepEqual(dec(plantCipher,wrong),nativePlant);
  results.push({reading:"icon as first eight original plaintext GP runes",word:candidate,
    derivedSourceKey:text(sourceKey),untrainedSecondRedWord:text(asCrib.slice(8,13)),
    blackIoC:ioc(asCrib.slice(13)),sourceExactForwardReplay:true,
    native729Reconstructed:true,wrongKeyRejected:true,
    nextBlack96:text(asCrib.slice(13,109))});
}
assert.deepEqual(results.map((x)=>x.word),
  ["INFINITY","INFINITY","INFINITE","INFINITE"]);
console.log(JSON.stringify({
  sourceImage: "original 17.jpg–19.jpg, visual small ∞ above the first line in all three",
  sourceRuneScope: "LP2 p0–p2 red13 + black716 =729, unchanged",
  baselineBlackIoC:expectedBodyIoC,
  solvedNativeControlIoC:ioc(positiveBody),
  candidateCount:results.length,results,
  verdict:"four direct period8 GP29 Vigenere models fail original second title/body; original ∞ icon has no source-signed cipher opcode, and other cipher families remain open"
},null,2));
