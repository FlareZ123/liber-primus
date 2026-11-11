'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = __dirname;
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const Q = 29;
const mod = x => ((x % Q) + Q) % Q;

function trim(a) {
  let n = a.length;
  while (n > 1 && a[n - 1] === 0) n--;
  return a.slice(0, n);
}
function invMod(x) {
  for (let i = 1; i < Q; i++) if (mod(i * x) === 1) return i;
  throw new Error('no inverse for ' + x);
}
function divide(poly, factor) {
  const rem = poly.slice();
  const quotient = Array(poly.length - factor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const scale = mod(rem[i + factor.length - 1] * invMod(factor[factor.length - 1]));
    quotient[i] = scale;
    for (let j = 0; j < factor.length; j++) rem[i + j] = mod(rem[i + j] - scale * factor[j]);
  }
  assert(rem.slice(0, factor.length - 1).every(x => x === 0), 'nonzero factor remainder');
  return trim(quotient);
}

// Exact source factorization already established in grid-bigint-factor-page53.md.
const exactFactorsAscending = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
let residual = trim(grid.bytes.slice().reverse().map(mod));
for (const factor of exactFactorsAscending) residual = divide(residual, factor);
const r = residual.map(x => mod(x * invMod(residual.at(-1))));
assert.equal(r.length, 239, 'expected monic degree-238 residual factor');
assert.equal(r[238], 1);
assert.equal(r[0], 5, 'backward recurrence must be invertible');

const pages = corpus.pages
  .filter(p => p.page <= 55 && p.status === 'unsolved' && p.indices.length)
  .slice()
  .sort((a, b) => a.page - b.page);
const p36 = pages.find(p => p.page === 36);
assert(p36, 'missing p36');
const seed = p36.indices.slice();
assert.equal(seed.length, 238, 'p36 must contain exactly 238 runes');
const before = pages.filter(p => p.page < 36).flatMap(p => p.indices);
const after = pages.filter(p => p.page > 36).flatMap(p => p.indices);
const all = pages.flatMap(p => p.indices);
assert.equal(before.length, 8706);
assert.equal(after.length, 4012);
assert.equal(all.length, 12956);

function next(state) {
  let sum = 0;
  for (let j = 0; j < 238; j++) sum -= r[j] * state[j];
  const value = mod(sum);
  state.shift();
  state.push(value);
  return value;
}
function previous(state) {
  let sum = state[237];
  for (let j = 1; j < 238; j++) sum += r[j] * state[j - 1];
  const value = mod(-invMod(r[0]) * sum);
  state.pop();
  state.unshift(value);
  return value;
}

// Verify that the inverse recurrence walks back to a preceding state.
{
  const state = seed.slice();
  for (let i = 0; i < 238; i++) previous(state);
  for (let i = 0; i < 238; i++) next(state);
  assert.deepEqual(state, seed);
}

function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function decrypt(cipher, key, sign) {
  return cipher.map((value, i) => mod(value + sign * key[i]));
}
function translit(values) {
  return values.map(value => corpus.translit[value]).join('');
}

const variants = [];

// Clock A: p36 is the state page. Exclude its runes, extend the recurrence
// backwards to p0-p35 and forwards to p37-p55, then use it as an additive pad.
for (const reverseSeed of [false, true]) {
  const state = reverseSeed ? seed.slice().reverse() : seed.slice();
  const leftReverse = [];
  for (let i = 0; i < before.length; i++) leftReverse.push(previous(state));
  const right = [];
  for (let i = 0; i < after.length; i++) right.push(next(state));
  const key = [...leftReverse.reverse(), ...right];
  const cipher = [...before, ...after];
  for (const sign of [-1, 1]) {
    const plain = decrypt(cipher, key, sign);
    variants.push({
      clock: 'p36-anchored; p36 excluded',
      seedOrder: reverseSeed ? 'reversed' : 'forward',
      includeSeedBlock: false,
      sign,
      ioc: ioc(plain),
      prefix: translit(plain.slice(0, 100)),
    });
  }
}

// Clock B: book begins at p0. Test first recurrence output or initial seed
// block as the first key material, both seed readings and both additive signs.
for (const reverseSeed of [false, true]) {
  for (const includeSeedBlock of [false, true]) {
    const state = reverseSeed ? seed.slice().reverse() : seed.slice();
    const key = includeSeedBlock ? state.slice() : [];
    while (key.length < all.length) key.push(next(state));
    for (const sign of [-1, 1]) {
      const plain = decrypt(all, key, sign);
      variants.push({
        clock: 'book-start p0',
        seedOrder: reverseSeed ? 'reversed' : 'forward',
        includeSeedBlock,
        sign,
        ioc: ioc(plain),
        prefix: translit(plain.slice(0, 100)),
      });
    }
  }
}

// Positive control: the same recurrence-generated additive pad must exactly
// round-trip a known source plaintext of the same length.
const known = corpus.pages.find(p => p.page === 57).indices;
const planted = Array.from({ length: all.length }, (_, i) => known[i % known.length]);
const controlState = seed.slice();
const controlKey = [];
while (controlKey.length < planted.length) controlKey.push(next(controlState));
const encryptedPlant = planted.map((value, i) => mod(value + controlKey[i]));
const recoveredPlant = decrypt(encryptedPlant, controlKey, -1);
assert.deepEqual(recoveredPlant, planted, 'synthetic positive control must recover exactly');

const decodedIocs = variants.map(v => v.ioc);
const output = {
  factorDegree: r.length - 1,
  factorConstant: r[0],
  factorHead: r.slice(0, 12),
  p36SeedLength: seed.length,
  beforeLength: before.length,
  afterLength: after.length,
  fullUnknownLength: all.length,
  rawIoC: {
    full: ioc(all),
    excludingP36: ioc([...before, ...after]),
  },
  uniformIoC: 1 / Q,
  decodedIoCRange: [Math.min(...decodedIocs), Math.max(...decodedIocs)],
  variants,
  positiveControl: {
    plaintext: 'p57 source runes repeated to original length',
    symbols: planted.length,
    exactRoundTrip: true,
  },
};
console.log(JSON.stringify(output, null, 2));
