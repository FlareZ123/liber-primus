'use strict';
/**
 * Original LP2 source-selected 1033/3301 quadratic-character bit receivers.
 * Windows 11 / Node 22 / CommonJS, read-only SFT, no network, no dependencies.
 * Source: printed p33–39 cuneiform 1033/3301; GP29 prime alphabet.
 * Exact original 1,589-runic section and 12,956 unknown-book original control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const prime = [
  2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,
  59,61,67,71,73,79,83,89,97,101,103,107,109
];
assert.equal(prime.length,29);
const unknown = corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const full = unknown.map(p=>p.indices);
const section = corpus.pages.filter(p=>p.page>=33&&p.page<=39)
  .map((p,i)=>i===0?p.indices.slice(91):p.indices);
assert.equal(full.length,55);
assert.equal(full.flat().length,12956);
assert.equal(section.length,7);
assert.equal(section.flat().length,1589);

/** Euler's criterion, valid since original 1033 and 3301 are primes.
 * @param {number} a @param {number} exponent @param {number} modulus
 */
function modpow(a,exponent,modulus) {
  let result=1;
  while(exponent) {
    if(exponent%2)result=result*a%modulus;
    a=a*a%modulus;exponent=Math.floor(exponent/2);
  }
  return result;
}
const bit=prime.map(p=>[
  +(modpow(p,516,1033)===1),
  +(modpow(p,1650,3301)===1)
]);
assert.deepEqual(bit[0],[1,0]);
assert.deepEqual(bit[28],[0,1]);
const pairClass=bit.map(v=>2*v[0]+v[1]);
const sizes=Array(4).fill(0);
for(const k of pairClass)sizes[k]++;
assert.deepEqual(sizes,[6,11,8,4]);
const counts=Array(4).fill(0);
for(const r of full.flat())counts[pairClass[r]]++;
assert.deepEqual(counts,[2693,4911,3553,1799]);
const countN=counts.reduce((a,b)=>a+b,0);
const uniform=countN/4;
const chiBalanced=counts.reduce((s,x)=>s+(x-uniform)**2/uniform,0);
const expected=sizes.map(n=>n*countN/29);
const chiRune=counts.reduce((s,x,i)=>s+(x-expected[i])**2/expected[i],0);
assert(Math.abs(chiBalanced-1625.7783266440258)<1e-7);
assert(Math.abs(chiRune-0.26440393827125686)<1e-7);
console.log('SOURCE GP29 Legendre class cardinalities='+JSON.stringify(sizes));
console.log('ORIGINAL 12956 two-bit class counts='+JSON.stringify(counts)+
  ' chi2-vs-balanced='+chiBalanced.toFixed(6)+
  ' chi2-vs-uniform-rune='+chiRune.toFixed(6));

/**
 * All declared source-typed clocks and byte serialization variants.
 * @param {number[][]} chunks
 * @param {'global'|'page'} clock
 * @param {'one1033'|'one3301'|'both'} mode
 * @param {0|1} swap
 * @param {number} mask
 * @param {0|1} order
 * @param {number} phase
 * @returns {number[]}
 */
function decode(chunks,clock,mode,swap,mask,order,phase) {
  const native=chunks.map(chunk=>chunk.flatMap(r=>{
    const b=bit[r];
    const values=mode==='one1033'?[b[0]]:
      mode==='one3301'?[b[1]]:
        swap?[b[1],b[0]]:[b[0],b[1]];
    return values.map((value,j)=>value^((mask>>>j)&1));
  }));
  const streams=clock==='global'?[native.flat()]:native;
  return streams.flatMap(stream=>{
    const out=[];
    for(let i=phase;i+7<stream.length;i+=8) {
      let value=0;
      for(let k=0;k<8;k++) {
        if(order===0)value=(value<<1)|stream[i+k];
        else value|=stream[i+k]<<k;
      }
      out.push(value);
    }
    return out;
  });
}

