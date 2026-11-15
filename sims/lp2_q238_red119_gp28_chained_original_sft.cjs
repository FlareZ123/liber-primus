'use strict';

/**
 * LP2 source-derived Q238/red119 key as a predecessor-excluding GP28 cipher.
 * The original source-linked algebra is real; this proposed cipher consumer
 * is a separate, explicitly conditional hypothesis.
 *
 * Run on Windows 11 with Node.js 22:
 * node sims/lp2_q238_red119_gp28_chained_original_sft.cjs
 *
 * This single-file test reads only pinned repository files and writes nothing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = (name) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = source('lp2-corpus.json');
const grid = source('lp2-grid-256.json');
const bytes = grid.pages.flatMap((p) => p.bytes);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
const mod28 = (x) => ((x % 28) + 28) % 28;
/** @param {number} x @returns {number} */
function inverse29(x) {
  for (let i = 1; i < 29; i++) if (mod29(i * x) === 1) return i;
  throw new Error('Nonunit in GF29');
}
/** @param {number[]} x @returns {number[]} */
function trim(x) {
  while (x.length > 1 && x[x.length - 1] === 0) x.pop();
  return x;
}
/** Exact ascending-coefficient GF29 polynomial division. */
function divide(a, f) {
  const r = a.slice();
  const q = Array(a.length - f.length + 1).fill(0);
  const invLeading = inverse29(f[f.length - 1]);
  for (let i = a.length - 1; i >= f.length - 1; i--) {
    const v = mod29(r[i] * invLeading);
    q[i - f.length + 1] = v;
    for (let j = 0; j < f.length; j++) {
      r[i - f.length + 1 + j] = mod29(r[i - f.length + 1 + j] - v * f[j]);
    }
  }
  assert.ok(r.slice(0, f.length - 1).every((x) => x === 0));
  return trim(q);
}

// All factors below were independently established on the unchanged grid.
let q238 = trim(bytes.slice().reverse().map((x) => mod29(28 * x)));
for (const factor of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
]) q238 = divide(q238, factor);
assert.equal(q238.length, 239);
assert.equal(q238[238], 1);
const reciprocal = q238.slice().reverse().map((x) => mod29(x * inverse29(q238[0])));
assert.equal(reciprocal[238], 1);

const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const original = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
const p3 = corpus.pages[3].indices.slice(0, 119);
const p39 = corpus.pages[39].indices.slice(0, 119);
assert.equal(p3.length, 119);
assert.equal(p39.length, 119);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);

/**
 * Generate the next n GF29 symbols from a monic degree-238 recurrence.
 * Clock advances on a nonrepeating successor only in the proposed decoder.
 * @param {number[]} coeff 238 low coefficients, ascending powers
 * @param {number[]} seed 238 original GP29 state symbols
 * @param {number} n
 * @returns {number[]}
 */
function stream(coeff, seed, n) {
  const state = seed.slice();
  let head = 0;
  const output = Array(n);
  for (let i = 0; i < n; i++) {
    let value = 0;
    for (let j = 0; j < 238; j++) {
      value += coeff[j] * state[(head + j) % 238];
    }
    const next = mod29(-value);
    output[i] = next;
    state[head] = next;
    head = (head + 1) % 238;
  }
  return output;
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}
/**
 * A deterministic, reversible predecessor-excluding GP28 transport.
 * The repeated predecessor means plaintext rune F, with no key advance.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {'cyclic'|'sorted'} order
 * @param {number} startClock
 * @returns {{plain:number[], clock:number}}
 */
function decode(cipher, key, sign, order, startClock = 0) {
  let previous = 0;
  let clock = startClock;
  const plain = [];
  for (const current of cipher) {
    if (current === previous) {
      plain.push(0);
    } else {
      const rank = order === 'cyclic'
        ? mod29(current - previous) - 1
        : (current < previous ? current : current - 1);
      plain.push(1 + mod28(rank + sign * key[clock]));
      clock++;
    }
    previous = current;
  }
  return { plain, clock };
}
/** Exact inverse, used only for controls and original-cipher reconstruction. */
function encode(plain, key, sign, order, startClock = 0) {
  let previous = 0;
  let clock = startClock;
  const cipher = [];
  for (const rune of plain) {
    let current = previous;
    if (rune !== 0) {
      const rank = mod28(rune - 1 - sign * key[clock]);
      current = order === 'cyclic'
        ? (previous + rank + 1) % 29
        : (rank < previous ? rank : rank + 1);
      clock++;
    }
    cipher.push(current);
    previous = current;
  }
  return { cipher, clock };
}

const seeds = [
  { name: 'p3||p39', runes: [...p3, ...p39] },
  { name: 'p39||p3', runes: [...p39, ...p3] },
  { name: 'reverse(p3||p39)', runes: [...p3, ...p39].reverse() },
  { name: 'reverse(p39||p3)', runes: [...p39, ...p3].reverse() }
];
const results = [];
for (const [factor, poly] of [['Q238', q238], ['reciprocal Q238', reciprocal]]) {
  for (const seed of seeds) {
    const key = stream(poly.slice(0, 238), seed.runes, 13000);
    for (const order of ['cyclic', 'sorted']) {
      for (const sign of [-1, 1]) {
        let clock = 0;
        const decoded = [];
        let p55 = [];
        for (const page of pages) {
          const { plain, clock: nextClock } = decode(page.indices, key, sign, order, clock);
          const reciphered = encode(plain, key, sign, order, clock);
          assert.deepEqual(reciphered.cipher, page.indices);
          assert.equal(reciphered.clock, nextClock);
          decoded.push(...plain);
          clock = nextClock;
          if (page.page === 55) p55 = plain;
        }
        assert.equal(clock, 12868);
        assert.equal(decoded.filter((x) => x === 0).length, 88);
        // A real printed p57 native GP passage, encrypted and recovered
        // under the candidate scheme independently of the unknown pages.
        const plant = [...corpus.pages[57].indices, ...corpus.pages[57].indices];
        const made = encode(plant, key, sign, order);
        assert.deepEqual(decode(made.cipher, key, sign, order).plain, plant);
        results.push({
          factor, seed: seed.name, order, sign,
          fullIoC: ioc(decoded),
          eCount: decoded.filter((x) => x === 18).length,
          p55IoC: ioc(p55),
          p55Start: p55.slice(0, 24).map((x) => corpus.translit[x]).join('')
        });
      }
    }
  }
}
results.sort((a, b) => b.fullIoC - a.fullIoC);
assert.equal(results.length, 32);
assert.ok(Math.abs(ioc(original) - 0.03447839786450569) < 1e-12);
assert.ok(Math.abs(results[0].fullIoC - 0.0353199243730733) < 1e-12);
assert.ok(Math.abs(results[31].fullIoC - 0.035256329977816435) < 1e-12);
assert.ok(results.every((x) => x.fullIoC < 0.052));
console.log(JSON.stringify({
  hypothesis: 'Q238 source-linked LFSR + GP28 predecessor-excluding reversible cipher',
  source: { originalRunes: original.length, tableBytes: bytes.length,
    q238Degree: 238, originalDoubletMarkers: 86, pageInitialFMarkers: 2 },
  control: { originalIoC: ioc(original), nativePrintedP57IoC: ioc(corpus.pages[57].indices),
    nativePlantRoundTrips: 32, originalCipherRoundTrips: 32 * pages.length },
  candidateCount: results.length, best: results[0], worst: results[31],
  allCandidates: results, conclusion: 'No native GP English/plaintext is recovered.'
}, null, 2));
