"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {number[]} values @returns {number[]} */
function hOutsideIn(values) {
  const output = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    output.push(mod29(values[i] - values[values.length - 1 - i]), mod29(values[i] + values[values.length - 1 - i]));
  }
  if (values.length % 2 === 1) output.push(values[Math.floor(values.length / 2)]);
  return output;
}
/** @param {number[]} values @returns {number[]|null} */
function completeInterval(values) {
  if (values.length < 2) return null;
  const ordered = values.slice().sort((a, b) => a - b);
  if (new Set(ordered).size !== ordered.length) return null;
  for (let i = 1; i < ordered.length; i += 1) if (ordered[i] !== ordered[i - 1] + 1) return null;
  return ordered;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((text, segment) => ({page:segment>=50?segment+1:segment,words:[],offset:0}));
let current=[],startSegment=0,endSegment=0,startOffset=0,crossingWordCount=0;
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page=pages[startSegment];
    page.words.push({page:page.page,ordinal:page.words.length+1,start:startOffset,end:startOffset+current.length-1,values:current.slice()});
  } else crossingWordCount += 1;
  current=[];
}
for(let segment=0;segment<parts.length;segment+=1){
  for(const char of [...parts[segment]]){
    const value=runeIndex.get(char);
    if(value!==undefined){
      if(!current.length){startSegment=segment;startOffset=pages[segment].offset;}
      endSegment=segment;current.push(value);pages[segment].offset+=1;
    } else if(char!=="/"&&!/\s/u.test(char)) flushWord();
  }
}
flushWord();
assert.equal(crossingWordCount,32);
assert.equal(pages.flatMap((page)=>page.words).length,2864);

const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const source=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map((word)=>word.toUpperCase());
assert.equal(source.length,43);
assert.deepEqual(source.slice(0,9),["HELLO","THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED"]);

const wordsByPage=new Map(pages.map((page)=>[page.page,page.words]));
const diagonal=source.map((sourceWord,sourceIndex)=>({sourceIndex,sourceWord,object:(wordsByPage.get(sourceIndex)||[])[sourceIndex]||null}));
assert.equal(diagonal.filter((row)=>row.object).length,42);
assert.deepEqual(diagonal.filter((row)=>!row.object).map((row)=>[row.sourceIndex,row.sourceWord]),[[32,"YOU"]]);

const outerRows=diagonal.filter((row)=>row.object&&row.object.values.length>=2).map((row)=>{
  const values=row.object.values;
  const pair=[mod29(values[0]-values[values.length-1]),mod29(values[0]+values[values.length-1])];
  return {sourceIndex:row.sourceIndex,sourceWord:row.sourceWord,page:row.object.page,ordinal:row.object.ordinal,start:row.object.start,values,pair,increasing:pair.slice().sort((a,b)=>a-b)};
});

const offsetHits=[];
for(let offset=-42;offset<=42;offset+=1){
  const hits=outerRows.filter((row)=>{
    const first=row.sourceIndex+offset,second=first+1;
    return first>=0&&second<29&&row.increasing[0]===first&&row.increasing[1]===second;
  });
  if(hits.length) offsetHits.push({offset,hits});
}
offsetHits.sort((a,b)=>b.hits.length-a.hits.length||a.offset-b.offset);
assert.equal(offsetHits[0].offset,-2);
assert.equal(offsetHits[0].hits.length,2);
assert.ok(offsetHits.slice(1).every((row)=>row.hits.length===1));
assert.deepEqual(offsetHits[0].hits.map((row)=>({
  sourceIndex:row.sourceIndex,sourceWord:row.sourceWord,page:row.page,ordinal:row.ordinal,start:row.start,values:row.values,pair:row.pair,increasing:row.increasing,words:row.increasing.map((index)=>source[index])
})),[
  {sourceIndex:5,sourceWord:"EPIPHANY",page:5,ordinal:6,start:27,values:[18,15,6,21,0,14],pair:[4,3],increasing:[3,4],words:["LIES","EMPTY"]},
  {sourceIndex:14,sourceWord:"ITS",page:14,ordinal:15,start:59,values:[27,5,14],pair:[13,12],increasing:[12,13],words:["THE","WAY"]},
]);

