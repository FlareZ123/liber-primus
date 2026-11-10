#!/usr/bin/env node
'use strict';

// Narrow, reproducible screens for the original-visual clue audit.
// Run from repository root: node sims/visual_clue_operation_screen.cjs
// Input: resources/liber-primus/lp2-corpus.json
// This intentionally does not repeat the existing p15 Hill, 5-item-list,
// five-dot, tree-registration, GIMP-pad, or cuneiform-LCG studies.

const fs = require('node:fs');
const path = require('node:path');
const P = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = new Map(P.pages.map(p => [p.page, p.indices]));
const mod = x => ((x % 29) + 29) % 29;
const translit = P.translit;

function assert(ok, message) {
  if (!ok) throw new Error(message);
}
function stats(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  const n = a.length;
  return {
    ioc: Number((counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1))).toFixed(8)),
    maxFrequency: Number((Math.max(...counts) / n).toFixed(5)),
    preview: a.slice(0, 100).map(x => translit[x]).join('')
  };
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
function repeatingKeyDecode(seq, key, phase, sign, skipLiteralF, resetAt = null) {
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

// The first three original LP2 pages have 262 + 266 + 201 = 729 runes.
// The figure-eight/Mobius mark is visible on those pages and again under
// the p15 numerical square. A 27x27 interpretation is therefore a test,
// not an asserted authorial intention.
const opening = [...pages.get(0), ...pages.get(1), ...pages.get(2)];
assert(opening.length === 729, 'opening three-page block must contain 729 runes');
const openingSpiralOrder = spiralIndices(27);
const openingMu = mobiusThrough(729);
const mobiusResults = [];
for (const [orderName, seq] of [
  ['row-major', opening],
  ['clockwise-centre-out-spiral', openingSpiralOrder.map(i => opening[i])]
]) {
  mobiusResults.push({ order: orderName, operation: 'identity', ...stats(seq) });
  for (const sign of [-1, 1]) {
    mobiusResults.push({
      order: orderName,
      operation: sign < 0 ? 'mu(n)-pad-minus' : 'mu(n)-pad-plus',
      ...stats(seq.map((x, i) => mod(x + sign * openingMu[i + 1])))
    });
  }
  mobiusResults.push({
    order: orderName,
    operation: 'one-dimensional-dirichlet-mobius-inversion',
    ...stats(dirichletMobiusInverse(seq, openingMu))
  });
}
mobiusResults.push({
  order: '27x27-row-major',
  operation: 'two-dimensional-dirichlet-mobius-inversion',
  ...stats(twoDimensionalMobiusInverse(opening, 27, mobiusThrough(27)))
});

// The p15–22 span associated with the p15 figure is a separate 1,903-rune candidate domain; this is a test scope, not an asserted formal section.
const mobiusSectionPages = Array.from({ length: 8 }, (_, i) => pages.get(15 + i));
const mobiusSection = mobiusSectionPages.flat();
assert(mobiusSection.length === 1903, 'p15–22 section length mismatch');
const sectionMu = mobiusThrough(mobiusSection.length);
const pageMax = Math.max(...mobiusSectionPages.map(p => p.length));
const pageMu = mobiusThrough(pageMax);
const mobiusSectionResults = [];
for (const sign of [-1, 1]) {
  mobiusSectionResults.push({
    scope: 'continuous',
    operation: sign < 0 ? 'mu(n)-pad-minus' : 'mu(n)-pad-plus',
    ...stats(mobiusSection.map((x, i) => mod(x + sign * sectionMu[i + 1])))
  });
  mobiusSectionResults.push({
    scope: 'reset-each-physical-page',
    operation: sign < 0 ? 'mu(n)-pad-minus' : 'mu(n)-pad-plus',
    ...stats(mobiusSectionPages.flatMap(pg => pg.map((x, i) => mod(x + sign * pageMu[i + 1]))))
  });
}
mobiusSectionResults.push({
  scope: 'continuous',
  operation: 'one-dimensional-dirichlet-mobius-inversion',
  ...stats(dirichletMobiusInverse(mobiusSection, sectionMu))
});
mobiusSectionResults.push({
  scope: 'reset-each-physical-page',
  operation: 'one-dimensional-dirichlet-mobius-inversion',
  ...stats(mobiusSectionPages.flatMap(pg => dirichletMobiusInverse(pg, pageMu)))
});

// Four identical-orientation cuneiform markers on original p33, p35, p38,
// p39 define five source-visible blocks in the external full-page audit.
// Their offsets are fixed here, not fitted to ciphertext.
const cuneiform = [
  ...pages.get(33).slice(91),
  ...pages.get(34), ...pages.get(35), ...pages.get(36),
  ...pages.get(37), ...pages.get(38), ...pages.get(39)
];
const blockLengths = [123, 261, 737, 228, 240];
const blockOffsets = [0, 123, 384, 1121, 1349, 1589];
assert(cuneiform.length === 1589, 'cuneiform section must contain 1589 runes');
assert(blockLengths.reduce((a, b) => a + b, 0) === cuneiform.length, 'cuneiform block lengths mismatch');
const blockKeys = {
  remaindersMod29: blockLengths.map(x => x % 29),
  quotientsBy29: blockLengths.map(x => Math.floor(x / 29))
};
const cuneiformLengthResults = [];
const followingSection = Array.from({ length: 14 }, (_, i) => pages.get(40 + i)).flat();
for (const [keyName, key] of Object.entries(blockKeys)) {
  for (const target of [
    { name: 'marked-section-continuous', data: cuneiform, resetAt: null },
    { name: 'marked-section-reset-at-markers', data: cuneiform, resetAt: blockOffsets },
    { name: 'following-pages-40-53', data: followingSection, resetAt: null }
  ]) {
    for (let phase = 0; phase < 5; phase++) {
      for (const sign of [-1, 1]) {
        for (const skipLiteralF of [false, true]) {
          cuneiformLengthResults.push({
            key: keyName, target: target.name, phase, sign, skipLiteralF,
            ...stats(repeatingKeyDecode(target.data, key, phase, sign, skipLiteralF, target.resetAt))
          });
        }
      }
    }
  }
  for (const sign of [-1, 1]) {
    const shifted = new Array(cuneiform.length);
    for (let block = 0; block < blockLengths.length; block++) {
      for (let i = blockOffsets[block]; i < blockOffsets[block + 1]; i++) {
        shifted[i] = mod(cuneiform[i] + sign * key[block]);
      }
    }
    cuneiformLengthResults.push({
      key: keyName, scope: 'one-constant-shift-per-marker-block',
      phase: null, sign, skipLiteralF: false, ...stats(shifted)
    });
  }
}
cuneiformLengthResults.sort((a, b) => b.ioc - a.ioc);

// Distinct from the repository's existing 1033/3301 LCG screens: reuse the
// authentic solved-p56 prime-totient rule, but anchor it at the prime values
// or at their one-based prime ordinals and reset only at the cuneiform marks.
const primeList = primesThrough(100000);
const anchors = [
  { name: 'prime-value-1033', index: primeList.indexOf(1033) },
  { name: 'prime-value-3301', index: primeList.indexOf(3301) },
  { name: 'prime-ordinal-1033', index: 1032 },
  { name: 'prime-ordinal-3301', index: 3300 }
];
const cuneiformPrimeResults = [];
for (const anchor of anchors) {
  for (const resetAtMarkers of [false, true]) {
    for (const sign of [-1, 1]) {
      for (const skipLiteralF of [false, true]) {
        cuneiformPrimeResults.push({
          anchor: anchor.name, resetAtMarkers, sign, skipLiteralF,
          ...stats(primeTotientDecode(
            cuneiform, primeList, anchor.index, sign, skipLiteralF,
            resetAtMarkers ? blockOffsets : null
          ))
        });
      }
    }
  }
}
cuneiformPrimeResults.sort((a, b) => b.ioc - a.ioc);

const output = {
  input: 'resources/liber-primus/lp2-corpus.json',
  alphabetSize: 29,
  opening: {
    pageCounts: [0, 1, 2].map(p => pages.get(p).length),
    runeCount: opening.length,
    mobiusTests: mobiusResults.length,
    results: mobiusResults
  },
  mobiusSection: {
    pages: Array.from({ length: 8 }, (_, i) => 15 + i),
    pageCounts: mobiusSectionPages.map(p => p.length),
    runeCount: mobiusSection.length,
    tests: mobiusSectionResults
  },
  cuneiform: {
    pages: [33, 34, 35, 36, 37, 38, 39],
    pageCounts: [33, 34, 35, 36, 37, 38, 39].map(p => pages.get(p).length),
    runeCount: cuneiform.length,
    blockLengths,
    blockRemaindersMod29: blockKeys.remaindersMod29,
    blockQuotientsBy29: blockKeys.quotientsBy29,
    followingPages40To53RuneCount: followingSection.length,
    lengthKeyTests: cuneiformLengthResults.length,
    bestLengthKeys: cuneiformLengthResults.slice(0, 12),
    primeTotientAnchors: anchors,
    primeTotientTests: cuneiformPrimeResults.length,
    bestPrimeTotient: cuneiformPrimeResults.slice(0, 12)
  }
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
