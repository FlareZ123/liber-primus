'use strict';
/**
 * Source-constrained original LP2 Blum–Blum–Shub / Blum–Goldwasser gate.
 *
 * The original p0 8+5 red header has GP-prime sums 347 and 315; their
 * midpoint is 331, and both word sums select row27 of the original
 * 32x8 base60 byte table. Its last cell is 151. Both 331 and 151
 * are 3 mod4, so they form a natural *hypothetical* Blum modulus.
 *
 * This experiment demands no recovered key or inferred cipher offset.
 * The source does not command BBS, B–G or these row-selection rules.
 * Node 22, CommonJS, read-only. Original inputs remain unmodified.
 */
const assert = require('node:assert/strict');
const gp = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const mod = (a, n) => (a % n + n) % n;

/** @param {number} a @param {number} power @param {number} m */
function modpow(a, power, m) {
  let value = 1;
  for (; power > 0; power = Math.floor(power / 2), a = a * a % m) {
    if (power % 2) value = value * a % m;
  }
  return value;
}

/** @param {number} n */
function prime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n > 1;
}

const red = gp.pages[0].indices.slice(0, 13);
assert.deepEqual(red, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const sum = group => group.reduce((s, x) => s + gp.prime[x], 0);
const first = sum(red.slice(0, 8));
const second = sum(red.slice(8));
assert.deepEqual([first, second], [347, 315]);
assert.equal(first % 32, 27);
assert.equal(second % 32, 27);
const Q = (first + second) / 2;
const P = grid.bytes[27 * 8 + 7];
assert.deepEqual([P, Q], [151, 331]);
assert.ok(prime(P) && prime(Q) && P % 4 === 3 && Q % 4 === 3);
const N = P * Q;
assert.equal(N, 49981);

const orderP = (P - 1) / 2;
const orderQ = (Q - 1) / 2;
assert.deepEqual([orderP, orderQ], [75, 165]);
assert.equal(modpow(2, 20, orderP), 1);
assert.equal(modpow(2, 20, orderQ), 1);
assert.notEqual(modpow(2, 10, orderP), 1);
assert.notEqual(modpow(2, 10, orderQ), 1);

/**
 * In QR(P), squaring has order 20: the group has size75 and
 * 2^20=1 mod75. In QR(Q), size165 and 2^20=1 mod165.
 * Hence EVERY BBS orbit from a squared state repeats within20.
 * Applies to every possible seed, including unknown seeds.
 */
function bbsPeriod(seed) {
  let x = seed * seed % N;
  const seen = new Map();
  for (let t = 0; t <= 20; t++) {
    if (seen.has(x)) return { preperiod: seen.get(x), period: t - seen.get(x) };
    seen.set(x, t);
    x = x * x % N;
  }
  throw new Error('Contradicts the proved 20-period bound');
}
const seedPeriods = Object.fromEntries(
  [13, 315, 347, 3301, 32].map(seed => [seed, bbsPeriod(seed)])
);
assert.deepEqual(Object.values(seedPeriods).map(x => x.period), [20, 20, 20, 20, 2]);

const originalBytes = grid.bytes;
assert.equal(originalBytes.length, 256);
assert.equal(grid.pages.flatMap(p => p.tokens).length, 256);
const distinctBytes = new Set(originalBytes).size;
assert.equal(distinctBytes, 161);
assert.ok(distinctBytes > 20,
  'Any deterministic one-byte-per-BBS-state emitter has <=20 bytes');

// Fixed-length groups of BBS bits also repeat. Parity-bit emission,
// eight bits per byte, has at most lcm(20,8)/8 = 5 byte positions.
const x0 = 13 * 13 % N;
let x = x0;
const parityBytes = [];
for (let i = 0; i < 256; i++) {
  let value = 0;
  for (let j = 0; j < 8; j++) {
    x = x * x % N;
    value = (value << 1) | (x % 2);
  }
  parityBytes.push(value);
}
assert.deepEqual(parityBytes.slice(0, 251), parityBytes.slice(5, 256));
assert.ok(new Set(parityBytes).size <= 5);

/** @param {number} value @param {number} modulus */
function quadraticResidue(value, modulus) {
  if (value < 0 || value >= N) return false;
  return modpow(value % modulus, (modulus - 1) / 2, modulus) === 1;
}
/** @param {number[]} bytes */
function tableEnds(bytes) {
  const a = bytes[254], b = bytes[255];
  return [
    { direction: 'big', value: a * 256 + b },
    { direction: 'little', value: a + b * 256 },
  ].map(({direction, value}) => ({
    direction, value, inRange: value < N,
    QRp: value < N && quadraticResidue(value, P),
    QRq: value < N && quadraticResidue(value, Q)
  }));
}
const base60Tail = tableEnds(originalBytes);
assert.deepEqual(base60Tail, [
  { direction: 'big', value: 48464, inRange: true, QRp: true, QRq: false },
  { direction: 'little', value: 20669, inRange: true, QRp: false, QRq: false }
]);
// A textbook Blum–Goldwasser trailer x_(t+1) is always a quadratic
// residue modulo BOTH primes. Neither 16-bit original radix60
// tail reading qualifies, independent of plaintext or initial seed.

const fullAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const radix59 = fullAlphabet.replace('f', '');
const sourceTokens = grid.pages.flatMap(p => p.tokens);
const alternative = sourceTokens.map(token =>
  59 * radix59.indexOf(token[0]) + radix59.indexOf(token[1]));
assert.ok(alternative.every(n => n >= 0 && n <= 255));
assert.equal(alternative[27 * 8 + 7], 149);
assert.equal(alternative[27 * 8 + 7] % 4, 1);
const base59Tail = tableEnds(alternative);
assert.deepEqual(base59Tail, [
  { direction: 'big', value: 47695, inRange: true, QRp: false, QRq: true },
  { direction: 'little', value: 20410, inRange: true, QRp: true, QRq: true }
]);
// This last mathematically possible residue is NOT a sourced BBS
// solution: radix59 changes the row-selected first factor151 to149,
// which is 1 mod4, and no original authorial framing rule is known.

/** @param {number[]} values */
function ioc(values) {
  const h = Array(29).fill(0);
  for (const v of values) h[v]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} source @param {number} period */
function allSecretPeriodIocMax(source, period) {
  const classes = Array.from({length: period}, () => Array(29).fill(0));
  source.forEach((v, i) => classes[i % period][v]++);
  const combined = Array(29).fill(0);
  for (const row of classes) {
    row.sort((a, b) => b - a);
    row.forEach((n, i) => { combined[i] += n; });
  }
  // Rearrangement inequality: aligning all descending class histograms
  // maximizes total squared output-bin counts under arbitrary, independent
  // 29-symbol bijections at each of the period phases. This is a much
  // larger cipher family than additive BBS running keys.
  return combined.reduce((s, n) => s + n * (n - 1), 0) /
    (source.length * (source.length - 1));
}
const floral = gp.pages.filter(p => p.page >= 40 && p.page <= 53)
  .flatMap(p => p.indices);
assert.equal(floral.length, 3008);
const floralOriginalIoc = ioc(floral);
const floralMax20Ioc = allSecretPeriodIocMax(floral, 20);
assert.ok(Math.abs(floralOriginalIoc - 0.0345426274862201) < 1e-12);
assert.ok(Math.abs(floralMax20Ioc - 0.040863428595688076) < 1e-12);
const solved57Ioc = ioc(gp.pages[57].indices);
assert.ok(Math.abs(solved57Ioc - 0.06270996640537514) < 1e-12);
assert.ok(floralMax20Ioc < solved57Ioc);

// Positive controls: actual modulo-N squaring is a reversible permutation
// restricted to the QR subgroup. Check forward/backward every state on
// each original source-seed orbit without using plaintext or score fitting.
const crtInverse = 57; // 151^-1 mod331
assert.equal(P * crtInverse % Q, 1);
/** @param {number} s */
function reverseSquare(s) {
  const rp = modpow(s % P, (orderP + 1) / 2, P);
  const rq = modpow(s % Q, (orderQ + 1) / 2, Q);
  return rp + P * mod((rq - rp) * crtInverse, Q);
}
for (const seed of [13, 315, 347, 3301, 32]) {
  let state = seed * seed % N;
  for (let i = 0; i < 20; i++) {
    assert.equal(reverseSquare(state * state % N), state);
    state = state * state % N;
  }
}

console.log(JSON.stringify({
  selectedOriginalSource: {redWordPrimeSums: [first, second], row: 27, primeP: P,
    primeQ: Q, modulus: N},
  mathematicallyProvedBbsStatePeriodAtMost: 20,
  selectedSourceSeedExamples: seedPeriods,
  p50Bytes: originalBytes.length, distinctSourceBytes: distinctBytes,
  maximumDirectStateByteDistinct: 20,
  observedFirst20ParityBitsCycleByteDistinct: new Set(parityBytes).size,
  originalRadix60TerminalStates: base60Tail,
  incompatibleRadix59PrimeSelection: 149, alternativeTerminals: base59Tail,
  originalFloralRunes: floral.length, originalFloralIoC: floralOriginalIoc,
  exactMaxIoCAllSecret20PhaseSubstitution: floralMax20Ioc,
  solvedP57ReferenceIoC: solved57Ioc,
  conclusion: 'No direct BBS table emission, no valid base60 BG tail, no original GP29 plaintext/key recovered'
}, null, 2));
