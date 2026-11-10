#!/usr/bin/env node
'use strict';

// Reproduce the LP1 p05/p16 corner-Mobius relation and test its simplest
// source-locked uses against the original LP2 stream. Node.js 22, no packages.

const fs = require('node:fs');
const assert = require('node:assert/strict');
const { events } = require('./red_256_event_key_inverse.cjs');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const mod = (x, p = 29) => ((x % p) + p) % p;
function invMod(a, p = 29) {
  a = mod(a, p);
  for (let x = 1; x < p; x++) if (mod(a * x, p) === 1) return x;
  throw new Error('non-invertible residue ' + a);
}
function powMod(a, n, p = 29) {
  let out = 1;
  a = mod(a, p);
  while (n > 0) {
    if (n & 1) out = mod(out * a, p);
    a = mod(a * a, p);
    n = Math.floor(n / 2);
  }
  return out;
}
function matMul(A, B) {
  return [
    [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]), mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
    [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]), mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
  ];
}
function matPow(A, n) {
  let out = [[1, 0], [0, 1]], base = A;
  while (n > 0) {
    if (n & 1) out = matMul(out, base);
    base = matMul(base, base);
    n = Math.floor(n / 2);
  }
  return out;
}
function matInv(A) {
  const d = mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
  const di = invMod(d);
  return [
    [mod(A[1][1] * di), mod(-A[0][1] * di)],
    [mod(-A[1][0] * di), mod(A[0][0] * di)]
  ];
}
function projectiveOrder(A) {
  const I = [[1, 0], [0, 1]];
  for (let n = 1; n <= 60; n++) {
    const P = matPow(A, n);
    if (P[0][1] === 0 && P[1][0] === 0 && P[0][0] === P[1][1] && P[0][0] !== 0) return n;
  }
  throw new Error('projective order > 60');
}
function applyPGL2(A, x) {
  const [a, b] = A[0], [c, d] = A[1];
  if (x === null) return c === 0 ? null : mod(a * invMod(c));
  const den = mod(c * x + d);
  return den === 0 ? null : mod((a * x + b) * invMod(den));
}
function cayley(x) {
  if (x === null) return 1;             // limit at projective infinity
  const den = mod(x + 1);
  if (den === 0) return null;           // x = -1 maps to infinity
  return mod((x - 1) * invMod(den));
}
function scaleProjective(x, k) {
  return x === null ? null : mod(k * x);
}
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function phi(n) {
  let result = n, remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      result -= result / p;
      while (remaining % p === 0) remaining /= p;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

const M05raw = [[272, 151], [151, 272]];
const M16raw = [[434, 966], [966, 434]];
const M05 = M05raw.map(r => r.map(x => mod(x)));
const M16 = M16raw.map(r => r.map(x => mod(x)));
const M05_6 = matPow(M05, 6);
const scalar = mod(M16[0][0] * invMod(M05_6[0][0]));
assert.deepEqual(M16, M05_6.map(r => r.map(x => mod(scalar * x))));
assert.equal(projectiveOrder(M05), 28);
assert.equal(projectiveOrder(M16), 14);
assert.equal(powMod(2, 28), 1);
for (let k = 1; k < 28; k++) assert.notEqual(powMod(2, k), 1);
assert.equal(powMod(6, 14), 1);
for (let k = 1; k < 14; k++) assert.notEqual(powMod(6, k), 1);

// Exact conjugacy on all 30 points of P^1(F_29):
// h(x)=(x-1)/(x+1), with h(f05(x)) = 2*h(x).
for (const x of [...Array(29).keys(), null]) {
  assert.deepEqual(cayley(applyPGL2(M05, x)), scaleProjective(cayley(x), 2));
  assert.deepEqual(cayley(applyPGL2(M16, x)), scaleProjective(cayley(x), 6));
}

// The p05 MOBIUS cell has GP-prime sum 226. Reduce it to F_29 and use it
// as a projective seed. The fixed points are 1 and 28; the latter is EA.
// Replacing the omitted fixed coordinate 1 by projective infinity gives
// a 28-cycle over precisely the 28 non-EA GP symbols.
const mobiusCell = 226;
const seedX = mod(mobiusCell);
const seedU = cayley(seedX);
assert.equal(seedX, 23);
assert.equal(seedU, 13);
const cyclePoints = [];
const cycleSymbols = [];
let point = seedX;
for (let i = 0; i < 28; i++) {
  assert.notEqual(point, 1);
  assert.notEqual(point, 28);
  cyclePoints.push(point);
  cycleSymbols.push(point === null ? 1 : point);
  point = applyPGL2(M05, point);
}
assert.equal(point, seedX);
assert.equal(new Set(cycleSymbols).size, 28);
assert.deepEqual(cycleSymbols.slice().sort((a, b) => a - b), [...Array(28).keys()]);
for (let i = 0; i < 28; i++) {
  assert.deepEqual(applyPGL2(M16, cyclePoints[i]), cyclePoints[(i + 6) % 28]);
}

const dims = [563, 569];
assert.ok(dims.every(isPrime));
const dimensionTotients = dims.map(phi);
assert.equal(dimensionTotients[1] - dimensionTotients[0], 6);
assert.equal(phi(226), 112);
assert.equal(phi(29), 28);
assert.equal(112, 4 * 28);

// Load the canonical LP2 transcription and an independent GP-language control.
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const pages = corpus.pages.filter(p => p.page <= 55).map(p => p.indices);
const ciphertext = pages.flat();
const translit = corpus.translit;
const gp = new Map(translit.map((s, i) => [s, i]));
gp.set('ING', 21);

function englishToGP(text) {
  const s = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of s.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (gp.has(token)) {
          out.push(gp.get(token));
          i += n;
          found = true;
          break;
        }
      }
      if (!found) throw new Error('unmapped control text at ' + word.slice(i));
    }
  }
  return out;
}
const control = englishToGP(fs.readFileSync('resources/control/emerson_essays_2944.txt', 'utf8'));
const tri = new Map();
for (let i = 0; i + 2 < control.length; i++) {
  const key = control[i] * 841 + control[i + 1] * 29 + control[i + 2];
  tri.set(key, (tri.get(key) || 0) + 1);
}
function metrics(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  const ioc = f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
  const top12 = f.slice().sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0) / a.length;
  const alpha = 0.05, den = control.length - 2 + alpha * 29 ** 3;
  let score = 0;
  for (let i = 0; i + 2 < a.length; i++) {
    const key = a[i] * 841 + a[i + 1] * 29 + a[i + 2];
    score += Math.log(((tri.get(key) || 0) + alpha) / den);
  }
  return { ioc, top12, trigram: score / (a.length - 2) };
}
const log2 = Array(29).fill(-1);
for (let i = 0; i < 28; i++) log2[powMod(2, i)] = i;

