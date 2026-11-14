"use strict";
/**
 * Cross-round original-source lead: the thirteen printed word cells of
 * LP1 p05 SOME WISDOM concatenate to exactly 76 GP29 runes, precisely the
 * full original length of moth-linked LP2 p55. Frozen row-major printed
 * order and six direct additive inverses; no phase, F skip, altered words,
 * fitted alphabet or guessed historical plaintext.
 * Windows 11 / Node.js 22:
 * node sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT=path.join(__dirname,"..");
const read = file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const anchor="272-138-";
assert.equal(lp1.indexOf(anchor),lp1.lastIndexOf(anchor));
const rows=lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0,5)
  .map(line=>line.replace(/\/$/,"").split("-"));
assert.deepEqual(rows.map(row=>row.length),[5,5,5,5,5]);
const wordCells=rows.flatMap(row=>row.filter(cell=>!/^[0-9]+$/.test(cell)));
assert.equal(wordCells.length,13);
const wordNames=wordCells.map(cell=>cell.split("")
  .map(rune=>book.translit[book.runes.indexOf(rune)]).join(""));
assert.deepEqual(wordNames,[
  "SHADOWS","AETHEREAL","BUFFERS","UOID","CARNAL","OBSCURA",
  "FORM","MOBIUS","ANALOG","UOID","MOURNFUL","AETHEREAL","CABAL"
]);
const lengths=wordCells.map(word=>word.length);
assert.deepEqual(lengths,[7,6,7,4,6,7,4,6,6,4,8,6,5]);
const key=wordCells.join("").split("").map(rune=>book.runes.indexOf(rune));
assert.ok(key.every(x=>x>=0&&x<29));
assert.equal(key.length,76);
const p55=book.pages.find(page=>page.page===55).indices;
const p57=book.pages.find(page=>page.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);
/** @param {number} x @returns {number} */
const mod29=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequencies=Array(29).fill(0);
  for(const x of a){assert.ok(x>=0&&x<29);frequencies[x]++;}
  return frequencies.reduce((n,v)=>n+v*(v-1),0)/(a.length*(a.length-1));
}
function run() {
  const expected={
    GPIndex:[0.03859649122807018,0.030175438596491227],
    GPPrime:[0.04,0.04105263157894737],
    GPTotient:[0.04,0.04105263157894737]
  };
  const representations=[
    ["GPIndex",i=>key[i]],
    ["GPPrime",i=>book.prime[key[i]]%29],
    ["GPTotient",i=>(book.prime[key[i]]-1)%29]
  ];
  const candidates=[];
  for(const [name,k] of representations)for(const sign of [-1,1]){
    const decoded=p55.map((c,i)=>mod29(c+sign*k(i)));
    assert.deepEqual(decoded.map((p,i)=>mod29(p-sign*k(i))),p55,
      "All 76 unchanged p55 runes must reencrypt exactly.");
    const nativePlant=p57.slice(0,76);
    const encrypted=nativePlant.map((p,i)=>mod29(p-sign*k(i)));
    assert.deepEqual(encrypted.map((c,i)=>mod29(c+sign*k(i))),nativePlant,
      "Source-native solved p57 76-rune plant must invert.");
    const observed=ioc(decoded);
    assert.ok(Math.abs(observed-expected[name][sign===-1?0:1])<1e-14);
    assert.ok(observed<0.05,"No output can be promoted as ordinary GP prose.");
    candidates.push({representation:name,decodeSign:sign,originalRunes:76,
      plaintextIoC:observed,translit:decoded.map(x=>book.translit[x]).join("")});
  }
  const xored=p55.map((v,i)=>v^key[i]);
  assert.equal(xored.filter(x=>x>=29).length,8,
    "Ordinary five-bit XOR leaks symbols outside the native 29-rune inventory");
  const result={firstPartySource:"LP1 p05 mixed 5x5 GP words and original LP2 p55",
    originalCopiedMothPages:["LP1 p05","LP2 p53","LP2 p55"],
    p05WordCellCount:wordCells.length,
    p05WordCellLengths:lengths,
    p05WordTapeGP29:key.length,p55CiphertextGP29:p55.length,
    exactFullLengthMatch:key.length===p55.length,
    sourceKeyWordNames:wordNames,p55OriginalIoC:ioc(p55),
    positivePlantSource:"Solved p57 first 76 original clear GP runes",
    directAdditiveCandidates:candidates,
    fiveBitOrdinalXOROutOfAlphabet:xored.filter(x=>x>=29).length,
    verdict:"A previously unstated exact source-tape length fit; none of the six fully source-fixed direct GP29 keys recovers ordinary native GP prose."};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,ioc};
