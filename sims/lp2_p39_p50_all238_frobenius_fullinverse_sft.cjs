'use strict';

/**
 * Source-fixed GF(29^238) Frobenius orbit inverse on original p39 red-structured body.
 * Tests every field automorphism x -> x^(29^k), k=0..237, under the
 * independently printed p50 table's exact degree-238 factor.
 *
 * Reproducer: node sims/lp2_p36_field_frobenius_orbit_sft.cjs
 * Node 22, built-ins only; no fitted key, no hidden samples.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const MOD = 29;
const DEG = 238;
/** @param {number} value @returns {number} */
const mod = (value) => ((value % MOD) + MOD) % MOD;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function polyMul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/** Monic exact GF29 division, low coefficients first.
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function polyDivMonic(a, b) {
  assert.equal(b.at(-1), 1);
  const remainder = a.slice();
  const quotient = Array(a.length - b.length + 1).fill(0);
  for (let k = remainder.length - 1; k >= b.length - 1; k--) {
    const value = mod(remainder[k]);
    const offset = k - b.length + 1;
    quotient[offset] = value;
    for (let j = 0; j < b.length; j++)
      remainder[offset + j] = mod(remainder[offset + j] - value * b[j]);
  }
  assert(remainder.slice(0, b.length - 1).every((v) => v === 0));
  while (quotient.at(-1) === 0) quotient.pop();
  return quotient;
}

assert.equal(gp.pages[36].indices.length, DEG);
assert.equal(gp.pages[3].indices.length, 217);
assert.equal(gp.pages[39].indices.length, 240);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every((row) => row.length === 8));
const bytes = grid.byte_rows.flat();
const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const small = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
].reduce((a, b) => polyMul(a, b), [1]);
assert.equal(small.length, 17);
const originalTablePoly = bytes.map((v) => v % MOD).reverse();
const R = polyDivMonic(originalTablePoly, small).map((v) => mod(-v));
assert.equal(R.length, DEG + 1);
assert.equal(R.at(-1), 1);
assert.equal(R[0], 5);
assert.deepEqual(polyMul(small, R).map((v) => mod(-v)), originalTablePoly.slice(0, 255));

/* Linear basis: F[j] contains the coefficients of X^(29j) mod R.
 * This computes the entire Frobenius operation from the original p50 bytes.
 */
const basis = [];
let current = Array(DEG).fill(0);
current[0] = 1;
for (let j = 0; j < DEG; j++) {
  basis.push(current.slice());
  const shifted = Array(DEG + MOD).fill(0);
  for (let i = 0; i < DEG; i++) shifted[i + MOD] = current[i];
  for (let k = shifted.length - 1; k >= DEG; k--) {
    const value = mod(shifted[k]);
    if (value !== 0)
      for (let i = 0; i < DEG; i++)
        shifted[k - DEG + i] -= value * R[i];
  }
  current = shifted.slice(0, DEG).map(mod);
}

/** @param {number[]} input @returns {number[]} */
function frobenius(input) {
  assert.equal(input.length, DEG);
  const out = new Int32Array(DEG);
  for (let i = 0; i < DEG; i++) if (input[i] !== 0) {
    const v = input[i];
    for (let j = 0; j < DEG; j++) out[j] += v * basis[i][j];
  }
  return Array.from(out, mod);
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(MOD).fill(0);
  for (const v of input) counts[v]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (input.length * (input.length - 1));
}


const red=gp.pages[39].indices.slice(119,122);
assert.deepEqual(red,[27,5,15]);
const p39=gp.pages[39].indices.slice(1,-1);
assert.equal(p39.length,DEG);
const targets=[
  ['printed 238-rune p39 exterior shed',p39],
  ['reversed 238-rune p39 exterior shed',p39.slice().reverse()]
];
const audits=[];
for(const [name,seed] of targets){
  let current=seed.slice();
  const iocs=[];
  let winner={exponent:-1,ioc:-Infinity};
  for(let k=0;k<DEG;k++){
    const value=ioc(current);
    iocs.push(value);
    if(value>winner.ioc)winner={exponent:k,ioc:value,
      preview:current.slice(0,90).map(x=>gp.translit[x]).join('')};
    current=frobenius(current);
  }
  assert.deepEqual(current,seed);
  assert.equal(iocs.length,238);
  assert.ok(winner.ioc<0.045);
  audits.push({name,all238AutomorphismsTested:true,
    max: winner,min: Math.min(...iocs),
    countAbove0point05:iocs.filter(x=>x>=0.05).length});
}
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
assert.deepEqual(native.runes,gp.runes);
const original=Array.from(native.sections.find(x=>x.name==='0_loss_of_divinity').source_text)
  .filter(c=>native.runes.includes(c)).map(c=>native.runes.indexOf(c)).slice(0,DEG);
assert.equal(original.length,DEG);
assert.ok(ioc(original)>0.05);
let encrypted=original.slice();
for(let k=0;k<red[1];k++)encrypted=frobenius(encrypted);
let restored=encrypted.slice();
for(let k=0;k<DEG-red[1];k++)restored=frobenius(restored);
assert.deepEqual(restored,original);
console.log(JSON.stringify({
  source:'exact p50 table R238, original p39 red 27/5/15 and outer-shed 238, all Frobenius field automorphisms',
  field:'GF(29^238)',red, countExponentChoices:DEG,
  original:audits,
  solvedNative238:{length:original.length,ioc:ioc(original),
    red5Encrypted:ioc(encrypted),exact238Recovery:true},
  result:'No native-language GP29 output under any of the 238 source-defined Frobenius automorphisms in either unchanged p39 coefficient orientation'
},null,2));
