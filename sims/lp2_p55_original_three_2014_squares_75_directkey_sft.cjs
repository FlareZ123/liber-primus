"use strict";

/**
 * Three historical 2014 square registers -> p55's exact 75 complete-word
 * body, selected by original p57's "SHED ... CIRCUMFERENCES".
 *
 * Original source: 5×5 3301, 7×7 1033, 5×5 1033, in preserved order.
 * Shave ONE cell circumference from the middle 7×7 to obtain 5×5;
 * 25+25+25 = exactly the original p55 body after p54's one-rune carry.
 *
 * Frozen source readouts: matrix values modulo29 or Euler totient modulo29;
 * two key directions, both GP29 additive signs, all source GP-F bypass
 * masks. Exact all-secret F-site enumeration, no key fitting/phase tuning.
 * Native English 13-rune word check is conditional on ordinary prose.
 * Node.js 22, CommonJS, zero dependencies, no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/cicada2014-openpuff-magic-squares.txt");
const squareParts=source.trim().split(/\r?\n\s*\r?\n/u)
  .map(block=>block.trim().split(/\r?\n/u)
    .map(line=>line.trim().split(/\s+/u).map(Number)));
assert.deepEqual(squareParts.map(m=>m.length),[5,7,5]);
const sourceMatrices=[
  squareParts[0],
  squareParts[1].slice(1,6).map(row=>row.slice(1,6)),
  squareParts[2]
];
assert(sourceMatrices.every(m=>m.length===5&&m.every(row=>row.length===5)));
const key75=sourceMatrices.flatMap(matrix=>matrix.flat());
assert.equal(key75.length,75);
const ciphertext=corpus.pages.find(page=>page.page===55).indices;
assert.equal(ciphertext.length,76);
const complete=ciphertext.slice(1);
const expectedLengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(expectedLengths.reduce((a,b)=>a+b,0),complete.length);
const transcript=read("resources/lp2-transcription.txt").split("%")[54];
const sourceLengths=(transcript.match(/[\u16A0-\u16FF]+/gu)||[]).map(s=>[...s].length);
assert.deepEqual(sourceLengths,[1,...expectedLengths]);
assert.equal(complete.join(","),
  [...transcript.matchAll(/[\u16A0-\u16FF]/gu)].map(m=>corpus.runes.indexOf(m[0])).slice(1).join(","));
const fPositions=complete.map((v,i)=>v===0?i:null).filter(v=>v!==null);
assert.deepEqual(fPositions,[14,24,40]);
const long13=require("./lp2_source_native_longword_lexicon.cjs")
  .sourceNativeLongwords().get(13);
assert.equal(long13.length,426);
const corpus13=new Set(long13.map(w=>w.indices.join(",")));
const known56=corpus.pages.find(page=>page.page===56).indices;
const primes=[];
for(let n=2;primes.length<84;n++){
  let isPrime=true;for(let j=2;j*j<=n;j++)if(n%j===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
let keyIndex=0;
const knownPlain56=known56.map((c,i)=>{
  if(i===56){assert.equal(c,0);return 0;}
  const plain=(c-primes[keyIndex++]+1+29000)%29;
  return plain;
});
assert.equal(keyIndex,84);
/** @param {number} value */
function phi(value) {
  let n=value, result=value;
  for(let factor=2;factor*factor<=n;factor++){
    if(n%factor===0){
      while(n%factor===0)n/=factor;
      result=result/factor*(factor-1);
    }
  }
  if(n>1)result=result/n*(n-1);
  return result;
}
const mod=n=>(n%29+29)%29;
/**
 * When plaintext F=0, preserve literal F and skip the running key.
 * For all other runes consume one key item. A ciphertext 0 may arise
 * from an ordinary nonzero plaintext symbol; the inverse enumerates.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encrypt(plain,key,sign) {
  let cursor=0;
  return plain.map(p=>{
    if(p===0)return 0;
    const out=mod(p-sign*key[cursor]);
    cursor++;
    return out;
  });
}
/**
 * Every possible F bypass mask on actual C=F sites is source-fixed.
 * A nonzero ciphertext producing P=F under normal GP29 processing is
 * invalid under the stated plaintext-F-transparent cipher model.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {number} mask
 * @param {number[]} zeroSites
 */
