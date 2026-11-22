'use strict';

/**
 * LP2 86 ciphertext doublet events -> 85 gaps, keyed by the 85 authentic
 * solved-p56 GP29 runes under the historical prime-totient F-skip cipher.
 *
 * Standalone SFT: Node.js 22, CommonJS. Exact original source corpus.
 * No recovered unknown plaintext is asserted.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const book=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const mod=x=>((x%29)+29)%29;
const prime=[];
for(let x=2;prime.length<1600;x++){
  let isPrime=true;
  for(let d=2;d*d<=x;d++)if(x%d===0){isPrime=false;break;}
  if(isPrime)prime.push(x);
}

/**
 * Source-native GP spellings use EUERY for EVERY and SEEC for SEEK.
 * This known-answer control establishes the exact independent p56
 * plaintext before using it as hypothetical material for unsolved pages.
 * @param {string} source
 * @returns {number[]}
 */
function parseGP(source){
  const tokens=book.translit.map((spelling,index)=>({spelling,index}))
    .sort((a,b)=>b.spelling.length-a.spelling.length);
  const out=[];
  for(const word of source.split(' '))for(let offset=0;offset<word.length;){
    const token=tokens.find(item=>word.startsWith(item.spelling,offset));
    assert(token,'invalid native GP source spelling');
    out.push(token.index);
    offset+=token.spelling.length;
  }
  return out;
}
const known='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO '+
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const plain56=parseGP(known),cipher56=book.pages[56].indices;
assert.equal(plain56.length,85);
assert.equal(cipher56.length,85);
let keyCursor=0;
let literalF=[];
for(let i=0;i<85;i++){
  if(plain56[i]===0){
    literalF.push(i);
    assert.equal(cipher56[i],0);
  }else{
    assert.equal(cipher56[i],mod(plain56[i]+prime[keyCursor++]-1));
  }
}
assert.deepEqual(literalF,[56]);
assert.equal(keyCursor,84);

const ciphertext=book.pages.filter(page=>page.page<=55)
  .flatMap(page=>page.indices);
assert.equal(ciphertext.length,12956);
const doubled=[];
for(let i=1;i<ciphertext.length;i++)
  if(ciphertext[i]===ciphertext[i-1])doubled.push(i);
assert.equal(doubled.length,86);
assert.equal(doubled[0],122);
assert.equal(doubled.at(-1),12939);

/**
 * An original non-F glyph always consumes a prime, and plaintext F emits
 * literal ciphertext F without consuming a prime. A ciphertext F may be
 * literal or may arise from an encrypted non-F. Track *all* such paths.
 * @param {number[]} cipher
 * @param {number} start - 1-based index of initial prime
 * @returns {{endStates:Set<number>,failOffset:number}}
 */
function reachable(cipher,start){
  let states=new Set([start-1]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    const symbol=cipher[i];
    for(const state of states){
      const decoded=mod(symbol-(prime[state]-1));
      if(decoded!==0)next.add(state+1);
      if(symbol===0)next.add(state);
    }
    if(next.size===0)return {endStates:next,failOffset:i};
    states=next;
  }
  return {endStates:states,failOffset:-1};
}

/**
 * A positive authentic-p56-rule ciphertext, generated from *clear* p57.
 * @param {number[]} native
 * @param {number} start
 * @returns {{cipher:number[],finalState:number}}
 */
function encode(native,start){
  let state=start-1;
  const cipher=native.map(symbol=>{
    if(symbol===0)return 0;
    return mod(symbol+prime[state++]-1);
  });
  return {cipher,finalState:state};
}
const clear57=book.pages[57].indices;
assert.equal(clear57.length,95);

// Four literal key registers and two source-meaningful conventions:
// [1] gap from second rune of delimiter j through second rune of j+1;
// [2] complete exclusion of the two-rune next delimiter.
const seeds={
  solvedPlainGPPrime:plain56.map(v=>book.prime[v]),
  solvedPlainOrdinal:plain56.map(v=>v+1),
  printedCipherGPPrime:cipher56.map(v=>book.prime[v]),
  printedCipherOrdinal:cipher56.map(v=>v+1)
};
const spans={
  inclusive:(j)=>ciphertext.slice(doubled[j]+1,doubled[j+1]+1),
  markerExcluded:(j)=>ciphertext.slice(doubled[j]+1,doubled[j+1]-1)
};
const tested={};
for(const [cutName,getSpan] of Object.entries(spans)){
  tested[cutName]={};
  for(const [keyName,starts] of Object.entries(seeds)){
    let alive=0,firstFail=null,positive=0;
    for(let j=0;j<85;j++){
      const span=getSpan(j),initial=starts[j];
      assert(initial>0&&initial<=109);
      const result=reachable(span,initial);
      if(result.failOffset<0)alive++;
      else if(!firstFail)firstFail={
        gap:j,runicCount:span.length,firstImpossibleOffset:result.failOffset
      };
      if(keyName==='solvedPlainGPPrime'){
        const knownPlain=Array.from({length:span.length},
          (_,k)=>clear57[k%clear57.length]);
        const planted=encode(knownPlain,initial);
        const plantReach=reachable(planted.cipher,initial);
        assert.equal(plantReach.failOffset,-1);
        assert(plantReach.endStates.has(planted.finalState));
        positive++;
      }
    }
    tested[cutName][keyName]={
      completeSegments:alive,impossibleSegments:85-alive,firstFail,
      authenticCipherPlants:keyName==='solvedPlainGPPrime'?positive:undefined
    };
  }
}
assert.deepEqual(Object.fromEntries(Object.entries(tested.inclusive)
  .map(([k,v])=>[k,v.completeSegments])),{
  solvedPlainGPPrime:22,solvedPlainOrdinal:19,
  printedCipherGPPrime:24,printedCipherOrdinal:21
});
assert.deepEqual(Object.fromEntries(Object.entries(tested.markerExcluded)
  .map(([k,v])=>[k,v.completeSegments])),{
  solvedPlainGPPrime:22,solvedPlainOrdinal:20,
  printedCipherGPPrime:24,printedCipherOrdinal:22
});
assert.equal(tested.inclusive.solvedPlainGPPrime.authenticCipherPlants,85);
assert.equal(tested.markerExcluded.solvedPlainGPPrime.authenticCipherPlants,85);
console.log(JSON.stringify({
  source:'original 12,956 unknown GP29 runes and authentic solved p56',
  p56Control:'85/85 literal-F with prime-totient key, one F-bypass',
  doublets:doubled.length,segments:doubled.length-1,
  tests:tested,plaintextRecovered:false
},null,2));
console.log('PASS: original p56 regression and all 170 authentic-rule plants');
