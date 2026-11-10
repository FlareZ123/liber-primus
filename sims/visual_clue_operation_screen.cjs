#!/usr/bin/env node
'use strict';

// Reproducible, source-constrained screens for the LP2 visual-clue audit.
// Run from repository root: node sims/visual_clue_operation_screen.cjs
// Input: resources/liber-primus/lp2-corpus.json
// No external packages; all index arithmetic is modulo the 29-symbol GP alphabet.

const fs = require('node:fs');
const path = require('node:path');
const corpusPath = path.join(process.cwd(), 'resources/liber-primus/lp2-corpus.json');
const P = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = new Map(P.pages.map(p => [p.page, p.indices]));
const tr = P.translit;
const mod = x => ((x % 29) + 29) % 29;

function assert(ok, message) {
  if (!ok) throw new Error(message);
}
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  const n = a.length;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
function stats(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return {
    ioc: Number(ioc(a).toFixed(8)),
    maxFrequency: Number((Math.max(...counts) / a.length).toFixed(5)),
    preview: a.slice(0, 100).map(x => tr[x]).join('')
  };
}
function primesThrough(limit) {
  const composite = new Uint8Array(limit + 1);
  const out = [];
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    out.push(p);
    if (p * p <= limit) {
      for (let j = p * p; j <= limit; j += p) composite[j] = 1;
    }
  }
  return out;
}
function mobiusThrough(limit) {
  const mu = new Int8Array(limit + 1);
  mu.fill(1);
  mu[0] = 0;
  const composite = new Uint8Array(limit + 1);
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    for (let j = p; j <= limit; j += p) {
      composite[j] = 1;
      mu[j] *= -1;
    }
    if (p * p <= limit) {
      for (let j = p * p; j <= limit; j += p * p) mu[j] = 0;
    }
  }
  mu[1] = 1;
  return mu;
}
function spiralIndices(width) {
  const total = width * width;
  const out = [];
  const seen = new Uint8Array(total);
  let x = Math.floor(width / 2);
  let y = Math.floor(width / 2);
  let direction = 0;
  let length = 1;
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  out.push(y * width + x);
  seen[y * width + x] = 1;
  while (out.length < total) {
    for (let twice = 0; twice < 2; twice++) {
      for (let step = 0; step < length; step++) {
        x += dx[direction];
        y += dy[direction];
        if (x >= 0 && x < width && y >= 0 && y < width) {
          const index = y * width + x;
          if (!seen[index]) {
            seen[index] = 1;
            out.push(index);
          }
        }
      }
      direction = (direction + 1) % 4;
    }
    length++;
  }
  return out;
}
function dirichletMobiusInverse(seq, mu) {
  const out = new Array(seq.length);
  for (let n = 1; n <= seq.length; n++) {
    let sum = 0;
    for (let d = 1; d * d <= n; d++) {
      if (n % d !== 0) continue;
      const e = n / d;
      sum += mu[e] * seq[d - 1];
      if (e !== d) sum += mu[d] * seq[e - 1];
    }
    out[n - 1] = mod(sum);
  }
  return out;
}
function twoDimensionalMobiusInverse(seq, width, mu) {
  const divisors = Array.from({ length: width + 1 }, () => []);
  for (let n = 1; n <= width; n++) {
    for (let d = 1; d <= n; d++) if (n % d === 0) divisors[n].push(d);
  }
  const out = new Array(width * width);
  for (let row = 1; row <= width; row++) {
    for (let col = 1; col <= width; col++) {
      let sum = 0;
      for (const a of divisors[row]) {
        for (const b of divisors[col]) {
          sum += mu[row / a] * mu[col / b] * seq[(a - 1) * width + (b - 1)];
        }
      }
      out[(row - 1) * width + (col - 1)] = mod(sum);
    }
  }
  return out;
}
function primeTotientDecode(seq, primes, start, sign, skipLiteralF, resetAt = null) {
  const out = new Array(seq.length);
  let keyPosition = 0;
  let block = 0;
  for (let i = 0; i < seq.length; i++) {
    if (resetAt && block < resetAt.length - 1 && i === resetAt[block + 1]) {
      block++;
      keyPosition = 0;
    }
    const c = seq[i];
    if (skipLiteralF && c === 0) {
      out[i] = 0;
      continue;
    }
    const prime = primes[start + keyPosition];
    assert(prime !== undefined, 'prime sequence exhausted');
    out[i] = mod(c + sign * (prime - 1));
    keyPosition++;
  }
  return out;
}
function keyDecode(seq, key, phase, sign, skipLiteralF, resetAt = null) {
  const out = new Array(seq.length);
  let keyPosition = 0;
  let block = 0;
  for (let i = 0; i < seq.length; i++) {
    if (resetAt && block < resetAt.length - 1 && i === resetAt[block + 1]) {
      block++;
      keyPosition = 0;
    }
    const c = seq[i];
    if (skipLiteralF && c === 0) {
      out[i] = 0;
      continue;
    }
    out[i] = mod(c + sign * key[(keyPosition + phase) % key.length]);
    keyPosition++;
  }
  return out;
}

