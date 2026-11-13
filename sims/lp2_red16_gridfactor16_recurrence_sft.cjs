/**
 * GP29 red-16 chapter-heading seeded LFSR from the original table's degree-16 factor.
 * Original-cipher bounded test with solved-p57 source-native planted positives.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(base,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const atlas = JSON.parse(fs.readFileSync(path.join(base,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(base,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const mod = (v) => ((v%29)+29)%29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
  const result=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    result[i+j]=mod(result[i+j]+a[i]*b[j]);
  return result;
}
/** @param {number[]} coefficients @param {number[]} factor @returns {number[]} */
function remainder(coefficients,factor) {
  const a=coefficients.slice();
  assert.equal(factor[factor.length-1],1);
  for(let i=a.length-1;i>=factor.length-1;i--) {
    const q=a[i];
    for(let j=0;j<factor.length;j++)a[i-factor.length+1+j]=mod(a[i-factor.length+1+j]-q*factor[j]);
  }
  return a.slice(0,factor.length-1);
}
const factors=[[25,10,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]];
const F=factors.reduce(multiply,[1]);
assert.deepEqual(F,[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]);
assert.equal(grid.bytes.length,256);
assert.deepEqual(remainder(grid.bytes.map(b=>b%29).reverse(),F),Array(16).fill(0));
const reciprocal=F.slice().reverse().map(x=>mod(x*9));
assert.equal(reciprocal[16],1);

/** @param {number[]} seed @param {number} length @param {number[]} polynomial @returns {number[]} */
function keystream(seed,length,polynomial) {
  assert.equal(seed.length,16);
  const values=seed.slice();
  for(let i=16;i<length+16;i++) {
    let sum=0;
    for(let j=0;j<16;j++)sum+=polynomial[j]*values[i-16+j];
    values[i]=mod(-sum);
  }
  return values.slice(16);
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts=Array(29).fill(0);
  for(const glyph of seq)counts[glyph]++;
  return counts.reduce((n,count)=>n+count*(count-1),0)/(seq.length*(seq.length-1));
}
function cipher(original,key,sign) {
  return original.map((r,i)=>mod(r+sign*key[i]));
}
const expected={
 '3-forward--1':0.034510864444151294,'3-forward-1':0.03424859757897845,
 '3-reciprocal--1':0.034352247956831186,'3-reciprocal-1':0.03428157724465886,
 '23-forward--1':0.03424709123704188,'23-forward-1':0.03445323184872451,
 '23-reciprocal--1':0.034306554875027255,'23-reciprocal-1':0.03489326276981626
};
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const findings=[];
for(const [first,last] of [[3,7],[23,26]]) {
  const firstPage=corpus.pages.find(p=>p.page===first);
  const red=atlas.pages.find(p=>p.page===first).red_spans.filter(s=>s.length===16&&s.start===0);
  assert.equal(red.length,1);
  assert.equal(firstPage.indices.slice(0,16).map(i=>corpus.runes[i]).join(''),red[0].runes);
  const all=corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices);
  const original=all.slice(16),seed=all.slice(0,16);
  assert.equal(original.length,first===3?1129:1005);
  const nativePlant=Array.from({length:original.length},(_,i)=>native[i%native.length]);
  for(const [name,poly] of [['forward',F],['reciprocal',reciprocal]]) {
    const key=keystream(seed,original.length,poly);
    for(const sign of [-1,1]) {
      const recovered=cipher(original,key,sign);
      assert.deepEqual(cipher(recovered,key,-sign),original);
      assert.deepEqual(cipher(cipher(nativePlant,key,-sign),key,sign),nativePlant);
      const score=ioc(recovered);
      assert(Math.abs(score-expected[first+'-'+name+'-'+sign])<1e-12);
      findings.push({chapter:first+'-'+last,register:name,sign,runes:recovered.length,ioc:score});
    }
  }
}
console.log(JSON.stringify({factor:F,originalFindings:findings,
  conclusion:'No coherent source-native GP29 plaintext under the eight exact fixed recurrences'},null,2));
