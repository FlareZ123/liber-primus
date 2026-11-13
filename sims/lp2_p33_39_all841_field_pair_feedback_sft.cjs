'use strict';
/**
 * Original LP2 pp33–39: all 841 first-order GF(29²) pair-feedback slopes.
 * Standalone Windows/Node22 SFT: node sims/lp2_p33_39_all841_field_pair_feedback_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages = corpus.pages.filter(p=>p.page>=33&&p.page<=39);
assert.deepEqual(pages.map(p=>p.indices.length),
  [214,261,271,238,228,228,240]);
const original = pages.flatMap(p=>p.indices);
assert.equal(original.length,1680);
const mod = x => (x%29+29)%29;
/** @typedef {[number,number]} Field */
/** @param {Field} x @param {Field} y @returns {Field} */
const mul = ([a,b],[c,d]) => [
  mod(a*c+8*b*d),mod(a*d+b*c+3*b*d)
];
/** @param {Field} x @param {Field} y @returns {Field} */
const add = ([a,b],[c,d])=>[mod(a+c),mod(b+d)];
/** @param {Field} x @param {Field} y @returns {Field} */
const subtract = ([a,b],[c,d])=>[mod(a-c),mod(b-d)];
/** 
 * Cipher feedback: C_i=P_i+alpha*C_(i-1), C_(-1)=0.
 * Plain feedback: C_i=P_i+alpha*P_(i-1), P_(-1)=0.
 * @param {number[]} input @param {Field} alpha @param {"cipher"|"plain"} mode
 * @returns {number[]}
 */
function decrypt(input,alpha,mode) {
  assert.equal(input.length,1680);
  /** @type {Field} */
  let previousCipher=[0,0],previousPlain=[0,0];
  const result=[];
  for(let i=0;i<input.length;i+=2) {
    const C=/** @type {Field} */ ([input[i],input[i+1]]);
    const P=subtract(C,mul(alpha,mode==='cipher'?previousCipher:previousPlain));
    result.push(...P);
    previousCipher=C;previousPlain=P;
  }
  return result;
}
/** @param {number[]} input @param {Field} alpha
 * @param {"cipher"|"plain"} mode @returns {number[]} */
function encrypt(input,alpha,mode) {
  assert.equal(input.length,1680);
  /** @type {Field} */
  let previousCipher=[0,0],previousPlain=[0,0];
  const result=[];
  for(let i=0;i<input.length;i+=2){
    const P=/** @type {Field} */ ([input[i],input[i+1]]);
    const C=add(P,mul(alpha,mode==='cipher'?previousCipher:previousPlain));
    result.push(...C);previousCipher=C;previousPlain=P;
  }
  return result;
}
/** @param {number[]} values */
function ioc29(values) {
  const frequencies=new Uint32Array(29);
  for(const value of values)frequencies[value]++;
  let same=0;
  for(const frequency of frequencies)same+=frequency*(frequency-1);
  return 29*same/(values.length*(values.length-1));
}
const near=(x,y)=>assert(Math.abs(x-y)<1e-12,x+' differs from '+y);
const solvedP57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(solvedP57.length,95);
const plant=Array.from({length:1680},(_,i)=>solvedP57[i%solvedP57.length]);
const all={};
for(const mode of ['cipher','plain']) {
  const scored=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const alpha=/** @type {Field} */ ([a,b]);
    scored.push({a,b,ioc29:ioc29(decrypt(original,alpha,mode))});
  }
  scored.sort((x,y)=>y.ioc29-x.ioc29);
  assert.equal(scored.length,841);
  assert.equal(scored.filter(item=>item.ioc29>=1.15).length,0);
  const direct=scored.find(item=>item.a===19&&item.b===13);
  const sourceG=/** @type {Field} */ ([19,13]);
  assert.deepEqual(encrypt(decrypt(original,sourceG,mode),sourceG,mode),original);
  const fake=encrypt(plant,sourceG,mode);
  assert.deepEqual(decrypt(fake,sourceG,mode),plant);
  assert(ioc29(plant)>1.8);
  all[mode]={
    min:scored.at(-1).ioc29,max:scored[0].ioc29,
    argmax:[scored[0].a,scored[0].b],median:scored[420].ioc29,
    gSourceIoC29:direct.ioc29,above115:0,
    sourceOriginalRoundtrip:1680,nativeControlRoundtrip:1680
  };
}
near(ioc29(original),0.9964406250886297);
near(all.cipher.min,0.9891616324909952);
near(all.cipher.max,1.0179280467398395);
near(all.cipher.gSourceIoC29,1.00092316855271);
near(all.plain.min,0.9887092657193908);
near(all.plain.max,1.0213002354008907);
near(all.plain.gSourceIoC29,0.9949807141439065);
console.log(JSON.stringify({status:'PASS',
  source:'original LP2 pp33-39, 840 GF841 pairs',
  p3Field:'u^2=3u+8',
  originalIoC29:ioc29(original),
  testedFieldSlopes:841,
  all},null,2));
