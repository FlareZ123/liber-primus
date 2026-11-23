'use strict';

/**
 * Hypothesis: the original solved p15 upper-left-centre outward Fibonacci
 * numeral spiral dictates the read order of the original p50 32x8 byte grid.
 *
 * The 256-byte output could carry a 2048-bit private prime p or CRT exponent
 * d_p/d_q for one of the two authentic Cicada 4096-bit RSA moduli. Either
 * role has a constructive factor-recovery test and needs no language guesses.
 *
 * Two source-natural geometries: one centre-out 32x8 spiral, or four consecutive
 * 8x8 centre-out tiles in printed top-to-bottom order. Original 4x4 p15
 * exactly pins centre, clockwise order right/down/left/up, and outward steps.
 * Two established printable radix readings and two ordinary integer byte
 * orders are admitted. This is a hypothesis; LP2 never directs RSA extraction.
 *
 * Read-only Node.js 22 CommonJS. No external packages; deterministic.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { dearmor, parseKeys } = require('./grid_rsa_pgp_signature.cjs');

const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(grid.pages.length, 3);
assert.equal(tokens.length, 256);
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
function decodeTokens(alphabet) {
  const values = tokens.map((s) =>
    alphabet.indexOf(s[0]) * alphabet.length + alphabet.indexOf(s[1]));
  assert.ok(values.every((n) => n >= 0 && n <= 255 && Number.isInteger(n)));
  return values;
}
const base60 = decodeTokens(alphabet60);
const base59 = decodeTokens(alphabet59);
assert.deepEqual(base60, grid.pages.flatMap((p) => p.bytes));
assert.equal(base60.reduce((s, b) => s + b, 0), 33006);
assert.equal(base59.reduce((s, b) => s + b, 0), 32499);

/**
 * Start at the upper-left of four central cells, exactly as p15's red 3299.
 * Traverse right, down, left, up with increasing step lengths 1,1,2,2,...
 * In a rectangle, retain only cells within the original printed rectangle.
 * @param {number} h
 * @param {number} w
 * @returns {number[]}
 */
function centreSpiral(h, w) {
  assert.equal(h % 2, 0);
  assert.equal(w % 2, 0);
  let row = h / 2 - 1;
  let col = w / 2 - 1;
  const out = [];
  const seen = new Set();
  function mark() {
    if (row < 0 || row >= h || col < 0 || col >= w) return;
    const p = row * w + col;
    assert.ok(!seen.has(p), 'spiral cannot revisit a source cell');
    seen.add(p);
    out.push(p);
  }
  mark();
  for (let n = 1; out.length < h * w; n++) {
    const directions = [[0, 1, n], [1, 0, n], [0, -1, n + 1], [-1, 0, n + 1]];
    for (const [dr, dc, count] of directions) {
      for (let step = 0; step < count; step++) {
        row += dr;
        col += dc;
        mark();
      }
      if (out.length === h * w) break;
    }
  }
  assert.equal(out.length, h * w);
  return out;
}
const p15 = [
  3258,3222,3152,3038,
  3278,3299,3298,2838,
  3288,3294,3296,2472,
  4516,1206,708,1820
];
const p15Order = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
];
assert.deepEqual(centreSpiral(4,4).map((p) => p15[p]), p15Order,
  'implementation must exactly reproduce original recovered p15 spiral');

const globalOrder = centreSpiral(32, 8);
const tileOrder = Array.from({length: 4}, (_, tile) =>
  centreSpiral(8, 8).map((local) =>
    (tile * 8 + Math.floor(local / 8)) * 8 + local % 8)).flat();
for (const order of [globalOrder, tileOrder]) {
  assert.equal(order.length, 256);
  assert.equal(new Set(order).size, 256);
}
function asBigInt(bytes) {
  return BigInt('0x' + bytes.map((b) => b.toString(16).padStart(2,'0')).join(''));
}
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a >= 0n ? a : -a;
}
function modPow(a, exp, n) {
  let result = 1n;
  let b = a % n;
  for (let e = exp; e > 0n; e >>= 1n) {
    if (e & 1n) result = result * b % n;
    b = b * b % n;
  }
  return result;
}
// Two independent arithmetic positives: prime-factor GCD and CRT exponent GCD.
const toyN = 61n * 53n;
assert.equal(gcd(61n, toyN), 61n);
assert.equal(gcd((modPow(2n, 17n * 53n, toyN) - 2n + toyN) % toyN,
  toyN), 61n);

const publicKey = fs.readFileSync(path.join(root,
  'resources', 'control', 'cicada-3301-public-key.asc'), 'utf8');
const keys = parseKeys(dearmor(publicKey));
assert.equal(keys.length, 2);
assert.ok(keys.every((k) => k.bits === 4096 && k.exponent === 65537n));
assert.equal(keys[0].fingerprint, '6D854CD7933322A601C3286D181F01E57A35090F');

const results = [];
let factorChecks = 0;
let crtChecks = 0;
for (const [radix, bytes] of [['base60',base60], ['base59',base59]]) {
  for (const [geometry, order] of [
    ['p15-centre-out-32x8', globalOrder],
    ['p15-centre-out-four-8x8', tileOrder]
  ]) {
    const native = order.map((cell) => bytes[cell]);
    for (const [endian, source] of [
      ['printed-first-most-significant', native],
      ['printed-first-least-significant', native.slice().reverse()]
    ]) {
      const candidate = asBigInt(source);
      const row = { radix, geometry, endian, bits: candidate.toString(2).length,
        revealed: [] };
      for (const [which, pub] of keys.entries()) {
        const modulus = pub.modulus;
        const directFactor = gcd(candidate, modulus);
        factorChecks++;
        if (directFactor !== 1n) {
          row.revealed.push({ keyIndex: which, role: 'literal-prime',
            factorBits: directFactor.toString(2).length,
            nontrivial: directFactor !== modulus });
        }
        // Inverting a genuine CRT private exponent d_p using e*d_p:
        // gcd( a^(e*d_p) - a, N ) contains its secret prime factor p.
        for (const base of [2n,3n]) {
          const residue = modPow(base, pub.exponent * candidate, modulus);
          const factor = gcd((residue - base + modulus) % modulus, modulus);
          crtChecks++;
          if (factor !== 1n) row.revealed.push({
            keyIndex: which, role: 'rsa-crt-dp-or-dq', base: Number(base),
            factorBits: factor.toString(2).length,
            nontrivial: factor !== modulus
          });
        }
      }
      results.push(row);
    }
  }
}
assert.equal(results.length, 8);
assert.equal(factorChecks, 16);
assert.equal(crtChecks, 32);
const hits = results.flatMap((r) =>
  r.revealed.map((h) => ({...h,radix:r.radix,geometry:r.geometry,endian:r.endian})));
console.log(JSON.stringify({
 source: 'unaltered LP2 p15 outward source spiral and p50 printed 256-byte table',
 publicKeyFingerprint: keys[0].fingerprint,
 candidates: results,
 literalPrimeGcdChecks: factorChecks,
 privateCrtExponentGcdChecks: crtChecks,
 recoveredRSAFactors: hits,
 decision: hits.length ? 'FACTOR CANDIDATE: investigate exact historical RSA material' :
   'No authentic Cicada RSA private prime or CRT exponent under the source-exact p15 spiral transfer'
},null,2));
assert.equal(hits.length, 0, 'Potential real secret key: investigate and do NOT mark negative');
console.log('PASS: authentic p15 source traversal, exact original grid, RSA arithmetic controls and no private-key recovery');
