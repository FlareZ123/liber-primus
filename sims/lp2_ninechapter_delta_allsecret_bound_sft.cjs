'use strict';
/**
 * Single runnable test: all-secret nine-chapter GP29 predecessor-delta bound.
 * Exact algebraic bound; no cipher key or plaintext is inferred.
 * @fileoverview Original-source + source-native positive control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const data = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const spans = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters = spans.map(([a,b]) => data.pages.filter(p => p.page >= a && p.page <= b).flatMap(p => p.indices));
assert.deepEqual(chapters.map(x => x.length), [729,1145,1729,1903,1021,1433,1680,3008,308]);
const N = chapters.flat().length;
assert.equal(N,12956);

/** @param {number[][]} groups @returns {number[][]} */
function delta(groups) {
  let prev = 0;
  return groups.map(g => g.map(c => {
    const d = (c - prev + 29) % 29;
    prev = c;
    return d;
  }));
}
/** @param {number[]} arr @returns {number[]} */
function hist(arr) {
  const h=Array(29).fill(0);
  for(const x of arr) { assert(Number.isInteger(x) && x>=0 && x<29); h[x]++; }
  return h;
}
/** @param {number[]} h @returns {number} */
function ioc(h) {
  const n=h.reduce((s,x)=>s+x,0);
  return h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
}
/** @param {number[]} h @returns {number} */
function entropy(h) {
  const n=h.reduce((s,x)=>s+x,0);
  return -h.reduce((s,x)=>x?s+x/n*Math.log2(x/n):s,0);
}
const D=delta(chapters), H=D.map(hist);
const sorted=H.map(h=>[...h].sort((a,b)=>b-a));
const maxCountBySymbol=Array.from({length:29},(_,k)=>sorted.reduce((s,row)=>s+row[k],0));
const upperIoC=ioc(maxCountBySymbol);
const lowerEntropy=entropy(maxCountBySymbol);
assert.deepEqual(H.map(h=>Math.max(...h)),[38,55,78,87,47,65,82,123,20]);
assert.equal(H.reduce((s,h)=>s+h[0],0),86);
assert.equal(maxCountBySymbol[0],595);
assert(Math.abs(upperIoC-0.03593165550736161)<1e-14);
assert(Math.abs(lowerEntropy-4.818234879512238)<1e-12);
// Rearrangement inequality: sorting every chapter's histogram in identical
// order maximizes every nonnegative cross-chapter dot product simultaneously,
// hence maximizes the sum of pooled squared counts and the pooled IoC.
const optimalMaps=H.map(h=>{
  const order=Array.from({length:29},(_,i)=>i).sort((a,b)=>h[b]-h[a]||a-b);
  const map=Array(29);
  order.forEach((symbol,rank)=>{map[symbol]=rank;});
  return map;
});
const optimumPlain=D.flatMap((g,j)=>g.map(x=>optimalMaps[j][x]));
assert.deepEqual(hist(optimumPlain),maxCountBySymbol);

/** @param {number[]} plain @param {number[][]} maps @returns {number[]} */
function encrypt(plain,maps) {
  const out=[];let prev=0,k=0;
  chapters.forEach((group,j)=>{
    const inverse=Array(29);
    maps[j].forEach((symbol,d)=>{inverse[symbol]=d;});
    for(let i=0;i<group.length;i++) {
      prev=(prev+inverse[plain[k++]])%29;out.push(prev);
    }
  });
  assert.equal(k,plain.length);
  return out;
}
assert.deepEqual(encrypt(optimumPlain,optimalMaps),chapters.flat());
// Independently encoded GP-native text must be able to pass this family when
// the mechanism actually generated it. No fitted plaintext labels are used.
const raw=read('resources/control/shakespeare_first300k.txt').toUpperCase()
 .replace(/K/g,'C').replace(/Q/g,'C').replace(/V/g,'U').replace(/Z/g,'S')
 .replace(/[^A-Z]/g,'');
const tokens=data.translit.map((word,index)=>({word,index}))
 .sort((a,b)=>b.word.length-a.word.length||a.index-b.index);
const native=[];
for(let offset=0;offset<raw.length&&native.length<N;) {
  const match=tokens.find(({word})=>raw.startsWith(word,offset));
  assert(match);native.push(match.index);offset+=match.word.length;
}
assert.equal(native.length,N);
const nativeIoC=ioc(hist(native));
assert(Math.abs(nativeIoC-0.059500713098479326)<1e-12);
assert(nativeIoC>upperIoC);
const plantedMaps=chapters.map((_,j)=>
  Array.from({length:29},(_,d)=>(d*(1+(3*j)%28)+(7*j+5)%29)%29));
plantedMaps.forEach(map=>assert.equal(new Set(map).size,29));
const plantC=encrypt(native,plantedMaps);
const plantGroups=[];let off=0;
for(const group of chapters) plantGroups.push(plantC.slice(off,off+=group.length));
assert.deepEqual(delta(plantGroups).flatMap((g,j)=>g.map(d=>plantedMaps[j][d])),native);
const solvedIoc=ioc(hist(data.pages.find(p=>p.page===57).indices));
assert(solvedIoc>upperIoC);
console.log('Nine visual chapter rune lengths: '+JSON.stringify(chapters.map(c=>c.length)));
console.log('Chapter largest delta frequencies: '+JSON.stringify(H.map(h=>Math.max(...h))));
console.log('D=0 exception count: '+H.reduce((s,h)=>s+h[0],0));
console.log('All-secret optimal pooled counts: '+JSON.stringify(maxCountBySymbol));
console.log('Maximum pooled GP29 IoC under ANY nine chapter-static bijections: '+upperIoC);
console.log('Minimum pooled GP29 entropy: '+lowerEntropy+' bits/rune');
console.log('Maximum frequency of ANY one putative plaintext GP rune: 595 / '+N);
console.log('Independent native Shakespeare GP29 IoC: '+nativeIoC);
console.log('Solved authentic p57 GP29 IoC: '+solvedIoc);
console.log('PASS: algebraic optimum achieved; exact original reencryption '+N+'/'+N+
  '; true native English planted/recovered '+N+'/'+N);
