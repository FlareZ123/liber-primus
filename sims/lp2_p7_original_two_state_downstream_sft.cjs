'use strict';
/**
 * Original LP2 p7 red-product -> p8 polynomial and conditional GF4/radix59
 * controls on intact untouched p8-p21 ciphertext.
 * These are two scoped candidate consumers, NOT Cicada-authenticated opcodes.
 * Windows 11 / Node.js 22 SFT: read-only, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {any} */
const load = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const ink = load('lp2-ink-annotations.json');
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert(Math.abs(actual - expected) < 1e-12,
    String(actual) + ' !== ' + String(expected));
}
const page = n => corpus.pages.find(p => p.page === n).indices;
const lastFive = page(7).slice(194);
assert.equal(lastFive.length, 14);
const fiveLengths = [2, 4, 3, 2, 3];
const fiveWords = [];
for (let j = 0, i = 0; j < fiveLengths.length; j++) {
  fiveWords.push(lastFive.slice(i, i + fiveLengths[j]));
  i += fiveLengths[j];
}
const products = fiveWords.map(word =>
  word.reduce((v, x) => mod(v * x), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const heading = [page(8).slice(0, 4), page(8).slice(4, 12)];
assert.deepEqual(heading.map(w => w.reduce((v, x) => mod(v * x), 1)), [4, 3]);
assert.equal(page(8)[11], 17);
assert.deepEqual(ink.pages.find(p => p.page === 8).red_spans
  .map(s => [s.start, s.length]), [[0, 12]]);

/** @param {number} a @param {number} b @returns {number} */
function gf4Multiply(a, b) {
  let v = 0;
  for (let k = 0; k < 2; k++) {
    if ((b >>> k) & 1) v ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return v;
}
const taps = products.slice(0, 4).map(x => x % 4);
let state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((a, x) => 4 * a + x, 0));
  const next = taps.reduce((v, x, j) => v ^ gf4Multiply(x, state[j]), 0);
  state = [state[1], state[2], state[3], next];
}
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
assert.deepEqual(addresses.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const table = grid.pages.flatMap(p => p.tokens).map(t =>
  59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]));
assert.equal(table.length, 256);
const pad = addresses.map(i => mod(table[i]));
const original8 = page(8);
const corrected8 = original8.map((x, i) => mod(x + pad[i]));
const fourPairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(fourPairs.map(([a, b]) => [corrected8[a], corrected8[b]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);
assert.deepEqual(corrected8.map((x, i) => mod(x - pad[i])), original8);
near(ioc(corrected8), 0.03727034120734908);

// Direct unchanged 255-cycle pad transfer. Both clocks are source-visible
// alternatives; neither was selected by an authorial instruction.
const additive = [];
for (const [from, to, n, continuousIoC, resetIoC] of [
  [8, 14, 1729, 0.03467603303129619, 0.034380823854508066],
  [15, 21, 1772, 0.03467834550374545, 0.03458211236207114]
]) {
  const pages = corpus.pages.filter(p => p.page >= from && p.page <= to);
  const cont = [], reset = [];
  let offset = 0;
  for (const p of pages) {
    const body = p.indices;
    cont.push(...body.map((x, i) => mod(x + pad[(offset + i) % 255])));
    reset.push(...body.map((x, i) => mod(x + pad[i % 255])));
    offset = (offset + body.length) % 255;
  }
  assert.equal(cont.length, n);
  near(ioc(cont), continuousIoC);
  near(ioc(reset), resetIoC);
  additive.push({physicalPages: [from, to], originalRunes: n,
    continuousIoc: ioc(cont), pageResetIoc: ioc(reset)});
}

// Alternate nonlinear source-inspired consumer. The five p7 products supply
// an ascending GF29 polynomial; p8 red whole-word products 4,3 initialize
// a hypothetical two-register additive emitter. This Feistel-like use is
// an EXPLORATORY design choice, not printed as an LP2 cipher opcode.
/** @param {number} x @returns {number} */
const polynomial = x => products.reduceRight((v, a) => mod(v * x + a), 0);
assert.equal(polynomial(3), 3);
assert.equal(polynomial(4), 4);
let left = 4, right = 3;
const original = [], stream = [], perPage = [];
for (let n = 8; n <= 14; n++) {
  const body = n === 8 ? page(n).slice(12) : page(n);
  const start = original.length;
  for (const c of body) {
    const next = mod(left + polynomial(right));
    left = right;
    right = next;
    original.push(c);
    stream.push(next);
  }
  const proposed = body.map((x, i) => mod(x - stream[start + i]));
  perPage.push({page: n, runes: body.length, ioc: ioc(proposed)});
}
const proposed = original.map((x, i) => mod(x - stream[i]));
assert.equal(proposed.length, 1717);
near(ioc(proposed), 0.0342957372660343);
const expectedPageIocs = [
  0.03302384110464918, 0.034797920509810495, 0.03381418163875424,
  0.03339797457444516, 0.035278514588859416, 0.0335901888430649,
  0.03188063546586518
];
perPage.forEach((x, i) => near(x.ioc, expectedPageIocs[i]));
assert.deepEqual(proposed.map((x, i) => mod(x + stream[i])), original);

// Authentic native-GP known-text plants, and a deliberate forced repeated
// GP symbol, test forward/reverse integrity without tuning original text.
const authentic = page(57);
const planted = Array.from({ length: original.length }, (_, i) =>
  authentic[i % authentic.length]);
planted[99] = planted[98];
const encFeistel = planted.map((x, i) => mod(x + stream[i]));
assert.deepEqual(encFeistel.map((x, i) => mod(x - stream[i])), planted);
const plantedPad = planted.map((x, i) => mod(x - pad[i % 255]));
assert.deepEqual(plantedPad.map((x, i) => mod(x + pad[i % 255])), planted);
near(ioc(authentic), 0.06270996640537514);
console.log(JSON.stringify({
  source: 'unmodified LP2 original corpus', sourceProducts: products,
  p8WordProducts: [4, 3], fourConditionalEqualities: fourPairs,
  p8CorrectedIoc: ioc(corrected8), additiveTransfers: additive,
  polynomialTwoRegister: {bodyRunes: original.length, totalIoc: ioc(proposed),
    perPage, terminalRegister: [left, right]},
  knownTextPlantRecovered: planted.length
}, null, 2));
console.log('PASS: source-fixed original-input negatives; reversible positive plants.');