const first729 = [...pages.get(0), ...pages.get(1), ...pages.get(2)];
assert(first729.length === 729, 'opening three-page block must contain 729 runes');
const openingOrders = {
  rowMajor: Array.from({ length: 729 }, (_, i) => i),
  columnMajor: Array.from({ length: 729 }, (_, i) => (i % 27) * 27 + Math.floor(i / 27)),
  clockwiseSpiral: spiralIndices(27),
  counterclockwiseSpiral: spiralIndices(27).reverse(),
  boustrophedon: Array.from({ length: 729 }, (_, i) => {
    const row = Math.floor(i / 27);
    const col = i % 27;
    return row * 27 + (row % 2 ? 26 - col : col);
  })
};
const openingMu = mobiusThrough(729);
const mobiusTests = [];
for (const [orderName, order] of Object.entries({
  rowMajor: openingOrders.rowMajor,
  clockwiseSpiral: openingOrders.clockwiseSpiral
})) {
  const seq = order.map(i => first729[i]);
  mobiusTests.push({ order: orderName, operation: 'identity', ...stats(seq) });
  for (const sign of [-1, 1]) {
    mobiusTests.push({
      order: orderName, operation: sign < 0 ? 'mu-pad-minus' : 'mu-pad-plus',
      ...stats(seq.map((x, i) => mod(x + sign * openingMu[i + 1])))
    });
  }
  mobiusTests.push({
    order: orderName, operation: '1d-dirichlet-mobius-inversion',
    ...stats(dirichletMobiusInverse(seq, openingMu))
  });
}
mobiusTests.push({
  order: 'rowMajor', operation: '2d-dirichlet-mobius-inversion',
  ...stats(twoDimensionalMobiusInverse(first729, 27, mobiusThrough(27)))
});

const primeList = primesThrough(100000);
const openingPrimeTests = [];
const openingStarts = [
  { name: 'p56-default', index: 0 },
  { name: 'prime-ordinal-3299', index: 3298 },
  { name: 'prime-ordinal-3301', index: 3300 }
];
for (const [orderName, order] of Object.entries(openingOrders)) {
  const seq = order.map(i => first729[i]);
  for (const start of openingStarts) {
    for (const sign of [-1, 1]) {
      for (const skipLiteralF of [false, true]) {
        openingPrimeTests.push({
          order: orderName, start: start.name, sign, skipLiteralF,
          ...stats(primeTotientDecode(seq, primeList, start.index, sign, skipLiteralF))
        });
      }
    }
  }
}
openingPrimeTests.sort((a, b) => b.ioc - a.ioc);

const squareKeys = {
  clockwiseAbsolute: [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516],
  primeValues: [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817],
  primeOrdinals: [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988],
  fibonacciValues: [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987],
  squareRowMajor: [3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820],
  clockwiseReverse: [4516,1206,708,1820,2472,2838,3038,3152,3222,3258,3278,3288,3294,3296,3298,3299]
};
const spiralCipher = openingOrders.clockwiseSpiral.map(i => first729[i]);
const squareKeyTests = [];
for (const [name, raw] of Object.entries(squareKeys)) {
  const key = raw.map(mod);
  for (let phase = 0; phase < 16; phase++) {
    for (const sign of [-1, 1]) {
      for (const skipLiteralF of [false, true]) {
        squareKeyTests.push({
          key: name, phase, sign, skipLiteralF,
          ...stats(keyDecode(spiralCipher, key, phase, sign, skipLiteralF))
        });
      }
    }
  }
}
squareKeyTests.sort((a, b) => b.ioc - a.ioc);

