"use strict";
/**
 * Reproduce original LP2 numeric-table missing-digit → prime179 → p53 link,
 * then test one source-only 179-step grid-traversal key construction.
 *
 * Node.js 22, CommonJS, no third-party packages.
 * From repository root: node sims/grid_missing_f_prime179_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const grid=load("resources/liber-primus/base60-grid.json");
const corpus=load("resources/liber-primus/lp2-corpus.json");
const latin=load("resources/control/latin-vulgate-heldout-gp.json");
const alpha=grid.alphabet;
const tokens=grid.rows.flat();
assert.equal(alpha.length,60);
assert.equal(tokens.length,256);
assert.equal(grid.byte_rows.length,32);
assert(tokens.every(t=>t.length===2));
const bytes=grid.byte_rows.flat();
assert.deepEqual(tokens.map(t=>60*alpha.indexOf(t[0])+alpha.indexOf(t[1])),bytes);
const lowDigits=tokens.map(t=>t[1]);
const misses=[...alpha].map((ch,i)=>({ch,index:i,frequency:lowDigits.filter(x=>x===ch).length}))
  .filter(v=>v.frequency===0);
assert.deepEqual(misses,[{ch:"f",index:41,frequency:0}]);

/** @param {number} ordinal @returns {number} */
function primeAt(ordinal){
  const primes=[];
  for(let k=2;primes.length<ordinal;k++){
    let prime=true;
    for(const p of primes){if(p*p>k)break;if(k%p===0){prime=false;break;}}
    if(prime)primes.push(k);
  }
  return primes.at(-1);
}
const prime=primeAt(41);
assert.equal(prime,179);
const asInteger=(source,radix)=>source.reduce(
  (acc,d)=>acc*BigInt(radix)+BigInt(d),0n);
const N=asInteger(bytes,256);
const page53=corpus.pages.find(p=>p.page===53);
assert.equal(page53.indices.length,179);
const red=page53.indices.slice(128);
assert.equal(red.length,51);
const R=asInteger(red,29);
assert.equal(N%179n**2n,0n);
assert.notEqual(N%179n**3n,0n);
assert.equal(R%179n,0n);
assert.notEqual(R%179n**2n,0n);
const altAlphabet=alpha.replace("f","");
assert.equal(altAlphabet.length,59);
const altBytes=tokens.map(t=>59*altAlphabet.indexOf(t[0])+altAlphabet.indexOf(t[1]));
assert(altBytes.every(x=>x>=0&&x<=255));
const altN=asInteger(altBytes,256);
assert.notEqual(altN%179n,0n);

const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const plant=latin.runes.slice(0,2400);
assert.equal(C.length,12956);
assert.equal(plant.length,2400);
const mod=(a,n)=>(a%n+n)%n;
const ioc=seq=>{
  const freq=Array(29).fill(0);
  for(const ch of seq)freq[ch]++;
  return freq.reduce((sum,n)=>sum+n*(n-1),0)/(seq.length*(seq.length-1));
};
/**
 * @param {number[]} seq
 * @param {number[]} key
 * @param {"add29"|"transparent28"} family
 * @param {"mod"|"scaled"} projection
 * @param {-1|1} sign
 * @param {boolean} encode
 * @returns {number[]}
 */
function cipher(seq,key,family,projection,sign,encode){
  let prev=-1;
  return seq.map((x,i)=>{
    const M=family==="add29"?29:28;
    const digit=projection==="mod"?key[i%256]%M:Math.floor(M*key[i%256]/256);
    let output;
    if(family==="add29")output=mod(x+(encode?1:-1)*sign*digit,29);
    else if(encode)output=prev===-1?x:x===28?prev:
      mod(prev+1+mod(x+sign*digit,28),29);
    else output=prev===-1?x:x===prev?28:
      mod(mod(x-prev-1,29)-sign*digit,28);
    prev=encode?output:x;
    return output;
  });
}
const variants=[];
for(const direction of [1,-1])for(const start of [0,41]){
  const indices=Array.from({length:256},(_,i)=>mod(start+direction*179*i,256));
  assert.equal(new Set(indices).size,256);
  const key=indices.map(index=>bytes[index]);
  for(const family of ["add29","transparent28"])
    for(const projection of ["mod","scaled"])
      for(const sign of [1,-1]){
        const plain=cipher(C,key,family,projection,sign,false);
        assert.deepEqual(cipher(plain,key,family,projection,sign,true),C);
        variants.push({direction,start,family,projection,sign,ioc:ioc(plain),
          prefix:plain.slice(0,48).map(i=>corpus.translit[i]).join("")});
      }
}
assert.equal(variants.length,32);
variants.sort((a,b)=>b.ioc-a.ioc);
assert(variants[0].ioc<0.045);
const key=Array.from({length:256},(_,i)=>bytes[(179*i)%256]);
for(const family of ["add29","transparent28"]){
  const encrypted=cipher(plant,key,family,"mod",1,true);
  const decrypted=cipher(encrypted,key,family,"mod",1,false);
  assert.deepEqual(decrypted,plant);
  assert.deepEqual(cipher(decrypted,key,family,"mod",1,true),encrypted);
}
console.log(JSON.stringify({
  source:"original LP2 256-cell table and physical p53 red span",
  lowPositionDigitMissing:misses,
  indexToPrime:{primeOrdinal:41,primeValue:prime},
  table:{bytes:bytes.length,NdivisibleByPrimeSquare:true,NdivisibleByPrimeCube:false,
    radix59OriginalTableDivisibleBy179:false},
  p53:{runes:page53.indices.length,redLength:red.length,
    redNumberDivisibleBy179:true,redNumberDivisibleBy179Square:false},
  original:{runicLength:C.length,cipherIoC:ioc(C),candidateCount:variants.length,
    best:variants[0],worst:variants.at(-1)},
  independentPositive:{nativeGP:plant.length,exactRecovery:true,ioc:ioc(plant)},
  finding:"A 179-step permutation fails these 32 original direct-GP key models.",
  caveat:"The source-prime link is retrospective; exact re-encryption of a guessed key is not decipherment."
},null,2));
