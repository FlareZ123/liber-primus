#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const P = 29;
const mod = (x) => ((x % P) + P) % P;
const mul = (A, B) => A.map((row) => [0, 1].map((j) => mod(row[0] * B[0][j] + row[1] * B[1][j])));
const scale = (A, k) => A.map((row) => row.map((v) => mod(k * v)));
const inv = (x) => {
  for (let i = 1; i < P; i++) if (mod(x * i) === 1) return i;
  throw Error('noninvertible ' + x);
};
const matInv = (A) => {
  const d = inv(mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]));
  return scale([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]], d);
};
function pow(A, exponent) {
  let result = [[1, 0], [0, 1]], base = A, k = exponent;
  while (k) {
    if (k % 2) result = mul(result, base);
    base = mul(base, base);
    k = Math.floor(k / 2);
  }
  return result;
}
const Q = [[1, 1], [1, 0]];
const M05 = [[272, 151], [151, 272]].map((r) => r.map(mod));
const M16 = [[434, 966], [966, 434]].map((r) => r.map(mod));
const S = [[0, 1], [16, 21]];
const conjugate = (A) => mul(mul(S, A), matInv(S));
assert.deepEqual(pow(M05, 2), scale(conjugate(Q), 3301 % P));
assert.deepEqual(M16, scale(conjugate(pow(Q, 3)), 14));
assert.deepEqual(M16, scale(pow(M05, 6), 21));
assert.equal(3299 % P, 22);
assert.equal(3301 % P, 24);
assert.equal(mod(6 * inv(24)), 22); // Q eigenvalue ratio
assert.equal(mod(15 * 15), 22);    // M05 eigenvalue ratio squared
assert.equal(mod(M05[0][0] ** 2 + M05[0][1] ** 2) * 2 % P, 24);

/** Apply the p05 projective Mobius map; null denotes the point at infinity. */
function mobius(x) {
  const [[a, b], [c, d]] = M05;
  if (x === null) return mod(a * inv(c));
  const den = mod(c * x + d);
  return den === 0 ? null : mod((a * x + b) * inv(den));
}
const orbit = [];
let point = 226 % P; // GP prime-sum of the literal p05 MOBIUS cell
for (let i = 0; i < 28; i++) {
  assert.notEqual(point, 1);
  assert.notEqual(point, 28);
  orbit.push(point === null ? 1 : point);
  point = mobius(point);
}
assert.equal(point, 226 % P);
assert.equal(new Set(orbit).size, 28);
assert.deepEqual(orbit.slice().sort((a, b) => a - b), Array.from({length: 28}, (_, i) => i));
const position = new Map(orbit.map((v, i) => [v, i]));

/**
 * Source-frozen projective-orbit step decoder.
 * EA (index28) passes unchanged and resets to the p05 MOBIUS seed.
 * A non-EA plaintext rune specifies a nonzero (1..28) p05-orbit advance.
 * @param {number[][]} pages Original GP-index pages.
 * @returns {number[][]} Decoded index pages.
 */
function decode(pages) {
  return pages.map((page) => {
    let previous = 0;
    return page.map((c) => {
      if (c === 28) { previous = 0; return 28; }
      const next = position.get(c);
      assert.notEqual(next, undefined);
      const step = (next - previous + 28) % 28;
      previous = next;
      return orbit[(step + 27) % 28];
    });
  });
}

/** Exact inverse of the declared source-frozen projective-orbit decoder. */
function encode(pages) {
  return pages.map((page) => {
    let previous = 0;
    return page.map((p) => {
      if (p === 28) { previous = 0; return 28; }
      const rank = position.get(p);
      assert.notEqual(rank, undefined);
      previous = (previous + rank + 1) % 28;
      return orbit[previous];
    });
  });
}

const base = path.join(__dirname, '..', 'resources');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length).map((p) => p.indices);
const flatten = (a) => a.flat();
const raw = flatten(pages);
assert.equal(pages.length, 55);
assert.equal(raw.length, 12956);
const resultPages = decode(pages);
assert.deepEqual(encode(resultPages), pages);
const decoded = flatten(resultPages);

const gp = new Map(corpus.translit.map((token, i) => [token, i]));
gp.set('ING', 21);
function toGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = [3, 2, 1].map((n) => word.slice(i, i + n)).find((part) => gp.has(part));
      assert.ok(token, 'unknown GP token at ' + word.slice(i));
      output.push(gp.get(token));
      i += token.length;
    }
  }
  return output;
}
const train = toGP(fs.readFileSync(path.join(base, 'control', 'gibran_prophet_58585.txt'), 'utf8'));
const heldout = toGP(fs.readFileSync(path.join(base, 'control', 'shakespeare_first300k.txt'), 'utf8'));
assert.ok(train.length > raw.length && heldout.length > raw.length);
const gram = new Map();
for (let i = 2; i < train.length; i++) {
  const key = train[i-2] * 841 + train[i-1] * 29 + train[i];
  gram.set(key, (gram.get(key) || 0) + 1);
}
function score(a) {
  const freq = Array(29).fill(0);
  for (const x of a) freq[x]++;
  let log = 0;
  for (let i = 2; i < a.length; i++) {
    const key = a[i-2] * 841 + a[i-1] * 29 + a[i];
    log += Math.log(((gram.get(key) || 0) + 0.01) / ((train.length - 2) + 0.01 * 29**3));
  }
  return {
    n: a.length,
    ioc: freq.reduce((s, k) => s + k * (k - 1), 0) / (a.length * (a.length - 1)),
    trigramNatsPerRune: log / (a.length - 2),
    EA: freq[28],
    AE: freq[25],
  };
}
const control = heldout.slice(0, raw.length);
const plantPages = [];
let offset = 0;
for (const page of pages) {
  plantPages.push(control.slice(offset, offset + page.length));
  offset += page.length;
}
assert.deepEqual(decode(encode(plantPages)), plantPages);
const repeats = pages.reduce((sum, p) => sum + p.slice(1).filter((r, i) => r === p[i]).length, 0);
assert.equal(repeats, 86);
const report = {
  source: {Q, M05, M16, S, magic3301mod29: 24, red3299mod29: 22, mobiusSeed: 226 % P},
  cipher: {n: raw.length, pages: pages.length, withinPageEqualPairs: repeats},
  original: score(raw),
  sourceLockedProjectiveDecode: score(decoded),
  independentlyHeldoutNativeEnglish: score(control),
  plantExact: true,
  originalPreview: decoded.slice(0, 64).map((x) => corpus.translit[x]).join(''),
  verdict: 'Exact cross-release conjugacy; simple source-frozen reversible projective step cipher fails to recover native GP plaintext.'
};
console.log(JSON.stringify(report, null, 2));
