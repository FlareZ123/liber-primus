'use strict';

/**
 * Original-source, finite 29-rune cyclic-convolution gate.
 * Read-only SFT: node sims/red_span_root24_circulant29_original_sft.cjs
 * Tests the three independently root-24-selected red spans with no fitted key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = load('lp2-corpus.json');
const ink = load('lp2-ink-annotations.json');
const N = 29;
const mod = (v) => ((v % N) + N) % N;
const prime = corpus.prime;
const page = (id) => corpus.pages.find((p) => p.page === id);
const gpSum = (runes) => runes.reduce((acc, value) => acc + prime[value], 0);

const annotated = ink.pages.flatMap((p) => (p.red_spans || []).map((span) => {
  const indices = page(p.page).indices.slice(span.start, span.start + span.length);
  assert.equal(indices.length, span.length);
  return { page: p.page, start: span.start, length: span.length, indices, sum: gpSum(indices) };
}));
assert.equal(annotated.length, 18);
const selected = annotated.filter((span) => mod(span.sum) === 24);
assert.deepEqual(selected.map(({ page, start, length, sum }) => [page, start, length, sum]), [
  [0, 0, 13, 662],
  [15, 9, 11, 430],
  [56, 0, 5, 285]
]);
const keyIndex = selected.flatMap((span) => span.indices);
const keyPrime = keyIndex.map((x) => mod(prime[x]));
assert.equal(keyIndex.length, N);
assert.equal(keyIndex.reduce((acc, x) => acc + x, 0), 378);
assert.equal(mod(keyPrime.reduce((acc, x) => acc + x, 0)), 14);

function fieldInverse(x) {
  for (let y = 1; y < N; y++) if (mod(x * y) === 1) return y;
  throw new Error('singular field pivot');
}

/** Circular convolution in GF(29)[X]/(X^29-1). */
function convolve(a, k) {
  assert.equal(a.length, N);
  assert.equal(k.length, N);
  const out = new Array(N);
  for (let i = 0; i < N; i++) {
    let sum = 0;
    for (let j = 0; j < N; j++) sum += a[j] * k[mod(i - j)];
    out[i] = mod(sum);
  }
  return out;
}

/** Solve K * H = 1 by exact GF(29) Gaussian elimination. */
function invertKey(key) {
  const a = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N + 1 }, (_, j) => j === N ? Number(i === 0) : key[mod(i - j)]));
  for (let j = 0; j < N; j++) {
    let pivot = j;
    while (pivot < N && a[pivot][j] === 0) pivot++;
    assert.ok(pivot < N, 'key convolution matrix is singular');
    [a[j], a[pivot]] = [a[pivot], a[j]];
    const inv = fieldInverse(a[j][j]);
    for (let col = j; col <= N; col++) a[j][col] = mod(a[j][col] * inv);
    for (let row = 0; row < N; row++) {
      if (row === j) continue;
      const factor = a[row][j];
      for (let col = j; col <= N; col++) a[row][col] = mod(a[row][col] - factor * a[j][col]);
    }
  }
  const inverse = a.map((row) => row[N]);
  assert.deepEqual(convolve(key, inverse), [1, ...Array(N - 1).fill(0)]);
  return inverse;
}

function blocks(values, key, offset) {
  const result = values.slice();
  for (let start = offset; start + N <= values.length; start += N) {
    const decoded = convolve(values.slice(start, start + N), key);
    for (let i = 0; i < N; i++) result[start + i] = decoded[i];
  }
  return result;
}

function indexOfCoincidence(values) {
  const counts = Array(N).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((acc, x) => acc + x * (x - 1), 0) / (values.length * (values.length - 1));
}

const pages = corpus.pages.filter((p) => p.page <= 55).map((p) => p.indices);
const cipher = pages.flat();
assert.equal(cipher.length, 12956);
assert.equal(indexOfCoincidence(cipher), 0.03447839786450569);

const variants = [];
for (const [encoding, base] of [['index', keyIndex], ['prime', keyPrime]]) {
  for (const reversed of [false, true]) {
    const key = reversed ? base.slice().reverse() : base.slice();
    const inverse = invertKey(key);
    const example = Array.from({ length: N }, (_, i) => mod(i * i + 3 * i + 7));
    assert.deepEqual(convolve(convolve(example, key), inverse), example);
    for (const operation of ['inverse', 'forward']) {
      const decoder = operation === 'inverse' ? inverse : key;
      const encoder = operation === 'inverse' ? key : inverse;
      for (const clock of ['book', 'page']) {
        for (const offset of [0, 2, 13]) {
          const apply = (input, factor) => {
            if (clock === 'book') return blocks(input, factor, offset);
            let position = 0;
            const output = [];
            for (const originalPage of pages) {
              const size = originalPage.length;
              output.push(...blocks(input.slice(position, position + size), factor, offset));
              position += size;
            }
            return output;
          };
          const decoded = apply(cipher, decoder);
          assert.deepEqual(apply(decoded, encoder), cipher);
          variants.push({
            encoding, reversed, operation, clock, offset,
            ioc: indexOfCoincidence(decoded),
            adjacentRepeats: decoded.reduce((n, v, i) => n + Number(i > 0 && v === decoded[i - 1]), 0)
          });
        }
      }
    }
  }
}
assert.equal(variants.length, 48);
const iocs = variants.map((v) => v.ioc);
const repetitions = variants.map((v) => v.adjacentRepeats);
console.log(JSON.stringify({
  source: {
    selected: selected.map(({ page, start, length, sum }) => ({ page, start, length, gpPrimeSum: sum })),
    keyIndex, keyPrime,
    gpIndexSum: 378, gpIndexSumMod29: 1, gpPrimeSumMod29: 14
  },
  original: { runes: cipher.length, ioc: indexOfCoincidence(cipher), adjacentRepeats: 86 },
  tested: variants.length,
  originalOutput: {
    minIoc: Math.min(...iocs), maxIoc: Math.max(...iocs),
    minAdjacentRepeats: Math.min(...repetitions),
    maxAdjacentRepeats: Math.max(...repetitions)
  },
  bestByIoc: variants.reduce((a, b) => a.ioc > b.ioc ? a : b),
  exactNativeRoundTrips: variants.length,
  independentAlgebraicPlants: 4
}, null, 2));
