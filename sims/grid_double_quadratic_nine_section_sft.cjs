'use strict';
/**
 * Original-LP2 source-motivated double-quadratic GF29 quotient test.
 *
 * The two visible 3-rune red inscriptions (p3 and p39, both at local119)
 * define a GF(29^2) coordinate and an Ac=24 double-root. The independently
 * marked grid root z=23+27u supplies its quadratic factor. Division of the
 * source 256-byte printed polynomial by both monic quadratics yields exactly
 * 252 coefficients. These fit 9 original section bodies x 28 GP nonzero
 * symbols. Test just the fixed row-major 28-key cycle, additive GP29 or
 * repeat-transparent GP28 difference, on every original 12,956 runes.
 *
 * Run: node sims/grid_double_quadratic_nine_section_sft.cjs
 * Node 22/CommonJS; read-only, deterministic, no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} f @returns {any} */
const json = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const grid = json('resources/liber-primus/lp2-grid-256.json').bytes;
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const original = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.equal(original.length, 12956);
assert.equal(grid.length, 256);
const triples = ink.pages.flatMap((p) => (p.red_spans || [])
  .filter((s) => s.length === 3)
  .map((s) => ({ page: p.page, start: s.start,
    gp: Array.from(s.runes).map((r) => corpus.runes.indexOf(r)) })));
assert.deepEqual(triples, [
  {page:3,start:119,gp:[13,23,2]},
  {page:39,start:119,gp:[27,5,15]}
]);
/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
const mod28 = (x) => ((x % 28) + 28) % 28;
/**
 * Exact monic synthetic division of a descending polynomial over F29.
 * @param {number[]} input
 * @param {number[]} monic desc
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(input, monic) {
  assert.equal(monic[0], 1);
  const rem = input.slice(), quotient = [];
  for (let i = 0; i <= input.length - monic.length; i++) {
    const lead = rem[i];
    quotient.push(lead);
    for (let j = 0; j < monic.length; j++)
      rem[i + j] = mod(rem[i + j] - lead * monic[j]);
  }
  return {quotient, remainder:rem.slice(-monic.length + 1)};
}
const coefficients = grid.map(mod);
const acQuadratic = [1, 10, 25];  // (X-24)^2 over F29
const extensionQuadratic = [1, 18, 11]; // min.poly. of 23+27u
const afterAc = divide(coefficients, acQuadratic);
assert.deepEqual(afterAc.remainder, [0, 0]);
const afterZ = divide(afterAc.quotient, extensionQuadratic);
assert.deepEqual(afterZ.remainder, [0, 0]);
const swapped = divide(divide(coefficients, extensionQuadratic)
  .quotient, acQuadratic);
assert.deepEqual(swapped.remainder, [0, 0]);
assert.deepEqual(afterZ.quotient, swapped.quotient);
const quotient = afterZ.quotient;
assert.equal(quotient.length, 252);
assert.deepEqual(quotient.slice(0, 12),
  [0,28,21,17,24,10,15,20,13,17,20,1]);

// The ninth body is the actual 91-rune / 23-word p33 interlude.
// 7960 and 8051 are independently source-marked physical boundaries.
const lengths = [729,1145,1738,1894,1021,1433,91,1589,3316];
assert.equal(lengths.reduce((s,n)=>s+n,0),12956);
assert.equal(lengths.slice(0,6).reduce((s,n)=>s+n,0),7960);
assert.equal(lengths.slice(0,7).reduce((s,n)=>s+n,0),8051);
const rows = Array.from({length:9},(_,s)=>quotient.slice(s*28,(s+1)*28));
assert.deepEqual(rows.map((r)=>new Set(r).size),
  [16,19,21,16,19,16,18,17,22]);
const pow15=[],log15=Array(29).fill(-1);
for (let i=0,v=1;i<28;i++,v=(v*15)%29) {
  assert.equal(log15[v],-1);
  pow15.push(v);
  log15[v]=i;
}
assert.equal(new Set(pow15).size,28);
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const f=Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
/**
 * @param {number[]} seq
 * @param {'GP29'|'GP28'} family
 * @param {-1|1} sign
 * @returns {number[]}
 */
function decode(seq,family,sign) {
  const out=[];
  let at=0,prev=0;
  for(let b=0;b<9;b++) {
    for(let j=0;j<lengths[b];j++) {
      const c=seq[at++], key=rows[b][j%28];
      if(family==='GP29') out.push(mod(c+sign*key));
      else {
        const d=mod(c-prev);
        out.push(d===0?28:mod28(log15[d]+sign*(key%28)));
      }
      prev=c;
    }
  }
  assert.equal(at,seq.length);
  return out;
}
/**
 * @param {number[]} seq
 * @param {'GP29'|'GP28'} family
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encode(seq,family,sign) {
  const out=[];
  let at=0,prev=0;
  for(let b=0;b<9;b++) {
    for(let j=0;j<lengths[b];j++) {
      const p=seq[at++],key=rows[b][j%28];
      const c=family==='GP29'
        ? mod(p-sign*key)
        : mod(prev+(p===28?0:pow15[mod28(p-sign*(key%28))]));
      out.push(c);
      prev=c;
    }
  }
  assert.equal(at,seq.length);
  return out;
}
/** @param {string} txt @returns {number[]} */
function nativeGP(txt) {
  const mapping=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const result=[];
  for(let word of txt.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S')
      .replace(/ING/g,'NG');
    const values=[];
    for(let i=0;i<word.length;) {
      const token=mapping.find((x)=>word.startsWith(x.s,i));
      if(!token){values.length=0;break;}
      values.push(token.i);
      i+=token.s.length;
    }
    result.push(...values);
  }
  return result;
}
const english=nativeGP(fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'),'utf8'));
assert(english.length>150000);
const plant=english.slice(english.length-original.length);
const reports=[];
for(const family of ['GP29','GP28'])
  for(const sign of [-1,1]) {
    const decoded=decode(original,family,sign);
    assert.deepEqual(encode(decoded,family,sign),original);
    const encryptedPlant=encode(plant,family,sign);
    assert.deepEqual(decode(encryptedPlant,family,sign),plant);
    reports.push({family,sign,
      first6761:ioc(decoded.slice(0,6761)),
      holdout6195:ioc(decoded.slice(6761)),
      full:ioc(decoded),
      outputEA:decoded.filter((x)=>x===28).length,
      nativeRecovered:plant.length,
      prefix:decoded.slice(0,72).map((x)=>corpus.translit[x]).join('')});
  }
assert.equal(reports.length,4);
console.log(JSON.stringify({
  classification:'Bounded original negative: 9x28 double-quadratic register',
  source:{redTriples:triples,originalCoefficientCount:256,
    acQuadratic,extensionQuadratic,
    originalRemainders:[afterAc.remainder,afterZ.remainder],
    quotientCount:quotient.length,quotientHead:quotient.slice(0,12),
    nineSourceBodies:lengths,rowsUnique:rows.map((r)=>new Set(r).size)},
  original:{runes:original.length,ioc:ioc(original),nativeIoc:ioc(plant),
    repeatEvents:original.slice(1).filter((x,i)=>x===original[i]).length,
    cases:reports},
  interpretation:'Both quadratics and the 9-body/28-key layout are source-linked but are not an established cipher. Neither direct additive nor GP28 repeat-transparent output recovers unknown LP2 plaintext. The 9 row lengths also cannot be nine 28-symbol permutations.'
},null,2));
