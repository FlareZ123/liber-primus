'use strict';

/**
 * Original 2014 cuneiform chapter: the five red-numbered LP2 sources
 * yield the unique 5-of-5 GF29 Shamir secret for their common 91 runes.
 * Test that source-fixed secret as a direct additive pad against the
 * physically marked p33 first-red-heading→second-red-heading 91-rune span.
 *
 * Source-original, no parameters fitted from ciphertext, no external deps.
 * Windows 11, Node.js 22, CommonJS read-only SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p=corpus.pages.map(page=>page.indices);
const mod=x=>(x%29+29)%29;
const N=91;
const sections=[
  p[36].slice(99,238),
  p[37].slice(0,91),
  p[37].slice(91,189),
  p[37].slice(189,228).concat(p[38].slice(0,57)),
  p[38].slice(57,186)
];
assert.deepEqual(sections.map(s=>s.length),[139,91,98,96,129]);
const weights=[5,-10,10,-5,1]; // f(0) at x=1,2,3,4,5 over GF29
assert.equal(mod(weights.reduce((sum,v)=>sum+v,0)),1);
const secret=Array.from({length:N},(_,i)=>
  mod(sections.reduce((sum,section,j)=>sum+weights[j]*section[i],0)));
assert.equal(secret.length,91);
assert.equal(p[33].length,214);
const redHeading2Offset=91; // independently fixed p33 original ink
const receiver=p[33].slice(0,redHeading2Offset);
assert.equal(receiver.length,N);
assert.deepEqual(receiver.slice(0,10),p[33].slice(0,10));
assert.deepEqual(receiver.slice(10),p[33].slice(10,91));
const translit=x=>x.map(v=>corpus.translit[v]).join('');
const ioc=x=>{
 const f=Array(29).fill(0);
 for(const v of x)f[v]++;
 return f.reduce((sum,n)=>sum+n*(n-1),0)/(x.length*(x.length-1));
};
const outputs={};
const plant=p[57].slice(0,91);
assert.equal(plant.length,N);
for(const sign of [-1,1]){
 const decoded=receiver.map((v,i)=>mod(v+sign*secret[i]));
 assert.deepEqual(decoded.map((v,i)=>mod(v-sign*secret[i])),receiver);
 const synthetic=plant.map((v,i)=>mod(v-sign*secret[i]));
 assert.deepEqual(synthetic.map((v,i)=>mod(v+sign*secret[i])),plant);
 outputs[sign===-1?'minus':'plus']={length:N,ioc:ioc(decoded),
   first60GP:translit(decoded.slice(0,60)),
   exactOriginalReencryption:91,solvedNativeGPPlantRecovery:91};
}
const output={
 source:'Five printed numbered sources 139/91/98/96/129, GF29 5-of-5 Shamir at x=0, direct key to first p33 red-heading span of exactly 91 original runes',
 keyIoC:ioc(secret),originalReceiverIoC:ioc(receiver),
 originalResults:outputs,
 sourceChoice:'p33 first 91 rune positions before second red heading, no scanned offsets or fitted parameters',
 decision:'Neither sign produces native GP English; no author instruction selects this two-step cross-page pad. Does not exclude Shamir key on a different explicitly selected recipient.'
};
assert.ok(output.originalResults.minus.ioc<0.04&&output.originalResults.plus.ioc<0.04);
assert.equal(output.originalResults.minus.ioc,0.03199023199023199);
assert.equal(output.originalResults.plus.ioc,0.0315018315018315);
console.log(JSON.stringify(output,null,2));
console.log('PASS: source-frozen five-share secret against exactly marked original 91-rune p33 receiver; synthetic native-GP recovery.');