function decrypt(cipher,key,sign,mask,zeroSites) {
  let cursor=0;let valid=true;
  const plain=cipher.map((value,index)=>{
    const fIndex=zeroSites.indexOf(index);
    const skip=fIndex>=0&&Boolean(mask&(1<<fIndex));
    if(skip)return 0;
    const p=mod(value+sign*key[cursor]);
    cursor++;
    if(p===0)valid=false;
    return p;
  });
  return {plain,valid,consumed:cursor};
}
const wordStart=expectedLengths.slice(0,6).reduce((a,b)=>a+b,0);
assert.equal(wordStart,22);
assert.equal(expectedLengths[6],13);
const actual=[];
for(const reading of ["numbers","totient"]){
  const base=key75.map(value=>mod(reading==="numbers"?value:phi(value)));
  for(const direction of ["forward","reversed"]){
    const key=direction==="reversed"?base.slice().reverse():base;
    for(const sign of [-1,1]){
      let passingF=0,found13=0,bestIoC=0;
      const byMask=[];
      for(let mask=0;mask<(1<<fPositions.length);mask++){
        const dec=decrypt(complete,key,sign,mask,fPositions);
        const reen=encrypt(dec.plain,key,sign);
        assert.deepEqual(reen,complete,"source 75-runic complete roundtrip");
        if(dec.valid)passingF++;
        const word=dec.plain.slice(wordStart,wordStart+13);
        if(dec.valid&&corpus13.has(word.join(",")))found13++;
        const counts=Array(29).fill(0);
        dec.plain.forEach(v=>counts[v]++);
        const ioc=counts.reduce((s,n)=>s+n*(n-1),0)/(75*74);
        if(dec.valid)bestIoC=Math.max(bestIoC,ioc);
        byMask.push({mask,valid:dec.valid,consumed:dec.consumed,
          word13:word.map(p=>corpus.translit[p]).join(""),
          ioc:Number(ioc.toFixed(6))});
      }
      actual.push({reading,direction,sign,passingF,found13,
        bestIoC:Number(bestIoC.toFixed(6)),byMask});
    }
  }
}
assert(actual.every(row=>row.found13===0));
assert(actual.some(row=>row.passingF>0));
/* Positive genuinely solved p56 plaintext: one literal F at index56;
 * source 75-key is used exactly; key clock skips it. Exhaust over the
 * ciphertext-zero positions, find the correct bypass mask and decode.
 */
const plantedPlain=knownPlain56.slice(0,75);
assert.equal(plantedPlain.length,75);
assert.equal(plantedPlain[56],0);
let plants=0;
for(const reading of ["numbers","totient"]){
  const sourceKey=key75.map(value=>mod(reading==="numbers"?value:phi(value)));
  for(const direction of ["forward","reversed"]){
    const key=direction==="reversed"?sourceKey.slice().reverse():sourceKey;
    for(const sign of [-1,1]){
      const plant=encrypt(plantedPlain,key,sign);
      const zeroSites=plant.map((v,i)=>v===0?i:null).filter(i=>i!==null);
      assert(zeroSites.length<=10);
      let recovered=false;
      for(let mask=0;mask<(1<<zeroSites.length);mask++){
        const dec=decrypt(plant,key,sign,mask,zeroSites);
        if(dec.valid&&dec.plain.every((v,i)=>v===plantedPlain[i])){
          assert.deepEqual(encrypt(dec.plain,key,sign),plant);
          recovered=true;break;
        }
      }
      assert(recovered,reading+"/"+direction+"/"+sign+" planted p56 original");
      plants++;
    }
  }
}
assert.equal(plants,8);
console.log(JSON.stringify({
  source:"Original 2014 5x5+shaved 7x7+5x5 = p55 75 complete GP ciphertext runes",
  originalFPositions:fPositions,
  keyFamily:["original numbers mod29","Euler totient of original numbers mod29"],
  allSourceAlignedOriginalCases:actual,
  authenticSolvedP56PositivePlants:plants,
  verdict:"No original F-compatible keyed p55 candidate yields a source-native GP13 lexicon word. No unknown plaintext recovered."
},null,2));
