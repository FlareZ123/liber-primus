/* eslint-disable no-console */
'use strict';

/**
 * Source-original test: degree-16 small-factor product of the printed p50
 * GF(29) table as an LFSR, with the original 16 red-span boundaries as seed.
 * No cipher key, output, or search parameter is optimized on unknown text.
 * Run in Windows Node.js 22; no third-party dependencies or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @template T @param {string} name @returns {T} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
/** @param {number} n @returns {number} */
const m = n => ((n % 29) + 29) % 29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) out[i+j] = m(out[i+j] + a[i] * b[j]);
  return out;
}
/** @param {number} n @param {number} k @returns {number} */
function pow(n, k) {
  let x = 1, a = m(n);
  while (k) { if (k % 2) x = m(x*a); a = m(a*a); k = Math.floor(k/2); }
  return x;
}
/** @param {number[]} dividend @param {number[]} divisor @returns {number[]} */
function remainder(dividend, divisor) {
  const v = dividend.slice();
  assert.equal(divisor.at(-1), 1);
  for (let i = v.length - 1; i >= divisor.length - 1; i--) {
    const coefficient = v[i];
    for (let j = 0; j < divisor.length; j++) {
      v[i - divisor.length + 1 + j] = m(v[i - divisor.length + 1 + j] - coefficient*divisor[j]);
    }
  }
  return v.slice(0, divisor.length - 1);
}
/** @param {number[]} seed @param {number[]} monic @param {number} length @returns {number[]} */
function stream(seed, monic, length) {
  assert.equal(seed.length, 16);
  assert.equal(monic.length, 17);
  assert.equal(monic[16], 1);
  const out = seed.slice();
  while (out.length < length) {
    let v = 0;
    const start = out.length - 16;
    for (let i = 0; i < 16; i++) v -= monic[i]*out[start+i];
    out.push(m(v));
  }
  return out;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h = Array(29).fill(0);
  for (const v of a) h[v]++;
  return h.reduce((n,k)=>n+k*(k-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a @param {string[]} translit @returns {string} */
function roman(a, translit) { return a.map(i=>translit[i]).join(''); }

const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const grid = json('resources/liber-primus/base60-grid.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const unsolved = corpus.pages.filter(p=>p.page <= 55 && p.indices.length);
const ciphertext = unsolved.flatMap(p=>p.indices);
assert.equal(ciphertext.length, 12956);

const red = ink.pages.filter(p=>p.page <= 55)
  .flatMap(p=>(p.red_spans||[]).map(s=>({...s,page:p.page})));
assert.equal(red.length,16);
assert.equal(red.reduce((n,s)=>n+s.length,0),213); // p56 and p57 account for 12 other red runes
for (const s of red) {
  const page = corpus.pages[s.page];
  assert.equal(s.runes, page.indices.slice(s.start,s.start+s.length).map(i=>corpus.runes[i]).join(''));
}
const first = red.map(s=>corpus.pages[s.page].indices[s.start]);
const last = red.map(s=>corpus.pages[s.page].indices[s.start+s.length-1]);
assert.equal(Buffer.from(first).toString('hex'),'0f140d18170e0014011317151b001018');
assert.equal(Buffer.from(last).toString('hex'),'0516020c131118151a0d060c0f080913');

// The product of every small irreducible factor of the original table polynomial:
// (x+5)^2 * (x^2+18x+11) * (x^3+14x^2+16x+24) *
// (x^9+12x^8+20x^7+10x^6+5x^5+x^4+9x^3+15x+11).
const factor = mul(mul(mul(mul([5,1],[5,1]),[11,18,1]),[24,16,14,1]),
  [11,15,0,9,1,5,10,20,12,1]);
assert.deepEqual(factor,[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]);
assert.ok(remainder(bytes.map(b=>b%29).reverse(),factor).every(x=>x===0));
const reciprocal = factor.slice().reverse().map(x=>m(x*pow(factor[0],27)));
assert.equal(reciprocal[16],1);

// The predecessor-excluding rank is fully public; zero step is represented by 28.
// No plaintext-dependent skip, key offset, word reset, page reset or fitted alphabet.
const delta = ciphertext.map((c,i)=>i?m(c-ciphertext[i-1]-1):c);
const trials=[];
for (const [seedName, baseSeed] of [['first',first],['last',last]]) {
  for (const reversed of [false,true]) {
    for (const [polyName, poly] of [['forward',factor],['reciprocal',reciprocal]]) {
      const seed = reversed ? baseSeed.slice().reverse() : baseSeed;
      const key = stream(seed,poly,ciphertext.length);
      for (const sign of [-1,1]) {
        const simple = ciphertext.map((c,i)=>m(c+sign*key[i]));
        const ranked = delta.map((c,i)=>m(c+sign*key[i]));
        for (const [receiver,text] of [['additive',simple],['successor-rank',ranked]]) {
          // Exact forward inversion is a correctness invariant for the proposed model.
          const forward = text.map((p,i)=>m(p-sign*key[i]));
          assert.deepEqual(forward,receiver==='additive'?ciphertext:delta);
          trials.push({seed:seedName,reversed,polynomial:polyName,sign,
            receiver,ioc:ioc(text),p55:ioc(text.slice(-76)),
            first40:roman(text.slice(0,40),corpus.translit)});
        }
      }
    }
  }
}
assert.equal(trials.length,32);
const max = Math.max(...trials.map(t=>t.ioc));
const min = Math.min(...trials.map(t=>t.ioc));
const native = corpus.pages[57].indices;
assert.equal(native.length,95);
const nativeIc = ioc(native);
assert.ok(max<0.04);
assert.ok(nativeIc>0.055);
trials.sort((a,b)=>b.ioc-a.ioc);
console.log(JSON.stringify({
  source:'original p0-p55 and p49-p51 table; p56/p57 excluded from encrypted input',
  length:ciphertext.length,red_spans:red.length,factor,
  source_cipher_ioc:ioc(ciphertext),known_clear_p57_ioc:nativeIc,
  trials:trials.length,min_ioc:min,max_ioc:max,
  top:trials.slice(0,4),bottom:trials.slice(-2),
  decision:'No source-born red16/degree16 continuous LFSR direct GP29 or successor-rank decrypt matches native GP English; all global fixed outer alphabets have identical IoC.'
},null,2));
console.log('PASS original-source red16 factor16 LFSR gate');
