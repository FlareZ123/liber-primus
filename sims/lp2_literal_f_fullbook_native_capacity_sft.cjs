'use strict';

/**
 * A necessary plaintext-count gate for treating every unsolved LP2
 * ciphertext F rune as a literal plaintext F interrupter.
 * Run: node sims/lp2_literal_f_fullbook_native_capacity_sft.cjs
 *
 * GP-native controls use the authenticated solved-LP1 orthography encoder.
 * This gate leaves non-F characters, key clock and every cipher key free.
 * @typedef {{name:string,sourceLength:number,windows:number,minF:number,maxF:number,maxAt:number}} Control
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page <= 55);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const n = original.length;
const fOriginal = original.filter(x => x === 0).length;
assert.equal(fOriginal,458);

/**
 * Exact extrema over all contiguous source-native GP windows of length n.
 * @param {number[]} gp @param {number} n
 * @returns {{minF:number,maxF:number,maxAt:number,windows:number}}
 */
function extrema(gp,n) {
  assert(gp.length >= n);
  let count=0,minF=Infinity,maxF=-1,maxAt=-1;
  for(let i=0;i<gp.length;i++) {
    if(gp[i]===0)count++;
    if(i>=n && gp[i-n]===0)count--;
    if(i>=n-1) {
      minF=Math.min(minF,count);
      if(count>maxF){maxF=count;maxAt=i-n+1;}
    }
  }
  return {minF,maxF,maxAt,windows:gp.length-n+1};
}
/** @type {Control[]} */
const observations=[];
for(const [name,filename,wantedLength,wantedMaximum] of [
  ['Shakespeare','resources/control/shakespeare_first300k.txt',217106,321],
  ['Gibran','resources/control/gibran_prophet_58585.txt',62492,390],
  ['Emerson','resources/control/emerson_essays_2944.txt',321327,432],
]) {
  const native=encodeSourceNativeGP(read(filename));
  assert.equal(native.length,wantedLength);
  const r=extrema(native,n);
  assert.equal(r.maxF,wantedMaximum);
  assert(r.maxF < fOriginal, name + ': possible original literal-F count');
  observations.push({name,sourceLength:native.length,...r});
}
// Blind positive: any unknown non-F bijection may change all other letters,
// while the source/native F rune is transmitted exactly.
const native=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')).slice(0,n);
assert.equal(native.length,n);
const encrypted=native.map((x,i)=>x===0?0:1+(x*13 + i*7)%28);
assert.equal(encrypted.length,n);
assert.equal(encrypted.filter(x=>x===0).length,native.filter(x=>x===0).length);
assert.equal(extrema(encrypted,n).maxF,extrema(native,n).maxF);
assert.equal(encrypted.filter(x=>x===0).length,322);
console.log(JSON.stringify({
  hypothesis:'every LP2 ciphertext F is an unchanged plaintext F',
  original:{runes:n,ciphertextLiteralFRequired:fOriginal},
  controls:observations,
  finiteSourceVerdict:'all source-native windows violate required literal-F capacity',
  limitations:'does not exclude novel F-rich text, ciphertext-dependent F, other languages, or secret F relocation'
},null,2));
