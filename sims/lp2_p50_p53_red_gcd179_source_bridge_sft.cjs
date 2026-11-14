'use strict';
/**
 * Exact cross-radix, source-visible original-input GCD decision.
 *
 * This is a bounded mathematical key-source observation, not an LP2 decryptor.
 * Source: original 32x8 two-digit table and every original red GP span.
 * Tested controls: every other source red inscription, reversed source reads,
 * compact base59 redigitization, and fixed natural-length quotient consumers.
 *
 * Run: node sims/lp2_p50_p53_red_gcd179_source_bridge_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, createDecipheriv, createCipheriv} = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const grid = json('resources/liber-primus/base60-grid.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(grid.rows.flat().map(t =>
  60 * grid.alphabet.indexOf(t[0]) + grid.alphabet.indexOf(t[1])), bytes);

/** @param {number[]} values @param {number} radix @returns {bigint} */
function integer(values, radix) {
  return values.reduce((value, x) => value * BigInt(radix) + BigInt(x), 0n);
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}
/** @param {bigint} integerValue @returns {number[]} */
function byteDigits(integerValue) {
  let n = integerValue;
  const out = [];
  do { out.unshift(Number(n % 256n)); n /= 256n; }
  while (n > 0n);
  return out;
}
/** @param {bigint} value @param {number} length @returns {Buffer} */
function fixedBytes(value,length) {
  const out=Buffer.alloc(length);
  let n=value;
  for(let i=length-1;i>=0;i--){out[i]=Number(n%256n);n/=256n;}
  assert.equal(n,0n);
  return out;
}
const tableN = integer(bytes, 256);
const sourceRune = new Map(corpus.runes.map((x, i) => [x, i]));
const spans = ink.pages.flatMap(page => (page.red_spans || []).map(span => {
  const runes = Array.from(span.runes, symbol => sourceRune.get(symbol));
  assert(runes.every(Number.isInteger));
  return {page:page.page, offset:span.start, len:span.length,
    runes, number:integer(runes, 29)};
}));
assert.equal(spans.length, 18);
const matches = spans.map(({page,offset,len,number}) =>
  ({page,offset,len,gcd:gcd(tableN,number)}));
const target = spans.find(x => x.page === 53);
assert(target);
assert.deepEqual({offset:target.offset,len:target.len},{offset:128,len:51});
const p53 = corpus.pages.find(p => p.page === 53);
const p55 = corpus.pages.find(p => p.page === 55);
assert.deepEqual(target.runes, p53.indices.slice(128));
assert.equal(p53.indices.length, 179);
assert.equal(p55.indices.length, 76);
assert.equal(gcd(tableN,target.number), 358n);
assert.equal(tableN % (179n*179n), 0n);
assert.notEqual(tableN % (179n*179n*179n), 0n);
assert.equal(target.number % 179n, 0n);
assert.notEqual(target.number % (179n*179n), 0n);
assert.equal(matches.filter(x => x.gcd % 179n === 0n).length, 1);
assert.equal(matches.filter(x => x.page !== 53).reduce(
  (best, item) => item.gcd > best ? item.gcd : best, 0n), 56n);
assert.equal(gcd(tableN,integer(target.runes.slice().reverse(),29)),2n);
assert.equal(gcd(integer(bytes.slice().reverse(),256),target.number),1n);
const smallerAlphabet = grid.alphabet.replace('f','');
assert.equal(smallerAlphabet.length,59);
const smallerBytes = grid.rows.flat().map(t =>
  59*smallerAlphabet.indexOf(t[0]) + smallerAlphabet.indexOf(t[1]));
assert(smallerBytes.every(x => x >= 0 && x < 256));
assert.equal(gcd(integer(smallerBytes,256),target.number),1n);
const lowDigits = grid.rows.flat().map(t => t[1]);
assert.deepEqual(Array.from(grid.alphabet)
  .filter(ch => !lowDigits.includes(ch)),['f']);
assert.equal(grid.alphabet.indexOf('f'),41);
// Source-specific symmetric-key consumer: base29 red integer is 247 bits,
 // so its canonical fixed-width 32-byte representation is an AES-256 key.
 // The reduced red integer is an independently defined alternate key.
 // There is no Cicada-authenticated instruction selecting AES/IV/mode.
