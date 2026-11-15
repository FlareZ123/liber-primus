'use strict';
/** Source-exact phi(2014 seven-square) seven-page all-plaintext-F-history test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const source = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(source.length, 745);
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const rows = source.toString('ascii').split('\r\n').filter(x => /\d/.test(x))
  .map(line => [...line.matchAll(/\d+/g)].map(m => Number(m[0])));
const square = rows.slice(5, 12);
assert.ok(square.every(row => row.length === 7 &&
  row.reduce((a,b) => a+b,0) === 1033));
/** @param {number} n positive integer. @returns {number} Euler totient. */
function phi(n) {
  let q = n;
  let v = n;
  for (let p = 2; p * p <= q; p++) {
    if (q % p !== 0) continue;
    while (q % p === 0) q /= p;
    v -= v/p;
  }
  if (q > 1) v -= v/q;
  return v;
}
const keys = square.map(row => row.map(n => phi(n) % 29));
const page = n => corpus.pages.find(p => p.page === n).indices;
const original = Array.from({length:7}, (_,i) =>
  page(33+i).slice(i === 0 ? 91 : 0, i === 6 ? 119 : undefined));
assert.deepEqual(original.map(x => x.length), [123,261,271,238,228,228,119]);
/** @param {number[]} cipher GP ciphertext.
 * @param {number[]} key seven historical shifts
 * @param {1|-1} sign plus/minus encryption direction
 * @returns {{firstImpossible:number|null, paths: Map<number,number[][]>}} */
function inverse(cipher,key,sign) {
  let paths = new Map([[0,[[]]]]);
  for (let i=0;i<cipher.length;i++) {
    const next = new Map();
    for (const [j,sequences] of paths) for (const sequence of sequences) {
      if (cipher[i]===0) {
        if (!next.has(j)) next.set(j,[]);
        next.get(j).push(sequence.concat(0));
      }
      const plain = ((cipher[i]-sign*key[j])%29+29)%29;
      if (plain!==0) {
        const k=(j+1)%7;
        if (!next.has(k)) next.set(k,[]);
        next.get(k).push(sequence.concat(plain));
      }
    }
    if (!next.size) return {firstImpossible:i,paths:next};
    paths=next;
  }
  return {firstImpossible:null,paths};
}
/** @param {number[]} plain source GP plaintext
 * @param {number[]} key seven shift key
 * @param {1|-1} sign encryption direction @returns {number[]} */
function encrypt(plain,key,sign) {
  let j=0;
  return plain.map(p=>{
    if (p===0) return 0;
    const c=((p+sign*key[j])%29+29)%29;
    j=(j+1)%7;return c;
  });
}
const expect={1:[25,94,17,null,23,98,34],'-1':[51,27,83,36,30,3,19]};
for (const sign of [1,-1]) for (let i=0;i<7;i++) {
  const r=inverse(original[i],keys[i],sign);
  assert.equal(r.firstImpossible,expect[sign][i]);
  const native = Array.from({length:original[i].length},(_,j)=>page(57)[j%95]);
  assert.equal(inverse(encrypt(native,keys[i],sign),keys[i],sign).firstImpossible,null);
}
assert.deepEqual(keys[3],[8,19,14,11,14,19,8]);
const center=inverse(original[3],keys[3],1);
const survivors=[...center.paths.values()].flat();
assert.equal(survivors.length,3);
const ioc=(x)=>{const hist=Array(29).fill(0);for(const v of x)hist[v]++;
  return hist.reduce((n,k)=>n+k*(k-1),0)/(x.length*(x.length-1));};
const originalIoc=survivors.map(ioc);
for (const [a,b] of originalIoc.map((v,i)=>[v,[0.034322589795411834,0.035528135304754814,0.03598907917597419][i]])) {
  assert.ok(Math.abs(a-b)<1e-12);
}
// Source-multiset null: keep original F sites fixed, shuffle all other GP runes.
const c=original[3], nonF=c.filter(x=>x!==0), slots=c.map((v,i)=>v?i:-1).filter(x=>x>=0);
let seed=20261115>>>0;
/** @returns {number} Repeatable xorshift32 output. */
function next() {seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
/** @param {number[]} cipher GP ciphertext. @returns {boolean} All-history survivor. */
function feasible(cipher) {
  let bits=1;
  for (const value of cipher) {
    let following=0;
    for (let j=0;j<7;j++) {
      if (!(bits&(1<<j))) continue;
      if (value===0) following|=1<<j;
      const plain=((value-keys[3][j])%29+29)%29;
      if (plain!==0) following|=1<<((j+1)%7);
    }
    if (!following) return false;
    bits=following;
  }
  return true;
}
assert.ok(feasible(c));
let survive=0;
for(let trial=0;trial<20000;trial++) {
  const pool=nonF.slice();
  for(let j=pool.length-1;j>0;j--) {const k=next()%(j+1);[pool[j],pool[k]]=[pool[k],pool[j]];}
  const sample=c.slice();
  for(let i=0;i<slots.length;i++) sample[slots[i]]=pool[i];
  survive+=Number(feasible(sample));
}
assert.equal(survive,91);
console.log(JSON.stringify({
  originalPageRange:[33,39],sourceRunes:1468,
  centerPage:36,centerRuneCount:c.length,centerF:c.length-nonF.length,
  historicalPhiKey:keys[3],originalTerminalLegalPaths:survivors.length,
  originalPhiCenterIoC:originalIoc,allPageFirstImpossible:expect,
  shuffleNull:{seed:20261115,repetitions:20000,survivors:survive,rate:survive/20000},
  recoveredUnknownPlaintext:false
},null,2));
