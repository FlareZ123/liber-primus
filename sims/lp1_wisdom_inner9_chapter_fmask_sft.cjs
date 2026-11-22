'use strict';
/**
 * Test the original LP1 Wisdom inner 3×3 as nine chapter prime-clock seeds.
 * Checks all possible plaintext-Fehu bypass paths, not a guessed F mask.
 * Node.js 22, built-ins only. No ciphertext editing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(root, 'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8').replace(/\r\n/g, '\n');
const rune = new Map(corpus.runes.map((x, i) => [x, i]));
const a = lp1.indexOf('272-138-'), b = lp1.indexOf('\n&', a);
assert.ok(a >= 0 && b > a);
const matrix = lp1.slice(a, b).split('/').map(x => x.trim()).filter(Boolean).map(row => row.split('-').map(cell => {
  if (/^[0-9]+$/.test(cell)) return Number(cell);
  let value = 0;
  for (const glyph of cell) {
    const index = rune.get(glyph);
    assert.notEqual(index, undefined);
    value += corpus.prime[index];
  }
  return value;
}));
assert.deepEqual(matrix, [
  [272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],
  [18,320,130,199,366],[151,131,341,138,272]
]);
for (let j = 0; j < 5; j++) {
  assert.equal(matrix[j].reduce((a, b) => a + b, 0), 1033);
  assert.equal(matrix.reduce((a, row) => a + row[j], 0), 1033);
}
const inner = matrix.slice(1,4).flatMap(row => row.slice(1,4));
/** @param {number} n */
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p*p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result = result / p * (p-1);
  }
  return x > 1 ? result / x * (x-1) : result;
}
const totient = inner.map(phi);
assert.deepEqual(inner,[199,130,320,245,91,245,320,130,199]);
assert.deepEqual(totient,[198,48,128,168,72,168,128,48,198]);
const prime = [];
for (let n = 2; prime.length < 5000; n++) {
  let ok = true;
  for (let d = 2; d*d <= n; d++) if (n%d===0) {ok=false;break;}
  if (ok) prime.push((n-1)%29);
}
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length,55);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length,12956);
const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const bodies=cuts.slice(0,-1).map((start,i)=>original.slice(start,cuts[i+1]));
assert.deepEqual(bodies.map(a=>a.length),[729,1145,1729,1903,1021,1433,1680,3008,308]);
/**
 * Inverse equation P = C + sign*(prime[k]-1) mod29, sign∈{-1,+1}.
 * A true plaintext rune F (index0) must appear unchanged in ciphertext
 * and must consume no prime. A consumed transition yielding plaintext F
 * is always impossible under the historical rule.
 * @param {number[]} ciphertext
 * @param {number} start
 * @param {number} sign
 */
function allMasks(ciphertext,start,sign) {
  let states=new Set([start]),widest=1;
  for(let i=0;i<ciphertext.length;i++){
    const c=ciphertext[i],next=new Set();
    for(const k of states){
      const p=(c+sign*prime[k]+29)%29;
      if(p!==0) next.add(k+1);
      if(c===0) next.add(k);
    }
    states=next;
    widest=Math.max(widest,states.size);
    if(states.size===0)return {dead:i,live:0,widest};
  }
  return {dead:null,live:states.size,widest};
}
/** @param {number[]} plain @param {number} start @param {number} sign */
function encode(plain,start,sign) {
  let k=start;
  return plain.map(p=>p===0?0:((p-sign*prime[k++])%29+29)%29);
}
// Authentic positive regression: solved LP2 p56 and its single
// independently established literal plaintext-F at source rune56.
const knownCipher=corpus.pages.find(p=>p.page===56).indices;
assert.equal(knownCipher.length,85);
let k=0;
const knownPlain=knownCipher.map((c,i)=>i===56?0:(c-prime[k++]+29)%29);
assert.equal(k,84);
assert.equal(knownPlain.map(i=>corpus.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');
assert.deepEqual(encode(knownPlain,0,-1),knownCipher);
assert.equal(allMasks(knownCipher,0,-1).dead,null);
// Original solved p57 is a source-native English plain-rune positive plant.
// All 36 exact source seed/sign variants preserve at least the planted mask.
const plainControl=corpus.pages.find(p=>p.page===57).indices;
assert.equal(plainControl.length,95);
for(const starts of [inner,totient])
  for(const start of starts)
    for(const sign of [-1,1])
      assert.equal(allMasks(encode(plainControl,start,sign),start,sign).dead,null);
const records=[];
for(const [name,seeds] of [['raw-prime-ordinal',inner],['totient-prime-ordinal',totient]])
  for(const sign of [-1,1]){
    const runs=bodies.map((text,i)=>allMasks(text,seeds[i],sign));
    assert.ok(runs.every(x=>x.dead!==null));
    records.push({source:name,sign,firstImpossibleLocalOffset:runs.map(x=>x.dead),maxConcurrentFehuClockStates:runs.map(x=>x.widest)});
  }
assert.deepEqual(records.map(x=>x.firstImpossibleLocalOffset),[
  [352,59,5,81,21,179,65,9,99],
  [34,81,1,17,5,6,56,15,1],
  [79,41,12,82,1,4,42,27,30],
  [29,4,23,45,43,2,136,70,55]
]);
console.log(JSON.stringify({
  originalWisdomInner:inner,originalWisdomTotients:totient,
  originalRuneCount:12956,nineChapterLengths:bodies.map(a=>a.length),
  authenticSolvedP56:'85/85 known plaintext + exact forward replay',
  nativeP57Plants:'36/36 source-derived seed/sign combinations have a valid all-F-mask path',
  originalAllFMaskContradictions:records,
  conclusion:'none of the four source-frozen native prime-clock transfers can encrypt any nine chapters'
},null,2));
