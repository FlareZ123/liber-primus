"use strict";

/**
 * Original-source red-prime quotient 15/78 -> exact known p56 Euler-prime
 * totient inverse, restricted to p57-selected p55 word interiors.
 * No search, fitted phase, key, reordering or unseen rune correction.
 * Windows11 Node22 read-only CommonJS standalone test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const load = p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=load("resources/liber-primus/lp2-corpus.json");
const markings=load("resources/liber-primus/lp2-ink-annotations.json");
const mod=x=>(x%29+29)%29;
const primes=[];
for(let n=2;primes.length<200;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++) if(n%d===0){prime=false;break}
  if(prime) primes.push(n);
}
const page40=db.pages[40].indices,page53=db.pages[53].indices;
const red40=markings.pages.find(p=>p.page===40).red_spans;
const red53=markings.pages.find(p=>p.page===53).red_spans;
assert.deepEqual(red40.map(s=>[s.start,s.length]),[[0,8]]);
assert.deepEqual(red53.map(s=>[s.start,s.length]),[[128,51]]);
const sumPrime=a=>a.reduce((s,v)=>s+db.prime[v],0);
const start15=sumPrime(page40.slice(0,8))/29;
const start78=sumPrime(page53.slice(128))/29;
assert.deepEqual([start15,start78],[15,78]);
const whole=db.pages[55].indices;
const lengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
let offset=0,inner=[],starts=[];
for(const n of lengths){
  starts.push(inner.length);
  inner.push(...whole.slice(offset+1,offset+n-1));
  offset+=n;
}
assert.equal(offset,76);
assert.equal(inner.length,43);
assert.deepEqual(inner.map((v,i)=>v===0?i:-1).filter(i=>i>=0),[11]);
/**
 * Reversible canonical p56 prime-totient GP29 law. For literalF, a source
 * ciphertext-F is emitted as unchanged F without consuming prime state.
 * @param {number[]} sequence @param {number} initial
 * @param {boolean} literalF @param {boolean} decrypt
 * @returns {number[]}
 */
function transform(sequence,initial,literalF,decrypt){
  let cursor=initial;
  return sequence.map(v=>{
    if(literalF&&v===0){
      if(decrypt)return 0;
      // This contract is applied to planted native positives with F held
      // at the same already selected compacted source position.
    }
    const shift=primes[cursor++]-1;
    return mod(v+(decrypt?-shift:shift));
  });
}
/**
 * Preserve exactly the original known literal ciphertext-F marker at
 * compacted offset11 regardless of the input at that marker.
 * @param {number[]} values @param {number} start
 * @param {boolean} skip @param {boolean} decrypt
 * @returns {number[]}
 */
function exact(values,start,skip,decrypt){
  let k=start;
  return values.map((v,i)=>{
    if(skip&&i===11){
      assert.equal(v,0);
      return v;
    }
    const key=primes[k++]-1;
    return mod(v+(decrypt?-key:key));
  });
}
/** @param {number[]} a */
function ioc(a){
  const f=new Uint16Array(29);
  for(const c of a)f[c]++;
  return [...f].reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const show=a=>a.map(v=>db.translit[v]).join(" ");
const result=[];
for(const start of [start15,start78]){
 for(const skip of [false,true]){
  const plain=exact(inner,start,skip,true);
  assert.deepEqual(exact(plain,start,skip,false),inner);
  const native=db.pages[57].indices.slice(0,43);
  if(skip)native[11]=0;
  const plant=exact(native,start,skip,false);
  assert.deepEqual(exact(plant,start,skip,true),native);
  const longword=plain.slice(starts[7],starts[8]);
  assert.equal(longword.length,11);
  const threeConsecutiveH=longword.some((c,i)=>i+2<longword.length
    &&c===8&&longword[i+1]===8&&longword[i+2]===8);
  result.push({
    sourcePrimeStart:start,literalF:skip,
    compactedOriginalRunes:43,originalIoC:ioc(plain),
    decryptedOriginal:show(plain),
    originalThirteenRuneWordInner11:show(longword),
    containsTripleHInside13RuneWord:threeConsecutiveH,
    nativePlantedRecovered:43,exactOriginalReplay:43
  });
 }
}
assert(Math.max(...result.map(x=>x.originalIoC))<0.055);
assert(result.some(x=>x.sourcePrimeStart===78&&x.literalF
  &&x.containsTripleHInside13RuneWord));
console.log(JSON.stringify({
  model:"Source red normalized GP prime sums15/78 select starts for authentic solved p56 prime-totient law on 43 source-printed p55 strict interiors, sign-; one source-F consumes/does not consume",
  sourceStarts:[start15,start78],
  p55Inner:inner.length,p55Whole:whole.length,p55OriginalFCompact:11,
  result,
  interpretation:"All four strict source-parameter inverses mechanically reversible and positive. No continuous native-GP plaintext or true unknown key recovered; high one-candidate 0.052 IoC is defeated by original 13-rune word's triple H among its strict interiors. No phase or source rule extended."
},null,2));