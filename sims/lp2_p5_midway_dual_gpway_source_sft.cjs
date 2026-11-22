"use strict";
/**
 * Source-exact 2896-word dual-GP address search, p5 central unknown word,
 * and fixed whole-p5 period-3 additive-crib negative control.
 * Windows11 / Node22 single-file test.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.join(__dirname,"..","resources");
const gp=JSON.parse(fs.readFileSync(path.join(root,"liber-primus","lp2-corpus.json"),"utf8"));
const original=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8");
const table=JSON.parse(fs.readFileSync(path.join(root,"liber-primus","base60-grid.json"),"utf8")).rows.flat();
const signed=fs.readFileSync(path.join(root,"historical","cicada2016-4gq25-outguess.asc"),"utf8");
assert.ok(signed.includes("Liber Primus is the way."));
assert.ok(signed.includes("Its words are the map,"));
const parsed=parseSharedCorpus();
assert.deepEqual([parsed.words.length,parsed.crossPageWords,parsed.runeCount],[2896,32,12956]);
assert.equal(table.length,256);
function valueOf(runes) {
  const indices=[...runes].map(c=>gp.runes.indexOf(c));
  assert.ok(indices.every(x=>x>=0));
  const ordinal=indices.reduce((a,b)=>a+b,0);
  const primes=indices.reduce((a,b)=>a+gp.prime[b],0);
  return {indices,ordinal,primes,ordinalCell:table[ordinal],
    primeCell:primes<256?table[primes]:null};
}
const way=valueOf("ᚹᚪᚣ");
assert.deepEqual(way.indices,[7,24,26]);
assert.deepEqual([way.ordinal,way.primes,way.ordinalCell,way.primeCell],
  [57,219,"1w","0x"]);
const words=parsed.words.map((w,i)=>({
  number:i,source:w.runes,page:w.startPage,endPage:w.endPage,
  ...valueOf(w.runes)
}));
const twin=words.filter(w=>w.ordinal===way.ordinal&&w.primes===way.primes);
assert.equal(twin.length,1);
assert.equal(twin[0].source,"ᚳᛠᚪ");
assert.deepEqual([twin[0].page,twin[0].endPage],[5,5]);
assert.deepEqual(twin[0].indices,[5,28,24]);
const p5=gp.pages[5];
assert.equal(p5.runic_count,263);
assert.equal((p5.runic_count-1)/2,131);
assert.deepEqual(p5.indices.slice(130,133),[5,28,24]);
const p5Text=original.split("%")[5].replace(/\r/g,"");
assert.ok(p5Text.includes("ᚳᛠ/\nᚪ-"));
const originalP5Runes=[...p5Text].filter(x=>gp.runes.includes(x));
assert.deepEqual(originalP5Runes.map(x=>gp.runes.indexOf(x)),p5.indices);
assert.equal(originalP5Runes.slice(130,133).join(""),twin[0].source);
const prefix=words.filter(w=>w.primeCell==="0x");
const dual=prefix.filter(w=>/^[1-9][NSEW]$/i.test(w.ordinalCell||""));
assert.equal(prefix.length,10);
assert.deepEqual(dual.map(w=>[w.page,w.source,w.ordinal,w.primes,w.ordinalCell]),
 [[1,"ᚹᚢ",8,22,"1W"],[5,"ᚳᛠᚪ",57,219,"1w"]]);
const west=(index,d)=>index%8>=d?index-d:null;
assert.equal(west(8,1),null);
assert.equal(west(57,1),56);
assert.equal(table[56],"4E");
assert.equal(table[48],"4D");
let orderedTriples=0;
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++)
 if(a+b+c===57&&gp.prime[a]+gp.prime[b]+gp.prime[c]===219)
 orderedTriples++;
assert.equal(orderedTriples,30);
const sourceIndices=p5.indices;
const key=sourceIndices.slice(130,133).map((x,i)=>(x-way.indices[i]+29)%29);
assert.deepEqual(key,[27,4,27]);
const decoded=sourceIndices.map((x,i)=>
 (x-key[((i-130)%3+3)%3]+29)%29);
assert.deepEqual(decoded.slice(130,133),way.indices);
assert.deepEqual(decoded.map((x,i)=>
 (x+key[((i-130)%3+3)%3])%29),sourceIndices);
function ioc(values){
 const counts=Array(29).fill(0);
 for(const x of values)counts[x]++;
 return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
assert.ok(ioc(decoded)<0.045);
assert.ok(ioc(sourceIndices)<0.045);

// Fixed source-size page walk: 29 GP runes, 55 rune-bearing unsolved pages.
// It predicts MAP on p34 and HERE on p8, with no fitted page-step constant.
const mapNumber={ordinal:56,primes:211};
const hereNumber={ordinal:48,primes:168};
assert.deepEqual([table[211],table[168]],["11","40"]);
const mapAliases=words.filter(w=>w.ordinal===mapNumber.ordinal&&w.primes===mapNumber.primes);
const hereAliases=words.filter(w=>w.ordinal===hereNumber.ordinal&&w.primes===hereNumber.primes);
assert.deepEqual(mapAliases.map(w=>w.page),[16,29,34,50]);
assert.deepEqual(hereAliases.map(w=>w.page),[8,27,41]);
const validPages=gp.pages.filter(p=>p.page<=55&&p.runic_count>0);
assert.equal(validPages.length,55);
const step=gp.runes.length;
assert.equal(step,29);
assert.equal((5+step)%55,34);
assert.equal((34+step)%55,8);
assert.equal(mapAliases.find(w=>w.page===34).source,"ᛒᚪᛋ");
assert.equal(hereAliases.find(w=>w.page===8).source,"ᛈᛝᚢᛈ");
assert.equal(gp.pages[34].runic_count,261);
assert.equal((gp.pages[34].runic_count-1)/2,130);
assert.deepEqual(gp.pages[34].indices.slice(130,133),[17,24,15]);
assert.equal(gp.pages[8].runic_count,255);
assert.equal((gp.pages[8].runic_count-1)/2,127);
assert.deepEqual(gp.pages[8].indices.slice(63,67),[13,21,1,13]);
assert.equal(parseInt(table[168],16),64);
console.log(JSON.stringify({sourceBounded29PageRoute:[
 {word:"WAY",page:5,localStart:130,dual:[57,219]},
 {word:"MAP",page:34,localStart:130,dual:[56,211]},
 {word:"HERE",page:8,localStart:63,dual:[48,168]}
],independentModulus:validPages.length,originalAlphabetSize:step,
 mapSourceAliases:mapAliases.map(w=>w.page),
 hereSourceAliases:hereAliases.map(w=>w.page),
 globalPageCenterRuleFailsAtPage8:true,
 recoveredUnknownPlaintext:false},null,2));

console.log(JSON.stringify({
  class:"original-source navigation/crib candidate; no unknown plaintext",
  originalWords:words.length,originalRunes:parsed.runeCount,
  crossPageWords:parsed.crossPageWords,
  sourceWAY:{ordinal:way.ordinal,primes:way.primes,
    tokens:[way.ordinalCell,way.primeCell]},
  uniqueUnknownDualSum:twin,
  p5:{runes:p5.runic_count,midpoint:131,wordStart:130,wordEnd:132,
    lineWrapWithinWord:true},
  p50:{prime0xSourceWordCount:prefix.length,dualCardinalCount:dual.length,
    p1WestEdge:null,p5WestTarget:56},
  candidateOrderedTriplePreimages:orderedTriples,
  frozenP5ThreePeriodVigenereControl:{key,originalIoc:ioc(sourceIndices),
    decodedIoc:ioc(decoded),
    sourceNativeCleartextRecovered:false,
    first35:decoded.slice(0,35).map(i=>gp.translit[i]).join(".")},
  decipherment:false
},null,2));
