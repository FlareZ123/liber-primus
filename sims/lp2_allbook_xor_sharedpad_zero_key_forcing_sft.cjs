"use strict";

/**
 * GP29 alphabet-range obstruction for a globally shared, literal five-bit
 * XOR page-start pad, independent of English words, keys or probability.
 *
 * Every original ciphertext GP0..28 is known. At source black-body rune
 * index i, any shared key byte K_i must satisfy (C_page[i] XOR K_i)<29
 * on ALL 55 original rune-bearing unknown pages. Intersect all 32 literal
 * five-bit keys. If only K_i=0 remains, plaintext is exactly the original
 * glyph on every page at that position under every possible shared key.
 *
 * Node22 Windows11 SFT:
 * node sims/lp2_allbook_xor_sharedpad_zero_key_forcing_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(base,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

/** @param {number} page */
function firstBlack(page){
 const spans=ink.pages.find(x=>x.page===page)?.red_spans||[];
 return spans.find(x=>x.start===0)?.length||0;
}
const original=corpus.pages.filter(p=>p.page<=55&&p.indices.length>0)
 .map(p=>({page:p.page,runic:p.indices.slice(firstBlack(p.page))}));
assert.equal(original.length,55);
assert(!original.some(p=>p.page===50));
const total=original.reduce((s,p)=>s+p.runic.length,0);
assert.equal(total,12844);
const maximum=Math.max(...original.map(p=>p.runic.length));
assert.equal(maximum,277);

/** All key values that leave every page at the selected ordinal in GP0..28
 *  (one single reused key across the given collection). @param {number[][]} streams */
function compatible(streams){
 const longest=Math.max(...streams.map(x=>x.length));
 return Array.from({length:longest},(_,i)=>{
  const c=streams.filter(p=>i<p.length).map(p=>p[i]);
  return Array.from({length:32},(_,k)=>k)
   .filter(k=>c.every(x=>(x^k)<29));
 });
}
const allowed=compatible(original.map(x=>x.runic));
assert(allowed.every(a=>a.includes(0)));
const zeroPositions=allowed.map((a,i)=>a.length===1&&a[0]===0?i:-1)
 .filter(i=>i>=0);
const zeroSet=new Set(zeroPositions);
assert.equal(zeroPositions.length,185);
assert.equal(zeroPositions.filter(i=>i<66).length,56);
assert.equal(zeroPositions.filter(i=>i<150).length,118);
const forcedOriginal=[];
const pageCounts=[];
for(const p of original){
 let n=0;
 for(const [i,v]of p.runic.entries()) if(zeroSet.has(i)){
  assert.equal(allowed[i][0],0);
  forcedOriginal.push(v);
  n++;
 }
 pageCounts.push({page:p.page,n,total:p.runic.length});
}
assert.equal(forcedOriginal.length,9138);
const hist=Array(29).fill(0);
for(const r of forcedOriginal)hist[r]++;
const ioc=hist.reduce((s,n)=>s+n*(n-1),0)/
  (forcedOriginal.length*(forcedOriginal.length-1));
assert(Math.abs(ioc-0.03452534607735324)<1e-15);
const zeroRuns=[];
for(let i=0;i<allowed.length;){
 if(!zeroSet.has(i)){i++;continue;}
 const start=i;
 while(i<allowed.length&&zeroSet.has(i))i++;
 zeroRuns.push({start,length:i-start});
}
zeroRuns.sort((a,b)=>b.length-a.length);
assert.deepEqual(zeroRuns.slice(0,3),[
 {start:34,length:16},{start:110,length:13},{start:12,length:10}
]);
const noZero=allowed.map((a,i)=>a.includes(0)?null:i).filter(x=>x!==null);
assert.equal(noZero.length,0);

// Positive control from a pre-existing independent Shakespeare source:
// 55 source-native GP pages of 277 unencrypted runes each. Plant a genuine
// shared XOR byte across them (nonzero where compatible), and ensure that
// ALL genuine planted key bytes survive the same alphabet-only inverse.
const donor=read("resources/control/shakespeare_first300k.txt").toUpperCase();
const tokens=["TH","EO","NG","OE","AE","IA","EA"];
const map=new Map(corpus.translit.map((x,i)=>[x,i]));
const native=[];
for(let w of donor.match(/[A-Z]+/g)||[]){
 w=w.replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Z/g,"S")
  .replace(/ING/g,"NG").replace(/IO/g,"IA");
 for(let i=0;i<w.length;){
  const t=tokens.find(s=>w.startsWith(s,i))||w[i];
  const value=map.get(t);
  if(value!==undefined)native.push(value);
  i+=t.length;
 }
}
assert.equal(native.length,217106);
const shape=original.map((p,i)=>native.slice(i*300,i*300+p.runic.length));
assert(shape.every((s,i)=>s.length===original[i].runic.length));
const key=Array.from({length:maximum},(_,i)=>
 i%7===0 && shape.every(s=>i>=s.length||s[i]!==28)?1:0);
