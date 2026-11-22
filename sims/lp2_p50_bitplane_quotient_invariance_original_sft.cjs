'use strict';
/**
 * SFT: exact whole-book GP29 -> Latin26 quotient is invariant under every
 * lossless serialization of its sidecar, plus one source-typed 32x8 bitplane
 * transport and a 12,956-letter genuine Latin26 positive.
 *
 * This deliberately does not try the 16 plain source byte orders retired
 * by Issue #2178. The physical 32x8 layout selects the frozen *new* 8x8
 * bitplane transpose performed once on each original printed row.
 * Windows 11 / Node.js 22:
 * node sims/lp2_p50_bitplane_quotient_invariance_original_sft.cjs
 * No external packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages=gp.pages.filter(p => p.page <= 55);
const starts=new Map();
const digits=[];
for(const p of pages){starts.set(p.page,digits.length);digits.push(...p.indices);}
assert.equal(digits.length,12956);
const N=digits.length;
/** @param {number[]} a @param {bigint} base @returns {bigint} */
function fromDigits(a,base){
  let x=0n;
  for(const d of a)x=x*base+BigInt(d);
  return x;
}
/** @param {bigint} x @param {bigint} base @param {number} length */
function toDigits(x,base,length){
  const output=Array(length);
  for(let i=length-1;i>=0;i--){
    output[i]=Number(x%base);x/=base;
  }
  assert.equal(x,0n,'overflow: fixed-length digits');
  return output;
}
const X=fromDigits(digits,29n), B=26n**BigInt(N), max29=29n**BigInt(N);
const Q=X/B, R=X%B, Qmax=(max29-1n)/B;
assert.equal(Q.toString(2).length,2041);
assert.equal(Qmax.toString(2).length,2042);
assert.equal(fromDigits(toDigits(X,29n,N),29n),X);
assert.equal(Q*B+R,X);
/** @param {number[]} a */
function bitplaneTranspose(a){
  assert.equal(a.length,256);
  const out=Array(256);
  for(let r=0;r<32;r++){
    for(let bit=0;bit<8;bit++){
      let v=0;
      for(let c=0;c<8;c++)v|=((a[8*r+c]>>>bit)&1)<<c;
      out[8*r+bit]=v;
    }
  }
  return out;
}
const T=bitplaneTranspose(table.bytes);
assert.deepEqual(bitplaneTranspose(T),table.bytes);
const Qtrans=fromDigits(T,256n);
assert(Qtrans>Qmax);
assert.notEqual(Qtrans,Q);

/** @param {number[]} values @param {number} alphabetSize */
function stats(values,alphabetSize){
  const hist=Array(alphabetSize).fill(0);
  for(const v of values)hist[v]++;
  const n=values.length;
  return {n,ioc:Number((hist.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1))).toFixed(11)),
    top5:hist.slice().sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0)};
}
const latin=toDigits(R,26n,N);
const english=(read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]/g)||[]).slice(0,N)
  .map(ch=>ch.charCodeAt(0)-65);
assert.equal(english.length,N);
const nativeR=fromDigits(english,26n);
assert(nativeR<B);
// The original GP29 quotient is reused as an independently frozen lawful
// positive; its *true original* sidecar does not resemble the printed table.
const plantX=Q*B+nativeR;
assert(plantX<max29);
const plantGP=toDigits(plantX,29n,N);
assert.equal(fromDigits(plantGP,29n),plantX);
assert.deepEqual(toDigits(plantX%B,26n,N),english);
assert.equal(plantX/B,Q);

const intervals=[
  {name:'p3–p7',start:starts.get(3),end:starts.get(8)},
  {name:'p16–p21',start:starts.get(16),end:starts.get(22)}
].map(x=>({name:x.name,...stats(latin.slice(x.start,x.end),26),
  head100:latin.slice(x.start,x.start+100)
    .map(v=>String.fromCharCode(65+v)).join('')}));
// A source 8x8 bitplane operation can alter the representation of Q; it
// cannot alter the division remainder R of the fixed original X.
const bitFlipped=table.bytes.slice();bitFlipped[0]^=1;
const Tflip=bitplaneTranspose(bitFlipped);
assert.notEqual(fromDigits(Tflip,256n),Q);
assert.deepEqual(toDigits(R,26n,N),latin);
console.log(JSON.stringify({
  source:{originalGP29Runes:N,printedRows:32,printedColumns:8,
    originalGridFirst8:table.bytes.slice(0,8),
    transposedFirst8:T.slice(0,8)},
  quotient:{actualBits:Q.toString(2).length,
    maximumLegalBits:Qmax.toString(2).length,
    trueQFirst8:toDigits(Q,256n,256).slice(0,8),
    transposedCandidateBits:Qtrans.toString(2).length,
    candidateLegal:Qtrans<=Qmax,
    matchesOriginalQuotient:Qtrans===Q},
  originalLatin26:{...stats(latin,26),first160:latin.slice(0,160)
    .map(v=>String.fromCharCode(65+v)).join(''),intervals},
  nativeLatin26Control:stats(english,26),
  positive:{sourceLetters:english.length,restored:english.length,
    preservedActualQuotient:plantX/B===Q,exactGP29Roundtrip:true},
  conclusion:'A bijective sidecar packer can only represent Q=floor(X/26^N); the fixed original Latin remainder R=X%26^N cannot be changed by any packing of the quotient.'
},null,2));
console.log('PASS: entire original source, original 32x8 bit transpose, canonical remainder invariant, exact 12956-letter native-Latin positive');
