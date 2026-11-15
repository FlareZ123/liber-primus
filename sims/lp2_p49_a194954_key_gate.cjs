#!/usr/bin/env node
'use strict';

// Test the 2014 clearsigned-message whitespace sequence's OEIS A194954
// continuation as a direct GP29 key for the 66-rune LP2 page-49 caption.
// Run from repository root:
//   node sims/lp2_p49_a194954_key_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const alphabet = gp.runes;
const runeIndex = new Map(alphabet.map((r, i) => [r, i]));
const pages = transcription.split(/^\s*%\s*$/m);
const cipher = [...pages[49]].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r));
assert.equal(cipher.length, 66, 'LP2 page-49 caption must contain 66 runes');

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}
function nextPrime(n) {
  let p = n + 1;
  while (!isPrime(p)) p++;
  return p;
}
function popcount(n) {
  let c = 0;
  while (n) { c += n & 1; n >>>= 1; }
  return c;
}
function inverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}
function latin(values) {
  const translit = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
    'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IO','EA'];
  return values.map(v => translit[v]).join('');
}
function addKey(key, direction) {
  return cipher.map((v, i) => (v + direction * key[i] + 29 * 100) % 29);
}
function mulKey(key, divide) {
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    const k = ((key[i] % 29) + 29) % 29;
    const factor = divide ? inverse(k, 29) : k;
    if (factor === null) return null;
    out.push((cipher[i] * factor) % 29);
  }
  return out;
}

// OEIS A194954: a(1)=2; thereafter choose the smallest prime p>a(n-1)
// for which p-a(n-1) is divisible by popcount(n-1).
const a = [2];
for (let n = 2; n <= 66; n++) {
  const weight = popcount(n - 1);
  let p = nextPrime(a[a.length - 1]);
  while ((p - a[a.length - 1]) % weight !== 0) p = nextPrime(p);
  a.push(p);
}
assert.deepEqual(a.slice(0, 11), [2,3,5,7,11,13,17,23,29,31,37]);

const keys = {
  prime: a,
  primeMinusOne: a.map(x => x - 1),
  gap: [a[0], ...a.slice(1).map((x, i) => x - a[i])],
  popcount: [0, ...Array.from({length: 65}, (_, i) => popcount(i + 1))],
  gapQuotient: [a[0], ...a.slice(1).map((x, i) => (x - a[i]) / popcount(i + 1))]
};
const additive = [];
for (const [name, raw] of Object.entries(keys)) {
  for (const offset of [0, 1]) {
    const key = raw.map(x => ((x - offset) % 29 + 29) % 29);
    for (const direction of [-1, 1]) {
      additive.push({name, offset, direction, plaintext: latin(addKey(key, direction))});
    }
  }
}
const multiplicative = [];
for (const name of ['prime', 'primeMinusOne', 'gap', 'gapQuotient']) {
  for (const divide of [false, true]) {
    const values = mulKey(keys[name], divide);
    multiplicative.push({
      name, operation: divide ? 'multiply-by-inverse' : 'multiply',
      valid: values !== null, plaintext: values === null ? null : latin(values)
    });
  }
}
console.log(JSON.stringify({
  sourceSequence: a.slice(0, 11),
  target: {pageIndex: 49, runeCount: cipher.length, ciphertextRunes: cipher},
  a194954Terms66: a,
  additive,
  multiplicative
}, null, 2));
