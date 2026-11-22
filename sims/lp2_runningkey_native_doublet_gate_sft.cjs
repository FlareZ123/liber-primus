'use strict';
/**
 * Source-native independent literary running-key GP29 anti-doublet gate.
 * Agent40, 2026-11-17. Run: node sims/lp2_runningkey_native_doublet_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const text = fs.readFileSync(path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8');
/** @param {string} source @returns {number[]} */
function nativeGP(source) {
  const s = source.toUpperCase().replace(/[^A-Z]/g, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const alphabet = gp.translit.map((token, value) => ({token, value}))
    .sort((a,b) => b.token.length - a.token.length);
  const out = [];
  for(let i=0; i<s.length;) {
    const a = alphabet.find(t => s.startsWith(t.token, i));
    assert.ok(a, 'Unmapped GP token at ' + i);
    out.push(a.value); i += a.token.length;
  }
  return out;
}
/** @param {number[]} x @returns {number} */
function doublets(x) {
  let total = 0;
  for(let i=1;i<x.length;i++) if(x[i] === x[i-1]) total++;
  return total;
}
/** @param {number[]} p @param {number[]} k @param {1|-1} sign @returns {number[]} */
function encrypt(p,k,sign) {
  assert.equal(p.length,k.length);
  return p.map((x,i)=>(x+sign*k[i]+29)%29);
}
/** @param {number[]} c @param {number[]} k @param {1|-1} sign @returns {number[]} */
function decrypt(c,k,sign) {
  assert.equal(c.length,k.length);
  return c.map((x,i)=>((x-sign*k[i])%29+29)%29);
}
const original = gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const observed = doublets(original);
assert.equal(observed,86);
const source = nativeGP(text);
assert.equal(source.length,317604);
const seed=0x33011331;
let state=seed;
function random() {
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  return state/4294967296;
}
const plus=[],minus=[],L=original.length,N=500;
for(let t=0;t<N;t++){
  const max=source.length-L-20000;
  let a,b;
  do {
    a=10000+Math.floor(random()*max);
    b=10000+Math.floor(random()*max);
  } while(Math.abs(a-b)<L);
  const p=source.slice(a,a+L),k=source.slice(b,b+L);
  for(const [sign,all] of [[1,plus],[-1,minus]]) {
    const c=encrypt(p,k,sign);
    assert.deepEqual(decrypt(c,k,sign),p);
    all.push(doublets(c));
  }
}
const nativeKnown=gp.pages.find(p=>p.page===57).indices;
assert.equal(nativeKnown.length,95);
for(const sign of [1,-1]) {
  const k=source.slice(10000,10095);
  assert.deepEqual(decrypt(encrypt(nativeKnown,k,sign),k,sign),nativeKnown);
}
function describe(x) {
  const mean=x.reduce((a,b)=>a+b,0)/x.length;
  return {min:Math.min(...x),max:Math.max(...x),mean,
    sd:Math.sqrt(x.reduce((sum,y)=>sum+(y-mean)**2,0)/x.length),
    atOrBelowOriginal:x.filter(y=>y<=observed).length};
}
const plusSummary=describe(plus),minusSummary=describe(minus);
assert.deepEqual(plusSummary,{min:404,max:533,mean:460.248,sd:21.698721068302614,atOrBelowOriginal:0});
assert.deepEqual(minusSummary,{min:437,max:554,mean:492.894,sd:21.52679177211504,atOrBelowOriginal:0});
console.log(JSON.stringify({
  originalRunes:original.length, observedEqualAdjacent:observed,
  model:'independent GP-native English plaintext and running-key windows',
  emersonGPsymbols:source.length,seed,trials:N,
  plus:plusSummary,minus:minusSummary,
  knownP57GpPositive:'95/95 exact each sign',
  conclusion:'Independent literary GP29 additive running key alone does not explain the rare original adjacent equals in these 500 paired source controls.'
},null,2));
