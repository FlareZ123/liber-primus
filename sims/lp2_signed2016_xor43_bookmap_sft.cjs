"use strict";
/**
 * Source-literal 2016 signed-word XOR/58 book-navigation branch.
 *
 * The previously established GP prime-sum/base58 map directs signed "lies"
 * to original p50 token3, byte193, and the only reversed 201,193/.../193,201
 * table-bracket contains exactly 43 bytes. Historical Cicada 2013 used XOR.
 *
 * Test the single fixed interpretation:
 *     address_i = GPprimeSum(signedWord_i) XOR tableByte[84+i]
 *     page_i = address_i % 58
 *     word_i = floor(address_i / 58).
 * A seeded 100,000-shuffle control randomizes ONLY the byte-to-word pairing.
 *
 * No original LP2 plaintext or authentic cipher is recovered.
 * Node.js 22 SFT: node sims/lp2_signed2016_xor43_bookmap_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const source=read("resources/lp2-transcription.txt").split("%");
assert.equal(corpus.pages.length,58);
assert.equal(source.length,57);
assert.equal(grid.bytes.length,256);
const decode=raw=>raw.replaceAll("/","").replaceAll("\n","").replaceAll("\r","")
  .split(/[-.&$§,:!?]/u).map(part=>(part.match(/[ᚠ-᛿]+/gu)||[]).join(""))
  .filter(Boolean);
const pages=Array.from({length:58},(_,p)=>p===50?[]:
  decode(source[p>50?p-1:p]));
assert.equal(pages.reduce((n,p)=>n+p.length,0),2973);
const signedText=signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords=signedText.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
const alphabet=corpus.translit.map((t,i)=>({t:t.toLowerCase(),i}))
  .sort((a,b)=>b.t.length-a.t.length);
/** @param {string} raw @returns {number[]|null} */
function encode(raw){
  const s=raw.toLowerCase().replace(/qu/g,"cw").replace(/v/g,"u")
    .replace(/k/g,"c").replace(/z/g,"s");
  const values=[];
  for(let i=0;i<s.length;){
    const hit=alphabet.find(x=>s.startsWith(x.t,i));
    if(!hit)return null;
    values.push(hit.i);
    i+=hit.t.length;
  }
  return values;
}
/** @param {string} runes @returns {string} */
function indices(runes){
  return [...runes].map(c=>corpus.runes.indexOf(c)).join(",");
}
/** @param {number[]} nums @returns {string} */
function gp(nums){return nums.map(i=>corpus.translit[i]).join("");}
const sums=signedWords.map(w=>{
  const native=encode(w);assert.ok(native);
  return native.reduce((n,i)=>n+corpus.prime[i],0);
});
const srcKeys=signedWords.map(w=>encode(w).join(","));
assert.equal(sums[3],224);
assert.equal(sums[4],343);
assert.equal(sums[17],72);
assert.deepEqual(grid.bytes.slice(82,84),[201,193]);
assert.deepEqual(grid.bytes.slice(127,129),[193,201]);
const span=grid.bytes.slice(84,127);
assert.equal(span.length,signedWords.length);
assert.equal(pages[40][6],"ᛗᚪᚳᛖ");
assert.equal(pages[57][2],"ᚦᛖ");
const dictionary=new Set();
for(const match of read("resources/control/english_wordfreq_textblob.txt")
  .matchAll(/^([a-z]+)\s+(\d+)$/gm)){
  if(+match[2]<5)continue;
  const native=encode(match[1]);
  if(native&&native.length>=4)dictionary.add(native.join(","));
}
/** @param {number} i @param {number} byte */
function choice(i,byte){
  const code=sums[i]^byte;
  const page=code%58;
  const word=Math.floor(code/58);
  const selected=pages[page]?.[word]||null;
  return {
    code,page,word,selected,
    rare:page<56&&!!selected&&dictionary.has(indices(selected)),
    self:!!selected&&indices(selected)===srcKeys[i]
  };
}
const candidates=sums.map((_,i)=>span.map(b=>choice(i,b)));
const actual=candidates.map((row,i)=>row[i]);
assert.ok(actual.every(x=>x.selected));
assert.deepEqual(
  [actual[4].code,actual[4].page,actual[4].word,
    actual[17].code,actual[17].page,actual[17].word],
  [388,40,6,173,57,2]);
assert.deepEqual([actual[4].selected,actual[17].selected],
  ["ᛗᚪᚳᛖ","ᚦᛖ"]);
assert.deepEqual(actual.flatMap((r,i)=>r.rare?[i]:[]),[4]);
assert.deepEqual(actual.flatMap((r,i)=>r.self?[i]:[]),[17]);
// The signal is chosen after seeing source. Use an empirical full-family
// conditional null (any common unsolved GP word AND any self-word hit).
let seed=0x21f0d499;
/** @returns {number} */
function random(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const offsets=Array.from({length:43},(_,i)=>i);
const trials=100000;
let rareCount=0,selfCount=0,bothCount=0,specificCount=0;
for(let trial=0;trial<trials;trial++){
  for(let i=42;i>0;i--){
    const j=random()%(i+1);
    [offsets[i],offsets[j]]=[offsets[j],offsets[i]];
  }
  let rare=false,self=false;
  for(let i=0;i<43;i++){
    rare ||=candidates[i][offsets[i]].rare;
    self ||=candidates[i][offsets[i]].self;
  }
  if(rare)rareCount++;
  if(self)selfCount++;
  if(rare&&self)bothCount++;
  if(candidates[4][offsets[4]].page===40&&
      candidates[4][offsets[4]].word===6&&
      candidates[17][offsets[17]].page===57&&
      candidates[17][offsets[17]].word===2)specificCount++;
}
assert.deepEqual([rareCount,selfCount,bothCount,specificCount],
  [11162,14058,1617,50]);
const p=n=>(n+1)/(trials+1);
console.log(JSON.stringify({
  hypothesis:"source word GP-prime sum XOR associated original enclosed byte, then base58 page/printed-word address",
  input:{sourceWords:signedWords.length,gridBytes:span.length,
    selectedOriginalRuneWords:actual.length},
  originalHits:[
    {sourceIndex:4,sourceWord:"empty",sourceGPprimeSum:343,byte:span[4],
      xor:actual[4].code,page:40,word:6,visibleGP:gp(encode("MAKE"))},
    {sourceIndex:17,sourceWord:"the",sourceGPprimeSum:72,byte:span[17],
      xor:actual[17].code,page:57,word:2,visibleGP:"THE"}
  ],
  control:{seed:"0x21f0d499",trials,
    anyCommonUnsolvedGPWord:{count:rareCount,p:p(rareCount)},
    anyExactSourceWord:{count:selfCount,p:p(selfCount)},
    bothFamilies:{count:bothCount,p:p(bothCount)},
    exactObservedPairPostSelected:{count:specificCount,p:p(specificCount)}},
  firstRuneAcrostic:actual.map(x=>gp([corpus.runes.indexOf([...x.selected][0])])).join(" "),
  conclusion:"Conditional 43-byte/book-map pair is suggestive but supplies no deciphered unknown GP rune; post-selection and model uncertainty prohibit cipher claims."
},null,2));
