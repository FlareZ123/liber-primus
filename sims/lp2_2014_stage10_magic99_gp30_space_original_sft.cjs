'use strict';
/**
 * Original LP2 first-party 2014 Stage10 magic-squares as a GP30
 * space-changing additive key, exact forward/reverse with source-native
 * solved-p57 positives, fixed all-book event clock and disjoint page holdout.
 *
 * Stage10 visibly supplies 5x5,7x7,5x5 = 99 numeric key cells. As the
 * minimal space-changing extension of a GP29 additive cipher, treat an
 * actual original printed word separator as GP30 symbol29. With all
 * original complete printed words carried across physical page seams,
 * decode P[event]=(C[event] ± S[event mod99]) mod30.
 *
 * This is a bounded, SOURCE-MOTIVATED candidate receiver. Original
 * instructions do NOT explicitly authorize the GP30 alphabet, modulo30
 * projection, or key repetition. Do not promote a no-match to a general
 * impossibility of space-changing ciphers.
 *
 * SFT Windows/Node22:
 *   node sims/lp2_2014_stage10_magic99_gp30_space_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} f @returns {string} */
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt').split('%');
const magic=read('resources/cicada2014-openpuff-magic-squares.txt')
  .match(/\d+/g).map(Number);
assert.equal(magic.length,99);
assert.deepEqual([magic.slice(0,25).length,magic.slice(25,74).length,
  magic.slice(74).length],[25,49,25]);
const key=magic.map(n=>n%30);
const runeIds=new Map(c.runes.map((r,i)=>[r,i]));
const sourcePages=c.pages.filter(x=>x.page<=55&&x.indices.length);
assert.equal(sourcePages.length,55);
const physicalNums=sourcePages.map(x=>x.page);
assert.deepEqual(physicalNums,Array.from({length:56},(_,i)=>i)
  .filter(p=>p!==50));
const pages=[];
const sourceEventTape=[];
const marks=[];
let gapPending=false;
for(let k=0;k<55;k++){
  const physical=physicalNums[k];
  const part=transcript[k];
  const start=sourceEventTape.length;
  let seenRunes=0,printedGaps=0;
  for(const ch of part){
    if(runeIds.has(ch)){
      sourceEventTape.push(runeIds.get(ch));seenRunes++;gapPending=false;
    }else if('- .&$§'.includes(ch)&&!/\s/.test(ch)&&!gapPending){
      sourceEventTape.push(29);
      marks.push(ch);
      printedGaps++;
      gapPending=true;
    }
  }
  assert.equal(seenRunes,c.pages[physical].indices.length);
  assert.deepEqual(sourceEventTape.slice(start).filter(x=>x<29),
    c.pages[physical].indices);
  pages.push({page:physical,start,end:sourceEventTape.length,
    runes:seenRunes,gaps:printedGaps});
}
assert.equal(sourceEventTape.filter(v=>v<29).length,12956);
assert.equal(sourceEventTape.filter(v=>v===29).length,2896);
assert.equal(sourceEventTape.length,15852);
assert.equal(marks.length,2896);
assert.deepEqual(sourceEventTape.filter(x=>x<29),
  sourcePages.flatMap(p=>p.indices));
/** @param {number} x @returns {number} */
const mod30=x=>(x%30+30)%30;
/** @param {number[]} tape @param {1|-1} sign
 * @param {number} offset */
function transform(tape,sign,offset=0){
  return tape.map((v,i)=>mod30(v+sign*key[(offset+i)%99]));
}
/** @param {number[]} tape @returns {{events:number,runes:number,spaces:number,
 * singletonWords:number,emptyGaps:number,longestUngapped:number,plainIoC:number,
 * preview:string}} */
function diagnostics(tape){
  const freq=Array(29).fill(0);
  let current=0, longest=0, singletons=0,emptyGaps=0,spaces=0,runes=0;
  const preview=[];
  for(const v of tape){
    if(v===29){
      spaces++;
      if(current===0)emptyGaps++;
      if(current===1)singletons++;
      longest=Math.max(longest,current);
      current=0;
      if(preview.length<230)preview.push(' ');
    }else{
      runes++;freq[v]++;
      current++;
      if(preview.join('').length<230)preview.push(c.translit[v]);
    }
  }
  longest=Math.max(longest,current);
  const n=runes;
  return {
    events:tape.length,runes,spaces,singletonWords:singletons,
    emptyGaps,longestUngapped:longest,
    plainIoC:freq.reduce((sum,v)=>sum+v*(v-1),0)/(n*(n-1)),
    preview:preview.join('').slice(0,220)
  };
}
function range(low,high){
  const start=pages.find(x=>x.page===low).start;
  const end=pages.find(x=>x.page===high).end;
  return {start,end};
}
const train=range(16,21), holdout=range(40,53);
const originalTrain=diagnostics(sourceEventTape.slice(train.start,train.end));
const originalHoldout=diagnostics(sourceEventTape.slice(holdout.start,holdout.end));
assert.equal(originalTrain.runes,1613);
assert.equal(originalHoldout.runes,3008);

const results=[];
for(const sign of [-1,1]){
  const decoded=transform(sourceEventTape,sign);
  assert.deepEqual(transform(decoded,-sign),sourceEventTape);
  const a=diagnostics(decoded.slice(train.start,train.end));
  const b=diagnostics(decoded.slice(holdout.start,holdout.end));
  results.push({sign,train:a,holdout:b,all:diagnostics(decoded)});
}
// A complete solved genuine author-native p57 plaintext has its real
// printed gaps. Seed a separate 99-cell key clock; assert exact transform.
const solved57=[];
let priorGap=false;
for(const ch of transcript[56]){
  if(runeIds.has(ch)){solved57.push(runeIds.get(ch));priorGap=false;}
  else if('- .&$§'.includes(ch)&&!/\s/.test(ch)&&!priorGap){
    solved57.push(29);priorGap=true;
  }
}
assert.deepEqual(solved57.filter(x=>x<29),c.pages[57].indices);
assert(solved57.length>99);
for(const sign of [-1,1]){
  const plant=transform(solved57,-sign,0);
  const restored=transform(plant,sign,0);
  assert.deepEqual(restored,solved57,'Solved p57 original punctuation and runes');
  const wrongKey=plant.map((x,i)=>mod30(x+sign*key[(i+1)%99]));
  assert.notDeepEqual(wrongKey,solved57);
}
const originalNative57=diagnostics(solved57);
assert(originalNative57.plainIoC>0.06);
assert(originalNative57.spaces>4);
console.log(JSON.stringify({
  source:{
    source:'2014 first-party OpenPuff 25+49+25 original numeric magic square',
    eventAlphabet:'GP29 plus printed-space token29',
    sourceKeyPeriod:99, keyCells:magic.length,
    originalRunes:12956,sourceCompleteWords:2896,originalEvents:15852,
    physicalPages:55,crossPageWordCarries:32
  },
  frozenTest:'one whole-book phase0 original-event Vigenere mod30, both signs',
  scopes:{p16to21:train,p40to53:holdout},
  baseline:{train:originalTrain,holdout:originalHoldout},
  decoded:results,
  positive:{solved57Native:originalNative57,
    exactOriginalWordBoundaryAndRuneRecovery:true,plantedSigns:2},
  conclusion:'This exact 99-cell first-party additive GP30 space-changing inverse is tested; does it recover native text? See original scope diagnostics.'
},null,2));
console.log('PASS: original GP30 all-book source-99-key full-event inverse and authentic native p57 positive.');
