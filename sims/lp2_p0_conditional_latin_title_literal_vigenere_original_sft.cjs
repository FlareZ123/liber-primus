'use strict';

/**
 * Original-source p0 conditional Latin title as a direct repeating GP29 key.
 * One file, Node.js 22, read-only, finite two-target/two-sign test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const key = [15,18,5,1,18,9,23,10,4,24,16,10,3];
const title = corpus.pages[0].indices.slice(0,13);
assert.deepEqual(title, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(corpus.pages[0].indices.length,262);
assert.equal(corpus.pages[3].indices.length,217);
assert.equal(corpus.pages[57].indices.length,95);
const native = corpus.pages[57].indices;
/**
 * @param {number[]} data original GP29 indices
 * @returns {number} index of coincidence
 */
function ioc(data) {
  const hist = Array(29).fill(0);
  for (const value of data) hist[value]++;
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(data.length*(data.length-1));
}
/**
 * @param {number[]} cipher original source GP29 values
 * @param {number} sign +1/-1
 * @returns {number[]} GP29 decryption
 */
function decode(cipher,sign) {
  return cipher.map((value,i)=>(value + sign*key[i%13] + 29)%29);
}
/**
 * @param {number[]} cipher
 * @param {number} sign
 * @returns {{local:number,rune:number,phase:number,consumed:number,bypassed:number}|null}
 */
function firstTransparentFViolation(cipher,sign) {
  let consumed=0,bypassed=0;
  for(let local=0;local<cipher.length;local++){
    const rune=cipher[local];
    if(rune===0){bypassed++;continue;}
    const phase=consumed%key.length;
    if((rune+sign*key[phase]+29)%29===0)
      return {local,rune,phase,consumed,bypassed};
    consumed++;
  }
  return null;
}
const targets = [
  ['p0_black_body_249',corpus.pages[0].indices.slice(13)],
  ['p3_original_217',corpus.pages[3].indices]
];
const expected = {
  'p0_black_body_249': {
    '-1': {ioc:0.033650731960098455,violation:{local:32,rune:9,phase:5,consumed:31,bypassed:1}},
    '1': {ioc:0.034233709029667055,violation:{local:1,rune:11,phase:1,consumed:1,bypassed:0}}
  },
  'p3_original_217': {
    '-1': {ioc:0.034988905956647894,violation:{local:10,rune:16,phase:10,consumed:10,bypassed:0}},
    '1': {ioc:0.03234340331114525,violation:{local:1,rune:11,phase:1,consumed:1,bypassed:0}}
  }
};
const observations=[];
for(const [name,actual] of targets){
  for(const sign of [-1,1]){
    const clear=decode(actual,sign);
    assert.deepEqual(clear.map((x,i)=>(x-sign*key[i%13]+29)%29),actual);
    const measured=ioc(clear);
    assert(Math.abs(measured-expected[name][sign].ioc)<1e-13);
    const violation=firstTransparentFViolation(actual,sign);
    assert.deepEqual(violation,expected[name][sign].violation);
    observations.push({
      target:name,sign,ioc:measured,first40:clear.slice(0,40).map(x=>corpus.translit[x]).join(' '),
      firstIllegalOriginalTransparentF:violation
    });
  }
}
assert.equal(native.length,95);
for(const sign of [-1,1]){
 const planted=native.map((value,i)=>(value-sign*key[i%13]+29)%29);
 assert.deepEqual(decode(planted,sign),native);
}
console.log(JSON.stringify({
  conditionalTitleKey:'SECUENDIRATIO',originalTitleGP:title,key,
  originalP0BodyIoC:ioc(targets[0][1]),positiveGP95BothSigns:true,observations,
  result:'No native GP plaintext; literal transparent-F variant impossible before rune33 of p0 body and rune11 of p3'
},null,2));
