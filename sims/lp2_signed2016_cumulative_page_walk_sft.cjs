"use strict";
/**
 * Source-locked 2016 signed-sentence cumulative book map to original LP2.
 * Reports structural anchors and a direct 84-rune pad negative; no decryption.
 * @module lp2_signed2016_cumulative_page_walk_sft
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/historical/cicada2016-4gq25-outguess.asc");
const master=read("resources/transcriptions/liber_primus_master.txt");
const scans=master.split("%").map(s=>[...s.matchAll(/[ᚠ-᛿]+/gu)].map(x=>x[0]));
assert.equal(scans.length,75);
const pages=scans.slice(16,74);
assert.equal(pages.length,58);
assert.equal(pages[50].length,0);
const phrase=source.replace(/\s+/g," ").match(/Its words are the map, their meaning is the road, and their numbers are the direction\./i)?.[0];
assert(phrase);
const words=phrase.match(/[A-Za-z]+/g);
assert.equal(words.length,16);
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index})).sort((a,b)=>b.token.length-a.token.length);
function encode(s){
 s=s.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
 const out=[];
 for(let i=0;i<s.length;){
  const hit=alphabet.find(x=>s.startsWith(x.token,i));
  assert(hit,`Unknown GP token at ${s.slice(i)}`);
  out.push(hit.index);i+=hit.token.length;
 }
 return out;
}
const runeIndices=new Map(corpus.runes.map((g,i)=>[g,i]));
const toIndices=s=>[...s].map(g=>{assert(runeIndices.has(g));return runeIndices.get(g)});
let p=0;
const route=words.map((word,i)=>{
 const sum=encode(word).reduce((n,c)=>n+corpus.prime[c],0);
 p=(p+sum)%58;
 const wordIndex=Math.floor(sum/58);
 const selected=pages[p][wordIndex];
 assert(selected,`Missing p${p} word ${wordIndex}`);
 return {word,primeSum:sum,page:p,wordIndex,selected};
});
assert.deepEqual(route.map(x=>x.primeSum),[143,179,175,72,211,114,319,84,72,204,215,114,295,175,72,337]);
assert.deepEqual(route.map(x=>x.page),[27,32,33,47,26,24,53,21,35,7,48,46,51,52,8,55]);
assert.equal(new Set(route.map(x=>x.page)).size,16);
const pair=["ᛞᛄᚢ","ᛒᛖᛁ"];
assert(pages[27].some((w,i)=>w===pair[0]&&pages[27][i+1]===pair[1]));
assert.deepEqual(pages[55].slice(-2),pair);
assert.deepEqual(corpus.pages[27].indices.slice(28,34),corpus.pages[55].indices.slice(-6));
assert.equal(corpus.pages[32].indices.length,121);
assert.deepEqual(JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).pages.map(x=>x.page),[49,50,51]);
const key=route.flatMap(x=>toIndices(x.selected));
assert.equal(key.length,76); // original master word segmentation; matches p55 runes
const cipherPages=corpus.pages.filter(x=>x.status==="unsolved"&&x.indices.length).map(x=>x.indices);
assert.equal(cipherPages.length,55);
assert.equal(cipherPages.flat().length,12956);
function ioc(v){
 const hist=new Array(29).fill(0);
 v.forEach(c=>hist[c]++);
 return hist.reduce((n,c)=>n+c*(c-1),0)/(v.length*(v.length-1));
}
function inverse(input,pageReset,sign){
 let j=0,out=[];
 for(const page of input){
  if(pageReset)j=0;
  for(const c of page){out.push((c+sign*key[j%key.length]+29)%29);j++;}
 }
 return out;
}
const controls=[];
for(const reset of [true,false])for(const sign of [-1,1]){
 const score=ioc(inverse(cipherPages,reset,sign));
 assert(score>0.0344&&score<0.0346);
 controls.push({pageReset:reset,sign,ioc:score});
}
const known=corpus.pages[57].indices;
assert.deepEqual(inverse([known.map((c,i)=>(c+key[i%key.length])%29)],true,-1),known);
const p55 = corpus.pages.find((x) => x.page === 55);
assert.equal(p55.indices.length, 76);
assert.equal(key.length, p55.indices.length);
const directTerminal = [-1, 1].map((sign) => {
 const indices = p55.indices.map((c, i) =>
   (c + sign * key[i] + 29) % 29);
 let offset = 0;
 const segmented = pages[55].map((runeWord) => {
   const word = indices.slice(offset, offset + runeWord.length);
   offset += runeWord.length;
   return word.map((n) => corpus.translit[n]).join("");
 });
 assert.equal(offset, 76);
 return {
   sign, transliteration: indices.map((n) => corpus.translit[n]).join(""),
   segmentedGP: segmented.join(" "), outputIoC: ioc(indices)
 };
});
const result={
 status:"provisional route, no plaintext or key recovered",
 source:"signed 2016 16-word sentence; GP-prime sums; cumulative modulo 58",
 sourceSum:route.reduce((n,x)=>n+x.primeSum,0),
 sourcePageCount:58,
 anchors:{firstPage:27,lastPage:55,bookendPair:pair,treePage:route[1].page,numericTablePage:route[12].page,uniqueVisited:16},
 selectedRunes:key.length, originalP55Runes:p55.indices.length, directP55PadInverse:directTerminal,
 originalCipherIoC:ioc(cipherPages.flat()),
 directKeyInversions:controls,
 route:route.map(x=>({...x,selectedGP:toIndices(x.selected).map(n=>corpus.translit[n]).join("")}))
};
console.log(JSON.stringify(result,null,2));
