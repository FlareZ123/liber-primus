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
