'use strict';

/**
 * Original-source prime-successor and literal 0x11 terminal consumer gate.
 * Run with Node.js 22 from the repository root. Read-only.
 * All coordinates and numbers come from unchanged resources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const input = (name) => fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8');
const grid = JSON.parse(input('base60-grid.json'));
const corpus = JSON.parse(input('lp2-corpus.json'));
const page = corpus.pages.find((p) => p.page === 55);
assert.ok(page);
const bytes = grid.byte_rows.flat();
const tokens = grid.rows.flat();
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(page.indices.length, 76);

/** @param {number} n */
function nextPrime(n) {
  for (let m = n + 1; m <= 257; m++) {
    let prime = m >= 2;
    for (let d = 2; d * d <= m; d++) if (m % d === 0) { prime = false; break; }
    if (prime) return m;
  }
  return -1;
}

/** @param {number} a @param {number} b */
function neighbors(a, b) {
  return a !== b && Math.abs((a >> 3) - (b >> 3)) <= 1 &&
    Math.abs((a & 7) - (b & 7)) <= 1;
}

const adjacency = Array.from({length: 256}, (_, i) =>
  Array.from({length: 256}, (_, j) => j).filter((j) => neighbors(i, j)));
const next = Array.from({length: 256}, (_, x) => nextPrime(x));

/** @param {number[]} a */
function triplets(a) {
  const found = [];
  for (let i = 0; i < 256; i++) {
    const n = next[a[i]];
    if (n < 0) continue;
    for (const j of adjacency[i]) {
      if (a[j] !== n) continue;
      const n2 = next[a[j]];
      if (n2 < 0) continue;
      for (const k of adjacency[j]) {
        if (k !== i && a[k] === n2) found.push([i, j, k]);
      }
    }
  }
  return found;
}

const original = triplets(bytes);
assert.deepEqual(original, [[220, 219, 211]]);
assert.deepEqual(original[0].map((i) => tokens[i]), ['0w', '0x', '11']);
assert.deepEqual(original[0].map((i) => bytes[i]), [58, 59, 61]);
assert.equal(parseInt(tokens[219] + tokens[211], 16), 17);
assert.equal(tokens[57], '1w');
assert.equal(tokens[56], '4E');
assert.equal(tokens[219], '0x');
assert.equal(tokens[211], '11');
assert.equal((219 >> 3) - (211 >> 3), 1);
assert.equal((219 & 7), (211 & 7));

const rune = /[\u16A0-\u16FF]/u;
const physical = input('lp2-transcription.txt').split(/\r?\n%\r?\n/)
  .map((p, i) => ({
    page: i >= 50 ? i + 1 : i, // runeless physical p50 is absent from text
    fragments: p.replace(/\s/g, '').replace(/\//g, '')
      .split(/[-.&$§]/).filter((f) => rune.test(f)).length,
  }));
assert.equal(physical.length, 57);
assert.deepEqual(physical.filter((p) => p.fragments === 17), [{page: 55, fragments: 17}]);

/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const value of values) freq[value]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number} n */
const mod29 = (n) => ((n % 29) + 29) % 29;

const key = [58, 59, 61].map(mod29);
assert.deepEqual(key, [0, 1, 3]);
const outputs = [];
for (const sign of [1, -1]) {
  const text = page.indices.map((v, i) => mod29(v + sign * key[i % 3]));
  outputs.push({source: 'prime-triple-period3', sign, ioc: ioc(text),
    prefix: text.slice(0, 38).map((v) => corpus.translit[v]).join('')});
}
assert.equal(ioc(page.indices), 0.037894736842105266);
assert.equal(outputs[0].ioc, 0.032280701754385965);
assert.equal(outputs[1].ioc, 0.029473684210526315);

const rim = [];
for (let x = 0; x < 8; x++) rim.push(grid.byte_rows[0][x]);
for (let y = 1; y < 32; y++) rim.push(grid.byte_rows[y][7]);
for (let x = 6; x >= 0; x--) rim.push(grid.byte_rows[31][x]);
for (let y = 30; y >= 1; y--) rim.push(grid.byte_rows[y][0]);
assert.equal(rim.length, 76);
assert.equal((17 * 9) % 76, 1);
for (const stride of [17, 9]) {
  const plain = page.indices.map((v, i) => mod29(v - rim[(i * stride) % 76]));
  const roundtrip = plain.map((v, i) => mod29(v + rim[(i * stride) % 76]));
  assert.deepEqual(roundtrip, page.indices);
  outputs.push({source: 'outer76-clockwise-subtract', stride, ioc: ioc(plain),
    prefix: plain.slice(0, 38).map((v) => corpus.translit[v]).join('')});
}
assert.equal(outputs[2].ioc, 0.030526315789473683);
assert.equal(outputs[3].ioc, 0.03508771929824561);

// Conditional layout null: shuffle the original bytes within their own
// physical JPEG region (10, 13, 9 complete rows), preserving all inventories.
let rng = 0x3301b059 >>> 0;
/** @returns {number} */
function random32() {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return rng >>> 0;
}
const regions = [[0, 80], [80, 184], [184, 256]];
let any = 0, exact = 0;
for (let trial = 0; trial < 50000; trial++) {
  const a = bytes.slice();
  for (const [start, end] of regions) {
    for (let i = end - 1; i > start; i--) {
      const j = start + (random32() % (i - start + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  const triples = triplets(a);
  if (triples.length) any++;
  if (triples.some((t) => t.map((i) => a[i]).join(',') === '58,59,61')) exact++;
}
assert.equal(any, 6256);
assert.equal(exact, 408);

console.log(JSON.stringify({
  originalPrimeSuccessorTriplet: original[0].map((i) => ({
    index: i, row: i >> 3, col: i & 7, token: tokens[i], byte: bytes[i]
  })),
  target: physical.find((p) => p.page === 55),
  originalP55IoC: ioc(page.indices),
  attemptedDirectInverses: outputs,
  withinPhysicalPageShuffle: {
    trials: 50000, seed: '0x3301b059', anyThreeCellPrimePath: any,
    exact58_59_61: exact,
    conditionalPlusOneAny: (any + 1) / 50001,
    conditionalPlusOneExact: (exact + 1) / 50001
  },
  verdict: 'Source observation and narrow decoder negatives; no unknown plaintext'
}, null, 2));