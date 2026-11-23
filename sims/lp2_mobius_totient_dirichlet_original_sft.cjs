'use strict';
/**
 * Authentic LP1 Möbius/totient source-cued Dirichlet-convolution decipherment SFT.
 *
 * Directly test two fully specified, reversible arithmetic receivers, rather
 * than fitting private alphabet keys:
 *   zeta convolution: C[n] = sum_{d|n} P[d] mod 29
 *   Euler convolution: C[n] = sum_{d|n} phi(n/d)*P[d] mod 29.
 * Both n indices are one-based and preserve every original rune exactly.
 *
 * Run from repository root with Node 22:
 * node sims/lp2_mobius_totient_dirichlet_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const load = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const originals = gp.pages.filter(p => p.page<=55).flatMap(p=>p.indices);
assert.equal(originals.length,12956);
const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,53],[54,55]];
/** @param {number} N */
function phiUpTo(N) {
  const phi=Array.from({length:N+1},(_,i)=>i);
  phi[1]=1;
  for(let p=2;p<=N;p++) if(phi[p]===p) {
    for(let k=p;k<=N;k+=p)phi[k]-=phi[k]/p;
  }
  return phi;
}
const ones=Array(originals.length+1).fill(1),totients=phiUpTo(originals.length);
assert.deepEqual(totients.slice(1,11),[1,1,2,2,4,2,6,4,6,4]);
/**
 * Exact invertible Dirichlet convolution in F29. Every coefficient w[1]=1.
 * @param {number[]} plaintext @param {number[]} w
 * @returns {number[]}
 */
function forward(plaintext,w) {
  const out=Array(plaintext.length+1).fill(0);
  for(let d=1;d<=plaintext.length;d++)
    for(let k=d;k<=plaintext.length;k+=d)
      out[k]=(out[k]+w[k/d]*plaintext[d-1])%29;
  return out.slice(1);
}
/**
 * Exact triangular Möbius/phi convolution inverse. All proper-divisor
 * contributions are removed in increasing divisor order.
 * @param {number[]} ciphertext @param {number[]} w
 * @returns {number[]}
 */
function inverse(ciphertext,w) {
  const out=[0,...ciphertext];
  for(let d=1;d<=ciphertext.length;d++)
    for(let k=2*d;k<=ciphertext.length;k+=d)
      out[k]=((out[k]-w[k/d]*out[d])%29+29)%29;
  return out.slice(1);
}
/** @param {number[]} values */
function ioc(values) {
  assert(values.length>=2);
  const freq=Array(29).fill(0);
  for(const value of values){assert(Number.isInteger(value) && value>=0 && value<29);freq[value]++;}
  return freq.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const originalIoc=ioc(originals);
assert(Math.abs(originalIoc-0.03447839786450569)<1e-12);
const report=[];
for(const [label,w,expected] of [
  ['zeta/Mobius',ones,0.034479208135983576],
  ['Euler/totient',totients,0.03447108158969068]
]){
  const plaintext=inverse(originals,w);
  const originalReplayed=forward(plaintext,w);
  assert.deepEqual(originalReplayed,originals,'Must reconstruct every GP source rune');
  assert(Math.abs(ioc(plaintext)-expected)<1e-12);
  const solved=gp.pages[57].indices;
  assert.deepEqual(inverse(forward(solved,w),w),solved,
    'Authentic solved p57 natural-GP encryption/inverse positive');
  const chapters=[];
  for(const [first,last] of chapterRanges){
    const chapter=gp.pages.filter(p=>p.page>=first&&p.page<=last)
      .flatMap(p=>p.indices);
    const decoded=inverse(chapter,w);
    assert.deepEqual(forward(decoded,w),chapter);
    chapters.push({pages:first+'-'+last,runes:chapter.length,
      ciphertextIoc:ioc(chapter),inverseIoc:ioc(decoded)});
  }
  report.push({operator:label,entireBookIoc:ioc(plaintext),
    sourceExactForwardReplay:originalReplayed.length,
    authenticSolvedP57Positive:solved.length,chapters});
}
/** @param {string} text @returns {number[]} */
function nativeControl(text){
  const source=text.replace(/^#.*$/gm,' ').toUpperCase()
    .replace(/ING/g,'NG').replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
  const letters=(source.match(/[A-Z]+/g)||[]).join('');
  const symbols=gp.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
  const out=[];
  for(let pos=0;pos<letters.length;){
    const runic=symbols.find(s=>letters.startsWith(s.x,pos));
    assert(runic,'Missing native-glyph spelling at index '+pos);
    out.push(runic.i);
    pos+=runic.x.length;
    if(out.length===originals.length)break;
  }
  assert.equal(out.length,originals.length);
  return out;
}
/*
 * Affine-mask all-key check on the Euler receiver: C=a*(phi*P)+b.
 * Since a is any nonzero element of GF29 and multiplying P by its inverse
 * permutes all GP indices, the IoC depends only on beta=b/a. Exactly 29
 * offsets enumerate all 28*29 affine models without fitting language keys.
 * For zeta convolution, mu*constant is an impulse at n1, so any b only
 * changes the first putative plaintext rune: all n>=2 IoCs are identical.
 */
const betaIocs=[];
const eulerUnmasked=inverse(originals,totients);
const eulerConstant=inverse(Array(originals.length).fill(1),totients);
for(let beta=0;beta<29;beta++){
  const decoded=eulerUnmasked.map((v,i)=>
    ((v-beta*eulerConstant[i])%29+29)%29);
  betaIocs.push({beta, ioc:ioc(decoded)});
}
betaIocs.sort((a,b)=>b.ioc-a.ioc);
assert.equal(betaIocs[0].beta,2);
assert(Math.abs(betaIocs[0].ioc-0.03451904251172719)<1e-12);
assert(betaIocs.every(x=>x.ioc<0.036));
const moebiusUnmasked=inverse(originals,ones);
const moebiusConstant=inverse(Array(originals.length).fill(1),ones);
assert(moebiusConstant.slice(1).every(x=>x===0));
assert.equal(moebiusConstant[0],1);
assert(Math.abs(ioc(moebiusUnmasked.slice(1))-0.034479892610426)<0.000003);

const native = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt']
].map(([name,p])=>({name,ioc:ioc(nativeControl(load(p)))}));
assert(native.every(x=>x.ioc>0.045));
assert(report.every(x=>x.entireBookIoc<0.036));
console.log(JSON.stringify({status:'PASS: exact source-preserving inverse, no original plaintext',
  hypothesis:'LP1 MOBIUS+TOTIENT Dirichlet convolution; unsourced receiver',
  sourceIoc:originalIoc,nativeControls:native,eulerAllAffineOffsets:betaIocs,originalReceivers:report},null,2));
