#!/usr/bin/env node
'use strict';

// Reproduce the bounded Liber AL keyword / 11x11 Hill gate for issue #253.
// Run from the repository root: node sims/issue253_liber_al_keyword_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices && p.indices.length);
const C = pages.flatMap(p => p.indices);
const alphabet = corpus.translit;
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

function inv(a) {
  for (let x = 1; x < MOD; x++) if (mod(a * x) === 1) return x;
  return null;
}
function ioc(values, states = MOD) {
  const counts = Array(states).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function render(values) {
  return values.map(x => alphabet[x]).join('');
}
function matrixInverse(A) {
  const n = A.length;
  const B = A.map((row, i) => row.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && B[pivot][col] === 0) pivot++;
    if (pivot === n) return null;
    [B[col], B[pivot]] = [B[pivot], B[col]];
    const scale = inv(B[col][col]);
    if (scale === null) return null;
    for (let j = 0; j < 2 * n; j++) B[col][j] = mod(B[col][j] * scale);
    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const factor = B[i][col];
      if (factor) for (let j = 0; j < 2 * n; j++) B[i][j] = mod(B[i][j] - factor * B[col][j]);
    }
  }
  return B.map(row => row.slice(n));
}
function matVec(A, v) {
  return A.map(row => row.reduce((s, x, j) => mod(s + x * v[j]), 0));
}
function transpose(A) {
  return A[0].map((_, j) => A.map(row => row[j]));
}
function hillGate(name, M) {
  const Mi = matrixInverse(M);
  const MiT = matrixInverse(transpose(M));
  if (!Mi || !MiT) return { name, invertible: false };
  const n = M.length;
  const fullLength = Math.floor(C.length / n) * n;
  const decrypt = inverse => {
    const out = [];
    for (let i = 0; i < fullLength; i += n) out.push(...matVec(inverse, C.slice(i, i + n)));
    return out;
  };
  const col = decrypt(Mi);
  const row = decrypt(MiT);
  const probe = C.slice(0, n);
  const roundTrip = matVec(Mi, matVec(M, probe)).every((x, i) => x === probe[i]);
  return {
    name, invertible: true, blockSize: n,
    fullBlocks: fullLength / n, remainder: C.length - fullLength,
    roundTrip,
    columnConventionIoC: ioc(col), rowConventionIoC: ioc(row),
    columnHead: render(col.slice(0, 88)), rowHead: render(row.slice(0, 88))
  };
}

const vigenere = {};
for (const word of ['NUIT', 'ABRAHADABRA']) {
  const key = [...word].map(ch => alphabet.indexOf(ch));
  if (key.some(x => x < 0)) throw new Error('Key character absent from GP29 alphabet: ' + word);
  vigenere[word] = {
    key,
    variants: [-1, 1].map(sign => {
      const P = C.map((x, i) => mod(x + sign * key[i % key.length]));
      return { sign, IoC: ioc(P), head: render(P.slice(0, 88)) };
    })
  };
}

const n = 11;
const abra = [...'ABRAHADABRA'].map(ch => alphabet.indexOf(ch));
const circulant = Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) => abra[(j - i + n) % n]));
const p32 = corpus.pages.find(p => p.page === 32);
if (!p32 || p32.indices.length !== n * n) throw new Error('Expected p32 to contain exactly 121 rune indices');
const p32Matrix = Array.from({ length: n }, (_, i) => p32.indices.slice(i * n, (i + 1) * n));

console.log(JSON.stringify({
  input: { runeBearingPages: pages.length, runeCount: C.length, rawIoC: ioc(C), alphabetSize: MOD },
  vigenere,
  hill: [
    hillGate('ABRAHADABRA circulant', circulant),
    hillGate('p32 11x11 map matrix (auxiliary)', p32Matrix)
  ]
}, null, 2));