const predecessorLayers=[];
let predecessorLayerCount=0;
for(const row of diagonal){
  if(!row.object||row.sourceIndex<2) continue;
  let values=row.object.values.slice(),depth=0;
  while(values.length>=2){
    predecessorLayerCount+=1;
    const pair=[mod29(values[0]-values[values.length-1]),mod29(values[0]+values[values.length-1])];
    const ordered=pair.slice().sort((a,b)=>a-b);
    if(ordered[0]===row.sourceIndex-2&&ordered[1]===row.sourceIndex-1){
      predecessorLayers.push({sourceIndex:row.sourceIndex,sourceWord:row.sourceWord,depth,pair,increasing:ordered});
    }
    values=values.slice(1,-1);depth+=1;
  }
}
assert.equal(predecessorLayerCount,79);
assert.deepEqual(predecessorLayers,[
  {sourceIndex:5,sourceWord:"EPIPHANY",depth:0,pair:[4,3],increasing:[3,4]},
  {sourceIndex:14,sourceWord:"ITS",depth:0,pair:[13,12],increasing:[12,13]},
]);

const intervalLayers=[];
let allLayerCount=0;
for(const row of diagonal){
  if(!row.object) continue;
  let values=row.object.values.slice(),depth=0;
  while(values.length>=2){
    allLayerCount+=1;
    const h=hOutsideIn(values),interval=completeInterval(h);
    if(interval) intervalLayers.push({sourceIndex:row.sourceIndex,sourceWord:row.sourceWord,depth,h,interval});
    values=values.slice(1,-1);depth+=1;
  }
}
assert.equal(allLayerCount,87);
assert.deepEqual(intervalLayers,[
  {sourceIndex:1,sourceWord:"THE",depth:3,h:[6,7],interval:[6,7]},
  {sourceIndex:11,sourceWord:"IS",depth:0,h:[26,25],interval:[25,26]},
  {sourceIndex:24,sourceWord:"AND",depth:0,h:[12,13],interval:[12,13]},
  {sourceIndex:27,sourceWord:"ARE",depth:1,h:[5,6],interval:[5,6]},
  {sourceIndex:42,sourceWord:"OPENPGP",depth:0,h:[2,1,0],interval:[0,1,2]},
]);

assert.deepEqual(intervalLayers.find((row)=>row.sourceIndex===42).interval,[0,1,2]);
assert.deepEqual(offsetHits[0].hits.find((row)=>row.sourceIndex===5).increasing,[3,4]);
assert.deepEqual(intervalLayers.find((row)=>row.sourceIndex===27).interval,[5,6]);
assert.deepEqual(intervalLayers.find((row)=>row.sourceIndex===1).interval,[6,7]);

console.log(JSON.stringify({
  status:"PASS",
  predecessorOffsetFamily:offsetHits.map((row)=>({offset:row.offset,count:row.hits.length,selectors:row.hits.map((hit)=>`${hit.sourceWord}${hit.sourceIndex}`)})),
  predecessorBacklinks:offsetHits[0].hits.map((row)=>({selector:`${row.sourceWord}${row.sourceIndex}`,receiver:`p${row.page} word${row.ordinal}`,hOuter:row.pair,increasing:row.increasing,words:row.increasing.map((index)=>source[index])})),
  allConcentricCompleteIntervals:intervalLayers.map((row)=>({selector:`${row.sourceWord}${row.sourceIndex}`,depth:row.depth,h:row.h,interval:row.interval,words:row.interval.map((index)=>source[index])})),
  sourcePrefixPackets:[
    {selector:"OPENPGP42",indices:[0,1,2],words:source.slice(0,3)},
    {selector:"EPIPHANY5",indices:[3,4],words:source.slice(3,5)},
    {selector:"ARE27",indices:[5,6],words:source.slice(5,7)},
    {selector:"THE1",indices:[6,7],words:source.slice(6,8)},
  ],
  decision:"The only repeated direct selector-relative consecutive outer-pair offset is d=-2 at EPIPHANY5 and ITS14. Complete H coordinate-set intervals across all circumference depths add THE1 -> SEEKS THE and preserve the established direct packets independently of H serialization order.",
},null,2));
