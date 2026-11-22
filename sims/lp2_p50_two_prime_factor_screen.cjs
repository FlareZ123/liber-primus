#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rows = source.byte_rows;
assert.equal(rows.length, 32, 'source grid must have 32 rows');
assert.ok(rows.every(row => row.length === 8), 'each source row must have 8 cells');

const rowMajor = Buffer.from(rows.flat());
assert.equal(rowMajor.length, 256, 'base60-derived grid must contain 256 bytes');
const sourceSha256 = crypto.createHash('sha256').update(rowMajor).digest('hex');
assert.equal(sourceSha256, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290', 'source byte reading changed');

const layouts = [
  ['first16rows_vs_last16rows', [rowMajor.subarray(0, 128), rowMajor.subarray(128)]],
  ['left4cols_vs_right4cols', [
    Buffer.from(rows.flatMap(row => row.slice(0, 4))),
    Buffer.from(rows.flatMap(row => row.slice(4, 8)))
  ]],
  ['evenCols_vs_oddCols', [
    Buffer.from(rows.flatMap(row => row.filter((_, col) => col % 2 === 0))),
    Buffer.from(rows.flatMap(row => row.filter((_, col) => col % 2 === 1)))
  ]],
  ['evenRows_vs_oddRows', [
    Buffer.from(rows.filter((_, row) => row % 2 === 0).flat()),
    Buffer.from(rows.filter((_, row) => row % 2 === 1).flat())
  ]]
];

function asBigInt(bytes, endian) {
  const ordered = endian === 'LE' ? Buffer.from(bytes).reverse() : bytes;
  return BigInt('0x' + ordered.toString('hex'));
}
function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = result * base % modulus;
    base = base * base % modulus;
    exponent >>= 1n;
  }
  return result;
}
function isStrongCompositenessWitness(n, base) {
  if (n < 5n || base < 2n || base > n - 2n) return false;
  let d = n - 1n, s = 0;
  while ((d & 1n) === 0n) { d >>= 1n; s++; }
  let x = modPow(base, d, n);
  if (x === 1n || x === n - 1n) return false;
  for (let round = 1; round < s; round++) {
    x = x * x % n;
    if (x === n - 1n) return false;
  }
  return true;
}
const smallPrimes = [
  2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,
  97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,
  191,193,197,199,211,223,227,229,233,239,241,251
];

const results = [];
for (const [layout, halves] of layouts) {
  assert.equal(halves.length, 2);
  for (const half of halves) assert.equal(half.length, 128);
  for (let halfIndex = 0; halfIndex < 2; halfIndex++) {
    for (const endian of ['BE', 'LE']) {
      const candidateBytes = endian === 'LE' ? Buffer.from(halves[halfIndex]).reverse() : Buffer.from(halves[halfIndex]);
      const n = asBigInt(halves[halfIndex], endian);
      const bits = n.toString(2).length;
      let smallFactor = null;
      for (const p of smallPrimes) if (n % BigInt(p) === 0n) { smallFactor = p; break; }
      const mrWitness = smallFactor === null && isStrongCompositenessWitness(n, 4n) ? 4 : null;
      const primeCheck = crypto.checkPrimeSync(candidateBytes, { checks: 64 });
      assert.equal(primeCheck, false, layout + ' half ' + (halfIndex + 1) + ' ' + endian + ' unexpectedly prime');
      assert.ok(smallFactor !== null || mrWitness !== null, layout + ' half ' + (halfIndex + 1) + ' ' + endian + ' lacks a recorded composite witness');
      results.push({layout, half:halfIndex+1, endian, bits, odd:(n&1n)===1n, small_factor:smallFactor, strong_mr_witness:mrWitness});
    }
  }
}

const { privateKey } = crypto.generateKeyPairSync('rsa', {modulusLength:2048, publicExponent:65537});
const privateJwk = privateKey.export({format:'jwk'});
const fromBase64url = value => BigInt('0x' + Buffer.from(value, 'base64url').toString('hex'));
const p = fromBase64url(privateJwk.p), q = fromBase64url(privateJwk.q);
assert.equal(p.toString(2).length, 1024);
assert.equal(q.toString(2).length, 1024);
for (const factor of [p,q]) {
  const factorBytes = Buffer.from(factor.toString(16).padStart(256,'0'),'hex');
  assert.equal(crypto.checkPrimeSync(factorBytes,{checks:64}),true);
  assert.equal(smallPrimes.some(prime=>factor%BigInt(prime)===0n),false);
  assert.equal(isStrongCompositenessWitness(factor,4n),false);
}
assert.equal(results.length,16);
assert.equal(results.filter(r=>r.small_factor!==null).length,15);
assert.equal(results.filter(r=>r.strong_mr_witness!==null).length,1);
assert.deepEqual(results.filter(r=>r.strong_mr_witness!==null).map(r=>({layout:r.layout,half:r.half,endian:r.endian,witness:r.strong_mr_witness})),[
  {layout:'left4cols_vs_right4cols',half:2,endian:'LE',witness:4}
]);
console.log(JSON.stringify({
  source_sha256:sourceSha256,
  candidates:results.length,
  composite_candidates:results.length,
  small_factor_count:15,
  strong_mr_witness_count:1,
  results,
  positive_control:'generated RSA-2048 p and q are both 1024-bit primes and pass checks'
},null,2));
