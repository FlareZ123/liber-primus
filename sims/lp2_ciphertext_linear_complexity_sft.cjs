'use strict';

/**
 * Necessary-condition test: can original GP29 ciphertext be the direct
 * output of an order <= 256 linear feedback register over GF(29)?
 *
 * Run with Node.js 22 from the repository root.
 * This is a key-independent original-cipher exclusion. It does not test
 * an LFSR keystream hidden beneath unknown plaintext or output filtering.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const MOD = 29;
const inverses = new Int8Array(MOD);
for (let i = 1; i < MOD; i++) {
  for (let j = 1; j < MOD; j++) if ((i * j) % MOD === 1) inverses[i] = j;
}
assert.ok(Array.from(inverses.slice(1)).every(x => x > 0));

/**
 * Exact Berlekamp-Massey linear complexity over GF(29).
 * @param {number[]} sequence Original GP29 rune indices.
 * @returns {{size: number, complexity: number, updates: number}}
 */
function linearComplexity(sequence) {
  const n = sequence.length;
  const C = new Int32Array(n + 1);
  let B = new Int32Array(n + 1);
  C[0] = B[0] = 1;
  let L = 0, m = 1, b = 1, updates = 0;
  for (let k = 0; k < n; k++) {
    let d = sequence[k];
    for (let i = 1; i <= L; i++) d += C[i] * sequence[k - i];
    d = ((d % MOD) + MOD) % MOD;
    if (!d) { m++; continue; }
    const old = C.slice(), factor = d * inverses[b] % MOD;
    for (let i = 0; i + m <= n; i++) {
      C[i + m] = ((C[i + m] - factor * B[i]) % MOD + MOD) % MOD;
    }
    if (2 * L <= k) {
      L = k + 1 - L;
      B = old;
      b = d;
      m = 1;
      updates++;
    } else {
      m++;
    }
  }
  return {size:n,complexity:L,updates};
}

/**
 * Re-evaluate a generated sequence independently for planted controls.
 * @param {number[]} seed
 * @param {number[]} taps
 * @param {number} wanted
 */
function extend(seed, taps, wanted) {
  const a = seed.slice();
  for (let i = a.length; i < wanted; i++) {
    let z=0;
    for(let j=1;j<=taps.length;j++) z=(z+taps[j-1]*a[i-j])%MOD;
    a.push(z);
  }
  return a;
}

for (const order of [1, 2, 16, 29, 256]) {
  const seed = Array.from({length:order}, (_, i) => (7*i+11)%MOD);
  const taps = Array.from({length:order}, (_, i) => (3*i+1)%MOD);
  const planted = extend(seed, taps, order + 2*order + 64);
  const actual = linearComplexity(planted);
  assert.ok(actual.complexity <= order, JSON.stringify(actual));
}
const pages=corpus.pages.filter(p => p.page<=55 && p.indices.length);
const all=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(all.length,12956);
const full=linearComplexity(all);
assert.deepEqual(full,{size:12956,complexity:6478,updates:6262});
const pageValues=pages.map(p=>({page:p.page,length:p.indices.length,complexity:linearComplexity(p.indices).complexity}));
assert.equal(pageValues.length,55);
assert.ok(pageValues.every(p=>p.complexity>=Math.floor(p.length/2)));
const solved=corpus.pages.filter(p=>p.page>=56).flatMap(p=>p.indices);
assert.equal(linearComplexity(solved).complexity,90);
console.log(JSON.stringify({
  statement:'No direct unmasked GF29 LFSR with register order <=256 generates all original unknown ciphertext runes.',
  original_runes:all.length,full_book:full,
  page_result:'All 55 original physical rune-bearing pages have complexity at least floor(length/2).',
  min_page_length:Math.min(...pageValues.map(p=>p.length)),
  max_page_length:Math.max(...pageValues.map(p=>p.length)),
  solved_control:linearComplexity(solved),
  planted_orders:[1,2,16,29,256],
  limitations:'No exclusion of any masked keystream, nonlinear update, variable register, non-GP payload, or ciphertext-dependent feedback.'
},null,2));
