'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
const flat = pages.flatMap(p => p.indices);
assert.deepEqual(pages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
assert.equal(flat.length, 1680);
const wrap = (n, m) => ((n % m) + m) % m;
const mod = n => wrap(n, 29);
const mul = ([a, b], [c, d]) => [mod(a * c + 18 * b * d), mod(a * d + b * c + 11 * b * d)];
function pow(x, exponent) {
  let y = [1, 0], base = x.slice(), e = exponent;
  while (e > 0) {
    if (e % 2 === 1) y = mul(y, base);
    base = mul(base, base);
    e = Math.floor(e / 2);
  }
  return y;
}
function makePowers(root, period) {
  const out = [];
  let v = [1, 0];
  for (let i = 0; i < period; i++) { out.push(v); v = mul(v, root); }
  return out;
}
const cell103 = grid.bytes[102], cell104 = grid.bytes[103];
assert.equal(cell103, 32);
assert.equal(cell104, 206);
const generator = [mod(cell103), mod(cell104)];
assert.deepEqual(generator, [3, 3]);
const conjugate = pow(generator, 29);
assert.deepEqual(conjugate, [7, 26]);
assert.deepEqual(pow(generator, 70), [28, 0]);
assert.deepEqual(pow(generator, 140), [1, 0]);
for (const divisor of [2, 5, 7]) assert.notDeepEqual(pow(generator, 140 / divisor), [1, 0]);
const roots = [['generator', generator], ['conjugate', conjugate]];
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (values.length * (values.length - 1));
}
function scorePair(powers, phase, direction, framing, orientation, mode) {
  const counts = Array(29).fill(0);
  let j = 0, n = 0;
  const consume = (x, y) => {
    const k = powers[wrap(phase + direction * j, 140)];
    let v = orientation === 'normal' ? [x, y] : [y, x];
    if (mode === 'additive') v = [mod(v[0] - k[0]), mod(v[1] - k[1])];
    else v = mul(v, k);
    if (orientation === 'swapped') v = [v[1], v[0]];
    counts[v[0]]++; counts[v[1]]++; n += 2; j++;
  };
  if (framing === 'global-pairs') {
    assert.equal(flat.length % 2, 0);
    for (let i = 0; i < flat.length; i += 2) consume(flat[i], flat[i + 1]);
  } else {
    for (const p of pages) {
      if (framing === 'page-reset') j = 0;
      for (let i = 0; i + 1 < p.indices.length; i += 2) consume(p.indices[i], p.indices[i + 1]);
      if (p.indices.length % 2) { counts[p.indices[p.indices.length - 1]]++; n++; }
    }
  }
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
function transformPair(powers, phase, direction, framing, orientation, mode) {
  const out = [];
  let j = 0;
  const consume = (x, y) => {
    const k = powers[wrap(phase + direction * j, 140)];
    let v = orientation === 'normal' ? [x, y] : [y, x];
    if (mode === 'additive') v = [mod(v[0] - k[0]), mod(v[1] - k[1])];
    else v = mul(v, k);
    if (orientation === 'swapped') v = [v[1], v[0]];
    out.push(...v); j++;
  };
  if (framing === 'global-pairs') {
    for (let i = 0; i < flat.length; i += 2) consume(flat[i], flat[i + 1]);
  } else {
    for (const p of pages) {
      if (framing === 'page-reset') j = 0;
      for (let i = 0; i + 1 < p.indices.length; i += 2) consume(p.indices[i], p.indices[i + 1]);
      if (p.indices.length % 2) out.push(p.indices[p.indices.length - 1]);
    }
  }
  return out;
}
const originalIoC = ioc(flat);
const pairResults = [];
let bestPair = null, phaseZeroBest = null;
for (const [rootName, root] of roots) {
  const powers = makePowers(root, 140);
  for (const mode of ['additive', 'multiplicative'])
    for (const direction of [1, -1])
      for (const framing of ['page-reset', 'page-continuous', 'global-pairs'])
        for (const orientation of ['normal', 'swapped'])
          for (let phase = 0; phase < 140; phase++) {
            const score = scorePair(powers, phase, direction, framing, orientation, mode);
            const item = { mode, root: rootName, direction: direction === 1 ? 'forward' : 'reverse',
              framing, orientation, phase, ioc: score };
            pairResults.push(item);
            if (bestPair === null || score > bestPair.ioc) bestPair = item;
            if (phase === 0 && (phaseZeroBest === null || score > phaseZeroBest.ioc)) phaseZeroBest = item;
          }
}
assert.equal(pairResults.length, 6720);
assert.ok(Math.abs(bestPair.ioc - 0.03526475509798917) < 1e-12);
const scalarProjections = [
  { name: 'trace', fn: ([a, b]) => mod(2 * a + 11 * b), period: 140 },
  { name: 'norm', fn: ([a, b]) => mod(a * a + 11 * a * b + 11 * b * b), period: 14 },
  { name: 'coord0', fn: x => x[0], period: 140 },
  { name: 'coord1', fn: x => x[1], period: 140 }
];
const scalarResults = [];
for (const [rootName, root] of roots) {
  const sequence = makePowers(root, 140);
  for (const projection of scalarProjections) {
    const key = sequence.slice(0, projection.period).map(projection.fn);
    for (const direction of [1, -1])
      for (const clock of ['continuous', 'page-reset'])
        for (const sign of [-1, 1])
          for (let phase = 0; phase < key.length; phase++) {
            const counts = Array(29).fill(0);
            let j = 0, n = 0;
            for (const p of pages) {
              if (clock === 'page-reset') j = 0;
              for (const x of p.indices) {
                const y = mod(x + sign * key[wrap(phase + direction * j, key.length)]);
                counts[y]++; n++; j++;
              }
            }
            const score = counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
            scalarResults.push({ root: rootName, projection: projection.name, period: key.length,
              direction: direction === 1 ? 'forward' : 'reverse', clock, sign, phase, ioc: score });
          }
  }
}
scalarResults.sort((a, b) => b.ioc - a.ioc);
const bestScalar = scalarResults[0];
assert.equal(scalarResults.length, 6944);
assert.ok(Math.abs(bestScalar.ioc - 0.03505700672168808) < 1e-12);
pairResults.sort((a, b) => b.ioc - a.ioc);
const bestPairRoot = bestPair.root === 'generator' ? generator : conjugate;
const bestOutput = transformPair(makePowers(bestPairRoot, 140), bestPair.phase,
  bestPair.direction === 'forward' ? 1 : -1, bestPair.framing, bestPair.orientation, bestPair.mode);
const bestScalarRoot = bestScalar.root === 'generator' ? generator : conjugate;
const scalarFn = bestScalar.projection === 'trace' ? ([a, b]) => mod(2 * a + 11 * b)
  : bestScalar.projection === 'norm' ? ([a, b]) => mod(a * a + 11 * a * b + 11 * b * b)
    : bestScalar.projection === 'coord0' ? x => x[0] : x => x[1];
const scalarSequence = makePowers(bestScalarRoot, 140).slice(0, bestScalar.period).map(scalarFn);
let scalarJ = 0, scalarOut = [];
for (const p of pages) {
  if (bestScalar.clock === 'page-reset') scalarJ = 0;
  for (const x of p.indices) {
    scalarOut.push(mod(x + bestScalar.sign * scalarSequence[wrap(
      bestScalar.phase + (bestScalar.direction === 'forward' ? 1 : -1) * scalarJ, scalarSequence.length
    )]));
    scalarJ++;
  }
}
assert.ok(Math.abs(originalIoC - 0.03436002155478034) < 1e-12);
console.log(JSON.stringify({
  pointer: { cells: [103, 104], base60Values: [cell103, cell104], residues: generator,
    conjugate, order: 140, g70: pow(generator, 70), g140: pow(generator, 140),
    pairsPerPeriod: 140, periodsInChapter: 6 },
  source: { pageLengths: pages.map(p => p.indices.length), runeCount: flat.length,
    pairCount: flat.length / 2, originalIoC },
  pairwise: { candidates: pairResults.length, best: bestPair, phaseZeroBest,
    bestOutputPreview: bestOutput.slice(0, 100).map(x => corpus.translit[x]).join(' '),
    minIoC: pairResults[pairResults.length - 1].ioc,
    medianIoC: pairResults[Math.floor(pairResults.length / 2)].ioc },
  scalar: { candidates: scalarResults.length, best: bestScalar,
    bestOutputPreview: scalarOut.slice(0, 100).map(x => corpus.translit[x]).join(' '),
    minIoC: scalarResults[scalarResults.length - 1].ioc,
    medianIoC: scalarResults[Math.floor(scalarResults.length / 2)].ioc },
  totalCandidates: pairResults.length + scalarResults.length
}, null, 2));
