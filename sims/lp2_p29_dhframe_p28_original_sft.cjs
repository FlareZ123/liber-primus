'use strict';

/**
 * Reproduce the source-derived p29 DH-shaped outer frame and its exact
 * p28-length inner field, then test the simplest reversible paired-page maps.
 *
 * Run from the root of the FlareZ123/liber-primus repository with Node.js 22.
 * The script is read-only and requires only the checked-in canonical corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const gp = corpus.translit;
const p28 = pages[28].indices;
const p29 = pages[29].indices;
const clear = pages[57].indices;

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number} a @param {number} n @param {number} m @returns {number} */
function power(a, n, m) {
  let out = 1;
  for (let i = 0; i < n; i++) out = (out * a) % m;
  return out;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const v of values) count[v]++;
  return count.reduce((n, v) => n + v * (v - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
function roman(values) {
  return values.map(i => gp[i]).join('');
}

// Fixed, signed 2013 DH23 example: modulus, generator, public shares, key.
const p = 23, g = 5, A = 8, B = 19, K = 2;
const a = Array.from({length: p - 1}, (_, i) => i + 1).find(e => power(g, e, p) === A);
const b = Array.from({length: p - 1}, (_, i) => i + 1).find(e => power(g, e, p) === B);
assert.equal(a, 6);
assert.equal(b, 15);
assert.equal(power(B, a, p), K);
assert.equal(power(A, b, p), K);

// p28's independently documented H(A,B) difference half is A-B (mod 29).
const H0 = mod29(A - B);
assert.equal(H0, 18);
const head = [K, p];
const tail = [g, H0, mod29(K * a), a, A, B];
assert.deepEqual(head, [2, 23]);
assert.deepEqual(tail, [5, 18, 12, 6, 8, 19]);
assert.deepEqual(p29.slice(0, head.length), head);
assert.deepEqual(p29.slice(-tail.length), tail);
assert.deepEqual(p29.slice(0, 3), [K, p, a]); // extra natural same-state match
assert.equal(p28.length, 269);
assert.equal(p29.length, 277);
const inner = p29.slice(head.length, -tail.length);
assert.equal(inner.length, p28.length);

const plusEight = pages.slice(1, 56).filter(q => q.indices.length === pages[q.page - 1].indices.length + 8);
assert.deepEqual(plusEight.map(q => q.page), [29]);
const match = pages.slice(0, 56).filter(q => q.indices.length >= 8 &&
  head.every((v, i) => q.indices[i] === v) &&
  tail.every((v, i) => q.indices[q.indices.length - tail.length + i] === v));
assert.deepEqual(match.map(q => q.page), [29]);

// Previously established p39 red triad G = 15X^2+5X+27 divides original p29.
const rem = p29.slice();
for (let i = 0; i < p29.length - 2; i++) {
  const v = mod29(2 * rem[i]); // inverse(15) modulo 29 = 2
  rem[i] = 0;
  rem[i + 1] = mod29(rem[i + 1] - 5 * v);
  rem[i + 2] = mod29(rem[i + 2] - 27 * v);
}
assert.deepEqual(rem.slice(-2), [0, 0]);

// Derive the last two GP29 runes from the preceding n-2 only, by requiring
// exact division by G. The original two terminal glyphs do not enter.
/** @param {number[]} values @returns {number[]} */
function predictGTerminal(values) {
  const work = values.slice();
  const n = work.length;
  work[n - 2] = 0;
  work[n - 1] = 0;
  for (let i = 0; i < n - 2; i++) {
    const v = mod29(2 * work[i]);
    work[i] = 0;
    work[i + 1] = mod29(work[i + 1] - 5 * v);
    work[i + 2] = mod29(work[i + 2] - 27 * v);
  }
  return [mod29(-work[n - 2]), mod29(-work[n - 1])];
}
assert.deepEqual(predictGTerminal(p29), [A, B]);
const parityAudit = pages.slice(0, 56).filter(q => q.indices.length >= 3).map(q => ({
  page: q.page,
  predicted: predictGTerminal(q.indices),
  observed: q.indices.slice(-2),
}));
const sourcePair = e => e[0] === A && e[1] === B;
assert.deepEqual(parityAudit.filter(q => sourcePair(q.predicted)).map(q => q.page), [29]);
assert.deepEqual(parityAudit.filter(q => sourcePair(q.observed)).map(q => q.page), [29]);
assert.deepEqual(parityAudit.filter(q => q.predicted.every((v, i) => v === q.observed[i])).map(q => q.page), [29]);

// For post-discovery calibration only: exact probability of these eight
// distinct glyphs in these fixed edge slots under uniformly shuffled p29.
const hist = Array(29).fill(0);
for (const v of p29) hist[v]++;
let shuffledEdgeProbability = 1;
for (const [i, v] of [...head, ...tail].entries()) {
  shuffledEdgeProbability *= hist[v] / (p29.length - i);
}
assert(shuffledEdgeProbability > 0);

// Minimal one-time-pad receiver, plus the existing source-derived GP29 cube
// and its inverse. All transformations are bijections of all 29 GP symbols.
const transforms = [
  {name: 'identity', forward: x => x, inverse: x => x},
  {name: 'cube', forward: x => power(x, 3, 29), inverse: x => power(x, 19, 29)},
  {name: 'cube-inverse', forward: x => power(x, 19, 29), inverse: x => power(x, 3, 29)},
];
for (const t of transforms) {
  for (let x = 0; x < 29; x++) assert.equal(t.inverse(t.forward(x)), x);
}
const planted = Array.from({length: p28.length}, (_, i) => clear[i % clear.length]);
const scores = [];
for (const left of transforms) for (const right of transforms) for (const sign of [-1, 1]) {
  const decode = (cipher, key) => cipher.map((v, i) => mod29(left.forward(v) + sign * right.forward(key[i])));
  const encode = (plain, key) => plain.map((v, i) => left.inverse(mod29(v - sign * right.forward(key[i]))));
  const raw = decode(p28, inner);
  assert.deepEqual(encode(raw, inner), p28);
  const encryptedPlant = encode(planted, inner);
  assert.deepEqual(decode(encryptedPlant, inner), planted);
  scores.push({left: left.name, right: right.name, sign, ioc: ioc(raw), opening: roman(raw.slice(0, 45))});
}
scores.sort((x, y) => y.ioc - x.ioc);

console.log('original p28,p29 runes:', p28.length, p29.length);
console.log('signed-DH state: p=23 g=5 a=6 b=15 A=8 B=19 K=2; H(A,B)[0]=18');
console.log('original p29 head:', JSON.stringify(head), 'tail:', JSON.stringify(tail));
console.log('original p29 inner length:', inner.length, 'unique adjacent +8 pair: p28/p29');
console.log('p29 G=[15,5,27] division remainder:', JSON.stringify(rem.slice(-2)));
console.log('p29 first 275 GP runes predict signed DH A,B as G parity:', JSON.stringify(predictGTerminal(p29)));
console.log('among 55 rune pages, sole predicted A,B, observed A,B and valid G parity: p29');
console.log('fixed-edge conditional shuffle reference:', shuffledEdgeProbability.toPrecision(13));
console.log('original p28 IoC:', ioc(p28).toFixed(9), 'p29 inner IoC:', ioc(inner).toFixed(9));
const minus = scores.find(s => s.left === 'identity' && s.right === 'identity' && s.sign === -1);
const plus = scores.find(s => s.left === 'identity' && s.right === 'identity' && s.sign === 1);
console.log('literal subtract:', JSON.stringify(minus));
console.log('literal add:', JSON.stringify(plus));
console.log('best of 18 source-derived arithmetical variants:', JSON.stringify(scores[0]));
console.log('independent solved p57 cyclic native 269-rune positive IoC:', ioc(planted).toFixed(9));
console.log('PASS: 18 original exact forward replays; 18 source-native positive 269-rune inverses');
