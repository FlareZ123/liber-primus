'use strict';
/**
 * Key-independent necessary condition for the 5-cipher-rune / 4-clear-rune
 * natural GP29 RSA word packing. The complete framed floral 3316 begins
 * with one visibly enlarged red F (literal F skip is historically used).
 * Dropping exactly that F gives 3315=663*5 natural packed ciphertext
 * blocks. Two independently source-linked RSA moduli are tested:
 * 1033*3301, selected by p40+p54 red title prime-weight sum 1032;
 * 3299*3301, selected by the p15 red3299 and authentic Cicada3301.
 * Every integer encoded from five ciphertext runes must be < modulus.
 * This rejects ANY private exponent and plaintext for fixed-width
 * unsalted RSA encoding without decoding or fitting a key.
 *
 * Windows Node.js 22: node sims/lp2_floral_rsa5_range_necessary_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
/** @param {string} file @returns {any} */
const read=file=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',file),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const floral=corpus.pages.slice(40,56).flatMap(p=>p.indices);
assert.equal(floral.length,3316);
assert.equal(floral[0],0); // original oversized p40 red F
assert.equal((floral.length-1)/5,663);
const red=ink.pages.filter(p=>p.page>=40&&p.page<=55)
  .flatMap(p=>(p.red_spans||[]).map(s=>[p.page,s.start,s.length]));
assert.deepEqual(red,[[40,0,8],[53,128,51],[54,0,9]]);
const sums=red.map(([p,at,n])=>corpus.pages[p].indices.slice(at,at+n)
  .reduce((s,i)=>s+corpus.prime[i],0));
assert.deepEqual(sums,[435,2262,597]);
assert.equal(sums[0]+sums[2],1032);
assert.equal(sums.reduce((s,i)=>s+i,0),3294);
const candidates=[
 {name:'red-heading-phi1033',p:1033,q:3301,e:7,d:1459543},
 {name:'p15-twin-prime-3299',p:3299,q:3301,e:7,d:3109543}
];
const BASE=29,CT_WIDTH=5,PT_WIDTH=4;
const CT_DOMAIN=BASE**CT_WIDTH,PT_DOMAIN=BASE**PT_WIDTH;
/** @param {number[]} digits */
function pack(digits){return digits.reduce((n,d)=>n*BASE+d,0)}
/** @param {number} n @param {number} width */
function unpack(n,width){
 const out=Array(width).fill(0);
 for(let i=width-1;i>=0;i--){
  out[i]=n%BASE;n=Math.floor(n/BASE);
 }
 assert.equal(n,0);return out;
}
/** @param {number} x @param {number} e @param {number} n */
function pow(x,e,n){
 let result=1;
 while(e>0){if(e%2)result=result*x%n;x=x*x%n;e=Math.floor(e/2)}
 return result;
}
/** @param {number} start @param {boolean} reverse @param {number} n */
function census(start,reverse,n){
 let blocks=0,legal=0,invalid=0,firstInvalid=null;
 for(let i=start;i+CT_WIDTH<=floral.length;i+=CT_WIDTH){
  const digits=floral.slice(i,i+CT_WIDTH);
  if(reverse)digits.reverse();
  const number=pack(digits);
  if(number<n)legal++;
  else {invalid++;if(firstInvalid===null)firstInvalid={index:i,number}}
  blocks++;
 }
 return {start,reverse,blocks,legal,invalid,firstInvalid};
}
const output=[];
for(const model of candidates){
 const n=model.p*model.q;
 const phi=(model.p-1)*(model.q-1);
 assert.equal(model.e*model.d%phi,1);
 assert.ok(n>PT_DOMAIN&&n<CT_DOMAIN);
 assert.ok(n*n<Number.MAX_SAFE_INTEGER);
 const natural=census(1,false,n),naturalReverse=census(1,true,n);
 const phases=Array.from({length:CT_WIDTH},(_,start)=>
  [census(start,false,n),census(start,true,n)]).flat();
 assert.equal(natural.blocks,663);
 assert.equal(naturalReverse.blocks,663);
 assert.deepEqual([natural.legal,natural.invalid,naturalReverse.legal,naturalReverse.invalid],
  model.p===1033?[118,545,106,557]:[349,314,338,325]);
 assert.ok(phases.every(x=>x.invalid>0));
 // Valid source-native GP four-rune positive control: encrypt 829
 // clear-GP blocks under public exponent, write as *five* GP symbols,
 // and decrypt with the exact private exponent. All packed ciphertexts
 // must be strictly < n. This does not require a hidden padding convention.
 const clear=corpus.pages[57].indices;
 const sourceNative=Array.from({length:PT_WIDTH*100},
   (_,i)=>clear[i%clear.length]);
 const testCipher=[],testClear=[];
 for(let i=0;i<sourceNative.length;i+=PT_WIDTH){
  const m=pack(sourceNative.slice(i,i+PT_WIDTH));
  assert.ok(m<n);
  const ct=pow(m,model.e,n);
  assert.ok(ct<n);
  testCipher.push(...unpack(ct,CT_WIDTH));
  const recovered=pow(ct,model.d,n);
  assert.equal(recovered,m);
  testClear.push(...unpack(recovered,PT_WIDTH));
 }
 assert.equal(testCipher.length,500);
 assert.deepEqual(testClear,sourceNative);
 assert.ok(census(1,false,n).invalid>0);
 output.push({model:model.name,p:model.p,q:model.q,n,
  phi,e:model.e,d:model.d,ctDomain:CT_DOMAIN,
  fullFloralMinusFirstRedF:floral.length-1,
  ciphertextBlocksAtMarkedStart:663,
  primary:{natural,naturalReverse},
  allFiveOffsetsAndBothOrders:phases.map(x=>({
   phase:x.start,reverse:x.reverse,blocks:x.blocks,
   legal:x.legal,invalid:x.invalid
  })),
  nativePlant:{inputPlainGP29Runes:sourceNative.length,
   outputCipherGP29Runes:testCipher.length,
   recoveredPlainGP29Runes:testClear.length,
   invalidPackedCipherBlocks:0}
 });
}
console.log(JSON.stringify({
 source:'original pp40-55 3316 GP glyphs, first oversize F, p15 prime square, floral red ink',
 originalScope:'first red F is literal header; 3315 remaining GP glyphs =663 complete 5-rune ciphertext blocks',
 result:output,
 decision:'Direct unpadded five-digit GP29 RSA ciphertext encoding is arithmetically impossible for either source-numbered modulus at every original phase and digit order. No plaintext is recovered.'
},null,2));
