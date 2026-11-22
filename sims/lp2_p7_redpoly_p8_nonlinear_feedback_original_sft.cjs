'use strict';
/** Source-selected p7 red polynomial -> p8 255-rune reversible feedback gate. Windows Node22. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p8=corpus.pages[8].indices,p57=corpus.pages[57].indices;
const mod=v=>((v%29)+29)%29;
const P=x=>mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
assert.equal(P(3),3);assert.equal(P(4),4);
assert.equal(mod(26+16*4+45*4*4+8*4*4*4),17);
assert.equal(p8.length,255);assert.equal(p57.length,95);
/**
 * Inverse of C_i=P_i-sign*P(prev), with prev either preceding ciphertext
 * or preceding plaintext, and external seed 3,4 or17.
 * @param {number[]} c @param {number} seed @param {number} sign
 * @param {'cipher'|'plain'} state
 */
function decrypt(c,seed,sign,state){
  const out=[];let prev=seed;
  for(const z of c){const v=mod(z+sign*P(prev));out.push(v);prev=state==='cipher'?z:v;}
  return out;
}
/** Exact forward inverse of decrypt. */
function encrypt(plain,seed,sign,state){
  const out=[];let prev=seed;
  for(const v of plain){const z=mod(v-sign*P(prev));out.push(z);prev=state==='cipher'?z:v;}
  return out;
}
const ioc=s=>{const counts=Array(29).fill(0);s.forEach(x=>counts[x]++);return counts.reduce((a,x)=>a+x*(x-1),0)/(s.length*(s.length-1));};
for(const seed of [3,4,17])for(const sign of [-1,1])for(const state of ['cipher','plain']){
  const output=decrypt(p8,seed,sign,state);
  assert.deepEqual(encrypt(output,seed,sign,state),p8);
  const planted=encrypt(p57,seed,sign,state);
  assert.deepEqual(decrypt(planted,seed,sign,state),p57);
  const h=ioc(output),normal=p57.length>=2?ioc(p57):NaN;
  assert(h<0.038);
  console.log(JSON.stringify({seed,sign,state,original255IoC:Number(h.toFixed(9)),authenticP57IoC:Number(normal.toFixed(9)),first20:output.slice(0,20).map(x=>corpus.translit[x]).join(' '),sourceReplay:255,plantedRecovered:p57.length}));
}
console.log('PASS: 12 source-polynomial feedback original inverses, complete source replay, twelve authentic-native p57 controls');
