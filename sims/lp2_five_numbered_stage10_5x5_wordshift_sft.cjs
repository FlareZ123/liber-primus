'use strict';

// Direct 2014 source-selected first opcode: Stage10 order-five magic square
// entries supply a five-label-by-five-word cyclic GP29 Vigenere key table.
// Every rune of one printed word receives one fixed source cell shift.
// All 553 original numbered text runes and first 2 intact independent
// passages are decoded without fitting any key or changing punctuation.
// Read-only Node.js 22 SFT, exact historical source, Windows line-ending-safe.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {originalParagraphs}=require('./lp2_pp36_38_numbered_aphorism_crib_sft.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r/g,'');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const lengths=originalParagraphs(read('resources/liber-primus/lp2-transcription.txt'));
const squares=read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(t=>t.trim().split(/\s+/).map(Number));
assert.deepEqual(squares.map(a=>a.length),[25,49,25]);
for(const [idx,sum] of [[0,3301],[2,1033]]) {
  for(let row=0;row<5;row++)
    assert.equal(squares[idx].slice(5*row,5*row+5).reduce((a,b)=>a+b,0),sum);
}
const originals=[
  corpus.pages[36].indices.slice(99,238),
  corpus.pages[37].indices.slice(0,91),
  corpus.pages[37].indices.slice(91,189),
  corpus.pages[37].indices.slice(189,228).concat(corpus.pages[38].indices.slice(0,57)),
  corpus.pages[38].indices.slice(57,186)
];
assert.deepEqual(lengths.map(p=>p.length),[30,20,25,19,28]);
assert.deepEqual(originals.map(p=>p.length),[139,91,98,96,129]);
assert.equal(originals.reduce((sum,x)=>sum+x.length,0),553);
assert.equal(lengths[3][8],6);
const mod=x=>(x%29+29)%29;

/**
 * @param {number[]} input
 * @param {number[]} lengthsForUnit
 * @param {number[]} matrix source order-five matrix in 2014 HTML row order
 * @param {number} unit zero-based source-visible red label
 * @param {1|-1} sign decryption sign
 */
function directShift(input,lengthsForUnit,matrix,unit,sign) {
  const out=[];
  let off=0;
  for(let word=0;word<lengthsForUnit.length;word++) {
    const key=matrix[unit*5+(word%5)]%29;
    for(let j=0;j<lengthsForUnit[word];j++)
      out.push(mod(input[off++]+sign*key));
  }
  assert.equal(off,input.length);
  return out;
}
/**
 * @param {number[]} plaintext
 * @param {number[]} lengthsForUnit
 * @param {number[]} matrix
 * @param {number} unit
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encryptWithF(plaintext,lengthsForUnit,matrix,unit,sign) {
  const out=[];let off=0;
  for(let word=0;word<lengthsForUnit.length;word++){
    const key=matrix[unit*5+(word%5)]%29;
    for(let j=0;j<lengthsForUnit[word];j++){
      const p=plaintext[off++];
      out.push(p===0?0:mod(p-sign*key));
    }
  }
  assert.equal(off,plaintext.length);
  return out;
}
/**
 * A non-F ciphertext rune cannot be generated from plaintext F in the
 * historical solved-page bypass convention. Counts forced contradictions.
 * @param {number[]} cipher
 * @param {number[]} wordLengths
 * @param {number[]} matrix
 * @param {number} unit
 * @param {1|-1} sign
 */
function incompatibleF(cipher,wordLengths,matrix,unit,sign){
  let off=0,bad=0;const examples=[];
  wordLengths.forEach((n,w)=>{
    const key=matrix[unit*5+w%5]%29;
    for(let j=0;j<n;j++) {
      const c=cipher[off];
      if(c!==0&&mod(c+sign*key)===0){bad++;if(examples.length<3)examples.push({offset:off,word:w,key,cipher:c});}
      off++;
    }
  });
  assert.equal(off,cipher.length);
  return {bad,examples};
}
/** @param {number[]} a */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const n of a) counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const show=a=>a.map(x=>corpus.translit[x]).join('-');

const native=corpus.pages[57].indices;
assert.equal(native.length,95);
const planted=Array.from({length:553},(_,i)=>native[i%native.length]);
const plantedParts=[];let start=0;
for(const section of originals){plantedParts.push(planted.slice(start,start+section.length));start+=section.length}
assert.equal(start,553);
const logged=[];
for(const matrixId of [0,2])for(const sign of [-1,1]){
  const matrix=squares[matrixId];
  let output=[],impossible=0;
  for(let unit=0;unit<5;unit++){
    const original=originals[unit],wordSizes=lengths[unit];
    const decoded=directShift(original,wordSizes,matrix,unit,sign);
    assert.deepEqual(directShift(decoded,wordSizes,matrix,unit,-sign),original);
    const f=incompatibleF(original,wordSizes,matrix,unit,sign);
    impossible+=f.bad;output.push(...decoded);
    const nativeSynthetic=encryptWithF(plantedParts[unit],wordSizes,matrix,unit,sign);
    assert.equal(incompatibleF(nativeSynthetic,wordSizes,matrix,unit,sign).bad,0,
      'authentic source-native F positive cannot have a forbidden non-F plaintext F');
    console.log(JSON.stringify({
      sourceSquareSum:matrixId===0?3301:1033,sign,
      section:unit+1,sourceRunes:original.length,words:wordSizes.length,
      originalDecodedIoC:ioc(decoded),historicalFContradictions:f.bad,
      earliestContradiction:f.examples[0]||null,
      originalFirst30:show(decoded.slice(0,30)),
      exactForwardReplay:true,solvedP57SyntheticLength:plantedParts[unit].length,
    }));
  }
  assert.equal(output.length,553);
  const result={sourceSquareSum:matrixId===0?3301:1033,sign,
    full553IoC:ioc(output),historicalFContradictions:impossible,
    allOriginalRereencoded:true,sourceNativeSyntheticPositive:true};
  logged.push(result);
  console.log(JSON.stringify(result));
}
assert.deepEqual(logged.map(q=>q.historicalFContradictions),[17,14,26,19]);
assert(logged.every(q=>q.full553IoC<0.04));
console.log('PASS four literal 2014 order-five source-square wordshift inverses, '+
  '122 complete words, 553 original runes, F-bypass negative, '+
  'exact original forward replay, positive native GP planted source.');
