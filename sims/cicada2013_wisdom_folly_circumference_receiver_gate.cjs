#!/usr/bin/env node
'use strict';

// Bounded literal-reading follow-up to the 2013 wisdom/folly perimeter gate.
// Tests the 228=3*76 perimeter as three channels for p55, and the
// 3136+180=3316 stripped-interior pad hypothesis for floral pp40-55.
// p57 circumference wording is not a unique geometric selector (LP1 p3/p10/p14 define the prior metaphor).
// Read-only; every candidate is round-trip checked. No phase or KDF search.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

const root = process.cwd();
const sourcePath = path.join(root, 'resources/historical/cicada-2013-os-wisdom-folly.bin.b64');
const gridPath = path.join(root, 'resources/liber-primus/base60-grid.json');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const controlPath = path.join(root, 'resources/control/shakespeare_first300k.txt');

const sourceBytes = Buffer.from(fs.readFileSync(sourcePath, 'utf8').replace(/\s+/g, ''), 'base64');
const sourceSha256 = crypto.createHash('sha256').update(sourceBytes).digest('hex');
assert.strictEqual(sourceBytes.length, 3368);
assert.strictEqual(sourceSha256, '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');

const payload = sourceBytes.subarray(4, 4 + 58 * 58);
const matrix2013 = Array.from({ length: 58 }, (_, r) =>
  Array.from(payload.subarray(r * 58, (r + 1) * 58)));
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const matrix2014 = grid.byte_rows.map(row => row.map(Number));
assert.strictEqual(matrix2014.length, 32);
assert(matrix2014.every(row => row.length === 8));

const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const alphabet = corpus.translit;
const primes = corpus.prime;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const floralPages = corpus.pages.filter(p => p.page >= 40 && p.page <= 55 && p.page !== 50);
const floral = floralPages.flatMap(p => p.indices);
assert.strictEqual(p55.length, 76);
assert.strictEqual(floral.length, 3316);

const control = fs.readFileSync(controlPath, 'utf8').toUpperCase().replace(/[^A-Z]/g, '');
const tokens = [...alphabet].sort((a, b) => b.length - a.length);
const reference = [];
for (let i = 0; i < control.length;) {
  const token = tokens.find(t => control.startsWith(t, i));
  if (token) {
    reference.push(alphabet.indexOf(token));
    i += token.length;
  } else {
    i++;
  }
}
const train = reference.slice(0, Math.floor(reference.length * 0.8));
const trigram = new Map();
const context = new Map();
for (let i = 2; i < train.length; i++) {
  const c = train[i - 2] * 29 + train[i - 1];
  const t = c * 29 + train[i];
  trigram.set(t, (trigram.get(t) || 0) + 1);
  context.set(c, (context.get(c) || 0) + 1);
}
function score(xs) {
  let total = 0;
  for (let i = 2; i < xs.length; i++) {
    const c = xs[i - 2] * 29 + xs[i - 1];
    total += Math.log(((trigram.get(c * 29 + xs[i]) || 0) + 1) /
      ((context.get(c) || 0) + 29));
  }
  return total / (xs.length - 2);
}
function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function format(xs) { return xs.map(x => alphabet[x]).join(''); }
const mod29 = x => ((x % 29) + 29) % 29;

function perimeter(m) {
  const h = m.length, w = m[0].length, out = [];
  for (let c = 0; c < w; c++) out.push(m[0][c]);
  for (let r = 1; r < h; r++) out.push(m[r][w - 1]);
  for (let c = w - 2; c >= 0; c--) out.push(m[h - 1][c]);
  for (let r = h - 2; r > 0; r--) out.push(m[r][0]);
  return out;
}
function spiral(m, clockwise = true) {
  let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
  const out = [];
  while (top <= bottom && left <= right) {
    if (clockwise) {
      for (let c = left; c <= right; c++) out.push(m[top][c]);
      for (let r = top + 1; r <= bottom; r++) out.push(m[r][right]);
      if (top < bottom) for (let c = right - 1; c >= left; c--) out.push(m[bottom][c]);
      if (left < right) for (let r = bottom - 1; r > top; r--) out.push(m[r][left]);
    } else {
      for (let r = top; r <= bottom; r++) out.push(m[r][left]);
      for (let c = left + 1; c <= right; c++) out.push(m[bottom][c]);
      if (left < right) for (let r = bottom - 1; r >= top; r--) out.push(m[r][right]);
      if (top < bottom) for (let c = right - 1; c > left; c--) out.push(m[top][c]);
    }
    top++; bottom--; left++; right--;
  }
  return out;
}
function decryptContinuous(cipher, key, sign) {
  assert.strictEqual(cipher.length, key.length);
  return cipher.map((v, i) => mod29(v + sign * key[i]));
}
function decryptFHold(cipher, key, sign) {
  const out = [];
  let pos = 0;
  for (const v of cipher) {
    assert(pos < key.length, 'F-hold key exhausted');
    const p = mod29(v + sign * key[pos]);
    out.push(p);
    if (p !== 0) pos++;
  }
  return { plaintext: out, consumed: pos, unused: key.length - pos };
}
function encryptFHold(plain, key, sign) {
  const out = [];
  let pos = 0;
  for (const p of plain) {
    assert(pos < key.length, 'F-hold key exhausted during replay');
    out.push(mod29(p + sign * key[pos]));
    if (p !== 0) pos++;
  }
  return out;
}
function evaluate(cipher, key, sign, clock) {
  if (clock === 'continuous') {
    const plain = decryptContinuous(cipher, key, sign);
    assert.deepStrictEqual(decryptContinuous(plain, key, -sign), cipher);
    return { plaintext: plain, consumed: key.length, unused: 0 };
  }
  const result = decryptFHold(cipher, key, sign);
  assert.deepStrictEqual(encryptFHold(result.plaintext, key, -sign), cipher);
  return result;
}