assert(key.filter(k=>k!==0).length>=10);
const planted=shape.map(s=>s.map((v,i)=>v^key[i]));
assert(planted.every(s=>s.every(v=>v>=0&&v<29)));
const plantAllowed=compatible(planted);
assert(plantAllowed.every((s,i)=>s.includes(key[i])));
for(const [j,p]of planted.entries())for(const [i,v]of p.entries())
 assert.equal(v^key[i],shape[j][i]);

// Independently identify wholly visible ORIGINAL printed words. With a
// common XOR pad every rune of these whole words is forced plaintext;
// this lexical observation uses no inferred key or conditional decryption.
const txtPages=read("resources/lp2-transcription.txt").split("%").slice(0,55);
const originalRune=new Map(corpus.runes.map((x,i)=>[x,i]));
const vocabInputs=[
 "resources/control/english_wordfreq_textblob.txt",
 "resources/control/shakespeare_first300k.txt",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt"
];
const textVocab=new Set(vocabInputs.flatMap(file=>
 read(file).toUpperCase().match(/[A-Z]+/g)||[]));
const nativeWordShapes=new Set();
for(let word of textVocab){
 word=word.replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/K/g,"C").replace(/Z/g,"S")
  .replace(/ING/g,"NG").replace(/IO/g,"IA");
 const indices=[];
 for(let i=0;i<word.length;){
  const t=tokens.find(t=>word.startsWith(t,i))||word[i];
  const value=map.get(t);
  if(value===undefined){indices.length=0;break;}
  indices.push(value);i+=t.length;
 }
 if(indices.length)nativeWordShapes.add(indices.join(","));
}
let totalInteriorWords=0,fullyFixedWords=0,fullyFixedAtLeast3=0,
 nativeMatchesAtLeast3=0;
for(const p of original){
 const raw=txtPages[p.page>=51?p.page-1:p.page];
 const skip=firstBlack(p.page);
 let pos=0,start=0,word=[];
 const allWords=[];
 function finish(){
  if(word.length){allWords.push({start,end:pos,values:word});word=[];}
 }
 for(const ch of raw){
  const runeValue=originalRune.get(ch);
  if(runeValue!==undefined){
   if(word.length===0)start=pos;
   word.push(runeValue);pos++;
  }else if(ch==="/"||/\s/u.test(ch)){
   // Printed linebreaks do not terminate a word.
  }else finish();
 }
 finish();
 const local=allWords.filter(w=>w.start>=skip).map(w=>({
  start:w.start-skip,end:w.end-skip,values:w.values
 })).slice(1,-1);
 totalInteriorWords+=local.length;
 for(const w of local){
  if(Array.from({length:w.end-w.start},(_,i)=>w.start+i)
   .every(i=>zeroSet.has(i))){
   fullyFixedWords++;
   if(w.values.length>=3){
    fullyFixedAtLeast3++;
    if(nativeWordShapes.has(w.values.join(",")))nativeMatchesAtLeast3++;
   }
  }
 }
}
assert.equal(totalInteriorWords,2796);
assert.equal(fullyFixedWords,883);
assert.equal(fullyFixedAtLeast3,594);
assert.equal(nativeMatchesAtLeast3,10);
console.log(JSON.stringify({
 conclusion:"A globally shared literal 5-bit XOR pad cannot change 9138 of 12844 original black-body runes because every shared XOR key at those positions is algebraically forced to zero by the GP29 alphabet range. This is an unconditional alphabet-only constraint under that precise global shared page-start-key hypothesis.",
 source:"Canonical original 55 LP2 unknown runic pages, exact original red-heading first-black clock",
 totalSourceBlackRunes:total,
 pageCount:original.length,
 maxBodyLength:maximum,
 originalKeyForcedZeroPositions:zeroPositions.length,
 first66PositionsForcedZero:zeroPositions.filter(i=>i<66).length,
 first150PositionsForcedZero:zeroPositions.filter(i=>i<150).length,
 totalUnchangedOriginalRunes:forcedOriginal.length,
 forcedOriginalPrintedWords:{sourceCompleteInteriorWords:totalInteriorWords,fullyUnchangedWords:fullyFixedWords,fullyUnchangedAtLeast3Runes:fullyFixedAtLeast3,nativeFourSourceLexicalMatchesAtLeast3:nativeMatchesAtLeast3,lexiconSizeGP29:nativeWordShapes.size},
 unchangedFraction:forcedOriginal.length/total,
 unchangedRuneIoC:ioc,
 strongestUnchangedKeyRunSpans:zeroRuns.slice(0,8),
 originalFirst55PotentialNonzeroKeySlots:allowed.slice(0,55)
  .map((values,i)=>({i,values}))
  .filter(x=>x.values.some(k=>k!==0)),
 nativeSourcePositive:{
  donorRunes:native.length,
  plantedNonzeroGlobalKeySlots:key.filter(k=>k!==0).length,
  positiveExactDecryptions:planted.reduce((s,p)=>s+p.length,0)
 },
 caution:"No original-page plaintext, actual key or decoder found. The strict zero-key certificate excludes only a common five-bit XOR keystream restarted at every page; different per-page pads, addition mod29, altered clocks or non-GP plaintext alphabets are not covered."
},null,2));
