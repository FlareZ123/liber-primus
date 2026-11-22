"use strict";
/**
 * 2016 signed follower words as source-frozen dual-checksum labels of the
 * real central complete words on every original encrypted LP2 page.
 * Source exact and read-only: no key fitting, guessed plaintext, or edit.
 * Runnable Windows 11 Node22 CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const table=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","base60-grid.json"),"utf8")).rows.flat();
const signed=fs.readFileSync(path.join(root,"resources","historical","cicada2016-4gq25-outguess.asc"),"utf8");
const parsed=parseSharedCorpus();
assert.deepEqual([parsed.words.length,parsed.crossPageWords,parsed.runeCount],[2896,32,12956]);
const signedText=signed.slice(signed.indexOf("Hello."),signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords=signedText.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
const thePositions=signedWords.map((s,i)=>s.toUpperCase()==="THE"?i:-1).filter(x=>x>=0);
const followers=thePositions.map(i=>signedWords[i+1].toUpperCase());
assert.deepEqual(followers,["PATH","DEVOTED","WAY","MAP","ROAD","DIRECTION"]);
const alpha=gp.translit.map((spelling,index)=>({spelling:spelling.toUpperCase(),index}))
 .sort((a,b)=>b.spelling.length-a.spelling.length);
/** @param {string} word @returns {number[]} */
function parseEnglish(word){
 let text=word.toUpperCase().replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
 const indices=[];
 while(text.length){
  const match=alpha.find(a=>text.startsWith(a.spelling));
  assert.ok(match,"Unknown GP rune spelling: "+word+" at "+text);
  indices.push(match.index);
  text=text.slice(match.spelling.length);
 }
 return indices;
}
/** @param {number[]} seq @returns {number} */
const sum=seq=>seq.reduce((v,i)=>v+i,0);
/** @param {number[]} seq @returns {number} */
const sumPrime=seq=>seq.reduce((v,i)=>v+gp.prime[i],0);
const signedLabels=followers.map(label=>{
 const tokens=parseEnglish(label);
 return {label,gp0:sum(tokens),prime:sumPrime(tokens)};
});
assert.deepEqual(signedLabels.map(x=>[x.label,x.gp0,x.prime]),[
 ["PATH",39,145],["DEVOTED",102,381],["WAY",57,219],
 ["MAP",56,211],["ROAD",54,204],["DIRECTION",98,337]]);
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
let cursor=0;
const originalWords=parsed.words.map(w=>{
 const indices=[...w.runes].map(ch=>runeIndex.get(ch));
 const start=cursor;
 cursor+=indices.length;
 return {start,end:cursor-1,indices,gp0:sum(indices),prime:sumPrime(indices),
  translit:indices.map(i=>gp.translit[i]).join("")};
});
assert.equal(cursor,12956);
assert.deepEqual(originalWords.flatMap(w=>w.indices),
 gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices||[]));
