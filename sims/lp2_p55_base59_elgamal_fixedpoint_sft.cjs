#!/usr/bin/env node
'use strict';

// Source-reconstructing p55 base59 / DH23 ElGamal fixed-point SFT.
// Run from repository root: node sims/lp2_p55_base59_elgamal_fixedpoint_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const src = fs.readFileSync(path.join(root, 'resources/transcriptions/lp2-image-corrected.txt'), 'utf8').replace(/\r\n/g, '\n');
const pages = src.split(/\n%\n/);
assert.equal(pages.length, 57);

const R = Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');
const NAMES = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const IX = new Map(R.map((r, i) => [r, i]));
const digits = s => Array.from(s).filter(r => IX.has(r)).map(r => IX.get(r));
const words = s => s.split(/[-.&$§]/u).map(digits).filter(w => w.length);
const val = (xs, b) => xs.reduce((n, x) => n * BigInt(b) + BigInt(x), 0n);
const modpow = (b, e, m) => {
  let x = ((b % m) + m) % m, y = 1n;
  while (e > 0n) { if (e & 1n) y = y * x % m; x = x * x % m; e >>= 1n; }
  return y;
};
const inv = (a, m) => {
  let r0 = ((a % m) + m) % m, r1 = m, s0 = 1n, s1 = 0n;
  while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  assert.equal(r0, 1n); return (s0 % m + m) % m;
};
const dlog = (y, g, p) => {
  let x = 1n;
  for (let k = 0n; k < p - 1n; k++) { if (x === y) return k; x = x * g % p; }
  throw new Error('No DH23 discrete logarithm.');
};
const nthPrime = n => {
  let count = 0;
  for (let x = 2; ; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime && ++count === n) return x;
  }
};
const split = ws => {
  const inside = [], shell = [];
  for (const w of ws) {
    if (w.length > 2) inside.push(...w.slice(1, -1));
    if (w.length) { shell.push(w[0]); if (w.length > 1) shell.push(w[w.length - 1]); }
  }
  return { inside, shell };
};

// Solved p57 supplies SHED/CIRCUMFERENCES/EMERGE and the 17th-prime check.
const p57 = words(pages[56]).map(w => w.map(i => NAMES[i]).join('')).join(' ');
assert.match(p57, /SHED/); assert.match(p57, /CIRCUMFERENCES/); assert.match(p57, /EMERGE/);
assert.equal('EMERGE'.split('').reduce((s, c) => s + NAMES.indexOf(c), 0), 83);
assert.equal(nthPrime(13), 41); assert.equal(nthPrime(23), 83);
assert.equal(1 * 59 + 24, 83); assert.equal(nthPrime(17), 59);

// p28 line 6 is the 23-rune literal DH line.
const p28Lines = pages[28].split('/').map(digits).filter(x => x.length);
assert.equal(p28Lines.length, 12); assert.equal(p28Lines[5].length, 23);
assert.deepEqual(p28Lines[5].slice(0, 2), [23, 8]);

// p55's first fragment is the single NG carry from the preceding page.
const p54Tail = words(pages[53]).at(-1);
assert.deepEqual(p54Tail, [6,3,16,2,14,18,28,4,6,26]);
const fragments = words(pages[54]);
assert.equal(fragments.length, 17); assert.deepEqual(fragments[0], [21]);
const ws = fragments.slice(1);
assert.deepEqual(ws.map(w => w.length), [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(ws.length, 16);
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
assert.deepEqual(fragments.flat(), corpus.pages.find(p => p.page === 55).indices);

const { inside, shell } = split(ws);
assert.equal(inside.length, 43); assert.equal(shell.length, 32);
const p = 23n, g = 5n, a = 6n, A = modpow(g, a, p), B = 19n;
assert.equal(A, 8n); assert.equal(modpow(g, 15n, p), B); assert.equal(modpow(g, 90n, p), 2n);

const I59 = val(inside, 59), S59 = val(shell, 59), W = BigInt(ws.length);
assert.equal(I59 % (W * p), 0n);
const C2 = (I59 / (W * p)) % p, C1 = S59 % p;
assert.equal(C1, 20n); assert.equal(C2, 19n); assert.equal(C2, B);
const k = dlog(C1, g, p);
assert.equal(k, 5n);
const shared = modpow(A, k, p), M = C2 * inv(shared, p) % p;
assert.equal(shared, 16n); assert.equal(M, 17n);
assert.equal(modpow(g, k, p), C1); assert.equal(M * shared % p, C2);
assert.equal(nthPrime(Number(M)), 59);

// Base29/base60 controls.
for (const radix of [29, 60]) {
  const I = val(inside, radix), S = val(shell, radix);
  assert.notEqual(I % (W * p), 0n);
  assert.notEqual(S % p, 20n);
}
assert.equal(val(inside, 29) % (16n * 23n), 280n);
assert.equal(val(shell, 29) % 23n, 6n);
assert.equal(val(inside, 60) % (16n * 23n), 278n);
assert.equal(val(shell, 60) % 23n, 0n);

// Whole-word seam rival: p54 tail + p55 carry form one 11-rune word.
const rival = split([[...p54Tail, ...fragments[0]], ...ws]);
assert.equal(rival.inside.length, 52); assert.equal(rival.shell.length, 34);
assert.equal(val(rival.inside, 59) % (17n * p), 239n);
assert.equal(val(rival.shell, 59) % p, 17n);

// Same fixed receiver over every rune-bearing page; only p55 matches.
const matches = [];
for (let i = 0; i < pages.length; i++) {
  const physical = i <= 49 ? i : i + 1;
  let pageWords = words(pages[i]);
  if (physical === 55) pageWords = pageWords.slice(1);
  if (!pageWords.length) continue;
  const data = split(pageWords);
  if (!data.inside.length) continue;
  const N = val(data.inside, 59), E = val(data.shell, 59), count = BigInt(pageWords.length);
  if (N % (count * p)) continue;
  const c2 = N / (count * p) % p, c1 = E % p;
  let m;
  try { const eph = dlog(c1, g, p); m = c2 * inv(modpow(A, eph, p), p) % p; } catch (_) { continue; }
  if (c1 === 20n && c2 === 19n && m === 17n && nthPrime(Number(m)) === 59) matches.push(physical);
}
assert.deepEqual(matches, [55]);

// Matched null: 200,000 permutations of intact words, fixed seed, exact pair only.
function mulberry32(seed) {
  let state = seed >>> 0;
  return function () {
    state = (state + 0x6D2B79F5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(0x3301A855), trials = 200000;
let hits = 0;
for (let t = 0; t < trials; t++) {
  const order = Array.from({ length: 16 }, (_, i) => i);
  for (let i = 15; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const data = split(order.map(i => ws[i]));
  const N = val(data.inside, 59), E = val(data.shell, 59);
  if (N % (16n * p) === 0n && E % p === C1 && N / (16n * p) % p === C2) hits++;
}
assert.equal(hits, 4);

console.log(JSON.stringify({
  p55: { words: 16, interior: 43, shell: 32 },
  base59: { interior: I59.toString(), shell: S59.toString(), normalizedInterior: (I59 / (16n * p)).toString() },
  elgamal: { p: 23, g: 5, a: 6, A: 8, k: Number(k), C1: Number(C1), C2: Number(C2), shared: Number(shared), plaintext: Number(M), seventeenthPrime: 59 },
  controls: { base29: 'fail', base60: 'fail', wholeWord52_34: 'fail', familyMatches: matches },
  matchedWordPermutationNull: { seed: '0x3301A855', trials, exactPairHits: hits }
}, null, 2));