const cuneiformSection = [
  ...pages.get(33).slice(91),
  ...pages.get(34), ...pages.get(35), ...pages.get(36),
  ...pages.get(37), ...pages.get(38), ...pages.get(39)
];
const cuneiformBlockLengths = [123, 261, 737, 228, 240];
const cuneiformOffsets = [0, 123, 384, 1121, 1349, 1589];
assert(cuneiformSection.length === 1589, 'cuneiform-marked section must contain 1589 runes');
assert(cuneiformBlockLengths.reduce((a, b) => a + b, 0) === 1589, 'cuneiform block lengths mismatch');
const anchors = [
  { name: 'prime-value-1033', index: primeList.indexOf(1033) },
  { name: 'prime-value-3301', index: primeList.indexOf(3301) },
  { name: 'prime-ordinal-1033', index: 1032 },
  { name: 'prime-ordinal-3301', index: 3300 }
];
const cuneiformPrimeTests = [];
for (const anchor of anchors) {
  for (const reset of [false, true]) {
    for (const sign of [-1, 1]) {
      for (const skipLiteralF of [false, true]) {
        const resetAt = reset ? cuneiformOffsets : null;
        cuneiformPrimeTests.push({
          anchor: anchor.name, resetAtMarkers: reset, sign, skipLiteralF,
          ...stats(primeTotientDecode(cuneiformSection, primeList, anchor.index, sign, skipLiteralF, resetAt))
        });
      }
    }
  }
}
cuneiformPrimeTests.sort((a, b) => b.ioc - a.ioc);

const cuneiformLengthKeys = {
  remaindersMod29: cuneiformBlockLengths.map(x => x % 29),
  quotientsBy29: cuneiformBlockLengths.map(x => Math.floor(x / 29))
};
const cuneiformLengthTests = [];
const nextSection = Array.from({ length: 14 }, (_, i) => pages.get(40 + i)).flat();
for (const [keyName, raw] of Object.entries(cuneiformLengthKeys)) {
  for (const target of [
    { name: 'marked-section', data: cuneiformSection, resetAt: cuneiformOffsets },
    { name: 'following-pages-40-53', data: nextSection, resetAt: null }
  ]) {
    for (let phase = 0; phase < 5; phase++) {
      for (const sign of [-1, 1]) {
        for (const skipLiteralF of [false, true]) {
          cuneiformLengthTests.push({
            key: keyName, target: target.name, phase, sign, skipLiteralF,
            ...stats(keyDecode(target.data, raw, phase, sign, skipLiteralF))
          });
        }
      }
    }
  }
}

const report = {
  input: 'resources/liber-primus/lp2-corpus.json',
  alphabetSize: 29,
  openingBlock: { runeCount: first729.length, pageCounts: [0,1,2].map(p => pages.get(p).length) },
  mobius: { tests: mobiusTests.length, results: mobiusTests },
  openingPrimeTotient: { tests: openingPrimeTests.length, best: openingPrimeTests.slice(0, 12) },
  squareKeyOnOpeningSpiral: { tests: squareKeyTests.length, best: squareKeyTests.slice(0, 12) },
  cuneiformSection: {
    runeCount: cuneiformSection.length,
    pageCounts: [33,34,35,36,37,38,39].map(p => pages.get(p).length),
    blockLengths: cuneiformBlockLengths,
    blockRemaindersMod29: cuneiformLengthKeys.remaindersMod29,
    blockQuotientsBy29: cuneiformLengthKeys.quotientsBy29,
    primeTotientAnchors: anchors,
    primeTotientTests: cuneiformPrimeTests.length,
    bestPrimeTotient: cuneiformPrimeTests.slice(0, 12),
    lengthKeyTests: cuneiformLengthTests.length,
    bestLengthKeys: cuneiformLengthTests.sort((a, b) => b.ioc - a.ioc).slice(0, 12)
  }
};
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
