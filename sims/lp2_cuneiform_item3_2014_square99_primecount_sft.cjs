'use strict';
/**
 * Source-fixed 99→98 original-numbered-item3 test.
 *
 * The three authentic 2014 OpenPuff squares contain 25+49+25=99 printed
 * integers. Applying the exact historically named prime-counting idea to
 * adjacent original-file cells gives 98 consecutive prime-count differences.
 * Those 98 values align without truncation to the 98 original rune positions
 * of numbered item3, LP2 p37 positions [91,189). No phases, alternate square
 * orders, matrix traversals, keys, or offsets are fitted to ciphertext.
 *
 * Tests both signs of the explicit additive GP29 decoder on the unchanged
 * original ciphertext, with a solved-p57 GP29 native plant and exact inverse.
 * Windows 11 / Node22 / CommonJS, read-only one-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const squares = fs.readFileSync(path.join(root,
  'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\s+/u).map(Number);
assert.equal(squares.length,99);
assert.ok(squares.every(Number.isSafeInteger));
assert.deepEqual([squares[12],squares[49],squares[86]],[809,331,91]);
/** @param {number} n */
function primeCount(n) {
  let count = 0;
  for(let k=2;k<=n;k++) {
    let prime=true;
    for(let d=2;d*d<=k;d++) if(k%d===0) {prime=false;break;}
    if(prime) count++;
  }
  return count;
}
const p = squares.map(primeCount);
assert.deepEqual([p[12],p[49],p[86]],[140,67,24]);
assert.deepEqual([140-67,67-24],[73,43]);
assert.deepEqual([corpus.translit[corpus.prime.indexOf(73)],
                  corpus.translit[corpus.prime.indexOf(43)]],['L','P']);
const mod = n => ((n%29)+29)%29;
const key = p.slice(0,-1).map((x,i)=>mod(x-p[i+1]));
assert.equal(key.length,98);
const item3 = corpus.pages.find(x=>x.page===37).indices.slice(91,189);
assert.equal(item3.length,98);
const control = corpus.pages.find(x=>x.page===57).indices;
assert.equal(control.length,95);
const native = Array.from({length:98},(_,i)=>control[i%95]);
/** @param {number[]} a */
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const x of a) counts[x]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number} sign */
function decode(a,sign) {
  return a.map((x,i)=>mod(x+sign*key[i]));
}
/** @param {number[]} a */
function translit(a) {
  return a.map(x=>corpus.translit[x]).join('');
}
const outcome={
  source:'2014 three original square cells in original text order',
  squareValues:squares.length,
  keyLength:key.length,
  originalIoC:ioc(item3),
  cleartextNativeIoC:ioc(native),
  keyFirst25:key.slice(0,25),
  signs:[]
};
for(const sign of [-1,1]) {
  const decoded=decode(item3,sign);
  assert.deepEqual(decode(decoded,-sign),item3);
  const planted=decode(native,-sign);
  assert.deepEqual(decode(planted,sign),native);
  outcome.signs.push({sign,ioC:ioc(decoded),runicTransliteration:translit(decoded)});
}
assert.ok(outcome.signs.every(x=>x.ioC<0.04));
console.log('PASS original source 99→98, exact native plant and two original inverses');
console.log(JSON.stringify(outcome,null,2));