function decodeDifferential(multiplier, clock) {
  let previous = 0, step = 0;
  const out = [];
  for (const page of pages) {
    if (clock === 'page') { previous = 0; step = 0; }
    const decoded = [];
    for (const c of page) {
      const delta = mod(c - previous);
      if (delta === 0) {
        decoded.push(28);             // EA is the transparent zero step.
      } else {
        const key = mod(seedU * powMod(multiplier, step));
        const rank = log2[mod(delta * invMod(key))];
        assert.ok(rank >= 0);
        decoded.push(cycleSymbols[rank]);
        step++;                       // EA does not advance the state.
      }
      previous = c;
    }
    out.push(decoded);
  }
  return out;
}
function encodeDifferential(plainPages, multiplier, clock) {
  let previous = 0, step = 0;
  const out = [];
  for (const page of plainPages) {
    if (clock === 'page') { previous = 0; step = 0; }
    const encoded = [];
    for (const p of page) {
      if (p === 28) {
        encoded.push(previous);
      } else {
        const rank = cycleSymbols.indexOf(p);
        assert.ok(rank >= 0);
        const key = mod(seedU * powMod(multiplier, step));
        const delta = mod(key * powMod(2, rank));
        previous = mod(previous + delta);
        encoded.push(previous);
        step++;
      }
    }
    out.push(encoded);
  }
  return out;
}

function directSubstitution(A) {
  return ciphertext.map(i => {
    const point = i === 1 ? null : i;
    const mapped = applyPGL2(A, point);
    return mapped === null ? 1 : mapped;
  });
}
const directSubstitutions = [
  ['M05', M05], ['M05-inverse', matInv(M05)],
  ['M16', M16], ['M16-inverse', matInv(M16)]
].map(([name, A]) => {
  const decoded = directSubstitution(A);
  const back = directSubstitution(matInv(A));
  assert.deepEqual(back, ciphertext);
  return { name, metrics: metrics(decoded), preview: decoded.slice(0, 90).map(i => translit[i]).join('') };
});

const differential = [];
for (const clock of ['global', 'page']) {
  for (const multiplier of [1, 2, 15, 6, 5]) {
    const decodedPages = decodeDifferential(multiplier, clock);
    const reencoded = encodeDifferential(decodedPages, multiplier, clock);
    assert.deepEqual(reencoded.flat(), ciphertext);
    differential.push({
      clock, multiplier,
      metrics: metrics(decodedPages.flat()),
      preview: decodedPages.flat().slice(0, 90).map(i => translit[i]).join('')
    });
  }
}

// Exact planted positive control for the differential implementation.
const plantFlat = Array.from({ length: ciphertext.length }, (_, i) => i % 29);
const lengths = pages.map(p => p.length);
function splitByLengths(a) {
  let at = 0;
  return lengths.map(n => { const part = a.slice(at, at + n); at += n; return part; });
}
for (const clock of ['global', 'page']) {
  for (const multiplier of [1, 2, 15, 6, 5]) {
    const plantPages = splitByLengths(plantFlat);
    const enc = encodeDifferential(plantPages, multiplier, clock);
    assert.deepEqual(decodeDifferentialFrom(enc, multiplier, clock), plantPages);
  }
}
function decodeDifferentialFrom(cipherPages, multiplier, clock) {
  let previous = 0, step = 0;
  const out = [];
  for (const page of cipherPages) {
    if (clock === 'page') { previous = 0; step = 0; }
    const decoded = [];
    for (const c of page) {
      const delta = mod(c - previous);
      if (delta === 0) decoded.push(28);
      else {
        const key = mod(seedU * powMod(multiplier, step));
        decoded.push(cycleSymbols[log2[mod(delta * invMod(key))]]);
        step++;
      }
      previous = c;
    }
    out.push(decoded);
  }
  return out;
}

