'use strict';
/**
 * Source-motivated original-input Bifid test for LP2 p55.
 * Run: node sims/lp2_p55_p05_moth_bifid_53crib_sft.cjs
 *
 * Selector: LP1 p05 and LP2 p55 repeat the moth; p05 carries a 5x5 square;
 * p55 has 25 observed GP29 symbols and a 75-rune body (3 x 25).
 * Freeze the third 2014 5x5 square, ascending numeric rank with row-major
 * tie-break, the p55 GP25 support, and standard period-25 Bifid.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const blocks = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).filter((part) => part.trim());
const squares = blocks.map((part) => part.trim().split(/\r?\n/)
  .map((line) => line.trim().split(/\s+/).map(Number)));
const numericSquare = squares[2];
assert.equal(corpus.translit.length, 29);
assert.deepEqual(numericSquare, [
  [272,138,341,131,151],[366,199,130,320,18],
  [226,245,91,245,226],[18,320,130,199,366],
  [151,131,341,138,272],
]);
assert.equal(new Set(numericSquare.flat()).size, 13);
const page = (n) => corpus.pages.find((p) => p.page === n);
const p55 = page(55).indices;
const p55Body = p55.slice(1);
const p57 = page(57).indices;
assert.equal(p55.length, 76);
assert.equal(p55Body.length, 75);
assert.equal(p57.length, 95);
const support = [...new Set(p55)].sort((a,b) => a-b);
const supportSet = new Set(support);
const missing = [...Array(29).keys()].filter((x) => !supportSet.has(x));
assert.equal(support.length, 25);
assert.deepEqual(missing, [3,9,16,26]);
const rankedCells = numericSquare.flat().map((value,index)=>({value,index}))
  .sort((a,b)=>a.value-b.value || a.index-b.index);
const rankPositions = rankedCells.map((cell)=>cell.index);
assert.deepEqual(rankPositions,[9,15,12,7,17,3,21,1,23,4,20,6,18,10,14,11,13,0,24,8,16,2,22,5,19]);
const keySquare = Array(25);
for(let i=0;i<25;i++) keySquare[rankedCells[i].index]=support[i];
const keySquareTranslit = keySquare.map((x)=>corpus.translit[x]);
assert.deepEqual(keySquareTranslit,[
  'L','H','A','G','J','IA','P','R','OE','F',
  'S','E','TH','M','B','U','D','C','X','EA',
  'EO','W','AE','I','NG',
]);
const coordinate = new Map(keySquare.map((symbol,i)=>[
  symbol,[Math.floor(i/5),i%5],
]));
function bifidEncrypt(input,period=25){
  const out=[];
  for(let start=0;start<input.length;start+=period){
    const block=input.slice(start,start+period);
    const coords=block.map((x)=>coordinate.get(x));
    const stream=coords.map((x)=>x[0]).concat(coords.map((x)=>x[1]));
    for(let i=0;i<block.length;i++) out.push(keySquare[stream[2*i]*5+stream[2*i+1]]);
  }
  return out;
}
function bifidDecrypt(input,period=25){
  const out=[];
  for(let start=0;start<input.length;start+=period){
    const block=input.slice(start,start+period);
    const coords=block.map((x)=>coordinate.get(x));
    const stream=coords.flatMap((x)=>[x[0],x[1]]);
    for(let i=0;i<block.length;i++) out.push(keySquare[stream[i]*5+stream[i+block.length]]);
  }
  return out;
}
const dictionary=corpus.translit.map((spelling,index)=>({spelling,index}))
  .sort((a,b)=>b.spelling.length-a.spelling.length);
function encodeWord(word){
  const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith('ING',i)){out.push(21);i+=3;}
    else if(s.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const token=dictionary.find((x)=>s.startsWith(x.spelling,i));
      assert.ok(token,'No GP token for '+s.slice(i));
      out.push(token.index);i+=token.spelling.length;
    }
  }
  return out;
}
const encodeText=(s)=>s.split(/\s+/).flatMap(encodeWord);
const enlightenment=encodeText('ENLIGHTENMENT AWAITS THOSE');
const multibranched=encodeText('MULTIBRANCHED AWAITS THOSE');
const mothPassage=encodeText('THE TOTIENT FUNCTION IS SACRED ALL THINGS');
const crib1=enlightenment.concat(mothPassage);
const crib2=multibranched.concat(mothPassage);
assert.equal(enlightenment.length,23);
assert.equal(multibranched.length,23);
assert.equal(mothPassage.length,30);
assert.equal(crib1.length,53);
assert.equal(crib2.length,53);
function compare(decoded,offset,crib){
  const actual=decoded.slice(offset,offset+crib.length);
  assert.equal(actual.length,crib.length);
  const mismatches=[];
  for(let i=0;i<crib.length;i++) if(actual[i]!==crib[i]) mismatches.push(i);
  return {matches:crib.length-mismatches.length,mismatches};
}
const fullOutput=bifidDecrypt(p55,25);
const bodyOutput=bifidDecrypt(p55Body,25);
const full1=compare(fullOutput,23,crib1);
const full2=compare(fullOutput,23,crib2);
const body1=compare(bodyOutput,22,crib1);
const body2=compare(bodyOutput,22,crib2);
assert.deepEqual([full1.matches,full2.matches,body1.matches,body2.matches],[1,0,1,0]);
const unsupportedCount=(seq)=>seq.filter((x)=>!supportSet.has(x)).length;
const unsupported={
  enlightenmentFirst23:unsupportedCount(enlightenment),
  multibranchedFirst23:unsupportedCount(multibranched),
  mothPassage30:unsupportedCount(mothPassage),
  enlightenmentCombined53:unsupportedCount(crib1),
  multibranchedCombined53:unsupportedCount(crib2),
};
assert.deepEqual(unsupported,{
  enlightenmentFirst23:7,multibranchedFirst23:4,mothPassage30:8,
  enlightenmentCombined53:15,multibranchedCombined53:12,
});
// Positive mechanism control: 75 actual p57 runes filtered to the same GP25 support.
// The selection is non-contiguous and validates mechanics only.
const plant=p57.filter((x)=>supportSet.has(x)).slice(0,75);
assert.equal(plant.length,75);
const plantedCipher=bifidEncrypt(plant,25);
const recovered=bifidDecrypt(plantedCipher,25);
assert.deepEqual(recovered,plant);
assert.deepEqual(recovered.slice(0,22),plant.slice(0,22));
assert.deepEqual(recovered.slice(22),plant.slice(22));
const ioc=(seq)=>{
  const counts=Array(29).fill(0);
  for(const x of seq) counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
};
const result={
  source:{p55Runes:p55.length,p55BodyRunes:p55Body.length,
    distinctSymbols:support.length,missingGPIndices:missing,
    missingTransliterations:missing.map((x)=>corpus.translit[x])},
  p05Key:{distinctNumericValues:new Set(numericSquare.flat()).size,
    rankPositions,rowMajorTieBreak:true,gp25Square:keySquareTranslit},
  original:{
    physical76:{enlightenment:full1,multibranched:full2,
      prefix23:fullOutput.slice(0,23).map((x)=>corpus.translit[x]),
      prefixIoC:ioc(fullOutput.slice(0,23))},
    body75:{enlightenment:body1,multibranched:body2,
      prefix22:bodyOutput.slice(0,22).map((x)=>corpus.translit[x])},
    cribSymbolsOutsideAlphabet:unsupported,
  },
  positiveControl:{source:'p57 GP symbols filtered to p55 GP25 support (non-contiguous)',
    planted:plant.length,recovered:recovered.length,fullRoundTrip:true,
    blindPrefix22Recovered:true},
};
console.log(JSON.stringify(result,null,2));
