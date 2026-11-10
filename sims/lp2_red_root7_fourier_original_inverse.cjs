'use strict';
/**
 * LP2 source-constrained seven-point finite-field Fourier original inverse.
 *
 * The red p39 triad is 15(X-24)^2 over F29. The double root 24 has order 7.
 * The seven illustrated pages p33–39 contribute 1,589 = 7*227 runes,
 * beginning at p33 local offset91. This tests natural seven-lane placements
 * of that keyless, invertible GF29 Fourier transform on the actual ciphertext.
 * Classification: negative for the stated direct-GP architectures; no key
 * or unknown plaintext recovered.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} p @returns {any} */
function load(p) { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8')); }
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} a @param {number} k @returns {number} */
function fpow(a, k) { let x = 1; for (let i = 0; i < k; i++) x = x * a % 29; return x; }
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, c) => s + c * (c - 1), 0) / (a.length * (a.length - 1));
}
/**
 * @param {number[]} block Seven GP-index symbols
 * @param {number} root Primitive seventh root of unity
 * @param {boolean} decrypt Use inverse Fourier transform
 * @returns {number[]}
 */
function fourier(block, root, decrypt) {
  assert.equal(block.length, 7);
  const out = [];
  for (let k = 0; k < 7; k++) {
    let sum = 0;
    for (let j = 0; j < 7; j++) {
      const exponent = mod(decrypt ? -j*k : j*k) % 7;
      sum += block[j] * fpow(root, exponent);
    }
    out.push(mod(sum * (decrypt ? 25 : 1))); // inv(7) mod 29 = 25.
  }
  return out;
}
/**
 * @param {number[]} a
 * @param {number} width
 * @param {'consecutive'|'lanes'} layout
 * @param {number} root
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function apply(a, width, layout, root, decrypt) {
  assert.equal(a.length, 7 * width);
  if (layout === 'consecutive') {
    const out = [];
    for (let j = 0; j < a.length; j += 7)
      out.push(...fourier(a.slice(j, j + 7), root, decrypt));
    return out;
  }
  const out = Array(a.length);
  for (let i = 0; i < width; i++) {
    const x = Array.from({length: 7}, (_, j) => a[j * width + i]);
    const y = fourier(x, root, decrypt);
    for (let j = 0; j < 7; j++) out[j * width + i] = y[j];
  }
  return out;
}
function main() {
  const mark = ink.pages.find(p => p.page === 39).red_spans.find(s => s.start === 119 && s.length === 3);
  assert.deepEqual([...mark.runes].map(r => corpus.runes.indexOf(r)), [27,5,15]);
  const roots = Array.from({length:29}, (_,x) => x).filter(x =>
    mod(27+5*x+15*x*x) === 0 && mod(5+30*x) === 0);
  assert.deepEqual(roots, [24]);
  const root = roots[0];
  assert.equal(fpow(root, 7), 1);
  for (let i = 1; i < 7; i++) assert.notEqual(fpow(root, i), 1);

  const pages = [corpus.pages.find(p => p.page === 33).indices.slice(91),
    ...[34,35,36,37,38,39].map(n => corpus.pages.find(p => p.page === n).indices)];
  assert.deepEqual(pages.map(p => p.length), [123,261,271,238,228,228,240]);
  const body = pages.flat();
  assert.equal(body.length, 1589);
  const layouts = [
    {name:'227 consecutive groups of seven',input:body,width:227,mode:'consecutive'},
    {name:'seven consecutive 227-symbol lanes',input:body,width:227,mode:'lanes'},
    {name:'123 columns from seven original pages',input:pages.flatMap(p=>p.slice(0,123)),width:123,mode:'lanes'}
  ];
  let prime = 2, j = 0, knownPrimes = [];
  while (knownPrimes.length < 85) {
    let isPrime = true;
    for (let k = 2; k*k <= prime; k++) if (prime%k===0) { isPrime=false; break; }
    if (isPrime) knownPrimes.push(prime);
    prime++;
  }
  const p56 = corpus.pages.find(p => p.page === 56).indices;
  const solved = p56.map((v,i) => i===56 ? v : mod(v-(knownPrimes[j++]-1)));
  assert.ok(ioc(solved)>0.06,'Authentic solved-p56 regression must look GP-linguistic');
  const reports = [];
  for (const config of layouts) for (const omega of [root, fpow(root,6)]) for (const decrypt of [true,false]) {
    const decoded = apply(config.input, config.width, config.mode, omega, decrypt);
    const recovered = apply(decoded, config.width, config.mode, omega, !decrypt);
    assert.deepEqual(recovered,config.input);
    const synthetic = Array.from({length:config.input.length},(_,i)=>solved[i%solved.length]);
    const planted = apply(synthetic, config.width, config.mode, omega, !decrypt);
    assert.deepEqual(apply(planted,config.width,config.mode,omega,decrypt),synthetic);
    reports.push({layout:config.name,omega,direction:decrypt?'inverse':'forward',runes:config.input.length,
      originalIoC:ioc(config.input),outputIoC:ioc(decoded),plantedIoC:ioc(synthetic),
      preview:decoded.slice(0,35).map(n=>corpus.translit[n]).join('')});
  }
  assert(reports.every(r=>r.outputIoC<0.04));
  console.log(JSON.stringify({classification:'SOURCE-ROOT7 DIRECT GP29 FOURIER NEGATIVE',
    originalRedTriad:[27,5,15],root:24,rootPeriod:7,illustratedPages:[33,39],
    originalSectionRunes:1589,results:reports,
    conclusion:'All original outputs remain near uniform; all source and planted inputs invert exactly; no unknown plaintext or key.'},null,2));
}
if (require.main === module) main();
module.exports = {fourier,apply,main};