const ordinals=new Set(signedLabels.map(x=>x.gp0));
const primeVals=new Set(signedLabels.map(x=>x.prime));
/** @param {{gp0:number,prime:number}} word @returns {boolean} */
const dual=word=>ordinals.has(word.gp0)&&primeVals.has(word.prime);
let globalStart=0;
const centers=[];
const oddProbabilities=[];
for(const page of gp.pages.filter(p=>p.page<=55 && p.indices.length>0)){
 const start=globalStart,N=page.indices.length,end=start+N-1;
 const a=start+Math.floor((N-1)/2),b=start+Math.ceil((N-1)/2);
 const central=originalWords.filter(w=>w.start<=b&&w.end>=a);
 const selectors=central.map(w=>({
  word:w.translit,runeStart:w.start-start,runeEnd:w.end-start,
  gp0:w.gp0,prime:w.prime,cellOrdinal:table[w.gp0]??null,
  cellPrime:table[w.prime]??null,
  gp0Label:signedLabels.filter(x=>x.gp0===w.gp0).map(x=>x.label),
  primeLabel:signedLabels.filter(x=>x.prime===w.prime).map(x=>x.label)}));
 const entry={page:page.page,length:N,midLocal:[a-start,b-start],
  selectors,hasDual:central.some(dual)};
 centers.push(entry);
 if(N%2){
  let favorable=0;
  for(const w of originalWords){
   if(!dual(w)||w.start>end||w.end<start)continue;
   favorable+=Math.min(end,w.end)-Math.max(start,w.start)+1;
  }
  oddProbabilities.push(favorable/N);
 }
 globalStart+=N;
}
assert.equal(globalStart,12956);
assert.equal(centers.length,55);
const oddCenters=centers.filter(p=>p.length%2);
assert.equal(oddCenters.length,32);
const exactOddHits=oddCenters.filter(p=>p.hasDual);
assert.deepEqual(exactOddHits.map(p=>p.page),[3,5,34]);
const signatures=exactOddHits.map(p=>{
 const w=p.selectors.find(w=>w.gp0Label.length&&w.primeLabel.length);
 return {page:p.page,word:w.word,gp0:w.gp0,prime:w.prime,
  ordinal:w.gp0Label,primeName:w.primeLabel,local:[w.runeStart,w.runeEnd],
  center:p.midLocal};
});
assert.deepEqual(signatures,[
 {page:3,word:"BDCEO",gp0:57,prime:204,
  ordinal:["WAY"],primeName:["ROAD"],local:[105,108],center:[108,108]},
 {page:5,word:"CEAA",gp0:57,prime:219,
  ordinal:["WAY"],primeName:["WAY"],local:[130,132],center:[131,131]},
 {page:34,word:"BAS",gp0:56,prime:211,
  ordinal:["MAP"],primeName:["MAP"],local:[130,132],center:[130,130]}
]);
assert.equal(centers.filter(p=>p.length%2===0&&p.hasDual).length,0);
const prime0x=centers.filter(p=>p.selectors.some(w=>w.cellPrime==="0x"));
assert.deepEqual(prime0x.map(p=>p.page),[5,7]);
const p7=centers.find(p=>p.page===7);
assert.deepEqual([p7.length,p7.midLocal],[208,[103,104]]);
assert.ok(p7.selectors.some(w=>w.word==="EOUO"&&w.gp0===16&&w.prime===51&&
 w.runeStart===103&&w.cellOrdinal==="21"&&w.cellPrime==="0x"));
const p7preceding=originalWords.findIndex(w=>w.translit==="EOUO"&&w.prime===51);
assert.ok(p7preceding>0);
assert.deepEqual([originalWords[p7preceding-1].translit,
  originalWords[p7preceding-1].gp0,table[24]],["IEOTH",24,"1n"]);
assert.equal(table[16],"21");
assert.equal(String.fromCharCode(parseInt(table[16],16)),"!");
// The exact conditional reference distribution chooses ONE random rune
// index uniformly within EACH of the 32 odd-length pages; a hit occurs
// when that location belongs to a source word satisfying both checksums.
// The observed center is a single exact rune on odd-length pages only.
// This is a descriptive null, NOT a multiplicity-adjusted discovery p-value.
let distribution=[1];
for(const p of oddProbabilities){
 const next=Array(distribution.length+1).fill(0);
 for(let j=0;j<distribution.length;j++){
  next[j]+=distribution[j]*(1-p);
  next[j+1]+=distribution[j]*p;
 }
 distribution=next;
}
const expectation=oddProbabilities.reduce((a,b)=>a+b,0);
const tail3=distribution.slice(3).reduce((a,b)=>a+b,0);
assert.ok(Math.abs(expectation-0.18990521074937786)<1e-12);
assert.ok(Math.abs(tail3-0.0007274616371197983)<1e-12);
console.log(JSON.stringify({
 source:"2016 authenticated PATH DEVOTED WAY MAP ROAD DIRECTION + original LP2 GP",
 originalUnknownPages:55,runes:12956,words:2896,crossPageWords:32,
 signedLabels,allOddPageCenterDualHits:signatures,
 originalEvenPageCenterDualHits:[],
 exact2014SourceConditionalCenterNull:{randomSingleRunePerOddPage:true,
  independentPages:32,expected:expectation,
  probabilityAtLeastThree:tail3,
  postselectionAndNonuniformSemanticWarning:true},
 allOriginalCenterPrime0xPages:prime0x.map(p=>p.page),
 p7CenterAndPredecessor:{page:7,runeCenter:[103,104],word:"EOUO",
  precedingWord:"IEOTH",sourceMove:"24: 1n -> 16",
  receiver:"GPprime 51 -> 0x, GP0 16 -> 21",ascii:"!"},
 status:"Source-visible dual-checksum center cluster; no authenticated center instruction, plaintext, or cipher inverse"
},null,2));
