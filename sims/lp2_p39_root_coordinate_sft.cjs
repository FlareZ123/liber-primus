#!/usr/bin/env node
'use strict';
/**
 * Original-source p39 repeated-root polynomial coordinate inverse.
 * Run from repository root: node sims/lp2_p39_root_coordinate_sft.cjs
 * Uses only Node built-ins and the canonical original corpus.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
const choose = Array.from({length:29}, () => Array(29).fill(0));
for (let i=0;i<29;i++) {
  choose[i][0]=choose[i][i]=1;
  for (let j=1;j<i;j++) choose[i][j]=mod(choose[i-1][j-1]+choose[i-1][j]);
}
/**
 * Coefficients of P(X+r), low-degree first, retaining exact length.
 * Lucas' theorem factors the binomial matrix over the base-29 digits.
 * Frobenius gives r^(29^k)=r, so each digit uses the same small matrix.
 * @param {number[]} a @param {number} r @returns {number[]}
 */
function shift(a,r) {
  let b=a.slice();
  const pow=[1];
  for(let i=1;i<29;i++)pow[i]=mod(pow[i-1]*r);
  for(let stride=1;stride<a.length;stride*=29) {
    const next=Array(a.length).fill(0);
    for(let i=0;i<a.length;i++) {
      const d=Math.floor(i/stride)%29;
      for(let j=d;j<29&&i+(j-d)*stride<a.length;j++)
        next[i]=mod(next[i]+choose[j][d]*pow[j-d]*b[i+(j-d)*stride]);
    }
    b=next;
  }
  return b;
}
/** Independent direct polynomial Horner implementation.
 * @param {number[]} a @param {number} r @returns {number[]}
 */
function horner(a,r) {
  let b=[];
  for(let i=a.length-1;i>=0;i--) {
    const c=Array(b.length+1).fill(0);
    c[0]=a[i];
    for(let j=0;j<b.length;j++) {
      c[j]=mod(c[j]+r*b[j]); c[j+1]=mod(c[j+1]+b[j]);
    }
    b=c;
  }
  return b;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const x of a) counts[x]++;
  return counts.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {number} r @param {boolean} rev */
function inverse(a,r,rev) {
  const orient=x=>rev?x.slice().reverse():x;
  return orient(shift(orient(a),r));
}
/** @param {number[]} a @param {number} n */
const gp=(a,n)=>a.slice(0,n).map(x=>corpus.translit[x]).join('-');
const pages=corpus.pages;
const g=pages[39].indices.slice(119,122);
assert.deepEqual(g,[27,5,15]);
const root=3301%29;
assert.equal(mod(g[0]+g[1]*root+g[2]*root*root),0);
assert.equal(mod(g[1]+2*g[2]*root),0);
const p57=pages[57].indices;
for(const r of [root,mod(-root)]) {
  assert.deepEqual(shift(p57,r),horner(p57,r));
  for(const rev of [false,true])
    assert.deepEqual(inverse(inverse(p57,r,rev),mod(-r),rev),p57);
}
console.log('Native p57 plant',p57.length,'IoC',ioc(p57));
/** @param {string|number} name @param {number[]} a */
function evaluate(name,a) {
  const result=[];
  for(const r of [5,24]) for(const rev of [false,true]) {
    const b=inverse(a,r,rev);
    assert.deepEqual(inverse(b,mod(-r),rev),a);
    result.push({name,n:a.length,r,rev,ioc:ioc(b),start:gp(b,35)});
  }
  return result;
}
const targets=[
  ['p39',pages[39].indices],
  ['p34-39',pages.slice(34,40).flatMap(p=>p.indices)],
  ['p0-black',pages[0].indices.slice(13)],
  ['p0-55',pages.slice(0,56).flatMap(p=>p.indices)]
];
assert.equal(targets[3][1].length,12956);
for(const [name,a] of targets) {
  console.log(JSON.stringify({name,n:a.length,raw:ioc(a),result:evaluate(name,a)}));
}
const results=pages.slice(0,56).filter(p=>p.indices.length>1)
  .flatMap(p=>evaluate(p.page,p.indices));
assert.equal(results.length,220);
console.log(JSON.stringify({pageModeCount:results.length,
  best:results.sort((a,b)=>b.ioc-a.ioc).slice(0,5)}));
console.log('PASS: all original inverse replays and source-native positive controls');
