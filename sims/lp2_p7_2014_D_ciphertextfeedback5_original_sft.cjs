'use strict';

/**
 * SFT: source-complete five-rune ciphertext-feedback inverse.
 *
 * Cipher hypothesis, NOT an authenticated Cicada instruction:
 *   C[j] = P[j] + D*C[j-1] (mod 29) for five-rune blocks,
 *   D = F(A/2), where F is the source p7 red-word quartic and
 *   A is the original signed-2014 3301-sum 5x5 magic square.
 *
 * The previous-block IV is either the five original p7 red-word products,
 * or their source matrix projector. No unknown keys, phases, padding,
 * page deletions, or learned symbol substitutions.
 *
 * Windows 11, Node.js 22:
 *   node sims/lp2_p7_2014_D_ciphertextfeedback5_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const historic = read('resources/cicada2014-openpuff-magic-squares.txt');
const mod = n => ((n % 29) + 29) % 29;
const N = 5;
const I = Array.from({length:N}, (_,i) => Array.from({length:N}, (_,k) => +(i===k)));
const zero = () => I.map(r => r.map(() => 0));
/** @param {number[][]} X @param {number[][]} Y @returns {number[][]} */
function mm(X,Y) {
  return X.map(row => row.map((_,j) => mod(
    row.reduce((s,x,k) => s+x*Y[k][j],0))));
}
/** @param {number[][]} X @param {number[]} v @returns {number[]} */
function mv(X,v) {
  return X.map(row => mod(row.reduce((s,x,k) => s+x*v[k],0)));
}
/** @param {number[][]} X @param {number[][]} Y @returns {number[][]} */
function sub(X,Y) {
  return X.map((r,i) => r.map((x,j) => mod(x-Y[i][j])));
}
/** @param {number[][]} X @param {number} k @returns {number[][]} */
function scale(X,k) {return X.map(r => r.map(x => mod(x*k)));}
const numerals = [...historic.matchAll(/\d+/g)].map(x=>Number(x[0]));
assert.equal(numerals.length,99);
const A = Array.from({length:5},(_,i)=>numerals.slice(i*5,i*5+5));
for(const row of A) assert.equal(row.reduce((a,b)=>a+b),3301);
const redWords = [2,4,3,2,3];
const originalP7 = original.pages[7].indices;
let offset=originalP7.length-14;
const v=redWords.map(n=>{
  const word=originalP7.slice(offset,offset+n);
  offset+=n;
  return word.reduce((a,b)=>mod(a*b),1);
});
assert.deepEqual(v,[11,26,8,15,2]);
assert.equal(offset,originalP7.length);
const A29=A.map(r=>r.map(mod));
const R=scale(A29,15); // 1/2 mod29
let power=I;
let D=zero();
for(const k of v) {
  D=D.map((row,i)=>row.map((x,j)=>mod(x+k*power[i][j])));
  power=mm(power,R);
}
assert.deepEqual(D,[
  [15,6,7,12,10],
  [17,12,28,4,18],
  [19,16,9,16,19],
  [18,4,28,12,17],
  [10,12,7,6,15]
]);
const projector=scale(mm(sub(mm(A29,A29),scale(I,25)),
                         sub(mm(A29,A29),scale(I,9))),20);
assert.deepEqual(mm(projector,projector),projector);
const projected=mv(projector,v);
assert.deepEqual(projected,[26,11,13,11,26]);
/** @param {number[]} plain @param {number[]} iv @returns {number[]} */
function encrypt(plain,iv) {
  assert.equal(plain.length%5,0);
  let prev=iv;
  const out=[];
  for(let i=0;i<plain.length;i+=5) {
    const key=mv(D,prev);
    const block=plain.slice(i,i+5).map((p,k)=>mod(p+key[k]));
    out.push(...block);
    prev=block;
  }
  return out;
}
/** @param {number[]} ciphertext @param {number[]} iv @returns {number[]} */
function decrypt(ciphertext,iv) {
  assert.equal(ciphertext.length%5,0);
  let prev=iv;
  const out=[];
  for(let i=0;i<ciphertext.length;i+=5) {
    const block=ciphertext.slice(i,i+5);
    const key=mv(D,prev);
    out.push(...block.map((c,k)=>mod(c-key[k])));
    prev=block;
  }
  return out;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const h=Array(29).fill(0);
  for(const c of xs) h[c]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
const clear=original.pages[57].indices;
assert.equal(clear.length,95);
const scopes=[
  {name:'p8 complete',from:8,to:8,expected:255},
  {name:'p3-p7 five-scroll',from:3,to:7,expected:1145},
  {name:'p33-p39 complete',from:33,to:39,expected:1680}
];
let tested=0;
const rows=[];
for(const scope of scopes) {
  const C=original.pages.filter(p=>p.page>=scope.from && p.page<=scope.to)
    .flatMap(p=>p.indices);
  assert.equal(C.length,scope.expected);
  const plant=Array.from({length:C.length},(_,i)=>clear[i%clear.length]);
  assert(ioc(plant)>0.05);
  for(const [seed,iv] of [['printed',v],['projected',projected]]) {
    const P=decrypt(C,iv);
    assert.deepEqual(encrypt(P,iv),C);
    assert.deepEqual(decrypt(encrypt(plant,iv),iv),plant);
    const score=ioc(P);
    assert(score<0.04,'source CBC receiver unexpectedly native-like');
    tested+=C.length;
    rows.push({scope:scope.name,source_seed:seed,GP29_runes:C.length,
      ciphertext_IoC:ioc(C),decoded_IoC:score,
      native_plant_IoC:ioc(plant),
      prefix_GP29:P.slice(0,35).map(x=>original.translit[x]).join(' ')});
  }
}
console.log(JSON.stringify({
  source:'original LP2 GP29 corpus; 2014 magic5; exact p7 red-word products',
  premise:'P[j] = C[j] - F(A/2)*C[j-1] in complete 5-rune blocks',
  confirmed_matrix_D:D, printed_source_IV:v, projected_source_IV:projected,
  original_ciphertext_runes_tested:tested,
  verdict:'all complete original outputs remain ciphertext-like, no native plaintext',
  rows
},null,2));
console.log('PASS: original source matrix; six complete CBC inverse/forward replay and native-GP plants.');
