#!/usr/bin/env node
'use strict';

/**
 * Bounded source-fixed nonlinear tests for the 2013 omitted-prime / LP2 bridge.
 * No fitted key, offset, phase, arbitrary permutation or parameter sweep.
 * Run: node sims/agent47_2013_missingprime_nonlinear_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const base60 = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const english = read('resources/control/shakespeare_first300k.txt');
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const mod = (x, n = 29) => ((x % n) + n) % n;
function inverse(a, n) {
  a = mod(a, n);
  for (let x = 1; x < n; x++) if ((a * x) % n === 1) return x;
  return null;
}
function firstPrimes(count) {
  const out = [];
  for (let x = 2; out.length < count; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}
function reverseDigits(n) { return Number(String(n).split('').reverse().join('')); }
function matches(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((sum, x, i) => sum + (x !== null && x === b[i] ? 1 : 0), 0);
}

const primes = firstPrimes(256);
const missing = primes.slice(20, 200);              // p21..p200, 73..1223
const sourceForGaps = primes.slice(20, 201);         // p21..p201, including 1229
const gaps = sourceForGaps.slice(1).map((p, i) => p - sourceForGaps[i]);
const internalGaps = gaps.slice(0, 179);
const halfGaps = gaps.map(g => g / 2);
assert.deepEqual([missing.length, missing[0], missing.at(-1)], [180, 73, 1223]);
assert.equal(internalGaps.length, 179);
assert.ok(gaps.every(g => g > 0 && g % 2 === 0));

const p53 = pages.get(53).indices;
const p54Ac = pages.get(54).indices[0];
const p53PlusAc = [...p53, p54Ac];
assert.deepEqual([p53.length, p54Ac, p53PlusAc.length], [179, 24, 180]);
const solved = [...pages.get(56).indices, ...pages.get(57).indices];
assert.deepEqual([pages.get(56).indices.length, pages.get(57).indices.length, solved.length],
  [85, 95, 180]);

// The 32x8 printed base60 tokens decode exactly to the repository's byte interpretation.
const alpha = base60.alphabet;
const tokenByte = t => 60 * alpha.indexOf(t[0]) + alpha.indexOf(t[1]);
assert.deepEqual(base60.rows.flat().map(tokenByte), base60.byte_rows.flat());
const interior = base60.byte_rows.slice(1, 31).flatMap(row => row.slice(1, 7));
assert.equal(interior.length, 180);

// Fixed English GP29 trigram scorer and held-out positive control.
const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function gpEnglish(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find(x => word.startsWith(x.s, i));
      if (!t) break;
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const native = gpEnglish(english);
const train = native.slice(0, 100000);
const held = native.slice(100000, 100180);
assert.equal(held.length, 180);
const tri = new Uint32Array(29 ** 3), context = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const pair = train[i - 2] * 29 + train[i - 1];
  tri[pair * 29 + train[i]]++;
  context[pair]++;
}
function metrics(a) {
  const f = Array(29).fill(0);
  a.forEach(v => f[v]++);
  let score = 0;
  for (let i = 2; i < a.length; i++) {
    const pair = a[i - 2] * 29 + a[i - 1];
    score += Math.log((tri[pair * 29 + a[i]] + 0.1) / (context[pair] + 2.9));
  }
  return {
    ioc: f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1)),
    top12: f.slice().sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0) / a.length,
    trigram: score / (a.length - 2)
  };
}

/* Multiplicative/divisive GF(29) pads from 179 internal prime gaps. */
const gapTests = [];
for (const [keyName, k179, k180] of [
  ['gap', internalGaps, gaps],
  ['half-gap', internalGaps.map(g => g / 2), halfGaps]
]) {
  for (const [region, cipher, key] of [
    ['p53', p53, k179],
    ['p53+p54Ac', p53PlusAc, k180]
  ]) {
    for (const operation of ['multiply', 'divide']) {
      const decoded = cipher.map((c, i) => {
        const k = key[i] % 29, inv = inverse(k, 29);
        return operation === 'multiply' ? mod(c * k) : (inv === null ? null : mod(c * inv));
      });
      assert.ok(decoded.every(v => v !== null));
      const restored = decoded.map((v, i) => {
        const k = key[i] % 29, inv = inverse(k, 29);
        return operation === 'multiply' ? mod(v * inv) : mod(v * k);
      });
      assert.deepEqual(restored, cipher);
      const plant = held.slice(0, cipher.length);
      const enc = plant.map((v, i) => {
        const k = key[i] % 29, inv = inverse(k, 29);
        return operation === 'multiply' ? mod(v * inv) : mod(v * k);
      });
      const dec = enc.map((v, i) => {
        const k = key[i] % 29, inv = inverse(k, 29);
        return operation === 'multiply' ? mod(v * k) : mod(v * inv);
      });
      assert.deepEqual(dec, plant);
      gapTests.push({ key: keyName, region, operation, raw: metrics(cipher),
        decoded: metrics(decoded), prefix: decoded.slice(0, 48).map(v => corpus.translit[v]).join(''),
        exactRoundTrip: true, positiveControlRecovered: true });
    }
  }
}

