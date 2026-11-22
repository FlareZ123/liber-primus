'use strict';

/**
 * Source-original 256-symbol terminal parity gate.
 * Run with Node 22 from any working directory.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
}

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) found.push(n);
  }
  return found;
}

/**
 * Horner simultaneously evaluates P(24), P'(24), and P modulo H,
 * H(x)=x^2+18x+11; coefficients are high degree first.
 * @param {number[]} coefficients
 * @returns {number[]}
 */
function syndromes(coefficients) {
  let value = 0;
  let derivative = 0;
  let hX = 0;
  let hConst = 0;
  for (const c of coefficients) {
    derivative = mod29(24 * derivative + value);
    value = mod29(24 * value + c);
    const nextHX = mod29(hConst - 18 * hX);
    const nextConst = mod29(c - 11 * hX);
    hX = nextHX;
    hConst = nextConst;
  }
  return [value, derivative, hX, hConst];
}

/** @returns {number[][][]} */
function rings() {
  const groups = [];
  for (let d = 0; d < 4; d++) {
    const ring = [];
    for (let c = d; c < 8 - d; c++) ring.push([d, c]);
    for (let r = d + 1; r < 32 - d; r++) ring.push([r, 7 - d]);
    for (let c = 6 - d; c >= d; c--) ring.push([31 - d, c]);
    for (let r = 30 - d; r > d; r--) ring.push([r, d]);
    groups.push(ring);
  }
  return groups;
}

/**
 * @param {number[]} terminal
 * @param {number[][][]} groups
 * @param {number} corner
 * @param {number} direction
 * @returns {number[]}
 */
function mapRings(terminal, groups, corner, direction) {
  const out = Array(256).fill(-1);
  let n = 0;
  for (let d = 0; d < 4; d++) {
    const ring = groups[d];
    const corners = [[d,d], [d,7-d], [31-d,7-d], [31-d,d]];
    const start = ring.findIndex(([r,c]) => r === corners[corner][0] && c === corners[corner][1]);
    assert(start >= 0);
    for (let k = 0; k < ring.length; k++) {
      const [r,c] = ring[(start + direction * k + ring.length * 4) % ring.length];
      out[r * 8 + c] = terminal[n++];
    }
  }
  assert.equal(n, 256);
  assert(!out.includes(-1));
  return out;
}

const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(syndromes(bytes.map(x => x % 29)), [0,0,0,0]);

const [c55, c56, c57] = [55,56,57].map(i => corpus.pages[i].indices);
assert.deepEqual([c55.length, c56.length, c57.length], [76,85,95]);
const primes = firstPrimes(85);
let keyClock = 0;
const p56 = c56.map((cipher, i) => {
  if (i === 56) {
    assert.equal(cipher, 0);
    return 0;
  }
  const key = (primes[keyClock++] - 1) % 29;
  const plain = mod29(cipher - key);
  assert.equal(mod29(plain + key), cipher);
  return plain;
});
assert.equal(keyClock, 84);
assert.deepEqual(p56.slice(0,5), [24,9,18,9,23]); // AN END opening.

const groups = rings();
assert.deepEqual(groups.map(r => r.length), [76,68,60,52]);
const runs = [];
for (const [mode, middle] of [['original-cipher', c56], ['solved-plaintext', p56]]) {
  const tape = [...c55, ...middle, ...c57];
  for (let corner = 0; corner < 4; corner++) {
    for (const direction of [1,-1]) {
      const s = syndromes(mapRings(tape, groups, corner, direction));
      runs.push({ mode, corner, direction, syndrome: s });
      assert(s.some(x => x !== 0));
    }
  }
}
assert.deepEqual(syndromes([...c55, ...c56, ...c57]), [10,21,8,6]);
assert.deepEqual(syndromes([...c55, ...p56, ...c57]), [8,14,28,22]);
for (const row of runs) console.log(JSON.stringify(row));
console.log('PASS: grid H/G codeword positive, full original p56 inverse/reencryption, and 16 nonzero original terminal syndromes');