// The same p05/p16 state was also tested as a 256-event F_29 recurrence
// against the 256-byte base-60 grid. This is a bounded alignment check,
// not an assumed cipher.
const grid = readJson('resources/liber-primus/base60-grid.json').byte_rows.flat();
const stream = events();
assert.equal(stream.length, 256);
const weights = stream.map(e => e.kind === 'stencil' ? 0 : e.value + 1);
assert.equal(weights.filter(x => x === 0).length, 31);
assert.equal(weights.filter(x => x !== 0).length, 225);
assert.equal(weights.reduce((a, b) => a + b, 0), 3328);
function eventGridGate(multiplier, form) {
  let state = 13;
  const before = [], after = [];
  for (const w of weights) {
    before.push(state);
    state = form === 'multiply-after-add'
      ? mod(multiplier * (state + w - 13))
      : mod(multiplier * state + w - 13);
    after.push(state);
  }
  const gridMod = grid.map(x => mod(x));
  const gridScale = grid.map(x => Math.floor(x * 29 / 256));
  const matches = (a, b) => a.reduce((n, x, i) => n + Number(x === b[i]), 0);
  return {
    multiplier, form, final: state,
    beforeMod: matches(before, gridMod), afterMod: matches(after, gridMod),
    beforeScale: matches(before, gridScale), afterScale: matches(after, gridScale)
  };
}
const eventGrid = [2, 6].flatMap(m => ['multiply-after-add', 'add-after-multiply']
  .map(form => eventGridGate(m, form)));

// Test whether the p05 Möbius orbit preserves the exact GF(29^2) grid-polynomial
// seed previously recovered from the red-triad extension field. It does not:
// only the seed and its Frobenius conjugate remain roots.
const add2 = (a, b) => [mod(a[0] + b[0]), mod(a[1] + b[1])];
const neg2 = a => [mod(-a[0]), mod(-a[1])];
const mul2 = (a, b) => [
  mod(a[0] * b[0] + 8 * a[1] * b[1]),
  mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
];
const norm2 = a => mod(a[0] * a[0] + 3 * a[0] * a[1] - 8 * a[1] * a[1]);
const inv2 = a => {
  const ni = invMod(norm2(a));
  return [mod((a[0] + 3 * a[1]) * ni), mod(-a[1] * ni)];
};
const div2 = (a, b) => mul2(a, inv2(b));
const f2 = z => div2(
  add2(mul2([11, 0], z), [6, 0]),
  add2(mul2([6, 0], z), [11, 0])
);
function orbit2(start) {
  const out = [];
  let z = start;
  for (let i = 0; i < 28; i++) {
    assert.ok(!out.some(x => x[0] === z[0] && x[1] === z[1]));
    out.push(z);
    z = f2(z);
  }
  assert.deepEqual(z, start);
  return out;
}
const root = [23, 27], conjugate = [17, 2]; // basis u^2 = 3u + 8
const orbitA = orbit2(root), orbitB = orbit2(conjugate);
const orbitUnion = [...orbitA, ...orbitB];
assert.equal(new Set(orbitUnion.map(z => z.join(','))).size, 56);
const polynomial = grid.map(x => [mod(x), 0]);
function evalPolyGF29Squared(descending, x) {
  return descending.reduce((acc, c) => add2(mul2(acc, x), c), [0, 0]);
}
const orbitRootHits = orbitUnion.filter(z => {
  const v = evalPolyGF29Squared(polynomial, z);
  return v[0] === 0 && v[1] === 0;
}).length;
assert.equal(orbitRootHits, 2);

console.log(JSON.stringify({
  source: {
    M05, M16, M05Power6: M05_6, projectiveScalar: scalar,
    projectiveOrders: { M05: projectiveOrder(M05), M16: projectiveOrder(M16) },
    conjugateMultipliers: { M05: 2, M16: 6 },
    phi29: 28, mobiusCell, seedX, seedU, cycleSymbols,
    dimensions: dims, dimensionTotients, totientGap: 6,
    phi226: 112, fourTimesPhi29: 112
  },
  corpus: { pages: pages.length, runes: ciphertext.length, baseline: metrics(ciphertext) },
  directSubstitutions,
  differential,
  eventGrid,
  gridPolynomialOrbit: { orbitSize: 56, rootHits: orbitRootHits },
  verdict: 'Exact source-derived PGL2 relation; tested direct substitutions and simple EA-zero-step uses do not recover LP2 plaintext.'
}, null, 2));