/** @param {number[]} bytes */
function score(bytes) {
  let printable=0,longest=0,current=0;
  for(const b of bytes){
    if(b>=32&&b<=126){printable++;current++;longest=Math.max(longest,current);}
    else current=0;
  }
  return {bytes:bytes.length,printable,
    ratio:printable/bytes.length,longest,
    head:Buffer.from(bytes.slice(0,16)).toString('hex')};
}
/** @param {number[][]} chunks @param {string} name */
function audit(chunks,name) {
  const results=[];
  for(const clock of ['global','page']) {
    for(const mode of ['one1033','one3301','both']){
      for(const swap of mode==='both'?[0,1]:[0]){
        for(const mask of mode==='both'?[0,1,2,3]:[0,1]){
          for(const order of [0,1]){
            for(let phase=0;phase<8;phase++){
              const state={scope:name,clock,mode,swap,mask,order,phase};
              results.push({...state,...score(decode(
                chunks,clock,mode,swap,mask,order,phase))});
            }
          }
        }
      }
    }
  }
  assert.equal(results.length,384);
  const highest=results.reduce((a,b)=>b.ratio>a.ratio?b:a);
  const longest=results.reduce((a,b)=>b.longest>a.longest?b:a);
  assert(highest.ratio<0.51 && longest.longest<=16);
  console.log(name.toUpperCase()+' 384 fixed candidate bit receivers');
  console.log('MAX printable ratio '+JSON.stringify(highest));
  console.log('MAX printable contiguous run '+JSON.stringify(longest));
  return results;
}
const primary=audit(section,'p33-p39');
const holdout=audit(full,'whole-book');
assert.equal(primary.length+holdout.length,768);


const magic=[
  ['bzip2','425a68'], ['gzip','1f8b08'], ['zip','504b0304'],
  ['png','89504e470d0a1a0a'], ['pdf','255044462d']
];
const matchedHeaders=[];
for(const trial of [...primary,...holdout]){
  for(const [name,head] of magic){
    if(trial.head.startsWith(head))matchedHeaders.push({name,...trial});
  }
}
assert.deepEqual(matchedHeaders,[],
  'a source-marked binary file header would be a nonrandom candidate to follow');
console.log('HEADER original candidate scope=768 standard 2014 BZip2/Gzip/ZIP/PNG/PDF starts: none');

// Source-authentic readable-payload positive:
// encode genuine solved p57's opening phrase, repeatedly, into 3239 ASCII
// bytes, then choose a rune of the appropriate Legendre class for each
// consecutive 2-bit symbol while rejecting identical consecutive runes.
const authentic='LIKE THE INSTAR TUNNELING TO THE SURFACE, WE MUST SHED OUR OWN CIRCUMFERENCES. ';
const planted=Buffer.from(authentic.repeat(100).slice(0,3239),'ascii');
assert.equal(planted.length,3239);
const classes=Array.from({length:4},()=>[]);
for(let rune=0;rune<29;rune++)classes[pairClass[rune]].push(rune);
const encoded=[];
for(const byte of planted) {
  for(let shift=6;shift>=0;shift-=2){
    const cls=(byte>>>shift)&3;
    const choices=classes[cls];
    let rune=choices[encoded.length%choices.length];
    if(encoded.length&&rune===encoded[encoded.length-1])
      rune=choices[(encoded.length+1)%choices.length];
    assert.equal(pairClass[rune],cls);
    if(encoded.length)assert.notEqual(rune,encoded[encoded.length-1]);
    encoded.push(rune);
  }
}
assert.equal(encoded.length,12956);
const readback=Buffer.from(decode([encoded],'global','both',0,0,0,0));
assert.deepEqual(readback,planted);
assert.equal(score([...readback]).ratio,1);
console.log('POSITIVE 3239/3239 authentic-parable-derived ASCII bytes recovered; 12956 carrier runes, 0 unwanted doublets');
console.log('PASS 768 original section/full-book 1033/3301 Legendre receivers, source counts, exact native ASCII plant');
console.log('RESULT: no directly legible unknown-page binary message, full text, or authored receiver operation');