const redKeys=[
  ['p53 red as base29 integer',fixedBytes(target.number,32)],
  ['p53 red divided by shared 179',fixedBytes(target.number/179n,32)]
];
const aes=[];
for(const [keyLabel,key] of redKeys){
  for(const [mode,iv] of [
    ['aes-256-ecb',null],
    ['aes-256-cbc',Buffer.alloc(16)],
    ['aes-256-ctr',Buffer.alloc(16)]]) {
    const decoder=createDecipheriv(mode,key,iv);
    decoder.setAutoPadding(false);
    const out=Buffer.concat([decoder.update(Buffer.from(bytes)),decoder.final()]);
    assert.equal(out.length,256);
    const encoder=createCipheriv(mode,key,iv);
    encoder.setAutoPadding(false);
    assert.deepEqual(Buffer.concat([encoder.update(out),encoder.final()]),
      Buffer.from(bytes));
    const printable=Array.from(out).filter(x=>
      (x>=32 && x<=126) || x===10 || x===13).length;
    aes.push({keyLabel,mode,printableOf256:printable,
      initial16Hex:out.subarray(0,16).toString('hex')});
  }
}
assert.equal(aes.length,6);
const quotient255 = byteDigits(tableN/(179n*179n));
assert.equal(quotient255.length,255);
assert.equal(p53.indices.length+p55.indices.length,255);

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const product = Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    product[i+j] = mod(product[i+j]+a[i]*b[j]);
  return product;
}
const polynomial = multiply([3,26,24],[27,5,15]);
assert.deepEqual(polynomial,[23,21,11,17,12]);
const work = bytes.map(x => x%29).reverse();
const q = Array(252).fill(0);
let leadingInverse = 0;
for(let i=1;i<29;i++)if(i*polynomial[4]%29===1)leadingInverse=i;
assert(leadingInverse!==0);
for(let k=255;k>=4;k--) {
  const multiplier=mod(work[k]*leadingInverse);
  q[k-4]=multiplier;
  for(let t=0;t<5;t++)
    work[k-4+t]=mod(work[k-4+t]-multiplier*polynomial[t]);
}
assert(work.every(value => value===0));
assert.equal(q.at(-1),0);
const quotient252=q.slice().reverse();
const quotient251=quotient252.slice(1);
assert.equal(quotient251.length,251);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for(const symbol of symbols) counts[symbol]++;
  return counts.reduce((s,n) => s + n*(n-1),0)/
    (symbols.length*(symbols.length-1));
}
/**
 * Use only the natural source-order two-page concatenation and the
 * two arithmetic signs. No key phase, skip, page restarts or fitting.
 * @param {number[]} key
 * @param {number[]} source
 */
function direct(key,source) {
  assert.equal(key.length,source.length);
  const out = [];
  for(const reverse of [false,true])for(const sign of [-1,1]) {
    const k = reverse ? key.slice().reverse() : key;
    const decoded = source.map((value,i) => mod(value+sign*k[i]));
    assert.deepEqual(decoded.map((v,i) => mod(v-sign*k[i])),source);
    out.push({reverse,sign,ioc:ioc(decoded)});
  }
  return out;
}
const pages=corpus.pages.filter(p=>p.page<56 && p.indices.length);
const pairs=n=>pages.flatMap((p,i)=>pages.slice(i+1)
  .filter(q=>p.indices.length+q.indices.length===n)
  .map(q=>[p.page,q.page]));
assert.deepEqual(pairs(251),[[15,51]]);
assert.deepEqual(pairs(252),[[22,32]]);
assert.deepEqual(pairs(255),[[53,55]]);
const byPage=n=>corpus.pages.find(p=>p.page===n).indices;
const tests=[
  {key:'H/G quotient251',pagePair:[15,51],
    metrics:direct(quotient251,[...byPage(15),...byPage(51)])},
  {key:'H/G fixed252',pagePair:[22,32],
    metrics:direct(quotient252,[...byPage(22),...byPage(32)])},
  {key:'integer quotient255',pagePair:[53,55],
    metrics:direct(quotient255.map(v=>v%29),[...byPage(53),...byPage(55)])}
];
assert(tests.every(t => t.metrics.every(m => m.ioc < 0.04)));
const reference=corpus.pages.find(p=>p.page===57).indices;
assert.equal(reference.length,95);
const cipher=reference.map((x,i)=>mod(x+quotient251[i]));
assert.deepEqual(cipher.map((x,i)=>mod(x-quotient251[i])),reference);
console.log(JSON.stringify({
  source:'Original p49-p51 256-byte table and 18 original red GP inscriptions',
  gridSHA256:createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  uniqueRedCrossRadixGCD:{
    page:53,offset:128,redRunes:51,
    gcd:gcd(tableN,target.number).toString(),factor:179,
    table179Valuation:2,red179Valuation:1,largestOtherGCD:56,
    other179DivisibleRedSpans:0},
  controls:{
    originalRedReversedGCD:2,
    originalTableReversedGCD:1,
    alternativeBase59GCD:1,
    absentLowDigit:'f',absentDigitIndex:41},
  sourceQuotientLengths:[quotient251.length,quotient252.length,quotient255.length],
  uniqueNonemptyPagePairs:{251:pairs(251),252:pairs(252),255:pairs(255)},
  frozenDirectGP29SubtractionsAndAdditions:tests,
  frozenAES256OriginalTableInversion:aes,
  solvedP57SyntheticAdditiveControl:reference.length,
  result:'No unknown LP2 plaintext, key schedule or chosen cipher operation recovered'
},null,2));
