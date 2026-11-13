'use strict';

/**
 * Frozen original-source SFT: the p15 spiral/p57 circumference reading of the
 * 32x8 table cannot reproduce the p56 authenticated prime-totient key even
 * under a completely arbitrary stationary byte-to-GP29 lookup.
 * Node.js 22, CommonJS, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = (name) => JSON.parse(
  fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8')
);
const table = source('base60-grid.json');
const book = source('lp2-corpus.json');

assert.equal(table.rows.length, 32);
assert(table.rows.every((row) => row.length === 8));
const p55 = book.pages.find((p) => p.page === 55);
const p56 = book.pages.find((p) => p.page === 56);
const p57 = book.pages.find((p) => p.page === 57);
assert.equal(p55.indices.length, 76);
assert.equal(p56.indices.length, 85);
assert.equal(p57.indices.length, 95);
assert.equal(76 + 85 + 95, 256);
assert.equal(p56.indices[56], 0); // The known literal-F non-consuming site.

function spiralCoordinates() {
  const result = [];
  const counts = [];
  for (let top = 0, bottom = 31, left = 0, right = 7;
    top <= bottom && left <= right;
    top++, bottom--, left++, right--) {
    const start = result.length;
    for (let col = left; col <= right; col++) result.push([top, col]);
    for (let row = top + 1; row <= bottom; row++) result.push([row, right]);
    if (top < bottom) {
      for (let col = right - 1; col >= left; col--) result.push([bottom, col]);
    }
    if (left < right) {
      for (let row = bottom - 1; row > top; row--) result.push([row, left]);
    }
    counts.push(result.length - start);
  }
  assert.deepEqual(counts, [76, 68, 60, 52]);
  assert.equal(result.length, 256);
  assert.equal(new Set(result.map(([r, c]) => r + ':' + c)).size, 256);
  return result;
}

function primes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(candidate);
  }
  return result;
}

const spiral = spiralCoordinates();
const first84 = primes(84);
let consumed = 0;
const requiredKey = p56.indices.map((value, index) => (
  index === 56 ? 0 : (first84[consumed++] - 1) % 29
));
assert.equal(consumed, 84);
const truePlain = p56.indices.map((c, i) => (c - requiredKey[i] + 29) % 29);
assert.equal(truePlain.slice(0, 10).map((x) => book.translit[x]).join(''), 'ANENDWITHIN');
assert.deepEqual(truePlain.map((p, i) => (p + requiredKey[i]) % 29), p56.indices);

function bestStationaryFit(sourceTokens, target) {
  assert.equal(sourceTokens.length, target.length);
  const classes = new Map();
  for (let i = 0; i < sourceTokens.length; i++) {
    const key = sourceTokens[i];
    if (!classes.has(key)) classes.set(key, new Map());
    const histogram = classes.get(key);
    histogram.set(target[i], (histogram.get(target[i]) || 0) + 1);
  }
  const matches = [...classes.values()].reduce(
    (n, histogram) => n + Math.max(...histogram.values()), 0
  );
  return { classes: classes.size, matches, forcedMismatches: target.length - matches };
}

const textSpiral = spiral.map(([r, c]) => table.rows[r][c]);
const textRowMajor = table.rows.flat();
const tests = [
  ['spiral-clockwise', textSpiral, 75, 74, 4, 1],
  ['spiral-reverse', [...textSpiral].reverse(), 73, 73, 3, 4],
  ['row-major', textRowMajor, 71, 71, 3, 6]
];
const alphabets = [
  { label: 'base60', radix: 60, chars: table.alphabet },
  { label: 'base59-minus-f', radix: 59, chars: table.alphabet.replace('f', '') }
];
assert.equal(table.alphabet.length, 60);
assert.equal(alphabets[1].chars.length, 59);
const reports = [];

for (const abc of alphabets) {
  for (const [label, tokens, fitExpected, classesExpected, hits60, hits59] of tests) {
    const bytes = tokens.map((token) => {
      assert.equal(token.length, 2);
      const high = abc.chars.indexOf(token[0]);
      const low = abc.chars.indexOf(token[1]);
      assert(high >= 0 && low >= 0);
      return high * abc.radix + low;
    });
    const segment = bytes.slice(76, 161);
    const fitted = bestStationaryFit(segment, requiredKey);
    assert.deepEqual(fitted, {
      classes: classesExpected,
      matches: fitExpected,
      forcedMismatches: 85 - fitExpected
    });
    const shifts = segment.map((b) => b % 29);
    const directHits = shifts.reduce((n, x, i) => n + Number(x === requiredKey[i]), 0);
    assert.equal(directHits, abc.radix === 60 ? hits60 : hits59);
    const directPlain = p56.indices.map((c, i) => (c - shifts[i] + 29) % 29);
    assert.deepEqual(directPlain.map((p, i) => (p + shifts[i]) % 29), p56.indices);
    const counts = Array(29).fill(0);
    for (const x of directPlain) counts[x]++;
    const ioc = counts.reduce((n, x) => n + x * (x - 1), 0) / (85 * 84);
    reports.push({ alphabet: abc.label, traversal: label, ...fitted, directHits, ioc });
    // A true stationary GP29 lookup on this same source table passes 85/85.
    const plantedKey = segment.map((b) => b % 29);
    assert.equal(bestStationaryFit(segment, plantedKey).matches, 85);
    const plantedCipher = truePlain.map((p, i) => (p + plantedKey[i]) % 29);
    assert.deepEqual(
      plantedCipher.map((c, i) => (c - plantedKey[i] + 29) % 29), truePlain
    );
  }
}

assert.equal(reports.length, 6);
console.log(JSON.stringify({
  hypothesis: 'Source-p15 spiral/table circumference to authentic p56 85-shift stream',
  ringLengths: [76, 68, 60, 52],
  knownPlaintextPrefix: 'ANENDWITHIN',
  nonConsumingLiteralF: 56,
  reports,
  result: 'Every stationary table-byte-to-prime-key mapping forces at least ten mismatches; no original unknown plaintext.'
}, null, 2));
