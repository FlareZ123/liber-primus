'use strict';
/**
 * Totalized, bijective GF(29²) Möbius action under the signed 2013 DH23
 * coefficients 6 and 15; complete original LP2 p0-55 ciphertext gate.
 *
 * Run: node sims/p36_dh23_totalized_mobius_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const mod = n => (n % 29 + 29) % 29;

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul([a,b], [c,d]) {
  return [mod(a*c+8*b*d), mod(a*d+b*c+3*b*d)];
}

/** @param {number} a @param {number} e @returns {number} */
function pow29(a, e) {
  let z = 1;
  for (; e > 0; e = Math.floor(e/2), a = mod(a*a)) if (e%2) z = mod(z*a);
  return z;
}

/** @param {[number, number]} x @returns {[number, number]} */
function inv([a,b]) {
  const norm = mod(a*a+3*a*b-8*b*b);
  assert.notEqual(norm, 0, 'field inversion requires nonzero denominator');
  const k = pow29(norm, 27);
  return [mod((a+3*b)*k), mod(-b*k)];
}

/**
 * The ordinary projective map f(x)=-6x/(x+15) has an infinity output at x=-15.
 * Since finite inputs otherwise omit -6, assigning f(-15)=-6 totalizes it
 * as a finite 841-point permutation with no side channel.
 * @param {[number,number]} x @returns {[number,number]}
 */
function direct([a,b]) {
  if (a===14 && b===0) return [23,0];
  return mul(mul([23,0],[a,b]),inv([mod(a+15),b]));
}

/** @param {[number,number]} y @returns {[number,number]} */
function inverse([a,b]) {
  if (a===23 && b===0) return [14,0];
  return mul(mul([15,0],[a,b]),inv([mod(23-a),mod(-b)]));
}

/** @param {number[]} seq @param {(x: [number,number]) => [number,number]} op @param {number} phase @returns {number[]} */
function applyPairs(seq, op, phase) {
  const result = seq.slice();
  for (let i=phase; i+1<seq.length; i+=2) {
    const [a,b] = op([seq[i],seq[i+1]]);
    result[i]=a;
    result[i+1]=b;
  }
  return result;
}

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = new Array(29).fill(0);
  for (const v of seq) counts[v]++;
  return counts.reduce((sum,n) => sum+n*(n-1),0)/(seq.length*(seq.length-1));
}

// Exact complete register proof: the finite totalization and inverse are
// mutually inverse on all 29² elements, including both formerly missing poles.
const images = new Set();
for (let a=0;a<29;a++) for (let b=0;b<29;b++) {
  const p = direct([a,b]);
  assert.deepEqual(inverse(p),[a,b]);
  images.add(p.join(','));
}
assert.equal(images.size,841);
assert.deepEqual(direct([0,1]),[19,26], 'p3 element -> original p36 norm');
assert.deepEqual(direct([14,0]),[23,0], 'totalized projective pole');

// Both solved pages serve as source-native positive-control plaintext;
 // odd-length page tail is carried unchanged under each page reset.
const positive = corpus.pages.filter(p => p.page===56 || p.page===57);
for (const phase of [0,1]) for (const page of positive) {
  const p = page.indices;
  assert.deepEqual(applyPairs(applyPairs(p,direct,phase),inverse,phase),p);
  assert.deepEqual(applyPairs(applyPairs(p,inverse,phase),direct,phase),p);
}

const records = [];
const expected = [
  ['book',0,'direct',0.03447500187375279],
  ['book',0,'inverse',0.03447429884408816],
  ['book',1,'direct',0.03453468790070457],
  ['book',1,'inverse',0.03447531168343551],
  ['page',0,'direct',0.034482163243726445],
  ['page',0,'inverse',0.034473381330797026],
  ['page',1,'direct',0.03448120998316423],
  ['page',1,'inverse',0.03451487199676749],
];
for (const [frame,phase,name,value] of expected) {
  const op = name==='direct' ? direct : inverse;
  const result = frame==='book' ? applyPairs(original,op,phase)
    : pages.flatMap(p => applyPairs(p.indices,op,phase));
  assert.equal(result.length,original.length);
  assert.ok(Math.abs(ioc(result)-value)<1e-12, 'original-source fixed score drift');
  const undo = name==='direct' ? inverse : direct;
  const reversed = frame==='book' ? applyPairs(result,undo,phase)
    : pages.reduce((acc,p) => {
        const offset = acc.offset;
        const section = result.slice(offset,offset+p.indices.length);
        acc.parts.push(...applyPairs(section,undo,phase));
        acc.offset+=p.indices.length;
        return acc;
      },{parts:[],offset:0}).parts;
  assert.deepEqual(reversed,original, 'complete original ciphertext round trip');
  records.push({frame,phase,operation:name,ioc:ioc(result),
    first24:result.slice(0,24).map(i=>corpus.translit[i]).join(' ')});
}
const pagewise = [];
for (const page of pages) for (const phase of [0,1])
  for (const [name,op] of [['direct',direct],['inverse',inverse]]) {
    pagewise.push({page:page.page,phase,operation:name,
      ioc:ioc(applyPairs(page.indices,op,phase))});
  }
const highestPage = pagewise.sort((a,b)=>b.ioc-a.ioc)[0];
assert.equal(highestPage.page,49);
assert.ok(highestPage.ioc<0.04);
console.log(JSON.stringify({
  source:'Signed 2013 DH23 coefficients; original LP2 p3 quadratic, p36 norm and p0–55 runes',
  field:'GF(29)[u]/(u²-3u-8)', polesTotalized:true, all841Bijective:true,
  originalRunes:original.length,rawIoc:ioc(original),
  records,highestSinglePageIoc:highestPage,
  decision:'No complete or page-local native GP29 plaintext under the source-fixed direct/inverse totalization; 8 whole-register tests and 220 page-local tests.',
},null,2));
