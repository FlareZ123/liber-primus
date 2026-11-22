'use strict';
/** Fixed source original LP2 Q252-to-84-key experiment, Node 22 CJS.
 * Run: node sims/lp2_q252_p56_84lane_source_sft.cjs
 * Q is the H*G divisor quotient of the original 256-byte printed grid.
 * It does not supply complete p56 key or unknown original plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const gp = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw Error('Singular GP29 coefficient');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++)
    c[i + j] = mod(c[i + j] + a[i] * b[j]);
  return c;
}
const factor = multiply([3, 26, 24], [27, 5, 15]).reverse();
assert.deepEqual(factor, [12, 17, 11, 21, 23]);
const remain = grid.bytes.map(mod), q = [];
for (let i = 0; i < 252; i++) {
  const v = mod(remain[i] * inverse(factor[0]));
  q.push(v);
  for (let j = 0; j < 5; j++) remain[i + j] = mod(remain[i + j] - v * factor[j]);
}
assert.deepEqual(remain.slice(-4), [0, 0, 0, 0]);
/** @param {number} n @returns {boolean} */
function prime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; primes.length < 84; n++) if (prime(n)) primes.push(n);
const pad = primes.map(n => mod(n - 1));
assert.equal(gp.pages[56].indices.length, 85);
const p56 = gp.pages[56].indices.map((x, i) => {
  if (i === 56) { assert.equal(x, 0); return x; }
  return mod(x - pad[i < 56 ? i : i - 1]);
}).map(i => gp.translit[i]).join('');
assert(p56.startsWith('ANENDWITHINTHEDEEPWEB'));
assert(p56.endsWith('SEECOUTTHISPAGE'));
/** @param {number[]} coeffs @param {number} start @returns {number} */
function matches(coeffs, start) {
  let n = 0;
  for (let i = 0; i < 84; i++) {
    const j = (3 * i + start) % 252;
    if (mod(coeffs[j] + coeffs[(j + 1) % 252] + coeffs[(j + 2) % 252]) === pad[i]) n++;
  }
  return n;
}
const sum = Array.from({length: 84}, (_, i) => mod(q[3*i] + q[3*i+1] + q[3*i+2]));
const positions = sum.flatMap((x, i) => x === pad[i] ? [i] : []);
assert.deepEqual(positions, [2, 15, 21, 29, 31, 38, 42, 43, 57, 80]);
const phases = Array.from({length: 252}, (_, i) => matches(q, i));
assert.equal(phases[0], 10);
assert.equal(phases.filter(x => x >= 10).length, 1);
assert.equal(Math.max(...phases.slice(1)), 8);
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const h = Array(29).fill(0);
  for (const y of x) h[y]++;
  return h.reduce((s, c) => s + c * (c - 1), 0) / (x.length * (x.length - 1));
}
const c55 = gp.pages[55].indices;
assert.equal(c55.length, 76);
const subtractIoC = ioc(c55.map((x, i) => mod(x - sum[i])));
const addIoC = ioc(c55.map((x, i) => mod(x + sum[i])));
assert(Math.abs(subtractIoC - 0.04491228070175438) < 1e-14);
assert(Math.abs(addIoC - 0.02912280701754386) < 1e-14);
let seed = 0x330129;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
let atLeast10 = 0, highestNull = 0;
for (let k = 0; k < 50000; k++) {
  const s = q.slice();
  for (let i = 251; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  const hit = matches(s, 0);
  if (hit >= 10) atLeast10++;
  highestNull = Math.max(highestNull, hit);
}
assert.equal(atLeast10, 28);
assert.equal(highestNull, 13);
console.log(JSON.stringify({
  verdict: 'No authentic complete key or unknown-page plaintext',
  gridCells: 256, quotientSymbols: 252, factor,
  firstPhaseMatches: positions, maximumOtherPhase: 8,
  p55OriginalIoC: ioc(c55), p55SubtractIoC: subtractIoC, p55AddIoC: addIoC,
  nullShuffle: {seed: '0x330129', samples: 50000, atLeast10, highestNull,
    unadjustedP: (atLeast10 + 1) / 50001},
  unknownPlaintextRecovered: 0
}, null, 2));
