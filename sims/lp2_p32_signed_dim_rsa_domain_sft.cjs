'use strict';

/**
 * Source-prompted direct RSA-domain exclusion for original LP2 p32.
 * Node 22 SFT: node sims/lp2_p32_signed_dim_rsa_domain_sft.cjs
 * JSDoc and exact original GP29 input; no inferred exponent or fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{page:number, indices:number[]}} Page */
/** @typedef {{pages:Page[],prime:number[]}} Corpus */
/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find(p => p.page === 32);
assert(page, 'Missing source p32');
const c = page.indices, gp = corpus.prime;
assert.equal(c.length, 121);
assert.equal(gp.length, 29);
assert(c.every(x => x >= 0 && x < 29 && Number.isInteger(x)));

/** @param {number} n @returns {boolean} */
function prime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n > 1;
}

const horizontal = c.slice(0, 11).reduce((s, x) => s + gp[x], 0);
const vertical = Array.from({length:11}, (_, i) => gp[c[11*i]])
  .reduce((s, x) => s + x, 0);
assert.deepEqual([horizontal, vertical], [563, 569]);
assert(prime(horizontal) && prime(vertical));
const modulus = horizontal * vertical;
assert(29**3 < modulus && modulus < 29**4);

/** @param {number[]} block */
const from29 = block => block.reduce((v, x) => 29*v+x, 0);
/** @param {number} value @returns {number[]} */
function to29(value) {
  assert(Number.isInteger(value) && value >= 0 && value < 29**4);
  const result = Array(4).fill(0);
  for (let i = 3; i >= 0; i--) {
    result[i] = value % 29;
    value = Math.floor(value/29);
  }
  return result;
}
/** @param {number[]} values @param {number} phase */
function inspect(values, phase) {
  let count = 0, impossible = 0, first = null;
  for (let start = phase; start + 4 <= values.length; start += 4) {
    const v = from29(values.slice(start, start + 4));
    if (v >= modulus) {
      impossible++;
      if (first === null) first = {start, value:v};
    }
    count++;
  }
  return {count, impossible, first};
}

const results = [];
for (const direction of ['forward', 'reverse']) {
  const digits = direction === 'forward' ? c : c.slice().reverse();
  for (let phase = 0; phase < 4; phase++) {
    const record = inspect(digits, phase);
    results.push({direction, phase, ...record});
    assert(record.impossible > 0, 'An original RSA packing survived: investigate');
  }
}
assert.deepEqual(results.map(x => x.impossible),
  [16,23,11,16,15,17,10,23]);
assert.deepEqual(results.map(x => x.count), [30,30,29,29,30,30,29,29]);

/** @param {bigint} x @param {bigint} exp @param {bigint} n */
function modpow(x, exp, n) {
  let out = 1n, base = x % n;
  for (; exp > 0n; exp >>= 1n) {
    if (exp & 1n) out = out * base % n;
    base = base * base % n;
  }
  return out;
}
const n = BigInt(modulus), e = 65537n, d = 160833n;
assert.equal(e*d % BigInt((horizontal-1)*(vertical-1)), 1n);
const planted = Array.from({length:30}, (_, i) => (i*7919+3301)%modulus);
const encrypted = planted.flatMap(v => to29(Number(modpow(BigInt(v), e, n))));
assert.equal(inspect(encrypted, 0).impossible, 0);
const recovered = Array.from({length:30}, (_, i) =>
  Number(modpow(BigInt(from29(encrypted.slice(4*i,4*i+4))), d, n)));
assert.deepEqual(recovered, planted);

console.log(JSON.stringify({
  status:'Bounded necessary-condition negative; no LP2 plaintext or key',
  source:'Original LP2 p32 121 GP runes and signed 2016 563x569 JPEG dimensions',
  source_first_row_and_column_prime_sums:[horizontal,vertical],
  proposed_RSA_modulus:modulus, original:results,
  verdict:'All eight direct four-GP29-digit ciphertext framings violate RSA residue range',
  positive_control:'30/30 native base29 RSA blocks round-trip under exponent 65537'
},null,2));
