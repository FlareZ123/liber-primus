'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const sourcePages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
const chapterPages = sourcePages.filter(p => p.page >= 33 && p.page <= 39);
const wholeRunes = sourcePages.flatMap(p => p.indices);
const chapterRunes = chapterPages.flatMap(p => p.indices);
assert.equal(sourcePages.length, 56);
assert.equal(wholeRunes.length, 12956);
assert.equal(chapterRunes.length, 1680);
assert.deepEqual(chapterPages.map(p => p.indices.length), [214, 261, 271, 238, 228, 228, 240]);
const wrap = (n, m) => ((n % m) + m) % m;
const mod = n => wrap(n, 29);
function mulH(x, y) {
  const [a, b] = x, [c, d] = y;
  return [mod(a * c + 18 * b * d), mod(a * d + b * c + 11 * b * d)];
}
function mulP3(x, y) {
  const [a, b] = x, [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}
function fieldPow(mul, x, exponent) {
  let result = [1, 0], base = x.slice(), e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = mul(result, base);
    base = mul(base, base);
    e = Math.floor(e / 2);
  }
  return result;
}
function makePowers(mul, generator) {
  const powers = [];
  let value = [1, 0];
  for (let i = 0; i < 840; i++) {
    powers.push(value);
    value = mul(value, generator);
  }
  return powers;
}
const fieldSpecs = [
  { name: 'H2013', mul: mulH, generator: [0, 1], square: [18, 11] },
  { name: 'P3red', mul: mulP3, generator: [19, 13], square: [8, 3] }
];
const fieldChecks = [];
for (const field of fieldSpecs) {
  assert.deepEqual(field.mul([0, 1], [0, 1]), field.square);
  const conjugate = fieldPow(field.mul, field.generator, 29);
  for (const root of [field.generator, conjugate]) {
    assert.deepEqual(fieldPow(field.mul, root, 840), [1, 0]);
    assert.deepEqual(fieldPow(field.mul, root, 420), [28, 0]);
    for (const divisor of [2, 3, 5, 7]) assert.notDeepEqual(fieldPow(field.mul, root, 840 / divisor), [1, 0]);
  }
  fieldChecks.push({ field: field.name, generator: field.generator, conjugate, order: 840,
    g420: fieldPow(field.mul, field.generator, 420), g840: fieldPow(field.mul, field.generator, 840) });
}
function iocFromCounts(counts, n) {
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function scoreCandidate(pages, flat, powers, phase, direction, framing, orientation, additiveSign) {
  const counts = Array(29).fill(0);
  let pairIndex = 0, n = 0;
  const consumePair = (x, y) => {
    const [ka, kb] = powers[wrap(phase + direction * pairIndex, 840)];
    const out = orientation === 'normal'
      ? [mod(x + additiveSign * ka), mod(y + additiveSign * kb)]
      : [mod(x + additiveSign * kb), mod(y + additiveSign * ka)];
    counts[out[0]]++; counts[out[1]]++; n += 2; pairIndex++;
  };
  if (framing === 'global-pairs') {
    assert.equal(flat.length % 2, 0);
    for (let i = 0; i < flat.length; i += 2) consumePair(flat[i], flat[i + 1]);
  } else {
    for (const page of pages) {
      if (framing === 'page-reset') pairIndex = 0;
      for (let i = 0; i + 1 < page.indices.length; i += 2) consumePair(page.indices[i], page.indices[i + 1]);
      if (page.indices.length % 2 === 1) { counts[page.indices[page.indices.length - 1]]++; n++; }
    }
  }
  return { score: iocFromCounts(counts, n), n, counts };
}
function transformCandidate(pages, flat, powers, phase, direction, framing, orientation, additiveSign) {
  const output = [];
  let pairIndex = 0;
  const consumePair = (x, y) => {
    const [ka, kb] = powers[wrap(phase + direction * pairIndex, 840)];
    if (orientation === 'normal') output.push(mod(x + additiveSign * ka), mod(y + additiveSign * kb));
    else output.push(mod(x + additiveSign * kb), mod(y + additiveSign * ka));
    pairIndex++;
  };
  if (framing === 'global-pairs') {
    assert.equal(flat.length % 2, 0);
    for (let i = 0; i < flat.length; i += 2) consumePair(flat[i], flat[i + 1]);
  } else {
    for (const page of pages) {
      if (framing === 'page-reset') pairIndex = 0;
      for (let i = 0; i + 1 < page.indices.length; i += 2) consumePair(page.indices[i], page.indices[i + 1]);
      if (page.indices.length % 2 === 1) output.push(page.indices[page.indices.length - 1]);
    }
  }
  return output;
}
const allScores = [];
let best = null;
const framings = ['page-reset', 'page-continuous', 'global-pairs'];
for (const field of fieldSpecs) {
  const conjugate = fieldPow(field.mul, field.generator, 29);
  for (const [rootName, root] of [['generator', field.generator], ['conjugate', conjugate]]) {
    const powers = makePowers(field.mul, root);
    for (const direction of [1, -1]) {
      for (const framing of framings) {
        for (const orientation of ['normal', 'swapped']) {
          // g^420 = -1, so addition is subtraction at phase+420.
          // Fix subtraction and enumerate all phases to cover both signs.
          for (let phase = 0; phase < 840; phase++) {
            const result = scoreCandidate(chapterPages, chapterRunes, powers, phase, direction, framing, orientation, -1);
            const item = { field: field.name, root: rootName, direction: direction === 1 ? 'forward' : 'reverse',
              framing, orientation, phase, score: result.score };
            allScores.push(result.score);
            if (best === null || result.score > best.score) best = item;
          }
        }
      }
    }
  }
}
assert.equal(allScores.length, 40320);
allScores.sort((a, b) => b - a);
const bestField = fieldSpecs.find(f => f.name === best.field);
const bestRoot = best.root === 'generator' ? bestField.generator : fieldPow(bestField.mul, bestField.generator, 29);
const bestPowers = makePowers(bestField.mul, bestRoot);
const bestOutput = transformCandidate(chapterPages, chapterRunes, bestPowers, best.phase,
  best.direction === 'forward' ? 1 : -1, best.framing, best.orientation, -1);
const originalCounts = Array(29).fill(0);
for (const rune of chapterRunes) originalCounts[rune]++;
const originalIoC = iocFromCounts(originalCounts, chapterRunes.length);
const maxIoC = allScores[0], minIoC = allScores[allScores.length - 1];
const medianIoC = allScores[Math.floor((allScores.length - 1) / 2)];
assert.ok(Math.abs(originalIoC - 0.03436002155478034) < 1e-12);
assert.ok(Math.abs(maxIoC - 0.03547746674607902) < 1e-12);
assert.ok(Math.abs(minIoC - 0.034031736577895) < 1e-12);
assert.ok(maxIoC < 0.04);
const hField = fieldSpecs[0], hConjugate = fieldPow(hField.mul, hField.generator, 29);
const wholeScores = [];
for (const root of [hField.generator, hConjugate]) {
  const powers = makePowers(hField.mul, root);
  for (const direction of [1, -1]) for (const framing of ['page-reset', 'page-continuous'])
    for (const orientation of ['normal', 'swapped']) for (const additiveSign of [-1, 1])
      wholeScores.push(scoreCandidate(sourcePages, wholeRunes, powers, 0, direction, framing, orientation, additiveSign).score);
}
const wholeMin = Math.min(...wholeScores), wholeMax = Math.max(...wholeScores);
assert.equal(wholeScores.length, 32);
assert.ok(Math.abs(wholeMin - 0.03443382101746505) < 1e-12);
assert.ok(Math.abs(wholeMax - 0.034523630078182856) < 1e-12);
const plant = Array.from({ length: 1680 }, (_, i) => mod(i * 17 + 11));
const plantPages = [{ page: 0, indices: plant }];
let positiveControls = 0;
for (const field of fieldSpecs) {
  const conjugate = fieldPow(field.mul, field.generator, 29);
  for (const root of [field.generator, conjugate]) {
    const powers = makePowers(field.mul, root);
    for (const direction of [1, -1]) for (const orientation of ['normal', 'swapped']) {
      const encrypted = transformCandidate(plantPages, plant, powers, 137, direction, 'global-pairs', orientation, 1);
      const recovered = transformCandidate(plantPages, encrypted, powers, 137, direction, 'global-pairs', orientation, -1);
      assert.deepEqual(recovered, plant);
      positiveControls++;
    }
  }
}
assert.equal(positiveControls, 16);
console.log(JSON.stringify({
  source: { chapter: 'LP2 p33-p39', pageLengths: chapterPages.map(p => p.indices.length),
    runeCount: chapterRunes.length, pairCount: chapterRunes.length / 2, originalIoC },
  fields: fieldChecks,
  additivePairSearch: { candidates: allScores.length, phasesPerRoot: 840, minIoC, medianIoC, maxIoC,
    best, bestOutputPreview: bestOutput.slice(0, 100).map(x => corpus.translit[x]).join(' ') },
  wholeBookHPhaseZero: { candidates: wholeScores.length, minIoC: wholeMin, maxIoC: wholeMax },
  syntheticPositiveControls: positiveControls
}, null, 2));
