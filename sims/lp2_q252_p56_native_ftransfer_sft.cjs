'use strict';
/**
 * Native p56 prime-totient/F-transparent decoder transferred to the original
 * LP2 grid H*G GF29 quotient. Run: node sims/lp2_q252_p56_native_ftransfer_sft.cjs
 * Original source files stay unchanged; all six possible F-site skip flags
 * and 5,000 first prime indices are treated exactly, never language-fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = n => ((n % 29) + 29) % 29;
assert.equal(grid.bytes.length, 256);
// H=[3,26,24], G=[27,5,15] ascending; product descending below.
const factor = [12, 17, 11, 21, 23];
const remainder = grid.bytes.map(mod), quotient = [];
for (let i = 0; i < 252; i += 1) {
  const v = mod(remainder[i] * 17); // inverse(12) mod29.
  quotient.push(v);
  for (let j = 0; j < 5; j += 1) remainder[i + j] = mod(remainder[i + j] - v * factor[j]);
}
assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 16), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21]);
const fsIndices = quotient.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(fsIndices, [0, 75, 120, 140, 170, 237]);

/** @param {number} count @returns {number[]} */
function primeTotients(count) {
  const composite = new Uint8Array(180000), out = [];
  for (let p = 2; p < composite.length && out.length < count; p += 1) {
    if (composite[p]) continue;
    out.push((p - 1) % 29);
    if (p * p < composite.length) for (let k = p * p; k < composite.length; k += p) composite[k] = 1;
  }
  assert.equal(out.length, count);
  return out;
}
const key = primeTotients(5300);
/** @param {number[]} plain @param {number} start @returns {number[]} */
function encrypt(plain, start) {
  let used = 0;
  return plain.map(p => p === 0 ? 0 : mod(p + key[start + used++]));
}
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const tokens = corpus.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const found = tokens.find(t => s.startsWith(t.s, i));
    assert.ok(found, 'Solved GP spelling');
    out.push(found.i);
    i += found.s.length;
  }
  return out;
}
const solved = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(solved.length, 85);
assert.deepEqual(encrypt(solved, 0), corpus.pages.find(p => p.page === 56).indices);
const planted = Array.from({length: 252}, (_, i) => solved[i % solved.length]);

/** @param {number[]} cipher @param {number} start @returns {boolean} */
function reachable(cipher, start) {
  let states = [0];
  for (let i = 0; i < cipher.length; i += 1) {
    const seen = new Uint8Array(8), next = [], c = cipher[i];
    for (const used of states) {
      if (c === 0 && !seen[used]) { next.push(used); seen[used] = 1; }
      if (mod(c - key[start + used]) !== 0 && !seen[used + 1]) {
        next.push(used + 1); seen[used + 1] = 1;
      }
    }
    if (!next.length) return false;
    states = next;
  }
  return true;
}
assert.ok(reachable(encrypt(planted, 260), 260), '252 native-rune cipher positive');

/** @param {number[]} a @returns {number} */
function countViable(a) {
  let n = 0;
  for (let s = 0; s < 5000; s += 1) if (reachable(a, s)) n += 1;
  return n;
}
/** @param {number[]} cipher @param {number} start */
function enumerate(cipher, start) {
  const out = [];
  for (let mask = 0; mask < 64; mask += 1) {
    let used = 0, f = 0, valid = true;
    const plain = [];
    for (const c of cipher) {
      if (c === 0 && (mask >>> f & 1)) plain.push(0);
      else {
        const p = mod(c - key[start + used++]);
        if (p === 0) { valid = false; break; }
        plain.push(p);
      }
      if (c === 0) f += 1;
    }
    if (!valid) continue;
    assert.deepEqual(encrypt(plain, start), cipher);
    const hist = new Array(29).fill(0);
    for (const p of plain) hist[p] += 1;
    const ioc = hist.reduce((v, n) => v + n * (n - 1), 0) / (plain.length * (plain.length - 1));
    out.push({start, mask, plain, ioc});
  }
  return out;
}
const starts = [], candidates = [];
for (let s = 0; s < 5000; s += 1) {
  if (!reachable(quotient, s)) continue;
  starts.push(s);
  candidates.push(...enumerate(quotient, s));
}
assert.equal(starts.length, 30);
assert.equal(candidates.length, 60);
assert.ok(!reachable(quotient, 0));
candidates.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(candidates[0].ioc - 0.037500790488838295) < 1e-12);
assert.ok(candidates.every(c => c.ioc < 0.04));

// 32 reproducible order nulls preserve all six zero locations and GP29 inventory.
let seed = 0x3301;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const positions = quotient.flatMap((v, i) => v ? [i] : []);
const nonzero = positions.map(i => quotient[i]), nulls = [];
for (let t = 0; t < 32; t += 1) {
  const shuffled = nonzero.slice();
  for (let j = shuffled.length - 1; j > 0; j -= 1) {
    const k = Math.floor(random() * (j + 1));
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const tape = quotient.slice();
  positions.forEach((i, j) => { tape[i] = shuffled[j]; });
  nulls.push(countViable(tape));
}
assert.deepEqual(nulls,
  [18,22,17,12,22,29,18,26,14,21,10,24,14,20,22,21,
   30,28,10,19,14,25,15,20,18,12,21,16,16,23,35,24]);
console.log(JSON.stringify({
  gridBytes: 256, quotient: 252, zeroRemainder: remainder.slice(-4),
  quotientFLocations: fsIndices, authenticP56Positive: '85/85',
  nativeGP252Plant: '252/252', keyStartsTested: 5000,
  viableStartIndices: starts, originalExactPlaintextCandidates: candidates.length,
  maximumOriginalIoC: candidates[0].ioc,
  candidateFirst64: candidates[0].plain.slice(0,64).map(v => corpus.translit[v]).join(' '),
  orderControlSurvivorCounts: nulls,
  controlMean: nulls.reduce((a,b) => a+b, 0) / nulls.length,
  finiteEmpiricalUpperTail: (1 + nulls.filter(n => n >= starts.length).length) / 33,
  authenticLP2UnknownPlaintextRecovered: false
}, null, 2));