// Three-channel receiver: 228 perimeter bytes -> three 76-byte channels -> p55.
const ring2013 = perimeter(matrix2013);
assert.strictEqual(ring2013.length, 228);
const threeByteMaps = {
  be24_mod29: b => (((b[0] * 256 + b[1]) * 256 + b[2]) % 29),
  le24_mod29: b => ((b[0] + b[1] * 256 + b[2] * 65536) % 29),
  be24_scaled29: b => Math.floor((((b[0] * 256 + b[1]) * 256 + b[2]) * 29) / 16777216),
  le24_scaled29: b => Math.floor(((b[0] + b[1] * 256 + b[2] * 65536) * 29) / 16777216),
  sum_mod29: b => b.reduce((s, x) => s + x, 0) % 29,
  xor_mod29: b => b.reduce((s, x) => s ^ x, 0) % 29,
  luminance_mod29: b => Math.floor(0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]) % 29,
  channel_r: b => b[0] % 29,
  channel_g: b => b[1] % 29,
  channel_b: b => b[2] % 29
};
const p55Results = [];
for (const [name, fn] of Object.entries(threeByteMaps)) {
  const key = Array.from({ length: 76 }, (_, i) =>
    fn([ring2013[i], ring2013[76 + i], ring2013[152 + i]]));
  for (const sign of [-1, 1]) {
    for (const clock of ['continuous', 'F-hold']) {
      const result = evaluate(p55, key, sign, clock);
      p55Results.push({
        map: name, sign, clock, consumed: result.consumed, unused: result.unused,
        score: score(result.plaintext), ioc: ioc(result.plaintext),
        prefix: format(result.plaintext.slice(0, 120))
      });
    }
  }
}
p55Results.sort((a, b) => b.score - a.score);

// Strip the outer row/column from both source matrices, then concatenate in chronology.
const interior2013Matrix = matrix2013.slice(1, 57).map(row => row.slice(1, 57));
const interior2014Matrix = matrix2014.slice(1, 31).map(row => row.slice(1, 7));
const interior2013 = interior2013Matrix.flat();
const interior2014 = interior2014Matrix.flat();
assert.strictEqual(interior2013.length, 3136);
assert.strictEqual(interior2014.length, 180);
const rowMajorKey = interior2013.concat(interior2014);
assert.strictEqual(rowMajorKey.length, floral.length);
const keyOrders = [
  ['row-major', rowMajorKey],
  ['spiral-CW', spiral(interior2013Matrix, true).concat(spiral(interior2014Matrix, true))],
  ['spiral-CCW', spiral(interior2013Matrix, false).concat(spiral(interior2014Matrix, false))]
];
keyOrders.push(['spiral-CW-reverse', [...keyOrders[1][1]].reverse()]);
keyOrders.push(['spiral-CCW-reverse', [...keyOrders[2][1]].reverse()]);

const interiorResults = [];
for (const [order, rawKey] of keyOrders) {
  assert.strictEqual(rawKey.length, 3316);
  for (const [map, fn] of [
    ['byte_mod29', b => b % 29],
    ['byte_scaled29', b => Math.floor(b * 29 / 256)]
  ]) {
    const key = rawKey.map(fn);
    for (const sign of [-1, 1]) {
      for (const clock of ['continuous', 'F-hold']) {
        const result = evaluate(floral, key, sign, clock);
        interiorResults.push({
          order, map, sign, clock, consumed: result.consumed, unused: result.unused,
          score: score(result.plaintext), ioc: ioc(result.plaintext),
          prefix: format(result.plaintext.slice(0, 120))
        });
      }
    }
  }
}
interiorResults.sort((a, b) => b.score - a.score);

// Bytewise diagnostics for the original 2013 XOR operation and a 5-bit GP29-index XOR.
const primeSet = new Set(primes);
const primeXorValid = floral.reduce((n, c, i) =>
  n + (primeSet.has(primes[c] ^ rowMajorKey[i]) ? 1 : 0), 0);
const low5XorInvalid = floral.reduce((n, c, i) =>
  n + ((c ^ (rowMajorKey[i] & 31)) >= 29 ? 1 : 0), 0);

const output = {
  source: {
    bytes: sourceBytes.length, sha256: sourceSha256,
    matrix2013: '58x58 after four-byte prefix',
    perimeter2013: ring2013.length,
    interior2013: interior2013.length
  },
  grid2014: {
    pages: grid.lp2_pages, dimensions: [matrix2014.length, matrix2014[0].length],
    perimeter: perimeter(matrix2014).length, interior: interior2014.length
  },
  targets: {
    p55: p55.length,
    floralPages: floralPages.map(p => p.page),
    floralLength: floral.length
  },
  raw: {
    p55: { score: score(p55), ioc: ioc(p55) },
    floral: { score: score(floral), ioc: ioc(floral) }
  },
  three_channel_p55: {
    tested: p55Results.length,
    best: p55Results.slice(0, 5)
  },
  stripped_interior_floral_pad: {
    keyLength: rowMajorKey.length,
    components: [interior2013.length, interior2014.length],
    tested: interiorResults.length,
    best: interiorResults.slice(0, 5),
    bytewise: { primeValueXorValid: primeXorValid, low5IndexXorInvalid: low5XorInvalid }
  }
};
console.log(JSON.stringify(output, null, 2));
