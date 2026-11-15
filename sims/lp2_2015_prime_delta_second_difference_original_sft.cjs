'use strict';

/**
 * Original 4-5 February 2015 participant-selected double difference:
 * shift the physical p0-2 tape by consecutive primes, first-difference it,
 * then apply the explicitly mentioned additional difference. The last step
 * turns the previous 40 adjacent equalities into exactly 40 literal F=0
 * outputs, explaining the participant's second-day wording.
 *
 * A historical participant operation is not authenticated Cicada plaintext.
 * Node.js 22, CommonJS, source-exact Windows SFT, no external dependencies.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(repo,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const mod=x=>(x%29+29)%29;

/** @param {number} length @returns {number[]} */
function primes(length){
  const result=[];
  for(let n=2;result.length<length;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)result.push(n);
  }
  return result;
}
/** @param {number[]} source @param {number[]} prime */
function decode(source,prime){
  let old=mod(-prime[0]);
  const first=source.map((x,i)=>{
    const shifted=mod(x-prime[i+1]);
    const value=mod(shifted-old);
    old=shifted;
    return value;
  });
  const second=first.map((x,i)=>mod(x-(i?first[i-1]:0)));
  return {first,second};
}
/** @param {number[]} value @param {number[]} prime */
function encode(value,prime){
  let previousFirst=0,previousShift=mod(-prime[0]);
  return value.map((x,i)=>{
    previousFirst=mod(previousFirst+x);
    previousShift=mod(previousShift+previousFirst);
    return mod(previousShift+prime[i+1]);
  });
}
/** @param {number[]} sequence */
function ioc(sequence){
  const frequencies=Array(29).fill(0);
  for(const n of sequence)frequencies[n]++;
  return frequencies.reduce((s,v)=>s+v*(v-1),0)/(sequence.length*(sequence.length-1));
}
/** @param {number[]} sequence */
function equalPairs(sequence){
  return sequence.slice(1).filter((x,i)=>x===sequence[i]).length;
}
const original=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
assert.equal(original.length,729);
const prime=primes(730);
const {first,second}=decode(original,prime);
const firstPrefix=first.map(x=>corpus.translit[x]).join('');
assert(firstPrefix.startsWith('XLHIUNGIANNSEAJOEOEBIAWNRTHTEACTGCTOESNGNEAGIRFSFWJTJTHN'));
assert.equal(equalPairs(original),4);
assert.equal(equalPairs(first),40);
assert.equal(first.filter(x=>x===0).length,21);
assert.equal(second.filter(x=>x===0).length,40);
assert.equal(equalPairs(second),21);
assert.equal(ioc(first),0.03450459006014561);
assert.equal(ioc(second),0.03480230332082184);
assert.deepEqual(encode(second,prime),original);

const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const nativePlant=Array.from({length:729},(_,i)=>p57[i%p57.length]);
const enc=encode(nativePlant,prime);
assert.deepEqual(decode(enc,prime).second,nativePlant);
assert.equal(ioc(p57),0.06270996640537514);

const digest=crypto.createHash('sha256').update(Buffer.from(original)).digest('hex');
console.log('SOURCE ORIGINAL 2015 Feb04 L89874/L89901, Feb05 L90119-L90124: first derived runes followed by extra differencing');
console.log(JSON.stringify({
  chapterPages:[0,1,2],originalCipherRunes:original.length,
  originalIndicesSha256:digest,
  originalFirst45Gp:corpus.translit.slice(0,0).join('')+first.slice(0,45).map(x=>corpus.translit[x]).join(' '),
  sourcePrintedFirstStepPrefix:firstPrefix.slice(0,95),
  firstDifference:{adjacentEquals:equalPairs(first),literalF:21,ioc:ioc(first)},
  historicallyExplicitExtraDifference:{
    startDMinusZeroConvention:true,
    literalF:second.filter(x=>x===0).length,
    adjacentEquals:equalPairs(second),
    ioc:ioc(second),
    first32GpLabels:second.slice(0,32).map(x=>corpus.translit[x]).join(' ')
  },
  originalExactForwardRecovered:true,
  nativeP57Plaintext:{length:p57.length,ioc:ioc(p57)},
  full729GpP57PlantRecovered:true,
  interpretation:'Second difference is a dated participant diagnostic, exactly explains the 40 second-pass zero/F values; still near-uniform and no original plaintext or further source key.'
},null,2));