/* Direct GF(29) multiplication/division of the 30x6 table interior by primes. */
const tableTests = [];
for (const [keyName, key] of [
  ['prime', missing],
  ['reversed-decimal-prime', missing.map(reverseDigits)]
]) {
  for (const operation of ['multiply', 'divide']) {
    const decoded = interior.map((b, i) => {
      const k = mod(key[i], 29), inv = inverse(k, 29);
      return operation === 'multiply' ? mod((b % 29) * k) :
        (inv === null ? null : mod((b % 29) * inv));
    });
    tableTests.push({ key: keyName, operation, valid: decoded.filter(v => v !== null).length,
      exactKnownRunes: matches(decoded, solved) });
  }
}

/* Prime-address p32 key stream: cell = (p - 73) mod 121, row-major. */
const p32 = pages.get(32).indices;
assert.equal(p32.length, 121);
const anchor = corpus.prime[p32[0]];
assert.equal(anchor, 73);
const keyOrdinal = missing.map(p => p32[mod(p - anchor, 121)]);
const keyPrime = keyOrdinal.map(i => corpus.prime[i]);
const p32Tests = [];
for (const [keyName, key] of [['p32-rune-ordinal', keyOrdinal], ['p32-GP-prime-weight', keyPrime]]) {
  for (const operation of ['add', 'subtract', 'multiply', 'divide']) {
    const decoded = interior.map((b, i) => {
      const k = mod(key[i], 29), inv = inverse(k, 29);
      if (operation === 'add') return mod((b % 29) + k);
      if (operation === 'subtract') return mod((b % 29) - k);
      if (operation === 'multiply') return mod((b % 29) * k);
      return inv === null ? null : mod((b % 29) * inv);
    });
    p32Tests.push({ key: keyName, operation, valid: decoded.filter(v => v !== null).length,
      exactKnownRunes: matches(decoded, solved) });
  }
}

const result = {
  classification: 'bounded source-fixed nonlinear tests; no unknown plaintext recovered',
  source: {
    missingPrimeOrdinals: [21, 200], missingPrimeCount: missing.length,
    missingPrimeEndpoints: [missing[0], missing.at(-1)],
    internalGapCount: internalGaps.length, p53Runes: p53.length,
    p53PlusP54AcRunes: p53PlusAc.length, p50Interior: [30, 6, interior.length],
    solvedPages: [56, 57], solvedRunes: solved.length,
    p32TopLeftPrimeAnchor: anchor, p32Cells: p32.length
  },
  languageControl: { heldOutShakespeare: metrics(held), p53Raw: metrics(p53), p53PlusAcRaw: metrics(p53PlusAc) },
  multiplicativeGapTests: gapTests,
  tableInteriorMultiplicativeGF29: tableTests,
  p32PrimeAddressKeyTests: p32Tests,
  decision: 'Reject these fixed multiplicative and p32-anchored mappings; do not expand without a primary-source selector.'
};
console.log(JSON.stringify(result, null, 2));
