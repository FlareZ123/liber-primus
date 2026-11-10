'use strict';
/**
 * Original-source SFT: 256-byte table double root Ac=24, P3 primitive GF(29^2)
 * polynomial, and source-highlighted p53/p55 127-rune target.
 *
 * The p3 coefficients 13+23X+2X^2 give monic X^2+26X+21:
 * for a+b*alpha, trace=2a+3b and norm=a^2+3ab+21b^2 (mod 29).
 * No source-selected key or unknown LP2 plaintext is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** Divide ascending GF29 coefficient polynomial by X−a. @param {number[]} c @param {number} a */
function divide(c, a) {
  const q = Array(c.length - 1);
  q[q.length - 1] = c[c.length - 1];
  for (let j = q.length - 1; j >= 1; j--) q[j - 1] = mod(c[j] + a * q[j]);
  return { q, remainder: mod(c[0] + a * q[0]) };
}
/** @param {number[]} a */
function ioc(a) {
  const hist = Array(29).fill(0);
  for (const v of a) hist[v]++;
  return hist.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} z @param {'adjacent'|'halves'} layout @param {boolean} swap @param {'trace'|'norm'} method */
function key(z, layout, swap, method) {
  return Array.from({length:127},(_,i)=>{
    let a = z[layout === 'adjacent' ? 2*i : i];
    let b = z[layout === 'adjacent' ? 2*i+1 : i+127];
    if (swap) [a,b] = [b,a];
    return mod(method === 'trace' ? 2*a+3*b : a*a+3*a*b+21*b*b);
  });
}
function main() {
  const grid = load('resources/liber-primus/lp2-grid-256.json');
  const corpus = load('resources/liber-primus/lp2-corpus.json');
  const red = load('resources/liber-primus/lp2-page53-red-span.json');
  assert.equal(grid.bytes.length, 256);
  const c = grid.bytes.slice().reverse().map(mod);
  const d1 = divide(c,24);
  const d2 = divide(d1.q,24);
  assert.equal(d1.remainder,0);
  assert.equal(d2.remainder,0);
  assert.equal(d2.q.length,254);
  const p55 = corpus.pages.find(p=>p.page===55);
  const target = [...red.red_text.runes].map(r=>corpus.runes.indexOf(r)).concat(p55.indices);
  assert.equal(red.red_text.rune_count,51);
  assert.equal(p55.indices.length,76);
  assert.equal(target.length,127);
  assert.ok(target.every(v=>v>=0&&v<29));
  assert.equal(ioc(target),0.034620672415948);
  // Primitive field positive controls: alpha satisfies alpha^2=3alpha+8;
  // conjugate root alpha'=3-alpha, so alpha*alpha'=21 and trace(alpha)=3.
  assert.equal(mod(3*3-4*21),12);
  assert.equal(mod(2*0+3*1),3);
  assert.equal(mod(0+0+21),21);
  const results = [];
  for (const reverse of [false,true]) {
    const coeffs = reverse ? d2.q.slice().reverse() : d2.q;
    for(const layout of ['adjacent','halves'])
      for(const swap of [false,true])
        for(const method of ['trace','norm'])
          for(const sign of [-1,1]) {
            const k = key(coeffs,layout,swap,method);
            const plaintext = target.map((v,i)=>mod(v+sign*k[i]));
            const reencryption = plaintext.map((v,i)=>mod(v-sign*k[i]));
            assert.deepEqual(reencryption,target);
            const solvedPlant = Array.from({length:127},(_,i)=>[18,16,8,3,15,24,9,20,11][i%9]);
            const ciphertextPlant = solvedPlant.map((v,i)=>mod(v-sign*k[i]));
            assert.deepEqual(ciphertextPlant.map((v,i)=>mod(v+sign*k[i])),solvedPlant);
            results.push({reverse,layout,swap,method,sign,ioc:ioc(plaintext),
              first51:plaintext.slice(0,51).map(v=>corpus.translit[v]).join(''),
              last76:plaintext.slice(51).map(v=>corpus.translit[v]).join('')});
          }
  }
  results.sort((a,b)=>b.ioc-a.ioc);
  assert.equal(results.length,32);
  assert.equal(results[0].reverse,true);
  assert.equal(results[0].layout,'halves');
  assert.equal(results[0].swap,false);
  assert.equal(results[0].method,'trace');
  assert.equal(results[0].sign,1);
  assert.equal(results[0].ioc,0.03962004749406324);
  console.log(JSON.stringify({source:'original printed 256-byte LP2 table and red page-3 primitive quadratic',
    doubleRootAc24:true,originalTargetLength:target.length,originalIoC:ioc(target),
    candidateCount:results.length,best:results[0],lowestIoC:results[results.length-1].ioc,
    interpretation:'All outputs gibberish under direct additive GP29 field trace/norm keys; no plaintext or key recovered.'},null,2));
}
if(require.main===module) main();
module.exports={divide,key,ioc};
